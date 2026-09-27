import { describe, it, expect } from 'vitest';
import {
  simulateCommuteReplacement,
  simulateSolarTransition,
  simulateWasteDiversion,
} from '../src/simulation/scenarios.js';
import {
  calculateForestryOffset,
  estimateVoluntaryCarbonCredits,
} from '../src/simulation/offsets.js';

describe('What-If Scenario Simulation & Offset Calculations', () => {
  it('accurately computes commute substitution (Car -> Subway 3 days/week)', () => {
    // Car 30km roundtrip, 3 days/wk, 48 weeks = 4320 km
    const result = simulateCommuteReplacement({
      carFuelType: 'GASOLINE_C',
      roundTripKmPerDay: 30,
      daysReplacedPerWeek: 3,
      workingWeeksPerYear: 48,
      replacementMode: 'METRO_SUBWAY_TRAIN',
    });

    const totalKm = 30 * 3 * 48; // 4,320 km
    const expectedCarEmissions = totalKm * 0.1624; // 701.568 kg
    const expectedTransitEmissions = totalKm * 0.0240; // 103.68 kg
    const expectedAvoided = expectedCarEmissions - expectedTransitEmissions; // 597.888 kg

    expect(result.baselineCarAnnualKgCO2e).toBeCloseTo(expectedCarEmissions, 1);
    expect(result.transitAnnualKgCO2e).toBeCloseTo(expectedTransitEmissions, 1);
    expect(result.avoidedAnnualKgCO2e).toBeCloseTo(expectedAvoided, 1);
    expect(result.percentReduction).toBeGreaterThan(80);
    expect(result.explanation).toContain('evita a emissão direta');
  });

  it('calculates solar transition scenario savings', () => {
    const result = simulateSolarTransition({
      annualKwh: 6000,
      solarCoveragePercent: 80,
      grid: 'BRAZIL_SIN',
    });

    const baselineKg = 6000 * 0.0617; // 370.2 kg
    const expectedAvoided = baselineKg * 0.8; // 296.16 kg

    expect(result.baselineElectricityKgCO2e).toBeCloseTo(baselineKg, 1);
    expect(result.avoidedAnnualKgCO2e).toBeCloseTo(expectedAvoided, 1);
    expect(result.avoidedAnnualTonsCO2e).toBeCloseTo(expectedAvoided / 1000, 3);
  });

  it('calculates waste diversion savings (Composting + Recycling)', () => {
    const result = simulateWasteDiversion({
      annualOrganicKg: 200,
      annualRecyclableKg: 100,
    });

    // Baseline: 200 * 0.85 + 100 * 0.85 = 255 kg
    // Optimized: 200 * 0.07 + 100 * 0.04 = 18 kg
    // Avoided: 237 kg
    expect(result.avoidedAnnualKgCO2e).toBeCloseTo(237, 1);
    expect(result.explanation).toContain('evita a geração anaeróbica de metano');
  });

  it('calculates native Atlantic Forest (Mata Atlântica) trees offset requirement', () => {
    const emissionsKg = 1500; // 1.5 tons
    const offset = calculateForestryOffset(emissionsKg);

    // 1500 kg / 150 kg per tree = 10 trees
    expect(offset.treesNeededLifetime).toBe(10);
    // 1500 kg / 15.6 kg per tree per year = 97 trees
    expect(offset.treesNeededAnnual).toBe(97);
    expect(offset.forestAreaSquareMetersEstimate).toBe(40); // 10 * 4m²
    expect(offset.biome).toBe('Mata Atlântica (Atlantic Forest)');
  });

  it('estimates Voluntary Carbon Market credit prices across tiers in USD and BRL', () => {
    const emissionsKg = 10000; // 10 metric tons
    const credits = estimateVoluntaryCarbonCredits(emissionsKg, 5.5);

    expect(credits.totalTonsCO2e).toBe(10);
    expect(credits.estimatedTotalUSD.low).toBe(120); // 10 * 12
    expect(credits.estimatedTotalUSD.average).toBe(180); // 10 * 18
    expect(credits.estimatedTotalUSD.highQualityCDR).toBe(450); // 10 * 45

    expect(credits.estimatedTotalBRL.average).toBeCloseTo(180 * 5.5, 2);
  });
});
