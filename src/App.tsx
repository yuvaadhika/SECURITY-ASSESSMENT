import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { ExecutiveDashboard } from './components/ExecutiveDashboard';
import { VulnerabilityVault } from './components/VulnerabilityVault';
import { SafePoCSandbox } from './components/SafePoCSandbox';
import { InteractiveCVSSCalculator } from './components/InteractiveCVSSCalculator';
import { SASTSemgrepStudio } from './components/SASTSemgrepStudio';
import { ToolchainAutomation } from './components/ToolchainAutomation';
import { OfficialReportModal } from './components/OfficialReportModal';
import { Footer } from './components/Footer';
import { WORLD_MONITOR_VULNERABILITIES } from './data/vulnerabilities';
import { Vulnerability } from './types/security';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedVulnId, setSelectedVulnId] = useState<string | null>(null);
  const [mitigatedIds, setMitigatedIds] = useState<string[]>(['WM-2026-005']); // 1 pre-mitigated as demo
  const [loadedCvssVuln, setLoadedCvssVuln] = useState<Vulnerability | null>(null);
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);

  // Dynamic Posture Score Calculation: Base 62, increments as mitigations are tested/applied up to 98
  const baseScore = 62;
  const maxBonus = 36;
  const bonusPerMitigation = maxBonus / WORLD_MONITOR_VULNERABILITIES.length;
  const securityScore = Math.min(
    Math.round(baseScore + (mitigatedIds.length * bonusPerMitigation)),
    98
  );

  const toggleMitigation = (id: string) => {
    setMitigatedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleOpenSandbox = (vulnId: string) => {
    setSelectedVulnId(vulnId);
    setActiveTab('sandbox');
  };

  const handleOpenCvss = (vuln: Vulnerability) => {
    setLoadedCvssVuln(vuln);
    setActiveTab('cvss');
  };

  return (
    <div className="min-h-screen bg-soc-bg text-soc-text flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-300">
      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        securityScore={securityScore}
        onOpenReport={() => setIsReportOpen(true)}
        mitigatedCount={mitigatedIds.length}
        totalCount={WORLD_MONITOR_VULNERABILITIES.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'dashboard' && (
          <ExecutiveDashboard
            vulnerabilities={WORLD_MONITOR_VULNERABILITIES}
            securityScore={securityScore}
            mitigatedIds={mitigatedIds}
            setActiveTab={setActiveTab}
            setSelectedVulnId={setSelectedVulnId}
            onOpenReport={() => setIsReportOpen(true)}
          />
        )}

        {activeTab === 'vault' && (
          <VulnerabilityVault
            vulnerabilities={WORLD_MONITOR_VULNERABILITIES}
            selectedVulnId={selectedVulnId}
            setSelectedVulnId={setSelectedVulnId}
            mitigatedIds={mitigatedIds}
            toggleMitigation={toggleMitigation}
            onOpenSandbox={handleOpenSandbox}
            onOpenCvss={handleOpenCvss}
          />
        )}

        {activeTab === 'sandbox' && (
          <SafePoCSandbox
            vulnerabilities={WORLD_MONITOR_VULNERABILITIES}
            initialVulnId={selectedVulnId}
            onMitigate={(id) => {
              if (!mitigatedIds.includes(id)) {
                setMitigatedIds(prev => [...prev, id]);
              }
            }}
            mitigatedIds={mitigatedIds}
          />
        )}

        {activeTab === 'cvss' && (
          <InteractiveCVSSCalculator
            vulnerabilities={WORLD_MONITOR_VULNERABILITIES}
            loadedVuln={loadedCvssVuln}
          />
        )}

        {activeTab === 'sast' && (
          <SASTSemgrepStudio
            onMitigate={(id) => {
              if (!mitigatedIds.includes(id)) {
                setMitigatedIds(prev => [...prev, id]);
              }
            }}
          />
        )}

        {activeTab === 'toolchain' && (
          <ToolchainAutomation />
        )}
      </main>

      {/* Official NTRO Assessment Report Modal */}
      {isReportOpen && (
        <OfficialReportModal
          vulnerabilities={WORLD_MONITOR_VULNERABILITIES}
          securityScore={securityScore}
          mitigatedIds={mitigatedIds}
          onClose={() => setIsReportOpen(false)}
        />
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;
