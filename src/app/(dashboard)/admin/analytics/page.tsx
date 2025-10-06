'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/dashboard/shared/PageHeader';
import { StatCard } from '@/components/dashboard/stats/StatCard';
import { Button } from '@/components/ui/Button';
import { PromotionEligibilityTable } from '@/components/dashboard/analytics/PromotionEligibilityTable';
import { AIInsightsCard } from '@/components/dashboard/analytics/AIInsightsCard';
import { Sparkles, Users, TrendingUp, AlertCircle, Award } from 'lucide-react';
import type { StatCardData } from '@/lib/types/dashboard';
import type { AnalyticsResponse, InsightsResponse } from '@/lib/types/analytics';

export default function AdminAnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsResponse | null>(null);
  const [aiInsights, setAiInsights] = useState<InsightsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch analytics data on mount
  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/admin/analytics');
      const data: AnalyticsResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch analytics data');
      }

      setAnalyticsData(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateAIInsights = async () => {
    if (!analyticsData) return;

    try {
      setInsightsLoading(true);

      const response = await fetch('/api/admin/analytics/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ analyticsData }),
      });

      const data: InsightsResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate AI insights');
      }

      setAiInsights(data);
    } catch (err: any) {
      console.error('Error generating AI insights:', err);
      alert('Failed to generate AI insights. Please try again.');
    } finally {
      setInsightsLoading(false);
    }
  };

  // Calculate stats
  const stats: StatCardData[] = analyticsData
    ? [
        {
          label: 'Total Reservists',
          value: analyticsData.summary.totalReservists,
          icon: 'Users',
          color: 'info',
        },
        {
          label: 'NCO Eligible for Promotion',
          value: analyticsData.summary.ncoEligible,
          changeLabel: `of ${analyticsData.summary.ncoCount} NCO`,
          icon: 'Award',
          color: 'success',
        },
        {
          label: 'CO Eligible for Promotion',
          value: analyticsData.summary.coEligible,
          changeLabel: `of ${analyticsData.summary.coCount} CO`,
          icon: 'TrendingUp',
          color: 'primary',
        },
        {
          label: 'Average Training Hours',
          value: analyticsData.summary.averageTrainingHours.toFixed(1),
          icon: 'GraduationCap',
          color: 'info',
        },
        {
          label: 'Need More Training',
          value: analyticsData.summary.reservistsNeedingMoreTraining,
          icon: 'AlertCircle',
          color: 'warning',
        },
        {
          label: 'Need More Camp Duty',
          value: analyticsData.summary.reservistsNeedingMoreCampDuty,
          icon: 'Calendar',
          color: 'danger',
        },
      ]
    : [];

  if (error) {
    return (
      <div>
        <PageHeader
          title="Analytics"
          description="AI-powered promotion recommendations and insights"
          breadcrumbs={[{ label: 'Dashboard', href: '/admin' }, { label: 'Analytics' }]}
        />
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-800">{error}</p>
          <Button onClick={fetchAnalyticsData} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Analytics"
        description="AI-powered promotion recommendations and insights"
        breadcrumbs={[{ label: 'Dashboard', href: '/admin' }, { label: 'Analytics' }]}
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-xl h-32 animate-pulse"></div>
            ))
          : stats.map((stat, index) => <StatCard key={index} data={stat} />)}
      </div>

      {/* AI Insights Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-navy-900">AI-Powered Insights</h3>
            <p className="text-sm text-gray-600">
              Generate prescriptive recommendations using Gemini AI
            </p>
          </div>
          <Button
            onClick={generateAIInsights}
            disabled={loading || insightsLoading || !analyticsData}
            className="flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            {insightsLoading ? 'Generating...' : 'Generate AI Insights'}
          </Button>
        </div>

        <AIInsightsCard
          insights={aiInsights?.insights || null}
          loading={insightsLoading}
        />
      </div>

      {/* Company Breakdown */}
      {analyticsData && analyticsData.companyBreakdown.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-bold text-navy-900 mb-4">Company Performance</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {analyticsData.companyBreakdown.map((company) => (
              <div
                key={company.company}
                className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-bold text-navy-900">{company.company}</h4>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-navy-900">
                      {company.averageReadinessScore}
                    </div>
                    <div className="text-xs text-gray-500">Avg Score</div>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Reservists:</span>
                    <span className="font-semibold text-navy-900">{company.totalReservists}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Eligible:</span>
                    <span className="font-semibold text-green-600">{company.eligibleCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg Training:</span>
                    <span className="font-semibold text-navy-900">
                      {company.averageTrainingHours} hrs
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg Camp Duty:</span>
                    <span className="font-semibold text-navy-900">
                      {company.averageCampDutyDays} days
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Eligibility Table */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-navy-900 mb-4">Detailed Eligibility Analysis</h3>
        <PromotionEligibilityTable
          data={analyticsData?.data || []}
          loading={loading}
        />
      </div>
    </div>
  );
}
