'use client'

import { ContentItem, Column } from '@/types'

interface CardProps {
  item: ContentItem
  column: Column
  onDragStart: () => void
  onClick: () => void
}

const columnColors: Record<Column, { border: string; text: string }> = {
  ideas: { border: 'border-l-purple-500', text: 'text-purple-500' },
  production: { border: 'border-l-blue-500', text: 'text-blue-500' },
  review: { border: 'border-l-yellow-500', text: 'text-yellow-500' },
  published: { border: 'border-l-green-500', text: 'text-green-500' },
}

const formatTypeLabel = (type: string) => {
  if (type === 'long') return 'Long Form'
  return type
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export default function Card({ item, column, onDragStart, onClick }: CardProps) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      className={`bg-white/[0.08] rounded-lg p-3 cursor-pointer hover:bg-white/[0.12] hover:translate-x-1 transition-all border-l-4 ${columnColors[column].border}`}
    >
      <div className={`text-[10px] uppercase font-bold tracking-wide mb-1 ${columnColors[column].text}`}>
        {formatTypeLabel(item.type)}
      </div>
      <div className="text-sm font-semibold mb-2 leading-tight">{item.title}</div>
      <div className="flex flex-wrap gap-1.5">
        <span className="bg-white/5 px-2 py-0.5 rounded text-[11px] text-gray-400">{item.theme}</span>
        <span className="bg-white/5 px-2 py-0.5 rounded text-[11px] text-gray-400">{item.date}</span>
        {item.time && (
          <span className="bg-white/5 px-2 py-0.5 rounded text-[11px] text-gray-400">{item.time}</span>
        )}
      </div>
      {(item.views !== undefined || item.subs !== undefined) && (
        <div className="mt-2 pt-2 border-t border-white/10 flex gap-4 text-xs">
          {item.views !== undefined && (
            <span className="text-blue-400">{item.views.toLocaleString()} views</span>
          )}
          {item.subs !== undefined && (
            <span className="text-green-400">+{item.subs} subs</span>
          )}
        </div>
      )}
    </div>
  )
}
