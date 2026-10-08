'use client';
import { usePathname } from 'next/navigation';
export function StorefrontOnly({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  return path === '/admin' || path.startsWith('/admin/') || path === '/loading-preview' ? null : children;
}
