"use client"

import { useState, useEffect } from "react"
import { Tag, getStoredTags, saveTag, updateTag, deleteTag } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { X, Plus, Edit2 } from "lucide-react"

// Define tagColors here since it's not exported from utils
const tagColors = [
  "bg-red-500", "bg-blue-500", "bg-green-500", "bg-yellow-500", 
  "bg-purple-500", "bg-pink-500", "bg-indigo-500", "bg-gray-600"
]

interface TagManagerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function TagManager({ open, onOpenChange }: TagManagerProps) {
  const [tags, setTags] = useState<Tag[]>([])
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingTag, setEditingTag] = useState<Tag | null>(null)
  const [newTagName, setNewTagName] = useState("")
  const [newTagColor, setNewTagColor] = useState(tagColors[0])

  useEffect(() => {
    if (open) {
      (async () => {
        setTags(await getStoredTags())
      })()
    }
  }, [open])

  const handleCreateTag = async () => {
    if (newTagName.trim()) {
      await saveTag({ name: newTagName.trim(), color: newTagColor })
      setTags(await getStoredTags())
      setNewTagName("")
      setNewTagColor(tagColors[0])
      setShowCreateDialog(false)
    }
  }

  const handleEditTag = async () => {
    if (editingTag && newTagName.trim()) {
      await updateTag(editingTag.id, { name: newTagName.trim(), color: newTagColor })
      setTags(await getStoredTags())
      setNewTagName("")
      setNewTagColor(tagColors[0])
      setEditingTag(null)
      setShowEditDialog(false)
    }
  }

  const handleDeleteTag = async (tagId: string) => {
    await deleteTag(tagId)
    setTags(await getStoredTags())
  }

  const startEditTag = (tag: Tag) => {
    setEditingTag(tag)
    setNewTagName(tag.name)
    setNewTagColor(tag.color)
    setShowEditDialog(true)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle>Tags verwalten</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Verfügbare Tags</span>
              <Button
                size="sm"
                onClick={() => setShowCreateDialog(true)}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Neuer Tag
              </Button>
            </div>
            
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {tags.map((tag) => (
                <div key={tag.id} className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${tag.color}`}></div>
                    <span className="font-medium">{tag.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => startEditTag(tag)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteTag(tag.id)}
                      className="rounded-full w-8 h-8 p-0 bg-red-50 hover:bg-red-100 border-red-200 hover:border-red-300 transition-all duration-200"
                    >
                      <X className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Tag Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle>Neuen Tag erstellen</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Tag Name</label>
              <Input
                placeholder="z.B. Regen"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Farbe</label>
              <div className="grid grid-cols-6 gap-2">
                {tagColors.map((color) => (
                  <button
                    key={color}
                    className={`w-8 h-8 rounded-full ${color} border-2 ${
                      newTagColor === color ? 'border-black' : 'border-transparent'
                    }`}
                    onClick={() => setNewTagColor(color)}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowCreateDialog(false)}>
                Abbrechen
              </Button>
              <Button className="flex-1" onClick={handleCreateTag}>
                Erstellen
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Tag Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle>Tag bearbeiten</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Tag Name</label>
              <Input
                placeholder="z.B. Regen"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Farbe</label>
              <div className="grid grid-cols-6 gap-2">
                {tagColors.map((color) => (
                  <button
                    key={color}
                    className={`w-8 h-8 rounded-full ${color} border-2 ${
                      newTagColor === color ? 'border-black' : 'border-transparent'
                    }`}
                    onClick={() => setNewTagColor(color)}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowEditDialog(false)}>
                Abbrechen
              </Button>
              <Button className="flex-1" onClick={handleEditTag}>
                Speichern
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}