'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function Select({
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  className = '',
  disabled = false,
}: SelectProps) {
  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`
          block w-full px-4 py-2 pr-10
          border border-gray-300 rounded-lg
          bg-white
          focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500
          transition-colors
          appearance-none
          ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'cursor-pointer'}
        `}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <ChevronDown className="w-5 h-5 text-gray-400" />
      </div>
    </div>
  );
}
