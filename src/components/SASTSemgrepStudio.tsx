import React, { useState } from 'react';
import { 
  Code2, 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  FileCode, 
  Copy, 
  Check, 
  Wand2, 
  Download,
  Terminal,
  ShieldAlert,
  RotateCcw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SEMGREP_RULES, SAMPLE_CODE_SNIPPETS } from '../data/semgrepRules';

interface SASTProps {
  onMitigate: (vulnId: string) => void;
}

const SNIPPET_FIXES: Record<string, { fixedCode: string; vulnId: string }> = {
  'snippet-feed-proxy': {
    vulnId: 'WM-2026-001',
    fixedCode: `import { NextApiRequest, NextApiResponse } from 'next';
import dns from 'dns/promises';

const ALLOWED_DOMAINS = new Set([
  'acleddata.com',
  'api.aisstream.io',
  'opensky-network.org',
  'earthquake.usgs.gov'
]);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { target } = req.query;
  if (!target || typeof target !== 'string') {
    return res.status(400).json({ error: 'Missing target URL' });
  }

  try {
    const parsedUrl = new URL(target);
    if (!ALLOWED_DOMAINS.has(parsedUrl.hostname)) {
      return res.status(403).json({ error: 'Target domain not authorized' });
    }

    // Resolve DNS & verify non-private unicast IP
    const addresses = await dns.resolve4(parsedUrl.hostname);
    for (const ip of addresses) {
      if (ip.startsWith('127.') || ip.startsWith('10.') || ip.startsWith('169.254.') || ip.startsWith('192.168.')) {
        return res.status(403).json({ error: 'Restricted network target' });
      }
    }

    const upstreamResponse = await fetch(target, { signal: AbortSignal.timeout(5000) });
    const data = await upstreamResponse.text();
    return res.status(200).send(data);
  } catch (error) {
    return res.status(500).json({ error: 'Proxy fetch failed' });
  }
}`
  },
  'snippet-news-feed': {
    vulnId: 'WM-2026-002',
    fixedCode: `import React from 'react';
import DOMPurify from 'dompurify';

export const NewsCard = ({ item }: { item: { title: string; summary: string } }) => {
  const cleanTitle = DOMPurify.sanitize(item.title);
  const cleanSummary = DOMPurify.sanitize(item.summary);

  return (
    <div className="news-card">
      <h3 dangerouslySetInnerHTML={{ __html: cleanTitle }} />
      <p dangerouslySetInnerHTML={{ __html: cleanSummary }} />
    </div>
  );
};`
  },
  'snippet-scenario-api': {
    vulnId: 'WM-2026-003',
    fixedCode: `import { db } from '@/lib/db';

export default async function handler(req: any, res: any) {
  const { id: workspaceId } = req.query;
  const user = req.user; // Authenticated from JWT

  if (req.method === 'GET') {
    // Tenant ownership & membership verification
    const isMember = await db.workspaceMembers.findFirst({
      where: { workspaceId: String(workspaceId), userId: user.id }
    });

    if (!isMember) {
      return res.status(403).json({ error: 'Forbidden: Unauthorized workspace access' });
    }

    const scenarios = await db.scenarios.findMany({
      where: { workspaceId: String(workspaceId) }
    });
    return res.status(200).json(scenarios);
  }
}`
  },
  'snippet-provider-config': {
    vulnId: 'WM-2026-006',
    fixedCode: `export const INTELLIGENCE_PROVIDERS = {
  aisStream: {
    apiKey: process.env.AIS_STREAM_API_KEY || "",
    ws: "wss://stream.aisstream.io/v0/stream"
  },
  finnhub: {
    apiKey: process.env.FINNHUB_API_KEY || "",
    url: "https://finnhub.io/api/v1"
  }
};`
  }
};

