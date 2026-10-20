/**
 * Industry Insight HTS - Mathematical Calculation Engine
 * Implements PRD Chapter 7 Calculation Rules & Acceptance Criteria (AC-01~AC-12)
 */

export class MathEngine {
  /**
   * 1. 매입원가 = 수량 × 평균매수가
   */
  static calculateCostBasis(quantity, averageCost) {
    if (quantity <= 0 || averageCost < 0) return 0;
    return quantity * averageCost;
  }

  /**
   * 2. 평가금액 = 수량 × 유효 평가가격
   * 유효 가격이 없거나 누락된 경우 null 반환
   */
  static calculateMarketValue(quantity, currentPrice) {
    if (currentPrice === null || currentPrice === undefined || isNaN(currentPrice)) {
      return null;
    }
    return quantity * currentPrice;
  }

  /**
   * 3. 미실현손익 = 평가금액 - 매입원가
   */
  static calculateUnrealizedPnl(marketValue, costBasis) {
    if (marketValue === null || costBasis === null) return null;
    return marketValue - costBasis;
  }

  /**
   * 4. 단순 평가수익률 (%) = (미실현손익 ÷ 보유 원가) × 100
   * 보유 원가가 0이거나 유효하지 않으면 null 반환 (N/A)
   */
  static calculateReturnRate(unrealizedPnl, costBasis) {
    if (unrealizedPnl === null || !costBasis || costBasis <= 0) {
      return null; // N/A
    }
    return (unrealizedPnl / costBasis) * 100;
  }

  /**
   * 5. 수량 가중 합산 평균매수가 (AC-02)
   * Σ(수량 × 단가) ÷ Σ수량
   * 예: 10주 @ 10,000원 + 20주 @ 13,000원 = 30주, 평균 12,000원
   */
  static calculateWeightedAverageCost(items) {
    if (!items || items.length === 0) return 0;
    let totalQty = 0;
    let totalCost = 0;

    for (const item of items) {
      const q = Number(item.quantity) || 0;
      const c = Number(item.averageCost) || 0;
      if (q > 0 && c >= 0) {
        totalQty += q;
        totalCost += (q * c);
      }
    }

    if (totalQty === 0) return 0;
    return totalCost / totalQty;
  }

  /**
   * 6. 포트폴리오 집계 평가 (AC-03, AC-06, FR-09)
   * @param {Array} holdings 보유 종목 리스트 [{ ticker, quantity, averageCost, currentPrice, sector, ... }]
   * @param {number} cash 현금 잔고
   */
  static evaluatePortfolio(holdings, cash = 0) {
    let totalCost = 0;
    let totalMarketValue = 0;
    let hasMissingPrice = false;
    let missingCount = 0;
    let missingCostBasis = 0;

    const evaluatedHoldings = holdings.map(h => {
      const cost = this.calculateCostBasis(h.quantity, h.averageCost);
      const mVal = this.calculateMarketValue(h.quantity, h.currentPrice);
      
      totalCost += cost;

      if (mVal === null) {
        hasMissingPrice = true;
        missingCount++;
        missingCostBasis += cost;
        return {
          ...h,
          costBasis: cost,
          marketValue: null,
          unrealizedPnl: null,
          returnRate: null,
          portfolioWeight: null,
          totalAssetWeight: null,
          isPriceMissing: true
        };
      }

      totalMarketValue += mVal;
      const pnl = this.calculateUnrealizedPnl(mVal, cost);
      const ret = this.calculateReturnRate(pnl, cost);

      return {
        ...h,
        costBasis: cost,
        marketValue: mVal,
        unrealizedPnl: pnl,
        returnRate: ret,
        isPriceMissing: false
      };
    });

    const totalAssets = totalMarketValue + (Number(cash) || 0);

    // 비중 계산
    const finalizedHoldings = evaluatedHoldings.map(h => {
      if (h.marketValue === null) {
        return h;
      }
      return {
        ...h,
        // 투자자산 비중 = 종목 평가금액 ÷ 평가 완료된 전체 투자자산
        portfolioWeight: totalMarketValue > 0 ? (h.marketValue / totalMarketValue) * 100 : 0,
        // 현금 포함 비중 = 종목 평가금액 ÷ (투자자산 평가액 + 현금)
        totalAssetWeight: totalAssets > 0 ? (h.marketValue / totalAssets) * 100 : 0
      };
    });

    const totalUnrealizedPnl = hasMissingPrice ? null : (totalMarketValue - totalCost);
    const totalReturnRate = hasMissingPrice ? null : this.calculateReturnRate(totalUnrealizedPnl, totalCost);
    const cashWeight = totalAssets > 0 ? ((Number(cash) || 0) / totalAssets) * 100 : 0;

    return {
      holdings: finalizedHoldings,
      totalCostBasis: totalCost,
      totalMarketValue,
      totalCash: Number(cash) || 0,
      totalAssets,
      totalUnrealizedPnl,
      totalReturnRate,
      cashWeight,
      hasMissingPrice,
      missingCount,
      missingCostBasis,
      isComplete: !hasMissingPrice,
      status: hasMissingPrice ? 'INCOMPLETE' : 'COMPLETE'
    };
  }

