import { NextRequest, NextResponse } from 'next/server'

// CORSを回避するためのプロキシエンドポイント
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const url = searchParams.get('url')
  const source = searchParams.get('source')

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 })
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    })

    const data = await response.text()

    // データソースに応じた処理
    if (source === 'yahoo') {
      // Yahoo Financeのデータを解析
      // 実際にはHTMLパースやAPI変換が必要
      return NextResponse.json({
        source: 'yahoo',
        data: 'Yahoo Financeデータ（要実装）'
      })
    }

    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch data', details: error },
      { status: 500 }
    )
  }
}