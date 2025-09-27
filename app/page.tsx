'use client'

import { useState } from 'react'
import Dashboard from '@/components/Dashboard'
import FinancialMetrics from '@/components/FinancialMetrics'
import DCFValuation from '@/components/DCFValuation'
import MultiplesValuation from '@/components/MultiplesValuation'
import RealtimeValuation from '@/components/RealtimeValuation'
import { HelpSection } from '@/components/ui/HelpSection'

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard')

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">投資銀行バリュエーションツール</h1>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-3 border-b-2 font-medium text-sm ${
                activeTab === 'dashboard'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              ダッシュボード
            </button>
            <button
              onClick={() => setActiveTab('metrics')}
              className={`py-4 px-3 border-b-2 font-medium text-sm ${
                activeTab === 'metrics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              財務指標
            </button>
            <button
              onClick={() => setActiveTab('dcf')}
              className={`py-4 px-3 border-b-2 font-medium text-sm ${
                activeTab === 'dcf'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              DCF法
            </button>
            <button
              onClick={() => setActiveTab('multiples')}
              className={`py-4 px-3 border-b-2 font-medium text-sm ${
                activeTab === 'multiples'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              マルチプル法
            </button>
            <button
              onClick={() => setActiveTab('realtime')}
              className={`py-4 px-3 border-b-2 font-medium text-sm ${
                activeTab === 'realtime'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              リアルタイム分析
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {activeTab === 'dashboard' && (
          <>
            <Dashboard />
            <HelpSection />
          </>
        )}
        {activeTab === 'metrics' && <FinancialMetrics />}
        {activeTab === 'dcf' && <DCFValuation />}
        {activeTab === 'multiples' && <MultiplesValuation />}
        {activeTab === 'realtime' && <RealtimeValuation />}
      </main>
    </div>
  )
}