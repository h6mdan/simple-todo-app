import React, { useState, useRef, useEffect } from 'react';
import { 
  Sun, 
  Star, 
  Calendar, 
  CheckSquare, 
  Search, 
  ArrowUpDown, 
  Palette, 
  Lightbulb, 
  MoreHorizontal, 
  X, 
  Check, 
  Printer, 
  Download, 
  Edit3,
  UserPlus
} from 'lucide-react';
import { CustomList, ListThemeId, SortOption, UrgencyLevel } from '../types.ts';
import { THEMES } from '../services/themes.ts';
import { getLucideIcon } from './Sidebar.tsx';

interface HeaderProps {
  currentList: string;
  customList?: CustomList;
  onUpdateListTitle?: (newTitle: string) => void;
  onUpdateListTheme?: (newTheme: ListThemeId) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortOption: SortOption;
  onSortChange: (option: SortOption) => void;
  showSuggestionsButton?: boolean;
  onToggleSuggestions?: () => void;
  activeTheme: ListThemeId;
  totalTasksCount: number;
  onOpenShareModal?: () => void;
  urgencyFilter?: UrgencyLevel | 'all';
  onUrgencyFilterChange?: (filter: UrgencyLevel | 'all') => void;
  urgencyCounts?: {
    all: number;
    urgent: number;
    high: number;
    medium: number;
    low: number;
  };
}