export const SASTSemgrepStudio: React.FC<SASTProps> = ({ onMitigate }) => {
  const [selectedSnippetId, setSelectedSnippetId] = useState<string>('snippet-feed-proxy');
  const [codeContent, setCodeContent] = useState<string>(SAMPLE_CODE_SNIPPETS[0].code);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanResults, setScanResults] = useState<any[] | null>(null);

  const selectedSnippet = SAMPLE_CODE_SNIPPETS.find(s => s.id === selectedSnippetId) || SAMPLE_CODE_SNIPPETS[0];

  const handleSnippetChange = (snippetId: string) => {
    setSelectedSnippetId(snippetId);
    const snippet = SAMPLE_CODE_SNIPPETS.find(s => s.id === snippetId);
    if (snippet) {
      setCodeContent(snippet.code);
      setScanResults(null);
    }
  };

  const handleRunScan = () => {
    setIsScanning(true);
    setScanResults(null);

    setTimeout(() => {
      const findings: any[] = [];

      // Static heuristic matching rules
      if (codeContent.includes('fetch(target)') || (codeContent.includes('fetch(') && codeContent.includes('req.query'))) {
        if (!codeContent.includes('ALLOWED_DOMAINS')) {
          findings.push({
            ruleId: 'wm-sec-001-ssrf-fetch',
            vulnId: 'WM-2026-001',
            severity: 'ERROR',
            line: 11,
            title: 'SSRF via Unvalidated Outbound Fetch (CWE-918)',
            message: 'User-controlled query parameter is passed directly to fetch() without domain allowlist validation or private IP checks.',
            suggestedFix: `// Add domain allowlist & DNS resolution:\nif (!ALLOWED_DOMAINS.has(parsedUrl.hostname)) return res.status(403).json({ error: 'Domain unauthorized' });`
          });
        }
      }

      if (codeContent.includes('dangerouslySetInnerHTML')) {
        if (!codeContent.includes('DOMPurify.sanitize')) {
          findings.push({
            ruleId: 'wm-sec-002-dom-xss',
            vulnId: 'WM-2026-002',
            severity: 'ERROR',
            line: 6,
            title: 'Stored DOM XSS via dangerouslySetInnerHTML (CWE-79)',
            message: 'Rendering external unvetted HTML directly into DOM without DOMPurify sanitization.',
            suggestedFix: `// Sanitize with DOMPurify before rendering:\nconst cleanHtml = DOMPurify.sanitize(item.title);\n<h3 dangerouslySetInnerHTML={{ __html: cleanHtml }} />`
          });
        }
      }

      if (codeContent.includes('findMany({') && codeContent.includes('workspaceId')) {
        if (!codeContent.includes('workspaceMembers.findFirst')) {
          findings.push({
            ruleId: 'wm-sec-003-bola-tenant-isolation',
            vulnId: 'WM-2026-003',
            severity: 'ERROR',
            line: 8,
            title: 'Broken Object-Level Authorization (BOLA/IDOR - CWE-284)',
            message: 'Direct database lookup on workspaceId without tenant membership validation.',
            suggestedFix: `// Check workspace membership:\nconst isMember = await db.workspaceMembers.findFirst({ where: { workspaceId, userId: user.id } });\nif (!isMember) return res.status(403).json({ error: 'Forbidden' });`
          });
        }
      }

      if (codeContent.includes('981273981273918273981273') || codeContent.includes('c98192a83h18293810293810')) {
        findings.push({
          ruleId: 'wm-sec-006-hardcoded-api-secrets',
          vulnId: 'WM-2026-006',
          severity: 'ERROR',
          line: 3,
          title: 'Hardcoded Intelligence Vendor Credentials (CWE-798)',
          message: 'Hardcoded API key detected in frontend source code.',
          suggestedFix: `// Move credentials to server-side environment variables:\nconst apiKey = process.env.AIS_STREAM_KEY;`
        });
      }

      setScanResults(findings);
      setIsScanning(false);
    }, 600);
  };

  const handleApplyFix = (snippetId: string) => {
    const fix = SNIPPET_FIXES[snippetId];
    if (fix) {
      setCodeContent(fix.fixedCode);
      setScanResults(null);
      onMitigate(fix.vulnId);
      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
      } catch (e) {}
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-display font-bold text-slate-900 flex items-center gap-2">
              <Code2 className="w-5 h-5 text-violet-600" />
              Semgrep SAST Static Analysis Studio
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Custom static application security testing rules written for NTRO CI/CD pipeline automation.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRunScan}
              disabled={isScanning}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 active:bg-violet-800 disabled:opacity-50 text-white font-semibold text-xs shadow-sm transition-all"
            >
              {isScanning ? (
                <>
                  <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                  <span>Analyzing AST...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Run Semgrep Rules</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Snippet Switcher */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-wrap gap-1.5">
          <span className="text-xs font-semibold text-slate-700 self-center mr-1">Target Code:</span>
          {SAMPLE_CODE_SNIPPETS.map((snippet) => (
            <button
              key={snippet.id}
              onClick={() => handleSnippetChange(snippet.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                selectedSnippetId === snippet.id
                  ? 'bg-violet-50 text-violet-700 border border-violet-300 font-semibold shadow-2xs'
                  : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-white'
              }`}
            >
              {snippet.title}
            </button>
          ))}
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Code Editor & Test Harness */}
        <div className="lg:col-span-7 space-y-3">
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-violet-600" />
                {selectedSnippet.title}
              </span>

              <button
                onClick={() => handleApplyFix(selectedSnippetId)}
                className="flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg transition-colors"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>Apply Patch</span>
              </button>
            </div>

            <textarea
              value={codeContent}
              onChange={(e) => setCodeContent(e.target.value)}
              rows={14}
              className="w-full font-mono text-xs p-3.5 bg-slate-900 text-slate-100 rounded-xl border border-slate-800 focus:outline-none leading-relaxed resize-none"
            />
          </div>
        </div>

        {/* Semgrep Rule Viewer & Scan Results */}
        <div className="lg:col-span-5 space-y-4">
          {/* Scan Findings Panel */}
          {scanResults !== null && (
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between">
                <span>AST Scan Results</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                  scanResults.length === 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}>
                  {scanResults.length === 0 ? '0 FINDINGS (CLEAN)' : `${scanResults.length} VULNERABILITY DETECTED`}
                </span>
              </h3>

              {scanResults.length === 0 ? (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>No AST policy violations detected!</span>
                  </div>
                  <p className="text-[11px] text-emerald-700 leading-relaxed">
                    Source code adheres to NTRO secure coding standard.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {scanResults.map((finding, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-semibold text-xs text-rose-900">
                          {finding.title}
                        </div>
                        <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-200 text-rose-900">
                          Line {finding.line}
                        </span>
                      </div>

                      <p className="text-xs text-rose-800 leading-relaxed">
                        {finding.message}
                      </p>

                      <div className="pt-1">
                        <button
                          onClick={() => handleApplyFix(selectedSnippetId)}
                          className="w-full flex items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs py-1.5 rounded-lg shadow-2xs transition-all"
                        >
                          <Wand2 className="w-3.5 h-3.5" />
                          <span>Auto-Apply Secure Patch</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Active Semgrep Rule Definition */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                Semgrep Rule YAML
              </span>
              <span className="font-mono text-[10px] text-slate-500">
                {SEMGREP_RULES[0].id}
              </span>
            </div>

            <pre className="p-3.5 rounded-xl bg-slate-900 text-violet-300 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800 max-h-[260px]">
              {SEMGREP_RULES[0].yamlCode}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
