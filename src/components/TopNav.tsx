import React, { useState, useEffect, useRef } from 'react';
import { 
  CheckSquare, 
  Search, 
  Moon, 
  Sun, 
  Plus, 
  ChevronDown,
  LogOut,
  User as UserIcon,
  LogIn
} from 'lucide-react';
import { UserProfile } from '../types.ts';

interface TopNavProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  user: UserProfile | null;
  onOpenAuth: () => void;
  onSignOut?: () => void;
  onQuickNewTask: () => void;
  onOpenMobileMenu?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  searchQuery,
  onSearchChange,
  isDarkMode,
  onToggleDarkMode,
  user,
  onOpenAuth,
  onSignOut,
  onQuickNewTask,
  onOpenMobileMenu,
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  // Global hotkey '/' to focus search bar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        if (
          document.activeElement?.tagName !== 'INPUT' &&
          document.activeElement?.tagName !== 'TEXTAREA'
        ) {
          e.preventDefault();
          searchInputRef.current?.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const displayName = user?.name || user?.email?.split('@')[0] || '';
  const initial = displayName ? displayName.charAt(0).toUpperCase() : 'U';

  return (
    <header
      id="app-top-nav"
      className="w-full h-14 flex-shrink-0 bg-white dark:bg-[#111318] border-b border-[#e2e4e8] dark:border-zinc-800/80 px-4 sm:px-6 flex items-center justify-between gap-4 z-20 select-none"
    >
      {/* Left: Brand Logo & Title */}
      <div className="flex items-center gap-3">
        {onOpenMobileMenu && (
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
            aria-label="Toggle navigation"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}

        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center shadow-2xs">
            <CheckSquare className="w-4 h-4 stroke-[2.5]" />
          </div>
          <span className="font-bold text-sm sm:text-base tracking-tight text-slate-900 dark:text-zinc-100">
            Tasks
          </span>
        </div>
      </div>

      {/* Center: Search Bar */}
      <div className="flex-1 max-w-md mx-2 sm:mx-6">
        <div className="relative flex items-center w-full">
          <Search className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 absolute left-3 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            id="top-search-input"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search or jump to task..."
            className="w-full bg-[#f3f4f6] dark:bg-zinc-900 text-xs sm:text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 pl-8 pr-8 py-1.5 rounded-lg border border-transparent focus:border-[#d1d5db] dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none transition"
          />
          <div className="absolute right-2.5 flex items-center pointer-events-none">
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-400 dark:text-zinc-500 bg-white/80 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded shadow-2xs">
              /
            </kbd>
          </div>
        </div>
      </div>

      {/* Right Controls: Dark Mode, User Profile/Sign In, + New Task */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Moon / Sun Toggle */}
        <button
          type="button"
          id="theme-toggle-btn"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleDarkMode();
          }}
          className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800 transition active:scale-95 cursor-pointer"
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? (
            <Sun className="w-4 h-4 text-amber-400 stroke-[2.2]" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700 dark:text-zinc-300 stroke-[2]" />
          )}
        </button>

        {/* User Profile or Sign In Button */}
        {user ? (
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              id="user-profile-chip-btn"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="flex items-center gap-1.5 p-1 sm:px-2 sm:py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition text-slate-800 dark:text-zinc-200 cursor-pointer"
              title="Account Menu"
            >
              <div className="w-6 h-6 rounded-full bg-zinc-900 dark:bg-zinc-700 text-white flex items-center justify-center text-[11px] font-bold">
                {initial}
              </div>
              <span className="hidden md:inline-block text-xs font-medium max-w-[120px] truncate">
                {displayName}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {/* Profile Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-56 rounded-xl bg-white dark:bg-[#181a20] shadow-xl border border-slate-200 dark:border-zinc-800 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3.5 py-2 border-b border-slate-100 dark:border-zinc-800/80">
                  <div className="font-semibold text-xs text-slate-900 dark:text-zinc-100 truncate">
                    {displayName}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                    {user.email}
                  </div>
                </div>

                <div className="p-1 space-y-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      onOpenAuth();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition text-left cursor-pointer"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-slate-500" />
                    <span>Account Settings</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      if (onSignOut) {
                        onSignOut();
                      }
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition text-left font-medium cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            id="user-sign-in-btn"
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-semibold text-slate-800 dark:text-zinc-200 transition cursor-pointer"
            title="Sign In to your account"
          >
            <LogIn className="w-3.5 h-3.5 text-slate-600 dark:text-zinc-400" />
            <span>Sign In</span>
          </button>
        )}

        {/* [+] New Task Quick Modal Button */}
        <button
          type="button"
          id="top-new-task-btn"
          onClick={onQuickNewTask}
          className="w-8 h-8 rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 flex items-center justify-center hover:bg-zinc-800 dark:hover:bg-zinc-100 transition shadow-2xs flex-shrink-0 cursor-pointer"
          title="Create New Task"
          aria-label="Create New Task"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>
    </header>
  );
};
