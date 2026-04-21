import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { initializeFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyD6LB_jGY8THtIxgkR546KLvjIZdKc2OCE',
  authDomain: 'gat-test-79f4d.firebaseapp.com',
  projectId: 'gat-test-79f4d',
  storageBucket: 'gat-test-79f4d.firebasestorage.app',
  messagingSenderId: '656665071237',
  appId: '1:656665071237:web:a6fcaa997b6af83ff0e3ec',
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
