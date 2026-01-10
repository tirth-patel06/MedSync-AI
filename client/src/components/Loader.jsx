import React from 'react';

const Loader = ({ 
  size = 'md', 
  color = 'orange', 
  className = '',
  fullScreen = false
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-4',
    lg: 'w-12 h-12 border-4',
    xl: 'w-16 h-16 border-4'
  };

  const colorClasses = {
    orange: 'border-orange-500',
    blue: 'border-blue-500',
    purple: 'border-purple-500',
    white: 'border-white',
    slate: 'border-slate-500'
  };

  const spinner = (
    <div 
      className={`
        rounded-full 
        border-t-transparent 
        animate-spin 
        ${sizeClasses[size] || sizeClasses.md} 
        ${colorClasses[color] || colorClasses.orange} 
        ${className}
      `}
    />
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default Loader;
