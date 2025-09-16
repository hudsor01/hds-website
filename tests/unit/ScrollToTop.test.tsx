import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import ScrollToTop from '@/components/ScrollToTop';

describe('ScrollToTop Component', () => {
  beforeEach(() => {
    // Reset scroll position before each test
    window.scrollTo = vi.fn();
    window.scrollY = 0;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('should not be visible initially when at top of page', () => {
    render(<ScrollToTop />);

    const button = screen.queryByLabelText('Scroll to top');
    expect(button).not.toBeInTheDocument();
  });

  test('should become visible when scrolled past threshold', async () => {
    render(<ScrollToTop />);

    // Simulate scroll past 300px
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      value: 400
    });

    // Trigger scroll event
    fireEvent.scroll(window);

    // Wait for state update
    await waitFor(() => {
      const button = screen.getByLabelText('Scroll to top');
      expect(button).toBeInTheDocument();
    });
  });

  test('should hide when scrolled back to top', async () => {
    render(<ScrollToTop />);

    // First scroll down
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      value: 400
    });
    fireEvent.scroll(window);

    await waitFor(() => {
      expect(screen.getByLabelText('Scroll to top')).toBeInTheDocument();
    });

    // Then scroll back up
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      value: 100
    });
    fireEvent.scroll(window);

    await waitFor(() => {
      expect(screen.queryByLabelText('Scroll to top')).not.toBeInTheDocument();
    });
  });

  test('should scroll to top when clicked', async () => {
    render(<ScrollToTop />);

    // Scroll down to make button visible
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      value: 500
    });
    fireEvent.scroll(window);

    await waitFor(() => {
      const button = screen.getByLabelText('Scroll to top');
      expect(button).toBeInTheDocument();
    });

    // Click the button
    const button = screen.getByLabelText('Scroll to top');
    fireEvent.click(button);

    // Check that scrollTo was called with correct parameters
    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: 'smooth'
    });
  });

  test('should have correct styling classes', async () => {
    render(<ScrollToTop />);

    // Make button visible
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      value: 400
    });
    fireEvent.scroll(window);

    await waitFor(() => {
      const button = screen.getByLabelText('Scroll to top');
      expect(button).toHaveClass('fixed');
      expect(button).toHaveClass('bottom-8');
      expect(button).toHaveClass('right-8');
      expect(button).toHaveClass('z-50');
      expect(button).toHaveClass('bg-gradient-primary');
      expect(button).toHaveClass('will-change-transform');
    });
  });

  test('should contain ArrowUpIcon', async () => {
    render(<ScrollToTop />);

    // Make button visible
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      value: 400
    });
    fireEvent.scroll(window);

    await waitFor(() => {
      const button = screen.getByLabelText('Scroll to top');
      const icon = button.querySelector('svg');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('w-6');
      expect(icon).toHaveClass('h-6');
    });
  });

  test('should cleanup scroll listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = render(<ScrollToTop />);

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));

    removeEventListenerSpy.mockRestore();
  });
});