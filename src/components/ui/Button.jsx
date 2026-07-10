import React from 'react';

export function Button({ 
  children, 
  variant = 'primary', 
  className = '', 
  onClick, 
  disabled = false,
  type = 'button'
}) {
  const baseClasses = "font-bold rounded-xl border-4 border-black px-6 py-3 transition-transform active:translate-y-1";
  
  const variants = {
    primary: "bg-green-400 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px]",
    secondary: "bg-orange-400 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px]",
    danger: "bg-red-500 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px]",
    ghost: "bg-transparent border-transparent text-gray-700 hover:bg-gray-100"
  };

  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed transform-none shadow-none" : "";

  return (
    <button
      type={type}
      className={`${baseClasses} ${variants[variant]} ${disabledClasses} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
