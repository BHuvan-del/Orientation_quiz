import React from 'react';
import { Check, ArrowRight, BarChart2, Users } from 'lucide-react';
import { updateSessionStatus } from '../../firebase/quizService.js';

export default function HostResults({ session, question, players = [] }) {
  const currentIndex = session.currentQuestionIndex || 0;
  const correctIndex = question.correctIndex;

  const distribution = [0, 0, 0, 0];
  let totalResponses = 0;

  players.forEach((p) => {
    if (p.lastAnswerQuestionIndex === currentIndex && typeof p.lastAnswerIndex === 'number') {
      if (distribution[p.lastAnswerIndex] !== undefined) {
        distribution[p.lastAnswerIndex]++;
        totalResponses++;
      }
    }
  });

  const handleNext = async () => {
    try {
      await updateSessionStatus(session.roomCode, 'leaderboard');
    } catch (e) {
      console.error('Failed to transition to leaderboard:', e);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-6 md:p-12 max-w-6xl mx-auto w-full">
      
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div>
          <div className="text-xs font-mono text-emerald-400 font-bold uppercase">
            EVALUATION // QUESTION {String(currentIndex + 1).padStart(2, '0')}
          </div>
          <h2 className="text-lg font-bold text-white mt-1">
            {question.text}
          </h2>
        </div>

        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded text-xs font-mono text-zinc-300">
          <Users className="w-3.5 h-3.5 text-cyan-400" />
          {totalResponses} SUBMISSIONS
        </div>
      </div>

      {/* Answer Distribution Cards */}
      <div className="my-auto py-8 max-w-4xl mx-auto w-full space-y-3">
        {question.options.map((opt, idx) => {
          const count = distribution[idx];
          const pct = totalResponses > 0 ? Math.round((count / totalResponses) * 100) : 0;
          const isCorrect = idx === correctIndex;
          const label = String.fromCharCode(65 + idx);

          return (
            <div
              key={idx}
              className={`relative overflow-hidden rounded-lg p-4 border transition-all ${
                isCorrect
                  ? 'border-emerald-500/80 bg-zinc-900/95'
                  : 'border-zinc-800 bg-zinc-900/60 opacity-80'
              }`}
            >
              {/* Clean progress bar fill */}
              <div
                className={`absolute inset-y-0 left-0 transition-all duration-700 ${
                  isCorrect ? 'bg-emerald-500/15' : 'bg-zinc-800/80'
                }`}
                style={{ width: `${pct}%` }}
              />

              <div className="relative z-10 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded font-mono font-bold text-xs flex items-center justify-center shrink-0 ${
                    isCorrect ? 'bg-emerald-500 text-zinc-950' : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    {label}
                  </span>

                  <div>
                    <div className="text-base font-semibold text-white flex items-center gap-2">
                      {opt}
                      {isCorrect && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                          <Check className="w-3 h-3 stroke-[3]" /> CORRECT CHOICE
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-mono text-zinc-500 mt-0.5">
                      {count} {count === 1 ? 'vote' : 'votes'} ({pct}%)
                    </div>
                  </div>
                </div>

                <div className="text-lg font-mono font-bold text-zinc-200">
                  {pct}%
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer / Control */}
      <div className="pt-4 border-t border-zinc-800 flex items-center justify-end">
        <button
          onClick={handleNext}
          className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-bold text-xs rounded transition flex items-center gap-2 shadow-sm"
        >
          VIEW LEADERBOARD
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
}
