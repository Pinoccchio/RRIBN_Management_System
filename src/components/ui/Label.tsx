import React from 'react';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  children: React.ReactNode;
}

export const Label: React.FC<LabelProps> = ({
  required = false,
  children,
  className = '',
  ...props
}) => {
  return (
    <label
      className={`block text-sm font-medium text-gray-700 mb-2 ${className}`}
      {...props}
    >
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
};
