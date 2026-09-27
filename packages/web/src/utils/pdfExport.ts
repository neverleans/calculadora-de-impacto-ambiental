/**
 * CarbonLens — Executive ESG PDF Generator
 * Produces an auditable, executive-grade ESG Carbon Inventory Report
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CarbonAssessmentResult, generateEsgExecutiveSummary } from '@carbonlens/core';

export function exportEsgPdfReport(assessment: CarbonAssessmentResult): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const summary = generateEsgExecutiveSummary(assessment);
  const nowStr = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  // Colors
  const primaryDark = [15, 23, 42]; // Slate 900
  const emerald = [16, 185, 129];   // Emerald 500
  const grayLight = [248, 250, 252]; // Slate 50
  const grayText = [100, 116, 139];  // Slate 500

  // 1. Header Banner
  doc.setFillColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  doc.rect(0, 0, 210, 38, 'F');

  // Title & Brand
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('CARBONLENS', 14, 18);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(emerald[0], emerald[1], emerald[2]);
  doc.text('OPEN CARBON ACCOUNTING & ESG ENGINE — RELATÓRIO EXECUTIVO', 14, 25);

  doc.setTextColor(203, 213, 225);
  doc.setFontSize(8);
  doc.text(`Norma: GHG Protocol Corporate Standard | Emitido em: ${nowStr}`, 14, 32);

  // Metadata Panel
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Entidade Avaliada: ${assessment.metadata.entityName}`, 14, 46);
  doc.setFont('helvetica', 'normal');
  doc.text(`Período Contábil: ${assessment.metadata.period}`, 14, 52);
  const auditId = `CL-${assessment.metadata.assessedAt.replace(/[^0-9]/g, '').slice(0, 14)}`;
  doc.text(`ID Auditoria: ${auditId}`, 140, 46);
  doc.text(`Versão do Motor: v${assessment.metadata.engineVersion}`, 140, 52);

  // Divider
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(14, 56, 196, 56);

  // 2. Executive Metric Highlight Boxes
  // Box 1: Total Footprint
  doc.setFillColor(grayLight[0], grayLight[1], grayLight[2]);
  doc.roundedRect(14, 60, 56, 26, 2, 2, 'F');
  doc.setFontSize(8);
  doc.setTextColor(grayText[0], grayText[1], grayText[2]);
  doc.text('PEGADA TOTAL LÍQUIDA', 18, 67);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  doc.text(`${assessment.totalTonsCO2e.toFixed(3)} tCO2e`, 18, 77);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text(`(${assessment.totalKgCO2e.toLocaleString('pt-BR')} kg CO2e)`, 18, 83);

  // Box 2: Scope 1 & 2
  doc.setFillColor(grayLight[0], grayLight[1], grayLight[2]);
  doc.roundedRect(74, 60, 56, 26, 2, 2, 'F');
  doc.setFontSize(8);
  doc.setTextColor(grayText[0], grayText[1], grayText[2]);
  doc.text('ESCOPO 1 (DIRETO) + 2 (ENERGIA)', 78, 67);
  const scope12Tons = assessment.scopes.scope1.totalTonsCO2e + assessment.scopes.scope2.totalTonsCO2e;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  doc.text(`${scope12Tons.toFixed(3)} tCO2e`, 78, 77);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text(`E1: ${assessment.shares.scope1Percent}% | E2: ${assessment.shares.scope2Percent}%`, 78, 83);

  // Box 3: Biogenic & Scope 3
  doc.setFillColor(grayLight[0], grayLight[1], grayLight[2]);
  doc.roundedRect(134, 60, 62, 26, 2, 2, 'F');
  doc.setFontSize(8);
  doc.setTextColor(grayText[0], grayText[1], grayText[2]);
  doc.text('ESCOPO 3 + CO2 BIOGÊNICO', 138, 67);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  doc.text(`${assessment.scopes.scope3.totalTonsCO2e.toFixed(3)} tCO2e`, 138, 77);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text(`Biogênico memo: ${assessment.biogenicKgCO2.toFixed(1)} kg CO2`, 138, 83);

  // 3. Resumo Executivo & Hotspot
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  doc.text('Sumário Executivo e Diagnóstico de Hotspots', 14, 96);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(
    `A pegada consolidada indica que o maior vetor de emissões concentra-se no ${summary.dominantScope}.`,
    14,
    102
  );
  doc.text(assessment.hotspot.description, 14, 107);

  // 4. Scopes Breakdown Table
  const scopesTableBody = [
    [
      'Escopo 1 (Combustão Direta)',
      `${assessment.scopes.scope1.totalKgCO2e.toFixed(2)} kg`,
      `${assessment.scopes.scope1.totalTonsCO2e.toFixed(3)} t`,
      `${assessment.shares.scope1Percent}%`,
      'Veículos da frota, combustíveis fósseis, GLP e geradores',
    ],
    [
      'Escopo 2 (Energia Adquirida)',
      `${assessment.scopes.scope2.totalKgCO2e.toFixed(2)} kg`,
      `${assessment.scopes.scope2.totalTonsCO2e.toFixed(3)} t`,
      `${assessment.shares.scope2Percent}%`,
      'Eletricidade da rede SIN/MCTI com compensação solar',
    ],
    [
      'Escopo 3 (Cadeia de Valor)',
      `${assessment.scopes.scope3.totalKgCO2e.toFixed(2)} kg`,
      `${assessment.scopes.scope3.totalTonsCO2e.toFixed(3)} t`,
      `${assessment.shares.scope3Percent}%`,
      'Resíduos em aterro/compostagem, voos e deslocamento',
    ],
  ];

  autoTable(doc, {
    startY: 112,
    head: [['Escopo GHG', 'Emissão (kg CO2e)', 'Emissão (tCO2e)', 'Participação (%)', 'Abrangência']],
    body: scopesTableBody,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: 14, right: 14 },
  });

  // 5. SBTi Recommendations & Reduction Target
  const finalY1 = (doc as any).lastAutoTable.finalY + 8;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  doc.text('Metas SBTi Alinhadas a 1,5°C & Recomendações Estratégicas', 14, finalY1);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  let curY = finalY1 + 6;
  summary.actionableRecommendations.forEach((rec) => {
    doc.text(`• ${rec}`, 16, curY, { maxWidth: 180 });
    curY += 7;
  });

  // 6. Detailed Audit Trail Table
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  doc.text('Trilha de Auditoria Detalhada dos Fatores de Emissão', 14, curY + 4);

  const auditRows = assessment.auditTrail.map((trace) => [
    trace.scope,
    trace.activityName,
    `${trace.activityAmount} ${trace.activityUnit}`,
    `${trace.emissionFactor} ${trace.emissionFactorUnit}`,
    trace.emissionFactorSource,
    `${trace.fossilKgCO2e.toFixed(2)} kg`,
  ]);

  autoTable(doc, {
    startY: curY + 8,
    head: [['Escopo', 'Atividade', 'Quantidade', 'Fator de Emissão', 'Fonte Oficial do Fator', 'Impacto']],
    body: auditRows,
    theme: 'striped',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontSize: 7.5,
    },
    bodyStyles: {
      fontSize: 7,
      textColor: [30, 41, 59],
    },
    margin: { left: 14, right: 14 },
  });

  // Footer Disclaimer on All Pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `CarbonLens Open Engine — Página ${i} de ${totalPages} | Relatório auditável conforme diretrizes do GHG Protocol Corporate Standard`,
      14,
      290
    );
  }

  // Trigger download
  const safeFilename = `CarbonLens_Relatorio_ESG_${assessment.metadata.entityName.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
  doc.save(safeFilename);
}

export function downloadJsonAudit(assessment: CarbonAssessmentResult): void {
  const jsonStr = JSON.stringify(assessment, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `CarbonLens_Auditoria_${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadCsvAudit(csvContent: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `CarbonLens_Trilha_Auditoria_${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
