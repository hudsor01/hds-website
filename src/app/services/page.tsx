'use client';

import { ArrowRightIcon, CheckIcon, CogIcon, CodeBracketIcon, ChartBarIcon } from "@heroicons/react/24/outline";
import { Search, ClipboardList, Zap, Rocket } from 'lucide-react';
import Link from "next/link";
import { CTAButton } from '@/components/cta-button';
import { BackgroundPattern } from "@/components/BackgroundPattern";

const services = [
  {
    title: "Web Applications That Convert",
    description: "Custom web applications that don't just look good—they generate revenue. Average 40% increase in conversion rates within 90 days.",
    features: [
      "React & Next.js Development",
      "API Design & Integration",
      "Database Architecture",
      "Performance Optimization",
      "Cloud Deployment",
    ],
    results: "Average 40% conversion increase",
    pricing: "Starting at $5,000",
    icon: CodeBracketIcon,
    gradient: "bg-gradient-secondary",
    roi: "250% average ROI in 6 months"
  },
  {
    title: "Business Automation That Scales",
    description: "Stop losing $50K+ annually to manual processes. We automate your revenue operations so you can focus on growth, not busywork.",
    features: [
      "Business Process Automation",
      "System Integrations",
      "Data Analytics Platforms",
      "Revenue Operations",
      "Legacy System Modernization",
    ],
    results: "Save 20+ hours/week on average",
    pricing: "Starting at $8,000",
    icon: CogIcon,
    gradient: "bg-gradient-decorative-purple",
    roi: "340% average ROI in first year"
  },
  {
    title: "Strategic Growth Consulting",
    description: "Get the technical roadmap that turns your website into a growth engine. We identify revenue leaks and fix them fast.",
    features: [
      "Technical Architecture Review",
      "Growth Strategy Planning",
      "Performance Audits",
      "Technology Roadmapping",
      "ROI Optimization",
    ],
    results: "Average 3 revenue leaks found per audit",
    pricing: "Starting at $2,000",
    icon: ChartBarIcon,
    gradient: "bg-gradient-secondary",
    roi: "Clients find 5-10x value in first 30 days"
  },
];

const stats = [
  { value: "50+", label: "Projects Delivered" },
  { value: "98%", label: "Client Satisfaction" },
  { value: "250%", label: "Average ROI Increase" },
  { value: "24/7", label: "Support Available" },
];

