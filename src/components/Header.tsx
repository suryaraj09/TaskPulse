import React, { useState, useEffect } from 'react';
import { Plus, Bell, BellOff, Volume2, VolumeX, Sparkles, Check } from 'lucide-react';
import { notificationService } from '../services/notificationService';
import { soundEffects } from '../services/soundEffects';

interface HeaderProps {
  statusFilter: 'all' | 'active' | 'completed' | 'due_today' | 'overdue';
  onSelectFilter: (filter: 'all' | 'active' | 'completed' | 'due_today' | 'overdue') => void;
  onOpenNewTaskModal: () => void;
  stats: {
    total: number;
    active: number;
    dueTodayCount: number;
    overdueCount: number;
  };
}

export const Header: React.FC<HeaderProps> = ({
  statusFilter,
  onSelectFilter,
  onOpenNewTaskModal,
  stats,
}) => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isMuted, setIsMuted] = useState<boolean>(soundEffects.getMuted());
  const [testSent, setTestSent] = useState<boolean>(false);

  useEffect(() => {
    if (notificationService.isSupported()) {
      setPermission(notificationService.getPermissionStatus());
    }
  }, []);

  const handleToggleNotification = async () => {
    soundEffects.playTactileClick();
    if (permission !== 'granted') {
      const res = await notificationService.requestPermission();
      setPermission(res);
      if (res === 'granted') {
        await notificationService.sendTestReminder();
      }
    } else {
      // Trigger test reminder if already granted
      setTestSent(true);
      await notificationService.sendTestReminder();
      setTimeout(() => setTestSent(false), 2500);
    }
  };

  const handleToggleSound = () => {
    const muted = soundEffects.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      soundEffects.playTactileClick();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3.5 flex items-center justify-between gap-6">
      {/* Zone 1: Single text element brand wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-rose-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold tracking-tight text-white font-sans whitespace-nowrap">
          Task<span className="text-indigo-400">Pulse</span>
        </span>
      </div>

      {/* Zone 2: 4 clean single-line text links / filter status buttons */}
      <nav className="hidden md:flex items-center gap-1.5 text-sm font-medium">
        <button
          onClick={() => {
            soundEffects.playTactileClick();
            onSelectFilter('all');
          }}
          className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
            statusFilter === 'all'
              ? 'bg-slate-800 text-white font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <span>All Tasks</span>
          <span className="text-xs font-mono tabular-nums text-slate-500">
            {stats.total}
          </span>
        </button>

        <button
          onClick={() => {
            soundEffects.playTactileClick();
            onSelectFilter('active');
          }}
          className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
            statusFilter === 'active'
              ? 'bg-slate-800 text-white font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <span>Active</span>
          <span className="text-xs font-mono tabular-nums text-slate-500">
            {stats.active}
          </span>
        </button>

        <button
          onClick={() => {
            soundEffects.playTactileClick();
            onSelectFilter('due_today');
          }}
          className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
            statusFilter === 'due_today'
              ? 'bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/30'
              : 'text-slate-400 hover:text-amber-300 hover:bg-slate-900/60'
          }`}
        >
          <span>Due Today</span>
          {stats.dueTodayCount > 0 && (
            <span className="text-xs font-mono tabular-nums px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300">
              {stats.dueTodayCount}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            soundEffects.playTactileClick();
            onSelectFilter('overdue');
          }}
          className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
            statusFilter === 'overdue'
              ? 'bg-rose-500/15 text-rose-300 font-semibold border border-rose-500/30'
              : 'text-slate-400 hover:text-rose-300 hover:bg-slate-900/60'
          }`}
        >
          <span>Overdue</span>
          {stats.overdueCount > 0 && (
            <span className="text-xs font-mono tabular-nums px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300">
              {stats.overdueCount}
            </span>
          )}
        </button>
      </nav>

      {/* Zone 3: 1 primary action + notification/sound controls */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Sound toggle */}
        <button
          onClick={handleToggleSound}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800 transition"
          title={isMuted ? 'Sound muted (Click to unmute)' : 'Sound active (Click to mute)'}
          aria-label="Toggle sound"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-indigo-400" />}
        </button>

        {/* Push Notification button */}
        <button
          onClick={handleToggleNotification}
          className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium transition flex items-center gap-1.5 ${
            permission === 'granted'
              ? 'bg-slate-900 border-slate-700/80 text-slate-300 hover:border-indigo-500/50 hover:text-white'
              : permission === 'denied'
              ? 'bg-rose-950/30 border-rose-800/40 text-rose-400'
              : 'bg-indigo-950/40 border-indigo-700/40 text-indigo-300 hover:bg-indigo-900/50'
          }`}
          title={
            permission === 'granted'
              ? 'Push notifications enabled. Click to test sound & reminder!'
              : 'Enable push notifications for deadline reminders'
          }
        >
          {permission === 'granted' ? (
            testSent ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Alert Tested</span>
              </>
            ) : (
              <>
                <Bell className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">Push Active</span>
              </>
            )
          ) : permission === 'denied' ? (
            <>
              <BellOff className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">Push Blocked</span>
            </>
          ) : (
            <>
              <Bell className="w-3.5 h-3.5 text-indigo-300 animate-pulse" />
              <span className="hidden sm:inline">Enable Push</span>
            </>
          )}
        </button>

        {/* Primary Action Button */}
        <button
          onClick={() => {
            soundEffects.playTactileClick();
            onOpenNewTaskModal();
          }}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 active:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 rounded-lg shadow-sm shadow-red-600/30 transition-colors whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>
      </div>
    </header>
  );
};
