import { NextResponse, type NextRequest } from 'next/server';
import { logger } from '@/lib/logger';

// Define the testimonial type
interface Testimonial {
  id: number;
  name: string;
  company: string;
  role: string;
  content: string;
  rating: number;
  service: string;
  highlight: string;
}

// Mock testimonials data - in a real app this would come from a database
const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Michael Chen',
    company: 'TechStart Inc.',
    role: 'CTO',
    content: 'Hudson Digital Solutions delivered beyond our expectations. They transformed our MVP into a scalable platform that handles 100K+ users.',
    rating: 5,
    service: 'SaaS Development',
    highlight: '10x Performance'
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    company: 'E-Commerce Plus',
    role: 'CEO',
    content: 'The team\'s expertise in Next.js and modern web technologies helped us achieve a 60% improvement in conversion rates.',
    rating: 5,
    service: 'E-Commerce Platform',
    highlight: '60% More Sales'
  },
  {
    id: 3,
    name: 'David Martinez',
    company: 'Wellness App Co',
    role: 'Product Manager',
    content: 'From concept to launch in just 8 weeks. The efficiency and quality of work was exceptional.',
    rating: 5,
    service: 'Mobile App Backend',
    highlight: '8 Week Launch'
  },
  {
    id: 4,
    name: 'Emily Thompson',
    company: 'FinTech Solutions',
    role: 'Founder',
    content: 'Professional, reliable, and technically excellent. Hudson Digital Solutions understood our vision and brought it to life with clean, scalable code.',
    rating: 5,
    service: 'Custom Development',
    highlight: 'Zero Downtime'
  },
  {
    id: 5,
    name: 'Lisa Park',
    company: 'Wellness App Co',
    role: 'Operations Manager',
    content: 'The SalesLoft integration and automation setup has saved us countless hours. Our sales team is more productive than ever.',
    rating: 5,
    service: 'Revenue Operations',
    highlight: '40 Hours/Week Saved'
  },
  {
    id: 6,
    name: 'James Wilson',
    company: 'Partner Connect',
    role: 'CEO',
    content: 'Excellent communication throughout the project. They delivered a robust partner management system that scales with our growing business.',
    rating: 5,
    service: 'Partnership Management',
    highlight: '3x Partner Growth'
  }
];

export async function GET(request: NextRequest) {
  try {
    logger.info('Testimonials API accessed', {
      url: request.url,
      method: request.method,
      component: 'TestimonialsAPI',
      userFlow: 'testimonials_access'
    });

    // In a real application, you would fetch from a database like:
    // const testimonials = await prisma.testimonial.findMany({
    //   where: { verified: true },
    //   orderBy: { createdAt: 'desc' },
    //   take: 20
    // });

    return NextResponse.json(testimonials);
  } catch (error) {
    logger.error('Error fetching testimonials', {
      error: error instanceof Error ? error.message : String(error),
      component: 'TestimonialsAPI',
      userFlow: 'testimonials_access',
      action: 'GET_testimonials'
    });

    return NextResponse.json(
      { error: 'Failed to fetch testimonials' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    logger.info('Testimonial submission attempted', {
      url: request.url,
      method: request.method,
      component: 'TestimonialsAPI',
      userFlow: 'testimonial_submission'
    });

    // Authentication would happen here
    // const session = await getServerSession(authOptions);
    // if (!session?.user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // In a real application, you would obtain the body and validate and save to a database:
    // const body = await request.json();
    // const newTestimonial = await prisma.testimonial.create({
    //   data: {
    //     ...body,
    //     verified: false // Would need verification before showing publicly
    //   }
    // });

    return NextResponse.json(
      { message: 'Testimonial submission not implemented in demo' },
      { status: 501 }
    );
  } catch (error) {
    logger.error('Error submitting testimonial', {
      error: error instanceof Error ? error.message : String(error),
      component: 'TestimonialsAPI',
      userFlow: 'testimonial_submission',
      action: 'POST_testimonial'
    });

    return NextResponse.json(
      { error: 'Failed to submit testimonial' },
      { status: 500 }
    );
  }
}