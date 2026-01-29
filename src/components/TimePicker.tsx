'use client'

import { useState, useEffect, useRef } from 'react'

interface TimePickerProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

// Parse various time formats and return { hours: 0-23, minutes: 0-59 } or null
export const parseAnyTime = (input: string): { hours: number; minutes: number } | null => {
  if (!input) return null

  const trimmed = input.trim().toLowerCase()

  // Check for AM/PM indicator
  const isPM = trimmed.includes('pm') || trimmed.includes('p.m') || trimmed.includes('p m')
  const isAM = trimmed.includes('am') || trimmed.includes('a.m') || trimmed.includes('a m')

  // Remove AM/PM and clean up
  const cleaned = trimmed
    .replace(/[ap]\.?m\.?/gi, '')
    .replace(/\s+/g, '')
    .trim()

  let hours: number | undefined
  let minutes: number = 0

  // Try HH:MM or H:MM format (e.g., "3:30", "15:30", "8:00")
  const colonMatch = cleaned.match(/^(\d{1,2}):(\d{2})$/)
  if (colonMatch) {
    hours = parseInt(colonMatch[1])
    minutes = parseInt(colonMatch[2])
  }

  // Try HHMM format (e.g., "1530", "0800")
  if (hours === undefined) {
    const fourDigit = cleaned.match(/^(\d{2})(\d{2})$/)
    if (fourDigit) {
      hours = parseInt(fourDigit[1])
      minutes = parseInt(fourDigit[2])
    }
  }

  // Try just hours (e.g., "8", "15", "3")
  if (hours === undefined) {
    const hourOnly = cleaned.match(/^(\d{1,2})$/)
    if (hourOnly) {
      hours = parseInt(hourOnly[1])
      minutes = 0
    }
  }

  if (hours === undefined) return null

  // Convert to 24-hour format if AM/PM was specified
  if (isPM && hours < 12) {
    hours += 12
  } else if (isAM && hours === 12) {
    hours = 0
  }

  // Validate ranges
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return null
  }

  return { hours, minutes }
}

// Format time to "H:MM AM/PM" format (e.g., "3:30 PM", "12:00 PM", "8:00 AM")
export const formatTime = (hours: number, minutes: number): string => {
  const period = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
  const displayMinutes = minutes.toString().padStart(2, '0')
  return `${displayHours}:${displayMinutes} ${period}`
}

// Common posting times for quick selection
const QUICK_TIMES = [
  { label: '9 AM', hours: 9, minutes: 0 },
  { label: '12 PM', hours: 12, minutes: 0 },
  { label: '3 PM', hours: 15, minutes: 0 },
  { label: '6 PM', hours: 18, minutes: 0 },
  { label: '8 PM', hours: 20, minutes: 0 },
]

export default function TimePicker({ value, onChange, placeholder }: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState(value || '')
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setInputValue(value || '')
  }, [value])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const handleInputBlur = () => {
    if (!inputValue.trim()) {
      onChange('')
      return
    }

    const parsed = parseAnyTime(inputValue)
    if (parsed) {
      const formatted = formatTime(parsed.hours, parsed.minutes)
      setInputValue(formatted)
      onChange(formatted)
    } else {
      // Keep the invalid input so user can fix it
      // Could show an error state here
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleInputBlur()
      setIsOpen(false)
    }
  }

  const handleQuickSelect = (hours: number, minutes: number) => {
    const formatted = formatTime(hours, minutes)
    setInputValue(formatted)
    onChange(formatted)
    setIsOpen(false)
  }

  const handleClear = () => {
    setInputValue('')
    onChange('')
    setIsOpen(false)
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        onBlur={handleInputBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || 'e.g. 3pm'}
        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-white/40"
      />

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full bg-gray-800 border border-white/20 rounded-lg shadow-xl z-50 p-2">
          <div className="text-xs text-gray-400 mb-2 px-1">Quick select:</div>
          <div className="grid grid-cols-3 gap-1">
            {QUICK_TIMES.map((time) => (
              <button
                key={time.label}
                type="button"
                onClick={() => handleQuickSelect(time.hours, time.minutes)}
                className="px-2 py-1 text-sm bg-white/10 hover:bg-white/20 rounded transition text-white"
              >
                {time.label}
              </button>
            ))}
            <button
              type="button"
              onClick={handleClear}
              className="px-2 py-1 text-sm bg-red-500/20 hover:bg-red-500/30 rounded transition text-red-400"
            >
              Clear
            </button>
          </div>
          <div className="text-xs text-gray-500 mt-2 px-1">
            Or type: 8pm, 3:30pm, 15:00
          </div>
        </div>
      )}
    </div>
  )
}
