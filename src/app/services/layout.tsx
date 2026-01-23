import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Web Development Services | Hudson Digital Solutions',
  description: 'Expert web development, custom solutions, and strategic consulting. React, Next.js, Node.js specialists delivering scalable technical solutions starting at $5,000.',
  openGraph: {
    title: 'Web Development Services | Hudson Digital Solutions',
    description: 'Expert web development, custom solutions, and strategic consulting for growing businesses.',
  },
};

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
