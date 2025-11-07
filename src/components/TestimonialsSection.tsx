"use client";

import { StarIcon, UserIcon } from "@heroicons/react/24/solid";
import { BentoGrid, BentoCard } from "@/components/magicui/bento-grid";
import type { Testimonial } from "@/types/components";
import { cn } from "@/lib/utils";

const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    role: "CEO",
    company: "TechStart Solutions",
    content: "Hudson Digital transformed our online presence completely. Their attention to detail and technical expertise exceeded our expectations.",
    rating: 5,
    featured: true,
    avatar: "/testimonials/sarah-johnson.jpg"
  },
  {
    id: "2",
    name: "Michael Chen",
    role: "Marketing Director",
    company: "GrowthCorp",
    content: "The website they built for us increased our conversion rate by 150%. Outstanding work!",
    rating: 5,
  },
  {
    id: "3",
    name: "Emily Rodriguez",
    role: "Founder",
    company: "Creative Studio",
    content: "Professional, responsive, and delivered exactly what we needed on time and within budget.",
    rating: 5,
  },
  {
    id: "4",
    name: "David Thompson",
    role: "Operations Manager",
    company: "LogiFlow Inc",
    content: "Their custom solution automated our entire workflow. We've saved 20+ hours per week.",
    rating: 5,
    featured: true,
  },
  {
    id: "5",
    name: "Lisa Park",
    role: "Product Manager",
    company: "InnovateLab",
    content: "The mobile-first design they created performs beautifully across all devices.",
    rating: 4,
  },
  {
    id: "6",
    name: "Robert Kim",
    role: "CTO",
    company: "DataDrive Systems",
    content: "Impressive technical skills and great communication throughout the entire project.",
    rating: 5,
  }
];

export function TestimonialsSection({ className }: { className?: string }) {
  return (
    <section className={`py-16 px-4 sm:px-6 lg:px-8 ${className || ""}`}>
      <div className="container-wide">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-responsive-lg font-bold text-white mb-4">
            What Our Clients Say
          </h2>
          <p className="text-gray-400 text-lg container-narrow">
            Don&apos;t just take our word for it. Here&apos;s what business owners and teams
            have to say about working with Hudson Digital Solutions.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div>
          <BentoGrid className="container-wide grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <BentoCard
                key={testimonial.id}
                name={testimonial.name}
                className={cn(
                  "col-span-1",
                  testimonial.featured && "md:col-span-2"
                )}
                Icon={UserIcon}
                description={`${testimonial.role} at ${testimonial.company}`}
                href="#"
                cta="View Case Study"
                background={
                  <div className="absolute inset-0 bg-gradient-hero-10 p-6">
                    {/* Rating Stars */}
                    {testimonial.rating && (
                      <div className="flex items-center gap-1 mb-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <StarIcon
                            key={i}
                            className={cn(
                              "w-4 h-4",
                              i < (testimonial.rating || 0) ? "text-yellow-400" : "text-gray-600"
                            )}
                          />
                        ))}
                      </div>
                    )}

                    {/* Testimonial Content */}
                    <blockquote className="text-gray-300 leading-relaxed mb-6 text-responsive-sm">
                      &quot;{testimonial.content}&quot;
                    </blockquote>

                    {/* Author Info */}
                    <div className="mt-auto">
                      <div className="font-semibold text-white text-sm">{testimonial.name}</div>
                      <div className="text-gray-400 text-xs">
                        {testimonial.role} at {testimonial.company}
                      </div>
                    </div>
                  </div>
                }
              />
            ))}
          </BentoGrid>
        </div>
      </div>
    </section>
  );
}

export default TestimonialsSection;
