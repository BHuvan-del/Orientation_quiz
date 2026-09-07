import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Users, Play, Copy, Check, Terminal, Wifi } from 'lucide-react';
import { startQuestion } from '../../firebase/quizService.js';
import { useThrottledValue } from '../../utils/throttle.js';

export default function HostLobby({ session, players = [] }) {
  const [copied, setCopied] = useState(false);
  const [starting, setStarting] = useState(false);

  const throttledPlayers = useThrottledValue(players, 300);

  const currentOrigin = window.location.origin;
  const currentPath = window.location.pathname;
  const joinUrl = `${currentOrigin}${currentPath}#/play/${session.roomCode}`;

  const copyLink = () => {
    navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStart = async () => {
    if (players.length === 0) {
      const proceed = window.confirm('No players have joined yet. Start anyway?');
      if (!proceed) return;
    }
    setStarting(true);
    try {
      await startQuestion(session.roomCode, 0);
    } catch (e) {
      console.error(e);
      alert('Error starting quiz: ' + e.message);
      setStarting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-6 md:p-12 max-w-7xl mx-auto w-full">
      
      {/* Lobby Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs mb-1">
            <Wifi className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>STAGE_BROADCAST // READY</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white font-mono">
            {session.title || 'Tech Quiz'}
          </h1>
        </div>

        {/* Room Code Callout */}
        <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-700/80 rounded-lg px-4 py-2">
          <div>
            <div className="text-[10px] font-mono text-zinc-400 uppercase">
              ROOM CODE
            </div>
            <div className="text-2xl font-mono font-bold tracking-widest text-cyan-400">
              {session.roomCode}
            </div>
          </div>
          <button
            onClick={copyLink}
            className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
            title="Copy URL"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Center Layout: QR Code + Live Roster */}
      <div className="my-auto py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left: Clean QR Code */}
        <div className="lg:col-span-5 flex flex-col items-center text-center">
          <div className="p-4 bg-white rounded-xl shadow-lg border border-zinc-700">
            <QRCodeSVG 
              value={joinUrl} 
              size={210} 
              level="M"
              includeMargin={false}
            />
          </div>
          
          <div className="mt-4 space-y-1">
            <p className="text-sm font-mono text-zinc-300">
              SCAN TO ENTER QUIZ
            </p>
            <p className="text-xs font-mono text-zinc-500 break-all">
              {joinUrl}
            </p>
          </div>
        </div>

        {/* Right: Telemetry & Player List */}
        <div className="lg:col-span-7">
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-6">
            
            {/* Header Telemetry */}
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center text-cyan-400">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xl font-mono font-bold text-white">
                    {throttledPlayers.length}
                  </div>
                  <div className="text-[10px] font-mono text-zinc-400 uppercase">
                    Connected Clients
                  </div>
                </div>
              </div>

              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                LIVE SYNC
              </span>
            </div>

            {/* Players Grid */}
            <div className="mt-4">
              <div className="text-xs font-mono text-zinc-500 mb-2">
                ACTIVE ROSTER:
              </div>

              {throttledPlayers.length === 0 ? (
                <div className="py-12 text-center text-zinc-600 font-mono text-xs">
                  [WAITING_FOR_CONNECTIONS] Scan QR code on mobile device...
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto pr-1">
                  {throttledPlayers.map((p) => (
                    <div 
                      key={p.id}
                      className="px-2.5 py-1 rounded bg-zinc-800/80 border border-zinc-700/60 text-xs font-mono text-zinc-300 flex items-center gap-2"
                    >
                      <span className="text-white font-medium">{p.nickname}</span>
                      <span className="text-[10px] text-cyan-400 bg-zinc-900 px-1 py-0.5 rounded border border-zinc-800">
                        {p.rollNo}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="pt-6 border-t border-zinc-800 flex items-center justify-between">
        <div className="text-xs font-mono text-zinc-400">
          QUESTIONS: <span className="text-white font-bold">{session.totalQuestions}</span>
        </div>

        <button
          onClick={handleStart}
          disabled={starting}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-mono font-bold text-xs rounded transition flex items-center gap-2 shadow-sm disabled:opacity-50"
        >
          <Play className="w-4 h-4 fill-current" />
          {starting ? 'LAUNCHING...' : 'START QUIZ (QUESTION 1)'}
        </button>
      </div>

    </div>
  );
}
