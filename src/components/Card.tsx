'use client'

import { ContentItem, ContentType } from '@/types'

interface CardProps {
  item: ContentItem
  onDragStart: () => void
  onEdit: (updatedItem: ContentItem) => void
  onDelete: (id: string) => void
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

export default function Card({ item, onDragStart, onEdit, onDelete }: CardProps) {
  const handleClick = (e: React.MouseEvent) => {
    // Don't open modal if dragging
    if (e.defaultPrevented) return

    const modal = document.createElement('div')
    modal.id = 'edit-modal'
    modal.innerHTML = `
      <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onclick="if(event.target === this) this.remove()">
        <div class="bg-gray-900 rounded-xl p-6 w-full max-w-md mx-4 border border-white/10">
          <h2 class="text-xl font-bold mb-4 text-white">Edit Card</h2>
          <form id="edit-form" class="space-y-4">
            <div>
              <label class="block text-sm text-gray-400 mb-1">Title</label>
              <input type="text" name="title" value="${item.title.replace(/"/g, '&quot;')}"
                class="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-white/40" />
            </div>
            <div>
              <label class="block text-sm text-gray-400 mb-1">Type</label>
              <select name="type" class="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-white/40">
                <option value="short" ${item.type === 'short' ? 'selected' : ''}>Short</option>
                <option value="story" ${item.type === 'story' ? 'selected' : ''}>Story</option>
                <option value="song" ${item.type === 'song' ? 'selected' : ''}>Song</option>
              </select>
            </div>
            <div>
              <label class="block text-sm text-gray-400 mb-1">Theme</label>
              <input type="text" name="theme" value="${item.theme.replace(/"/g, '&quot;')}"
                class="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-white/40" />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm text-gray-400 mb-1">Date</label>
                <input type="text" name="date" value="${item.date.replace(/"/g, '&quot;')}"
                  class="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-white/40" />
              </div>
              <div>
                <label class="block text-sm text-gray-400 mb-1">Time</label>
                <input type="text" name="time" value="${item.time || ''}" placeholder="e.g. 3:30 PM"
                  class="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-white/40" />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm text-gray-400 mb-1">Views</label>
                <input type="number" name="views" value="${item.views ?? ''}" placeholder="Optional"
                  class="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-white/40" />
              </div>
              <div>
                <label class="block text-sm text-gray-400 mb-1">Subs Gained</label>
                <input type="number" name="subs" value="${item.subs ?? ''}" placeholder="Optional"
                  class="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-white/40" />
              </div>
            </div>
            <div class="flex gap-3 pt-2">
              <button type="submit" class="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-semibold py-2 rounded-lg hover:opacity-90 transition">
                Save Changes
              </button>
              <button type="button" id="delete-btn" class="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition">
                Delete
              </button>
            </div>
          </form>
        </div>
      </div>
    `
    document.body.appendChild(modal)

    const form = document.getElementById('edit-form') as HTMLFormElement
    const deleteBtn = document.getElementById('delete-btn')

    form.onsubmit = (e) => {
      e.preventDefault()
      const formData = new FormData(form)
      const updatedItem: ContentItem = {
        ...item,
        title: formData.get('title') as string,
        type: formData.get('type') as ContentType,
        theme: formData.get('theme') as string,
        date: formData.get('date') as string,
        time: (formData.get('time') as string) || undefined,
        views: formData.get('views') ? parseInt(formData.get('views') as string) : undefined,
        subs: formData.get('subs') ? parseInt(formData.get('subs') as string) : undefined,
      }
      onEdit(updatedItem)
      modal.remove()
    }

    deleteBtn!.onclick = () => {
      if (confirm('Are you sure you want to delete this card?')) {
        onDelete(item.id)
        modal.remove()
      }
    }
  }

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={handleClick}
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
