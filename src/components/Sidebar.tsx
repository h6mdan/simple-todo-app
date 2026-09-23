import React, { useState } from 'react';
import { 
  Inbox,
  Calendar as CalendarIcon, 
  Clock,
  Star,
  CheckCircle2,
  CalendarDays,
  StickyNote,
  Plus, 
  Trash2,
  Briefcase,
  ShoppingCart,
  BookOpen,
  List,
  X,
  Check,
  Sun,
  Moon
} from 'lucide-react';
import { CustomList, UrgencyLevel, UserProfile } from '../types.ts';

export const getLucideIcon = (iconName: string) => {
  switch (iconName) {
    case 'Briefcase': return Briefcase;
    case 'ShoppingCart': return ShoppingCart;
    case 'BookOpen': return BookOpen;
    default: return List;
  }
};

interface SidebarProps {
  currentView: string;
  onSelectView: (viewId: string) => void;
  selectedCategory: string; // 'all' or listId
  onSelectCategory: (catId: string) => void;
  priorityFilter: UrgencyLevel | 'all';
  onSelectPriority: (p: UrgencyLevel | 'all') => void;
  lists: CustomList[];
  onCreateList: (name: string, color: string) => void;
  onDeleteList: (id: string) => void;
  counts: {
    all: number;
    today: number;
    upcoming: number;
    important: number;
    completed: number;
    total: number;
    categories: Record<string, number>;
  };
  onClearAllTasks: () => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

const LIST_COLORS = [
  { label: 'Blue', value: '#3b82f6' },
  { label: 'Emerald', value: '#10b981' },
  { label: 'Amber', value: '#f59e0b' },
  { label: 'Rose', value: '#f43f5e' },
  { label: 'Purple', value: '#8b5cf6' },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  selectedCategory,
  onSelectCategory,
  priorityFilter,
  onSelectPriority,
  lists,
  onCreateList,
  onDeleteList,
  counts,
  onClearAllTasks,
  isDarkMode = false,
  onToggleDarkMode,
  isMobileOpen,
  onCloseMobile,
}) => {
  const [isAddingList, setIsAddingList] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListColor, setNewListColor] = useState(LIST_COLORS[0].value);

  const handleCreateList = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    onCreateList(newListName.trim(), newListColor);
    setNewListName('');
    setIsAddingList(false);
  };

  const coreViews = [
    { id: 'all', label: 'All Tasks', icon: Inbox, count: counts.all },
    { id: 'today', label: 'Today', icon: CalendarIcon, count: counts.today },
    { id: 'upcoming', label: 'Upcoming', icon: Clock, count: counts.upcoming },
    { id: 'important', label: 'Important', icon: Star, count: counts.important },
    { id: 'completed', label: 'Completed', icon: CheckCircle2, count: counts.completed },
    { id: 'calendar', label: 'Calendar', icon: CalendarDays, count: null },
    { id: 'sticky-wall', label: 'Sticky Wall', icon: StickyNote, count: null },
  ];

  const priorities: Array<{ id: UrgencyLevel | 'all'; label: string }> = [
    { id: 'all', label: 'All' },
    { id: 'urgent', label: 'Urgent' },
    { id: 'high', label: 'High' },
    { id: 'medium', label: 'Medium' },
    { id: 'low', label: 'Low' },
  ];

  const totalTasks = counts.total;
  const completedTasks = counts.completed;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-30 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        id="app-sidebar-nav"
        className={`fixed inset-y-14 left-0 z-35 lg:static w-[240px] xl:w-[250px] flex-shrink-0 flex flex-col justify-between h-[calc(100vh-3.5rem)] lg:h-full bg-[#ebedf0] dark:bg-[#0f1115] border-r border-[#e2e4e8] dark:border-zinc-800/80 transition-transform duration-200 ease-in-out lg:translate-x-0 select-none ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto px-3.5 py-4 space-y-6">
          {/* SECTION 1: VIEWS */}
          <div className="space-y-0.5">
            <div className="text-[11px] font-bold tracking-wider text-slate-400 dark:text-zinc-500 uppercase px-2 pb-1.5">
              Views
            </div>

            {coreViews.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  id={`sidebar-view-${item.id}`}
                  onClick={() => {
                    onSelectView(item.id);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-[#dfe2e7] dark:bg-zinc-800 text-slate-900 dark:text-white font-semibold'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-[#e4e7ec] dark:hover:bg-zinc-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-zinc-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.count !== null && (
                    <span className={`font-mono text-[11px] tabular-nums ${isActive ? 'text-slate-700 dark:text-zinc-300 font-semibold' : 'text-slate-400 dark:text-zinc-500'}`}>
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* SECTION 2: CATEGORIES */}
          <div className="space-y-1">
            <div className="flex items-center justify-between px-2 pb-1 text-[11px] font-bold tracking-wider text-slate-400 dark:text-zinc-500 uppercase">
              <span>Categories</span>
              <button
                type="button"
                id="sidebar-add-category-btn"
                onClick={() => setIsAddingList(!isAddingList)}
                className="p-0.5 rounded text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 transition"
                title="Add category"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* All Categories Filter */}
            <button
              type="button"
              id="category-all-btn"
              onClick={() => {
                onSelectCategory('all');
                onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-[#dfe2e7] dark:bg-zinc-800 text-slate-900 dark:text-white font-semibold'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-[#e4e7ec] dark:hover:bg-zinc-800/50'
              }`}
            >
              <span>All categories</span>
              <span className="font-mono text-[11px] tabular-nums text-slate-400 dark:text-zinc-500">
                {counts.total}
              </span>
            </button>

            {/* List of Custom Categories */}
            {lists.map((list) => {
              const isSelected = selectedCategory === list.id;
              const catCount = counts.categories[list.id] || 0;
              return (
                <div
                  key={list.id}
                  className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#dfe2e7] dark:bg-zinc-800 text-slate-900 dark:text-white font-semibold'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-[#e4e7ec] dark:hover:bg-zinc-800/50'
                  }`}
                  onClick={() => {
                    onSelectCategory(list.id);
                    onCloseMobile();
                  }}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: list.color || '#3b82f6' }}
                    />
                    <span className="truncate">{list.name}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[11px] tabular-nums text-slate-400 dark:text-zinc-500">
                      {catCount}
                    </span>
                    {lists.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete category "${list.name}"?`)) {
                            onDeleteList(list.id);
                          }
                        }}
                        className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-rose-500 transition"
                        title="Delete list"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Add Category Form */}
            {isAddingList && (
              <form onSubmit={handleCreateList} className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-2 mt-1">
                <input
                  type="text"
                  placeholder="Category name..."
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  autoFocus
                  className="w-full text-xs px-2 py-1 rounded bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white focus:outline-none"
                />
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1">
                    {LIST_COLORS.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setNewListColor(c.value)}
                        className={`w-3.5 h-3.5 rounded-full border transition ${
                          newListColor === c.value ? 'scale-110 border-slate-900 dark:border-white' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: c.value }}
                      />
                    ))}
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="submit"
                      className="px-2 py-0.5 rounded bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 text-[11px] font-semibold"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddingList(false)}
                      className="p-0.5 text-slate-400 hover:text-slate-600 text-xs"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>

          {/* SECTION 3: PRIORITY */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-bold tracking-wider text-slate-400 dark:text-zinc-500 uppercase px-2 pb-0.5">
              Priority
            </div>
            <div className="flex flex-wrap items-center gap-1 px-1">
              {priorities.map((p) => {
                const isActive = priorityFilter === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => onSelectPriority(p.id)}
                    className={`px-2.5 py-1 rounded-md text-xs transition font-medium ${
                      isActive
                        ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 font-semibold shadow-2xs'
                        : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-[#dfe2e7] dark:hover:bg-zinc-800/60'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* SECTION 4: BOTTOM PROGRESS & CLEAR ALL */}
        <div className="p-3.5 border-t border-[#e2e4e8] dark:border-zinc-800/80 space-y-3 bg-[#ebedf0] dark:bg-[#0f1115]">
          {/* Completed progress bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-zinc-400">
              <span className="font-medium">Completed</span>
              <span className="font-mono text-[11px] tabular-nums">
                {completedTasks}/{totalTasks}
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-300 dark:bg-zinc-800 overflow-hidden">
              <div
                className="h-full bg-zinc-900 dark:bg-white rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Bottom row: Clear all tasks + Theme toggle */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              id="sidebar-clear-all-btn"
              onClick={onClearAllTasks}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-400 transition select-none cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear all tasks</span>
            </button>

            {onToggleDarkMode && (
              <button
                type="button"
                id="sidebar-theme-toggle-btn"
                onClick={onToggleDarkMode}
                className="flex items-center gap-1 p-1 rounded-md text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-[#dfe2e7] dark:hover:bg-zinc-800 transition cursor-pointer text-xs"
                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDarkMode ? (
                  <Sun className="w-3.5 h-3.5 text-amber-400 stroke-[2.2]" />
                ) : (
                  <Moon className="w-3.5 h-3.5 text-slate-600 stroke-[2.2]" />
                )}
                <span className="text-[11px] font-medium hidden sm:inline">
                  {isDarkMode ? 'Light' : 'Dark'}
                </span>
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
