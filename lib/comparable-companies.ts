// 類似企業データベース
export interface ComparableCompany {
  code: string
  name: string
  sector: string
  marketCap: number // 億円
  revenue: number // 億円
  netIncome: number // 億円
  ebitda: number // 億円
  totalAssets: number // 億円
  shareholdersEquity: number // 億円
  stockPrice: number
  sharesOutstanding: number // 百万株
  
  // 計算済みマルチプル
  per: number
  pbr: number
  evEbitda: number
  psr: number // Price to Sales Ratio
}

// 業界別類似企業データ
export const comparableCompaniesDB: { [sector: string]: ComparableCompany[] } = {
  '輸送用機器': [
    {
      code: '7203',
      name: 'トヨタ自動車',
      sector: '輸送用機器',
      marketCap: 39062800,
      revenue: 450950,
      netIncome: 49470,
      ebitda: 75000,
      totalAssets: 875720,
      shareholdersEquity: 335310,
      stockPrice: 2800,
      sharesOutstanding: 13951,
      per: 7.9,
      pbr: 1.17,
      evEbitda: 8.2,
      psr: 0.87
    },
    {
      code: '7267',
      name: 'ホンダ',
      sector: '輸送用機器',
      marketCap: 8500000,
      revenue: 205000,
      netIncome: 11500,
      ebitda: 18000,
      totalAssets: 235000,
      shareholdersEquity: 85000,
      stockPrice: 1200,
      sharesOutstanding: 7083,
      per: 12.5,
      pbr: 1.0,
      evEbitda: 9.5,
      psr: 0.92
    },
    {
      code: '7201',
      name: '日産自動車',
      sector: '輸送用機器',
      marketCap: 1800000,
      revenue: 125000,
      netIncome: 2800,
      ebitda: 8500,
      totalAssets: 180000,
      shareholdersEquity: 45000,
      stockPrice: 450,
      sharesOutstanding: 4000,
      per: 15.2,
      pbr: 0.8,
      evEbitda: 12.0,
      psr: 0.72
    },
    {
      code: '7270',
      name: 'SUBARU',
      sector: '輸送用機器',
      marketCap: 2800000,
      revenue: 38000,
      netIncome: 3200,
      ebitda: 4800,
      totalAssets: 42000,
      shareholdersEquity: 18500,
      stockPrice: 3600,
      sharesOutstanding: 778,
      per: 11.7,
      pbr: 1.5,
      evEbitda: 10.8,
      psr: 1.47
    }
  ],
  
  '電気機器': [
    {
      code: '6758',
      name: 'ソニーグループ',
      sector: '電気機器',
      marketCap: 3906000,
      revenue: 130110,
      netIncome: 9700,
      ebitda: 18000,
      totalAssets: 328060,
      shareholdersEquity: 77100,
      stockPrice: 3150,
      sharesOutstanding: 1240,
      per: 13.8,
      pbr: 1.74,
      evEbitda: 10.5,
      psr: 1.0
    },
    {
      code: '6752',
      name: 'パナソニック ホールディングス',
      sector: '電気機器',
      marketCap: 1950000,
      revenue: 85000,
      netIncome: 3800,
      ebitda: 8500,
      totalAssets: 95000,
      shareholdersEquity: 32000,
      stockPrice: 820,
      sharesOutstanding: 2378,
      per: 18.5,
      pbr: 1.9,
      evEbitda: 12.2,
      psr: 0.96
    },
    {
      code: '6503',
      name: '三菱電機',
      sector: '電気機器',
      marketCap: 3200000,
      revenue: 51500,
      netIncome: 2900,
      ebitda: 5200,
      totalAssets: 48000,
      shareholdersEquity: 22500,
      stockPrice: 1500,
      sharesOutstanding: 2133,
      per: 20.1,
      pbr: 2.1,
      evEbitda: 15.8,
      psr: 1.24
    },
    {
      code: '6701',
      name: '日本電気',
      sector: '電気機器',
      marketCap: 850000,
      revenue: 32000,
      netIncome: 1200,
      ebitda: 2800,
      totalAssets: 28000,
      shareholdersEquity: 12000,
      stockPrice: 3300,
      sharesOutstanding: 258,
      per: 24.2,
      pbr: 2.5,
      evEbitda: 18.5,
      psr: 1.1
    }
  ],

  '情報・通信': [
    {
      code: '9984',
      name: 'ソフトバンクグループ',
      sector: '情報・通信',
      marketCap: 13020700,
      revenue: 67570,
      netIncome: -2270,
      ebitda: 12000,
      totalAssets: 458790,
      shareholdersEquity: 128960,
      stockPrice: 8900,
      sharesOutstanding: 1463,
      per: -57.4,
      pbr: 1.01,
      evEbitda: 15.2,
      psr: 1.93
    },
    {
      code: '9433',
      name: 'KDDI',
      sector: '情報・通信',
      marketCap: 7800000,
      revenue: 56000,
      netIncome: 6800,
      ebitda: 18500,
      totalAssets: 72000,
      shareholdersEquity: 41000,
      stockPrice: 3600,
      sharesOutstanding: 2167,
      per: 12.8,
      pbr: 1.9,
      evEbitda: 8.5,
      psr: 1.39
    },
    {
      code: '9432',
      name: '日本電信電話',
      sector: '情報・通信',
      marketCap: 16800000,
      revenue: 128000,
      netIncome: 9200,
      ebitda: 32000,
      totalAssets: 185000,
      shareholdersEquity: 95000,
      stockPrice: 120,
      sharesOutstanding: 140000,
      per: 20.5,
      pbr: 1.77,
      evEbitda: 10.2,
      psr: 1.31
    },
    {
      code: '4751',
      name: 'サイバーエージェント',
      sector: '情報・通信',
      marketCap: 1200000,
      revenue: 7500,
      netIncome: 850,
      ebitda: 1800,
      totalAssets: 8500,
      shareholdersEquity: 4200,
      stockPrice: 2750,
      sharesOutstanding: 436,
      per: 32.5,
      pbr: 6.8,
      evEbitda: 25.0,
      psr: 4.0
    }
  ]
}

