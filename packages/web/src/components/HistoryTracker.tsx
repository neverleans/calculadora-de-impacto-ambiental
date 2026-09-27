import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { History, Save, Trash2, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { SavedAssessment } from '../types/storage.js';
import { CarbonAssessmentInput, CarbonAssessmentResult } from '@carbonlens/core';

interface HistoryTrackerProps {
  savedAssessments: SavedAssessment[];
  currentInput: CarbonAssessmentInput;
  currentResult: CarbonAssessmentResult;
  onSaveCurrent: (periodLabel: string, entityName: string) => void;
  onLoadAssessment: (assessment: SavedAssessment) => void;
  onDeleteAssessment: (id: string) => void;
}

export const HistoryTracker: React.FC<HistoryTrackerProps> = ({
  savedAssessments,
  currentResult,
  onSaveCurrent,
  onLoadAssessment,
  onDeleteAssessment,
}) => {
  const [periodLabel, setPeriodLabel] = useState(`Mês Atual (${new Date().toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })})`);
  const [entityName, setEntityName] = useState('Minha Empresa / Residência');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!periodLabel.trim()) return;
    onSaveCurrent(periodLabel, entityName);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Prepare chronological data for the timeline area chart
  const timelineData = [...savedAssessments]
    .reverse()
    .map((item) => ({
      label: item.periodLabel,
      totalKg: Number(item.result.totalKgCO2e.toFixed(1)),
      scope1: Number(item.result.scopes.scope1.totalKgCO2e.toFixed(1)),
      scope2: Number(item.result.scopes.scope2.totalKgCO2e.toFixed(1)),
      scope3: Number(item.result.scopes.scope3.totalKgCO2e.toFixed(1)),
    }));

  return (
    <div className="space-y-6">
      {/* Save current assessment form */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
            <Save className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">
              Salvar Inventário Atual no Histórico Local
            </h3>
            <p className="text-xs text-slate-400">
              Armazenamento offline-first persistente para acompanhar a evolução das emissões ao longo dos meses
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <div>
            <label className="text-[11px] font-medium text-slate-300">Rótulo do Período / Mês</label>
            <input
              type="text"
              value={periodLabel}
              onChange={(e) => setPeriodLabel(e.target.value)}
              placeholder="Ex: Abril 2024"
              className="w-full bg-slate-850 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500 mt-1"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-300">Nome da Entidade / Empresa</label>
            <input
              type="text"
              value={entityName}
              onChange={(e) => setEntityName(e.target.value)}
              placeholder="Ex: TechCorp Brasil"
              className="w-full bg-slate-850 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500 mt-1"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              Salvar Registro ({currentResult.totalTonsCO2e.toFixed(3)} tCO2e)
            </button>
          </div>
        </form>

        {saveSuccess && (
          <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-lg">
            <CheckCircle2 className="w-4 h-4" />
            Inventário salvo no histórico local com sucesso!
          </div>
        )}
      </div>

      {/* Historical Trend Area Chart */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="text-sm font-semibold text-white">
                Tendência Histórica de Emissões Mensais (kg CO2e)
              </h3>
              <p className="text-xs text-slate-400">
                Acompanhamento temporal da pegada de carbono empilhada por escopo
              </p>
            </div>
          </div>
        </div>

        {timelineData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-slate-500 text-xs">
            Nenhum histórico registrado ainda. Salve seu primeiro inventário acima.
          </div>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorScope1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorScope2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorScope3" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="label" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  formatter={(val: any) => [`${val} kg CO2e`]}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="scope1"
                  stackId="1"
                  stroke="#ef4444"
                  fillOpacity={1}
                  fill="url(#colorScope1)"
                  name="Escopo 1 (Direto)"
                />
                <Area
                  type="monotone"
                  dataKey="scope2"
                  stackId="1"
                  stroke="#f59e0b"
                  fillOpacity={1}
                  fill="url(#colorScope2)"
                  name="Escopo 2 (Energia)"
                />
                <Area
                  type="monotone"
                  dataKey="scope3"
                  stackId="1"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorScope3)"
                  name="Escopo 3 (Cadeia)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Saved Records List */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
        <h3 className="text-sm font-semibold text-white">Inventários Salvos na Memória Local</h3>

        <div className="divide-y divide-slate-800">
          {savedAssessments.map((item) => (
            <div
              key={item.id}
              className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-850/40 px-2 rounded-lg transition-colors"
            >
              <div>
                <span className="text-xs font-bold text-white">{item.periodLabel}</span>
                <span className="text-xs text-slate-400 ml-2 font-mono">({item.entityName})</span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Salvo em: {new Date(item.savedAt).toLocaleDateString('pt-BR')} | Total:{' '}
                  <span className="text-emerald-400 font-mono font-bold">
                    {item.result.totalTonsCO2e.toFixed(3)} tCO2e
                  </span>{' '}
                  ({item.result.totalKgCO2e.toLocaleString('pt-BR')} kg CO2e)
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onLoadAssessment(item)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  Carregar Dados
                </button>
                <button
                  onClick={() => onDeleteAssessment(item.id)}
                  className="p-1 text-slate-500 hover:text-red-400 rounded-md transition-colors"
                  title="Excluir registro"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
