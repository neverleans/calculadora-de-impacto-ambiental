/**
 * CarbonLens — Carbon Assessment Aggregator
 * Consolidates Scopes 1, 2 & 3 into a standardized, auditable GHG inventory
 */

import { CarbonAssessmentInput, CarbonAssessmentResult, ScopeType } from '../types/index.js';
import { calculateScope1 } from './scope1.js';
import { calculateScope2 } from './scope2.js';
import { calculateScope3 } from './scope3.js';

export const ENGINE_VERSION = '1.0.0';
export const STANDARD_CITATION = 'GHG Protocol Corporate Accounting and Reporting Standard';

export function calculateCarbonAssessment(input: CarbonAssessmentInput): CarbonAssessmentResult {
  const scope1 = calculateScope1(input.scope1);
  const scope2 = calculateScope2(input.scope2);
  const scope3 = calculateScope3(input.scope3 || {});

  const totalKgCO2e = Number((scope1.totalKgCO2e + scope2.totalKgCO2e + scope3.totalKgCO2e).toFixed(3));
  const totalTonsCO2e = Number((totalKgCO2e / 1000).toFixed(4));
  const biogenicKgCO2 = Number(scope1.biogenicKgCO2.toFixed(3));

  // Compute shares safely
  const denom = totalKgCO2e > 0 ? totalKgCO2e : 1;
  const scope1Percent = totalKgCO2e > 0 ? Number(((scope1.totalKgCO2e / denom) * 100).toFixed(1)) : 0;
  const scope2Percent = totalKgCO2e > 0 ? Number(((scope2.totalKgCO2e / denom) * 100).toFixed(1)) : 0;
  const scope3Percent = totalKgCO2e > 0 ? Number(((scope3.totalKgCO2e / denom) * 100).toFixed(1)) : 0;

  // Aggregate audit trail
  const auditTrail = [...scope1.traces, ...scope2.traces, ...scope3.traces];

  // Hotspot analysis: find the individual activity trace with the largest emissions
  let hotspotTrace = auditTrail[0];
  for (const trace of auditTrail) {
    if (!hotspotTrace || trace.fossilKgCO2e > hotspotTrace.fossilKgCO2e) {
      hotspotTrace = trace;
    }
  }

  const hotspotShare =
    totalKgCO2e > 0 && hotspotTrace
      ? Number(((hotspotTrace.fossilKgCO2e / totalKgCO2e) * 100).toFixed(1))
      : 0;

  const hotspot = {
    category: hotspotTrace ? hotspotTrace.category : 'N/A',
    scope: (hotspotTrace ? hotspotTrace.scope : 'Scope 1') as ScopeType,
    emissionsKgCO2e: hotspotTrace ? hotspotTrace.fossilKgCO2e : 0,
    sharePercent: hotspotShare,
    description: hotspotTrace
      ? `A atividade com maior impacto no inventário é "${hotspotTrace.activityName}", representando ${hotspotShare}% do total (${hotspotTrace.fossilKgCO2e.toFixed(1)} kg CO2e).`
      : 'Nenhuma atividade emissora registrada com impacto significativo.',
  };

  return {
    metadata: {
      assessedAt: new Date().toISOString(),
      engineVersion: ENGINE_VERSION,
      standard: STANDARD_CITATION,
      entityName: input.organizationOrIndividualName || 'Organização / Usuário',
      period: input.period || 'Inventário Atual',
    },
    totalKgCO2e,
    totalTonsCO2e,
    biogenicKgCO2,
    scopes: {
      scope1,
      scope2,
      scope3,
    },
    shares: {
      scope1Percent,
      scope2Percent,
      scope3Percent,
    },
    hotspot,
    auditTrail,
  };
}
