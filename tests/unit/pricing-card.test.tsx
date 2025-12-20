import { describe, test, expect } from 'bun:test';
import { render, within } from '@testing-library/react';
import { Card } from '@/components/ui/card';

describe('PricingCard', () => {
  const defaultProps = {
    variant: 'pricing' as const,
    name: 'Professional Plan',
    price: 'Starting at $5,000',
    description: 'Perfect for growing businesses',
    features: ['React Development', 'API Integration', 'Cloud Deployment'],
    cta: 'Get Started',
    href: '/contact',
  };

  test('renders name, price, and description', () => {
    const { container } = render(<Card {...defaultProps} />);

    expect(within(container).getByText('Professional Plan')).toBeTruthy();
    expect(within(container).getByText('Starting at $5,000')).toBeTruthy();
    expect(within(container).getByText('Perfect for growing businesses')).toBeTruthy();
  });

  test('renders all features', () => {
    const { container } = render(<Card {...defaultProps} />);

    expect(within(container).getByText('React Development')).toBeTruthy();
    expect(within(container).getByText('API Integration')).toBeTruthy();
    expect(within(container).getByText('Cloud Deployment')).toBeTruthy();
  });

  test('renders "What\'s Included" section header', () => {
    const { container } = render(<Card {...defaultProps} />);
    expect(within(container).getByText("What's Included")).toBeTruthy();
  });

  test('renders CTA button with correct text and link', () => {
    const { container } = render(<Card {...defaultProps} />);

    const link = within(container).getByRole('link', { name: 'Get Started' });
    expect(link).toBeTruthy();
    expect(link.getAttribute('href')).toBe('/contact');
  });

  test('renders popular badge when popular is true', () => {
    const { container } = render(<Card {...defaultProps} popular={true} />);
    expect(within(container).getByText('MOST POPULAR')).toBeTruthy();
  });

  test('does not render popular badge when popular is false', () => {
    const { container } = render(<Card {...defaultProps} popular={false} />);
    expect(within(container).queryByText('MOST POPULAR')).toBeFalsy();
  });

  test('renders ROI badge when provided', () => {
    const { container } = render(<Card {...defaultProps} roi="250% average ROI" />);
    expect(within(container).getByText('250% average ROI')).toBeTruthy();
  });

  test('does not render ROI badge when not provided', () => {
    const { container } = render(<Card {...defaultProps} />);
    const roiBadge = container.querySelector('.bg-success-text\\/10');
    expect(roiBadge).toBeFalsy();
  });

  test('renders not included section when items provided', () => {
    const { container } = render(
      <Card
        {...defaultProps}
        notIncluded={['Complex integrations', 'E-commerce functionality']}
      />
    );

    expect(within(container).getByText('Not Included')).toBeTruthy();
    expect(within(container).getByText('Complex integrations')).toBeTruthy();
    expect(within(container).getByText('E-commerce functionality')).toBeTruthy();
  });

  test('does not render not included section when empty', () => {
    const { container } = render(<Card {...defaultProps} notIncluded={[]} />);
    expect(within(container).queryByText('Not Included')).toBeFalsy();
  });

  test('applies secondary variant to button when not popular', () => {
    const { container } = render(<Card {...defaultProps} popular={false} />);

    const link = container.querySelector('a');
    expect(link?.className.includes('bg-secondary')).toBe(true);
  });

  test('applies default variant to button when popular', () => {
    const { container } = render(<Card {...defaultProps} popular={true} />);

    const link = container.querySelector('a');
    expect(link?.className.includes('bg-primary')).toBe(true);
  });

  test('applies custom className to wrapper', () => {
    const { container } = render(
      <Card {...defaultProps} className="custom-wrapper" />
    );

    expect(container.querySelector('.custom-wrapper')).toBeTruthy();
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

  test('applies accent border when popular', () => {
    const { container } = render(<Card {...defaultProps} popular={true} />);

    const popularCard = container.querySelector('.border-accent\\/50');
    expect(popularCard).toBeTruthy();
  });
});
