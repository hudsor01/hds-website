import { BackgroundPattern } from '@/components/magicui/BackgroundPattern';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/glass-card';
import { ArrowRight, BarChart3, Check, ClipboardList, Code2, Rocket, Search, Settings, Zap } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Web Development Services | Hudson Digital Solutions',
  description: 'Expert web development, custom solutions, and strategic consulting. React, Next.js, Node.js specialists delivering scalable technical solutions starting at $5,000.',
  openGraph: {
    title: 'Web Development Services | Hudson Digital Solutions',
    description: 'Expert web development, custom solutions, and strategic consulting for growing businesses.',
  },
};

interface Service {
  title: string;
  description: string;
  features: string[];
  pricing: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
}

const services: Service[] = [
  {
    title: "Web Applications",
    description: "Custom web applications built with modern frameworks and scalable architecture.",
    features: [
      "React & Next.js Development",
      "API Design & Integration",
      "Database Architecture",
      "Performance Optimization",
      "Cloud Deployment",
    ],
    pricing: "Starting at $5,000",
    icon: Code2,
    gradient: "bg-muted",
  },
  {
    title: "Custom Solutions",
    description: "Tailored software solutions designed specifically for your business needs.",
    features: [
      "Business Process Automation",
      "System Integrations",
      "Data Analytics Platforms",
      "Revenue Operations",
      "Legacy System Modernization",
    ],
    pricing: "Starting at $8,000",
    icon: Settings,
    gradient: "bg-info/20",
  },
  {
    title: "Strategic Consulting",
    description: "Technical strategy and planning to accelerate your business growth.",
    features: [
      "Technical Architecture Review",
      "Growth Strategy Planning",
      "Performance Audits",
      "Technology Roadmapping",
      "ROI Optimization",
    ],
    pricing: "Starting at $2,000",
    icon: BarChart3,
    gradient: "bg-muted",
  },
];

interface Stat {
  value: string;
  label: string;
}

const stats: Stat[] = [
  { value: "Fast", label: "Delivery Timeline" },
  { value: "Expert", label: "Development Team" },
  { value: "Proven", label: "ROI Results" },
  { value: "24/7", label: "Support Available" },
];

interface ProcessStep {
  step: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const process: ProcessStep[] = [
  {
    step: "01",
    title: "Discovery",
    description: "Deep dive into your business requirements, technical challenges, and growth objectives.",
    icon: Search,
  },
  {
    step: "02",
    title: "Strategy",
    description: "Develop a comprehensive technical strategy with clear timelines and success metrics.",
    icon: ClipboardList,
  },
  {
    step: "03",
    title: "Development",
    description: "Build your solution using best practices, modern technologies, and scalable architecture.",
    icon: Zap,
  },
  {
    step: "04",
    title: "Launch",
    description: "Deploy, monitor, and optimize your solution for maximum impact and performance.",
    icon: Rocket,
  },
];

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-screen flex-center overflow-hidden">
        {/* Background Elements */}
        <BackgroundPattern variant="default" />

        <div className="relative z-sticky container-wide sm:px-6 lg:px-8 text-center">
          <div className="space-y-sections">
            <div>
              <span className="inline-flex items-center gap-tight px-4 py-2 rounded-full border border-accent/30 bg-accent/10 text-accent font-semibold text-responsive-sm blur-backdrop">
                Professional Services
              </span>
            </div>

            <div>
              <h1 className="text-responsive-lg font-black text-foreground leading-none tracking-tight text-balance">
                <span className="inline-block">Technical</span>
                <span className="inline-block mx-4 text-accent">Services</span>
                <span className="inline-block">That</span>
                <span className="inline-block ml-4 text-accent">Scale</span>
              </h1>
            </div>

            <div className="typography">
              <p className="large text-muted-foreground container-wide leading-relaxed text-pretty">
                Expert technical solutions designed to accelerate your business growth without the overhead of full-time development teams.
              </p>
            </div>

            <div>
              <div className="flex-center flex-col sm:flex-row gap-content mt-12">
                <Button asChild variant="default" size="lg" trackConversion={true}>
      <Link href="/contact">
        Start Your Project
        <ArrowRight className="w-4 h-4" />
      </Link>
    </Button>

