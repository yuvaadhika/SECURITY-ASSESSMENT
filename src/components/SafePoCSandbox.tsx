import React, { useState } from 'react';
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
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Vulnerability } from '../types/security';

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
  const [logs, setLogs] = useState<string[]>([
    '[*] Sandbox ready. Select target vulnerability and defense state to simulate safe PoC execution.',
    '[*] Compliant with NTRO ethical hacking constraints (controlled test harness).'
  ]);
  const [resultStatus, setResultStatus] = useState<'IDLE' | 'VULNERABLE' | 'BLOCKED'>('IDLE');

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
    'WM-2026-007': [
      { label: 'Prototype Pollution __proto__ injection', value: '{"__proto__": {"isAdmin": true, "telemetryBypass": true}}' },
      { label: 'Constructor Prototype Traversal', value: '{"constructor": {"prototype": {"polluted": true}}}' },
      { label: 'Clean GeoJSON Coordinates', value: '{"type": "Feature", "properties": {"name": "Suez Chokepoint"}}' }
    ]
  };

  const currentPresets = presetPayloads[selectedVuln.id] || [
    { label: 'Default Test Vector', value: 'test_vector_probe' }
  ];

  const handleRunSimulation = () => {
    setIsRunning(true);
    setResultStatus('IDLE');
    setLogs([
      `[*] Initializing Safe Controlled Sandbox environment for [${selectedVuln.id}]...`,
      `[*] Target Component: ${selectedVuln.affectedComponent}`,
      `[*] Operating Mode: ${isPatchedMode ? 'HARDENED DEFENSE (PATCHED)' : 'UNPATCHED (VULNERABLE)'}`,
      `[*] Dispatching probe payload: ${customPayload}`
    ]);

    setTimeout(() => {
      if (selectedVuln.id === 'WM-2026-001') {
        // SSRF Simulation
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
            confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
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
        // Stored DOM XSS Simulation
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
          confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
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
        // BOLA Simulation
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
            confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
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
        // Generic Simulation
        if (isPatchedMode) {
          setLogs(prev => [
            ...prev,
            '[+] Hardened security validation checks executed.',
            '[+] Payload sanitized and verified against NTRO defensive policy.',
            '[+] SUCCESS: Defense validated!'
          ]);
          setResultStatus('BLOCKED');
          onMitigate(selectedVuln.id);
          confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
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
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Sandbox Header */}
      <div className="cyber-panel rounded-xl p-5 border border-soc-border">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-cyan-400" />
              Controlled Safe PoC Sandbox Laboratory
            </h2>
            <p className="text-xs font-mono text-slate-400 mt-1">
              Test exploit replication against unpatched targets and verify defensive code patches in real-time.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Environment:</span>
            <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              ISOLATED HARNESS (NTRO COMPLIANT)
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Target Selector & Configuration */}
        <div className="lg:col-span-5 space-y-4">
          {/* Target Vulnerability Selector */}
          <div className="cyber-panel rounded-xl p-5 border border-soc-border space-y-4">
            <h3 className="font-mono text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              1. Select Target Vulnerability
            </h3>

            <div className="space-y-2">
              {vulnerabilities.map((vuln) => {
                const isSelected = selectedId === vuln.id;
                const isMitigated = mitigatedIds.includes(vuln.id);
                return (
                  <button
                    key={vuln.id}
                    onClick={() => {
                      setSelectedId(vuln.id);
                      setCustomPayload(presetPayloads[vuln.id]?.[0]?.value || 'test_payload');
                    }}
                    className={`w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-cyan-500/10 border-cyan-400 text-white'
                        : 'bg-soc-bg border-soc-border text-slate-400 hover:text-slate-200 hover:border-slate-600'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-cyan-400">{vuln.id}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-soc-card border border-soc-border text-slate-400">
                          {vuln.severity}
                        </span>
                      </div>
                      <div className="text-xs font-medium text-slate-200 truncate max-w-[260px] mt-0.5">
                        {vuln.title}
                      </div>
                    </div>

                    {isMitigated ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Defense State Toggle Switch */}
          <div className="cyber-panel rounded-xl p-5 border border-soc-border space-y-3">
            <h3 className="font-mono text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-400" />
              2. Defense & Patch State
            </h3>

            <div className="grid grid-cols-2 gap-2 bg-soc-bg p-1.5 rounded-lg border border-soc-border">
              <button
                onClick={() => setIsPatchedMode(false)}
                className={`py-2 px-3 rounded-md font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  !isPatchedMode
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50 shadow-glow-red'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                <span>Vulnerable State</span>
              </button>

              <button
                onClick={() => setIsPatchedMode(true)}
                className={`py-2 px-3 rounded-md font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  isPatchedMode
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-glow-green'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Patched Defense</span>
              </button>
            </div>
          </div>

          {/* Payload Preset & Custom String */}
          <div className="cyber-panel rounded-xl p-5 border border-soc-border space-y-3">
            <h3 className="font-mono text-xs font-bold text-slate-300 uppercase tracking-wider">
              3. Test Vector Payload
            </h3>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-slate-400">Choose Preset Vector:</label>
              <div className="flex flex-wrap gap-1.5">
                {currentPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCustomPayload(preset.value)}
                    className="text-[10px] font-mono px-2 py-1 rounded bg-soc-bg border border-soc-border text-slate-300 hover:text-cyan-300 hover:border-cyan-400 transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1 mt-2">
              <label className="text-[11px] font-mono text-slate-400">Custom Probe Input:</label>
              <input
                type="text"
                value={customPayload}
                onChange={(e) => setCustomPayload(e.target.value)}
                className="w-full bg-soc-bg border border-soc-border focus:border-cyan-400 rounded-lg p-2.5 text-xs font-mono text-emerald-300 focus:outline-none"
              />
            </div>

            <button
              onClick={handleRunSimulation}
              disabled={isRunning}
              className="w-full mt-3 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-soc-bg font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-glow-cyan transition-all transform active:scale-98 disabled:opacity-50"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Executing Safe Sandbox Run...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Execute Safe PoC Simulation</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Interactive Terminal & Verification Console */}
        <div className="lg:col-span-7 space-y-4">
          <div className="cyber-panel rounded-xl p-5 border border-soc-border flex flex-col h-[560px]">
            {/* Terminal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-soc-border mb-3">
              <div className="flex items-center gap-2">
                <TerminalIcon className="w-4 h-4 text-cyan-400" />
                <span className="font-mono text-xs font-bold text-white">
                  SANDBOX CONSOLE // NTRO TEST HARNESS
                </span>
              </div>

              {resultStatus === 'VULNERABLE' && (
                <span className="px-2.5 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/40 text-[10px] font-mono font-bold animate-pulse">
                  [!] VULNERABILITY ACTIVE
                </span>
              )}
              {resultStatus === 'BLOCKED' && (
                <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-mono font-bold">
                  [+] DEFENSE VERIFIED
                </span>
              )}
            </div>

            {/* Terminal Output Stream */}
            <div className="flex-1 bg-black/90 p-4 rounded-lg font-mono text-xs overflow-y-auto space-y-1.5 border border-soc-border/60">
              {logs.map((log, idx) => {
                const isFail = log.includes('[-]') || log.includes('[!]');
                const isPass = log.includes('[+]');
                const isWarn = log.includes('[*]');

                return (
                  <div 
                    key={idx} 
                    className={`leading-relaxed whitespace-pre-wrap ${
                      isFail 
                        ? 'text-rose-400 font-semibold' 
                        : isPass 
                        ? 'text-emerald-400 font-semibold' 
                        : isWarn 
                        ? 'text-cyan-300' 
                        : 'text-slate-300'
                    }`}
                  >
                    {log}
                  </div>
                );
              })}
              {isRunning && (
                <div className="flex items-center gap-2 text-cyan-400 animate-pulse pt-2">
                  <span>&gt; Processing request and applying defensive interceptors...</span>
                </div>
              )}
            </div>

            {/* Bottom Status Card */}
            <div className="mt-3 pt-3 border-t border-soc-border flex items-center justify-between text-xs font-mono text-slate-400">
              <div className="flex items-center gap-2">
                <span>Active Target:</span>
                <strong className="text-white">{selectedVuln.id}</strong>
              </div>

              <div className="flex items-center gap-2">
                <span>Remediation State:</span>
                <strong className={isPatchedMode ? 'text-emerald-400' : 'text-rose-400'}>
                  {isPatchedMode ? 'Hardened / Patched' : 'Vulnerable'}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
