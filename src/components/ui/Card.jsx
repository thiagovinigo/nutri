import React from 'react';

export function Card({ children, className = '', noPadding = false }) {
  return (
    <div className={`bg-white border-4 border-black rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden ${noPadding ? '' : 'p-6'} ${className}`}>
      {children}
    </div>
  );
}
