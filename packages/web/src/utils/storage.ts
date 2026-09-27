import { SavedAssessment } from '../types/storage.js';
import { calculateCarbonAssessment } from '@carbonlens/core';

const STORAGE_KEY = 'carbonlens_assessments_v1';

export function getSavedAssessments(): SavedAssessment[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Generate initial demo data for smooth UX on first launch
      const sample = generateInitialSampleAssessments();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sample));
      return sample;
    }
    return JSON.parse(raw);
  } catch (error) {
    console.error('Failed to load assessments from localStorage', error);
    return [];
  }
}

export function saveAssessment(
  periodLabel: string,
  entityName: string,
  input: any,
  result: any
): SavedAssessment[] {
  const current = getSavedAssessments();
  const newEntry: SavedAssessment = {
    id: `assess-${Date.now()}`,
    savedAt: new Date().toISOString(),
    periodLabel,
    entityName,
    input,
    result,
  };

  const updated = [newEntry, ...current];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to persist assessment', err);
  }
  return updated;
}

export function deleteAssessment(id: string): SavedAssessment[] {
  const current = getSavedAssessments();
  const updated = current.filter((item) => item.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to delete assessment', err);
  }
  return updated;
}

function generateInitialSampleAssessments(): SavedAssessment[] {
  const months = [
    { label: 'Jan 2024', km: 1200, kwh: 520, water: 8000, organic: 35 },
    { label: 'Fev 2024', km: 950, kwh: 480, water: 7500, organic: 30 },
    { label: 'Mar 2024', km: 700, kwh: 420, water: 6500, organic: 25 },
  ];

  return months.map((m, index) => {
    const input = {
      organizationOrIndividualName: 'Minha Empresa / Residência Demo',
      period: m.label,
      scope1: {
        vehicles: [{ fuelType: 'GASOLINE_C' as const, distanceKm: m.km }],
        stationary: { lpgKg: 13 },
      },
      scope2: {
        electricityKwh: m.kwh,
        grid: 'BRAZIL_SIN' as const,
        renewablePercentage: index === 2 ? 40 : 0,
      },
      scope3: {
        waterLiters: m.water,
        wasteOrganicKg: m.organic,
        wasteOrganicDisposal: index === 2 ? ('COMPOSTING' as const) : ('LANDFILL_NO_METHANE_CAPTURE' as const),
      },
    };
    const result = calculateCarbonAssessment(input);

    return {
      id: `sample-assess-${index}`,
      savedAt: new Date(2024, index, 28).toISOString(),
      periodLabel: m.label,
      entityName: 'Minha Empresa / Residência Demo',
      input,
      result,
    };
  });
}
