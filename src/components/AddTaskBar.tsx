import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  Calendar, 
  Bell, 
  Repeat, 
  Sun, 
  Star, 
  Check, 
  X,
  AlertCircle 
} from 'lucide-react';
import { RepeatInterval, UrgencyLevel } from '../types.ts';
import { getIsoDateOffset, getTodayDateString, getTomorrowDateString } from '../services/storage.ts';

interface AddTaskBarProps {
  currentList: string;
  onAddTask: (taskData: {
    title: string;
    dueDate?: string | null;
    reminder?: string | null;
    repeat?: RepeatInterval | null;
    myDay?: boolean;
    important?: boolean;
    urgency?: UrgencyLevel | null;
  }) => void;
}

export const AddTaskBar: React.FC<AddTaskBarProps> = ({ currentList, onAddTask }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [reminder, setReminder] = useState<string | null>(null);
  const [repeat, setRepeat] = useState<RepeatInterval | null>(null);
  const [urgency, setUrgency] = useState<UrgencyLevel | null>(null);
  const [isImportant, setIsImportant] = useState(currentList === 'important');
  const [isMyDay, setIsMyDay] = useState(currentList === 'my-day');

  // Popups for quick selectors
  const [activeMenu, setActiveMenu] = useState<'due' | 'remind' | 'repeat' | 'urgency' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
        if (!title.trim() && !dueDate && !reminder && !repeat && !urgency) {
          setIsFocused(false);
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [title, dueDate, reminder, repeat, urgency]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim()) return;

    onAddTask({
      title: title.trim(),
      dueDate,
      reminder,
      repeat,
      myDay: currentList === 'my-day' || isMyDay,
      important: currentList === 'important' || isImportant,
      urgency,
    });

    // Reset while keeping focus
    setTitle('');
    setDueDate(null);
    setReminder(null);
    setRepeat(null);
    setUrgency(null);
    setIsImportant(currentList === 'important');
    setIsMyDay(currentList === 'my-day');
    setActiveMenu(null);
  };

  return (
    <div
      ref={containerRef}
      id="add-task-container"
      className={`relative rounded-xl border bg-white transition-all duration-150 ${
        isFocused
          ? 'border-slate-300 ring-2 ring-slate-100 shadow-xs'
          : 'border-slate-200/80 hover:border-slate-300'
      }`}
    >
      <form onSubmit={handleSubmit} className="p-2.5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (title.trim()) handleSubmit();
              else setIsFocused(true);
            }}
            className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
              title.trim()
                ? 'bg-slate-900 text-white'
                : 'border border-slate-300 text-slate-400 hover:border-slate-500'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
          </button>

          <input
            id="add-task-input"
            type="text"
            placeholder={
              currentList === 'my-day'
                ? 'Add a task to "My Day"'
                : currentList === 'important'
                ? 'Add an important task'
                : currentList === 'planned'
                ? 'Add a scheduled task'
                : 'Add a task'
            }
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onFocus={() => setIsFocused(true)}
            className="flex-1 text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
          />

          {/* Quick star while typing */}
          {isFocused && (
            <button
              type="button"
              id="add-task-star-toggle"
              onClick={() => setIsImportant(!isImportant)}
              className={`p-1.5 rounded-lg transition ${
                isImportant ? 'text-amber-500' : 'text-slate-300 hover:text-slate-400'
              }`}
              title="Mark as important"
            >
              <Star className={`w-4 h-4 ${isImportant ? 'fill-amber-400 stroke-amber-500' : ''}`} />
            </button>
          )}
        </div>

        {/* Expanded options row when focused or has extra attributes */}
        {isFocused && (
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
            <div className="flex flex-wrap items-center gap-1.5">
              {/* Due Date Shortcut Button */}
              <div className="relative">
                <button
                  type="button"
                  id="add-task-due-date-button"
                  onClick={() => setActiveMenu(activeMenu === 'due' ? null : 'due')}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border transition ${
                    dueDate
                      ? 'bg-blue-50 text-blue-700 border-blue-200 font-medium'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{dueDate ? `Due ${dueDate}` : 'Add due date'}</span>
                  {dueDate && (
                    <X
                      className="w-3 h-3 ml-0.5 hover:text-rose-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDueDate(null);
                      }}
                    />
                  )}
                </button>

                {activeMenu === 'due' && (
                  <div className="absolute left-0 mt-1 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-30 animate-in fade-in duration-100">
                    <button
                      type="button"
                      onClick={() => {
                        setDueDate(getTodayDateString());
                        setActiveMenu(null);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-100 text-xs"
                    >
                      Today
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDueDate(getTomorrowDateString());
                        setActiveMenu(null);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-100 text-xs"
                    >
                      Tomorrow
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDueDate(getIsoDateOffset(7));
                        setActiveMenu(null);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-100 text-xs"
                    >
                      Next week
                    </button>
                    <div className="p-2 border-t border-slate-100">
                      <input
                        type="date"
                        value={dueDate || ''}
                        onChange={(e) => {
                          setDueDate(e.target.value);
                          setActiveMenu(null);
                        }}
                        className="w-full text-xs p-1 border border-slate-200 rounded"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Remind Me Shortcut */}
              <div className="relative">
                <button
                  type="button"
                  id="add-task-remind-button"
                  onClick={() => setActiveMenu(activeMenu === 'remind' ? null : 'remind')}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border transition ${
                    reminder
                      ? 'bg-blue-50 text-blue-700 border-blue-200 font-medium'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>{reminder ? 'Reminder set' : 'Remind me'}</span>
                  {reminder && (
                    <X
                      className="w-3 h-3 ml-0.5 hover:text-rose-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        setReminder(null);
                      }}
                    />
                  )}
                </button>

                {activeMenu === 'remind' && (
                  <div className="absolute left-0 mt-1 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-30 animate-in fade-in duration-100">
                    <button
                      type="button"
                      onClick={() => {
                        setReminder(new Date(Date.now() + 14400000).toISOString());
                        setActiveMenu(null);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-100 text-xs"
                    >
                      Later today (4 hrs)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setReminder(new Date(Date.now() + 86400000).toISOString());
                        setActiveMenu(null);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-100 text-xs"
                    >
                      Tomorrow (9:00 AM)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setReminder(new Date(Date.now() + 86400000 * 7).toISOString());
                        setActiveMenu(null);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-100 text-xs"
                    >
                      Next week
                    </button>
                  </div>
                )}
              </div>

              {/* Repeat Shortcut */}
              <div className="relative">
                <button
                  type="button"
                  id="add-task-repeat-button"
                  onClick={() => setActiveMenu(activeMenu === 'repeat' ? null : 'repeat')}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border transition ${
                    repeat
                      ? 'bg-blue-50 text-blue-700 border-blue-200 font-medium'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <Repeat className="w-3.5 h-3.5" />
                  <span>{repeat ? `Repeat: ${repeat}` : 'Repeat'}</span>
                  {repeat && (
                    <X
                      className="w-3 h-3 ml-0.5 hover:text-rose-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        setRepeat(null);
                      }}
                    />
                  )}
                </button>

                {activeMenu === 'repeat' && (
                  <div className="absolute left-0 mt-1 w-36 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-30 animate-in fade-in duration-100">
                    {(['daily', 'weekdays', 'weekly', 'monthly', 'yearly'] as RepeatInterval[]).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => {
                          setRepeat(r);
                          setActiveMenu(null);
                        }}
                        className="w-full text-left px-3 py-1.5 hover:bg-slate-100 text-xs capitalize"
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Urgency Selector Shortcut */}
              <div className="relative">
                <button
                  type="button"
                  id="add-task-urgency-button"
                  onClick={() => setActiveMenu(activeMenu === 'urgency' ? null : 'urgency')}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition ${
                    urgency === 'urgent'
                      ? 'bg-rose-50 text-rose-700 border-rose-200 font-semibold'
                      : urgency === 'high'
                      ? 'bg-amber-50 text-amber-700 border-amber-200 font-semibold'
                      : urgency === 'medium'
                      ? 'bg-blue-50 text-blue-700 border-blue-200 font-medium'
                      : urgency === 'low'
                      ? 'bg-slate-100 text-slate-700 border-slate-200 font-medium'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>
                    {urgency === 'urgent'
                      ? 'Urgent'
                      : urgency === 'high'
                      ? 'High'
                      : urgency === 'medium'
                      ? 'Medium'
                      : urgency === 'low'
                      ? 'Low'
                      : 'Urgency'}
                  </span>
                  {urgency && (
                    <X
                      className="w-3 h-3 ml-0.5 hover:text-rose-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        setUrgency(null);
                      }}
                    />
                  )}
                </button>

                {activeMenu === 'urgency' && (
                  <div className="absolute left-0 mt-1 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-30 animate-in fade-in duration-100">
                    <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Set Urgency
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setUrgency('urgent');
                        setActiveMenu(null);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-rose-50 text-xs text-rose-700 font-semibold"
                    >
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                      <span>Urgent</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUrgency('high');
                        setActiveMenu(null);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-amber-50 text-xs text-amber-800 font-medium"
                    >
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      <span>High</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUrgency('medium');
                        setActiveMenu(null);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-blue-50 text-xs text-blue-700 font-medium"
                    >
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      <span>Medium</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUrgency('low');
                        setActiveMenu(null);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-slate-100 text-xs text-slate-600 font-medium"
                    >
                      <span className="w-2 h-2 rounded-full bg-slate-400" />
                      <span>Low</span>
                    </button>
                    {urgency && (
                      <button
                        type="button"
                        onClick={() => {
                          setUrgency(null);
                          setActiveMenu(null);
                        }}
                        className="w-full text-left px-3 py-1.5 border-t border-slate-100 text-xs text-slate-500 hover:text-rose-600"
                      >
                        Clear urgency
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Add to My Day toggle if not in My Day list */}
              {currentList !== 'my-day' && (
                <button
                  type="button"
                  onClick={() => setIsMyDay(!isMyDay)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border transition ${
                    isMyDay
                      ? 'bg-sky-50 text-sky-700 border-sky-200 font-medium'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <Sun className={`w-3.5 h-3.5 ${isMyDay ? 'text-sky-500 fill-sky-400' : ''}`} />
                  <span>{isMyDay ? 'In My Day' : 'Add to My Day'}</span>
                </button>
              )}
            </div>

            {/* Right: Submit button */}
            <div className="flex items-center gap-2">
              <button
                type="submit"
                id="add-task-submit-button"
                disabled={!title.trim()}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium text-xs shadow-xs transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
