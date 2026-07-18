'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import gsap from 'gsap';

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [displayChildren, setDisplayChildren] = useState(children);

  // Top loading bar progress
  useEffect(() => {
    if (!progressRef.current) return;

    // Trigger page loading indicator animation
    const tl = gsap.timeline();
    tl.to(progressRef.current, {
      width: '70%',
      duration: 0.35,
      ease: 'power2.out',
    })
    .to(progressRef.current, {
      width: '100%',
      duration: 0.25,
      ease: 'power2.inOut',
      onComplete: () => {
        gsap.to(progressRef.current, {
          opacity: 0,
          duration: 0.15,
          onComplete: () => {
            gsap.set(progressRef.current, { width: '0%', opacity: 1 });
          }
        });
      }
    });

    // Content fade/slide in animation using GSAP
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out', delay: 0.05 }
      );
    }

    setDisplayChildren(children);
  }, [pathname, searchParams, children]);

  return (
    <div className="relative w-full h-full">
      {/* Top glowing progress bar */}
      <div 
        ref={progressRef} 
        className="fixed top-0 left-0 h-[3px] bg-gradient-to-r from-primary via-brass to-emerald z-50 shadow-[0_0_10px_rgba(15,92,87,0.6)]" 
        style={{ width: '0%' }}
      />
      <div ref={containerRef} className="w-full h-full">
        {displayChildren}
      </div>
    </div>
  );
}
