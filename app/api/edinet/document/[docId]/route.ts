import { NextRequest, NextResponse } from 'next/server'
import JSZip from 'jszip'
import { parseStringPromise } from 'xml2js'

// EDINET API: 書類取得・財務データ抽出エンドポイント
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ docId: string }> }
) {
  const { docId } = await params
  if (!docId) {
    return NextResponse.json({ error: 'Document ID is required' }, { status: 400 })
  }

  try {
    // EDINET 書類取得API（ZIPファイル）
    const edinetUrl = `https://disclosure.edinet-fsa.go.jp/api/v2/documents/${docId}?type=1`
    
    const response = await fetch(edinetUrl)
    if (!response.ok) {
      throw new Error(`EDINET Document API error: ${response.status}`)
    }

    // ZIPファイルを取得
    const zipBuffer = await response.arrayBuffer()
    const zip = new JSZip()
    const zipContents = await zip.loadAsync(zipBuffer)

    // XBRLファイルを探す
    const xbrlFiles = Object.keys(zipContents.files).filter(filename => 
      filename.endsWith('.xbrl') && !filename.includes('cal') && !filename.includes('def')
    )

    if (xbrlFiles.length === 0) {
      return NextResponse.json({ error: 'No XBRL files found in document' }, { status: 404 })
    }

    // メインのXBRLファイルを選択（通常は最初のもの）
    const mainXbrlFile = xbrlFiles[0]
    const xbrlContent = await zipContents.files[mainXbrlFile].async('text')

    // XBRLをパース
    const parsedXbrl = await parseStringPromise(xbrlContent)
    
    // 財務データを抽出
    const financialData = extractFinancialData(parsedXbrl)

    return NextResponse.json({
      success: true,
      docId,
      xbrlFile: mainXbrlFile,
      financialData
    })

  } catch (error) {
    console.error('EDINET書類取得エラー:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch EDINET document', 
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    )
  }
}

// XBRLから財務データを抽出する関数
function extractFinancialData(xbrl: any): any {
  try {
    const data: any = {}
    
    // XBRLの構造は複雑なので、主要な要素を抽出
    const xbrlRoot = xbrl['xbrl'] || xbrl
    
    if (!xbrlRoot) {
      return { error: 'Invalid XBRL structure' }
    }

    // コンテキスト情報を取得
    const contexts = xbrlRoot['xbrli:context'] || []
    const currentContext = Array.isArray(contexts) ? contexts[0] : contexts

    // 主要な財務項目を検索
    const financialItems = [
      // 損益計算書
      { key: 'revenue', patterns: ['jppfs_cor:NetSales', 'jpcrp_cor:NetSales', 'Revenue'] },
      { key: 'operatingIncome', patterns: ['jppfs_cor:OperatingIncome', 'jpcrp_cor:OperatingIncome'] },
      { key: 'netIncome', patterns: ['jppfs_cor:NetIncome', 'jpcrp_cor:NetIncome', 'jppfs_cor:ProfitLoss'] },
      
      // 貸借対照表
      { key: 'totalAssets', patterns: ['jppfs_cor:TotalAssets', 'jpcrp_cor:TotalAssets'] },
      { key: 'shareholdersEquity', patterns: ['jppfs_cor:ShareholdersEquity', 'jpcrp_cor:ShareholdersEquity'] },
      { key: 'totalLiabilities', patterns: ['jppfs_cor:TotalLiabilities', 'jpcrp_cor:TotalLiabilities'] },
      
      // キャッシュフロー
      { key: 'operatingCashFlow', patterns: ['jppfs_cor:NetCashProvidedByUsedInOperatingActivities'] },
      { key: 'investingCashFlow', patterns: ['jppfs_cor:NetCashProvidedByUsedInInvestmentActivities'] },
      { key: 'financingCashFlow', patterns: ['jppfs_cor:NetCashProvidedByUsedInFinancingActivities'] },
    ]

    // 各財務項目を検索・抽出
    for (const item of financialItems) {
      for (const pattern of item.patterns) {
        const value = findValueInXBRL(xbrlRoot, pattern)
        if (value !== null) {
          data[item.key] = parseFloat(value) || 0
          break
        }
      }
    }

    // 期間情報を抽出
    if (currentContext && currentContext['xbrli:period']) {
      const period = currentContext['xbrli:period'][0]
      if (period['xbrli:endDate']) {
        data.fiscalYearEnd = period['xbrli:endDate'][0]
      }
    }

    return data

  } catch (error) {
    console.error('財務データ抽出エラー:', error)
    return { error: 'Failed to extract financial data from XBRL' }
  }
}

// XBRLから特定の要素の値を検索
function findValueInXBRL(xbrlRoot: any, elementName: string): string | null {
  try {
    // 直接的な検索
    if (xbrlRoot[elementName]) {
      const element = Array.isArray(xbrlRoot[elementName]) ? xbrlRoot[elementName][0] : xbrlRoot[elementName]
      return element._ || element['$'] || element.toString()
    }

    // 再帰的に検索
    for (const key in xbrlRoot) {
      if (typeof xbrlRoot[key] === 'object') {
        const result = findValueInXBRL(xbrlRoot[key], elementName)
        if (result !== null) {
          return result
        }
      }
    }

    return null
  } catch (error) {
    return null
  }
}