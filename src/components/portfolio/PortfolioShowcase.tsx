'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ArrowTopRightOnSquareIcon, 
  CodeBracketIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  ChartBarIcon,
  SparklesIcon,
  CheckCircleIcon,
  StarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

interface Project {
  id: number;
  title: string;
  tagline: string;
  description: string;
  challenge: string;
  solution: string;
  technologies: string[];
  results: {
    metric: string;
    value: string;
    icon: React.ReactNode;
  }[];
  category: string;
  images: {
    desktop: string;
    mobile: string;
    gallery?: string[];
  };
  liveUrl: string;
  testimonial?: {
    content: string;
    author: string;
    role: string;
    rating: number;
  };
  featured: boolean;
  year: string;
  duration: string;
  status: 'Live' | 'Completed' | 'In Progress';
}

const projects: Project[] = [
  {
    id: 1,
    title: 'TenantFlow',
    tagline: 'Property Management Revolutionized',
    description: 'Complete property management solution with tenant portals, maintenance tracking, automated rent collection, and comprehensive analytics dashboard.',
    challenge: 'Property managers were drowning in spreadsheets, missed payments, and maintenance chaos. They needed a unified platform to manage 500+ properties efficiently.',
    solution: 'Built a full-stack SaaS platform with automated workflows, real-time dashboards, and mobile-first tenant experience. Integrated Stripe for payments and implemented smart notification system.',
    technologies: ['Next.js 15', 'React 19', 'TypeScript', 'Prisma', 'PostgreSQL', 'Stripe', 'Vercel', 'Tailwind CSS'],
    results: [
      { metric: 'Properties Managed', value: '500+', icon: <UserGroupIcon className="w-5 h-5" /> },
      { metric: 'Admin Time Saved', value: '85%', icon: <ClockIcon className="w-5 h-5" /> },
      { metric: 'Rent Processed', value: '$1.2M+', icon: <CurrencyDollarIcon className="w-5 h-5" /> },
      { metric: 'System Uptime', value: '99.8%', icon: <ChartBarIcon className="w-5 h-5" /> },
    ],
    category: 'PropTech',
    images: {
      desktop: '/portfolio/tenantflow-hero-desktop.png',
      mobile: '/portfolio/tenantflow-hero-mobile.png',
      gallery: [
        '/portfolio/tenantflow-features-desktop.png',
        '/portfolio/tenantflow-pricing-desktop.png',
        '/portfolio/tenantflow-login-desktop.png'
      ]
    },
    liveUrl: 'https://tenantflow.app',
    testimonial: {
      content: 'TenantFlow transformed our property management business. What used to take hours now takes minutes. The ROI was visible within the first month.',
      author: 'Sarah Johnson',
      role: 'CEO, Premier Properties LLC',
      rating: 5
    },
    featured: true,
    year: '2024',
    duration: '3 months',
    status: 'Live'
  },
  {
    id: 2,
    title: 'Ink37 Tattoos',
    tagline: 'Where Art Meets Digital Excellence',
    description: 'Modern tattoo studio website with online booking, artist portfolios, aftercare guidance, and client management system.',
    challenge: 'The studio was losing bookings to competitors with online presence. They needed a platform that reflected their artistic quality while streamlining operations.',
    solution: 'Created a visually stunning website with integrated booking system, artist showcase, and automated client communications. Implemented SEO optimization for 300% traffic increase.',
    technologies: ['Next.js 15', 'React 19', 'TypeScript', 'Supabase', 'Stripe', 'Vercel', 'Framer Motion'],
    results: [
      { metric: 'Weekly Bookings', value: '50+', icon: <UserGroupIcon className="w-5 h-5" /> },
      { metric: 'Online Inquiries', value: '+300%', icon: <ChartBarIcon className="w-5 h-5" /> },
      { metric: 'Client Rating', value: '4.9/5', icon: <StarIcon className="w-5 h-5" /> },
      { metric: 'Page Load Speed', value: '0.8s', icon: <SparklesIcon className="w-5 h-5" /> },
    ],
    category: 'Creative',
    images: {
      desktop: '/portfolio/ink37tattoos-hero-desktop.png',
      mobile: '/portfolio/ink37tattoos-hero-mobile.png',
      gallery: [
        '/portfolio/ink37tattoos-gallery-desktop.png',
        '/portfolio/ink37tattoos-booking-desktop.png',
        '/portfolio/ink37tattoos-artists-desktop.png'
      ]
    },
    liveUrl: 'https://ink37tattoos.com',
    testimonial: {
      content: 'Our online presence went from non-existent to industry-leading. The booking system alone has saved us 20 hours per week in admin work.',
      author: 'Mike Chen',
      role: 'Owner, Ink37 Tattoos',
      rating: 5
    },
    featured: true,
    year: '2024',
    duration: '6 weeks',
    status: 'Live'
  }
];