const process = [
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

        <div className="relative z-10 container-wide text-center">
          <div className="space-y-comfortable">
            <div>
              <span className="inline-flex items-center gap-tight px-4 py-2 rounded-full border border-cyan-300/30 bg-cyan-400/10 text-cyan-400 font-semibold text-responsive-sm blur-backdrop">
                Professional Services
              </span>
            </div>

            <div>
              <h1 className="text-responsive-lg font-black text-white leading-none tracking-tight text-balance">
                <span className="inline-block">Development That</span>
                <span className="inline-block mx-4 gradient-text">Pays for Itself</span>
              </h1>
            </div>

            <div className="typography">
              <p className="large text-muted-foreground container-wide leading-relaxed text-pretty">
                Stop paying for development that sits on a shelf. Our services generate measurable ROI within 90 days—or we keep working until they do.
                No agencies. No junior devs. Just senior engineers who understand revenue.
              </p>
            </div>

            <div>
              <div className="flex-center flex-col sm:flex-row gap-content mt-content-block">
                <CTAButton href="/contact" variant="primary" size="lg">
                  Get Your Free ROI Analysis
                </CTAButton>

                <CTAButton href="/portfolio" variant="secondary" size="lg">
                  See $3.7M+ in Results
                </CTAButton>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Services Section */}
      <section className="relative section-spacing page-padding-x">
        <div className="container-wide">
          <div className="text-center mb-content-block">
            <h2 className="text-responsive-md font-black text-white mb-heading">
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

          <div className="grid-3 mb-content-block">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <div
                  key={index}
                  className="group relative glass-card-light card-padding card-hover-glow transition-smooth"
                >
                  <div className="flex-center mb-card-content">
                    <div className={`px-4 py-2 rounded-xl ${service.gradient}-20 border border-cyan-500/30`}>
                      <Icon className="h-8 w-8 text-cyan-400" />
                    </div>
                  </div>

                  <h3 className="text-card-title font-bold text-white mb-subheading group-hover:text-cyan-400 transition-colors">
                    {service.title}
                  </h3>

                  <div className="typography mb-card-content">
                    <p className="muted leading-relaxed">
                      {service.description}
                    </p>
                  </div>

                  {/* Results Badge */}
                  {service.results && (
                    <div className="mb-card-content px-4 py-2 bg-cyan-400/10 border border-cyan-400/30 rounded-lg">
                      <p className="text-caption font-semibold text-cyan-400 text-center">{service.results}</p>
                    </div>
                  )}

                  <div className="space-y-tight mb-comfortable">
                    {service.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start">
                        <div className="shrink-0 mr-3 mt-1">
                          <div className="w-5 h-5 rounded-full bg-gradient-secondary flex-center">
                            <CheckIcon className="h-3 w-3 text-black" />
                          </div>
                        </div>
                        <p className="text-muted-foreground group-hover:text-foreground transition-colors duration-300">{feature}</p>
                      </div>
                    ))}
                  </div>

                  {/* ROI Badge */}
                  {service.roi && (
                    <div className="mb-card-content">
                      <p className="text-caption font-bold text-green-400">{service.roi}</p>
                    </div>
                  )}

                  <div className="mb-card-content">
                    <p className="text-card-title font-bold text-white">{service.pricing}</p>
                  </div>

                  <Link
                    href="/contact"
                    className="group/btn inline-flex items-center gap-content p-button bg-gradient-hero-20 border border-cyan-400/30 text-cyan-400 font-semibold rounded-lg hover:bg-gradient-primary-30 hover:border-cyan-400 transition-all duration-300 w-full justify-center"
                  >
                    Get Your Free Consultation
                    <ArrowRightIcon className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      {/* Stats Section */}
      <section className="relative section-spacing page-padding-x">
        <div className="container-wide">
          <div className="text-center mb-content-block">
            <h2 className="text-responsive-md font-black text-white mb-heading">
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

          <div className="grid-4 mb-content-block">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="relative glass-card-light card-padding card-hover-glow transition-smooth text-center"
              >
                <div className="text-page-title font-bold text-white mb-subheading">{stat.value}</div>
                <div className="small muted">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Process Section */}
      <section className="relative section-spacing page-padding-x">
        <div className="container-wide">
          <div className="text-center mb-content-block">
            <h2 className="text-responsive-md font-black text-white mb-heading">
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

          <div className="grid-4 mb-content-block">
            {process.map((step, index) => (
              <div
                key={index}
                className="group relative glass-card card-padding card-hover-glow transition-smooth text-center"
              >
                <div className="mb-subheading flex justify-center">
                  <div className="w-16 h-16 bg-cyan-400/20 rounded-full flex-center">
                    <step.icon className="w-8 h-8 text-cyan-400" />
                  </div>
                </div>
                <div className="text-cyan-400 font-bold text-body-lg mb-subheading">{step.step}</div>
                <h3 className="text-subheading font-bold text-white mb-subheading group-hover:text-cyan-400 transition-colors">
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
      <section className="relative section-spacing page-padding-x">
        <div className="container-wide">
          <div className="relative z-10 text-center glass-section card-padding">
            <h2 className="text-responsive-md font-black text-white mb-heading">
              Ready for Development That
              <span className="gradient-text">
                {" "}Actually Drives Revenue?
              </span>
            </h2>

            <div className="typography">
              <p className="large muted container-narrow mb-heading">
                Stop wasting money on features nobody uses. Get a free 30-minute ROI analysis showing exactly where your tech stack is leaking revenue—and how to fix it.
              </p>
              <p className="text-cyan-400 font-semibold mb-content-block">
                No sales pitch. No commitment. Just actionable insights you can implement immediately.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row flex-center gap-content">
              <Link
                href="/contact"
                className="group relative inline-flex items-center gap-content cta-primary px-10 py-5 text-body-lg font-bold rounded-xl overflow-hidden transform hover:scale-105 will-change-transform transform-gpu"
              >
                <span className="absolute inset-0 shine-effect -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <span className="relative z-10">Claim Your Free ROI Analysis</span>
                <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/portfolio"
                className="group inline-flex items-center gap-content px-10 py-5 border-2 border-gray-600 text-white font-semibold text-body-lg rounded-xl hover:border-cyan-400 hover:text-cyan-400 transition-all duration-300"
              >
                See $3.7M+ in Proven Results
                <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Trust signals */}
            <div className="mt-content-block pt-8 border-t border-white/10">
              <div className="flex flex-col md:flex-row justify-center items-center gap-comfortable text-caption text-muted-foreground">
                <div>50+ successful projects delivered</div>
                <div>250% average ROI within 6 months</div>
                <div>Response within 2 hours</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
