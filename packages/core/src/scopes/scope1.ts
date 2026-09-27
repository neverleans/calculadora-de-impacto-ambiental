/**
 * CarbonLens — Scope 1 Engine
 * Direct Emissions: Mobile and Stationary Combustion
 */

import { EMISSION_FACTORS } from '../constants/factors.js';
import { AuditTraceStep, Scope1Input, Scope1Result } from '../types/index.js';

export function calculateScope1(input: Scope1Input): Scope1Result {
  const traces: AuditTraceStep[] = [];
  let totalFossilKg = 0;
  let totalBiogenicKg = 0;

  // 1. Mobile Combustion (Vehicles)
  if (input.vehicles && input.vehicles.length > 0) {
    input.vehicles.forEach((vehicle, index) => {
      const factorData = EMISSION_FACTORS.VEHICLES_PER_KM[vehicle.fuelType];

      // Case A: Calculated by distance (km)
      if (vehicle.distanceKm !== undefined && vehicle.distanceKm > 0) {
        const fossil = vehicle.distanceKm * factorData.fossilKgPerKm;
        const biogenic = vehicle.distanceKm * factorData.biogenicKgPerKm;
        totalFossilKg += fossil;
        totalBiogenicKg += biogenic;

        traces.push({
          id: `scope1-veh-km-${index}`,
          scope: 'Scope 1',
          category: 'Combustão Móvel (Frota/Veículos)',
          activityName: `Veículo (${vehicle.fuelType})`,
          activityAmount: vehicle.distanceKm,
          activityUnit: 'km',
          emissionFactor: factorData.fossilKgPerKm,
          emissionFactorUnit: 'kg CO2e / km',
          emissionFactorSource: factorData.source,
          formula: `${vehicle.distanceKm} km * ${factorData.fossilKgPerKm} kg CO2e/km`,
          fossilKgCO2e: Number(fossil.toFixed(4)),
          biogenicKgCO2: Number(biogenic.toFixed(4)),
        });
      }

      // Case B: Calculated by fuel volume (Liters or m³)
      if (vehicle.fuelLiters !== undefined && vehicle.fuelLiters > 0) {
        let fossilFactor = 0;
        let biogenicFactor = 0;
        let source = '';

        if (vehicle.fuelType === 'GASOLINE_C') {
          fossilFactor = EMISSION_FACTORS.FUEL_BY_VOLUME.GASOLINE_C_PER_LITER.fossilKgCO2ePerLiter;
          biogenicFactor = EMISSION_FACTORS.FUEL_BY_VOLUME.GASOLINE_C_PER_LITER.biogenicKgCO2PerLiter;
          source = EMISSION_FACTORS.FUEL_BY_VOLUME.GASOLINE_C_PER_LITER.source;
        } else if (vehicle.fuelType === 'ETHANOL_HYD') {
          fossilFactor = EMISSION_FACTORS.FUEL_BY_VOLUME.ETHANOL_HYD_PER_LITER.fossilKgCO2ePerLiter;
          biogenicFactor = EMISSION_FACTORS.FUEL_BY_VOLUME.ETHANOL_HYD_PER_LITER.biogenicKgCO2PerLiter;
          source = EMISSION_FACTORS.FUEL_BY_VOLUME.ETHANOL_HYD_PER_LITER.source;
        } else if (vehicle.fuelType === 'DIESEL_S10') {
          fossilFactor = EMISSION_FACTORS.FUEL_BY_VOLUME.DIESEL_S10_PER_LITER.fossilKgCO2ePerLiter;
          biogenicFactor = EMISSION_FACTORS.FUEL_BY_VOLUME.DIESEL_S10_PER_LITER.biogenicKgCO2PerLiter;
          source = EMISSION_FACTORS.FUEL_BY_VOLUME.DIESEL_S10_PER_LITER.source;
        }

        const fossil = vehicle.fuelLiters * fossilFactor;
        const biogenic = vehicle.fuelLiters * biogenicFactor;
        totalFossilKg += fossil;
        totalBiogenicKg += biogenic;

        traces.push({
          id: `scope1-veh-vol-${index}`,
          scope: 'Scope 1',
          category: 'Combustão Móvel por Volume',
          activityName: `Combustível (${vehicle.fuelType})`,
          activityAmount: vehicle.fuelLiters,
          activityUnit: 'litros',
          emissionFactor: fossilFactor,
          emissionFactorUnit: 'kg CO2e / litro',
          emissionFactorSource: source,
          formula: `${vehicle.fuelLiters} L * ${fossilFactor} kg CO2e/L`,
          fossilKgCO2e: Number(fossil.toFixed(4)),
          biogenicKgCO2: Number(biogenic.toFixed(4)),
        });
      }

      // Case C: GNV by cubic meters
      if (vehicle.fuelCubicMeters !== undefined && vehicle.fuelCubicMeters > 0) {
        const factor = EMISSION_FACTORS.FUEL_BY_VOLUME.CNG_GNV_PER_M3;
        const fossil = vehicle.fuelCubicMeters * factor.fossilKgCO2ePerM3;
        totalFossilKg += fossil;

        traces.push({
          id: `scope1-veh-gnv-${index}`,
          scope: 'Scope 1',
          category: 'Combustão Móvel GNV',
          activityName: 'Gás Natural Veicular',
          activityAmount: vehicle.fuelCubicMeters,
          activityUnit: 'm³',
          emissionFactor: factor.fossilKgCO2ePerM3,
          emissionFactorUnit: 'kg CO2e / m³',
          emissionFactorSource: factor.source,
          formula: `${vehicle.fuelCubicMeters} m³ * ${factor.fossilKgCO2ePerM3} kg CO2e/m³`,
          fossilKgCO2e: Number(fossil.toFixed(4)),
          biogenicKgCO2: 0,
        });
      }
    });
  }

  // 2. Stationary Combustion
  if (input.stationary) {
    if (input.stationary.lpgKg && input.stationary.lpgKg > 0) {
      const factor = EMISSION_FACTORS.FUEL_BY_VOLUME.LPG_GLP_PER_KG;
      const fossil = input.stationary.lpgKg * factor.fossilKgCO2ePerKg;
      totalFossilKg += fossil;

      traces.push({
        id: 'scope1-stat-glp',
        scope: 'Scope 1',
        category: 'Combustão Estacionária (GLP)',
        activityName: 'Gás Liquefeito de Petróleo (GLP)',
        activityAmount: input.stationary.lpgKg,
        activityUnit: 'kg',
        emissionFactor: factor.fossilKgCO2ePerKg,
        emissionFactorUnit: 'kg CO2e / kg',
        emissionFactorSource: factor.source,
        formula: `${input.stationary.lpgKg} kg * ${factor.fossilKgCO2ePerKg} kg CO2e/kg`,
        fossilKgCO2e: Number(fossil.toFixed(4)),
        biogenicKgCO2: 0,
      });
    }

    if (input.stationary.dieselGeneratorsLiters && input.stationary.dieselGeneratorsLiters > 0) {
      const factor = EMISSION_FACTORS.FUEL_BY_VOLUME.STATIONARY_DIESEL_PER_LITER;
      const fossil = input.stationary.dieselGeneratorsLiters * factor.fossilKgCO2ePerLiter;
      totalFossilKg += fossil;

      traces.push({
        id: 'scope1-stat-gen',
        scope: 'Scope 1',
        category: 'Combustão Estacionária (Gerador)',
        activityName: 'Diesel Estacionário (Geradores)',
        activityAmount: input.stationary.dieselGeneratorsLiters,
        activityUnit: 'litros',
        emissionFactor: factor.fossilKgCO2ePerLiter,
        emissionFactorUnit: 'kg CO2e / L',
        emissionFactorSource: factor.source,
        formula: `${input.stationary.dieselGeneratorsLiters} L * ${factor.fossilKgCO2ePerLiter} kg CO2e/L`,
        fossilKgCO2e: Number(fossil.toFixed(4)),
        biogenicKgCO2: 0,
      });
    }
  }

  return {
    scope: 'Scope 1',
    fossilKgCO2e: Number(totalFossilKg.toFixed(3)),
    biogenicKgCO2: Number(totalBiogenicKg.toFixed(3)),
    totalKgCO2e: Number(totalFossilKg.toFixed(3)),
    totalTonsCO2e: Number((totalFossilKg / 1000).toFixed(4)),
    traces,
  };
}
