'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { TrendingUp, TrendingDown, DollarSign, BarChart3 } from 'lucide-react'

export default function Dashboard() {
  const metrics = [
    { title: 'ROE', value: '15.2%', change: '+2.1%', trend: 'up', icon: TrendingUp },
    { title: 'ROA', value: '8.5%', change: '-0.3%', trend: 'down', icon: TrendingDown },
    { title: '企業価値', value: '¥5.2B', change: '+12.5%', trend: 'up', icon: DollarSign },
    { title: 'PER', value: '22.4x', change: '+1.2x', trend: 'up', icon: BarChart3 },
  ]

  return (
    <div className="px-4 py-6">
      <h2 className="text-2xl font-bold mb-6">ダッシュボード</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric) => (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <metric.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className={`text-xs ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {metric.change} from last period
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>最近のバリュエーション</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>企業A - DCF法</span>
                <span className="font-semibold">¥3.2B</span>
              </div>
              <div className="flex justify-between items-center">
                <span>企業B - マルチプル法</span>
                <span className="font-semibold">¥1.8B</span>
              </div>
              <div className="flex justify-between items-center">
                <span>企業C - DCF法</span>
                <span className="font-semibold">¥5.5B</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>クイックアクセス</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <button className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <div className="text-blue-600 font-semibold">新規DCF分析</div>
              </button>
              <button className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                <div className="text-green-600 font-semibold">財務指標計算</div>
              </button>
              <button className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                <div className="text-purple-600 font-semibold">マルチプル分析</div>
              </button>
              <button className="p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                <div className="text-orange-600 font-semibold">レポート作成</div>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}