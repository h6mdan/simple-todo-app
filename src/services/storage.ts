import { Collaborator, CustomList, Task } from '../types.ts';

const TASKS_STORAGE_KEY = 'ms_todo_tasks_v4';
const LISTS_STORAGE_KEY = 'ms_todo_lists_v4';
const TEAM_STORAGE_KEY = 'ms_todo_team_members_v2';
const TAGS_STORAGE_KEY = 'ms_todo_tags_v1';

// Helper to get formatted date string YYYY-MM-DD
export function getIsoDateOffset(daysOffset = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split('T')[0];
}

export function getTodayDateString(): string {
  return getIsoDateOffset(0);
}

export function getTomorrowDateString(): string {
  return getIsoDateOffset(1);
}

export function getNextWeekDateString(): string {
  return getIsoDateOffset(7);
}

export const DEFAULT_TAGS: string[] = ['Tag 1', 'Tag 2'];

export const DEFAULT_TEAM_MEMBERS: Collaborator[] = [
  {
    id: 'member-aya',
    email: 'AyaHamdan7789@gmail.com',
    name: 'Aya Hamdan',
    role: 'owner',
    joined_at: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
  {
    id: 'member-alex',
    email: 'alex.rivera@workspace.io',
    name: 'Alex Rivera',
    role: 'member',
    joined_at: new Date(Date.now() - 86400000 * 14).toISOString(),
  },
];

export const INITIAL_LISTS: CustomList[] = [
  {
    id: 'list-personal',
    name: 'Personal',
    icon: 'List',
    theme: 'coral',
    color: '#f87171',
    is_shared: false,
    members: [],
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'list-work',
    name: 'Work',
    icon: 'Briefcase',
    theme: 'blue',
    color: '#38bdf8',
    is_shared: true,
    owner_email: 'AyaHamdan7789@gmail.com',
    members: DEFAULT_TEAM_MEMBERS,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'list-1',
    name: 'List 1',
    icon: 'List',
    theme: 'mountain',
    color: '#ffd043',
    is_shared: false,
    members: [],
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-photo-1',
    title: 'I want to finish the home work',
    completed: true,
    important: false,
    my_day: false,
    due_date: null,
    steps: [],
    note: '',
    attachments: [],
    list_id: 'list-work',
    urgency: 'low',
    created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
  {
    id: 'task-photo-2',
    title: 'GO GYM AT 5:45',
    completed: true,
    important: false,
    my_day: false,
    due_date: null,
    steps: [],
    note: 'Leg day and 20 mins cardio warmup.',
    attachments: [],
    list_id: 'list-work',
    urgency: 'medium',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'task-1',
    title: 'Research content ideas',
    completed: false,
    important: false,
    my_day: true,
    my_day_date: getTodayDateString(),
    due_date: getTodayDateString(),
    steps: [],
    note: 'Explore tech trends and design inspiration for next quarter.',
    attachments: [],
    list_id: 'list-work',
    tags: ['Tag 1'],
    urgency: 'medium',
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'task-2',
    title: 'Create a database of guest authors',
    completed: false,
    important: true,
    my_day: true,
    my_day_date: getTodayDateString(),
    due_date: getTodayDateString(),
    steps: [],
    note: 'Compile contact emails and writing samples for outreach.',
    attachments: [],
    list_id: 'list-work',
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'task-3',
    title: "Renew driver's license",
    completed: false,
    important: false,
    my_day: true,
    my_day_date: getTodayDateString(),
    due_date: getIsoDateOffset(2),
    steps: [
      { id: 's3-1', title: 'Check appointment confirmation and photo id', completed: false },
    ],
    note: 'Visit the local DMV office before 2 PM. Remember proof of residency.',
    attachments: [],
    list_id: 'list-personal',
    tags: ['Tag 1'],
    created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: 'task-4',
    title: 'Consult accountant',
    completed: false,
    important: true,
    my_day: true,
    my_day_date: getTodayDateString(),
    due_date: getIsoDateOffset(1),
    steps: [
      { id: 's4-1', title: 'Prepare income and expense sheets', completed: true },
      { id: 's4-2', title: 'Review tax deduction categories', completed: false },
      { id: 's4-3', title: 'Sign and submit quarterly declaration', completed: false },
    ],
    note: 'Discuss business write-offs and upcoming equipment depreciation.',
    attachments: [],
    list_id: 'list-1',
    tags: ['Tag 2'],
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'task-5',
    title: 'Print business card',
    completed: false,
    important: false,
    my_day: true,
    my_day_date: getTodayDateString(),
    due_date: getIsoDateOffset(4),
    steps: [],
    note: 'Order 250 matte finish cards with updated logo.',
    attachments: [],
    list_id: 'list-personal',
    created_at: new Date(Date.now() - 3600000 * 1).toISOString(),
  },
  {
    id: 'task-6',
    title: 'Prepare quarterly financial forecast',
    completed: false,
    important: true,
    my_day: false,
    due_date: getIsoDateOffset(3),
    steps: [],
    note: '',
    attachments: [],
    list_id: 'list-work',
    tags: ['Tag 1'],
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'task-7',
    title: 'Schedule car maintenance check',
    completed: false,
    important: false,
    my_day: false,
    due_date: getIsoDateOffset(5),
    steps: [],
    note: 'Brake inspection and oil filter replacement.',
    attachments: [],
    list_id: 'list-personal',
    tags: ['Tag 2'],
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

export function loadStoredTags(): string[] {
  try {
    const raw = localStorage.getItem(TAGS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(TAGS_STORAGE_KEY, JSON.stringify(DEFAULT_TAGS));
      return DEFAULT_TAGS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_TAGS;
  } catch {
    return DEFAULT_TAGS;
  }
}

export function saveStoredTags(tags: string[]): void {
  try {
    localStorage.setItem(TAGS_STORAGE_KEY, JSON.stringify(tags));
  } catch (err) {
    console.error('Failed to save tags:', err);
  }
}

export function loadStoredTasks(): Task[] {
  try {
    const raw = localStorage.getItem(TASKS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(INITIAL_TASKS));
      return INITIAL_TASKS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_TASKS;
  } catch (err) {
    console.error('Failed to parse stored tasks:', err);
    return INITIAL_TASKS;
  }
}

export function saveStoredTasks(tasks: Task[]) {
  try {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  } catch (err) {
    console.error('Failed to save tasks to localStorage:', err);
  }
}

export function loadStoredLists(): CustomList[] {
  try {
    const raw = localStorage.getItem(LISTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LISTS_STORAGE_KEY, JSON.stringify(INITIAL_LISTS));
      return INITIAL_LISTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_LISTS;
  } catch (err) {
    console.error('Failed to parse stored lists:', err);
    return INITIAL_LISTS;
  }
}

export function saveStoredLists(lists: CustomList[]) {
  try {
    localStorage.setItem(LISTS_STORAGE_KEY, JSON.stringify(lists));
  } catch (err) {
    console.error('Failed to save lists to localStorage:', err);
  }
}

export function loadStoredTeamMembers(): Collaborator[] {
  try {
    const raw = localStorage.getItem(TEAM_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(DEFAULT_TEAM_MEMBERS));
      return DEFAULT_TEAM_MEMBERS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_TEAM_MEMBERS;
  } catch (err) {
    console.error('Failed to load team members:', err);
    return DEFAULT_TEAM_MEMBERS;
  }
}

export function saveStoredTeamMembers(members: Collaborator[]) {
  try {
    localStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(members));
  } catch (err) {
    console.error('Failed to save team members:', err);
  }
}
