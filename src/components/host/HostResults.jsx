import React from 'react';
import { Check, ArrowRight, Users } from 'lucide-react';
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
    <div className="flex-1 flex flex-col justify-between p-6 md:p-12 max-w-6xl mx-auto w-full font-sans">
      
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
            Results • Question {currentIndex + 1} of {session.totalQuestions}
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            {question.text}
          </h2>
        </div>

        <div className="flex items-center gap-2 bg-white border border-slate-200 px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 shadow-2xs">
          <Users className="w-3.5 h-3.5 text-[#0070ba]" />
          {totalResponses} Total Submissions
        </div>
      </div>

      {/* Optional Question Image */}
      {question.imageUrl && (
        <div className="flex justify-center mt-4">
          <img 
            src={question.imageUrl} 
            alt="Question illustration" 
            className="max-h-48 w-auto rounded-xl object-contain border border-slate-200 shadow-xs bg-slate-50"
          />
        </div>
      )}

      {/* Answer Distribution Cards */}
      <div className="my-auto py-6 max-w-4xl mx-auto w-full space-y-3">
        {question.options.map((opt, idx) => {
          const count = distribution[idx];
          const pct = totalResponses > 0 ? Math.round((count / totalResponses) * 100) : 0;
          const isCorrect = idx === correctIndex;
          const label = String.fromCharCode(65 + idx);

          return (
            <div
              key={idx}
              className={`relative overflow-hidden rounded-xl p-4 border transition-all ${
                isCorrect
                  ? 'border-emerald-500 bg-emerald-50/40 shadow-xs'
                  : 'border-slate-200 bg-white'
              }`}
            >
              {/* Clean progress bar fill */}
              <div
                className={`absolute inset-y-0 left-0 transition-all duration-700 ${
                  isCorrect ? 'bg-emerald-100/70' : 'bg-slate-100'
                }`}
                style={{ width: `${pct}%` }}
              />

              <div className="relative z-10 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <span className={`w-8 h-8 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs ${
                    isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {label}
                  </span>

                  <div>
                    <div className="text-base font-bold text-slate-900 flex items-center gap-2">
                      {opt}
                      {isCorrect && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <Check className="w-3 h-3 stroke-[3]" /> Correct Answer
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {count} {count === 1 ? 'student' : 'students'} ({pct}%)
                    </div>
                  </div>
                </div>

                <div className="text-lg font-mono font-bold text-slate-800">
                  {pct}%
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer / Action */}
      <div className="pt-4 border-t border-slate-200 flex items-center justify-end">
        <button
          onClick={handleNext}
          className="px-6 py-2.5 bg-[#0070ba] hover:bg-[#005ea6] text-white font-semibold text-xs rounded-lg transition flex items-center gap-2 shadow-sm"
        >
          View Leaderboard
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
}
