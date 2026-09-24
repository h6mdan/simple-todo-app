import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  CheckCircle2, 
  User, 
  LogOut, 
  Save
} from 'lucide-react';
import { UserProfile } from '../types.ts';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onUserChange: (user: UserProfile | null) => void;
  onSignOut: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  user,
  onUserChange,
  onSignOut,
}) => {
  if (!isOpen || !user) return null;

  const [displayName, setDisplayName] = useState(user.name || '');
  const [email, setEmail] = useState(user.email || '');
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const initial = (user.name || user.email || 'U').charAt(0).toUpperCase();

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;

    const updated: UserProfile = {
      ...user,
      name: displayName.trim(),
      email: email.trim() || user.email,
    };

    onUserChange(updated);
    setIsEditing(false);
    setMessage({ text: 'Profile updated successfully!', type: 'success' });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSignOutClick = () => {
    onClose();
    onSignOut();
  };

  return (
    <div
      id="profile-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="profile-modal-card"
        className="bg-white dark:bg-[#14161d] text-slate-900 dark:text-zinc-100 rounded-2xl shadow-xl border border-slate-200 dark:border-zinc-800 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-zinc-800/80">
          <h2 className="font-bold text-base tracking-tight text-slate-900 dark:text-zinc-100">
            Account & Profile
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {message && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                message.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{message.text}</span>
            </div>
          )}

          {/* User Overview Card */}
          <div className="flex items-center gap-3.5 p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800">
            <div className="w-12 h-12 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center text-lg font-bold shadow-2xs flex-shrink-0">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 truncate">
                {user.name || user.email.split('@')[0]}
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">
                {user.email}
              </p>
              <div className="flex items-center gap-1.5 mt-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Signed In</span>
              </div>
            </div>
          </div>

          {/* Edit Details */}
          {isEditing ? (
            <form onSubmit={handleUpdateProfile} className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white focus:outline-none focus:border-zinc-900 dark:focus:border-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white focus:outline-none focus:border-zinc-900 dark:focus:border-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-100 transition shadow-2xs cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-zinc-800/80 text-xs">
                <span className="text-slate-500 dark:text-zinc-400">Display Name</span>
                <span className="font-semibold text-slate-800 dark:text-zinc-200">{user.name || user.email.split('@')[0]}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-zinc-800/80 text-xs">
                <span className="text-slate-500 dark:text-zinc-400">Email</span>
                <span className="font-semibold text-slate-800 dark:text-zinc-200 truncate max-w-[200px]">{user.email}</span>
              </div>

              <div className="flex items-center justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 transition cursor-pointer"
                >
                  Edit Profile
                </button>

                <button
                  type="button"
                  onClick={handleSignOutClick}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
