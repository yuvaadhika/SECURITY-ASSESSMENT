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
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-display font-bold text-slate-900 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-emerald-600" />
              Interactive CVSS v3.1 Severity Calculator
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors w-fit"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Metrics</span>
          </button>
        </div>

        {/* Quick Finding Presets */}
        <div className="mt-4 pt-3.5 border-t border-slate-100">
          <span className="text-xs font-semibold text-slate-700 block mb-2">
            Load Pre-Scored Finding Metrics:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {vulnerabilities.map((v) => (
              <button
                key={v.id}
                onClick={() => loadPreset(v)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 text-slate-700 text-xs transition-all"
              >
                <span className="font-mono font-bold text-blue-600">{v.id}</span>
                <span className="text-slate-500 truncate max-w-[120px]">{v.title}</span>
                <span className={`text-[10px] font-mono px-1 rounded font-semibold ${
                  v.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-700' :
                  v.severity === 'HIGH' ? 'bg-amber-100 text-amber-700' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {v.cvss.baseScore}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Scoring Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Score Output Summary Card */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4 sticky top-20">
            <div className="text-center pb-2 border-b border-slate-100">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                CVSS v3.1 Base Score
              </span>

              <div className="mt-2 flex items-center justify-center gap-3">
                <div className={`text-5xl font-display font-extrabold ${
                  result.baseScore >= 9.0 ? 'text-rose-600' :
                  result.baseScore >= 7.0 ? 'text-amber-600' :
                  result.baseScore >= 4.0 ? 'text-yellow-600' : 'text-emerald-600'
                }`}>
                  {result.baseScore.toFixed(1)}
                </div>

                <div className="text-left">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold font-mono border block ${
                    result.baseScore >= 9.0 ? 'bg-rose-50 text-rose-700 border-rose-200' :
                    result.baseScore >= 7.0 ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    result.baseScore >= 4.0 ? 'bg-yellow-50 text-yellow-800 border-yellow-200' :
                    'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}>
                    {severityInfo.severity}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono mt-0.5 block">
                    Range: {result.baseScore >= 9.0 ? '9.0 - 10.0' : result.baseScore >= 7.0 ? '7.0 - 8.9' : result.baseScore >= 4.0 ? '4.0 - 6.9' : '0.1 - 3.9'}
                  </span>
                </div>
              </div>
            </div>

            {/* Sub-Scores Breakdown */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                <span className="text-[11px] text-slate-500 block">Exploitability</span>
                <span className="text-lg font-bold text-slate-900 mt-0.5 block">
                  {result.exploitabilityScore.toFixed(1)}
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                <span className="text-[11px] text-slate-500 block">Impact Score</span>
                <span className="text-lg font-bold text-slate-900 mt-0.5 block">
                  {result.impactScore.toFixed(1)}
                </span>
              </div>
            </div>

            {/* Vector String Box */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Vector String:</span>
                <button
                  onClick={handleCopyVector}
                  className="text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium text-[11px]"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="p-3 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl border border-slate-800 break-all leading-relaxed">
                {result.vectorString}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Metric Selector Matrix */}
        <div className="lg:col-span-8 space-y-4">
          {/* Exploitability Metrics Group */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              1. Exploitability Metrics
            </h3>

            <div className="space-y-3">
              {/* Attack Vector */}
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1.5">
                  Attack Vector (AV)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {[
                    { id: 'NETWORK', label: 'Network (N)', desc: 'Remotely exploitable' },
                    { id: 'ADJACENT', label: 'Adjacent (A)', desc: 'Local subnet only' },
                    { id: 'LOCAL', label: 'Local (L)', desc: 'Local shell/file' },
                    { id: 'PHYSICAL', label: 'Physical (P)', desc: 'Physical contact' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setMetrics(m => ({ ...m, attackVector: opt.id as any }))}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        metrics.attackVector === opt.id
                          ? 'bg-blue-50 border-blue-400 text-blue-900 font-semibold shadow-2xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="text-xs">{opt.label}</div>
                      <div className="text-[10px] text-slate-500 font-normal">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Attack Complexity */}
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1.5">
                  Attack Complexity (AC)
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'LOW', label: 'Low (L)', desc: 'No special conditions required' },
                    { id: 'HIGH', label: 'High (H)', desc: 'Requires race condition or prep' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setMetrics(m => ({ ...m, attackComplexity: opt.id as any }))}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        metrics.attackComplexity === opt.id
                          ? 'bg-blue-50 border-blue-400 text-blue-900 font-semibold shadow-2xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="text-xs">{opt.label}</div>
                      <div className="text-[10px] text-slate-500 font-normal">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Privileges Required */}
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1.5">
                  Privileges Required (PR)
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'NONE', label: 'None (N)', desc: 'Unauthenticated' },
                    { id: 'LOW', label: 'Low (L)', desc: 'Standard user' },
                    { id: 'HIGH', label: 'High (H)', desc: 'Admin privileges' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setMetrics(m => ({ ...m, privilegesRequired: opt.id as any }))}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        metrics.privilegesRequired === opt.id
                          ? 'bg-blue-50 border-blue-400 text-blue-900 font-semibold shadow-2xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="text-xs">{opt.label}</div>
                      <div className="text-[10px] text-slate-500 font-normal">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* User Interaction */}
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1.5">
                  User Interaction (UI)
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'NONE', label: 'None (N)', desc: 'Autonomous execution' },
                    { id: 'REQUIRED', label: 'Required (R)', desc: 'Victim must click or visit' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setMetrics(m => ({ ...m, userInteraction: opt.id as any }))}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        metrics.userInteraction === opt.id
                          ? 'bg-blue-50 border-blue-400 text-blue-900 font-semibold shadow-2xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="text-xs">{opt.label}</div>
                      <div className="text-[10px] text-slate-500 font-normal">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Scope & Impact Metrics Group */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              2. Scope & Impact Metrics (CIA Triad)
            </h3>

            <div className="space-y-3">
              {/* Scope */}
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1.5">
                  Scope (S)
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'UNCHANGED', label: 'Unchanged (U)', desc: 'Confined to vulnerable component' },
                    { id: 'CHANGED', label: 'Changed (C)', desc: 'Crosses security authority (e.g., Cloud VPC)' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setMetrics(m => ({ ...m, scope: opt.id as any }))}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        metrics.scope === opt.id
                          ? 'bg-blue-50 border-blue-400 text-blue-900 font-semibold shadow-2xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="text-xs">{opt.label}</div>
                      <div className="text-[10px] text-slate-500 font-normal">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Confidentiality Impact */}
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1.5">
                  Confidentiality Impact (C)
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {['NONE', 'LOW', 'HIGH'].map((level) => (
                    <button
                      key={level}
                      onClick={() => setMetrics(m => ({ ...m, confidentiality: level as any }))}
                      className={`p-2 rounded-xl border text-center transition-all text-xs font-medium ${
                        metrics.confidentiality === level
                          ? 'bg-rose-50 border-rose-300 text-rose-800 font-semibold'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-white'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Integrity Impact */}
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1.5">
                  Integrity Impact (I)
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {['NONE', 'LOW', 'HIGH'].map((level) => (
                    <button
                      key={level}
                      onClick={() => setMetrics(m => ({ ...m, integrity: level as any }))}
                      className={`p-2 rounded-xl border text-center transition-all text-xs font-medium ${
                        metrics.integrity === level
                          ? 'bg-amber-50 border-amber-300 text-amber-800 font-semibold'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-white'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Availability Impact */}
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1.5">
                  Availability Impact (A)
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {['NONE', 'LOW', 'HIGH'].map((level) => (
                    <button
                      key={level}
                      onClick={() => setMetrics(m => ({ ...m, availability: level as any }))}
                      className={`p-2 rounded-xl border text-center transition-all text-xs font-medium ${
                        metrics.availability === level
                          ? 'bg-blue-50 border-blue-300 text-blue-800 font-semibold'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-white'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
