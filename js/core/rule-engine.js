/**
 * Industry Insight HTS - Conditional Rule & Investment Assessment Engine
 * Implements PRD Section FR-05 & AC-10
 */

import { AssessmentState } from './types.js';

export const RULE_ENGINE_VERSION = '2026.10-R1';

export class RuleEngine {
  /**
   * 평가 엔진 주 진입점
   * @param {Object} instrument 종목 메타데이터
   * @param {Object} facts 종목 팩트 (재무, 시세 등)
   * @param {Object} thesis 종목 투자 논리 정의
   * @param {Object} holdingInfo 사용자의 해당 종목 보유 현황 (없으면 null)
   * @param {Object} portfolioContext 전체 포트폴리오 컨텍스트 (비중, 현금 등)
   * @param {Date|string} asOf 기준 시각
   */
  static assess(instrument, facts, thesis, holdingInfo = null, portfolioContext = null, asOf = new Date()) {
    const now = new Date(asOf);

    // 1. 필수 자료 유효성 및 만료 검사 (AC-10, 우선순위 1)
    if (!instrument || !facts || !thesis) {
      return this._createAssessment({
        stateNewEntry: AssessmentState.SUSPENDED_JUDGMENT,
        stateHolding: AssessmentState.SUSPENDED_JUDGMENT,
        reason: '필수 데이터가 누락되었습니다.',
        dataQualityReason: '종목 기본정보, 재무/시세 팩트, 또는 투자 논리 데이터 부재',
        thesis,
        now
      });
    }

    // 유효기한 만료 검증 (AC-10)
    if (thesis.validUntil) {
      const expirationDate = new Date(thesis.validUntil);
      if (now > expirationDate) {
        return this._createAssessment({
          stateNewEntry: AssessmentState.SUSPENDED_JUDGMENT,
          stateHolding: AssessmentState.HOLD, // 보유자는 재검토 대기 및 보유 유지
          reason: `투자 근거의 유효기간(${thesis.validUntil})이 만료되어 재검토가 필요합니다.`,
          dataQualityReason: `근거 만료일(${thesis.validUntil}) 경과로 인한 판단 유보`,
          thesis,
          now,
          isExpired: true
        });
      }
    }

    // 2. 투자 논리 훼손 여부 확인 (우선순위 2)
    // 무효화 조건(invalidation criteria)이 촉발되었는지 검사
    const invalidationTriggered = thesis.invalidationCriteria && thesis.invalidationCriteria.some(crit => crit.isTriggered);
    if (invalidationTriggered) {
      const triggeredCrits = thesis.invalidationCriteria.filter(c => c.isTriggered).map(c => c.condition).join(', ');
      return this._createAssessment({
        stateNewEntry: AssessmentState.PENDING_CONDITIONS,
        stateHolding: AssessmentState.SELL_CONSIDERATION,
        reason: `투자 논리 훼손 감지: [${triggeredCrits}] 조건이 발생하여 매도 검토 및 진입 보류 권고`,
        dataQualityReason: '논리 무효화 조건 발생',
        thesis,
        now
      });
    }

    // 3. 포트폴리오 집중도 초과 검사 (우선순위 3)
    // 목표 비중이 설정되어 있고 현재 비중이 이를 크게 초과한 경우
    if (holdingInfo && holdingInfo.targetWeightPct && holdingInfo.totalAssetWeight) {
      if (holdingInfo.totalAssetWeight > holdingInfo.targetWeightPct * 1.15) {
        return this._createAssessment({
          stateNewEntry: AssessmentState.PENDING_CONDITIONS,
          stateHolding: AssessmentState.REDUCE_CONSIDERATION,
          reason: `포트폴리오 집중 위험: 현재 비중(${holdingInfo.totalAssetWeight.toFixed(1)}%)이 목표치(${holdingInfo.targetWeightPct}%)를 초과하여 비중 축소 권고`,
          dataQualityReason: '자산 배분 허용선 초과',
          thesis,
          now
        });
      }
    }

    // 4. 가치·실적·산업·위험 조건 종합 판정 (우선순위 4, 5)
    const conditions = thesis.entryConditions || [];
    const totalConditions = conditions.length;
    const metConditions = conditions.filter(c => c.isMet).length;

    let stateNewEntry = AssessmentState.PENDING_CONDITIONS;
    let stateHolding = AssessmentState.HOLD;
    let judgmentReason = '';

    if (totalConditions > 0 && metConditions === totalConditions) {
      // 4단계: 모든 조건 충족 -> 매수 검토
      stateNewEntry = AssessmentState.BUY_CONSIDERATION;
      stateHolding = AssessmentState.BUY_CONSIDERATION; // 기존 보유자도 추가매수 검토 가능
      judgmentReason = `산업·가치·실적 등 ${totalConditions}개 매수 전제조건이 모두 충족되었습니다.`;
    } else if (metConditions > 0) {
      // 5단계: 일부 조건 대기 -> 신규는 조건 충족 대기, 기존 보유는 근거에 따라 보유
      stateNewEntry = AssessmentState.PENDING_CONDITIONS;
      stateHolding = AssessmentState.HOLD;
      judgmentReason = `전체 ${totalConditions}개 조건 중 ${metConditions}개만 충족되어 신규 매수는 대기, 기존 포지션은 보유 유지 권고`;
    } else {
      stateNewEntry = AssessmentState.PENDING_CONDITIONS;
      stateHolding = AssessmentState.HOLD;
      judgmentReason = '주요 매수 조건 미충족 상태입니다. 촉매 발생 및 업황 전환 대기가 권장됩니다.';
    }

    return this._createAssessment({
      stateNewEntry,
      stateHolding,
      reason: judgmentReason,
      dataQualityReason: '모든 규칙 및 데이터 정상 검증 완료',
      thesis,
      now
    });
  }