export default function PortfolioShowcase() {
  const [selectedProject, setSelectedProject] = useState<Project>(projects[0]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');

  const currentImages = selectedProject.images.gallery || [];
  const allImages = [
    selectedProject.images.desktop,
    ...(currentImages)
  ];

  const nextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  return (
    <div className="relative">
      {/* Project Selector Tabs */}
      <div className="flex flex-wrap gap-4 mb-12 justify-center">
        {projects.map((project) => (
          <button
            key={project.id}
            onClick={() => {
              setSelectedProject(project);
              setActiveImageIndex(0);
            }}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
              selectedProject.id === project.id
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-black shadow-lg shadow-cyan-500/25'
                : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700'
            }`}
          >
            {project.title}
          </button>
        ))}
      </div>

      {/* Main Showcase */}
      <div className="grid lg:grid-cols-2 gap-12 mb-16">
        {/* Left: Project Details */}
        <div className="space-y-8">
          {/* Header */}
          <div>
            <div className="flex items-center gap-4 mb-4">
              <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-sm font-semibold">
                {selectedProject.category}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                selectedProject.status === 'Live' 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-gray-500/20 text-gray-400'
              }`}>
                {selectedProject.status}
              </span>
              <span className="text-gray-400 text-sm">
                {selectedProject.year} • {selectedProject.duration}
              </span>
            </div>
            <h2 className="text-4xl font-bold text-white mb-2">{selectedProject.title}</h2>
            <p className="text-xl text-cyan-400 font-semibold">{selectedProject.tagline}</p>
          </div>

          {/* Challenge & Solution */}
          <div className="space-y-6">
            <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-xl">
              <h3 className="text-lg font-bold text-red-400 mb-3 flex items-center gap-2">
                <span className="text-2xl">🎯</span> The Challenge
              </h3>
              <p className="text-gray-300 leading-relaxed">{selectedProject.challenge}</p>
            </div>

            <div className="p-6 bg-green-500/10 border border-green-500/30 rounded-xl">
              <h3 className="text-lg font-bold text-green-400 mb-3 flex items-center gap-2">
                <span className="text-2xl">💡</span> The Solution
              </h3>
              <p className="text-gray-300 leading-relaxed">{selectedProject.solution}</p>
            </div>
          </div>

          {/* Results Grid */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Measurable Impact</h3>
            <div className="grid grid-cols-2 gap-4">
              {selectedProject.results.map((result, index) => (
                <div 
                  key={index}
                  className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg hover:border-cyan-500/50 transition-all duration-300"
                >
                  <div className="flex items-center gap-3 mb-2 text-cyan-400">
                    {result.icon}
                    <span className="text-2xl font-bold text-white">{result.value}</span>
                  </div>
                  <p className="text-sm text-gray-400">{result.metric}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tech Stack */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Technology Stack</h3>
            <div className="flex flex-wrap gap-2">
              {selectedProject.technologies.map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 hover:border-cyan-500/50 hover:text-cyan-400 transition-all duration-300"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Testimonial */}
          {selectedProject.testimonial && (
            <div className="p-6 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl">
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <StarIcon
                    key={i}
                    className={`w-5 h-5 ${
                      i < selectedProject.testimonial.rating
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-600'
                    }`}
                  />
                ))}
              </div>
              <blockquote className="text-gray-300 italic mb-4">
                "{selectedProject.testimonial.content}"
              </blockquote>
              <div>
                <p className="text-white font-semibold">{selectedProject.testimonial.author}</p>
                <p className="text-gray-400 text-sm">{selectedProject.testimonial.role}</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            <Link
              href={selectedProject.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-black font-bold rounded-lg hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300"
            >
              <ArrowTopRightOnSquareIcon className="w-5 h-5" />
              View Live Site
            </Link>
            <button
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border border-gray-600 text-gray-300 font-semibold rounded-lg hover:border-cyan-500 hover:text-cyan-400 transition-all duration-300"
            >
              <CodeBracketIcon className="w-5 h-5" />
              View Code
            </button>
          </div>
        </div>

        {/* Right: Image Gallery */}
        <div className="space-y-6">
          {/* View Mode Toggle */}
          <div className="flex justify-center gap-2">
            <button
              onClick={() => setViewMode('desktop')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 ${
                viewMode === 'desktop'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'bg-gray-800/50 text-gray-400 border border-gray-700'
              }`}
            >
              <ComputerDesktopIcon className="w-5 h-5" />
              Desktop
            </button>
            <button
              onClick={() => setViewMode('mobile')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 ${
                viewMode === 'mobile'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'bg-gray-800/50 text-gray-400 border border-gray-700'
              }`}
            >
              <DevicePhoneMobileIcon className="w-5 h-5" />
              Mobile
            </button>
          </div>

          {/* Main Image Display */}
          <div className="relative group">
            <div className={`relative bg-gray-900 rounded-xl overflow-hidden shadow-2xl border border-gray-800 ${
              viewMode === 'mobile' ? 'max-w-sm mx-auto' : ''
            }`}>
              <Image
                src={viewMode === 'desktop' ? allImages[activeImageIndex] : selectedProject.images.mobile}
                alt={`${selectedProject.title} screenshot`}
                width={viewMode === 'desktop' ? 1920 : 375}
                height={viewMode === 'desktop' ? 1080 : 667}
                className="w-full h-auto"
                priority
              />
              
              {/* Navigation Arrows (Desktop Gallery Only) */}
              {viewMode === 'desktop' && allImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black/70"
                  >
                    <ChevronLeftIcon className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black/70"
                  >
                    <ChevronRightIcon className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>

            {/* Image Counter */}
            {viewMode === 'desktop' && allImages.length > 1 && (
              <div className="text-center mt-4 text-gray-400 text-sm">
                {activeImageIndex + 1} / {allImages.length}
              </div>
            )}
          </div>

          {/* Thumbnail Gallery (Desktop Only) */}
          {viewMode === 'desktop' && allImages.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {allImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImageIndex(index)}
                  className={`relative rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                    activeImageIndex === index
                      ? 'border-cyan-500 shadow-lg shadow-cyan-500/25'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <Image
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    width={200}
                    height={113}
                    className="w-full h-auto opacity-70 hover:opacity-100 transition-opacity"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Feature Highlights */}
          <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700">
            <h4 className="font-bold text-white mb-4 flex items-center gap-2">
              <CheckCircleIcon className="w-5 h-5 text-green-400" />
              Key Features Delivered
            </h4>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-gray-300">
                <span className="text-cyan-400 mt-1">•</span>
                <span className="text-sm">Responsive design optimized for all devices</span>
              </li>
              <li className="flex items-start gap-2 text-gray-300">
                <span className="text-cyan-400 mt-1">•</span>
                <span className="text-sm">Lightning-fast performance with optimized loading</span>
              </li>
              <li className="flex items-start gap-2 text-gray-300">
                <span className="text-cyan-400 mt-1">•</span>
                <span className="text-sm">SEO optimized for maximum visibility</span>
              </li>
              <li className="flex items-start gap-2 text-gray-300">
                <span className="text-cyan-400 mt-1">•</span>
                <span className="text-sm">Secure, scalable architecture</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}