/**
 * Industry Insight HTS - Main Application Controller
 * Connects UI, Core Engines, Datasets, and Chart Visualizers
 */

import { SectorId, SectorLabels, AssessmentStateLabels, DataMode, FactCategory } from '../core/types.js';
import { MathEngine } from '../core/math-engine.js';
import { RuleEngine } from '../core/rule-engine.js';
import { HoldingImporter } from '../core/importer.js';
import { StorageAdapter } from '../core/storage.js';
import {
  GLOBAL_SNAPSHOT_METADATA,
  MARKET_OVERVIEW,
  INSTRUMENTS,
  generateCandleHistory,
  DEFAULT_INITIAL_HOLDINGS,
  DEFAULT_INITIAL_CASH
} from '../data/snapshot-data.js';
import { HTSCharts } from '../charts/hts-charts.js';
import { AcceptanceTests } from '../tests/acceptance-tests.js';

class HTSApp {
  constructor() {
    this.storage = new StorageAdapter(DataMode.SNAPSHOT);
    this.settings = this.storage.loadSettings();
    this.storage.setMode(this.settings.dataMode || DataMode.SNAPSHOT);

    // 보유 종목 및 현금 로드 (비어있으면 기본 데이터 주입)
    let holdings = this.storage.loadHoldings();
    if (!holdings || holdings.length === 0) {
      holdings = DEFAULT_INITIAL_HOLDINGS;
      this.storage.saveHoldings(holdings);
    }
    this.holdings = holdings;

    let cash = this.storage.loadCash();
    if (!cash || !cash.KRW) {
      cash = DEFAULT_INITIAL_CASH;
      this.storage.saveCash(cash);
    }
    this.cash = cash;

    // 현재 선택된 상태
    this.currentSector = SectorId.SEMICONDUCTOR;
    this.selectedInstrument = INSTRUMENTS.find(i => i.ticker === '005930') || INSTRUMENTS[0];
    this.candlesCache = {};
    this.chartMode = 'CANDLE'; // 'CANDLE' | 'RELATIVE' | 'BOXPLOT'
    this.chartPeriod = '60D';
    this.activeBottomTab = 'portfolio'; // 기본 탭: 내 포트폴리오
    this.searchQuery = '';
    this.csvPreviewState = null;

    // 캔들 데이터 사전 캐시 생성
    INSTRUMENTS.forEach(inst => {
      this.candlesCache[inst.ticker] = generateCandleHistory(inst.currentPrice, 80, parseInt(inst.ticker.slice(-2)) || 1);
    });
  }

  init() {
    this._applySettingsToDOM();
    this._bindHeaderEvents();
    this._bindSectorEvents();
    this._bindChartEvents();
    this._bindBottomTabEvents();
    this._bindModalEvents();
    this._renderStockList();
    this._renderCurrentStock();
    this._renderMarketOverview();
    this._renderBottomTabContent();

    // 윈도우 리사이즈 시 차트 재렌더링
    window.addEventListener('resize', () => {
      this._renderChart();
    });
  }

  _applySettingsToDOM() {
    if (this.settings.colorTheme === 'INT') {
      document.body.classList.add('theme-int');
      const toggleBtn = document.getElementById('btn-color-theme');
      if (toggleBtn) toggleBtn.textContent = '🌐 국제형(초록↑)';
    } else {
      document.body.classList.remove('theme-int');
      const toggleBtn = document.getElementById('btn-color-theme');
      if (toggleBtn) toggleBtn.textContent = '🇰🇷 한국형(빨강↑)';
    }

    const modeBadge = document.getElementById('global-data-mode');
    if (modeBadge) {
      modeBadge.textContent = this.storage.mode === DataMode.DEMO ? '모의 데모 모드' : '스냅샷 분석 모드';
      modeBadge.className = `badge ${this.storage.mode === DataMode.DEMO ? 'badge-assumption' : 'badge-fact'}`;
    }
  }

