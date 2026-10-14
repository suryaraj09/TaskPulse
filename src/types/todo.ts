export type PriorityLevel = 'p1_urgent' | 'p2_high' | 'p3_medium' | 'p4_low';

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'completed';

export type ViewMode = 'list' | 'kanban';

export type SortField = 'dueDate' | 'priority' | 'createdAt' | 'title';
export type SortOrder = 'asc' | 'desc';

export interface Category {
  id: string;
  name: string;
  color: string; // hex color
  bgClass: string;
  textClass: string;
  borderClass: string;
}

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  categoryId: string;
  priority: PriorityLevel;
  status: TaskStatus;
  dueDate?: string; // ISO 8601 string
  reminderTime?: string; // ISO 8601 string
  reminderOffsetMinutes?: number; // offset before dueDate in minutes
  reminderTriggered?: boolean;
  createdAt: string;
  completedAt?: string;
}

export interface PriorityConfig {
  level: PriorityLevel;
  code: string;
  label: string;
  color: string;
  textColor: string;
  bgColor: string;
  borderColor: string;
  weight: number;
}

export const PRIORITY_CONFIGS: Record<PriorityLevel, PriorityConfig> = {
  p1_urgent: {
    level: 'p1_urgent',
    code: 'P1',
    label: 'Urgent',
    color: '#F43F5E',
    textColor: 'text-rose-400',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/30',
    weight: 4,
  },
  p2_high: {
    level: 'p2_high',
    code: 'P2',
    label: 'High',
    color: '#F59E0B',
    textColor: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    weight: 3,
  },
  p3_medium: {
    level: 'p3_medium',
    code: 'P3',
    label: 'Medium',
    color: '#6366F1',
    textColor: 'text-indigo-400',
    bgColor: 'bg-indigo-500/10',
    borderColor: 'border-indigo-500/30',
    weight: 2,
  },
  p4_low: {
    level: 'p4_low',
    code: 'P4',
    label: 'Low',
    color: '#94A3B8',
    textColor: 'text-slate-400',
    bgColor: 'bg-slate-500/10',
    borderColor: 'border-slate-500/30',
    weight: 1,
  },
};

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'cat-work',
    name: 'Work & Projects',
    color: '#6366F1',
    bgClass: 'bg-indigo-500/15',
    textClass: 'text-indigo-400',
    borderClass: 'border-indigo-500/30',
  },
  {
    id: 'cat-personal',
    name: 'Personal Life',
    color: '#10B981',
    bgClass: 'bg-emerald-500/15',
    textClass: 'text-emerald-400',
    borderClass: 'border-emerald-500/30',
  },
  {
    id: 'cat-urgent',
    name: 'Critical Action',
    color: '#F43F5E',
    bgClass: 'bg-rose-500/15',
    textClass: 'text-rose-400',
    borderClass: 'border-rose-500/30',
  },
  {
    id: 'cat-learning',
    name: 'Study & Skills',
    color: '#8B5CF6',
    bgClass: 'bg-purple-500/15',
    textClass: 'text-purple-400',
    borderClass: 'border-purple-500/30',
  },
  {
    id: 'cat-health',
    name: 'Health & Fitness',
    color: '#06B6D4',
    bgClass: 'bg-cyan-500/15',
    textClass: 'text-cyan-400',
    borderClass: 'border-cyan-500/30',
  },
];

export const STATUS_COLUMNS: { id: TaskStatus; title: string; color: string }[] = [
  { id: 'todo', title: 'To Do', color: '#94A3B8' },
  { id: 'in_progress', title: 'In Progress', color: '#F59E0B' },
  { id: 'review', title: 'In Review', color: '#8B5CF6' },
  { id: 'completed', title: 'Completed', color: '#10B981' },
];
