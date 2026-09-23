import React, { useState } from 'react';
import { Plus, CheckCircle2, Star, ChevronDown, ChevronRight } from 'lucide-react';
import { CustomList, Task, UrgencyLevel } from '../types.ts';
import { TaskItem } from './TaskItem.tsx';

interface TaskListProps {
  title: string;
  tasks: Task[];
  customLists: CustomList[];
  selectedTaskId: string | null;
  onSelectTask: (task: Task) => void;
  onToggleComplete: (task: Task, e: React.MouseEvent) => void;
  onToggleImportant: (task: Task, e: React.MouseEvent) => void;
  onChangePriority: (task: Task, newPriority: UrgencyLevel) => void;
  onDeleteTask: (taskId: string) => void;
  onQuickAddTask: (title: string, priority?: UrgencyLevel, isImportant?: boolean) => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  title,
  tasks,
  customLists,
  selectedTaskId,
  onSelectTask,
  onToggleComplete,
  onToggleImportant,
  onChangePriority,
  onDeleteTask,
  onQuickAddTask,
}) => {
  const [quickTitle, setQuickTitle] = useState('');
  const [quickPriority, setQuickPriority] = useState<UrgencyLevel>('medium');
  const [quickImportant, setQuickImportant] = useState(false);
  const [isCompletedOpen, setIsCompletedOpen] = useState(true);

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;
    onQuickAddTask(quickTitle.trim(), quickPriority, quickImportant);
    setQuickTitle('');
    setQuickImportant(false);
  };

  const activeTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  const priorities: Array<{ id: UrgencyLevel; label: string }> = [
    { id: 'low', label: 'Low' },
    { id: 'medium', label: 'Medium' },
    { id: 'high', label: 'High' },
    { id: 'urgent', label: 'Urgent' },
  ];

  return (
    <main
      id="main-task-list-view"
      className="flex-1 min-w-0 flex flex-col h-full overflow-y-auto px-6 lg:px-12 py-6 lg:py-8 bg-[#f5f6f8] dark:bg-[#0c0e12]"
    >
      <div className="max-w-3xl w-full mx-auto flex flex-col flex-1">
        {/* Header: Title and Task Count (e.g. "All Tasks  2") */}
        <div className="flex items-baseline gap-2.5 mb-6 pb-2 border-b border-[#e2e4e8] dark:border-zinc-800/60">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
            {title}
          </h1>
          <span className="text-sm font-normal text-slate-400 dark:text-zinc-500 font-mono tabular-nums">
            {tasks.length}
          </span>
        </div>

        {/* Add Task Box (Matching Photo Layout & Light Palette) */}
        <div className="mb-6 rounded-xl border border-[#e2e4e8] dark:border-zinc-800 bg-white dark:bg-[#111318] p-3.5 shadow-2xs">
          <form onSubmit={handleQuickAdd}>
            {/* Input Row */}
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-slate-400 dark:text-zinc-500 flex-shrink-0" />
              <input
                type="text"
                id="quick-add-task-input"
                value={quickTitle}
                onChange={(e) => setQuickTitle(e.target.value)}
                placeholder="Add task to list..."
                className="w-full bg-transparent text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none"
              />
            </div>

            {/* Sub-bar: Priority Selection + Important Toggle + Add Button */}
            <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800/70">
              {/* Left: Priority Selector */}
              <div className="flex items-center gap-1 text-xs">
                <span className="text-slate-400 dark:text-zinc-500 font-medium mr-1">
                  Priority:
                </span>
                {priorities.map((p) => {
                  const isSelected = quickPriority === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setQuickPriority(p.id)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                        isSelected
                          ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 font-semibold shadow-2xs'
                          : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800'
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>

              {/* Right: Important Star Toggle + Add Button */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQuickImportant(!quickImportant)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition ${
                    quickImportant
                      ? 'text-amber-600 bg-amber-50 dark:bg-amber-950/30'
                      : 'text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <Star
                    className={`w-3.5 h-3.5 ${
                      quickImportant ? 'fill-amber-500 text-amber-500' : 'text-slate-400'
                    }`}
                  />
                  <span>Important</span>
                </button>

                <button
                  type="submit"
                  disabled={!quickTitle.trim()}
                  className="px-3.5 py-1 rounded-md bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-100 disabled:opacity-40 transition shadow-2xs"
                >
                  Add
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Task List Items */}
        <div className="flex-1 space-y-2">
          {activeTasks.length > 0 ? (
            activeTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                isSelected={selectedTaskId === task.id}
                onSelect={onSelectTask}
                onToggleComplete={onToggleComplete}
                onToggleImportant={onToggleImportant}
                onChangePriority={onChangePriority}
                onDeleteTask={onDeleteTask}
                customLists={customLists}
              />
            ))
          ) : completedTasks.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center justify-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 border border-slate-200/80 dark:border-zinc-700 flex items-center justify-center text-slate-400 dark:text-zinc-500 shadow-2xs">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <p className="text-sm font-medium text-slate-700 dark:text-zinc-300">
                All caught up
              </p>
              <p className="text-xs text-slate-400 dark:text-zinc-500">
                No active tasks in this view.
              </p>
            </div>
          ) : null}

          {/* Completed Tasks Collapsible Section */}
          {completedTasks.length > 0 && (
            <div className="pt-6">
              <button
                type="button"
                onClick={() => setIsCompletedOpen(!isCompletedOpen)}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300 transition select-none mb-2"
              >
                {isCompletedOpen ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
                <span>Completed</span>
                <span className="font-mono tabular-nums text-[11px]">
                  ({completedTasks.length})
                </span>
              </button>

              {isCompletedOpen && (
                <div className="space-y-2 pt-1">
                  {completedTasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      isSelected={selectedTaskId === task.id}
                      onSelect={onSelectTask}
                      onToggleComplete={onToggleComplete}
                      onToggleImportant={onToggleImportant}
                      onChangePriority={onChangePriority}
                      onDeleteTask={onDeleteTask}
                      customLists={customLists}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
};
