import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult,
  signOut 
} from 'firebase/auth';
import { 
  getFirestore, 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager 
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCZtpRhZuCpwPRLTW0G8_PQKSCBrrgm7y8",
  authDomain: "livequiz-978ee.firebaseapp.com",
  projectId: "livequiz-978ee",
  storageBucket: "livequiz-978ee.firebasestorage.app",
  messagingSenderId: "558861356496",
  appId: "1:558861356496:web:0576984e649266e72dfdd5"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  hd: 'thapar.edu',
  prompt: 'select_account'
});

// Initialize Firestore with multi-tab persistent cache for robustness and reconnection
let db;
try {
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  });
} catch (e) {
  db = getFirestore(app);
}

export { 
  app, 
  auth, 
  db, 
  googleProvider, 
  signInAnonymously, 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult,
  signOut 
};


