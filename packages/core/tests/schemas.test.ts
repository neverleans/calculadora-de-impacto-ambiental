import { describe, it, expect } from 'vitest';
import {
  Scope1InputSchema,
  Scope2InputSchema,
  Scope3InputSchema,
  WhatIfCommuteScenarioSchema,
} from '../src/schemas/index.js';

describe('Zod Validation Schemas — Input Integrity', () => {
  it('rejects negative electricity consumption in Scope 2', () => {
    const invalid = { electricityKwh: -150 };
    const parseResult = Scope2InputSchema.safeParse(invalid);
    expect(parseResult.success).toBe(false);
    if (!parseResult.success) {
      expect(parseResult.error.issues[0]?.message).toContain('não pode ser negativo');
    }
  });

  it('rejects negative distance in Scope 1', () => {
    const invalid = {
      vehicles: [{ fuelType: 'GASOLINE_C', distanceKm: -50 }],
    };
    const parseResult = Scope1InputSchema.safeParse(invalid);
    expect(parseResult.success).toBe(false);
  });

  it('requires customFactorKgPerKwh when grid is CUSTOM', () => {
    const invalid = {
      electricityKwh: 500,
      grid: 'CUSTOM',
    };
    const parseResult = Scope2InputSchema.safeParse(invalid);
    expect(parseResult.success).toBe(false);
  });

  it('validates a correct Scope 2 payload with renewable percentage', () => {
    const valid = {
      electricityKwh: 450,
      grid: 'BRAZIL_SIN',
      renewablePercentage: 50,
    };
    const parseResult = Scope2InputSchema.safeParse(valid);
    expect(parseResult.success).toBe(true);
  });

  it('validates What-If commute scenario and rejects invalid day counts', () => {
    const invalid = {
      carFuelType: 'GASOLINE_C',
      roundTripKmPerDay: 20,
      daysReplacedPerWeek: 8, // Invalid: week has 7 days
      replacementMode: 'METRO_SUBWAY_TRAIN',
    };
    const parseResult = WhatIfCommuteScenarioSchema.safeParse(invalid);
    expect(parseResult.success).toBe(false);
  });

  it('validates a complete Scope 3 input with flights and waste', () => {
    const valid = {
      waterLiters: 15000,
      wasteOrganicKg: 40,
      wasteOrganicDisposal: 'COMPOSTING',
      flights: [
        {
          category: 'SHORT_HAUL',
          passengers: 2,
          roundTrip: true,
        },
      ],
    };
    const parseResult = Scope3InputSchema.safeParse(valid);
    expect(parseResult.success).toBe(true);
  });
});
