import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import type {
  AnalyticsResponse,
  PromotionEligibility,
  AnalyticsSummary,
  CompanyAnalytics,
  EligibilityStatus,
  PromotionRequirements,
} from '@/lib/types/analytics';

// Promotion requirements are now fetched from database
// System Scope: NCO Only (Private, Private First Class, Corporal, Sergeant)

export async function GET(request: NextRequest) {
  logger.separator();
  logger.info('API Request', { context: 'GET /api/admin/analytics' });

  try {
    // 1. Create Supabase client
    const supabase = await createClient();

    // 2. Authentication check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      logger.warn('Unauthorized access attempt', { error: authError });
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 3. Authorization check (admin or super_admin only)
    const { data: account } = await supabase
      .from('accounts')
      .select('role, status')
      .eq('id', user.id)
      .single();

    if (!account || !['admin', 'super_admin'].includes(account.role)) {
      logger.warn('Forbidden access attempt', {
        userId: user.id,
        role: account?.role,
      });
      return NextResponse.json(
        { success: false, error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // 4. Query reservist data with training metrics
    // System Scope: Filter for NCO personnel only
    const { data: reservistData, error: queryError } = await supabase
      .from('accounts')
      .select(
        `
        id,
        profiles!inner(first_name, last_name),
        reservist_details!inner(
          rank,
          company,
          commission_type,
          reservist_status,
          date_of_commission
        )
      `
      )
      .eq('role', 'reservist')
      .eq('status', 'active')
      .eq('reservist_details.commission_type', 'NCO'); // NCO only filter

    if (queryError) {
      logger.error('Database query error', queryError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch reservist data' },
        { status: 500 }
      );
    }

    // 5. Get training data for each reservist (need training_name to count TYPES)
    const { data: trainingData } = await supabase.from('training_hours').select(`
        reservist_id,
        training_name,
        training_category,
        hours_completed
      `);

    // 6. Get camp duty records
    const { data: campDutyData } = await supabase
      .from('camp_duty_records')
      .select('reservist_id, hours');

    // 7. Get seminar counts
    const { data: seminarData } = await supabase
      .from('seminars_activities')
      .select('reservist_id');

    // 8. Get educational records
    const { data: educationData } = await supabase
      .from('educational_records')
      .select('reservist_id, degree_type');

    // 9. Get promotion requirements from database (client's exact specifications)
    const { data: promotionRequirements } = await supabase
      .from('promotion_requirements')
      .select('*')
      .eq('is_active', true);

    // Create map of requirements by rank for quick lookup
    const requirementsByRank: Record<string, any> = {};
    (promotionRequirements || []).forEach((req: any) => {
      requirementsByRank[req.from_rank] = req;
    });

    // 10. Process data and calculate eligibility
    const promotionEligibility: PromotionEligibility[] = (reservistData || []).map((reservist: any) => {
      const reservistId = reservist.id;

      // Count distinct training TYPES (not hours) - per client requirement
      const reservistTrainings = (trainingData || []).filter((t: any) => t.reservist_id === reservistId);

      // Get unique training names
      const uniqueTrainingNames = new Set(reservistTrainings.map((t: any) => t.training_name));
      const trainingTypesCount = uniqueTrainingNames.size;

      // Also keep hours for display purposes
      const trainingHours = reservistTrainings.reduce(
          (acc: any, curr: any) => {
            const hours = parseFloat(curr.hours_completed || 0);
            acc.total += hours;
            acc.count += 1;

            switch (curr.training_category) {
              case 'Leadership':
                acc.leadership += hours;
                break;
              case 'Combat':
                acc.combat += hours;
                break;
              case 'Technical':
                acc.technical += hours;
                break;
              case 'Seminar':
                acc.seminar += hours;
                break;
            }
            return acc;
          },
          {
            total: 0,
            count: 0,
            leadership: 0,
            combat: 0,
            technical: 0,
            seminar: 0,
          }
        );

      // Calculate camp duty days
      const campDutyDays =
        (campDutyData || [])
          .filter((c: any) => c.reservist_id === reservistId)
          .reduce((sum: number, c: any) => sum + (parseFloat(c.hours) / 24 || 0), 0) || 0;

      // Count seminars
      const seminarCount =
        (seminarData || []).filter((s: any) => s.reservist_id === reservistId).length || 0;

      // Get highest education
      const educationLevels = (educationData || [])
        .filter((e: any) => e.reservist_id === reservistId)
        .map((e: any) => e.degree_type);

      const educationPriority = {
        Doctoral: 5,
        "Master's": 4,
        "Bachelor's": 3,
        Vocational: 2,
        'High School': 1,
      };

      const highestEducation =
        educationLevels.sort(
          (a: string, b: string) =>
            (educationPriority[b as keyof typeof educationPriority] || 0) -
            (educationPriority[a as keyof typeof educationPriority] || 0)
        )[0] || null;

      // Calculate years in service
      const yearsInService = reservist.reservist_details.date_of_commission
        ? new Date().getFullYear() -
          new Date(reservist.reservist_details.date_of_commission).getFullYear()
        : 0;

      const commissionType = reservist.reservist_details.commission_type || 'NCO';
      const currentRank = reservist.reservist_details.rank;

      // Get rank-specific requirements from database
      const requirement = requirementsByRank[currentRank] || {
        required_training_types: 0,
        seminars_required: 0,
        years_in_current_rank: 0,
        camp_duty_days: 30,
      };

      // Determine eligibility using rank-specific requirements and training TYPES (not hours)
      const meetsTrainingRequirement = trainingTypesCount >= requirement.required_training_types;
      const meetsCampDutyRequirement = campDutyDays >= requirement.camp_duty_days;
      const meetsSeminarRequirement = seminarCount >= requirement.seminars_required;
      const meetsServiceTimeRequirement = yearsInService >= requirement.years_in_current_rank;
      const meetsEducationRequirement = true; // Not required for NCO

      // Calculate what's needed for promotion
      const trainingTypesNeeded = Math.max(0, requirement.required_training_types - trainingTypesCount);
      const campDutyDaysNeeded = Math.max(0, requirement.camp_duty_days - campDutyDays);
      const seminarsNeeded = Math.max(0, requirement.seminars_required - seminarCount);
      const yearsNeeded = Math.max(0, requirement.years_in_current_rank - yearsInService);

      // Calculate eligibility status
      const requirementsMet = [
        meetsTrainingRequirement,
        meetsCampDutyRequirement,
        meetsSeminarRequirement,
        meetsEducationRequirement,
        meetsServiceTimeRequirement,
      ].filter(Boolean).length;

      const totalRequirements = 4; // NCO has 4 core requirements (education excluded)

      let eligibilityStatus: EligibilityStatus;
      if (requirementsMet >= totalRequirements) {
        eligibilityStatus = 'eligible';
      } else if (requirementsMet >= totalRequirements - 1) {
        eligibilityStatus = 'partially_eligible';
      } else {
        eligibilityStatus = 'not_eligible';
      }

      // Calculate readiness score (0-100)
      const readinessScore = Math.round((requirementsMet / totalRequirements) * 100);

      return {
        id: reservistId,
        firstName: reservist.profiles.first_name,
        lastName: reservist.profiles.last_name,
        rank: reservist.reservist_details.rank,
        company: reservist.reservist_details.company,
        commissionType,
        reservistStatus: reservist.reservist_details.reservist_status,
        yearsInService,
        totalTrainingHours: Math.round(trainingHours.total * 10) / 10,
        leadershipHours: Math.round(trainingHours.leadership * 10) / 10,
        combatHours: Math.round(trainingHours.combat * 10) / 10,
        technicalHours: Math.round(trainingHours.technical * 10) / 10,
        seminarHours: Math.round(trainingHours.seminar * 10) / 10,
        trainingCount: trainingHours.count,
        campDutyDays: Math.round(campDutyDays * 10) / 10,
        seminarCount,
        highestEducation,
        eligibilityStatus,
        meetsTrainingRequirement,
        meetsCampDutyRequirement,
        meetsSeminarRequirement,
        meetsEducationRequirement,
        meetsServiceTimeRequirement,
        trainingTypesCount, // NEW: Count of distinct training types
        trainingTypesNeeded, // NEW: Types needed for promotion
        trainingHoursNeeded: Math.round(trainingTypesNeeded * 10) / 10, // Legacy field for compatibility
        campDutyDaysNeeded: Math.round(campDutyDaysNeeded * 10) / 10,
        seminarsNeeded,
        yearsNeeded: Math.round(yearsNeeded * 10) / 10,
        readinessScore,
      };
    });

    // 10. Calculate summary statistics
    // System Scope: NCO only (all reservists are NCO by filter)
    const summary: AnalyticsSummary = {
      totalReservists: promotionEligibility.length,
      ncoCount: promotionEligibility.length, // All are NCO in this scope
      ncoEligible: promotionEligibility.filter(
        (r) => r.eligibilityStatus === 'eligible'
      ).length,
      ncoPartiallyEligible: promotionEligibility.filter(
        (r) => r.eligibilityStatus === 'partially_eligible'
      ).length,
      ncoNotEligible: promotionEligibility.filter(
        (r) => r.eligibilityStatus === 'not_eligible'
      ).length,
      // CO stats removed - system scope limited to NCO only
      averageTrainingHours:
        Math.round(
          (promotionEligibility.reduce((sum, r) => sum + r.totalTrainingHours, 0) /
            promotionEligibility.length || 0) * 10
        ) / 10,
      totalTrainingHours: Math.round(
        promotionEligibility.reduce((sum, r) => sum + r.totalTrainingHours, 0) * 10
      ) / 10,
      reservistsNeedingMoreTraining: promotionEligibility.filter(
        (r) => !r.meetsTrainingRequirement
      ).length,
      averageCampDutyDays:
        Math.round(
          (promotionEligibility.reduce((sum, r) => sum + r.campDutyDays, 0) /
            promotionEligibility.length || 0) * 10
        ) / 10,
      reservistsNeedingMoreCampDuty: promotionEligibility.filter(
        (r) => !r.meetsCampDutyRequirement
      ).length,
    };

    // 11. Calculate company breakdown
    const companies = [...new Set(promotionEligibility.map((r) => r.company))];
    const companyBreakdown: CompanyAnalytics[] = companies
      .map((company) => {
        const companyReservists = promotionEligibility.filter((r) => r.company === company);

        return {
          company,
          totalReservists: companyReservists.length,
          eligibleCount: companyReservists.filter((r) => r.eligibilityStatus === 'eligible')
            .length,
          averageTrainingHours:
            Math.round(
              (companyReservists.reduce((sum, r) => sum + r.totalTrainingHours, 0) /
                companyReservists.length || 0) * 10
            ) / 10,
          averageCampDutyDays:
            Math.round(
              (companyReservists.reduce((sum, r) => sum + r.campDutyDays, 0) /
                companyReservists.length || 0) * 10
            ) / 10,
          averageReadinessScore:
            Math.round(
              companyReservists.reduce((sum, r) => sum + r.readinessScore, 0) /
                companyReservists.length || 0
            ),
        };
      })
      .sort((a, b) => b.averageReadinessScore - a.averageReadinessScore);

    // 12. Return response
    const response: AnalyticsResponse = {
      success: true,
      data: promotionEligibility,
      summary,
      companyBreakdown,
    };

    logger.success('Analytics data retrieved successfully (NCO only)', {
      totalReservists: summary.totalReservists,
      eligible: summary.ncoEligible,
    });

    return NextResponse.json(response);
  } catch (error) {
    logger.error('Unexpected error in analytics API', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
