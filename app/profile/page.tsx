"use client"

import { getStoredTips } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import React from "react"; // Added for React.useRef

export default function Profile() {
  // Debug: Export tips as JSON
  async function handleExportTips() {
    const tips = await getStoredTips();
    const blob = new Blob([JSON.stringify(tips, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cashtrack-tips-export.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
      alert("Keine doppelten Einträge gefunden. Deine Daten sind bereits sauber.");
      return;
    }
    // Clear all tips and re-add deduped
    await (await import("@/lib/db")).db.init();
    await (await import("@/lib/db")).db.clearTips();
    for (const tip of deduped) {
      await (await import("@/lib/db")).db.addTip(tip);
    }
    alert(`Bereinigung abgeschlossen! ${tips.length - deduped.length} doppelte Einträge entfernt.`);
  }

  // Import tips from JSON file
  async function handleImportTips(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const importedTips = JSON.parse(text);
      if (!Array.isArray(importedTips)) throw new Error("Ungültiges Format");
      if (!window.confirm("Alle aktuellen Trinkgeld-Daten werden durch die importierten Daten ersetzt. Fortfahren?")) return;
      await (await import("@/lib/db")).db.init();
      await (await import("@/lib/db")).db.clearTips();
      for (const tip of importedTips) {
        await (await import("@/lib/db")).db.addTip(tip);
      }
      alert("Import erfolgreich! Deine Trinkgeld-Daten wurden wiederhergestellt.");
    } catch (e) {
      alert("Fehler beim Importieren der Daten. Stelle sicher, dass es sich um eine gültige CashTrack-Exportdatei handelt.");
    }
    // Reset the input so the same file can be selected again if needed
    event.target.value = "";
  }

  // Ref for the hidden file input
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  function triggerFileInput() {
    fileInputRef.current?.click();
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
              <Button variant="default" onClick={handleExportTips} className="w-full">
                Exportieren
              </Button>
              <Button variant="default" onClick={triggerFileInput} className="w-full">
                Importieren
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json"
                className="hidden"
                onChange={handleImportTips}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
