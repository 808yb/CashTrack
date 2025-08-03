"use client"

import { getStoredTips } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import React, { useState } from "react";

export default function Profile() {
  // State for export/import UI and messages
  const [showExport, setShowExport] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Export: Show only Kopieren button
  async function handleExport() {
    setShowExport((prev) => !prev);
    setShowImport(false);
    setMessage(null);
  }
  async function handleCopyExport() {
    const tips = await getStoredTips();
    await navigator.clipboard.writeText(JSON.stringify(tips, null, 2));
    setMessage("Daten wurden in die Zwischenablage kopiert. Füge sie zum Sichern in eine Notiz oder E-Mail ein.");
    setShowModal(true);
  }

  // Import: Show only Einfügen & Importieren button
  function handleImport() {
    setShowImport((prev) => !prev);
    setShowExport(false);
    setMessage(null);
  }
  async function handlePasteImport() {
    try {
      const text = await navigator.clipboard.readText();
      const importedTips = JSON.parse(text);
      if (!Array.isArray(importedTips)) throw new Error("Ungültiges Format");
      if (!window.confirm("Alle aktuellen Trinkgeld-Daten werden durch die importierten Daten ersetzt. Fortfahren?")) return;
      await (await import("@/lib/db")).db.init();
      await (await import("@/lib/db")).db.clearTips();
      for (const tip of importedTips) {
        await (await import("@/lib/db")).db.addTip(tip);
      }
      setMessage("Import erfolgreich! Deine Trinkgeld-Daten wurden wiederhergestellt.");
      setShowModal(true);
      setShowImport(false);
    } catch (e) {
      setMessage("Fehler beim Importieren der Daten. Stelle sicher, dass du gültige CashTrack-Daten in der Zwischenablage hast.");
      setShowModal(true);
    }
  }

  // Cleanup duplicate tips
  async function handleCleanupTips() {
    const tips = await getStoredTips();
    // Remove duplicates: keep only the first occurrence of each date+amount
    const seen = new Set();
    const deduped = tips.filter(tip => {
      const key = `${tip.date}|${tip.amount}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    if (deduped.length === tips.length) {
      setMessage("Keine doppelten Einträge gefunden. Deine Daten sind bereits sauber.");
      setShowModal(true);
      return;
    }
    // Clear all tips and re-add deduped
    await (await import("@/lib/db")).db.init();
    await (await import("@/lib/db")).db.clearTips();
    for (const tip of deduped) {
      await (await import("@/lib/db")).db.addTip(tip);
    }
    setMessage(`Bereinigung abgeschlossen! ${tips.length - deduped.length} doppelte Einträge entfernt.`);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setMessage(null);
  }

  return (
    <div className="px-4">
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
              <li>✅ Ziele setzen – z. B. 300 € für den nächsten Urlaub</li>
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
            <p className="text-right mt-2 text-gray-600">
              <span className="text-xs text-gray-500">(v1.1.0)</span>
            </p>
          </div>
        </div>
        <div className="mt-10">
          <p className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">
            <b>Hinweis:</b> Aufgrund eines früheren Fehlers können doppelte Einträge in deinen Trinkgeld-Daten vorkommen. Mit diesen Buttons kannst du deine Daten exportieren, importieren (wiederherstellen) oder automatisch bereinigen. Nutze Export/Import auch als Backup-Funktion!
          </p>
          <div className="flex flex-col gap-4 items-center">
            <Button variant="destructive" onClick={handleCleanupTips} className="w-full max-w-xs">
              Doppelte Einträge bereinigen
            </Button>
            <div className="flex flex-row gap-4 w-full max-w-xs justify-center">
              <Button variant="default" onClick={handleExport} className="w-full">
                Export
              </Button>
              <Button variant="default" onClick={handleImport} className="w-full">
                Import
              </Button>
            </div>
            {showExport && (
              <Button variant="secondary" onClick={handleCopyExport} className="w-full max-w-xs mt-2">
                Kopieren
              </Button>
            )}
            {showImport && (
              <Button variant="secondary" onClick={handlePasteImport} className="w-full max-w-xs mt-2">
                Einfügen & Importieren
              </Button>
            )}
            {showModal && message && (
              <div className="fixed inset-0 flex items-center justify-center z-50">
                <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-6 max-w-xs w-full text-center">
                  <div className="mb-4 text-gray-900">{message}</div>
                  <Button variant="default" onClick={closeModal} className="w-full">OK</Button>
                </div>
                <div className="fixed inset-0 bg-black opacity-30 z-40" onClick={closeModal}></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
