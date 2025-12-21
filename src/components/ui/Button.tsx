import React from 'react';
import clsx from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'success';
    size?: 'sm' | 'md' | 'lg';
}

const Button: React.FC<ButtonProps> = ({ 
    children, 
    className, 
    variant = 'primary', 
    size = 'md', 
    ...props 
}) => {
    const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md active:scale-[0.98]";
    
    const variants = {
        primary: "text-[#EBE0C0] hover:opacity-90 focus:ring-[#242A2A]",
        secondary: "bg-[#EBE0C0] text-[#242A2A] hover:bg-[#D4C9A8] focus:ring-[#EBE0C0]",
        danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
        success: "bg-[#242A2A] text-[#EBE0C0] hover:bg-[#3A4242] focus:ring-[#242A2A] border-2 border-[#EBE0C0]",
    };

    const sizes = {
        sm: "px-2.5 py-1.5 text-xs sm:text-sm",
        md: "px-3 py-2 text-sm sm:text-base",
        lg: "px-4 py-2.5 sm:px-6 sm:py-3 text-base sm:text-lg",
    };

    const getPrimaryBg = variant === 'primary' ? { backgroundColor: '#242A2A' } : {};

    return (
        <button 
            className={clsx(baseStyles, variants[variant], sizes[size], className)} 
            style={getPrimaryBg}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
