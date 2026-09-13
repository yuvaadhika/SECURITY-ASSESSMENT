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
  CheckCircle2,
  RotateCcw
} from 'lucide-react';
import { PYTHON_AUDIT_SCRIPTS, POSTMAN_COLLECTION_JSON, BURP_SUITE_CONFIG } from '../data/toolchainScripts';

export const ToolchainAutomation: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'python' | 'postman' | 'burp' | 'methodology'>('python');
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);
  const [isPyRunning, setIsPyRunning] = useState<boolean>(false);
  const [selectedScriptId, setSelectedScriptId] = useState<string>(PYTHON_AUDIT_SCRIPTS[0].id);
  const [pyOutput, setPyOutput] = useState<string[]>([
    '[*] Python 3.11 Runtime Ready.',
    '[*] Click "Run Audit Script" to trigger automated audit suite.'
  ]);

  const selectedScript = PYTHON_AUDIT_SCRIPTS.find(s => s.id === selectedScriptId) || PYTHON_AUDIT_SCRIPTS[0];

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
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-display font-bold text-slate-900 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-blue-600" />
              Toolchain Integration & Automation Suite
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Production-ready Python automation scripts, Postman API collections, and Burp Suite configurations for NTRO PS-26163.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Burp · ZAP · Semgrep · Postman · Python
            </span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 mt-4 pt-3.5 border-t border-slate-100 overflow-x-auto text-xs">
          {[
            { id: 'python', label: 'Python Automation', icon: Terminal },
            { id: 'postman', label: 'Postman Collection', icon: FileText },
            { id: 'burp', label: 'Burp & ZAP Config', icon: ShieldAlert },
            { id: 'methodology', label: 'Audit Methodology', icon: Layers },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border border-blue-300 font-semibold shadow-2xs'
                    : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-white hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: Python Automation */}
      {activeTab === 'python' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-7 space-y-3">
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-slate-800">
                  {selectedScript.name}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(selectedScript.code, 'pythonScript')}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 hover:bg-white font-mono text-xs"
                  >
                    {copiedLabel === 'pythonScript' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copy</span>
                  </button>

                  <button
                    onClick={() => handleDownload(selectedScript.name, selectedScript.code, 'text/x-python')}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 hover:bg-white font-mono text-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>

              <pre className="p-3.5 rounded-xl bg-slate-900 text-emerald-400 font-mono text-xs overflow-x-auto h-[380px] leading-relaxed border border-slate-800">
                {selectedScript.code}
              </pre>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col h-[460px]">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <span className="font-bold text-xs text-slate-900">
                  CLI Automation Output
                </span>
                <button
                  onClick={runPythonSimulation}
                  disabled={isPyRunning}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-white font-semibold text-xs transition-all shadow-2xs"
                >
                  {isPyRunning ? <RotateCcw className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                  <span>Run Audit Script</span>
                </button>
              </div>

              <div className="flex-1 bg-slate-900 p-3.5 rounded-xl font-mono text-xs overflow-y-auto space-y-1 border border-slate-800 text-slate-300">
                {pyOutput.map((line, idx) => (
                  <div
                    key={idx}
                    className={
                      line.includes('[+]') ? 'text-emerald-400' :
                      line.includes('[-]') ? 'text-rose-400' :
                      line.includes('[!]') ? 'text-amber-300' :
                      line.includes('==') ? 'text-blue-400 font-bold' : 'text-slate-300'
                    }
                  >
                    {line}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Postman Collection */}
      {activeTab === 'postman' && (
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Postman v2.1 Verification Collection
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pre-configured requests for verifying SSRF, WebMCP, and BOLA attack vectors.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopy(JSON.stringify(POSTMAN_COLLECTION_JSON, null, 2), 'postman')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 hover:bg-white text-xs font-mono"
              >
                {copiedLabel === 'postman' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy JSON</span>
              </button>

              <button
                onClick={() => handleDownload('world_monitor_ntro_postman_collection.json', JSON.stringify(POSTMAN_COLLECTION_JSON, null, 2), 'application/json')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Postman JSON</span>
              </button>
            </div>
          </div>

          <pre className="p-3.5 rounded-xl bg-slate-900 text-blue-300 font-mono text-xs overflow-x-auto max-h-[420px] leading-relaxed border border-slate-800">
            {JSON.stringify(POSTMAN_COLLECTION_JSON, null, 2)}
          </pre>
        </div>
      )}

      {/* Tab 3: Burp Suite & ZAP */}
      {activeTab === 'burp' && (
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Burp Suite & OWASP ZAP Assessment Rules
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Match & Replace rules, passive scanner regex patterns, and proxy filters.
              </p>
            </div>

            <button
              onClick={() => handleCopy(JSON.stringify(BURP_SUITE_CONFIG, null, 2), 'burp')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 hover:bg-white text-xs font-mono"
            >
              {copiedLabel === 'burp' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy Configuration</span>
            </button>
          </div>

          <pre className="p-3.5 rounded-xl bg-slate-900 text-amber-300 font-mono text-xs overflow-x-auto max-h-[420px] leading-relaxed border border-slate-800">
            {JSON.stringify(BURP_SUITE_CONFIG, null, 2)}
          </pre>
        </div>
      )}

      {/* Tab 4: Assessment Methodology */}
      {activeTab === 'methodology' && (
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-sm text-slate-900">
              NTRO White-Box Assessment Methodology & Governance
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Structured 4-phase evaluation framework applied to World Monitor
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                PHASE 1: RECONNAISSANCE & ARCHITECTURE MAPPING
              </span>
              <h4 className="font-bold text-xs text-slate-900">Surface Inventory & Feed Ingestion</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Decompilation and static auditing of Vite production chunks to identify external endpoints, telemetry feeds, and hardcoded API tokens.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-semibold border border-rose-200">
                PHASE 2: STATIC & DYNAMIC ANALYSIS (SAST / DAST)
              </span>
              <h4 className="font-bold text-xs text-slate-900">Automated AST & Interceptor Probing</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Semgrep custom AST rules execute against source trees to uncover sink vulnerabilities (fetch, innerHTML, prototype assignment).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-semibold border border-amber-200">
                PHASE 3: CONTROLLED POC REPLICATION
              </span>
              <h4 className="font-bold text-xs text-slate-900">Ethical Exploitation Verification</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Strict isolated sandbox harness verifies exploitability without causing Denial of Service or data loss on production assets.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                PHASE 4: REMEDIATION & POSTURE HARDENING
              </span>
              <h4 className="font-bold text-xs text-slate-900">Defensive Patch & Verification</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Production-ready code diffs tested in isolation. Dynamic score increments up to 98/100 upon verified patch deployment.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
