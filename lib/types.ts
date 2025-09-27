// 企業財務データの型定義
export interface CompanyFinancialData {
  // 基本情報
  companyCode: string
  companyName: string
  exchange: string
  sector: string
  fiscalYearEnd: string
  
  // 損益計算書項目
  revenue: number // 売上高
  operatingIncome: number // 営業利益
  netIncome: number // 純利益
  ebitda: number // EBITDA
  
  // 貸借対照表項目
  totalAssets: number // 総資産
  shareholdersEquity: number // 株主資本
  totalLiabilities: number // 総負債
  cashAndCashEquivalents: number // 現金及び現金同等物
  
  // キャッシュフロー項目
  operatingCashFlow: number // 営業キャッシュフロー
  investingCashFlow: number // 投資キャッシュフロー
  financingCashFlow: number // 財務キャッシュフロー
  freeCashFlow: number // フリーキャッシュフロー
  
  // 株式情報
  sharesOutstanding: number // 発行済株式数
  stockPrice: number // 株価
  marketCap: number // 時価総額
  
  // 財務指標
  roe: number // ROE
  roa: number // ROA
  per: number // PER
  pbr: number // PBR
  dividendYield: number // 配当利回り
  
  // 過去データ（トレンド分析用）
  historicalData?: {
    year: number
    revenue: number
    netIncome: number
    operatingCashFlow: number
    freeCashFlow: number
  }[]
}

// API レスポンスの型定義
export interface CompanySearchResult {
  code: string
  name: string
  exchange: string
  sector: string
}

export interface APIError {
  message: string
  code?: string
}