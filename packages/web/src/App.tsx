import React, { useState, useMemo } from 'react';
import {
  CarbonAssessmentInput,
  calculateCarbonAssessment,
  generateAuditCsv,
} from '@carbonlens/core';
import { Header } from './components/Header.js';
import { Scope1Form } from './components/Scope1Form.js';
import { Scope2Form } from './components/Scope2Form.js';
import { Scope3Form } from './components/Scope3Form.js';
import { ResultsDashboard } from './components/ResultsDashboard.js';
import { WhatIfSimulator } from './components/WhatIfSimulator.js';
import { HistoryTracker } from './components/HistoryTracker.js';
import {
  exportEsgPdfReport,
  downloadCsvAudit,
  downloadJsonAudit,
} from './utils/pdfExport.js';
import {
  getSavedAssessments,
  saveAssessment,
  deleteAssessment,
} from './utils/storage.js';
import { SavedAssessment } from './types/storage.js';
import { ArrowRight, Building2, Calendar } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'calculator' | 'dashboard' | 'simulator' | 'history'>('calculator');
  const [savedAssessments, setSavedAssessments] = useState<SavedAssessment[]>(() => getSavedAssessments());

  // Main Assessment State
  const [assessmentInput, setAssessmentInput] = useState<CarbonAssessmentInput>({
    organizationOrIndividualName: 'Minha Organização / Residência',
    period: 'Mês Atual',
    scope1: {
      vehicles: [
        {
          fuelType: 'GASOLINE_C',
          distanceKm: 450,
        },
      ],
      stationary: {
        lpgKg: 13,
      },
    },
    scope2: {
      electricityKwh: 380,
      grid: 'BRAZIL_SIN',
      renewablePercentage: 0,
    },
    scope3: {
      waterLiters: 12000,
      wasteOrganicKg: 25,
      wasteOrganicDisposal: 'LANDFILL_NO_METHANE_CAPTURE',
      wasteRecyclableKg: 15,
      wasteRecyclableDisposal: 'RECYCLING',
      flights: [],
      useRadiativeForcing: true,
      publicTransitKm: 120,
      publicTransitMode: 'BUS_URBAN_DIESEL',
    },
  });

  // Pure Reactive Calculation Engine
  const assessmentResult = useMemo(() => {
    return calculateCarbonAssessment(assessmentInput);
  }, [assessmentInput]);

  // Handlers for export
  const handleExportPdf = () => {
    exportEsgPdfReport(assessmentResult);
  };

  const handleExportCsv = () => {
    const csv = generateAuditCsv(assessmentResult);
    downloadCsvAudit(csv);
  };

  const handleExportJson = () => {
    downloadJsonAudit(assessmentResult);
  };

  // Handlers for History
  const handleSaveCurrent = (periodLabel: string, entityName: string) => {
    const updated = saveAssessment(periodLabel, entityName, assessmentInput, assessmentResult);
    setSavedAssessments(updated);
  };

  const handleLoadAssessment = (saved: SavedAssessment) => {
    setAssessmentInput(saved.input);
    setActiveTab('dashboard');
  };

  const handleDeleteAssessment = (id: string) => {
    const updated = deleteAssessment(id);
    setSavedAssessments(updated);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-white pb-20">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onExportPdf={handleExportPdf}
        onExportCsv={handleExportCsv}
        onExportJson={handleExportJson}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Entity Metadata Bar */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Building2 className="w-4 h-4 text-emerald-400" />
              <input
                type="text"
                value={assessmentInput.organizationOrIndividualName}
                onChange={(e) =>
                  setAssessmentInput({
                    ...assessmentInput,
                    organizationOrIndividualName: e.target.value,
                  })
                }
                placeholder="Nome da Entidade"
                className="bg-transparent border-b border-dashed border-slate-700 hover:border-emerald-500 focus:border-emerald-400 focus:outline-none px-1 text-white font-medium"
              />
            </div>

            <div className="flex items-center gap-1.5 text-slate-300">
              <Calendar className="w-4 h-4 text-blue-400" />
              <input
                type="text"
                value={assessmentInput.period}
                onChange={(e) =>
                  setAssessmentInput({
                    ...assessmentInput,
                    period: e.target.value,
                  })
                }
                placeholder="Período do Inventário"
                className="bg-transparent border-b border-dashed border-slate-700 hover:border-blue-500 focus:border-blue-400 focus:outline-none px-1 text-white font-medium"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400">Total em tempo real:</span>
            <span className="font-mono font-bold text-emerald-400 text-sm">
              {assessmentResult.totalTonsCO2e.toFixed(3)} tCO2e
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              ({assessmentResult.totalKgCO2e.toFixed(1)} kg)
            </span>
          </div>
        </div>

        {/* Tab 1: Activity Input Forms */}
        {activeTab === 'calculator' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <Scope1Form
                value={assessmentInput.scope1}
                onChange={(val) =>
                  setAssessmentInput({ ...assessmentInput, scope1: val })
                }
              />

              <Scope2Form
                value={assessmentInput.scope2}
                onChange={(val) =>
                  setAssessmentInput({ ...assessmentInput, scope2: val })
                }
              />

              <Scope3Form
                value={assessmentInput.scope3 || {}}
                onChange={(val) =>
                  setAssessmentInput({ ...assessmentInput, scope3: val })
                }
              />
            </div>

            {/* Bottom transition bar */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-teal-950/40 border border-emerald-500/20 shadow-lg">
              <div>
                <span className="text-xs text-slate-400 block">Inventário Consolidado</span>
                <span className="text-lg font-bold text-white font-mono">
                  {assessmentResult.totalTonsCO2e.toFixed(3)} tCO2e
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md shadow-emerald-900/30"
                >
                  Ver Dashboard Completo & Auditoria
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Dashboard & Auditing */}
        {activeTab === 'dashboard' && (
          <ResultsDashboard
            assessment={assessmentResult}
            onExportPdf={handleExportPdf}
            onExportCsv={handleExportCsv}
          />
        )}

        {/* Tab 3: What-If Simulator & Carbon Offsets */}
        {activeTab === 'simulator' && (
          <WhatIfSimulator currentTotalKgCO2e={assessmentResult.totalKgCO2e} />
        )}

        {/* Tab 4: History & Trends */}
        {activeTab === 'history' && (
          <HistoryTracker
            savedAssessments={savedAssessments}
            currentInput={assessmentInput}
            currentResult={assessmentResult}
            onSaveCurrent={handleSaveCurrent}
            onLoadAssessment={handleLoadAssessment}
            onDeleteAssessment={handleDeleteAssessment}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/90 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-2">
          <p className="text-xs text-slate-400">
            <strong>CarbonLens</strong> — Open Carbon Accounting & ESG Engine | Desenvolvido com TypeScript, React, Vite & Tailwind CSS.
          </p>
          <p className="text-[11px] text-slate-500">
            Fórmulas e fatores em conformidade com o <strong>GHG Protocol Corporate Standard</strong>, <strong>MCTI (SIRENE Brasil)</strong>, <strong>CONPET/INMETRO</strong>, <strong>DEFRA</strong> e <strong>IPCC AR6</strong>. Licença MIT Open Source.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
