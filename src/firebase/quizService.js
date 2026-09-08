import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  onSnapshot, 
  serverTimestamp, 
  query, 
  orderBy, 
  where,
  increment,
  writeBatch
} from 'firebase/firestore';
import { db, auth, signInAnonymously } from './config.js';

/**
 * Generate a clean, human-readable 5-character room code.
 * Excludes confusing characters like 0, O, 1, I, L.
 */
export function generateRoomCode() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Ensure the current client is authenticated anonymously
 */
export async function ensureAuth() {
  if (auth.currentUser) return auth.currentUser;
  const userCredential = await signInAnonymously(auth);
  return userCredential.user;
}

/**
 * Create a new quiz session with questions
 */
export async function createQuizSession(title, questions) {
  const user = await ensureAuth();
  const roomCode = generateRoomCode();

  const sessionRef = doc(db, 'sessions', roomCode);
  const sessionData = {
    title: title || 'Live Event Quiz',
    roomCode,
    hostId: user.uid,
    status: 'lobby', // 'lobby' | 'question' | 'results' | 'leaderboard' | 'ended'
    currentQuestionIndex: 0,
    totalQuestions: questions.length,
    questionStartedAt: null,
    createdAt: serverTimestamp(),
  };

  const batch = writeBatch(db);
  batch.set(sessionRef, sessionData);

  // Write questions to subcollection
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
  return roomCode;
}

/**
 * Real-time listener for the main session doc
 */
export function subscribeToSession(roomCode, onUpdate, onError) {
  if (!roomCode) return () => {};
  // Eagerly ensure auth in background
  ensureAuth().catch(() => {});
  const sessionRef = doc(db, 'sessions', roomCode.toUpperCase());
  return onSnapshot(sessionRef, (snapshot) => {
    if (snapshot.exists()) {
      onUpdate({ id: snapshot.id, ...snapshot.data() });
    } else {
      onUpdate(null);
    }
  }, onError);
}

/**
 * Fetch all questions for a session
 */
