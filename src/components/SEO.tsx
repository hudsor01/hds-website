'use client';

import { DefaultSeo as NextDefaultSeo, NextSeo } from 'next-seo';
import { defaultSEO, pageSEO } from '@/lib/seo-config';
import { usePathname } from 'next/navigation';

export function DefaultSeo() {
  return <NextDefaultSeo {...defaultSEO} />;
}

export function PageSeo({ 
  title, 
  description, 
  canonical,
  openGraph,
  noindex = false,
  nofollow = false,
}: {
  title?: string;
  description?: string;
  canonical?: string;
  openGraph?: {
    title?: string;
    description?: string;
    images?: Array<{
      url: string;
      width?: number;
      height?: number;
      alt?: string;
    }>;
  };
  noindex?: boolean;
  nofollow?: boolean;
}) {
  const pathname = usePathname();
  const url = `https://hudsondigitalsolutions.com${pathname}`;

  return (
    <NextSeo
      title={title}
      description={description}
      canonical={canonical || url}
      openGraph={{
        url,
        title: openGraph?.title || title,
        description: openGraph?.description || description,
        images: openGraph?.images,
      }}
      noindex={noindex}
      nofollow={nofollow}
    />
  );
}

// Helper hook to get SEO config for current page
export function usePageSEO() {
  const pathname = usePathname();
  
  const getPageKey = () => {
    if (pathname === '/') return 'home';
    if (pathname.startsWith('/contact')) return 'contact';
    if (pathname.startsWith('/services')) return 'services';
    if (pathname.startsWith('/about')) return 'about';
    if (pathname.startsWith('/blog')) return 'blog';
    return null;
  };

  const pageKey = getPageKey();
  return pageKey ? pageSEO[pageKey as keyof typeof pageSEO] : null;
}