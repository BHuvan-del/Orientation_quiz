import React from 'react';
import { Terminal, Tv, Check } from 'lucide-react';

export default function PlayerWaiting({ player, session }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between p-6 max-w-sm mx-auto font-sans">
      
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3 font-mono text-xs">
        <span className="text-cyan-400 font-bold flex items-center gap-1.5">
          <Terminal className="w-3.5 h-3.5" /> LIVE_CLIENT
        </span>
        <span className="text-zinc-500">
          ROOM: <span className="text-white font-bold">{session?.roomCode}</span>
        </span>
      </div>

      {/* Center Card */}
      <div className="my-auto space-y-5 text-center">
        
        <div className="w-12 h-12 mx-auto rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
          <Check className="w-6 h-6 stroke-[3]" />
        </div>

        <div>
          <h1 className="text-xl font-bold text-white font-mono">
            Connected to Session
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Waiting for the host to launch the quiz...
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-left font-mono">
          <div className="text-[10px] text-zinc-500 uppercase">
            ACTIVE PROFILE
          </div>
          <div className="text-base font-bold text-white mt-0.5">
            {player?.nickname}
          </div>
          <div className="text-xs text-cyan-400 mt-0.5">
            ID: {player?.rollNo}
          </div>
        </div>

        {/* Big screen guidance */}
        <div className="p-3.5 rounded-lg bg-zinc-900 border border-zinc-800 text-left flex items-start gap-3">
          <Tv className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div className="text-xs text-zinc-300">
            <span className="font-semibold block text-white">Watch Stage Display</span>
            Question statements and countdowns appear on the big screen. You tap your answer on this screen.
          </div>
        </div>

      </div>

      {/* Footer */}
      <div className="text-center font-mono text-[11px] text-zinc-600 pb-2 flex items-center justify-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
        SYNCED // READY FOR QUESTION 1
      </div>

    </div>
  );
}
