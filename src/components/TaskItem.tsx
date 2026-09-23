import React, { useState, useRef, useEffect } from 'react';
import { 
  Check, 
  Star, 
  ChevronDown, 
  Calendar as CalendarIcon, 
  CheckSquare, 
  ChevronRight,
  Trash2
} from 'lucide-react';
import { CustomList, Task, UrgencyLevel } from '../types.ts';

interface TaskItemProps {
  task: Task;
  isSelected: boolean;
  onSelect: (task: Task) => void;
  onToggleComplete: (task: Task, e: React.MouseEvent) => void;
  onToggleImportant: (task: Task, e: React.MouseEvent) => void;
  onChangePriority: (task: Task, newPriority: UrgencyLevel) => void;
  onDeleteTask?: (taskId: string) => void;
  customLists: CustomList[];
}

const PRIORITY_CONFIG: Record<UrgencyLevel, { label: string; dotColor: string }> = {
  low: { label: 'Low', dotColor: 'bg-slate-400' },
  medium: { label: 'Medium', dotColor: 'bg-blue-500' },
  high: { label: 'High', dotColor: 'bg-amber-500' },
  urgent: { label: 'Urgent', dotColor: 'bg-red-500' },
};

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  isSelected,
  onSelect,
  onToggleComplete,
  onToggleImportant,
  onChangePriority,
  onDeleteTask,
  customLists,
}) => {
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);
  const priorityMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (priorityMenuRef.current && !priorityMenuRef.current.contains(e.target as Node)) {
        setShowPriorityMenu(false);
      }
    };
    if (showPriorityMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPriorityMenu]);

  const taskUrgency: UrgencyLevel = task.urgency || 'medium';
  const currentPriority = PRIORITY_CONFIG[taskUrgency] || PRIORITY_CONFIG.medium;
  const list = customLists.find((l) => l.id === task.list_id);
  const stepsTotal = task.steps?.length || 0;
  const stepsDone = task.steps?.filter((s) => s.completed).length || 0;

  // Format due date elegantly
  const formatDueDate = (dateStr?: string | null) => {
    if (!dateStr) return null;
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const date = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      if (date.getTime() === today.getTime()) return 'Today';
      if (date.getTime() === tomorrow.getTime()) return 'Tomorrow';

      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    return dateStr;
  };

  const formattedDate = formatDueDate(task.due_date);

  return (
    <div
      id={`task-item-${task.id}`}
      onClick={() => onSelect(task)}
      className={`group flex items-center justify-between px-3.5 py-3 rounded-xl border transition-all duration-150 cursor-pointer select-none ${
        isSelected
          ? 'bg-white dark:bg-zinc-800/80 border-slate-300 dark:border-zinc-600 shadow-xs ring-1 ring-slate-400/20'
          : task.completed
          ? 'bg-white/80 dark:bg-zinc-900/40 border-slate-200/80 dark:border-zinc-800/60 opacity-60 hover:opacity-90'
          : 'bg-white dark:bg-[#111318] border-slate-200/90 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 shadow-2xs'
      }`}
    >
      {/* Left: Checkbox + Title + Sub-row (Priority dropdown + Star + Meta) */}
      <div className="flex items-start gap-3 min-w-0 flex-1 pr-2">
        {/* Checkbox */}
        <button
          type="button"
          id={`task-checkbox-${task.id}`}
          onClick={(e) => onToggleComplete(task, e)}
          className={`mt-0.5 w-[18px] h-[18px] rounded-md border flex items-center justify-center flex-shrink-0 transition-colors ${
            task.completed
              ? 'bg-zinc-900 dark:bg-white border-zinc-900 dark:border-white text-white dark:text-zinc-950'
              : 'border-slate-300 dark:border-zinc-600 hover:border-zinc-800 dark:hover:border-zinc-400 bg-transparent'
          }`}
          title={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
        >
          {task.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
        </button>

        {/* Title and Subline */}
        <div className="min-w-0 flex-1">
          <p
            className={`text-sm leading-snug transition-colors ${
              task.completed
                ? 'line-through text-slate-400 dark:text-zinc-500'
                : 'text-slate-900 dark:text-zinc-100 font-medium'
            }`}
          >
            {task.title}
          </p>

          {/* Subline: Priority dot & dropdown, Star, and subtle indicators */}
          <div className="flex flex-wrap items-center gap-2 mt-1 text-xs">
            {/* Priority Selector Pill */}
            <div className="relative" ref={priorityMenuRef}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPriorityMenu(!showPriorityMenu);
                }}
                className="flex items-center gap-1.5 py-0.5 px-1 -ml-1 rounded text-[11px] font-medium text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
                title="Change priority"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${currentPriority.dotColor}`} />
                <span>{currentPriority.label}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {/* Priority Selection Popup */}
              {showPriorityMenu && (
                <div
                  className="absolute left-0 mt-1 w-32 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg shadow-lg py-1 z-30 space-y-0.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  {(['low', 'medium', 'high', 'urgent'] as UrgencyLevel[]).map((p) => {
                    const cfg = PRIORITY_CONFIG[p];
                    const isCurrent = taskUrgency === p;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => {
                          onChangePriority(task, p);
                          setShowPriorityMenu(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1 text-xs hover:bg-slate-50 dark:hover:bg-zinc-800 text-left ${
                          isCurrent ? 'font-semibold text-slate-900 dark:text-white' : 'text-slate-600 dark:text-zinc-400'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotColor}`} />
                          <span>{cfg.label}</span>
                        </div>
                        {isCurrent && <Check className="w-3 h-3" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Star Important Toggle */}
            <button
              type="button"
              onClick={(e) => onToggleImportant(task, e)}
              className={`p-0.5 rounded transition ${
                task.important
                  ? 'text-amber-500 fill-amber-500'
                  : 'text-slate-300 dark:text-zinc-600 hover:text-amber-500'
              }`}
              title={task.important ? 'Mark as unimportant' : 'Mark as important'}
            >
              <Star className={`w-3.5 h-3.5 ${task.important ? 'fill-amber-500' : ''}`} />
            </button>

            {/* Due date if available */}
            {formattedDate && (
              <>
                <span className="text-slate-300 dark:text-zinc-700" aria-hidden="true">·</span>
                <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-zinc-400">
                  <CalendarIcon className="w-3 h-3 text-slate-400 dark:text-zinc-500" />
                  <span>{formattedDate}</span>
                </div>
              </>
            )}

            {/* Subtasks if available */}
            {stepsTotal > 0 && (
              <>
                <span className="text-slate-300 dark:text-zinc-700" aria-hidden="true">·</span>
                <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-zinc-400">
                  <CheckSquare className="w-3 h-3 text-slate-400 dark:text-zinc-500" />
                  <span>{stepsDone}/{stepsTotal}</span>
                </div>
              </>
            )}

            {/* Category / List indicator if not All view */}
            {list && (
              <>
                <span className="text-slate-300 dark:text-zinc-700" aria-hidden="true">·</span>
                <span className="text-[11px] text-slate-400 dark:text-zinc-500">
                  {list.name}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right: Actions on Hover & Chevron */}
      <div className="flex items-center gap-1">
        {onDeleteTask && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteTask(task.id);
            }}
            className="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-400 hover:text-rose-500 transition"
            title="Delete task"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
        <div className="flex-shrink-0 text-slate-300 dark:text-zinc-600 group-hover:text-slate-500 dark:group-hover:text-zinc-400 group-hover:translate-x-0.5 transition-all">
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};
