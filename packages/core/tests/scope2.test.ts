import { describe, it, expect } from 'vitest';
import { calculateScope2 } from '../src/scopes/scope2.js';
import { EMISSION_FACTORS } from '../src/constants/factors.js';

describe('Scope 2 Engine — Purchased Electricity', () => {
  it('calculates Brazilian SIN MCTI grid emissions with official factor', () => {
    const kwh = 500;
    const result = calculateScope2({ electricityKwh: kwh, grid: 'BRAZIL_SIN' });

    const expected = kwh * EMISSION_FACTORS.ELECTRICITY_GRIDS.BRAZIL_SIN.kgCO2ePerKwh; // 500 * 0.0617 = 30.85 kg
    expect(result.totalKgCO2e).toBeCloseTo(expected, 2);
    expect(result.totalTonsCO2e).toBeCloseTo(expected / 1000, 4);
    expect(result.traces[0]?.emissionFactorSource).toContain('MCTI');
  });

  it('calculates international grid comparisons (USA eGRID & UK DEFRA)', () => {
    const kwh = 1000;
    const resultUSA = calculateScope2({ electricityKwh: kwh, grid: 'USA_EGRID' });
    const resultUK = calculateScope2({ electricityKwh: kwh, grid: 'UK_DEFRA' });

    expect(resultUSA.totalKgCO2e).toBeCloseTo(1000 * 0.3712, 2);
    expect(resultUK.totalKgCO2e).toBeCloseTo(1000 * 0.207, 2);
  });

  it('yields 0 emissions for 100% renewable / solar or RENEWABLE_ZERO grid', () => {
    const resultGrid = calculateScope2({ electricityKwh: 1000, grid: 'RENEWABLE_ZERO' });
    const resultSolar = calculateScope2({ electricityKwh: 1000, renewablePercentage: 100 });

    expect(resultGrid.totalKgCO2e).toBe(0);
    expect(resultSolar.totalKgCO2e).toBe(0);
  });

  it('correctly accounts for partial on-site solar generation (e.g. 60% solar, 40% grid)', () => {
    const kwh = 1000;
    const result = calculateScope2({
      electricityKwh: kwh,
      grid: 'BRAZIL_SIN',
      renewablePercentage: 60,
    });

    const expectedGridKwh = 400; // 40%
    const expected = expectedGridKwh * 0.0617;
    expect(result.totalKgCO2e).toBeCloseTo(expected, 2);
    expect(result.traces).toHaveLength(2); // 1 grid trace + 1 renewable trace
  });

  it('handles custom audited factors accurately', () => {
    const result = calculateScope2({
      electricityKwh: 2000,
      grid: 'CUSTOM',
      customFactorKgPerKwh: 0.125,
    });

    expect(result.totalKgCO2e).toBeCloseTo(250.0, 2);
    expect(result.traces[0]?.emissionFactorUnit).toBe('kg CO2e / kWh');
  });
});
