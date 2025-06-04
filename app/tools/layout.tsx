import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Calculator, Search, ArrowRight, Wrench } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Free Business Tools | Hudson Digital Solutions',
  description: 'Free ROI calculator and website audit tools to help you assess and improve your business performance.',
  openGraph: {
    title: 'Free Business Tools | Hudson Digital Solutions',
    description: 'Free ROI calculator and website audit tools for business improvement.',
  },
};

interface ToolsLayoutProps {
  children: React.ReactNode
}

export default function ToolsLayout({ children }: ToolsLayoutProps) {
  const tools = [
    {
      name: 'ROI Calculator',
      href: '/tools/roi-calculator',
      icon: Calculator,
      description: 'Calculate potential ROI from revenue operations improvements',
    },
    {
      name: 'Website Audit',
      href: '/tools/website-audit',
      icon: Search,
      description: 'Free analysis of your website performance and SEO',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Tools Navigation */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container py-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Wrench className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold">Free Business Tools</h1>
                <p className="text-muted-foreground">
                  Assess and improve your business performance
                </p>
              </div>
            </div>
            
            <Button asChild>
              <Link href="/contact">
                Get Expert Help
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          {/* Tools Quick Navigation */}
          <div className="mt-6 flex flex-wrap gap-2">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Button
                  key={tool.href}
                  variant="outline"
                  size="sm"
                  asChild
                >
                  <Link href={tool.href}>
                    <Icon className="mr-2 h-4 w-4" />
                    {tool.name}
                  </Link>
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container py-8">
        {children}
      </main>
      
      {/* Call to Action Footer */}
      <div className="border-t bg-muted/50">
        <div className="container py-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">
              Ready to optimize your business?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              These tools provide estimates. Get a personalized analysis and implementation plan
              from our revenue operations experts.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <Link href="/book-consultation">
                  Schedule Free Assessment
                </Link>
              </Button>
              
              <Button variant="outline" asChild>
                <Link href="/services">
                  View Our Services
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}