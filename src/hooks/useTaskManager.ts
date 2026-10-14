import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  TaskItem,
  Category,
  PriorityLevel,
  TaskStatus,
  ViewMode,
  SortField,
  SortOrder,
  DEFAULT_CATEGORIES,
  PRIORITY_CONFIGS,
} from '../types/todo';
import { notificationService } from '../services/notificationService';
import { soundEffects } from '../services/soundEffects';

const TASKS_STORAGE_KEY = 'taskpulse_tasks_v2';
const CATEGORIES_STORAGE_KEY = 'taskpulse_categories_v2';
const VIEW_STORAGE_KEY = 'taskpulse_view_mode';

// Generate sensible default sample tasks with dates relative to now
const generateInitialTasks = (): TaskItem[] => {
  const now = new Date();
  
  const in30Min = new Date(now.getTime() + 30 * 60 * 1000).toISOString();
  const in2Hours = new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString();
  const in1Day = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
  const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

  return [
    {
      id: 'task-1',
      title: 'Review production deployment checklist & cloud monitoring',
      description: 'Audit database replication status, error logs, and verify SSL certificates for the upcoming release.',
      categoryId: 'cat-work',
      priority: 'p1_urgent',
      status: 'in_progress',
      dueDate: in2Hours,
      reminderTime: in30Min,
      reminderOffsetMinutes: 90,
      reminderTriggered: false,
      createdAt: now.toISOString(),
    },
    {
      id: 'task-2',
      title: 'Submit quarterly budget proposal & resource estimates',
      description: 'Consolidate tool licenses, team hardware requests, and infrastructure cost forecasts.',
      categoryId: 'cat-work',
      priority: 'p2_high',
      status: 'todo',
      dueDate: in1Day,
      reminderTime: in1Day,
      reminderOffsetMinutes: 0,
      reminderTriggered: false,
      createdAt: now.toISOString(),
    },
    {
      id: 'task-3',
      title: 'Renew passport and schedule international visa biometric',
      description: 'Upload certified document scans and confirm appointment time slot.',
      categoryId: 'cat-personal',
      priority: 'p2_high',
      status: 'todo',
      dueDate: in3Days,
      reminderTime: in3Days,
      reminderOffsetMinutes: 0,
      reminderTriggered: false,
      createdAt: now.toISOString(),
    },
    {
      id: 'task-4',
      title: 'Complete TypeScript 5.8 generics and compiler architecture workshop',
      description: 'Build sample type-safe schema validators and review covariance/contravariance rules.',
      categoryId: 'cat-learning',
      priority: 'p3_medium',
      status: 'review',
      dueDate: in3Days,
      createdAt: now.toISOString(),
    },
    {
      id: 'task-5',
      title: 'Morning 5K run and mobility stretches',
      description: 'Interval sprints at the athletic park followed by foam rolling recovery.',
      categoryId: 'cat-health',
      priority: 'p4_low',
      status: 'completed',
      dueDate: yesterday,
      completedAt: now.toISOString(),
      createdAt: yesterday,
    },
  ];
};

