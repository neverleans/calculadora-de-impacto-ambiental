import React, { useState } from 'react';
import {
  Sparkles,
  TreeDeciduous,
  Coins,
  Bus,
  Sun,
  Trash2,
  TrendingDown,
} from 'lucide-react';
import {
  simulateCommuteReplacement,
  simulateSolarTransition,
  simulateWasteDiversion,
  calculateForestryOffset,
  estimateVoluntaryCarbonCredits,
  FuelType,
  TransitMode,
} from '@carbonlens/core';

interface WhatIfSimulatorProps {
  currentTotalKgCO2e: number;
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({ currentTotalKgCO2e }) => {
  // Scenario 1: Commute replacement
  const [commuteDays, setCommuteDays] = useState(3);
  const [commuteDistance, setCommuteDistance] = useState(30);
  const [carFuel, setCarFuel] = useState<FuelType>('GASOLINE_C');
  const [transitMode, setTransitMode] = useState<TransitMode>('METRO_SUBWAY_TRAIN');

  // Scenario 2: Solar
  const [annualKwh, setAnnualKwh] = useState(4800);
  const [solarPct, setSolarPct] = useState(80);

  // Scenario 3: Waste
  const [annualOrganicKg, setAnnualOrganicKg] = useState(350);
  const [annualRecyclableKg, setAnnualRecyclableKg] = useState(180);

  // VCM FX
  const [exchangeRate, setExchangeRate] = useState(5.5);

  // Calculations
  const commuteResult = simulateCommuteReplacement({
    carFuelType: carFuel,
    roundTripKmPerDay: commuteDistance,
    daysReplacedPerWeek: commuteDays,
    workingWeeksPerYear: 48,
    replacementMode: transitMode,
  });

  const solarResult = simulateSolarTransition({
    annualKwh,
    solarCoveragePercent: solarPct,
    grid: 'BRAZIL_SIN',
  });

  const wasteResult = simulateWasteDiversion({
    annualOrganicKg,
    annualRecyclableKg,
  });

  const forestryOffset = calculateForestryOffset(currentTotalKgCO2e);
  const carbonCredits = estimateVoluntaryCarbonCredits(currentTotalKgCO2e, exchangeRate);

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900/80 to-teal-950/60 border border-emerald-500/20 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">
              Simulador Estratégico What-If & Compensação de Carbono
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Simule o impacto de mudanças de comportamento, restauração de biomas brasileiros e custos no Mercado Voluntário de Carbono (VCM).
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Offset & Credit Valuation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mata Atlântica Tree Offsetting */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                <TreeDeciduous className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Restauração Ecológica na Mata Atlântica
                </h3>
                <p className="text-[11px] text-slate-400">
                  Modelo biométrico de sequestro por árvores nativas em restauração
                </p>
              </div>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
              Bioma Mata Atlântica
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-850 p-3.5 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 block">
                Mudas Necessárias (Ciclo 25 anos)
              </span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold text-emerald-400 font-mono">
                  {forestryOffset.treesNeededLifetime}
                </span>
                <span className="text-xs text-slate-300">árvores</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                ~150 kg CO2 sequestrado por árvore nativa adulta
              </p>
            </div>

            <div className="bg-slate-850 p-3.5 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 block">
                Mudas para Compensação Anual Imediata
              </span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold text-emerald-400 font-mono">
                  {forestryOffset.treesNeededAnnual}
                </span>
                <span className="text-xs text-slate-300">árvores</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Taxa média de 15.6 kg CO2 absorvido / árvore / ano
              </p>
            </div>
          </div>

          <div className="bg-slate-850/60 p-3 rounded-xl border border-slate-800 text-xs space-y-1 text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-400">Área florestal restaurada estimada:</span>
              <span className="font-mono font-semibold text-emerald-400">
                {forestryOffset.forestAreaSquareMetersEstimate} m² (~{(forestryOffset.forestAreaSquareMetersEstimate / 10000).toFixed(4)} ha)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Base científica:</span>
              <span className="text-[10px] text-slate-400 text-right truncate max-w-xs" title={forestryOffset.scientificReference}>
                {forestryOffset.scientificReference}
              </span>
            </div>
          </div>
        </div>

        {/* Voluntary Carbon Market (VCM) Valuation */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Valoração no Mercado Voluntário de Carbono (VCM)
                </h3>
                <p className="text-[11px] text-slate-400">
                  Faixas de preço de créditos de carbono certificados (Verra / Gold Standard / CDR)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-400">USD/BRL:</span>
              <input
                type="number"
                step="0.1"
                value={exchangeRate}
                onChange={(e) => setExchangeRate(parseFloat(e.target.value) || 5.5)}
                className="w-14 bg-slate-850 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-slate-200 font-mono text-center"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div className="bg-slate-850 p-3 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 block font-medium">1. Conservador</span>
              <span className="text-xs text-slate-400 font-mono block">
                US$ {carbonCredits.pricePerTonUSD.low}/t
              </span>
              <span className="text-base font-bold text-white font-mono block">
                R$ {carbonCredits.estimatedTotalBRL.low.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                US$ {carbonCredits.estimatedTotalUSD.low.toFixed(2)}
              </span>
            </div>

            <div className="bg-slate-850 p-3 rounded-xl border border-teal-500/30 bg-teal-950/20 space-y-1">
              <span className="text-[10px] text-teal-400 block font-semibold">2. Padrão Ouro (VCS)</span>
              <span className="text-xs text-teal-300 font-mono block">
                US$ {carbonCredits.pricePerTonUSD.average}/t
              </span>
              <span className="text-base font-bold text-emerald-400 font-mono block">
                R$ {carbonCredits.estimatedTotalBRL.average.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                US$ {carbonCredits.estimatedTotalUSD.average.toFixed(2)}
              </span>
            </div>

            <div className="bg-slate-850 p-3 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[10px] text-indigo-400 block font-medium">3. CDR Premium</span>
              <span className="text-xs text-indigo-300 font-mono block">
                US$ {carbonCredits.pricePerTonUSD.highQualityCDR}/t
              </span>
              <span className="text-base font-bold text-white font-mono block">
                R$ {carbonCredits.estimatedTotalBRL.highQualityCDR.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                US$ {carbonCredits.estimatedTotalUSD.highQualityCDR.toFixed(2)}
              </span>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 bg-slate-850 p-2.5 rounded-lg border border-slate-800">
            Valores de referência para compensação no mercado voluntário corporativo para o inventário total de{' '}
            <strong>{carbonCredits.totalTonsCO2e.toFixed(3)} tCO2e</strong>.
          </p>
        </div>
      </div>

      {/* Scenario 1: Car to Public Transit Substitution */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
            <Bus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">
              Cenário What-If: Troca de Carro por Transporte Público
            </h3>
            <p className="text-xs text-slate-400">
              "Se eu trocar meu carro por transporte público X dias na semana, quanto reduzo em 1 ano?"
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1">
            <label className="text-[11px] text-slate-400">Combustível do Carro</label>
            <select
              value={carFuel}
              onChange={(e) => setCarFuel(e.target.value as FuelType)}
              className="w-full bg-slate-850 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
            >
              <option value="GASOLINE_C">Gasolina C (162 g/km)</option>
              <option value="DIESEL_S10">Diesel S10 (245 g/km)</option>
              <option value="CNG_GNV">GNV (178 g/km)</option>
              <option value="HEV_GASOLINE">Híbrido (95 g/km)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] text-slate-400">Distância Diária (Ida + Volta)</label>
            <div className="relative">
              <input
                type="number"
                min="1"
                value={commuteDistance}
                onChange={(e) => setCommuteDistance(Math.max(1, parseFloat(e.target.value) || 1))}
                className="w-full bg-slate-850 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-mono"
              />
              <span className="absolute right-2.5 top-1.5 text-xs text-slate-400 font-mono">km</span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] text-slate-400">Dias Substituídos por Semana</label>
            <select
              value={commuteDays}
              onChange={(e) => setCommuteDays(parseInt(e.target.value, 10))}
              className="w-full bg-slate-850 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-mono"
            >
              {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                <option key={d} value={d}>
                  {d} {d === 1 ? 'dia por semana' : 'dias por semana'}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] text-slate-400">Modal Alternativo</label>
            <select
              value={transitMode}
              onChange={(e) => setTransitMode(e.target.value as TransitMode)}
              className="w-full bg-slate-850 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
            >
              <option value="METRO_SUBWAY_TRAIN">Metrô / Trem (24 g/km)</option>
              <option value="BUS_BRT_ELECTRIC">BRT / Ônibus Elétrico (28 g/km)</option>
              <option value="BUS_URBAN_DIESEL">Ônibus Diesel (89 g/km)</option>
              <option value="CYCLING_WALKING">Bicicleta / Caminhada (0 g/km)</option>
            </select>
          </div>
        </div>

        {/* Results of Commute Simulation */}
        <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
              <TrendingDown className="w-4 h-4" />
              Redução Evitada de Carbono
            </div>
            <p className="text-xs text-slate-300 max-w-xl">{commuteResult.explanation}</p>
          </div>

          <div className="text-right sm:border-l border-emerald-500/20 sm:pl-4">
            <span className="text-xs text-slate-400 block font-medium">Economia Anual</span>
            <div className="flex items-baseline gap-1 mt-0.5 justify-end">
              <span className="text-2xl font-extrabold text-emerald-400 font-mono">
                {commuteResult.avoidedAnnualKgCO2e.toFixed(1)}
              </span>
              <span className="text-xs text-slate-300">kg CO2e/ano</span>
            </div>
            <span className="text-[11px] text-emerald-300 font-mono font-medium">
              (-{commuteResult.percentReduction}% de corte)
            </span>
          </div>
        </div>
      </div>

      {/* Scenario 2: Solar Transition & Scenario 3: Waste Diversion */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Solar */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <Sun className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              Simulação de Energia Solar Fotovoltaica
            </h4>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-400">Consumo Anual (kWh)</label>
              <input
                type="number"
                min="0"
                step="500"
                value={annualKwh}
                onChange={(e) => setAnnualKwh(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-850 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400">Cobertura Solar (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="5"
                value={solarPct}
                onChange={(e) => setSolarPct(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-850 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-mono"
              />
            </div>
          </div>

          <div className="bg-slate-850 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
            <span className="text-slate-300">{solarResult.explanation}</span>
            <div className="pt-2 flex justify-between font-mono font-bold text-amber-400">
              <span>Evitado anualmente:</span>
              <span>{solarResult.avoidedAnnualKgCO2e.toFixed(1)} kg CO2e</span>
            </div>
          </div>
        </div>

        {/* Waste Diversion */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <Trash2 className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              Simulação de Compostagem & Reciclagem Total
            </h4>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-400">Orgânicos Anuais (kg)</label>
              <input
                type="number"
                min="0"
                value={annualOrganicKg}
                onChange={(e) => setAnnualOrganicKg(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-850 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400">Recicláveis Anuais (kg)</label>
              <input
                type="number"
                min="0"
                value={annualRecyclableKg}
                onChange={(e) => setAnnualRecyclableKg(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-850 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-mono"
              />
            </div>
          </div>

          <div className="bg-slate-850 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
            <span className="text-slate-300">{wasteResult.explanation}</span>
            <div className="pt-2 flex justify-between font-mono font-bold text-emerald-400">
              <span>Evitado anualmente:</span>
              <span>{wasteResult.avoidedAnnualKgCO2e.toFixed(1)} kg CO2e</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
