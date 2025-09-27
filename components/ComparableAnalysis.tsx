'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Building2, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react'
import { ComparableCompany, getComparableCompanies, calculateSectorAverages } from '@/lib/comparable-companies'
import { CompanyFinancialData } from '@/lib/types'
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts'
import { Tooltip } from '@/components/ui/Tooltip'

interface ComparableAnalysisProps {
  company: CompanyFinancialData
}

export default function ComparableAnalysis({ company }: ComparableAnalysisProps) {
  const [comparableCompanies, setComparableCompanies] = useState<ComparableCompany[]>([])
  const [sectorAverages, setSectorAverages] = useState<any>(null)
  const [selectedMultiple, setSelectedMultiple] = useState<'per' | 'pbr' | 'evEbitda' | 'psr'>('per')
  const [targetCompany, setTargetCompany] = useState<ComparableCompany | null>(null)

  useEffect(() => {
    if (company && company.sector) {
      const comparables = getComparableCompanies(company.sector)
      setComparableCompanies(comparables)
      
      if (comparables.length > 0) {
        const averages = calculateSectorAverages(comparables)
        setSectorAverages(averages)
      }

      // 対象企業のマルチプルを計算
      const eps = company.netIncome ? (company.netIncome * 1000000) / (company.sharesOutstanding * 1000) : 0
      const bookValuePerShare = company.shareholdersEquity ? (company.shareholdersEquity * 1000000) / (company.sharesOutstanding * 1000) : 0
      
      const target: ComparableCompany = {
        code: company.companyCode,
        name: company.companyName,
        sector: company.sector,
        marketCap: company.marketCap || (company.stockPrice * company.sharesOutstanding),
        revenue: company.revenue / 100, // 億円に変換
        netIncome: company.netIncome / 100,
        ebitda: company.ebitda / 100,
        totalAssets: company.totalAssets / 100,
        shareholdersEquity: company.shareholdersEquity / 100,
        stockPrice: company.stockPrice,
        sharesOutstanding: company.sharesOutstanding,
        per: eps > 0 ? company.stockPrice / eps : 0,
        pbr: bookValuePerShare > 0 ? company.stockPrice / bookValuePerShare : 0,
        evEbitda: company.ebitda > 0 ? (company.marketCap || 0) / (company.ebitda / 100) : 0,
        psr: company.revenue > 0 ? (company.marketCap || 0) / (company.revenue / 100) : 0
      }
      
      setTargetCompany(target)
    }
  }, [company])

  const getMultipleLabel = (multiple: string) => {
    const labels = {
      'per': 'PER（株価収益率）',
      'pbr': 'PBR（株価純資産倍率）',
      'evEbitda': 'EV/EBITDA',
      'psr': 'PSR（株価売上高倍率）'
    }
    return labels[multiple as keyof typeof labels]
  }

  const getScatterData = () => {
    const allCompanies = targetCompany ? [...comparableCompanies, targetCompany] : comparableCompanies
    
    return allCompanies.map(comp => {
      const multipleValue = selectedMultiple === 'per' ? comp.per :
                           selectedMultiple === 'pbr' ? comp.pbr :
                           selectedMultiple === 'evEbitda' ? comp.evEbitda :
                           comp.psr
      
      return {
        name: comp.name,
        code: comp.code,
        x: comp.revenue, // 売上高（億円）
        y: multipleValue,
        marketCap: comp.marketCap / 100000000, // 兆円
        isTarget: comp.code === company.companyCode
      }
    })
  }

  const getComparisonTable = () => {
    return comparableCompanies.map(comp => {
      const targetValue = targetCompany ? (
        selectedMultiple === 'per' ? targetCompany.per :
        selectedMultiple === 'pbr' ? targetCompany.pbr :
        selectedMultiple === 'evEbitda' ? targetCompany.evEbitda :
        targetCompany.psr
      ) : 0
      
      const compValue = selectedMultiple === 'per' ? comp.per :
                       selectedMultiple === 'pbr' ? comp.pbr :
                       selectedMultiple === 'evEbitda' ? comp.evEbitda :
                       comp.psr
      
      const premium = targetValue > 0 ? ((compValue - targetValue) / targetValue * 100) : 0
      
      return {
        ...comp,
        currentMultiple: compValue,
        premium,
        isHigher: compValue > targetValue,
        isLower: compValue < targetValue
      }
    }).sort((a, b) => a.currentMultiple - b.currentMultiple)
  }

  const getValuationImplications = () => {
    if (!targetCompany || !sectorAverages) return []

    const implications = []
    const target = targetCompany

    // PER分析
    if (target.per > 0) {
      const perVsAvg = ((target.per - sectorAverages.avgPER) / sectorAverages.avgPER * 100)
      implications.push({
        metric: 'PER',
        value: target.per.toFixed(1),
        average: sectorAverages.avgPER.toFixed(1),
        premium: perVsAvg.toFixed(1),
        interpretation: perVsAvg > 20 ? '成長期待が高い' : perVsAvg < -20 ? '割安または業績懸念' : '業界平均水準'
      })
    }

    // PBR分析
    if (target.pbr > 0) {
      const pbrVsAvg = ((target.pbr - sectorAverages.avgPBR) / sectorAverages.avgPBR * 100)
      implications.push({
        metric: 'PBR',
        value: target.pbr.toFixed(2),
        average: sectorAverages.avgPBR.toFixed(2),
        premium: pbrVsAvg.toFixed(1),
        interpretation: pbrVsAvg > 20 ? '高い成長性評価' : pbrVsAvg < -20 ? '割安または資産効率低い' : '業界平均水準'
      })
    }

    // EV/EBITDA分析
    if (target.evEbitda > 0) {
      const evVsAvg = ((target.evEbitda - sectorAverages.avgEVEBITDA) / sectorAverages.avgEVEBITDA * 100)
      implications.push({
        metric: 'EV/EBITDA',
        value: target.evEbitda.toFixed(1),
        average: sectorAverages.avgEVEBITDA.toFixed(1),
        premium: evVsAvg.toFixed(1),
        interpretation: evVsAvg > 20 ? '高い収益性評価' : evVsAvg < -20 ? '割安または収益性懸念' : '業界平均水準'
      })
    }

    return implications
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            類似企業比較分析
          </CardTitle>
          <CardDescription>
            {company.sector}業界の類似企業とのマルチプル比較
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* マルチプル選択 */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">比較指標</label>
            <select
              value={selectedMultiple}
              onChange={(e) => setSelectedMultiple(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="per">PER（株価収益率）</option>
              <option value="pbr">PBR（株価純資産倍率）</option>
              <option value="evEbitda">EV/EBITDA</option>
              <option value="psr">PSR（株価売上高倍率）</option>
            </select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 散布図 */}
            <div>
              <h3 className="text-lg font-semibold mb-4">
                売上高 vs {getMultipleLabel(selectedMultiple)}
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="x" 
                    name="売上高" 
                    unit="億円"
                    type="number"
                    domain={['dataMin', 'dataMax']}
                  />
                  <YAxis 
                    dataKey="y" 
                    name={getMultipleLabel(selectedMultiple)}
                    type="number"
                  />
                  <RechartsTooltip 
                    formatter={(value, name) => [value, name]}
                    labelFormatter={(value) => `${value}億円`}
                    content={({ active, payload }) => {
                      if (active && payload && payload[0]) {
                        const data = payload[0].payload
                        return (
                          <div className="bg-white p-3 border rounded shadow">
                            <div className="font-semibold">{data.name}</div>
                            <div>売上高: {data.x.toLocaleString()}億円</div>
                            <div>{getMultipleLabel(selectedMultiple)}: {data.y.toFixed(1)}</div>
                            <div>時価総額: {data.marketCap.toFixed(2)}兆円</div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Scatter 
                    data={getScatterData().filter(d => !d.isTarget)} 
                    fill="#3B82F6"
                    name="类似企業"
                  />
                  <Scatter 
                    data={getScatterData().filter(d => d.isTarget)} 
                    fill="#EF4444"
                    name="対象企業"
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>

            {/* 業界統計 */}
            <div>
              <h3 className="text-lg font-semibold mb-4">業界統計</h3>
              {sectorAverages && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-blue-50 p-3 rounded">
                      <div className="text-blue-800 font-medium">平均PER</div>
                      <div className="text-xl font-bold">{sectorAverages.avgPER.toFixed(1)}倍</div>
                      <div className="text-xs text-blue-600">中央値: {sectorAverages.medianPER.toFixed(1)}倍</div>
                    </div>
                    <div className="bg-green-50 p-3 rounded">
                      <div className="text-green-800 font-medium">平均PBR</div>
                      <div className="text-xl font-bold">{sectorAverages.avgPBR.toFixed(2)}倍</div>
                      <div className="text-xs text-green-600">中央値: {sectorAverages.medianPBR.toFixed(2)}倍</div>
                    </div>
                    <div className="bg-purple-50 p-3 rounded">
                      <div className="text-purple-800 font-medium">平均EV/EBITDA</div>
                      <div className="text-xl font-bold">{sectorAverages.avgEVEBITDA.toFixed(1)}倍</div>
                      <div className="text-xs text-purple-600">中央値: {sectorAverages.medianEVEBITDA.toFixed(1)}倍</div>
                    </div>
                    <div className="bg-orange-50 p-3 rounded">
                      <div className="text-orange-800 font-medium">平均PSR</div>
                      <div className="text-xl font-bold">{sectorAverages.avgPSR.toFixed(2)}倍</div>
                      <div className="text-xs text-orange-600">中央値: {sectorAverages.medianPSR.toFixed(2)}倍</div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-600">
                    サンプル数: {sectorAverages.count}社
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 類似企業一覧 */}
      <Card>
        <CardHeader>
          <CardTitle>類似企業一覧</CardTitle>
          <CardDescription>
            {getMultipleLabel(selectedMultiple)}での比較
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">企業名</th>
                  <th className="text-right p-2">コード</th>
                  <th className="text-right p-2">時価総額</th>
                  <th className="text-right p-2">売上高</th>
                  <th className="text-right p-2">{getMultipleLabel(selectedMultiple)}</th>
                  <th className="text-right p-2">対象企業比</th>
                </tr>
              </thead>
              <tbody>
                {targetCompany && (
                  <tr className="bg-red-50 font-medium">
                    <td className="p-2">{targetCompany.name} 【対象】</td>
                    <td className="text-right p-2">{targetCompany.code}</td>
                    <td className="text-right p-2">{(targetCompany.marketCap / 100000000).toFixed(2)}兆円</td>
                    <td className="text-right p-2">{targetCompany.revenue.toLocaleString()}億円</td>
                    <td className="text-right p-2">
                      {(selectedMultiple === 'per' ? targetCompany.per :
                        selectedMultiple === 'pbr' ? targetCompany.pbr :
                        selectedMultiple === 'evEbitda' ? targetCompany.evEbitda :
                        targetCompany.psr).toFixed(selectedMultiple === 'pbr' ? 2 : 1)}倍
                    </td>
                    <td className="text-right p-2">-</td>
                  </tr>
                )}
                {getComparisonTable().map((comp, index) => (
                  <tr key={comp.code} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                    <td className="p-2">{comp.name}</td>
                    <td className="text-right p-2">{comp.code}</td>
                    <td className="text-right p-2">{(comp.marketCap / 100000000).toFixed(2)}兆円</td>
                    <td className="text-right p-2">{comp.revenue.toLocaleString()}億円</td>
                    <td className="text-right p-2">{comp.currentMultiple.toFixed(selectedMultiple === 'pbr' ? 2 : 1)}倍</td>
                    <td className={`text-right p-2 font-medium ${
                      comp.isHigher ? 'text-red-600' : comp.isLower ? 'text-green-600' : 'text-gray-600'
                    }`}>
                      {comp.premium >= 0 ? '+' : ''}{comp.premium.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* バリュエーション含意 */}
      <Card>
        <CardHeader>
          <CardTitle>バリュエーション含意</CardTitle>
          <CardDescription>
            類似企業比較に基づく投資判断の示唆
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {getValuationImplications().map((implication, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                  <div>
                    <div className="font-medium">{implication.metric}</div>
                    <div className="text-2xl font-bold">{implication.value}倍</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">業界平均</div>
                    <div className="text-lg font-semibold">{implication.average}倍</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">プレミアム</div>
                    <div className={`text-lg font-bold ${
                      parseFloat(implication.premium) > 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {parseFloat(implication.premium) >= 0 ? '+' : ''}{implication.premium}%
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">解釈</div>
                    <div className="font-medium">{implication.interpretation}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}