  static _createAssessment({ stateNewEntry, stateHolding, reason, dataQualityReason, thesis, now, isExpired = false }) {
    return {
      ruleVersion: RULE_ENGINE_VERSION,
      asOf: now.toISOString(),
      validUntil: thesis ? thesis.validUntil : null,
      isExpired,
      reviewer: 'HTS Rules Committee / Senior Analyst',
      
      // 상태 분리 (FR-05)
      newEntry: {
        state: stateNewEntry,
        recommendationText: this._getRecommendationText(stateNewEntry, 'NEW_ENTRY')
      },
      existingHolding: {
        state: stateHolding,
        recommendationText: this._getRecommendationText(stateHolding, 'HOLDING')
      },

      // 시간대별 판단 (단기 1~4주 / 중기 3~12개월)
      shortTerm: {
        horizon: '1~4주 (단기)',
        state: thesis.shortTermState || stateNewEntry,
        note: thesis.shortTermNote || '단기 수급 및 지지선 확인 구간'
      },
      midTerm: {
        horizon: '3~12개월 (중기)',
        state: thesis.midTermState || (stateNewEntry === AssessmentState.BUY_CONSIDERATION ? AssessmentState.BUY_CONSIDERATION : AssessmentState.HOLD),
        note: thesis.midTermNote || '사이클 회복 및 실적 가시성에 따른 주가 리레이팅 기대'
      },

      // 필수 출력 사항
      judgmentReason: reason,
      dataQuality: {
        grade: isExpired ? 'RECHECK_REQUIRED' : 'VERIFIED',
        reason: dataQualityReason
      },
      
      theses: thesis.theses || [],                         // 핵심 투자 논리 (최대 3개)
      supportingEvidence: thesis.supportingEvidence || [], // 찬성 근거
      counterEvidence: thesis.counterEvidence || [],       // 반대 근거 및 리스크
      actionTriggers: {
        buyTrigger: thesis.buyTrigger || '미설정',
        additionalBuyTrigger: thesis.additionalBuyTrigger || '미설정',
        reduceTrigger: thesis.reduceTrigger || '미설정',
        sellTrigger: thesis.sellTrigger || '미설정'
      },
      invalidationCriteria: thesis.invalidationCriteria || [], // 논리 무효화 조건
      catalysts: thesis.catalysts || [],                     // 다음 촉매
      scenarios: thesis.scenarios || null                    // 가치평가 시나리오
    };
  }

  static _getRecommendationText(state, type) {
    switch (state) {
      case AssessmentState.BUY_CONSIDERATION:
        return type === 'NEW_ENTRY' ? '분할 신규 매수 검토 유효' : '비중 확대 및 추가 매수 검토';
      case AssessmentState.PENDING_CONDITIONS:
        return type === 'NEW_ENTRY' ? '핵심 조건 충족 전까지 신규 진입 대기' : '추가 매수 보류, 지지선 확인 대기';
      case AssessmentState.HOLD:
        return '기존 포지션 유지 (투자 논리 유지 중)';
      case AssessmentState.REDUCE_CONSIDERATION:
        return '리스크 관리 및 비중 축소 분할 매도 검토';
      case AssessmentState.SELL_CONSIDERATION:
        return '투자 논리 훼손 또는 손절선 도달에 따른 전량 매도 검토';
      case AssessmentState.SUSPENDED_JUDGMENT:
      default:
        return '데이터 불충분 또는 근거 만료로 판단 유보';
    }
  }
}
