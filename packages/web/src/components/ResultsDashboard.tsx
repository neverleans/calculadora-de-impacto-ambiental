import React, { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import {
  Flame,
  Zap,
  Plane,
  AlertTriangle,
  Target,
  FileSpreadsheet,
  Download,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { CarbonAssessmentResult, generateEsgExecutiveSummary } from '@carbonlens/core';

interface ResultsDashboardProps {
  assessment: CarbonAssessmentResult;
  onExportPdf: () => void;
  onExportCsv: () => void;
}

const SCOPE_COLORS = {
  scope1: '#ef4444', // Red 500
  scope2: '#f59e0b', // Amber 500
  scope3: '#3b82f6', // Blue 500
};

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({
  assessment,
  onExportPdf,
  onExportCsv,
}) => {
  const [showFullAudit, setShowFullAudit] = useState(false);
  const summary = generateEsgExecutiveSummary(assessment);

  const pieData = [
    {
      name: 'Escopo 1 (Direto)',
      value: assessment.scopes.scope1.totalKgCO2e,
      color: SCOPE_COLORS.scope1,
      percent: assessment.shares.scope1Percent,
    },
    {
      name: 'Escopo 2 (Energia)',
      value: assessment.scopes.scope2.totalKgCO2e,
      color: SCOPE_COLORS.scope2,
      percent: assessment.shares.scope2Percent,
    },
    {
      name: 'Escopo 3 (Cadeia)',
      value: assessment.scopes.scope3.totalKgCO2e,
      color: SCOPE_COLORS.scope3,
      percent: assessment.shares.scope3Percent,
    },
  ].filter((d) => d.value > 0);

  // Top activities for bar chart
  const barData = [...assessment.auditTrail]
    .sort((a, b) => b.fossilKgCO2e - a.fossilKgCO2e)
    .slice(0, 5)
    .map((trace) => ({
      name:
        trace.activityName.length > 20
          ? `${trace.activityName.substring(0, 18)}...`
          : trace.activityName,
      emissions: Number(trace.fossilKgCO2e.toFixed(1)),
      scope: trace.scope,
    }));

  return (
    <div className="space-y-6">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Footprint */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Pegada Total Líquida
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight font-mono">
              {assessment.totalTonsCO2e.toFixed(3)}
            </span>
            <span className="text-sm font-semibold text-emerald-400">tCO2e</span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            {assessment.totalKgCO2e.toLocaleString('pt-BR')} kg CO2e
          </p>
        </div>

        {/* Scope 1 */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5" />
              Escopo 1
            </span>
            <span className="text-xs font-bold text-slate-300 font-mono">
              {assessment.shares.scope1Percent}%
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">
              {assessment.scopes.scope1.totalTonsCO2e.toFixed(3)}
            </span>
            <span className="text-xs text-slate-400">tCO2e</span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-mono">
            {assessment.scopes.scope1.totalKgCO2e.toFixed(1)} kg CO2e
          </p>
        </div>

        {/* Scope 2 */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              Escopo 2
            </span>
            <span className="text-xs font-bold text-slate-300 font-mono">
              {assessment.shares.scope2Percent}%
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">
              {assessment.scopes.scope2.totalTonsCO2e.toFixed(3)}
            </span>
            <span className="text-xs text-slate-400">tCO2e</span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-mono">
            {assessment.scopes.scope2.totalKgCO2e.toFixed(1)} kg CO2e
          </p>
        </div>

        {/* Scope 3 */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
              <Plane className="w-3.5 h-3.5" />
              Escopo 3
            </span>
            <span className="text-xs font-bold text-slate-300 font-mono">
              {assessment.shares.scope3Percent}%
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">
              {assessment.scopes.scope3.totalTonsCO2e.toFixed(3)}
            </span>
            <span className="text-xs text-slate-400">tCO2e</span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-mono">
            {assessment.scopes.scope3.totalKgCO2e.toFixed(1)} kg CO2e
          </p>
        </div>
      </div>

      {/* Visualizations & Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie / Donut Chart */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <h3 className="text-sm font-semibold text-slate-200">
            Distribuição da Pegada por Escopo GHG
          </h3>

          {pieData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-slate-500 text-xs">
              Preencha os dados nas abas de escopo para visualizar o gráfico.
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [
                      `${Number(value).toFixed(1)} kg CO2e`,
                      'Emissão',
                    ]}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 text-xs mt-2">
                <span className="flex items-center gap-1.5 text-red-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
                  E1: {assessment.shares.scope1Percent}%
                </span>
                <span className="flex items-center gap-1.5 text-amber-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                  E2: {assessment.shares.scope2Percent}%
                </span>
                <span className="flex items-center gap-1.5 text-blue-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                  E3: {assessment.shares.scope3Percent}%
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Top Emitting Activities */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <h3 className="text-sm font-semibold text-slate-200">
            Principais Fontes Emissoras (kg CO2e)
          </h3>

          {barData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-slate-500 text-xs">
              Nenhuma atividade emissora registrada.
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} layout="vertical" margin={{ left: 20, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis type="number" stroke="#64748b" fontSize={11} />
                  <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={11} width={90} />
                  <Tooltip
                    formatter={(val: any) => [`${val} kg CO2e`, 'Emissão']}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="emissions" fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Hotspot & SBTi Target Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">
                Diagnóstico de Hotspots & Metas SBTi (1,5°C)
              </h3>
              <p className="text-xs text-slate-400">
                Alinhamento com a iniciativa Science Based Targets para o teto de 2030
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onExportPdf}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Baixar Relatório Executivo (PDF)
            </button>
            <button
              onClick={onExportCsv}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              CSV
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-850 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold mb-1">
              <AlertTriangle className="w-4 h-4" />
              Ponto Crítico (Hotspot)
            </div>
            <p className="text-xs text-slate-300 font-medium">{assessment.hotspot.category}</p>
            <p className="text-[11px] text-slate-400 mt-1">{assessment.hotspot.description}</p>
          </div>

          <div className="bg-slate-850 p-4 rounded-xl border border-slate-800">
            <span className="text-xs text-emerald-400 font-semibold mb-1 block">
              Meta SBTi 2030 (-42% Absoluto)
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono text-white">
                {summary.sbtiTarget2030TonsCO2e}
              </span>
              <span className="text-xs text-slate-400">tCO2e</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Meta necessária para manter o aquecimento global abaixo de 1,5°C
            </p>
          </div>

          <div className="bg-slate-850 p-4 rounded-xl border border-slate-800">
            <span className="text-xs text-blue-400 font-semibold mb-1 block">
              Redução Anual Necessária
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono text-white">
                {(summary.annualReductionTargetTonsCO2e * 1000).toFixed(0)}
              </span>
              <span className="text-xs text-slate-400">kg CO2e/ano (-4.2%)</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Ritmo contínuo recomendado por auditorias internacionais
            </p>
          </div>
        </div>

        {/* Actionable recommendations */}
        <div className="bg-slate-850/60 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Recomendações Práticas Alinhadas
          </span>
          <ul className="space-y-1 text-xs text-slate-400">
            {summary.actionableRecommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Auditable Trace Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">
              Trilha de Auditoria Científica GHG Protocol
            </h3>
            <p className="text-xs text-slate-400">
              Cálculos transparentes com fatores de emissão oficiais e fontes citadas
            </p>
          </div>
          <button
            onClick={() => setShowFullAudit(!showFullAudit)}
            className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-medium"
          >
            {showFullAudit ? 'Recolher Trilha' : 'Expandir Trilha Completa'}
            {showFullAudit ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {showFullAudit && (
          <div className="overflow-x-auto border border-slate-800 rounded-xl mt-3">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-850 text-slate-400 font-medium border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Escopo</th>
                  <th className="py-2.5 px-3">Atividade</th>
                  <th className="py-2.5 px-3">Quantidade</th>
                  <th className="py-2.5 px-3">Fator Oficial</th>
                  <th className="py-2.5 px-3">Fonte / Norma</th>
                  <th className="py-2.5 px-3 text-right">Impacto (kg CO2e)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {assessment.auditTrail.map((trace) => (
                  <tr key={trace.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-2 px-3 font-semibold text-[11px]">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] ${
                          trace.scope === 'Scope 1'
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                            : trace.scope === 'Scope 2'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        }`}
                      >
                        {trace.scope}
                      </span>
                    </td>
                    <td className="py-2 px-3 font-medium text-slate-200">{trace.activityName}</td>
                    <td className="py-2 px-3 font-mono">
                      {trace.activityAmount} {trace.activityUnit}
                    </td>
                    <td className="py-2 px-3 font-mono text-[11px] text-slate-400">
                      {trace.emissionFactor} {trace.emissionFactorUnit}
                    </td>
                    <td className="py-2 px-3 text-[11px] text-slate-400 max-w-xs truncate" title={trace.emissionFactorSource}>
                      {trace.emissionFactorSource}
                    </td>
                    <td className="py-2 px-3 font-mono font-bold text-right text-emerald-400">
                      {trace.fossilKgCO2e.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
