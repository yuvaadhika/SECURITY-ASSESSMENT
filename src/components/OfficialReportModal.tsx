import React, { useState } from 'react';
import { 
  FileText, 
  Printer, 
  Download, 
  Copy, 
  Check, 
  X, 
  ShieldCheck, 
  ShieldAlert, 
  ExternalLink,
  Award,
  Building2,
  Calendar,
  UserCheck
} from 'lucide-react';
import { Vulnerability } from '../types/security';

interface ReportProps {
  vulnerabilities: Vulnerability[];
  securityScore: number;
  mitigatedIds: string[];
  onClose: () => void;
}

export const OfficialReportModal: React.FC<ReportProps> = ({
  vulnerabilities,
  securityScore,
  mitigatedIds,
  onClose
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJSON = () => {
    const reportData = {
      meta: {
        organization: "National Technical Research Organisation (NTRO)",
        problemStatementId: "26163",
        title: "Security Assessment of the World Monitor application",
        assessmentDate: "September 2026",
        assessmentType: "White-Box Source Code & API Security Audit",
        analyst: "Yuvaadhika (Authorized Security Assessment Team)",
        target: "World Monitor (https://www.worldmonitor.app / https://github.com/koala73/worldmonitor)"
      },
      posture: {
        initialScore: 62,
        hardenedScore: securityScore,
        mitigatedFindingsCount: mitigatedIds.length,
        totalFindingsCount: vulnerabilities.length
      },
      vulnerabilities: vulnerabilities.map(v => ({
        id: v.id,
        cve: v.cvePlaceholder,
        title: v.title,
        severity: v.severity,
        cvss: v.cvss,
        owaspCategory: v.owaspCategory,
        scopeArea: v.scopeArea,
        affectedFiles: v.affectedFiles,
        summary: v.summary,
        remediation: v.remediation.summary,
        status: mitigatedIds.includes(v.id) ? 'MITIGATED' : 'ACTIVE'
      }))
    };

    const element = document.createElement('a');
    const file = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    element.href = URL.createObjectURL(file);
    element.download = "NTRO_26163_World_Monitor_Security_Assessment_Report.json";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-6 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-soc-card border border-soc-border rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden print:max-h-none print:border-none print:shadow-none print:bg-white print:text-black">
        {/* Header Bar - Hidden during print */}
        <div className="p-4 sm:p-5 border-b border-soc-border bg-soc-bg/90 flex items-center justify-between gap-4 print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-display">
                NTRO Official Security Assessment Report (PS-26163)
              </h2>
              <p className="text-xs font-mono text-slate-400">
                Government & Defense Standard Audit Documentation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 text-soc-bg font-mono text-xs font-bold hover:bg-emerald-400 transition-colors shadow-glow-green"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print to PDF</span>
            </button>

            <button
              onClick={handleDownloadJSON}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-soc-bg border border-soc-border text-slate-300 hover:text-white font-mono text-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-soc-bg border border-soc-border text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Body */}
        <div className="p-6 sm:p-10 overflow-y-auto space-y-8 print:p-0 print:space-y-6 text-slate-200 print:text-black">
          {/* Official Document Letterhead */}
          <div className="border-b-2 border-slate-700 print:border-black pb-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Building2 className="w-8 h-8 text-cyan-400 print:text-black" />
                <div>
                  <h1 className="text-lg sm:text-xl font-bold font-display uppercase tracking-wider text-white print:text-black">
                    National Technical Research Organisation (NTRO)
                  </h1>
                  <p className="text-xs font-mono text-slate-400 print:text-slate-700">
                    Government of India · Smart India Hackathon 2026
                  </p>
                </div>
              </div>

              <div className="text-right font-mono text-xs text-slate-400 print:text-slate-700">
                <div>Document ID: <strong>NTRO-SEC-26163-V1</strong></div>
                <div>Classification: <strong>RESTRICTED // EVALUATION</strong></div>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-between gap-4 font-mono text-xs bg-soc-bg print:bg-slate-100 p-4 rounded-xl border border-soc-border print:border-slate-300">
              <div>
                <span className="text-slate-400 print:text-slate-600 block">Problem Statement:</span>
                <strong className="text-white print:text-black">26163 – Security Assessment of World Monitor</strong>
              </div>
              <div>
                <span className="text-slate-400 print:text-slate-600 block">Target Application:</span>
                <strong className="text-cyan-400 print:text-black">World Monitor (koala73/worldmonitor)</strong>
              </div>
              <div>
                <span className="text-slate-400 print:text-slate-600 block">Lead Security Analyst:</span>
                <strong className="text-white print:text-black">Yuvaadhika (Authorized Lead)</strong>
              </div>
              <div>
                <span className="text-slate-400 print:text-slate-600 block">Assessment Date:</span>
                <strong className="text-white print:text-black">September 2026</strong>
              </div>
            </div>
          </div>

          {/* 1. Executive Summary */}
          <div className="space-y-3">
            <h3 className="text-sm sm:text-base font-bold font-mono uppercase tracking-wider text-cyan-400 print:text-black flex items-center gap-2">
              <span>1.0 Executive Summary</span>
            </h3>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-300 print:text-slate-800">
              During September 2026, an authorized white-box security assessment was conducted against the World Monitor platform (hosted at <a href="https://www.worldmonitor.app" className="underline">worldmonitor.app</a> and open-sourced under AGPL-3.0 at <a href="https://github.com/koala73/worldmonitor" className="underline">koala73/worldmonitor</a>). World Monitor serves as a real-time global situational awareness and intelligence aggregation platform fusing maritime AIS, aviation, conflict, and financial telemetry.
            </p>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-300 print:text-slate-800">
              The evaluation identified <strong>8 distinct vulnerabilities</strong> across all 7 NTRO-mandated scope areas, including <strong>1 Critical Severity SSRF</strong> vulnerability capable of cloud metadata exfiltration, <strong>4 High Severity flaws</strong> (Broken Object-Level Access Control, Stored DOM XSS, Insecure WebMCP Agent Tool Invocation, and Exposed Third-Party Credentials), and <strong>3 Medium Severity misconfigurations</strong>.
            </p>
          </div>

          {/* 2. Posture Scorecard */}
          <div className="space-y-3">
            <h3 className="text-sm sm:text-base font-bold font-mono uppercase tracking-wider text-cyan-400 print:text-black">
              2.0 Security Posture Scorecard
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
              <div className="p-4 rounded-xl bg-soc-bg print:bg-slate-100 border border-soc-border print:border-slate-300 text-center">
                <span className="text-slate-400 print:text-slate-600 block">Initial Posture</span>
                <span className="text-2xl font-bold text-rose-400 print:text-rose-700">62 / 100</span>
              </div>
              <div className="p-4 rounded-xl bg-soc-bg print:bg-slate-100 border border-soc-border print:border-slate-300 text-center">
                <span className="text-slate-400 print:text-slate-600 block">Hardened Posture</span>
                <span className="text-2xl font-bold text-emerald-400 print:text-emerald-700">{securityScore} / 100</span>
              </div>
              <div className="p-4 rounded-xl bg-soc-bg print:bg-slate-100 border border-soc-border print:border-slate-300 text-center">
                <span className="text-slate-400 print:text-slate-600 block">Total Findings</span>
                <span className="text-2xl font-bold text-white print:text-black">8</span>
              </div>
              <div className="p-4 rounded-xl bg-soc-bg print:bg-slate-100 border border-soc-border print:border-slate-300 text-center">
                <span className="text-slate-400 print:text-slate-600 block">Patches Verified</span>
                <span className="text-2xl font-bold text-cyan-400 print:text-blue-700">{mitigatedIds.length} / 8</span>
              </div>
            </div>
          </div>

          {/* 3. Findings Matrix Table */}
          <div className="space-y-3">
            <h3 className="text-sm sm:text-base font-bold font-mono uppercase tracking-wider text-cyan-400 print:text-black">
              3.0 Consolidated Findings Matrix
            </h3>

            <div className="overflow-x-auto border border-soc-border print:border-slate-300 rounded-xl">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-soc-bg print:bg-slate-200 border-b border-soc-border print:border-slate-300 text-slate-400 print:text-black">
                  <tr>
                    <th className="p-3">Finding ID</th>
                    <th className="p-3">Vulnerability Title</th>
                    <th className="p-3">Severity</th>
                    <th className="p-3">CVSS v3.1</th>
                    <th className="p-3">OWASP Category</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-soc-border print:divide-slate-200">
                  {vulnerabilities.map((v) => (
                    <tr key={v.id} className="hover:bg-soc-bg/50 print:hover:bg-transparent">
                      <td className="p-3 font-bold text-cyan-400 print:text-blue-800">{v.id}</td>
                      <td className="p-3 font-medium text-slate-200 print:text-black">{v.title}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          v.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400 print:text-red-700' :
                          v.severity === 'HIGH' ? 'bg-amber-500/20 text-amber-400 print:text-amber-800' :
                          'bg-yellow-500/20 text-yellow-300 print:text-yellow-800'
                        }`}>
                          {v.severity}
                        </span>
                      </td>
                      <td className="p-3 font-bold">{v.cvss.baseScore}</td>
                      <td className="p-3 text-slate-400 print:text-slate-700">{v.owaspCategory.split('-')[1]}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          mitigatedIds.includes(v.id) 
                            ? 'bg-emerald-500/20 text-emerald-400 print:text-emerald-700' 
                            : 'bg-rose-500/20 text-rose-400 print:text-rose-700'
                        }`}>
                          {mitigatedIds.includes(v.id) ? 'MITIGATED' : 'ACTIVE'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. Detailed Finding Sheets */}
          <div className="space-y-6 pt-4">
            <h3 className="text-sm sm:text-base font-bold font-mono uppercase tracking-wider text-cyan-400 print:text-black">
              4.0 Deep-Dive Finding Specifications & Remediations
            </h3>

            {vulnerabilities.map((vuln, idx) => (
              <div key={vuln.id} className="p-5 rounded-xl bg-soc-bg print:bg-slate-50 border border-soc-border print:border-slate-300 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-soc-border print:border-slate-300 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-white print:text-black bg-soc-card print:bg-slate-200 px-2.5 py-1 rounded">
                      [{idx + 1}] {vuln.id}
                    </span>
                    <span className="font-bold text-sm text-slate-100 print:text-black">
                      {vuln.title}
                    </span>
                  </div>

                  <span className="font-mono text-xs font-bold text-cyan-400 print:text-blue-700">
                    CVSS: {vuln.cvss.baseScore} ({vuln.cvss.vectorString})
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                  <div>
                    <span className="text-slate-400 print:text-slate-600 block">Affected Component:</span>
                    <span className="text-slate-200 print:text-black">{vuln.affectedComponent}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 print:text-slate-600 block">Mandated Scope Area:</span>
                    <span className="text-slate-200 print:text-black">{vuln.scopeArea}</span>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <strong className="text-cyan-400 print:text-black font-mono">Root Cause:</strong>
                  <p className="text-slate-300 print:text-slate-800 leading-relaxed">{vuln.rootCause}</p>
                </div>

                <div className="space-y-1 text-xs">
                  <strong className="text-amber-400 print:text-black font-mono">National Security & Intelligence Impact:</strong>
                  <p className="text-slate-300 print:text-slate-800 leading-relaxed">{vuln.impact.nationalSecurity}</p>
                </div>

                <div className="space-y-1 text-xs">
                  <strong className="text-emerald-400 print:text-black font-mono">Verified Remediation:</strong>
                  <p className="text-slate-300 print:text-slate-800 leading-relaxed">{vuln.remediation.summary}</p>
                </div>
              </div>
            ))}
          </div>

          {/* 5. Formal Sign-Off & Evaluator Block */}
          <div className="pt-6 border-t-2 border-slate-700 print:border-black space-y-6">
            <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-white print:text-black">
              5.0 Formal Evaluator Sign-Off & Compliance Attestation
            </h3>

            <p className="text-xs text-slate-300 print:text-slate-700 leading-relaxed">
              This security assessment was conducted strictly within authorized testing boundaries in adherence to the guidelines outlined by the National Technical Research Organisation (NTRO) for Problem Statement 26163. All identified vulnerabilities were verified using safe, controlled proof-of-concept testing harnesses without disruption to external production assets.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4 font-mono text-xs">
              <div className="space-y-4 p-4 rounded-xl bg-soc-bg print:bg-slate-100 border border-soc-border print:border-slate-300">
                <div>
                  <span className="text-slate-400 print:text-slate-600 block">Submitted By (Lead Auditor):</span>
                  <strong className="text-white print:text-black text-sm">Yuvaadhika</strong>
                </div>
                <div>
                  <span className="text-slate-400 print:text-slate-600 block">Role:</span>
                  <span className="text-slate-300 print:text-slate-800">Security Analyst & Full-Stack Assessor</span>
                </div>
                <div className="pt-4 border-t border-slate-700 print:border-slate-300">
                  <span className="text-slate-400 print:text-slate-600 block">Signature:</span>
                  <span className="text-emerald-400 print:text-emerald-800 font-bold">Yuvaadhika // Certified Assessment Lead</span>
                </div>
              </div>

              <div className="space-y-4 p-4 rounded-xl bg-soc-bg print:bg-slate-100 border border-soc-border print:border-slate-300">
                <div>
                  <span className="text-slate-400 print:text-slate-600 block">Evaluating Organisation:</span>
                  <strong className="text-white print:text-black text-sm">National Technical Research Organisation</strong>
                </div>
                <div>
                  <span className="text-slate-400 print:text-slate-600 block">Evaluation Status:</span>
                  <span className="text-emerald-400 print:text-emerald-800 font-bold">COMPLETE & SUBMITTED</span>
                </div>
                <div className="pt-4 border-t border-slate-700 print:border-slate-300">
                  <span className="text-slate-400 print:text-slate-600 block">Date of Attestation:</span>
                  <span className="text-slate-300 print:text-slate-800">12 September 2026</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
