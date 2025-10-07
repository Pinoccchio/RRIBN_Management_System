/**
 * Promotion Candidate Sorting Utilities
 *
 * Provides consistent ranking logic across all promotion analytics components.
 * Implements multi-level tiebreakers to ensure fair and transparent rankings.
 */

import type { PromotionEligibility } from '@/lib/types/analytics';

/**
 * Comprehensive promotion candidate sorting with multi-level tiebreakers
 *
 * Sort Priority:
 * 1. Readiness Score (primary) - higher is better
 * 2. Training Types Count - more unique training types = better prepared
 * 3. Camp Duty Days - more camp duty = more committed
 * 4. Seminar Count - more seminars = more engaged
 * 5. Years in Service - more experience = more mature for promotion
 * 6. Total Training Hours - more training = more skilled
 * 7. Last Name (alphabetical) - final consistent tiebreaker
 *
 * @param candidates - Array of promotion eligibility data
 * @param direction - Sort direction ('asc' or 'desc'), defaults to 'desc'
 * @returns Sorted array of candidates
 */
export function sortPromotionCandidates(
  candidates: PromotionEligibility[],
  direction: 'asc' | 'desc' = 'desc'
): PromotionEligibility[] {
  const sorted = [...candidates].sort((a, b) => {
    // 1. Primary: Readiness Score (most important)
    if (a.readinessScore !== b.readinessScore) {
      return b.readinessScore - a.readinessScore;
    }

    // 2. Tiebreaker 1: Training Types Count (breadth of skills)
    // More training types = more versatile and well-rounded
    if (a.trainingTypesCount !== b.trainingTypesCount) {
      return b.trainingTypesCount - a.trainingTypesCount;
    }

    // 3. Tiebreaker 2: Camp Duty Days (commitment and availability)
    // More camp duty days = more dedicated and available
    if (a.campDutyDays !== b.campDutyDays) {
      return b.campDutyDays - a.campDutyDays;
    }

    // 4. Tiebreaker 3: Seminar Count (engagement and learning)
    // More seminars = more engaged in professional development
    if (a.seminarCount !== b.seminarCount) {
      return b.seminarCount - a.seminarCount;
    }

    // 5. Tiebreaker 4: Years in Service (experience and maturity)
    // More years = more experienced and proven
    if (a.yearsInService !== b.yearsInService) {
      return b.yearsInService - a.yearsInService;
    }

    // 6. Tiebreaker 5: Total Training Hours (depth of training)
    // More hours = more thoroughly trained
    if (a.totalTrainingHours !== b.totalTrainingHours) {
      return b.totalTrainingHours - a.totalTrainingHours;
    }

    // 7. Final Tiebreaker: Alphabetical by last name, then first name
    // Ensures consistent ordering even when all metrics are equal
    const nameA = `${a.lastName} ${a.firstName}`;
    const nameB = `${b.lastName} ${b.firstName}`;
    return nameA.localeCompare(nameB);
  });

  // Reverse if ascending order requested
  return direction === 'asc' ? sorted.reverse() : sorted;
}

/**
 * Get ranking justification for a candidate
 * Explains WHY this candidate ranks where they do
 *
 * @param candidate - The candidate to justify
 * @param rank - Their ranking position (1-based)
 * @returns Human-readable justification string
 */
export function getRankingJustification(
  candidate: PromotionEligibility,
  rank: number
): string {
  const reasons: string[] = [];

  // Readiness score assessment
  if (candidate.readinessScore === 100) {
    reasons.push(`Meets all promotion requirements (100% ready)`);
  } else if (candidate.readinessScore >= 75) {
    reasons.push(`High readiness score (${candidate.readinessScore}%)`);
  } else if (candidate.readinessScore >= 50) {
    reasons.push(`Partial readiness (${candidate.readinessScore}%)`);
  }

  // Training breadth (most important differentiator)
  if (candidate.trainingTypesCount > 5) {
    reasons.push(`Exceptional training breadth (${candidate.trainingTypesCount} different training types)`);
  } else if (candidate.trainingTypesCount > 3) {
    reasons.push(`Strong training variety (${candidate.trainingTypesCount} training types)`);
  } else if (candidate.trainingTypesCount > 0) {
    reasons.push(`Completed ${candidate.trainingTypesCount} training type${candidate.trainingTypesCount > 1 ? 's' : ''}`);
  }

  // Camp duty commitment
  if (candidate.campDutyDays >= 60) {
    reasons.push(`Outstanding camp duty commitment (${candidate.campDutyDays} days)`);
  } else if (candidate.campDutyDays >= 30) {
    reasons.push(`Exceeded camp duty requirement (${candidate.campDutyDays} days)`);
  } else if (candidate.campDutyDays > 0) {
    reasons.push(`${Math.round(candidate.campDutyDays * 10) / 10} camp duty days completed`);
  }

  // Seminar participation
  if (candidate.seminarCount >= 5) {
    reasons.push(`Very active in professional development (${candidate.seminarCount} seminars)`);
  } else if (candidate.seminarCount >= 3) {
    reasons.push(`Strong seminar participation (${candidate.seminarCount} seminars)`);
  } else if (candidate.seminarCount > 0) {
    reasons.push(`Attended ${candidate.seminarCount} seminar${candidate.seminarCount > 1 ? 's' : ''}`);
  }

  // Training volume
  if (candidate.totalTrainingHours > 300) {
    reasons.push(`Extensive training investment (${candidate.totalTrainingHours} hours)`);
  } else if (candidate.totalTrainingHours > 150) {
    reasons.push(`Substantial training hours (${candidate.totalTrainingHours} hours)`);
  }

  // Service experience
  if (candidate.yearsInService >= 10) {
    reasons.push(`Veteran service member (${candidate.yearsInService} years)`);
  } else if (candidate.yearsInService >= 5) {
    reasons.push(`Experienced reservist (${candidate.yearsInService} years of service)`);
  }

  // If no specific reasons were identified, provide a basic statement
  if (reasons.length === 0) {
    return `Meets basic promotion criteria (Rank ${rank})`;
  }

  return reasons.join('; ');
}

/**
 * Get a short summary of key metrics for display
 *
 * @param candidate - The candidate
 * @returns Short metric summary string
 */
export function getMetricSummary(candidate: PromotionEligibility): string {
  const parts: string[] = [];

  parts.push(`Score ${candidate.readinessScore}`);

  if (candidate.trainingTypesCount > 0) {
    parts.push(`${candidate.trainingTypesCount} training type${candidate.trainingTypesCount > 1 ? 's' : ''}`);
  }

  if (candidate.campDutyDays > 0) {
    parts.push(`${Math.round(candidate.campDutyDays * 10) / 10} camp days`);
  }

  if (candidate.seminarCount > 0) {
    parts.push(`${candidate.seminarCount} seminar${candidate.seminarCount > 1 ? 's' : ''}`);
  }

  return parts.join(' • ');
}
