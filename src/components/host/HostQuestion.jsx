import React from 'react';
import { Clock, Users, BarChart2 } from 'lucide-react';
import { useSynchronizedCountdown } from '../../utils/clock.js';
import { updateSessionStatus } from '../../firebase/quizService.js';
import { useThrottledValue } from '../../utils/throttle.js';

const TECH_OPTIONS = [
  { label: 'A', border: 'border-zinc-700 bg-zinc-900/90 text-zinc-100', tag: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' },
  { label: 'B', border: 'border-zinc-700 bg-zinc-900/90 text-zinc-100', tag: 'bg-violet-500/10 text-violet-400 border-violet-500/30' },
  { label: 'C', border: 'border-zinc-700 bg-zinc-900/90 text-zinc-100', tag: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
  { label: 'D', border: 'border-zinc-700 bg-zinc-900/90 text-zinc-100', tag: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
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
    <div className="flex-1 flex flex-col justify-between p-6 md:p-12 max-w-6xl mx-auto w-full">
      
      {/* Top Telemetry */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div>
          <div className="text-xs font-mono text-cyan-400 font-bold uppercase">
            QUESTION {String(currentIndex + 1).padStart(2, '0')} // {String(session.totalQuestions).padStart(2, '0')}
          </div>
          <h2 className="text-base font-semibold text-zinc-400 mt-0.5">
            {session.title}
          </h2>
        </div>

        {/* Countdown Indicator */}
        <div className={`flex items-center gap-2 px-4 py-2 rounded border font-mono transition-all ${
          timeLeft <= 5 
            ? 'border-red-500 bg-red-950/40 text-red-400 animate-pulse' 
            : 'border-zinc-700 bg-zinc-900 text-cyan-400'
        }`}>
          <Clock className="w-4 h-4 text-zinc-400" />
          <span className="text-2xl font-bold">
            {String(timeLeft).padStart(2, '0')}s
          </span>
        </div>

        {/* Response Count */}
        <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 px-4 py-2 rounded font-mono text-xs">
          <Users className="w-4 h-4 text-zinc-400" />
          <div>
            <div className="text-white font-bold text-sm">
              {throttledAnsweredCount} <span className="text-zinc-500 font-normal">/ {players.length}</span>
            </div>
            <div className="text-[10px] text-zinc-500 uppercase">
              RESPONSES
            </div>
          </div>
        </div>
      </div>

      {/* Main Question Display */}
      <div className="my-auto py-8 max-w-4xl mx-auto w-full text-center">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 md:p-12 shadow-xl">
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white leading-relaxed font-sans">
            {question.text}
          </h1>
        </div>
      </div>

      {/* 4 Tech Choice Cards */}
      <div className="max-w-5xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-3 my-4">
        {question.options.map((opt, i) => {
          const style = TECH_OPTIONS[i % TECH_OPTIONS.length];
          return (
            <div
              key={i}
              className={`rounded-lg p-5 border flex items-center gap-3.5 transition-all ${style.border}`}
            >
              <span className={`w-8 h-8 rounded border font-mono font-bold text-xs flex items-center justify-center shrink-0 ${style.tag}`}>
                {style.label}
              </span>
              <div className="text-lg font-medium text-zinc-100">
                {opt}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer / Control */}
      <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
        <div className="text-xs font-mono text-zinc-500">
          ROOM: <span className="text-zinc-300 font-bold">{session.roomCode}</span>
        </div>

        <button
          onClick={handleShowResults}
          className={`px-5 py-2.5 rounded font-mono text-xs font-bold flex items-center gap-2 transition-all ${
            isTimeUp || allAnswered
              ? 'bg-cyan-500 hover:bg-cyan-400 text-zinc-950 shadow-md'
              : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
          }`}
        >
          <BarChart2 className="w-3.5 h-3.5" />
          EVALUATE & SHOW RESULTS
        </button>
      </div>

    </div>
  );
}
