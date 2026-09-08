import React, { useState } from 'react';
import { Lock, ShieldAlert, KeyRound, ArrowRight, Eye, EyeOff } from 'lucide-react';

// Accepted master passcodes
const VALID_HOST_PASSCODES = [
  'thapar@host2025',
  'thapar2025',
  'orientation2025',
  'admin@thapar'
];

export default function HostAuthGate({ onAuthenticated, expectedPasscode }) {
  const [passcode, setPasscode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [attempts, setAttempts] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    const entered = passcode.trim();
    const matchesMaster = VALID_HOST_PASSCODES.includes(entered.toLowerCase()) || entered === 'thapar@host2025';
    const matchesSession = expectedPasscode && entered === expectedPasscode;

    if (matchesMaster || matchesSession) {
      sessionStorage.setItem('host_auth_unlocked', 'true');
      onAuthenticated();
    } else {
      setAttempts(prev => prev + 1);
      setError('Access Denied: Invalid Host Security Passcode.');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-center px-4 py-8 font-sans">
      <div className="max-w-sm w-full mx-auto">
        
        {/* Terminal Security Badge */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-zinc-900 border border-zinc-800 text-amber-400 text-xs font-mono mb-3">
            <Lock className="w-3.5 h-3.5" /> RESTRICTED_ACCESS // HOST
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-mono">
            Host Console Verification
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            This area is restricted to event organizers and stage presenters.
          </p>
        </div>

        {/* Security Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-medium text-zinc-400 uppercase mb-1.5 flex items-center justify-between">
                <span>Host Security Key</span>
                <span className="text-[10px] text-zinc-500 font-normal">Organizer Passcode</span>
              </label>
              
              <div className="relative">
                <KeyRound className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter host password..."
                  className="w-full pl-9 pr-10 py-2.5 rounded border border-zinc-700 bg-zinc-950 text-white font-mono text-sm focus:border-cyan-500 focus:outline-none"
                  autoFocus
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded bg-zinc-950 border border-red-500/40 text-red-400 text-xs font-mono flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold">[AUTH_FAILURE]</div>
                  <div>{error}</div>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full mt-2 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-zinc-950 font-mono font-bold text-xs rounded transition flex items-center justify-center gap-2 shadow-sm"
            >
              <span>AUTHENTICATE CONSOLE</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-zinc-800 text-center">
            <button
              type="button"
              onClick={() => { window.location.hash = '/'; }}
              className="text-xs font-mono text-zinc-500 hover:text-zinc-300 underline"
            >
              ← Back to Participant Home
            </button>
          </div>
        </div>

        {/* Security Note */}
        <p className="text-center font-mono text-[11px] text-zinc-600 mt-4">
          Default Master Key: <span className="text-zinc-400">thapar@host2025</span>
        </p>

      </div>
    </div>
  );
}
