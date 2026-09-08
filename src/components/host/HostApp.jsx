import React, { useState, useEffect } from 'react';
import { 
  subscribeToSession, 
  subscribeToPlayers, 
  fetchQuestions, 
  resetQuizSession,
  deleteQuizSession
} from '../../firebase/quizService.js';
import HostQuestionCreator from './HostQuestionCreator';
import HostLobby from './HostLobby';
import HostQuestion from './HostQuestion';
import HostResults from './HostResults';
import HostLeaderboard from './HostLeaderboard';
import HostAuthGate from './HostAuthGate';
import { RotateCcw, PlusCircle, Radio, Lock, Trash2 } from 'lucide-react';

export default function HostApp() {
  const getInitialRoomCode = () => {
    const hash = window.location.hash;
    const match = hash.match(/host\/([A-Z0-9]+)/i);
    return match ? match[1].toUpperCase() : localStorage.getItem('activeHostRoomCode') || null;
  };

  const [isAuthenticated, setIsAuthenticated] = useState(
    () => sessionStorage.getItem('host_auth_unlocked') === 'true'
  );
  const [roomCode, setRoomCode] = useState(getInitialRoomCode);
  const [session, setSession] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(!!roomCode);
  const [error, setError] = useState(null);
  const [resetting, setResetting] = useState(false);

  const handleLockConsole = () => {
    sessionStorage.removeItem('host_auth_unlocked');
    setIsAuthenticated(false);
  };

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

  const [deleting, setDeleting] = useState(false);

  const handleDeleteRoom = async (codeToDelete) => {
    const target = (codeToDelete || roomCode || '').toUpperCase().trim();
    if (!target) return;

    const confirmed = window.confirm(
      `Permanently delete room "${target}"?\n\nThis will permanently remove the quiz questions, all student registrations, and answer submissions from the database. This action cannot be undone.`
    );
    if (!confirmed) return;

    setDeleting(true);
    try {
      await deleteQuizSession(target);
      if (!codeToDelete || target === (roomCode || '').toUpperCase()) {
        localStorage.removeItem('activeHostRoomCode');
        setRoomCode(null);
        setSession(null);
        window.location.hash = '/host';
      }
      alert(`Room "${target}" was permanently deleted.`);
    } catch (err) {
      console.error('Failed to delete room:', err);
      alert('Error deleting room: ' + err.message);
    } finally {
      setDeleting(false);
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

  if (!isAuthenticated) {
    return (
      <HostAuthGate 
        onAuthenticated={() => setIsAuthenticated(true)} 
        expectedPasscode={session?.hostPasscode} 
      />
    );
  }

  if (!roomCode || !session) {
    if (loading) {
      return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center text-slate-600 font-sans text-sm">
          <div className="w-6 h-6 border-2 border-[#0070ba] border-t-transparent rounded-full animate-spin mb-3" />
          <span>Connecting to host console...</span>
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-[#f8fafc] text-slate-900 py-8 px-4 font-sans">
        {/* Subheader with Lock option */}
        <div className="max-w-4xl mx-auto mb-4 flex justify-end">
          <button
            onClick={handleLockConsole}
            className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition shadow-sm"
            title="Lock Console"
          >
            <Lock className="w-3.5 h-3.5 text-slate-500" />
            <span>Lock Console</span>
          </button>
        </div>
        {error && (
          <div className="max-w-md mx-auto mb-6 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center justify-between">
            <span>{error}</span>
            <button 
              onClick={() => { setRoomCode(null); localStorage.removeItem('activeHostRoomCode'); }}
              className="text-xs text-slate-700 underline ml-3 hover:text-black"
            >
              New Quiz
            </button>
          </div>
        )}
        <HostQuestionCreator 
          onQuizCreated={handleQuizCreated} 
          onDeleteRoom={handleDeleteRoom}
        />
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
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans">
      
      {/* Universal Host Top Header */}
      <header className="border-b border-slate-200 bg-white px-6 py-3 flex items-center justify-between text-xs select-none shadow-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold">
            <div className="w-6 h-6 rounded bg-[#003087] text-white flex items-center justify-center font-bold text-xs">
              Q
            </div>
            <span>Host Console</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 border-l border-slate-200 pl-4 text-slate-500">
            <span>Room:</span>
            <span className="text-[#0070ba] font-bold font-mono tracking-wider">{session.roomCode}</span>
          </div>

          <div className="hidden md:flex items-center gap-2 border-l border-slate-200 pl-4">
            <span className="flex items-center gap-1.5 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
              <Radio className="w-3 h-3 text-emerald-600" />
              Status: {session.status.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Global Control Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleResetSession}
            disabled={resetting}
            className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 transition flex items-center gap-1.5 text-xs font-semibold shadow-xs disabled:opacity-50"
            title="Reset to lobby and clear all player scores"
          >
            <RotateCcw className={`w-3.5 h-3.5 text-slate-500 ${resetting ? 'animate-spin' : ''}`} />
            <span>{resetting ? 'Resetting...' : 'Reset Session'}</span>
          </button>

          <button
            onClick={handleCreateNewQuiz}
            className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 transition flex items-center gap-1.5 text-xs font-semibold shadow-xs"
            title="Create a new quiz session"
          >
            <PlusCircle className="w-3.5 h-3.5 text-[#0070ba]" />
            <span className="hidden sm:inline">New Quiz</span>
          </button>

          <button
            onClick={() => handleDeleteRoom(session.roomCode)}
            disabled={deleting}
            className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-red-50 border border-red-200 text-red-600 transition flex items-center gap-1.5 text-xs font-semibold shadow-xs disabled:opacity-50"
            title="Permanently delete this quiz room and all data"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-500" />
            <span className="hidden sm:inline">{deleting ? 'Deleting...' : 'Delete Room'}</span>
          </button>

          <button
            onClick={handleLockConsole}
            className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-600 transition flex items-center gap-1.5 text-xs font-medium shadow-xs"
            title="Lock Console"
          >
            <Lock className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Lock</span>
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
            onDeleteRoom={() => handleDeleteRoom(session.roomCode)}
          />
        )}
      </main>

    </div>
  );
}
