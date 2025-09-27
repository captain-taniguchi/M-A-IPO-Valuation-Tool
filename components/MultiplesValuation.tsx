'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { calculatePER, calculatePBR, calculateEVEBITDA } from '@/lib/financial-calculations'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts'
import { Tooltip } from '@/components/ui/Tooltip'
import { tooltips } from '@/lib/tooltips'

export default function MultiplesValuation() {
  const [formData, setFormData] = useState({
    stockPrice: '',
    eps: '',
    bookValuePerShare: '',
    enterpriseValue: '',
    ebitda: '',
    comparablePER: '',
    comparablePBR: '',
    comparableEVEBITDA: '',
  })

  const [results, setResults] = useState({
    per: null as number | null,
    pbr: null as number | null,
    evEbitda: null as number | null,
    impliedValuePER: null as number | null,
    impliedValuePBR: null as number | null,
    impliedValueEVEBITDA: null as number | null,
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const calculateMultiples = () => {
    const stockPrice = parseFloat(formData.stockPrice)
    const eps = parseFloat(formData.eps)
    const bookValuePerShare = parseFloat(formData.bookValuePerShare)
    const enterpriseValue = parseFloat(formData.enterpriseValue)
    const ebitda = parseFloat(formData.ebitda)
    const comparablePER = parseFloat(formData.comparablePER)
    const comparablePBR = parseFloat(formData.comparablePBR)
    const comparableEVEBITDA = parseFloat(formData.comparableEVEBITDA)

    const per = calculatePER(stockPrice, eps)
    const pbr = calculatePBR(stockPrice, bookValuePerShare)
    const evEbitda = calculateEVEBITDA(enterpriseValue, ebitda)

    setResults({
      per,
      pbr,
      evEbitda,
      impliedValuePER: eps * comparablePER || null,
      impliedValuePBR: bookValuePerShare * comparablePBR || null,
      impliedValueEVEBITDA: (ebitda * comparableEVEBITDA) || null,
    })
  }

  const getChartData = () => {
    return [
      {
        name: 'PER',
        現在: results.per || 0,
        類似企業: parseFloat(formData.comparablePER) || 0,
      },
      {
        name: 'PBR',
        現在: results.pbr || 0,
        類似企業: parseFloat(formData.comparablePBR) || 0,
      },
      {
        name: 'EV/EBITDA',
        現在: results.evEbitda || 0,
        類似企業: parseFloat(formData.comparableEVEBITDA) || 0,
      },
    ]
  }

  return (
    <div className="px-4 py-6">
      <h2 className="text-2xl font-bold mb-6">
        <Tooltip content={tooltips.multiples.description}>
          マルチプル法によるバリュエーション
        </Tooltip>
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>財務データ入力</CardTitle>
            <CardDescription>対象企業の財務データを入力</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    <Tooltip content={tooltips.stockPrice.description}>
                      株価（円）
                    </Tooltip>
                  </label>
                  <input
                    type="number"
                    name="stockPrice"
                    value={formData.stockPrice}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="例: 3000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    <Tooltip content={tooltips.eps.description}>
                      EPS（円）
                    </Tooltip>
                  </label>
                  <input
                    type="number"
                    name="eps"
                    value={formData.eps}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="例: 150"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  <Tooltip content={tooltips.bookValuePerShare.description}>
                    1株当たり純資産（円）
                  </Tooltip>
                </label>
                <input
                  type="number"
                  name="bookValuePerShare"
                  value={formData.bookValuePerShare}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="例: 2000"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    <Tooltip content={tooltips.enterpriseValue.description}>
                      企業価値（百万円）
                    </Tooltip>
                  </label>
                  <input
                    type="number"
                    name="enterpriseValue"
                    value={formData.enterpriseValue}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="例: 50000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    <Tooltip content={tooltips.ebitda.description}>
                      EBITDA（百万円）
                    </Tooltip>
                  </label>
                  <input
                    type="number"
                    name="ebitda"
                    value={formData.ebitda}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="例: 5000"
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">類似企業マルチプル</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      <Tooltip content={tooltips.per.description}>
                        PER
                      </Tooltip>
                    </label>
                    <input
                      type="number"
                      name="comparablePER"
                      value={formData.comparablePER}
                      onChange={handleInputChange}
                      className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                      placeholder="例: 25"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      <Tooltip content={tooltips.pbr.description}>
                        PBR
                      </Tooltip>
                    </label>
                    <input
                      type="number"
                      name="comparablePBR"
                      value={formData.comparablePBR}
                      onChange={handleInputChange}
                      className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                      placeholder="例: 2"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      <Tooltip content={tooltips.evEbitda.description}>
                        EV/EBITDA
                      </Tooltip>
                    </label>
                    <input
                      type="number"
                      name="comparableEVEBITDA"
                      value={formData.comparableEVEBITDA}
                      onChange={handleInputChange}
                      className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                      placeholder="例: 12"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={calculateMultiples}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
              >
                マルチプルを計算
              </button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>マルチプル分析結果</CardTitle>
              <CardDescription>現在のマルチプルと推定価値</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">
                      <Tooltip content={`${tooltips.per.description} 計算式: ${tooltips.per.formula}`}>
                        PER（株価収益率）
                      </Tooltip>
                    </span>
                    <span className="text-xl font-bold">
                      {results.per !== null ? `${results.per.toFixed(1)}x` : '-'}
                    </span>
                  </div>
                  {results.impliedValuePER && (
                    <p className="text-sm text-gray-600">
                      推定株価: ¥{results.impliedValuePER.toFixed(0)}
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">
                      <Tooltip content={`${tooltips.pbr.description} 計算式: ${tooltips.pbr.formula}`}>
                        PBR（株価純資産倍率）
                      </Tooltip>
                    </span>
                    <span className="text-xl font-bold">
                      {results.pbr !== null ? `${results.pbr.toFixed(2)}x` : '-'}
                    </span>
                  </div>
                  {results.impliedValuePBR && (
                    <p className="text-sm text-gray-600">
                      推定株価: ¥{results.impliedValuePBR.toFixed(0)}
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">
                      <Tooltip content={`${tooltips.evEbitda.description} 計算式: ${tooltips.evEbitda.formula}`}>
                        EV/EBITDA
                      </Tooltip>
                    </span>
                    <span className="text-xl font-bold">
                      {results.evEbitda !== null ? `${results.evEbitda.toFixed(1)}x` : '-'}
                    </span>
                  </div>
                  {results.impliedValueEVEBITDA && (
                    <p className="text-sm text-gray-600">
                      推定企業価値: ¥{results.impliedValueEVEBITDA.toFixed(0)}M
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>マルチプル比較</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={getChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="現在" fill="#3B82F6" />
                  <Bar dataKey="類似企業" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}