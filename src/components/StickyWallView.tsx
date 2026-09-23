import React, { useState } from 'react';
import { Plus, Trash2, Check } from 'lucide-react';
import { CustomList, Task } from '../types.ts';

interface StickyWallViewProps {
  tasks: Task[];
  customLists: CustomList[];
  onSelectTask: (task: Task) => void;
  onToggleComplete: (task: Task, e: React.MouseEvent) => void;
  onDeleteTask: (taskId: string) => void;
  onQuickAdd: (title: string, listId?: string) => void;
}

const STICKY_STYLES = [
  'bg-amber-50/90 dark:bg-amber-950/20 text-amber-950 dark:text-amber-200 border-amber-200/80 dark:border-amber-900/40',
  'bg-sky-50/90 dark:bg-sky-950/20 text-sky-950 dark:text-sky-200 border-sky-200/80 dark:border-sky-900/40',
  'bg-rose-50/90 dark:bg-rose-950/20 text-rose-950 dark:text-rose-200 border-rose-200/80 dark:border-rose-900/40',
  'bg-emerald-50/90 dark:bg-emerald-950/20 text-emerald-950 dark:text-emerald-200 border-emerald-200/80 dark:border-emerald-900/40',
  'bg-violet-50/90 dark:bg-violet-950/20 text-violet-950 dark:text-violet-200 border-violet-200/80 dark:border-violet-900/40',
];

export const StickyWallView: React.FC<StickyWallViewProps> = ({
  tasks,
  customLists,
  onSelectTask,
  onToggleComplete,
  onDeleteTask,
  onQuickAdd,
}) => {
  const [newStickyText, setNewStickyText] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStickyText.trim()) return;
    onQuickAdd(newStickyText.trim());
    setNewStickyText('');
  };

  return (
    <main className="flex-1 min-w-0 flex flex-col h-full overflow-y-auto px-6 lg:px-10 py-6 lg:py-8 bg-white dark:bg-[#0c0e12]">
      <div className="max-w-5xl w-full mx-auto flex flex-col flex-1">
        {/* Sticky Wall Header */}
        <div className="flex items-baseline justify-between mb-6 pb-2 border-b border-slate-100 dark:border-zinc-800/60">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
              Sticky Wall
            </h1>
            <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">
              Quick visual notes and reminders
            </p>
          </div>
          <span className="text-xs font-medium text-slate-400 dark:text-zinc-500 font-mono tabular-nums">
            {tasks.length} {tasks.length === 1 ? 'note' : 'notes'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Add Note Card */}
          <div className="min-h-[160px] p-4 rounded-xl border border-dashed border-slate-300 dark:border-zinc-700/80 bg-slate-50/50 dark:bg-zinc-900/20 flex flex-col justify-between">
            <form onSubmit={handleAdd} className="flex-1 flex flex-col justify-between">
              <textarea
                rows={3}
                placeholder="Write a quick sticky note..."
                value={newStickyText}
                onChange={(e) => setNewStickyText(e.target.value)}
                className="w-full bg-transparent text-xs text-slate-800 dark:text-zinc-200 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none resize-none leading-relaxed"
              />
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={!newStickyText.trim()}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-zinc-950 text-xs font-semibold hover:opacity-90 disabled:opacity-30 transition flex items-center gap-1 shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Note</span>
                </button>
              </div>
            </form>
          </div>

          {/* Sticky Task Cards */}
          {tasks.map((task, idx) => {
            const styleClass = STICKY_STYLES[idx % STICKY_STYLES.length];
            const list = customLists.find((l) => l.id === task.list_id);

            return (
              <div
                key={task.id}
                onClick={() => onSelectTask(task)}
                className={`min-h-[160px] p-4 rounded-xl border transition-all duration-150 hover:shadow-xs cursor-pointer flex flex-col justify-between ${styleClass} ${
                  task.completed ? 'opacity-50' : ''
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h4
                      className={`text-xs font-semibold leading-snug ${
                        task.completed ? 'line-through opacity-70' : ''
                      }`}
                    >
                      {task.title}
                    </h4>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteTask(task.id);
                      }}
                      className="p-1 rounded opacity-40 hover:opacity-100 hover:text-rose-600 transition"
                      title="Delete note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {task.note && (
                    <p className="mt-2 text-xs opacity-75 line-clamp-3 leading-relaxed">
                      {task.note}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 text-[11px] border-t border-current/10">
                  {list ? (
                    <span className="font-medium opacity-80">{list.name}</span>
                  ) : (
                    <span />
                  )}

                  <button
                    type="button"
                    onClick={(e) => onToggleComplete(task, e)}
                    className={`w-4 h-4 rounded border flex items-center justify-center transition ${
                      task.completed
                        ? 'bg-current text-white dark:text-zinc-950'
                        : 'border-current opacity-60 hover:opacity-100'
                    }`}
                  >
                    {task.completed && <Check className="w-3 h-3 stroke-[3]" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
};
