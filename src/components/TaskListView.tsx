import React from 'react';
import {
  Check,
  Clock,
  Bell,
  Trash2,
  Edit3,
  Calendar,
  AlertCircle,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { TaskItem, Category, PriorityLevel, TaskStatus, PRIORITY_CONFIGS, STATUS_COLUMNS } from '../types/todo';
import { soundEffects } from '../services/soundEffects';

interface TaskListViewProps {
  tasks: TaskItem[];
  categories: Category[];
  onToggleComplete: (id: string) => void;
  onEditTask: (task: TaskItem) => void;
  onDeleteTask: (id: string) => void;
  onMoveStatus: (id: string, status: TaskStatus) => void;
  onOpenNewTaskModal: () => void;
}

export const TaskListView: React.FC<TaskListViewProps> = ({
  tasks,
  categories,
  onToggleComplete,
  onEditTask,
  onDeleteTask,
  onMoveStatus,
  onOpenNewTaskModal,
}) => {
  const getCategory = (catId: string) => categories.find((c) => c.id === catId);

  const formatDueDate = (dateStr?: string) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isOverdue = date.getTime() < now.getTime();

    // Check if tomorrow
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow = date.toDateString() === tomorrow.toDateString();

    const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let label = '';
    if (isToday) {
      label = `Today, ${timeString}`;
    } else if (isTomorrow) {
      label = `Tomorrow, ${timeString}`;
    } else {
      label = `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${timeString}`;
    }

    return {
      label,
      isOverdue,
      isToday,
    };
  };

  const formatReminder = (dateStr?: string) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mb-4 shadow-sm">
          <Clock className="w-6 h-6 text-indigo-400" />
        </div>
        <h3 className="text-base font-semibold text-slate-200">No tasks in this view</h3>
        <p className="text-xs text-slate-500 max-w-sm mt-1">
          Adjust your active filters or create a new prioritized task to get started.
        </p>
        <button
          onClick={() => {
            soundEffects.playTactileClick();
            onOpenNewTaskModal();
          }}
          className="mt-5 flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm shadow-indigo-600/30 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Create First Task</span>
        </button>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-800/60">
      {tasks.map((task) => {
        const category = getCategory(task.categoryId);
        const priorityConfig = PRIORITY_CONFIGS[task.priority];
        const dueInfo = formatDueDate(task.dueDate);
        const reminderInfo = formatReminder(task.reminderTime);
        const isCompleted = task.status === 'completed';

        return (
          <div
            key={task.id}
            className={`group flex items-start gap-3.5 px-4 lg:px-8 py-3.5 hover:bg-slate-900/40 transition-colors ${
              isCompleted ? 'bg-slate-950/40 opacity-70' : ''
            }`}
          >
            {/* Custom Checkbox */}
            <button
              onClick={() => onToggleComplete(task.id)}
              className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-all shrink-0 ${
                isCompleted
                  ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
                  : 'border-slate-700 hover:border-indigo-400 hover:bg-indigo-500/10'
              }`}
              title={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
            >
              {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </button>

            {/* Task Main Content */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                {/* Priority Badge */}
                <span
                  className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border leading-none ${priorityConfig.bgColor} ${priorityConfig.borderColor} ${priorityConfig.textColor}`}
                >
                  {priorityConfig.code} {priorityConfig.label}
                </span>

                {/* Category Unboxed Text Metadata */}
                {category && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="truncate">{category.name}</span>
                  </div>
                )}

                <span className="text-slate-600 hidden sm:inline" aria-hidden="true">·</span>

                {/* Status indicator */}
                <span className="text-[11px] text-slate-500 capitalize hidden sm:inline">
                  {task.status.replace('_', ' ')}
                </span>
              </div>

              {/* Title & Description */}
              <h4
                className={`text-sm font-medium leading-snug transition ${
                  isCompleted ? 'line-through text-slate-500' : 'text-slate-100'
                }`}
              >
                {task.title}
              </h4>

              {task.description && (
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  {task.description}
                </p>
              )}

              {/* Metadata row: Due date, Reminder time */}
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs font-mono tabular-nums">
                {dueInfo && (
                  <div
                    className={`flex items-center gap-1.5 ${
                      !isCompleted && dueInfo.isOverdue
                        ? 'text-rose-400 font-semibold'
                        : !isCompleted && dueInfo.isToday
                        ? 'text-amber-400 font-semibold'
                        : 'text-slate-400'
                    }`}
                  >
                    {dueInfo.isOverdue && !isCompleted ? (
                      <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                    ) : (
                      <Calendar className="w-3.5 h-3.5" />
                    )}
                    <span>{dueInfo.label}</span>
                  </div>
                )}

                {task.reminderTime && (
                  <div
                    className={`flex items-center gap-1.5 ${
                      task.reminderTriggered
                        ? 'text-slate-500'
                        : 'text-indigo-400 font-medium'
                    }`}
                    title={
                      task.reminderTriggered
                        ? 'Reminder already sent'
                        : `Push alert set for ${new Date(task.reminderTime).toLocaleString()}`
                    }
                  >
                    <Bell className="w-3.5 h-3.5" />
                    <span>
                      Reminder {task.reminderTriggered ? 'Sent' : reminderInfo}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions & Status Mover */}
            <div className="flex items-center gap-1.5 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
              {/* Quick status cycle button */}
              <div className="relative">
                <select
                  value={task.status}
                  onChange={(e) => onMoveStatus(task.id, e.target.value as TaskStatus)}
                  className="bg-slate-900 border border-slate-800 text-[11px] text-slate-300 rounded-lg px-2 py-1 outline-none cursor-pointer hover:border-slate-700"
                  title="Change task status"
                >
                  {STATUS_COLUMNS.map((col) => (
                    <option key={col.id} value={col.id} className="bg-slate-900 text-slate-200">
                      {col.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Edit Button */}
              <button
                onClick={() => {
                  soundEffects.playTactileClick();
                  onEditTask(task);
                }}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                title="Edit task"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>

              {/* Delete Button */}
              <button
                onClick={() => {
                  if (confirm(`Delete task "${task.title}"?`)) {
                    onDeleteTask(task.id);
                  }
                }}
                className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition"
                title="Delete task"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
