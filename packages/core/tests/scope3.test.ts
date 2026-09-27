import { describe, it, expect } from 'vitest';
import { calculateScope3 } from '../src/scopes/scope3.js';
import { EMISSION_FACTORS } from '../src/constants/factors.js';

describe('Scope 3 Engine — Value Chain Indirect Emissions', () => {
  it('calculates water distribution and treatment emissions based on SABESP/Water UK benchmark', () => {
    const liters = 10000;
    const result = calculateScope3({ waterLiters: liters });

    const expected = liters * EMISSION_FACTORS.WATER.kgCO2ePerLiter; // 10000 * 0.000344 = 3.44 kg
    expect(result.totalKgCO2e).toBeCloseTo(expected, 2);
    expect(result.traces[0]?.activityUnit).toBe('litros');
  });

  it('calculates municipal solid waste by disposal method (Landfill vs Composting)', () => {
    const organicKg = 50;
    const resultLandfill = calculateScope3({
      wasteOrganicKg: organicKg,
      wasteOrganicDisposal: 'LANDFILL_NO_METHANE_CAPTURE',
    });

    const resultCompost = calculateScope3({
      wasteOrganicKg: organicKg,
      wasteOrganicDisposal: 'COMPOSTING',
    });

    // Landfill: 50 * 0.85 = 42.5 kg
    // Compost: 50 * 0.07 = 3.5 kg
    expect(resultLandfill.totalKgCO2e).toBeCloseTo(42.5, 2);
    expect(resultCompost.totalKgCO2e).toBeCloseTo(3.5, 2);
    expect(resultCompost.totalKgCO2e).toBeLessThan(resultLandfill.totalKgCO2e);
  });

  it('calculates commercial flight emissions with Radiative Forcing Index (1.9x)', () => {
    const result = calculateScope3({
      flights: [
        {
          category: 'SHORT_HAUL', // default 400 km
          passengers: 1,
          roundTrip: true, // 800 km
        },
      ],
      useRadiativeForcing: true,
    });

    const baseFactor = 0.215;
    const rfi = 1.9;
    const expected = 800 * baseFactor * rfi; // 800 * 0.4085 = 326.8 kg
    expect(result.totalKgCO2e).toBeCloseTo(expected, 1);
    expect(result.traces[0]?.formula).toContain('1.9 RFI');
  });

  it('calculates public transit commute accurately', () => {
    const result = calculateScope3({
      publicTransitKm: 1000,
      publicTransitMode: 'METRO_SUBWAY_TRAIN',
    });

    // 1000 km * 0.0240 kg CO2e/km = 24.0 kg
    expect(result.totalKgCO2e).toBeCloseTo(24.0, 2);
    expect(result.traces[0]?.activityName).toBe('Metrô / Trem Urbano');
  });
});
