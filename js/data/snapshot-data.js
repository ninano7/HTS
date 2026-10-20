/**
 * Industry Insight HTS - Fixed Snapshot Dataset
 * 4 Key Sectors, 16 Representative KOSPI/KOSDAQ Instruments
 * PRD Version 1.0 (2026-10-20)
 */

import { SectorId, QualityStatus, FactCategory, AssessmentState } from '../core/types.js';

export const GLOBAL_SNAPSHOT_METADATA = {
  dataMode: 'SNAPSHOT',
  schemaVersion: '1.0.0',
  asOf: '2026-10-20T14:30:00+09:00',
  timezone: 'Asia/Seoul',
  baseCurrency: 'KRW',
  quality: QualityStatus.NORMAL,
  sources: [
    { id: 'KRX', name: '한국거래소', type: '시세/체결', delay: '15분 지연(스냅샷)', url: 'http://data.krx.co.kr' },
    { id: 'DART', name: '금융감독원 전자공시시스템', type: '재무/사업보고서', delay: '정기공시 확정치', url: 'https://dart.fss.or.kr' },
    { id: 'CLARKSONS', name: 'Clarksons Research', type: '신조선가지수/수주잔고', delay: '월간 리포트', url: 'https://www.crsl.com' },
    { id: 'METALS', name: 'Fastmarkets / Platts', type: '철광석·열연 원자재가', delay: '일간 고시가', url: 'https://www.fastmarkets.com' },
    { id: 'TRENDFORCE', name: 'TrendForce / DXI', type: 'DRAM·NAND 고정거래가', delay: '월간 고시가', url: 'https://www.trendforce.com' }
  ]
};

// 매크로 및 시장 개요
export const MARKET_OVERVIEW = {
  indices: [
    { name: 'KOSPI', value: 2685.42, change: 18.25, changePct: 0.68, status: QualityStatus.NORMAL },
    { name: 'KOSDAQ', value: 852.18, change: -3.42, changePct: -0.40, status: QualityStatus.NORMAL },
    { name: 'USD/KRW', value: 1378.50, change: -4.50, changePct: -0.33, status: QualityStatus.NORMAL },
    { name: '국고채 3년', value: 3.12, change: -0.02, changePct: -0.64, status: QualityStatus.NORMAL }
  ],
  industrySummary: [
    {
      sectorId: SectorId.STEEL,
      name: '철강',
      cyclePhase: '바닥 다지기 및 중국 감산 기대',
      cyclePhaseCategory: FactCategory.INTERPRETATION,
      keyMetricName: '열연-철광석 스프레드',
      keyMetricValue: '$215 /톤',
      keyMetricChange: '+4.8% (전월대비)',
      opportunity: '중국 공급 과잉 억제책 및 4분기 인프라 부양책 발표',
      risk: '국내 건설 경기 침체 장기화 및 원자재(원료탄) 단기 반등',
      status: QualityStatus.NORMAL
    },
    {
      sectorId: SectorId.SHIPBUILDING,
      name: '조선',
      cyclePhase: '슈퍼사이클 진입 및 선가 상승 지속',
      cyclePhaseCategory: FactCategory.INTERPRETATION,
      keyMetricName: '클락슨 신조선가지수',
      keyMetricValue: '189.2 pt',
      keyMetricChange: '+8.4% (전년동기대비)',
      opportunity: '고선가 LNG/친환경선 인도 본격화로 OPM 두 자릿수 안착',
      risk: '후판 가격 협상 불확실성 및 인건비·외주 단가 상승',
      status: QualityStatus.NORMAL
    },
    {
      sectorId: SectorId.AI,
      name: '인공지능',
      cyclePhase: '수익화 검증 및 B2B 서비스 전환기',
      cyclePhaseCategory: FactCategory.INTERPRETATION,
      keyMetricName: '국내 주요 포털 AI 매출 기여도',
      keyMetricValue: '8.4%',
      keyMetricChange: '+2.1%p (전분기대비)',
      opportunity: '소버린 AI 인프라 구축 수요 및 검색/쇼핑 내 광고 단가 인상',
      risk: '빅테크 대비 모델 경쟁력 격차 및 데이터센터 전력 비용 부담',
      status: QualityStatus.NORMAL
    },
    {
      sectorId: SectorId.SEMICONDUCTOR,
      name: '반도체',
      cyclePhase: 'HBM 주도 고성장 & 범용 레거시 회복',
      cyclePhaseCategory: FactCategory.INTERPRETATION,
      keyMetricName: 'DDR5 16Gb 고정가 / HBM3E 가동률',
      keyMetricValue: '$4.25 / 100%',
      keyMetricChange: '+6.2% (전분기대비)',
      opportunity: '빅테크 차세대 GPU 출시 가속화로 HBM 공급 부족 지속',
      risk: '미·중 반도체 장비 수출 통제 강화 및 글로벌 스마트폰 수요 둔화',
      status: QualityStatus.NORMAL
    }
  ]
};

