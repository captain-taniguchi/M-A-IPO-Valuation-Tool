'use client'

import { useState } from 'react'
import { searchCompanyFast, getCompanyFinancialDataFast } from '@/lib/api-optimized'

export function QuickTest() {
  const [testResult, setTestResult] = useState<string>('')
  const [isRunning, setIsRunning] = useState(false)

  const runTest = async () => {
    setIsRunning(true)
    setTestResult('テスト開始...\n')
    
    try {
      // 1. 検索テスト
      setTestResult(prev => prev + '1. 検索テスト中...\n')
      const searchResults = await searchCompanyFast('7203')
      setTestResult(prev => prev + `検索結果: ${searchResults.length}件\n`)
      
      if (searchResults.length > 0) {
        // 2. データ取得テスト
        setTestResult(prev => prev + '2. データ取得テスト中...\n')
        const companyData = await getCompanyFinancialDataFast('7203')
        setTestResult(prev => prev + `データ取得: ${companyData ? '成功' : '失敗'}\n`)
        
        if (companyData) {
          setTestResult(prev => prev + `企業名: ${companyData.companyName}\n`)
          setTestResult(prev => prev + `売上: ${companyData.revenue}百万円\n`)
        }
      }
      
      setTestResult(prev => prev + '\n✅ テスト完了')
    } catch (error) {
      setTestResult(prev => prev + `\n❌ エラー: ${error}`)
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-medium text-yellow-800">API動作テスト</h4>
        <button
          onClick={runTest}
          disabled={isRunning}
          className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700 disabled:bg-gray-400"
        >
          {isRunning ? 'テスト中...' : 'テスト実行'}
        </button>
      </div>
      {testResult && (
        <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-32">
          {testResult}
        </pre>
      )}
    </div>
  )
}