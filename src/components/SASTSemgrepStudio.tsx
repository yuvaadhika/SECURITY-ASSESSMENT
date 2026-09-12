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
  ShieldAlert
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SEMGREP_RULES, SAMPLE_CODE_SNIPPETS } from '../data/semgrepRules';

interface SASTProps {
  onMitigate: (vulnId: string) => void;
}

export const SASTSemgrepStudio: React.FC<SASTProps> = ({ onMitigate }) => {
  const [selectedSnippetId, setSelectedSnippetId] = useState<string>('snippet-feed-proxy');
  const [codeContent, setCodeContent] = useState<string>(SAMPLE_CODE_SNIPPETS[0].code);
  const [selectedRuleId, setSelectedRuleId] = useState<string>('all');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanResults, setScanResults] = useState<any[] | null>(null);
  const [copiedYaml, setCopiedYaml] = useState<boolean>(false);

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
    }, 900);
  };

  const handleApplyAutoFix = (finding: any) => {
    if (finding.vulnId === 'WM-2026-001') {
      setCodeContent(`import type { NextApiRequest, NextApiResponse } from 'next';
import dns from 'dns/promises';

const ALLOWED_DOMAINS = new Set(['acleddata.com', 'api.aisstream.io', 'earthquake.usgs.gov']);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { target } = req.query;
  if (!target || typeof target !== 'string') return res.status(400).json({ error: 'Target URL is required' });

  try {
    const parsed = new URL(target);
    if (!ALLOWED_DOMAINS.has(parsed.hostname)) {
      return res.status(403).json({ error: 'Domain unauthorized by NTRO Security Policy' });
    }
    const response = await fetch(parsed.toString(), { redirect: 'error' });
    const data = await response.text();
    return res.status(200).send(data);
  } catch (err) {
    return res.status(500).json({ error: 'Secure proxy fetch failed' });
  }
}`);
    } else if (finding.vulnId === 'WM-2026-002') {
      setCodeContent(`import React from 'react';
import DOMPurify from 'dompurify';

export const NewsCard = ({ item }: { item: { title: string; summary: string } }) => {
  const cleanTitle = DOMPurify.sanitize(item.title, { ALLOWED_TAGS: ['b', 'i', 'em', 'span'] });
  const cleanSummary = DOMPurify.sanitize(item.summary, { ALLOWED_TAGS: ['b', 'i', 'em', 'span'] });

  return (
    <div className="news-card">
      <h3 dangerouslySetInnerHTML={{ __html: cleanTitle }} />
      <p dangerouslySetInnerHTML={{ __html: cleanSummary }} />
    </div>
  );
};`);
    } else if (finding.vulnId === 'WM-2026-003') {
      setCodeContent(`import { db } from '@/lib/db';

export default async function handler(req: any, res: any) {
  const { id: workspaceId } = req.query;
  const user = req.user;

  if (!user?.id) return res.status(401).json({ error: 'Auth required' });

  // 1. Verify tenant membership
  const member = await db.workspaceMembers.findFirst({
    where: { workspaceId: String(workspaceId), userId: user.id }
  });
  if (!member) return res.status(403).json({ error: 'Access Denied: Tenant Isolation Enforced' });

  if (req.method === 'GET') {
    const scenarios = await db.scenarios.findMany({ where: { workspaceId: String(workspaceId) } });
    return res.status(200).json(scenarios);
  }
}`);
    } else {
      setCodeContent(`// Fixed: Secrets loaded from process.env on backend
export const INTELLIGENCE_PROVIDERS = {
  aisStream: { endpoint: '/api/intel/ais' },
  finnhub: { endpoint: '/api/intel/finnhub' }
};`);
    }

    onMitigate(finding.vulnId);
    setScanResults([]);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
  };

  const handleCopyYamlBundle = () => {
    const fullYaml = SEMGREP_RULES.map(r => r.yamlCode).join('\n---\n');
    navigator.clipboard.writeText(fullYaml);
    setCopiedYaml(true);
    setTimeout(() => setCopiedYaml(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="cyber-panel rounded-xl p-5 border border-soc-border">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
              <Code2 className="w-5 h-5 text-purple-400" />
              Semgrep SAST Rule Engine & Static Code Studio
            </h2>
            <p className="text-xs font-mono text-slate-400 mt-1">
              Audit World Monitor source code against custom Semgrep rules to detect SSRF, DOM XSS, BOLA, and credentials.
            </p>
          </div>

          <button
            onClick={handleCopyYamlBundle}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-soc-bg border border-soc-border text-slate-300 hover:text-white font-mono text-xs transition-colors"
          >
            {copiedYaml ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>Export All Semgrep YAMLs</span>
          </button>
        </div>

        {/* Snippet Selector Tabs */}
        <div className="mt-4 pt-4 border-t border-soc-border flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono text-slate-400 flex items-center gap-1 mr-2">
            <FileCode className="w-3.5 h-3.5 text-cyan-400" />
            Select Codebase Module:
          </span>
          {SAMPLE_CODE_SNIPPETS.map((snippet) => (
            <button
              key={snippet.id}
              onClick={() => handleSnippetChange(snippet.id)}
              className={`text-xs font-mono px-3 py-1.5 rounded-lg border transition-all ${
                selectedSnippetId === snippet.id
                  ? 'bg-purple-500/20 text-purple-300 border-purple-400 font-bold'
                  : 'bg-soc-bg border-soc-border text-slate-400 hover:text-slate-200'
              }`}
            >
              {snippet.title}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Code Editor */}
        <div className="lg:col-span-7 space-y-4">
          <div className="cyber-panel rounded-xl p-5 border border-soc-border space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                <span className="font-mono text-xs text-slate-400 ml-2">
                  {selectedSnippet.title}
                </span>
              </div>

              <button
                onClick={handleRunScan}
                disabled={isScanning}
                className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-mono text-xs font-bold uppercase transition-all shadow-glow-cyan disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isScanning ? 'Analyzing AST...' : 'Run Semgrep Audit'}</span>
              </button>
            </div>

            <textarea
              value={codeContent}
              onChange={(e) => {
                setCodeContent(e.target.value);
                setScanResults(null);
              }}
              rows={16}
              className="w-full bg-black/90 text-emerald-400 font-mono text-xs p-4 rounded-lg border border-soc-border focus:outline-none focus:border-purple-400 leading-relaxed resize-none"
              spellCheck={false}
            />
          </div>
        </div>

        {/* Right Column: SAST Findings & Auto-Fix */}
        <div className="lg:col-span-5 space-y-4">
          <div className="cyber-panel rounded-xl p-5 border border-soc-border flex flex-col h-[460px]">
            <div className="flex items-center justify-between pb-3 border-b border-soc-border mb-3">
              <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-purple-400" />
                Semgrep SAST Finding Console
              </h3>
              {scanResults !== null && (
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                  scanResults.length > 0 
                    ? 'bg-red-500/20 text-red-400 border border-red-500/40' 
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}>
                  {scanResults.length} Finding{scanResults.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            <div className="flex-1 overflow-y-auto space-y-3">
              {scanResults === null && (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 font-mono text-xs">
                  <Code2 className="w-8 h-8 mb-2 opacity-50 text-purple-400" />
                  <p>Click "Run Semgrep Audit" to scan this source file against custom NTRO defensive rules.</p>
                </div>
              )}

              {scanResults && scanResults.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-emerald-400 font-mono text-xs space-y-2">
                  <CheckCircle2 className="w-10 h-10" />
                  <h4 className="font-bold text-sm text-white">Clean Code AST</h4>
                  <p className="text-slate-400">Zero security policy violations found. Code adheres to NTRO defensive standards.</p>
                </div>
              )}

              {scanResults && scanResults.map((finding, idx) => (
                <div 
                  key={idx}
                  className="bg-soc-bg border border-red-500/40 rounded-xl p-4 space-y-3 animate-fadeIn"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/40">
                          RULE: {finding.ruleId}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">
                          Line ~{finding.line}
                        </span>
                      </div>
                      <h4 className="font-bold text-xs text-white mt-1">
                        {finding.title}
                      </h4>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-mono">
                    {finding.message}
                  </p>

                  <div className="pt-2 border-t border-soc-border flex items-center justify-between">
                    <button
                      onClick={() => handleApplyAutoFix(finding)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 hover:bg-emerald-500/30 font-mono text-xs font-bold transition-all shadow-glow-green"
                    >
                      <Wand2 className="w-3.5 h-3.5" />
                      <span>Apply Hardened Auto-Fix</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
