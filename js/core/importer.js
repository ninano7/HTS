/**
 * Industry Insight HTS - CSV & Holding Importer
 * Implements PRD Section FR-08 & Acceptance Criteria (AC-01, AC-02, AC-13)
 */

import { MathEngine } from './math-engine.js';

export const CSV_COLUMNS = [
  'account_alias',
  'market',
  'ticker',
  'name',
  'quantity',
  'average_cost',
  'currency',
  'purchase_date',
  'horizon',
  'target_weight_pct',
  'max_loss_amount',
  'memo'
];

export class HoldingImporter {
  /**
   * CSV 텍스트 파싱
   * 앞자리 0 보존(AC-01), 쉼표 및 따옴표 처리
   */
  static parseCSV(csvText) {
    if (!csvText || typeof csvText !== 'string') {
      return { headers: [], rows: [] };
    }

    const lines = csvText.split(/\r\n|\n|\r/).filter(line => line.trim().length > 0);
    if (lines.length === 0) {
      return { headers: [], rows: [] };
    }

    // 헤더 파싱
    const headers = this._parseCSVLine(lines[0]).map(h => h.trim());
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
      const values = this._parseCSVLine(lines[i]);
      if (values.length === 0) continue;
      
      const rowObj = {};
      headers.forEach((h, idx) => {
        rowObj[h] = values[idx] !== undefined ? values[idx].trim() : '';
      });
      rows.push({
        rawLineNumber: i + 1,
        data: rowObj
      });
    }

