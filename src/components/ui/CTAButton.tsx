"use client";

import { cn } from "@/lib/utils";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

interface CTAButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  showArrow?: boolean;
  showShimmer?: boolean;
  className?: string;
  disabled?: boolean;
}

export function CTAButton({
  children,
  href,
  onClick,
  variant = 'primary',
  size = 'md',
  showArrow = true,
  showShimmer = true,
  className,
  disabled = false,
}: CTAButtonProps) {
  const baseClasses = "group relative inline-flex items-center gap-3 font-bold rounded-lg overflow-hidden transition-all duration-300 transform disabled:cursor-not-allowed disabled:opacity-50";
  
  const variantClasses = {
    primary: "bg-linear-to-r from-cyan-500 to-blue-600 text-white hover:shadow-2xl hover:shadow-cyan-500/50 hover:scale-105",
    secondary: "bg-linear-to-r from-purple-500 to-pink-600 text-white hover:shadow-2xl hover:shadow-purple-500/50 hover:scale-105",
    ghost: "border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black hover:shadow-xl hover:shadow-cyan-400/50"
  };
  
  const sizeClasses = {
    sm: "px-6 py-3 text-sm",
    md: "px-8 py-4 text-lg",
    lg: "px-10 py-5 text-xl"
  };

  const shimmerEffect = showShimmer ? (
    <span className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
  ) : null;

  const content = (
    <>
      {shimmerEffect}
      <span className="relative z-10 flex items-center gap-3">
        {children}
        {showArrow && (
          <ArrowRightIcon className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
        )}
      </span>
    </>
  );

  const classes = cn(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    className
  );

  if (href && !disabled) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={classes}
    >
      {content}
    </button>
  );
}

export default CTAButton;