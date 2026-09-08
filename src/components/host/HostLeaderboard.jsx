import React, { useState } from 'react';
import { Trophy, ArrowRight, Flag, RotateCcw, PlusCircle, Loader2, Trash2 } from 'lucide-react';
import { startQuestion, updateSessionStatus, resetQuizSession } from '../../firebase/quizService.js';

export default function HostLeaderboard({ 
  session, 
  players = [], 
  onResetSession, 
  onCreateNewQuiz,
  onDeleteRoom
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-200 pb-4 gap-4">
        <div>
          <div className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-500" />
            {isEnded 
              ? 'Final Results • Quiz Concluded' 
              : `Leaderboard • Round ${currentIndex + 1} of ${session.totalQuestions}`}
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-0.5">
            {session.title}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-500">
            Competitors: <span className="text-slate-900 font-bold">{sortedPlayers.length}</span>
          </div>

          <button
            onClick={handleCreateNew}
            className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
            title="Start a new quiz from scratch"
          >
            <PlusCircle className="w-3.5 h-3.5 text-[#0070ba]" />
            <span>New Quiz</span>
          </button>
        </div>
      </div>

      {/* Concluded Alert Banner if ended */}
      {isEnded && (
        <div className="my-4 p-4 rounded-xl bg-blue-50 border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="text-[#003087] font-bold text-sm flex items-center gap-2">
              <Flag className="w-4 h-4 text-[#0070ba]" />
              Quiz Officially Concluded
            </div>
            <div className="text-slate-600 text-xs mt-0.5">
              Standings are locked. You can rerun this session or create a brand new quiz.
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleReset}
              disabled={loadingAction === 'reset'}
              className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold transition flex items-center gap-1.5 shadow-2xs"
            >
              <RotateCcw className={`w-3.5 h-3.5 text-slate-500 ${loadingAction === 'reset' ? 'animate-spin' : ''}`} />
              <span>Reset & Rerun</span>
            </button>

            <button
              onClick={handleCreateNew}
              className="px-4 py-1.5 rounded-lg bg-[#0070ba] hover:bg-[#005ea6] text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-sm"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Create New Quiz</span>
            </button>
          </div>
        </div>
      )}

      {/* Leaderboard Table / Roster */}
      <div className="my-auto py-4 max-w-4xl mx-auto w-full">
        {top15.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            No scores registered yet.
          </div>
        ) : (
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm divide-y divide-slate-100">
            {/* Table Header */}
            <div className="grid grid-cols-12 px-5 py-3 bg-slate-50 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              <div className="col-span-2 sm:col-span-1">Rank</div>
              <div className="col-span-6 sm:col-span-7">Participant</div>
              <div className="col-span-2 text-right">Round Delta</div>
              <div className="col-span-2 text-right">Total Score</div>
            </div>

            {/* Table Rows */}
            {top15.map((p, index) => {
              const rank = index + 1;
              const isTop = rank === 1;

              return (
                <div
                  key={p.id}
                  className={`grid grid-cols-12 px-5 py-3.5 items-center transition ${
                    isTop ? 'bg-amber-50/40' : 'hover:bg-slate-50/60'
                  }`}
                >
                  {/* Rank Column */}
                  <div className="col-span-2 sm:col-span-1 font-bold text-xs">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                      rank === 1 ? 'bg-amber-400 text-amber-950 font-extrabold' :
                      rank === 2 ? 'bg-slate-200 text-slate-800' :
                      rank === 3 ? 'bg-amber-100 text-amber-900' :
                      'text-slate-500'
                    }`}>
                      {rank}
                    </span>
                  </div>

                  {/* Participant */}
                  <div className="col-span-6 sm:col-span-7 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2.5">
                    <span className="font-semibold text-sm text-slate-900">
                      {p.nickname}
                    </span>
                    <span className="text-[11px] font-mono text-[#0070ba] bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 w-fit">
                      {p.rollNo}
                    </span>
                  </div>

                  {/* Delta points this round */}
                  <div className="col-span-2 text-right text-xs">
                    {p.lastPoints > 0 && p.lastAnswerQuestionIndex === currentIndex ? (
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        +{p.lastPoints}
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </div>

                  {/* Total Score */}
                  <div className="col-span-2 text-right font-mono font-bold text-sm text-slate-900">
                    {p.score || 0} <span className="text-xs font-normal text-slate-400">pts</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Controls */}
      <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs text-slate-500">
          Room: <span className="text-slate-900 font-bold font-mono">{session.roomCode}</span>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          {isEnded ? (
            <>
              <button
                onClick={handleReset}
                disabled={loadingAction === 'reset'}
                className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition flex items-center gap-1.5 shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                Reset & Rerun Quiz
              </button>

              <button
                onClick={handleCreateNew}
                className="px-5 py-2.5 bg-[#0070ba] hover:bg-[#005ea6] text-white text-xs font-semibold rounded-lg transition flex items-center gap-1.5 shadow-sm"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Create New Quiz
              </button>

              {onDeleteRoom && (
                <button
                  onClick={onDeleteRoom}
                  className="px-4 py-2.5 bg-white hover:bg-red-50 text-red-600 text-xs font-semibold rounded-lg border border-red-200 transition flex items-center gap-1.5 shadow-xs"
                  title="Permanently delete this quiz room and all data"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-500" />
                  Delete Room
                </button>
              )}
            </>
          ) : (
            <>
              {!isFinal && (
                <button
                  onClick={handleNextQuestion}
                  disabled={loadingAction === 'next'}
                  className="px-5 py-2.5 bg-[#0070ba] hover:bg-[#005ea6] text-white text-xs font-semibold rounded-lg transition flex items-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {loadingAction === 'next' ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      Next Question
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              )}

              <button
                onClick={handleEndQuiz}
                disabled={loadingAction === 'conclude'}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                {loadingAction === 'conclude' ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Concluding...
                  </>
                ) : (
                  <>
                    <Flag className="w-3.5 h-3.5" />
                    Conclude Quiz
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
