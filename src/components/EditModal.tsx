'use client'

import { useState, useEffect } from 'react'
import { ContentItem, ContentType } from '@/types'
import DatePicker from './DatePicker'

interface EditModalProps {
  item: ContentItem
  isOpen: boolean
  onClose: () => void
  onSave: (item: ContentItem) => void
  onDelete: (id: string) => void
}

export default function EditModal({ item, isOpen, onClose, onSave, onDelete }: EditModalProps) {
  const [formData, setFormData] = useState<ContentItem>(item)

  useEffect(() => {
    setFormData(item)
  }, [item])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
    onClose()
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this card?')) {
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
        <h2 className="text-xl font-bold mb-4 text-white">Edit Card</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-white/40"
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
              <input
                type="text"
                value={formData.time || ''}
                onChange={(e) => setFormData({ ...formData, time: e.target.value || undefined })}
                placeholder="e.g. 3:30 PM"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-white/40"
              />
            </div>
          </div>

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

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-semibold py-2 rounded-lg hover:opacity-90 transition"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition"
            >
              Delete
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
