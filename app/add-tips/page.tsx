"use client"

import { useState, useEffect } from "react"
import { X, Check } from "lucide-react"
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
import { motion, AnimatePresence } from "framer-motion"

// Constants moved outside component to prevent recreation on each render
const TAG_COLORS = [
  "bg-red-500", "bg-blue-500", "bg-green-500", "bg-yellow-500", 
  "bg-purple-500", "bg-pink-500", "bg-indigo-500", "bg-gray-600"
]

const DEFAULT_TIP_VALUES = { one: 1, two: 2.5, five: 5 }

// Animation variants moved outside component
const CONTAINER_VARIANTS = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

const ITEM_VARIANTS = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const
    }
  }
}

const BUTTON_VARIANTS = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut" as const
    }
  },
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.2
    }
  },
  tap: {
    scale: 0.95,
    transition: {
      duration: 0.1
    }
  }
}

// Utility function for number input validation
const handleNumberInput = (value: string, setter: (value: string) => void) => {
  const regex = /^[0-9,]*$/
  if (regex.test(value) || value === "") {
    const parts = value.split(",")
    if (parts.length <= 2 && (parts[1]?.length || 0) <= 2) {
      setter(value)
    }
  }
}

// Utility function for parsing and validating amounts
const parseAmount = (amountString: string): number | null => {
  try {
    const normalizedAmount = amountString.trim().replace(",", ".")
    const amount = Number.parseFloat(normalizedAmount)
    
    if (!isNaN(amount) && amount > 0) {
      return Math.round(amount * 100) / 100
    }
    return null
  } catch (error) {
    console.error('Error parsing amount:', error)
    return null
  }
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
  const [tipValues, setTipValues] = useState(DEFAULT_TIP_VALUES)
  const [availableTags, setAvailableTags] = useState<Tag[]>([])

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
    if (typeof amount !== 'number' || isNaN(amount)) {
      console.error('Invalid amount:', amount)
      return
    }
    
    const roundedAmount = Math.round(amount * 100) / 100
    if (roundedAmount <= 0) {
      console.error('Amount must be greater than 0:', roundedAmount)
      return
    }

    try {
      saveTip(roundedAmount)
      const newTotal = todayTotal + roundedAmount
      setTodayTotal(newTotal)
      
      // Check for milestone achievements (every 10€)
      const milestone = Math.floor(newTotal / 10) * 10
      const previousMilestone = Math.floor(todayTotal / 10) * 10
      if (milestone > previousMilestone && milestone > 0) {
        addNotification({
          type: 'achievement',
          title: 'Meilenstein erreicht! 🎯',
          message: `Du hast ${milestone}€ Trinkgeld für heute gesammelt!`,
          icon: '💰',
          priority: 'medium'
        })
      }
    } catch (error) {
      console.error('Error saving tip:', error)
    }
  }

  const handleCustomTip = () => {
    const amount = parseAmount(customAmount)
    if (amount !== null) {
      addTip(amount)
      setCustomAmount("")
      setShowCustomInput(false)
    }
  }

  const handleEditTips = () => {
    const amount = parseAmount(editAmount)
    if (amount !== null) {
      endShift(amount, shiftNote, selectedTags)
      setTodayTotal(amount)
      setEditAmount("")
      setShowEditDialog(false)
    }
  }

  const handleEditTipValues = () => {
    const amount = parseAmount(editTipAmount)
    if (amount !== null) {
      setTipValues(prev => ({ ...prev, one: amount })) // Assuming editing the first button
      setEditTipAmount("")
      setShowEditTipDialog(false)
    }
  }

  const handleEndShift = () => {
    const noteToSave = shiftNote.trim() || undefined
    endShift(todayTotal, noteToSave, selectedTags)

    // Reset UI state
    setTodayTotal(0)
    setShowEndShiftDialog(false)
    setShiftNote("")
    setSelectedTags([])

    // Navigate back to dashboard
    router.push("/")
  }

  const handleCustomTag = async () => {
    if (customTagName.trim()) {
      const newTag = {
        name: customTagName.trim(),
        color: customTagColor,
      }
      await saveTag(newTag)
      const updatedTags = await getStoredTags()
      setAvailableTags(updatedTags)
      setCustomTagName("")
      setCustomTagColor("bg-purple-500")
      setShowCustomTagDialog(false)
    }
  }

  const handleDeleteTag = async (tagId: string) => {
    await deleteTag(tagId)
    const updatedTags = await getStoredTags()
    setAvailableTags(updatedTags)
    // Also remove from selected tags if it was selected
    setSelectedTags(selectedTags.filter(id => id !== tagId))
  }

  const handleEditTag = async (tagId: string, newName: string, newColor: string) => {
    await updateTag(tagId, { name: newName, color: newColor })
    const updatedTags = await getStoredTags()
    setAvailableTags(updatedTags)
  }

  const toggleTag = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter(id => id !== tagId))
    } else {
      setSelectedTags([...selectedTags, tagId])
    }
  }

  return (
    <div className="px-4">
      {/* Current Total */}
      <div className="bg-white rounded-2xl p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <div className="text-lg font-medium text-black">Trinkgeld</div>
            <motion.div 
              className="text-3xl font-bold text-black"
              key={todayTotal}
              initial={{ scale: 1.1, color: "#10b981" }}
              animate={{ scale: 1, color: "#000000" }}
              transition={{ duration: 0.3 }}
            >
              {formatCurrency(todayTotal)}
            </motion.div>
          </div>
          <div className="text-right">
            <div className="text-gray-600">{formatDate(new Date())}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <div className="flex-1">
            <Button
              variant="outline"
              className="w-full bg-gray-200 text-black border-gray-300 hover:bg-gray-300"
              onClick={() => {
                setEditAmount(todayTotal.toString().replace(".", ","))
                setShowEditDialog(true)
              }}
            >
              Ändern
            </Button>
          </div>
          <div className="flex-1">
            <Button
              variant="default"
              className="w-full"
              onClick={() => setShowEndShiftDialog(true)}
            >
              Schicht beenden
            </Button>
          </div>
        </div>
      </div>

      {/* Tip Buttons Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* +1€ */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <Button
            variant="outline"
            className="h-32 bg-white border-gray-200 hover:bg-gray-50 flex flex-col items-center justify-center gap-2 w-full"
            onClick={() => addTip(tipValues.one)}
          >
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="text-xl font-bold text-black">+ {tipValues.one.toFixed(tipValues.one % 1 === 0 ? 0 : 2).replace(".", ",")}€</div>
              <Coin1Icon width={48} height={48} />
            </div>
          </Button>
        </motion.div>

        {/* +2,50€ */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <Button
            variant="outline"
            className="h-32 bg-white border-gray-200 hover:bg-gray-50 flex flex-col items-center justify-center gap-2 w-full"
            onClick={() => addTip(tipValues.two)}
          >
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="text-xl font-bold text-black">+ {tipValues.two.toFixed(tipValues.two % 1 === 0 ? 0 : 2).replace(".", ",")}€</div>
              <Coin2Icon width={48} height={48} />
            </div>
          </Button>
        </motion.div>

        {/* +5€ */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <Button
            variant="outline"
            className="h-32 bg-white border-gray-200 hover:bg-gray-50 flex flex-col items-center justify-center gap-2 w-full"
            onClick={() => addTip(tipValues.five)}
          >
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="text-xl font-bold text-black">+ {tipValues.five.toFixed(tipValues.five % 1 === 0 ? 0 : 2).replace(".", ",")}€</div>
              <Coin5Icon width={48} height={48} />
            </div>
          </Button>
        </motion.div>

        {/* Custom Amount */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <Button
            variant="outline"
            className="h-32 bg-white border-gray-200 hover:bg-gray-50 flex flex-col items-center justify-center gap-2 w-full"
            onClick={() => setShowCustomInput(true)}
          >
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="text-xl font-bold text-black">Freibetrag</div>
              <Coin5Icon width={48} height={48} />
            </div>
          </Button>
        </motion.div>
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
        <DialogContent className="max-w-sm mx-auto" aria-describedby="end-shift-desc">
          <DialogHeader>
            <DialogTitle>Schicht beenden</DialogTitle>
            <p id="end-shift-desc" className="text-sm text-gray-600">Beenden Sie Ihre Schicht und speichern Sie das Trinkgeld</p>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-lg font-medium">Trinkgeld: {formatCurrency(todayTotal)}</div>
              <div className="text-gray-600">{formatDate(new Date())}</div>
            </div>

            <div className="text-lg font-medium">Schicht beenden?</div>

            <div>
              <label className="block text-sm font-medium mb-2">Notiz (optional):</label>
              <Textarea
                placeholder="z.B. Schichtleitung"
                value={shiftNote}
                onChange={(e) => setShiftNote(e.target.value)}
                className="bg-gray-200"
              />
            </div>

            {/* Tags Section */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-black">Tags auswählen</label>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowManageTagsDialog(true)}
                    className="text-xs"
                  >
                    Tags verwalten
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => toggleTag(tag.id)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors border-2 ${
                      tag.color
                    } ${
                      selectedTags.includes(tag.id)
                        ? "text-white border-black ring-2 ring-black ring-offset-1"
                        : "text-white border-transparent hover:border-gray-300"
                    }`}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 bg-gray-200 text-black"
                onClick={() => setShowEndShiftDialog(false)}
              >
                Nein
              </Button>
              <Button variant="default" className="flex-1" onClick={handleEndShift}>
                Ja
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Custom Tag Dialog */}
      <Dialog open={showCustomTagDialog} onOpenChange={setShowCustomTagDialog}>
        <DialogContent className="max-w-sm mx-auto" aria-describedby="custom-tag-desc">
          <DialogHeader>
            <DialogTitle>Neuen Tag erstellen</DialogTitle>
            <p id="custom-tag-desc" className="text-sm text-gray-600">Erstellen Sie einen neuen Tag</p>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Tag Name</label>
              <Input
                placeholder="z.B. Bonus"
                value={customTagName}
                onChange={(e) => setCustomTagName(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Farbe</label>
              <div className="grid grid-cols-4 gap-2">
                {TAG_COLORS.map((color) => (
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
              <Button variant="outline" className="flex-1" onClick={() => setShowCustomTagDialog(false)}>
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
        <DialogContent className="max-w-sm mx-auto" aria-describedby="manage-tags-desc">
          <DialogHeader>
            <DialogTitle>Tags verwalten</DialogTitle>
            <p id="manage-tags-desc" className="text-sm text-gray-600">Verwalten Sie Ihre vorhandenen Tags</p>
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
                  tagColors={TAG_COLORS}
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
        <Button 
          size="sm" 
          onClick={handleSave}
          className="rounded-full w-8 h-8 p-0 bg-green-50 hover:bg-green-100 border-green-200 hover:border-green-300 transition-all duration-200"
        >
          <Check className="w-4 h-4 text-green-600" />
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={handleCancel}
          className="rounded-full w-8 h-8 p-0 bg-gray-50 hover:bg-gray-100 border-gray-200 hover:border-gray-300 transition-all duration-200"
        >
          <X className="w-4 h-4 text-gray-600" />
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