export const Header: React.FC<HeaderProps> = ({
  currentList,
  customList,
  onUpdateListTitle,
  onUpdateListTheme,
  searchQuery,
  onSearchChange,
  sortOption,
  onSortChange,
  showSuggestionsButton,
  onToggleSuggestions,
  activeTheme,
  totalTasksCount,
  onOpenShareModal,
  urgencyFilter = 'all',
  onUrgencyFilterChange,
  urgencyCounts,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitleValue, setEditTitleValue] = useState('');
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const themeRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);

  // Close popups on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (themeRef.current && !themeRef.current.contains(event.target as Node)) {
        setShowThemePicker(false);
      }
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setShowSortMenu(false);
      }
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
        setShowMoreMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format today's date for My Day
  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  const getListMeta = () => {
    switch (currentList) {
      case 'my-day':
        return {
          title: 'My Day',
          icon: Sun,
          subtitle: todayFormatted,
        };
      case 'important':
        return {
          title: 'Important',
          icon: Star,
          subtitle: `${totalTasksCount} task${totalTasksCount === 1 ? '' : 's'}`,
        };
      case 'planned':
        return {
          title: 'Planned',
          icon: Calendar,
          subtitle: 'Scheduled tasks & deadlines',
        };
      case 'assigned-to-me':
        return {
          title: 'Assigned to me',
          icon: CheckSquare,
          subtitle: 'Tasks delegated in shared workspaces',
        };
      case 'tasks':
        return {
          title: 'Tasks',
          icon: CheckSquare,
          subtitle: `${totalTasksCount} task${totalTasksCount === 1 ? '' : 's'}`,
        };
      default: {
        const found = customList;
        return {
          title: found ? found.name : 'List',
          icon: found?.icon ? getLucideIcon(found.icon) : CheckSquare,
          subtitle: `${totalTasksCount} task${totalTasksCount === 1 ? '' : 's'}`,
        };
      }
    }
  };

  const meta = getListMeta();
  const Icon = meta.icon;
  const theme = THEMES[activeTheme] || THEMES.blue;

  const handleStartEditing = () => {
    if (customList) {
      setEditTitleValue(customList.name);
      setIsEditingTitle(true);
    }
  };

  const handleSaveTitle = () => {
    if (onUpdateListTitle && editTitleValue.trim()) {
      onUpdateListTitle(editTitleValue.trim());
    }
    setIsEditingTitle(false);
  };

  const handlePrint = () => {
    setShowMoreMenu(false);
    window.print();
  };

  const handleExportData = () => {
    setShowMoreMenu(false);
    try {
      const tasksRaw = localStorage.getItem('ms_todo_tasks') || '[]';
      const listsRaw = localStorage.getItem('ms_todo_custom_lists') || '[]';
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(
        JSON.stringify({ tasks: JSON.parse(tasksRaw), lists: JSON.parse(listsRaw), exportedAt: new Date().toISOString() }, null, 2)
      );
      const dlAnchor = document.createElement('a');
      dlAnchor.setAttribute('href', dataStr);
      dlAnchor.setAttribute('download', `todo-backup-${new Date().toISOString().split('T')[0]}.json`);
      dlAnchor.click();
    } catch {
      // ignore
    }
  };

  return (
    <header id="list-header" className="relative px-6 pt-5 pb-3 bg-white border-b border-slate-100 transition-colors duration-150">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Title & Subtitle */}
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${theme.accentBg}`}>
            <Icon className={`w-5 h-5 ${theme.accentColor}`} />
          </div>

          <div>
            {isEditingTitle ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editTitleValue}
                  onChange={(e) => setEditTitleValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveTitle();
                    if (e.key === 'Escape') setIsEditingTitle(false);
                  }}
                  autoFocus
                  className="text-xl font-bold text-slate-900 px-2 py-0.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSaveTitle}
                  className="p-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 group">
                <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">
                  {meta.title}
                </h1>
                {customList && (
                  <button
                    onClick={handleStartEditing}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-600 rounded transition"
                    title="Rename list"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
            <p className="text-xs text-slate-400 font-normal">
              {meta.subtitle}
            </p>
          </div>
        </div>

        {/* Right: Search, Suggestions, Sort, Theme, More */}
        <div className="flex items-center gap-2 self-start md:self-center">
          {/* Search Box */}
          <div className="flex items-center bg-slate-50 hover:bg-slate-100/70 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-slate-300 rounded-lg px-2.5 py-1.5 border border-slate-200/80 transition w-36 sm:w-48">
            <Search className="w-3.5 h-3.5 text-slate-400 mr-2 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-transparent text-slate-800 placeholder-slate-400 text-xs focus:outline-none"
            />
            {searchQuery && (
              <button onClick={() => onSearchChange('')} className="text-slate-400 hover:text-slate-600">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Suggestions for My Day */}
          {showSuggestionsButton && (
            <button
              id="header-suggestions-toggle-button"
              onClick={onToggleSuggestions}
              title="Show suggested tasks for My Day"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline">Suggestions</span>
            </button>
          )}

          {/* Share List Button (for custom lists) */}
          {customList && onOpenShareModal && (
            <button
              id="header-share-list-btn"
              onClick={onOpenShareModal}
              title="Share list with colleagues"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
            >
              <UserPlus className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Share</span>
            </button>
          )}

          {/* Sort Dropdown */}
          <div className="relative" ref={sortRef}>
            <button
              id="header-sort-menu-button"
              onClick={() => setShowSortMenu(!showSortMenu)}
              title="Sort tasks"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Sort</span>
            </button>

            {showSortMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-30 text-slate-800 text-xs animate-in fade-in duration-100">
                <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Sort by
                </div>
                {[
                  { id: 'default', label: 'Default' },
                  { id: 'urgency', label: 'Urgency Level' },
                  { id: 'importance', label: 'Importance' },
                  { id: 'due_date', label: 'Due Date' },
                  { id: 'completed', label: 'Completed Status' },
                  { id: 'alphabetical', label: 'Alphabetical' },
                  { id: 'created_at', label: 'Creation Date' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSortChange(item.id as SortOption);
                      setShowSortMenu(false);
                    }}
                    className={`flex items-center justify-between w-full px-3 py-1.5 text-left hover:bg-slate-50 transition ${
                      sortOption === item.id ? 'font-semibold text-blue-600 bg-blue-50/50' : 'text-slate-700'
                    }`}
                  >
                    <span>{item.label}</span>
                    {sortOption === item.id && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme Picker Dropdown */}
          <div className="relative" ref={themeRef}>
            <button
              id="header-theme-picker-button"
              onClick={() => setShowThemePicker(!showThemePicker)}
              title="Accent theme"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            >
              <Palette className="w-4 h-4" />
            </button>

            {showThemePicker && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 p-2.5 z-30 text-slate-800 text-xs animate-in fade-in duration-100">
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Accent Color
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {(Object.keys(THEMES) as ListThemeId[]).map((themeKey) => {
                    const t = THEMES[themeKey];
                    const isSelected = activeTheme === themeKey;
                    return (
                      <button
                        key={themeKey}
                        onClick={() => {
                          if (onUpdateListTheme) onUpdateListTheme(themeKey);
                          setShowThemePicker(false);
                        }}
                        title={t.name}
                        className={`h-8 rounded-lg flex items-center justify-center transition-all ${
                          isSelected ? 'ring-2 ring-slate-900 ring-offset-1 scale-105' : 'hover:opacity-85'
                        }`}
                        style={{ backgroundColor: t.previewColor }}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* More Options Menu */}
          <div className="relative" ref={moreRef}>
            <button
              id="header-more-menu-button"
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              title="More options"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {showMoreMenu && (
              <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-30 text-slate-800 text-xs animate-in fade-in duration-100">
                <button
                  onClick={handleExportData}
                  className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-slate-50 text-slate-700 transition"
                >
                  <Download className="w-4 h-4 text-slate-400" />
                  <span>Export Backup</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-slate-50 text-slate-700 transition"
                >
                  <Printer className="w-4 h-4 text-slate-400" />
                  <span>Print list</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Urgency Filter Bar - Quiet, Minimalist Segmented Filter */}
      <div className="flex items-center gap-1 pt-2.5 mt-2 border-t border-slate-100/90 text-xs overflow-x-auto scrollbar-none">
        <span className="text-[11px] text-slate-400 mr-1.5 font-medium select-none">
          Filter:
        </span>
        {(['all', 'urgent', 'high', 'medium', 'low'] as const).map((level) => {
          const isActive = urgencyFilter === level;
          const count = urgencyCounts ? (level === 'all' ? urgencyCounts.all : urgencyCounts[level]) : 0;
          const label = level === 'all' ? 'All' : level.charAt(0).toUpperCase() + level.slice(1);

          return (
            <button
              key={level}
              type="button"
              id={`urgency-filter-${level}`}
              onClick={() => onUrgencyFilterChange?.(level)}
              className={`px-2.5 py-1 rounded-md text-xs transition flex items-center gap-1.5 select-none ${
                isActive
                  ? 'bg-slate-900 text-white font-medium shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100 font-normal'
              }`}
            >
              <span>{label}</span>
              {count > 0 && (
                <span className={`text-[10px] ${isActive ? 'text-slate-300 font-semibold' : 'text-slate-400 font-normal'}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};
