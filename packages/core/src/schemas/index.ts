/**
 * CarbonLens — Zod Validation Schemas
 * Rigorous runtime boundary and constraint validation for GHG accounting
 */

import { z } from 'zod';

export const FuelTypeEnum = z.enum([
  'GASOLINE_C',
  'ETHANOL_HYD',
  'DIESEL_S10',
  'CNG_GNV',
  'LPG_GLP',
  'HEV_GASOLINE',
  'BEV_ELECTRIC',
  'MOTORCYCLE_GAS',
]);

export const ElectricityGridEnum = z.enum([
  'BRAZIL_SIN',
  'USA_EGRID',
  'UK_DEFRA',
  'EU_EEA',
  'CHINA_GRID',
  'RENEWABLE_ZERO',
  'CUSTOM',
]);

export const WasteDisposalMethodEnum = z.enum([
  'LANDFILL_NO_METHANE_CAPTURE',
  'LANDFILL_WITH_FLARING',
  'COMPOSTING',
  'RECYCLING',
]);

export const FlightCategoryEnum = z.enum([
  'SHORT_HAUL',
  'MEDIUM_HAUL',
  'LONG_HAUL',
]);

export const TransitModeEnum = z.enum([
  'BUS_URBAN_DIESEL',
  'BUS_BRT_ELECTRIC',
  'METRO_SUBWAY_TRAIN',
  'CYCLING_WALKING',
]);

export const Scope1VehicleSchema = z
  .object({
    fuelType: FuelTypeEnum,
    distanceKm: z.number().min(0, 'A distância percorrida não pode ser negativa').optional(),
    fuelLiters: z.number().min(0, 'O volume de combustível não pode ser negativo').optional(),
    fuelCubicMeters: z.number().min(0, 'O volume de GNV não pode ser negativo').optional(),
  })
  .refine(
    (data) =>
      (data.distanceKm !== undefined && data.distanceKm >= 0) ||
      (data.fuelLiters !== undefined && data.fuelLiters >= 0) ||
      (data.fuelCubicMeters !== undefined && data.fuelCubicMeters >= 0),
    {
      message: 'Informe a distância percorrida (km) ou o volume consumido (L ou m³)',
    }
  );

export const Scope1StationarySchema = z
  .object({
    lpgKg: z.number().min(0, 'O consumo de GLP não pode ser negativo').optional().default(0),
    dieselGeneratorsLiters: z
      .number()
      .min(0, 'O consumo de diesel em gerador não pode ser negativo')
      .optional()
      .default(0),
  })
  .optional();

export const Scope1InputSchema = z.object({
  vehicles: z.array(Scope1VehicleSchema).optional().default([]),
  stationary: Scope1StationarySchema,
});

export const Scope2InputSchema = z
  .object({
    electricityKwh: z
      .number({
        required_error: 'O consumo de eletricidade em kWh é obrigatório',
        invalid_type_error: 'O consumo de eletricidade deve ser um número válido',
      })
      .min(0, 'O consumo de energia não pode ser negativo'),
    grid: ElectricityGridEnum.optional().default('BRAZIL_SIN'),
    customFactorKgPerKwh: z
      .number()
      .min(0, 'O fator personalizado não pode ser negativo')
      .optional(),
    renewablePercentage: z
      .number()
      .min(0, 'A porcentagem renovável não pode ser menor que 0%')
      .max(100, 'A porcentagem renovável não pode ultrapassar 100%')
      .optional()
      .default(0),
  })
  .refine(
    (data) => {
      if (data.grid === 'CUSTOM') {
        return (
          data.customFactorKgPerKwh !== undefined &&
          data.customFactorKgPerKwh >= 0
        );
      }
      return true;
    },
    {
      message:
        'Ao selecionar matriz CUSTOM, informe o fator de emissão em customFactorKgPerKwh (kg CO2e/kWh)',
      path: ['customFactorKgPerKwh'],
    }
  );

export const FlightLegSchema = z.object({
  category: FlightCategoryEnum,
  passengers: z
    .number()
    .int('O número de passageiros deve ser um número inteiro')
    .min(1, 'Pelo menos 1 passageiro deve ser informado')
    .default(1),
  roundTrip: z.boolean().default(true),
  distanceKm: z.number().min(1, 'A distância de voo deve ser maior que 0').optional(),
});

export const Scope3InputSchema = z.object({
  waterLiters: z.number().min(0, 'O consumo de água não pode ser negativo').optional().default(0),
  wasteOrganicKg: z
    .number()
    .min(0, 'A quantidade de resíduo orgânico não pode ser negativa')
    .optional()
    .default(0),
  wasteOrganicDisposal: WasteDisposalMethodEnum.optional().default(
    'LANDFILL_NO_METHANE_CAPTURE'
  ),
  wasteRecyclableKg: z
    .number()
    .min(0, 'A quantidade de resíduo reciclável não pode ser negativa')
    .optional()
    .default(0),
  wasteRecyclableDisposal: WasteDisposalMethodEnum.optional().default('RECYCLING'),
  flights: z.array(FlightLegSchema).optional().default([]),
  useRadiativeForcing: z.boolean().optional().default(true),
  publicTransitKm: z
    .number()
    .min(0, 'A distância em transporte público não pode ser negativa')
    .optional()
    .default(0),
  publicTransitMode: TransitModeEnum.optional().default('BUS_URBAN_DIESEL'),
});

export const CarbonAssessmentInputSchema = z.object({
  organizationOrIndividualName: z.string().optional().default('Organização / Usuário'),
  period: z.string().optional().default('Inventário Mensal'),
  scope1: Scope1InputSchema.default({ vehicles: [], stationary: {} }),
  scope2: Scope2InputSchema,
  scope3: Scope3InputSchema.optional().default({}),
});

export const WhatIfCommuteScenarioSchema = z.object({
  carFuelType: FuelTypeEnum,
  roundTripKmPerDay: z
    .number({ required_error: 'A distância de ida e volta por dia é obrigatória' })
    .min(0.1, 'A distância deve ser maior que zero'),
  daysReplacedPerWeek: z
    .number()
    .min(1, 'Selecione pelo menos 1 dia por semana')
    .max(7, 'O máximo de dias por semana é 7'),
  workingWeeksPerYear: z
    .number()
    .min(1, 'O ano útil de trabalho deve ter pelo menos 1 semana')
    .max(52, 'O ano possui no máximo 52 semanas')
    .optional()
    .default(48),
  replacementMode: TransitModeEnum,
});
