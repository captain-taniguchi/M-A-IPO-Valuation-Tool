'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { calculateDCF, calculateTerminalValue } from '@/lib/financial-calculations'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts'
import { Tooltip } from '@/components/ui/Tooltip'
import { tooltips } from '@/lib/tooltips'

export default function DCFValuation() {
  const [formData, setFormData] = useState({
    cashFlows: ['', '', '', '', ''],
    discountRate: '',
    terminalGrowthRate: '',
  })

  const [results, setResults] = useState({
    presentValue: null as number | null,
    terminalValue: null as number | null,
    enterpriseValue: null as number | null,
  })

  const handleCashFlowChange = (index: number, value: string) => {
    const newCashFlows = [...formData.cashFlows]
    newCashFlows[index] = value
    setFormData({ ...formData, cashFlows: newCashFlows })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const calculateValuation = () => {
    const cashFlows = formData.cashFlows
      .filter(cf => cf !== '')
      .map(cf => parseFloat(cf))
    
    if (cashFlows.length === 0) return

    const discountRate = parseFloat(formData.discountRate)
    const growthRate = parseFloat(formData.terminalGrowthRate)
    
    const lastCashFlow = cashFlows[cashFlows.length - 1]
    const terminalValue = calculateTerminalValue(lastCashFlow, growthRate, discountRate)
    const presentValue = calculateDCF(cashFlows, terminalValue, discountRate)
    
    setResults({
      presentValue: calculateDCF(cashFlows, 0, discountRate),
      terminalValue: terminalValue,
      enterpriseValue: presentValue,
    })
  }

  const getChartData = () => {
    const cashFlows = formData.cashFlows
      .filter(cf => cf !== '')
      .map((cf, index) => ({
        year: `Year ${index + 1}`,
        cashFlow: parseFloat(cf) || 0,
      }))
    
    if (results.terminalValue && cashFlows.length > 0) {
      cashFlows.push({
        year: 'Terminal',
        cashFlow: results.terminalValue,
      })
    }
    
    return cashFlows
  }

  return (
    <div className="px-4 py-6">
      <h2 className="text-2xl font-bold mb-6">
        <Tooltip content={tooltips.dcf.description}>
          DCF法によるバリュエーション
        </Tooltip>
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>
              <Tooltip content={tooltips.cashFlow.description}>
                キャッシュフロー予測
              </Tooltip>
            </CardTitle>
            <CardDescription>将来のフリーキャッシュフローを入力（単位：百万円）</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {formData.cashFlows.map((cf, index) => (
                <div key={index}>
                  <label className="block text-sm font-medium mb-1">
                    {index + 1}年目のキャッシュフロー
                  </label>
                  <input
                    type="number"
                    value={cf}
                    onChange={(e) => handleCashFlowChange(index, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="例: 1000"
                  />
                </div>
              ))}
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  <Tooltip content={tooltips.discountRate.description}>
                    割引率（WACC）(%)
                  </Tooltip>
                </label>
                <input
                  type="number"
                  name="discountRate"
                  value={formData.discountRate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="例: 10"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  <Tooltip content={tooltips.terminalGrowthRate.description}>
                    永続成長率（%）
                  </Tooltip>
                </label>
                <input
                  type="number"
                  name="terminalGrowthRate"
                  value={formData.terminalGrowthRate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="例: 2"
                />
              </div>
              
              <button
                onClick={calculateValuation}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
              >
                企業価値を計算
              </button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>評価結果</CardTitle>
              <CardDescription>DCF法による企業価値</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">キャッシュフロー現在価値</span>
                  <span className="text-xl font-bold">
                    {results.presentValue !== null 
                      ? `¥${results.presentValue.toFixed(0)}M` 
                      : '-'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    <Tooltip content={tooltips.terminalValue.description}>
                      ターミナルバリュー
                    </Tooltip>
                  </span>
                  <span className="text-xl font-bold">
                    {results.terminalValue !== null 
                      ? `¥${results.terminalValue.toFixed(0)}M` 
                      : '-'}
                  </span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium">企業価値総額</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {results.enterpriseValue !== null 
                        ? `¥${results.enterpriseValue.toFixed(0)}M` 
                        : '-'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>キャッシュフロー推移</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={getChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="cashFlow" 
                    stroke="#3B82F6" 
                    name="キャッシュフロー (百万円)" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}