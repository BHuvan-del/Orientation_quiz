import React, { useState, useEffect, useRef } from 'react';
import { Clock, Check, Loader2 } from 'lucide-react';
import { useSynchronizedCountdown } from '../../utils/clock.js';
import { submitAnswer, getPlayerAnswer } from '../../firebase/quizService.js';

const TECH_BUTTONS = [
  { label: 'A', border: 'border-zinc-700 bg-zinc-900 active:bg-zinc-800 text-zinc-100', active: 'border-cyan-500 bg-cyan-950/30' },
  { label: 'B', border: 'border-zinc-700 bg-zinc-900 active:bg-zinc-800 text-zinc-100', active: 'border-violet-500 bg-violet-950/30' },
  { label: 'C', border: 'border-zinc-700 bg-zinc-900 active:bg-zinc-800 text-zinc-100', active: 'border-amber-500 bg-amber-950/30' },
  { label: 'D', border: 'border-zinc-700 bg-zinc-900 active:bg-zinc-800 text-zinc-100', active: 'border-emerald-500 bg-emerald-950/30' },
];

export default function PlayerQuestion({ 
  session, 
  question, 
  playerId, 
  isLateJoiner = false 
}) {
  const currentIndex = session.currentQuestionIndex || 0;
  const timeLimit = question.timeLimitSeconds || 30;
  const questionId = question.id || `q_${currentIndex}`;

  const [selectedOption, setSelectedOption] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const isLockedRef = useRef(false);

  const timeLeft = useSynchronizedCountdown(session.questionStartedAt, timeLimit);

  useEffect(() => {
    let active = true;
    getPlayerAnswer(session.roomCode, playerId, questionId).then((prevAnswer) => {
      if (active && prevAnswer) {
        setSelectedOption(prevAnswer.selectedIndex);
        setHasSubmitted(true);
        isLockedRef.current = true;
      }
    });
    return () => { active = false; };
  }, [session.roomCode, playerId, questionId]);

  const handleSelect = async (index) => {
    if (isLockedRef.current || hasSubmitted || submitting || timeLeft <= 0) {
      return;
    }

    isLockedRef.current = true;
    setSelectedOption(index);
    setSubmitting(true);

    try {
      const startedAtMillis = session.questionStartedAt?.toMillis 
        ? session.questionStartedAt.toMillis() 
        : Date.now();

      await submitAnswer({
        roomCode: session.roomCode,
        questionId,
        questionIndex: currentIndex,
        selectedIndex: index,
        correctIndex: question.correctIndex,
        startedAtMillis,
        timeLimitSeconds: timeLimit
      });

      setHasSubmitted(true);
    } catch (err) {
      console.error('Answer submission error:', err);
      setHasSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (isLateJoiner) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-6 text-center font-mono">
        <div className="w-10 h-10 rounded bg-zinc-900 border border-zinc-700 text-cyan-400 flex items-center justify-center mb-3">
          <Clock className="w-5 h-5" />
        </div>
        <h2 className="text-base font-bold mb-1">[QUIZ_IN_PROGRESS]</h2>
        <p className="text-zinc-500 text-xs max-w-xs">
          Round {currentIndex + 1} is ongoing. You will automatically join on the next question.
        </p>
      </div>
    );
  }

  const isTimeUp = timeLeft <= 0;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between p-4 max-w-md mx-auto font-sans">
      
      {/* Top Telemetry */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3 font-mono text-xs">
        <div className="text-zinc-400">
          Q{currentIndex + 1} // {session.totalQuestions}
        </div>

        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded border font-bold ${
          timeLeft <= 5 
            ? 'border-red-500 bg-red-950/40 text-red-400 animate-pulse' 
            : 'border-zinc-700 bg-zinc-900 text-cyan-400'
        }`}>
          <Clock className="w-3 h-3 text-zinc-400" />
          <span>{String(timeLeft).padStart(2, '0')}s</span>
        </div>
      </div>

      {/* Question Statement */}
      <div className="my-3 text-left">
        <h1 className="text-base font-semibold text-white leading-snug">
          {question.text}
        </h1>
      </div>

      {/* Feedback Banner */}
      {hasSubmitted && (
        <div className="my-2 p-2.5 rounded bg-zinc-900 border border-emerald-500/40 text-emerald-400 font-mono text-xs flex items-center justify-center gap-2">
          <Check className="w-4 h-4 stroke-[3]" />
          <span>SUBMISSION_LOCKED // VIEW STAGE DISPLAY</span>
        </div>
      )}

      {/* 4 Choices Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 my-auto pb-4">
        {question.options.map((opt, i) => {
          const theme = TECH_BUTTONS[i % TECH_BUTTONS.length];
          const isChosen = selectedOption === i;
          const isDisabled = hasSubmitted || submitting || isTimeUp;

          return (
            <button
              key={i}
              type="button"
              onClick={() => handleSelect(i)}
              disabled={isDisabled}
              className={`w-full min-h-[75px] p-3.5 rounded-lg border transition-all text-left flex items-center gap-3 select-none ${
                isChosen
                  ? 'border-cyan-400 bg-zinc-900 ring-2 ring-cyan-400/50 shadow-lg'
                  : isDisabled && selectedOption !== null
                    ? 'border-zinc-800 bg-zinc-900/40 opacity-40'
                    : 'border-zinc-800 bg-zinc-900/90 hover:border-zinc-700 active:scale-[0.99]'
              }`}
            >
              <div className={`w-7 h-7 rounded border font-mono font-bold text-xs flex items-center justify-center shrink-0 ${
                isChosen 
                  ? 'bg-cyan-500 text-zinc-950 border-cyan-400' 
                  : 'bg-zinc-800 text-zinc-400 border-zinc-700'
              }`}>
                {theme.label}
              </div>
              <div className="text-sm font-medium text-zinc-100 leading-snug break-words">
                {opt}
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer Status */}
      <div className="text-center font-mono text-[10px] text-zinc-600 py-1 border-t border-zinc-900">
        {hasSubmitted ? 'SELECTION REGISTERED • WAITING FOR ROUND EVALUATION' : 'TAP AN OPTION TO REGISTER YOUR SUBMISSION'}
      </div>

    </div>
  );
}
