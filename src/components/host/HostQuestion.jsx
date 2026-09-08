import React from 'react';
import { Clock, Users, BarChart2 } from 'lucide-react';
import { useSynchronizedCountdown } from '../../utils/clock.js';
import { updateSessionStatus } from '../../firebase/quizService.js';
import { useThrottledValue } from '../../utils/throttle.js';

const SUBTLE_OPTIONS = [
  { label: 'A', border: 'border-blue-200 bg-blue-50/50 hover:bg-blue-50 text-slate-900', badge: 'bg-[#0070ba] text-white' },
  { label: 'B', border: 'border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50 text-slate-900', badge: 'bg-[#003087] text-white' },
  { label: 'C', border: 'border-slate-300 bg-slate-50/70 hover:bg-slate-100 text-slate-900', badge: 'bg-slate-700 text-white' },
  { label: 'D', border: 'border-teal-200 bg-teal-50/50 hover:bg-teal-50 text-slate-900', badge: 'bg-teal-700 text-white' },
];

export default function HostQuestion({ session, question, players = [] }) {
  const currentIndex = session.currentQuestionIndex || 0;
  const timeLimit = question.timeLimitSeconds || 30;

  const timeLeft = useSynchronizedCountdown(session.questionStartedAt, timeLimit);

  const answeredCount = players.filter(p => p.lastAnswerQuestionIndex === currentIndex).length;
  const throttledAnsweredCount = useThrottledValue(answeredCount, 300);

  const handleShowResults = async () => {
    try {
      await updateSessionStatus(session.roomCode, 'results');
    } catch (e) {
      console.error('Failed to show results:', e);
    }
  };

  const isTimeUp = timeLeft <= 0;
  const allAnswered = players.length > 0 && throttledAnsweredCount >= players.length;

  return (
    <div className="flex-1 flex flex-col justify-between p-6 md:p-12 max-w-6xl mx-auto w-full font-sans">
      
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <div className="text-xs font-bold text-[#0070ba] uppercase tracking-wider">
            Question {currentIndex + 1} of {session.totalQuestions}
          </div>
          <h2 className="text-base font-semibold text-slate-600 mt-0.5">
            {session.title}
          </h2>
        </div>

        {/* Countdown Indicator */}
        <div className={`flex items-center gap-2 px-5 py-2 rounded-xl border font-mono transition-all ${
          timeLeft <= 5 
            ? 'border-red-400 bg-red-50 text-red-700 animate-pulse' 
            : 'border-slate-200 bg-white text-[#003087] shadow-xs'
        }`}>
          <Clock className="w-4 h-4 text-slate-400" />
          <span className="text-2xl font-bold">
            {String(timeLeft).padStart(2, '0')}s
          </span>
        </div>

        {/* Answer Counter */}
        <div className="flex items-center gap-3 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-xs">
          <Users className="w-4 h-4 text-[#0070ba]" />
          <div>
            <div className="text-slate-900 font-bold text-sm">
              {throttledAnsweredCount} <span className="text-slate-400 font-normal">/ {players.length}</span>
            </div>
            <div className="text-[10px] text-slate-500 uppercase font-semibold">
              Answers
            </div>
          </div>
        </div>
      </div>

      {/* Main Question Display */}
      <div className="my-auto py-4 sm:py-6 max-w-4xl mx-auto w-full text-center">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 shadow-sm flex flex-col items-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 leading-relaxed">
            {question.text}
          </h1>

          {question.imageUrl && (
            <div className="mt-5 max-w-lg w-full flex justify-center">
              <img 
                src={question.imageUrl} 
                alt="Question illustration" 
                className="max-h-56 sm:max-h-72 w-auto rounded-xl object-contain border border-slate-200 shadow-sm bg-slate-50"
              />
            </div>
          )}
        </div>
      </div>

      {/* 4 Choices Grid */}
      <div className="max-w-5xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-3.5 my-4">
        {question.options.map((opt, i) => {
          const style = SUBTLE_OPTIONS[i % SUBTLE_OPTIONS.length];
          return (
            <div
              key={i}
              className={`rounded-xl p-5 border flex items-center gap-4 transition shadow-xs ${style.border}`}
            >
              <span className={`w-8 h-8 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 shadow-xs ${style.badge}`}>
                {style.label}
              </span>
              <div className="text-lg font-semibold text-slate-900 leading-snug">
                {opt}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
        <div className="text-xs text-slate-500">
          Room: <span className="text-slate-900 font-bold font-mono">{session.roomCode}</span>
        </div>

        <button
          onClick={handleShowResults}
          className={`px-6 py-2.5 rounded-lg font-semibold text-xs flex items-center gap-2 transition shadow-sm ${
            isTimeUp || allAnswered
              ? 'bg-[#0070ba] hover:bg-[#005ea6] text-white animate-bounce'
              : 'bg-white border border-slate-300 hover:bg-slate-50 text-slate-800'
          }`}
        >
          <BarChart2 className="w-3.5 h-3.5" />
          Show Question Results
        </button>
      </div>

    </div>
  );
}
