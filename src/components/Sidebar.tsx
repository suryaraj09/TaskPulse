import React, { useRef } from 'react';
import {
  Folder,
  Plus,
  Trash2,
  Edit2,
  Download,
  Upload,
  RefreshCw,
  Sparkles,
  DownloadCloud,
} from 'lucide-react';
import { Category, PriorityLevel, PRIORITY_CONFIGS } from '../types/todo';
import { soundEffects } from '../services/soundEffects';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface SidebarProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onSelectCategory: (id: string | null) => void;
  onOpenAddCategoryModal: () => void;
  onOpenEditCategoryModal: (category: Category) => void;
  onDeleteCategory: (id: string) => void;
  selectedPriority: PriorityLevel | null;
  onSelectPriority: (priority: PriorityLevel | null) => void;
  stats: {
    total: number;
    completed: number;
    active: number;
    percent: number;
    priorityCounts: Record<PriorityLevel, number>;
    categoryCounts: Record<string, number>;
  };
  onExportData: () => void;
  onImportData: (json: string) => { success: boolean; error?: string; count?: number };
  onResetData: () => void;
  onShowIOSGuide: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  onOpenAddCategoryModal,
  onOpenEditCategoryModal,
  onDeleteCategory,
  selectedPriority,
  onSelectPriority,
  stats,
  onExportData,
  onImportData,
  onResetData,
  onShowIOSGuide,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const result = onImportData(content);
        if (!result.success) {
          alert(result.error || 'Failed to import backup');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <aside className="w-full lg:w-72 shrink-0 bg-slate-950/60 lg:border-r border-slate-800/80 p-4 lg:p-5 flex flex-col gap-6">
      {/* 1. Progress Overview Box */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-300">Daily Completion</span>
          <span className="text-xs font-mono font-bold text-indigo-400 tabular-nums">
            {stats.percent}%
          </span>
        </div>
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${stats.percent}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 font-mono tabular-nums">
          <span>{stats.completed} done</span>
          <span>{stats.active} remaining</span>
        </div>
      </div>

      {/* 2. Categories Section */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-slate-400 tracking-wider">
            CATEGORIES
          </span>
          <button
            onClick={() => {
              soundEffects.playTactileClick();
              onOpenAddCategoryModal();
            }}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Add Category"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* All Categories Option */}
        <button
          onClick={() => {
            soundEffects.playTactileClick();
            onSelectCategory(null);
          }}
          className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition ${
            selectedCategoryId === null
              ? 'bg-slate-800 text-white font-semibold'
              : 'text-slate-300 hover:bg-slate-900 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2.5 truncate">
            <Folder className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="truncate">All Categories</span>
          </div>
          <span className="text-[11px] font-mono text-slate-500 tabular-nums">
            {stats.total}
          </span>
        </button>

        {/* Categories List */}
        <div className="flex flex-col gap-1 max-h-56 overflow-y-auto pr-1">
          {categories.map((cat) => {
            const isSelected = selectedCategoryId === cat.id;
            const count = stats.categoryCounts[cat.id] || 0;

            return (
              <div
                key={cat.id}
                className={`group flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800/90 text-white'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
                onClick={() => {
                  soundEffects.playTactileClick();
                  onSelectCategory(isSelected ? null : cat.id);
                }}
              >
                <div className="flex items-center gap-2.5 truncate min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="truncate">{cat.name}</span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-[11px] font-mono text-slate-500 tabular-nums mr-1">
                    {count}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenEditCategoryModal(cat);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition"
                    title="Edit category"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  {categories.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete "${cat.name}" category? Tasks will be moved to another category.`)) {
                          onDeleteCategory(cat.id);
                        }
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-rose-400 transition"
                      title="Delete category"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Priority Levels Section */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-slate-400 tracking-wider">
            PRIORITY TIERS
          </span>
          {selectedPriority && (
            <button
              onClick={() => {
                soundEffects.playTactileClick();
                onSelectPriority(null);
              }}
              className="text-[10px] text-indigo-400 hover:underline"
            >
              Clear
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          {(Object.keys(PRIORITY_CONFIGS) as PriorityLevel[]).map((level) => {
            const config = PRIORITY_CONFIGS[level];
            const isSelected = selectedPriority === level;
            const count = stats.priorityCounts[level] || 0;

            return (
              <button
                key={level}
                onClick={() => {
                  soundEffects.playTactileClick();
                  onSelectPriority(isSelected ? null : level);
                }}
                className={`flex items-center justify-between p-2 rounded-lg border text-xs transition ${
                  isSelected
                    ? `${config.bgColor} ${config.borderColor} ${config.textColor} font-semibold ring-1 ring-white/10`
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: config.color }}
                  />
                  <span className="truncate">{config.label}</span>
                </div>
                <span className="text-[11px] font-mono tabular-nums text-slate-400">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. App Utilities & Installation */}
      <div className="mt-auto pt-4 border-t border-slate-800/80 flex flex-col gap-2">
        {/* PWA Install Button */}
        {!isInstalled && isInstallable && (
          <button
            onClick={() => {
              soundEffects.playTactileClick();
              install();
            }}
            className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition"
          >
            <DownloadCloud className="w-4 h-4" />
            <span>Install Desktop / Mobile App</span>
          </button>
        )}

        {!isInstalled && isIOS && (
          <button
            onClick={() => {
              soundEffects.playTactileClick();
              onShowIOSGuide();
            }}
            className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Install on iOS Safari</span>
          </button>
        )}

        {/* Data backup actions */}
        <div className="grid grid-cols-2 gap-1.5 pt-1">
          <button
            onClick={onExportData}
            className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 text-[11px] transition"
            title="Download JSON backup"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 text-[11px] transition"
            title="Restore from JSON backup"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        <button
          onClick={() => {
            if (confirm('Reset all tasks and categories to initial default state?')) {
              onResetData();
            }
          }}
          className="flex items-center justify-center gap-1.5 py-1 text-slate-500 hover:text-slate-400 text-[11px] transition"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Reset Sample Data</span>
        </button>
      </div>
    </aside>
  );
};
