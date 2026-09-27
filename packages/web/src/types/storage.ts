import { CarbonAssessmentInput, CarbonAssessmentResult } from '@carbonlens/core';

export interface SavedAssessment {
  id: string;
  savedAt: string;
  periodLabel: string;
  entityName: string;
  input: CarbonAssessmentInput;
  result: CarbonAssessmentResult;
}
