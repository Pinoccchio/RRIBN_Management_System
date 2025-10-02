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
  label?: string;
  error?: string;
  helperText?: string;
}

export function Select({
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  className = '',
  disabled = false,
  label,
  error,
  helperText,
}: SelectProps) {
  const inputId = React.useId();

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-semibold text-navy-900 mb-2"
        >
          {label}
        </label>
      )}

      <div className={`relative ${className}`}>
        <select
          id={inputId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`
            block w-full px-4 py-3 pr-10
            border-2 rounded-lg
            bg-white text-navy-900 font-medium
            transition-all duration-300
            appearance-none
            ${
              error
                ? 'border-error focus:border-error focus:ring-4 focus:ring-error/20 shadow-sm'
                : 'border-gray-300 focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/30 hover:border-gray-400'
            }
            focus:outline-none focus:shadow-yellow-glow
            ${disabled ? 'opacity-60 cursor-not-allowed bg-gray-100' : 'cursor-pointer'}
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
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
          <ChevronDown className="w-5 h-5" />
        </div>
      </div>

      {error && (
        <p className="mt-2 text-sm text-error font-medium flex items-center gap-1">
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}

      {helperText && !error && (
        <p className="mt-2 text-sm text-gray-600">{helperText}</p>
      )}
    </div>
  );
}
