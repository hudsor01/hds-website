/**
 * Admin Layout
 * Wraps all admin pages with authentication
 */

import { AuthWrapper } from '@/components/admin/AuthWrapper';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthWrapper>{children}</AuthWrapper>;
}
