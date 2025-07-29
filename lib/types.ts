export interface TipEntry {
  date: string
  amount: number
  note?: string
  /** Array of tag ids that were selected for this tip */
  tags?: string[]
  timestamp: number
}

export interface Tag {
  id: string
  name: string
  color: string
  icon?: string
}

export interface Notification {
  id: string
  type: 'reminder' | 'tip' | 'achievement' | 'motivation'
  title: string
  message: string
  icon?: string
  priority: 'low' | 'medium' | 'high'
  timestamp: number
  read: boolean
  milestoneKey?: string // for internal deduplication
} 