                <Button asChild variant="outline" size="lg" trackConversion={true}>
      <Link href="#process">
        See Our Process
        <ArrowRight className="w-4 h-4" />
      </Link>
    </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Services Section */}
      <section id="services-list" className="relative py-section px-4">
        <div className="container-wide">
          <div className="text-center mb-16">
            <h2 className="text-responsive-md font-black text-foreground mb-content-block">
              <span className="text-accent">
                Our Services
              </span>
            </h2>
            <div className="typography">
              <p className="large muted container-narrow">
                Comprehensive technical solutions tailored to your business needs.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-sections mb-16">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <GlassCard
                  key={index}
                  variant="light"
                  padding="lg"
                  hover
                  className="group relative"
                >
                  <div className="flex-center mb-content-block">
                    <div className={`p-3 rounded-xl ${service.gradient}-20 border border-primary/30`}>
                      <Icon className="h-8 w-8 text-accent" />
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-foreground mb-heading group-hover:text-accent transition-colors">
                    {service.title}
                  </h3>

                  <div className="typography mb-content-block">
                    <p className="muted leading-relaxed">
                      {service.description}
                    </p>
                  </div>

                  <div className="space-y-3 mb-comfortable">
                    {service.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start">
                        <div className="shrink-0 mr-3 mt-1">
                          <div className="w-5 h-5 rounded-full bg-muted flex-center">
                            <Check className="h-3 w-3 text-black" />
                          </div>
                        </div>
                        <p className="text-muted-foreground group-hover:text-foreground transition-colors duration-300">{feature}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mb-content-block">
                    <p className="text-2xl font-bold text-foreground">{service.pricing}</p>
                  </div>

                  <Link
                    href="/contact"
                    className="group/btn inline-flex items-center gap-3 px-6 py-3 bg-background-20 border border-accent/30 text-accent font-semibold rounded-lg hover:bg-primary-30 hover:border-accent transition-all duration-300"
                  >
                    Get Started
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </GlassCard>
              );
            })}
          </div>
        </div>
      </section>
      {/* Stats Section */}
      <section className="relative py-section px-4">
        <div className="container-wide">
          <div className="text-center mb-16">
            <h2 className="text-responsive-md font-black text-foreground mb-content-block">
              <span className="text-accent">
                Proven Results
              </span>
            </h2>
            <div className="typography">
              <p className="large muted container-narrow">
                Our track record speaks for itself - delivering exceptional results for clients across industries.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-comfortable mb-16">
            {stats.map((stat, index) => (
              <GlassCard
                key={index}
                variant="light"
                padding="lg"
                hover
                className="relative text-center"
              >
                <div className="text-4xl font-bold text-foreground mb-subheading">{stat.value}</div>
                <div className="small muted">{stat.label}</div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>
      {/* Process Section */}
      <section id="process" className="relative py-section px-4">
        <div className="container-wide">
          <div className="text-center mb-16">
            <h2 className="text-responsive-md font-black text-foreground mb-content-block">
              <span className="text-accent">
                Our Process
              </span>
            </h2>
            <div className="typography">
              <p className="large text-muted-foreground container-narrow">
                A proven methodology that ensures successful project delivery every time.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-sections mb-16">
            {process.map((step, index) => (
              <GlassCard
                key={index}
                variant="default"
                padding="lg"
                hover
                className="group relative text-center"
              >
                <div className="mb-heading flex justify-center">
                  <div className="w-16 h-16 bg-accent/20 rounded-full flex-center">
                    <step.icon className="w-8 h-8 text-accent" />
                  </div>
                </div>
                <div className="text-accent font-bold text-lg mb-subheading">{step.step}</div>
                <h3 className="text-xl font-bold text-foreground mb-heading group-hover:text-accent transition-colors">
                  {step.title}
                </h3>
                <div className="typography">
                  <p className="muted group-hover:text-muted-foreground transition-colors">
                    {step.description}
                  </p>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-section px-4">
        <div className="container-wide">
          <GlassCard variant="section" padding="none" className="relative z-sticky text-center p-12 md:p-16">
            <h2 className="text-responsive-md font-black text-foreground mb-content-block">
              Ready to accelerate
              <span className="text-accent">
                {" "}your growth?
              </span>
            </h2>

            <div className="typography">
              <p className="large muted container-narrow mb-10">
                Let&apos;s discuss your specific technical needs and create a custom solution that drives real results for your business.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row flex-center gap-content">
              <Button asChild variant="default" size="xl" trackConversion={true}>
                <Link href="/contact">
                  Start Your Project
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>

              <Button asChild variant="outline" size="xl">
                <Link href="#services-list">
                  Explore Services
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
            </div>
          </GlassCard>
        </div>
      </section>
    </main>
  );
}
