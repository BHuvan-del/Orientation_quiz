import React, { useState, useEffect } from 'react';
import { 
  User, 
  Hash, 
  Mail, 
  ArrowRight, 
  AlertCircle, 
  Loader2, 
  CheckCircle2, 
  ShieldCheck
} from 'lucide-react';
import { joinSession, ensureAuth } from '../../firebase/quizService.js';
import { auth, googleProvider, signInWithPopup, signOut } from '../../firebase/config.js';

export default function PlayerJoin({ initialRoomCode, onJoined }) {
  const [roomCode, setRoomCode] = useState(initialRoomCode || '');
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [isGoogleVerified, setIsGoogleVerified] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    ensureAuth().catch((e) => console.warn('Auth warm-up:', e));
  }, []);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const userEmail = (user.email || '').toLowerCase();

      if (!userEmail.endsWith('@thapar.edu')) {
        await signOut(auth);
        setError('Access Denied: Only official Thapar Institute email accounts (@thapar.edu) are accepted.');
        setGoogleLoading(false);
        return;
      }

      setEmail(userEmail);
      if (user.displayName) {
        setNickname(user.displayName);
      } else {
        const derived = userEmail.replace('@thapar.edu', '').replace(/[._]/g, ' ');
        setNickname(derived.replace(/\b\w/g, l => l.toUpperCase()));
      }
      setIsGoogleVerified(true);
    } catch (err) {
      console.error('Google sign-in error:', err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message || 'Google authentication failed. Please enter details manually.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleEmailChange = (val) => {
    setEmail(val);
    if (!isGoogleVerified && !nickname) {
      const clean = val.trim().toLowerCase();
      if (clean.includes('@')) {
        const username = clean.split('@')[0];
        if (isNaN(username)) {
          const formatted = username.replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          setNickname(formatted);
        }
      }
    }
  };

  const handleRollNoChange = (val) => {
    const digitsOnly = val.replace(/\D/g, '').slice(0, 10);
    setRollNo(digitsOnly);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const cleanCode = roomCode.trim().toUpperCase();
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = nickname.trim();
    const cleanRoll = rollNo.trim();

    if (!cleanCode) {
      setError('Please enter the 5-character Room Code.');
      return;
    }

    if (!cleanEmail.endsWith('@thapar.edu')) {
      setError('Email must be an official Thapar University ID ending with @thapar.edu.');
      return;
    }

    if (!cleanName) {
      setError('Please provide your Full Name.');
      return;
    }

    if (cleanRoll.length !== 10) {
      setError(`Roll Number must be exactly 10 digits (currently ${cleanRoll.length} digits). Example: 1022030123.`);
      return;
    }

    setLoading(true);

    try {
      const { playerId, player } = await joinSession(cleanCode, {
        nickname: cleanName,
        rollNo: cleanRoll,
        email: cleanEmail,
        authProvider: isGoogleVerified ? 'google_thapar' : 'manual_thapar'
      });

      localStorage.setItem('quiz_roomCode', cleanCode);
      localStorage.setItem('quiz_nickname', cleanName);
      localStorage.setItem('quiz_rollNo', cleanRoll);
      localStorage.setItem('quiz_email', cleanEmail);
      localStorage.setItem('quiz_playerId', playerId);

      onJoined({
        roomCode: cleanCode,
        playerId,
        player
      });
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to join quiz.');
      setLoading(false);
    }
  };

  const isRollComplete = rollNo.length === 10;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col justify-center px-4 py-8 font-sans">
      <div className="max-w-md w-full mx-auto">
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#0070ba] text-xs font-semibold mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0070ba]" />
            Thapar University Student Portal
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Join Live Quiz Session
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Sign in with your official <span className="font-semibold text-slate-700">@thapar.edu</span> ID and 10-digit roll number.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-sm">
          
          {/* Google Sign-in */}
          {!isGoogleVerified ? (
            <div className="mb-5 pb-5 border-b border-slate-100">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold transition flex items-center justify-center gap-2.5 shadow-2xs disabled:opacity-50"
              >
                {googleLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#0070ba]" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                )}
                <span>Sign in with Thapar Google ID</span>
              </button>
              <div className="text-center mt-2">
                <span className="text-[10px] text-slate-400 font-medium">
                  Automatically validates your registered name
                </span>
              </div>
            </div>
          ) : (
            <div className="mb-5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-800 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Verified Thapar Account</span>
              </div>
              <button
                type="button"
                onClick={() => { setIsGoogleVerified(false); signOut(auth); }}
                className="text-[11px] text-slate-500 hover:text-slate-800 underline"
              >
                Change
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Room Code */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Room Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="ABC12"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-[#003087] font-mono font-bold text-lg tracking-widest text-center focus:border-[#0070ba] focus:ring-1 focus:ring-[#0070ba] focus:outline-none uppercase"
                required
              />
            </div>

            {/* Official Thapar Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>Thapar Email</span>
                <span className="text-[10px] text-[#0070ba] font-mono font-medium lowercase">@thapar.edu required</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  disabled={isGoogleVerified}
                  placeholder="student_be22@thapar.edu"
                  className={`w-full pl-9 pr-3.5 py-2.5 rounded-lg border text-xs focus:outline-none ${
                    isGoogleVerified
                      ? 'border-emerald-200 bg-emerald-50/40 text-slate-700'
                      : 'border-slate-300 bg-white text-slate-900 focus:border-[#0070ba] focus:ring-1 focus:ring-[#0070ba]'
                  }`}
                  required
                />
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>Full Name</span>
                {isGoogleVerified && (
                  <span className="text-[10px] text-emerald-700 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3 h-3" /> Verified by Google
                  </span>
                )}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  disabled={isGoogleVerified}
                  placeholder="e.g. Rahul Sharma"
                  className={`w-full pl-9 pr-3.5 py-2.5 rounded-lg border text-sm font-medium focus:outline-none ${
                    isGoogleVerified 
                      ? 'border-slate-200 bg-slate-50 text-slate-700' 
                      : 'border-slate-300 bg-white text-slate-900 focus:border-[#0070ba] focus:ring-1 focus:ring-[#0070ba]'
                  }`}
                  required
                />
              </div>
            </div>

            {/* 10-Digit Roll Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>10-Digit Roll Number</span>
                <span className={`text-[10px] font-mono ${isRollComplete ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
                  {rollNo.length}/10 digits {isRollComplete && '✓'}
                </span>
              </label>
              <div className="relative">
                <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={10}
                  pattern="[0-9]{10}"
                  value={rollNo}
                  onChange={(e) => handleRollNoChange(e.target.value)}
                  placeholder="1022030123"
                  className={`w-full pl-9 pr-3.5 py-2.5 rounded-lg border font-mono text-sm tracking-wider focus:outline-none ${
                    isRollComplete 
                      ? 'border-emerald-400 bg-white text-slate-900 focus:border-emerald-500' 
                      : 'border-slate-300 bg-white text-slate-900 focus:border-[#0070ba] focus:ring-1 focus:ring-[#0070ba]'
                  }`}
                  required
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Enter your 10-digit university roll number as shown on your ID card.
              </p>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                <div>{error}</div>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 bg-[#0070ba] hover:bg-[#005ea6] text-white font-semibold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Connecting to Quiz Room...
                </>
              ) : (
                <>
                  Enter Live Quiz
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </form>
        </div>

        <p className="text-center text-[11px] text-slate-400 mt-4">
          One device per roll number • Session preserved across page refresh
        </p>

      </div>
    </div>
  );
}
