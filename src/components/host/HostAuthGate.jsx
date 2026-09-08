import React, { useState } from 'react';
import { Lock, ShieldAlert, KeyRound, ArrowRight, Eye, EyeOff } from 'lucide-react';

const VALID_HOST_PASSCODES = [
  'thapar@host2026',
  'thapar2026',
  'orientation2026'
];

export default function HostAuthGate({ onAuthenticated, expectedPasscode }) {
  const [passcode, setPasscode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    const entered = passcode.trim();
    const matchesMaster = VALID_HOST_PASSCODES.includes(entered.toLowerCase()) || VALID_HOST_PASSCODES.includes(entered);
    const matchesSession = expectedPasscode && entered === expectedPasscode;

    if (matchesMaster || matchesSession) {
      sessionStorage.setItem('host_auth_unlocked', 'true');
      onAuthenticated();
    } else {
      setError('Access Denied: Invalid Host Security Passcode.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col justify-center px-4 py-8 font-sans">
      <div className="max-w-md w-full mx-auto">
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#003087] text-xs font-semibold mb-3">
            <Lock className="w-3.5 h-3.5" /> Restricted Access
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Host Console Verification
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            This console is restricted to event organizers and stage presenters.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Host Security Passcode</span>
                <span className="text-[11px] text-slate-400 font-normal lowercase">organizer key</span>
              </label>
              
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter host password..."
                  className="w-full pl-9 pr-10 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm focus:border-[#0070ba] focus:ring-1 focus:ring-[#0070ba] focus:outline-none"
                  autoFocus
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                <div>{error}</div>
              </div>
            )}

            <button
              type="submit"
              className="w-full mt-2 py-2.5 bg-[#0070ba] hover:bg-[#005ea6] text-white font-semibold text-xs rounded-lg transition flex items-center justify-center gap-2 shadow-sm"
            >
              <span>Authenticate & Enter</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={() => { window.location.hash = '/'; }}
              className="text-xs text-slate-500 hover:text-slate-800 underline"
            >
              ← Return to Participant Home
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