  /**
   * 7. 가상 매매 시뮬레이션 (AC-04, AC-05, FR-10)
   * 원본 포트폴리오를 변경하지 않고 복사본 생성 후 시뮬레이션
   */
  static simulateTrade(currentHoldings, currentCash, trade) {
    const { ticker, side, quantity, price, feeRate = 0, taxRate = 0 } = trade;
    const qty = Number(quantity);
    const p = Number(price);
    const fees = (qty * p) * (Number(feeRate) || 0);
    const taxes = (side === 'SELL') ? (qty * p) * (Number(taxRate) || 0) : 0;
    const totalDeductions = fees + taxes;

    if (qty <= 0 || p <= 0) {
      throw new Error('수량과 가격은 0보다 커야 합니다.');
    }

    const targetHolding = currentHoldings.find(h => h.ticker === ticker);

    if (side === 'SELL') {
      const currentQty = targetHolding ? targetHolding.quantity : 0;
      // AC-05: 보유수량 초과 매도 차단
      if (qty > currentQty) {
        throw new Error(`보유수량 초과: 보유 ${currentQty}주, 매도요청 ${qty}주`);
      }
    } else if (side === 'BUY') {
      const requiredCash = (qty * p) + totalDeductions;
      if (requiredCash > currentCash) {
        throw new Error(`현금 부족: 필요현금 ${Math.round(requiredCash).toLocaleString()}원, 보유현금 ${Math.round(currentCash).toLocaleString()}원`);
      }
    }

    // 원본 보존을 위해 깊은 복사 (AC-04)
    const newHoldings = currentHoldings.map(h => ({ ...h }));
    let newCash = Number(currentCash);

    if (side === 'BUY') {
      newCash -= ((qty * p) + totalDeductions);
      const existing = newHoldings.find(h => h.ticker === ticker);
      if (existing) {
        const totalNewQty = existing.quantity + qty;
        const totalNewCost = (existing.quantity * existing.averageCost) + (qty * p);
        existing.quantity = totalNewQty;
        existing.averageCost = totalNewCost / totalNewQty;
      } else {
        newHoldings.push({
          ticker,
          name: trade.name || ticker,
          quantity: qty,
          averageCost: p,
          currentPrice: p,
          sector: trade.sector || '기타'
        });
      }
    } else if (side === 'SELL') {
      newCash += ((qty * p) - totalDeductions);
      const existingIndex = newHoldings.findIndex(h => h.ticker === ticker);
      if (existingIndex >= 0) {
        const existing = newHoldings[existingIndex];
        const remainingQty = existing.quantity - qty;
        if (remainingQty === 0) {
          newHoldings.splice(existingIndex, 1);
        } else {
          existing.quantity = remainingQty;
          // 매도 시 평균단가는 불변
        }
      }
    }

    // 전후 평가 비교 반환
    const beforeEvaluation = this.evaluatePortfolio(currentHoldings, currentCash);
    const afterEvaluation = this.evaluatePortfolio(newHoldings, newCash);

    return {
      before: beforeEvaluation,
      after: afterEvaluation,
      tradeInfo: {
        ticker,
        side,
        quantity: qty,
        price: p,
        fees,
        taxes,
        tradeAmount: qty * p
      }
    };
  }

