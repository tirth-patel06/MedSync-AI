import React from 'react';
import Loader from './Loader';

const Button = ({
    children,
    isLoading = false,
    disabled = false,
    className = '',
    variant = 'primary',
    type = 'button',
    onClick,
    ...props
}) => {
    const baseClasses = "relative flex items-center justify-center rounded-xl transition-all font-medium focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white shadow-lg",
        secondary: "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700",
        outline: "bg-transparent border border-slate-600 text-slate-400 hover:text-white hover:border-slate-400",
        danger: "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg",
        success: "bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white shadow-lg",
        ghost: "bg-transparent hover:bg-slate-800/50 text-slate-400 hover:text-white"
    };

    const sizeClasses = "px-6 py-3"; // Default padding, can be overridden by className

    return (
        <button
            type={type}
            className={`${baseClasses} ${variants[variant] || variants.primary} ${sizeClasses} ${className}`}
            disabled={disabled || isLoading}
            onClick={onClick}
            {...props}
        >
            {isLoading && (
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <Loader size="sm" color="white" />
                </span>
            )}
            <span className={`flex items-center space-x-2 ${isLoading ? 'invisible' : ''}`}>
                {children}
            </span>
        </button>
    );
};

export default Button;
