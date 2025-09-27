import * as React from 'react'
import { InfoIcon } from 'lucide-react'

interface TooltipProps {
  content: string
  children?: React.ReactNode
}

export function Tooltip({ content, children }: TooltipProps) {
  const [show, setShow] = React.useState(false)

  return (
    <div className="relative inline-block">
      <div
        className="inline-flex items-center gap-1"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        {children}
        <InfoIcon className="h-4 w-4 text-gray-400 cursor-help" />
      </div>
      {show && (
        <div className="absolute z-10 w-64 p-2 mt-1 text-sm text-white bg-gray-800 rounded-lg shadow-lg">
          {content}
        </div>
      )}
    </div>
  )
}