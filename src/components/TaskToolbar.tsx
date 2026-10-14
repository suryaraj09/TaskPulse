import React from 'react';
import { Search, X, LayoutList, Kanban, ArrowUpDown, Tag, AlertCircle } from 'lucide-react';
import { ViewMode, SortField, SortOrder, PriorityLevel, PRIORITY_CONFIGS, Category } from '../types/todo';
import { soundEffects } from '../services/soundEffects';

interface TaskToolbarProps {
  viewMode: ViewMode;
  onSetViewMode: (mode: ViewMode) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortField: SortField;
  sortOrder: SortOrder;
  onSortFieldChange: (field: SortField) => void;
  onToggleSortOrder: () => void;
  selectedCategory?: Category;
  onClearCategory: () => void;
  selectedPriority: PriorityLevel | null;
  onClearPriority: () => void;
  taskCount: number;
}

export const TaskToolbar: React.FC<TaskToolbarProps> = ({
  viewMode,
  onSetViewMode,
  searchQuery,
  onSearchChange,
  sortField,
  sortOrder,
  onSortFieldChange,
  onToggleSortOrder,
  selectedCategory,
  onClearCategory,
  selectedPriority,
  onClearPriority,
  taskCount,
}) => {
  return (
    <div className="bg-slate-950/70 border-b border-slate-800/80 px-4 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
      {/* Left: Search input & Active Filters */}
      <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[240px]">
        {/* Search bar */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search tasks, descriptions..."
            className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg pl-9 pr-8 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 outline-none transition"
          />
          {searchQuery && (
            <button
              onClick={() => {
                soundEffects.playTactileClick();
                onSearchChange('');
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter tags (interactive button chips with clear handlers) */}
        {selectedCategory && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-700/80 text-xs text-slate-200">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: selectedCategory.color }}
            />
            <span className="font-medium truncate max-w-[120px]">
              {selectedCategory.name}
            </span>
            <button
              onClick={() => {
                soundEffects.playTactileClick();
                onClearCategory();
              }}
              className="text-slate-400 hover:text-white p-0.5"
              title="Remove filter"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {selectedPriority && (
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs border ${PRIORITY_CONFIGS[selectedPriority].bgColor} ${PRIORITY_CONFIGS[selectedPriority].borderColor} ${PRIORITY_CONFIGS[selectedPriority].textColor}`}
          >
            <span className="font-semibold font-mono">
              {PRIORITY_CONFIGS[selectedPriority].code}
            </span>
            <span>{PRIORITY_CONFIGS[selectedPriority].label}</span>
            <button
              onClick={() => {
                soundEffects.playTactileClick();
                onClearPriority();
              }}
              className="opacity-70 hover:opacity-100 p-0.5"
              title="Remove priority filter"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        <span className="text-xs text-slate-500 font-mono tabular-nums hidden sm:inline">
          {taskCount} {taskCount === 1 ? 'task' : 'tasks'}
        </span>
      </div>

      {/* Right: View Mode Toggle & Sort options */}
      <div className="flex items-center gap-2">
        {/* Sort dropdown */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
          <select
            value={sortField}
            onChange={(e) => {
              soundEffects.playTactileClick();
              onSortFieldChange(e.target.value as SortField);
            }}
            className="bg-transparent text-xs text-slate-300 px-2 py-1 outline-none cursor-pointer"
            title="Sort tasks"
          >
            <option value="dueDate" className="bg-slate-900 text-slate-200">Sort: Due Date</option>
            <option value="priority" className="bg-slate-900 text-slate-200">Sort: Priority</option>
            <option value="createdAt" className="bg-slate-900 text-slate-200">Sort: Created</option>
            <option value="title" className="bg-slate-900 text-slate-200">Sort: Title</option>
          </select>
          <button
            onClick={() => {
              soundEffects.playTactileClick();
              onToggleSortOrder();
            }}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
            title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* View Segmented Toggle: List vs Kanban */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
          <button
            onClick={() => {
              soundEffects.playTactileClick();
              onSetViewMode('list');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
              viewMode === 'list'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="List View"
          >
            <LayoutList className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">List</span>
          </button>

          <button
            onClick={() => {
              soundEffects.playTactileClick();
              onSetViewMode('kanban');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
              viewMode === 'kanban'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Kanban Board View"
          >
            <Kanban className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Board</span>
          </button>
        </div>
      </div>
    </div>
  );
};
