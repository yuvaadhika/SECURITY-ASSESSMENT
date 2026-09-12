import React, { useState } from 'react';
import { 
  Cpu, 
  Terminal, 
  Download, 
  Copy, 
  Check, 
  Play, 
  FileText, 
  ExternalLink,
  ShieldAlert,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { PYTHON_AUDIT_SCRIPTS, POSTMAN_COLLECTION_JSON, BURP_SUITE_CONFIG } from '../data/toolchainScripts';

export const ToolchainAutomation: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'python' | 'postman' | 'burp' | 'methodology'>('python');
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);
  const [isPyRunning, setIsPyRunning] = useState<boolean>(false);
  const [pyOutput, setPyOutput] = useState<string[]>([
    '[*] Python 3.11 Runtime Ready.',
    '[*] Click "Run Python Script Simulation" to trigger automated audit suite.'
  ]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLabel(label);
    setTimeout(() => setCopiedLabel(null), 2000);
  };

  const handleDownload = (filename: string, content: string, type: string = 'text/plain') => {
    const element = document.createElement('a');
    const file = new Blob([content], { type });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const runPythonSimulation = () => {
    setIsPyRunning(true);
    setPyOutput([
      '[*] Initializing WorldMonitorSecurityAuditor on https://www.worldmonitor.app...',
      '[*] Auditing HTTP Response Headers on https://www.worldmonitor.app...',
      '[+] Found X-Content-Type-Options: nosniff',
      '[+] Found X-Frame-Options: DENY',
      '[!] Missing critical security header: Content-Security-Policy',
      '[-] FAIL: Static predictable CSP nonce "wm-static-bootstrap" detected in HTML.',
      '[*] Probing Feed Proxy for Server-Side Request Forgery (SSRF)...',
      '[-] FAIL: CRITICAL: SSRF verified against AWS Metadata (http://169.254.169.254/latest/meta-data/)! Status: 200 OK',
      '[*] Scanning client JS bundles for embedded API keys & secrets...',
      '[-] FAIL: Hardcoded secret found in /assets/welcome-DKWBhdSm.js: AISStream API Token (1 occurrence)',
      '======================================================================',
      '  NTRO 26163 - WORLD MONITOR SECURITY AUDIT SUMMARY REPORT',
      '======================================================================',
      'Target URL: https://www.worldmonitor.app',
      'Total Findings Identified: 3 High/Critical Anomalies Flagged',
      '----------------------------------------------------------------------',
      '[1] [CRITICAL] WM-2026-001 - SSRF in Feed Proxy',
      '[2] [HIGH] WM-2026-006 - Hardcoded API Key in Client Bundle',
      '[3] [MEDIUM] WM-2026-008 - Static CSP Nonce Reuse',
      '======================================================================'
    ]);
    setTimeout(() => {
      setIsPyRunning(false);
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="cyber-panel rounded-xl p-5 border border-soc-border">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-cyan-400" />
              Toolchain Integration & Automation Hub
            </h2>
            <p className="text-xs font-mono text-slate-400 mt-1">
              Production-ready Python automation scripts, Postman API collections, and Burp Suite configurations for SIH PS-26163.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              Burp Suite · OWASP ZAP · Semgrep · Postman · Python
            </span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-soc-border overflow-x-auto font-mono text-xs">
          {[
            { id: 'python', label: 'Python Automation Scripts', icon: Terminal },
            { id: 'postman', label: 'Postman Collection JSON', icon: FileText },
            { id: 'burp', label: 'Burp Suite & ZAP Config', icon: ShieldAlert },
            { id: 'methodology', label: 'Assessment Methodology', icon: Layers },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg border transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 font-bold shadow-glow-cyan'
                    : 'bg-soc-bg border-soc-border text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: Python Automation Scripts */}
      {activeTab === 'python' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-4">
            <div className="cyber-panel rounded-xl p-5 border border-soc-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-cyan-400">
                  {PYTHON_AUDIT_SCRIPTS[0].name}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(PYTHON_AUDIT_SCRIPTS[0].code, 'python_main')}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-soc-bg border border-soc-border text-slate-300 hover:text-white font-mono text-xs"
                  >
                    {copiedLabel === 'python_main' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copy</span>
                  </button>

                  <button
                    onClick={() => handleDownload(PYTHON_AUDIT_SCRIPTS[0].name, PYTHON_AUDIT_SCRIPTS[0].code)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-soc-bg border border-soc-border text-slate-300 hover:text-white font-mono text-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download .py</span>
                  </button>
                </div>
              </div>

              <pre className="p-4 rounded-lg bg-black text-emerald-400 font-mono text-xs overflow-x-auto h-[400px] leading-relaxed border border-soc-border">
                {PYTHON_AUDIT_SCRIPTS[0].code}
              </pre>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="cyber-panel rounded-xl p-5 border border-soc-border flex flex-col h-[480px]">
              <div className="flex items-center justify-between pb-3 border-b border-soc-border mb-3">
                <span className="font-mono text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  Python Execution Terminal
                </span>

                <button
                  onClick={runPythonSimulation}
                  disabled={isPyRunning}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 font-mono text-xs font-bold transition-all disabled:opacity-50"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>{isPyRunning ? 'Executing...' : 'Run Simulation'}</span>
                </button>
              </div>

              <div className="flex-1 bg-black p-4 rounded-lg font-mono text-xs overflow-y-auto space-y-1 border border-soc-border text-slate-300">
                {pyOutput.map((line, idx) => (
                  <div 
                    key={idx}
                    className={`leading-relaxed whitespace-pre-wrap ${
                      line.includes('FAIL') || line.includes('[CRITICAL]') 
                        ? 'text-rose-400 font-bold' 
                        : line.includes('PASS') || line.includes('[+]') 
                        ? 'text-emerald-400' 
                        : line.includes('===') 
                        ? 'text-cyan-400 font-bold' 
                        : 'text-slate-300'
                    }`}
                  >
                    {line}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Postman Collection JSON */}
      {activeTab === 'postman' && (
        <div className="cyber-panel rounded-xl p-6 border border-soc-border space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold font-mono text-white">
                NTRO-26163-World-Monitor-Security-Assessment.postman_collection.json
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Ready-to-import collection covering SSRF probes, BOLA workspace traversal, and MCP headers.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopy(JSON.stringify(POSTMAN_COLLECTION_JSON, null, 2), 'postman')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-soc-bg border border-soc-border text-slate-300 hover:text-white font-mono text-xs"
              >
                {copiedLabel === 'postman' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy JSON</span>
              </button>

              <button
                onClick={() => handleDownload('worldmonitor_ntro_security_audit.postman_collection.json', JSON.stringify(POSTMAN_COLLECTION_JSON, null, 2), 'application/json')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 font-mono text-xs font-bold"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Collection</span>
              </button>
            </div>
          </div>

          <pre className="p-4 rounded-xl bg-black text-cyan-300 font-mono text-xs overflow-x-auto max-h-[450px] leading-relaxed border border-soc-border">
            {JSON.stringify(POSTMAN_COLLECTION_JSON, null, 2)}
          </pre>
        </div>
      )}

      {/* Tab 3: Burp Suite & ZAP Config */}
      {activeTab === 'burp' && (
        <div className="cyber-panel rounded-xl p-6 border border-soc-border space-y-6">
          <div>
            <h3 className="text-base font-bold font-display text-white">
              Burp Suite Professional & OWASP ZAP Test Profiles
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Match & Replace Proxy rules for intercepting feed queries, mutating workspace tenant IDs, and analyzing headers.
            </p>
          </div>

          <div className="space-y-3">
            {BURP_SUITE_CONFIG.rules.map((rule, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-soc-bg border border-soc-border space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-amber-400">{rule.comment}</span>
                  <span className="px-2 py-0.5 rounded bg-soc-card border border-soc-border text-slate-400">
                    {rule.type}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-xs">
                  <div className="p-2 rounded bg-black/60 border border-soc-border text-red-400">
                    Match: <code>{rule.match}</code>
                  </div>
                  <div className="p-2 rounded bg-black/60 border border-soc-border text-emerald-400">
                    Replace: <code>{rule.replace}</code>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Methodology */}
      {activeTab === 'methodology' && (
        <div className="cyber-panel rounded-xl p-6 border border-soc-border space-y-6">
          <div>
            <h3 className="text-base font-bold font-display text-white">
              White-Box Security Assessment Methodology for NTRO (PS-26163)
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Multi-tiered evaluation pipeline combining automated static analysis, dynamic API probing, and code review.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-soc-bg border border-soc-border space-y-2">
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-cyan-400">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-500/40">1</span>
                <span>Static Code Analysis</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                AST parsing using Semgrep to detect dangerous sink invocations (`dangerouslySetInnerHTML`, unvalidated `fetch()`, prototype traversals).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-soc-bg border border-soc-border space-y-2">
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-amber-400">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/40">2</span>
                <span>Dynamic API & Proxy Audit</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Postman & Python probing of `/api/proxy/feed`, Streamable HTTP `/mcp`, and workspace tenant ID boundaries.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-soc-bg border border-soc-border space-y-2">
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-emerald-400">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/40">3</span>
                <span>Safe Sandbox Validation</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Replication in isolated testing harnesses to prove exploitability without touching live production infrastructure.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
