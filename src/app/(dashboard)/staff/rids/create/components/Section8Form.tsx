'use client';

import React from 'react';

interface Section8FormProps {
  initialData?: any;
  onChange: (data: any) => void;
}

export function Section8Form({ initialData, onChange }: Section8FormProps) {
  return (
    <div className="space-y-6">
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Section 8: Active Duty Training</h3>
        <p className="text-gray-600 mb-4">
          This section will track CAD/OJT/ADT records.
        </p>
        <p className="text-sm text-gray-500 italic">
          Optional - Can be filled later. Click "Next" to continue.
        </p>
      </div>
    </div>
  );
}
