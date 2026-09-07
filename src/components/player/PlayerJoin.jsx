import React, { useState, useEffect } from 'react';
import { User, Hash, ArrowRight, AlertCircle, Loader2, Terminal } from 'lucide-react';
import { joinSession, ensureAuth } from '../../firebase/quizService.js';

export default function PlayerJoin({ initialRoomCode, onJoined }) {
  const [roomCode, setRoomCode] = useState(initialRoomCode || '');
  const [nickname, setNickname] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    ensureAuth().catch((e) => console.warn('Anonymous auth warm-up:', e));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!roomCode.trim()) {
      setError('Please provide the 5-character Room Code.');
      return;
    }
    if (!nickname.trim()) {
      setError('Please provide your Name.');
      return;
    }
    if (!rollNo.trim()) {
      setError('Please provide your Roll Number.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { playerId, player } = await joinSession(roomCode, nickname, rollNo);
      localStorage.setItem('quiz_roomCode', roomCode.toUpperCase().trim());
      localStorage.setItem('quiz_nickname', nickname.trim());
      localStorage.setItem('quiz_rollNo', rollNo.trim().toUpperCase());
      localStorage.setItem('quiz_playerId', playerId);

      onJoined({
        roomCode: roomCode.toUpperCase().trim(),
        playerId,
        player
      });
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to join quiz.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-center px-4 py-8 font-sans">
      <div className="max-w-sm w-full mx-auto">
        
        {/* Minimalist Tech Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-cyan-400 text-xs font-mono mb-3">
            <Terminal className="w-3.5 h-3.5" /> LIVE_CLIENT
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-mono">
            Enter Quiz Session
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Provide your student details to connect to the live room.
          </p>
        </div>

        {/* Card */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-6 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Room Code */}
            <div>
              <label className="block text-xs font-mono font-medium text-zinc-400 uppercase mb-1">
                Room Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="ABC12"
                className="w-full px-3.5 py-2.5 rounded border border-zinc-700 bg-zinc-950 text-cyan-400 font-mono font-bold text-lg tracking-widest text-center focus:border-cyan-500 focus:outline-none uppercase"
                required
              />
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-mono font-medium text-zinc-400 uppercase mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded border border-zinc-700 bg-zinc-950 text-white text-sm font-medium focus:border-cyan-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Roll Number */}
            <div>
              <label className="block text-xs font-mono font-medium text-zinc-400 uppercase mb-1">
                Roll Number / Student ID
              </label>
              <div className="relative">
                <Hash className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value.toUpperCase())}
                  placeholder="e.g. 21CS042"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded border border-zinc-700 bg-zinc-950 text-white font-mono text-sm focus:border-cyan-500 focus:outline-none uppercase"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-2.5 rounded bg-zinc-950 border border-red-500/30 text-red-400 text-xs font-mono flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                <span>[ERR] {error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 bg-cyan-600 hover:bg-cyan-500 active:scale-[0.99] text-zinc-950 font-mono font-bold text-xs rounded transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  AUTHENTICATING...
                </>
              ) : (
                <>
                  CONNECT TO ROOM
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-[11px] font-mono text-zinc-600 mt-4">
          Session token is preserved across browser refreshes.
        </p>

      </div>
    </div>
  );
}
