'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { calculateROE, calculateROA, calculateROIC, calculateEPS } from '@/lib/financial-calculations'
import { Tooltip } from '@/components/ui/Tooltip'
import { tooltips } from '@/lib/tooltips'

export default function FinancialMetrics() {
  const [formData, setFormData] = useState({
    netIncome: '',
    shareholdersEquity: '',
    totalAssets: '',
    investedCapital: '',
    sharesOutstanding: '',
  })

  const [results, setResults] = useState({
    roe: null as number | null,
    roa: null as number | null,
    roic: null as number | null,
    eps: null as number | null,
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const calculateMetrics = () => {
    const netIncome = parseFloat(formData.netIncome)
    const shareholdersEquity = parseFloat(formData.shareholdersEquity)
    const totalAssets = parseFloat(formData.totalAssets)
    const investedCapital = parseFloat(formData.investedCapital)
    const sharesOutstanding = parseFloat(formData.sharesOutstanding)

    setResults({
      roe: calculateROE(netIncome, shareholdersEquity),
      roa: calculateROA(netIncome, totalAssets),
      roic: calculateROIC(netIncome, investedCapital),
      eps: calculateEPS(netIncome, sharesOutstanding),
    })
  }

  return (
    <div className="px-4 py-6">
      <h2 className="text-2xl font-bold mb-6">財務指標計算</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>入力データ</CardTitle>
            <CardDescription>財務データを入力してください（単位：百万円）</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  <Tooltip content={tooltips.netIncome.description}>
                    純利益
                  </Tooltip>
                </label>
                <input
                  type="number"
                  name="netIncome"
                  value={formData.netIncome}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="例: 1000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  <Tooltip content={tooltips.shareholdersEquity.description}>
                    株主資本
                  </Tooltip>
                </label>
                <input
                  type="number"
                  name="shareholdersEquity"
                  value={formData.shareholdersEquity}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="例: 5000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  <Tooltip content={tooltips.totalAssets.description}>
                    総資産
                  </Tooltip>
                </label>
                <input
                  type="number"
                  name="totalAssets"
                  value={formData.totalAssets}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="例: 10000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  <Tooltip content={tooltips.investedCapital.description}>
                    投下資本
                  </Tooltip>
                </label>
                <input
                  type="number"
                  name="investedCapital"
                  value={formData.investedCapital}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="例: 7000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  <Tooltip content={tooltips.sharesOutstanding.description}>
                    発行済株式数（千株）
                  </Tooltip>
                </label>
                <input
                  type="number"
                  name="sharesOutstanding"
                  value={formData.sharesOutstanding}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="例: 1000"
                />
              </div>
              <button
                onClick={calculateMetrics}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
              >
                計算する
              </button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>計算結果</CardTitle>
            <CardDescription>主要財務指標</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="border-b pb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-lg font-medium">
                    <Tooltip content={tooltips.roe.description}>
                      ROE（自己資本利益率）
                    </Tooltip>
                  </span>
                  <span className="text-2xl font-bold text-blue-600">
                    {results.roe !== null ? `${results.roe.toFixed(2)}%` : '-'}
                  </span>
                </div>
                <p className="text-sm text-gray-600">純利益 ÷ 株主資本 × 100</p>
              </div>

              <div className="border-b pb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-lg font-medium">
                    <Tooltip content={tooltips.roa.description}>
                      ROA（総資産利益率）
                    </Tooltip>
                  </span>
                  <span className="text-2xl font-bold text-green-600">
                    {results.roa !== null ? `${results.roa.toFixed(2)}%` : '-'}
                  </span>
                </div>
                <p className="text-sm text-gray-600">純利益 ÷ 総資産 × 100</p>
              </div>

              <div className="border-b pb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-lg font-medium">
                    <Tooltip content={tooltips.roic.description}>
                      ROIC（投下資本利益率）
                    </Tooltip>
                  </span>
                  <span className="text-2xl font-bold text-purple-600">
                    {results.roic !== null ? `${results.roic.toFixed(2)}%` : '-'}
                  </span>
                </div>
                <p className="text-sm text-gray-600">純利益 ÷ 投下資本 × 100</p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-lg font-medium">
                    <Tooltip content={tooltips.eps.description}>
                      EPS（1株当たり利益）
                    </Tooltip>
                  </span>
                  <span className="text-2xl font-bold text-orange-600">
                    {results.eps !== null ? `¥${results.eps.toFixed(2)}` : '-'}
                  </span>
                </div>
                <p className="text-sm text-gray-600">純利益 ÷ 発行済株式数</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}