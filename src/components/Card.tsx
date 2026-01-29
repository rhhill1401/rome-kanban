'use client'

import { ContentItem } from '@/types'

interface CardProps {
  item: ContentItem
  onDragStart: () => void
  onClick: () => void
}

const typeColors = {
  short: 'border-l-red-500',
  story: 'border-l-purple-500',
  song: 'border-l-teal-500',
}

const typeTextColors = {
  short: 'text-red-500',
  story: 'text-purple-500',
  song: 'text-teal-500',
}

export default function Card({ item, onDragStart, onClick }: CardProps) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      className={`bg-white/[0.08] rounded-lg p-3 cursor-pointer hover:bg-white/[0.12] hover:translate-x-1 transition-all border-l-4 ${typeColors[item.type]}`}
    >
      <div className={`text-[10px] uppercase font-bold tracking-wide mb-1 ${typeTextColors[item.type]}`}>
        {item.type === 'song' ? 'Song Release' : item.type}
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
