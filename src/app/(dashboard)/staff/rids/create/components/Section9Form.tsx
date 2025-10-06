'use client';

import React from 'react';

interface Section9FormProps {
  initialData?: any;
  onChange: (data: any) => void;
}

export function Section9Form({ initialData, onChange }: Section9FormProps) {
  return (
    <div className="space-y-6">
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Section 9: Unit Assignments</h3>
        <p className="text-gray-600 mb-4">
          This section will track unit assignment history.
        </p>
        <p className="text-sm text-gray-500 italic">
          Optional - Can be filled later. Click "Next" to continue.
        </p>
      </div>
    </div>
  );
}
