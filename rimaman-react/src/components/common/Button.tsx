import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  icon?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  icon,
  className = '',
  ...props
}) => {
  const baseStyles = 'font-semibold rounded-full transition-colors duration-200 inline-flex items-center justify-center gap-2';

  const variants = {
    primary: 'bg-primary text-on-primary hover:bg-primary-container active:bg-primary shadow-sm',
    secondary: 'bg-secondary-container text-on-secondary-container hover:bg-secondary-fixed shadow-sm',
    outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-on-primary',
    ghost: 'text-primary hover:bg-primary/10',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-10 py-4 text-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {icon && <span className="material-symbols-outlined text-inherit">{icon}</span>}
      {children}
    </button>
  );
};
