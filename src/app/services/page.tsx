'use client';

import { Search, ClipboardList, Zap, Rocket, ArrowRight, Check, Settings, Code2, BarChart3 } from 'lucide-react';
import Link from "next/link";
import { CTAButton } from '@/components/cta-button';
import { BackgroundPattern } from "@/components/BackgroundPattern";

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
    gradient: "bg-gradient-secondary",
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
    gradient: "bg-gradient-decorative-purple",
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
    gradient: "bg-gradient-secondary",
  },
];

interface Stat {
  value: string;
  label: string;
}

const stats: Stat[] = [
  { value: "50+", label: "Projects Delivered" },
  { value: "98%", label: "Client Satisfaction" },
  { value: "250%", label: "Average ROI Increase" },
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
    <main className="min-h-screen bg-gradient-hero">
      {/* Hero Section */}
      <section className="relative min-h-screen flex-center overflow-hidden">
        {/* Background Elements */}
        <BackgroundPattern variant="default" />

        <div className="relative z-10 container-wide sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-secondary/30 bg-brand-secondary/10 text-brand-secondary font-semibold text-responsive-sm blur-backdrop">
                Professional Services
              </span>
            </div>

            <div>
              <h1 className="text-responsive-lg font-black text-white leading-none tracking-tight text-balance">
                <span className="inline-block">Technical</span>
                <span className="inline-block mx-4 gradient-text">Services</span>
                <span className="inline-block">That</span>
                <span className="inline-block ml-4 gradient-text">Scale</span>
              </h1>
            </div>

            <div className="typography">
              <p className="large text-muted-foreground container-wide leading-relaxed text-pretty">
                Expert technical solutions designed to accelerate your business growth without the overhead of full-time development teams.
              </p>
            </div>

            <div>
              <div className="flex-center flex-col sm:flex-row gap-4 mt-12">
                <CTAButton href="/contact" variant="primary" size="lg">
                  Start Your Project
                </CTAButton>

                <CTAButton href="#process" variant="secondary" size="lg">
                  See Our Process
                </CTAButton>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Services Section */}
      <section id="services-list" className="relative py-20 px-4">
        <div className="container-wide">
          <div className="text-center mb-16">
            <h2 className="text-responsive-md font-black text-white mb-6">
              <span className="gradient-text">
                Our Services
              </span>
            </h2>
            <div className="typography">
              <p className="large muted container-narrow">
                Comprehensive technical solutions tailored to your business needs.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <div
                  key={index}
                  className="group relative glass-card-light p-8 card-hover-glow transition-all duration-300"
                >
                  <div className="flex-center mb-6">
                    <div className={`p-3 rounded-xl ${service.gradient}-20 border border-cyan-500/30`}>
                      <Icon className="h-8 w-8 text-brand-secondary" />
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-text-inverted mb-4 group-hover:text-brand-secondary transition-colors">
                    {service.title}
                  </h3>
                  
                  <div className="typography mb-6">
                    <p className="muted leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                  
                  <div className="space-y-3 mb-8">
                    {service.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start">
                        <div className="shrink-0 mr-3 mt-1">
                          <div className="w-5 h-5 rounded-full bg-gradient-secondary flex-center">
                            <Check className="h-3 w-3 text-black" />
                          </div>
                        </div>
                        <p className="text-muted-foreground group-hover:text-foreground transition-colors duration-300">{feature}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mb-6">
                    <p className="text-2xl font-bold text-white">{service.pricing}</p>
                  </div>
                  
                  <Link
                    href="/contact"
                    className="group/btn inline-flex items-center gap-3 px-6 py-3 bg-gradient-hero-20 border border-brand-secondary/30 text-brand-secondary font-semibold rounded-lg hover:bg-gradient-primary-30 hover:border-brand-secondary transition-all duration-300"
                  >
                    Get Started
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      {/* Stats Section */}
      <section className="relative py-20 px-4">
        <div className="container-wide">
          <div className="text-center mb-16">
            <h2 className="text-responsive-md font-black text-white mb-6">
              <span className="gradient-text">
                Proven Results
              </span>
            </h2>
            <div className="typography">
              <p className="large muted container-narrow">
                Our track record speaks for itself - delivering exceptional results for clients across industries.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="relative glass-card-light p-8 card-hover-glow transition-all duration-300 text-center"
              >
                <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
                <div className="small muted">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Process Section */}
      <section id="process" className="relative py-20 px-4">
        <div className="container-wide">
          <div className="text-center mb-16">
            <h2 className="text-responsive-md font-black text-white mb-6">
              <span className="gradient-text">
                Our Process
              </span>
            </h2>
            <div className="typography">
              <p className="large text-muted-foreground container-narrow">
                A proven methodology that ensures successful project delivery every time.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {process.map((step, index) => (
              <div
                key={index}
                className="group relative glass-card p-8 card-hover-glow transition-all duration-300 text-center"
              >
                <div className="mb-4 flex justify-center">
                  <div className="w-16 h-16 bg-cyan-400/20 rounded-full flex-center">
                    <step.icon className="w-8 h-8 text-brand-secondary" />
                  </div>
                </div>
                <div className="text-brand-secondary font-bold text-lg mb-2">{step.step}</div>
                <h3 className="text-xl font-bold text-text-inverted mb-4 group-hover:text-brand-secondary transition-colors">
                  {step.title}
                </h3>
                <div className="typography">
                  <p className="muted group-hover:text-muted-foreground transition-colors">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-4">
        <div className="container-wide">
          <div className="relative z-10 text-center glass-section p-12 md:p-16">
            <h2 className="text-responsive-md font-black text-white mb-6">
              Ready to accelerate 
              <span className="gradient-text">
                {" "}your growth?
              </span>
            </h2>
            
            <div className="typography">
              <p className="large muted container-narrow mb-10">
                Let&apos;s discuss your specific technical needs and create a custom solution that drives real results for your business.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row flex-center gap-4">
              <Link
                href="/contact"
                className="group relative inline-flex items-center gap-3 cta-primary px-10 py-5 text-lg font-bold rounded-xl overflow-hidden transform hover:scale-105 will-change-transform transform-gpu"
              >
                <span className="absolute inset-0 shine-effect -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <span className="relative z-10">Start Your Project</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="#services-list"
                className="group inline-flex items-center gap-3 px-10 py-5 border-2 border-border-primary-dark text-text-inverted font-semibold text-lg rounded-xl hover:border-brand-secondary hover:text-brand-secondary transition-all duration-300"
              >
                Explore Services
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