    return { headers, rows };
  }

  static _parseCSVLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++; // 따옴표 이스케이프 건너뛰기
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        values.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current);
    return values;
  }

  /**
   * 업로드 데이터 유효성 검사 및 미리보기 생성 (AC-01, AC-08, AC-13)
   */
  static validateAndPreview(parsedRows, currentHoldings = [], duplicateStrategy = 'ACCUMULATE') {
    const validRows = [];
    const errorRows = [];

    parsedRows.forEach(item => {
      const d = item.data;
      const errors = [];

      // 1. 종목코드 앞자리 0 보존 검사 (AC-01)
      let ticker = d.ticker || '';
      if (!ticker) {
        errors.push('종목코드(ticker)가 누락되었습니다.');
      } else {
        // 문자열로 앞자리 0 보존, 공백 제거
        ticker = String(ticker).trim();
        // 한국 상장 주식 6자리인 경우 앞 0 유지 확인
        if (/^\d{1,6}$/.test(ticker)) {
          ticker = ticker.padStart(6, '0');
        }
      }

      // 2. 종목명 검사
      const name = d.name || ticker;

      // 3. 계좌 별칭
      const accountAlias = d.account_alias || '기본계좌';

      // 4. 수량 검사 (양수)
      const quantity = Number(d.quantity);
      if (isNaN(quantity) || quantity <= 0) {
        errors.push(`수량이 유효하지 않습니다 (${d.quantity}). 0보다 큰 양수여야 합니다.`);
      }

      // 5. 평균매수가 검사 (0 이상)
      const averageCost = Number(d.average_cost);
      if (isNaN(averageCost) || averageCost < 0) {
        errors.push(`평균매수가가 유효하지 않습니다 (${d.average_cost}). 0 이상이어야 합니다.`);
      }

      // 6. 목표 비중 검사 (선택 사항이지만 입력 시 0~100)
      let targetWeightPct = d.target_weight_pct !== '' && d.target_weight_pct !== undefined ? Number(d.target_weight_pct) : null;
      if (targetWeightPct !== null && (isNaN(targetWeightPct) || targetWeightPct < 0 || targetWeightPct > 100)) {
        errors.push(`목표 비중이 범위를 벗어났습니다 (${d.target_weight_pct}%). 0~100% 사이여야 합니다.`);
      }

      // 7. 허용 손실액 검사 (선택 사항이지만 입력 시 0 이상)
      let maxLossAmount = d.max_loss_amount !== '' && d.max_loss_amount !== undefined ? Number(d.max_loss_amount) : null;
      if (maxLossAmount !== null && (isNaN(maxLossAmount) || maxLossAmount < 0)) {
        errors.push(`허용 손실액이 유효하지 않습니다 (${d.max_loss_amount}). 0 이상이어야 합니다.`);
      }

      if (errors.length > 0) {
        errorRows.push({
          lineNumber: item.rawLineNumber,
          rawData: d,
          errors
        });
      } else {
        validRows.push({
          lineNumber: item.rawLineNumber,
          accountAlias,
          market: d.market || 'KOSPI',
          ticker,
          name,
          quantity,
          averageCost,
          currency: d.currency || 'KRW',
          purchaseDate: d.purchase_date || new Date().toISOString().slice(0, 10),
          horizon: d.horizon || '중기',
          targetWeightPct,
          maxLossAmount,
          memo: d.memo || ''
        });
      }
    });

    return {
      totalRows: parsedRows.length,
      validRows,
      errorRows,
      isValidAll: errorRows.length === 0,
      summary: {
        total: parsedRows.length,
        valid: validRows.length,
        error: errorRows.length
      }
    };
  }

  /**
   * 중복 처리 및 최종 보유 리스트 병합 (AC-02)
   * duplicateStrategy: 'OVERWRITE' | 'ACCUMULATE' | 'SKIP'
   */
  static mergeHoldings(existingHoldings, newValidRows, duplicateStrategy = 'ACCUMULATE') {
    // 깊은 복사
    const merged = existingHoldings.map(h => ({ ...h }));

    for (const row of newValidRows) {
      const matchIndex = merged.findIndex(
        h => h.accountAlias === row.accountAlias && h.ticker === row.ticker
      );

      if (matchIndex === -1) {
        // 중복 없음 -> 신규 추가
        merged.push({
          id: `h_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          ...row
        });
      } else {
        // 동일 계좌 & 종목 중복 발생
        const existing = merged[matchIndex];
        if (duplicateStrategy === 'OVERWRITE') {
          merged[matchIndex] = {
            ...existing,
            ...row
          };
        } else if (duplicateStrategy === 'ACCUMULATE') {
          // 수량 가중 평균단가 계산 (AC-02)
          const newQty = existing.quantity + row.quantity;
          const weightedCost = MathEngine.calculateWeightedAverageCost([
            { quantity: existing.quantity, averageCost: existing.averageCost },
            { quantity: row.quantity, averageCost: row.averageCost }
          ]);
          merged[matchIndex] = {
            ...existing,
            quantity: newQty,
            averageCost: weightedCost,
            memo: existing.memo ? `${existing.memo}; ${row.memo}` : row.memo,
            targetWeightPct: row.targetWeightPct !== null ? row.targetWeightPct : existing.targetWeightPct,
            maxLossAmount: row.maxLossAmount !== null ? row.maxLossAmount : existing.maxLossAmount
          };
        } else if (duplicateStrategy === 'SKIP') {
          // 건너뛰기: 기존 유지
          continue;
        }
      }
    }

    return merged;
  }

  /**
   * 오류 행 CSV 파일 내용 생성 (다운로드용)
   */
  static generateErrorCSV(errorRows) {
    const headers = [...CSV_COLUMNS, 'error_reason'];
    const lines = [headers.join(',')];

    errorRows.forEach(row => {
      const d = row.rawData;
      const values = CSV_COLUMNS.map(col => {
        let val = d[col] !== undefined ? String(d[col]) : '';
        if (val.includes(',') || val.includes('"')) {
          val = `"${val.replace(/"/g, '""')}"`;
        }
        return val;
      });
      const errorText = `"${row.errors.join(' | ').replace(/"/g, '""')}"`;
      values.push(errorText);
      lines.push(values.join(','));
    });

    return lines.join('\r\n');
  }
}
