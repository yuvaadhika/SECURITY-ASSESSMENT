import React, { useState, useEffect } from 'react';
import { 
  Wifi, 
  BatteryMedium, 
  Smartphone, 
  Monitor, 
  ExternalLink,
  ShieldAlert,
  Sparkles
} from 'lucide-react';

interface AndroidPhoneFrameProps {
  children: React.ReactNode;
  viewMode: 'phone' | 'desktop';
  setViewMode: (mode: 'phone' | 'desktop') => void;
  onOpenReport: () => void;
}

export const AndroidPhoneFrame: React.FC<AndroidPhoneFrameProps> = ({
  children,
  viewMode,
  setViewMode,
  onOpenReport
}) => {
  const [currentTime, setCurrentTime] = useState<string>('09:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-100/80 text-slate-900 flex flex-col font-sans selection:bg-blue-500/20 selection:text-blue-900">
      {/* Top Desktop Control Bar (Only shown on desktop / tablet screens >= 768px) */}
      <div className="hidden md:flex items-center justify-between px-6 py-2.5 bg-white border-b border-slate-200 shadow-sm z-40 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 font-display font-bold text-sm text-slate-900">
              <span>NTRO Security Assessment Suite</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                PS-26163
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Target: World Monitor (koala73/worldmonitor)
            </p>
          </div>
        </div>

        {/* Viewport Mode Switcher & Actions */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('phone')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'phone'
                  ? 'bg-white text-blue-700 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>📱 Android Phone View</span>
            </button>
            <button
              onClick={() => setViewMode('desktop')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'desktop'
                  ? 'bg-white text-blue-700 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>💻 Full Screen View</span>
            </button>
          </div>

          <a
            href="https://github.com/koala73/worldmonitor"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-slate-600 hover:text-blue-600 flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white"
          >
            <span>Target Repo</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Main Container Area */}
      {viewMode === 'phone' ? (
        <div className="flex-1 flex items-center justify-center p-0 md:p-6 lg:p-8">
          {/* Android Mobile Phone Shell */}
          <div className="w-full md:max-w-[430px] md:h-[915px] md:rounded-[48px] bg-slate-900 md:shadow-2xl md:ring-12 md:ring-slate-800 md:ring-offset-4 md:ring-offset-slate-200/60 overflow-hidden flex flex-col relative transition-all duration-300">
            
            {/* Top Android Status Bar */}
            <div className="bg-white border-b border-slate-100 px-6 pt-3 pb-2 flex items-center justify-between text-xs text-slate-800 font-semibold select-none z-30 flex-shrink-0">
              {/* Clock */}
              <div className="text-[13px] font-medium tracking-tight text-slate-900">
                {currentTime}
              </div>

              {/* Android Punch Hole Camera */}
              <div className="w-4 h-4 rounded-full bg-slate-900 flex items-center justify-center shadow-inner">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-950 ring-1 ring-slate-800" />
              </div>

              {/* Status Icons: 5G, Wi-Fi, Battery */}
              <div className="flex items-center gap-2 text-slate-700">
                <span className="text-[10px] font-bold tracking-tighter">5G</span>
                <Wifi className="w-3.5 h-3.5 text-slate-800" />
                <div className="flex items-center gap-1">
                  <span className="text-[11px] font-medium">98%</span>
                  <div className="w-5 h-2.5 rounded-sm border border-slate-700 p-0.5 flex items-center">
                    <div className="w-3.5 h-1.5 bg-slate-800 rounded-2xs" />
                  </div>
                </div>
              </div>
            </div>

            {/* Android Screen Scrollable Body */}
            <div className="flex-1 overflow-y-auto bg-slate-50 relative flex flex-col">
              {children}
            </div>

            {/* Bottom Android Gesture Navigation Bar */}
            <div className="bg-white border-t border-slate-200 py-2 flex items-center justify-center select-none flex-shrink-0">
              <div className="w-32 h-1 bg-slate-400 rounded-full hover:bg-slate-600 transition-colors" />
            </div>
          </div>
        </div>
      ) : (
        /* Full Screen Expanded Layout */
        <div className="flex-1 flex flex-col bg-slate-50">
          {children}
        </div>
      )}
    </div>
  );
};
