export type SeverityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export type OWASPCategory = 
  | 'A01:2021-Broken Access Control'
  | 'A02:2021-Cryptographic Failures'
  | 'A03:2021-Injection'
  | 'A04:2021-Insecure Design'
  | 'A05:2021-Security Misconfiguration'
  | 'A06:2021-Vulnerable and Outdated Components'
  | 'A07:2021-Identification and Authentication Failures'
  | 'A08:2021-Software and Data Integrity Failures'
  | 'A09:2021-Security Logging and Monitoring Failures'
  | 'A10:2021-Server-Side Request Forgery (SSRF)';

export type ScopeArea = 
  | 'Authentication and session management'
  | 'Authorization and access control'
  | 'Input validation and data handling'
  | 'API security'
  | 'Client-side security controls'
  | 'Secure communication mechanisms'
  | 'Data storage and privacy protections';

export interface CVSSMetrics {
  version: '3.1' | '4.0';
  vectorString: string;
  baseScore: number;
  impactScore: number;
  exploitabilityScore: number;
  attackVector: 'NETWORK' | 'ADJACENT' | 'LOCAL' | 'PHYSICAL';
  attackComplexity: 'LOW' | 'HIGH';
  privilegesRequired: 'NONE' | 'LOW' | 'HIGH';
  userInteraction: 'NONE' | 'REQUIRED';
  scope: 'UNCHANGED' | 'CHANGED';
  confidentiality: 'HIGH' | 'LOW' | 'NONE';
  integrity: 'HIGH' | 'LOW' | 'NONE';
  availability: 'HIGH' | 'LOW' | 'NONE';
}

export interface Vulnerability {
  id: string; // e.g. "WM-2026-001"
  cvePlaceholder?: string;
  title: string;
  severity: SeverityLevel;
  cvss: CVSSMetrics;
  owaspCategory: OWASPCategory;
  scopeArea: ScopeArea;
  affectedComponent: string;
  affectedFiles: string[];
  summary: string;
  technicalDescription: string;
  rootCause: string;
  stepsToReproduce: string[];
  proofOfConcept: {
    title: string;
    description: string;
    httpPayload?: string;
    pythonScript?: string;
    expectedOutcome: string;
  };
  impact: {
    technical: string;
    business: string;
    nationalSecurity: string;
  };
  remediation: {
    summary: string;
    guidelines: string[];
    vulnerableCode: string;
    patchedCode: string;
    semgrepRuleYaml: string;
  };
  status: 'IDENTIFIED' | 'VERIFIED' | 'PATCH_AVAILABLE' | 'MITIGATED';
  verifiedInSandbox: boolean;
}

export interface SemgrepRule {
  id: string;
  name: string;
  severity: 'ERROR' | 'WARNING' | 'INFO';
  message: string;
  languages: string[];
  pattern: string;
  yamlCode: string;
  targetVulnerabilityId: string;
}

export interface SecurityScorecard {
  initialScore: number;
  currentScore: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  mitigatedCount: number;
  totalVulnerabilities: number;
}
