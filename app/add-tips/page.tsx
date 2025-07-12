"use client"

import { useState, useEffect } from "react"
import { Calendar, Plus, User, Home } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { formatCurrency, formatDate, getTodayKey, getStoredTips, saveTip, endShift } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import Coin1Icon from "@/ButtonIcons/Coin1Icon"
import Coin2Icon from "@/ButtonIcons/Coin2Icon"
import Coin5Icon from "@/ButtonIcons/Coin5Icon"
import CustomCoinsIcon from "@/ButtonIcons/CustomCoinsIcon"

export default function AddTips() {
  const router = useRouter()
  const [todayTotal, setTodayTotal] = useState(0)
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [customAmount, setCustomAmount] = useState("")
  const [showEndShiftDialog, setShowEndShiftDialog] = useState(false)
  const [shiftNote, setShiftNote] = useState("")
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editAmount, setEditAmount] = useState("")
  const [showEditTipDialog, setShowEditTipDialog] = useState(false)
  const [editTipAmount, setEditTipAmount] = useState("")
  const [tipValues, setTipValues] = useState({ one: 1, two: 2.5, five: 5 })
  const [selectedTipButton, setSelectedTipButton] = useState<'one' | 'two' | 'five'>('one')

  useEffect(() => {
    const loadTodayTips = () => {
      const tips = getStoredTips()
      const today = getTodayKey()
      const todayTips = tips.filter((tip) => tip.date === today)
      const total = todayTips.reduce((sum, tip) => sum + tip.amount, 0)
      setTodayTotal(total)
    }

    loadTodayTips()

    // Listen for storage changes to update dashboard when returning from other pages
    const handleStorageChange = () => {
      loadTodayTips()
    }

    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("focus", loadTodayTips) // Reload when window gets focus

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("focus", loadTodayTips)
    }
  }, [])

  const addTip = (amount: number) => {
    saveTip(amount)
    setTodayTotal((prev) => prev + amount)
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
      // Use endShift to consolidate and update today's tips
      endShift(amount, shiftNote) // Pass current note if any
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
    // End the shift with the current total and optional note
    const noteToSave = shiftNote.trim() || undefined
    endShift(todayTotal, noteToSave)

    // Reset UI state
    setTodayTotal(0)
    setShowEndShiftDialog(false)
    setShiftNote("")

    // Navigate back to dashboard
    router.push("/")
  }

  // Input validation for numbers and comma only
  const handleNumberInput = (value: string, setter: (value: string) => void) => {
    // Only allow numbers, comma, and backspace
    const regex = /^[0-9,]*$/
    if (regex.test(value) || value === "") {
      setter(value)
    }
  }


  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-200 relative">
      {/* Header */}
      <div className="flex justify-between items-center p-4 pt-8">
        <h1 className="text-2xl font-bold text-black">CashTrack</h1>
        <Link href="/profile">
          <div className="w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-600 transition-colors">
            <User className="w-6 h-6 text-white" />
          </div>
        </Link>
      </div>

      {/* Main Content */}
      <div className="px-4 pb-20">
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
              variant="outline"
              className="flex-1 bg-gray-200 text-black border-gray-300 hover:bg-gray-300"
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
            <CustomCoinsIcon width={48} height={48} />
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
      </div>

      {/* Custom Amount Dialog */}
      <Dialog open={showCustomInput} onOpenChange={setShowCustomInput}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle>Benutzerdefinierten Betrag eingeben</DialogTitle>
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
            <div className="text-center">
              <div className="text-lg font-medium">Trinkgeld: {formatCurrency(todayTotal)}</div>
              <div className="text-gray-600">{formatDate(new Date())}</div>
            </div>

            <div className="text-lg font-medium">Schicht beenden?</div>

            <div>
              <label className="block text-sm font-medium mb-2">Notiz (optional):</label>
              <Textarea
                placeholder="Z.B.: Regen"
                value={shiftNote}
                onChange={(e) => setShiftNote(e.target.value)}
                className="bg-gray-200"
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 bg-gray-200 text-black"
                onClick={() => setShowEndShiftDialog(false)}
              >
                Nein
              </Button>
              <Button className="flex-1 bg-gray-200 text-black hover:bg-gray-300" onClick={handleEndShift}>
                Ja
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Tips Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle>Trinkgeld bearbeiten</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center text-gray-600">Aktueller Betrag: {formatCurrency(todayTotal)}</div>
            <Input
              type="text"
              inputMode="decimal"
              pattern="[0-9,]*"
              placeholder="0,00"
              value={editAmount}
              onChange={(e) => handleNumberInput(e.target.value, setEditAmount)}
              className="text-center text-xl"
            />
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
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle>Beitrag bearbeiten</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center text-gray-600 mb-4">Wähle einen Button zum Bearbeiten:</div>
            
            {/* Button Selection */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <Button
                variant={selectedTipButton === 'one' ? 'default' : 'outline'}
                className={`text-sm ${selectedTipButton === 'one' ? 'bg-black text-white' : 'bg-white text-black'}`}
                onClick={() => {
                  setSelectedTipButton('one')
                  setEditTipAmount(tipValues.one.toString().replace(".", ","))
                }}
              >
                {tipValues.one.toFixed(tipValues.one % 1 === 0 ? 0 : 2).replace(".", ",")}€
              </Button>
              <Button
                variant={selectedTipButton === 'two' ? 'default' : 'outline'}
                className={`text-sm ${selectedTipButton === 'two' ? 'bg-black text-white' : 'bg-white text-black'}`}
                onClick={() => {
                  setSelectedTipButton('two')
                  setEditTipAmount(tipValues.two.toString().replace(".", ","))
                }}
              >
                {tipValues.two.toFixed(tipValues.two % 1 === 0 ? 0 : 2).replace(".", ",")}€
              </Button>
              <Button
                variant={selectedTipButton === 'five' ? 'default' : 'outline'}
                className={`text-sm ${selectedTipButton === 'five' ? 'bg-black text-white' : 'bg-white text-black'}`}
                onClick={() => {
                  setSelectedTipButton('five')
                  setEditTipAmount(tipValues.five.toString().replace(".", ","))
                }}
              >
                {tipValues.five.toFixed(tipValues.five % 1 === 0 ? 0 : 2).replace(".", ",")}€
              </Button>
            </div>

            <div className="text-center text-gray-600">Neuer Wert für ausgewählten Button:</div>
            <Input
              type="text"
              inputMode="decimal"
              pattern="[0-9,]*"
              placeholder="0,00"
              value={editTipAmount}
              onChange={(e) => handleNumberInput(e.target.value, setEditTipAmount)}
              className="text-center text-xl"
            />
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

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200">
        <div className="flex justify-around py-4">
          <Link href="/" className="flex flex-col items-center">
            <Home className="w-6 h-6 text-black" />
          </Link>
          <Link href="/add-tips" className="flex flex-col items-center">
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
              <Plus className="w-5 h-5 text-white" />
            </div>
          </Link>
          <Link href="/calendar" className="flex flex-col items-center">
            <Calendar className="w-6 h-6 text-black" />
          </Link>
        </div>
      </div>
    </div>
  )
}
