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
  Zap
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
    { id: 'dashboard', label: 'Command Center', icon: Terminal },
    { id: 'vault', label: 'Vulnerability Vault', icon: ShieldAlert, badge: `${totalCount}` },
    { id: 'sandbox', label: 'Safe PoC Lab', icon: FlaskConical },
    { id: 'cvss', label: 'CVSS 3.1 Calculator', icon: Calculator },
    { id: 'sast', label: 'Semgrep SAST Studio', icon: Code2 },
    { id: 'toolchain', label: 'Python & Toolchain', icon: Cpu },
  ];

  return (
    <header className="sticky top-0 z-50 bg-soc-card/90 backdrop-blur-md border-b border-soc-border">
      {/* Top Banner: NTRO & SIH Badging */}
      <div className="bg-gradient-to-r from-red-950/40 via-soc-card to-emerald-950/40 border-b border-soc-border/60 px-4 py-1.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-mono font-semibold text-soc-accent tracking-wider">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-emerald-400 font-bold">NTRO</span> // PS-26163
          </div>
          <span className="hidden sm:inline text-soc-muted">|</span>
          <span className="hidden sm:inline text-slate-300">
            Security Assessment of the World Monitor Application
          </span>
        </div>

        <div className="flex items-center gap-3 font-mono text-[11px]">
          <div className="flex items-center gap-1.5 text-slate-400">
            <span>Target:</span>
            <a 
              href="https://www.worldmonitor.app" 
              target="_blank" 
              rel="noreferrer"
              className="text-cyan-400 hover:underline flex items-center gap-1"
            >
              worldmonitor.app
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <span className="text-soc-muted">|</span>
          <a
            href="https://github.com/koala73/worldmonitor"
            target="_blank"
            rel="noreferrer"
            className="text-slate-400 hover:text-white flex items-center gap-1"
          >
            koala73/worldmonitor (AGPL-3.0)
          </a>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo & Brand */}
        <div 
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="relative w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-500/40 flex items-center justify-center shadow-glow-cyan">
            <ShieldAlert className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-soc-bg" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-extrabold text-base tracking-tight text-white group-hover:text-cyan-400 transition-colors">
                WORLD MONITOR
              </span>
              <span className="bg-red-500/20 text-red-400 border border-red-500/40 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded">
                AUDIT SUITE
              </span>
            </div>
            <p className="text-[11px] font-mono text-soc-muted">
              NTRO White-Box Security Assessment
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1 bg-soc-bg/80 p-1 rounded-xl border border-soc-border">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono font-medium transition-all ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-glow-cyan'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-soc-card'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-cyan-400 text-soc-bg' : 'bg-soc-border text-slate-300'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Action Controls & Health Score */}
        <div className="flex items-center gap-3">
          {/* Health Posture Badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-soc-bg border border-soc-border font-mono text-xs">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span className="text-slate-400">Posture Score:</span>
            </div>
            <span className={`font-bold ${
              securityScore >= 80 ? 'text-emerald-400' : securityScore >= 60 ? 'text-amber-400' : 'text-rose-400'
            }`}>
              {securityScore}/100
            </span>
          </div>

          {/* Official Report Generator CTA */}
          <button
            onClick={onOpenReport}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-soc-bg font-mono font-bold text-xs uppercase px-4 py-2.5 rounded-lg shadow-glow-green transition-all transform active:scale-95"
          >
            <FileText className="w-4 h-4" />
            <span>Official Report</span>
          </button>
        </div>
      </div>

      {/* Mobile Tab Navigation */}
      <div className="lg:hidden flex items-center gap-1 overflow-x-auto px-4 py-2 border-t border-soc-border bg-soc-bg/95">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono whitespace-nowrap ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
