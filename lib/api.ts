import { CompanyFinancialData, CompanySearchResult } from './types'

// 日本の企業財務データを取得するためのAPI関数
// 注: 実際のAPIエンドポイントは適時開示情報サービスやEDINET APIなどを使用します

// モックデータ（デモ用）
const mockCompanyData: { [key: string]: CompanyFinancialData } = {
  '7203': {
    companyCode: '7203',
    companyName: 'トヨタ自動車株式会社',
    exchange: '東証プライム',
    sector: '輸送用機器',
    fiscalYearEnd: '2024-03',
    revenue: 45095000,
    operatingIncome: 5352000,
    netIncome: 4947000,
    ebitda: 7500000,
    totalAssets: 87572000,
    shareholdersEquity: 33531000,
    totalLiabilities: 54041000,
    cashAndCashEquivalents: 9982000,
    operatingCashFlow: 7727000,
    investingCashFlow: -4642000,
    financingCashFlow: -2106000,
    freeCashFlow: 3085000,
    sharesOutstanding: 13951,
    stockPrice: 2800,
    marketCap: 39062800,
    roe: 14.76,
    roa: 5.65,
    per: 7.89,
    pbr: 1.17,
    dividendYield: 2.5,
    historicalData: [
      { year: 2021, revenue: 37154000, netIncome: 2850000, operatingCashFlow: 5175000, freeCashFlow: 1800000 },
      { year: 2022, revenue: 39379000, netIncome: 2995000, operatingCashFlow: 5654000, freeCashFlow: 2100000 },
      { year: 2023, revenue: 42382000, netIncome: 4450000, operatingCashFlow: 6892000, freeCashFlow: 2750000 },
      { year: 2024, revenue: 45095000, netIncome: 4947000, operatingCashFlow: 7727000, freeCashFlow: 3085000 },
    ]
  },
  '6758': {
    companyCode: '6758',
    companyName: 'ソニーグループ株式会社',
    exchange: '東証プライム',
    sector: '電気機器',
    fiscalYearEnd: '2024-03',
    revenue: 13011000,
    operatingIncome: 1290000,
    netIncome: 970000,
    ebitda: 1800000,
    totalAssets: 32806000,
    shareholdersEquity: 7710000,
    totalLiabilities: 25096000,
    cashAndCashEquivalents: 2479000,
    operatingCashFlow: 1640000,
    investingCashFlow: -1200000,
    financingCashFlow: -350000,
    freeCashFlow: 440000,
    sharesOutstanding: 1240,
    stockPrice: 3150,
    marketCap: 3906000,
    roe: 12.58,
    roa: 2.96,
    per: 13.8,
    pbr: 1.74,
    dividendYield: 1.1,
    historicalData: [
      { year: 2021, revenue: 10999000, netIncome: 1172000, operatingCashFlow: 1338000, freeCashFlow: 300000 },
      { year: 2022, revenue: 11539000, netIncome: 937000, operatingCashFlow: 1486000, freeCashFlow: 350000 },
      { year: 2023, revenue: 12489000, netIncome: 1050000, operatingCashFlow: 1563000, freeCashFlow: 400000 },
      { year: 2024, revenue: 13011000, netIncome: 970000, operatingCashFlow: 1640000, freeCashFlow: 440000 },
    ]
  },
  '9984': {
    companyCode: '9984',
    companyName: 'ソフトバンクグループ株式会社',
    exchange: '東証プライム',
    sector: '情報・通信',
    fiscalYearEnd: '2024-03',
    revenue: 6757000,
    operatingIncome: 476000,
    netIncome: -227000,
    ebitda: 1200000,
    totalAssets: 45879000,
    shareholdersEquity: 12896000,
    totalLiabilities: 32983000,
    cashAndCashEquivalents: 6259000,
    operatingCashFlow: 2251000,
    investingCashFlow: -1800000,
    financingCashFlow: -450000,
    freeCashFlow: 451000,
    sharesOutstanding: 1463,
    stockPrice: 8900,
    marketCap: 13020700,
    roe: -1.76,
    roa: -0.49,
    per: -57.4,
    pbr: 1.01,
    dividendYield: 0.5,
    historicalData: [
      { year: 2021, revenue: 5628000, netIncome: 4988000, operatingCashFlow: 2147000, freeCashFlow: 400000 },
      { year: 2022, revenue: 6221000, netIncome: -1708000, operatingCashFlow: 2167000, freeCashFlow: 420000 },
      { year: 2023, revenue: 6570000, netIncome: -912000, operatingCashFlow: 2209000, freeCashFlow: 435000 },
      { year: 2024, revenue: 6757000, netIncome: -227000, operatingCashFlow: 2251000, freeCashFlow: 451000 },
    ]
  }
}

