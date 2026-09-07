import React from 'react';
import { Trophy, Award, Tv, Terminal } from 'lucide-react';

export default function PlayerLeaderboard({ session, player, isFinal = false }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between p-6 max-w-sm mx-auto font-sans">
      
      {/* Top Bar */}
      <div className="text-center pb-2 font-mono text-xs text-zinc-500 flex items-center justify-center gap-2">
        <Trophy className="w-3.5 h-3.5 text-amber-400" />
        <span>{isFinal ? 'QUIZ_CONCLUDED // FINAL_RESULTS' : 'STAGE_LEADERBOARD'}</span>
      </div>

      {/* Main Content */}
      <div className="my-auto text-center space-y-5">
        
        <div className="w-14 h-14 mx-auto rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-amber-400">
          <Award className="w-7 h-7" />
        </div>

        <div>
          <h1 className="text-xl font-bold text-white font-mono">
            {isFinal ? 'Final Performance' : 'Leaderboard on Stage'}
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            {isFinal 
              ? 'Quiz session has completed. Thank you for participating.' 
              : 'Global rankings are broadcast on the main stage screen.'}
          </p>
        </div>

        {/* Player Metric Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 font-mono text-left">
          <div className="text-[10px] text-zinc-500 uppercase">
            PARTICIPANT PROFILE
          </div>
          <div className="text-base font-bold text-white mt-0.5">
            {player?.nickname}
          </div>
          <div className="text-xs text-cyan-400 mt-0.5 mb-4">
            ID: {player?.rollNo}
          </div>

          <div className="p-3.5 rounded bg-zinc-950 border border-zinc-800 flex items-center justify-between">
            <span className="text-xs text-zinc-400">TOTAL SCORE</span>
            <span className="text-2xl font-bold text-amber-400">
              {player?.score || 0} <span className="text-xs font-normal text-zinc-500">pts</span>
            </span>
          </div>
        </div>

        {!isFinal && (
          <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-left flex items-center gap-2.5 text-xs text-zinc-300">
            <Tv className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Look at the host screen. Next question starting shortly.</span>
          </div>
        )}

      </div>

      <div className="text-center font-mono text-[11px] text-zinc-600 pb-2">
        {isFinal ? 'SESSION COMPLETE' : 'AWAITING HOST TRIGGER'}
      </div>

    </div>
  );
}
