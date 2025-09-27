'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { TrendingUp, TrendingDown, Target, AlertTriangle } from 'lucide-react'
import { CompanyFinancialData } from '@/lib/types'
import { calculateDCF, calculateTerminalValue } from '@/lib/financial-calculations'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts'
import { Tooltip } from '@/components/ui/Tooltip'

interface ValuationResult {
  method: string
  marketCap: number
  perShare: number
  premium: number
  confidence: 'high' | 'medium' | 'low'
  note: string
}

interface IntegratedValuationProps {
  company: CompanyFinancialData
  industryData?: any
}

export default function IntegratedValuation({ company, industryData }: IntegratedValuationProps) {
  const [valuationResults, setValuationResults] = useState<ValuationResult[]>([])
  const [consensusRange, setConsensusRange] = useState<{ min: number, max: number, median: number } | null>(null)
  const [currentMarketCap, setCurrentMarketCap] = useState<number>(0)

  useEffect(() => {
    if (company) {
      calculateAllValuations()
    }
  }, [company, industryData])

  const calculateAllValuations = () => {
    const results: ValuationResult[] = []
    const currentPrice = company.stockPrice || 3000
    const sharesOutstanding = company.sharesOutstanding || 1000
    const currentMktCap = currentPrice * sharesOutstanding

    setCurrentMarketCap(currentMktCap)

    // 1. DCF法による評価
    const dcfResult = calculateDCFValuation()
    if (dcfResult) {
      results.push({
        method: 'DCF法',
        marketCap: dcfResult.enterpriseValue,
        perShare: dcfResult.enterpriseValue / sharesOutstanding,
        premium: ((dcfResult.enterpriseValue - currentMktCap) / currentMktCap) * 100,
        confidence: 'high',
        note: '将来キャッシュフローベース'
      })
    }

    // 2. PER法による評価
    if (company.netIncome && industryData?.avgPER) {
      const eps = (company.netIncome * 1000000) / (sharesOutstanding * 1000)
      const perMarketCap = eps * industryData.avgPER * sharesOutstanding * 1000
      results.push({
        method: 'PER法',
        marketCap: perMarketCap,
        perShare: eps * industryData.avgPER,
        premium: ((perMarketCap - currentMktCap) / currentMktCap) * 100,
        confidence: 'medium',
        note: `業界平均PER ${industryData.avgPER}倍適用`
      })
    }

    // 3. PBR法による評価
    if (company.shareholdersEquity && industryData?.avgPBR) {
      const bookValuePerShare = (company.shareholdersEquity * 1000000) / (sharesOutstanding * 1000)
      const pbrMarketCap = bookValuePerShare * industryData.avgPBR * sharesOutstanding * 1000
      results.push({
        method: 'PBR法',
        marketCap: pbrMarketCap,
        perShare: bookValuePerShare * industryData.avgPBR,
        premium: ((pbrMarketCap - currentMktCap) / currentMktCap) * 100,
        confidence: 'medium',
        note: `業界平均PBR ${industryData.avgPBR}倍適用`
      })
    }

    // 4. EV/EBITDA法による評価
    if (company.ebitda && industryData?.avgEVEBITDA) {
      const evMarketCap = company.ebitda * industryData.avgEVEBITDA * 1000000
      results.push({
        method: 'EV/EBITDA法',
        marketCap: evMarketCap,
        perShare: evMarketCap / sharesOutstanding,
        premium: ((evMarketCap - currentMktCap) / currentMktCap) * 100,
        confidence: 'high',
        note: `業界平均EV/EBITDA ${industryData.avgEVEBITDA}倍適用`
      })
    }

    setValuationResults(results)

    // コンセンサス価格レンジを計算
    if (results.length > 0) {
      const marketCaps = results.map(r => r.marketCap)
      const min = Math.min(...marketCaps)
      const max = Math.max(...marketCaps)
      const median = marketCaps.sort((a, b) => a - b)[Math.floor(marketCaps.length / 2)]
      setConsensusRange({ min, max, median })
    }
  }

  const calculateDCFValuation = () => {
    if (!company.freeCashFlow || company.freeCashFlow <= 0) return null

    try {
      const historicalGrowthRate = company.historicalData 
        ? calculateGrowthRate(company.historicalData.map(h => h.freeCashFlow))
        : 0.05

      const futureCashFlows = []
      let baseCF = company.freeCashFlow * 1000000
      
      for (let i = 1; i <= 5; i++) {
        baseCF *= (1 + Math.min(historicalGrowthRate, 0.15))
        futureCashFlows.push(baseCF)
      }

      const discountRate = 0.08
      const terminalGrowthRate = 0.02

      const terminalValue = calculateTerminalValue(
        futureCashFlows[futureCashFlows.length - 1],
        terminalGrowthRate * 100,
        discountRate * 100
      )

      const enterpriseValue = calculateDCF(
        futureCashFlows,
        terminalValue,
        discountRate * 100
      )

      return { enterpriseValue }
    } catch (error) {
      console.error('DCF計算エラー:', error)
      return null
    }
  }

  const calculateGrowthRate = (values: number[]): number => {
    if (values.length < 2) return 0.05
    
    const validValues = values.filter(v => v > 0)
    if (validValues.length < 2) return 0.05

    const firstValue = validValues[0]
    const lastValue = validValues[validValues.length - 1]
    const years = validValues.length - 1

    return Math.pow(lastValue / firstValue, 1 / years) - 1
  }

  const getValuationStatus = (premium: number) => {
    if (premium < -20) return { text: '大幅割安', color: 'text-green-600', icon: TrendingUp }
    if (premium < -10) return { text: '割安', color: 'text-green-500', icon: TrendingUp }
    if (premium < 10) return { text: '適正', color: 'text-blue-600', icon: Target }
    if (premium < 20) return { text: '割高', color: 'text-orange-500', icon: TrendingDown }
    return { text: '大幅割高', color: 'text-red-600', icon: AlertTriangle }
  }

  const getChartData = () => {
    return valuationResults.map(result => ({
      method: result.method,
      時価総額: result.marketCap / 1000000000,
      現在時価総額: currentMarketCap / 1000000000,
      プレミアム: result.premium
    }))
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>統合バリュエーション分析</CardTitle>
          <CardDescription>
            複数の評価手法による企業価値算定とコンセンサス価格レンジ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 評価結果一覧 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">評価手法別結果</h3>
              {valuationResults.map((result, index) => {
                const status = getValuationStatus(result.premium)
                const StatusIcon = status.icon
                
                return (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <Tooltip content={result.note}>
                          <h4 className="font-medium">{result.method}</h4>
                        </Tooltip>
                        <div className="text-sm text-gray-600">{result.note}</div>
                      </div>
                      <div className={`flex items-center gap-1 ${status.color}`}>
                        <StatusIcon className="h-4 w-4" />
                        <span className="text-sm font-medium">{status.text}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">時価総額</div>
                        <div className="font-semibold">
                          ¥{(result.marketCap / 1000000000).toFixed(1)}B
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600">1株価値</div>
                        <div className="font-semibold">
                          ¥{Math.round(result.perShare).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <div className="text-gray-600 text-sm">現在価格との差</div>
                      <div className={`font-bold ${result.premium >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {result.premium >= 0 ? '+' : ''}{result.premium.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* チャート */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">評価価格比較</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="method" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    fontSize={12}
                  />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="時価総額" fill="#3B82F6" name="評価時価総額 (¥B)" />
                  <Bar dataKey="現在時価総額" fill="#EF4444" name="現在時価総額 (¥B)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* コンセンサス価格レンジ */}
      {consensusRange && (
        <Card>
          <CardHeader>
            <CardTitle>コンセンサス価格レンジ</CardTitle>
            <CardDescription>
              各評価手法の結果を統合した価格レンジ
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">最低評価額</div>
                <div className="text-2xl font-bold text-red-600">
                  ¥{Math.round(consensusRange.min / company.sharesOutstanding).toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">
                  時価総額: ¥{(consensusRange.min / 1000000000).toFixed(1)}B
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">中央値</div>
                <div className="text-3xl font-bold text-blue-600">
                  ¥{Math.round(consensusRange.median / company.sharesOutstanding).toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">
                  時価総額: ¥{(consensusRange.median / 1000000000).toFixed(1)}B
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">最高評価額</div>
                <div className="text-2xl font-bold text-green-600">
                  ¥{Math.round(consensusRange.max / company.sharesOutstanding).toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">
                  時価総額: ¥{(consensusRange.max / 1000000000).toFixed(1)}B
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}