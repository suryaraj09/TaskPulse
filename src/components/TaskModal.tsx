import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  Bell,
  CheckCircle,
  Tag,
  AlertTriangle,
  FolderPlus,
} from 'lucide-react';
import {
  TaskItem,
  Category,
  PriorityLevel,
  TaskStatus,
  PRIORITY_CONFIGS,
  STATUS_COLUMNS,
} from '../types/todo';
import { soundEffects } from '../services/soundEffects';
import { notificationService } from '../services/notificationService';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Omit<TaskItem, 'id' | 'createdAt' | 'reminderTriggered'>) => void;
  onUpdate: (id: string, updates: Partial<TaskItem>) => void;
  taskToEdit?: TaskItem | null;
  defaultStatus?: TaskStatus;
  categories: Category[];
  onOpenAddCategoryModal: () => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onUpdate,
  taskToEdit,
  defaultStatus = 'todo',
  categories,
  onOpenAddCategoryModal,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('p3_medium');
  const [status, setStatus] = useState<TaskStatus>(defaultStatus);
  const [dueDate, setDueDate] = useState('');
  const [enableReminder, setEnableReminder] = useState(false);
  const [reminderOffset, setReminderOffset] = useState<number>(15); // minutes before
  const [customReminderTime, setCustomReminderTime] = useState('');
  const [isCustomReminder, setIsCustomReminder] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  // Check notification permission
  useEffect(() => {
    if (notificationService.isSupported()) {
      setNotificationPermission(notificationService.getPermissionStatus());
    }
  }, [isOpen]);

  // Sync state when editing or opening
  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      setCategoryId(taskToEdit.categoryId);
      setPriority(taskToEdit.priority);
      setStatus(taskToEdit.status);

      if (taskToEdit.dueDate) {
        // Format for datetime-local: YYYY-MM-DDTHH:mm
        const d = new Date(taskToEdit.dueDate);
        const pad = (n: number) => n.toString().padStart(2, '0');
        const formatted = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        setDueDate(formatted);
      } else {
        setDueDate('');
      }

      if (taskToEdit.reminderTime) {
        setEnableReminder(true);
        const r = new Date(taskToEdit.reminderTime);
        const pad = (n: number) => n.toString().padStart(2, '0');
        const formattedR = `${r.getFullYear()}-${pad(r.getMonth() + 1)}-${pad(r.getDate())}T${pad(r.getHours())}:${pad(r.getMinutes())}`;
        setCustomReminderTime(formattedR);
        setReminderOffset(taskToEdit.reminderOffsetMinutes ?? 0);
      } else {
        setEnableReminder(false);
      }
    } else {
      // New task defaults
      setTitle('');
      setDescription('');
      setCategoryId(categories[0]?.id || 'cat-work');
      setPriority('p3_medium');
      setStatus(defaultStatus);

      // Default due date: today + 3 hours
      const in3Hours = new Date(Date.now() + 3 * 60 * 60 * 1000);
      const pad = (n: number) => n.toString().padStart(2, '0');
      const formatted = `${in3Hours.getFullYear()}-${pad(in3Hours.getMonth() + 1)}-${pad(in3Hours.getDate())}T${pad(in3Hours.getHours())}:00`;
      setDueDate(formatted);
      setEnableReminder(true);
      setReminderOffset(15);
      setIsCustomReminder(false);
    }
  }, [taskToEdit, isOpen, defaultStatus, categories]);

  // Handle keyboard shortcut Esc & Ctrl/Cmd+Enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        handleSubmit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, title, categoryId, priority, status, dueDate, enableReminder, reminderOffset, isCustomReminder, customReminderTime]);

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    soundEffects.playTactileClick();
    const res = await notificationService.requestPermission();
    setNotificationPermission(res);
  };

  const calculateReminderTime = (): string | undefined => {
    if (!enableReminder) return undefined;

    if (isCustomReminder && customReminderTime) {
      return new Date(customReminderTime).toISOString();
    }

    if (dueDate) {
      const dueTimestamp = new Date(dueDate).getTime();
      const reminderTimestamp = dueTimestamp - reminderOffset * 60 * 1000;
      return new Date(reminderTimestamp).toISOString();
    }

    // If no due date but reminder enabled, default to 15 min from now
    return new Date(Date.now() + 15 * 60 * 1000).toISOString();
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim()) return;

    const computedReminder = calculateReminderTime();

    const taskPayload = {
      title: title.trim(),
      description: description.trim() || undefined,
      categoryId: categoryId || categories[0]?.id || 'cat-work',
      priority,
      status,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      reminderTime: computedReminder,
      reminderOffsetMinutes: enableReminder && !isCustomReminder ? reminderOffset : undefined,
    };

    if (taskToEdit) {
      onUpdate(taskToEdit.id, taskPayload);
    } else {
      onSave(taskPayload);
    }

    onClose();
  };

  // Quick preset dates
  const setPresetDate = (hoursFromNow: number) => {
    const target = new Date(Date.now() + hoursFromNow * 60 * 60 * 1000);
    const pad = (n: number) => n.toString().padStart(2, '0');
    setDueDate(`${target.getFullYear()}-${pad(target.getMonth() + 1)}-${pad(target.getDate())}T${pad(target.getHours())}:${pad(target.getMinutes())}`);
    soundEffects.playTactileClick();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur z-10">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white">
              {taskToEdit ? 'Edit Task' : 'Create New Task'}
            </h3>
          </div>
          <button
            onClick={() => {
              soundEffects.playTactileClick();
              onClose();
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 text-xs text-slate-200">
          {/* Task Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Task Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Deploy container to production cluster"
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none transition"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Description / Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add key criteria, checklist steps, or reference links..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-500 outline-none resize-none transition"
            />
          </div>

          {/* Category Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Category
              </label>
              <button
                type="button"
                onClick={() => {
                  soundEffects.playTactileClick();
                  onOpenAddCategoryModal();
                }}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <FolderPlus className="w-3 h-3" />
                <span>+ New Category</span>
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categories.map((cat) => {
                const isSelected = categoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      soundEffects.playTactileClick();
                      setCategoryId(cat.id);
                    }}
                    className={`flex items-center gap-2 p-2 rounded-lg border text-left transition ${
                      isSelected
                        ? 'bg-slate-800 border-indigo-500 text-white shadow-sm ring-1 ring-indigo-500'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="truncate text-xs font-medium">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Priority Levels Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Priority Tier
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(Object.keys(PRIORITY_CONFIGS) as PriorityLevel[]).map((level) => {
                const config = PRIORITY_CONFIGS[level];
                const isSelected = priority === level;
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => {
                      soundEffects.playTactileClick();
                      setPriority(level);
                    }}
                    className={`p-2.5 rounded-lg border text-center transition flex flex-col items-center gap-1 ${
                      isSelected
                        ? `${config.bgColor} ${config.borderColor} ${config.textColor} font-bold ring-1 ring-white/20`
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="font-mono text-xs">{config.code}</span>
                    <span className="text-[11px]">{config.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status Column */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Status Stage
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {STATUS_COLUMNS.map((col) => {
                const isSelected = status === col.id;
                return (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => {
                      soundEffects.playTactileClick();
                      setStatus(col.id);
                    }}
                    className={`py-1.5 px-2 rounded-lg border text-center transition text-xs ${
                      isSelected
                        ? 'bg-slate-800 border-indigo-500 text-white font-semibold'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {col.title}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Due Date & Time */}
          <div className="pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                <span>Due Date & Time</span>
              </label>
              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPresetDate(3)}
                  className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded transition"
                >
                  +3 Hours
                </button>
                <button
                  type="button"
                  onClick={() => setPresetDate(24)}
                  className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded transition"
                >
                  Tomorrow
                </button>
              </div>
            </div>
            <input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-3 py-2 text-xs text-white outline-none font-mono"
            />
          </div>

          {/* Push Notification Reminder Section */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-indigo-400" />
                <div>
                  <span className="font-semibold text-white block">Push Notification Reminder</span>
                  <span className="text-[11px] text-slate-400">
                    Audio chime & browser push alert when due
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={enableReminder}
                onChange={(e) => {
                  soundEffects.playTactileClick();
                  setEnableReminder(e.target.checked);
                }}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-900 border-slate-700 cursor-pointer"
              />
            </div>

            {enableReminder && (
              <div className="pt-2 border-t border-slate-800/80 space-y-2.5">
                {/* Permission Warning/Prompt */}
                {notificationPermission !== 'granted' && (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-indigo-950/40 border border-indigo-700/40">
                    <div className="flex items-center gap-2 text-[11px] text-indigo-300">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Browser push permission required for system alerts</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRequestPermission}
                      className="px-2 py-1 text-[10px] font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded transition"
                    >
                      Grant Permission
                    </button>
                  </div>
                )}

                {/* Reminder Timing Preset */}
                <div className="flex flex-wrap items-center gap-2">
                  <label className="text-[11px] text-slate-400">Alert me:</label>
                  <select
                    value={isCustomReminder ? 'custom' : reminderOffset.toString()}
                    onChange={(e) => {
                      soundEffects.playTactileClick();
                      if (e.target.value === 'custom') {
                        setIsCustomReminder(true);
                      } else {
                        setIsCustomReminder(false);
                        setReminderOffset(Number(e.target.value));
                      }
                    }}
                    className="bg-slate-900 border border-slate-800 text-xs text-white rounded-lg px-2.5 py-1.5 outline-none cursor-pointer"
                  >
                    <option value="0">At time of event (0m)</option>
                    <option value="5">5 minutes before</option>
                    <option value="15">15 minutes before</option>
                    <option value="30">30 minutes before</option>
                    <option value="60">1 hour before</option>
                    <option value="1440">1 day before</option>
                    <option value="custom">Custom date & time...</option>
                  </select>
                </div>

                {isCustomReminder && (
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Exact Reminder Timestamp:
                    </label>
                    <input
                      type="datetime-local"
                      value={customReminderTime}
                      onChange={(e) => setCustomReminderTime(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-lg px-3 py-1.5 text-xs text-white outline-none font-mono"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
              Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">Ctrl+Enter</kbd> to save
            </span>

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={() => {
                  soundEffects.playTactileClick();
                  onClose();
                }}
                className="px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={!title.trim()}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm shadow-indigo-600/30 transition flex items-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" />
                <span>{taskToEdit ? 'Save Changes' : 'Create Task'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
