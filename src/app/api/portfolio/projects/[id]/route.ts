import { NextResponse, type NextRequest } from 'next/server';
import { logger } from '@/lib/logger';

// Define the project type
interface PortfolioProject {
  id: number;
  title: string;
  category: string;
  description: string;
  image: string;
  gradient: string;
  stats: {
    [key: string]: string;
  };
  tech: string[];
  link: string;
  featured?: boolean;
}

// Mock portfolio data - in a real app this would come from a database
const portfolioProjects: PortfolioProject[] = [
  {
    id: 1,
    title: "TenantFlow.app",
    category: "SaaS Platform",
    description: "Modern property management platform helping landlords streamline operations, tenant communications, and financial tracking with automated workflows.",
    image: "/portfolio/tenantflow.jpg",
    gradient: "bg-gradient-primary",
    stats: {
      properties: "1K+",
      efficiency: "+300%",
      uptime: "99.9%"
    },
    tech: ["Next.js 14", "TypeScript", "Prisma", "PostgreSQL", "Stripe"],
    link: "https://tenantflow.app",
    featured: true
  },
  {
    id: 2,
    title: "Ink37 Tattoos",
    category: "Business Website",
    description: "Premium tattoo studio website featuring artist portfolios, online booking system, and customer gallery with modern design aesthetics.",
    image: "/portfolio/ink37.jpg",
    gradient: "bg-gradient-decorative-purple",
    stats: {
      bookings: "+180%",
      engagement: "4.8/5",
      conversion: "+120%"
    },
    tech: ["React", "Next.js", "Tailwind CSS", "Vercel", "CMS"],
    link: "https://ink37tattoos.com"
  },
  {
    id: 3,
    title: "Richard W Hudson Jr",
    category: "Personal Portfolio",
    description: "Professional portfolio showcasing leadership experience, technical expertise, and project management capabilities with clean, modern design.",
    image: "/portfolio/richard-portfolio.jpg",
    gradient: "bg-gradient-secondary",
    stats: {
      projects: "50+",
      experience: "10+ years",
      satisfaction: "98%"
    },
    tech: ["Next.js", "TypeScript", "Tailwind CSS", "Vercel Analytics"],
    link: "https://richardwhudsonjr.com"
  },
  {
    id: 4,
    title: "Hudson Digital Solutions",
    category: "Business Website",
    description: "Company website showcasing full-stack development, revenue operations, and partnership management services with conversion-optimized design.",
    image: "/portfolio/hudson-digital.jpg",
    gradient: "bg-gradient-primary",
    stats: {
      leads: "+250%",
      performance: "98/100",
      conversion: "+180%"
    },
    tech: ["Next.js 15", "React 19", "TypeScript", "Tailwind CSS", "Analytics"],
    link: "https://hudsondigitalsolutions.com",
    featured: true
  }
];

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const projectId = Number(id);
  
  try {
    logger.info('Specific portfolio project API accessed', {
      url: request.url,
      method: request.method,
      projectId,
      component: 'PortfolioAPI',
      userFlow: 'portfolio_item_access'
    });

    // In a real application, you would fetch from a database like:
    // const project = await prisma.portfolioProject.findUnique({
    //   where: { id: projectId }
    // });

    const project = portfolioProjects.find(p => p.id === projectId);
    
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(project);
  } catch (error) {
    logger.error('Error fetching specific portfolio project', {
      error: error instanceof Error ? error.message : String(error),
      projectId,
      component: 'PortfolioAPI',
      userFlow: 'portfolio_item_access',
      action: 'GET_project_by_id'
    });

    return NextResponse.json(
      { error: 'Failed to fetch portfolio project' },
      { status: 500 }
    );
  }
}