'use client';

import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  activeColor?: string;
  inactiveColor?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

export function StarRating({
  rating,
  maxRating = 5,
  size = 'md',
  activeColor = 'text-accent',
  inactiveColor = 'text-muted-foreground',
}: StarRatingProps) {
  return (
    <div className="flex gap-1" role="img" aria-label={`${rating} out of ${maxRating} stars`}>
      {[...Array(maxRating)].map((_, i) => (
        <Star
          key={i}
          className={`${sizeClasses[size]} ${
            i < rating ? activeColor : inactiveColor
          }`}
          fill={i < rating ? "currentColor" : "none"}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}
