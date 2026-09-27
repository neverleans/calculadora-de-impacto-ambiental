/**
 * CarbonLens — Scope 3 Engine
 * Value Chain Indirect Emissions: Waste, Water, Aviation, Employee Transit
 */

import { EMISSION_FACTORS } from '../constants/factors.js';
import { AuditTraceStep, Scope3Input, Scope3Result } from '../types/index.js';

export function calculateScope3(input: Scope3Input = {}): Scope3Result {
  const traces: AuditTraceStep[] = [];
  let totalKg = 0;

  // 1. Water Consumption (Treatment & Distribution)
  if (input.waterLiters !== undefined && input.waterLiters > 0) {
    const factor = EMISSION_FACTORS.WATER.kgCO2ePerLiter;
    const kg = input.waterLiters * factor;
    totalKg += kg;

    traces.push({
      id: 'scope3-water',
      scope: 'Scope 3',
      category: 'Tratamento e Distribuição de Água',
      activityName: 'Consumo de Água Tratada',
      activityAmount: input.waterLiters,
      activityUnit: 'litros',
      emissionFactor: factor,
      emissionFactorUnit: 'kg CO2e / litro',
      emissionFactorSource: EMISSION_FACTORS.WATER.source,
      formula: `${input.waterLiters} L * ${factor} kg CO2e/L`,
      fossilKgCO2e: Number(kg.toFixed(4)),
      biogenicKgCO2: 0,
    });
  }

  // 2. Municipal Solid Waste (Organic)
  if (input.wasteOrganicKg !== undefined && input.wasteOrganicKg > 0) {
    const method = input.wasteOrganicDisposal || 'LANDFILL_NO_METHANE_CAPTURE';
    const factorData = EMISSION_FACTORS.WASTE[method];
    const kg = input.wasteOrganicKg * factorData.kgCO2ePerKg;
    totalKg += kg;

    traces.push({
      id: 'scope3-waste-organic',
      scope: 'Scope 3',
      category: 'Destinação de Resíduos Orgânicos',
      activityName: `Resíduos Orgânicos (${method})`,
      activityAmount: input.wasteOrganicKg,
      activityUnit: 'kg',
      emissionFactor: factorData.kgCO2ePerKg,
      emissionFactorUnit: 'kg CO2e / kg',
      emissionFactorSource: factorData.source,
      formula: `${input.wasteOrganicKg} kg * ${factorData.kgCO2ePerKg} kg CO2e/kg`,
      fossilKgCO2e: Number(kg.toFixed(4)),
      biogenicKgCO2: 0,
    });
  }

  // 3. Municipal Solid Waste (Recyclable)
  if (input.wasteRecyclableKg !== undefined && input.wasteRecyclableKg > 0) {
    const method = input.wasteRecyclableDisposal || 'RECYCLING';
    const factorData = EMISSION_FACTORS.WASTE[method];
    const kg = input.wasteRecyclableKg * factorData.kgCO2ePerKg;
    totalKg += kg;

    traces.push({
      id: 'scope3-waste-recyclable',
      scope: 'Scope 3',
      category: 'Destinação de Resíduos Recicláveis',
      activityName: `Resíduos Recicláveis (${method})`,
      activityAmount: input.wasteRecyclableKg,
      activityUnit: 'kg',
      emissionFactor: factorData.kgCO2ePerKg,
      emissionFactorUnit: 'kg CO2e / kg',
      emissionFactorSource: factorData.source,
      formula: `${input.wasteRecyclableKg} kg * ${factorData.kgCO2ePerKg} kg CO2e/kg`,
      fossilKgCO2e: Number(kg.toFixed(4)),
      biogenicKgCO2: 0,
    });
  }

  // 4. Commercial Aviation (Flights)
  if (input.flights && input.flights.length > 0) {
    const useRfi = input.useRadiativeForcing ?? true;
    const rfiMultiplier = useRfi ? EMISSION_FACTORS.FLIGHTS.RADIATIVE_FORCING_MULTIPLIER : 1.0;

    input.flights.forEach((flight, index) => {
      const flightData = EMISSION_FACTORS.FLIGHTS[flight.category];
      const baseDistance = flight.distanceKm || flightData.defaultDistanceKm;
      const tripDistance = flight.roundTrip ? baseDistance * 2 : baseDistance;
      const totalPassengerKm = tripDistance * flight.passengers;
      const baseFactor = flightData.kgCO2ePerPkm;
      const effectiveFactor = baseFactor * rfiMultiplier;
      const flightEmissions = totalPassengerKm * effectiveFactor;

      totalKg += flightEmissions;

      traces.push({
        id: `scope3-flight-${index}`,
        scope: 'Scope 3',
        category: 'Viagens Aéreas a Negócios / Passageiros',
        activityName: `Voo ${flight.category} (${flight.passengers} pax, ${flight.roundTrip ? 'ida/volta' : 'apenas ida'})`,
        activityAmount: totalPassengerKm,
        activityUnit: 'passageiro-km',
        emissionFactor: Number(effectiveFactor.toFixed(4)),
        emissionFactorUnit: 'kg CO2e / pkm',
        emissionFactorSource: `${flightData.source} (RFI Multiplier: ${rfiMultiplier}x)`,
        formula: `${totalPassengerKm} pkm * ${baseFactor} kg CO2e/pkm * ${rfiMultiplier} RFI`,
        fossilKgCO2e: Number(flightEmissions.toFixed(4)),
        biogenicKgCO2: 0,
      });
    });
  }

  // 5. Public Transit (Employee Commute / Business Travel)
  if (input.publicTransitKm !== undefined && input.publicTransitKm > 0) {
    const transitMode = input.publicTransitMode || 'BUS_URBAN_DIESEL';
    const factorData = EMISSION_FACTORS.PUBLIC_TRANSIT[transitMode];
    const kg = input.publicTransitKm * factorData.kgCO2ePerPkm;
    totalKg += kg;

    traces.push({
      id: 'scope3-transit',
      scope: 'Scope 3',
      category: 'Deslocamento / Transporte Coletivo',
      activityName: factorData.label,
      activityAmount: input.publicTransitKm,
      activityUnit: 'km',
      emissionFactor: factorData.kgCO2ePerPkm,
      emissionFactorUnit: 'kg CO2e / pkm',
      emissionFactorSource: factorData.source,
      formula: `${input.publicTransitKm} km * ${factorData.kgCO2ePerPkm} kg CO2e/pkm`,
      fossilKgCO2e: Number(kg.toFixed(4)),
      biogenicKgCO2: 0,
    });
  }

  return {
    scope: 'Scope 3',
    totalKgCO2e: Number(totalKg.toFixed(3)),
    totalTonsCO2e: Number((totalKg / 1000).toFixed(4)),
    traces,
  };
}
