import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Check, X } from 'lucide-react';
import { CustomList, Task } from '../types.ts';

interface CalendarViewProps {
  tasks: Task[];
  customLists: CustomList[];
  onSelectTask: (task: Task) => void;
  onAddTaskOnDate: (title: string, dateStr: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  tasks,
  customLists,
  onSelectTask,
  onAddTaskOnDate,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeInputDate, setActiveInputDate] = useState<string | null>(null);
  const [inlineTaskTitle, setInlineTaskTitle] = useState('');

  const handleCreateInlineTask = (dateStr: string) => {
    if (inlineTaskTitle.trim()) {
      onAddTaskOnDate(inlineTaskTitle.trim(), dateStr);
    }
    setInlineTaskTitle('');
    setActiveInputDate(null);
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <main className="flex-1 min-w-0 flex flex-col h-full overflow-y-auto px-6 lg:px-10 py-6 lg:py-8 bg-white dark:bg-[#0c0e12]">
      <div className="max-w-5xl w-full mx-auto flex flex-col flex-1">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-100 dark:border-zinc-800/60">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
              {monthNames[month]} {year}
            </h1>
            <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">
              Monthly overview of scheduled tasks
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-800/60 p-1 rounded-lg">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1 rounded text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setCurrentDate(new Date())}
              className="px-2.5 py-0.5 text-xs font-medium text-slate-700 dark:text-zinc-200 hover:text-slate-900 dark:hover:text-white transition"
            >
              Today
            </button>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1 rounded text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Weekdays Row */}
        <div className="grid grid-cols-7 gap-2 mb-2 text-center text-[11px] font-semibold tracking-wider text-slate-400 dark:text-zinc-500 uppercase">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2 flex-1">
          {/* Empty slots for previous month offset */}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[100px] rounded-xl bg-slate-50/40 dark:bg-zinc-900/20 border border-transparent" />
          ))}

          {/* Days of current month */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const isToday = dateStr === todayStr;
            const dayTasks = tasks.filter((t) => t.due_date === dateStr || (t.my_day && isToday));

            return (
              <div
                key={dateStr}
                className={`group min-h-[100px] p-2 rounded-xl border transition-all flex flex-col justify-between ${
                  isToday
                    ? 'border-slate-900 dark:border-white bg-slate-50/80 dark:bg-zinc-800/40 shadow-xs'
                    : 'border-slate-200/80 dark:border-zinc-800/80 bg-white dark:bg-[#111318] hover:border-slate-300 dark:hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-semibold ${
                      isToday
                        ? 'w-5 h-5 rounded-full bg-slate-900 text-white dark:bg-white dark:text-zinc-950 flex items-center justify-center text-[11px] font-bold'
                        : 'text-slate-600 dark:text-zinc-400'
                    }`}
                  >
                    {dayNum}
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveInputDate(dateStr);
                      setInlineTaskTitle('');
                    }}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 text-xs p-0.5 rounded transition cursor-pointer"
                    title="Add task on this day"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Inline task creation on this day */}
                {activeInputDate === dateStr && (
                  <div className="my-1 p-1 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg shadow-sm">
                    <input
                      type="text"
                      autoFocus
                      placeholder="Task title..."
                      value={inlineTaskTitle}
                      onChange={(e) => setInlineTaskTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleCreateInlineTask(dateStr);
                        } else if (e.key === 'Escape') {
                          setActiveInputDate(null);
                        }
                      }}
                      className="w-full text-[11px] px-1.5 py-0.5 bg-transparent border-b border-slate-200 dark:border-zinc-700 focus:outline-none text-slate-900 dark:text-zinc-100"
                    />
                    <div className="flex items-center justify-end gap-1 mt-1 pt-0.5">
                      <button
                        type="button"
                        onClick={() => setActiveInputDate(null)}
                        className="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 text-[10px]"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCreateInlineTask(dateStr)}
                        disabled={!inlineTaskTitle.trim()}
                        className="px-1.5 py-0.5 bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 text-[10px] rounded font-semibold disabled:opacity-40"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                )}

                {/* Tasks on this day */}
                <div className="mt-1 space-y-1 overflow-y-auto max-h-[64px] scrollbar-none">
                  {dayTasks.map((t) => {
                    const list = customLists.find((l) => l.id === t.list_id);
                    return (
                      <div
                        key={t.id}
                        onClick={() => onSelectTask(t)}
                        className="px-1.5 py-0.5 rounded text-[10px] font-medium truncate cursor-pointer hover:opacity-85 flex items-center gap-1 border border-slate-200/70 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/60 text-slate-800 dark:text-zinc-200 transition"
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: list?.color || '#3b82f6' }}
                        />
                        <span className="truncate">{t.title}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
};
