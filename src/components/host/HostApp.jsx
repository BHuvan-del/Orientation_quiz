import React, { useState, useEffect } from 'react';
import { 
  subscribeToSession, 
  subscribeToPlayers, 
  fetchQuestions, 
  resetQuizSession 
} from '../../firebase/quizService.js';
import HostQuestionCreator from './HostQuestionCreator';
import HostLobby from './HostLobby';
import HostQuestion from './HostQuestion';
import HostResults from './HostResults';
import HostLeaderboard from './HostLeaderboard';
import { RotateCcw, PlusCircle, Terminal, Radio } from 'lucide-react';

export default function HostApp() {
  const getInitialRoomCode = () => {
    const hash = window.location.hash;
    const match = hash.match(/host\/([A-Z0-9]+)/i);
    return match ? match[1].toUpperCase() : localStorage.getItem('activeHostRoomCode') || null;
  };

  const [roomCode, setRoomCode] = useState(getInitialRoomCode);
  const [session, setSession] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(!!roomCode);
  const [error, setError] = useState(null);
  const [resetting, setResetting] = useState(false);

  const handleQuizCreated = (newCode) => {
    localStorage.setItem('activeHostRoomCode', newCode);
    setRoomCode(newCode);
    window.location.hash = `/host/${newCode}`;
  };

  const handleResetSession = async () => {
    if (!roomCode) return;
    const confirmed = window.confirm(
      'Reset this session? This will return the quiz to the Lobby and reset all player scores to 0.'
    );
    if (!confirmed) return;

    setResetting(true);
    try {
      await resetQuizSession(roomCode);
    } catch (err) {
      console.error('Failed to reset session:', err);
      alert('Error resetting session: ' + err.message);
    } finally {
      setResetting(false);
    }
  };

  const handleCreateNewQuiz = () => {
    const confirmed = window.confirm(
      'Leave this quiz and create a new one? You can return anytime using the room code.'
    );
    if (!confirmed) return;

    localStorage.removeItem('activeHostRoomCode');
    setRoomCode(null);
    setSession(null);
    window.location.hash = '/host';
  };

  // Subscribe to session
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
          setError('Session not found or has been removed.');
          setLoading(false);
          return;
        }
        setSession(sessionData);
        setLoading(false);
      },
      (err) => {
        console.error('Session listener error:', err);
        setError('Connection lost. Retrying...');
      }
    );

    fetchQuestions(roomCode).then((qList) => {
      setQuestions(qList);
    }).catch(console.error);

    const unsubPlayers = subscribeToPlayers(
      roomCode,
      (playerList) => {
        setPlayers(playerList);
      },
      (err) => {
        console.error('Players listener error:', err);
      }
    );

    return () => {
      unsubSession();
      unsubPlayers();
    };
  }, [roomCode]);

  if (!roomCode || !session) {
    if (loading) {
      return (
        <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-zinc-400 font-mono text-sm">
          <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mb-3" />
          <span>[SYSTEM] Connecting to host console...</span>
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 py-8 px-4 font-sans">
        {error && (
          <div className="max-w-md mx-auto mb-6 p-3 rounded-lg bg-zinc-900 border border-red-500/30 text-red-400 text-xs font-mono flex items-center justify-between">
            <span>[ERR] {error}</span>
            <button 
              onClick={() => { setRoomCode(null); localStorage.removeItem('activeHostRoomCode'); }}
              className="text-xs text-zinc-400 underline ml-3 hover:text-white"
            >
              New Quiz
            </button>
          </div>
        )}
        <HostQuestionCreator onQuizCreated={handleQuizCreated} />
      </div>
    );
  }

  const currentQ = questions[session.currentQuestionIndex || 0] || {
    text: 'Loading question...',
    options: ['...', '...', '...', '...'],
    correctIndex: 0,
    timeLimitSeconds: 30
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      
      {/* Universal Host Top Header */}
      <header className="border-b border-zinc-800/80 bg-zinc-900/60 backdrop-blur px-6 py-3 flex items-center justify-between text-xs font-mono select-none">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-zinc-300 font-bold">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span>HOST CONSOLE</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 border-l border-zinc-800 pl-4 text-zinc-400">
            <span>SESSION:</span>
            <span className="text-cyan-400 font-bold tracking-widest">{session.roomCode}</span>
          </div>

          <div className="hidden md:flex items-center gap-2 border-l border-zinc-800 pl-4">
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              STATUS: {session.status.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Global Control Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleResetSession}
            disabled={resetting}
            className="px-3 py-1.5 rounded-md bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700/80 text-zinc-300 hover:text-white transition flex items-center gap-1.5 text-xs font-mono font-medium disabled:opacity-50"
            title="Reset to lobby and clear all player scores"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
            <span>{resetting ? 'Resetting...' : 'Reset Session'}</span>
          </button>

          <button
            onClick={handleCreateNewQuiz}
            className="px-3 py-1.5 rounded-md bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700/80 text-zinc-300 hover:text-white transition flex items-center gap-1.5 text-xs font-mono font-medium"
            title="Create a new quiz session"
          >
            <PlusCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">New Quiz</span>
          </button>
        </div>
      </header>

      {/* Main View Area */}
      <main className="flex-1 flex flex-col">
        {session.status === 'lobby' && (
          <HostLobby session={session} players={players} />
        )}

        {session.status === 'question' && (
          <HostQuestion session={session} question={currentQ} players={players} />
        )}

        {session.status === 'results' && (
          <HostResults session={session} question={currentQ} players={players} />
        )}

        {(session.status === 'leaderboard' || session.status === 'ended') && (
          <HostLeaderboard 
            session={session} 
            players={players} 
            onResetSession={handleResetSession}
            onCreateNewQuiz={handleCreateNewQuiz}
          />
        )}
      </main>

    </div>
  );
}
