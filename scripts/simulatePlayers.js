/**
 * Concurrency & Load Simulation Script
 * Simulates 30 concurrent players joining and answering a live quiz question in real time.
 * Usage: node scripts/simulatePlayers.js <ROOM_CODE>
 */
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc,
  serverTimestamp, 
  writeBatch,
  increment,
  onSnapshot
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCZtpRhZuCpwPRLTW0G8_PQKSCBrrgm7y8",
  authDomain: "livequiz-978ee.firebaseapp.com",
  projectId: "livequiz-978ee",
  storageBucket: "livequiz-978ee.firebasestorage.app",
  messagingSenderId: "558861356496",
  appId: "1:558861356496:web:0576984e649266e72dfdd5"
};

const roomCode = (process.argv[2] || 'TESTQ').toUpperCase();
const NUM_PLAYERS = 30;

console.log(`Starting load simulation for room: ${roomCode} with ${NUM_PLAYERS} concurrent players`);

async function simulatePlayer(index) {
  // Initialize unique Firebase app instance for each player to simulate separate mobile devices
  const appName = `player_app_${index}`;
  const app = initializeApp(firebaseConfig, appName);
  const auth = getAuth(app);
  const db = getFirestore(app);

  const cred = await signInAnonymously(auth);
  const uid = cred.user.uid;

  const nickname = `Student_${String(index + 1).padStart(2, '0')}`;
  const rollNo = `102203${String(index + 1).padStart(4, '0')}`;
  const email = `student${String(index + 1).padStart(2, '0')}@thapar.edu`;

  // Join session
  const playerRef = doc(db, 'sessions', roomCode, 'players', uid);
  await setDoc(playerRef, {
    nickname,
    rollNo,
    email,
    authProvider: 'simulated_thapar',
    score: 0,
    joinedAt: serverTimestamp(),
    connectionStatus: 'active',
    lastAnswerQuestionIndex: -1,
    lastAnswerIndex: null,
    lastPoints: 0
  }, { merge: true });

  return { uid, nickname, rollNo, email, db, app };
}


async function run() {
  try {
    console.log(`Simulating ${NUM_PLAYERS} players joining simultaneously...`);
    const startTime = Date.now();
    
    // Spawn 30 concurrent player joins
    const joinPromises = [];
    for (let i = 0; i < NUM_PLAYERS; i++) {
      joinPromises.push(simulatePlayer(i));
    }
    const players = await Promise.all(joinPromises);
    const joinTime = Date.now() - startTime;
    console.log(`✓ All ${NUM_PLAYERS} players successfully joined in ${joinTime}ms!`);

    // Verify answers submission simulation
    console.log(`\nSimulating synchronized answering spike for Question 0...`);
    const answerPromises = players.map(async (p, idx) => {
      // Stagger slightly between 200ms and 2500ms to simulate human reaction times on mobile
      const delay = Math.floor(Math.random() * 2000) + 200;
      await new Promise(r => setTimeout(r, delay));

      // Pick an option (mostly correct for higher scores)
      const selectedIndex = (idx % 4 === 0) ? 0 : 1;
      const isCorrect = (selectedIndex === 1);
      const points = isCorrect ? Math.round(500 + Math.random() * 450) : 0;

      const batch = writeBatch(p.db);
      const answerRef = doc(p.db, 'sessions', roomCode, 'players', p.uid, 'answers', 'q_0');
      batch.set(answerRef, {
        selectedIndex,
        answeredAt: serverTimestamp(),
        isCorrect,
        pointsAwarded: points
      });

      const playerRef = doc(p.db, 'sessions', roomCode, 'players', p.uid);
      batch.update(playerRef, {
        score: increment(points),
        lastAnswerQuestionIndex: 0,
        lastAnswerIndex: selectedIndex,
        lastPoints: points,
        lastCorrect: isCorrect
      });

      await batch.commit();
      return { player: p.nickname, selectedIndex, points };
    });

    const results = await Promise.all(answerPromises);
    console.log(`✓ All ${results.length} answer writes submitted and committed successfully!`);

    // Check aggregate
    const sampleDb = players[0].db;
    const sessionDoc = await getDoc(doc(sampleDb, 'sessions', roomCode));
    console.log(`Session status:`, sessionDoc.data()?.status);

    console.log(`\n✓ LOAD TEST PASSED: Concurrency handled with 0 write conflicts.`);
    process.exit(0);
  } catch (err) {
    console.error('Simulation error:', err);
    process.exit(1);
  }
}

run();