// 16개 종목 데이터 정의
export const INSTRUMENTS = [
  // ---------------- 철강 ----------------
  {
    id: '005490',
    ticker: '005490',
    name: 'POSCO홀딩스',
    market: 'KOSPI',
    primarySector: SectorId.STEEL,
    themeTags: ['철강', '이차전지소재', '친환경인프라'],
    currentPrice: 382000,
    previousClose: 376500,
    change: 5500,
    changePct: 1.46,
    volume: 382500,
    sharesOutstanding: 84571230,
    marketCap: 32306200000000, // 32.3조
    financials: {
      revenue: 77127100000000, // 77.1조
      operatingIncome: 3531400000000, // 3.5조
      netIncome: 1846000000000, // 1.8조
      opm: 4.58,
      roe: 3.25,
      debtRatio: 64.2,
      fcf: 1420000000000,
      per: 17.5,
      pbr: 0.58,
      dividendYield: 2.62
    },
    valuationMultiples: {
      historicalPer: [12.4, 14.1, 15.8, 16.2, 17.5, 18.2, 19.1, 16.8, 15.5, 14.9, 17.0, 18.5],
      historicalPbr: [0.45, 0.48, 0.52, 0.55, 0.58, 0.62, 0.65, 0.59, 0.54, 0.56, 0.60, 0.58]
    },
    thesis: {
      validUntil: '2026-12-31',
      theses: [
        '중국 철강재 밀어내기 수출 감소 및 아시아 열연 유통가 반등 수혜',
        '포스코 친환경 수소환원제철 전환 국책 지원 및 고부가 자동차 강판 점유율 1위',
        '리튬 광산 상업 생산 개시로 지주사 밸류에이션 디스카운트 해소 본격화'
      ],
      supportingEvidence: [
        '2026년 3분기 중국 감산 지침 공식화로 아시아 열연 스프레드 $215/t 회복 (출처: Fastmarkets)',
        '철강 부문 OPM 저점 3.1%에서 4.8%로 회복세 진입',
        'PBR 0.58배로 역사적 하단 밴드 위치 (하방 경직성 확보)'
      ],
      counterEvidence: [
        '국내 부동산 착공 감소 장기화로 봉형강 수요 부진 지속',
        '원료탄 가격 단기 급등 시 스프레드 축소 가능성'
      ],
      buyTrigger: '열연 스프레드 $220/톤 상회 및 주가 20일 이평선 안착',
      additionalBuyTrigger: '중국 경기부양책 집행 확인 및 외인 순매수 전환',
      reduceTrigger: 'PBR 0.75배 도달 또는 열연 스프레드 $190/톤 이하 하회',
      sellTrigger: '글로벌 철강 수요 역성장 전환 및 원료탄 급등 시',
      invalidationCriteria: [
        { condition: '중국 조강 생산량 감산 정책 철회', isTriggered: false },
        { condition: '열연 스프레드 $180/톤 붕괴', isTriggered: false }
      ],
      entryConditions: [
        { condition: 'PBR 0.65배 이하 밸류에이션 매력', isMet: true },
        { condition: '열연 스프레드 $210/톤 이상', isMet: true },
        { condition: '외국인 수급 5일 순매수 유입', isMet: true }
      ],
      shortTermState: AssessmentState.BUY_CONSIDERATION,
      midTermState: AssessmentState.BUY_CONSIDERATION,
      catalysts: [
        { title: '2026년 3분기 실적 발표', date: '2026-10-28', confirmed: true },
        { title: '아르헨티나 옴브레 무에르토 리튬 1단계 준공식', date: '2026-11-15', confirmed: false }
      ],
      scenarios: {
        bull: { targetPrice: 480000, per: 20.0, eps: 24000, desc: '중국 감산 성공 + 리튬 상업매출 반영' },
        base: { targetPrice: 410000, per: 18.0, eps: 22800, desc: '철강 스프레드 완만한 반등' },
        bear: { targetPrice: 330000, per: 15.0, eps: 22000, desc: '건설 침체 장기화 + 스프레드 정체' }
      }
    }
  },
  {
    id: '004020',
    ticker: '004020',
    name: '현대제철',
    market: 'KOSPI',
    primarySector: SectorId.STEEL,
    themeTags: ['철강', '봉형강', '자동차강판'],
    currentPrice: 28400,
    previousClose: 28100,
    change: 300,
    changePct: 1.07,
    volume: 245000,
    sharesOutstanding: 133445785,
    marketCap: 3790000000000,
    financials: {
      revenue: 23800000000000,
      operatingIncome: 620000000000,
      netIncome: 280000000000,
      opm: 2.61,
      roe: 1.82,
      debtRatio: 82.5,
      fcf: 450000000000,
      per: 13.5,
      pbr: 0.22,
      dividendYield: 3.52
    },
    valuationMultiples: {
      historicalPer: [8.5, 9.2, 10.5, 11.8, 12.5, 13.5, 14.0, 11.2, 10.0, 9.8, 12.2, 13.5],
      historicalPbr: [0.19, 0.21, 0.22, 0.24, 0.25, 0.28, 0.30, 0.26, 0.23, 0.22, 0.24, 0.22]
    },
    thesis: {
      validUntil: '2026-11-30',
      theses: [
        '현대차그룹 글로벌 전기차 강판 및 초고장력 강판 납품 안정성',
        '극단적 저PBR(0.22배)로 주주환원 정책 강화(밸류업) 기대',
        '건설용 봉형강 가동률 조절을 통한 가격 방어'
      ],
      supportingEvidence: [
        '현대차 조지아 공장 납품향 강판 출하 개시',
        '순자산가치 대비 시가총액 과도한 저평가 상태'
      ],
      counterEvidence: [
        '국내 건설 착공 면적 전년비 18% 감소로 봉형강 부문 적자 지속',
        '상대적으로 높은 부채비율'
      ],
      buyTrigger: '봉형강 유통단가 톤당 75만원 상회 및 밸류업 공시',
      invalidationCriteria: [
        { condition: '국내 분양 시장 위축 가속화로 봉형강 추가 감산', isTriggered: false }
      ],
      entryConditions: [
        { condition: 'PBR 0.25배 이하', isMet: true },
        { condition: '봉형강 가격 반등', isMet: false }
      ],
      shortTermState: AssessmentState.PENDING_CONDITIONS,
      midTermState: AssessmentState.HOLD,
      catalysts: [
        { title: '밸류업 주주환원 계획 공시', date: '2026-11-05', confirmed: false }
      ],
      scenarios: {
        bull: { targetPrice: 38000, per: 15.0, eps: 2530, desc: '건설 바닥 통과 + 밸류업 적극 시행' },
        base: { targetPrice: 32000, per: 13.0, eps: 2460, desc: '차량용 강판 수익성 유지' },
        bear: { targetPrice: 24000, per: 11.0, eps: 2180, desc: '건설 침체 악화로 적자 전환 우려' }
      }
    }
  },
  {
    id: '460860',
    ticker: '460860',
    name: '동국제강',
    market: 'KOSPI',
    primarySector: SectorId.STEEL,
    themeTags: ['철강', '봉형강', '후판'],
    currentPrice: 9450,
    previousClose: 9380,
    change: 70,
    changePct: 0.75,
    volume: 120000,
    sharesOutstanding: 50410000,
    marketCap: 476400000000,
    financials: {
      revenue: 4120000000000,
      operatingIncome: 145000000000,
      netIncome: 82000000000,
      opm: 3.52,
      roe: 4.12,
      debtRatio: 78.1,
      fcf: 98000000000,
      per: 5.8,
      pbr: 0.32,
      dividendYield: 4.23
    },
    valuationMultiples: {
      historicalPer: [4.5, 5.2, 5.8, 6.1, 5.9, 6.4, 5.8], // 7개 표본: 12개 미만 (AC-09 검증용)
      historicalPbr: [0.28, 0.30, 0.32, 0.35, 0.33, 0.36, 0.32]
    },
    thesis: {
      validUntil: '2026-12-15',
      theses: [
        '전기로 야간 조업 및 원가 절감 체질 개선 완료',
        '고배당 매력(4% 이상) 및 중간배당 실시'
      ],
      supportingEvidence: ['국내 철스크랩 단가 안정화로 스프레드 방어'],
      counterEvidence: ['철근 수요 회복 지연'],
      buyTrigger: '철스크랩 스프레드 톤당 30만원 상회',
      invalidationCriteria: [{ condition: '건설사 부도율 급증', isTriggered: false }],
      entryConditions: [{ condition: 'PER 6배 이하', isMet: true }],
      shortTermState: AssessmentState.HOLD,
      midTermState: AssessmentState.HOLD,
      catalysts: [{ title: '3분기 결산 및 배당안내', date: '2026-11-12', confirmed: true }]
    }
  },
  {
    id: '001430',
    ticker: '001430',
    name: '세아베스틸지주',
    market: 'KOSPI',
    primarySector: SectorId.STEEL,
    themeTags: ['철강', '특수강', '우주항공', '방산'],
    currentPrice: 21300,
    previousClose: 21500,
    change: -200,
    changePct: -0.93,
    volume: 98000,
    sharesOutstanding: 35848520,
    marketCap: 763570000000,
    financials: {
      revenue: 4050000000000,
      operatingIncome: 185000000000,
      netIncome: 110000000000,
      opm: 4.57,
      roe: 5.48,
      debtRatio: 72.3,
      fcf: 125000000000,
      per: 6.9,
      pbr: 0.38,
      dividendYield: 4.69
    },
    valuationMultiples: {
      historicalPer: [5.2, 5.8, 6.5, 7.1, 6.9, 7.5, 8.0, 7.2, 6.8, 6.4, 7.0, 6.9],
      historicalPbr: [0.32, 0.35, 0.37, 0.40, 0.38, 0.42, 0.45, 0.40, 0.37, 0.36, 0.39, 0.38]
    },
    thesis: {
      validUntil: '2026-12-31',
      theses: [
        '방산·원전·우주항공용 특수강 합금 소재 공급 확대',
        '북미 Cask(사용후핵연료 저장용기) 수주 모멘텀'
      ],
      supportingEvidence: ['특수강 고부가 비중 65% 돌파'],
      counterEvidence: ['완성차 생산 감산 시 자동차용 특수강 둔화'],
      buyTrigger: '방산/항공향 신규 계약 공시',
      invalidationCriteria: [{ condition: '원전 인허가 지연', isTriggered: false }],
      entryConditions: [{ condition: 'OPM 4% 이상 유지', isMet: true }],
      shortTermState: AssessmentState.BUY_CONSIDERATION,
      midTermState: AssessmentState.BUY_CONSIDERATION,
      catalysts: [{ title: '미국 원전 저장용기 추가 공급계약', date: '2026-11-20', confirmed: false }]
    }
  },

  // ---------------- 조선 ----------------
  {
    id: '009540',
    ticker: '009540',
    name: 'HD한국조선해양',
    market: 'KOSPI',
    primarySector: SectorId.SHIPBUILDING,
    themeTags: ['조선', '친환경선박', '해양플랜트'],
    currentPrice: 178500,
    previousClose: 174000,
    change: 4500,
    changePct: 2.59,
    volume: 312000,
    sharesOutstanding: 70773116,
    marketCap: 12633000000000, // 12.6조
    financials: {
      revenue: 25420000000000,
      operatingIncome: 1480000000000, // 1.48조
      netIncome: 1050000000000,
      opm: 5.82,
      roe: 8.92,
      debtRatio: 128.4,
      fcf: 1850000000000,
      per: 12.0,
      pbr: 1.05,
      dividendYield: 1.40
    },
    valuationMultiples: {
      historicalPer: [18.2, 16.5, 15.0, 14.2, 13.5, 12.0, 11.8, 14.5, 15.2, 13.8, 12.5, 12.0],
      historicalPbr: [0.75, 0.82, 0.88, 0.95, 1.02, 1.05, 1.15, 0.98, 0.92, 0.96, 1.00, 1.05]
    },
    thesis: {
      validUntil: '2026-12-31',
      theses: [
        '카타르 LNG선 등 2023년 이후 수주한 고선가 일감의 본격 매출 인식',
        '암모니아·메탄올 등 친환경 이중연료 추진선 압도적 수주 점유율',
        '신조선가지수 189pt로 역사적 최고 수준 유지에 따른 선별 수주 전략'
      ],
      supportingEvidence: [
        '3.5년치 안정적 수주잔고 확보(총 420억 달러 이상)',
        '후판가 안정(톤당 80만원대 초반 안착)으로 원가 압박 완화',
        '자회사(HD현대중공업, 삼호) 영업이익률 동반 상승세'
      ],
      counterEvidence: [
        '조선소 인력 부족에 따른 공정 지연 리스크 잔존',
        '원/달러 환율 1,300원 이하 급락 시 원화 환산 마진 축소'
      ],
      buyTrigger: '분기 영업이익률 6% 돌파 확인 및 신조선가지수 상승세 지속',
      additionalBuyTrigger: '초대형 암모니아 운반선(VLAC) 대량 수주 공시',
      reduceTrigger: '신조선가지수 3개월 연속 하락 반전 또는 파업 발생',
      sellTrigger: '글로벌 물동량 급감으로 신규 발주 절벽 현실화',
      invalidationCriteria: [
        { condition: '신조선가지수 175pt 이하 급락', isTriggered: false },
        { condition: '후판 가격 톤당 100만원 이상 폭등', isTriggered: false }
      ],
      entryConditions: [
        { condition: '수주잔고 3년치 이상 확보', isMet: true },
        { condition: '신조선가지수 185pt 이상', isMet: true },
        { condition: '분기 OPM 5% 이상', isMet: true }
      ],
      shortTermState: AssessmentState.BUY_CONSIDERATION,
      midTermState: AssessmentState.BUY_CONSIDERATION,
      catalysts: [
        { title: '3분기 확정 실적 발표 컨퍼런스콜', date: '2026-10-31', confirmed: true },
        { title: '유럽 선사향 초대형 LNG 운반선 수주 계약 체결', date: '2026-11-10', confirmed: false }
      ],
      scenarios: {
        bull: { targetPrice: 230000, per: 15.0, eps: 15300, desc: '선가 추가 상승 + 고선가 물량 풀가동' },
        base: { targetPrice: 200000, per: 13.0, eps: 15300, desc: '안정적 수주잔고 소진 및 마진 확대' },
        bear: { targetPrice: 150000, per: 10.0, eps: 15000, desc: '원가 상승 및 환율 하락' }
      }
    }
  },
  {
    id: '010140',
    ticker: '010140',
    name: '삼성중공업',
    market: 'KOSPI',
    primarySector: SectorId.SHIPBUILDING,
    themeTags: ['조선', 'FLNG', '해양에너지'],
    currentPrice: 10350,
    previousClose: 10100,
    change: 250,
    changePct: 2.48,
    volume: 5800000,
    sharesOutstanding: 880000000,
    marketCap: 9108000000000,
    financials: {
      revenue: 9800000000000,
      operatingIncome: 480000000000,
      netIncome: 340000000000,
      opm: 4.90,
      roe: 7.85,
      debtRatio: 165.2,
      fcf: 620000000000,
      per: 26.8,
      pbr: 1.85,
      dividendYield: 0.0
    },
    valuationMultiples: {
      historicalPer: [35.0, 32.0, 29.5, 28.0, 26.8, 25.0, 28.5, 30.0, 27.2, 26.5, 28.0, 26.8],
      historicalPbr: [1.35, 1.45, 1.55, 1.68, 1.75, 1.85, 1.95, 1.78, 1.65, 1.72, 1.80, 1.85]
    },
    thesis: {
      validUntil: '2026-11-30',
      theses: [
        '해양 플랜트(FLNG) 독점적 경쟁력 및 모잠비크 코랄 설비 추가 수주',
        'LNG 운반선 연속 건조 효과로 영업이익 흑자 기조 고착화'
      ],
      supportingEvidence: ['FLNG 글로벌 수주잔고 점유율 1위', '연간 수주 목표 달성률 85% 돌파'],
      counterEvidence: ['높은 부채비율 및 차입금 상환 부담', '해양 프로젝트 특유의 설계 변경 지연 리스크'],
      buyTrigger: '연간 FLNG 1기 이상 추가 계약 체결',
      invalidationCriteria: [{ condition: 'FLNG 계약 취소 발생', isTriggered: false }],
      entryConditions: [{ condition: '분기 영업흑자 지속', isMet: true }],
      shortTermState: AssessmentState.BUY_CONSIDERATION,
      midTermState: AssessmentState.BUY_CONSIDERATION,
      catalysts: [{ title: '북미향 델핀 FLNG 최종투자결정(FID)', date: '2026-11-25', confirmed: false }]
    }
  },
  {
    id: '042660',
    ticker: '042660',
    name: '한화오션',
    market: 'KOSPI',
    primarySector: SectorId.SHIPBUILDING,
    themeTags: ['조선', '방산', '잠수함', '특수선'],
    currentPrice: 32500,
    previousClose: 31800,
    change: 700,
    changePct: 2.20,
    volume: 1420000,
    sharesOutstanding: 306359000,
    marketCap: 9956600000000,
    financials: {
      revenue: 9200000000000,
      operatingIncome: 310000000000,
      netIncome: 220000000000,
      opm: 3.37,
      roe: 5.12,
      debtRatio: 142.1,
      fcf: 380000000000,
      per: 45.2,
      pbr: 2.15,
      dividendYield: 0.0
    },
    valuationMultiples: {
      historicalPer: [55.0, 50.0, 48.0, 45.2, 43.0, 46.5, 49.0, 47.0, 44.0, 45.0, 46.0, 45.2],
      historicalPbr: [1.85, 1.95, 2.05, 2.15, 2.25, 2.35, 2.18, 2.10, 2.08, 2.12, 2.20, 2.15]
    },
    thesis: {
      validUntil: '2026-12-10',
      theses: [
        '미 해군 함정 MRO(유지·보수·정비) 사업 수주 선점 및 필리조선소 인수 시너지',
        '폴란드·캐나다 장보고-III 잠수함 수출 모멘텀'
      ],
      supportingEvidence: ['미 해군 군수지원함 창정비 사업 국내 조선소 최초 수주'],
      counterEvidence: ['상선 부문 적자 수주분 잔여 물량 인도 부담', '밸류에이션 부담(PER 45배)'],
      buyTrigger: '해외 잠수함 수주 우선협상대상자 선정',
      invalidationCriteria: [{ condition: '특수선 해외 수주 실패', isTriggered: false }],
      entryConditions: [{ condition: 'MRO 추가 수주 확보', isMet: true }],
      shortTermState: AssessmentState.HOLD,
      midTermState: AssessmentState.BUY_CONSIDERATION,
      catalysts: [{ title: '미 해군 차기 전투함 MRO 계약 협상', date: '2026-12-05', confirmed: false }]
    }
  },
  {
    id: '329180',
    ticker: '329180',
    name: 'HD현대중공업',
    market: 'KOSPI',
    primarySector: SectorId.SHIPBUILDING,
    themeTags: ['조선', '엔진기계', '방산'],
    currentPrice: 198000,
    previousClose: 193500,
    change: 4500,
    changePct: 2.33,
    volume: 185000,
    sharesOutstanding: 88773116,
    marketCap: 17577000000000,
    financials: {
      revenue: 14500000000000,
      operatingIncome: 920000000000,
      netIncome: 650000000000,
      opm: 6.34,
      roe: 11.20,
      debtRatio: 115.3,
      fcf: 1100000000000,
      per: 27.0,
      pbr: 2.85,
      dividendYield: 1.10
    },
    valuationMultiples: {
      historicalPer: [32.0, 30.0, 28.5, 27.0, 26.0, 28.0, 29.5, 27.8, 26.5, 27.0, 28.2, 27.0],
      historicalPbr: [2.40, 2.55, 2.70, 2.85, 3.00, 3.15, 2.95, 2.80, 2.75, 2.80, 2.90, 2.85]
    },
    thesis: {
      validUntil: '2026-12-31',
      theses: [
        '선박용 힘센엔진 및 대형 디젤엔진 전세계 1위 점유율(엔진 마진 15% 초과)',
        '국내 1등 야드 생산성으로 납기 신뢰도 최고'
      ],
      supportingEvidence: ['친환경 이중연료 엔진 납품가 지속 인상'],
      counterEvidence: ['피어 대비 높은 PBR 밸류에이션'],
      buyTrigger: '분기 OPM 7% 안착',
      invalidationCriteria: [{ condition: '대규모 납기 지연 배상금 발생', isTriggered: false }],
      entryConditions: [{ condition: '엔진 사업부 영업이익률 12% 이상', isMet: true }],
      shortTermState: AssessmentState.BUY_CONSIDERATION,
      midTermState: AssessmentState.BUY_CONSIDERATION,
      catalysts: [{ title: '3분기 IR 기업설명회', date: '2026-11-03', confirmed: true }]
    }
  },

  // ---------------- AI ----------------
  {
    id: '035420',
    ticker: '035420',
    name: 'NAVER',
    market: 'KOSPI',
    primarySector: SectorId.AI,
    themeTags: ['AI', '소버린AI', '클라우드', '플랫폼'],
    currentPrice: 184500,
    previousClose: 182000,
    change: 2500,
    changePct: 1.37,
    volume: 685000,
    sharesOutstanding: 162408164,
    marketCap: 29964300000000, // 30.0조
    financials: {
      revenue: 10650000000000,
      operatingIncome: 1820000000000,
      netIncome: 1350000000000,
      opm: 17.09,
      roe: 8.52,
      debtRatio: 38.5,
      fcf: 1650000000000,
      per: 22.2,
      pbr: 1.15,
      dividendYield: 1.05
    },
    valuationMultiples: {
      historicalPer: [28.0, 26.5, 25.0, 23.5, 22.2, 21.0, 24.5, 25.8, 23.0, 22.5, 23.5, 22.2],
      historicalPbr: [1.45, 1.38, 1.30, 1.22, 1.15, 1.08, 1.25, 1.32, 1.18, 1.16, 1.20, 1.15]
    },
    thesis: {
      validUntil: '2026-12-31',
      theses: [
        '하이퍼클로바X 기반 중동(사우디) 소버린 AI 인프라 수주 실매출화',
        '생성형 AI 검색(Cue:) 도입으로 광고 전환율 및 단가(CPC) 개선',
        '역사적 밴드 최저 PBR 1.15배 수준으로 밸류에이션 하방 확보'
      ],
      supportingEvidence: [
        '사우디 주택부 디지털 트윈 및 AI 플랫폼 1억 달러 규모 매출 반영 개시',
        'AI 기반 타겟팅 광고 매출 2분기 연속 전년비 12% 성장',
        '연간 1.6조원 이상의 안정적 잉여현금흐름(FCF) 창출'
      ],
      counterEvidence: [
        '오픈AI, 구글 등 글로벌 빅테크의 국내 검색 및 AI 시장 침투 가속화',
        '인프라 GPU 확충에 따른 감가상각비 증가 부담'
      ],
      buyTrigger: '클라우드/AI 부문 매출 비중 12% 돌파 및 외인 순매수 전환',
      additionalBuyTrigger: '중동 추가 소버린 AI 대형 계약 공시',
      reduceTrigger: '국내 포털 검색 점유율 50% 붕괴 시',
      sellTrigger: '핵심 AI B2B 사업 성장률 한 자릿수 둔화',
      invalidationCriteria: [
        { condition: '사우디 소버린 AI 계약 파기 또는 이행 지연', isTriggered: false },
        { condition: '국내 포털 검색 점유율 45% 이하 추락', isTriggered: false }
      ],
      entryConditions: [
        { condition: 'PBR 1.3배 이하', isMet: true },
        { condition: '영업이익률 16% 이상 유지', isMet: true },
        { condition: 'AI 관련 B2B 매출 전년비 20% 이상 성장', isMet: true }
      ],
      shortTermState: AssessmentState.BUY_CONSIDERATION,
      midTermState: AssessmentState.BUY_CONSIDERATION,
      catalysts: [
        { title: '단(DAN) 26 개발자 컨퍼런스 AI 신기능 발표', date: '2026-11-14', confirmed: true },
        { title: '사우디 국부펀드(PIF) 합작법인 설립 완료 공시', date: '2026-12-01', confirmed: false }
      ],
      scenarios: {
        bull: { targetPrice: 245000, per: 26.0, eps: 9400, desc: '사우디 AI 수출 확대 + AI 광고 효율 극대화' },
        base: { targetPrice: 210000, per: 23.0, eps: 9130, desc: '광고 회복 및 B2B AI 완만한 성장' },
        bear: { targetPrice: 165000, per: 19.0, eps: 8680, desc: '글로벌 빅테크 검색 점유율 잠식' }
      }
    }
  },
  {
    id: '035720',
    ticker: '035720',
    name: '카카오',
    market: 'KOSPI',
    primarySector: SectorId.AI,
    themeTags: ['AI', '메신저', '카나나'],
    currentPrice: 38900,
    previousClose: 39200,
    change: -300,
    changePct: -0.77,
    volume: 820000,
    sharesOutstanding: 444856000,
    marketCap: 17304900000000,
    financials: {
      revenue: 8120000000000,
      operatingIncome: 510000000000,
      netIncome: 185000000000,
      opm: 6.28,
      roe: 3.12,
      debtRatio: 68.4,
      fcf: 420000000000,
      per: 93.5,
      pbr: 1.45,
      dividendYield: 0.18
    },
    valuationMultiples: {
      historicalPer: [120.0, 110.0, 98.0, 93.5, 88.0, 95.0, 102.0, 96.0, 91.0, 92.5, 95.0, 93.5],
      historicalPbr: [1.85, 1.75, 1.62, 1.50, 1.45, 1.38, 1.55, 1.60, 1.48, 1.44, 1.50, 1.45]
    },
    thesis: {
      validUntil: '2026-11-20',
      theses: [
        '신규 AI 서비스 "카나나(Kanana)" 론칭을 통한 카카오톡 메신저 트래픽 수익화',
        '비핵심 계열사 정리 및 경영 지배구조 쇄신 작업'
      ],
      supportingEvidence: ['온디바이스/그룹 대화 특화 AI 기능 적용 테스트'],
      counterEvidence: ['사법 리스크 지속 및 경영진 불확실성', '순이익 대비 과도한 고PER(93배)'],
      buyTrigger: '카나나 일간 활성 사용자(DAU) 500만명 돌파 및 법적 불확실성 해소',
      invalidationCriteria: [{ condition: '사법 판결로 인한 카카오뱅크 대주주 적격성 상실', isTriggered: false }],
      entryConditions: [{ condition: '영업이익 반등 확인', isMet: false }],
      shortTermState: AssessmentState.PENDING_CONDITIONS,
      midTermState: AssessmentState.HOLD,
      catalysts: [{ title: '카나나 정식 서비스 론칭 및 수익화 모델 공개', date: '2026-11-08', confirmed: true }]
    }
  },
  {
    id: '304100',
    ticker: '304100',
    name: '솔트룩스',
    market: 'KOSDAQ',
    primarySector: SectorId.AI,
    themeTags: ['AI', 'LLM', '생성형AI', '공공AI'],
    currentPrice: 19800,
    previousClose: 20200,
    change: -400,
    changePct: -1.98,
    volume: 340000,
    sharesOutstanding: 12500000,
    marketCap: 247500000000,
    financials: {
      revenue: 38000000000,
      operatingIncome: -4500000000, // 영업적자 (AC-09 적자 PER 예외 처리용)
      netIncome: -5200000000,       // 순손실 (PER 산출 불가 N/A)
      opm: -11.84,
      roe: -8.95,
      debtRatio: 45.2,
      fcf: -3800000000,
      per: null, // 적자로 인한 N/A (PRD FR-04: 이익 <= 0이면 제외하고 PBR 대안 검토)
      pbr: 3.85,
      dividendYield: 0.0
    },
    valuationMultiples: {
      historicalPer: [], // 적자로 인해 PER 표본 없음 (AC-09)
      historicalPbr: [3.2, 3.5, 4.1, 3.85, 4.5, 4.8, 3.9, 3.7, 4.2, 4.0, 3.8, 3.85]
    },
    thesis: {
      validUntil: '2026-10-31', // 만료 임박 케이스 (AC-10 검증용)
      theses: [
        '자체 개발 거대언어모델(루시아, Luxia) 공공/금융 기관 레퍼런스 확보',
        '온디바이스 하드웨어 탑재 AI 가속 플랫폼'
      ],
      supportingEvidence: ['정부 AI 바우처 및 행정망 AI 어시스턴트 구축 사업 참여'],
      counterEvidence: ['연속 영업적자 및 연구개발비 현금 소진', '빅테크 LLM API 가격 인하 경쟁 치열'],
      buyTrigger: '분기 영업이익 흑자 전환 달성',
      invalidationCriteria: [{ condition: '추가 유상증자 발행', isTriggered: false }],
      entryConditions: [{ condition: '영업이익 흑자전환', isMet: false }],
      shortTermState: AssessmentState.PENDING_CONDITIONS,
      midTermState: AssessmentState.REDUCE_CONSIDERATION,
      catalysts: [{ title: '루시아 2.0 모델 성능 벤치마크 공개', date: '2026-10-25', confirmed: true }]
    }
  },
  {
    id: '377480',
    ticker: '377480',
    name: '마음AI',
    market: 'KOSDAQ',
    primarySector: SectorId.AI,
    themeTags: ['AI', '피지컬AI', '음성인식', '로봇AI'],
    currentPrice: 16200,
    previousClose: 16500,
    change: -300,
    changePct: -1.82,
    volume: 180000,
    sharesOutstanding: 6850000,
    marketCap: 110970000000,
    financials: {
      revenue: 16500000000,
      operatingIncome: -3200000000, // 적자
      netIncome: -3800000000,
      opm: -19.39,
      roe: -12.4,
      debtRatio: 52.8,
      fcf: -2900000000,
      per: null, // N/A
      pbr: 3.12,
      dividendYield: 0.0
    },
    valuationMultiples: {
      historicalPer: [], // 적자 제외
      historicalPbr: [2.8, 3.0, 3.4, 3.12, 3.6, 3.8] // 표본 6개: 12개 미만 표본부족
    },
    thesis: {
      validUntil: '2026-09-30', // 유효기간 만료 케이스! (AC-10 테스트용: valid_until 경과)
      theses: [
        '자율주행 및 로봇용 비디오 파운데이션 모델 "워브(WoRV)" 출시',
        '스마트 홈 및 무인 키오스크 AI 휴먼 납품 확대'
      ],
      supportingEvidence: ['국내 완성차 부품사향 자율주행 데이터 학습 협약'],
      counterEvidence: ['재무 건전성 우려 및 매출 성장 정체'],
      buyTrigger: '로봇용 파운데이션 모델 양산 적용 계약 체결',
      invalidationCriteria: [{ condition: '핵심 개발 연구인력 이탈', isTriggered: false }],
      entryConditions: [{ condition: '매출 100% 성장', isMet: false }],
      shortTermState: AssessmentState.SUSPENDED_JUDGMENT,
      midTermState: AssessmentState.SUSPENDED_JUDGMENT,
      catalysts: [{ title: '2026 AI 로보틱스 엑스포 참가', date: '2026-10-24', confirmed: true }]
    }
  },

  // ---------------- 반도체 ----------------
  {
    id: '005930',
    ticker: '005930',
    name: '삼성전자',
    market: 'KOSPI',
    primarySector: SectorId.SEMICONDUCTOR,
    themeTags: ['반도체', 'AI', 'DRAM', '파운드리', '스마트폰'], // 복수 테마 (FR-09)
    currentPrice: 71800,
    previousClose: 70800,
    change: 1000,
    changePct: 1.41,
    volume: 14250000,
    sharesOutstanding: 5969782550,
    marketCap: 428630000000000, // 428.6조
    financials: {
      revenue: 305200000000000, // 305조
      operatingIncome: 36200000000000, // 36.2조
      netIncome: 29500000000000, // 29.5조
      opm: 11.86,
      roe: 8.95,
      debtRatio: 26.8,
      fcf: 18500000000000,
      per: 14.5,
      pbr: 1.18,
      dividendYield: 2.15
    },
    valuationMultiples: {
      historicalPer: [12.0, 13.5, 15.2, 16.0, 14.5, 13.8, 15.5, 16.8, 14.2, 13.6, 14.8, 14.5],
      historicalPbr: [1.10, 1.15, 1.25, 1.35, 1.18, 1.12, 1.28, 1.38, 1.22, 1.16, 1.24, 1.18]
    },
    thesis: {
      validUntil: '2026-12-31',
      theses: [
        '엔비디아 5세대 HBM(HBM3E 8단/12단) 품질 퀄테스트 최종 통과 및 본격 납품 개시',
        '범용 DRAM(DDR5) 및 고용량 eSSD(엔터프라이즈 SSD) 가격 상승 사이클 지속',
        '역사적 PBR 밴드 1.18배(하단 1.1배 근접)로 과도한 디스카운트 해소 국면 진입'
      ],
      supportingEvidence: [
        '엔비디아 차세대 아키텍처향 공급 승인 공식 통보 (출처: 업계 IR)',
        'DDR5 16Gb 고정거래가 전분기비 6.2% 상승 및 서버용 수요 견조',
        '파운드리 2나노 GAA 수율 65% 달성 및 주요 테크 기업 테스트 칩 제작'
      ],
      counterEvidence: [
        '중국 창신메모리(CXMT) 등 레거시 DRAM 저가 공급 경쟁 심화',
        '파운드리 대규모 감가상각비 부담 및 빅테크 칩 수주 지연'
      ],
      buyTrigger: 'HBM3E 12단 정식 출하 확인 및 60일 이동평균선(73,500원) 돌파',
      additionalBuyTrigger: '글로벌 테크사 2나노 파운드리 양산 계약 체결',
      reduceTrigger: 'PBR 1.6배 도달 또는 메모리 고정가 하락 반전',
      sellTrigger: 'HBM 수율 결함 발생 또는 스마트폰/PC 출하량 역성장 확대',
      invalidationCriteria: [
        { condition: 'HBM3E 납품 취소 또는 중대 결함 발생', isTriggered: false },
        { condition: 'DRAM 고정거래가격 전월비 10% 이상 폭락', isTriggered: false }
      ],
      entryConditions: [
        { condition: 'PBR 1.3배 이하', isMet: true },
        { condition: 'HBM3E 공급 개시 확인', isMet: true },
        { condition: 'DRAM 고정가 상승 유지', isMet: true }
      ],
      shortTermState: AssessmentState.BUY_CONSIDERATION,
      midTermState: AssessmentState.BUY_CONSIDERATION,
      catalysts: [
        { title: '3분기 확정 실적 발표 및 메모리 사업부 컨퍼런스콜', date: '2026-10-31', confirmed: true },
        { title: '글로벌 테크 컨퍼런스 HBM4 로드맵 공개', date: '2026-11-18', confirmed: false }
      ],
      scenarios: {
        bull: { targetPrice: 92000, per: 18.0, eps: 5110, desc: 'HBM 점유율 급상승 + 파운드리 대형 고객사 확보' },
        base: { targetPrice: 82000, per: 16.0, eps: 5110, desc: 'HBM 공급 정상화 및 메모리 사이클 회복' },
        bear: { targetPrice: 65000, per: 13.0, eps: 5000, desc: '파운드리 적자 지속 및 레거시 경쟁 심화' }
      }
    }
  },
  {
    id: '000660',
    ticker: '000660',
    name: 'SK하이닉스',
    market: 'KOSPI',
    primarySector: SectorId.SEMICONDUCTOR,
    themeTags: ['반도체', 'AI', 'HBM', '메모리'], // 복수 테마
    currentPrice: 192000,
    previousClose: 187500,
    change: 4500,
    changePct: 2.40,
    volume: 3850000,
    sharesOutstanding: 728002365,
    marketCap: 139776000000000, // 139.7조
    financials: {
      revenue: 65800000000000,
      operatingIncome: 21500000000000, // 21.5조 (OPM 32.7%)
      netIncome: 16800000000000,
      opm: 32.67,
      roe: 28.5,
      debtRatio: 48.2,
      fcf: 12400000000000,
      per: 8.3,
      pbr: 1.82,
      dividendYield: 1.25
    },
    valuationMultiples: {
      historicalPer: [7.5, 8.0, 8.8, 9.5, 8.3, 7.8, 9.2, 10.5, 8.9, 8.2, 8.6, 8.3],
      historicalPbr: [1.35, 1.48, 1.65, 1.80, 1.82, 1.70, 1.95, 2.10, 1.85, 1.76, 1.84, 1.82]
    },
    thesis: {
      validUntil: '2026-12-31',
      theses: [
        '엔비디아 메인 공급사로서 HBM3E 12단 양산 독점적 점유율 유지',
        '영업이익률 30%를 상회하는 압도적 수익성과 TSMC와의 HBM4 원팀 파트너십',
        '2026년 연간 순이익 사상 최대치 갱신에 따른 저PER(8.3배) 리레이팅'
      ],
      supportingEvidence: [
        'HBM3E 12단 전량 완판 및 2026년 생산 물량 선주문 계약 완료',
        'MR-MUF 패키징 기술력 바탕으로 수율 80% 이상 독보적 유지',
        '영업이익 21.5조원 전망으로 역사적 최대 실적 달성 확실시'
      ],
      counterEvidence: [
        '경쟁사의 HBM3E 공급 진입 시 점유율 하락 및 판가 인하 압력',
        'HBM 설비투자(CAPEX) 급증에 따른 감가상각비 증가 리스크'
      ],
      buyTrigger: 'HBM4 샘플 출하 및 분기 OPM 33% 상회',
      additionalBuyTrigger: '차세대 빅테크(빅3) 신규 맞춤형 HBM 수주 체결',
      reduceTrigger: 'HBM 점유율 50% 미만으로 하락하거나 PER 12배 도달 시',
      sellTrigger: 'HBM 공급 과잉 전환 신호 발생 (고객사 재고 축적)',
      invalidationCriteria: [
        { condition: 'MR-MUF 공정 중대 결함 또는 엔비디아 공급 물량 30% 이상 축소', isTriggered: false },
        { condition: 'HBM 판가 20% 이상 급락', isTriggered: false }
      ],
      entryConditions: [
        { condition: 'HBM 글로벌 점유율 50% 이상 유지', isMet: true },
        { condition: '분기 OPM 30% 이상', isMet: true },
        { condition: 'PER 10배 이하', isMet: true }
      ],
      shortTermState: AssessmentState.BUY_CONSIDERATION,
      midTermState: AssessmentState.BUY_CONSIDERATION,
      catalysts: [
        { title: '3분기 어닝 서프라이즈 실적 발표', date: '2026-10-24', confirmed: true },
        { title: '용인 반도체 클러스터 1기 팹 착공식', date: '2026-11-28', confirmed: false }
      ],
      scenarios: {
        bull: { targetPrice: 250000, per: 11.0, eps: 23070, desc: 'HBM 독점 지속 + HBM4 TSMC 협력 선점' },
        base: { targetPrice: 220000, per: 9.5, eps: 23070, desc: 'HBM3E 견고한 출하 및 OPM 30% 방어' },
        bear: { targetPrice: 160000, per: 7.0, eps: 22800, desc: '경쟁사 진입으로 점유율 분할 및 마진 축소' }
      }
    }
  },
  {
    id: '042700',
    ticker: '042700',
    name: '한미반도체',
    market: 'KOSPI',
    primarySector: SectorId.SEMICONDUCTOR,
    themeTags: ['반도체', 'AI', 'HBM장비', 'TC본더'],
    currentPrice: 115000,
    previousClose: 112000,
    change: 3000,
    changePct: 2.68,
    volume: 1250000,
    sharesOutstanding: 97500000,
    marketCap: 11212500000000,
    financials: {
      revenue: 620000000000,
      operatingIncome: 245000000000,
      netIncome: 195000000000,
      opm: 39.52,
      roe: 35.8,
      debtRatio: 18.5,
      fcf: 180000000000,
      per: 57.5,
      pbr: 18.2,
      dividendYield: 0.85
    },
    valuationMultiples: {
      historicalPer: [65.0, 60.0, 58.0, 57.5, 52.0, 55.0, 62.0, 64.0, 56.0, 54.0, 58.0, 57.5],
      historicalPbr: [21.0, 19.5, 18.8, 18.2, 16.5, 17.5, 19.8, 20.5, 18.0, 17.2, 18.5, 18.2]
    },
    thesis: {
      validUntil: '2026-12-15',
      theses: [
        '듀얼 TC 본더(Dual TC Bonder) 글로벌 HBM 제조사 필수 장비 지위 확고',
        '마이크론 및 해외 파운드리향 추가 수주 파이프라인 확장',
        '영업이익률 약 40%에 달하는 독점적 마진 구조'
      ],
      supportingEvidence: ['글로벌 반도체 기업향 1,500억원 이상 단일 공급계약 잇달아 공시'],
      counterEvidence: ['고PER(57배) 및 고PBR(18배)로 인한 높은 주가 변동성', '차세대 하이브리드 본딩 도입 시 TC본더 대체 우려'],
      buyTrigger: '해외 신규 반도체 고객사향 대규모 수주 공시',
      invalidationCriteria: [{ condition: '핵심 고객사 이탈 또는 특허 분쟁 패소', isTriggered: false }],
      entryConditions: [{ condition: '수주잔고 5,000억원 이상', isMet: true }],
      shortTermState: AssessmentState.BUY_CONSIDERATION,
      midTermState: AssessmentState.HOLD,
      catalysts: [{ title: '마일드 하이브리드 본더 신제품 시연회', date: '2026-11-22', confirmed: false }]
    }
  },
  {
    id: '058470',
    ticker: '058470',
    name: '리노공업',
    market: 'KOSDAQ',
    primarySector: SectorId.SEMICONDUCTOR,
    themeTags: ['반도체', '소켓', '테스트핀', '온디바이스AI'],
    currentPrice: 195000,
    previousClose: 196500,
    change: -1500,
    changePct: -0.76,
    volume: 95000,
    sharesOutstanding: 15242145,
    marketCap: 2972200000000,
    financials: {
      revenue: 335000000000,
      operatingIncome: 148000000000,
      netIncome: 125000000000,
      opm: 44.18,
      roe: 24.5,
      debtRatio: 12.1,
      fcf: 115000000000,
      per: 23.8,
      pbr: 5.40,
      dividendYield: 1.55
    },
    valuationMultiples: {
      historicalPer: [26.0, 25.2, 24.5, 23.8, 22.5, 24.0, 25.8, 26.5, 23.5, 22.8, 24.2, 23.8],
      historicalPbr: [5.8, 5.6, 5.5, 5.40, 5.1, 5.5, 5.9, 6.1, 5.3, 5.2, 5.5, 5.40]
    },
    thesis: {
      validUntil: '2026-12-31',
      theses: [
        '온디바이스 AI AP(애플리케이션 프로세서) 칩 R&D 테스트 소켓 독점적 납품',
        '무차입 경영 및 영업이익률 44%에 달하는 현금 창출력'
      ],
      supportingEvidence: ['퀄컴, 애플 등 빅테크 AP 연구개발 수요 증가'],
      counterEvidence: ['글로벌 스마트폰 출하량 성장 둔화 시 테스트 물량 감소'],
      buyTrigger: '3나노 이하 칩 테스트 소켓 단가 인상',
      invalidationCriteria: [{ condition: '주요 팹리스 고객사 거래선 교체', isTriggered: false }],
      entryConditions: [{ condition: 'OPM 40% 이상 유지', isMet: true }],
      shortTermState: AssessmentState.BUY_CONSIDERATION,
      midTermState: AssessmentState.BUY_CONSIDERATION,
      catalysts: [{ title: '차세대 온디바이스 AP용 리노핀 출시', date: '2026-11-10', confirmed: true }]
    }
  }
];

