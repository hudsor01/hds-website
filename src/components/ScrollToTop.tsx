'use client';

import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let ticking = false;

    const toggleVisibility = () => {
      const scrollY = window.scrollY;

      // Only update state if visibility actually changes
      if (scrollY > 200 && !isVisible) {
        setIsVisible(true);
      } else if (scrollY <= 200 && isVisible) {
        setIsVisible(false);
      }

      ticking = false;
    };

    const handleScroll = () => {
      // Throttle using requestAnimationFrame
      if (!ticking) {
        window.requestAnimationFrame(toggleVisibility);
        ticking = true;
      }
    };

    // Check initial scroll position
    toggleVisibility();

    // Use passive listener for better scroll performance
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isVisible]); // Add isVisible to dependencies

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
          className="fixed bottom-8 right-8 z-50 p-3 rounded-full bg-cyan-600 text-white shadow-lg hover:shadow-xl hover:scale-110 transition-smooth will-change-transform transform-gpu focus-ring"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-6 h-6" />
        </button>
      )}
    </>
  );
}
