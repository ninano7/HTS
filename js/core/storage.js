/**
 * Industry Insight HTS - Storage & Backup Adapter
 * Implements PRD Section FR-12 & Acceptance Criteria (AC-14, AC-17)
 */

import { SCHEMA_VERSION, DataMode } from './types.js';

export class StorageAdapter {
  constructor(mode = DataMode.SNAPSHOT) {
    this.mode = mode;
    this.prefix = this._getNamespacePrefix(mode);
  }

  setMode(mode) {
    this.mode = mode;
    this.prefix = this._getNamespacePrefix(mode);
  }

  _getNamespacePrefix(mode) {
    // AC-17: 실제와 데모 네임스페이스 엄격 분리
    return mode === DataMode.DEMO ? 'hts_demo_' : 'hts_real_';
  }

  /**
   * 보유 종목 저장
   */
  saveHoldings(holdings) {
    const key = `${this.prefix}holdings`;
    const payload = {
      schema_version: SCHEMA_VERSION,
      updated_at: new Date().toISOString(),
      mode: this.mode,
      data: holdings
    };
    localStorage.setItem(key, JSON.stringify(payload));
    return payload;
  }

  /**
   * 보유 종목 로드
   */
  loadHoldings() {
    const key = `${this.prefix}holdings`;
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed.data) ? parsed.data : [];
    } catch (e) {
      console.error('Failed to parse holdings:', e);
      return [];
    }
  }

  /**
   * 현금 잔고 저장
   */
  saveCash(cashObj) {
    const key = `${this.prefix}cash`;
    localStorage.setItem(key, JSON.stringify(cashObj));
  }

  loadCash() {
    const key = `${this.prefix}cash`;
    const raw = localStorage.getItem(key);
    if (!raw) return { KRW: 10000000 }; // 기본 현금 1천만원
    try {
      return JSON.parse(raw);
    } catch (e) {
      return { KRW: 10000000 };
    }
  }

  /**
   * 사용자 설정 저장
   */
  saveSettings(settings) {
    const key = `hts_global_settings`;
    localStorage.setItem(key, JSON.stringify(settings));
  }

  loadSettings() {
    const key = `hts_global_settings`;
    const raw = localStorage.getItem(key);
    if (!raw) {
      return {
        colorTheme: 'KR', // KR(빨강상승/파랑하락) vs INT(초록상승/빨강하락)
        dataMode: DataMode.SNAPSHOT,
        maskPrivateInfo: false // 인쇄 시 민감정보 마스킹
      };
    }
    try {
      return JSON.parse(raw);
    } catch (e) {
      return { colorTheme: 'KR', dataMode: DataMode.SNAPSHOT, maskPrivateInfo: false };
    }
  }

  /**
   * 전체 시스템 JSON 백업 생성 (AC-14)
   */
  exportBackupJSON() {
    const backupData = {
      app: 'Industry Insight HTS',
      schema_version: SCHEMA_VERSION,
      exported_at: new Date().toISOString(),
      mode: this.mode,
      holdings: this.loadHoldings(),
      cash: this.loadCash(),
      settings: this.loadSettings(),
      memo: 'HTS Portfolio & User Settings Snapshot'
    };
    return JSON.stringify(backupData, null, 2);
  }

  /**
   * JSON 백업 복원 (AC-14)
   * 1. 스키마 및 포맷 검증
   * 2. 복원 전 자동 백업 스냅샷 생성
   * 3. 원자적 적용 (실패 시 자동 롤백)
   */
  importBackupJSON(jsonString) {
    let parsed;
    try {
      parsed = JSON.parse(jsonString);
    } catch (e) {
      throw new Error('유효한 JSON 형식이 아닙니다: ' + e.message);
    }

    if (!parsed || typeof parsed !== 'object') {
      throw new Error('백업 데이터 형식이 올바르지 않습니다.');
    }

    if (!parsed.schema_version) {
      throw new Error('schema_version 필드가 누락되어 호환성을 확인할 수 없습니다.');
    }

    // 롤백용 임시 스냅샷 생성
    const previousHoldings = this.loadHoldings();
    const previousCash = this.loadCash();

    try {
      if (Array.isArray(parsed.holdings)) {
        this.saveHoldings(parsed.holdings);
      }
      if (parsed.cash && typeof parsed.cash === 'object') {
        this.saveCash(parsed.cash);
      }
      if (parsed.settings && typeof parsed.settings === 'object') {
        this.saveSettings(parsed.settings);
      }

      return {
        success: true,
        restoredCount: Array.isArray(parsed.holdings) ? parsed.holdings.length : 0,
        exportedAt: parsed.exported_at,
        schemaVersion: parsed.schema_version
      };
    } catch (err) {
      // 롤백 수행 (AC-13, AC-14)
      this.saveHoldings(previousHoldings);
      this.saveCash(previousCash);
      throw new Error('백업 복원 실패로 이전 상태로 롤백되었습니다: ' + err.message);
    }
  }

  /**
   * 현재 네임스페이스의 데이터 초기화
   */
  clearCurrentModeData() {
    localStorage.removeItem(`${this.prefix}holdings`);
    localStorage.removeItem(`${this.prefix}cash`);
  }
}
