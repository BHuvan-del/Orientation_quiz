/**
 * Seed Questions Script
 * Usage: node scripts/seedQuestions.js [optional-custom-room-code]
 */
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  serverTimestamp, 
  writeBatch 
} from 'firebase/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
const db = getFirestore(app);

function generateRoomCode() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

async function run() {
  try {
    const rawData = readFileSync(resolve(__dirname, 'questions.json'), 'utf-8');
    const questions = JSON.parse(rawData);

    console.log(`Authenticating anonymously with Firebase...`);
    const cred = await signInAnonymously(auth);
    const hostId = cred.user.uid;

    const customCode = process.argv[2];
    const roomCode = (customCode || generateRoomCode()).toUpperCase();

    console.log(`Creating quiz session for Room Code: ${roomCode}`);

    const sessionRef = doc(db, 'sessions', roomCode);
    const sessionData = {
      title: 'Grand Live Event Quiz',
      roomCode,
      hostId,
      status: 'lobby',
      currentQuestionIndex: 0,
      totalQuestions: questions.length,
      questionStartedAt: null,
      createdAt: serverTimestamp(),
    };

    const batch = writeBatch(db);
    batch.set(sessionRef, sessionData);

    questions.forEach((q, idx) => {
      const qRef = doc(db, 'sessions', roomCode, 'questions', `q_${idx}`);
      batch.set(qRef, {
        order: idx,
        text: q.text,
        options: q.options,
        correctIndex: q.correctIndex,
        timeLimitSeconds: q.timeLimitSeconds || 20,
      });
    });

    await batch.commit();

    console.log('\n=======================================');
    console.log(` SUCCESS! Quiz Session Created`);
    console.log(` Room Code:   ${roomCode}`);
    console.log(` Questions:   ${questions.length} loaded`);
    console.log(` Host Screen: https://livequiz-978ee.web.app/#/host/${roomCode}`);
    console.log(` Player Join: https://livequiz-978ee.web.app/#/play/${roomCode}`);
    console.log('=======================================\n');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding questions:', err);
    process.exit(1);
  }
}

run();
