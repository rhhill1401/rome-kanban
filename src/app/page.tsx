'use client'

import { useState, useEffect } from 'react'
import KanbanBoard from '@/components/KanbanBoard'
import { ContentItem, Column } from '@/types'

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

export default function Home() {
  const [data, setData] = useState<Record<Column, ContentItem[]>>(initialData)

  useEffect(() => {
    const saved = localStorage.getItem('kanban-data')
    if (saved) {
      setData(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('kanban-data', JSON.stringify(data))
  }, [data])

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
        <p className="text-gray-400 text-sm mt-1">Week of Jan 27 - Feb 2, 2026</p>
      </header>

      <div className="flex justify-center gap-3 mb-6">
        <button className="px-4 py-2 rounded-full font-semibold bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900">
          This Week
        </button>
        <button className="px-4 py-2 rounded-full font-semibold bg-white/10 text-white hover:bg-white/20 transition">
          Next Week
        </button>
        <button className="px-4 py-2 rounded-full font-semibold bg-white/10 text-white hover:bg-white/20 transition">
          All Content
        </button>
      </div>

      <KanbanBoard data={data} setData={setData} />

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
