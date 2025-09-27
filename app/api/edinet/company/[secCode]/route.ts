import { NextRequest, NextResponse } from 'next/server'

// 特定企業の最新財務データを取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ secCode: string }> }
) {
  const { secCode } = await params

  if (!secCode) {
    return NextResponse.json({ error: 'Security code is required' }, { status: 400 })
  }

  try {
    // 過去1年分の書類を検索
    const searchResults = await searchCompanyDocuments(secCode)
    
    if (searchResults.length === 0) {
      return NextResponse.json({ 
        error: 'No documents found for this company',
        secCode 
      }, { status: 404 })
    }

    // 最新の有価証券報告書を取得
    const latestDoc = searchResults[0]
    
    // 書類の詳細情報を取得
    const docUrl = `${request.nextUrl.origin}/api/edinet/document/${latestDoc.docID}`
    const docResponse = await fetch(docUrl)
    
    let financialData = {}
    if (docResponse.ok) {
      const docResult = await docResponse.json()
      financialData = docResult.financialData || {}
    }

    // 企業情報と財務データを統合
    const companyData = {
      companyCode: secCode,
      companyName: latestDoc.filerName,
      edinetCode: latestDoc.edinetCode,
      latestDocument: {
        docID: latestDoc.docID,
        submitDateTime: latestDoc.submitDateTime,
        docDescription: latestDoc.docDescription,
        periodEnd: latestDoc.periodEnd
      },
      financialData,
      availableDocuments: searchResults.slice(0, 5) // 最新5件
    }

    return NextResponse.json({
      success: true,
      company: companyData
    })

  } catch (error) {
    console.error('企業データ取得エラー:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch company data', 
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    )
  }
}

// 企業の書類を時系列で検索
async function searchCompanyDocuments(secCode: string): Promise<any[]> {
  const documents: any[] = []
  const endDate = new Date()
  const startDate = new Date()
  startDate.setFullYear(startDate.getFullYear() - 2) // 過去2年

  // 月ごとに検索（効率化のため）
  for (let d = new Date(endDate); d >= startDate; d.setMonth(d.getMonth() - 1)) {
    try {
      const dateStr = d.toISOString().split('T')[0]
      const searchUrl = `https://disclosure.edinet-fsa.go.jp/api/v2/documents.json?date=${dateStr}&type=2`
      
      const response = await fetch(searchUrl)
      if (response.ok) {
        const data = await response.json()
        const companyDocs = (data.results || []).filter((doc: any) => 
          doc.secCode === secCode && 
          (doc.docTypeCode === '120' || doc.docTypeCode === '140') // 有価証券報告書または四半期報告書
        )
        
        documents.push(...companyDocs)
        
        // 十分な数が見つかったら終了
        if (documents.length >= 10) break
      }
      
      // レート制限を避けるための待機
      await new Promise(resolve => setTimeout(resolve, 100))
      
    } catch (error) {
      console.error(`Date ${d.toISOString().split('T')[0]} search error:`, error)
      continue
    }
  }

  // 提出日時でソート（新しい順）
  return documents.sort((a, b) => 
    new Date(b.submitDateTime).getTime() - new Date(a.submitDateTime).getTime()
  )
}