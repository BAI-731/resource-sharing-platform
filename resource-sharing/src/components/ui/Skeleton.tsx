import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  className,
  variant = 'rectangular',
  width,
  height,
  ...props
}: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-gray-200';

  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-lg',
  };

  const style: React.CSSProperties = {
    width: width || '100%',
    height: height || (variant === 'text' ? '1rem' : '40px'),
  };

  return (
    <div
      className={cn(baseClasses, variantClasses[variant], className)}
      style={style}
      {...props}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm">
      <Skeleton variant="rounded" height={200} className="w-full" />
      <div className="p-4 space-y-3">
        <Skeleton variant="text" width="80%" />
        <Skeleton variant="text" width="60%" />
        <div className="flex justify-between items-center">
          <Skeleton variant="text" width="40%" />
          <Skeleton variant="circular" width={24} height={24} />
        </div>
      </div>
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <Skeleton variant="rounded" height={400} className="w-full" />
        <div className="p-6 md:p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1 space-y-3">
              <Skeleton variant="text" width="30%" />
              <Skeleton variant="text" width="80%" height={32} />
            </div>
            <Skeleton variant="text" width="30%" height={40} />
          </div>

          <div className="flex flex-wrap gap-4 py-6 border-b">
            <Skeleton variant="text" width={120} />
            <Skeleton variant="text" width={150} />
            <Skeleton variant="text" width={140} />
          </div>

          <div className="space-y-3">
            <Skeleton variant="text" width={100} height={24} />
            <Skeleton variant="text" width="100%" />
            <Skeleton variant="text" width="100%" />
            <Skeleton variant="text" width="80%" />
          </div>

          <div className="bg-gradient-to-br from-primary/5 to-primary-light/10 rounded-xl p-6 space-y-3">
            <Skeleton variant="text" width={100} height={24} />
            <Skeleton variant="text" width="60%" />
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Skeleton variant="rounded" height={48} className="flex-1" />
            <Skeleton variant="rounded" height={48} className="flex-1" />
            <Skeleton variant="rounded" height={48} className="flex-1" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl p-6 shadow-sm space-y-3">
          <div className="flex justify-between">
            <Skeleton variant="text" width="40%" />
            <Skeleton variant="circular" width={20} height={20} />
          </div>
          <Skeleton variant="text" width="70%" />
          <Skeleton variant="text" width="50%" />
          <div className="flex gap-2 pt-2">
            <Skeleton variant="rounded" width={80} height={32} />
            <Skeleton variant="rounded" width={80} height={32} />
          </div>
        </div>
      ))}
    </div>
  );
}
