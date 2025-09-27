// 各種データソースを統合した財務データサービス
import { CompanyFinancialData } from './types'
import { getLatestSecuritiesReport, getCompanyInfoFromEDINET } from './edinet-api'
import { getLatestDisclosures } from './tdnet-api'

// 利用可能な無料APIサービス
export const DATA_SOURCES = {
  EDINET: 'EDINET（有価証券報告書）',
  YAHOO_FINANCE: 'Yahoo Finance（株価情報）',
  NIKKEI: '日経電子版（ニュース）',
  KABUTAN: '株探（決算速報）',
  CUSTOM_PROXY: 'カスタムプロキシサーバー'
}

// Yahoo Finance風のAPI（実装例）
export async function getStockDataFromYahoo(ticker: string): Promise<any> {
  try {
    // CORSの問題があるため、実際にはプロキシサーバーが必要
    // またはyahoo-finance2などのnpmパッケージをサーバーサイドで使用
    
    return {
      symbol: ticker,
      name: 'サンプル企業',
      price: 3000,
      change: 50,
      changePercent: 1.67,
      volume: 1234567,
      marketCap: 500000000000,
      per: 15.2,
      pbr: 1.8,
      dividendYield: 2.5
    }
  } catch (error) {
    console.error('Yahoo Finance データ取得エラー:', error)
    return null
  }
}

// 統合データ取得サービス
export class FinancialDataService {
  // 複数のソースから財務データを収集
  static async getComprehensiveData(secCode: string): Promise<{
    edinet: any
    tdnet: any
    market: any
    combined: Partial<CompanyFinancialData>
  }> {
    try {
      // 並行してデータを取得
      const [edinetData, tdnetData, marketData] = await Promise.all([
        getCompanyInfoFromEDINET(secCode),
        getLatestDisclosures(secCode),
        getStockDataFromYahoo(secCode)
      ])

      // データを統合
      const combined: Partial<CompanyFinancialData> = {
        companyCode: secCode,
        companyName: edinetData?.companyName || marketData?.name || '',
        stockPrice: marketData?.price || 0,
        per: marketData?.per || 0,
        pbr: marketData?.pbr || 0,
        dividendYield: marketData?.dividendYield || 0,
      }

      return {
        edinet: edinetData,
        tdnet: tdnetData,
        market: marketData,
        combined
      }
    } catch (error) {
      console.error('統合データ取得エラー:', error)
      throw error
    }
  }

  // APIの制限事項を取得
  static getAPILimitations() {
    return {
      edinet: {
        available: true,
        limitations: [
          'APIキー不要',
          '1日のリクエスト制限なし',
          'XBRLの解析にはサーバーサイド処理が必要',
          '最新データは提出日の翌日から利用可能'
        ]
      },
      tdnet: {
        available: false,
        limitations: [
          '公式APIなし',
          'スクレイピングまたはRSSフィードを利用',
          'リアルタイムデータの取得は困難',
          'プロキシサーバーの実装が必要'
        ]
      },
      marketData: {
        available: 'limited',
        limitations: [
          'CORS制限によりブラウザから直接アクセス不可',
          'プロキシサーバーまたはサーバーサイドAPI必要',
          '無料APIは遅延データの場合あり',
          'レート制限に注意'
        ]
      }
    }
  }
}