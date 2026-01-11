'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface CTAButton {
  text: string;
  href: string;
  variant?: 'primary' | 'secondary';
  icon?: ReactNode;
}

interface CTASectionProps {
  title: string | ReactNode;
  description: string;
  buttons: CTAButton[];
}

export function CTASection({
  title,
  description,
  buttons,
}: CTASectionProps) {
  return (
    <section className="py-section px-4">
      <div className="container-wide">
        <Card variant="glassSection" size="xl" className="text-center">
          {typeof title === 'string' ? (
            <h2 className="text-clamp-xl font-black text-foreground mb-content-block">
              {title}
            </h2>
          ) : (
            title
          )}

          <div className="typography">
            <p className="text-xl text-muted container-narrow mb-10">
              {description}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-content justify-center">
            {buttons.map((button, index) => {
              const isPrimary = button.variant !== 'secondary';

              return (
                <Button
                  key={index}
                  asChild
                  variant={isPrimary ? 'default' : 'outline'}
                  size="lg"
                  trackConversion={isPrimary}
                >
                  <Link href={button.href}>
                    {button.text}
                    {button.icon || (isPrimary && <ArrowRight className="w-5 h-5" />)}
                  </Link>
                </Button>
              );
            })}
          </div>
        </Card>
      </div>
    </section>
  );
}
