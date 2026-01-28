export type ContentType = 'short' | 'story' | 'song'

export type Column = 'ideas' | 'production' | 'review' | 'published'

export interface ContentItem {
  id: string
  type: ContentType
  title: string
  theme: string
  date: string
  time?: string
  views?: number
  subs?: number
}
