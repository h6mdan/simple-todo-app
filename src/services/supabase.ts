import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { CustomList, Task } from '../types.ts';

/**
 * Sanitizes Supabase URL to ensure it is purely the project origin:
 * e.g., https://kpnpsqkwqvcihnwhbftn.supabase.co
 *
 * If a user accidentally pastes the REST URL (https://.../rest/v1/) or includes
 * trailing slashes/paths, Supabase's Kong gateway returns:
 * "Invalid path specified in request URL".
 * Sanitizing the origin completely resolves this issue.
 */
export function sanitizeSupabaseUrl(rawUrl?: string | null): string {
  if (!rawUrl) return '';
  let clean = rawUrl.trim().replace(/^['"]+|['"]+$/g, '');
  try {
    const parsed = new URL(clean);
    return parsed.origin;
  } catch {
    return clean.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
  }
}

export const getSupabaseConfig = () => {
  const customUrl = typeof window !== 'undefined' ? localStorage.getItem('custom_supabase_url') : null;
  const customKey = typeof window !== 'undefined' ? localStorage.getItem('custom_supabase_anon_key') : null;

  const rawUrl = customUrl || (import.meta.env.VITE_SUPABASE_URL as string) || '';
  const rawKey = customKey || (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '';

  const url = sanitizeSupabaseUrl(rawUrl);
  const key = rawKey.trim().replace(/^['"]+|['"]+$/g, '');

  return { url, key, rawUrl, isCustom: Boolean(customUrl || customKey) };
};

export const saveSupabaseConfig = (url: string, key: string) => {
  if (typeof window !== 'undefined') {
    if (url.trim()) {
      localStorage.setItem('custom_supabase_url', sanitizeSupabaseUrl(url));
    } else {
      localStorage.removeItem('custom_supabase_url');
    }
    if (key.trim()) {
      localStorage.setItem('custom_supabase_anon_key', key.trim());
    } else {
      localStorage.removeItem('custom_supabase_anon_key');
    }
    clientInstance = null;
    currentClientKey = '';
  }
};

export const isSupabaseConfigured = (): boolean => {
  const { url, key } = getSupabaseConfig();
  return Boolean(
    url &&
    key &&
    url.trim() !== '' &&
    key.trim() !== '' &&
    !url.includes('your-project')
  );
};

let clientInstance: SupabaseClient | null = null;
let currentClientKey = '';

export const getSupabaseClient = (): SupabaseClient | null => {
  if (!isSupabaseConfigured()) {
    return null;
  }
  const { url, key } = getSupabaseConfig();
  const configKey = `${url}::${key}`;

  if (!clientInstance || currentClientKey !== configKey) {
    try {
      clientInstance = createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
      currentClientKey = configKey;
    } catch (err) {
      console.error('Failed to initialize Supabase client:', err);
      return null;
    }
  }
  return clientInstance;
};

// Database sync methods
export async function syncTaskToSupabase(task: Task, userId: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase || !userId) return false;

  try {
    const { error } = await supabase.from('tasks').upsert({
      id: task.id,
      user_id: userId,
      list_id: task.list_id,
      title: task.title,
      completed: task.completed,
      important: task.important,
      my_day: task.my_day,
      my_day_date: task.my_day_date || null,
      due_date: task.due_date || null,
      reminder: task.reminder || null,
      repeat: task.repeat || null,
      steps: task.steps,
      note: task.note,
      attachments: task.attachments,
      category: task.category || null,
      assigned_to: task.assigned_to || null,
      assigned_to_email: task.assigned_to_email || null,
      assigned_to_name: task.assigned_to_name || null,
      created_at: task.created_at,
      updated_at: new Date().toISOString(),
    });
    if (error) {
      console.warn('Supabase upsert task warning:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Failed to sync task with Supabase:', err);
    return false;
  }
}

export async function deleteTaskFromSupabase(taskId: string, userId: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase || !userId) return false;

  try {
    const { error } = await supabase.from('tasks').delete().match({ id: taskId, user_id: userId });
    return !error;
  } catch (err) {
    console.warn('Failed to delete task from Supabase:', err);
    return false;
  }
}

export async function syncListToSupabase(list: CustomList, userId: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase || !userId) return false;

  try {
    const { error } = await supabase.from('lists').upsert({
      id: list.id,
      user_id: userId,
      name: list.name,
      icon: list.icon,
      theme: list.theme,
      is_shared: Boolean(list.is_shared),
      owner_email: list.owner_email || null,
      members: list.members || [],
      created_at: list.created_at,
    });
    return !error;
  } catch (err) {
    console.warn('Failed to sync list to Supabase:', err);
    return false;
  }
}

export async function deleteListFromSupabase(listId: string, userId: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase || !userId) return false;

  try {
    // Delete tasks in list first
    await supabase.from('tasks').delete().match({ list_id: listId, user_id: userId });
    const { error } = await supabase.from('lists').delete().match({ id: listId, user_id: userId });
    return !error;
  } catch (err) {
    console.warn('Failed to delete list from Supabase:', err);
    return false;
  }
}

export async function fetchUserTasks(userId: string): Promise<Task[] | null> {
  const supabase = getSupabaseClient();
  if (!supabase || !userId) return null;

  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Failed to load user tasks from Supabase:', error.message);
      return null;
    }

    return (data || []).map((row) => ({
      id: row.id,
      user_id: row.user_id,
      title: row.title,
      completed: Boolean(row.completed),
      important: Boolean(row.important),
      my_day: Boolean(row.my_day),
      my_day_date: row.my_day_date,
      due_date: row.due_date,
      reminder: row.reminder,
      repeat: row.repeat,
      steps: Array.isArray(row.steps) ? row.steps : [],
      note: row.note || '',
      attachments: Array.isArray(row.attachments) ? row.attachments : [],
      category: row.category,
      list_id: row.list_id || 'tasks',
      assigned_to: row.assigned_to,
      assigned_to_email: row.assigned_to_email,
      assigned_to_name: row.assigned_to_name,
      created_at: row.created_at || new Date().toISOString(),
      updated_at: row.updated_at,
    }));
  } catch (err) {
    console.warn('Error fetching tasks from Supabase:', err);
    return null;
  }
}

export async function fetchUserLists(userId: string): Promise<CustomList[] | null> {
  const supabase = getSupabaseClient();
  if (!supabase || !userId) return null;

  try {
    const { data, error } = await supabase
      .from('lists')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.warn('Failed to load user lists from Supabase:', error.message);
      return null;
    }

    return (data || []).map((row) => ({
      id: row.id,
      user_id: row.user_id,
      name: row.name,
      icon: row.icon || 'List',
      theme: row.theme || 'blue',
      is_shared: Boolean(row.is_shared),
      owner_email: row.owner_email,
      members: Array.isArray(row.members) ? row.members : [],
      created_at: row.created_at || new Date().toISOString(),
    }));
  } catch (err) {
    console.warn('Error fetching lists from Supabase:', err);
    return null;
  }
}
