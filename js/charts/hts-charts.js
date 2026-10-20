/**
 * Industry Insight HTS - High-Performance Chart Engine
 * Implements PRD Section FR-04 & Acceptance Criteria (AC-08, AC-09)
 */

import { MathEngine } from '../core/math-engine.js';

export class HTSCharts {
  /**
   * 이동평균선(SMA) 산출
   */
  static calculateSMA(candles, period) {
    const sma = [];
    for (let i = 0; i < candles.length; i++) {
      if (i < period - 1) {
        sma.push(null); // 기간 부족 구간은 미표시 (FR-04)
      } else {
        let sum = 0;
        for (let j = 0; j < period; j++) {
          sum += candles[i - j].close;
        }
        sma.push(sum / period);
      }
    }
    return sma;
  }

  /**
   * 1. 캔들스틱 + 거래량 + 이동평균선 차트 렌더러 (Canvas 기반)
   */
  static renderCandlestick(canvas, candles, options = {}) {
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // AC-08: 원자료 부재 시 비활성화 및 사유 안내 (합성 데이터 생성 금지)
    if (!candles || candles.length === 0) {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('OHLCV 시세 원자료가 존재하지 않아 차트를 비활성화합니다. (AC-08: 합성 데이터 생성 금지)', width / 2, height / 2);
      return;
    }

    const {
      colorTheme = 'KR', // KR: red up, blue down; INT: green up, red down
      visibleMAs = { 5: true, 20: true, 60: true, 120: true },
      hoverIndex = null
    } = options;

    const upColor = colorTheme === 'KR' ? '#ef4444' : '#10b981';
    const downColor = colorTheme === 'KR' ? '#3b82f6' : '#ef4444';

    // 영역 분할: 상단 72% 캔들, 하단 24% 거래량, 여백 4%
    const candleTop = 30;
    const candleBottom = height * 0.70;
    const volumeTop = height * 0.74;
    const volumeBottom = height - 30;
    const chartLeft = 55;
    const chartRight = width - 65;
    const chartWidth = chartRight - chartLeft;

    // 배경 지우기
    ctx.fillStyle = '#0b0f19';
    ctx.fillRect(0, 0, width, height);

    // 가격 min/max
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    let maxVolume = 0;

    candles.forEach(c => {
      if (c.low < minPrice) minPrice = c.low;
      if (c.high > maxPrice) maxPrice = c.high;
      if (c.volume > maxVolume) maxVolume = c.volume;
    });

    const pricePadding = (maxPrice - minPrice) * 0.05 || 100;
    minPrice -= pricePadding;
    maxPrice += pricePadding;

    const n = candles.length;
    const slotWidth = chartWidth / n;
    const barWidth = Math.max(2, slotWidth * 0.65);

    const priceToY = price => candleBottom - ((price - minPrice) / (maxPrice - minPrice)) * (candleBottom - candleTop);
    const volumeToY = vol => volumeBottom - (vol / (maxVolume || 1)) * (volumeBottom - volumeTop);
    const indexToX = i => chartLeft + i * slotWidth + slotWidth / 2;

    // 수평 그리드 & 가격 레이블
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#64748b';
    ctx.font = '11px monospace';
    ctx.textAlign = 'right';

    const gridLines = 5;
    for (let i = 0; i <= gridLines; i++) {
      const p = minPrice + ((maxPrice - minPrice) / gridLines) * i;
      const y = priceToY(p);
      ctx.beginPath();
      ctx.moveTo(chartLeft, y);
      ctx.lineTo(chartRight, y);
      ctx.stroke();
      ctx.fillText(Math.round(p).toLocaleString(), chartLeft - 6, y + 4);
    }

    // 거래량 수평선
    ctx.beginPath();
    ctx.moveTo(chartLeft, volumeTop);
    ctx.lineTo(chartRight, volumeTop);
    ctx.stroke();

    // 캔들 & 거래량 그리기
    candles.forEach((c, i) => {
      const x = indexToX(i);
      const isUp = c.close >= c.open;
      const color = isUp ? upColor : downColor;

      // 1. 거래량 바
      const vY = volumeToY(c.volume);
      ctx.fillStyle = isUp ? (colorTheme === 'KR' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.4)') : (colorTheme === 'KR' ? 'rgba(59, 130, 246, 0.4)' : 'rgba(239, 68, 68, 0.4)');
      ctx.fillRect(x - barWidth / 2, vY, barWidth, volumeBottom - vY);

      // 2. 캔들 수직선 (High-Low)
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(x, priceToY(c.high));
      ctx.lineTo(x, priceToY(c.low));
      ctx.stroke();

      // 3. 캔들 몸통 (Open-Close)
      const openY = priceToY(c.open);
      const closeY = priceToY(c.close);
      const bodyY = Math.min(openY, closeY);
      const bodyH = Math.max(1.5, Math.abs(closeY - openY));

      ctx.fillStyle = color;
      ctx.fillRect(x - barWidth / 2, bodyY, barWidth, bodyH);

      // 날짜 레이블 (적절한 간격으로)
      if (i % Math.ceil(n / 6) === 0 || i === n - 1) {
        ctx.fillStyle = '#64748b';
        ctx.textAlign = 'center';
        ctx.fillText(c.date.slice(5), x, height - 12);
      }
    });

    // 이동평균선 오버레이 (5, 20, 60, 120일)
    const maConfigs = [
      { period: 5, color: '#f59e0b', label: 'MA5' },
      { period: 20, color: '#ec4899', label: 'MA20' },
      { period: 60, color: '#38bdf8', label: 'MA60' },
      { period: 120, color: '#a855f7', label: 'MA120' }
    ];

    maConfigs.forEach(({ period, color }) => {
      if (!visibleMAs[period]) return;
      const sma = this.calculateSMA(candles, period);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      let started = false;

      sma.forEach((val, i) => {
        if (val === null) return;
        const x = indexToX(i);
        const y = priceToY(val);
        if (!started) {
          ctx.moveTo(x, y);
          started = true;
        } else {
          ctx.lineTo(x, y);
        }
      });
      if (started) ctx.stroke();
    });

    // 상단 범례
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'left';
    let legendX = chartLeft + 10;
    maConfigs.forEach(({ period, color, label }) => {
      if (!visibleMAs[period]) return;
      ctx.fillStyle = color;
      ctx.fillRect(legendX, 10, 10, 10);
      ctx.fillStyle = '#cbd5e1';
      ctx.fillText(label, legendX + 14, 19);
      legendX += 65;
    });

    // 마우스 호버 크로스헤어 & 툴팁
    if (hoverIndex !== null && hoverIndex >= 0 && hoverIndex < n) {
      const c = candles[hoverIndex];
      const hX = indexToX(hoverIndex);
      const hY = priceToY(c.close);

      // 점선 크로스헤어
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(hX, candleTop);
      ctx.lineTo(hX, volumeBottom);
      ctx.moveTo(chartLeft, hY);
      ctx.lineTo(chartRight, hY);
      ctx.stroke();
      ctx.setLineDash([]);

      // 툴팁 박스
      const tooltipText = `${c.date} | 시:${c.open.toLocaleString()} 고:${c.high.toLocaleString()} 저:${c.low.toLocaleString()} 종:${c.close.toLocaleString()} 거래:${c.volume.toLocaleString()}`;
      ctx.font = '11px monospace';
      const textWidth = ctx.measureText(tooltipText).width;
      const tX = Math.min(chartRight - textWidth - 20, Math.max(chartLeft + 10, hX - textWidth / 2));
      
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1;
      ctx.fillRect(tX - 8, 8, textWidth + 16, 20);
      ctx.strokeRect(tX - 8, 8, textWidth + 16, 20);
      ctx.fillStyle = '#f8fafc';
      ctx.textAlign = 'left';
      ctx.fillText(tooltipText, tX, 22);
    }
  }