  /**
   * 8. 위험예산 수량 산출 (AC-11, FR-10)
   * 공식: floor(허용손실액 ÷ (진입가격 − 청산기준가격))
   * 제약: 진입가격 > 청산기준가격, 결과는 국내 정수 주식 기준 양수 정수
   */
  static calculateRiskBudgetQuantity(entryPrice, stopLossPrice, maxLossAmount) {
    const entry = Number(entryPrice);
    const stopLoss = Number(stopLossPrice);
    const maxLoss = Number(maxLossAmount);

    if (entry <= stopLoss) {
      throw new Error('진입가격은 손절청산기준가격보다 높아야 합니다.');
    }
    if (maxLoss <= 0) {
      throw new Error('허용손실액은 0보다 커야 합니다.');
    }

    const lossPerShare = entry - stopLoss;
    const quantity = Math.floor(maxLoss / lossPerShare);

    return {
      quantity: Math.max(0, quantity),
      lossPerShare,
      maxLossAmount: maxLoss,
      entryPrice: entry,
      stopLossPrice: stopLoss,
      estimatedLoss: quantity * lossPerShare,
      requiredCapital: quantity * entry
    };
  }

  /**
   * 9. 가격 충격 스트레스 테스트 (FR-10)
   * 개별 종목 또는 업종 가격 충격 적용
   * @param {Array} holdings 보유 종목 리스트
   * @param {number} cash 보유 현금
   * @param {Object} shocks { [ticker]: shockRate } or sector shocks
   */
  static simulatePriceShock(holdings, cash, shocks = {}) {
    const shockedHoldings = holdings.map(h => {
      let shock = 0;
      // 개별 종목 충격이 업종 충격보다 우선 (PRD FR-10)
      if (shocks[h.ticker] !== undefined) {
        shock = Number(shocks[h.ticker]) || 0;
      } else if (shocks[h.sector] !== undefined) {
        shock = Number(shocks[h.sector]) || 0;
      }

      const originalPrice = h.currentPrice;
      const shockedPrice = originalPrice !== null && originalPrice !== undefined
        ? originalPrice * (1 + (shock / 100))
        : null;

      return {
        ...h,
        currentPrice: shockedPrice,
        shockAppliedPct: shock
      };
    });

    return this.evaluatePortfolio(shockedHoldings, cash);
  }

  /**
   * 10. 박스플롯 분위수 계산 (FR-04)
   * 선형보간 분위수 및 1.5 * IQR 수염 산출
   * 표본 12개 미만일 때 warning 플래그
   */
  static calculateBoxPlot(values) {
    const cleanValues = values
      .map(v => Number(v))
      .filter(v => !isNaN(v) && v > 0) // PRD: PER 적자 제외 (<= 0 제외)
      .sort((a, b) => a - b);

    if (cleanValues.length === 0) {
      return null;
    }

    const isSampleSufficient = cleanValues.length >= 12;

    const getPercentile = (arr, p) => {
      if (arr.length === 1) return arr[0];
      const index = (arr.length - 1) * p;
      const lower = Math.floor(index);
      const upper = Math.ceil(index);
      const weight = index - lower;
      return arr[lower] * (1 - weight) + arr[upper] * weight;
    };

    const min = cleanValues[0];
    const max = cleanValues[cleanValues.length - 1];
    const q1 = getPercentile(cleanValues, 0.25);
    const median = getPercentile(cleanValues, 0.50);
    const q3 = getPercentile(cleanValues, 0.75);
    const iqr = q3 - q1;

    const lowerWhisker = Math.max(min, q1 - 1.5 * iqr);
    const upperWhisker = Math.min(max, q3 + 1.5 * iqr);

    const outliers = cleanValues.filter(v => v < lowerWhisker || v > upperWhisker);

    return {
      sampleCount: cleanValues.length,
      isSampleSufficient, // false이면 표본 부족 알림 표시 (AC-09)
      min,
      q1,
      median,
      q3,
      max,
      iqr,
      lowerWhisker,
      upperWhisker,
      outliers,
      rawPoints: cleanValues
    };
  }
}
