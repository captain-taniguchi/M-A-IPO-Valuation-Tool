import { CompanyFinancialData, CompanySearchResult } from './types'

// APIレスポンスのキャッシュ
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5分間キャッシュ

// キャッシュヘルパー
function getCachedData(key: string): any | null {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }
  cache.delete(key)
  return null
}

function setCachedData(key: string, data: any): void {
  cache.set(key, { data, timestamp: Date.now() })
}

// タイムアウト付きfetch
async function fetchWithTimeout(url: string, timeout: number = 5000): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)
  
  try {
    const response = await fetch(url, { 
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}

// 高速化された企業検索
export async function searchCompanyFast(query: string): Promise<CompanySearchResult[]> {
  const cacheKey = `search_${query}`
  const cached = getCachedData(cacheKey)
  if (cached) {
    console.log('キャッシュからデータを取得:', query)
    return cached
  }

  try {
    // まずローカルのモックデータから即座に検索
    const mockResults = await searchFromMockData(query)
    if (mockResults.length > 0) {
      setCachedData(cacheKey, mockResults)
      return mockResults
    }

    // モックデータにない場合のみEDINET検索（非同期、タイムアウト短縮）
    console.log('EDINET検索開始:', query)
    const response = await fetchWithTimeout(`/api/edinet/search?q=${encodeURIComponent(query)}`, 3000)
    
    if (response.ok) {
      const data = await response.json()
      if (data.success && data.documents.length > 0) {
        const results = data.documents.slice(0, 5).map((doc: any) => ({
          code: doc.secCode || doc.edinetCode,
          name: doc.filerName,
          exchange: '取引所未特定',
          sector: '業種未特定'
        }))
        setCachedData(cacheKey, results)
        return results
      }
    }
  } catch (error) {
    console.warn('EDINET検索エラー（フォールバックします）:', error)
  }

  // フォールバック: モックデータのみ
  const fallbackResults = await searchFromMockData(query)
  setCachedData(cacheKey, fallbackResults)
  return fallbackResults
}

// モックデータからの高速検索
async function searchFromMockData(query: string): Promise<CompanySearchResult[]> {
  const mockCompanyData = {
    '7203': { companyName: 'トヨタ自動車株式会社', exchange: '東証プライム', sector: '輸送用機器' },
    '6758': { companyName: 'ソニーグループ株式会社', exchange: '東証プライム', sector: '電気機器' },
    '9984': { companyName: 'ソフトバンクグループ株式会社', exchange: '東証プライム', sector: '情報・通信' },
    '7201': { companyName: '日産自動車株式会社', exchange: '東証プライム', sector: '輸送用機器' },
    '9433': { companyName: 'KDDI株式会社', exchange: '東証プライム', sector: '情報・通信' },
    '6752': { companyName: 'パナソニック ホールディングス株式会社', exchange: '東証プライム', sector: '電気機器' },
    '8031': { companyName: '三井物産株式会社', exchange: '東証プライム', sector: '卸売業' },
    '9432': { companyName: '日本電信電話株式会社', exchange: '東証プライム', sector: '情報・通信' }
  }

  const results: CompanySearchResult[] = []
  const queryLower = query.toLowerCase()
  
  for (const [code, data] of Object.entries(mockCompanyData)) {
    if (code.includes(query) || 
        data.companyName.includes(query) ||
        data.companyName.toLowerCase().includes(queryLower)) {
      results.push({
        code: code,
        name: data.companyName,
        exchange: data.exchange,
        sector: data.sector
      })
    }
  }
  
  return results.slice(0, 5) // 最大5件
}

// 高速化された財務データ取得
export async function getCompanyFinancialDataFast(companyCode: string): Promise<CompanyFinancialData | null> {
  const cacheKey = `company_${companyCode}`
  const cached = getCachedData(cacheKey)
  if (cached) {
    console.log('キャッシュから財務データを取得:', companyCode)
    return cached
  }

  try {
    // 並行して複数のデータソースを試行
    const promises = [
      getFromMockData(companyCode),
      getFromEDINET(companyCode).catch(() => null)
    ]

    const results = await Promise.allSettled(promises)
    
    // 最初に成功したデータを使用
    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) {
        setCachedData(cacheKey, result.value)
        return result.value
      }
    }

  } catch (error) {
    console.error('財務データ取得エラー:', error)
  }

  return null
}

