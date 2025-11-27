import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { ReactNode } from 'react';

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
    <section className="py-20 px-4">
      <div className="container-wide">
        <div className="glass-section p-12 md:p-16 text-center">
          {typeof title === 'string' ? (
            <h2 className="text-clamp-xl font-black text-white mb-6">
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

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {buttons.map((button, index) => {
              const isPrimary = button.variant !== 'secondary';
              const buttonClass = isPrimary
                ? 'group inline-flex-center px-8 py-4 text-base font-semibold text-black bg-muted-hover rounded-lg'
                : 'inline-flex-center px-8 py-4 text-base font-semibold text-white border-2 border-border rounded-lg hover:border-cyan-400/50 hover:bg-background/50 transition-all duration-200';

              return (
                <Link key={index} href={button.href} className={buttonClass}>
                  {button.text}
                  {button.icon || (
                    isPrimary && (
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    )
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
