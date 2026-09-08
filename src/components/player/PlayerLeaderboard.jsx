import React from 'react';
import { Trophy, Award, Tv, Terminal } from 'lucide-react';

export default function PlayerLeaderboard({ session, player, isFinal = false }) {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col justify-between p-4 sm:p-6 max-w-md mx-auto font-sans">
      
      {/* Top Bar */}
      <div className="text-center pb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-center gap-2">
        <Trophy className="w-4 h-4 text-amber-500" />
        <span>{isFinal ? 'Quiz Concluded • Final Results' : 'Stage Leaderboard Active'}</span>
      </div>

      {/* Main Content */}
      <div className="my-auto space-y-5">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-sm text-center space-y-5">
          
          <div className="w-16 h-16 mx-auto rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <Award className="w-8 h-8" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {isFinal ? 'Final Performance' : 'Leaderboard on Stage'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {isFinal 
                ? 'Thank you for participating in the Thapar Orientation Quiz.' 
                : 'Live rankings are being broadcast on the stage projector.'}
            </p>
          </div>

          {/* Player Metric Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-left">
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Registered Student Profile
            </div>
            <div className="text-base font-bold text-slate-800 mt-1">
              {player?.nickname}
            </div>
            <div className="text-xs text-slate-500 mt-0.5 mb-4">
              Roll No: <span className="text-[#0070ba] font-semibold">{player?.rollNo}</span>
            </div>

            <div className="p-3.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between shadow-2xs">
              <span className="text-xs font-medium text-slate-500">TOTAL SCORE</span>
              <span className="text-2xl font-bold text-[#0070ba]">
                {player?.score || 0} <span className="text-xs font-normal text-slate-400">pts</span>
              </span>
            </div>
          </div>

          {!isFinal && (
            <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 text-left flex items-start gap-3 text-xs text-slate-600">
              <Tv className="w-4 h-4 text-[#0070ba] shrink-0 mt-0.5" />
              <span className="leading-relaxed">Watch the host screen for full leaderboard standings. Next round begins shortly.</span>
            </div>
          )}

        </div>
      </div>

      <div className="text-center text-xs text-slate-400 pb-2">
        {isFinal ? 'Session complete • Great job!' : 'Awaiting host next action'}
      </div>

    </div>
  );
}
