"use client"

import { useState, useEffect } from "react"
import { Calendar, Plus, User, Home } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { formatCurrency, formatDate, getTodayKey, getStoredTips, saveTip, endShift, getStoredTags, saveTag, updateTag, deleteTag, Tag } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import Coin1Icon from "@/ButtonIcons/Coin1Icon"
import Coin2Icon from "@/ButtonIcons/Coin2Icon"
import Coin5Icon from "@/ButtonIcons/CustomCoinsIcon"
import { useNotifications } from "@/contexts/NotificationContext"
import NotificationBell from "@/components/NotificationBell"

// Tag Management Item Component
function TagManageItem({ 
  tag, 
  onEdit, 
  onDelete, 
  tagColors 
}: { 
  tag: Tag
  onEdit: (id: string, name: string, color: string) => void
  onDelete: (id: string) => void
  tagColors: string[]
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(tag.name)
  const [editColor, setEditColor] = useState(tag.color)

  const handleSave = () => {
    if (editName.trim()) {
      onEdit(tag.id, editName.trim(), editColor)
      setIsEditing(false)
    }
  }

  const handleCancel = () => {
    setEditName(tag.name)
    setEditColor(tag.color)
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 p-3 bg-gray-100 rounded-lg">
        <Input
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          className="flex-1"
        />
        <div className="flex gap-1">
          {tagColors.slice(0, 4).map((color) => (
            <button
              key={color}
              className={`w-6 h-6 rounded-full ${color} border-2 ${
                editColor === color ? 'border-black' : 'border-transparent'
              }`}
              onClick={() => setEditColor(color)}
            />
          ))}
        </div>
        <Button size="sm" onClick={handleSave}>
          ✓
        </Button>
        <Button size="sm" variant="outline" onClick={handleCancel}>
          ✕
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
      <div className="flex items-center gap-3">
        <div className={`w-4 h-4 rounded-full ${tag.color}`}></div>
        <span className="font-medium">{tag.name}</span>
      </div>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsEditing(true)}
        >
          Bearbeiten
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onDelete(tag.id)}
          className="text-red-600 hover:text-red-700"
        >
          Löschen
        </Button>
      </div>
    </div>
  )
}

