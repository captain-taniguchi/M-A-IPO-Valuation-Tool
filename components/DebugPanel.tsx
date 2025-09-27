'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

interface DebugPanelProps {
  logs: string[]
  isLoading: boolean
  searchResults: any[]
  selectedCompany: any
}

export function DebugPanel({ logs, isLoading, searchResults, selectedCompany }: DebugPanelProps) {
  const [showDebug, setShowDebug] = useState(false)

  if (!showDebug) {
    return (
      <button 
        onClick={() => setShowDebug(true)}
        className="fixed bottom-4 right-4 bg-gray-800 text-white px-3 py-1 rounded text-xs z-50"
      >
        DEBUG
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white border rounded-lg shadow-lg z-50 max-h-96 overflow-auto">
      <div className="flex justify-between items-center p-2 border-b">
        <span className="font-medium text-sm">デバッグ情報</span>
        <button 
          onClick={() => setShowDebug(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
      </div>
      <div className="p-2 space-y-2 text-xs">
        <div>
          <strong>状態:</strong> {isLoading ? 'ローディング中' : 'アイドル'}
        </div>
        <div>
          <strong>検索結果:</strong> {searchResults.length}件
        </div>
        <div>
          <strong>選択企業:</strong> {selectedCompany ? selectedCompany.companyName : 'なし'}
        </div>
        <div>
          <strong>ログ:</strong>
          <div className="max-h-32 overflow-y-auto bg-gray-50 p-1 mt-1">
            {logs.slice(-10).map((log, index) => (
              <div key={index} className="text-xs">{log}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}