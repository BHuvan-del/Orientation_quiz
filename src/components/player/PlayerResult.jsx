import React from 'react';
import { Check, X, Terminal, Tv } from 'lucide-react';

export default function PlayerResult({ player, question }) {
  const isCorrect = player?.lastCorrect;
  const points = player?.lastPoints || 0;
  const totalScore = player?.score || 0;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col justify-between p-4 sm:p-6 max-w-md mx-auto font-sans">
      
      {/* Top Header */}
      <div className="text-center pb-2 text-xs font-semibold text-slate-400 tracking-wider uppercase">
        Round Evaluation
      </div>

      {/* Main Feedback Card */}
      <div className="my-auto space-y-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-sm text-center space-y-4">
          
          <div className={`w-16 h-16 mx-auto rounded-full border flex items-center justify-center ${
            isCorrect 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-600' 
              : 'bg-red-50 border-red-200 text-red-600'
          }`}>
            {isCorrect ? <Check className="w-8 h-8 stroke-[2.5]" /> : <X className="w-8 h-8 stroke-[2.5]" />}
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {isCorrect ? 'Correct Answer!' : 'Incorrect Choice'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {isCorrect ? `Earned +${points} pts based on response time.` : 'No points awarded for this round.'}
            </p>
          </div>

          {/* Score Telemetry Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5 mb-2.5 text-xs">
              <span className="text-slate-500 font-medium">Round Score</span>
              <span className={`font-bold ${isCorrect ? 'text-emerald-600' : 'text-slate-400'}`}>
                +{points} pts
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 font-medium">Total Score</span>
              <span className="text-2xl font-bold text-[#0070ba]">
                {totalScore} <span className="text-xs font-normal text-slate-400">pts</span>
              </span>
            </div>
          </div>

          {/* Stage notice */}
          <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 text-left flex items-start gap-3 text-xs text-slate-600">
            <Tv className="w-4 h-4 text-[#0070ba] shrink-0 mt-0.5" />
            <span className="leading-relaxed">Stage screen is currently displaying answer breakdown and updated leaderboard standings.</span>
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-slate-400 pb-2">
        Stand by for next question
      </div>

    </div>
  );
}
