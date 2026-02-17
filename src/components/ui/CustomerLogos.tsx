'use client';

import { useEffect, useState } from 'react';

export function CustomerLogos() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Fade in animation on mount (async to avoid ESLint warning)
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Placeholder company names - replace with actual logos/images later
  const companies = [
    'TechCorp',
    'DataFlow',
    'CloudScale',
    'DevOps Pro',
    'StartupLabs',
    'GrowthCo',
    'InnovateTech',
    'ScaleUp',
  ];

  return (
    <div className="py-8 border-b border-border/30">
      <div className="container-wide">
        <div
          className={`text-center transition-opacity duration-1000 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <p className="text-sm font-medium text-muted-foreground mb-6">
            Trusted by 100+ growing businesses
          </p>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6">
            {companies.map((company, index) => (
              <div
                key={index}
                className="text-muted-foreground/60 font-bold text-lg hover:text-muted-foreground transition-colors"
                style={{
                  transitionDelay: `${index * 100}ms`,
                }}
              >
                {company}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
