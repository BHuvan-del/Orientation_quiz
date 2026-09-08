import React, { useState } from 'react';
import { Plus, Trash2, Play, Clock, Check, ExternalLink } from 'lucide-react';
import { createQuizSession, getSavedHostRooms, deleteQuizSession } from '../../firebase/quizService.js';

const SAMPLE_QUESTIONS = [
  {
    text: "Which company originally created and open-sourced React?",
    options: ["Google", "Meta (Facebook)", "Microsoft", "Amazon"],
    correctIndex: 1,
    timeLimitSeconds: 30
  },
  {
    text: "In computing systems, what does 'RAM' stand for?",
    options: [
      "Random Access Memory",
      "Readily Available Module",
      "Real-time Automated Machine",
      "Rotational Array Matrix"
    ],
    correctIndex: 0,
    timeLimitSeconds: 30
  },
  {
    text: "Which protocol provides full-duplex, bidirectional communication in modern browsers?",
    options: ["HTTP/1.1", "WebSockets", "FTP", "SMTP"],
    correctIndex: 1,
    timeLimitSeconds: 30
  }
];

export default function HostQuestionCreator({ onQuizCreated, onDeleteRoom }) {
  const [title, setTitle] = useState('Tech Stack & Systems Challenge');
  const [questions, setQuestions] = useState(SAMPLE_QUESTIONS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Saved / Previous Rooms Management State
  const [savedRooms, setSavedRooms] = useState(() => getSavedHostRooms());
  const [customRoomToDelete, setCustomRoomToDelete] = useState('');
  const [deletingRoomCode, setDeletingRoomCode] = useState(null);
  const [deleteMessage, setDeleteMessage] = useState(null);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        text: '',
        options: ['', '', '', ''],
        correctIndex: 0,
        timeLimitSeconds: 30
      }
    ]);
  };

  const removeQuestion = (index) => {
    if (questions.length <= 1) {
      alert('A quiz requires at least 1 question.');
      return;
    }
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestionText = (index, text) => {
    const updated = [...questions];
    updated[index].text = text;
    setQuestions(updated);
  };

  const updateOptionText = (qIndex, optIndex, text) => {
    const updated = [...questions];
    updated[qIndex].options[optIndex] = text;
    setQuestions(updated);
  };

  const setCorrectIndex = (qIndex, optIndex) => {
    const updated = [...questions];
    updated[qIndex].correctIndex = optIndex;
    setQuestions(updated);
  };

  const updateTimeLimit = (qIndex, seconds) => {
    const updated = [...questions];
    updated[qIndex].timeLimitSeconds = parseInt(seconds, 10);
    setQuestions(updated);
  };

  const handleLaunch = async () => {
    if (!title.trim()) {
      setError('Please provide a quiz title.');
      return;
    }
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text.trim()) {
        setError(`Question #${i + 1} statement is empty.`);
        return;
      }
      for (let j = 0; j < 4; j++) {
        if (!q.options[j].trim()) {
          setError(`Question #${i + 1} option [${String.fromCharCode(65 + j)}] is blank.`);
          return;
        }
      }
    }

    setLoading(true);
    setError(null);
    try {
      const roomCode = await createQuizSession(title, questions);
      onQuizCreated(roomCode);
    } catch (err) {
      console.error(err);
      setError('Failed to initialize session: ' + err.message);
      setLoading(false);
    }
  };

  const handleDeleteSavedRoom = async (code) => {
    const cleanCode = (code || '').toUpperCase().trim();
    if (!cleanCode) return;

    const confirmed = window.confirm(
      `Permanently delete room "${cleanCode}"?\n\nThis will remove the quiz session, questions, participant registrations, and scores from Firebase. This cannot be undone.`
    );
    if (!confirmed) return;

    setDeletingRoomCode(cleanCode);
    setDeleteMessage(null);
    try {
      await deleteQuizSession(cleanCode);
      setSavedRooms(getSavedHostRooms());
      setDeleteMessage(`Room "${cleanCode}" was successfully deleted from the database.`);
      if (onDeleteRoom) {
        // notify parent
      }
    } catch (err) {
      console.error('Error deleting room:', err);
      alert('Failed to delete room: ' + err.message);
    } finally {
      setDeletingRoomCode(null);
    }
  };

  const handleCustomDelete = async (e) => {
    e.preventDefault();
    const cleanCode = customRoomToDelete.toUpperCase().trim();
    if (!cleanCode) return;
    await handleDeleteSavedRoom(cleanCode);
    setCustomRoomToDelete('');
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 font-sans space-y-6">
      
      {/* Manage / Delete Previously Created Rooms */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>Previously Created Rooms</span>
              <span className="text-[10px] font-semibold bg-blue-50 text-[#0070ba] px-2 py-0.5 rounded-full border border-blue-100">
                {savedRooms.length} {savedRooms.length === 1 ? 'room' : 'rooms'}
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Re-open a prior quiz session or permanently delete old rooms to keep the console clean.
            </p>
          </div>

          {/* Quick Delete by Code Form */}
          <form onSubmit={handleCustomDelete} className="flex items-center gap-2">
            <input
              type="text"
              value={customRoomToDelete}
              onChange={(e) => setCustomRoomToDelete(e.target.value.toUpperCase())}
              placeholder="Room Code..."
              maxLength={6}
              className="w-32 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono uppercase focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!customRoomToDelete.trim() || deletingRoomCode !== null}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-red-50 border border-red-200 text-red-600 text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs disabled:opacity-40"
              title="Permanently delete this room by code"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-500" />
              <span>Delete Room</span>
            </button>
          </form>
        </div>

        {deleteMessage && (
          <div className="mt-3 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between">
            <span>{deleteMessage}</span>
            <button 
              onClick={() => setDeleteMessage(null)} 
              className="text-emerald-700 hover:text-emerald-900 text-xs font-bold ml-2"
            >
              ✕
            </button>
          </div>
        )}

        {savedRooms.length > 0 ? (
          <div className="mt-3 divide-y divide-slate-100 max-h-56 overflow-y-auto pr-1">
            {savedRooms.map((r) => (
              <div key={r.roomCode} className="py-2.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200 text-[#0070ba] font-mono font-bold text-xs tracking-wider shrink-0">
                    {r.roomCode}
                  </span>
                  <div className="min-w-0 truncate">
                    <span className="text-xs font-semibold text-slate-800 block truncate">
                      {r.title || 'Live Quiz Session'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {r.createdAt ? `Created ${new Date(r.createdAt).toLocaleDateString()}` : 'Recent Room'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onQuizCreated(r.roomCode)}
                    className="px-3 py-1.5 rounded-lg bg-[#0070ba] hover:bg-[#005ea6] text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-2xs"
                  >
                    <span>Open</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    disabled={deletingRoomCode === r.roomCode}
                    onClick={() => handleDeleteSavedRoom(r.roomCode)}
                    className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-red-50 border border-red-200 text-red-600 text-xs font-semibold transition flex items-center gap-1 shadow-2xs disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    <span>{deletingRoomCode === r.roomCode ? 'Deleting...' : 'Delete'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-xs text-slate-400">
            No previously saved rooms on this device. Enter any room code above to delete an existing room.
          </div>
        )}
      </div>

      {/* Main Quiz Creator Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-[#0070ba] text-xs font-semibold mb-1.5">
              Quiz Setup
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Create New Quiz Session
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Add questions, set the correct choice, and configure 30-second timers.
            </p>
          </div>

          <button
            onClick={() => setQuestions(SAMPLE_QUESTIONS)}
            type="button"
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 shadow-xs transition shrink-0"
          >
            Load Sample Questions
          </button>
        </div>

        {/* Title Input */}
        <div className="mt-6">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Quiz Name / Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Systems & Algorithms Challenge"
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 font-medium text-sm focus:border-[#0070ba] focus:ring-1 focus:ring-[#0070ba] focus:outline-none"
          />
        </div>

        {/* Questions Section */}
        <div className="mt-8 space-y-5">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Questions ({questions.length})
            </div>
            <button
              type="button"
              onClick={addQuestion}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 hover:bg-blue-100 text-[#0070ba] border border-blue-200 transition"
            >
              <Plus className="w-3.5 h-3.5" /> Add Question
            </button>
          </div>

          {questions.map((q, qIndex) => (
            <div 
              key={qIndex} 
              className="border border-slate-200 rounded-xl p-5 bg-[#fafbfc]"
            >
              {/* Question Header */}
              <div className="flex items-center justify-between mb-3 text-xs">
                <span className="font-bold text-slate-700">
                  Question #{qIndex + 1}
                </span>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-slate-600 text-xs">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <select
                      value={q.timeLimitSeconds}
                      onChange={(e) => updateTimeLimit(qIndex, e.target.value)}
                      className="bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-700 focus:outline-none"
                    >
                      <option value="15">15s</option>
                      <option value="30">30s (Default)</option>
                      <option value="45">45s</option>
                      <option value="60">60s</option>
                    </select>
                  </div>

                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(qIndex)}
                      className="text-slate-400 hover:text-red-600 transition"
                      title="Remove question"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Question Statement */}
              <input
                type="text"
                value={q.text}
                onChange={(e) => updateQuestionText(qIndex, e.target.value)}
                placeholder="Enter question statement..."
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm font-medium mb-3 focus:border-[#0070ba] focus:ring-1 focus:ring-[#0070ba] focus:outline-none"
              />

              {/* 4 Choices */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {q.options.map((opt, optIndex) => {
                  const isCorrect = q.correctIndex === optIndex;
                  const label = String.fromCharCode(65 + optIndex);

                  return (
                    <div 
                      key={optIndex}
                      className={`flex items-center gap-2.5 p-2 rounded-lg border transition ${
                        isCorrect 
                          ? 'border-emerald-500 bg-emerald-50/50' 
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setCorrectIndex(qIndex, optIndex)}
                        className={`w-6 h-6 rounded-full font-bold text-xs flex items-center justify-center transition shrink-0 ${
                          isCorrect 
                            ? 'bg-emerald-600 text-white' 
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                        title="Click to mark as correct answer"
                      >
                        {isCorrect ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : label}
                      </button>

                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => updateOptionText(qIndex, optIndex, e.target.value)}
                        placeholder={`Option ${label}`}
                        className="w-full bg-transparent text-xs text-slate-800 focus:outline-none font-medium"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div className="mt-5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Launch Button */}
        <div className="mt-8 pt-6 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            disabled={loading}
            onClick={handleLaunch}
            className="w-full sm:w-auto px-6 py-2.5 bg-[#0070ba] hover:bg-[#005ea6] text-white font-semibold text-xs rounded-lg transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            {loading ? 'Initializing Session...' : 'Launch Quiz & Open Lobby'}
          </button>
        </div>

      </div>
    </div>
  );
}
