/**
 * CarbonLens — Executive ESG Summary & Audit Generator
 * Prepares auditable ESG disclosures compliant with GHG Protocol & SBTi criteria
 */

import { CarbonAssessmentResult } from '../types/index.js';

export interface EsgExecutiveSummary {
  headline: string;
  reportingPeriod: string;
  entityName: string;
  totalEmissionsTonsCO2e: number;
  totalEmissionsKgCO2e: number;
  biogenicEmissionsKgCO2: number;
  scopesBreakdown: {
    scope1Tons: number;
    scope1Percent: number;
    scope2Tons: number;
    scope2Percent: number;
    scope3Tons: number;
    scope3Percent: number;
  };
  dominantScope: string;
  sbtiTarget2030TonsCO2e: number; // SBTi standard -42% absolute reduction
  annualReductionTargetTonsCO2e: number; // -4.2% per year
  actionableRecommendations: string[];
}

export function generateEsgExecutiveSummary(assessment: CarbonAssessmentResult): EsgExecutiveSummary {
  const totalTons = assessment.totalTonsCO2e;
  const sbtiTarget = Number((totalTons * 0.58).toFixed(3)); // 42% reduction = 58% of baseline
  const annualTarget = Number((totalTons * 0.042).toFixed(3));

  let dominantScope = 'Escopo 1 (Emissões Diretas)';
  if (
    assessment.shares.scope2Percent >= assessment.shares.scope1Percent &&
    assessment.shares.scope2Percent >= assessment.shares.scope3Percent
  ) {
    dominantScope = 'Escopo 2 (Eletricidade Adquirida)';
  } else if (
    assessment.shares.scope3Percent >= assessment.shares.scope1Percent &&
    assessment.shares.scope3Percent >= assessment.shares.scope2Percent
  ) {
    dominantScope = 'Escopo 3 (Cadeia de Valor e Deslocamentos)';
  }

  // Tailored recommendations based on emissions profile
  const actionableRecommendations: string[] = [];

  if (assessment.scopes.scope1.totalKgCO2e > 0) {
    actionableRecommendations.push(
      'Frota / Combustão: Priorizar transição para veículos elétricos (BEV) ou híbridos, ou maximizar o uso de etanol hidratado (biocombustível de ciclo fechado).'
    );
  }

  if (assessment.scopes.scope2.totalKgCO2e > 0) {
    actionableRecommendations.push(
      'Energia: Avaliar aquisição de certificados de energia renovável (I-REC) ou instalação de usina solar fotovoltaica on-site para zerar emissões do Escopo 2.'
    );
  }

  if (assessment.scopes.scope3.totalKgCO2e > 0) {
    actionableRecommendations.push(
      'Resíduos e Logística: Implementar triagem rigorosa na fonte com desvio de 100% dos resíduos orgânicos para compostagem e incentivo ao transporte ferroviário/metrô.'
    );
  }

  actionableRecommendations.push(
    `Meta SBTi Alinhada a 1,5°C: Reduzir ${(annualTarget * 1000).toFixed(0)} kg CO2e anualmente até atingir o teto de ${sbtiTarget} tCO2e em 2030.`
  );

  const headline =
    totalTons === 0
      ? 'Pegada de carbono neutra ou não registrada no período avaliado.'
      : `Emissão total consolidada de ${totalTons.toFixed(3)} tCO2e (${assessment.totalKgCO2e.toLocaleString('pt-BR')} kg CO2e), com predominância no ${dominantScope}.`;

  return {
    headline,
    reportingPeriod: assessment.metadata.period,
    entityName: assessment.metadata.entityName,
    totalEmissionsTonsCO2e: totalTons,
    totalEmissionsKgCO2e: assessment.totalKgCO2e,
    biogenicEmissionsKgCO2: assessment.biogenicKgCO2,
    scopesBreakdown: {
      scope1Tons: assessment.scopes.scope1.totalTonsCO2e,
      scope1Percent: assessment.shares.scope1Percent,
      scope2Tons: assessment.scopes.scope2.totalTonsCO2e,
      scope2Percent: assessment.shares.scope2Percent,
      scope3Tons: assessment.scopes.scope3.totalTonsCO2e,
      scope3Percent: assessment.shares.scope3Percent,
    },
    dominantScope,
    sbtiTarget2030TonsCO2e: sbtiTarget,
    annualReductionTargetTonsCO2e: annualTarget,
    actionableRecommendations,
  };
}

/**
 * Generates an auditable CSV representation of all calculation steps
 */
export function generateAuditCsv(assessment: CarbonAssessmentResult): string {
  const headers = [
    'ID',
    'Escopo',
    'Categoria',
    'Atividade',
    'Quantidade',
    'Unidade_Atividade',
    'Fator_Emissao',
    'Unidade_Fator',
    'Fonte_Fator',
    'Formula',
    'Emissoes_Fosseis_kgCO2e',
    'Emissoes_Biogenicas_kgCO2',
  ];

  const rows = assessment.auditTrail.map((trace) => {
    return [
      `"${trace.id}"`,
      `"${trace.scope}"`,
      `"${trace.category}"`,
      `"${trace.activityName}"`,
      trace.activityAmount,
      `"${trace.activityUnit}"`,
      trace.emissionFactor,
      `"${trace.emissionFactorUnit}"`,
      `"${trace.emissionFactorSource.replace(/"/g, '""')}"`,
      `"${trace.formula.replace(/"/g, '""')}"`,
      trace.fossilKgCO2e,
      trace.biogenicKgCO2,
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}