// モックデータから財務データを取得
async function getFromMockData(companyCode: string): Promise<CompanyFinancialData | null> {
  const mockData = {
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
    }
  }

  return mockData[companyCode as keyof typeof mockData] || null
}

// EDINETからの財務データ取得（タイムアウト短縮）
async function getFromEDINET(companyCode: string): Promise<CompanyFinancialData | null> {
  try {
    const response = await fetchWithTimeout(`/api/edinet/company/${companyCode}`, 3000)
    if (response.ok) {
      const data = await response.json()
      if (data.success && data.company) {
        // EDINET data transformation logic here
        return transformEDINETData(data.company)
      }
    }
  } catch (error) {
    console.warn('EDINET財務データ取得エラー:', error)
  }
  return null
}

// EDINETデータの変換
function transformEDINETData(company: any): CompanyFinancialData {
  const financial = company.financialData || {}
  
  return {
    companyCode: company.companyCode,
    companyName: company.companyName,
    exchange: '取引所未特定',
    sector: '業種未特定',
    fiscalYearEnd: financial.fiscalYearEnd || company.latestDocument?.periodEnd || '',
    
    revenue: financial.revenue || 0,
    operatingIncome: financial.operatingIncome || 0,
    netIncome: financial.netIncome || 0,
    ebitda: financial.ebitda || (financial.operatingIncome || 0) * 1.3,
    
    totalAssets: financial.totalAssets || 0,
    shareholdersEquity: financial.shareholdersEquity || 0,
    totalLiabilities: financial.totalLiabilities || 0,
    cashAndCashEquivalents: financial.cashAndCashEquivalents || 0,
    
    operatingCashFlow: financial.operatingCashFlow || 0,
    investingCashFlow: financial.investingCashFlow || 0,
    financingCashFlow: financial.financingCashFlow || 0,
    freeCashFlow: (financial.operatingCashFlow || 0) + (financial.investingCashFlow || 0),
    
    sharesOutstanding: 1000,
    stockPrice: 1000,
    marketCap: 1000000,
    
    roe: financial.shareholdersEquity ? (financial.netIncome / financial.shareholdersEquity * 100) : 0,
    roa: financial.totalAssets ? (financial.netIncome / financial.totalAssets * 100) : 0,
    per: 0,
    pbr: 0,
    dividendYield: 0
  }
}

// リアルタイム株価取得（簡略化）
export async function getCurrentStockPriceFast(companyCode: string): Promise<number | null> {
  const cacheKey = `price_${companyCode}`
  const cached = getCachedData(cacheKey)
  if (cached) {
    return cached
  }

  // 簡易版：基準価格にランダム変動を加える
  const basePrices: { [key: string]: number } = {
    '7203': 2800,
    '6758': 3150,
    '9984': 8900,
    '7201': 450,
    '9433': 3600
  }

  const basePrice = basePrices[companyCode] || 1000
  const variation = 0.98 + Math.random() * 0.04 // ±2%の変動
  const currentPrice = Math.round(basePrice * variation)
  
  setCachedData(cacheKey, currentPrice)
  return currentPrice
}

// 業界平均データ取得（高速化）
export async function getIndustryAveragesFast(sector: string): Promise<any | null> {
  const cacheKey = `industry_${sector}`
  const cached = getCachedData(cacheKey)
  if (cached) {
    return cached
  }

  const sectorAverages: { [key: string]: any } = {
    '輸送用機器': { avgPER: 12.5, avgPBR: 1.1, avgROE: 8.5, avgROA: 3.2, avgEVEBITDA: 8.0 },
    '電気機器': { avgPER: 18.2, avgPBR: 2.1, avgROE: 12.3, avgROA: 5.5, avgEVEBITDA: 10.5 },
    '情報・通信': { avgPER: 25.5, avgPBR: 3.2, avgROE: 15.2, avgROA: 7.1, avgEVEBITDA: 15.2 },
    '卸売業': { avgPER: 15.8, avgPBR: 1.5, avgROE: 9.2, avgROA: 4.1, avgEVEBITDA: 7.5 },
  }

  const result = sectorAverages[sector] || null
  if (result) {
    setCachedData(cacheKey, result)
  }
  return result
}