  /**
   * 2. 가치평가 박스플롯 차트 (AC-09, FR-04)
   * PER 적자 배제, 표본 12개 미만 시 원자료 점 및 경고 표시
   */
  static renderBoxPlot(canvas, values, options = {}) {
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    ctx.fillStyle = '#0b0f19';
    ctx.fillRect(0, 0, width, height);

    const {
      metricName = 'PER 배수 분포',
      currentValue = null
    } = options;

    const stats = MathEngine.calculateBoxPlot(values);

    if (!stats) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = '13px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('적자(이익<=0) 또는 유효한 양수 배수 데이터가 없어 박스플롯을 생성할 수 없습니다.', width / 2, height / 2 - 10);
      ctx.fillStyle = '#64748b';
      ctx.font = '11px sans-serif';
      ctx.fillText('(PRD FR-04: 적자 시 PER 제외 후 PBR·EV/Sales 대안 검토 원칙 적용)', width / 2, height / 2 + 15);
      return;
    }

    const padLeft = 80;
    const padRight = 50;
    const plotWidth = width - padLeft - padRight;
    const midY = height / 2;

    const minRange = Math.min(stats.min, currentValue || stats.min) * 0.85;
    const maxRange = Math.max(stats.max, currentValue || stats.max) * 1.15;

    const valToX = val => padLeft + ((val - minRange) / (maxRange - minRange || 1)) * plotWidth;

