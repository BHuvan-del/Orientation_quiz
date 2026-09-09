import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Users, Play, Copy, Check } from 'lucide-react';
import { startQuestion } from '../../firebase/quizService.js';
import { useThrottledValue } from '../../utils/throttle.js';

export default function HostLobby({ session, players = [] }) {
  const [copiedStudent, setCopiedStudent] = useState(false);
  const [copiedHost, setCopiedHost] = useState(false);
  const [starting, setStarting] = useState(false);

  const throttledPlayers = useThrottledValue(players, 300);

  const currentOrigin = window.location.origin;
  const currentPath = window.location.pathname;
  const joinUrl = `${currentOrigin}${currentPath}#/play/${session.roomCode}`;
  const hostUrl = `${currentOrigin}${currentPath}#/host/${session.roomCode}`;

  const copyStudentLink = () => {
    navigator.clipboard.writeText(joinUrl);
    setCopiedStudent(true);
    setTimeout(() => setCopiedStudent(false), 2000);
  };

  const copyHostLink = () => {
    navigator.clipboard.writeText(hostUrl);
    setCopiedHost(true);
    setTimeout(() => setCopiedHost(false), 2000);
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
    <div className="flex-1 flex flex-col justify-between p-6 md:p-12 max-w-7xl mx-auto w-full font-sans">
      
      {/* Lobby Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[#0070ba] font-semibold text-xs mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Stage Lobby Open
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
            {session.title || 'Live Quiz'}
          </h1>
        </div>

        {/* Room Code Card & Action Links */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Code badge */}
          <div className="flex items-center gap-3 bg-white border border-slate-300 rounded-xl px-4 py-2 shadow-sm">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Room Code
              </div>
              <div className="text-2xl sm:text-3xl font-mono font-black tracking-widest text-[#003087]">
                {session.roomCode}
              </div>
            </div>
          </div>

          {/* Dual copy buttons: Student link & Host console link */}
          <div className="flex items-center gap-2">
            <button
              onClick={copyStudentLink}
              className="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-[#0070ba] hover:bg-[#005ea6] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-sm"
              title="Copy link for participants/students to join"
            >
              {copiedStudent ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedStudent ? 'Join Link Copied!' : 'Copy Student Link'}</span>
            </button>

            <button
              onClick={copyHostLink}
              className="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-sm"
              title="Copy stage projector / host console link to open in Chrome or another device"
            >
              {copiedHost ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copiedHost ? 'Host Link Copied!' : 'Copy Host Link'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Center Display: QR Code + Roster */}
      <div className="my-auto py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left: Big Stage QR Code */}
        <div className="lg:col-span-5 flex flex-col items-center text-center">
          <div className="p-5 bg-white rounded-2xl shadow-sm border border-slate-200">
            <QRCodeSVG 
              value={joinUrl} 
              size={230} 
              level="M"
              includeMargin={false}
            />
          </div>
          
          <div className="mt-4 space-y-1">
            <p className="text-base font-bold text-slate-800">
              Scan with your phone to join
            </p>
            <p className="text-xs text-slate-500 font-mono break-all">
              {joinUrl}
            </p>
          </div>
        </div>

        {/* Right: Connected Roster */}
        <div className="lg:col-span-7">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0070ba] flex items-center justify-center font-bold">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">
                    {throttledPlayers.length}
                  </div>
                  <div className="text-[11px] text-slate-500 uppercase font-semibold">
                    Joined Participants
                  </div>
                </div>
              </div>

              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Live Sync
              </span>
            </div>

            {/* Players Grid */}
            <div className="mt-4">
              <div className="text-xs font-medium text-slate-400 mb-2">
                Connected Students:
              </div>

              {throttledPlayers.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  Waiting for students to scan QR code and connect...
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto pr-1">
                  {throttledPlayers.map((p) => (
                    <div 
                      key={p.id}
                      className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-center gap-2 shadow-2xs"
                    >
                      <span className="font-semibold text-slate-900">{p.nickname}</span>
                      <span className="text-[10px] text-[#0070ba] font-mono bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
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
      <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
        <div className="text-xs text-slate-500">
          Total Questions: <span className="text-slate-900 font-bold">{session.totalQuestions}</span> (15s each)
        </div>

        <button
          onClick={handleStart}
          disabled={starting}
          className="px-6 py-3 bg-[#0070ba] hover:bg-[#005ea6] text-white font-bold text-xs rounded-lg transition flex items-center gap-2 shadow-sm disabled:opacity-50"
        >
          <Play className="w-4 h-4 fill-current" />
          {starting ? 'Starting Quiz...' : 'Start Quiz (Question 1)'}
        </button>
      </div>

    </div>
  );
}
