import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { RefreshCw } from 'lucide-react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
  className?: string;
  threshold?: number;
  disabled?: boolean;
}

export function PullToRefresh({
  onRefresh,
  children,
  className,
  threshold = 80,
  disabled = false,
}: PullToRefreshProps) {
  const [pulling, setPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef<number>(0);
  const currentY = useRef<number>(0);

  useEffect(() => {
    if (!containerRef.current || disabled) return;

    const container = containerRef.current;

    const handleTouchStart = (e: TouchEvent) => {
      if (container.scrollTop === 0) {
        startY.current = e.touches[0].clientY;
        currentY.current = e.touches[0].clientY;
        setPulling(true);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!pulling || refreshing) return;

      currentY.current = e.touches[0].clientY;
      const distance = Math.min((currentY.current - startY.current) * 0.5, threshold * 1.5);
      setPullDistance(distance);
    };

    const handleTouchEnd = async () => {
      if (!pulling || refreshing) return;

      if (pullDistance >= threshold) {
        setRefreshing(true);
        setPullDistance(threshold);
        try {
          await onRefresh();
        } finally {
          setPullDistance(0);
          setPulling(false);
          setRefreshing(false);
        }
      } else {
        setPullDistance(0);
        setPulling(false);
      }
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [pulling, pullDistance, refreshing, onRefresh, threshold, disabled]);

  const pullProgress = Math.min(pullDistance / threshold, 1);
  const rotation = pullProgress * 360;

  return (
    <div ref={containerRef} className={cn('relative overflow-hidden', className)}>
      {/* 下拉提示器 */}
      <div
        className="absolute left-0 right-0 flex flex-col items-center justify-center transition-transform duration-300 pointer-events-none"
        style={{
          transform: `translateY(${Math.max(pullDistance - threshold, -threshold)}px)`,
          opacity: pullProgress,
        }}
      >
        <div
          className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2 transition-transform duration-300"
          style={{ transform: `rotate(${refreshing ? rotation : 0}deg)` }}
        >
          <RefreshCw className={cn('w-6 h-6 text-primary', refreshing && 'animate-spin')} />
        </div>
        <p className="text-sm text-gray-500">
          {refreshing ? '正在刷新...' : pullDistance >= threshold ? '释放立即刷新' : '下拉刷新'}
        </p>
      </div>

      {/* 内容区域 */}
      <div
        className="transition-transform duration-300"
        style={{ transform: `translateY(${Math.max(pullDistance, 0)}px)` }}
      >
        {children}
      </div>
    </div>
  );
}
