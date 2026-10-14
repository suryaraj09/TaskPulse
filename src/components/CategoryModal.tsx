import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { Category } from '../types/todo';
import { soundEffects } from '../services/soundEffects';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (catData: Omit<Category, 'id'>) => void;
  onUpdate: (id: string, updates: Partial<Category>) => void;
  categoryToEdit?: Category | null;
}

const PRESET_COLORS = [
  { hex: '#6366F1', name: 'Indigo' },
  { hex: '#10B981', name: 'Emerald' },
  { hex: '#F43F5E', name: 'Rose' },
  { hex: '#8B5CF6', name: 'Purple' },
  { hex: '#06B6D4', name: 'Cyan' },
  { hex: '#F59E0B', name: 'Amber' },
  { hex: '#3B82F6', name: 'Blue' },
  { hex: '#EC4899', name: 'Pink' },
];

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onUpdate,
  categoryToEdit,
}) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0].hex);

  useEffect(() => {
    if (categoryToEdit) {
      setName(categoryToEdit.name);
      setColor(categoryToEdit.color);
    } else {
      setName('');
      setColor(PRESET_COLORS[0].hex);
    }
  }, [categoryToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload = {
      name: name.trim(),
      color,
      bgClass: 'bg-slate-800',
      textClass: 'text-slate-200',
      borderClass: 'border-slate-700',
    };

    if (categoryToEdit) {
      onUpdate(categoryToEdit.id, payload);
    } else {
      onSave(payload);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm shadow-2xl p-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <h3 className="text-sm font-bold text-white">
            {categoryToEdit ? 'Edit Category' : 'Create Category'}
          </h3>
          <button
            onClick={() => {
              soundEffects.playTactileClick();
              onClose();
            }}
            className="p-1 rounded text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Category Name
            </label>
            <input
              type="text"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Design System"
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-3 py-2 text-xs text-white outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Color Accent
            </label>
            <div className="grid grid-cols-4 gap-2">
              {PRESET_COLORS.map((preset) => (
                <button
                  key={preset.hex}
                  type="button"
                  onClick={() => {
                    soundEffects.playTactileClick();
                    setColor(preset.hex);
                  }}
                  className={`h-9 rounded-lg flex items-center justify-center transition-all ${
                    color === preset.hex ? 'ring-2 ring-white scale-105' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: preset.hex }}
                  title={preset.name}
                >
                  {color === preset.hex && <Check className="w-4 h-4 text-white stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                soundEffects.playTactileClick();
                onClose();
              }}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg shadow-sm"
            >
              {categoryToEdit ? 'Save' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
