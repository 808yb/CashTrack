"use client"

import { Calendar, Plus, User, Home } from "lucide-react"
import Link from "next/link"

export default function Profile() {
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
        <div className="bg-white rounded-2xl p-6">
          <h2 className="text-2xl font-bold text-black mb-6">Profil</h2>
          <div className="space-y-6 text-gray-800">
            <div>
              <span className="text-2xl">💬</span>
              <span className="font-semibold ml-2">Über CashTrack</span>
              <p className="mt-2 text-gray-600">
                CashTrack ist eine kleine App, die dir hilft, dein Trinkgeld einfach zu tracken – ohne Konto, ohne Cloud, ohne Stress.<br/>
                Gemacht von einem von euch, weil Excel  nervt und die meisten Apps zu viel wollen.
              </p>
            </div>
            <div>
              <span className="text-2xl">🔒</span>
              <span className="font-semibold ml-2">Kein Account, keine Anmeldung</span>
              <p className="mt-2 text-gray-600">
                Du brauchst keinen Account. Alles wird <b>nur lokal</b> auf deinem Handy oder PC gespeichert.<br/>
                Du bist der Boss über deine Daten – kein Tracking, keine Werbung.<br/>
                <span className="text-xs text-gray-500">Achtung: Wenn du den Verlauf oder Cache deines Browsers löschst, gehen auch deine Trinkgeld-Daten verloren!</span>
              </p>
            </div>
            <div>
              <span className="text-2xl">💶</span>
              <span className="font-semibold ml-2">Features</span>
              <ul className="mt-2 ml-4 list-disc text-gray-700 space-y-1">
                <li>✅ Einfaches Tip-Eingeben pro Schicht</li>
                <li>✅ Wochenübersicht & Trends auf einen Blick</li>
                <li>✅ Ziele setzen – z. B. 300 € für den nächsten Urlaub</li>
                <li>✅ Alles läuft offline, direkt im Browser</li>
                <li>✅ Super schnell & simpel</li>
              </ul>
            </div>
            <div>
              <span className="text-2xl">🚀</span>
              <span className="font-semibold ml-2">Warum?</span>
              <p className="mt-2 text-gray-600">
                Ich arbeite selbst mit Trinkgeld – und wollte wissen, wohin das Geld eigentlich fließt.<br/>
                CashTrack ist ein kleines Nebenprojekt, um genau das transparenter zu machen – ohne unnötigen Kram.
              </p>
            </div>
            <div>
              <span className="text-2xl">🔄</span>
              <span className="font-semibold ml-2">Updates</span>
              <p className="mt-2 text-gray-600">
                Wenn ein Update erscheint, bekommst du automatisch die neueste Version beim nächsten Öffnen der App.<br/>
                <span className="text-xs text-gray-500">(Tipp: App als Lesezeichen oder auf den Homescreen speichern!)</span>
              </p>
            </div>
            <div>
              <span className="text-2xl">📬</span>
              <span className="font-semibold ml-2">Feedback?</span>
              <p className="mt-2 text-gray-600">
                Wenn du Ideen oder Fehler findest, schreib mir gerne an <a href="mailto:cashtrack.contact@gmail.com" className="underline text-blue-600">cashtrack.contact@gmail.com</a>.<br/>
                Ich freue mich über jedes Feedback!
              </p>
            </div>
          </div>
        </div>
      </div>

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
