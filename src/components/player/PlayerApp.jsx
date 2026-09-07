import React, { useState, useEffect } from 'react';
import { 
  subscribeToSession, 
  fetchQuestions, 
  ensureAuth 
} from '../../firebase/quizService';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import PlayerJoin from './PlayerJoin';
import PlayerWaiting from './PlayerWaiting';
import PlayerQuestion from './PlayerQuestion';
import PlayerResult from './PlayerResult';
import PlayerLeaderboard from './PlayerLeaderboard';
import { Loader2, AlertCircle } from 'lucide-react';

export default function PlayerApp({ urlRoomCode }) {
  const [roomCode, setRoomCode] = useState(urlRoomCode || localStorage.getItem('quiz_roomCode') || '');
  const [playerId, setPlayerId] = useState(localStorage.getItem('quiz_playerId') || null);
  const [player, setPlayer] = useState(null);
  const [session, setSession] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [joinedAtStatus, setJoinedAtStatus] = useState(null); // Track status when player joined (for late joiner logic)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // When player completes the join form
  const handleJoined = ({ roomCode: newCode, playerId: newPid, player: newPlayer }) => {
    setRoomCode(newCode);
    setPlayerId(newPid);
    setPlayer(newPlayer);
    setJoinedAtStatus(session ? session.status : 'lobby');
  };

  // Re-sync player auth and listen to session doc
  useEffect(() => {
    if (!roomCode) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubSession = subscribeToSession(
      roomCode,
      (sessionData) => {
        if (!sessionData) {
          setError('Quiz room not found. Please verify the code.');
          setLoading(false);
          return;
        }
        setSession(sessionData);
        setLoading(false);
      },
      (err) => {
        console.error('Session listener error:', err);
        setError('Lost real-time sync with host. Reconnecting...');
      }
    );

    // Fetch questions for this room
    fetchQuestions(roomCode).then((qList) => {
      setQuestions(qList);
    }).catch(console.error);

    return () => unsubSession();
  }, [roomCode]);

  // Subscribe to player's own document for live score and status updates
  useEffect(() => {
    if (!roomCode || !playerId) return;

    const playerRef = doc(db, 'sessions', roomCode.toUpperCase(), 'players', playerId);
    const unsubPlayer = onSnapshot(playerRef, (snap) => {
      if (snap.exists()) {
        setPlayer(snap.data());
      }
    }, (err) => {
      console.error('Player doc listener error:', err);
    });

    return () => unsubPlayer();
  }, [roomCode, playerId]);

  // If roomCode or player is not set, show Join Screen
  if (!roomCode || !playerId || !player) {
    return (
      <PlayerJoin 
        initialRoomCode={urlRoomCode || roomCode} 
        onJoined={handleJoined} 
      />
    );
  }

  if (loading || !session) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mb-4" />
        <p className="text-slate-400 font-medium text-sm">Synchronizing with live session...</p>
      </div>
    );
  }

  const currentQIndex = session.currentQuestionIndex || 0;
  const currentQ = questions[currentQIndex] || {
    id: `q_${currentQIndex}`,
    text: 'Loading question...',
    options: ['...', '...', '...', '...'],
    correctIndex: 0,
    timeLimitSeconds: 20
  };

  // Late joiner check: if user joined during an active question that they haven't answered yet
  const isLateJoiner = 
    session.status === 'question' && 
    joinedAtStatus === 'question' && 
    player.lastAnswerQuestionIndex !== currentQIndex;

  switch (session.status) {
    case 'lobby':
      return <PlayerWaiting player={player} session={session} />;
    
    case 'question':
      return (
        <PlayerQuestion 
          session={session} 
          question={currentQ} 
          playerId={playerId} 
          isLateJoiner={isLateJoiner}
        />
      );
    
    case 'results':
      return <PlayerResult player={player} question={currentQ} />;
    
    case 'leaderboard':
      return <PlayerLeaderboard session={session} player={player} isFinal={false} />;
    
    case 'ended':
      return <PlayerLeaderboard session={session} player={player} isFinal={true} />;
    
    default:
      return <PlayerWaiting player={player} session={session} />;
  }
}
