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

// Promotion requirements configuration
const PROMOTION_REQUIREMENTS: PromotionRequirements = {
  nco: {
    minTrainingHours: 40,
    minCampDutyDays: 30,
    minSeminars: 2,
    minYearsInService: 2,
  },
  co: {
    requiredEducation: ["Master's", 'Doctoral'],
    minYearsInService: 5,
    minLeadershipHours: 20,
  },
};

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
      .eq('status', 'active');

    if (queryError) {
      logger.error('Database query error', queryError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch reservist data' },
        { status: 500 }
      );
    }

    // 5. Get training hours for each reservist
    const { data: trainingData } = await supabase.from('training_hours').select(`
        reservist_id,
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

    // 9. Process data and calculate eligibility
    const promotionEligibility: PromotionEligibility[] = (reservistData || []).map((reservist: any) => {
      const reservistId = reservist.id;

      // Calculate training hours by category
      const trainingHours = (trainingData || [])
        .filter((t: any) => t.reservist_id === reservistId)
        .reduce(
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

      // Determine eligibility based on commission type
      let meetsTrainingRequirement = false;
      let meetsCampDutyRequirement = false;
      let meetsSeminarRequirement = false;
      let meetsEducationRequirement = false;
      let meetsServiceTimeRequirement = false;

      let trainingHoursNeeded = 0;
      let campDutyDaysNeeded = 0;
      let seminarsNeeded = 0;

      if (commissionType === 'NCO') {
        meetsTrainingRequirement =
          trainingHours.total >= PROMOTION_REQUIREMENTS.nco.minTrainingHours;
        meetsCampDutyRequirement =
          campDutyDays >= PROMOTION_REQUIREMENTS.nco.minCampDutyDays;
        meetsSeminarRequirement = seminarCount >= PROMOTION_REQUIREMENTS.nco.minSeminars;
        meetsServiceTimeRequirement =
          yearsInService >= PROMOTION_REQUIREMENTS.nco.minYearsInService;
        meetsEducationRequirement = true; // Not required for NCO

        trainingHoursNeeded = Math.max(
          0,
          PROMOTION_REQUIREMENTS.nco.minTrainingHours - trainingHours.total
        );
        campDutyDaysNeeded = Math.max(
          0,
          PROMOTION_REQUIREMENTS.nco.minCampDutyDays - campDutyDays
        );
        seminarsNeeded = Math.max(0, PROMOTION_REQUIREMENTS.nco.minSeminars - seminarCount);
      } else if (commissionType === 'CO') {
        meetsEducationRequirement =
          highestEducation !== null &&
          PROMOTION_REQUIREMENTS.co.requiredEducation.includes(highestEducation);
        meetsServiceTimeRequirement =
          yearsInService >= PROMOTION_REQUIREMENTS.co.minYearsInService;
        meetsTrainingRequirement =
          trainingHours.leadership >= PROMOTION_REQUIREMENTS.co.minLeadershipHours;
        meetsCampDutyRequirement = true; // Not strictly required for CO
        meetsSeminarRequirement = true; // Not strictly required for CO

        trainingHoursNeeded = Math.max(
          0,
          PROMOTION_REQUIREMENTS.co.minLeadershipHours - trainingHours.leadership
        );
      }

      // Calculate eligibility status
      const requirementsMet = [
        meetsTrainingRequirement,
        meetsCampDutyRequirement,
        meetsSeminarRequirement,
        meetsEducationRequirement,
        meetsServiceTimeRequirement,
      ].filter(Boolean).length;

      const totalRequirements = commissionType === 'NCO' ? 4 : 3; // NCO has 4, CO has 3 key requirements

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
        trainingHoursNeeded: Math.round(trainingHoursNeeded * 10) / 10,
        campDutyDaysNeeded: Math.round(campDutyDaysNeeded * 10) / 10,
        seminarsNeeded,
        readinessScore,
      };
    });

    // 10. Calculate summary statistics
    const summary: AnalyticsSummary = {
      totalReservists: promotionEligibility.length,
      ncoCount: promotionEligibility.filter((r) => r.commissionType === 'NCO').length,
      ncoEligible: promotionEligibility.filter(
        (r) => r.commissionType === 'NCO' && r.eligibilityStatus === 'eligible'
      ).length,
      ncoPartiallyEligible: promotionEligibility.filter(
        (r) => r.commissionType === 'NCO' && r.eligibilityStatus === 'partially_eligible'
      ).length,
      ncoNotEligible: promotionEligibility.filter(
        (r) => r.commissionType === 'NCO' && r.eligibilityStatus === 'not_eligible'
      ).length,
      coCount: promotionEligibility.filter((r) => r.commissionType === 'CO').length,
      coEligible: promotionEligibility.filter(
        (r) => r.commissionType === 'CO' && r.eligibilityStatus === 'eligible'
      ).length,
      coPartiallyEligible: promotionEligibility.filter(
        (r) => r.commissionType === 'CO' && r.eligibilityStatus === 'partially_eligible'
      ).length,
      coNotEligible: promotionEligibility.filter(
        (r) => r.commissionType === 'CO' && r.eligibilityStatus === 'not_eligible'
      ).length,
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

    logger.success('Analytics data retrieved successfully', {
      totalReservists: summary.totalReservists,
      eligible: summary.ncoEligible + summary.coEligible,
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
