import React from 'react';
import { Lightbulb, Plus, X, Calendar, Star, Check } from 'lucide-react';
import { CustomList, Task } from '../types.ts';

interface SuggestionsPaneProps {
  tasks: Task[];
  customLists: CustomList[];
  onAddToMyDay: (taskId: string) => void;
  onClose: () => void;
}

export const SuggestionsPane: React.FC<SuggestionsPaneProps> = ({
  tasks,
  customLists,
  onAddToMyDay,
  onClose,
}) => {
  // Suggest incomplete tasks that are NOT yet in My Day
  const suggestions = tasks
    .filter((t) => !t.completed && !t.my_day)
    .sort((a, b) => {
      // Prioritize overdue/today due dates, then important
      if (a.due_date && !b.due_date) return -1;
      if (!a.due_date && b.due_date) return 1;
      if (a.important && !b.important) return -1;
      if (!a.important && b.important) return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    })
    .slice(0, 10);

  const getListName = (listId: string) => {
    if (listId === 'tasks') return 'Tasks';
    return customLists.find((l) => l.id === listId)?.name || 'List';
  };

  return (
    <aside
      id="suggestions-pane"
      className="w-80 md:w-88 h-full bg-slate-50/95 border-l border-slate-200/90 flex flex-col shadow-xl z-20 transition-all duration-200"
    >
      <div className="p-4 bg-white border-b border-slate-200/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-500 fill-amber-400" />
          <h2 className="font-semibold text-slate-800 text-sm">Suggestions for My Day</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
          title="Close suggestions"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin">
        {suggestions.length > 0 ? (
          suggestions.map((task) => (
            <div
              key={task.id}
              className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between gap-2.5 hover:border-slate-300 transition"
            >
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-800 truncate">{task.title}</p>
                <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-1">
                  <span>{getListName(task.list_id)}</span>
                  {task.due_date && (
                    <span className="flex items-center gap-0.5 text-blue-600 font-medium">
                      <Calendar className="w-3 h-3" />
                      <span>{task.due_date}</span>
                    </span>
                  )}
                  {task.important && (
                    <span className="flex items-center text-amber-500">
                      <Star className="w-3 h-3 fill-amber-400" />
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                id={`add-suggestion-to-my-day-${task.id}`}
                onClick={() => onAddToMyDay(task.id)}
                className="w-7 h-7 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-600 hover:text-white flex items-center justify-center flex-shrink-0 transition font-medium"
                title="Add to My Day"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          ))
        ) : (
          <div className="text-center py-12 px-4">
            <Check className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
            <p className="text-xs font-semibold text-slate-700">All caught up!</p>
            <p className="text-[11px] text-slate-400 mt-1">
              There are no pending tasks to suggest for today. Great job!
            </p>
          </div>
        )}
      </div>
    </aside>
  );
};
