import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Calendar as CalendarIcon, 
  Star, 
  Tag, 
  Check, 
  Plus, 
  Folder, 
  AlertCircle 
} from 'lucide-react';
import { CustomList, UrgencyLevel } from '../types.ts';
import { getTodayDateString, getTomorrowDateString } from '../services/storage.ts';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CustomList[];
  defaultCategory?: string;
  onCreateTask: (params: {
    title: string;
    listId: string;
    priority: UrgencyLevel;
    dueDate: string | null;
    isImportant: boolean;
    note: string;
  }) => void;
}

const PRIORITIES: Array<{ id: UrgencyLevel; label: string; dotColor: string }> = [
  { id: 'low', label: 'Low', dotColor: 'bg-slate-400' },
  { id: 'medium', label: 'Medium', dotColor: 'bg-blue-500' },
  { id: 'high', label: 'High', dotColor: 'bg-amber-500' },
  { id: 'urgent', label: 'Urgent', dotColor: 'bg-red-500' },
];

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  categories,
  defaultCategory,
  onCreateTask,
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState('');
  const [selectedListId, setSelectedListId] = useState(() => {
    if (defaultCategory && defaultCategory !== 'all') {
      return defaultCategory;
    }
    return categories[0]?.id || 'list-work';
  });
  const [priority, setPriority] = useState<UrgencyLevel>('medium');
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [isImportant, setIsImportant] = useState(false);
  const [note, setNote] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onCreateTask({
      title: title.trim(),
      listId: selectedListId,
      priority,
      dueDate,
      isImportant,
      note: note.trim(),
    });

    // Reset & close
    setTitle('');
    setNote('');
    setDueDate(null);
    setIsImportant(false);
    onClose();
  };

  const todayStr = getTodayDateString();
  const tomorrowStr = getTomorrowDateString();

  return (
    <div
      id="create-task-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="create-task-modal-card"
        className="bg-white dark:bg-[#111318] text-slate-900 dark:text-zinc-100 rounded-2xl shadow-xl border border-slate-200 dark:border-zinc-800 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-zinc-800/80">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center">
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </div>
            <h2 className="font-bold text-base tracking-tight text-slate-900 dark:text-zinc-100">
              Create New Task
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Task Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
              Task Title <span className="text-rose-500">*</span>
            </label>
            <input
              ref={inputRef}
              type="text"
              required
              placeholder="e.g. Finish quarterly project proposal"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50/50 dark:bg-zinc-900/80 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-zinc-900 dark:focus:border-white focus:bg-white transition"
            />
          </div>

          {/* Category / List Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
              Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categories.map((cat) => {
                const isSelected = selectedListId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedListId(cat.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition text-left truncate ${
                      isSelected
                        ? 'border-zinc-900 dark:border-white bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 font-semibold shadow-2xs'
                        : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300 text-slate-700 dark:text-zinc-300 bg-white dark:bg-zinc-900/50'
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: cat.color || '#3b82f6' }}
                    />
                    <span className="truncate">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Priority Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
              Priority
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {PRIORITIES.map((p) => {
                const isSelected = priority === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPriority(p.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition ${
                      isSelected
                        ? 'border-zinc-900 dark:border-white bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 font-semibold shadow-2xs'
                        : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300 text-slate-600 dark:text-zinc-400 bg-white dark:bg-zinc-900/50'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${p.dotColor}`} />
                    <span>{p.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Due Date & Important Flag */}
          <div className="space-y-3 pt-1">
            {/* Due Date Section */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">
                  Due Date
                </label>
                {dueDate && (
                  <button
                    type="button"
                    onClick={() => setDueDate(null)}
                    className="text-[11px] text-slate-400 hover:text-rose-500 transition cursor-pointer"
                  >
                    Clear date
                  </button>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDueDate(dueDate === todayStr ? null : todayStr)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition cursor-pointer ${
                    dueDate === todayStr
                      ? 'border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-950 font-semibold shadow-2xs'
                      : 'border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800'
                  }`}
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => setDueDate(dueDate === tomorrowStr ? null : tomorrowStr)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition cursor-pointer ${
                    dueDate === tomorrowStr
                      ? 'border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-950 font-semibold shadow-2xs'
                      : 'border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800'
                  }`}
                >
                  Tomorrow
                </button>
                <div className="relative flex items-center">
                  <input
                    type="date"
                    value={dueDate || ''}
                    onChange={(e) => setDueDate(e.target.value || null)}
                    className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 focus:outline-none focus:border-zinc-900 dark:focus:border-white cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Important Flag Section */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                Priority Flag
              </label>
              <button
                type="button"
                onClick={() => setIsImportant(!isImportant)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-medium transition cursor-pointer ${
                  isImportant
                    ? 'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-semibold shadow-2xs'
                    : 'border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:border-slate-300 bg-white dark:bg-zinc-900/50'
                }`}
              >
                <Star
                  className={`w-4 h-4 ${
                    isImportant ? 'fill-amber-500 text-amber-500' : 'text-slate-400'
                  }`}
                />
                <span>{isImportant ? 'Marked as Important' : 'Mark as Important'}</span>
              </button>
            </div>
          </div>

          {/* Description / Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
              Notes <span className="text-slate-400 text-[11px] font-normal">(Optional)</span>
            </label>
            <textarea
              rows={2}
              placeholder="Add extra context, links, or instructions..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50/50 dark:bg-zinc-900/80 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-zinc-900 dark:focus:border-white focus:bg-white transition resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-zinc-800/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-100 disabled:opacity-40 transition shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Task</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
