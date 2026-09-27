import { describe, it, expect } from 'vitest';
import { calculateScope1 } from '../src/scopes/scope1.js';
import { EMISSION_FACTORS } from '../src/constants/factors.js';

describe('Scope 1 Engine — Direct Combustion', () => {
  it('accurately calculates emissions for Gasoline C vehicle by distance', () => {
    const result = calculateScope1({
      vehicles: [{ fuelType: 'GASOLINE_C', distanceKm: 100 }],
    });

    const expectedFossil = 100 * EMISSION_FACTORS.VEHICLES_PER_KM.GASOLINE_C.fossilKgPerKm; // 16.24 kg
    const expectedBiogenic = 100 * EMISSION_FACTORS.VEHICLES_PER_KM.GASOLINE_C.biogenicKgPerKm; // 4.65 kg

    expect(result.totalKgCO2e).toBeCloseTo(expectedFossil, 2);
    expect(result.fossilKgCO2e).toBeCloseTo(expectedFossil, 2);
    expect(result.biogenicKgCO2).toBeCloseTo(expectedBiogenic, 2);
    expect(result.totalTonsCO2e).toBeCloseTo(expectedFossil / 1000, 4);
    expect(result.traces).toHaveLength(1);
    expect(result.traces[0]?.activityUnit).toBe('km');
  });

  it('correctly reports biogenic CO2 separately for Ethanol (E100)', () => {
    const result = calculateScope1({
      vehicles: [{ fuelType: 'ETHANOL_HYD', distanceKm: 200 }],
    });

    // Biofuel has low fossil footprint in direct Scope 1 combustion, high biogenic
    expect(result.fossilKgCO2e).toBeCloseTo(200 * 0.005, 2); // 1.0 kg
    expect(result.biogenicKgCO2).toBeCloseTo(200 * 0.178, 2); // 35.6 kg
    expect(result.traces[0]?.emissionFactorSource).toContain('RenovaBio');
  });

  it('accurately calculates Diesel S10 emissions for commercial fleet', () => {
    const result = calculateScope1({
      vehicles: [{ fuelType: 'DIESEL_S10', distanceKm: 500 }],
    });

    const expectedFossil = 500 * 0.245; // 122.5 kg CO2e
    expect(result.totalKgCO2e).toBeCloseTo(expectedFossil, 2);
    expect(result.totalTonsCO2e).toBeCloseTo(0.1225, 4);
  });

  it('confirms pure electric vehicles have 0 Scope 1 tailpipe emissions', () => {
    const result = calculateScope1({
      vehicles: [{ fuelType: 'BEV_ELECTRIC', distanceKm: 1500 }],
    });

    expect(result.totalKgCO2e).toBe(0);
    expect(result.fossilKgCO2e).toBe(0);
    expect(result.biogenicKgCO2).toBe(0);
  });

  it('calculates fuel combustion by volume (liters)', () => {
    const result = calculateScope1({
      vehicles: [{ fuelType: 'GASOLINE_C', fuelLiters: 50 }],
    });

    // 50 L * 1.685 kg fossil CO2e/L = 84.25 kg
    expect(result.fossilKgCO2e).toBeCloseTo(50 * 1.685, 2);
    expect(result.biogenicKgCO2).toBeCloseTo(50 * 0.540, 2);
  });

  it('calculates stationary LPG and generator diesel combustion', () => {
    const result = calculateScope1({
      stationary: {
        lpgKg: 13, // 1 botijão P13
        dieselGeneratorsLiters: 100,
      },
    });

    const expectedLpg = 13 * 2.984; // 38.792 kg
    const expectedGen = 100 * 2.68; // 268 kg
    expect(result.totalKgCO2e).toBeCloseTo(expectedLpg + expectedGen, 2);
    expect(result.traces).toHaveLength(2);
  });

  it('handles empty inputs without errors and returns 0', () => {
    const result = calculateScope1({});
    expect(result.totalKgCO2e).toBe(0);
    expect(result.totalTonsCO2e).toBe(0);
    expect(result.traces).toHaveLength(0);
  });
});
