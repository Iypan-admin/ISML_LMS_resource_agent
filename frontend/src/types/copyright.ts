export type CopyrightRiskLevel = 
  | 'LOW_CONCERN' 
  | 'REVIEW_REQUIRED' 
  | 'RESTRICTED' 
  | 'UNKNOWN';

export interface CopyrightAnalysis {
  sourceName: string;
  sourceUrl: string;
  license: string;
  attributionRequired: boolean;
  commercialUsageAllowed: boolean;
  modificationAllowed: boolean;
  redistributionAllowed: boolean;
  hostingPermission: boolean;
  riskLevel: CopyrightRiskLevel;
  riskExplanation: string;
  recommendedAction: string;
}
