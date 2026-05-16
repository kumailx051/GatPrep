import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { initializeFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyAXPycR_lvIfk9ltx58OenL8-xozTRt01Q",
  authDomain: "gat-test-1a91a.firebaseapp.com",
  projectId: "gat-test-1a91a",
  storageBucket: "gat-test-1a91a.firebasestorage.app",
  messagingSenderId: "681074853606",
  appId: "1:681074853606:web:d9f3560bbea56f535c9d27"
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)

// Use initializeFirestore instead of getFirestore to enable long-polling
// fallback. This prevents setDoc from hanging when WebSocket connections
// are blocked or interrupted by the network/browser.
const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
})

export { app, auth, db }
