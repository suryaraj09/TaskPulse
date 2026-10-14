import { soundEffects } from './soundEffects';
import { TaskItem, Category, PRIORITY_CONFIGS } from '../types/todo';

export interface InAppToast {
  id: string;
  taskId: string;
  title: string;
  message: string;
  priorityCode: string;
  categoryName?: string;
  categoryColor?: string;
  timestamp: number;
}

type ToastListener = (toasts: InAppToast[]) => void;

class NotificationService {
  private activeToasts: InAppToast[] = [];
  private listeners: Set<ToastListener> = new Set();

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  public getPermissionStatus(): NotificationPermission {
    if (!this.isSupported()) return 'denied';
    return Notification.permission;
  }

  public async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) return 'denied';
    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch {
      return 'denied';
    }
  }

  public subscribeToasts(listener: ToastListener): () => void {
    this.listeners.add(listener);
    listener([...this.activeToasts]);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    const list = [...this.activeToasts];
    this.listeners.forEach((fn) => fn(list));
  }

  public dismissToast(toastId: string): void {
    this.activeToasts = this.activeToasts.filter((t) => t.id !== toastId);
    this.notifyListeners();
  }

  public clearAllToasts(): void {
    this.activeToasts = [];
    this.notifyListeners();
  }

  /**
   * Triggers a dual push notification:
   * 1. Browser Native Push Notification (if permitted)
   * 2. Web Audio chime
   * 3. In-App actionable toast banner
   */
  public triggerTaskReminder(task: TaskItem, category?: Category): void {
    const priorityConfig = PRIORITY_CONFIGS[task.priority];
    const categoryName = category ? category.name : 'General';
    const bodyText = `[${priorityConfig.label}] ${categoryName}: ${task.description || 'Task due now'}`;

    // 1. Play audio chime
    soundEffects.playReminderChime();

    // 2. Dispatch native system notification if supported & permitted
    if (this.isSupported() && Notification.permission === 'granted') {
      try {
        const notif = new Notification(`⏰ Reminder: ${task.title}`, {
          body: bodyText,
          icon: '/icon.svg',
          badge: '/icon.svg',
          tag: `task-${task.id}-${Date.now()}`,
          requireInteraction: true,
        });

        notif.onclick = () => {
          window.focus();
          notif.close();
        };
      } catch (err) {
        console.error('Failed to trigger native notification:', err);
      }
    }

    // 3. Add to In-App Toast queue
    const toast: InAppToast = {
      id: `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      taskId: task.id,
      title: task.title,
      message: bodyText,
      priorityCode: priorityConfig.code,
      categoryName,
      categoryColor: category?.color || '#6366F1',
      timestamp: Date.now(),
    };

    this.activeToasts = [toast, ...this.activeToasts.slice(0, 4)];
    this.notifyListeners();
  }

  /**
   * Sends an immediate test reminder for user verification
   */
  public async sendTestReminder(): Promise<void> {
    if (this.isSupported() && Notification.permission === 'default') {
      await this.requestPermission();
    }

    soundEffects.playReminderChime();

    if (this.isSupported() && Notification.permission === 'granted') {
      try {
        new Notification('🔔 TaskPulse Push Notifications Active', {
          body: 'Reminders are armed and ready to alert you on task deadlines!',
          icon: '/icon.svg',
          tag: 'taskpulse-test',
        });
      } catch {
        // Fallback
      }
    }

    const testToast: InAppToast = {
      id: `toast-test-${Date.now()}`,
      taskId: 'test',
      title: 'Notification Alert Test',
      message: 'Both audio chimes and visual push alerts are active!',
      priorityCode: 'P1',
      categoryName: 'System',
      categoryColor: '#F43F5E',
      timestamp: Date.now(),
    };

    this.activeToasts = [testToast, ...this.activeToasts];
    this.notifyListeners();
  }
}

export const notificationService = new NotificationService();
