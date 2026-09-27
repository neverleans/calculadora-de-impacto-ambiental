/**
 * CarbonLens — Domain Types & Data Contracts
 * Compliant with the GHG Protocol Corporate Standard (Scopes 1, 2, 3)
 */

export type ScopeType = 'Scope 1' | 'Scope 2' | 'Scope 3';

export type FuelType =
  | 'GASOLINE_C'
  | 'ETHANOL_HYD'
  | 'DIESEL_S10'
  | 'CNG_GNV'
  | 'LPG_GLP'
  | 'HEV_GASOLINE'
  | 'BEV_ELECTRIC'
  | 'MOTORCYCLE_GAS';

export type ElectricityGrid =
  | 'BRAZIL_SIN'
  | 'USA_EGRID'
  | 'UK_DEFRA'
  | 'EU_EEA'
  | 'CHINA_GRID'
  | 'RENEWABLE_ZERO'
  | 'CUSTOM';

export type WasteDisposalMethod =
  | 'LANDFILL_NO_METHANE_CAPTURE'
  | 'LANDFILL_WITH_FLARING'
  | 'COMPOSTING'
  | 'RECYCLING';

export type FlightCategory = 'SHORT_HAUL' | 'MEDIUM_HAUL' | 'LONG_HAUL';

export type TransitMode =
  | 'BUS_URBAN_DIESEL'
  | 'BUS_BRT_ELECTRIC'
  | 'METRO_SUBWAY_TRAIN'
  | 'CYCLING_WALKING';

export interface AuditTraceStep {
  id: string;
  scope: ScopeType;
  category: string;
  activityName: string;
  activityAmount: number;
  activityUnit: string;
  emissionFactor: number;
  emissionFactorUnit: string;
  emissionFactorSource: string;
  formula: string;
  fossilKgCO2e: number;
  biogenicKgCO2: number;
}

export interface Scope1VehicleInput {
  fuelType: FuelType;
  distanceKm?: number;
  fuelLiters?: number;
  fuelCubicMeters?: number; // For GNV
}

export interface Scope1StationaryInput {
  lpgKg?: number; // Botijão GLP
  dieselGeneratorsLiters?: number;
}

export interface Scope1Input {
  vehicles?: Scope1VehicleInput[];
  stationary?: Scope1StationaryInput;
}

export interface Scope1Result {
  scope: 'Scope 1';
  fossilKgCO2e: number;
  biogenicKgCO2: number;
  totalKgCO2e: number;
  totalTonsCO2e: number;
  traces: AuditTraceStep[];
}

export interface Scope2Input {
  electricityKwh: number;
  grid?: ElectricityGrid;
  customFactorKgPerKwh?: number;
  renewablePercentage?: number; // e.g. 100 for 100% solar
}

export interface Scope2Result {
  scope: 'Scope 2';
  totalKgCO2e: number;
  totalTonsCO2e: number;
  traces: AuditTraceStep[];
}

export interface FlightLeg {
  category: FlightCategory;
  passengers: number;
  roundTrip: boolean;
  distanceKm?: number; // Optional exact distance
}

export interface Scope3Input {
  waterLiters?: number;
  wasteOrganicKg?: number;
  wasteOrganicDisposal?: WasteDisposalMethod;
  wasteRecyclableKg?: number;
  wasteRecyclableDisposal?: WasteDisposalMethod;
  flights?: FlightLeg[];
  useRadiativeForcing?: boolean; // Default true (1.9x factor)
  publicTransitKm?: number;
  publicTransitMode?: TransitMode;
}

export interface Scope3Result {
  scope: 'Scope 3';
  totalKgCO2e: number;
  totalTonsCO2e: number;
  traces: AuditTraceStep[];
}

export interface CarbonAssessmentInput {
  organizationOrIndividualName?: string;
  period?: string; // e.g. "2024-Q1" or "Monthly: May 2024"
  scope1: Scope1Input;
  scope2: Scope2Input;
  scope3?: Scope3Input;
}

export interface ScopeBreakdown {
  scope1: Scope1Result;
  scope2: Scope2Result;
  scope3: Scope3Result;
}

export interface CarbonAssessmentResult {
  metadata: {
    assessedAt: string;
    engineVersion: string;
    standard: string;
    entityName: string;
    period: string;
  };
  totalKgCO2e: number;
  totalTonsCO2e: number;
  biogenicKgCO2: number;
  scopes: ScopeBreakdown;
  shares: {
    scope1Percent: number;
    scope2Percent: number;
    scope3Percent: number;
  };
  hotspot: {
    category: string;
    scope: ScopeType;
    emissionsKgCO2e: number;
    sharePercent: number;
    description: string;
  };
  auditTrail: AuditTraceStep[];
}

export interface WhatIfCommuteScenarioInput {
  carFuelType: FuelType;
  roundTripKmPerDay: number;
  daysReplacedPerWeek: number;
  workingWeeksPerYear?: number;
  replacementMode: TransitMode;
}

export interface WhatIfCommuteScenarioResult {
  baselineCarAnnualKgCO2e: number;
  transitAnnualKgCO2e: number;
  avoidedAnnualKgCO2e: number;
  avoidedAnnualTonsCO2e: number;
  percentReduction: number;
  explanation: string;
}

export interface ForestryOffsetCalculation {
  totalKgCO2eToOffset: number;
  treesNeededLifetime: number; // 20-30 year growth model (~150kg CO2/tree)
  treesNeededAnnual: number;   // 1-year rate model (~15.6kg CO2/tree/year)
  forestAreaSquareMetersEstimate: number; // ~4m² per native tree
  biome: 'Mata Atlântica (Atlantic Forest)';
  scientificReference: string;
}

export interface VoluntaryCarbonCreditEstimate {
  totalTonsCO2e: number;
  pricePerTonUSD: {
    low: number;
    average: number;
    highQualityCDR: number;
  };
  estimatedTotalUSD: {
    low: number;
    average: number;
    highQualityCDR: number;
  };
  estimatedTotalBRL: {
    low: number;
    average: number;
    highQualityCDR: number;
  };
  exchangeRateBRL: number;
}
