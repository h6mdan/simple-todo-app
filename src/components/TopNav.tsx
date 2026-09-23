import React, { useEffect, useRef } from 'react';
import { 
  CheckSquare, 
  Search, 
  Moon, 
  Sun, 
  Plus, 
  ChevronDown
} from 'lucide-react';
import { UserProfile } from '../types.ts';

interface TopNavProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  user: UserProfile | null;
  onOpenAuth: () => void;
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
  onQuickNewTask,
  onOpenMobileMenu,
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);

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

  const displayName = user?.name || user?.email?.split('@')[0] || 'Lino biju';
  const initial = displayName.charAt(0).toUpperCase() || 'L';

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

      {/* Right Controls: Dark Mode, Connected, User, + New Task */}
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

        {/* User Profile Chip */}
        <button
          type="button"
          id="user-profile-chip-btn"
          onClick={onOpenAuth}
          className="flex items-center gap-1.5 p-1 sm:px-2 sm:py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition text-slate-800 dark:text-zinc-200 cursor-pointer"
          title="Account Settings"
        >
          <div className="w-6 h-6 rounded-full bg-zinc-900 dark:bg-zinc-700 text-white flex items-center justify-center text-[11px] font-bold">
            {initial}
          </div>
          <span className="hidden md:inline-block text-xs font-medium max-w-[120px] truncate">
            {displayName}
          </span>
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </button>

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
