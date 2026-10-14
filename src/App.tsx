import React, { useState, useEffect } from 'react';
import { useTaskManager } from './hooks/useTaskManager';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { TaskToolbar } from './components/TaskToolbar';
import { TaskListView } from './components/TaskListView';
import { TaskKanbanView } from './components/TaskKanbanView';
import { TaskModal } from './components/TaskModal';
import { CategoryModal } from './components/CategoryModal';
import { IOSInstallGuide } from './components/IOSInstallGuide';
import { NotificationToastContainer } from './components/NotificationToastContainer';
import { TaskItem, Category, TaskStatus } from './types/todo';
import { soundEffects } from './services/soundEffects';

export default function App() {
  const {
    tasks,
    categories,
    filteredTasks,
    stats,
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
    sortOrder,
    setSortField,
    setSortOrder,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    moveTaskStatus,
    snoozeTaskReminder,
    addCategory,
    updateCategory,
    deleteCategory,
    exportDataJSON,
    importDataJSON,
    resetToDefaults,
  } = useTaskManager();

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<TaskItem | null>(null);
  const [taskModalDefaultStatus, setTaskModalDefaultStatus] = useState<TaskStatus>('todo');

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);

  const [isIOSGuideOpen, setIsIOSGuideOpen] = useState(false);

  // Keyboard shortcut: Press 'n' to open new task modal when not typing in an input
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') {
        return;
      }

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        soundEffects.playTactileClick();
        setTaskToEdit(null);
        setTaskModalDefaultStatus('todo');
        setIsTaskModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const handleOpenNewTask = (status: TaskStatus = 'todo') => {
    setTaskToEdit(null);
    setTaskModalDefaultStatus(status);
    setIsTaskModalOpen(true);
  };

  const handleOpenEditTask = (task: TaskItem) => {
    setTaskToEdit(task);
    setIsTaskModalOpen(true);
  };

  const handleOpenAddCategory = () => {
    setCategoryToEdit(null);
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (category: Category) => {
    setCategoryToEdit(category);
    setIsCategoryModalOpen(true);
  };

  const selectedCategoryObj = categories.find((c) => c.id === selectedCategoryId);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Toast Alert System for Triggered Push Reminders */}
      <NotificationToastContainer
        onCompleteTask={toggleTaskComplete}
        onSnoozeTask={snoozeTaskReminder}
      />

      {/* Top Bar Navigation */}
      <Header
        statusFilter={statusFilter}
        onSelectFilter={setStatusFilter}
        onOpenNewTaskModal={() => handleOpenNewTask('todo')}
        stats={stats}
      />

      {/* Main App Layout */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        {/* Category & Priority Navigation Sidebar */}
        <Sidebar
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
          onOpenAddCategoryModal={handleOpenAddCategory}
          onOpenEditCategoryModal={handleOpenEditCategory}
          onDeleteCategory={deleteCategory}
          selectedPriority={selectedPriority}
          onSelectPriority={setSelectedPriority}
          stats={stats}
          onExportData={exportDataJSON}
          onImportData={importDataJSON}
          onResetData={resetToDefaults}
          onShowIOSGuide={() => setIsIOSGuideOpen(true)}
        />

        {/* Workspace Canvas (Toolbar + List or Kanban view) */}
        <main className="flex-1 flex flex-col min-w-0 bg-slate-950/40">
          <TaskToolbar
            viewMode={viewMode}
            onSetViewMode={setViewMode}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortField={sortField}
            sortOrder={sortOrder}
            onSortFieldChange={setSortField}
            onToggleSortOrder={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
            selectedCategory={selectedCategoryObj}
            onClearCategory={() => setSelectedCategoryId(null)}
            selectedPriority={selectedPriority}
            onClearPriority={() => setSelectedPriority(null)}
            taskCount={filteredTasks.length}
          />

          <div className="flex-1 overflow-y-auto">
            {viewMode === 'list' ? (
              <TaskListView
                tasks={filteredTasks}
                categories={categories}
                onToggleComplete={toggleTaskComplete}
                onEditTask={handleOpenEditTask}
                onDeleteTask={deleteTask}
                onMoveStatus={moveTaskStatus}
                onOpenNewTaskModal={() => handleOpenNewTask('todo')}
              />
            ) : (
              <TaskKanbanView
                tasks={filteredTasks}
                categories={categories}
                onToggleComplete={toggleTaskComplete}
                onEditTask={handleOpenEditTask}
                onDeleteTask={deleteTask}
                onMoveStatus={moveTaskStatus}
                onOpenNewTaskModalWithStatus={(status) => handleOpenNewTask(status)}
              />
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={createTask}
        onUpdate={updateTask}
        taskToEdit={taskToEdit}
        defaultStatus={taskModalDefaultStatus}
        categories={categories}
        onOpenAddCategoryModal={handleOpenAddCategory}
      />

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSave={addCategory}
        onUpdate={updateCategory}
        categoryToEdit={categoryToEdit}
      />

      <IOSInstallGuide
        isOpen={isIOSGuideOpen}
        onClose={() => setIsIOSGuideOpen(false)}
      />
    </div>
  );
}