// 종목별 60일 캔들(OHLCV) 시계열 생성 함수 (현실감 있는 주가 변동성 반영)
export function generateCandleHistory(basePrice, days = 60, seed = 1) {
  const candles = [];
  let price = basePrice * 0.88; // 60일 전 가격
  const now = new Date('2026-10-20T14:30:00+09:00');

  for (let i = days; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    // 주말 제외
    if (d.getDay() === 0 || d.getDay() === 6) continue;

    // 변동률 시뮬레이션
    const randomFactor = Math.sin((i + seed) * 0.4) * 0.02 + ((i % 5 === 0) ? 0.015 : -0.005);
    const open = Math.round(price);
    const close = Math.round(i === 0 ? basePrice : open * (1 + randomFactor));
    const high = Math.round(Math.max(open, close) * (1 + Math.abs(Math.sin(i)) * 0.012));
    const low = Math.round(Math.min(open, close) * (1 - Math.abs(Math.cos(i)) * 0.012));
    const volume = Math.round(150000 + Math.abs(Math.sin(i * 1.5)) * 800000);

    candles.push({
      date: d.toISOString().slice(0, 10),
      open,
      high,
      low,
      close,
      volume
    });

    price = close;
  }
  return candles;
}

// 초기 기본 보유 종목 세트 (AC-03 검증 및 즉각 체험 가능)
export const DEFAULT_INITIAL_HOLDINGS = [
  {
    id: 'h_demo_01',
    accountAlias: '위탁기본계좌',
    market: 'KOSPI',
    ticker: '005930',
    name: '삼성전자',
    quantity: 100,
    averageCost: 68500,
    currency: 'KRW',
    purchaseDate: '2026-05-15',
    horizon: '중기',
    targetWeightPct: 25,
    maxLossAmount: 500000,
    memo: 'HBM3E 퀄 통과 및 밸류에이션 저점 분할매수'
  },
  {
    id: 'h_demo_02',
    accountAlias: '위탁기본계좌',
    market: 'KOSPI',
    ticker: '000660',
    name: 'SK하이닉스',
    quantity: 50,
    averageCost: 172000,
    currency: 'KRW',
    purchaseDate: '2026-06-10',
    horizon: '중기',
    targetWeightPct: 25,
    maxLossAmount: 800000,
    memo: 'HBM 독점적 수익성 및 OPM 30% 프리미엄'
  },
  {
    id: 'h_demo_03',
    accountAlias: '성장포트계좌',
    market: 'KOSPI',
    ticker: '009540',
    name: 'HD한국조선해양',
    quantity: 40,
    averageCost: 158000,
    currency: 'KRW',
    purchaseDate: '2026-07-02',
    horizon: '중기',
    targetWeightPct: 20,
    maxLossAmount: 600000,
    memo: '신조선가지수 최고치 및 고선가 카타르 LNG 인도 개시'
  },
  {
    id: 'h_demo_04',
    accountAlias: '성장포트계좌',
    market: 'KOSPI',
    ticker: '005490',
    name: 'POSCO홀딩스',
    quantity: 20,
    averageCost: 375000,
    currency: 'KRW',
    purchaseDate: '2026-08-14',
    horizon: '단기',
    targetWeightPct: 15,
    maxLossAmount: 400000,
    memo: '중국 감산 공시 및 리튬 1단계 준공 모멘텀'
  },
  {
    id: 'h_demo_05',
    accountAlias: '위탁기본계좌',
    market: 'KOSPI',
    ticker: '035420',
    name: 'NAVER',
    quantity: 30,
    averageCost: 179000,
    currency: 'KRW',
    purchaseDate: '2026-09-01',
    horizon: '중기',
    targetWeightPct: 15,
    maxLossAmount: 350000,
    memo: '사우디 소버린 AI 인프라 수주 실매출 전환 기대'
  }
];

export const DEFAULT_INITIAL_CASH = {
  KRW: 25000000 // 현금 2,500만원
};
