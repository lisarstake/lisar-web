import * as React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', className = '', ...props }) => {
  const base = 'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none';
  const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
    primary: 'bg-[#C7EF6B] text-black hover:bg-[#B8E55A]',
    secondary: 'bg-[#1a1a1a] text-white hover:bg-[#2a2a2a] border border-[#2a2a2a]',
    ghost: 'bg-transparent text-white hover:bg-[#1a1a1a] border border-transparent',
  };
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
};
