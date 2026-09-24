export type SmartListId = 'my-day' | 'important' | 'planned' | 'assigned-to-me' | 'tasks';

export type ListThemeId = 
  | 'blue' 
  | 'mountain' 
  | 'sunset' 
  | 'forest' 
  | 'purple' 
  | 'dusk' 
  | 'coral' 
  | 'slate';

export interface Step {
  id: string;
  title: string;
  completed: boolean;
}

export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  dataUrl?: string;
  created_at: string;
}

export type RepeatInterval = 'daily' | 'weekdays' | 'weekly' | 'monthly' | 'yearly';

export type UrgencyLevel = 'urgent' | 'high' | 'medium' | 'low';

export type CategoryTag = 'Blue' | 'Green' | 'Orange' | 'Purple' | 'Red' | 'Yellow';

export interface Collaborator {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  role: 'owner' | 'member';
  joined_at?: string;
}

export interface Task {
  id: string;
  user_id?: string;
  title: string;
  completed: boolean;
  important: boolean;
  my_day: boolean;
  my_day_date?: string | null;
  due_date?: string | null; // ISO YYYY-MM-DD
  reminder?: string | null; // ISO Date string
  repeat?: RepeatInterval | null;
  steps: Step[];
  note: string;
  attachments: Attachment[];
  category?: CategoryTag | null;
  tags?: string[];
  urgency?: UrgencyLevel | null;
  list_id: string; // 'tasks' or custom list UUID
  assigned_to?: string | null; // Collaborator ID or email
  assigned_to_name?: string | null;
  assigned_to_email?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface CustomList {
  id: string;
  user_id?: string;
  owner_email?: string;
  name: string;
  icon: string;
  theme: ListThemeId;
  color?: string;
  is_shared?: boolean;
  members?: Collaborator[];
  created_at: string;
}

export type SortOption = 
  | 'default'
  | 'urgency'
  | 'importance'
  | 'due_date'
  | 'completed'
  | 'alphabetical'
  | 'created_at';

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  team_members?: Collaborator[];
}
