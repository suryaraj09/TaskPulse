import React, { useState } from 'react';
import {
  Plus,
  Clock,
  Bell,
  Trash2,
  Edit3,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import {
  TaskItem,
  Category,
  TaskStatus,
  STATUS_COLUMNS,
  PRIORITY_CONFIGS,
} from '../types/todo';
import { soundEffects } from '../services/soundEffects';

interface TaskKanbanViewProps {
  tasks: TaskItem[];
  categories: Category[];
  onToggleComplete: (id: string) => void;
  onEditTask: (task: TaskItem) => void;
  onDeleteTask: (id: string) => void;
  onMoveStatus: (id: string, status: TaskStatus) => void;
  onOpenNewTaskModalWithStatus: (status: TaskStatus) => void;
}

export const TaskKanbanView: React.FC<TaskKanbanViewProps> = ({
  tasks,
  categories,
  onToggleComplete,
  onEditTask,
  onDeleteTask,
  onMoveStatus,
  onOpenNewTaskModalWithStatus,
}) => {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);

  const getCategory = (catId: string) => categories.find((c) => c.id === catId);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== status) {
      setDragOverColumn(status);
    }
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId) {
      onMoveStatus(taskId, status);
    }
    setDraggedTaskId(null);
    setDragOverColumn(null);
  };

  const formatDueDate = (dateStr?: string) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isOverdue = date.getTime() < now.getTime();

    const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let label = '';
    if (isToday) {
      label = `Today, ${timeString}`;
    } else {
      label = `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })}`;
    }

    return { label, isOverdue, isToday };
  };

  return (
    <div className="p-4 lg:p-6 overflow-x-auto min-h-[calc(100vh-140px)]">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 min-w-[320px]">
        {STATUS_COLUMNS.map((column, colIdx) => {
          const columnTasks = tasks.filter((t) => t.status === column.id);
          const isOver = dragOverColumn === column.id;

          return (
            <div
              key={column.id}
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.id)}
              className={`flex flex-col bg-slate-900/40 border rounded-xl transition-all duration-200 min-h-[500px] ${
                isOver
                  ? 'border-indigo-500/80 bg-indigo-950/20 ring-2 ring-indigo-500/30'
                  : 'border-slate-800/80'
              }`}
            >
              {/* Column Header */}
              <div className="p-3.5 border-b border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: column.color }}
                  />
                  <h3 className="text-xs font-bold text-slate-200 tracking-wide uppercase">
                    {column.title}
                  </h3>
                  <span className="text-xs font-mono font-medium text-slate-500 tabular-nums px-1.5 py-0.5 rounded bg-slate-800">
                    {columnTasks.length}
                  </span>
                </div>

                <button
                  onClick={() => {
                    soundEffects.playTactileClick();
                    onOpenNewTaskModalWithStatus(column.id);
                  }}
                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
                  title={`Add task to ${column.title}`}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Column Cards Container */}
              <div className="flex-1 p-2.5 flex flex-col gap-2.5 overflow-y-auto max-h-[calc(100vh-240px)]">
                {columnTasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500">
                    <p className="text-xs">No tasks in this lane</p>
                    <button
                      onClick={() => onOpenNewTaskModalWithStatus(column.id)}
                      className="mt-2 text-[11px] text-indigo-400 hover:underline"
                    >
                      + Add task
                    </button>
                  </div>
                ) : (
                  columnTasks.map((task) => {
                    const category = getCategory(task.categoryId);
                    const priorityConfig = PRIORITY_CONFIGS[task.priority];
                    const dueInfo = formatDueDate(task.dueDate);
                    const isCompleted = task.status === 'completed';

                    return (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        className={`group bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-lg p-3 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing ${
                          draggedTaskId === task.id ? 'opacity-40 scale-95' : ''
                        } ${isCompleted ? 'bg-slate-950/60 opacity-75' : ''}`}
                      >
                        {/* Top row: Priority & Category */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span
                            className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border leading-none ${priorityConfig.bgColor} ${priorityConfig.borderColor} ${priorityConfig.textColor}`}
                          >
                            {priorityConfig.code}
                          </span>

                          {category && (
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 truncate max-w-[140px]">
                              <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ backgroundColor: category.color }}
                              />
                              <span className="truncate">{category.name}</span>
                            </div>
                          )}
                        </div>

                        {/* Title */}
                        <h4
                          className={`text-xs font-semibold leading-snug ${
                            isCompleted ? 'line-through text-slate-400' : 'text-slate-100'
                          }`}
                        >
                          {task.title}
                        </h4>

                        {/* Optional Description */}
                        {task.description && (
                          <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                            {task.description}
                          </p>
                        )}

                        {/* Due Date & Reminder indicator */}
                        <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono tabular-nums text-slate-400">
                          {dueInfo ? (
                            <div
                              className={`flex items-center gap-1 ${
                                !isCompleted && dueInfo.isOverdue
                                  ? 'text-rose-400 font-semibold'
                                  : !isCompleted && dueInfo.isToday
                                  ? 'text-amber-400 font-semibold'
                                  : 'text-slate-400'
                              }`}
                            >
                              {dueInfo.isOverdue && !isCompleted ? (
                                <AlertCircle className="w-3 h-3 text-rose-400" />
                              ) : (
                                <Calendar className="w-3 h-3" />
                              )}
                              <span>{dueInfo.label}</span>
                            </div>
                          ) : (
                            <span />
                          )}

                          {task.reminderTime && (
                            <div
                              className={`flex items-center gap-1 ${
                                task.reminderTriggered ? 'text-slate-500' : 'text-indigo-400'
                              }`}
                              title={
                                task.reminderTriggered
                                  ? 'Reminder triggered'
                                  : `Push reminder set for ${new Date(task.reminderTime).toLocaleTimeString()}`
                              }
                            >
                              <Bell className="w-3 h-3" />
                            </div>
                          )}
                        </div>

                        {/* Card Hover Actions & Stage Shifters */}
                        <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            {/* Nudge left button */}
                            {colIdx > 0 && (
                              <button
                                onClick={() => {
                                  soundEffects.playTactileClick();
                                  onMoveStatus(task.id, STATUS_COLUMNS[colIdx - 1].id);
                                }}
                                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
                                title={`Move to ${STATUS_COLUMNS[colIdx - 1].title}`}
                              >
                                <ChevronLeft className="w-3 h-3" />
                              </button>
                            )}

                            {/* Nudge right button */}
                            {colIdx < STATUS_COLUMNS.length - 1 && (
                              <button
                                onClick={() => {
                                  soundEffects.playTactileClick();
                                  onMoveStatus(task.id, STATUS_COLUMNS[colIdx + 1].id);
                                }}
                                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
                                title={`Move to ${STATUS_COLUMNS[colIdx + 1].title}`}
                              >
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                soundEffects.playTactileClick();
                                onEditTask(task);
                              }}
                              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
                              title="Edit card"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Delete task "${task.title}"?`)) {
                                  onDeleteTask(task.id);
                                }
                              }}
                              className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800 transition"
                              title="Delete card"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
