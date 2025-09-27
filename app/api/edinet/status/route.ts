import { NextResponse } from 'next/server'

// EDINET API接続テスト用エンドポイント
export async function GET() {
  try {
    // 今日の日付でEDINET APIをテスト
    const today = new Date().toISOString().split('T')[0]
    const edinetUrl = `https://disclosure.edinet-fsa.go.jp/api/v2/documents.json?date=${today}&type=2`
    
    console.log('Testing EDINET API:', edinetUrl)
    
    const response = await fetch(edinetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })
    
    if (!response.ok) {
      throw new Error(`EDINET API returned ${response.status}`)
    }
    
    const data = await response.json()
    
    return NextResponse.json({
      success: true,
      status: 'connected',
      date: today,
      documentsCount: data.results?.length || 0,
      message: 'EDINET API接続成功'
    })
    
  } catch (error) {
    console.error('EDINET API test failed:', error)
    
    return NextResponse.json({
      success: false,
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'EDINET API接続失敗'
    }, { status: 500 })
  }
}