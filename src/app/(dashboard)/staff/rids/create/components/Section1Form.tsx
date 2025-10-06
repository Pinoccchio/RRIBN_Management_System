'use client';

import React, { useEffect } from 'react';

interface Section1Data {
  rank?: string;
  afpsn?: string;
  br_svc?: string;
  mos?: string;
  source_of_commission?: string;
  initial_rank?: string;
  date_of_commission?: string;
  commission_authority?: string;
  mobilization_center?: string;
  designation?: string;
  squad_team_section?: string;
  platoon?: string;
  battalion_brigade?: string;
  company?: string;
  combat_shoes_size?: string;
  cap_size?: string;
  bda_size?: string;
}

interface Section1FormProps {
  initialData?: Section1Data;
  reservistData?: {
    rank?: string;
    company?: string;
    section?: string;
  };
  onChange: (data: Section1Data) => void;
}

export function Section1Form({ initialData, reservistData, onChange }: Section1FormProps) {
  // Auto-populate from reservist data on mount
  useEffect(() => {
    if (reservistData && !initialData) {
      onChange({
        rank: reservistData.rank || '',
        company: reservistData.company || '',
        squad_team_section: reservistData.section || '',
      });
    }
  }, [reservistData, initialData, onChange]);

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-blue-900">Section 1: Personnel Information</p>
            <p className="text-sm text-blue-700 mt-1">
              This section is auto-populated from the reservist's profile. Review and verify the information is correct.
            </p>
          </div>
        </div>
      </div>

      {/* Read-Only Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">Rank</label>
          <p className="text-base text-navy-900">{initialData?.rank || reservistData?.rank || 'Not specified'}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
          <p className="text-base text-navy-900">{initialData?.company || reservistData?.company || 'Not specified'}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">AFPSN</label>
          <p className="text-base text-navy-900">{initialData?.afpsn || 'Not specified'}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">Branch of Service</label>
          <p className="text-base text-navy-900">{initialData?.br_svc || 'Not specified'}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">MOS</label>
          <p className="text-base text-navy-900">{initialData?.mos || 'Not specified'}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">Source of Commission</label>
          <p className="text-base text-navy-900">{initialData?.source_of_commission || 'Not specified'}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">Initial Rank</label>
          <p className="text-base text-navy-900">{initialData?.initial_rank || 'Not specified'}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">Date of Commission</label>
          <p className="text-base text-navy-900">{initialData?.date_of_commission || 'Not specified'}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">Commission Authority</label>
          <p className="text-base text-navy-900">{initialData?.commission_authority || 'Not specified'}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">Mobilization Center</label>
          <p className="text-base text-navy-900">{initialData?.mobilization_center || 'Not specified'}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">Designation</label>
          <p className="text-base text-navy-900">{initialData?.designation || 'Not specified'}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">Squad/Team/Section</label>
          <p className="text-base text-navy-900">{initialData?.squad_team_section || reservistData?.section || 'Not specified'}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">Platoon</label>
          <p className="text-base text-navy-900">{initialData?.platoon || 'Not specified'}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">Battalion/Brigade</label>
          <p className="text-base text-navy-900">{initialData?.battalion_brigade || 'Not specified'}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">Combat Shoes Size</label>
          <p className="text-base text-navy-900">{initialData?.combat_shoes_size || 'Not specified'}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">Cap Size</label>
          <p className="text-base text-navy-900">{initialData?.cap_size || 'Not specified'}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">BDA Size</label>
          <p className="text-base text-navy-900">{initialData?.bda_size || 'Not specified'}</p>
        </div>
      </div>

      {/* Note */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-yellow-900">Note</p>
            <p className="text-sm text-yellow-700 mt-1">
              To update this information, you need to edit the reservist's profile in the Reservists management section.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
