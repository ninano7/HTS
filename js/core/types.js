/**
 * Industry Insight HTS - Core Data Types & Constants
 * PRD Version 1.0 (2026-10-20)
 */

export const SCHEMA_VERSION = '1.0.0';

export const DataMode = {
  SNAPSHOT: 'SNAPSHOT',   // 실제 고정 스냅샷 데이터
  API: 'API',             // 외부 API 연동 데이터 (P1)
  DEMO: 'DEMO'            // 모의 시연용 데이터
};

export const QualityStatus = {
  NORMAL: 'NORMAL',       // 정상
  DELAYED: 'DELAYED',     // 지연
  MISSING: 'MISSING',     // 누락
  ERROR: 'ERROR',         // 오류
  DEMO: 'DEMO'            // 데모
};

export const FactCategory = {
  FACT: 'FACT',                   // 사실 (공시, 거래소 확정 데이터)
  CALCULATED: 'CALCULATED',       // 계산값 (산식에 의해 도출)
  INTERPRETATION: 'INTERPRETATION',// 분석적 해석 (전문가 및 모델 해석)
  ASSUMPTION: 'ASSUMPTION'        // 사용자 가정 (시나리오, 목표비중 등)
};

export const AssessmentState = {
  BUY_CONSIDERATION: 'BUY_CONSIDERATION',         // 매수 검토
  PENDING_CONDITIONS: 'PENDING_CONDITIONS',       // 조건 충족 대기
  HOLD: 'HOLD',                                   // 보유
  REDUCE_CONSIDERATION: 'REDUCE_CONSIDERATION',   // 비중 축소 검토
  SELL_CONSIDERATION: 'SELL_CONSIDERATION',       // 매도 검토
  SUSPENDED_JUDGMENT: 'SUSPENDED_JUDGMENT'        // 판단 유보
};

export const AssessmentStateLabels = {
  [AssessmentState.BUY_CONSIDERATION]: { text: '매수 검토', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', border: '#10b981' },
  [AssessmentState.PENDING_CONDITIONS]: { text: '조건 충족 대기', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', border: '#f59e0b' },
  [AssessmentState.HOLD]: { text: '보유', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)', border: '#3b82f6' },
  [AssessmentState.REDUCE_CONSIDERATION]: { text: '비중 축소 검토', color: '#f97316', bg: 'rgba(249, 115, 22, 0.15)', border: '#f97316' },
  [AssessmentState.SELL_CONSIDERATION]: { text: '매도 검토', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', border: '#ef4444' },
  [AssessmentState.SUSPENDED_JUDGMENT]: { text: '판단 유보', color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.15)', border: '#94a3b8' }
};

export const SectorId = {
  STEEL: 'STEEL',
  SHIPBUILDING: 'SHIPBUILDING',
  AI: 'AI',
  SEMICONDUCTOR: 'SEMICONDUCTOR'
};

export const SectorLabels = {
  [SectorId.STEEL]: { name: '철강', icon: '🏗️', enName: 'Steel' },
  [SectorId.SHIPBUILDING]: { name: '조선', icon: '🚢', enName: 'Shipbuilding' },
  [SectorId.AI]: { name: '인공지능', icon: '🤖', enName: 'Artificial Intelligence' },
  [SectorId.SEMICONDUCTOR]: { name: '반도체', icon: '⚡', enName: 'Semiconductor' }
};

export const TimeHorizon = {
  SHORT_TERM: 'SHORT_TERM', // 단기 (1~4주)
  MID_TERM: 'MID_TERM'      // 중기 (3~12개월)
};