    // 제목
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`${metricName} (표본: ${stats.sampleCount}개)`, 20, 25);

    // AC-09: 표본 12개 미만인 경우 경고 및 원자료 점 표시
    if (!stats.isSampleSufficient) {
      ctx.fillStyle = '#f59e0b';
      ctx.font = '11px sans-serif';
      ctx.fillText('⚠️ 표본 부족 (12개 미만): 박스플롯 대신 원자료 분산 점을 표시합니다. (AC-09 규정)', 20, 42);

      // 축 수평선
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padLeft, midY);
      ctx.lineTo(width - padRight, midY);
      ctx.stroke();

      // 원자료 점 표시
      stats.rawPoints.forEach((pt, idx) => {
        const x = valToX(pt);
        const yOffset = ((idx % 3) - 1) * 12;
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(x, midY + yOffset, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#94a3b8';
        ctx.font = '9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(pt.toFixed(1), x, midY + yOffset + 14);
      });
    } else {
      // 표본 12개 이상: 완전한 박스플롯 렌더링
      const xMin = valToX(stats.lowerWhisker);
      const xQ1 = valToX(stats.q1);
      const xMed = valToX(stats.median);
      const xQ3 = valToX(stats.q3);
      const xMax = valToX(stats.upperWhisker);

      const boxHeight = 44;
      const boxTop = midY - boxHeight / 2;

      // 1. 수염 (Whiskers)
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(xMin, midY);
      ctx.lineTo(xQ1, midY);
      ctx.moveTo(xQ3, midY);
      ctx.lineTo(xMax, midY);
      // 수염 끝 세로선
      ctx.moveTo(xMin, midY - 12);
      ctx.lineTo(xMin, midY + 12);
      ctx.moveTo(xMax, midY - 12);
      ctx.lineTo(xMax, midY + 12);
      ctx.stroke();

      // 2. 박스 (Q1 ~ Q3)
      ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.fillRect(xQ1, boxTop, xQ3 - xQ1, boxHeight);
      ctx.strokeRect(xQ1, boxTop, xQ3 - xQ1, boxHeight);

      // 3. 중앙값 세로선
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(xMed, boxTop);
      ctx.lineTo(xMed, boxTop + boxHeight);
      ctx.stroke();

      // 수치 텍스트
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`Q1: ${stats.q1.toFixed(1)}`, xQ1, boxTop - 8);
      ctx.fillText(`중앙값: ${stats.median.toFixed(1)}`, xMed, boxTop + boxHeight + 16);
      ctx.fillText(`Q3: ${stats.q3.toFixed(1)}`, xQ3, boxTop - 8);
      ctx.fillText(`하단: ${stats.lowerWhisker.toFixed(1)}`, xMin, midY + 24);
      ctx.fillText(`상단: ${stats.upperWhisker.toFixed(1)}`, xMax, midY + 24);
    }

    // 현재값 포인터 마커 표시
    if (currentValue !== null && currentValue > 0) {
      const curX = valToX(currentValue);
      ctx.fillStyle = '#ef4444';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(curX, midY - 30);
      ctx.lineTo(curX - 6, midY - 40);
      ctx.lineTo(curX + 6, midY - 40);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`현재: ${currentValue.toFixed(1)}`, curX, midY - 45);
    }
  }

  /**
   * 3. 상대성과 비교 차트 (Relative Performance Chart)
   */
  static renderRelativePerformance(canvas, seriesList) {
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    ctx.fillStyle = '#0b0f19';
    ctx.fillRect(0, 0, width, height);

    if (!seriesList || seriesList.length === 0) return;

    const padTop = 30;
    const padBottom = 30;
    const padLeft = 55;
    const padRight = 30;
    const plotW = width - padLeft - padRight;
    const plotH = height - padTop - padBottom;

    let minVal = 85;
    let maxVal = 115;

    seriesList.forEach(s => {
      s.data.forEach(v => {
        if (v < minVal) minVal = v;
        if (v > maxVal) maxVal = v;
      });
    });

    const valToY = v => padBottom + plotH - ((v - minVal) / (maxVal - minVal || 1)) * plotH;
    const indexToX = (i, total) => padLeft + (i / (total - 1 || 1)) * plotW;

    // 기준선 100
    const baselineY = valToY(100);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(padLeft, baselineY);
    ctx.lineTo(width - padRight, baselineY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px monospace';
    ctx.textAlign = 'right';
    ctx.fillText('100.0 (기준)', padLeft - 6, baselineY + 3);

    // 각 시리즈 렌더링
    let legendX = padLeft + 10;
    seriesList.forEach(s => {
      ctx.strokeStyle = s.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      s.data.forEach((val, idx) => {
        const x = indexToX(idx, s.data.length);
        const y = valToY(val);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // 범례
      ctx.fillStyle = s.color;
      ctx.fillRect(legendX, 10, 8, 8);
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(s.name, legendX + 12, 17);
      legendX += ctx.measureText(s.name).width + 25;
    });
  }
}
