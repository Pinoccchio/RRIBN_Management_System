/**
 * Military Rank Constants
 *
 * System Scope: Non-Commissioned Officers (NCO) Only
 * Last Updated: October 8, 2025
 *
 * IMPORTANT: This system currently operates with a limited scope focusing
 * exclusively on Non-Commissioned Personnel (Private through Sergeant).
 * Commissioned Officer ranks are maintained for historical reference and
 * future system expansion but are NOT used in active application logic.
 */

/**
 * Active NCO Ranks (System Scope: Limited to these 4 ranks)
 * These are the ONLY ranks that should appear in dropdowns, filters,
 * and promotion eligibility calculations.
 */
export const NCO_RANKS = [
  'Private',
  'Private First Class',
  'Corporal',
  'Sergeant',
] as const;

/**
 * NCO Ranks Excluded from Current Scope
 * These higher NCO ranks exist in military structure but are
 * intentionally excluded from the current system scope.
 * They may be added in future system expansions.
 */
export const NCO_RANKS_EXCLUDED = [
  'Staff Sergeant',
  'Technical Sergeant',
  'Master Sergeant',
  'First Sergeant',
  'Sergeant Major',
] as const;

/**
 * Commissioned Officer Ranks (Historical Reference Only)
 * These ranks are kept for historical data integrity (existing RIDS records,
 * promotion history, etc.) but are NOT used in active application logic.
 * Database records with these ranks will be filtered out from all
 * user-facing features.
 */
export const CO_RANKS_HISTORICAL = [
  'Second Lieutenant',
  'First Lieutenant',
  'Captain',
  'Major',
  'Lieutenant Colonel',
  'Colonel',
  'Brigadier General',
  'Major General',
  'Lieutenant General',
  'General',
] as const;

/**
 * TypeScript Types
 */
export type NCORank = typeof NCO_RANKS[number];
export type ExcludedNCORank = typeof NCO_RANKS_EXCLUDED[number];
export type HistoricalCORank = typeof CO_RANKS_HISTORICAL[number];
export type AllRank = NCORank | ExcludedNCORank | HistoricalCORank;

/**
 * Rank Display Helpers
 */

/**
 * Get display label for a rank
 */
export const getRankLabel = (rank: string): string => {
  return rank;
};

/**
 * Check if rank is within current NCO scope
 * Use this to validate rank selections and filter data
 */
export const isNCORank = (rank: string): rank is NCORank => {
  return NCO_RANKS.includes(rank as NCORank);
};

/**
 * Check if rank is a commissioned officer rank
 */
export const isCORank = (rank: string): rank is HistoricalCORank => {
  return CO_RANKS_HISTORICAL.includes(rank as HistoricalCORank);
};

/**
 * Get next rank in NCO progression
 * Returns null if already at highest NCO rank in scope
 */
export const getNextNCORank = (currentRank: NCORank): NCORank | null => {
  const index = NCO_RANKS.indexOf(currentRank);
  if (index === -1 || index === NCO_RANKS.length - 1) {
    return null;
  }
  return NCO_RANKS[index + 1];
};

/**
 * Dropdown options for rank selection (UI components)
 */
export const NCO_RANK_OPTIONS = NCO_RANKS.map(rank => ({
  value: rank,
  label: rank,
}));
