"use client";
import { useEffect, useRef, useState } from "react";
import type { UseTouchInteractionsOptions } from '@/types/hooks';
import type { TouchState } from '@/types/common';


export function useTouchInteractions(
  elementRef: React.RefObject<HTMLElement>,
  options: UseTouchInteractionsOptions = {}
) {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onTap,
    onDoubleTap,
    onLongPress,
    swipeThreshold = 50,
    longPressDelay = 500,
  } = options;

  const [touchState, setTouchState] = useState<TouchState>({
    isTouching: false,
    touchStart: null,
    touchEnd: null,
    swipeDirection: null,
  });

  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const lastTapTime = useRef<number>(0);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) {return;}

    let startX = 0;
    let startY = 0;
    let endX = 0;
    let endY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches && e.touches[0];
      if (!touch) {return;} // guard against undefined touch
      startX = touch.clientX;
      startY = touch.clientY;

      setTouchState({
        isTouching: true,
        touchStart: { x: startX, y: startY },
        touchEnd: null,
        swipeDirection: null,
      });

      // Start long press timer
      if (onLongPress) {
        longPressTimer.current = setTimeout(() => {
          onLongPress();
          // Prevent tap from firing after long press
          lastTapTime.current = 0;
        }, longPressDelay);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Cancel long press if user moves
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }

      const touch = e.touches && e.touches[0];
      if (!touch) {return;} // guard against undefined touch
      endX = touch.clientX;
      endY = touch.clientY;
    };

    const handleTouchEnd = () => {
      // Clear long press timer
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }

      const deltaX = endX - startX;
      const deltaY = endY - startY;
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);

      let swipeDirection: "left" | "right" | "up" | "down" | null = null;

      // Detect swipe
      if (absDeltaX > swipeThreshold || absDeltaY > swipeThreshold) {
        if (absDeltaX > absDeltaY) {
          // Horizontal swipe
          if (deltaX > 0) {
            swipeDirection = "right";
            onSwipeRight?.();
          } else {
            swipeDirection = "left";
            onSwipeLeft?.();
          }
        } else {
          // Vertical swipe
          if (deltaY > 0) {
            swipeDirection = "down";
            onSwipeDown?.();
          } else {
            swipeDirection = "up";
            onSwipeUp?.();
          }
        }
      } else {
        // Detect tap or double tap
        const currentTime = Date.now();
        const timeSinceLastTap = currentTime - lastTapTime.current;

        if (timeSinceLastTap < 300 && timeSinceLastTap > 0) {
          // Double tap
          onDoubleTap?.();
          lastTapTime.current = 0;
        } else {
          // Single tap
          onTap?.();
          lastTapTime.current = currentTime;
        }
      }

      setTouchState({
        isTouching: false,
        touchStart: { x: startX, y: startY },
        touchEnd: { x: endX, y: endY },
        swipeDirection,
      });
    };

    const handleTouchCancel = () => {
      // Clear any timers
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }

      setTouchState({
        isTouching: false,
        touchStart: null,
        touchEnd: null,
        swipeDirection: null,
      });
    };

    // Add passive: false to prevent scrolling during swipe
    const listenerOptions = { passive: false };

    element.addEventListener("touchstart", handleTouchStart, listenerOptions);
    element.addEventListener("touchmove", handleTouchMove, listenerOptions);
    element.addEventListener("touchend", handleTouchEnd, listenerOptions);
    element.addEventListener("touchcancel", handleTouchCancel, listenerOptions);

    return () => {
      element.removeEventListener("touchstart", handleTouchStart);
      element.removeEventListener("touchmove", handleTouchMove);
      element.removeEventListener("touchend", handleTouchEnd);
      element.removeEventListener("touchcancel", handleTouchCancel);

      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    };
  }, [
    elementRef,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onTap,
    onDoubleTap,
    onLongPress,
    swipeThreshold,
    longPressDelay,
  ]);

  return touchState;
}

// Hook for pull-to-refresh functionality
export function usePullToRefresh(onRefresh: () => Promise<void>) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);

  useEffect(() => {
    let startY = 0;
    let currentY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        const touch = e.touches && e.touches[0];
        if (!touch) {return;}
        startY = touch.clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!startY) {return;}

      const touch = e.touches && e.touches[0];
      if (!touch) {return;}

      currentY = touch.clientY;
      const distance = currentY - startY;

      if (distance > 0 && window.scrollY === 0) {
        e.preventDefault();
        setPullDistance(Math.min(distance, 150));
      }
    };

    const handleTouchEnd = async () => {
      if (pullDistance > 100 && !isRefreshing) {
        setIsRefreshing(true);
        await onRefresh();
        setIsRefreshing(false);
      }

      setPullDistance(0);
      startY = 0;
    };

    document.addEventListener("touchstart", handleTouchStart);
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd);

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [onRefresh, pullDistance, isRefreshing]);

  return { isRefreshing, pullDistance };
}
