/**
 * Analytics Types for Prescriptive Analytics Dashboard
 * Provides promotion eligibility analysis and AI-powered insights
 */

export type CommissionType = 'NCO' | 'CO';
export type ReservistStatus = 'ready' | 'standby' | 'retired';
export type EligibilityStatus = 'eligible' | 'partially_eligible' | 'not_eligible';

/**
 * Promotion eligibility data for a single reservist
 */
export interface PromotionEligibility {
  id: string;
  firstName: string;
  lastName: string;
  rank: string;
  company: string;
  commissionType: CommissionType;
  reservistStatus: ReservistStatus;
  yearsInService: number;

  // Training metrics
  totalTrainingHours: number;
  leadershipHours: number;
  combatHours: number;
  technicalHours: number;
  seminarHours: number;
  trainingCount: number;

  // Other requirements
  campDutyDays: number;
  seminarCount: number;
  highestEducation: string | null;

  // Eligibility flags
  eligibilityStatus: EligibilityStatus;
  meetsTrainingRequirement: boolean;
  meetsCampDutyRequirement: boolean;
  meetsSeminarRequirement: boolean;
  meetsEducationRequirement: boolean;
  meetsServiceTimeRequirement: boolean;

  // Missing requirements
  trainingHoursNeeded: number;
  campDutyDaysNeeded: number;
  seminarsNeeded: number;

  // Promotion readiness score (0-100)
  readinessScore: number;
}

/**
 * Overall analytics summary statistics
 */
export interface AnalyticsSummary {
  totalReservists: number;

  // NCO stats
  ncoCount: number;
  ncoEligible: number;
  ncoPartiallyEligible: number;
  ncoNotEligible: number;

  // CO stats
  coCount: number;
  coEligible: number;
  coPartiallyEligible: number;
  coNotEligible: number;

  // Training stats
  averageTrainingHours: number;
  totalTrainingHours: number;
  reservistsNeedingMoreTraining: number;

  // Camp duty stats
  averageCampDutyDays: number;
  reservistsNeedingMoreCampDuty: number;
}

/**
 * Company-specific analytics for cross-company comparison
 */
export interface CompanyAnalytics {
  company: string;
  totalReservists: number;
  eligibleCount: number;
  averageTrainingHours: number;
  averageCampDutyDays: number;
  averageReadinessScore: number;
}

/**
 * AI-generated insight from Gemini
 */
export interface AIInsight {
  type: 'recommendation' | 'gap_analysis' | 'comparison' | 'priority';
  title: string;
  content: string;
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
  affectedReservists?: string[]; // IDs of affected reservists
}

/**
 * Complete AI insights response from Gemini
 */
export interface AIInsightsResponse {
  summary: string;
  keyInsights: AIInsight[];
  topCandidates: {
    reservistId: string;
    name: string;
    rank: string;
    company: string;
    justification: string;
    readinessScore: number;
  }[];
  trainingGaps: {
    category: string;
    reservistsAffected: number;
    recommendation: string;
  }[];
  companyComparison: {
    topPerforming: string;
    needsImprovement: string;
    insights: string;
  };
}

/**
 * Main analytics API response
 */
export interface AnalyticsResponse {
  success: boolean;
  data: PromotionEligibility[];
  summary: AnalyticsSummary;
  companyBreakdown: CompanyAnalytics[];
  error?: string;
}

/**
 * AI insights API response
 */
export interface InsightsResponse {
  success: boolean;
  insights: AIInsightsResponse;
  error?: string;
}

/**
 * Promotion requirements configuration
 */
export interface PromotionRequirements {
  nco: {
    minTrainingHours: number;
    minCampDutyDays: number;
    minSeminars: number;
    minYearsInService: number;
  };
  co: {
    requiredEducation: string[];
    minYearsInService: number;
    minLeadershipHours: number;
  };
}
