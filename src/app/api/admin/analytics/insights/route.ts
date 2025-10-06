import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import type { InsightsResponse, AIInsightsResponse, AnalyticsResponse } from '@/lib/types/analytics';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  logger.separator();
  logger.info('API Request', { context: 'POST /api/admin/analytics/insights' });

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

    // 4. Get analytics data from request body
    const body = await request.json();
    const analyticsData: AnalyticsResponse = body.analyticsData;

    if (!analyticsData || !analyticsData.data) {
      return NextResponse.json(
        { success: false, error: 'Analytics data is required' },
        { status: 400 }
      );
    }

    // 5. Prepare data summary for Gemini
    const dataSummary = {
      totalReservists: analyticsData.summary.totalReservists,
      nco: {
        total: analyticsData.summary.ncoCount,
        eligible: analyticsData.summary.ncoEligible,
        partiallyEligible: analyticsData.summary.ncoPartiallyEligible,
        notEligible: analyticsData.summary.ncoNotEligible,
      },
      co: {
        total: analyticsData.summary.coCount,
        eligible: analyticsData.summary.coEligible,
        partiallyEligible: analyticsData.summary.coPartiallyEligible,
        notEligible: analyticsData.summary.coNotEligible,
      },
      training: {
        averageHours: analyticsData.summary.averageTrainingHours,
        totalHours: analyticsData.summary.totalTrainingHours,
        needingMore: analyticsData.summary.reservistsNeedingMoreTraining,
      },
      companies: analyticsData.companyBreakdown,
      topCandidates: analyticsData.data
        .filter(r => r.eligibilityStatus === 'eligible')
        .sort((a, b) => b.readinessScore - a.readinessScore)
        .slice(0, 10)
        .map(r => ({
          id: r.id,
          name: `${r.firstName} ${r.lastName}`,
          rank: r.rank,
          company: r.company,
          commissionType: r.commissionType,
          readinessScore: r.readinessScore,
          trainingHours: r.totalTrainingHours,
          campDutyDays: r.campDutyDays,
        })),
      trainingGaps: {
        needingMoreTraining: analyticsData.summary.reservistsNeedingMoreTraining,
        needingMoreCampDuty: analyticsData.summary.reservistsNeedingMoreCampDuty,
      },
    };

    // 6. Create Gemini prompt
    const prompt = `You are a military personnel analytics expert analyzing promotion readiness data for an Army Reserve battalion. Analyze the following data and provide prescriptive insights and recommendations.

## Data Summary:
${JSON.stringify(dataSummary, null, 2)}

## Your Task:
Provide a comprehensive analysis with the following structure:

1. **Executive Summary**: A 2-3 sentence overview of the promotion readiness status across the battalion.

2. **Key Insights** (provide 4-6 insights):
   - Identify critical trends and patterns
   - Highlight both strengths and areas of concern
   - Each insight should be actionable

3. **Top Promotion Candidates** (provide top 5):
   - Select the most qualified candidates for promotion
   - Provide specific justification for each candidate
   - Include their readiness score

4. **Training Gap Analysis**:
   - Identify what types of training are most needed
   - How many reservists are affected
   - Specific recommendations for training programs

5. **Company Performance Comparison**:
   - Identify the top-performing company and why
   - Identify companies that need improvement
   - Provide specific insights and recommendations

Please format your response as valid JSON with the following structure:
{
  "summary": "executive summary text",
  "keyInsights": [
    {
      "type": "recommendation|gap_analysis|comparison|priority",
      "title": "insight title",
      "content": "detailed insight content",
      "priority": "high|medium|low",
      "actionable": true|false
    }
  ],
  "topCandidates": [
    {
      "reservistId": "id from data",
      "name": "full name",
      "rank": "current rank",
      "company": "company code",
      "justification": "specific reasons why they should be promoted",
      "readinessScore": score
    }
  ],
  "trainingGaps": [
    {
      "category": "training category or general area",
      "reservistsAffected": number,
      "recommendation": "specific actionable recommendation"
    }
  ],
  "companyComparison": {
    "topPerforming": "company code",
    "needsImprovement": "company code",
    "insights": "detailed comparison insights"
  }
}

Be specific, data-driven, and actionable in your recommendations. Focus on prescriptive insights that help admins make informed promotion decisions.`;

    // 7. Call Gemini AI
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // 8. Parse Gemini response
    let aiInsights: AIInsightsResponse;
    try {
      // Remove markdown code blocks if present
      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      aiInsights = JSON.parse(cleanedText);
    } catch (parseError) {
      logger.error('Failed to parse Gemini response', parseError);
      return NextResponse.json(
        { success: false, error: 'Failed to parse AI insights' },
        { status: 500 }
      );
    }

    // 9. Return insights
    const insightsResponse: InsightsResponse = {
      success: true,
      insights: aiInsights,
    };

    logger.success('AI insights generated successfully', {
      insightsCount: aiInsights.keyInsights?.length || 0,
      topCandidatesCount: aiInsights.topCandidates?.length || 0,
    });

    return NextResponse.json(insightsResponse);
  } catch (error: any) {
    logger.error('Unexpected error in AI insights API', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal server error',
      },
      { status: 500 }
    );
  }
}
