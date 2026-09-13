import React from 'react';
import { 
  ShieldAlert, 
  Terminal, 
  Calculator, 
  FileText, 
  Code2, 
  FlaskConical, 
  Cpu, 
  ShieldCheck, 
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
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'vault', label: 'Vault', icon: ShieldAlert, badge: `${totalCount}` },
    { id: 'sandbox', label: 'PoC Lab', icon: FlaskConical },
    { id: 'cvss', label: 'CVSS', icon: Calculator },
    { id: 'sast', label: 'SAST', icon: Code2 },
    { id: 'toolchain', label: 'Tools', icon: Cpu },
  ];

  return (
    <>
      {/* Clean Top App Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="px-4 py-3 flex items-center justify-between gap-3">
          {/* Logo & Brand */}
          <div 
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
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

          {/* Header Score & Action Button */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs">
              <span className="text-slate-500 font-medium text-[11px]">Score:</span>
              <span className={`font-bold font-mono ${
                securityScore >= 80 ? 'text-emerald-600' : securityScore >= 60 ? 'text-amber-600' : 'text-rose-600'
              }`}>
                {securityScore}/100
              </span>
            </div>

            <button
              onClick={onOpenReport}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-medium text-xs px-3 py-1.5 rounded-lg shadow-xs transition-all"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Report</span>
            </button>
          </div>
        </div>

        {/* Desktop / Tablet Horizontal Navigation */}
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
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 font-semibold shadow-2xs'
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

      {/* Android Mobile Bottom Navigation Bar (Ultra-Clean Spacing) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg">
        <div className="max-w-[440px] md:max-w-lg mx-auto grid grid-cols-6 py-1.5 px-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center py-1 transition-all relative ${
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
                <span className="text-[10px] mt-0.5 tracking-tight font-medium">
                  {item.label}
                </span>
                {isActive && (
                  <span className="w-2.5 h-0.5 bg-blue-600 rounded-full mt-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
