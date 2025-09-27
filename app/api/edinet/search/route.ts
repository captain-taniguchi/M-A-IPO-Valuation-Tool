import { NextRequest, NextResponse } from 'next/server'

// EDINET API: 書類検索エンドポイント
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q')
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0]
  
  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 })
  }

  try {
    // EDINET 書類一覧API
    const edinetUrl = `https://disclosure.edinet-fsa.go.jp/api/v2/documents.json?date=${date}&type=2`
    
    const response = await fetch(edinetUrl)
    if (!response.ok) {
      throw new Error(`EDINET API error: ${response.status}`)
    }

    const data = await response.json()
    const documents = data.results || []

    // 検索クエリでフィルタリング
    const filteredDocs = documents.filter((doc: any) => {
      const matchesCode = doc.secCode && doc.secCode.includes(query)
      const matchesName = doc.filerName && doc.filerName.includes(query)
      const matchesEdinetCode = doc.edinetCode && doc.edinetCode.includes(query)
      
      return matchesCode || matchesName || matchesEdinetCode
    })

    // 有価証券報告書と決算短信のみに絞り込み
    const relevantDocs = filteredDocs.filter((doc: any) => {
      return doc.docTypeCode === '120' || // 有価証券報告書
             doc.docTypeCode === '140' || // 四半期報告書
             doc.ordinanceCode === '010' || // 金融商品取引法
             doc.formCode === '030000' // 有価証券報告書
    })

    return NextResponse.json({
      success: true,
      date,
      query,
      totalResults: relevantDocs.length,
      documents: relevantDocs.slice(0, 20) // 最大20件
    })

  } catch (error) {
    console.error('EDINET検索エラー:', error)
    return NextResponse.json(
      { 
        error: 'Failed to search EDINET', 
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    )
  }
}