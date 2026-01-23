import { describe, test, expect } from 'bun:test';
import { render, within } from '@testing-library/react';
import { Card } from '@/components/ui/card';
import { Code2 } from 'lucide-react';

describe('ServiceCard', () => {
  const defaultProps = {
    variant: 'service' as const,
    title: 'Web Development',
    description: 'Build modern web applications',
    features: ['React Development', 'API Integration', 'Cloud Deployment'],
    icon: Code2,
  };

  test('renders title', () => {
    const { container } = render(<Card {...defaultProps} />);
    expect(within(container).getByText('Web Development')).toBeTruthy();
  });

  test('renders description', () => {
    const { container } = render(<Card {...defaultProps} />);
    expect(within(container).getByText('Build modern web applications')).toBeTruthy();
  });

  test('renders all features with checkmark icons', () => {
    const { container } = render(<Card {...defaultProps} />);

    expect(within(container).getByText('React Development')).toBeTruthy();
    expect(within(container).getByText('API Integration')).toBeTruthy();
    expect(within(container).getByText('Cloud Deployment')).toBeTruthy();

    // Should have 3 checkmark SVG icons (one per feature)
    const reactElement = within(container).getByText('React Development').closest('div');
    const svgs = reactElement?.parentElement?.querySelectorAll('svg');
    expect(svgs?.length).toBeGreaterThanOrEqual(3);
  });

  test('renders pricing when provided', () => {
    const { container } = render(<Card {...defaultProps} pricing="Starting at $5,000" />);
    expect(within(container).getByText('Starting at $5,000')).toBeTruthy();
  });

  test('does not render pricing section when not provided', () => {
    const { container } = render(<Card {...defaultProps} />);
    const pricingText = container.querySelector('.text-lg.font-semibold.text-accent');
    expect(pricingText).toBeFalsy();
  });

  test('applies surface class', () => {
    const { container } = render(
      <Card {...defaultProps} surface="surface-overlay" />
    );

    const surfaceElement = container.querySelector('.surface-overlay');
    expect(surfaceElement).toBeTruthy();
  });

  test('applies default surface when not provided', () => {
    const { container } = render(<Card {...defaultProps} />);

    const defaultSurface = container.querySelector('.surface-overlay');
    expect(defaultSurface).toBeTruthy();
  });

  test('applies custom className', () => {
    const { container } = render(
      <Card {...defaultProps} className="custom-class" />
    );

    const customElement = container.querySelector('.custom-class');
    expect(customElement).toBeTruthy();
  });

  test('applies glass card styling', () => {
    const { container } = render(<Card {...defaultProps} />);

    const glassCard = container.querySelector('.glass-card-light');
    expect(glassCard).toBeTruthy();
  });

  test('applies hover effect', () => {
    const { container } = render(<Card {...defaultProps} />);

    const hoverElement = container.querySelector('.card-hover-glow');
    expect(hoverElement).toBeTruthy();
  });

  test('renders icon with large size', () => {
    const { container } = render(<Card {...defaultProps} />);

    // Icon component should be rendered
    const iconContainer = container.querySelector('.p-3.rounded-xl');
    expect(iconContainer).toBeTruthy();
  });
});
