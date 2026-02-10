'use client'

import { useState, useEffect } from 'react'
import { ContentItem, ContentType, Column } from '@/types'
import DatePicker from './DatePicker'
import TimePicker from './TimePicker'

interface CardModalProps {
  // For editing - pass the item
  item?: ContentItem
  // For adding - pass the target column
  targetColumn?: Column
  isOpen: boolean
  onClose: () => void
  onSave: (item: ContentItem, targetColumn?: Column) => void
  onDelete?: (id: string) => void
}

const emptyItem: ContentItem = {
  id: '',
  type: 'short',
  title: '',
  theme: '',
  date: 'TBD',
}

export default function CardModal({ item, targetColumn, isOpen, onClose, onSave, onDelete }: CardModalProps) {
  const isEditing = !!item
  const [formData, setFormData] = useState<ContentItem>(item || emptyItem)

  useEffect(() => {
    if (item) {
      setFormData(item)
    } else {
      setFormData({ ...emptyItem, id: Date.now().toString() })
    }
  }, [item, isOpen])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) {
      alert('Please enter a title')
      return
    }
    onSave(formData, targetColumn)
    onClose()
  }

  const handleDelete = () => {
    if (onDelete && item && confirm('Are you sure you want to delete this card?')) {
      onDelete(item.id)
      onClose()
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md mx-4 border border-white/10">
        <h2 className="text-xl font-bold mb-4 text-white">
          {isEditing ? 'Edit Card' : 'Add New Card'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter content title"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-white/40"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as ContentType })}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-white/40"
            >
              <option value="short">Short</option>
              <option value="long">Long Form</option>
              <option value="task">Task</option>
              <option value="story">Story</option>
              <option value="song">Song</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Theme</label>
            <input
              type="text"
              value={formData.theme}
              onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
              placeholder="e.g. Health, Comedy, Finance"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-white/40"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Date</label>
              <DatePicker
                value={formData.date}
                onChange={(date) => setFormData({ ...formData, date })}
                placeholder="Pick a date"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Time</label>
              <TimePicker
                value={formData.time || ''}
                onChange={(time) => setFormData({ ...formData, time: time || undefined })}
                placeholder="e.g. 3pm"
              />
            </div>
          </div>

          {isEditing && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Views</label>
                <input
                  type="number"
                  value={formData.views ?? ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    views: e.target.value ? parseInt(e.target.value) : undefined
                  })}
                  placeholder="Optional"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-white/40"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Subs Gained</label>
                <input
                  type="number"
                  value={formData.subs ?? ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    subs: e.target.value ? parseInt(e.target.value) : undefined
                  })}
                  placeholder="Optional"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-white/40"
                />
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-semibold py-2 rounded-lg hover:opacity-90 transition"
            >
              {isEditing ? 'Save Changes' : 'Add Card'}
            </button>
            {isEditing && onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition"
              >
                Delete
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
