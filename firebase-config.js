// ═══════════════════════════════════════════════════════
//  HAUSMEISTER PRO — Firebase Konfiguration
//  Trage hier deine Firebase-Projektdaten ein.
//  Zu finden unter: Firebase Console → Projekteinstellungen
// ═══════════════════════════════════════════════════════
const firebaseConfig = {
  apiKey:            "DEIN_API_KEY",
  authDomain:        "DEIN_PROJEKT.firebaseapp.com",
  projectId:         "DEIN_PROJEKT_ID",
  storageBucket:     "DEIN_PROJEKT.appspot.com",
  messagingSenderId: "DEIN_SENDER_ID",
  appId:             "DEINE_APP_ID"
};

firebase.initializeApp(firebaseConfig);
