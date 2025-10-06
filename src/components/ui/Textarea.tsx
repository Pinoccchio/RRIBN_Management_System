'use client';

import React, { forwardRef, useId } from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  containerClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      containerClassName = '',
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const textareaId = id || generatedId;

    return (
      <div className={`w-full ${containerClassName}`}>
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-semibold text-navy-900 mb-2"
          >
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          className={`
            w-full px-4 py-3 rounded-lg border-2 transition-all duration-300
            ${
              error
                ? 'border-error focus:border-error focus:ring-4 focus:ring-error/20 shadow-sm'
                : 'border-gray-300 focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/30 hover:border-gray-400'
            }
            focus:outline-none focus:shadow-yellow-glow
            disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60
            placeholder:text-gray-400
            bg-white text-navy-900 font-medium
            resize-y
            ${className}
          `}
          {...props}
        />

        {error && (
          <p className="mt-2 text-sm text-error font-medium flex items-center gap-1">
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
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
);

Textarea.displayName = 'Textarea';
