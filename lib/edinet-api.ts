// EDINET API クライアント
// 金融庁が提供する有価証券報告書等の開示書類を取得するAPI

import { CompanyFinancialData } from './types'

// EDINET API設定
const EDINET_BASE_URL = 'https://disclosure.edinet-fsa.go.jp/api/v2'

// 書類種別コード
const DOC_TYPE_CODES = {
  SECURITIES_REPORT: '120', // 有価証券報告書
  QUARTERLY_REPORT: '140',  // 四半期報告書
  FINANCIAL_RESULTS: '170', // 決算短信
}

export interface EDINETDocument {
  docID: string
  edinetCode: string
  secCode: string | null
  JCN: string
  filerName: string
  fundCode: string | null
  ordinanceCode: string
  formCode: string
  docTypeCode: string
  periodStart: string | null
  periodEnd: string | null
  submitDateTime: string
  docDescription: string
  issuerEdinetCode: string | null
  subjectEdinetCode: string | null
  subsidiaryEdinetCode: string | null
  currentReportReason: string | null
  parentDocID: string | null
  opeDateTime: string | null
  withdrawalStatus: string
  docInfoEditStatus: string
  disclosureStatus: string
  xbrlFlag: string
  pdfFlag: string
  attachDocFlag: string
  englishDocFlag: string
}

// 書類一覧を取得
export async function searchDocuments(date: string, type?: string): Promise<EDINETDocument[]> {
  try {
    const params = new URLSearchParams({
      date: date,
      type: '2', // メタデータのみ
    })

    const response = await fetch(`${EDINET_BASE_URL}/documents.json?${params}`)
    if (!response.ok) {
      throw new Error(`EDINET API error: ${response.status}`)
    }

    const data = await response.json()
    let documents = data.results as EDINETDocument[]

    // 書類種別でフィルタリング
    if (type) {
      documents = documents.filter(doc => doc.docTypeCode === type)
    }

    return documents
  } catch (error) {
    console.error('EDINET API エラー:', error)
    return []
  }
}

// 企業コードで最新の有価証券報告書を検索
export async function getLatestSecuritiesReport(secCode: string): Promise<EDINETDocument | null> {
  try {
    // 過去1年分を検索
    const endDate = new Date()
    const startDate = new Date()
    startDate.setFullYear(startDate.getFullYear() - 1)

    const documents: EDINETDocument[] = []
    
    // 日付を遡って検索
    for (let d = new Date(endDate); d >= startDate; d.setDate(d.getDate() - 1)) {
      const dateStr = d.toISOString().split('T')[0]
      const dailyDocs = await searchDocuments(dateStr, DOC_TYPE_CODES.SECURITIES_REPORT)
      
      const companyDocs = dailyDocs.filter(doc => 
        doc.secCode === secCode && doc.docTypeCode === DOC_TYPE_CODES.SECURITIES_REPORT
      )
      
      if (companyDocs.length > 0) {
        return companyDocs[0]
      }
    }

    return null
  } catch (error) {
    console.error('最新報告書の取得エラー:', error)
    return null
  }
}

// XBRLデータを取得して財務データを抽出
export async function getFinancialDataFromXBRL(docID: string): Promise<Partial<CompanyFinancialData> | null> {
  try {
    // XBRLデータをダウンロード
    const response = await fetch(`${EDINET_BASE_URL}/documents/${docID}?type=1`)
    if (!response.ok) {
      throw new Error(`Document fetch error: ${response.status}`)
    }

    // 実際にはここでZIPファイルを解凍し、XBRLをパースする必要があります
    // ブラウザ環境では制約があるため、サーバーサイドでの処理が推奨されます
    
    console.log('XBRL処理は別途サーバーサイド実装が必要です')
    return null
  } catch (error) {
    console.error('XBRLデータ取得エラー:', error)
    return null
  }
}

// APIキーなしで利用可能な簡易版実装
export async function getCompanyInfoFromEDINET(secCode: string): Promise<{
  companyName: string
  documents: EDINETDocument[]
} | null> {
  try {
    // 最近の書類を検索
    const today = new Date().toISOString().split('T')[0]
    const documents = await searchDocuments(today)
    
    const companyDocs = documents.filter(doc => doc.secCode === secCode)
    
    if (companyDocs.length > 0) {
      return {
        companyName: companyDocs[0].filerName,
        documents: companyDocs
      }
    }

    return null
  } catch (error) {
    console.error('企業情報取得エラー:', error)
    return null
  }
}