'use client';

import React from 'react';

interface Section10FormProps {
  initialData?: any;
  onChange: (data: any) => void;
}

export function Section10Form({ initialData, onChange }: Section10FormProps) {
  return (
    <div className="space-y-6">
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Section 10: Designations</h3>
        <p className="text-gray-600 mb-4">
          This section will track position/designation history.
        </p>
        <p className="text-sm text-gray-500 italic">
          Optional - Can be filled later. Click "Next" to continue.
        </p>
      </div>
    </div>
  );
}
