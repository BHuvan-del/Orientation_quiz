import React, { useState } from 'react';
import { Trophy, ArrowRight, Flag, RotateCcw, PlusCircle, Loader2 } from 'lucide-react';
import { startQuestion, updateSessionStatus, resetQuizSession } from '../../firebase/quizService.js';

export default function HostLeaderboard({ 
  session, 
  players = [], 
  onResetSession, 
  onCreateNewQuiz 
}) {
  const currentIndex = session.currentQuestionIndex || 0;
  const isFinal = (currentIndex + 1 >= (session.totalQuestions || 0)) || session.status === 'ended';
  const isEnded = session.status === 'ended';

  const [loadingAction, setLoadingAction] = useState(null);

  const sortedPlayers = [...players].sort((a, b) => (b.score || 0) - (a.score || 0));
  const top15 = sortedPlayers.slice(0, 15);

  const handleNextQuestion = async () => {
    setLoadingAction('next');
    try {
      await startQuestion(session.roomCode, currentIndex + 1);
    } catch (e) {
      console.error('Error starting next question:', e);
      alert('Error advancing to next question: ' + e.message);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleEndQuiz = async () => {
    const confirmEnd = window.confirm(
      'Are you sure you want to conclude the quiz? This will lock final standings for all participants.'
    );
    if (!confirmEnd) return;

    setLoadingAction('conclude');
    try {
      await updateSessionStatus(session.roomCode, 'ended');
    } catch (e) {
      console.error('Error concluding quiz:', e);
      alert('Error concluding quiz: ' + e.message);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleReset = async () => {
    if (onResetSession) {
      onResetSession();
    } else {
      const confirmReset = window.confirm(
        'Reset this quiz back to the Lobby and zero out all scores?'
      );
      if (!confirmReset) return;
      setLoadingAction('reset');
      try {
        await resetQuizSession(session.roomCode);
      } catch (e) {
        console.error('Failed to reset:', e);
        alert('Reset error: ' + e.message);
      } finally {
        setLoadingAction(null);
      }
    }
  };

  const handleCreateNew = () => {
    if (onCreateNewQuiz) {
      onCreateNewQuiz();
    } else {
      localStorage.removeItem('activeHostRoomCode');
      window.location.hash = '/host';
      window.location.reload();
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-6 md:p-12 max-w-6xl mx-auto w-full font-sans">
      
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-zinc-800 pb-4 gap-4">
        <div>
          <div className="text-xs font-mono text-amber-400 font-bold uppercase flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            {isEnded 
              ? 'FINAL RESULTS // QUIZ CONCLUDED' 
              : `LEADERBOARD // ROUND ${currentIndex + 1} OF ${session.totalQuestions}`}
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-white font-mono mt-0.5">
            {session.title}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-mono text-zinc-500">
            COMPETITORS: <span className="text-zinc-300 font-bold">{sortedPlayers.length}</span>
          </div>

          {/* Direct Create New Quiz shortcut in header */}
          <button
            onClick={handleCreateNew}
            className="px-3 py-1.5 rounded border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-mono transition flex items-center gap-1.5"
            title="Start a new quiz from scratch"
          >
            <PlusCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span>New Quiz</span>
          </button>
        </div>
      </div>

      {/* Concluded Alert Banner if ended */}
      {isEnded && (
        <div className="my-4 p-4 rounded-lg bg-zinc-900 border border-amber-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono">
          <div>
            <div className="text-amber-400 font-bold text-sm flex items-center gap-2">
              <Flag className="w-4 h-4" />
              QUIZ OFFICIALLY CONCLUDED
            </div>
            <div className="text-zinc-400 text-xs mt-0.5">
              Standings are locked. You can rerun this session or build a new quiz.
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleReset}
              disabled={loadingAction === 'reset'}
              className="px-3.5 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-xs font-bold transition flex items-center gap-1.5"
            >
              <RotateCcw className={`w-3.5 h-3.5 text-cyan-400 ${loadingAction === 'reset' ? 'animate-spin' : ''}`} />
              <span>RESET & RERUN</span>
            </button>

            <button
              onClick={handleCreateNew}
              className="px-4 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-zinc-950 text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>CREATE NEW QUIZ</span>
            </button>
          </div>
        </div>
      )}

      {/* Leaderboard Table / Roster */}
      <div className="my-auto py-4 max-w-4xl mx-auto w-full">
        {top15.length === 0 ? (
          <div className="text-center py-12 text-zinc-600 font-mono text-xs">
            [NO_SCORES_RECORDED] Waiting for player responses...
          </div>
        ) : (
          <div className="border border-zinc-800 rounded-lg overflow-hidden bg-zinc-900/70 divide-y divide-zinc-800/80">
            {/* Table Header */}
            <div className="grid grid-cols-12 px-4 py-2.5 bg-zinc-900 text-[11px] font-mono text-zinc-400 uppercase tracking-wider font-semibold">
              <div className="col-span-2 sm:col-span-1">RANK</div>
              <div className="col-span-6 sm:col-span-7">PARTICIPANT</div>
              <div className="col-span-2 text-right">DELTA</div>
              <div className="col-span-2 text-right">SCORE</div>
            </div>

            {/* Table Rows */}
            {top15.map((p, index) => {
              const rank = index + 1;
              const isTop = rank === 1;

              return (
                <div
                  key={p.id}
                  className={`grid grid-cols-12 px-4 py-3 items-center transition font-sans ${
                    isTop ? 'bg-amber-950/10' : 'hover:bg-zinc-800/40'
                  }`}
                >
                  {/* Rank Column */}
                  <div className="col-span-2 sm:col-span-1 font-mono font-bold text-xs text-zinc-400">
                    <span className={isTop ? 'text-amber-400 font-black' : rank <= 3 ? 'text-zinc-200' : ''}>
                      #{String(rank).padStart(2, '0')}
                    </span>
                  </div>

                  {/* Participant */}
                  <div className="col-span-6 sm:col-span-7 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                    <span className="font-semibold text-sm text-zinc-100">
                      {p.nickname}
                    </span>
                    <span className="text-[10px] font-mono text-cyan-400 bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-800 w-fit">
                      {p.rollNo}
                    </span>
                  </div>

                  {/* Delta points this round */}
                  <div className="col-span-2 text-right font-mono text-xs">
                    {p.lastPoints > 0 && p.lastAnswerQuestionIndex === currentIndex ? (
                      <span className="text-emerald-400 font-semibold">
                        +{p.lastPoints}
                      </span>
                    ) : (
                      <span className="text-zinc-600">—</span>
                    )}
                  </div>

                  {/* Total Score */}
                  <div className="col-span-2 text-right font-mono font-bold text-sm text-white">
                    {p.score || 0} <span className="text-[10px] font-normal text-zinc-500">pts</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Controls */}
      <div className="pt-4 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs font-mono text-zinc-500">
          ROOM: <span className="text-zinc-300 font-bold">{session.roomCode}</span>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          {isEnded ? (
            <>
              <button
                onClick={handleReset}
                disabled={loadingAction === 'reset'}
                className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-mono text-xs font-semibold rounded border border-zinc-700 transition flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                RESET & RERUN QUIZ
              </button>

              <button
                onClick={handleCreateNew}
                className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-zinc-950 font-mono text-xs font-bold rounded transition flex items-center gap-1.5 shadow-sm"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                CREATE NEW QUIZ
              </button>
            </>
          ) : (
            <>
              {/* If not ended, provide Next Question if not final */}
              {!isFinal && (
                <button
                  onClick={handleNextQuestion}
                  disabled={loadingAction === 'next'}
                  className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-zinc-950 font-mono text-xs font-bold rounded transition flex items-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {loadingAction === 'next' ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      NEXT QUESTION
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              )}

              {/* Conclude Quiz button - available on final question AND as early conclude */}
              <button
                onClick={handleEndQuiz}
                disabled={loadingAction === 'conclude'}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold rounded transition flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                {loadingAction === 'conclude' ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    CONCLUDING...
                  </>
                ) : (
                  <>
                    <Flag className="w-3.5 h-3.5" />
                    CONCLUDE QUIZ
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>

    </div>
  );
}
