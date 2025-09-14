'use client';

import { ArrowRightIcon, CheckIcon, CogIcon, CodeBracketIcon, ChartBarIcon } from "@heroicons/react/24/outline";
import { Search, ClipboardList, Zap, Rocket } from 'lucide-react';
import Link from "next/link";
import { BackgroundPattern } from "@/components/BackgroundPattern";

const services = [
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
    icon: CodeBracketIcon,
    gradient: "from-cyan-400 to-blue-500",
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
    icon: CogIcon,
    gradient: "from-purple-400 to-pink-500",
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
    icon: ChartBarIcon,
    gradient: "from-emerald-400 to-cyan-500",
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
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Elements */}
        <BackgroundPattern variant="default" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-300/30 bg-cyan-400/10 text-cyan-400 font-semibold text-sm backdrop-blur-sm">
                Professional Services
              </span>
            </div>

            <div>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-none tracking-tight text-balance">
                <span className="inline-block">Technical</span>
                <span className="inline-block mx-4 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Services</span>
                <span className="inline-block">That</span>
                <span className="inline-block ml-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Scale</span>
              </h1>
            </div>

            <div className="typography">
              <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed text-pretty">
                Expert technical solutions designed to accelerate your business growth without the overhead of full-time development teams.
              </p>
            </div>

            <div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
                <Link href="/contact">
                  <button className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-black font-bold text-lg rounded-lg overflow-hidden hover:shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 transform hover:scale-105 will-change-transform">
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    <span className="relative z-10">Start Your Project</span>
                    <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>

                <Link href="/portfolio">
                  <button className="group inline-flex items-center gap-3 px-8 py-4 border-2 border-gray-700 text-white font-semibold text-lg rounded-lg hover:border-cyan-400 hover:text-cyan-400 transition-all duration-300">
                    View Our Work
                    <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Services Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
              <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Our Services
              </span>
            </h2>
            <div className="typography">
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
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
                  className="group relative rounded-2xl overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10 p-8 hover:border-cyan-400/50 hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-300"
                >
                  <div className="flex items-center mb-6">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${service.gradient}/20 border border-cyan-500/30`}>
                      <Icon className="h-8 w-8 text-cyan-400" />
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-cyan-400 transition-colors">
                    {service.title}
                  </h3>
                  
                  <div className="typography mb-6">
                    <p className="text-gray-400 leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                  
                  <div className="space-y-3 mb-8">
                    {service.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start">
                        <div className="shrink-0 mr-3 mt-1">
                          <div className="w-5 h-5 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center">
                            <CheckIcon className="h-3 w-3 text-black" />
                          </div>
                        </div>
                        <p className="text-gray-300 group-hover:text-white transition-colors duration-300">{feature}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mb-6">
                    <p className="text-2xl font-bold text-white">{service.pricing}</p>
                  </div>
                  
                  <Link
                    href="/contact"
                    className="group/btn inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-400/30 text-cyan-400 font-semibold rounded-lg hover:bg-gradient-to-r hover:from-cyan-500/30 hover:to-purple-500/30 hover:border-cyan-400 transition-all duration-300"
                  >
                    Get Started
                    <ArrowRightIcon className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      {/* Stats Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
              <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Proven Results
              </span>
            </h2>
            <div className="typography">
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Our track record speaks for itself - delivering exceptional results for clients across industries.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="relative rounded-2xl overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10 p-8 hover:border-cyan-400/50 hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-300 text-center"
              >
                <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Process Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
              <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Our Process
              </span>
            </h2>
            <div className="typography">
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                A proven methodology that ensures successful project delivery every time.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {process.map((step, index) => (
              <div
                key={index}
                className="group relative rounded-2xl overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10 p-8 hover:border-cyan-400/50 hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-300 text-center"
              >
                <div className="mb-4 flex justify-center">
                  <div className="w-16 h-16 bg-cyan-400/20 rounded-full flex items-center justify-center">
                    <step.icon className="w-8 h-8 text-cyan-400" />
                  </div>
                </div>
                <div className="text-cyan-400 font-bold text-lg mb-2">{step.step}</div>
                <h3 className="text-xl font-bold text-white mb-4 group-hover:text-cyan-400 transition-colors">
                  {step.title}
                </h3>
                <div className="typography">
                  <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
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
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 text-center glass-section p-12 md:p-16">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
              Ready to accelerate 
              <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                {" "}your growth?
              </span>
            </h2>
            
            <div className="typography">
              <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-10">
                Let&apos;s discuss your specific technical needs and create a custom solution that drives real results for your business.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/contact"
                className="group relative inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold text-lg rounded-xl overflow-hidden hover:shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 transform hover:scale-105 will-change-transform"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <span className="relative z-10">Start Your Project</span>
                <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link
                href="/portfolio"
                className="group inline-flex items-center gap-3 px-10 py-5 border-2 border-gray-600 text-white font-semibold text-lg rounded-xl hover:border-cyan-400 hover:text-cyan-400 transition-all duration-300"
              >
                View Our Work
                <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
