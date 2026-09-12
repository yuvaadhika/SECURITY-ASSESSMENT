import { CVSSMetrics } from '../types/security';

export interface CVSSInput {
  version?: '3.1' | '4.0';
  attackVector: 'NETWORK' | 'ADJACENT' | 'LOCAL' | 'PHYSICAL';
  attackComplexity: 'LOW' | 'HIGH';
  privilegesRequired: 'NONE' | 'LOW' | 'HIGH';
  userInteraction: 'NONE' | 'REQUIRED';
  scope: 'UNCHANGED' | 'CHANGED';
  confidentiality: 'HIGH' | 'LOW' | 'NONE';
  integrity: 'HIGH' | 'LOW' | 'NONE';
  availability: 'HIGH' | 'LOW' | 'NONE';
}

const AV_VALUES = {
  NETWORK: 0.85,
  ADJACENT: 0.62,
  LOCAL: 0.55,
  PHYSICAL: 0.2
};

const AC_VALUES = {
  LOW: 0.77,
  HIGH: 0.44
};

const PR_VALUES_UNCHANGED = {
  NONE: 0.85,
  LOW: 0.62,
  HIGH: 0.27
};

const PR_VALUES_CHANGED = {
  NONE: 0.85,
  LOW: 0.68,
  HIGH: 0.50
};

const UI_VALUES = {
  NONE: 0.85,
  REQUIRED: 0.62
};

const CIA_VALUES = {
  NONE: 0.0,
  LOW: 0.22,
  HIGH: 0.56
};

// CVSS v3.1 round-up implementation per specification
function roundUp(input: number): number {
  const rounded = Math.round(input * 100000);
  if (rounded % 10000 === 0) {
    return rounded / 100000;
  }
  return (Math.floor(rounded / 10000) + 1) / 10;
}

export function calculateCVSS31(input: CVSSInput): CVSSMetrics {
  const av = AV_VALUES[input.attackVector];
  const ac = AC_VALUES[input.attackComplexity];
  const pr = input.scope === 'CHANGED' 
    ? PR_VALUES_CHANGED[input.privilegesRequired] 
    : PR_VALUES_UNCHANGED[input.privilegesRequired];
  const ui = UI_VALUES[input.userInteraction];

  const c = CIA_VALUES[input.confidentiality];
  const i = CIA_VALUES[input.integrity];
  const a = CIA_VALUES[input.availability];

  // Impact sub score base
  const iss = 1 - ((1 - c) * (1 - i) * (1 - a));
  
  let impact = 0;
  if (input.scope === 'UNCHANGED') {
    impact = 6.42 * iss;
  } else {
    impact = 7.52 * (iss - 0.029) - 3.25 * Math.pow((iss - 0.02), 15);
  }

  const exploitability = 8.22 * av * ac * pr * ui;

  let baseScore = 0;
  if (impact <= 0) {
    baseScore = 0;
  } else {
    if (input.scope === 'UNCHANGED') {
      baseScore = roundUp(Math.min(impact + exploitability, 10));
    } else {
      baseScore = roundUp(Math.min(1.08 * (impact + exploitability), 10));
    }
  }

  // Generate Vector String
  const avCode = input.attackVector === 'NETWORK' ? 'N' : input.attackVector === 'ADJACENT' ? 'A' : input.attackVector === 'LOCAL' ? 'L' : 'P';
  const acCode = input.attackComplexity === 'LOW' ? 'L' : 'H';
  const prCode = input.privilegesRequired === 'NONE' ? 'N' : input.privilegesRequired === 'LOW' ? 'L' : 'H';
  const uiCode = input.userInteraction === 'NONE' ? 'N' : 'R';
  const sCode = input.scope === 'UNCHANGED' ? 'U' : 'C';
  const cCode = input.confidentiality === 'NONE' ? 'N' : input.confidentiality === 'LOW' ? 'L' : 'H';
  const iCode = input.integrity === 'NONE' ? 'N' : input.integrity === 'LOW' ? 'L' : 'H';
  const aCode = input.availability === 'NONE' ? 'N' : input.availability === 'LOW' ? 'L' : 'H';

  const vectorString = `CVSS:3.1/AV:${avCode}/AC:${acCode}/PR:${prCode}/UI:${uiCode}/S:${sCode}/C:${cCode}/I:${iCode}/A:${aCode}`;

  return {
    version: '3.1',
    vectorString,
    baseScore: Math.min(Math.max(baseScore, 0), 10),
    impactScore: roundUp(impact),
    exploitabilityScore: roundUp(exploitability),
    attackVector: input.attackVector,
    attackComplexity: input.attackComplexity,
    privilegesRequired: input.privilegesRequired,
    userInteraction: input.userInteraction,
    scope: input.scope,
    confidentiality: input.confidentiality,
    integrity: input.integrity,
    availability: input.availability
  };
}

export function getSeverityRating(score: number): {
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  color: string;
  badgeClass: string;
} {
  if (score >= 9.0) {
    return { severity: 'CRITICAL', color: '#ff3366', badgeClass: 'bg-red-500/20 text-red-400 border-red-500/40' };
  }
  if (score >= 7.0) {
    return { severity: 'HIGH', color: '#ff8800', badgeClass: 'bg-amber-500/20 text-amber-400 border-amber-500/40' };
  }
  if (score >= 4.0) {
    return { severity: 'MEDIUM', color: '#ffcc00', badgeClass: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40' };
  }
  if (score >= 0.1) {
    return { severity: 'LOW', color: '#38bdf8', badgeClass: 'bg-blue-500/20 text-blue-300 border-blue-500/40' };
  }
  return { severity: 'INFO', color: '#a78bfa', badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/40' };
}
