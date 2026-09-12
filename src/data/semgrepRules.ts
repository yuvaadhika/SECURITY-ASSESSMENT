import { SemgrepRule } from '../types/security';

export const SEMGREP_RULES: SemgrepRule[] = [
  {
    id: 'wm-sec-001-ssrf-fetch',
    name: 'Unvalidated Outbound Fetch Request (SSRF)',
    severity: 'ERROR',
    message: 'User-controlled query parameter is passed directly to fetch() without domain allowlist validation or private IP checks.',
    languages: ['typescript', 'javascript'],
    pattern: 'fetch(req.query.target, ...)',
    yamlCode: `rules:
  - id: wm-sec-001-ssrf-fetch
    message: "Outbound HTTP request with unvalidated user input target URL. High risk of SSRF (CWE-918)."
    languages: [typescript, javascript]
    severity: ERROR
    patterns:
      - pattern-either:
          - pattern: fetch($REQ.query.$PARAM, ...)
          - pattern: axios.get($REQ.query.$PARAM, ...)
      - pattern-not-inside:
          - pattern: |
              if (!ALLOWED_DOMAINS.has(...)) { ... }
              ...
    metadata:
      cwe: "CWE-918: Server-Side Request Forgery (SSRF)"
      owasp: "A10:2021 - Server-Side Request Forgery"
      references:
        - "https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html"`,
    targetVulnerabilityId: 'WM-2026-001'
  },
  {
    id: 'wm-sec-002-dom-xss',
    name: 'Unsanitized dangerouslySetInnerHTML Injection',
    severity: 'ERROR',
    message: 'Rendering external unvetted HTML directly into DOM without DOMPurify sanitization. High risk of DOM XSS (CWE-79).',
    languages: ['typescript', 'javascript'],
    pattern: 'dangerouslySetInnerHTML={{ __html: item.title }}',
    yamlCode: `rules:
  - id: wm-sec-002-dom-xss
    message: "Use of dangerouslySetInnerHTML without DOMPurify sanitization in React component."
    languages: [typescript, javascript]
    severity: ERROR
    patterns:
      - pattern: <$TAG ... dangerouslySetInnerHTML={{ __html: $VAL }} ... />
      - pattern-not-inside: |
          const $CLEAN = DOMPurify.sanitize(...);
          ...
          <$TAG ... dangerouslySetInnerHTML={{ __html: $CLEAN }} ... />
    metadata:
      cwe: "CWE-79: Improper Neutralization of Input During Web Page Generation ('Cross-site Scripting')"
      owasp: "A03:2021 - Injection"`,
    targetVulnerabilityId: 'WM-2026-002'
  },
  {
    id: 'wm-sec-003-bola-tenant-isolation',
    name: 'Missing Workspace Tenant Ownership Check (BOLA)',
    severity: 'ERROR',
    message: 'Database query selects workspace resources using client ID without validating requester membership (BOLA/IDOR).',
    languages: ['typescript', 'javascript'],
    pattern: 'db.scenarios.findMany({ where: { workspaceId } })',
    yamlCode: `rules:
  - id: wm-sec-003-bola-tenant-isolation
    message: "Direct database lookup on workspaceId without tenant membership validation."
    languages: [typescript, javascript]
    severity: ERROR
    patterns:
      - pattern: db.$TABLE.findMany({ where: { workspaceId: $WSID } })
      - pattern-not-inside: |
          const $MEMBER = await db.workspaceMembers.findFirst(...);
          if (!$MEMBER) { ... }
          ...
    metadata:
      cwe: "CWE-284: Improper Access Control"
      owasp: "A01:2021 - Broken Access Control"`,
    targetVulnerabilityId: 'WM-2026-003'
  },
  {
    id: 'wm-sec-006-hardcoded-api-secrets',
    name: 'Hardcoded Intelligence Vendor Credentials in Frontend',
    severity: 'ERROR',
    message: 'Hardcoded API key or private secret discovered in client bundle source code.',
    languages: ['typescript', 'javascript'],
    pattern: 'apiKey: "981273981273918273981273"',
    yamlCode: `rules:
  - id: wm-sec-006-hardcoded-api-secrets
    message: "Hardcoded API key in client-side configuration file."
    languages: [typescript, javascript]
    severity: ERROR
    patterns:
      - pattern: apiKey: '$SECRET'
      - metavariable-regex:
          metavariable: $SECRET
          regex: '^[a-zA-Z0-9_-]{20,}$'
    metadata:
      cwe: "CWE-798: Use of Hard-coded Credentials"
      owasp: "A02:2021 - Cryptographic Failures"`,
    targetVulnerabilityId: 'WM-2026-006'
  },
  {
    id: 'wm-sec-007-prototype-pollution',
    name: 'Unsanitized Object Traversal (Prototype Pollution)',
    severity: 'WARNING',
    message: 'Object assignment in recursive loop without checking for __proto__ or constructor keys.',
    languages: ['typescript', 'javascript'],
    pattern: 'target[key] = source[key]',
    yamlCode: `rules:
  - id: wm-sec-007-prototype-pollution
    message: "Potential Prototype Pollution: recursive assignment without property name sanitization."
    languages: [typescript, javascript]
    severity: WARNING
    patterns:
      - pattern: |
          for (const $KEY in $SOURCE) {
            $TARGET[$KEY] = ...
          }
      - pattern-not-inside: |
          if ($KEY === '__proto__' || $KEY === 'constructor') continue;
    metadata:
      cwe: "CWE-1321: Improperly Controlled Modification of Object Prototype Attributes"
      owasp: "A08:2021 - Software and Data Integrity Failures"`,
    targetVulnerabilityId: 'WM-2026-007'
  }
];

