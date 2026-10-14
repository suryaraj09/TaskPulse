import React from 'react';
import { Share, PlusSquare, X } from 'lucide-react';
import { soundEffects } from '../services/soundEffects';

interface IOSInstallGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IOSInstallGuide: React.FC<IOSInstallGuideProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-5 shadow-2xl text-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <h3 className="text-sm font-bold text-white">Install on iPhone / iPad</h3>
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

        <div className="space-y-4 text-xs">
          <p className="text-slate-300 leading-relaxed">
            Install <strong>TaskPulse</strong> to your home screen for instant full-screen access and offline support:
          </p>

          <ol className="space-y-3 pl-1">
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-slate-800 text-indigo-400 font-mono font-bold flex items-center justify-center shrink-0">
                1
              </span>
              <span>
                Tap the <strong className="text-white">Share</strong> button <Share className="w-4 h-4 inline text-indigo-400 ml-1" /> in the bottom Safari toolbar.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-slate-800 text-indigo-400 font-mono font-bold flex items-center justify-center shrink-0">
                2
              </span>
              <span>
                Scroll down and tap <strong className="text-white">Add to Home Screen</strong> <PlusSquare className="w-4 h-4 inline text-indigo-400 ml-1" />.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-slate-800 text-indigo-400 font-mono font-bold flex items-center justify-center shrink-0">
                3
              </span>
              <span>
                Tap <strong className="text-white">Add</strong> in the top right corner.
              </span>
            </li>
          </ol>
        </div>

        <button
          onClick={() => {
            soundEffects.playTactileClick();
            onClose();
          }}
          className="mt-5 w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition"
        >
          Got it
        </button>
      </div>
    </div>
  );
};