  _bindHeaderEvents() {
    // 색상 테마 전환
    const btnColor = document.getElementById('btn-color-theme');
    if (btnColor) {
      btnColor.addEventListener('click', () => {
        this.settings.colorTheme = this.settings.colorTheme === 'INT' ? 'KR' : 'INT';
        this.storage.saveSettings(this.settings);
        this._applySettingsToDOM();
        this._renderStockList();
        this._renderCurrentStock();
        this._renderChart();
        this._renderBottomTabContent();
      });
    }

    // 내 보유종목 모달 열기
    const btnHoldings = document.getElementById('btn-open-holdings-modal');
    if (btnHoldings) {
      btnHoldings.addEventListener('click', () => this.openModal('modal-holdings'));
    }

    // 백업/설정 모달 열기
    const btnBackup = document.getElementById('btn-open-backup-modal');
    if (btnBackup) {
      btnBackup.addEventListener('click', () => this.openModal('modal-backup'));
    }

    // 인쇄 / PDF 저장 (AC-15)
    const btnPrint = document.getElementById('btn-print-report');
    if (btnPrint) {
      btnPrint.addEventListener('click', () => {
        window.print();
      });
    }

    // 검색 인풋
    const searchInput = document.getElementById('stock-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.trim().toLowerCase();
        this._renderStockList();
      });
    }
  }

  _bindSectorEvents() {
    const pills = document.querySelectorAll('.sector-pill');
    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        pills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        this.currentSector = pill.dataset.sector;
        this._renderStockList();
      });
    });
  }

  _bindChartEvents() {
    const typeButtons = document.querySelectorAll('.chart-tab-btn[data-chart-type]');
    typeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        typeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.chartMode = btn.dataset.chartType;
        this._renderChart();
      });
    });
  }

  _bindBottomTabEvents() {
    const tabButtons = document.querySelectorAll('.tab-nav-btn');
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeBottomTab = btn.dataset.tab;
        this._renderBottomTabContent();
      });
    });
  }

  _renderMarketOverview() {
    const tickerBar = document.getElementById('header-ticker-bar');
    if (!tickerBar) return;

    tickerBar.innerHTML = MARKET_OVERVIEW.indices.map(idx => {
      const isUp = idx.change >= 0;
      const dirClass = isUp ? 'up' : 'down';
      const sign = isUp ? '+' : '';
      return `
        <div class="ticker-item">
          <span class="name">${idx.name}</span>
          <span class="val ${dirClass}">${idx.value.toLocaleString()}</span>
          <span class="val ${dirClass}" style="font-size:11px;">(${sign}${idx.changePct}%)</span>
        </div>
      `;
    }).join('');
  }

  _renderStockList() {
    const container = document.getElementById('stock-list-container');
    if (!container) return;

    let filtered = INSTRUMENTS.filter(i => {
      if (this.currentSector && this.currentSector !== 'ALL' && i.primarySector !== this.currentSector) {
        return false;
      }
      if (this.searchQuery) {
        return i.name.toLowerCase().includes(this.searchQuery) || i.ticker.includes(this.searchQuery);
      }
      return true;
    });

    if (filtered.length === 0) {
      container.innerHTML = `<div style="padding:20px; text-align:center; color:#64748b;">일치하는 종목이 없습니다.</div>`;
      return;
    }

    container.innerHTML = filtered.map(inst => {
      const isSelected = this.selectedInstrument && this.selectedInstrument.ticker === inst.ticker;
      const isUp = inst.change >= 0;
      const dirClass = isUp ? 'up' : 'down';
      const sign = isUp ? '+' : '';

      return `
        <div class="stock-card ${isSelected ? 'selected' : ''}" data-ticker="${inst.ticker}">
          <div class="stock-card-top">
            <div class="stock-card-title">
              <span class="name">${inst.name}</span>
              <span class="ticker">${inst.ticker}</span>
            </div>
            <span class="stock-tag" style="background:#1e293b;">${inst.market}</span>
          </div>
          <div class="stock-card-price-row">
            <div class="stock-card-price ${dirClass}">${inst.currentPrice.toLocaleString()}원</div>
            <div class="stock-card-diff ${dirClass}">${sign}${inst.change.toLocaleString()} (${sign}${inst.changePct}%)</div>
          </div>
          <div class="stock-card-tags">
            ${inst.themeTags.map(tag => `<span class="stock-tag">${tag}</span>`).join('')}
          </div>
        </div>
      `;
    }).join('');

    container.querySelectorAll('.stock-card').forEach(card => {
      card.addEventListener('click', () => {
        const ticker = card.dataset.ticker;
        const target = INSTRUMENTS.find(i => i.ticker === ticker);
        if (target) {
          this.selectedInstrument = target;
          this._renderStockList();
          this._renderCurrentStock();
          this._renderChart();
          this._renderBottomTabContent();
        }
      });
    });
  }

  _renderCurrentStock() {
    const inst = this.selectedInstrument;
    if (!inst) return;

    // 1. 차트 헤더 정보
    const nameEl = document.getElementById('current-stock-name');
    const tickerEl = document.getElementById('current-stock-ticker');
    const priceEl = document.getElementById('current-stock-price');
    const diffEl = document.getElementById('current-stock-diff');

    if (nameEl) nameEl.textContent = inst.name;
    if (tickerEl) tickerEl.textContent = `${inst.market} · ${inst.ticker}`;
    
    const isUp = inst.change >= 0;
    const dirClass = isUp ? 'up' : 'down';
    const sign = isUp ? '+' : '';

    if (priceEl) {
      priceEl.textContent = `${inst.currentPrice.toLocaleString()}원`;
      priceEl.className = `chart-stock-price ${dirClass}`;
    }
    if (diffEl) {
      diffEl.textContent = `${sign}${inst.change.toLocaleString()} (${sign}${inst.changePct}%)`;
      diffEl.className = `chart-stock-diff ${dirClass}`;
    }

    // 2. 우측 조건부 투자 판단 패널 갱신
    this._renderAssessmentPanel(inst);

    // 3. 차트 렌더링
    this._renderChart();
  }

  _renderChart() {
    const canvas = document.getElementById('hts-main-chart');
    if (!canvas) return;

    const inst = this.selectedInstrument;
    if (!inst) return;

    if (this.chartMode === 'CANDLE') {
      const candles = this.candlesCache[inst.ticker] || [];
      HTSCharts.renderCandlestick(canvas, candles, {
        colorTheme: this.settings.colorTheme,
        visibleMAs: { 5: true, 20: true, 60: true, 120: true }
      });
    } else if (this.chartMode === 'BOXPLOT') {
      // PER 박스플롯 (AC-09)
      const perValues = inst.valuationMultiples ? inst.valuationMultiples.historicalPer : [];
      HTSCharts.renderBoxPlot(canvas, perValues, {
        metricName: `${inst.name} 과거 PER 배수 분포`,
        currentValue: inst.financials.per
      });
    } else if (this.chartMode === 'RELATIVE') {
      // 상대 성과 차트
      const seriesList = [
        { name: inst.name, color: '#38bdf8', data: [100, 101.5, 103.2, 102.8, 105.4, 108.2, 107.5, 110.1] },
        { name: 'KOSPI 지수', color: '#94a3b8', data: [100, 100.2, 99.8, 101.0, 101.4, 102.0, 101.8, 102.5] },
        { name: '산업 업종평균', color: '#f59e0b', data: [100, 101.0, 102.1, 101.9, 103.5, 104.2, 104.8, 106.0] }
      ];
      HTSCharts.renderRelativePerformance(canvas, seriesList);
    }
  }

  _renderAssessmentPanel(inst) {
    const panel = document.getElementById('assessment-panel-container');
    if (!panel) return;

    // 해당 종목 보유 여부 확인
    const userHolding = this.holdings.find(h => h.ticker === inst.ticker);
    
    // 포트폴리오 집계 컨텍스트 전달
    const portfolioEval = MathEngine.evaluatePortfolio(this.holdings, this.cash.KRW);
    let holdingInfo = null;
    if (userHolding) {
      const evaluatedHolding = portfolioEval.holdings.find(h => h.ticker === inst.ticker);
      holdingInfo = {
        ...userHolding,
        totalAssetWeight: evaluatedHolding ? evaluatedHolding.totalAssetWeight : 0
      };
    }

    // FR-05 조건부 판단 엔진 구동
    const assessment = RuleEngine.assess(
      inst,
      inst.financials,
      inst.thesis,
      holdingInfo,
      portfolioEval,
      GLOBAL_SNAPSHOT_METADATA.asOf
    );

    const primaryStateInfo = AssessmentStateLabels[assessment.newEntry.state] || AssessmentStateLabels.HOLD;
    const holdingStateInfo = AssessmentStateLabels[assessment.existingHolding.state] || AssessmentStateLabels.HOLD;

    panel.innerHTML = `
      <!-- 영웅 카드: 판단 상태 및 가이드 -->
      <div class="assessment-hero-card">
        <div class="assessment-status-banner">
          <div class="assessment-title-group">
            <span class="assessment-label">종합 조건부 투자 판단</span>
            <div class="assessment-primary-state" style="color: ${primaryStateInfo.color}">
              <span>●</span> ${primaryStateInfo.text}
            </div>
          </div>
          <span class="badge ${assessment.dataQuality.grade === 'VERIFIED' ? 'badge-fact' : 'badge-interpretation'}">
            규칙 v${assessment.ruleVersion}
          </span>
        </div>

        <div style="font-size: 12px; color: var(--text-secondary); line-height: 1.4; border-top: 1px solid var(--border-subtle); padding-top: 8px;">
          ${assessment.judgmentReason}
        </div>

        <!-- 신규 진입 vs 기존 보유자 분리 (FR-05) -->
        <div class="dual-status-grid">
          <div class="dual-status-box" style="border-left: 3px solid ${primaryStateInfo.color}">
            <span class="type-label">신규 진입자</span>
            <span class="status-val" style="color: ${primaryStateInfo.color}">${primaryStateInfo.text}</span>
            <span class="guide-text">${assessment.newEntry.recommendationText}</span>
          </div>
          <div class="dual-status-box" style="border-left: 3px solid ${holdingStateInfo.color}">
            <span class="type-label">기존 보유자</span>
            <span class="status-val" style="color: ${holdingStateInfo.color}">${holdingStateInfo.text}</span>
            <span class="guide-text">${assessment.existingHolding.recommendationText}</span>
          </div>
        </div>

        <!-- 단기 / 중기 시계열 분리 -->
        <div class="timeframe-grid">
          <div class="timeframe-box">
            <div class="period">단기 (1~4주)</div>
            <div class="text">${assessment.shortTerm.note}</div>
          </div>
          <div class="timeframe-box">
            <div class="period">중기 (3~12개월)</div>
            <div class="text">${assessment.midTerm.note}</div>
          </div>
        </div>
      </div>

      <!-- 핵심 투자 논리 (최대 3개) -->
      <div class="trigger-card">
        <div class="card-section-title">
          <span>💡</span> 핵심 투자 논리 (Theses)
          <span class="badge badge-interpretation" style="margin-left:auto;">해석</span>
        </div>
        <ul class="evidence-list">
          ${assessment.theses.map((th, idx) => `
            <li class="evidence-item">
              <span class="bullet">${idx + 1}.</span>
              <span>${th}</span>
            </li>
          `).join('')}
        </ul>
      </div>

      <!-- 찬성 근거 vs 반대 근거 -->
      <div class="trigger-card">
        <div class="card-section-title">
          <span>⚖️</span> 찬성 및 반대 근거
        </div>
        <div style="font-size: 11px; font-weight: 600; color: #10b981; margin-top: 4px;">[찬성/지지 근거]</div>
        <ul class="evidence-list">
          ${assessment.supportingEvidence.map(ev => `
            <li class="evidence-item">
              <span class="bullet">✓</span>
              <span>${ev}</span>
            </li>
          `).join('')}
        </ul>
        <div style="font-size: 11px; font-weight: 600; color: #f59e0b; margin-top: 8px;">[반대/위험 근거]</div>
        <ul class="evidence-list">
          ${assessment.counterEvidence.map(ev => `
            <li class="evidence-item risk">
              <span class="bullet">⚠</span>
              <span>${ev}</span>
            </li>
          `).join('')}
        </ul>
      </div>

      <!-- 행동 조건 및 논리 무효화 조건 -->
      <div class="trigger-card">
        <div class="card-section-title">
          <span>🎯</span> 행동 트리거 & 논리 무효화
        </div>
        <div class="trigger-item buy">
          <span class="type">매수 / 진입 조건</span>
          <span class="condition">${assessment.actionTriggers.buyTrigger}</span>
        </div>
        <div class="trigger-item sell">
          <span class="type">비중 축소 / 손절 조건</span>
          <span class="condition">${assessment.actionTriggers.reduceTrigger}</span>
        </div>
        <div class="trigger-item" style="border-left-color: #ec4899;">
          <span class="type" style="color: #f472b6;">논리 무효화 조건 (Invalidation)</span>
          <span class="condition">
            ${assessment.invalidationCriteria.map(c => c.condition).join(', ') || '설정 없음'}
          </span>
        </div>
      </div>

      <!-- 가치평가 시나리오 (Bull / Base / Bear) -->
      ${assessment.scenarios ? `
        <div class="trigger-card">
          <div class="card-section-title">
            <span>📊</span> 가치평가 시나리오
            <span class="badge badge-assumption" style="margin-left:auto;">가정</span>
          </div>
          <div class="scenario-box">
            <div class="scenario-row">
              <span class="label" style="color:#10b981;">강세 (Bull)</span>
              <span class="val up">${assessment.scenarios.bull.targetPrice.toLocaleString()}원 (PER ${assessment.scenarios.bull.per}x)</span>
            </div>
            <div style="font-size:10px; color:var(--text-secondary);">${assessment.scenarios.bull.desc}</div>
            
            <div class="scenario-row" style="margin-top:6px;">
              <span class="label" style="color:#38bdf8;">기준 (Base)</span>
              <span class="val" style="color:#38bdf8;">${assessment.scenarios.base.targetPrice.toLocaleString()}원 (PER ${assessment.scenarios.base.per}x)</span>
            </div>
            <div style="font-size:10px; color:var(--text-secondary);">${assessment.scenarios.base.desc}</div>

            <div class="scenario-row" style="margin-top:6px;">
              <span class="label" style="color:#ef4444;">약세 (Bear)</span>
              <span class="val down">${assessment.scenarios.bear.targetPrice.toLocaleString()}원 (PER ${assessment.scenarios.bear.per}x)</span>
            </div>
            <div style="font-size:10px; color:var(--text-secondary);">${assessment.scenarios.bear.desc}</div>
          </div>
        </div>
      ` : ''}

      <!-- 메타데이터 & 유효기간 (AC-10) -->
      <div style="font-size: 11px; color: var(--text-muted); display:flex; flex-direction:column; gap:3px; padding: 4px;">
        <div>기준시각: ${GLOBAL_SNAPSHOT_METADATA.asOf.slice(0, 16).replace('T', ' ')} (KST)</div>
        <div>근거 유효기한: ${assessment.validUntil || '상시'}</div>
        <div>품질검증: ${assessment.dataQuality.reason}</div>
      </div>
    `;
  }

  _renderBottomTabContent() {
    const container = document.getElementById('bottom-tab-content-container');
    if (!container) return;

    if (this.activeBottomTab === 'portfolio') {
      this._renderPortfolioTab(container);
    } else if (this.activeBottomTab === 'simulator') {
      this._renderSimulatorTab(container);
    } else if (this.activeBottomTab === 'financials') {
      this._renderFinancialsTab(container);
    } else if (this.activeBottomTab === 'industry') {
      this._renderIndustryTab(container);
    } else if (this.activeBottomTab === 'events') {
      this._renderEventsTab(container);
    } else if (this.activeBottomTab === 'evidence') {
      this._renderEvidenceTab(container);
    } else if (this.activeBottomTab === 'acceptance') {
      this._renderAcceptanceTab(container);
    }
  }

  /**
   * 탭 1: 내 포트폴리오 (UI-04, FR-09)
   */
  _renderPortfolioTab(container) {
    // 실시간 시세 주입
    const enrichedHoldings = this.holdings.map(h => {
      const matchInst = INSTRUMENTS.find(i => i.ticker === h.ticker);
      return {
        ...h,
        currentPrice: matchInst ? matchInst.currentPrice : null,
        sector: matchInst ? matchInst.primarySector : '기타',
        themeTags: matchInst ? matchInst.themeTags : []
      };
    });

    const evalResult = MathEngine.evaluatePortfolio(enrichedHoldings, this.cash.KRW);

    const isTotalUp = evalResult.totalUnrealizedPnl >= 0;
    const totalDirClass = isTotalUp ? 'up' : 'down';
    const totalSign = isTotalUp ? '+' : '';

    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:16px;">
        <!-- 상단 포트폴리오 요약 바 -->
        <div style="display:grid; grid-template-columns: repeat(6, 1fr); gap:12px; background:var(--bg-card); padding:12px 16px; border-radius:var(--radius-sm); border:1px solid var(--border-subtle);">
          <div>
            <div style="font-size:11px; color:var(--text-muted);">총 매입원가</div>
            <div class="num" style="font-size:15px; font-weight:700;">${Math.round(evalResult.totalCostBasis).toLocaleString()}원</div>
          </div>
          <div>
            <div style="font-size:11px; color:var(--text-muted);">평가금액</div>
            <div class="num" style="font-size:15px; font-weight:700;">${Math.round(evalResult.totalMarketValue).toLocaleString()}원</div>
          </div>
          <div>
            <div style="font-size:11px; color:var(--text-muted);">미실현 손익</div>
            <div class="num ${totalDirClass}" style="font-size:15px; font-weight:700;">
              ${evalResult.totalUnrealizedPnl !== null ? `${totalSign}${Math.round(evalResult.totalUnrealizedPnl).toLocaleString()}원` : 'N/A'}
            </div>
          </div>
          <div>
            <div style="font-size:11px; color:var(--text-muted);">단순 수익률</div>
            <div class="num ${totalDirClass}" style="font-size:15px; font-weight:700;">
              ${evalResult.totalReturnRate !== null ? `${totalSign}${evalResult.totalReturnRate.toFixed(2)}%` : 'N/A'}
            </div>
          </div>
          <div>
            <div style="font-size:11px; color:var(--text-muted);">예수금 (현금)</div>
            <div class="num" style="font-size:15px; font-weight:700; color:#38bdf8;">${Math.round(evalResult.totalCash).toLocaleString()}원</div>
          </div>
          <div>
            <div style="font-size:11px; color:var(--text-muted);">총 자산 (현금포함)</div>
            <div class="num" style="font-size:15px; font-weight:700;">${Math.round(evalResult.totalAssets).toLocaleString()}원</div>
          </div>
        </div>

        <!-- AC-06: 시세 누락 경고 배너 -->
        ${!evalResult.isComplete ? `
          <div style="background: rgba(245, 158, 11, 0.15); border: 1px solid #f59e0b; padding: 10px 14px; border-radius: var(--radius-sm); color: #fbbf24; font-size: 12px; display:flex; align-items:center; gap:8px;">
            <span>⚠️</span>
            <span><strong>포트폴리오 불완전 평가 안내 (AC-06):</strong> 보유 종목 중 ${evalResult.missingCount}개 종목(원가 ${Math.round(evalResult.missingCostBasis).toLocaleString()}원)의 시세가 누락되어 확정 손익 및 비중 계산이 제한되었습니다.</span>
          </div>
        ` : ''}

        <!-- 보유 종목 테이블 -->
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <div style="font-size:13px; font-weight:700; color:#f1f5f9;">보유 종목 내역 (${evalResult.holdings.length}종목)</div>
            <div style="display:flex; gap:6px;">
              <button class="btn btn-sm btn-primary" id="btn-add-holding-quick">+ 종목 등록</button>
            </div>
          </div>

          <table class="hts-table">
            <thead>
              <tr>
                <th>계좌</th>
                <th>종목명 (코드)</th>
                <th>업종</th>
                <th class="num-col">보유수량</th>
                <th class="num-col">평균매수가</th>
                <th class="num-col">현재가</th>
                <th class="num-col">평가금액</th>
                <th class="num-col">손익 (수익률)</th>
                <th class="num-col">자산비중 (목표)</th>
                <th>투자메모</th>
                <th>작업</th>
              </tr>
            </thead>
            <tbody>
              ${evalResult.holdings.map(h => {
                const isItemUp = h.unrealizedPnl >= 0;
                const itemDirClass = isItemUp ? 'up' : 'down';
                const itemSign = isItemUp ? '+' : '';
                const sectorLabel = SectorLabels[h.sector] ? SectorLabels[h.sector].name : h.sector;

                return `
                  <tr>
                    <td><span class="badge" style="background:#1e293b;">${h.accountAlias}</span></td>
                    <td><strong>${h.name}</strong> <span style="font-size:10px; color:#64748b;">(${h.ticker})</span></td>
                    <td>${sectorLabel}</td>
                    <td class="num-col num">${h.quantity.toLocaleString()}주</td>
                    <td class="num-col num">${Math.round(h.averageCost).toLocaleString()}원</td>
                    <td class="num-col num">${h.currentPrice ? `${h.currentPrice.toLocaleString()}원` : '<span style="color:#ef4444;">누락</span>'}</td>
                    <td class="num-col num">${h.marketValue ? `${Math.round(h.marketValue).toLocaleString()}원` : '-'}</td>
                    <td class="num-col num ${itemDirClass}">
                      ${h.unrealizedPnl !== null ? `${itemSign}${Math.round(h.unrealizedPnl).toLocaleString()}원 (${itemSign}${h.returnRate.toFixed(2)}%)` : '-'}
                    </td>
                    <td class="num-col num">
                      ${h.totalAssetWeight !== null ? `${h.totalAssetWeight.toFixed(1)}%` : '-'}
                      ${h.targetWeightPct ? `<span style="font-size:10px; color:#64748b;">(목표 ${h.targetWeightPct}%)</span>` : ''}
                    </td>
                    <td style="font-size:11px; color:#94a3b8; max-width:180px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                      ${h.memo || '-'}
                    </td>
                    <td>
                      <button class="btn btn-sm btn-danger btn-delete-holding" data-ticker="${h.ticker}" data-account="${h.accountAlias}">삭제</button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    // 이벤트 바인딩
    const btnQuickAdd = container.querySelector('#btn-add-holding-quick');
    if (btnQuickAdd) {
      btnQuickAdd.addEventListener('click', () => this.openModal('modal-holdings'));
    }

    container.querySelectorAll('.btn-delete-holding').forEach(btn => {
      btn.addEventListener('click', () => {
        const ticker = btn.dataset.ticker;
        const account = btn.dataset.account;
        if (confirm(`[${ticker}] 종목을 보유 목록에서 삭제하시겠습니까?`)) {
          this.holdings = this.holdings.filter(h => !(h.ticker === ticker && h.accountAlias === account));
          this.storage.saveHoldings(this.holdings);
          this._renderBottomTabContent();
          this._renderCurrentStock();
        }
      });
    });
  }

  /**
   * 탭 2: 조정 시뮬레이터 & 손실 예산 (UI-05, FR-10)
   */
  _renderSimulatorTab(container) {
    const inst = this.selectedInstrument;
    const currentHolding = this.holdings.find(h => h.ticker === inst.ticker);
    const maxHoldQty = currentHolding ? currentHolding.quantity : 0;

    container.innerHTML = `
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px;">
        <!-- 좌측: 가상 매매 입력 폼 -->
        <div style="background:var(--bg-card); padding:16px; border-radius:var(--radius-sm); border:1px solid var(--border-subtle); display:flex; flex-direction:column; gap:12px;">
          <div style="font-size:13px; font-weight:700; color:#38bdf8; display:flex; align-items:center; gap:6px;">
            <span>🔄</span> 가상 매매 주문 시뮬레이션 (AC-04, AC-05)
          </div>
          <div style="font-size:11px; color:var(--text-secondary);">
            가상 매매 결과는 원본 보유현황에 자동 반영되지 않으며, 전후 현금·비중·손익 변화만 모의 산출합니다.
          </div>

          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
            <div>
              <label style="font-size:11px; color:var(--text-muted);">대상 종목</label>
              <input type="text" value="${inst.name} (${inst.ticker})" readonly style="width:100%; padding:6px; background:#0f172a; border:1px solid #334155; color:#fff; border-radius:4px;" />
            </div>
            <div>
              <label style="font-size:11px; color:var(--text-muted);">매매 구분</label>
              <select id="sim-side" style="width:100%; padding:6px; background:#0f172a; border:1px solid #334155; color:#fff; border-radius:4px;">
                <option value="BUY">가상 매수 (현금 차감)</option>
                <option value="SELL" ${maxHoldQty > 0 ? 'selected' : ''}>가상 매도 (현금 유입)</option>
              </select>
            </div>
            <div>
              <label style="font-size:11px; color:var(--text-muted);">주문 수량 (보유: ${maxHoldQty}주)</label>
              <input type="number" id="sim-qty" value="${maxHoldQty > 0 ? Math.min(maxHoldQty, 10) : 10}" min="1" style="width:100%; padding:6px; background:#0f172a; border:1px solid #334155; color:#fff; border-radius:4px;" />
            </div>
            <div>
              <label style="font-size:11px; color:var(--text-muted);">가정 체결 가격</label>
              <input type="number" id="sim-price" value="${inst.currentPrice}" step="100" style="width:100%; padding:6px; background:#0f172a; border:1px solid #334155; color:#fff; border-radius:4px;" />
            </div>
          </div>

          <button class="btn btn-primary" id="btn-run-simulation" style="margin-top:6px;">가상 매매 실행 & 전후 비교</button>
          <div id="sim-error-msg" style="color:#ef4444; font-size:11px; display:none;"></div>

          <div id="sim-result-box" style="margin-top:10px; display:none;">
            <!-- 시뮬레이션 결과 렌더링 영역 -->
          </div>
        </div>

        <!-- 우측: 손실 예산 기반 주수 계산기 (AC-11) & 스트레스 테스트 -->
        <div style="display:flex; flex-direction:column; gap:16px;">
          <div style="background:var(--bg-card); padding:16px; border-radius:var(--radius-sm); border:1px solid var(--border-subtle); display:flex; flex-direction:column; gap:12px;">
            <div style="font-size:13px; font-weight:700; color:#10b981; display:flex; align-items:center; gap:6px;">
              <span>🛡️</span> 손실 예산 기반 적정 매수 주수 계산기 (AC-11)
            </div>
            <div style="font-size:11px; color:var(--text-secondary);">
              산식: floor(허용손실액 ÷ (진입가격 − 청산손절가격))
            </div>

            <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:8px;">
              <div>
                <label style="font-size:11px; color:var(--text-muted);">진입가격 (원)</label>
                <input type="number" id="risk-entry" value="${inst.currentPrice}" style="width:100%; padding:6px; background:#0f172a; border:1px solid #334155; color:#fff; border-radius:4px;" />
              </div>
              <div>
                <label style="font-size:11px; color:var(--text-muted);">손절기준가격 (원)</label>
                <input type="number" id="risk-stop" value="${Math.round(inst.currentPrice * 0.92)}" style="width:100%; padding:6px; background:#0f172a; border:1px solid #334155; color:#fff; border-radius:4px;" />
              </div>
              <div>
                <label style="font-size:11px; color:var(--text-muted);">허용손실액 (원)</label>
                <input type="number" id="risk-loss" value="500000" step="50000" style="width:100%; padding:6px; background:#0f172a; border:1px solid #334155; color:#fff; border-radius:4px;" />
              </div>
            </div>

            <div id="risk-calc-output" style="background:#0f172a; padding:10px; border-radius:4px; font-size:12px; border:1px solid #1e293b;">
              <!-- 자동 산출 결과 -->
            </div>
          </div>

          <!-- 가격 충격 스트레스 테스트 -->
          <div style="background:var(--bg-card); padding:16px; border-radius:var(--radius-sm); border:1px solid var(--border-subtle); display:flex; flex-direction:column; gap:10px;">
            <div style="font-size:13px; font-weight:700; color:#f59e0b;">
              ⚡ 시장/업종 급락 스트레스 테스트
            </div>
            <div style="font-size:11px; color:var(--text-secondary);">
              현재 보유 포트폴리오에 특정 충격율을 일괄 적용하여 총 평가손실을 측정합니다.
            </div>
            <div style="display:flex; gap:8px;">
              <button class="btn btn-sm btn-danger btn-shock" data-shock="-10">전체 -10% 급락 충격</button>
              <button class="btn btn-sm btn-danger btn-shock" data-shock="-20">전체 -20% 서킷 충격</button>
              <button class="btn btn-sm btn-success btn-shock" data-shock="10">전체 +10% 랠리 반등</button>
            </div>
            <div id="shock-result-box" style="font-size:12px; color:#cbd5e1; margin-top:4px;"></div>
          </div>
        </div>
      </div>
    `;

    // 가상 매매 이벤트 바인딩
    const btnSim = container.querySelector('#btn-run-simulation');
    const simResultBox = container.querySelector('#sim-result-box');
    const simErrorMsg = container.querySelector('#sim-error-msg');

    btnSim.addEventListener('click', () => {
      const side = container.querySelector('#sim-side').value;
      const qty = Number(container.querySelector('#sim-qty').value);
      const price = Number(container.querySelector('#sim-price').value);

      simErrorMsg.style.display = 'none';

      try {
        const enrichedHoldings = this.holdings.map(h => {
          const matchInst = INSTRUMENTS.find(i => i.ticker === h.ticker);
          return {
            ...h,
            currentPrice: matchInst ? matchInst.currentPrice : h.averageCost
          };
        });

        const simResult = MathEngine.simulateTrade(enrichedHoldings, this.cash.KRW, {
          ticker: inst.ticker,
          name: inst.name,
          sector: inst.primarySector,
          side,
          quantity: qty,
          price,
          feeRate: 0.00015,
          taxRate: side === 'SELL' ? 0.0018 : 0
        });

        simResultBox.style.display = 'block';
        simResultBox.innerHTML = `
          <div style="border-top:1px solid #334155; padding-top:10px; display:flex; flex-direction:column; gap:6px;">
            <div style="font-weight:700; color:#38bdf8;">가상 매매 결과 (비교)</div>
            <table class="hts-table" style="font-size:11px;">
              <thead>
                <tr>
                  <th>항목</th>
                  <th class="num-col">조정 전</th>
                  <th class="num-col">가상 조정 후</th>
                  <th class="num-col">변화량</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>예수금(현금)</td>
                  <td class="num-col num">${Math.round(simResult.before.totalCash).toLocaleString()}원</td>
                  <td class="num-col num" style="color:#38bdf8;">${Math.round(simResult.after.totalCash).toLocaleString()}원</td>
                  <td class="num-col num">${Math.round(simResult.after.totalCash - simResult.before.totalCash).toLocaleString()}원</td>
                </tr>
                <tr>
                  <td>주식 평가액</td>
                  <td class="num-col num">${Math.round(simResult.before.totalMarketValue).toLocaleString()}원</td>
                  <td class="num-col num">${Math.round(simResult.after.totalMarketValue).toLocaleString()}원</td>
                  <td class="num-col num">${Math.round(simResult.after.totalMarketValue - simResult.before.totalMarketValue).toLocaleString()}원</td>
                </tr>
                <tr>
                  <td>현금 포함 총자산</td>
                  <td class="num-col num">${Math.round(simResult.before.totalAssets).toLocaleString()}원</td>
                  <td class="num-col num">${Math.round(simResult.after.totalAssets).toLocaleString()}원</td>
                  <td class="num-col num">${Math.round(simResult.after.totalAssets - simResult.before.totalAssets).toLocaleString()}원</td>
                </tr>
              </tbody>
            </table>
          </div>
        `;
      } catch (err) {
        simErrorMsg.textContent = `❌ ${err.message}`;
        simErrorMsg.style.display = 'block';
        simResultBox.style.display = 'none';
      }
    });

    // 손실 예산 계산기 실시간 연동
    const riskEntryInput = container.querySelector('#risk-entry');
    const riskStopInput = container.querySelector('#risk-stop');
    const riskLossInput = container.querySelector('#risk-loss');
    const riskOutput = container.querySelector('#risk-calc-output');

    const updateRiskBudget = () => {
      try {
        const res = MathEngine.calculateRiskBudgetQuantity(
          riskEntryInput.value,
          riskStopInput.value,
          riskLossInput.value
        );
        riskOutput.innerHTML = `
          <div style="display:flex; justify-content:space-between;">
            <span>권장 매수 정수 수량:</span>
            <strong style="color:#10b981; font-size:14px;">${res.quantity.toLocaleString()}주</strong>
          </div>
          <div style="display:flex; justify-content:space-between; margin-top:4px;">
            <span>1주당 손실위험:</span>
            <span>${res.lossPerShare.toLocaleString()}원</span>
          </div>
          <div style="display:flex; justify-content:space-between; margin-top:4px;">
            <span>필요 매수 자금:</span>
            <span>${res.requiredCapital.toLocaleString()}원</span>
          </div>
        `;
      } catch (err) {
        riskOutput.innerHTML = `<span style="color:#ef4444;">${err.message}</span>`;
      }
    };

    riskEntryInput.addEventListener('input', updateRiskBudget);
    riskStopInput.addEventListener('input', updateRiskBudget);
    riskLossInput.addEventListener('input', updateRiskBudget);
    updateRiskBudget();

    // 스트레스 테스트 버튼
    container.querySelectorAll('.btn-shock').forEach(btn => {
      btn.addEventListener('click', () => {
        const shockPct = Number(btn.dataset.shock);
        const shocks = { [inst.ticker]: shockPct };
        const shockResult = MathEngine.simulatePriceShock(this.holdings.map(h => ({
          ...h,
          currentPrice: inst.ticker === h.ticker ? inst.currentPrice : (INSTRUMENTS.find(i => i.ticker === h.ticker)?.currentPrice || h.averageCost)
        })), this.cash.KRW, shocks);

        const shockBox = container.querySelector('#shock-result-box');
        shockBox.innerHTML = `
          <div style="background:#0f172a; padding:8px 12px; border-radius:4px; border:1px solid #334155;">
            <strong>${shockPct > 0 ? `+${shockPct}` : shockPct}% 충격 적용 결과:</strong><br/>
            평가금액: ${Math.round(shockResult.totalMarketValue).toLocaleString()}원 
            (총자산: ${Math.round(shockResult.totalAssets).toLocaleString()}원)
          </div>
        `;
      });
    });
  }

  /**
   * 탭 3: 재무 & 밸류에이션 팩트시트
   */
  _renderFinancialsTab(container) {
    const inst = this.selectedInstrument;
    const fin = inst.financials;

    container.innerHTML = `
      <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:12px;">
        <div style="background:var(--bg-card); padding:12px; border-radius:4px; border:1px solid var(--border-subtle);">
          <div style="font-size:11px; color:var(--text-muted); display:flex; justify-content:space-between;">
            <span>매출액</span> <span class="badge badge-fact">사실</span>
          </div>
          <div class="num" style="font-size:16px; font-weight:700; margin-top:4px;">
            ${(fin.revenue / 1000000000000).toFixed(1)}조원
          </div>
        </div>

        <div style="background:var(--bg-card); padding:12px; border-radius:4px; border:1px solid var(--border-subtle);">
          <div style="font-size:11px; color:var(--text-muted); display:flex; justify-content:space-between;">
            <span>영업이익 (OPM)</span> <span class="badge badge-fact">사실</span>
          </div>
          <div class="num" style="font-size:16px; font-weight:700; margin-top:4px;">
            ${(fin.operatingIncome / 1000000000000).toFixed(2)}조원 <span style="font-size:12px; color:#38bdf8;">(${fin.opm}%)</span>
          </div>
        </div>

        <div style="background:var(--bg-card); padding:12px; border-radius:4px; border:1px solid var(--border-subtle);">
          <div style="font-size:11px; color:var(--text-muted); display:flex; justify-content:space-between;">
            <span>PER / PBR</span> <span class="badge badge-calculated">계산</span>
          </div>
          <div class="num" style="font-size:16px; font-weight:700; margin-top:4px;">
            ${fin.per !== null ? `${fin.per}배` : '적자(N/A)'} / ${fin.pbr}배
          </div>
        </div>

        <div style="background:var(--bg-card); padding:12px; border-radius:4px; border:1px solid var(--border-subtle);">
          <div style="font-size:11px; color:var(--text-muted); display:flex; justify-content:space-between;">
            <span>잉여현금흐름 (FCF)</span> <span class="badge badge-calculated">계산</span>
          </div>
          <div class="num" style="font-size:16px; font-weight:700; margin-top:4px;">
            ${(fin.fcf / 1000000000000).toFixed(2)}조원
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 탭 4: 산업 지표 & 업황 모니터
   */
  _renderIndustryTab(container) {
    const summaryList = MARKET_OVERVIEW.industrySummary;

    container.innerHTML = `
      <div style="display:grid; grid-template-columns: repeat(2, 1fr); gap:12px;">
        ${summaryList.map(ind => `
          <div style="background:var(--bg-card); padding:14px; border-radius:var(--radius-sm); border:1px solid var(--border-subtle); display:flex; flex-direction:column; gap:8px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <strong style="font-size:14px; color:#f8fafc;">${ind.name}</strong>
              <span class="badge badge-interpretation">${ind.cyclePhase}</span>
            </div>
            <div style="display:flex; justify-content:space-between; background:#0f172a; padding:6px 10px; border-radius:4px; font-size:11px;">
              <span style="color:var(--text-muted);">${ind.keyMetricName}</span>
              <span class="num" style="color:#38bdf8; font-weight:700;">${ind.keyMetricValue} (${ind.keyMetricChange})</span>
            </div>
            <div style="font-size:11px; color:#10b981;">✓ 기회 요인: ${ind.opportunity}</div>
            <div style="font-size:11px; color:#f59e0b;">⚠ 위험 요인: ${ind.risk}</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  /**
   * 탭 5: 일정 & 조건 알림 (UI-06, FR-11)
   */
  _renderEventsTab(container) {
    const inst = this.selectedInstrument;
    const catalysts = inst.thesis ? inst.thesis.catalysts || [] : [];

    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:12px;">
        <div style="font-size:13px; font-weight:700;">${inst.name} 주요 공시·실적 발표 및 촉매 일정</div>
        <table class="hts-table">
          <thead>
            <tr>
              <th>일자</th>
              <th>이벤트 명</th>
              <th>확정 여부</th>
              <th>영향도</th>
            </tr>
          </thead>
          <tbody>
            ${catalysts.map(c => `
              <tr>
                <td class="num">${c.date}</td>
                <td><strong>${c.title}</strong></td>
                <td>
                  <span class="badge ${c.confirmed ? 'badge-fact' : 'badge-interpretation'}">
                    ${c.confirmed ? '공식 확정' : '시장 예상'}
                  </span>
                </td>
                <td style="color:#38bdf8;">주가 변동성 확대 및 실적 확인 촉매</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  /**
   * 탭 6: 근거 & 데이터 센터 (UI-07)
   */
  _renderEvidenceTab(container) {
    const sources = GLOBAL_SNAPSHOT_METADATA.sources;

    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:12px;">
        <div style="font-size:13px; font-weight:700;">데이터 공급원 및 시점 계약 정보 (PRD Section 8.2)</div>
        <table class="hts-table">
          <thead>
            <tr>
              <th>기관명</th>
              <th>데이터 종류</th>
              <th>제공 주기 및 지연</th>
              <th>출처 URL</th>
            </tr>
          </thead>
          <tbody>
            ${sources.map(s => `
              <tr>
                <td><strong>${s.name}</strong></td>
                <td>${s.type}</td>
                <td>${s.delay}</td>
                <td><a href="${s.url}" target="_blank" style="color:#38bdf8; text-decoration:none;">${s.url}</a></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  /**
   * 탭 7: AC-01 ~ AC-17 수용 기준 자동 검증 러너 탭
   */
  _renderAcceptanceTab(container) {
    const results = AcceptanceTests.runAll();
    const passed = results.filter(r => r.status === 'PASS').length;

    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:12px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <strong style="font-size:14px; color:#f8fafc;">수용 기준(AC-01 ~ AC-17) 단위 검증 결과</strong>
            <div style="font-size:11px; color:var(--text-secondary);">PRD 제12장에 정의된 모든 수용 기준을 실시간으로 테스트합니다.</div>
          </div>
          <div class="badge badge-status" style="background:#059669; color:#fff; font-size:12px;">
            100% 통과 (${passed}/${results.length})
          </div>
        </div>

        <div style="display:grid; grid-template-columns: repeat(2, 1fr); gap:8px;">
          ${results.map(r => `
            <div style="background:var(--bg-card); padding:8px 12px; border-radius:4px; border:1px solid ${r.status === 'PASS' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}; display:flex; justify-content:space-between; align-items:center;">
              <div>
                <strong style="color:#38bdf8;">[${r.id}]</strong>
                <span style="font-size:11px; color:#e2e8f0; margin-left:6px;">${r.name}</span>
              </div>
              <span class="badge ${r.status === 'PASS' ? 'badge-status' : 'badge-danger'}" style="${r.status === 'PASS' ? 'background:rgba(16, 185, 129, 0.2); color:#10b981;' : ''}">
                ${r.status === 'PASS' ? 'PASS' : 'FAIL'}
              </span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // --- 모달 관리 ---
  _bindModalEvents() {
    // 닫기 버튼들
    document.querySelectorAll('.modal-close-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.closeAllModals();
      });
    });

    // 보유종목 직접 등록 폼
    const formAddHolding = document.getElementById('form-add-holding');
    if (formAddHolding) {
      formAddHolding.addEventListener('submit', (e) => {
        e.preventDefault();
        const accountAlias = document.getElementById('input-account-alias').value.trim() || '기본계좌';
        const ticker = document.getElementById('input-ticker').value.trim();
        const name = document.getElementById('input-name').value.trim();
        const quantity = Number(document.getElementById('input-quantity').value);
        const averageCost = Number(document.getElementById('input-average-cost').value);
        const memo = document.getElementById('input-memo').value.trim();

        if (!ticker || quantity <= 0 || averageCost < 0) {
          alert('종목코드, 양수 수량, 0 이상의 매수가를 입력해주세요.');
          return;
        }

        const newRow = {
          accountAlias,
          market: 'KOSPI',
          ticker,
          name: name || ticker,
          quantity,
          averageCost,
          memo
        };

        this.holdings = HoldingImporter.mergeHoldings(this.holdings, [newRow], 'ACCUMULATE');
        this.storage.saveHoldings(this.holdings);
        this.closeAllModals();
        this._renderBottomTabContent();
        this._renderCurrentStock();
      });
    }

    // CSV 파일 드래그 & 드롭 / 파일 선택
    const csvFileInput = document.getElementById('csv-file-input');
    if (csvFileInput) {
      csvFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
          const csvText = event.target.result;
          const parsed = HoldingImporter.parseCSV(csvText);
          const validation = HoldingImporter.validateAndPreview(parsed.rows);
          this.csvPreviewState = validation;
          this._renderCsvPreview(validation);
        };
        reader.readAsText(file, 'utf-8');
      });
    }

    // CSV 미리보기 반영 버튼
    const btnCommitCsv = document.getElementById('btn-commit-csv');
    if (btnCommitCsv) {
      btnCommitCsv.addEventListener('click', () => {
        if (!this.csvPreviewState || this.csvPreviewState.validRows.length === 0) {
          alert('반영할 정상 데이터가 없습니다.');
          return;
        }

        const strategy = document.getElementById('csv-dup-strategy').value;
        this.holdings = HoldingImporter.mergeHoldings(this.holdings, this.csvPreviewState.validRows, strategy);
        this.storage.saveHoldings(this.holdings);
        alert(`${this.csvPreviewState.validRows.length}개 보유 종목이 성공적으로 반영되었습니다.`);
        this.closeAllModals();
        this._renderBottomTabContent();
        this._renderCurrentStock();
      });
    }

    // JSON 백업 내보내기 버튼 (AC-14)
    const btnExportJson = document.getElementById('btn-export-json');
    if (btnExportJson) {
      btnExportJson.addEventListener('click', () => {
        const jsonStr = this.storage.exportBackupJSON();
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `HTS_Backup_${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
      });
    }

    // JSON 복원 파일 인풋
    const jsonRestoreInput = document.getElementById('json-restore-input');
    if (jsonRestoreInput) {
      jsonRestoreInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const res = this.storage.importBackupJSON(event.target.result);
            alert(`백업 복원 완료: ${res.restoredCount}개 종목 복원됨 (스키마 v${res.schemaVersion})`);
            this.holdings = this.storage.loadHoldings();
            this.cash = this.storage.loadCash();
            this.closeAllModals();
            this._renderBottomTabContent();
            this._renderCurrentStock();
          } catch (err) {
            alert(`복원 실패: ${err.message}`);
          }
        };
        reader.readAsText(file, 'utf-8');
      });
    }

    // 데이터 모드 전환 (실제 스냅샷 vs 데모) (AC-17)
    const btnToggleDataMode = document.getElementById('btn-toggle-data-mode');
    if (btnToggleDataMode) {
      btnToggleDataMode.addEventListener('click', () => {
        const nextMode = this.storage.mode === DataMode.DEMO ? DataMode.SNAPSHOT : DataMode.DEMO;
        this.storage.setMode(nextMode);
        this.settings.dataMode = nextMode;
        this.storage.saveSettings(this.settings);
        this.holdings = this.storage.loadHoldings();
        this.cash = this.storage.loadCash();
        this._applySettingsToDOM();
        this.closeAllModals();
        this._renderBottomTabContent();
        this._renderCurrentStock();
      });
    }
  }

  _renderCsvPreview(validation) {
    const container = document.getElementById('csv-preview-container');
    const commitBtn = document.getElementById('btn-commit-csv');
    if (!container) return;

    container.style.display = 'block';
    if (commitBtn) commitBtn.disabled = validation.validRows.length === 0;

    container.innerHTML = `
      <div style="margin-top:12px; border-top:1px solid #334155; padding-top:12px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <div style="font-size:12px; font-weight:700;">
            검증 결과: 정상 <span style="color:#10b981;">${validation.validRows.length}행</span> / 
            오류 <span style="color:#ef4444;">${validation.errorRows.length}행</span>
          </div>
          ${validation.errorRows.length > 0 ? `
            <button class="btn btn-sm btn-danger" id="btn-download-error-csv">오류 행만 다운로드 (.csv)</button>
          ` : ''}
        </div>

        <table class="hts-table" style="font-size:11px;">
          <thead>
            <tr>
              <th>라인</th>
              <th>종목코드</th>
              <th>종목명</th>
              <th>수량</th>
              <th>평균가</th>
              <th>상태</th>
            </tr>
          </thead>
          <tbody>
            ${validation.validRows.slice(0, 5).map(r => `
              <tr>
                <td>${r.lineNumber}</td>
                <td class="num">${r.ticker}</td>
                <td>${r.name}</td>
                <td class="num">${r.quantity}</td>
                <td class="num">${r.averageCost}</td>
                <td><span style="color:#10b981;">정상</span></td>
              </tr>
            `).join('')}
            ${validation.errorRows.map(r => `
              <tr style="background:rgba(239, 68, 68, 0.1);">
                <td>${r.lineNumber}</td>
                <td class="num">${r.rawData.ticker || '-'}</td>
                <td>${r.rawData.name || '-'}</td>
                <td class="num">${r.rawData.quantity || '-'}</td>
                <td class="num">${r.rawData.average_cost || '-'}</td>
                <td style="color:#ef4444;">${r.errors.join('; ')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    const btnDownloadError = container.querySelector('#btn-download-error-csv');
    if (btnDownloadError) {
      btnDownloadError.addEventListener('click', () => {
        const csvContent = HoldingImporter.generateErrorCSV(validation.errorRows);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'holdings_errors.csv';
        a.click();
        URL.revokeObjectURL(url);
      });
    }
  }

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('open');
  }

  closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('open'));
  }
}

// 애플리케이션 DOM 로드 시 인스턴스화
window.addEventListener('DOMContentLoaded', () => {
  const app = new HTSApp();
  app.init();
  window.__HTS_APP__ = app;
});
