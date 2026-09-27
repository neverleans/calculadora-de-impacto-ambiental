/**
 * CarbonLens — Scope 2 Engine
 * Indirect Emissions from Purchased Electricity (Location-based & Market-based)
 */

import { EMISSION_FACTORS } from '../constants/factors.js';
import { AuditTraceStep, Scope2Input, Scope2Result } from '../types/index.js';

export function calculateScope2(input: Scope2Input): Scope2Result {
  const traces: AuditTraceStep[] = [];
  const gridKey = input.grid || 'BRAZIL_SIN';
  const renewableRatio = Math.min(100, Math.max(0, input.renewablePercentage || 0)) / 100;
  const gridKwh = input.electricityKwh * (1 - renewableRatio);
  const renewableKwh = input.electricityKwh * renewableRatio;

  let factor = 0;
  let source = '';
  let gridLabel = '';

  if (gridKey === 'CUSTOM') {
    factor = input.customFactorKgPerKwh || 0;
    source = 'Fator Personalizado Auditado Localmente';
    gridLabel = 'Custom Grid Factor';
  } else {
    const gridData = EMISSION_FACTORS.ELECTRICITY_GRIDS[gridKey];
    factor = gridData.kgCO2ePerKwh;
    source = gridData.source;
    gridLabel = gridData.label;
  }

  const gridEmissions = gridKwh * factor;

  // Add trace for grid electricity
  traces.push({
    id: 'scope2-elec-grid',
    scope: 'Scope 2',
    category: 'Eletricidade Adquirida (Rede)',
    activityName: `Consumo da Rede Elétrica (${gridLabel})`,
    activityAmount: Number(gridKwh.toFixed(2)),
    activityUnit: 'kWh',
    emissionFactor: factor,
    emissionFactorUnit: 'kg CO2e / kWh',
    emissionFactorSource: source,
    formula: `${gridKwh.toFixed(2)} kWh * ${factor} kg CO2e/kWh`,
    fossilKgCO2e: Number(gridEmissions.toFixed(4)),
    biogenicKgCO2: 0,
  });

  // If there's renewable self-generation or I-REC
  if (renewableKwh > 0) {
    traces.push({
      id: 'scope2-elec-renewable',
      scope: 'Scope 2',
      category: 'Eletricidade Renovável Autoconsumo / I-REC',
      activityName: 'Geração Solar Fotovoltaica / Renovável Rastreada',
      activityAmount: Number(renewableKwh.toFixed(2)),
      activityUnit: 'kWh',
      emissionFactor: 0.0,
      emissionFactorUnit: 'kg CO2e / kWh',
      emissionFactorSource: 'GHG Protocol Market-based Zero Factor',
      formula: `${renewableKwh.toFixed(2)} kWh * 0.0 kg CO2e/kWh = 0.0 kg CO2e`,
      fossilKgCO2e: 0,
      biogenicKgCO2: 0,
    });
  }

  return {
    scope: 'Scope 2',
    totalKgCO2e: Number(gridEmissions.toFixed(3)),
    totalTonsCO2e: Number((gridEmissions / 1000).toFixed(4)),
    traces,
  };
}
