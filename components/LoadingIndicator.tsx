'use client'

import { RefreshCw } from 'lucide-react'

interface LoadingIndicatorProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
}

export function LoadingIndicator({ message = '読み込み中...', size = 'md' }: LoadingIndicatorProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6', 
    lg: 'h-8 w-8'
  }

  return (
    <div className="flex items-center gap-2 text-blue-600">
      <RefreshCw className={`${sizeClasses[size]} animate-spin`} />
      <span className="text-sm">{message}</span>
    </div>
  )
}

export function SearchLoadingOverlay({ show }: { show: boolean }) {
  if (!show) return null
  
  return (
    <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-10 rounded-md">
      <LoadingIndicator message="検索中..." size="lg" />
    </div>
  )
}