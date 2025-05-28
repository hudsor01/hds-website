# Hudson Digital Solutions - Production-Ready Business Website

🔒 **Enterprise-grade security meets small business simplicity**

A professional, production-ready website with comprehensive security implementation following **React 19** and **Next.js 15** best practices. Perfect for businesses that need both professional design and bulletproof security.

## 🎯 Perfect For
- Small business owners who value security
- Freelancers and consultants handling sensitive data
- Professional service providers
- Local businesses accepting online inquiries
- Anyone who needs enterprise-grade security without the complexity

## ✨ Features

### 🎨 **Professional Design**
- ✅ Conversion-optimized layouts
- 📱 Fully responsive (mobile, tablet, desktop)
- 🎨 Modern design with Tailwind CSS v4
- ⚡ Smooth animations with Framer Motion

### 🔒 **Enterprise Security (NEW!)**
- 🛡️ **bcrypt password hashing** (12 salt rounds)
- 🚫 **Rate limiting** (5 attempts/15min with lockout)
- 🔐 **Enhanced JWT security** (2h sessions, proper validation)
- 🛡️ **Content Security Policy** with nonces
- 🔍 **Comprehensive input validation** (Zod schemas)
- 🚨 **Security headers** (11 enhanced headers)
- 📊 **Security Score: 9.2/10** - Production Ready

### 📧 **Lead Generation**
- 📧 Contact forms with spam protection
- 🎁 Lead magnets for email capture
- 💌 Newsletter signup with email sequences
- 🔒 Secure form processing with rate limiting

### 🚀 **Performance & SEO**
- ⚡ Next.js 15 with React 19
- 🏃‍♂️ Server Components for faster loading
- 🔍 SEO-optimized with structured data
- 📊 Built-in analytics ready

## 📋 Quick Links

### 🚀 **Getting Started**
- [Production Deployment Guide](PRODUCTION_DEPLOYMENT_GUIDE.md) - Complete deployment instructions
- [Security Implementation Summary](SECURITY_IMPLEMENTATION_SUMMARY.md) - Technical security details
- [Deployment Checklist](DEPLOYMENT_CHECKLIST.md) - Pre-deployment verification

### 🔒 **Security Documentation**
- [Final Security Status](FINAL_SECURITY_STATUS.md) - Executive security summary
- [Code Review Results](CODE_REVIEW_RESULTS.md) - Original security assessment

## 🚀 **Production Commands**

### Security Validation
```bash
npm run security:validate    # Validate security implementations
npm run security:startup     # Comprehensive startup validation
npm run security:full        # Complete security check
```

### Production Deployment
```bash
npm run production:validate  # Pre-deployment validation
npm run production:build     # Validated production build
npm run production:start     # Secure production start
```

### Development
```bash
npm run dev                  # Start development server
npm run build               # Build for production
npm run lint                # Code quality check
npm run type-check          # TypeScript validation
```

## 🏗️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript 5
- **Styling**: Tailwind CSS v4, Radix UI, Framer Motion
- **Forms**: React Hook Form, Zod validation
- **State**: Zustand
- **Infrastructure**: Docker, Nginx, PostgreSQL
- **Services**: Resend, Clerk Authentication
- **Analytics**: Self-hosted Plausible
- **Deployment**: Docker Compose, GitHub Actions

## Quick Start

1. Clone the repository:
```bash
git clone https://github.com/hudsor01/business-website.git
cd business-website
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment variables:
```bash
cp frontend/.env.local.example frontend/.env.local
```

4. Update `.env.local` with your values:
   - Add Resend API key
   - Configure email addresses
   - Set up Clerk authentication (optional for enhanced security)

5. Run development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run type-check` - Run TypeScript type checking
- `npm run docker:dev` - Start development with Docker
- `npm run docker:prod` - Start production with Docker

### Project Structure

```
business-website/
├── frontend/
│   ├── app/               # Next.js app directory
│   ├── components/        # React components
│   │   ├── sections/      # Page sections
│   │   └── ui/           # UI components
│   ├── lib/              # Utility functions
│   └── public/           # Static assets
├── docker/               # Docker configuration
├── nginx/               # Nginx configuration
├── scripts/             # Deployment scripts
├── docs/                # Documentation
└── docker-compose.yml   # Docker Compose config
```

## Deployment

### Prerequisites

- Ubuntu 22.04 LTS server
- Docker and Docker Compose installed
- Domain name pointing to server
- SSL certificates from Let's Encrypt

### Quick Deploy

1. SSH into your server
2. Clone the repository
3. Copy and configure `.env`
4. Run deployment:
```bash
./scripts/deploy.sh
```

See [docs/deployment.md](docs/deployment.md) for detailed instructions.

## CI/CD

The project uses GitHub Actions for automated deployment:

1. Push to `main` branch triggers the workflow
2. Tests are run automatically
3. Docker images are built and pushed
4. Deployment to production server via SSH

Configure these GitHub secrets:
- `DEPLOY_HOST`
- `DEPLOY_USER`
- `DEPLOY_KEY`
- `DEPLOY_PORT`

## Services

### Small Business Websites
- Professional design
- Mobile-responsive
- Contact forms
- SEO optimization

### Business Automation
- Email notifications
- Newsletter integration
- Lead capture
- Basic CRM setup

### Website Maintenance
- Monthly updates
- Security patches
- Content updates
- Performance monitoring

## Security

- SSL/TLS encryption with Let's Encrypt
- Clerk authentication with honeypot spam protection
- Security headers in Nginx
- Rate limiting for API endpoints
- Regular security updates

## Monitoring

- Health checks at `/api/health`
- Docker container monitoring
- Disk usage alerts
- Application error logging
- Analytics with Plausible

## Backup

Automated daily backups:
```bash
npm run backup
```

Backups are stored in `/backup` with 7-day retention.

## Support

For support or questions:
- Email: support@hudsondigitalsolutions.com
- GitHub Issues: [Create an issue](https://github.com/hudsor01/business-website-issues)

## License

© 2024 Hudson Digital Solutions. All rights reserved.