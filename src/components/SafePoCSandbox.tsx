import React, { useState, useRef, useEffect } from 'react';
import { 
  FlaskConical, 
  Play, 
  RefreshCw, 
  ShieldCheck, 
  ShieldAlert, 
  Terminal as TerminalIcon, 
  AlertTriangle, 
  CheckCircle2, 
  Layers, 
  Lock,
  Activity,
  Zap,
  Network,
  Eye,
  RotateCcw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Vulnerability } from '../types/security';
import { VisualExploitAnimator } from './VisualExploitAnimator';

interface SandboxProps {
  vulnerabilities: Vulnerability[];
  initialVulnId?: string | null;
  onMitigate: (vulnId: string) => void;
  mitigatedIds: string[];
}

export const SafePoCSandbox: React.FC<SandboxProps> = ({
  vulnerabilities,
  initialVulnId,
  onMitigate,
  mitigatedIds
}) => {
  const [selectedId, setSelectedId] = useState<string>(initialVulnId || 'WM-2026-001');
  const [isPatchedMode, setIsPatchedMode] = useState<boolean>(false);
  const [customPayload, setCustomPayload] = useState<string>('http://169.254.169.254/latest/meta-data/iam/security-credentials/');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'both' | 'visual' | 'terminal'>('both');
  const [logs, setLogs] = useState<string[]>([
    '[*] Sandbox ready. Select target finding and defense state to run safe PoC execution.',
    '[*] Compliant with NTRO ethical hacking constraints (isolated test harness).'
  ]);
  const [resultStatus, setResultStatus] = useState<'IDLE' | 'VULNERABLE' | 'BLOCKED'>('IDLE');

  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const selectedVuln = vulnerabilities.find(v => v.id === selectedId) || vulnerabilities[0];

  const presetPayloads: Record<string, { label: string; value: string }[]> = {
    'WM-2026-001': [
      { label: 'AWS IAM Cloud Metadata', value: 'http://169.254.169.254/latest/meta-data/iam/security-credentials/' },
      { label: 'Internal Loopback Redis (6379)', value: 'http://127.0.0.1:6379/INFO' },
      { label: 'Private Subnet Host (10.0.1.45)', value: 'http://10.0.1.45:8080/admin/health' },
      { label: 'Legitimate ACLED Incident Feed', value: 'https://acleddata.com/api/v1/incidents' }
    ],
    'WM-2026-002': [
      { label: 'XSS Image Error Payload', value: '<img src=x onerror="alert(localStorage.getItem(\'wm_session\'))">' },
      { label: 'SVG Inline Execution', value: '<svg onload="alert(\'Exfiltrating: \'+document.cookie)">' },
      { label: 'Benign Formatted HTML Title', value: '<b>Breaking:</b> <i>Naval Convoy Updates in Red Sea</i>' }
    ],
    'WM-2026-003': [
      { label: 'Target Defense Workspace', value: 'ws_defense_corridor_8812' },
      { label: 'Target Maritime Watchlist', value: 'ws_ntro_maritime_01' },
      { label: 'Own Assigned Workspace', value: 'ws_user_own_4491' }
    ],
    'WM-2026-004': [
      { label: 'Extract Remote MCP Tokens', value: 'document.modelContext.getTool("getWorldMonitorMcpEndpoint").execute()' },
      { label: 'Cross-Origin Nav Hijack', value: 'launchWorldMonitor({ monitor: "constructor" })' }
    ],
    'WM-2026-005': [
      { label: 'CORS Preflight Flooding', value: 'OPTIONS /mcp Origin: https://unauthorized-agent-domain.com' },
      { label: 'Rapid Tool RPC Polling (500 req)', value: 'POST /mcp {"jsonrpc":"2.0","method":"tools/list"}' }
    ],
    'WM-2026-006': [
      { label: 'Regex Search AISStream Token', value: 'assets/welcome-*.js -> /aisstream[-_]?key/i' },
      { label: 'Regex Search Finnhub Token', value: 'assets/welcome-*.js -> /finnhub[-_]?token/i' }
    ],
    'WM-2026-007': [
      { label: 'Prototype Pollution __proto__', value: '{"__proto__": {"isAdmin": true, "telemetryBypass": true}}' },
      { label: 'Constructor Prototype Poison', value: '{"constructor": {"prototype": {"polluted": true}}}' },
      { label: 'Clean GeoJSON Coordinates', value: '{"type": "Feature", "properties": {"name": "Suez Chokepoint"}}' }
    ],
    'WM-2026-008': [
      { label: 'Inject with Static Nonce', value: '<script nonce="wm-static-bootstrap">alert(document.domain)</script>' },
      { label: 'Random Nonce Injection Probe', value: '<script nonce="random-attacker-nonce-991">alert(1)</script>' }
    ]
  };

  const currentPresets = presetPayloads[selectedVuln.id] || [
    { label: 'Default Test Vector', value: 'test_vector_probe' }
  ];

  const handleRunSimulation = () => {
    if (isRunning) return;
    setIsRunning(true);
    setProgress(10);
    setResultStatus('IDLE');
    setLogs([
      `[*] Initializing Safe Controlled Sandbox environment for [${selectedVuln.id}]...`,
      `[*] Target Component: ${selectedVuln.affectedComponent}`,
      `[*] Operating Mode: ${isPatchedMode ? 'HARDENED DEFENSE (PATCHED)' : 'UNPATCHED (VULNERABLE)'}`,
      `[*] Dispatching probe payload: ${customPayload}`
    ]);

    // Step 1
    setTimeout(() => {
      setProgress(40);
      setLogs(prev => [...prev, '[>] Step 1: Synthesizing HTTP probe across public wire...']);
    }, 400);

    // Step 2
    setTimeout(() => {
      setProgress(75);
      setLogs(prev => [...prev, '[>] Step 2: Evaluating input against security interceptors...']);
    }, 900);

    // Final Outcome
    setTimeout(() => {
      setProgress(100);
      if (selectedVuln.id === 'WM-2026-001') {
        if (isPatchedMode) {
          const isAllowed = customPayload.startsWith('https://acleddata.com') || customPayload.startsWith('https://api.aisstream.io');
          if (isAllowed) {
            setLogs(prev => [
              ...prev,
              '[+] Pre-flight DNS resolution: Valid external provider domain.',
              '[+] IP range check: Target is public unicast IP (52.84.12.18).',
              '[+] HTTP GET dispatched safely with 5000ms timeout.',
              '[+] Status: 200 OK - Legitimate intelligence stream delivered.'
            ]);
            setResultStatus('BLOCKED');
          } else {
            setLogs(prev => [
              ...prev,
              '[!] Security Interceptor Triggered in /api/proxy/feed.ts:',
              '[-] DNS Lookup resolved to restricted IP: 169.254.169.254 / 127.0.0.1 (Link-Local/Private)',
              '[-] Access-Control-Policy Exception: Target domain is not in ALLOWED_DOMAINS registry.',
              '[+] Request ABORTED before socket connection. Returned HTTP 403 Forbidden.',
              '[+] SUCCESS: SSRF exploit attempt neutralized!'
            ]);
            setResultStatus('BLOCKED');
            onMitigate(selectedVuln.id);
            try { confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } }); } catch (e) {}
          }
        } else {
          setLogs(prev => [
            ...prev,
            '[!] Outbound fetch() issued directly without pre-request IP validation.',
            '[!] Target host 169.254.169.254 reached within local cloud VPC environment.',
            '[!] Response HTTP 200 OK (Content-Type: application/json):',
            '    {\n      "AccessKeyId": "ASIA4XYZ9817FAKEKEY",\n      "SecretAccessKey": "wJalrXUtnFEMI/K7MDENG/bPxRfiCY...",\n      "Token": "IQoJb3JpZ2luX2VjE...",\n      "Expiration": "2026-09-12T20:22:18Z"\n    }',
            '[-] CRITICAL EXPLOIT CONFIRMED: Cloud IAM instance credentials leaked!'
          ]);
          setResultStatus('VULNERABLE');
        }
      } else if (selectedVuln.id === 'WM-2026-002') {
        if (isPatchedMode) {
          setLogs(prev => [
            ...prev,
            '[*] RSS Parser passed headline string to DOMPurify.sanitize()...',
            '[*] Stripping dangerous tag: <img onerror=...> / <script> / <svg>',
            '[+] Sanitized Output rendered safely into React virtual tree.',
            '[+] No untrusted JavaScript execution in victim DOM context.',
            '[+] SUCCESS: Stored DOM XSS neutralized!'
          ]);
          setResultStatus('BLOCKED');
          onMitigate(selectedVuln.id);
          try { confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } }); } catch (e) {}
        } else {
          setLogs(prev => [
            ...prev,
            '[!] React component rendered title via dangerouslySetInnerHTML={{ __html: payload }}',
            '[!] Browser parsed <img onerror="..."> and triggered onload event handler.',
            '[-] VULNERABILITY CONFIRMED: JavaScript executed in window context! Exfiltrated session token: "wm_sess_8917293819028301"'
          ]);
          setResultStatus('VULNERABLE');
        }
      } else if (selectedVuln.id === 'WM-2026-003') {
        if (isPatchedMode) {
          if (customPayload === 'ws_user_own_4491') {
            setLogs(prev => [
              ...prev,
              '[+] Tenant Membership Middleware: User is verified owner of ws_user_own_4491.',
              '[+] Status: 200 OK - Scenarios fetched successfully.'
            ]);
            setResultStatus('BLOCKED');
          } else {
            setLogs(prev => [
              ...prev,
              '[*] Verifying workspace tenant membership for user ID "usr_analyst_21"...',
              '[-] Membership check FAILED: Requester is not an authorized member of workspace ' + customPayload,
              '[+] Response: HTTP 403 Forbidden - Access Denied.',
              '[+] SUCCESS: BOLA cross-tenant access blocked!'
            ]);
            setResultStatus('BLOCKED');
            onMitigate(selectedVuln.id);
            try { confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } }); } catch (e) {}
          }
        } else {
          setLogs(prev => [
            ...prev,
            '[!] Authorization middleware checked valid JWT signature only.',
            '[!] Missing tenant ownership check on query parameter `workspaceId`.',
            '[!] Queried database directly for workspace: ' + customPayload,
            '[-] VULNERABILITY CONFIRMED: Returned private defense scenario "Classified Chokepoint Disruption Model - Q4"!'
          ]);
          setResultStatus('VULNERABLE');
        }
      } else {
        if (isPatchedMode) {
          setLogs(prev => [
            ...prev,
            '[+] Hardened security validation checks executed.',
            '[+] Payload sanitized and verified against NTRO defensive policy.',
            '[+] SUCCESS: Defense validated!'
          ]);
          setResultStatus('BLOCKED');
          onMitigate(selectedVuln.id);
          try { confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } }); } catch (e) {}
        } else {
          setLogs(prev => [
            ...prev,
            '[!] Unpatched logic allowed payload execution.',
            '[-] VULNERABILITY CONFIRMED in unmitigated state.'
          ]);
          setResultStatus('VULNERABLE');
        }
      }
      setIsRunning(false);
    }, 2400);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Sandbox Header */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-display font-bold text-slate-900 flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-blue-600" />
              Controlled Safe PoC Sandbox & Cyber Visualizer
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Interactive test harness demonstrating exploit replication vs hardened defensive deflection.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Layout:</span>
            <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl p-1 text-xs">
              <button
                onClick={() => setViewMode('both')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${viewMode === 'both' ? 'bg-white text-blue-700 shadow-sm font-semibold' : 'text-slate-600'}`}
              >
                Split
              </button>
              <button
                onClick={() => setViewMode('visual')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${viewMode === 'visual' ? 'bg-white text-blue-700 shadow-sm font-semibold' : 'text-slate-600'}`}
              >
                Visual Flow
              </button>
              <button
                onClick={() => setViewMode('terminal')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${viewMode === 'terminal' ? 'bg-white text-blue-700 shadow-sm font-semibold' : 'text-slate-600'}`}
              >
                Console
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Top Section: Live Visual Exploit Animator */}
      {(viewMode === 'both' || viewMode === 'visual') && (
        <VisualExploitAnimator
          vulnId={selectedVuln.id}
          isPatched={isPatchedMode}
          isRunning={isRunning}
          customPayload={customPayload}
        />
      )}

      {/* Main Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Target Selector & Configuration */}
        <div className={viewMode === 'visual' ? 'lg:col-span-12' : 'lg:col-span-5'}>
          <div className="space-y-3">
            {/* Target Finding Selector */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-blue-600" />
                1. Select Target Finding
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-1.5 max-h-[220px] overflow-y-auto pr-1">
                {vulnerabilities.map((vuln) => {
                  const isSelected = selectedId === vuln.id;
                  const isMitigated = mitigatedIds.includes(vuln.id);
                  return (
                    <button
                      key={vuln.id}
                      onClick={() => {
                        setSelectedId(vuln.id);
                        setCustomPayload(presetPayloads[vuln.id]?.[0]?.value || 'test_payload');
                        setResultStatus('IDLE');
                      }}
                      className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-blue-50 border-blue-400 text-slate-900 shadow-sm font-medium'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="truncate mr-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-bold text-blue-700">{vuln.id}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700">
                            {vuln.severity}
                          </span>
                        </div>
                        <div className="text-xs text-slate-700 truncate max-w-[200px] mt-0.5">
                          {vuln.title}
                        </div>
                      </div>

                      {isMitigated ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Defense State Toggle Switch */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-amber-600" />
                2. Defense & Patch State
              </h3>

              <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
                <button
                  onClick={() => {
                    setIsPatchedMode(false);
                    setResultStatus('IDLE');
                  }}
                  className={`py-2 px-2.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                    !isPatchedMode
                      ? 'bg-white text-rose-700 shadow-sm border border-rose-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                  <span>Unpatched</span>
                </button>

                <button
                  onClick={() => {
                    setIsPatchedMode(true);
                    setResultStatus('IDLE');
                  }}
                  className={`py-2 px-2.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                    isPatchedMode
                      ? 'bg-white text-emerald-700 shadow-sm border border-emerald-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Patched</span>
                </button>
              </div>
            </div>

            {/* Payload Presets & Custom Input */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                3. Test Vector Payload
              </h3>

              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-500">Preset Payloads:</label>
                <div className="flex flex-wrap gap-1.5">
                  {currentPresets.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setCustomPayload(preset.value);
                        setResultStatus('IDLE');
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs font-mono bg-slate-100 border border-slate-200 text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition-colors truncate max-w-[280px]"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1 pt-1">
                <label className="text-[11px] text-slate-500">Payload String:</label>
                <input
                  type="text"
                  value={customPayload}
                  onChange={(e) => {
                    setCustomPayload(e.target.value);
                    setResultStatus('IDLE');
                  }}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none transition-all"
                  placeholder="Enter custom URL or exploit payload..."
                />
              </div>

              {/* Run Test Button */}
              <div className="pt-2">
                <button
                  onClick={handleRunSimulation}
                  disabled={isRunning}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-white font-semibold text-xs py-2.5 rounded-xl shadow-sm transition-all"
                >
                  {isRunning ? (
                    <>
                      <RotateCcw className="w-4 h-4 animate-spin" />
                      <span>Executing PoC Simulation...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      <span>Dispatch Test Vector</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Execution Console Log */}
        {(viewMode === 'both' || viewMode === 'terminal') && (
          <div className={viewMode === 'terminal' ? 'lg:col-span-12' : 'lg:col-span-7'}>
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col h-[480px]">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <div className="flex items-center gap-2">
                  <TerminalIcon className="w-4 h-4 text-slate-700" />
                  <span className="font-bold text-xs text-slate-900">
                    Live Test Execution Console
                  </span>
                </div>

                <div className="flex items-center gap-2 font-mono text-xs">
                  {resultStatus === 'BLOCKED' && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px]">
                      DEFENSE ACTIVE (BLOCKED)
                    </span>
                  )}
                  {resultStatus === 'VULNERABLE' && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-bold text-[10px]">
                      EXPLOIT CONFIRMED
                    </span>
                  )}
                  {resultStatus === 'IDLE' && (
                    <span className="text-[11px] text-slate-400">STATUS: IDLE</span>
                  )}
                </div>
              </div>

              {/* Terminal View Output */}
              <div className="flex-1 bg-slate-900 p-4 rounded-xl font-mono text-xs overflow-y-auto space-y-1.5 border border-slate-800 text-slate-200">
                {logs.map((log, idx) => (
                  <div 
                    key={idx}
                    className={
                      log.startsWith('[+]') 
                        ? 'text-emerald-400 font-medium' 
                        : log.startsWith('[-]') 
                        ? 'text-rose-400 font-medium' 
                        : log.startsWith('[!]')
                        ? 'text-amber-300'
                        : 'text-slate-300'
                    }
                  >
                    {log}
                  </div>
                ))}
                <div ref={terminalEndRef} />
              </div>

              {/* Progress Bar */}
              {isRunning && (
                <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
                  <div 
                    className="bg-blue-600 h-1.5 transition-all duration-300 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
