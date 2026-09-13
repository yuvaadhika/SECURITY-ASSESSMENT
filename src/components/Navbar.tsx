import React from 'react';
import { 
  ShieldAlert, 
  Terminal, 
  Calculator, 
  FileText, 
  Code2, 
  FlaskConical, 
  Cpu, 
  ExternalLink,
  ShieldCheck,
  Zap,
  LayoutDashboard
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  securityScore: number;
  onOpenReport: () => void;
  mitigatedCount: number;
  totalCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  securityScore,
  onOpenReport,
  mitigatedCount,
  totalCount
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'vault', label: 'Findings', icon: ShieldAlert, badge: `${totalCount}` },
    { id: 'sandbox', label: 'PoC Lab', icon: FlaskConical },
    { id: 'cvss', label: 'CVSS 3.1', icon: Calculator },
    { id: 'sast', label: 'SAST Studio', icon: Code2 },
    { id: 'toolchain', label: 'Automation', icon: Cpu },
  ];

  return (
    <>
      {/* Top Android App Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-soft-sm">
        {/* Top Micro Banner */}
        <div className="bg-slate-900 text-white px-3.5 py-1.5 flex items-center justify-between text-[11px] font-mono">
          <div className="flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="font-bold text-emerald-400">NTRO</span>
            <span className="text-slate-400">| PS-26163</span>
          </div>

          <div className="flex items-center gap-2 text-slate-300">
            <span>Score:</span>
            <span className={`font-bold ${
              securityScore >= 80 ? 'text-emerald-400' : securityScore >= 60 ? 'text-amber-400' : 'text-rose-400'
            }`}>
              {securityScore}/100
            </span>
          </div>
        </div>

        {/* Main Header Action Area */}
        <div className="px-4 py-2.5 flex items-center justify-between gap-2">
          {/* Logo & Brand */}
          <div 
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-bold text-sm text-slate-900 leading-tight">
                  World Monitor
                </span>
                <span className="bg-rose-100 text-rose-700 text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full border border-rose-200">
                  AUDIT
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">
                Security Assessment
              </p>
            </div>
          </div>

          {/* Quick Action Button: Official Report */}
          <button
            onClick={onOpenReport}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-medium text-xs px-3 py-1.5 rounded-lg shadow-sm transition-all"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Report</span>
          </button>
        </div>

        {/* Desktop / Tablet Horizontal Navigation (when viewed in Full Screen mode) */}
        <nav className="hidden lg:flex items-center gap-1 px-4 py-1.5 border-t border-slate-100 bg-slate-50/50">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-soft-sm font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </header>

      {/* Android Mobile Bottom Navigation Bar (Standard Mobile Experience) */}
      <div className="sticky bottom-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] px-2 py-1.5">
        <div className="grid grid-cols-6 gap-1 max-w-lg mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all relative ${
                  isActive
                    ? 'text-blue-600 font-semibold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <div className={`p-1 rounded-lg transition-colors relative ${
                  isActive ? 'bg-blue-50 text-blue-600' : 'text-slate-500'
                }`}>
                  <Icon className="w-4 h-4" />
                  {item.badge && (
                    <span className="absolute -top-1 -right-1.5 bg-rose-500 text-white text-[8px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[54px]">
                  {item.label}
                </span>
                {isActive && (
                  <span className="w-3 h-0.5 bg-blue-600 rounded-full mt-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
