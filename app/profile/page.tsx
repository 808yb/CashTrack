"use client"

import { getStoredTips, validateAndDeduplicateImportedTips, removeDuplicates } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import React, { useState, useEffect } from "react";

export default function Profile() {
  const [showExport, setShowExport] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [exportData, setExportData] = useState("");
  const [importData, setImportData] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [totalTips, setTotalTips] = useState<number>(0);

  // Calculate total tips
  useEffect(() => {
    async function calculateTotalTips() {
      const tips = await getStoredTips();
      const total = tips.reduce((sum, tip) => sum + tip.amount, 0);
      setTotalTips(total);
    }
    calculateTotalTips();
  }, []);

  // Format currency for display
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  // Export: Show textarea with JSON and Kopieren button
  async function handleExport() {
    if (!showExport) {
      const tips = await getStoredTips();
      setExportData(JSON.stringify(tips, null, 2));
    }
    setShowExport((prev) => !prev);
    setShowImport(false);
    setMessage(null);
  }
  async function handleCopyExport() {
    try {
      await navigator.clipboard.writeText(exportData);
      setMessage("Daten wurden in die Zwischenablage kopiert. Füge sie zum Sichern in eine Notiz oder E-Mail ein.");
    } catch {
      setMessage("Bitte kopiere die Daten manuell aus dem Feld.");
    }
    setShowModal(true);
  }

  // Import: Show textarea for pasting JSON and Importieren button
  function handleImport() {
    setShowImport((prev) => !prev);
    setShowExport(false);
    setMessage(null);
  }
  async function handleImportData() {
    try {
      const importedData = JSON.parse(importData);
      if (!Array.isArray(importedData)) throw new Error("Ungültiges Format");
      if (!window.confirm("Alle aktuellen Trinkgeld-Daten werden durch die importierten Daten ersetzt. Fortfahren?")) return;
      
      // Validate, transform, and remove duplicates from imported data
      const validTips = validateAndDeduplicateImportedTips(importedData);
      
      await (await import("@/lib/db")).db.init();
      await (await import("@/lib/db")).db.clearTips();
      for (const tip of validTips) {
        await (await import("@/lib/db")).db.addTip(tip);
      }
      
      const originalCount = importedData.length;
      const finalCount = validTips.length;
      const duplicatesRemoved = originalCount - finalCount;
      
      const message = duplicatesRemoved > 0 
        ? `Import erfolgreich! ${duplicatesRemoved} doppelte Einträge wurden automatisch entfernt. Deine Trinkgeld-Daten wurden wiederhergestellt.`
        : "Import erfolgreich! Deine Trinkgeld-Daten wurden wiederhergestellt.";
      
      setMessage(message);
      setShowModal(true);
      setShowImport(false);
      setImportData("");
    } catch (e) {
      setMessage("Fehler beim Importieren der Daten. Stelle sicher, dass du gültige CashTrack-Daten eingefügt hast.");
      setShowModal(true);
    }
  }

  // Cleanup duplicate tips
  async function handleCleanupTips() {
    const tips = await getStoredTips();
    const deduped = removeDuplicates(tips);
    
    if (deduped.length === tips.length) {
      setMessage("Keine doppelten Einträge gefunden. Deine Daten sind bereits sauber.");
      setShowModal(true);
      return;
    }
    
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
            <span className="text-2xl">💰</span>
            <span className="font-semibold ml-2">Gesamt-Trinkgeld gesammelt</span>
            <div className="mt-2 p-4 bg-green-50 border border-green-200 rounded-xl">
              <div className="text-2xl font-bold text-green-700">
                {formatCurrency(totalTips)}
              </div>
              <p className="text-sm text-green-600 mt-1">
                Das ist die Summe aller deiner Trinkgeld-Einträge seit Beginn des Trackings!
              </p>
            </div>
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
              <span className="text-xs text-gray-500">(v1.2.0)</span>
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
              <div className="w-full max-w-xs mt-2 bg-gray-50 border border-gray-200 rounded-xl p-3 flex flex-col gap-2">
                <label className="text-xs text-gray-600 mb-1">Daten zum Sichern kopieren:</label>
                <textarea
                  className="w-full h-32 p-2 border border-gray-300 rounded text-xs font-mono bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
                  value={exportData}
                  readOnly
                  style={{ resize: "vertical" }}
                />
                <Button variant="secondary" onClick={handleCopyExport} className="w-full mt-1">
                  Kopieren
                </Button>
              </div>
            )}
            {showImport && (
              <div className="w-full max-w-xs mt-2 bg-gray-50 border border-gray-200 rounded-xl p-3 flex flex-col gap-2">
                <label className="text-xs text-gray-600 mb-1">Hier exportierte Daten einfügen:</label>
                <textarea
                  className="w-full h-32 p-2 border border-gray-300 rounded text-xs font-mono bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
                  value={importData}
                  onChange={e => setImportData(e.target.value)}
                  placeholder="Hier exportierte Daten einfügen..."
                  style={{ resize: "vertical" }}
                />
                <Button variant="secondary" onClick={handleImportData} className="w-full mt-1">
                  Importieren
                </Button>
              </div>
            )}
            {showModal && message && (
              <div className="fixed inset-0 flex items-center justify-center z-50">
                <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-6 max-w-xs w-full text-center">
                  <div className="mb-4 text-gray-900">{message}</div>
                  <Button variant="default" onClick={closeModal} className="w-full">OK</Button>
                </div>
                <div className="fixed inset-0 bg-black opacity-20 z-40" onClick={closeModal}></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
