'use client';

import React from 'react';

interface Section6FormProps {
  initialData?: any;
  onChange: (data: any) => void;
}

export function Section6Form({ initialData, onChange }: Section6FormProps) {
  return (
    <div className="space-y-6">
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Section 6: Dependents</h3>
        <p className="text-gray-600 mb-4">
          This section will track family dependents.
        </p>
        <p className="text-sm text-gray-500 italic">
          Optional - Can be filled later. Click "Next" to continue.
        </p>
      </div>
    </div>
  );
}
