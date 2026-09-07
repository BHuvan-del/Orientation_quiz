import React, { useState, useEffect } from 'react';
import HostApp from './components/host/HostApp';
import PlayerApp from './components/player/PlayerApp';
import { Terminal, Tv, Smartphone, ArrowRight, Radio } from 'lucide-react';

function LandingPage({ onNavigate }) {
  const [joinCode, setJoinCode] = useState('');

  const handleJoin = (e) => {
    e.preventDefault();
    if (joinCode.trim()) {
      onNavigate(`/play/${joinCode.trim().toUpperCase()}`);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between p-6 md:p-12 font-sans">
      
      {/* Header */}
      <header className="flex items-center justify-between max-w-5xl mx-auto w-full border-b border-zinc-800 pb-4 text-xs font-mono">
        <div className="flex items-center gap-2 text-zinc-200 font-bold">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span>LIVE_QUIZ_SYSTEM</span>
        </div>

        <button
          onClick={() => onNavigate('/host')}
          className="px-3 py-1.5 rounded border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 transition"
        >
          HOST CONSOLE →
        </button>
      </header>

      {/* Main Hero */}
      <main className="my-auto py-12 max-w-3xl mx-auto w-full text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-zinc-900 border border-zinc-800 text-cyan-400 text-xs font-mono mb-6">
          <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          LOW-LATENCY REAL-TIME COMPETITION ENGINE
        </div>

        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white font-mono leading-tight">
          Synchronized Live Event Quizzes
        </h1>
        <p className="text-sm text-zinc-400 max-w-xl mx-auto mt-3">
          Stage-projected questions with hundreds of concurrent mobile players. Anchored to server timestamps with sub-second telemetry.
        </p>

        {/* Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto mt-10 text-left">
          
          {/* Player Join Card */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-5 flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center text-cyan-400 mb-3">
                <Smartphone className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-white font-mono">Join as Participant</h2>
              <p className="text-xs text-zinc-400 mt-1">
                Enter your 5-character room code to connect your phone.
              </p>
            </div>

            <form onSubmit={handleJoin} className="mt-5 flex gap-2">
              <input
                type="text"
                maxLength={6}
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="ROOM CODE"
                className="w-full px-3 py-2 rounded border border-zinc-700 bg-zinc-950 text-cyan-400 font-mono font-bold text-sm uppercase tracking-wider focus:border-cyan-500 focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded bg-cyan-600 hover:bg-cyan-500 font-mono font-bold text-xs text-zinc-950 transition shrink-0"
              >
                JOIN
              </button>
            </form>
          </div>

          {/* Host Card */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-5 flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center text-emerald-400 mb-3">
                <Tv className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-white font-mono">Host a Session</h2>
              <p className="text-xs text-zinc-400 mt-1">
                Configure 30s questions, project stage QR code, and control quiz flow.
              </p>
            </div>

            <div className="mt-5">
              <button
                onClick={() => onNavigate('/host')}
                className="w-full py-2.5 rounded bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 font-mono font-bold text-xs text-zinc-200 transition flex items-center justify-center gap-2"
              >
                OPEN HOST CONSOLE
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="text-center font-mono text-xs text-zinc-600 border-t border-zinc-900 pt-4">
        POWERED BY REACT // VITE // FIRESTORE REAL-TIME SYNC
      </footer>

    </div>
  );
}


export default function App() {
  const [currentPath, setCurrentPath] = useState(() => {
    // Check hash first, then pathname
    const hash = window.location.hash.replace(/^#/, '');
    return hash || window.location.pathname;
  });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#/, '');
      setCurrentPath(hash || window.location.pathname);
    };

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handleHashChange);
    };
  }, []);

  const navigate = (path) => {
    window.location.hash = path;
    setCurrentPath(path);
  };

  // Route matching:
  // 1. /host or /host/:roomCode
  if (currentPath.startsWith('/host')) {
    return <HostApp />;
  }

  // 2. /play or /play/:roomCode
  const playMatch = currentPath.match(/\/play(?:\/([A-Z0-9]+))?/i);
  if (playMatch) {
    const code = playMatch[1] ? playMatch[1].toUpperCase() : '';
    return <PlayerApp urlRoomCode={code} />;
  }

  // 3. Root landing page
  return <LandingPage onNavigate={navigate} />;
}
