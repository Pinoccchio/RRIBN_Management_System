'use client';

import React from 'react';

interface Section11_12FormProps {
  initialData?: any;
  onChange: (data: any) => void;
  ridsId?: string;
}

export function Section11_12Form({ initialData, onChange, ridsId }: Section11_12FormProps) {
  return (
    <div className="space-y-6">
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Section 11-12: Biometrics & Documents</h3>
        <p className="text-gray-600 mb-4">
          This section will allow uploading of photo, thumbmark, and signature.
        </p>
        <p className="text-sm text-gray-500 italic">
          Optional - Can be filled later. Click "Submit RIDS" to complete.
        </p>
      </div>
    </div>
  );
}
