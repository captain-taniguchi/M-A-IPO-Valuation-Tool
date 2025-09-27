'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react'

export function EDINETStatus() {
  const [status, setStatus] = useState<'checking' | 'success' | 'error' | 'idle'>('idle')
  const [lastCheck, setLastCheck] = useState<string>('')
  const [testResult, setTestResult] = useState<any>(null)

  const testEDINETConnection = async () => {
    setStatus('checking')
    try {
      // シンプルな接続テスト
      const response = await fetch('/api/edinet/status')
      
      if (response.ok) {
        const data = await response.json()
        setStatus(data.success ? 'success' : 'error')
        setTestResult(data)
        setLastCheck(new Date().toLocaleString('ja-JP'))
      } else {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }))
        setStatus('error')
        setTestResult(errorData)
      }
    } catch (error) {
      setStatus('error')
      setTestResult({ error: error instanceof Error ? error.message : 'Network error' })
      setLastCheck(new Date().toLocaleString('ja-JP'))
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'checking': return <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error': return <XCircle className="h-5 w-5 text-red-500" />
      default: return <AlertCircle className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'checking': return 'EDINET APIに接続中...'
      case 'success': return 'EDINET API接続成功'
      case 'error': return 'EDINET API接続エラー'
      default: return 'EDINET API未テスト'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          EDINET API接続状況
        </CardTitle>
        <CardDescription>
          金融庁EDINETから実際のデータを取得できるかテストします
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{getStatusText()}</span>
            <button
              onClick={testEDINETConnection}
              disabled={status === 'checking'}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:bg-gray-400"
            >
              接続テスト
            </button>
          </div>
          
          {lastCheck && (
            <div className="text-xs text-gray-500">
              最終確認: {lastCheck}
            </div>
          )}
          
          {testResult && (
            <div className="mt-4 p-3 bg-gray-50 rounded text-xs">
              <div className="font-semibold mb-2">テスト結果:</div>
              {status === 'success' ? (
                <div className="space-y-1">
                  <div>✓ {testResult.message}</div>
                  <div>✓ ステータス: {testResult.status}</div>
                  <div>✓ 日付: {testResult.date}</div>
                  <div>✓ 書類数: {testResult.documentsCount}件</div>
                </div>
              ) : (
                <div className="text-red-600">
                  ✗ エラー: {testResult.error}
                </div>
              )}
            </div>
          )}
          
          <div className="text-xs text-gray-600 space-y-1">
            <div><strong>取得可能データ:</strong></div>
            <div>• 有価証券報告書（年次）</div>
            <div>• 四半期報告書</div>
            <div>• 決算短信</div>
            <div>• 全上場企業 + 一部非上場企業</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}