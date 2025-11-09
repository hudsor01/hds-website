'use client';

import { useEffect, useState, useRef } from 'react';
import { ArrowUp } from 'lucide-react';

/**
 * ScrollToTop component with throttled scroll listener
 *
 * Performance optimized per MDN best practices:
 * https://developer.mozilla.org/en-US/docs/Web/API/Document/scroll_event
 *
 * "scroll events can fire at a high rate" - throttling prevents
 * performance degradation ("jank") during fast scrolling
 */
export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const tickingRef = useRef(false);
  const lastScrollPositionRef = useRef(0);

  useEffect(() => {
    const toggleVisibility = (scrollPos: number) => {
      // Lower threshold for easier testing and better UX
      if (scrollPos > 200) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    // Throttled scroll handler per MDN recommendation
    // Uses setTimeout instead of requestAnimationFrame
    const handleScroll = () => {
      lastScrollPositionRef.current = window.scrollY;

      if (!tickingRef.current) {
        setTimeout(() => {
          toggleVisibility(lastScrollPositionRef.current);
          tickingRef.current = false;
        }, 100); // Throttle to ~100ms (10fps) - good balance for scroll button
        tickingRef.current = true;
      }
    };

    // Check initial scroll position
    toggleVisibility(window.scrollY);

    // Add scroll listener with passive option for better performance
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
          className="fixed bottom-8 right-8 z-50 p-3 rounded-full bg-gradient-primary text-white shadow-lg hover:shadow-xl hover:scale-110 transition-smooth will-change-transform transform-gpu focus-ring"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-6 h-6" />
        </button>
      )}
    </>
  );
}
