import React, { useState, useEffect, useRef } from 'react';
import { Clock, Check, Loader2 } from 'lucide-react';
import { useSynchronizedCountdown } from '../../utils/clock.js';
import { submitAnswer, getPlayerAnswer } from '../../firebase/quizService.js';

const CHOICE_LABELS = ['A', 'B', 'C', 'D'];

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
      <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="bg-white border border-slate-200 rounded-2xl p-7 max-w-sm w-full shadow-sm text-center">
          <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-200 text-[#0070ba] flex items-center justify-center mx-auto mb-3">
            <Clock className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-slate-900 mb-1">Question in Progress</h2>
          <p className="text-slate-500 text-xs leading-relaxed">
            Round {currentIndex + 1} is ongoing. You will automatically be synced on the next question.
          </p>
        </div>
      </div>
    );
  }

  const isTimeUp = timeLeft <= 0;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col justify-between p-4 sm:p-6 max-w-lg mx-auto font-sans">
      
      {/* Top Telemetry */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3 text-xs">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-semibold">
          <span>Question {currentIndex + 1} of {session.totalQuestions || 1}</span>
        </div>

        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border font-bold ${
          timeLeft <= 5 
            ? 'border-red-200 bg-red-50 text-red-600 animate-pulse' 
            : 'border-slate-200 bg-white text-slate-800 shadow-2xs'
        }`}>
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{String(timeLeft).padStart(2, '0')}s remaining</span>
        </div>
      </div>

      {/* Question Card */}
      <div className="my-2.5 bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm">
        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
          Statement
        </span>
        <h1 className="text-base sm:text-lg font-semibold text-slate-900 leading-snug">
          {question.text}
        </h1>

        {question.imageUrl && (
          <div className="mt-2.5 flex justify-center">
            <img 
              src={question.imageUrl} 
              alt="Question illustration" 
              className="max-h-40 sm:max-h-52 w-auto rounded-xl object-contain border border-slate-100 bg-slate-50"
            />
          </div>
        )}
      </div>

      {/* Feedback Banner */}
      {hasSubmitted && (
        <div className="my-1.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-2">
          <Check className="w-4 h-4 stroke-[2.5] text-emerald-600" />
          <span>Answer Registered • Look at Stage Screen</span>
        </div>
      )}

      {/* 4 Choices Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-auto py-2">
        {question.options.map((opt, i) => {
          const isChosen = selectedOption === i;
          const isDisabled = hasSubmitted || submitting || isTimeUp;
          const optImg = question.optionImages?.[i];

          return (
            <button
              key={i}
              type="button"
              onClick={() => handleSelect(i)}
              disabled={isDisabled}
              className={`w-full min-h-[72px] p-3 rounded-xl border text-left flex items-center gap-3 transition-all select-none ${
                isChosen
                  ? 'border-[#0070ba] bg-blue-50/70 ring-2 ring-[#0070ba]/30 shadow-xs'
                  : isDisabled && selectedOption !== null
                    ? 'border-slate-200 bg-slate-50/60 opacity-40 cursor-not-allowed'
                    : 'border-slate-200 bg-white hover:border-[#0070ba] hover:bg-slate-50/50 active:scale-[0.99] shadow-2xs'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg border font-bold text-xs flex items-center justify-center shrink-0 transition-colors ${
                isChosen 
                  ? 'bg-[#0070ba] text-white border-[#0070ba]' 
                  : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}>
                {CHOICE_LABELS[i]}
              </div>

              {optImg && (
                <img 
                  src={optImg} 
                  alt={`Option ${CHOICE_LABELS[i]}`} 
                  className="h-12 sm:h-14 w-auto max-w-[70px] sm:max-w-[80px] rounded object-contain border border-slate-200 bg-white p-0.5 shrink-0"
                />
              )}

              {opt && (
                <div className="text-sm font-medium text-slate-800 leading-snug break-words">
                  {opt}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Status */}
      <div className="text-center text-xs text-slate-400 py-2 border-t border-slate-200">
        {hasSubmitted ? 'Submission locked • Results will appear shortly' : 'Select one option to submit your answer'}
      </div>

    </div>
  );
}
