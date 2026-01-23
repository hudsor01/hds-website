'use client';

import { ArrowUp } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let ticking = false;
    let rafId: number | null = null;

    const toggleVisibility = () => {
      const scrollY = window.scrollY;
      const shouldShow = scrollY > 200;

      // Use callback form of setState to avoid stale closure
      // This prevents needing isVisible in the dependency array
      setIsVisible((prev) => {
        if (prev !== shouldShow) {return shouldShow;}
        return prev; // No update needed
      });

      ticking = false;
    };

    const handleScroll = () => {
      // Throttle using requestAnimationFrame
      if (!ticking) {
        rafId = window.requestAnimationFrame(toggleVisibility);
        ticking = true;
      }
    };

    // Check initial scroll position
    toggleVisibility();

    // Use passive listener for better scroll performance
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      // Clean up any pending animation frame
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    };
  }, []); // Empty deps - listener created once, avoids memory leak

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-modal p-3 rounded-full bg-accent text-foreground shadow-lg hover:shadow-xl hover:scale-110 transition-smooth will-change-transform transform-gpu focus-ring"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-6 h-6" />
        </button>
      )}
    </>
  );
}
