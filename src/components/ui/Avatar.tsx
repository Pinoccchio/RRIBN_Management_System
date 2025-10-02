import React from 'react';
import { cn, getInitials, stringToColor } from '@/lib/design-system/utils';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  firstName?: string;
  lastName?: string;
  size?: AvatarSize;
  className?: string;
  ring?: boolean;
  online?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  firstName = '',
  lastName = '',
  size = 'md',
  className = '',
  ring = false,
  online = false,
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl',
  };

  const initials = getInitials(firstName, lastName);
  const bgColor = stringToColor(initials);

  return (
    <div className={cn('relative inline-block', className)}>
      <div
        className={cn(
          'rounded-full flex items-center justify-center font-semibold overflow-hidden',
          sizeClasses[size],
          ring && 'ring-2 ring-yellow-500 ring-offset-2',
          'transition-all duration-200'
        )}
        style={{ backgroundColor: src ? 'transparent' : bgColor }}
      >
        {src ? (
          <img
            src={src}
            alt={alt || `${firstName} ${lastName}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-white select-none">{initials}</span>
        )}
      </div>

      {/* Online indicator */}
      {online && (
        <span
          className={cn(
            'absolute bottom-0 right-0 block rounded-full bg-green-500 ring-2 ring-white',
            size === 'xs' && 'w-1.5 h-1.5',
            size === 'sm' && 'w-2 h-2',
            size === 'md' && 'w-2.5 h-2.5',
            size === 'lg' && 'w-3 h-3',
            (size === 'xl' || size === '2xl') && 'w-4 h-4'
          )}
        />
      )}
    </div>
  );
};

// Avatar Group Component
interface AvatarGroupProps {
  children: React.ReactNode;
  max?: number;
  size?: AvatarSize;
  className?: string;
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  children,
  max = 3,
  size = 'md',
  className = '',
}) => {
  const childArray = React.Children.toArray(children);
  const displayChildren = childArray.slice(0, max);
  const remaining = Math.max(0, childArray.length - max);

  const sizeClasses = {
    xs: 'w-6 h-6 text-xs -ml-2',
    sm: 'w-8 h-8 text-sm -ml-2',
    md: 'w-10 h-10 text-base -ml-3',
    lg: 'w-12 h-12 text-lg -ml-3',
    xl: 'w-16 h-16 text-xl -ml-4',
    '2xl': 'w-20 h-20 text-2xl -ml-5',
  };

  return (
    <div className={cn('flex items-center', className)}>
      {displayChildren.map((child, index) => (
        <div
          key={index}
          className={cn(
            'relative ring-2 ring-white rounded-full',
            index > 0 && sizeClasses[size]
          )}
        >
          {child}
        </div>
      ))}

      {remaining > 0 && (
        <div
          className={cn(
            'rounded-full bg-gray-200 flex items-center justify-center font-semibold text-gray-700 ring-2 ring-white',
            sizeClasses[size]
          )}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
};
