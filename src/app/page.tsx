'use client'

import { useState, useEffect } from 'react'
import KanbanBoard from '@/components/KanbanBoard'
import { ContentItem, Column } from '@/types'

type ViewFilter = 'this-week' | 'next-week' | 'all'

const initialData: Record<Column, ContentItem[]> = {
  ideas: [
    { id: '1', type: 'short', title: 'When the floor is actually lava', theme: 'Humor/Play', date: 'Future' },
    { id: '2', type: 'short', title: 'When you bring the WHOLE house to school', theme: 'Humor', date: 'Jan 31' },
  ],
  production: [
    { id: '3', type: 'story', title: 'Rome and the Golden King (Mansa Musa)', theme: 'BHM', date: 'Fri Jan 31', time: '7:00 PM' },
    { id: '4', type: 'short', title: "I ain't scared of the dark", theme: 'Courage', date: 'Thu Jan 29', time: '4:00 PM' },
    { id: '5', type: 'short', title: 'When the fade is too fresh', theme: 'Identity', date: 'Tue Jan 27', time: '4:00 PM' },
    { id: '6', type: 'short', title: 'When the broccoli looks at you funny', theme: 'Health', date: 'Wed Jan 28', time: '3:30 PM' },
  ],
  review: [
    { id: '7', type: 'song', title: 'I Love My Hair - DistroKid', theme: 'Identity', date: 'Fri Jan 31' },
    { id: '8', type: 'song', title: 'I Am A King', theme: 'BHM/Identity', date: 'Sat Feb 1' },
    { id: '9', type: 'short', title: 'When you hype yourself up before school', theme: 'Affirmations', date: 'Fri Jan 30', time: '3:00 PM' },
  ],
  published: [
    { id: '10', type: 'short', title: 'When the letter F gets outta control', theme: 'ABC', date: 'Mon Jan 26', views: 971, subs: 3 },
    { id: '11', type: 'short', title: 'When flying hits different', theme: 'Adventure', date: 'Sun Jan 25', views: 894, subs: 0 },
  ],
}

// Helper to parse dates from our format
const parseDate = (dateStr: string): Date | null => {
  if (dateStr === 'Future' || dateStr === 'TBD') return null

  // Handle formats like "Fri Jan 31", "Mon Jan 26", "Jan 31", "Feb 3"
  const months: Record<string, number> = {
    'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
    'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
  }

  const parts = dateStr.split(' ')
  let month: number | undefined
  let day: number | undefined

  for (const part of parts) {
    if (months[part] !== undefined) {
      month = months[part]
    }
    const num = parseInt(part)
    if (!isNaN(num) && num >= 1 && num <= 31) {
      day = num
    }
  }

  if (month !== undefined && day !== undefined) {
    return new Date(2026, month, day)
  }
  return null
}

// Get week boundaries
const getWeekBoundaries = () => {
  const today = new Date(2026, 0, 29) // Jan 29, 2026 (current date)
  const dayOfWeek = today.getDay()

  // This week: Sun Jan 26 - Sat Feb 1
  const thisWeekStart = new Date(today)
  thisWeekStart.setDate(today.getDate() - dayOfWeek)
  const thisWeekEnd = new Date(thisWeekStart)
  thisWeekEnd.setDate(thisWeekStart.getDate() + 6)

  // Next week: Sun Feb 2 - Sat Feb 8
  const nextWeekStart = new Date(thisWeekEnd)
  nextWeekStart.setDate(thisWeekEnd.getDate() + 1)
  const nextWeekEnd = new Date(nextWeekStart)
  nextWeekEnd.setDate(nextWeekStart.getDate() + 6)

  return { thisWeekStart, thisWeekEnd, nextWeekStart, nextWeekEnd }
}

const filterDataByView = (data: Record<Column, ContentItem[]>, view: ViewFilter): Record<Column, ContentItem[]> => {
  if (view === 'all') return data

  const { thisWeekStart, thisWeekEnd, nextWeekStart, nextWeekEnd } = getWeekBoundaries()

  const isInRange = (item: ContentItem, start: Date, end: Date): boolean => {
    const date = parseDate(item.date)
    if (!date) return false // Exclude Future/TBD items in filtered views
    return date >= start && date <= end
  }

  const filtered: Record<Column, ContentItem[]> = {
    ideas: [],
    production: [],
    review: [],
    published: [],
  }

  for (const column of ['ideas', 'production', 'review', 'published'] as Column[]) {
    filtered[column] = data[column].filter(item => {
      if (view === 'this-week') {
        return isInRange(item, thisWeekStart, thisWeekEnd)
      } else {
        return isInRange(item, nextWeekStart, nextWeekEnd)
      }
    })
  }

  return filtered
}

const getWeekLabel = (view: ViewFilter): string => {
  if (view === 'this-week') return 'Week of Jan 27 - Feb 2, 2026'
  if (view === 'next-week') return 'Week of Feb 3 - Feb 9, 2026'
  return 'All Content'
}

export default function Home() {
  const [data, setData] = useState<Record<Column, ContentItem[]>>(initialData)
  const [view, setView] = useState<ViewFilter>('this-week')

  useEffect(() => {
    const saved = localStorage.getItem('kanban-data')
    if (saved) {
      setData(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('kanban-data', JSON.stringify(data))
  }, [data])

  const displayData = filterDataByView(data, view)

  const totalViews = data.published.reduce((sum, item) => sum + (item.views || 0), 0)
  const totalSubs = data.published.reduce((sum, item) => sum + (item.subs || 0), 0)
  const totalShorts = Object.values(data).flat().filter(item => item.type === 'short').length
  const totalStories = Object.values(data).flat().filter(item => item.type === 'story').length

  return (
    <main className="min-h-screen p-5 text-white">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
          Rome&apos;s Storybook Content Board
        </h1>
        <p className="text-gray-400 text-sm mt-1">{getWeekLabel(view)}</p>
      </header>

      <div className="flex justify-center gap-3 mb-6">
        <button
          onClick={() => setView('this-week')}
          className={`px-4 py-2 rounded-full font-semibold transition ${
            view === 'this-week'
              ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900'
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          This Week
        </button>
        <button
          onClick={() => setView('next-week')}
          className={`px-4 py-2 rounded-full font-semibold transition ${
            view === 'next-week'
              ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900'
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          Next Week
        </button>
        <button
          onClick={() => setView('all')}
          className={`px-4 py-2 rounded-full font-semibold transition ${
            view === 'all'
              ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900'
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          All Content
        </button>
      </div>

      <KanbanBoard data={displayData} setData={setData} />

      <div className="max-w-6xl mx-auto mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/5 rounded-xl p-5 text-center">
          <h3 className="text-3xl font-bold text-blue-400">{totalViews.toLocaleString()}</h3>
          <p className="text-gray-400 text-sm">Total Views This Week</p>
        </div>
        <div className="bg-white/5 rounded-xl p-5 text-center">
          <h3 className="text-3xl font-bold text-green-400">+{totalSubs}</h3>
          <p className="text-gray-400 text-sm">Subscribers Gained</p>
        </div>
        <div className="bg-white/5 rounded-xl p-5 text-center">
          <h3 className="text-3xl font-bold text-red-400">{totalShorts}</h3>
          <p className="text-gray-400 text-sm">Shorts Total</p>
        </div>
        <div className="bg-white/5 rounded-xl p-5 text-center">
          <h3 className="text-3xl font-bold text-purple-400">{totalStories}</h3>
          <p className="text-gray-400 text-sm">Stories in Production</p>
        </div>
      </div>
    </main>
  )
}
