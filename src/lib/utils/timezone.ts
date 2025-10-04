/**
 * Timezone Utility Functions
 *
 * Handles conversion between UTC (database storage) and Philippine Time (Asia/Manila, UTC+8)
 * for the RRIBN Management System.
 *
 * IMPORTANT CONTEXT:
 * - Database (Supabase PostgreSQL): Stores all timestamps in UTC (timestamptz)
 * - Philippines: UTC+8 (no daylight saving time)
 * - HTML datetime-local input: Expects format "YYYY-MM-DDTHH:mm" (local time, no timezone)
 */

/**
 * Convert UTC timestamp to Philippine Time for datetime-local input
 *
 * @param utcTimestamp - PostgreSQL UTC timestamp (e.g., "2025-10-05 00:30:00+00")
 * @returns datetime-local formatted string in Philippine Time (e.g., "2025-10-05T08:30")
 *
 * @example
 * convertUTCToManilaLocal("2025-10-05 00:30:00+00") → "2025-10-05T08:30" (8:30 AM Manila)
 */
export function convertUTCToManilaLocal(utcTimestamp: string): string {
  const date = new Date(utcTimestamp);

  // Convert to Philippine Time (UTC+8)
  const manilaTime = new Date(date.getTime() + (8 * 60 * 60 * 1000));

  const year = manilaTime.getUTCFullYear();
  const month = String(manilaTime.getUTCMonth() + 1).padStart(2, '0');
  const day = String(manilaTime.getUTCDate()).padStart(2, '0');
  const hours = String(manilaTime.getUTCHours()).padStart(2, '0');
  const minutes = String(manilaTime.getUTCMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Convert datetime-local input (Philippine Time) to UTC for database storage
 *
 * @param manilaLocalString - datetime-local formatted string (e.g., "2025-10-05T08:30")
 * @returns ISO 8601 UTC timestamp (e.g., "2025-10-05T00:30:00.000Z")
 *
 * @example
 * convertManilaLocalToUTC("2025-10-05T08:30") → "2025-10-05T00:30:00.000Z" (12:30 AM UTC)
 */
export function convertManilaLocalToUTC(manilaLocalString: string): string {
  // Parse as if it's Manila time (no timezone info in datetime-local)
  const [datePart, timePart] = manilaLocalString.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hours, minutes] = timePart.split(':').map(Number);

  // Create date in UTC, then subtract 8 hours to get the equivalent UTC time
  // If user enters 8:30 AM Manila, that's 12:30 AM UTC
  const manilaDate = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0, 0));
  const utcDate = new Date(manilaDate.getTime() - (8 * 60 * 60 * 1000));

  return utcDate.toISOString();
}

/**
 * Format UTC timestamp to human-readable Philippine Time
 *
 * @param utcTimestamp - PostgreSQL UTC timestamp
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string in Philippine Time
 *
 * @example
 * formatManilaTime("2025-10-05 00:30:00+00") → "October 5, 2025, 8:30 AM"
 */
export function formatManilaTime(
  utcTimestamp: string,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }
): string {
  const date = new Date(utcTimestamp);

  return new Intl.DateTimeFormat('en-PH', {
    ...options,
    timeZone: 'Asia/Manila',
  }).format(date);
}

/**
 * Get current time in Philippine Time for datetime-local input
 *
 * @returns Current datetime in Manila formatted for datetime-local input
 *
 * @example
 * getCurrentManilaLocal() → "2025-10-05T14:30" (2:30 PM Manila today)
 */
export function getCurrentManilaLocal(): string {
  const now = new Date();
  const utcTimestamp = now.toISOString();
  return convertUTCToManilaLocal(utcTimestamp);
}
