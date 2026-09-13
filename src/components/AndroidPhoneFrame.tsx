import React from 'react';
import { Smartphone, Monitor } from 'lucide-react';

interface AndroidPhoneFrameProps {
  children: React.ReactNode;
  viewMode: 'phone' | 'desktop';
  setViewMode: (mode: 'phone' | 'desktop') => void;
  onOpenReport: () => void;
}

export const AndroidPhoneFrame: React.FC<AndroidPhoneFrameProps> = ({
  children,
  viewMode,
  setViewMode
}) => {
  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Subtle Top View Switcher (Desktop only) */}
      <div className="hidden md:flex items-center justify-end px-6 py-2 bg-white border-b border-slate-200 z-30 sticky top-0">
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setViewMode('phone')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'phone'
                ? 'bg-white text-blue-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile View</span>
          </button>
          <button
            onClick={() => setViewMode('desktop')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'desktop'
                ? 'bg-white text-blue-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Full Screen</span>
          </button>
        </div>
      </div>

      {/* Main Container without any phone outline/bezel */}
      {viewMode === 'phone' ? (
        <div className="flex-1 flex justify-center bg-slate-100/70">
          <div className="w-full max-w-[440px] min-h-screen bg-slate-50 border-x border-slate-200 flex flex-col shadow-xs">
            {children}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col bg-slate-50">
          {children}
        </div>
      )}
    </div>
  );
};
