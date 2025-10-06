import React from 'react';
import { Card } from '@/components/ui/Card';
import { Sparkles, TrendingUp, AlertTriangle, Users, Trophy, Target } from 'lucide-react';
import type { AIInsightsResponse } from '@/lib/types/analytics';

interface AIInsightsCardProps {
  insights: AIInsightsResponse | null;
  loading?: boolean;
}

export const AIInsightsCard: React.FC<AIInsightsCardProps> = ({ insights, loading }) => {
  if (loading) {
    return (
      <Card padding="lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Sparkles className="w-5 h-5 text-purple-600" />
          </div>
          <h3 className="text-lg font-bold text-navy-900">AI-Powered Insights</h3>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
        </div>
      </Card>
    );
  }

  if (!insights) {
    return (
      <Card padding="lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Sparkles className="w-5 h-5 text-purple-600" />
          </div>
          <h3 className="text-lg font-bold text-navy-900">AI-Powered Insights</h3>
        </div>
        <p className="text-gray-600">Generate AI insights to see recommendations and analysis.</p>
      </Card>
    );
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'recommendation':
        return Target;
      case 'gap_analysis':
        return AlertTriangle;
      case 'comparison':
        return TrendingUp;
      case 'priority':
        return Trophy;
      default:
        return Users;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Executive Summary */}
      <Card padding="lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Sparkles className="w-5 h-5 text-purple-600" />
          </div>
          <h3 className="text-lg font-bold text-navy-900">AI-Powered Insights</h3>
        </div>
        <p className="text-gray-700 leading-relaxed">{insights.summary}</p>
      </Card>

      {/* Key Insights */}
      {insights.keyInsights && insights.keyInsights.length > 0 && (
        <Card padding="lg">
          <h4 className="text-md font-bold text-navy-900 mb-4">Key Insights</h4>
          <div className="space-y-3">
            {insights.keyInsights.map((insight, index) => {
              const Icon = getInsightIcon(insight.type);
              return (
                <div key={index} className="flex gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex-shrink-0 mt-0.5">
                    <Icon className="w-5 h-5 text-navy-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h5 className="font-semibold text-navy-900">{insight.title}</h5>
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getPriorityColor(insight.priority)}`}
                      >
                        {insight.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{insight.content}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Top Promotion Candidates */}
      {insights.topCandidates && insights.topCandidates.length > 0 && (
        <Card padding="lg">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-yellow-600" />
            <h4 className="text-md font-bold text-navy-900">Top Promotion Candidates</h4>
          </div>
          <div className="space-y-3">
            {insights.topCandidates.map((candidate, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gradient-to-r from-yellow-50 to-transparent rounded-lg border border-yellow-100">
                <div className="flex-shrink-0 w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <p className="font-semibold text-navy-900">{candidate.name}</p>
                      <p className="text-sm text-gray-600">{candidate.rank} • {candidate.company}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-yellow-600">{candidate.readinessScore}</p>
                      <p className="text-xs text-gray-500">Score</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mt-2">{candidate.justification}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Training Gaps */}
      {insights.trainingGaps && insights.trainingGaps.length > 0 && (
        <Card padding="lg">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <h4 className="text-md font-bold text-navy-900">Training Gap Analysis</h4>
          </div>
          <div className="space-y-3">
            {insights.trainingGaps.map((gap, index) => (
              <div key={index} className="p-3 bg-orange-50 rounded-lg border border-orange-100">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-semibold text-navy-900">{gap.category}</h5>
                  <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                    {gap.reservistsAffected} affected
                  </span>
                </div>
                <p className="text-sm text-gray-700">{gap.recommendation}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Company Comparison */}
      {insights.companyComparison && (
        <Card padding="lg">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h4 className="text-md font-bold text-navy-900">Company Performance Comparison</h4>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="flex-1 p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-xs text-green-700 font-medium mb-1">Top Performing</p>
                <p className="text-lg font-bold text-green-900">{insights.companyComparison.topPerforming}</p>
              </div>
              <div className="flex-1 p-3 bg-red-50 rounded-lg border border-red-200">
                <p className="text-xs text-red-700 font-medium mb-1">Needs Improvement</p>
                <p className="text-lg font-bold text-red-900">{insights.companyComparison.needsImprovement}</p>
              </div>
            </div>
            <p className="text-sm text-gray-700 p-3 bg-gray-50 rounded-lg">{insights.companyComparison.insights}</p>
          </div>
        </Card>
      )}
    </div>
  );
};
