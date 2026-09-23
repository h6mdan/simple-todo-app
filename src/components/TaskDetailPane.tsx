import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Check, 
  X, 
  Calendar as CalendarIcon, 
  ChevronDown,
  CheckCircle2,
  ListTodo,
  Tag as TagIcon,
  AlignLeft,
  Clock,
  Star
} from 'lucide-react';
import { CustomList, Step, Task } from '../types.ts';

interface TaskDetailPaneProps {
  task: Task | null;
  onClose?: () => void;
  onUpdateTask: (updated: Task) => void;
  onDeleteTask: (taskId: string) => void;
  customLists: CustomList[];
  allTags: string[];
  onAddTagGlobal: (newTag: string) => void;
}

export const TaskDetailPane: React.FC<TaskDetailPaneProps> = ({
  task,
  onClose,
  onUpdateTask,
  onDeleteTask,
  customLists,
  allTags,
  onAddTagGlobal,
}) => {
  if (!task) {
    return (
      <div className="hidden lg:flex w-[380px] xl:w-[420px] flex-shrink-0 flex-col items-center justify-center p-8 text-center text-slate-400 dark:text-zinc-500 border-l border-slate-200/80 dark:border-zinc-800/80 bg-slate-50/30 dark:bg-[#0f1115]">
        <p className="text-xs">Select a task to view details</p>
      </div>
    );
  }

  const [title, setTitle] = useState(task.title);
  const [note, setNote] = useState(task.note || '');
  const [listId, setListId] = useState(task.list_id);
  const [dueDate, setDueDate] = useState(task.due_date || '');
  const [taskTags, setTaskTags] = useState<string[]>(task.tags || []);
  const [steps, setSteps] = useState<Step[]>(task.steps || []);
  const [newSubtaskText, setNewSubtaskText] = useState('');
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [showTagMenu, setShowTagMenu] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');
  const [isSavedRecently, setIsSavedRecently] = useState(false);

  // Sync state whenever selected task changes
  useEffect(() => {
    setTitle(task.title);
    setNote(task.note || '');
    setListId(task.list_id);
    setDueDate(task.due_date || '');
    setTaskTags(task.tags || []);
    setSteps(task.steps || []);
    setIsAddingSubtask(false);
    setShowTagMenu(false);
  }, [task.id]);

  const handleSave = () => {
    const updated: Task = {
      ...task,
      title: title.trim() || task.title,
      note,
      list_id: listId,
      due_date: dueDate || null,
      tags: taskTags,
      steps,
      updated_at: new Date().toISOString(),
    };
    onUpdateTask(updated);
    setIsSavedRecently(true);
    setTimeout(() => setIsSavedRecently(false), 1500);
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskText.trim()) return;
    const newStep: Step = {
      id: 'step-' + Date.now(),
      title: newSubtaskText.trim(),
      completed: false,
    };
    const nextSteps = [...steps, newStep];
    setSteps(nextSteps);
    setNewSubtaskText('');
    setIsAddingSubtask(false);
    onUpdateTask({ ...task, steps: nextSteps });
  };

  const handleToggleStep = (stepId: string) => {
    const nextSteps = steps.map((s) =>
      s.id === stepId ? { ...s, completed: !s.completed } : s
    );
    setSteps(nextSteps);
    onUpdateTask({ ...task, steps: nextSteps });
  };

  const handleDeleteStep = (stepId: string) => {
    const nextSteps = steps.filter((s) => s.id !== stepId);
    setSteps(nextSteps);
    onUpdateTask({ ...task, steps: nextSteps });
  };

  const handleToggleTag = (tag: string) => {
    let nextTags: string[];
    if (taskTags.includes(tag)) {
      nextTags = taskTags.filter((t) => t !== tag);
    } else {
      nextTags = [...taskTags, tag];
    }
    setTaskTags(nextTags);
    onUpdateTask({ ...task, tags: nextTags });
  };

  const handleCreateNewTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagInput.trim()) return;
    const created = newTagInput.trim();
    onAddTagGlobal(created);
    const nextTags = Array.from(new Set([...taskTags, created]));
    setTaskTags(nextTags);
    setNewTagInput('');
    setShowTagMenu(false);
    onUpdateTask({ ...task, tags: nextTags });
  };

  const currentListObj = customLists.find((l) => l.id === listId);
  const completedStepsCount = steps.filter((s) => s.completed).length;

  return (
    <aside
      id="task-detail-pane"
      className="fixed inset-y-0 right-0 z-40 lg:static w-full sm:w-[380px] xl:w-[420px] flex-shrink-0 flex flex-col justify-between h-full bg-white dark:bg-[#0f1115] border-l border-slate-200/80 dark:border-zinc-800/80 shadow-2xl lg:shadow-none"
    >
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto p-5 sm:p-6 space-y-5">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800/60">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onUpdateTask({ ...task, completed: !task.completed })}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                task.completed
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200/70 dark:hover:bg-zinc-700'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{task.completed ? 'Completed' : 'Mark complete'}</span>
            </button>

            <button
              type="button"
              onClick={() => onUpdateTask({ ...task, important: !task.important })}
              className={`p-1.5 rounded-lg transition cursor-pointer border ${
                task.important
                  ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700 text-amber-500'
                  : 'border-transparent text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
              title={task.important ? 'Remove from Important' : 'Mark as Important'}
              aria-label={task.important ? 'Remove from Important' : 'Mark as Important'}
            >
              <Star className={`w-4 h-4 ${task.important ? 'fill-amber-500 text-amber-500' : ''}`} />
            </button>
          </div>

          <div className="flex items-center gap-1">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                title="Close panel"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Task Title (Inline, Editable) */}
        <div>
          <input
            type="text"
            id="task-detail-title-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleSave}
            placeholder="Task title"
            className="w-full text-lg font-bold tracking-tight text-slate-900 dark:text-zinc-100 bg-transparent border-0 focus:outline-none p-0 placeholder-slate-400 dark:placeholder-zinc-600"
          />
        </div>

        {/* 1. Subtasks Checklist Section (Moved to TOP per user request) */}
        <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-zinc-800/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
              <span>Subtasks</span>
              {steps.length > 0 && (
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 tabular-nums font-normal">
                  {completedStepsCount}/{steps.length}
                </span>
              )}
            </span>
            {!isAddingSubtask && (
              <button
                type="button"
                id="detail-add-new-subtask-btn"
                onClick={() => setIsAddingSubtask(true)}
                className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
              >
                <Plus className="w-3 h-3 stroke-[2.5]" />
                <span>Add subtask</span>
              </button>
            )}
          </div>

          {/* Subtasks list */}
          <div className="space-y-1">
            {steps.map((step) => (
              <div
                key={step.id}
                className="group flex items-center justify-between py-1 px-1.5 rounded-lg hover:bg-slate-100/70 dark:hover:bg-zinc-800/50 transition"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => handleToggleStep(step.id)}
                    className={`w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 transition cursor-pointer ${
                      step.completed
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 dark:border-zinc-600 hover:border-slate-500 bg-transparent'
                    }`}
                  >
                    {step.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </button>
                  <span
                    className={`text-xs transition-colors truncate ${
                      step.completed
                        ? 'line-through text-slate-400 dark:text-zinc-500'
                        : 'text-slate-800 dark:text-zinc-200'
                    }`}
                  >
                    {step.title}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteStep(step.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 transition cursor-pointer"
                  title="Delete subtask"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          {/* Add Subtask Button or Form */}
          {isAddingSubtask && (
            <form onSubmit={handleAddSubtask} className="flex items-center gap-1.5 pt-1">
              <input
                type="text"
                placeholder="Subtask title..."
                value={newSubtaskText}
                onChange={(e) => setNewSubtaskText(e.target.value)}
                autoFocus
                className="flex-1 px-2.5 py-1 text-xs rounded-md border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 focus:outline-none"
              />
              <button
                type="submit"
                className="p-1 rounded bg-slate-900 dark:bg-white text-white dark:text-zinc-900 hover:opacity-90 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsAddingSubtask(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>

        {/* 2. Properties Section (Notion/Linear style table rows) */}
        <div className="space-y-2.5 text-xs pt-2 border-t border-slate-100 dark:border-zinc-800/60">
          {/* List Property */}
          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-2 text-slate-400 dark:text-zinc-500 font-medium">
              <ListTodo className="w-3.5 h-3.5" />
              <span>List</span>
            </div>
            <div className="relative">
              <select
                id="task-detail-list-select"
                value={listId}
                onChange={(e) => {
                  setListId(e.target.value);
                  onUpdateTask({ ...task, list_id: e.target.value });
                }}
                className="appearance-none bg-slate-100/70 dark:bg-zinc-900 text-slate-800 dark:text-zinc-200 font-medium pl-3 pr-7 py-1 rounded-md text-xs border border-slate-200 dark:border-zinc-800 focus:outline-none cursor-pointer"
              >
                {customLists.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 text-slate-400 pointer-events-none absolute right-2 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Priority Property */}
          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-2 text-slate-400 dark:text-zinc-500 font-medium">
              <span className="w-3.5 h-3.5 flex items-center justify-center font-bold text-[10px] rounded-full border border-slate-300 dark:border-zinc-700">!</span>
              <span>Priority</span>
            </div>
            <div className="relative">
              <select
                value={task.urgency || 'medium'}
                onChange={(e) => onUpdateTask({ ...task, urgency: e.target.value as any })}
                className="appearance-none bg-slate-100/70 dark:bg-zinc-900 text-slate-800 dark:text-zinc-200 font-medium pl-3 pr-7 py-1 rounded-md text-xs border border-slate-200 dark:border-zinc-800 focus:outline-none cursor-pointer"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
              <ChevronDown className="w-3 h-3 text-slate-400 pointer-events-none absolute right-2 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Due Date Property */}
          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-2 text-slate-400 dark:text-zinc-500 font-medium">
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Due Date</span>
            </div>
            <input
              type="date"
              id="task-detail-due-date-input"
              value={dueDate}
              onChange={(e) => {
                setDueDate(e.target.value);
                onUpdateTask({ ...task, due_date: e.target.value || null });
              }}
              className="bg-slate-100/70 dark:bg-zinc-900 text-slate-800 dark:text-zinc-200 font-medium px-2.5 py-1 rounded-md text-xs border border-slate-200 dark:border-zinc-800 focus:outline-none cursor-pointer"
            />
          </div>

          {/* Tags Property */}
          <div className="flex items-start justify-between py-1">
            <div className="flex items-center gap-2 text-slate-400 dark:text-zinc-500 font-medium pt-1">
              <TagIcon className="w-3.5 h-3.5" />
              <span>Tags</span>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-1 max-w-[200px] relative">
              {taskTags.map((tag) => (
                <span
                  key={tag}
                  onClick={() => handleToggleTag(tag)}
                  className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer select-none"
                  title="Click to remove"
                >
                  #{tag}
                </span>
              ))}

              <div className="relative">
                <button
                  type="button"
                  id="task-detail-add-tag-btn"
                  onClick={() => setShowTagMenu(!showTagMenu)}
                  className="px-2 py-0.5 rounded text-[11px] font-medium text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                >
                  + Add
                </button>

                {showTagMenu && (
                  <div className="absolute right-0 mt-1 w-44 p-2 bg-white dark:bg-zinc-900 rounded-lg shadow-lg border border-slate-200 dark:border-zinc-800 z-30 space-y-2">
                    <div className="text-[10px] font-semibold text-slate-400 uppercase px-1">
                      Tags
                    </div>
                    <div className="space-y-0.5 max-h-32 overflow-y-auto">
                      {allTags.map((t) => {
                        const isSelected = taskTags.includes(t);
                        return (
                          <button
                            key={t}
                            type="button"
                            onClick={() => handleToggleTag(t)}
                            className={`w-full text-left px-2 py-1 rounded text-xs flex items-center justify-between ${
                              isSelected
                                ? 'bg-slate-100 dark:bg-zinc-800 font-medium text-slate-900 dark:text-white'
                                : 'text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800/50'
                            }`}
                          >
                            <span>#{t}</span>
                            {isSelected && <Check className="w-3 h-3 text-slate-900 dark:text-white" />}
                          </button>
                        );
                      })}
                    </div>
                    <form onSubmit={handleCreateNewTag} className="pt-1.5 border-t border-slate-100 dark:border-zinc-800 flex gap-1">
                      <input
                        type="text"
                        placeholder="New tag..."
                        value={newTagInput}
                        onChange={(e) => setNewTagInput(e.target.value)}
                        className="w-full px-2 py-0.5 text-xs bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded text-slate-800 dark:text-zinc-200 focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="px-2 py-0.5 rounded bg-slate-900 dark:bg-white text-white dark:text-zinc-900 font-semibold text-xs cursor-pointer"
                      >
                        Add
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 3. Description / Notes Section */}
        <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-zinc-800/60">
          <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-zinc-500 font-medium">
            <AlignLeft className="w-3.5 h-3.5" />
            <span>Description</span>
          </div>
          <textarea
            id="task-detail-description-input"
            rows={4}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onBlur={handleSave}
            placeholder="Add notes, context, or links..."
            className="w-full p-3 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/40 text-slate-800 dark:text-zinc-200 placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-none focus:border-slate-400 dark:focus-within:border-zinc-600 resize-none leading-relaxed transition"
          />
        </div>
      </div>

      {/* Bottom Footer Actions */}
      <div className="p-4 border-t border-slate-200/80 dark:border-zinc-800/80 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-zinc-900/30">
        <button
          type="button"
          id="task-detail-delete-btn"
          onClick={() => {
            if (confirm(`Delete task "${task.title}"?`)) {
              onDeleteTask(task.id);
            }
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-500 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete</span>
        </button>

        <button
          type="button"
          id="task-detail-save-btn"
          onClick={handleSave}
          className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 text-white dark:bg-white dark:text-zinc-950 hover:bg-slate-800 dark:hover:bg-zinc-100 transition flex items-center gap-1.5 shadow-2xs"
        >
          {isSavedRecently ? (
            <>
              <Check className="w-3 h-3 stroke-[3]" />
              <span>Saved</span>
            </>
          ) : (
            <span>Save</span>
          )}
        </button>
      </div>
    </aside>
  );
};