export async function fetchQuestions(roomCode) {
  const qCol = collection(db, 'sessions', roomCode.toUpperCase(), 'questions');
  const qQuery = query(qCol, orderBy('order', 'asc'));
  const snapshot = await getDocs(qQuery);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

/**
 * Real-time listener for players in a session (Host use)
 */
export function subscribeToPlayers(roomCode, onUpdate, onError) {
  if (!roomCode) return () => {};
  const playersCol = collection(db, 'sessions', roomCode.toUpperCase(), 'players');
  return onSnapshot(playersCol, (snapshot) => {
    const players = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    onUpdate(players);
  }, onError);
}

/**
 * Player joins the session with Thapar Email, Name and 10-digit Roll No
 */
export async function joinSession(roomCode, nicknameOrData, rollNoArg, emailArg, authProviderArg) {
  // 1. Ensure user is authenticated BEFORE any Firestore call
  const user = await ensureAuth();
  const playerId = user.uid;

  let nickname = typeof nicknameOrData === 'object' ? nicknameOrData.nickname : nicknameOrData;
  let rollNo = typeof nicknameOrData === 'object' ? nicknameOrData.rollNo : rollNoArg;
  let email = typeof nicknameOrData === 'object' ? nicknameOrData.email : emailArg;
  let authProvider = typeof nicknameOrData === 'object' ? (nicknameOrData.authProvider || 'thapar_email') : (authProviderArg || 'thapar_email');

  const cleanRollNo = (rollNo || '').trim();
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanName = (nickname || '').trim();

  // Validate 10-digit Roll Number
  if (!/^\d{10}$/.test(cleanRollNo)) {
    throw new Error('Roll Number must be exactly 10 numeric digits (e.g. 1022030123).');
  }

  // Validate Thapar University Email
  if (!cleanEmail.endsWith('@thapar.edu') || !/^[a-zA-Z0-9._%+-]+@thapar\.edu$/i.test(cleanEmail)) {
    throw new Error('Only official Thapar Institute email addresses (@thapar.edu) are accepted.');
  }

  if (!cleanName) {
    throw new Error('Full Name is required.');
  }

  const code = roomCode.toUpperCase().trim();
  const sessionRef = doc(db, 'sessions', code);
  const sessionSnap = await getDoc(sessionRef);

  if (!sessionSnap.exists()) {
    throw new Error('Room not found. Please verify the code.');
  }

  const session = sessionSnap.data();
  if (session.status === 'ended') {
    throw new Error('This quiz session has already concluded.');
  }

  // Duplicate checks in active room
  try {
    const playersCol = collection(db, 'sessions', code, 'players');

    // 1. Check duplicate roll number
    const rollQuery = query(playersCol, where('rollNo', '==', cleanRollNo));
    const rollSnap = await getDocs(rollQuery);
    if (!rollSnap.empty) {
      const existing = rollSnap.docs[0];
      if (existing.id !== playerId) {
        throw new Error(`Roll Number "${cleanRollNo}" has already joined this session.`);
      }
    }

    // 2. Check duplicate email
    const emailQuery = query(playersCol, where('email', '==', cleanEmail));
    const emailSnap = await getDocs(emailQuery);
    if (!emailSnap.empty) {
      const existing = emailSnap.docs[0];
      if (existing.id !== playerId) {
        throw new Error(`Thapar Email "${cleanEmail}" has already joined this session.`);
      }
    }
  } catch (err) {
    if (err.message && (err.message.includes('has already joined') || err.message.includes('Roll Number must'))) {
      throw err;
    }
    console.warn('Player duplicate check warning:', err);
  }

  const playerRef = doc(db, 'sessions', code, 'players', playerId);

  const playerData = {
    nickname: cleanName,
    rollNo: cleanRollNo,
    email: cleanEmail,
    authProvider,
    score: 0,
    joinedAt: serverTimestamp(),
    connectionStatus: 'active',
    lastAnswerQuestionIndex: -1,
    lastAnswerIndex: null,
    lastPoints: 0
  };

  await setDoc(playerRef, playerData, { merge: true });
  return { playerId, player: playerData };
}


/**
 * Host updates session status / advances quiz
 */
export async function updateSessionStatus(roomCode, status, extraFields = {}) {
  await ensureAuth();
  const sessionRef = doc(db, 'sessions', roomCode.toUpperCase());
  await updateDoc(sessionRef, {
    status,
    ...extraFields
  });
}

/**
 * Host starts a question
 */
export async function startQuestion(roomCode, questionIndex) {
  await ensureAuth();
  const sessionRef = doc(db, 'sessions', roomCode.toUpperCase());
  await updateDoc(sessionRef, {
    status: 'question',
    currentQuestionIndex: questionIndex,
    questionStartedAt: serverTimestamp()
  });
}

/**
 * Host resets the entire quiz session (resets status to lobby, resets all player scores)
 */
export async function resetQuizSession(roomCode) {
  await ensureAuth();
  const code = roomCode.toUpperCase();
  const sessionRef = doc(db, 'sessions', code);
  
  await updateDoc(sessionRef, {
    status: 'lobby',
    currentQuestionIndex: 0,
    questionStartedAt: null
  });


  const playersCol = collection(db, 'sessions', code, 'players');
  const snap = await getDocs(playersCol);
  
  if (!snap.empty) {
    const batch = writeBatch(db);
    snap.docs.forEach((d) => {
      batch.update(d.ref, {
        score: 0,
        lastAnswerQuestionIndex: -1,
        lastAnswerIndex: null,
        lastPoints: 0,
        lastCorrect: false
      });
    });
    await batch.commit();
  }
}

/**
 * Submit answer by player
 */
export async function submitAnswer({
  roomCode,
  questionId,
  questionIndex,
  selectedIndex,
  correctIndex,
  startedAtMillis,
  timeLimitSeconds = 30
}) {

  const user = await ensureAuth();
  const playerId = user.uid;
  const code = roomCode.toUpperCase();

  const now = Date.now();
  const timeTakenMs = Math.max(0, now - startedAtMillis);
  const timeLimitMs = timeLimitSeconds * 1000;

  const isCorrect = (selectedIndex === correctIndex);
  let pointsAwarded = 0;

  if (isCorrect) {
    // Scoring formula: Speed bonus. Between 500 and 1000 points
    // points = 500 + 500 * (1 - timeTaken/timeLimit)
    const speedRatio = Math.max(0, 1 - (timeTakenMs / timeLimitMs));
    pointsAwarded = Math.round(500 + (500 * speedRatio));
  }

  const batch = writeBatch(db);

  // 1. Immutable record in subcollection
  const answerRef = doc(db, 'sessions', code, 'players', playerId, 'answers', questionId);
  batch.set(answerRef, {
    selectedIndex,
    answeredAt: serverTimestamp(),
    isCorrect,
    pointsAwarded
  });

  // 2. Update player aggregate doc for real-time host counts & leaderboard
  const playerRef = doc(db, 'sessions', code, 'players', playerId);
  batch.update(playerRef, {
    score: increment(pointsAwarded),
    lastAnswerQuestionIndex: questionIndex,
    lastAnswerIndex: selectedIndex,
    lastPoints: pointsAwarded,
    lastCorrect: isCorrect
  });

  await batch.commit();
  return { isCorrect, pointsAwarded };
}

/**
 * Check if player has already submitted an answer for a question (reconnect scenario)
 */
export async function getPlayerAnswer(roomCode, playerId, questionId) {
  try {
    const answerRef = doc(db, 'sessions', roomCode.toUpperCase(), 'players', playerId, 'answers', questionId);
    const snap = await getDoc(answerRef);
    if (snap.exists()) {
      return snap.data();
    }
  } catch (e) {
    console.error('Error fetching player answer:', e);
  }
  return null;
}
