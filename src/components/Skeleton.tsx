import React from 'react';

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export const Skeleton = ({ className, style }: SkeletonProps) => (
  <div 
    className={`animate-pulse rounded-xl ${className || ''}`} 
    style={{ 
      background: 'rgba(255, 255, 255, 0.05)',
      ...style 
    }} 
  />
);
