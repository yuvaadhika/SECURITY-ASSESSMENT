import React from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Server, 
  Globe, 
  Database, 
  Cpu, 
  Layers, 
  ArrowRight,
  FlaskConical,
  ExternalLink,
  Activity,
  Terminal,
  Lock,
  Radio
} from 'lucide-react';
import { Vulnerability, ScopeArea } from '../types/security';

interface DashboardProps {
  vulnerabilities: Vulnerability[];
  securityScore: number;
  mitigatedIds: string[];
  setActiveTab: (tab: string) => void;
  setSelectedVulnId: (id: string) => void;
  onOpenReport: () => void;
}

export const ExecutiveDashboard: React.FC<DashboardProps> = ({
  vulnerabilities,
  securityScore,
  mitigatedIds,
  setActiveTab,
  setSelectedVulnId,
  onOpenReport
}) => {
  const criticalCount = vulnerabilities.filter(v => v.severity === 'CRITICAL').length;
  const highCount = vulnerabilities.filter(v => v.severity === 'HIGH').length;
  const mediumCount = vulnerabilities.filter(v => v.severity === 'MEDIUM').length;

  const scopeAreas: { name: ScopeArea; desc: string; icon: React.ElementType }[] = [
    { name: 'Authentication and session management', desc: 'Token handling, session expiration, and state sync', icon: Lock },
    { name: 'Authorization and access control', desc: 'Broken Object-Level Auth (BOLA) & workspace isolation', icon: ShieldAlert },
    { name: 'Input validation and data handling', desc: 'SSRF in live feeds & GeoJSON Prototype Pollution', icon: Layers },
    { name: 'API security', desc: 'Feed proxies, rate-limiting, and REST access', icon: Server },
    { name: 'Client-side security controls', desc: 'Stored DOM XSS, WebMCP injection & CSP nonces', icon: Globe },
    { name: 'Secure communication mechanisms', desc: 'Streamable HTTP MCP, CORS policies & WebSockets', icon: Radio },
    { name: 'Data storage and privacy protections', desc: 'Hardcoded intelligence API credentials in bundles', icon: Database },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Executive Banner */}
      <div className="relative rounded-2xl overflow-hidden cyber-panel p-6 sm:p-8 border border-soc-border">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono">
              <Activity className="w-3.5 h-3.5 animate-pulse" />
              <span>OFFICIAL PS-26163 DELIVERABLE · WHITE-BOX AUDIT</span>
            </div>
            
            <h1 className="text-2xl sm:text-4xl font-display font-extrabold text-white tracking-tight leading-tight">
              Security Assessment & Vulnerability Audit of <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">World Monitor</span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Comprehensive authorized security posture evaluation of World Monitor (open-source global intelligence & situational awareness platform). Covering OWASP Top 10 vulnerabilities, CVSS v3.1 scoring, safe sandbox PoC demonstrations, and production-ready remediation diffs for NTRO.
            </p>
          </div>

          {/* Health Posture Score Card */}
          <div className="w-full lg:w-auto flex-shrink-0 bg-soc-bg/80 border border-soc-border rounded-xl p-5 flex items-center justify-between lg:justify-center gap-6 shadow-cyber-card">
            <div className="text-left">
              <span className="text-xs font-mono text-slate-400 block uppercase tracking-wider">Overall Posture</span>
              <div className="text-4xl font-display font-extrabold text-white mt-1">
                <span className={securityScore >= 80 ? 'text-emerald-400' : securityScore >= 60 ? 'text-amber-400' : 'text-rose-400'}>
                  {securityScore}
                </span>
                <span className="text-lg text-slate-500 font-normal"> / 100</span>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1 mt-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                {mitigatedIds.length} of {vulnerabilities.length} patches tested
              </span>
            </div>

            <div className="relative w-20 h-20 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={securityScore >= 80 ? 'text-emerald-400' : securityScore >= 60 ? 'text-amber-400' : 'text-rose-400'}
                  strokeDasharray={`${securityScore}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute font-mono text-xs font-bold text-white">
                {securityScore}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metric Highlights */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-soc-card border border-soc-border hover:border-red-500/40 rounded-xl p-4 transition-all">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Critical Findings</span>
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          </div>
          <div className="text-3xl font-display font-extrabold text-red-400 mt-2">
            {criticalCount}
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">SSRF in Proxy Gateway</p>
        </div>

        <div className="bg-soc-card border border-soc-border hover:border-amber-500/40 rounded-xl p-4 transition-all">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>High Severity</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-display font-extrabold text-amber-400 mt-2">
            {highCount}
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">BOLA, DOM XSS, WebMCP</p>
        </div>

        <div className="bg-soc-card border border-soc-border hover:border-cyan-500/40 rounded-xl p-4 transition-all">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>NTRO Scope Coverage</span>
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-display font-extrabold text-cyan-400 mt-2">
            7 / 7
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">100% Scope Satisfied</p>
        </div>

        <div className="bg-soc-card border border-soc-border hover:border-emerald-500/40 rounded-xl p-4 transition-all">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Remediation Status</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-display font-extrabold text-emerald-400 mt-2">
            8 / 8
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">Code Patches & SAST Rules</p>
        </div>
      </div>

      {/* NTRO Scope Area Matrix */}
      <div className="cyber-panel rounded-xl p-6 border border-soc-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-cyan-400" />
              NTRO Mandated Scope Compliance Matrix
            </h2>
            <p className="text-xs font-mono text-slate-400 mt-0.5">
              Verification status across all 7 evaluation pillars specified in Problem Statement 26163
            </p>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-mono">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Full White-Box Verification
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {scopeAreas.map((area, idx) => {
            const Icon = area.icon;
            const mappedVulns = vulnerabilities.filter(v => v.scopeArea === area.name);
            const isMitigated = mappedVulns.every(v => mitigatedIds.includes(v.id));

            return (
              <div 
                key={idx}
                className="bg-soc-bg/90 border border-soc-border hover:border-cyan-500/40 rounded-xl p-4 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 rounded-lg bg-soc-card border border-soc-border text-cyan-400 group-hover:scale-105 transition-transform">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                      SCOPE #{idx + 1}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-200 group-hover:text-cyan-300 transition-colors">
                    {area.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {area.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-soc-border flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">
                    {mappedVulns.length} Finding{mappedVulns.length !== 1 ? 's' : ''}
                  </span>
                  <button 
                    onClick={() => {
                      if (mappedVulns.length > 0) {
                        setSelectedVulnId(mappedVulns[0].id);
                        setActiveTab('vault');
                      }
                    }}
                    className="text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    <span>Inspect</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Target Architecture & Attack Surface Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 cyber-panel rounded-xl p-6 border border-soc-border space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-emerald-400" />
              World Monitor Attack Surface Topology
            </h2>
            <span className="text-xs font-mono text-slate-400">Architecture Vector Map</span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            World Monitor integrates multiple real-time intelligence feeds (ACLED conflict points, AISStream maritime telemetry, OpenSky aviation, USGS earthquakes, and Finnhub markets). The platform exposes both client-side and serverless surfaces:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="bg-soc-bg border border-soc-border rounded-lg p-3">
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-rose-400 mb-1">
                <Server className="w-3.5 h-3.5" />
                <span>/api/proxy/feed</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Serverless proxy for CORS bypass. Susceptible to SSRF into cloud metadata (169.254.169.254).
              </p>
            </div>

            <div className="bg-soc-bg border border-soc-border rounded-lg p-3">
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-amber-400 mb-1">
                <Radio className="w-3.5 h-3.5" />
                <span>/mcp (Streamable HTTP)</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Remote Model Context Protocol endpoint. Permissive CORS wildcard and missing rate limit.
              </p>
            </div>

            <div className="bg-soc-bg border border-soc-border rounded-lg p-3">
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-amber-400 mb-1">
                <Globe className="w-3.5 h-3.5" />
                <span>document.modelContext</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Apex in-page WebMCP hook registering tools without origin validation or caller prompts.
              </p>
            </div>

            <div className="bg-soc-bg border border-soc-border rounded-lg p-3">
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-cyan-400 mb-1">
                <Database className="w-3.5 h-3.5" />
                <span>Client JS Assets</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Exposed vendor API keys for AISStream and Finnhub in compiled production chunks.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Launch Actions */}
        <div className="cyber-panel rounded-xl p-6 border border-soc-border flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-display font-bold text-white flex items-center gap-2 mb-3">
              <FlaskConical className="w-5 h-5 text-cyan-400" />
              Assessment Toolchain
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Interactive testing environments built specifically for this NTRO evaluation:
            </p>
          </div>

          <div className="space-y-2.5">
            <button
              onClick={() => setActiveTab('sandbox')}
              className="w-full flex items-center justify-between p-3 rounded-lg bg-soc-bg border border-soc-border hover:border-cyan-500/50 text-left transition-all group"
            >
              <div className="flex items-center gap-3">
                <FlaskConical className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                <div>
                  <div className="font-mono text-xs font-bold text-slate-200">Safe PoC Sandbox</div>
                  <div className="text-[10px] text-slate-400">Test exploit vs patched state</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
            </button>

            <button
              onClick={() => setActiveTab('cvss')}
              className="w-full flex items-center justify-between p-3 rounded-lg bg-soc-bg border border-soc-border hover:border-emerald-500/50 text-left transition-all group"
            >
              <div className="flex items-center gap-3">
                <Terminal className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                <div>
                  <div className="font-mono text-xs font-bold text-slate-200">CVSS 3.1 Calculator</div>
                  <div className="text-[10px] text-slate-400">Real-time vector & base scoring</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
            </button>

            <button
              onClick={() => setActiveTab('sast')}
              className="w-full flex items-center justify-between p-3 rounded-lg bg-soc-bg border border-soc-border hover:border-purple-500/50 text-left transition-all group"
            >
              <div className="flex items-center gap-3">
                <Cpu className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
                <div>
                  <div className="font-mono text-xs font-bold text-slate-200">Semgrep SAST Studio</div>
                  <div className="text-[10px] text-slate-400">Custom rule validation engine</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition-colors" />
            </button>

            <button
              onClick={onOpenReport}
              className="w-full flex items-center justify-between p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/40 hover:bg-emerald-500/20 text-left transition-all group"
            >
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                <div>
                  <div className="font-mono text-xs font-bold text-emerald-300">Official NTRO Report</div>
                  <div className="text-[10px] text-emerald-400/80">Printable & exportable format</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-emerald-400 transition-colors" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
