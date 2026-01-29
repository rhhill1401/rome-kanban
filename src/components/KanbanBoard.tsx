'use client'

import { useState } from 'react'
import { ContentItem, Column } from '@/types'
import Card from './Card'
import EditModal from './EditModal'

interface KanbanBoardProps {
  data: Record<Column, ContentItem[]>
  setData: (data: Record<Column, ContentItem[]>) => void
}

const columns: { id: Column; title: string; color: string }[] = [
  { id: 'ideas', title: 'Ideas', color: 'bg-purple-500' },
  { id: 'production', title: 'In Production', color: 'bg-blue-500' },
  { id: 'review', title: 'Ready / Review', color: 'bg-yellow-500' },
  { id: 'published', title: 'Published', color: 'bg-green-500' },
]

export default function KanbanBoard({ data, setData }: KanbanBoardProps) {
  const [draggedItem, setDraggedItem] = useState<{ item: ContentItem; fromColumn: Column } | null>(null)
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null)

  const handleDragStart = (item: ContentItem, column: Column) => {
    setDraggedItem({ item, fromColumn: column })
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (toColumn: Column) => {
    if (!draggedItem) return

    const { item, fromColumn } = draggedItem

    if (fromColumn === toColumn) {
      setDraggedItem(null)
      return
    }

    const newData = { ...data }
    newData[fromColumn] = newData[fromColumn].filter(i => i.id !== item.id)
    newData[toColumn] = [...newData[toColumn], item]

    setData(newData)
    setDraggedItem(null)
  }

  const handleAddCard = (column: Column) => {
    const title = prompt('Enter content title:')
    if (!title) return

    const typeInput = prompt('Type (short/story/song):') || 'short'
    const type = ['short', 'story', 'song'].includes(typeInput) ? typeInput as ContentItem['type'] : 'short'

    const newItem: ContentItem = {
      id: Date.now().toString(),
      type,
      title,
      theme: 'New',
      date: 'TBD',
    }

    const newData = { ...data }
    newData[column] = [...newData[column], newItem]
    setData(newData)
  }

  const handleEditCard = (updatedItem: ContentItem) => {
    const newData = { ...data }
    for (const column of columns) {
      const index = newData[column.id].findIndex(item => item.id === updatedItem.id)
      if (index !== -1) {
        newData[column.id][index] = updatedItem
        break
      }
    }
    setData({ ...newData })
  }

  const handleDeleteCard = (id: string) => {
    const newData = { ...data }
    for (const column of columns) {
      newData[column.id] = newData[column.id].filter(item => item.id !== id)
    }
    setData({ ...newData })
  }

  return (
    <>
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map(column => (
          <div
            key={column.id}
            className="bg-white/5 rounded-xl p-4 min-h-[500px]"
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(column.id)}
          >
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
              <div className={`w-3 h-3 rounded-full ${column.color}`} />
              <h2 className="font-semibold text-sm">{column.title}</h2>
              <span className="ml-auto bg-white/10 px-2 py-0.5 rounded-full text-xs">
                {data[column.id].length}
              </span>
            </div>

            <div className="space-y-3">
              {data[column.id].map(item => (
                <Card
                  key={item.id}
                  item={item}
                  onDragStart={() => handleDragStart(item, column.id)}
                  onClick={() => setEditingItem(item)}
                />
              ))}
            </div>

            <button
              onClick={() => handleAddCard(column.id)}
              className="w-full mt-3 p-3 border-2 border-dashed border-white/20 rounded-lg text-white/40 hover:border-white/40 hover:text-white/60 transition"
            >
              + Add Card
            </button>
          </div>
        ))}
      </div>

      {editingItem && (
        <EditModal
          item={editingItem}
          isOpen={true}
          onClose={() => setEditingItem(null)}
          onSave={handleEditCard}
          onDelete={handleDeleteCard}
        />
      )}
    </>
  )
}
