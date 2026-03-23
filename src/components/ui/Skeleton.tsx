import React from 'react';
interface SkeletonProps {
  variant?: 'line' | 'row' | 'card';
  className?: string;
}
export function Skeleton({ variant = 'line', className = '' }: SkeletonProps) {
  const baseStyles = 'animate-pulse bg-zinc-200 dark:bg-zinc-800 rounded';
  const variants = {
    line: 'h-4 w-full',
    row: 'h-12 w-full',
    card: 'h-32 w-full rounded-lg'
  };
  return <div className={`${baseStyles} ${variants[variant]} ${className}`} />;
}