export function useTaskManager() {
  // 1. Categories State
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const stored = localStorage.getItem(CATEGORIES_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // fallback
    }
    return DEFAULT_CATEGORIES;
  });

  // 2. Tasks State
  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    try {
      const stored = localStorage.getItem(TASKS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // fallback
    }
    return generateInitialTasks();
  });

  // 3. UI View & Filters
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    try {
      const stored = localStorage.getItem(VIEW_STORAGE_KEY);
      if (stored === 'list' || stored === 'kanban') return stored;
    } catch {
      // fallback
    }
    return 'list';
  });

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<PriorityLevel | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'due_today' | 'overdue'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortField, setSortField] = useState<SortField>('dueDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Persistence Effects
  useEffect(() => {
    try {
      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
    } catch (err) {
      console.error('Failed to save categories to localStorage', err);
    }
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    } catch (err) {
      console.error('Failed to save tasks to localStorage', err);
    }
  }, [tasks]);

  useEffect(() => {
    try {
      localStorage.setItem(VIEW_STORAGE_KEY, viewMode);
    } catch (err) {
      console.error('Failed to save view mode to localStorage', err);
    }
  }, [viewMode]);

  // 4. Background Reminder Checker
  // Runs every 5 seconds to accurately catch reminder triggers
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date().getTime();

      setTasks((prevTasks) => {
        let hasChanges = false;
        const updated = prevTasks.map((task) => {
          if (
            task.status !== 'completed' &&
            task.reminderTime &&
            !task.reminderTriggered
          ) {
            const reminderTimestamp = new Date(task.reminderTime).getTime();
            // Trigger if within 30 seconds or passed in the past 10 minutes
            if (reminderTimestamp <= now && reminderTimestamp >= now - 10 * 60 * 1000) {
              const category = categories.find((c) => c.id === task.categoryId);
              notificationService.triggerTaskReminder(task, category);
              hasChanges = true;
              return { ...task, reminderTriggered: true };
            }
          }
          return task;
        });

        return hasChanges ? updated : prevTasks;
      });
    };

    checkReminders();
    const interval = setInterval(checkReminders, 5000);
    return () => clearInterval(interval);
  }, [categories]);

  // Task Mutations
  const createTask = useCallback((taskData: Omit<TaskItem, 'id' | 'createdAt' | 'reminderTriggered'>) => {
    const newTask: TaskItem = {
      ...taskData,
      id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toISOString(),
      reminderTriggered: false,
    };
    setTasks((prev) => [newTask, ...prev]);
    soundEffects.playTactileClick();
    return newTask;
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<TaskItem>) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          // If reminderTime updated, re-arm reminderTriggered
          const updated = { ...t, ...updates };
          if (updates.reminderTime && updates.reminderTime !== t.reminderTime) {
            updated.reminderTriggered = false;
          }
          return updated;
        }
        return t;
      })
    );
    soundEffects.playTactileClick();
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    soundEffects.playTactileClick();
  }, []);

  const toggleTaskComplete = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const isNowCompleted = t.status !== 'completed';
          if (isNowCompleted) {
            soundEffects.playCompletionChime();
          } else {
            soundEffects.playTactileClick();
          }
          return {
            ...t,
            status: isNowCompleted ? 'completed' : 'todo',
            completedAt: isNowCompleted ? new Date().toISOString() : undefined,
          };
        }
        return t;
      })
    );
  }, []);

  const moveTaskStatus = useCallback((id: string, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          if (newStatus === 'completed' && t.status !== 'completed') {
            soundEffects.playCompletionChime();
          } else {
            soundEffects.playTactileClick();
          }
          return {
            ...t,
            status: newStatus,
            completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined,
          };
        }
        return t;
      })
    );
  }, []);

  const snoozeTaskReminder = useCallback((id: string, minutes: number) => {
    const newReminder = new Date(Date.now() + minutes * 60 * 1000).toISOString();
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          return {
            ...t,
            reminderTime: newReminder,
            reminderTriggered: false,
          };
        }
        return t;
      })
    );
    soundEffects.playTactileClick();
  }, []);

  // Category Mutations
  const addCategory = useCallback((catData: Omit<Category, 'id'>) => {
    const newCat: Category = {
      ...catData,
      id: `cat-${Date.now()}`,
    };
    setCategories((prev) => [...prev, newCat]);
    soundEffects.playTactileClick();
    return newCat;
  }, []);

  const updateCategory = useCallback((id: string, updates: Partial<Category>) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    soundEffects.playTactileClick();
  }, []);

  const deleteCategory = useCallback((id: string) => {
    // Reassign affected tasks to first category or keep unassigned
    setCategories((prev) => prev.filter((c) => c.id !== id));
    setTasks((prev) =>
      prev.map((t) => (t.categoryId === id ? { ...t, categoryId: 'cat-work' } : t))
    );
    if (selectedCategoryId === id) {
      setSelectedCategoryId(null);
    }
    soundEffects.playTactileClick();
  }, [selectedCategoryId]);

  // Data Export / Import
  const exportDataJSON = useCallback(() => {
    const data = {
      app: 'TaskPulse',
      version: 1,
      exportedAt: new Date().toISOString(),
      categories,
      tasks,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `taskpulse-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    soundEffects.playTactileClick();
  }, [categories, tasks]);

  const importDataJSON = useCallback((jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed.tasks) && Array.isArray(parsed.categories)) {
        setCategories(parsed.categories);
        setTasks(parsed.tasks);
        soundEffects.playCompletionChime();
        return { success: true, count: parsed.tasks.length };
      }
      return { success: false, error: 'Invalid file format. Missing tasks or categories array.' };
    } catch {
      return { success: false, error: 'Failed to parse JSON file.' };
    }
  }, []);

  const resetToDefaults = useCallback(() => {
    setCategories(DEFAULT_CATEGORIES);
    setTasks(generateInitialTasks());
    setSelectedCategoryId(null);
    setSelectedPriority(null);
    setStatusFilter('all');
    setSearchQuery('');
    soundEffects.playTactileClick();
  }, []);

  // Filtered & Sorted Tasks memo
  const filteredTasks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const todayStr = new Date().toISOString().split('T')[0];
    const nowTime = new Date().getTime();

    return tasks.filter((task) => {
      // 1. Search Query
      if (query) {
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesDesc = task.description?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc) return false;
      }

      // 2. Category Filter
      if (selectedCategoryId && task.categoryId !== selectedCategoryId) {
        return false;
      }

      // 3. Priority Filter
      if (selectedPriority && task.priority !== selectedPriority) {
        return false;
      }

      // 4. Status Filter
      if (statusFilter === 'active' && task.status === 'completed') return false;
      if (statusFilter === 'completed' && task.status !== 'completed') return false;
      if (statusFilter === 'due_today') {
        if (!task.dueDate) return false;
        return task.dueDate.startsWith(todayStr);
      }
      if (statusFilter === 'overdue') {
        if (!task.dueDate || task.status === 'completed') return false;
        return new Date(task.dueDate).getTime() < nowTime;
      }

      return true;
    }).sort((a, b) => {
      let comparison = 0;
      if (sortField === 'dueDate') {
        // null due dates come last
        if (!a.dueDate && !b.dueDate) comparison = 0;
        else if (!a.dueDate) comparison = 1;
        else if (!b.dueDate) comparison = -1;
        else comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      } else if (sortField === 'priority') {
        const weightA = PRIORITY_CONFIGS[a.priority].weight;
        const weightB = PRIORITY_CONFIGS[b.priority].weight;
        // higher weight first when asc
        comparison = weightB - weightA;
      } else if (sortField === 'title') {
        comparison = a.title.localeCompare(b.title);
      } else if (sortField === 'createdAt') {
        comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [tasks, searchQuery, selectedCategoryId, selectedPriority, statusFilter, sortField, sortOrder]);

  // Overall Statistics memo
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === 'completed').length;
    const active = total - completed;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    const now = new Date().getTime();
    const todayStr = new Date().toISOString().split('T')[0];

    const overdueCount = tasks.filter(
      (t) => t.status !== 'completed' && t.dueDate && new Date(t.dueDate).getTime() < now
    ).length;

    const dueTodayCount = tasks.filter(
      (t) => t.status !== 'completed' && t.dueDate && t.dueDate.startsWith(todayStr)
    ).length;

    const withRemindersCount = tasks.filter(
      (t) => t.status !== 'completed' && t.reminderTime
    ).length;

    // Counts per priority
    const priorityCounts: Record<PriorityLevel, number> = {
      p1_urgent: 0,
      p2_high: 0,
      p3_medium: 0,
      p4_low: 0,
    };

    // Counts per category
    const categoryCounts: Record<string, number> = {};

    tasks.forEach((t) => {
      priorityCounts[t.priority] = (priorityCounts[t.priority] || 0) + 1;
      categoryCounts[t.categoryId] = (categoryCounts[t.categoryId] || 0) + 1;
    });

    return {
      total,
      completed,
      active,
      percent,
      overdueCount,
      dueTodayCount,
      withRemindersCount,
      priorityCounts,
      categoryCounts,
    };
  }, [tasks]);

  return {
    tasks,
    categories,
    filteredTasks,
    stats,
    // Filters & view
    viewMode,
    setViewMode,
    selectedCategoryId,
    setSelectedCategoryId,
    selectedPriority,
    setSelectedPriority,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    sortField,
    setSortField,
    sortOrder,
    setSortOrder,
    // Task actions
    createTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    moveTaskStatus,
    snoozeTaskReminder,
    // Category actions
    addCategory,
    updateCategory,
    deleteCategory,
    // Data operations
    exportDataJSON,
    importDataJSON,
    resetToDefaults,
  };
}
