'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import KanbanBoard from '@/components/KanbanBoard'
import { ContentItem, Column } from '@/types'
import { parseAnyDate, formatDate } from '@/components/DatePicker'

type ViewFilter = 'this-week' | 'next-week' | 'all'

// Debounce helper
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

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

// Get week boundaries based on actual current date
const getWeekBoundaries = () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dayOfWeek = today.getDay()

  // This week: Sunday to Saturday containing today
  const thisWeekStart = new Date(today)
  thisWeekStart.setDate(today.getDate() - dayOfWeek)
  const thisWeekEnd = new Date(thisWeekStart)
  thisWeekEnd.setDate(thisWeekStart.getDate() + 6)

  // Next week: Sunday to Saturday after this week
  const nextWeekStart = new Date(thisWeekEnd)
  nextWeekStart.setDate(thisWeekEnd.getDate() + 1)
  const nextWeekEnd = new Date(nextWeekStart)
  nextWeekEnd.setDate(nextWeekStart.getDate() + 6)

  return { today, thisWeekStart, thisWeekEnd, nextWeekStart, nextWeekEnd }
}

const filterDataByView = (data: Record<Column, ContentItem[]>, view: ViewFilter): Record<Column, ContentItem[]> => {
  if (view === 'all') return data

  const { thisWeekStart, thisWeekEnd, nextWeekStart, nextWeekEnd } = getWeekBoundaries()

  const isInRange = (item: ContentItem, start: Date, end: Date): boolean => {
    const date = parseAnyDate(item.date)
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
  const { today, thisWeekStart, thisWeekEnd, nextWeekStart, nextWeekEnd } = getWeekBoundaries()

  const formatRange = (start: Date, end: Date) => {
    const startMonth = MONTHS[start.getMonth()]
    const endMonth = MONTHS[end.getMonth()]
    const year = end.getFullYear()

    if (startMonth === endMonth) {
      return `${startMonth} ${start.getDate()} - ${end.getDate()}, ${year}`
    }
    return `${startMonth} ${start.getDate()} - ${endMonth} ${end.getDate()}, ${year}`
  }

  if (view === 'this-week') {
    return `This Week: ${formatRange(thisWeekStart, thisWeekEnd)}`
  }
  if (view === 'next-week') {
    return `Next Week: ${formatRange(nextWeekStart, nextWeekEnd)}`
  }
  return 'All Content'
}

export default function Home() {
  const [data, setData] = useState<Record<Column, ContentItem[]>>(initialData)
  const [view, setView] = useState<ViewFilter>('this-week')
  const [currentDate, setCurrentDate] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isInitialMount = useRef(true)

  // Debounce data changes for auto-save (2 second delay)
  const debouncedData = useDebounce(data, 2000)

  // Load data from Google Sheets on mount
  useEffect(() => {
    const now = new Date()
    setCurrentDate(formatDate(now))

    async function loadData() {
      try {
        const response = await fetch('/api/sheets')
        if (response.ok) {
          const sheetData = await response.json()
          // Only use sheet data if it has content
          const hasContent = Object.values(sheetData).some((arr: any) => arr.length > 0)
          if (hasContent) {
            setData(sheetData)
          }
        } else {
          // Fallback to localStorage if API fails
          const saved = localStorage.getItem('kanban-data')
          if (saved) {
            setData(JSON.parse(saved))
          }
        }
      } catch (err) {
        console.error('Failed to load from Google Sheets, using localStorage:', err)
        const saved = localStorage.getItem('kanban-data')
        if (saved) {
          setData(JSON.parse(saved))
        }
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Save to Google Sheets when debounced data changes
  useEffect(() => {
    // Skip initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }

    // Skip if still loading initial data
    if (loading) return

    async function saveData() {
      setSaving(true)
      setError(null)

      try {
        // Always save to localStorage as backup
        localStorage.setItem('kanban-data', JSON.stringify(debouncedData))

        // Save to Google Sheets
        const response = await fetch('/api/sheets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(debouncedData),
        })

        if (!response.ok) {
          throw new Error('Failed to save to Google Sheets')
        }
      } catch (err) {
        console.error('Save error:', err)
        setError('Failed to sync with Google Sheets')
      } finally {
        setSaving(false)
      }
    }

    saveData()
  }, [debouncedData, loading])

  const displayData = filterDataByView(data, view)

  const totalViews = data.published.reduce((sum, item) => sum + (item.views || 0), 0)
  const totalSubs = data.published.reduce((sum, item) => sum + (item.subs || 0), 0)
  const totalShorts = Object.values(data).flat().filter(item => item.type === 'short').length
  const totalStories = Object.values(data).flat().filter(item => item.type === 'story').length

  if (loading) {
    return (
      <main className="min-h-screen p-5 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading from Google Sheets...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen p-5 text-white">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
          Rome&apos;s Storybook Content Board
        </h1>
        <p className="text-gray-400 text-sm mt-1">{getWeekLabel(view)}</p>
        <div className="flex items-center justify-center gap-2 mt-1">
          {currentDate && (
            <p className="text-gray-500 text-xs">Today: {currentDate}</p>
          )}
          {saving && (
            <span className="text-xs text-yellow-400 flex items-center gap-1">
              <span className="animate-pulse">●</span> Syncing...
            </span>
          )}
          {!saving && !error && !loading && (
            <span className="text-xs text-green-400 flex items-center gap-1">
              ● Synced
            </span>
          )}
          {error && (
            <span className="text-xs text-red-400 flex items-center gap-1">
              ● {error}
            </span>
          )}
        </div>
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
          <p className="text-gray-400 text-sm">Total Views</p>
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
