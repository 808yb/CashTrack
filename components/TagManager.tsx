"use client"

import { useState, useEffect } from "react"
import { Tag, getStoredTags, saveTag, updateTag, deleteTag, tagColors } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { X, Plus, Edit2 } from "lucide-react"

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
      setTags(getStoredTags())
    }
  }, [open])

  const handleCreateTag = () => {
    if (newTagName.trim()) {
      saveTag({ name: newTagName.trim(), color: newTagColor })
      setTags(getStoredTags())
      setNewTagName("")
      setNewTagColor(tagColors[0])
      setShowCreateDialog(false)
    }
  }

  const handleEditTag = () => {
    if (editingTag && newTagName.trim()) {
      updateTag(editingTag.id, { name: newTagName.trim(), color: newTagColor })
      setTags(getStoredTags())
      setNewTagName("")
      setNewTagColor(tagColors[0])
      setEditingTag(null)
      setShowEditDialog(false)
    }
  }

  const handleDeleteTag = (tagId: string) => {
    deleteTag(tagId)
    setTags(getStoredTags())
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
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
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