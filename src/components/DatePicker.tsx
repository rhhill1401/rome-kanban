'use client'

import { useState, useEffect, useRef } from 'react'

interface DatePickerProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// Parse various date formats into a Date object
export const parseAnyDate = (input: string): Date | null => {
  if (!input || input === 'Future' || input === 'TBD') return null

  const trimmed = input.trim()

  // Try MM-DD or MM/DD format (e.g., "02-06" or "02/06")
  const slashDash = trimmed.match(/^(\d{1,2})[-/](\d{1,2})$/)
  if (slashDash) {
    const month = parseInt(slashDash[1]) - 1
    const day = parseInt(slashDash[2])
    if (month >= 0 && month <= 11 && day >= 1 && day <= 31) {
      return new Date(2026, month, day)
    }
  }

  // Try YYYY-MM-DD format
  const isoMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
  if (isoMatch) {
    const year = parseInt(isoMatch[1])
    const month = parseInt(isoMatch[2]) - 1
    const day = parseInt(isoMatch[3])
    return new Date(year, month, day)
  }

  // Try formats with month names: "Feb 6", "February 6", "Fri Feb 6", etc.
  const monthNames: Record<string, number> = {
    'january': 0, 'jan': 0,
    'february': 1, 'feb': 1,
    'march': 2, 'mar': 2,
    'april': 3, 'apr': 3,
    'may': 4,
    'june': 5, 'jun': 5,
    'july': 6, 'jul': 6,
    'august': 7, 'aug': 7,
    'september': 8, 'sep': 8, 'sept': 8,
    'october': 9, 'oct': 9,
    'november': 10, 'nov': 10,
    'december': 11, 'dec': 11,
  }

  const words = trimmed.toLowerCase().split(/\s+/)
  let month: number | undefined
  let day: number | undefined

  for (const word of words) {
    if (monthNames[word] !== undefined) {
      month = monthNames[word]
    }
    const num = parseInt(word)
    if (!isNaN(num) && num >= 1 && num <= 31) {
      day = num
    }
  }

  if (month !== undefined && day !== undefined) {
    return new Date(2026, month, day)
  }

  return null
}

// Format a Date to our standard format "Mon Jan 27"
export const formatDate = (date: Date): string => {
  const dayName = DAYS[date.getDay()]
  const monthName = MONTHS[date.getMonth()]
  const dayNum = date.getDate()
  return `${dayName} ${monthName} ${dayNum}`
}

export default function DatePicker({ value, onChange, placeholder }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState(value)
  const [currentMonth, setCurrentMonth] = useState(() => {
    const parsed = parseAnyDate(value)
    return parsed || new Date()
  })
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setInputValue(value)
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
    const newValue = e.target.value
    setInputValue(newValue)

    // Try to parse and format the date
    const parsed = parseAnyDate(newValue)
    if (parsed) {
      setCurrentMonth(parsed)
    }
  }

  const handleInputBlur = () => {
    if (inputValue === 'Future' || inputValue === 'TBD') {
      onChange(inputValue)
      return
    }

    const parsed = parseAnyDate(inputValue)
    if (parsed) {
      const formatted = formatDate(parsed)
      setInputValue(formatted)
      onChange(formatted)
    }
  }

  const handleDateSelect = (date: Date) => {
    const formatted = formatDate(date)
    setInputValue(formatted)
    onChange(formatted)
    setIsOpen(false)
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDay = firstDay.getDay()

    const days: (Date | null)[] = []

    // Add empty slots for days before the first of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(null)
    }

    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }

    return days
  }

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const days = getDaysInMonth(currentMonth)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const selectedDate = parseAnyDate(inputValue)

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder || 'e.g. Feb 6, 02-06, or Future'}
        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-white/40"
      />

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-gray-800 border border-white/20 rounded-lg p-3 z-50 shadow-xl min-w-[280px]">
          {/* Header with month/year navigation */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1 hover:bg-white/10 rounded text-white/70 hover:text-white"
            >
              ←
            </button>
            <span className="font-semibold text-white">
              {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1 hover:bg-white/10 rounded text-white/70 hover:text-white"
            >
              →
            </button>
          </div>

          {/* Day labels */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS.map(day => (
              <div key={day} className="text-center text-xs text-gray-500 font-medium">
                {day.charAt(0)}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="w-8 h-8" />
              }

              const isToday = date.getTime() === today.getTime()
              const isSelected = selectedDate && date.getTime() === selectedDate.getTime()

              return (
                <button
                  key={date.toISOString()}
                  type="button"
                  onClick={() => handleDateSelect(date)}
                  className={`w-8 h-8 rounded-full text-sm transition-colors ${
                    isSelected
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-bold'
                      : isToday
                      ? 'bg-blue-500/30 text-blue-300 font-semibold'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  {date.getDate()}
                </button>
              )
            })}
          </div>

          {/* Quick options */}
          <div className="mt-3 pt-3 border-t border-white/10 flex gap-2">
            <button
              type="button"
              onClick={() => {
                setInputValue('Future')
                onChange('Future')
                setIsOpen(false)
              }}
              className="flex-1 text-xs py-1.5 bg-white/5 hover:bg-white/10 rounded text-gray-400 hover:text-white transition"
            >
              Future
            </button>
            <button
              type="button"
              onClick={() => {
                setInputValue('TBD')
                onChange('TBD')
                setIsOpen(false)
              }}
              className="flex-1 text-xs py-1.5 bg-white/5 hover:bg-white/10 rounded text-gray-400 hover:text-white transition"
            >
              TBD
            </button>
            <button
              type="button"
              onClick={() => handleDateSelect(new Date())}
              className="flex-1 text-xs py-1.5 bg-blue-500/20 hover:bg-blue-500/30 rounded text-blue-400 hover:text-blue-300 transition"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
