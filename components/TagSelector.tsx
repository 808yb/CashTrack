"use client"

import { useState, useEffect } from "react"
import { Tag, getStoredTags } from "@/lib/utils"
import { cn } from "@/lib/utils"

interface TagSelectorProps {
  selectedTags: string[]
  onTagsChange: (tags: string[]) => void
  className?: string
}

export default function TagSelector({ selectedTags, onTagsChange, className }: TagSelectorProps) {
  const [tags, setTags] = useState<Tag[]>([])

  useEffect(() => {
    setTags(getStoredTags())
  }, [])

  const toggleTag = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      onTagsChange(selectedTags.filter(id => id !== tagId))
    } else {
      onTagsChange([...selectedTags, tagId])
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <label className="block text-sm font-medium text-black">Tags auswählen</label>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <button
            key={tag.id}
            onClick={() => toggleTag(tag.id)}
            className={cn(
              "px-3 py-1 rounded-full text-sm font-medium transition-colors border-2",
              tag.color,
              selectedTags.includes(tag.id)
                ? "text-white border-black ring-2 ring-black ring-offset-1"
                : "text-white border-transparent hover:border-gray-300"
            )}
          >
            {tag.name}
          </button>
        ))}
      </div>
    </div>
  )
}