/**
 * CarbonLens — Forestry Offsetting & Carbon Credit Valuation Engine
 * Scientific models for ecological restoration (Atlantic Forest) & VCM pricing
 */

import { EMISSION_FACTORS } from '../constants/factors.js';
import { ForestryOffsetCalculation, VoluntaryCarbonCreditEstimate } from '../types/index.js';

export function calculateForestryOffset(totalKgCO2e: number): ForestryOffsetCalculation {
  const safeKg = Math.max(0, totalKgCO2e);
  const lifetimeFactor = EMISSION_FACTORS.OFFSETS.MATA_ATLANTICA_TREE_LIFETIME_SEQUESTRATION_KG;
  const annualFactor = EMISSION_FACTORS.OFFSETS.MATA_ATLANTICA_TREE_ANNUAL_SEQUESTRATION_KG;
  const densityM2 = EMISSION_FACTORS.OFFSETS.TREE_DENSITY_M2_PER_TREE;

  // Lifetime growth model (20-30 years)
  const treesNeededLifetime = Math.ceil(safeKg / lifetimeFactor);

  // Annual balance model (how many trees needed to absorb this amount in exactly 1 year)
  const treesNeededAnnual = Math.ceil(safeKg / annualFactor);

  // Forest restoration footprint in m²
  const forestAreaSquareMetersEstimate = treesNeededLifetime * densityM2;

  return {
    totalKgCO2eToOffset: Number(safeKg.toFixed(2)),
    treesNeededLifetime,
    treesNeededAnnual,
    forestAreaSquareMetersEstimate,
    biome: 'Mata Atlântica (Atlantic Forest)',
    scientificReference: EMISSION_FACTORS.OFFSETS.SCIENTIFIC_CITATION,
  };
}

export function estimateVoluntaryCarbonCredits(
  totalKgCO2e: number,
  customExchangeRate?: number
): VoluntaryCarbonCreditEstimate {
  const tons = Math.max(0, totalKgCO2e) / 1000;
  const fx = customExchangeRate || EMISSION_FACTORS.OFFSETS.DEFAULT_USD_TO_BRL_RATE;
  const pricing = EMISSION_FACTORS.OFFSETS.VCM_PRICING_USD_PER_TON;

  const estimatedTotalUSD = {
    low: Number((tons * pricing.LOW).toFixed(2)),
    average: Number((tons * pricing.AVERAGE).toFixed(2)),
    highQualityCDR: Number((tons * pricing.HIGH_CDR).toFixed(2)),
  };

  const estimatedTotalBRL = {
    low: Number((estimatedTotalUSD.low * fx).toFixed(2)),
    average: Number((estimatedTotalUSD.average * fx).toFixed(2)),
    highQualityCDR: Number((estimatedTotalUSD.highQualityCDR * fx).toFixed(2)),
  };

  return {
    totalTonsCO2e: Number(tons.toFixed(4)),
    pricePerTonUSD: {
      low: pricing.LOW,
      average: pricing.AVERAGE,
      highQualityCDR: pricing.HIGH_CDR,
    },
    estimatedTotalUSD,
    estimatedTotalBRL,
    exchangeRateBRL: fx,
  };
}