export const SAMPLE_CODE_SNIPPETS = [
  {
    id: 'snippet-feed-proxy',
    title: 'Feed Proxy Service (/api/proxy/feed.ts)',
    language: 'typescript',
    code: `import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { target } = req.query;

  if (!target || typeof target !== 'string') {
    return res.status(400).json({ error: 'Target URL parameter is required' });
  }

  try {
    // Unsafe: Direct fetch of query parameter
    const upstreamResponse = await fetch(target);
    const data = await upstreamResponse.text();
    return res.status(200).send(data);
  } catch (error) {
    return res.status(500).json({ error: 'Proxy fetch failed' });
  }
}`
  },
  {
    id: 'snippet-news-feed',
    title: 'News Headline Component (src/components/NewsFeed.tsx)',
    language: 'typescript',
    code: `import React from 'react';

export const NewsCard = ({ item }: { item: { title: string; summary: string } }) => {
  return (
    <div className="news-card">
      <h3 dangerouslySetInnerHTML={{ __html: item.title }} />
      <p dangerouslySetInnerHTML={{ __html: item.summary }} />
    </div>
  );
};`
  },
  {
    id: 'snippet-scenario-api',
    title: 'Scenario Engine Endpoint (/api/v1/workspaces/[id]/scenarios.ts)',
    language: 'typescript',
    code: `import { db } from '@/lib/db';

export default async function handler(req: any, res: any) {
  const { id: workspaceId } = req.query;
  const user = req.user; // Authenticated from JWT

  if (req.method === 'GET') {
    // Missing check: Does user belong to workspaceId?
    const scenarios = await db.scenarios.findMany({
      where: { workspaceId: String(workspaceId) }
    });
    return res.status(200).json(scenarios);
  }
}`
  },
  {
    id: 'snippet-provider-config',
    title: 'Provider API Configuration (src/config/providers.ts)',
    language: 'typescript',
    code: `export const INTELLIGENCE_PROVIDERS = {
  aisStream: {
    apiKey: "981273981273918273981273",
    ws: "wss://stream.aisstream.io/v0/stream"
  },
  finnhub: {
    apiKey: "c98192a83h18293810293810",
    url: "https://finnhub.io/api/v1"
  }
};`
  }
];
