/**
 * CarbonLens — What-If Scenario Simulation Engine
 * Simulates the carbon reduction impact of strategic behavioral and operational changes
 */

import { EMISSION_FACTORS } from '../constants/factors.js';
import { WhatIfCommuteScenarioInput, WhatIfCommuteScenarioResult } from '../types/index.js';

export function simulateCommuteReplacement(
  input: WhatIfCommuteScenarioInput
): WhatIfCommuteScenarioResult {
  const weeks = input.workingWeeksPerYear || 48;
  const annualKmReplaced = input.roundTripKmPerDay * input.daysReplacedPerWeek * weeks;

  const carFactor = EMISSION_FACTORS.VEHICLES_PER_KM[input.carFuelType].fossilKgPerKm;
  const transitData = EMISSION_FACTORS.PUBLIC_TRANSIT[input.replacementMode];
  const transitFactor = transitData.kgCO2ePerPkm;

  const baselineCarAnnualKg = annualKmReplaced * carFactor;
  const transitAnnualKg = annualKmReplaced * transitFactor;
  const avoidedAnnualKg = Math.max(0, baselineCarAnnualKg - transitAnnualKg);
  const percentReduction =
    baselineCarAnnualKg > 0 ? (avoidedAnnualKg / baselineCarAnnualKg) * 100 : 0;

  const explanation =
    `Substituir ${input.daysReplacedPerWeek} dias/semana de carro (${input.carFuelType}) por ` +
    `${transitData.label} ao longo de ${weeks} semanas úteis (${annualKmReplaced.toLocaleString('pt-BR')} km/ano) ` +
    `evita a emissão direta de ${avoidedAnnualKg.toFixed(1)} kg CO2e/ano, gerando uma redução de ${percentReduction.toFixed(1)}% ` +
    `no trecho migrado.`;

  return {
    baselineCarAnnualKgCO2e: Number(baselineCarAnnualKg.toFixed(2)),
    transitAnnualKgCO2e: Number(transitAnnualKg.toFixed(2)),
    avoidedAnnualKgCO2e: Number(avoidedAnnualKg.toFixed(2)),
    avoidedAnnualTonsCO2e: Number((avoidedAnnualKg / 1000).toFixed(4)),
    percentReduction: Number(percentReduction.toFixed(1)),
    explanation,
  };
}

export interface WhatIfSolarTransitionInput {
  annualKwh: number;
  solarCoveragePercent: number; // e.g. 80 for 80%
  grid?: keyof typeof EMISSION_FACTORS.ELECTRICITY_GRIDS;
}

export interface WhatIfSolarTransitionResult {
  baselineElectricityKgCO2e: number;
  solarElectricityKgCO2e: number;
  avoidedAnnualKgCO2e: number;
  avoidedAnnualTonsCO2e: number;
  explanation: string;
}

export function simulateSolarTransition(
  input: WhatIfSolarTransitionInput
): WhatIfSolarTransitionResult {
  const gridKey = input.grid || 'BRAZIL_SIN';
  const gridFactor = EMISSION_FACTORS.ELECTRICITY_GRIDS[gridKey].kgCO2ePerKwh;
  const baselineKg = input.annualKwh * gridFactor;

  const ratio = Math.min(100, Math.max(0, input.solarCoveragePercent)) / 100;
  const avoidedKg = baselineKg * ratio;
  const remainingKg = baselineKg - avoidedKg;

  const explanation =
    `Ao cobrir ${input.solarCoveragePercent}% da demanda elétrica anual (${input.annualKwh.toLocaleString('pt-BR')} kWh) ` +
    `com geração própria solar fotovoltaica / renovável, evita-se ${avoidedKg.toFixed(1)} kg CO2e/ano ` +
    `(${ (avoidedKg / 1000).toFixed(3) } tCO2e/ano) da rede ${gridKey}.`;

  return {
    baselineElectricityKgCO2e: Number(baselineKg.toFixed(2)),
    solarElectricityKgCO2e: Number(remainingKg.toFixed(2)),
    avoidedAnnualKgCO2e: Number(avoidedKg.toFixed(2)),
    avoidedAnnualTonsCO2e: Number((avoidedKg / 1000).toFixed(4)),
    explanation,
  };
}

export interface WhatIfWasteDiversionInput {
  annualOrganicKg: number;
  annualRecyclableKg: number;
}

export interface WhatIfWasteDiversionResult {
  baselineKgCO2e: number;
  optimizedKgCO2e: number;
  avoidedAnnualKgCO2e: number;
  explanation: string;
}

export function simulateWasteDiversion(
  input: WhatIfWasteDiversionInput
): WhatIfWasteDiversionResult {
  // Baseline: all organic to landfill without capture, recyclable to landfill
  const baselineOrganic =
    input.annualOrganicKg *
    EMISSION_FACTORS.WASTE.LANDFILL_NO_METHANE_CAPTURE.kgCO2ePerKg;
  const baselineRecyclable =
    input.annualRecyclableKg *
    EMISSION_FACTORS.WASTE.LANDFILL_NO_METHANE_CAPTURE.kgCO2ePerKg;
  const baselineTotal = baselineOrganic + baselineRecyclable;

  // Optimized: organic to composting, recyclable to recycling
  const optimizedOrganic =
    input.annualOrganicKg * EMISSION_FACTORS.WASTE.COMPOSTING.kgCO2ePerKg;
  const optimizedRecyclable =
    input.annualRecyclableKg * EMISSION_FACTORS.WASTE.RECYCLING.kgCO2ePerKg;
  const optimizedTotal = optimizedOrganic + optimizedRecyclable;

  const avoidedKg = Math.max(0, baselineTotal - optimizedTotal);

  const explanation =
    `Destinar 100% dos resíduos orgânicos para compostagem e 100% dos recicláveis para reciclagem ` +
    `evita a geração anaeróbica de metano (CH4), poupando ${avoidedKg.toFixed(1)} kg CO2e/ano ` +
    `(${((avoidedKg / (baselineTotal || 1)) * 100).toFixed(1)}% de redução na gestão de resíduos).`;

  return {
    baselineKgCO2e: Number(baselineTotal.toFixed(2)),
    optimizedKgCO2e: Number(optimizedTotal.toFixed(2)),
    avoidedAnnualKgCO2e: Number(avoidedKg.toFixed(2)),
    explanation,
  };
}
