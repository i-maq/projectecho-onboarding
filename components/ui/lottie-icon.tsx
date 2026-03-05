'use client';

import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from './loading-spinner';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

interface LottieIconProps {
  animationData: any;
  size?: number;
  loop?: boolean;
  autoplay?: boolean;
  className?: string;
}

export function LottieIcon({
  animationData,
  size = 48,
  loop = true,
  autoplay = true,
  className,
}: LottieIconProps) {
  if (!animationData) {
    return (
      <div
        className={cn('flex items-center justify-center', className)}
        style={{ width: size, height: size }}
      >
        <LoadingSpinner size="sm" />
      </div>
    );
  }

  return (
    <div
      className={cn('flex items-center justify-center', className)}
      style={{ width: size, height: size }}
    >
      <Lottie
        animationData={animationData}
        loop={loop}
        autoplay={autoplay}
        style={{ width: size, height: size }}
      />
    </div>
  );
}
