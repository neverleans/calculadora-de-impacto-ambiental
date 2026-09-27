import { describe, it, expect } from 'vitest';
import { calculateCarbonAssessment } from '../src/scopes/assessment.js';
import { generateAuditCsv, generateEsgExecutiveSummary } from '../src/audit/executive-summary.js';

describe('Assessment Aggregator & ESG Executive Reporting', () => {
  it('consolidates Scopes 1, 2, and 3 into total footprint and percentage shares', () => {
    const assessment = calculateCarbonAssessment({
      organizationOrIndividualName: 'TechCorp Brasil',
      period: '2024-Q1',
      scope1: {
        vehicles: [{ fuelType: 'GASOLINE_C', distanceKm: 1000 }], // 162.4 kg
      },
      scope2: {
        electricityKwh: 1000, // 61.7 kg
      },
      scope3: {
        waterLiters: 5000, // 1.72 kg
        wasteOrganicKg: 20, // 17.0 kg
      },
    });

    const expectedTotal = 162.4 + 61.7 + 1.72 + 17.0; // 242.82 kg
    expect(assessment.totalKgCO2e).toBeCloseTo(expectedTotal, 1);
    expect(assessment.totalTonsCO2e).toBeCloseTo(expectedTotal / 1000, 3);

    // Shares sum up to 100%
    const totalShares =
      assessment.shares.scope1Percent +
      assessment.shares.scope2Percent +
      assessment.shares.scope3Percent;
    expect(totalShares).toBeCloseTo(100, 0);

    // Hotspot detection
    expect(assessment.hotspot.scope).toBe('Scope 1');
    expect(assessment.hotspot.sharePercent).toBeGreaterThan(50);
  });

  it('generates an auditable CSV representation', () => {
    const assessment = calculateCarbonAssessment({
      scope1: { vehicles: [{ fuelType: 'GASOLINE_C', distanceKm: 100 }] },
      scope2: { electricityKwh: 200 },
    });

    const csv = generateAuditCsv(assessment);
    expect(csv).toContain('Escopo,Categoria,Atividade');
    expect(csv).toContain('Scope 1');
    expect(csv).toContain('Scope 2');
    expect(csv.split('\n').length).toBeGreaterThanOrEqual(3);
  });

  it('generates executive ESG summary with SBTi 2030 targets and actionable advice', () => {
    const assessment = calculateCarbonAssessment({
      scope1: { vehicles: [{ fuelType: 'GASOLINE_C', distanceKm: 2000 }] },
      scope2: { electricityKwh: 3000 },
    });

    const summary = generateEsgExecutiveSummary(assessment);
    expect(summary.totalEmissionsTonsCO2e).toBeGreaterThan(0);
    expect(summary.sbtiTarget2030TonsCO2e).toBeCloseTo(assessment.totalTonsCO2e * 0.58, 2);
    expect(summary.actionableRecommendations.length).toBeGreaterThanOrEqual(2);
  });
});
