'use client';

import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  onClick,
  href,
  disabled = false,
  loading = false,
  type = 'button',
  fullWidth = false,
  leftIcon,
  rightIcon,
}) => {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-300 rounded-lg focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none';

  const variantStyles = {
    primary: 'bg-yellow-500 hover:bg-yellow-600 text-navy-900 shadow-military hover:shadow-military-lg focus:ring-yellow-500/30 active:scale-95',
    secondary: 'bg-navy-800 hover:bg-navy-700 text-white shadow-military hover:shadow-military-lg focus:ring-navy-500/30 active:scale-95',
    outline: 'border-2 border-yellow-500 text-yellow-600 hover:bg-yellow-50 focus:ring-yellow-500/30 active:scale-95',
    ghost: 'text-navy-900 hover:bg-gray-100 focus:ring-gray-300/30 active:scale-95',
    danger: 'bg-error hover:bg-error-dark text-white shadow-military hover:shadow-military-lg focus:ring-error/30 active:scale-95',
    success: 'bg-success hover:bg-success-dark text-white shadow-military hover:shadow-military-lg focus:ring-success/30 active:scale-95',
  };

  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  const classes = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`;

  const isDisabled = disabled || loading;

  const content = (
    <>
      {loading && (
        <LoadingSpinner
          size="sm"
          color={variant === 'primary' ? 'navy' : 'primary'}
        />
      )}
      {!loading && leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
      <span>{children}</span>
      {!loading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
    </>
  );

  if (href && !isDisabled) {
    return (
      <a href={href} className={classes}>
        {content}
      </a>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={classes}
    >
      {content}
    </button>
  );
};
