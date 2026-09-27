import React from 'react';
import { Zap, Sun, Info } from 'lucide-react';
import { ElectricityGrid, Scope2Input, EMISSION_FACTORS } from '@carbonlens/core';

interface Scope2FormProps {
  value: Scope2Input;
  onChange: (val: Scope2Input) => void;
}

const GRID_OPTIONS: { value: ElectricityGrid; label: string; factor: number; source: string }[] = [
  {
    value: 'BRAZIL_SIN',
    label: 'Brasil — SIN / MCTI (Fator Médio Oficial)',
    factor: EMISSION_FACTORS.ELECTRICITY_GRIDS.BRAZIL_SIN.kgCO2ePerKwh,
    source: 'MCTI / SIRENE (Matriz predominantemente hídrica e eólica)',
  },
  {
    value: 'USA_EGRID',
    label: 'Estados Unidos — US EPA eGRID',
    factor: EMISSION_FACTORS.ELECTRICITY_GRIDS.USA_EGRID.kgCO2ePerKwh,
    source: 'US EPA eGRID (Média nacional americana)',
  },
  {
    value: 'UK_DEFRA',
    label: 'Reino Unido — UK DEFRA / DESNZ',
    factor: EMISSION_FACTORS.ELECTRICITY_GRIDS.UK_DEFRA.kgCO2ePerKwh,
    source: 'UK Department for Energy Security and Net Zero',
  },
  {
    value: 'EU_EEA',
    label: 'União Europeia — Média EEA',
    factor: EMISSION_FACTORS.ELECTRICITY_GRIDS.EU_EEA.kgCO2ePerKwh,
    source: 'European Environment Agency (EEA)',
  },
  {
    value: 'CHINA_GRID',
    label: 'China — National Grid Average',
    factor: EMISSION_FACTORS.ELECTRICITY_GRIDS.CHINA_GRID.kgCO2ePerKwh,
    source: 'IEA / National Development and Reform Commission',
  },
  {
    value: 'RENEWABLE_ZERO',
    label: '100% Renovável Rastreada (I-REC / Mercado Livre)',
    factor: 0.0,
    source: 'GHG Protocol Scope 2 Market-Based Guidance (Zero Emissões)',
  },
];

export const Scope2Form: React.FC<Scope2FormProps> = ({ value, onChange }) => {
  const currentGrid = value.grid || 'BRAZIL_SIN';
  const renewablePct = value.renewablePercentage ?? 0;

  const handleKwhPreset = (amount: number) => {
    onChange({ ...value, electricityKwh: amount });
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Escopo 2 — Eletricidade Adquirida</h3>
            <p className="text-xs text-slate-400">
              Consumo de energia elétrica da rede pública, com compensação solar e certificados I-REC
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Electricity consumption */}
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-200">
              Consumo de Eletricidade no Período (kWh)
            </label>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Consulte sua fatura mensal de energia elétrica
            </p>
          </div>

          <div className="relative">
            <input
              type="number"
              min="0"
              step="10"
              value={value.electricityKwh ?? ''}
              onChange={(e) =>
                onChange({
                  ...value,
                  electricityKwh: e.target.value === '' ? 0 : parseFloat(e.target.value),
                })
              }
              placeholder="Ex: 450"
              className="w-full bg-slate-850 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
            />
            <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-mono">
              kWh
            </span>
          </div>

          {/* Quick presets */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[10px] text-slate-400 mr-1">Atalhos:</span>
            {[
              { label: 'Apto (180 kWh)', val: 180 },
              { label: 'Casa (350 kWh)', val: 350 },
              { label: 'Escritório (1.200 kWh)', val: 1200 },
              { label: 'PME (4.500 kWh)', val: 4500 },
            ].map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => handleKwhPreset(p.val)}
                className="text-[10px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-colors"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid Selector */}
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-200">
              Matriz Elétrica Regional (Fator Oficial)
            </label>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Fator de emissão da rede para conversão em kg CO2e/kWh
            </p>
          </div>

          <select
            value={currentGrid}
            onChange={(e) =>
              onChange({ ...value, grid: e.target.value as ElectricityGrid })
            }
            className="w-full bg-slate-850 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
          >
            {GRID_OPTIONS.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label} ({g.factor.toFixed(4)} kg CO2e/kWh)
              </option>
            ))}
          </select>

          <p className="text-[10px] text-slate-400 bg-slate-850 p-2.5 rounded-lg border border-slate-800">
            Fonte: {GRID_OPTIONS.find((g) => g.value === currentGrid)?.source}
          </p>
        </div>
      </div>

      {/* Solar & Renewable self-consumption slider */}
      <div className="bg-slate-850 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sun className="w-4 h-4 text-amber-400" />
            <div>
              <span className="text-xs font-semibold text-slate-200">
                Geração Solar Fotovoltaica Própria / I-REC
              </span>
              <p className="text-[10px] text-slate-400">
                Percentual da eletricidade coberto por fontes renováveis de emissão zero
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-amber-400 font-mono bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            {renewablePct}%
          </span>
        </div>

        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value={renewablePct}
          onChange={(e) =>
            onChange({ ...value, renewablePercentage: parseInt(e.target.value, 10) })
          }
          className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
        />

        <div className="flex justify-between text-[10px] text-slate-500">
          <span>0% (100% da rede pública)</span>
          <span>50% (Geração compartilhada)</span>
          <span>100% (Autossuficiente / Net Zero Escopo 2)</span>
        </div>
      </div>

      <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-800/40 border border-slate-800 text-[11px] text-slate-400">
        <Info className="w-4 h-4 text-amber-400 flex-shrink-0" />
        <span>
          O Brasil possui uma das matrizes mais limpas do mundo: o fator médio do SIN (MCTI) é de aproximadamente <strong>0.0617 kg CO2e/kWh</strong>, cerca de 6x menor que a matriz norte-americana (0.3712 kg CO2e/kWh).
        </span>
      </div>
    </div>
  );
};
