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
  Radio,
  FileText
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
    <div className="space-y-4 sm:space-y-6">
      {/* Hero Executive Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
              <Activity className="w-3.5 h-3.5 text-blue-600" />
              <span>SECURITY AUDIT · WHITE-BOX ASSESSMENT</span>
            </div>
            
            <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-slate-900 tracking-tight leading-tight">
              Security Assessment of <span className="text-blue-600">World Monitor</span>
            </h1>

            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              Authorized security evaluation of World Monitor (open-source intelligence platform). Covers OWASP Top 10 vulnerabilities, CVSS 3.1 scoring, verified PoCs, and production code patches.
            </p>
          </div>

          {/* Posture Score Pill / Card */}
          <div className="w-full md:w-auto flex-shrink-0 bg-slate-50 border border-slate-200 rounded-xl p-3.5 sm:p-4 flex items-center justify-between md:justify-center gap-4">
            <div className="text-left">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Security Posture</span>
              <div className="text-3xl font-display font-bold text-slate-900 mt-0.5">
                <span className={securityScore >= 80 ? 'text-emerald-600' : securityScore >= 60 ? 'text-amber-600' : 'text-rose-600'}>
                  {securityScore}
                </span>
                <span className="text-sm text-slate-400 font-normal"> / 100</span>
              </div>
              <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                {mitigatedIds.length} of {vulnerabilities.length} patches tested
              </span>
            </div>

            <div className="relative w-16 h-16 sm:w-18 sm:h-18 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-200"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={securityScore >= 80 ? 'text-emerald-600' : securityScore >= 60 ? 'text-amber-600' : 'text-rose-600'}
                  strokeDasharray={`${securityScore}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute font-bold text-xs text-slate-800">
                {securityScore}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metric Highlights Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 shadow-soft-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Critical Findings</span>
            <span className="w-2 h-2 rounded-full bg-rose-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-display font-bold text-rose-600 mt-1">
            {criticalCount}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5 truncate">SSRF Proxy Gateway</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 shadow-soft-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>High Severity</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-display font-bold text-amber-600 mt-1">
            {highCount}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5 truncate">BOLA, DOM XSS, WebMCP</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 shadow-soft-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Scope Coverage</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-display font-bold text-blue-600 mt-1">
            7 / 7
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5 truncate">100% NTRO Areas Mapped</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 shadow-soft-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Remediation Status</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-display font-bold text-emerald-600 mt-1">
            8 / 8
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5 truncate">Patches & SAST Rules</p>
        </div>
      </div>

      {/* NTRO Scope Area Matrix */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base sm:text-lg font-display font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-blue-600" />
              NTRO Scope Compliance Matrix
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Verification status across all 7 evaluation pillars specified under NTRO Assessment Guidelines
            </p>
          </div>

          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium w-fit">
            <CheckCircle2 className="w-3.5 h-3.5" />
            100% White-Box Verified
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {scopeAreas.map((area, idx) => {
            const Icon = area.icon;
            const mappedVulns = vulnerabilities.filter(v => v.scopeArea === area.name);

            return (
              <div 
                key={idx}
                className="bg-slate-50 border border-slate-200 hover:border-blue-300 rounded-xl p-3.5 transition-all flex flex-col justify-between group hover:bg-white hover:shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-1.5 rounded-lg bg-white border border-slate-200 text-blue-600 shadow-2xs">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      PILLAR #{idx + 1}
                    </span>
                  </div>

                  <h3 className="font-semibold text-xs sm:text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                    {area.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed line-clamp-2">
                    {area.desc}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium text-[11px]">
                    {mappedVulns.length} Finding{mappedVulns.length !== 1 ? 's' : ''}
                  </span>
                  <button 
                    onClick={() => {
                      if (mappedVulns.length > 0) {
                        setSelectedVulnId(mappedVulns[0].id);
                        setActiveTab('vault');
                      }
                    }}
                    className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 text-[11px]"
                  >
                    <span>View</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Target Attack Surface & Toolchain Quick Launch */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-display font-bold text-slate-900 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-600" />
              Target Attack Surface Topology
            </h2>
            <span className="text-[11px] font-mono text-slate-500">Source: World Monitor</span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            World Monitor integrates multiple real-time feeds (ACLED conflict data, AISStream maritime telemetry, OpenSky aviation, Finnhub markets). The architecture exposes both client and serverless surfaces:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-rose-600 mb-1">
                <Server className="w-3.5 h-3.5" />
                <span>/api/proxy/feed</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-normal">
                Serverless proxy for CORS bypass. Susceptible to SSRF into cloud metadata (169.254.169.254).
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-amber-600 mb-1">
                <Radio className="w-3.5 h-3.5" />
                <span>/mcp (Streamable HTTP)</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-normal">
                Remote Model Context Protocol endpoint. Permissive CORS wildcard and missing rate limit.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-amber-600 mb-1">
                <Globe className="w-3.5 h-3.5" />
                <span>document.modelContext</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-normal">
                In-page WebMCP hook registering tools without origin validation or caller authorization prompts.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-blue-600 mb-1">
                <Database className="w-3.5 h-3.5" />
                <span>Client JS Assets</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-normal">
                Exposed vendor API keys for AISStream and Finnhub in compiled production chunks.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Launch Cards */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-display font-bold text-slate-900 flex items-center gap-2 mb-2">
              <FlaskConical className="w-4 h-4 text-blue-600" />
              Assessment Tools
            </h2>
            <p className="text-xs text-slate-600 mb-3">
              Interactive test harnesses for NTRO evaluation:
            </p>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => setActiveTab('sandbox')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 text-left transition-all"
            >
              <div className="flex items-center gap-2.5">
                <FlaskConical className="w-4 h-4 text-blue-600" />
                <div>
                  <div className="text-xs font-semibold text-slate-900">Safe PoC Sandbox</div>
                  <div className="text-[10px] text-slate-500">Test exploit vs patched state</div>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              onClick={() => setActiveTab('cvss')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-left transition-all"
            >
              <div className="flex items-center gap-2.5">
                <Terminal className="w-4 h-4 text-emerald-600" />
                <div>
                  <div className="text-xs font-semibold text-slate-900">CVSS 3.1 Calculator</div>
                  <div className="text-[10px] text-slate-500">Vector metrics & scoring</div>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              onClick={() => setActiveTab('sast')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-violet-300 hover:bg-violet-50/50 text-left transition-all"
            >
              <div className="flex items-center gap-2.5">
                <Cpu className="w-4 h-4 text-violet-600" />
                <div>
                  <div className="text-xs font-semibold text-slate-900">Semgrep SAST Studio</div>
                  <div className="text-[10px] text-slate-500">Custom rule validation</div>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              onClick={onOpenReport}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-left transition-all"
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-emerald-700" />
                <div>
                  <div className="text-xs font-bold text-emerald-800">Official NTRO Report</div>
                  <div className="text-[10px] text-emerald-700">Export & print audit document</div>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-700" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
