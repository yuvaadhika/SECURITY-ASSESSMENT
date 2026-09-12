import React, { useState } from 'react';
import { 
  Calculator, 
  Copy, 
  Check, 
  RotateCcw, 
  Bookmark, 
  Info, 
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { calculateCVSS31, CVSSInput, getSeverityRating } from '../utils/cvssCalculator';
import { Vulnerability } from '../types/security';

interface CVSSProps {
  vulnerabilities: Vulnerability[];
  loadedVuln?: Vulnerability | null;
}

export const InteractiveCVSSCalculator: React.FC<CVSSProps> = ({
  vulnerabilities,
  loadedVuln
}) => {
  const defaultMetrics: CVSSInput = loadedVuln ? {
    attackVector: loadedVuln.cvss.attackVector,
    attackComplexity: loadedVuln.cvss.attackComplexity,
    privilegesRequired: loadedVuln.cvss.privilegesRequired,
    userInteraction: loadedVuln.cvss.userInteraction,
    scope: loadedVuln.cvss.scope,
    confidentiality: loadedVuln.cvss.confidentiality,
    integrity: loadedVuln.cvss.integrity,
    availability: loadedVuln.cvss.availability,
  } : {
    attackVector: 'NETWORK',
    attackComplexity: 'LOW',
    privilegesRequired: 'NONE',
    userInteraction: 'NONE',
    scope: 'CHANGED',
    confidentiality: 'HIGH',
    integrity: 'LOW',
    availability: 'NONE',
  };

  const [metrics, setMetrics] = useState<CVSSInput>(defaultMetrics);
  const [copied, setCopied] = useState<boolean>(false);

  const result = calculateCVSS31(metrics);
  const severityInfo = getSeverityRating(result.baseScore);

  const handleCopyVector = () => {
    navigator.clipboard.writeText(result.vectorString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadPreset = (vuln: Vulnerability) => {
    setMetrics({
      attackVector: vuln.cvss.attackVector,
      attackComplexity: vuln.cvss.attackComplexity,
      privilegesRequired: vuln.cvss.privilegesRequired,
      userInteraction: vuln.cvss.userInteraction,
      scope: vuln.cvss.scope,
      confidentiality: vuln.cvss.confidentiality,
      integrity: vuln.cvss.integrity,
      availability: vuln.cvss.availability,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="cyber-panel rounded-xl p-5 border border-soc-border">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
              <Calculator className="w-5 h-5 text-emerald-400" />
              Interactive CVSS v3.1 Dynamic Severity Calculator
            </h2>
            <p className="text-xs font-mono text-slate-400 mt-1">
              Standard FIRST CVSS v3.1 calculation engine conforming with NTRO vulnerability scoring guidelines.
            </p>
          </div>

          <button
            onClick={() => setMetrics({
              attackVector: 'NETWORK',
              attackComplexity: 'LOW',
              privilegesRequired: 'NONE',
              userInteraction: 'NONE',
              scope: 'UNCHANGED',
              confidentiality: 'NONE',
              integrity: 'NONE',
              availability: 'NONE',
            })}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-soc-bg border border-soc-border text-slate-400 hover:text-white font-mono text-xs transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Metrics</span>
          </button>
        </div>

        {/* Preset Selector */}
        <div className="mt-4 pt-4 border-t border-soc-border flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
            <Bookmark className="w-3.5 h-3.5 text-cyan-400" />
            Load World Monitor Finding:
          </span>
          {vulnerabilities.map((v) => (
            <button
              key={v.id}
              onClick={() => loadPreset(v)}
              className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-soc-bg border border-soc-border text-slate-300 hover:text-cyan-300 hover:border-cyan-400 transition-colors"
            >
              {v.id} ({v.cvss.baseScore})
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Metric Selectors */}
        <div className="lg:col-span-8 space-y-5">
          {/* Exploitability Metrics Group */}
          <div className="cyber-panel rounded-xl p-5 border border-soc-border space-y-4">
            <div className="flex items-center justify-between border-b border-soc-border pb-2">
              <h3 className="font-mono text-xs font-bold text-cyan-400 uppercase tracking-wider">
                1. Exploitability Metrics (Subscore: {result.exploitabilityScore})
              </h3>
              <span className="text-[11px] font-mono text-slate-500">Ease of Exploitation</span>
            </div>

            {/* Attack Vector */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-300 font-semibold">Attack Vector (AV):</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { value: 'NETWORK', label: 'Network (N)', desc: 'Remotely exploitable across internet' },
                  { value: 'ADJACENT', label: 'Adjacent (A)', desc: 'Same physical/logical network' },
                  { value: 'LOCAL', label: 'Local (L)', desc: 'Local shell or user session' },
                  { value: 'PHYSICAL', label: 'Physical (P)', desc: 'Physical access required' },
                ].map((item) => (
                  <button
                    key={item.value}
                    onClick={() => setMetrics({ ...metrics, attackVector: item.value as any })}
                    className={`p-2.5 rounded-lg border text-left font-mono text-xs transition-all ${
                      metrics.attackVector === item.value
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-glow-cyan font-bold'
                        : 'bg-soc-bg border-soc-border text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div>{item.label}</div>
                    <div className="text-[10px] text-slate-500 font-normal leading-tight mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Attack Complexity & User Interaction */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Attack Complexity */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-300 font-semibold">Attack Complexity (AC):</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'LOW', label: 'Low (L)' },
                    { value: 'HIGH', label: 'High (H)' },
                  ].map((item) => (
                    <button
                      key={item.value}
                      onClick={() => setMetrics({ ...metrics, attackComplexity: item.value as any })}
                      className={`p-2.5 rounded-lg border text-center font-mono text-xs transition-all ${
                        metrics.attackComplexity === item.value
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 font-bold'
                          : 'bg-soc-bg border-soc-border text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* User Interaction */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-300 font-semibold">User Interaction (UI):</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'NONE', label: 'None (N)' },
                    { value: 'REQUIRED', label: 'Required (R)' },
                  ].map((item) => (
                    <button
                      key={item.value}
                      onClick={() => setMetrics({ ...metrics, userInteraction: item.value as any })}
                      className={`p-2.5 rounded-lg border text-center font-mono text-xs transition-all ${
                        metrics.userInteraction === item.value
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 font-bold'
                          : 'bg-soc-bg border-soc-border text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Privileges Required */}
            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-mono text-slate-300 font-semibold">Privileges Required (PR):</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'NONE', label: 'None (N)', desc: 'Unauthenticated' },
                  { value: 'LOW', label: 'Low (L)', desc: 'Standard user' },
                  { value: 'HIGH', label: 'High (H)', desc: 'Admin / privileged' },
                ].map((item) => (
                  <button
                    key={item.value}
                    onClick={() => setMetrics({ ...metrics, privilegesRequired: item.value as any })}
                    className={`p-2.5 rounded-lg border text-center font-mono text-xs transition-all ${
                      metrics.privilegesRequired === item.value
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 font-bold'
                        : 'bg-soc-bg border-soc-border text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div>{item.label}</div>
                    <div className="text-[10px] text-slate-500 font-normal">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Scope */}
            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-mono text-slate-300 font-semibold">Scope (S):</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'UNCHANGED', label: 'Unchanged (U)', desc: 'Impact confined to vulnerable component' },
                  { value: 'CHANGED', label: 'Changed (C)', desc: 'Impact breaches sandbox or pivots (e.g. SSRF)' },
                ].map((item) => (
                  <button
                    key={item.value}
                    onClick={() => setMetrics({ ...metrics, scope: item.value as any })}
                    className={`p-2.5 rounded-lg border text-left font-mono text-xs transition-all ${
                      metrics.scope === item.value
                        ? 'bg-amber-500/20 text-amber-300 border-amber-400 font-bold'
                        : 'bg-soc-bg border-soc-border text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div>{item.label}</div>
                    <div className="text-[10px] text-slate-500 font-normal leading-tight mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Impact Metrics Group */}
          <div className="cyber-panel rounded-xl p-5 border border-soc-border space-y-4">
            <div className="flex items-center justify-between border-b border-soc-border pb-2">
              <h3 className="font-mono text-xs font-bold text-amber-400 uppercase tracking-wider">
                2. Impact Metrics (Subscore: {result.impactScore})
              </h3>
              <span className="text-[11px] font-mono text-slate-500">Consequence of Exploitation</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Confidentiality */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-300 font-semibold">Confidentiality (C):</label>
                <div className="space-y-1.5">
                  {[
                    { value: 'HIGH', label: 'High (H)' },
                    { value: 'LOW', label: 'Low (L)' },
                    { value: 'NONE', label: 'None (N)' },
                  ].map((item) => (
                    <button
                      key={item.value}
                      onClick={() => setMetrics({ ...metrics, confidentiality: item.value as any })}
                      className={`w-full p-2 rounded-lg border text-center font-mono text-xs transition-all ${
                        metrics.confidentiality === item.value
                          ? 'bg-red-500/20 text-red-300 border-red-400 font-bold'
                          : 'bg-soc-bg border-soc-border text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Integrity */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-300 font-semibold">Integrity (I):</label>
                <div className="space-y-1.5">
                  {[
                    { value: 'HIGH', label: 'High (H)' },
                    { value: 'LOW', label: 'Low (L)' },
                    { value: 'NONE', label: 'None (N)' },
                  ].map((item) => (
                    <button
                      key={item.value}
                      onClick={() => setMetrics({ ...metrics, integrity: item.value as any })}
                      className={`w-full p-2 rounded-lg border text-center font-mono text-xs transition-all ${
                        metrics.integrity === item.value
                          ? 'bg-amber-500/20 text-amber-300 border-amber-400 font-bold'
                          : 'bg-soc-bg border-soc-border text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-300 font-semibold">Availability (A):</label>
                <div className="space-y-1.5">
                  {[
                    { value: 'HIGH', label: 'High (H)' },
                    { value: 'LOW', label: 'Low (L)' },
                    { value: 'NONE', label: 'None (N)' },
                  ].map((item) => (
                    <button
                      key={item.value}
                      onClick={() => setMetrics({ ...metrics, availability: item.value as any })}
                      className={`w-full p-2 rounded-lg border text-center font-mono text-xs transition-all ${
                        metrics.availability === item.value
                          ? 'bg-yellow-500/20 text-yellow-300 border-yellow-400 font-bold'
                          : 'bg-soc-bg border-soc-border text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Score Summary & Vector */}
        <div className="lg:col-span-4 space-y-4">
          {/* Main Score Gauge */}
          <div className="cyber-panel rounded-xl p-6 border border-soc-border text-center space-y-4">
            <span className="font-mono text-xs text-slate-400 uppercase tracking-wider block">
              Calculated CVSS v3.1 Base Score
            </span>

            <div className="py-2">
              <div className="text-6xl font-display font-extrabold" style={{ color: severityInfo.color }}>
                {result.baseScore.toFixed(1)}
              </div>
              <span className={`inline-block mt-2 font-mono text-xs font-bold px-3 py-1 rounded-full border ${severityInfo.badgeClass}`}>
                {severityInfo.severity} SEVERITY
              </span>
            </div>

            {/* Breakdown Subscores */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-soc-border text-left font-mono text-xs">
              <div className="bg-soc-bg p-3 rounded-lg border border-soc-border">
                <span className="text-slate-500 block text-[10px]">Impact</span>
                <span className="text-sm font-bold text-slate-200">{result.impactScore.toFixed(1)}</span>
              </div>
              <div className="bg-soc-bg p-3 rounded-lg border border-soc-border">
                <span className="text-slate-500 block text-[10px]">Exploitability</span>
                <span className="text-sm font-bold text-slate-200">{result.exploitabilityScore.toFixed(1)}</span>
              </div>
            </div>
          </div>

          {/* Vector String Box */}
          <div className="cyber-panel rounded-xl p-5 border border-soc-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-slate-300 uppercase tracking-wider">
                Vector String
              </span>
              <button
                onClick={handleCopyVector}
                className="flex items-center gap-1 text-xs font-mono text-cyan-400 hover:underline"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="bg-black p-3 rounded-lg border border-soc-border font-mono text-xs text-emerald-400 break-all leading-relaxed">
              {result.vectorString}
            </div>
          </div>

          {/* NTRO Assessment Guidance Note */}
          <div className="bg-soc-bg/80 p-4 rounded-xl border border-soc-border/80 space-y-2 text-xs text-slate-400">
            <div className="flex items-center gap-1.5 text-cyan-400 font-mono font-bold">
              <Info className="w-4 h-4" />
              <span>NTRO Scoring Compliance</span>
            </div>
            <p className="leading-relaxed">
              Vulnerabilities scoring 9.0+ require immediate emergency containment. Vulnerabilities scoring 7.0–8.9 must be patched within 24 hours of notification.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
