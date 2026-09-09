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
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col justify-between p-6 md:p-12 font-sans">
      
      {/* Header */}
      <header className="flex items-center justify-between max-w-5xl mx-auto w-full border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#003087] text-white flex items-center justify-center font-bold text-base shadow-sm">
            Q
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-900">
            LiveQuiz <span className="text-[#0070ba] font-normal">Orientation</span>
          </span>
        </div>

        <button
          onClick={() => onNavigate('/host')}
          className="px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition"
        >
          Host Console →
        </button>
      </header>

      {/* Main Hero */}
      <main className="my-auto py-12 max-w-3xl mx-auto w-full text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#0070ba] text-xs font-semibold mb-6">
          <span className="w-2 h-2 rounded-full bg-[#0070ba]" />
          Real-Time Live Event Quiz System
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
          Interactive Live Quizzes for Big Screen Audiences
        </h1>
        <p className="text-base text-slate-600 max-w-xl mx-auto mt-4 leading-relaxed">
          Project questions on stage. Up to 300 students join on mobile with official Thapar email and 10-digit roll number.
        </p>

        {/* Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto mt-10 text-left">
          
          {/* Player Join Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition">
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0070ba] flex items-center justify-center mb-4">
                <Smartphone className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Join as Participant</h2>
              <p className="text-xs text-slate-500 mt-1">
                Enter the 5-character room code from the stage projector to participate.
              </p>
            </div>

            <form onSubmit={handleJoin} className="mt-6 flex gap-2">
              <input
                type="text"
                maxLength={6}
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="ROOM CODE"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 font-mono font-bold text-sm uppercase tracking-wider focus:border-[#0070ba] focus:ring-1 focus:ring-[#0070ba] focus:outline-none"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-lg bg-[#0070ba] hover:bg-[#005ea6] font-semibold text-xs text-white transition shrink-0 shadow-sm"
              >
                Join
              </button>
            </form>
          </div>

          {/* Host Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition">
            <div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center mb-4">
                <Tv className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Host a Session</h2>
              <p className="text-xs text-slate-500 mt-1">
                Configure 30-second questions, project the stage QR code, and control quiz flow.
              </p>
            </div>

            <div className="mt-6">
              <button
                onClick={() => onNavigate('/host')}
                className="w-full py-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs transition flex items-center justify-center gap-2 shadow-sm"
              >
                Open Host Console
                <ArrowRight className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-500 border-t border-slate-200 pt-4">
        LiveQuiz System • Designed for Live Stage Events
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
  const hostMatch = currentPath.match(/\/host(?:\/([A-Z0-9]+))?/i);
  if (hostMatch) {
    const code = hostMatch[1] ? hostMatch[1].toUpperCase() : '';
    return <HostApp urlRoomCode={code} />;
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
