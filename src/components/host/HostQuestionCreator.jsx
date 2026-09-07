import React, { useState } from 'react';
import { Plus, Trash2, Play, Code2, Clock, Check, Terminal } from 'lucide-react';
import { createQuizSession } from '../../firebase/quizService.js';

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

export default function HostQuestionCreator({ onQuizCreated }) {
  const [title, setTitle] = useState('Tech Stack & Systems Challenge');
  const [questions, setQuestions] = useState(SAMPLE_QUESTIONS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-6 md:p-8 shadow-2xl">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-zinc-800 gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs mb-1">
              <Terminal className="w-4 h-4" />
              <span>CONFIGURE_QUIZ</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white font-mono">
              Session Configuration
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Set question statements, 4 choices, correct answer flag, and 30s timers.
            </p>
          </div>

          <button
            onClick={() => setQuestions(SAMPLE_QUESTIONS)}
            type="button"
            className="px-3 py-1.5 text-xs font-mono rounded border border-zinc-700 bg-zinc-800/60 hover:bg-zinc-800 text-zinc-300 transition shrink-0"
          >
            Load Sample Questions
          </button>
        </div>

        {/* Title Input */}
        <div className="mt-6">
          <label className="block text-xs font-mono font-medium text-zinc-400 mb-1.5 uppercase">
            Quiz Name / Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Systems & Algorithms Challenge"
            className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-700 bg-zinc-950 text-white font-medium text-sm focus:border-cyan-500 focus:outline-none"
          />
        </div>

        {/* Questions Header */}
        <div className="mt-8 space-y-5">
          <div className="flex items-center justify-between">
            <div className="text-xs font-mono font-semibold text-zinc-300 uppercase tracking-wider">
              Questions ({questions.length})
            </div>
            <button
              type="button"
              onClick={addQuestion}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium rounded border border-cyan-500/40 bg-cyan-950/30 hover:bg-cyan-900/40 text-cyan-300 transition"
            >
              <Plus className="w-3.5 h-3.5" /> Add Question
            </button>
          </div>

          {questions.map((q, qIndex) => (
            <div 
              key={qIndex} 
              className="border border-zinc-800 rounded-lg p-4 bg-zinc-950/60 font-sans"
            >
              {/* Question Top Row */}
              <div className="flex items-center justify-between mb-3 text-xs">
                <span className="font-mono font-bold text-cyan-400">
                  #{String(qIndex + 1).padStart(2, '0')}
                </span>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-zinc-400 font-mono text-xs">
                    <Clock className="w-3.5 h-3.5 text-zinc-500" />
                    <select
                      value={q.timeLimitSeconds}
                      onChange={(e) => updateTimeLimit(qIndex, e.target.value)}
                      className="bg-zinc-900 border border-zinc-700 rounded px-2 py-0.5 text-xs text-zinc-200"
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
                      className="text-zinc-500 hover:text-red-400 transition"
                      title="Remove question"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Question Text */}
              <input
                type="text"
                value={q.text}
                onChange={(e) => updateQuestionText(qIndex, e.target.value)}
                placeholder="Enter question statement..."
                className="w-full px-3 py-2 rounded border border-zinc-700 bg-zinc-900 text-white text-sm font-medium mb-3 focus:border-cyan-500 focus:outline-none"
              />

              {/* 4 Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {q.options.map((opt, optIndex) => {
                  const isCorrect = q.correctIndex === optIndex;
                  const label = String.fromCharCode(65 + optIndex);

                  return (
                    <div 
                      key={optIndex}
                      className={`flex items-center gap-2.5 p-2 rounded border transition ${
                        isCorrect 
                          ? 'border-emerald-500/50 bg-emerald-950/20' 
                          : 'border-zinc-800 bg-zinc-900/60'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setCorrectIndex(qIndex, optIndex)}
                        className={`w-6 h-6 rounded font-mono font-bold text-xs flex items-center justify-center transition shrink-0 ${
                          isCorrect 
                            ? 'bg-emerald-500 text-zinc-950' 
                            : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
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
                        className="w-full bg-transparent text-xs text-zinc-200 focus:outline-none font-medium"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div className="mt-5 p-3 rounded bg-zinc-900 border border-red-500/30 text-red-400 text-xs font-mono">
            [ERR] {error}
          </div>
        )}

        {/* Launch Button */}
        <div className="mt-8 pt-6 border-t border-zinc-800 flex justify-end">
          <button
            type="button"
            disabled={loading}
            onClick={handleLaunch}
            className="w-full sm:w-auto px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-semibold text-xs rounded transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            {loading ? 'INITIALIZING_SESSION...' : 'LAUNCH SESSION & OPEN LOBBY'}
          </button>
        </div>

      </div>
    </div>
  );
}
