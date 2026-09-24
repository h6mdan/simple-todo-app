import React, { useState } from 'react';
import { 
  CheckSquare, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Sun,
  Moon
} from 'lucide-react';
import { UserProfile } from '../types.ts';
import { getSupabaseClient } from '../services/supabase.ts';

interface AuthScreenProps {
  onSuccessLogin: (user: UserProfile) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

interface StoredAccount {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  created_at: string;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onSuccessLogin,
  isDarkMode,
  onToggleDarkMode,
}) => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();
    const trimmedName = name.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setErrorMsg('Please fill in both email and password.');
      return;
    }

    if (authMode === 'signup' && !trimmedName) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    setLoading(true);

    const supabase = getSupabaseClient();
    if (supabase) {
      // Authenticate via Supabase
      try {
        if (authMode === 'signin') {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: trimmedEmail,
            password: trimmedPassword,
          });
          if (error) throw error;
          if (data.user) {
            const profile: UserProfile = {
              id: data.user.id,
              email: data.user.email || trimmedEmail,
              name: data.user.user_metadata?.name || trimmedEmail.split('@')[0],
            };
            onSuccessLogin(profile);
          }
        } else {
          const redirectUrl = typeof window !== 'undefined' ? window.location.origin : undefined;
          const { data, error } = await supabase.auth.signUp({
            email: trimmedEmail,
            password: trimmedPassword,
            options: {
              data: { name: trimmedName },
              emailRedirectTo: redirectUrl,
            },
          });
          if (error) throw error;
          if (data.user) {
            const profile: UserProfile = {
              id: data.user.id,
              email: data.user.email || trimmedEmail,
              name: trimmedName || trimmedEmail.split('@')[0],
            };
            onSuccessLogin(profile);
          }
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Authentication failed';
        setErrorMsg(msg);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Supabase not active: Persistent local account manager
    try {
      const ACCOUNTS_KEY = 'ms_todo_registered_accounts_v1';
      let accounts: StoredAccount[] = [];
      try {
        const stored = localStorage.getItem(ACCOUNTS_KEY);
        if (stored) accounts = JSON.parse(stored);
      } catch {
        accounts = [];
      }

      if (authMode === 'signup') {
        const existing = accounts.find((a) => a.email === trimmedEmail);
        if (existing) {
          setErrorMsg('An account with this email already exists. Please sign in instead.');
          setLoading(false);
          return;
        }

        const newAccount: StoredAccount = {
          id: 'user-' + Date.now(),
          name: trimmedName,
          email: trimmedEmail,
          passwordHash: trimmedPassword, // simple local storage match
          created_at: new Date().toISOString(),
        };

        accounts.push(newAccount);
        localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));

        const profile: UserProfile = {
          id: newAccount.id,
          email: newAccount.email,
          name: newAccount.name,
        };

        setSuccessMsg('Account created successfully! Logging you in...');
        setTimeout(() => {
          onSuccessLogin(profile);
        }, 300);
      } else {
        // Sign in
        const matched = accounts.find((a) => a.email === trimmedEmail);
        if (!matched) {
          // If no accounts exist yet, auto-create account or notify
          if (accounts.length === 0) {
            // Friendly helper: automatically register first account if empty
            const newAccount: StoredAccount = {
              id: 'user-' + Date.now(),
              name: trimmedEmail.split('@')[0],
              email: trimmedEmail,
              passwordHash: trimmedPassword,
              created_at: new Date().toISOString(),
            };
            accounts.push(newAccount);
            localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
            const profile: UserProfile = {
              id: newAccount.id,
              email: newAccount.email,
              name: newAccount.name,
            };
            onSuccessLogin(profile);
            return;
          }

          setErrorMsg('No account found with this email. Please click "Create an account".');
          setLoading(false);
          return;
        }

        if (matched.passwordHash !== trimmedPassword) {
          setErrorMsg('Incorrect password. Please try again.');
          setLoading(false);
          return;
        }

        const profile: UserProfile = {
          id: matched.id,
          email: matched.email,
          name: matched.name,
        };

        onSuccessLogin(profile);
      }
    } catch {
      setErrorMsg('Failed to process authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen w-screen flex flex-col justify-between bg-[#f5f6f8] dark:bg-[#0c0e12] text-slate-900 dark:text-zinc-100 ${isDarkMode ? 'dark' : ''}`}>
      {/* Top Bar with brand and dark mode toggle */}
      <header className="w-full h-16 px-6 sm:px-10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center shadow-xs">
            <CheckSquare className="w-4 h-4 stroke-[2.5]" />
          </div>
          <span className="font-bold text-base tracking-tight text-slate-900 dark:text-zinc-100">
            Tasks
          </span>
        </div>

        <button
          type="button"
          onClick={onToggleDarkMode}
          className="p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-slate-200/60 dark:hover:bg-zinc-800 transition cursor-pointer"
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? (
            <Sun className="w-4 h-4 text-amber-400 stroke-[2.2]" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700 stroke-[2]" />
          )}
        </button>
      </header>

      {/* Center Auth Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-white dark:bg-[#14161d] rounded-2xl shadow-xl border border-slate-200/80 dark:border-zinc-800/80 p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 flex items-center justify-center mx-auto mb-3.5 shadow-md">
              <CheckSquare className="w-6 h-6 stroke-[2.5]" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {authMode === 'signin' ? 'Sign in to Tasks' : 'Create your account'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
              {authMode === 'signin'
                ? 'Sign in to access your daily tasks, lists, and projects.'
                : 'Get started with a clean, focused task manager.'}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex p-1 mb-5 rounded-xl bg-slate-100 dark:bg-zinc-900 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setAuthMode('signin');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2 rounded-lg transition cursor-pointer ${
                authMode === 'signin'
                  ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-2xs font-bold'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('signup');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2 rounded-lg transition cursor-pointer ${
                authMode === 'signup'
                  ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-2xs font-bold'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Feedback messages */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {authMode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative flex items-center">
                  <User className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aya Hamdan"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs sm:text-sm pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700/80 bg-slate-50/50 dark:bg-zinc-900 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:border-zinc-900 dark:focus:border-white transition"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                Email Address
              </label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3 pointer-events-none" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs sm:text-sm pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700/80 bg-slate-50/50 dark:bg-zinc-900 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:border-zinc-900 dark:focus:border-white transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                Password
              </label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3 pointer-events-none" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs sm:text-sm pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700/80 bg-slate-50/50 dark:bg-zinc-900 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:border-zinc-900 dark:focus:border-white transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
            >
              <span>{loading ? 'Please wait...' : authMode === 'signin' ? 'Sign In' : 'Create Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Footer note */}
          <div className="mt-6 text-center text-xs text-slate-500 dark:text-zinc-400">
            {authMode === 'signin' ? (
              <p>
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => setAuthMode('signup')}
                  className="font-semibold text-slate-900 dark:text-white hover:underline cursor-pointer"
                >
                  Create one now
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setAuthMode('signin')}
                  className="font-semibold text-slate-900 dark:text-white hover:underline cursor-pointer"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-[11px] text-slate-400 dark:text-zinc-600">
        Tasks &bull; Private & Secure
      </footer>
    </div>
  );
};
