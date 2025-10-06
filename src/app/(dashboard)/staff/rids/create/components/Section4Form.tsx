'use client';

import React from 'react';

interface Section4FormProps {
  initialData?: any;
  onChange: (data: any) => void;
}

export function Section4Form({ initialData, onChange }: Section4FormProps) {
  return (
    <div className="space-y-6">
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Section 4: Military Training</h3>
        <p className="text-gray-600 mb-4">
          This section will track military training, seminars, and schooling.
        </p>
        <p className="text-sm text-gray-500 italic">
          Optional - Can be filled later. Click "Next" to continue.
        </p>
      </div>
    </div>
  );
}
