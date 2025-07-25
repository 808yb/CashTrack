"use client"

export default function Profile() {
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
          </div>
        </div>
      </div>
    </div>
  )
}
