import React, { useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { 
  Collaborator,
  CustomList, 
  Task, 
  UrgencyLevel,
  UserProfile 
} from './types.ts';
import { 
  loadStoredLists, 
  loadStoredTasks, 
  loadStoredTeamMembers,
  loadStoredTags,
  saveStoredLists, 
  saveStoredTasks, 
  saveStoredTeamMembers,
  saveStoredTags,
  getTodayDateString 
} from './services/storage.ts';
import { playCompletionChime } from './services/sound.ts';
import { 
  getSupabaseClient, 
  syncTaskToSupabase, 
  deleteTaskFromSupabase, 
  syncListToSupabase, 
  deleteListFromSupabase, 
  fetchUserTasks, 
  fetchUserLists 
} from './services/supabase.ts';
import { TopNav } from './components/TopNav.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { TaskList } from './components/TaskList.tsx';
import { TaskDetailPane } from './components/TaskDetailPane.tsx';
import { CalendarView } from './components/CalendarView.tsx';
import { StickyWallView } from './components/StickyWallView.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { AuthScreen } from './components/AuthScreen.tsx';
import { ShareListModal } from './components/ShareListModal.tsx';
import { CreateTaskModal } from './components/CreateTaskModal.tsx';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(() => loadStoredTasks());
  const [lists, setLists] = useState<CustomList[]>(() => loadStoredLists());
  const [tags, setTags] = useState<string[]>(() => loadStoredTags());
  const [workspaceMembers, setWorkspaceMembers] = useState<Collaborator[]>(() => loadStoredTeamMembers());

  // Views & Filters matching user photo:
  // currentView: 'all' | 'today' | 'upcoming' | 'important' | 'completed' | 'calendar' | 'sticky-wall' | listId
  const [currentView, setCurrentView] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<UrgencyLevel | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(() => {
    const loaded = loadStoredTasks();
    return loaded[0]?.id || null;
  });

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Dark Mode state: defaults to false (Light Mode) per user request
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('todo_dark_mode') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('todo_dark_mode', String(isDarkMode));
    } catch {
      // ignore
    }
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      document.body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      document.body.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleToggleDarkMode = useCallback(() => {
    setIsDarkMode((prev) => !prev);
  }, []);

  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem('ms_todo_user_profile');
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return null;
  });

  const handleSignOut = useCallback(async () => {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error('Error signing out:', err);
      }
    }
    try {
      localStorage.removeItem('ms_todo_user_profile');
    } catch {
      // ignore
    }
    setUser(null);
  }, []);

  const handleUserChange = useCallback((newUser: UserProfile | null) => {
    setUser(newUser);
    try {
      if (newUser) {
        localStorage.setItem('ms_todo_user_profile', JSON.stringify(newUser));
      } else {
        localStorage.removeItem('ms_todo_user_profile');
      }
    } catch {
      // ignore
    }
  }, []);

  // Local storage auto-persistence
  useEffect(() => {
    saveStoredTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    saveStoredLists(lists);
  }, [lists]);

  useEffect(() => {
    saveStoredTags(tags);
  }, [tags]);

  useEffect(() => {
    saveStoredTeamMembers(workspaceMembers);
  }, [workspaceMembers]);

  // Supabase Auth listener & remote sync
  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0],
        });
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0],
        });
      } else {
        setUser(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Fetch from Supabase when user logs in
  useEffect(() => {
    if (!user) return;

    const loadRemoteData = async () => {
      try {
        const [remoteLists, remoteTasks] = await Promise.all([
          fetchUserLists(user.id),
          fetchUserTasks(user.id),
        ]);
        if (remoteLists && remoteLists.length > 0) {
          setLists(remoteLists);
        }
        if (remoteTasks && remoteTasks.length > 0) {
          setTasks(remoteTasks);
        }
      } catch (err) {
        console.error('Failed to sync remote data:', err);
      }
    };

    loadRemoteData();
  }, [user]);

  // Filter tasks based on view, category, priority, and search
  const currentViewTasks = useMemo(() => {
    const todayStr = getTodayDateString();

    return tasks.filter((task) => {
      // 1. Search Query Filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = task.title.toLowerCase().includes(query);
        const matchNote = (task.note || '').toLowerCase().includes(query);
        const matchSteps = task.steps?.some((s) => s.title.toLowerCase().includes(query));
        if (!matchTitle && !matchNote && !matchSteps) return false;
      }

      // 2. Priority Filter
      if (priorityFilter !== 'all') {
        const taskUrgency = task.urgency || 'medium';
        if (taskUrgency !== priorityFilter) return false;
      }

      // 3. Category Filter
      if (selectedCategory !== 'all') {
        if (task.list_id !== selectedCategory) return false;
      }

      // 4. View Filter
      if (currentView === 'today') {
        return task.my_day || task.due_date === todayStr;
      }
      if (currentView === 'upcoming') {
        return Boolean(task.due_date && task.due_date > todayStr);
      }
      if (currentView === 'important') {
        return task.important;
      }
      if (currentView === 'completed') {
        return task.completed;
      }
      if (currentView === 'calendar' || currentView === 'sticky-wall') {
        return true;
      }
      if (currentView === 'all') {
        return true;
      }

      // Custom list direct selection
      return task.list_id === currentView;
    });
  }, [tasks, currentView, selectedCategory, priorityFilter, searchQuery]);

  // Selected task instance
  const selectedTask = useMemo(() => {
    if (!selectedTaskId) return null;
    return tasks.find((t) => t.id === selectedTaskId) || null;
  }, [tasks, selectedTaskId]);

  // Counts for sidebar badges
  const counts = useMemo(() => {
    const todayStr = getTodayDateString();
    const allCount = tasks.length;
    const todayCount = tasks.filter((t) => !t.completed && (t.my_day || t.due_date === todayStr)).length;
    const upcomingCount = tasks.filter((t) => !t.completed && t.due_date && t.due_date > todayStr).length;
    const importantCount = tasks.filter((t) => !t.completed && t.important).length;
    const completedCount = tasks.filter((t) => t.completed).length;

    const catCounts: Record<string, number> = {};
    lists.forEach((l) => {
      catCounts[l.id] = tasks.filter((t) => t.list_id === l.id).length;
    });

    return {
      all: allCount,
      today: todayCount,
      upcoming: upcomingCount,
      important: importantCount,
      completed: completedCount,
      total: allCount,
      categories: catCounts,
    };
  }, [tasks, lists]);

  // Title for center view
  const currentViewTitle = useMemo(() => {
    if (selectedCategory !== 'all') {
      const cat = lists.find((l) => l.id === selectedCategory);
      if (cat) return cat.name;
    }
    switch (currentView) {
      case 'all': return 'All Tasks';
      case 'today': return 'Today';
      case 'upcoming': return 'Upcoming';
      case 'important': return 'Important';
      case 'completed': return 'Completed';
      case 'calendar': return 'Calendar';
      case 'sticky-wall': return 'Sticky Wall';
      default: {
        const found = lists.find((l) => l.id === currentView);
        return found ? found.name : 'Tasks';
      }
    }
  }, [currentView, selectedCategory, lists]);

  // Add Task
  const handleQuickAddTask = useCallback((title: string, priority?: UrgencyLevel, isImportant?: boolean) => {
    const isToday = currentView === 'today';
    const targetListId = selectedCategory !== 'all' 
      ? selectedCategory 
      : (lists[0]?.id || 'list-work');

    const newTask: Task = {
      id: 'task-' + Date.now(),
      title,
      completed: false,
      important: isImportant || currentView === 'important',
      my_day: isToday,
      my_day_date: isToday ? getTodayDateString() : null,
      due_date: isToday ? getTodayDateString() : null,
      steps: [],
      note: '',
      attachments: [],
      list_id: targetListId,
      urgency: priority || 'medium',
      created_at: new Date().toISOString(),
    };

    setTasks((prev) => [newTask, ...prev]);
    setSelectedTaskId(newTask.id);

    if (user) {
      syncTaskToSupabase(newTask, user.id);
    }
  }, [currentView, selectedCategory, lists, user]);

  const handleAddTaskOnDate = useCallback((title: string, dateStr: string) => {
    const newTask: Task = {
      id: 'task-' + Date.now(),
      title,
      completed: false,
      important: false,
      my_day: dateStr === getTodayDateString(),
      my_day_date: dateStr === getTodayDateString() ? dateStr : null,
      due_date: dateStr,
      steps: [],
      note: '',
      attachments: [],
      list_id: lists[0]?.id || 'list-work',
      urgency: 'medium',
      created_at: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
    setSelectedTaskId(newTask.id);
    if (user) {
      syncTaskToSupabase(newTask, user.id);
    }
  }, [lists, user]);

  const handleUpdateTask = useCallback((updated: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    if (user) {
      syncTaskToSupabase(updated, user.id);
    }
  }, [user]);

  const handleDeleteTask = useCallback((taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    if (selectedTaskId === taskId) {
      setSelectedTaskId(null);
    }
    if (user) {
      deleteTaskFromSupabase(taskId, user.id);
    }
  }, [selectedTaskId, user]);

  const handleToggleComplete = useCallback((task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextCompleted = !task.completed;

    if (nextCompleted) {
      playCompletionChime();
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.8 },
      });
    }

    const updated: Task = {
      ...task,
      completed: nextCompleted,
      updated_at: new Date().toISOString(),
    };

    setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
    if (user) {
      syncTaskToSupabase(updated, user.id);
    }
  }, [user]);

  const handleToggleImportant = useCallback((task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated: Task = {
      ...task,
      important: !task.important,
      updated_at: new Date().toISOString(),
    };
    setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
    if (user) {
      syncTaskToSupabase(updated, user.id);
    }
  }, [user]);

  const handleChangePriority = useCallback((task: Task, newPriority: UrgencyLevel) => {
    const updated: Task = {
      ...task,
      urgency: newPriority,
      updated_at: new Date().toISOString(),
    };
    setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
    if (user) {
      syncTaskToSupabase(updated, user.id);
    }
  }, [user]);

  const handleClearAllTasks = useCallback(() => {
    if (tasks.length === 0) return;
    if (confirm('Are you sure you want to clear all tasks? This action cannot be undone.')) {
      setTasks([]);
      setSelectedTaskId(null);
    }
  }, [tasks]);

  // List Management
  const handleCreateList = useCallback((name: string, color: string) => {
    const newList: CustomList = {
      id: 'list-' + Date.now(),
      name,
      icon: 'List',
      theme: 'blue',
      color,
      is_shared: false,
      members: [],
      created_at: new Date().toISOString(),
    };
    setLists((prev) => [...prev, newList]);
    setSelectedCategory(newList.id);
    if (user) {
      syncListToSupabase(newList, user.id);
    }
  }, [user]);

  const handleDeleteList = useCallback((listId: string) => {
    setLists((prev) => prev.filter((l) => l.id !== listId));
    if (selectedCategory === listId) {
      setSelectedCategory('all');
    }
    if (user) {
      deleteListFromSupabase(listId, user.id);
    }
  }, [selectedCategory, user]);

  const handleAddTag = useCallback((newTag: string) => {
    if (!tags.includes(newTag)) {
      setTags((prev) => [...prev, newTag]);
    }
  }, [tags]);

  // Prompt unauthenticated users to log in to use the app
  if (!user) {
    return (
      <AuthScreen
        onSuccessLogin={(loggedInUser) => {
          handleUserChange(loggedInUser);
        }}
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
      />
    );
  }

  return (
    <div
      id="app-root-container"
      className={`h-screen w-screen overflow-hidden flex flex-col bg-[#f5f6f8] dark:bg-[#0c0e12] text-slate-900 dark:text-zinc-100 antialiased ${isDarkMode ? 'dark' : ''}`}
    >
      {/* 1. Full-Width Top Bar (Matching Photo) */}
      <TopNav
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
        user={user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onSignOut={handleSignOut}
        onQuickNewTask={() => setIsCreateModalOpen(true)}
        onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
      />

      {/* 2. Main Work Area: Sidebar + Center Task View + Inspector */}
      <div className="flex-1 flex flex-row overflow-hidden min-h-0">
        {/* Left Navigation Sidebar */}
        <Sidebar
          currentView={currentView}
          onSelectView={(viewId) => {
            setCurrentView(viewId);
            setSelectedCategory('all');
          }}
          selectedCategory={selectedCategory}
          onSelectCategory={(catId) => {
            setSelectedCategory(catId);
          }}
          priorityFilter={priorityFilter}
          onSelectPriority={setPriorityFilter}
          lists={lists}
          onCreateList={handleCreateList}
          onDeleteList={handleDeleteList}
          counts={counts}
          onClearAllTasks={handleClearAllTasks}
          isDarkMode={isDarkMode}
          onToggleDarkMode={handleToggleDarkMode}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Center View: Task List / Calendar / Sticky Wall */}
        <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden bg-[#f5f6f8] dark:bg-[#0c0e12]">
          {currentView === 'calendar' ? (
            <CalendarView
              tasks={tasks}
              customLists={lists}
              onSelectTask={(task) => setSelectedTaskId(task.id)}
              onAddTaskOnDate={handleAddTaskOnDate}
            />
          ) : currentView === 'sticky-wall' ? (
            <StickyWallView
              tasks={tasks}
              customLists={lists}
              onSelectTask={(task) => setSelectedTaskId(task.id)}
              onToggleComplete={handleToggleComplete}
              onDeleteTask={handleDeleteTask}
              onQuickAdd={(title) => handleQuickAddTask(title)}
            />
          ) : (
            <TaskList
              title={currentViewTitle}
              tasks={currentViewTasks}
              customLists={lists}
              selectedTaskId={selectedTaskId}
              onSelectTask={(task) => setSelectedTaskId(task.id)}
              onToggleComplete={handleToggleComplete}
              onToggleImportant={handleToggleImportant}
              onChangePriority={handleChangePriority}
              onDeleteTask={handleDeleteTask}
              onQuickAddTask={handleQuickAddTask}
            />
          )}
        </div>

        {/* Right Column: Task Detail & Inspector Pane */}
        {currentView !== 'calendar' && currentView !== 'sticky-wall' && selectedTask && (
          <TaskDetailPane
            task={selectedTask}
            onClose={() => setSelectedTaskId(null)}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
            customLists={lists}
            allTags={tags}
            onAddTagGlobal={handleAddTag}
          />
        )}
      </div>

      {/* Account Settings / Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        user={user}
        onUserChange={handleUserChange}
        onSignOut={handleSignOut}
      />

      {/* Share List Modal */}
      <ShareListModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        list={lists.find((l) => l.id === selectedCategory) || lists[0] || null}
        workspaceMembers={workspaceMembers}
        currentUserEmail={user?.email}
        onUpdateListMembers={(listId, members, isShared) => {
          setLists((prev) =>
            prev.map((l) => (l.id === listId ? { ...l, members, is_shared: isShared } : l))
          );
        }}
      />

      {/* Quick Create & Categorize Task Modal */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        categories={lists}
        defaultCategory={selectedCategory !== 'all' ? selectedCategory : lists[0]?.id}
        onCreateTask={({ title, listId, priority, dueDate, isImportant, note }) => {
          const isToday = dueDate === getTodayDateString() || currentView === 'today';
          const newTask: Task = {
            id: 'task-' + Date.now(),
            title,
            completed: false,
            important: isImportant,
            my_day: isToday,
            my_day_date: isToday ? getTodayDateString() : null,
            due_date: dueDate,
            steps: [],
            note: note || '',
            attachments: [],
            list_id: listId,
            urgency: priority,
            created_at: new Date().toISOString(),
          };
          setTasks((prev) => [newTask, ...prev]);
          setSelectedTaskId(newTask.id);
          if (user) {
            syncTaskToSupabase(newTask, user.id);
          }
        }}
      />
    </div>
  );
}
