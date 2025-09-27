'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Search, TrendingUp, TrendingDown, Building2, RefreshCw } from 'lucide-react'
import { searchCompanyFast as searchCompany, getCompanyFinancialDataFast as getCompanyFinancialData, getCurrentStockPriceFast as getCurrentStockPrice, getIndustryAveragesFast as getIndustryAverages } from '@/lib/api-optimized'
import { CompanyFinancialData, CompanySearchResult } from '@/lib/types'
import { FinancialDataService, DATA_SOURCES } from '@/lib/financial-data-service'
import { calculateDCF, calculateTerminalValue } from '@/lib/financial-calculations'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts'
import { Tooltip } from '@/components/ui/Tooltip'
import { tooltips } from '@/lib/tooltips'
import { EDINETStatus } from '@/components/EDINETStatus'
import IntegratedValuation from '@/components/IntegratedValuation'
import { LoadingIndicator, SearchLoadingOverlay } from '@/components/LoadingIndicator'
import { DebugPanel } from '@/components/DebugPanel'
import { QuickTest } from '@/components/QuickTest'

export default function RealtimeValuation() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<CompanySearchResult[]>([])
  const [selectedCompany, setSelectedCompany] = useState<CompanyFinancialData | null>(null)
  const [industryAvg, setIndustryAvg] = useState<any>(null)
  const [currentPrice, setCurrentPrice] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [dcfValue, setDcfValue] = useState<number | null>(null)
  const [dataSource, setDataSource] = useState('mock')
  const [apiStatus, setApiStatus] = useState<any>(null)
  const [debugLogs, setDebugLogs] = useState<string[]>([])

  // 企業検索（高速化）
  const handleSearch = async () => {
    if (!searchQuery) return
    setLoading(true)
    
    try {
      const startLogMessage = `検索開始: ${searchQuery}`
      console.log(startLogMessage)
      setDebugLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - ${startLogMessage}`])
      const startTime = Date.now()
      
      const results = await searchCompany(searchQuery)
      
      const endTime = Date.now()
      const searchLogMessage = `検索完了: ${endTime - startTime}ms, 結果: ${results.length}件`
      console.log(searchLogMessage)
      setDebugLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - ${searchLogMessage}`])
      
      setSearchResults(results)
    } catch (error) {
      const errorMessage = `検索エラー: ${error}`
      console.error(errorMessage)
      setDebugLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - ${errorMessage}`])
      setSearchResults([])
    } finally {
      setLoading(false)
    }
  }

  // 企業選択（高速化）
  const handleSelectCompany = async (code: string) => {
    setLoading(true)
    setSearchResults([]) // 検索結果をクリア
    
    try {
      const companyLogMessage = `企業データ取得開始: ${code}`
      console.log(companyLogMessage)
      setDebugLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - ${companyLogMessage}`])
      const startTime = Date.now()
      
      // 並行でデータ取得を高速化
      const [data, price] = await Promise.all([
        getCompanyFinancialData(code),
        getCurrentStockPrice(code)
      ])
      
      if (data) {
        setSelectedCompany(data)
        setCurrentPrice(price)
        
        // 業界データは非同期で取得
        getIndustryAverages(data.sector).then(avgData => {
          setIndustryAvg(avgData)
        })
        
        const endTime = Date.now()
        const completeLogMessage = `企業データ取得完了: ${endTime - startTime}ms`
        console.log(completeLogMessage)
        setDebugLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - ${completeLogMessage}`])
        
        // DCF計算（非同期）
        if (data.historicalData && data.historicalData.length > 0) {
          setTimeout(() => {
            try {
              const futureCashFlows = []
              const lastCF = data.freeCashFlow
              const growthRate = 5
              
              for (let i = 1; i <= 5; i++) {
                futureCashFlows.push(lastCF * Math.pow(1 + growthRate / 100, i))
              }
              
              const discountRate = 10
              const terminalGrowthRate = 2
              const terminalValue = calculateTerminalValue(
                futureCashFlows[futureCashFlows.length - 1],
                terminalGrowthRate,
                discountRate
              )
              
              const dcf = calculateDCF(futureCashFlows, terminalValue, discountRate)
              setDcfValue(dcf)
            } catch (error) {
              console.error('DCF計算エラー:', error)
            }
          }, 100) // UIブロッキングを回避
        }
      } else {
        const warnMessage = `企業データが見つかりません: ${code}`
        console.warn(warnMessage)
        setDebugLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - ${warnMessage}`])
      }
    } catch (error) {
      const errorMessage = `データ取得エラー: ${error}`
      console.error(errorMessage)
      setDebugLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - ${errorMessage}`])
    } finally {
      setLoading(false)
    }
  }

  // リアルタイム株価更新（10秒ごとに延長）
  useEffect(() => {
    if (!selectedCompany) return
    
    const interval = setInterval(async () => {
      try {
        const price = await getCurrentStockPrice(selectedCompany.companyCode)
        setCurrentPrice(price)
      } catch (error) {
        console.warn('株価更新エラー:', error)
      }
    }, 10000) // 10秒に延長
    
    return () => clearInterval(interval)
  }, [selectedCompany])

  const getValuationStatus = (current: number, target: number) => {
    const ratio = current / target
    if (ratio < 0.8) return { text: '割安', color: 'text-green-600', icon: TrendingUp }
    if (ratio > 1.2) return { text: '割高', color: 'text-red-600', icon: TrendingDown }
    return { text: '適正', color: 'text-blue-600', icon: TrendingUp }
  }

  return (
    <div className="px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          <Tooltip content="実際の企業データを取得してリアルタイムでバリュエーション分析を行います">
            リアルタイムバリュエーション
          </Tooltip>
        </h2>
        <button
          onClick={() => setApiStatus(FinancialDataService.getAPILimitations())}
          className="text-sm text-blue-600 hover:text-blue-800 px-3 py-1 border border-blue-300 rounded-md"
        >
          API制限を確認
        </button>
      </div>

      {/* クイックテスト */}
      <QuickTest />
      
      {/* 検索セクション */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>企業検索</CardTitle>
          <CardDescription>証券コードまたは企業名で検索してください</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <SearchLoadingOverlay show={loading} />
            <div className="flex gap-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                disabled={loading}
                placeholder="例: 7203, トヨタ"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
              />
              <button
                onClick={handleSearch}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
              >
                {loading ? (
                  <LoadingIndicator message="" size="sm" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                検索
              </button>
            </div>
          
          {/* データソース選択 */}
          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">データソース</label>
            <select
              value={dataSource}
              onChange={(e) => setDataSource(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="mock">モックデータ（デモ用）</option>
              <option value="edinet">✨ EDINET（リアルデータ）</option>
              <option value="mixed">統合データ（設定要）</option>
            </select>
            {dataSource === 'edinet' && (
              <div className="mt-2 text-xs text-blue-600">
                ℹ️ 金融庁EDINETから直接データ取得します（キャッシュ有効）
              </div>
            )}
          </div>
          </div>
          
          {/* 検索結果 */}
          {searchResults.length > 0 && (
            <div className="mt-4 border rounded-md">
              {searchResults.map((result) => (
                <div
                  key={result.code}
                  onClick={() => handleSelectCompany(result.code)}
                  className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-medium">{result.name}</span>
                      <span className="text-sm text-gray-500 ml-2">({result.code})</span>
                    </div>
                    <div className="text-sm text-gray-500">{result.sector} / {result.exchange}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 選択された企業の情報 */}
      {selectedCompany && (
        <>
          {/* 基本情報 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  企業情報
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">{selectedCompany.companyName}</div>
                  <div className="text-sm text-gray-600">
                    <div>証券コード: {selectedCompany.companyCode}</div>
                    <div>業種: {selectedCompany.sector}</div>
                    <div>市場: {selectedCompany.exchange}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  株価情報
                  <RefreshCw className={`h-4 w-4 ${currentPrice ? 'animate-spin' : ''}`} />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-3xl font-bold">
                    ¥{currentPrice?.toLocaleString() || '-'}
                  </div>
                  <div className="text-sm text-gray-600">
                    <div>時価総額: ¥{(selectedCompany.marketCap / 1000).toFixed(1)}兆円</div>
                    <div>配当利回り: {selectedCompany.dividendYield}%</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>バリュエーション判定</CardTitle>
              </CardHeader>
              <CardContent>
                {dcfValue && currentPrice && (
                  <div className="space-y-2">
                    <div className="text-sm">
                      理論株価: ¥{Math.round(dcfValue / selectedCompany.sharesOutstanding * 1000).toLocaleString()}
                    </div>
                    <div className={`text-2xl font-bold ${getValuationStatus(currentPrice, dcfValue / selectedCompany.sharesOutstanding * 1000).color}`}>
                      {getValuationStatus(currentPrice, dcfValue / selectedCompany.sharesOutstanding * 1000).text}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 財務指標 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 主要財務指標 */}
            <Card>
              <CardHeader>
                <CardTitle>主要財務指標</CardTitle>
                <CardDescription>直近決算期: {selectedCompany.fiscalYearEnd}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Tooltip content={tooltips.roe.description}>
                        <div className="text-sm text-gray-600">ROE</div>
                      </Tooltip>
                      <div className="text-xl font-bold">{selectedCompany.roe}%</div>
                      {industryAvg && (
                        <div className="text-xs text-gray-500">業界平均: {industryAvg.avgROE}%</div>
                      )}
                    </div>
                    <div>
                      <Tooltip content={tooltips.roa.description}>
                        <div className="text-sm text-gray-600">ROA</div>
                      </Tooltip>
                      <div className="text-xl font-bold">{selectedCompany.roa}%</div>
                      {industryAvg && (
                        <div className="text-xs text-gray-500">業界平均: {industryAvg.avgROA}%</div>
                      )}
                    </div>
                    <div>
                      <Tooltip content={tooltips.per.description}>
                        <div className="text-sm text-gray-600">PER</div>
                      </Tooltip>
                      <div className="text-xl font-bold">{selectedCompany.per}倍</div>
                      {industryAvg && (
                        <div className="text-xs text-gray-500">業界平均: {industryAvg.avgPER}倍</div>
                      )}
                    </div>
                    <div>
                      <Tooltip content={tooltips.pbr.description}>
                        <div className="text-sm text-gray-600">PBR</div>
                      </Tooltip>
                      <div className="text-xl font-bold">{selectedCompany.pbr}倍</div>
                      {industryAvg && (
                        <div className="text-xs text-gray-500">業界平均: {industryAvg.avgPBR}倍</div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 売上・利益推移 */}
            <Card>
              <CardHeader>
                <CardTitle>売上・利益推移</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedCompany.historicalData && (
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={selectedCompany.historicalData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#3B82F6" 
                        name="売上高"
                        strokeWidth={2}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="netIncome" 
                        stroke="#10B981" 
                        name="純利益"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* キャッシュフロー分析 */}
            <Card>
              <CardHeader>
                <CardTitle>キャッシュフロー分析</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">営業CF</span>
                    <span className="font-semibold">¥{(selectedCompany.operatingCashFlow / 1000).toFixed(1)}B</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">投資CF</span>
                    <span className="font-semibold text-red-600">
                      ¥{(selectedCompany.investingCashFlow / 1000).toFixed(1)}B
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">財務CF</span>
                    <span className="font-semibold">
                      ¥{(selectedCompany.financingCashFlow / 1000).toFixed(1)}B
                    </span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center">
                      <Tooltip content={tooltips.cashFlow.description}>
                        <span className="font-medium">フリーCF</span>
                      </Tooltip>
                      <span className="text-lg font-bold text-green-600">
                        ¥{(selectedCompany.freeCashFlow / 1000).toFixed(1)}B
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* DCF法による企業価値 */}
            <Card>
              <CardHeader>
                <CardTitle>
                  <Tooltip content={tooltips.dcf.description}>
                    DCF法による企業価値評価
                  </Tooltip>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dcfValue && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">企業価値</span>
                      <span className="text-xl font-bold">
                        ¥{(dcfValue / 1000000).toFixed(1)}兆円
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">理論株価</span>
                      <span className="text-xl font-bold">
                        ¥{Math.round(dcfValue / selectedCompany.sharesOutstanding * 1000).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">現在株価との差</span>
                      <span className={`text-lg font-bold ${
                        currentPrice && currentPrice < dcfValue / selectedCompany.sharesOutstanding * 1000
                          ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {currentPrice && (
                          `${((currentPrice / (dcfValue / selectedCompany.sharesOutstanding * 1000) - 1) * 100).toFixed(1)}%`
                        )}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* 統合バリュエーション */}
          <div className="mt-8">
            <IntegratedValuation 
              company={selectedCompany} 
              industryData={industryAvg}
            />
          </div>
        </>
      )}
      
      {/* デバッグパネル */}
      <DebugPanel 
        logs={debugLogs}
        isLoading={loading}
        searchResults={searchResults}
        selectedCompany={selectedCompany}
      />
      
      {/* EDINET接続ステータス */}
      <div className="mt-6">
        <EDINETStatus />
      </div>
      
      {/* API制限情報 */}
      {apiStatus && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>API制限情報</CardTitle>
            <button
              onClick={() => setApiStatus(null)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              閉じる
            </button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold">EDINET（金融庁 電子開示システム）</h4>
                <ul className="text-sm text-gray-600 ml-4 list-disc space-y-1">
                  <li>APIキー不要で無料利用可能</li>
                  <li>有価証券報告書、四半期報告書が取得可能</li>
                  <li>XBRLファイルの解析にはサーバーサイド処理が必要</li>
                  <li>データは提出日の翌営業日から利用可能</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold">TDnet（適時開示情報）</h4>
                <ul className="text-sm text-gray-600 ml-4 list-disc space-y-1">
                  <li>公式APIは提供されていない</li>
                  <li>RSSフィードまたはスクレイピングで取得</li>
                  <li>プロキシサーバーの実装が必要</li>
                  <li>リアルタイムデータの取得は技術的に困難</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold">株価データ</h4>
                <ul className="text-sm text-gray-600 ml-4 list-disc space-y-1">
                  <li>Yahoo Finance等のAPIをプロキシ経由で利用</li>
                  <li>CORS制限により直接アクセス不可</li>
                  <li>無料APIは15-20分遅延の場合が多い</li>
                  <li>レート制限に注意が必要</li>
                </ul>
              </div>
              <div className="bg-blue-50 p-3 rounded-md">
                <h4 className="font-semibold text-blue-800">推奨実装方法</h4>
                <p className="text-sm text-blue-700 mt-1">
                  本格運用時はNext.jsのAPI Routes（サーバーサイド）でEDINET APIを呼び出し、
                  XBRLデータをパースして財務データを抽出する実装を推奨します。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}