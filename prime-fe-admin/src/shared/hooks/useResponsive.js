import { useState, useEffect } from 'react';

/**
 * Tailwind CSS 브레이크포인트 기반 반응형 상태 훅
 *
 * 브레이크포인트:
 *   base  : < 640px  (스마트폰 세로)
 *   sm    : 640px+   (스마트폰 가로)
 *   md    : 768px+   (태블릿 세로)
 *   lg    : 1024px+  (태블릿 가로 / 소형 데스크톱)
 *   xl    : 1280px+  (데스크톱)
 */
export function useResponsive() {
  const [breakpoint, setBreakpoint] = useState(() => {
    if (typeof window === 'undefined') return 'xl';
    const w = window.innerWidth;
    if (w >= 1280) return 'xl';
    if (w >= 1024) return 'lg';
    if (w >= 768) return 'md';
    if (w >= 640) return 'sm';
    return 'base';
  });

  useEffect(() => {
    const queries = {
      sm: window.matchMedia('(min-width: 640px)'),
      md: window.matchMedia('(min-width: 768px)'),
      lg: window.matchMedia('(min-width: 1024px)'),
      xl: window.matchMedia('(min-width: 1280px)'),
    };

    // 모든 media query를 한 번에 평가해서 현재 브레이크포인트를 계산한다.
    const update = () => {
      if (queries.xl.matches) setBreakpoint('xl');
      else if (queries.lg.matches) setBreakpoint('lg');
      else if (queries.md.matches) setBreakpoint('md');
      else if (queries.sm.matches) setBreakpoint('sm');
      else setBreakpoint('base');
    };

    update();
    Object.values(queries).forEach((q) => q.addEventListener('change', update));
    return () =>
      Object.values(queries).forEach((q) => q.removeEventListener('change', update));
  }, []);

  return {
    breakpoint,
    isMobile: breakpoint === 'base' || breakpoint === 'sm',   // < 768px
    isTablet: breakpoint === 'md',                             // 768~1023px
    isDesktop: breakpoint === 'lg' || breakpoint === 'xl',    // 1024px+
  };
}
