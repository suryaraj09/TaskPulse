import React, { useEffect, useState } from 'react';
import { Bell, CheckCircle2, Clock, X } from 'lucide-react';
import { notificationService, InAppToast } from '../services/notificationService';
import { soundEffects } from '../services/soundEffects';

interface NotificationToastContainerProps {
  onCompleteTask: (taskId: string) => void;
  onSnoozeTask: (taskId: string, minutes: number) => void;
}

export const NotificationToastContainer: React.FC<NotificationToastContainerProps> = ({
  onCompleteTask,
  onSnoozeTask,
}) => {
  const [toasts, setToasts] = useState<InAppToast[]>([]);

  useEffect(() => {
    const unsubscribe = notificationService.subscribeToasts((active) => {
      setToasts(active);
    });
    return unsubscribe;
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto bg-slate-900/95 backdrop-blur-md border border-slate-700/80 shadow-2xl shadow-black/50 rounded-xl p-4 text-slate-100 animate-in slide-in-from-top-3 fade-in duration-200"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm"
                style={{ backgroundColor: `${toast.categoryColor || '#4F46E5'}25`, color: toast.categoryColor || '#4F46E5' }}
              >
                <Bell className="w-4 h-4 animate-bounce" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span
                    className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded border"
                    style={{
                      borderColor: `${toast.categoryColor || '#4F46E5'}40`,
                      color: toast.categoryColor || '#4F46E5',
                      backgroundColor: `${toast.categoryColor || '#4F46E5'}15`,
                    }}
                  >
                    {toast.priorityCode}
                  </span>
                  <span className="text-xs font-medium text-slate-400 truncate">
                    {toast.categoryName}
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-white truncate">{toast.title}</h4>
                <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">{toast.message}</p>
              </div>
            </div>

            <button
              onClick={() => {
                soundEffects.playTactileClick();
                notificationService.dismissToast(toast.id);
              }}
              className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Action buttons */}
          {toast.taskId !== 'test' && (
            <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  onSnoozeTask(toast.taskId, 10);
                  notificationService.dismissToast(toast.id);
                }}
                className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700/80 px-2.5 py-1.5 rounded-lg transition"
              >
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Snooze 10m
              </button>
              <button
                onClick={() => {
                  onCompleteTask(toast.taskId);
                  notificationService.dismissToast(toast.id);
                }}
                className="flex items-center gap-1.5 text-xs font-medium text-emerald-300 hover:text-white bg-emerald-950/60 hover:bg-emerald-800/60 border border-emerald-700/50 px-2.5 py-1.5 rounded-lg transition"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Mark Complete
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
