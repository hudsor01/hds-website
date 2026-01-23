import { describe, test, expect } from 'bun:test';
import { render, within } from '@testing-library/react';
import { Card } from '@/components/ui/card';

describe('ProjectCard', () => {
  const defaultProps = {
    variant: 'project' as const,
    id: '1',
    slug: 'test-project',
    title: 'Test Project',
    description: 'A test project description',
    category: 'Web Development',
    tech_stack: ['React', 'TypeScript', 'Next.js'],
  };

  test('renders title', () => {
    const { container } = render(<Card {...defaultProps} />);
    expect(within(container).getByText('Test Project')).toBeTruthy();
  });

  test('renders description', () => {
    const { container } = render(<Card {...defaultProps} />);
    expect(container.textContent?.includes('A test project description')).toBeTruthy();
  });

  test('renders category badge', () => {
    const { container } = render(<Card {...defaultProps} />);
    expect(within(container).getByText('Web Development')).toBeTruthy();
  });

  test('renders all tech stack badges', () => {
    const { container } = render(<Card {...defaultProps} />);

    expect(within(container).getByText('React')).toBeTruthy();
    expect(within(container).getByText('TypeScript')).toBeTruthy();
    expect(within(container).getByText('Next.js')).toBeTruthy();
  });

  test('renders featured badge when featured is true', () => {
    const { container } = render(<Card {...defaultProps} featured={true} />);
    expect(within(container).getByText('Featured Project')).toBeTruthy();
  });

  test('does not render featured badge when featured is false', () => {
    const { container } = render(<Card {...defaultProps} featured={false} />);
    expect(within(container).queryByText('Featured Project')).toBeFalsy();
  });

  test('renders stats when provided', () => {
    const stats = {
      users: '10K+',
      revenue: '$50K',
      conversion: '25%',
    };
    const { container } = render(<Card {...defaultProps} stats={stats} />);

    expect(within(container).getByText('10K+')).toBeTruthy();
    expect(within(container).getByText('$50K')).toBeTruthy();
    expect(within(container).getByText('25%')).toBeTruthy();
  });

  test('formats stat keys with spaces', () => {
    const stats = { activeUsers: '5K' };
    const { container } = render(<Card {...defaultProps} stats={stats} />);

    expect(within(container).getByText('active Users')).toBeTruthy();
  });

  test('does not render stats grid when no stats provided', () => {
    const { container } = render(<Card {...defaultProps} stats={{}} />);
    const statsGrid = container.querySelector('.grid.grid-cols-3');
    expect(statsGrid).toBeFalsy();
  });

  test('applies featured class when featured is true', () => {
    const { container } = render(<Card {...defaultProps} featured={true} />);

    const wrapper = container.querySelector('.md\\:col-span-2');
    expect(wrapper).toBeTruthy();
  });

  test('does not apply featured class when featured is false', () => {
    const { container } = render(<Card {...defaultProps} featured={false} />);

    const wrapper = container.querySelector('.md\\:col-span-2');
    expect(wrapper).toBeFalsy();
  });

  test('applies custom className to wrapper', () => {
    const { container } = render(
      <Card {...defaultProps} className="custom-project" />
    );

    expect(container.querySelector('.custom-project')).toBeTruthy();
  });

  test('renders link with correct href', () => {
    const { container } = render(<Card {...defaultProps} slug="my-project" />);

    const link = within(container).getByRole('link');
    expect(link.getAttribute('href')).toBe('/showcase/my-project');
  });

  test('applies glass card styling', () => {
    const { container } = render(<Card {...defaultProps} />);

    const glassCard = container.querySelector('.glass-card');
    expect(glassCard).toBeTruthy();
  });

  test('applies hover effect', () => {
    const { container } = render(<Card {...defaultProps} />);

    const hoverElement = container.querySelector('.card-hover-glow');
    expect(hoverElement).toBeTruthy();
  });

  test('renders View Project button in hover overlay', () => {
    const { container } = render(<Card {...defaultProps} />);
    expect(within(container).getByText('View Project')).toBeTruthy();
  });

  test('applies different header height when featured', () => {
    const { container } = render(<Card {...defaultProps} featured={true} />);
    const header = container.querySelector('.h-80');
    expect(header).toBeTruthy();
  });

  test('applies default header height when not featured', () => {
    const { container } = render(<Card {...defaultProps} featured={false} />);
    const header = container.querySelector('.h-64');
    expect(header).toBeTruthy();
  });
});
