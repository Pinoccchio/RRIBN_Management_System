import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = false,
}) => {
  const hoverStyles = hover
    ? 'transition-all duration-300 hover:shadow-2xl hover:-translate-y-2'
    : '';

  return (
    <div className={`bg-white rounded-lg shadow-lg ${hoverStyles} ${className}`}>
      {children}
    </div>
  );
};
