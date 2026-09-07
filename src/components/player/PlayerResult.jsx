import React from 'react';
import { Check, X, Terminal, Tv } from 'lucide-react';

export default function PlayerResult({ player, question }) {
  const isCorrect = player?.lastCorrect;
  const points = player?.lastPoints || 0;
  const totalScore = player?.score || 0;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between p-6 max-w-sm mx-auto font-sans">
      
      {/* Top Header */}
      <div className="text-center pb-2 font-mono text-xs text-zinc-500">
        [ROUND_EVALUATION]
      </div>

      {/* Main Feedback Banner */}
      <div className="my-auto text-center space-y-4">
        <div className={`w-16 h-16 mx-auto rounded-lg border flex items-center justify-center ${
          isCorrect 
            ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' 
            : 'bg-red-500/10 border-red-500/40 text-red-400'
        }`}>
          {isCorrect ? <Check className="w-8 h-8 stroke-[3]" /> : <X className="w-8 h-8 stroke-[3]" />}
        </div>

        <div>
          <h1 className="text-xl font-bold text-white font-mono">
            {isCorrect ? 'Correct Submission' : 'Incorrect Choice'}
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            {isCorrect ? `Earned +${points} pts based on answer speed.` : 'Zero points awarded this round.'}
          </p>
        </div>

        {/* Score Telemetry Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 font-mono">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-2 text-xs">
            <span className="text-zinc-500">ROUND SCORE</span>
            <span className={isCorrect ? 'text-emerald-400 font-bold' : 'text-zinc-500'}>
              +{points} pts
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-400">TOTAL SCORE</span>
            <span className="text-xl font-bold text-cyan-400">
              {totalScore} <span className="text-xs text-zinc-500 font-normal">pts</span>
            </span>
          </div>
        </div>

        {/* Stage notice */}
        <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-left flex items-center gap-2.5 text-xs text-zinc-300">
          <Tv className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>Stage display is showing answer distribution and live rank standings.</span>
        </div>
      </div>

      <div className="text-center font-mono text-[11px] text-zinc-600 pb-2">
        STAND BY FOR NEXT QUESTION
      </div>

    </div>
  );
}