// 企業を検索
export async function searchCompany(query: string): Promise<CompanySearchResult[]> {
  try {
    // EDINET APIで検索
    const response = await fetch(`/api/edinet/search?q=${encodeURIComponent(query)}`)
    if (response.ok) {
      const data = await response.json()
      if (data.success && data.documents.length > 0) {
        return data.documents.map((doc: any) => ({
          code: doc.secCode || doc.edinetCode,
          name: doc.filerName,
          exchange: '取引所未特定',
          sector: '業種未特定'
        }))
      }
    }
  } catch (error) {
    console.error('EDINET検索エラー:', error)
  }
  
  // フォールバック: モックデータから検索
  const results: CompanySearchResult[] = []
  for (const [code, data] of Object.entries(mockCompanyData)) {
    if (code.includes(query) || data.companyName.includes(query)) {
      results.push({
        code: code,
        name: data.companyName,
        exchange: data.exchange,
        sector: data.sector
      })
    }
  }
  
  return results
}

// 企業の財務データを取得
export async function getCompanyFinancialData(companyCode: string): Promise<CompanyFinancialData | null> {
  try {
    // EDINET APIで企業データを取得
    const response = await fetch(`/api/edinet/company/${companyCode}`)
    if (response.ok) {
      const data = await response.json()
      if (data.success && data.company) {
        const company = data.company
        const financial = company.financialData || {}
        
        // EDINETデータをCompanyFinancialData形式に変換
        const result: CompanyFinancialData = {
          companyCode: company.companyCode,
          companyName: company.companyName,
          exchange: '取引所未特定',
          sector: '業種未特定',
          fiscalYearEnd: financial.fiscalYearEnd || company.latestDocument?.periodEnd || '',
          
          // 損益計算書
          revenue: financial.revenue || 0,
          operatingIncome: financial.operatingIncome || 0,
          netIncome: financial.netIncome || 0,
          ebitda: financial.ebitda || (financial.operatingIncome || 0) * 1.3, // 概算
          
          // 貸借対照表
          totalAssets: financial.totalAssets || 0,
          shareholdersEquity: financial.shareholdersEquity || 0,
          totalLiabilities: financial.totalLiabilities || 0,
          cashAndCashEquivalents: financial.cashAndCashEquivalents || 0,
          
          // キャッシュフロー
          operatingCashFlow: financial.operatingCashFlow || 0,
          investingCashFlow: financial.investingCashFlow || 0,
          financingCashFlow: financial.financingCashFlow || 0,
          freeCashFlow: (financial.operatingCashFlow || 0) + (financial.investingCashFlow || 0),
          
          // 株式情報（概算値）
          sharesOutstanding: 1000, // 仮値
          stockPrice: 1000, // 仮値
          marketCap: 1000000, // 仮値
          
          // 財務指標（計算）
          roe: financial.shareholdersEquity ? (financial.netIncome / financial.shareholdersEquity * 100) : 0,
          roa: financial.totalAssets ? (financial.netIncome / financial.totalAssets * 100) : 0,
          per: 0, // 株価データが必要
          pbr: 0, // 株価データが必要
          dividendYield: 0 // データなし
        }
        
        return result
      }
    }
  } catch (error) {
    console.error('EDINET企業データ取得エラー:', error)
  }
  
  // フォールバック: モックデータ
  return mockCompanyData[companyCode] || null
}

// リアルタイムの株価を取得（実際にはWebSocketやpollingを使用）
export async function getCurrentStockPrice(companyCode: string): Promise<number | null> {
  const data = mockCompanyData[companyCode]
  if (!data) return null
  
  // 実際のAPIではリアルタイム株価を取得
  // デモ用にランダムな変動を加える
  const variation = 0.98 + Math.random() * 0.04 // ±2%の変動
  return Math.round(data.stockPrice * variation)
}

// 業界平均データを取得
export async function getIndustryAverages(sector: string): Promise<{
  avgPER: number
  avgPBR: number
  avgROE: number
  avgROA: number
  avgEVEBITDA: number
} | null> {
  // 実際のAPIでは業界平均を取得
  // デモ用の固定値
  const sectorAverages: { [key: string]: any } = {
    '輸送用機器': { avgPER: 12.5, avgPBR: 1.1, avgROE: 8.5, avgROA: 3.2, avgEVEBITDA: 8.0 },
    '電気機器': { avgPER: 18.2, avgPBR: 2.1, avgROE: 12.3, avgROA: 5.5, avgEVEBITDA: 10.5 },
    '情報・通信': { avgPER: 25.5, avgPBR: 3.2, avgROE: 15.2, avgROA: 7.1, avgEVEBITDA: 15.2 },
  }
  
  return sectorAverages[sector] || null
}