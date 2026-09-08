import React from 'react';
import { Terminal, Tv, Check } from 'lucide-react';

export default function PlayerWaiting({ player, session }) {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col justify-between p-4 sm:p-6 max-w-md mx-auto font-sans">
      
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-slate-700">Live Session Active</span>
        </div>
        <div className="px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200 text-[#0070ba] font-bold tracking-wider">
          ROOM: {session?.roomCode}
        </div>
      </div>

      {/* Center Card */}
      <div className="my-auto space-y-5">
        
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-sm text-center space-y-5">
          <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <Check className="w-7 h-7 stroke-[2.5]" />
          </div>

          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Connected to Session
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Waiting for the host to launch the quiz questions...
            </p>
          </div>

          {/* Profile Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left">
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Registered Student Profile
            </div>
            <div className="text-base font-bold text-slate-800 mt-1">
              {player?.nickname}
            </div>
            <div className="text-xs text-slate-500 mt-0.5 font-medium">
              Roll No: <span className="text-[#0070ba] font-semibold">{player?.rollNo}</span>
            </div>
            {player?.email && (
              <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                {player.email}
              </div>
            )}
          </div>

          {/* Stage Display Guidance */}
          <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 text-left flex items-start gap-3">
            <Tv className="w-4 h-4 text-[#0070ba] shrink-0 mt-0.5" />
            <div className="text-xs text-slate-600 leading-relaxed">
              <span className="font-semibold text-slate-800 block">Watch Stage Screen</span>
              Question statements and countdowns appear on the projector screen. You'll tap your choice directly on your phone.
            </div>
          </div>
        </div>

      </div>

      {/* Footer */}
      <div className="text-center text-xs text-slate-400 pb-2 flex items-center justify-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        <span>Synchronized • Ready for Question 1</span>
      </div>

    </div>
  );
}