export default function AddTips() {
  const router = useRouter()
  const { addNotification } = useNotifications()
  const [todayTotal, setTodayTotal] = useState(0)
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [customAmount, setCustomAmount] = useState("")
  const [showEndShiftDialog, setShowEndShiftDialog] = useState(false)
  const [shiftNote, setShiftNote] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [showCustomTagDialog, setShowCustomTagDialog] = useState(false)
  const [customTagName, setCustomTagName] = useState("")
  const [customTagColor, setCustomTagColor] = useState("bg-purple-500")
  const [showManageTagsDialog, setShowManageTagsDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editAmount, setEditAmount] = useState("")
  const [showEditTipDialog, setShowEditTipDialog] = useState(false)
  const [editTipAmount, setEditTipAmount] = useState("")
  const [tipValues, setTipValues] = useState({ one: 1, two: 2.5, five: 5 })
  const [selectedTipButton, setSelectedTipButton] = useState<'one' | 'two' | 'five'>('one')
  const [availableTags, setAvailableTags] = useState<Tag[]>([])

  const tagColors = [
    "bg-red-500", "bg-blue-500", "bg-green-500", "bg-yellow-500", 
    "bg-purple-500", "bg-pink-500", "bg-indigo-500", "bg-gray-600"
  ]

  useEffect(() => {
    const loadTodayTips = async () => {
      const tips = await getStoredTips()
      const today = getTodayKey()
      const todayTips = tips.filter((tip) => tip.date === today)
      const total = todayTips.reduce((sum, tip) => sum + tip.amount, 0)
      setTodayTotal(total)
    }

    const loadTags = async () => {
      const storedTags = await getStoredTags()
      setAvailableTags(storedTags)
    }

    // Execute async functions
    Promise.all([loadTodayTips(), loadTags()]).catch(console.error)

    // Listen for storage changes to update dashboard when returning from other pages
    const handleStorageChange = () => {
      Promise.all([loadTodayTips(), loadTags()]).catch(console.error)
    }

    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("focus", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("focus", handleStorageChange)
    }
  }, [])

  const addTip = (amount: number) => {
    // Ensure amount is a valid number and round to 2 decimal places to avoid floating point issues
    if (typeof amount !== 'number' || isNaN(amount)) {
      console.error('Invalid amount:', amount);
      return;
    }
    
    const roundedAmount = Math.round(amount * 100) / 100;
    if (roundedAmount <= 0) {
      console.error('Amount must be greater than 0:', roundedAmount);
      return;
    }

    try {
      saveTip(roundedAmount);
      const newTotal = todayTotal + roundedAmount;
      setTodayTotal(newTotal);
      
      // Check for milestone achievements (every 10€)
      const milestone = Math.floor(newTotal / 10) * 10;
      const previousMilestone = Math.floor(todayTotal / 10) * 10;
      if (milestone > previousMilestone && milestone > 0) {
        // Add milestone notification
        addNotification({
          type: 'achievement',
          title: 'Meilenstein erreicht! 🎯',
          message: `${milestone}€ Trinkgeld heute gesammelt!`,
          icon: '🎉',
          priority: 'medium'
        })
      }
    } catch (error) {
      console.error('Error saving tip:', error);
    }
  }

  const handleCustomTip = () => {
    const amount = Number.parseFloat(customAmount.replace(",", "."))
    if (!isNaN(amount) && amount > 0) {
      addTip(amount)
      setCustomAmount("")
      setShowCustomInput(false)
    }
  }

  const handleEditTips = () => {
    const amount = Number.parseFloat(editAmount.replace(",", "."))
    if (!isNaN(amount) && amount >= 0) {
      // Clear all tips for today and set the new total
      const today = getTodayKey()
      const tips = JSON.parse(localStorage.getItem("cashtrack-tips") || "[]")
      const filteredTips = tips.filter((tip: any) => tip.date !== today)
      
      if (amount > 0) {
        // Add a single tip with the new total
        const newTip = {
          date: today,
          amount: amount,
          timestamp: Date.now()
        }
        filteredTips.push(newTip)
      }
      
      localStorage.setItem("cashtrack-tips", JSON.stringify(filteredTips))
      setTodayTotal(amount)
      setEditAmount("")
      setShowEditDialog(false)
    }
  }

  const handleEditTipValues = () => {
    const amount = Number.parseFloat(editTipAmount.replace(",", "."))
    if (!isNaN(amount) && amount > 0) {
      setTipValues(prev => ({ ...prev, [selectedTipButton]: amount }))
      setEditTipAmount("")
      setShowEditTipDialog(false)
    }
  }

  const handleEndShift = () => {
    const today = getTodayKey()
    endShift(today, shiftNote, selectedTags)
    setShiftNote("")
    setSelectedTags([])
    setShowEndShiftDialog(false)
    
    // Show success notification
    addNotification({
      type: 'info',
      title: 'Schicht beendet! 📝',
      message: `Schicht für ${formatDate(new Date())} wurde gespeichert.`,
      icon: '✅',
      priority: 'low'
    })
  }

  const handleCustomTag = async () => {
    if (customTagName.trim()) {
      const newTag = await saveTag(customTagName.trim(), customTagColor)
      setAvailableTags(prev => [...prev, newTag])
      setCustomTagName("")
      setCustomTagColor("bg-purple-500")
      setShowCustomTagDialog(false)
    }
  }

  const handleDeleteTag = async (tagId: string) => {
    await deleteTag(tagId)
    setAvailableTags(prev => prev.filter(tag => tag.id !== tagId))
  }

  const handleEditTag = async (tagId: string, newName: string, newColor: string) => {
    const updatedTag = await updateTag(tagId, newName, newColor)
    setAvailableTags(prev => prev.map(tag => tag.id === tagId ? updatedTag : tag))
  }

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    )
  }

  // Input validation for numbers and comma only
  const handleNumberInput = (value: string, setter: (value: string) => void) => {
    // Only allow numbers, comma, and backspace
    const regex = /^[0-9,]*$/
    if (regex.test(value) || value === "") {
      // Limit to 2 decimal places
      const parts = value.split(",")
      if (parts.length <= 2 && (parts[1]?.length || 0) <= 2) {
        setter(value)
      }
    }
  }

  return (
    <div>
      {/* Current Total */}
      <div className="bg-white rounded-2xl p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <div className="text-lg font-medium text-black">Trinkgeld</div>
            <div className="text-3xl font-bold text-black">{formatCurrency(todayTotal)}</div>
          </div>
          <div className="text-right">
            <div className="text-gray-600">{formatDate(new Date())}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 bg-gray-200 text-black border-gray-300 hover:bg-gray-300"
            onClick={() => {
              setEditAmount(todayTotal.toString().replace(".", ","))
              setShowEditDialog(true)
            }}
          >
            Ändern
          </Button>
          <Button
            variant="default"
            className="flex-1"
            onClick={() => setShowEndShiftDialog(true)}
          >
            Schicht beenden
          </Button>
        </div>
      </div>

      {/* Tip Buttons Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* +1€ */}
        <Button
          variant="outline"
          className="h-32 bg-white border-gray-200 hover:bg-gray-50 flex flex-col items-center justify-center gap-2"
          onClick={() => addTip(tipValues.one)}
        >
          <div className="text-xl font-bold text-black">+ {tipValues.one.toFixed(tipValues.one % 1 === 0 ? 0 : 2).replace(".", ",")}€</div>
          <Coin1Icon width={48} height={48} />
        </Button>

        {/* +2,50€ */}
        <Button
          variant="outline"
          className="h-32 bg-white border-gray-200 hover:bg-gray-50 flex flex-col items-center justify-center gap-2"
          onClick={() => addTip(tipValues.two)}
        >
          <div className="text-xl font-bold text-black">+ {tipValues.two.toFixed(tipValues.two % 1 === 0 ? 0 : 2).replace(".", ",")}€</div>
          <Coin2Icon width={48} height={48} />
        </Button>

        {/* +5€ */}
        <Button
          variant="outline"
          className="h-32 bg-white border-gray-200 hover:bg-gray-50 flex flex-col items-center justify-center gap-2"
          onClick={() => addTip(tipValues.five)}
        >
          <div className="text-xl font-bold text-black">+ {tipValues.five.toFixed(tipValues.five % 1 === 0 ? 0 : 2).replace(".", ",")}€</div>
          <Coin5Icon width={48} height={48} />
        </Button>

        {/* Custom Amount */}
        <Button
          variant="outline"
          className="h-32 bg-white border-gray-200 hover:bg-gray-50 flex flex-col items-center justify-center gap-2"
          onClick={() => setShowCustomInput(true)}
        >
          <div className="text-xl font-bold text-black">Freibetrag</div>
          <Coin5Icon width={48} height={48} />
        </Button>
      </div>

      {/* Beitrag bearbeiten button */}
      <div className="mt-4">
        <Button
          variant="outline"
          className="w-full bg-white border-gray-200 hover:bg-gray-50 text-black"
          onClick={() => setShowEditTipDialog(true)}
        >
          Beitrag bearbeiten
        </Button>
      </div>

      {/* Custom Amount Dialog */}
      <Dialog open={showCustomInput} onOpenChange={setShowCustomInput}>
        <DialogContent className="max-w-sm mx-auto" aria-describedby="custom-amount-desc">
          <DialogHeader>
            <DialogTitle>Benutzerdefinierten Betrag eingeben</DialogTitle>
            <p id="custom-amount-desc" className="text-sm text-gray-600">Geben Sie einen benutzerdefinierten Betrag ein</p>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="text"
              inputMode="decimal"
              pattern="[0-9,]*"
              placeholder="0,00"
              value={customAmount}
              onChange={(e) => handleNumberInput(e.target.value, setCustomAmount)}
              className="text-center text-xl"
            />
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowCustomInput(false)}>
                Abbrechen
              </Button>
              <Button className="flex-1" onClick={handleCustomTip}>
                Hinzufügen
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* End Shift Dialog */}
      <Dialog open={showEndShiftDialog} onOpenChange={setShowEndShiftDialog}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle>Schicht beenden</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Notiz (optional)</label>
              <Textarea
                placeholder="Wie war die Schicht?"
                value={shiftNote}
                onChange={(e) => setShiftNote(e.target.value)}
                rows={3}
              />
            </div>
            
            {/* Tags Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium">Tags</label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowManageTagsDialog(true)}
                >
                  Verwalten
                </Button>
              </div>
              
              {/* Selected Tags */}
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedTags.map(tagId => {
                  const tag = availableTags.find(t => t.id === tagId)
                  return tag ? (
                    <span
                      key={tagId}
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${tag.color} text-white`}
                    >
                      {tag.name}
                      <button
                        onClick={() => toggleTag(tagId)}
                        className="ml-1 hover:text-gray-200"
                      >
                        ×
                      </button>
                    </span>
                  ) : null
                })}
              </div>
              
              {/* Available Tags */}
              <div className="flex flex-wrap gap-2">
                {availableTags
                  .filter(tag => !selectedTags.includes(tag.id))
                  .slice(0, 6)
                  .map(tag => (
                    <button
                      key={tag.id}
                      onClick={() => toggleTag(tag.id)}
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${tag.color} text-white hover:opacity-80`}
                    >
                      {tag.name}
                    </button>
                  ))}
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowEndShiftDialog(false)}>
                Abbrechen
              </Button>
              <Button className="flex-1" onClick={handleEndShift}>
                Beenden
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Custom Tag Dialog */}
      <Dialog open={showCustomTagDialog} onOpenChange={setShowCustomTagDialog}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle>Neuen Tag erstellen</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Tag Name"
              value={customTagName}
              onChange={(e) => setCustomTagName(e.target.value)}
            />
            <div>
              <label className="block text-sm font-medium mb-2">Farbe</label>
              <div className="grid grid-cols-4 gap-2">
                {tagColors.map((color) => (
                  <button
                    key={color}
                    className={`w-8 h-8 rounded-full ${color} border-2 ${
                      customTagColor === color ? 'border-black' : 'border-transparent'
                    }`}
                    onClick={() => setCustomTagColor(color)}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowCustomTagDialog(false)}>
                Abbrechen
              </Button>
              <Button className="flex-1" onClick={handleCustomTag}>
                Erstellen
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manage Tags Dialog */}
      <Dialog open={showManageTagsDialog} onOpenChange={setShowManageTagsDialog}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle>Tags verwalten</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              Bearbeite oder lösche vorhandene Tags
            </div>
            
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {availableTags.map((tag) => (
                <TagManageItem
                  key={tag.id}
                  tag={tag}
                  onEdit={handleEditTag}
                  onDelete={handleDeleteTag}
                  tagColors={tagColors}
                />
              ))}
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setShowManageTagsDialog(false);
                setShowCustomTagDialog(true);
              }}
            >
              + Neuer Tag
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowManageTagsDialog(false)}
            >
              Schließen
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Tips Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-sm mx-auto" aria-describedby="edit-tips-desc">
          <DialogHeader>
            <DialogTitle>Trinkgeld bearbeiten</DialogTitle>
            <p id="edit-tips-desc" className="text-sm text-gray-600">Bearbeiten Sie den Gesamtbetrag des Trinkgelds</p>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Neuer Betrag</label>
              <Input
                type="text"
                inputMode="decimal"
                pattern="[0-9,]*"
                placeholder="0,00"
                value={editAmount}
                onChange={(e) => handleNumberInput(e.target.value, setEditAmount)}
                className="text-center text-xl"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowEditDialog(false)}>
                Abbrechen
              </Button>
              <Button className="flex-1" onClick={handleEditTips}>
                Speichern
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Tip Values Dialog */}
      <Dialog open={showEditTipDialog} onOpenChange={setShowEditTipDialog}>
        <DialogContent className="max-w-sm mx-auto" aria-describedby="edit-tip-values-desc">
          <DialogHeader>
            <DialogTitle>Beitrag bearbeiten</DialogTitle>
            <p id="edit-tip-values-desc" className="text-sm text-gray-600">Bearbeiten Sie die Werte der Trinkgeld-Schaltflächen</p>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Neuer Betrag</label>
              <Input
                type="text"
                inputMode="decimal"
                pattern="[0-9,]*"
                placeholder="0,00"
                value={editTipAmount}
                onChange={(e) => handleNumberInput(e.target.value, setEditTipAmount)}
                className="text-center text-xl"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowEditTipDialog(false)}>
                Abbrechen
              </Button>
              <Button className="flex-1" onClick={handleEditTipValues}>
                Speichern
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
