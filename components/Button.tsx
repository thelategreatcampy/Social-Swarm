import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'neon';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  loading = false,
  className = '',
  ...props 
}) => {
  // Base: Uppercase, tracking wide, chamfered edges (clip-path or skew), mono font
  const baseStyles = "relative inline-flex items-center justify-center font-mono font-bold tracking-widest uppercase transition-all duration-200 focus:outline-none group overflow-hidden skew-x-[-10deg] border-2";
  
  // To un-skew the text inside
  const contentStyle = "skew-x-[10deg]";

  const variants = {
    primary: "bg-neon-green border-neon-green text-cyber-black hover:bg-transparent hover:text-neon-green hover:shadow-[0_0_15px_rgba(57,255,20,0.5)]",
    secondary: "bg-cyber-gray border-cyber-gray text-gray-300 hover:bg-gray-700 hover:border-gray-600 hover:text-white",
    outline: "bg-transparent border-neon-blue text-neon-blue hover:bg-neon-blue hover:text-cyber-black hover:shadow-[0_0_15px_rgba(0,243,255,0.5)]",
    danger: "bg-transparent border-neon-red text-neon-red hover:bg-neon-red hover:text-black hover:shadow-[0_0_15px_rgba(255,42,42,0.5)]",
    neon: "bg-neon-pink border-neon-pink text-black hover:bg-transparent hover:text-neon-pink hover:shadow-[0_0_20px_rgba(255,0,255,0.6)]"
  };

  const sizes = {
    sm: "px-4 py-1 text-xs",
    md: "px-6 py-2 text-sm",
    lg: "px-8 py-4 text-base"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${loading ? 'opacity-70 cursor-not-allowed' : ''} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      <span className={`flex items-center gap-2 ${contentStyle}`}>
        {loading ? (
           <Loader2 className="animate-spin" size={16} />
        ) : null}
        {children}
      </span>
    </button>
  );
};