// 類似企業を取得
export function getComparableCompanies(sector: string): ComparableCompany[] {
  return comparableCompaniesDB[sector] || []
}

// 業界平均マルチプルを計算
export function calculateSectorAverages(companies: ComparableCompany[]): {
  avgPER: number
  avgPBR: number
  avgEVEBITDA: number
  avgPSR: number
  medianPER: number
  medianPBR: number
  medianEVEBITDA: number
  medianPSR: number
  count: number
} {
  if (companies.length === 0) {
    return {
      avgPER: 0, avgPBR: 0, avgEVEBITDA: 0, avgPSR: 0,
      medianPER: 0, medianPBR: 0, medianEVEBITDA: 0, medianPSR: 0,
      count: 0
    }
  }

  // 異常値（PERが負やあまりにも高い値）を除外
  const validCompanies = companies.filter(c => 
    c.per > 0 && c.per < 100 && 
    c.pbr > 0 && c.pbr < 10 &&
    c.evEbitda > 0 && c.evEbitda < 50
  )

  const pers = validCompanies.map(c => c.per).sort((a, b) => a - b)
  const pbrs = validCompanies.map(c => c.pbr).sort((a, b) => a - b)
  const evEbitdas = validCompanies.map(c => c.evEbitda).sort((a, b) => a - b)
  const psrs = validCompanies.map(c => c.psr).sort((a, b) => a - b)

  const getMedian = (arr: number[]) => {
    const mid = Math.floor(arr.length / 2)
    return arr.length % 2 === 0 ? (arr[mid - 1] + arr[mid]) / 2 : arr[mid]
  }

  const getAverage = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length

  return {
    avgPER: getAverage(pers),
    avgPBR: getAverage(pbrs),
    avgEVEBITDA: getAverage(evEbitdas),
    avgPSR: getAverage(psrs),
    medianPER: getMedian(pers),
    medianPBR: getMedian(pbrs),
    medianEVEBITDA: getMedian(evEbitdas),
    medianPSR: getMedian(psrs),
    count: validCompanies.length
  }
}