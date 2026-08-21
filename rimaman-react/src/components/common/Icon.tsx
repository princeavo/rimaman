import React from 'react';

interface IconProps {
  name: string;
  className?: string;
  filled?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Icon: React.FC<IconProps> = ({ 
  name, 
  className = '', 
  filled = false,
  size = 'md' 
}) => {
  const sizes = {
    sm: 'text-base',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-5xl',
  };

  const fillStyle = filled ? { fontVariationSettings: "'FILL' 1" } : {};
  
  return (
    <span 
      className={`material-symbols-outlined ${sizes[size]} ${className}`}
      style={fillStyle}
    >
      {name}
    </span>
  );
};
