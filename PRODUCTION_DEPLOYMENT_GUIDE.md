# Production Deployment Guide - Hudson Digital Solutions

**Complete step-by-step guide for secure production deployment**

## 🚀 Pre-Deployment Checklist

### 1. Generate Secure Credentials

#### JWT Secret (32+ characters)
```bash
# Method 1: OpenSSL
openssl rand -base64 32

# Method 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Method 3: Online (secure generator)
# Use: https://generate-random.org/api-key-generator?count=1&length=32&type=mixed-numbers-symbols
```

#### Admin Password Hash
```bash
# Install bcrypt if not available
npm install bcrypt

# Generate password hash
node -e "
const bcrypt = require('bcrypt');
const password = 'YourSecurePassword123!'; // Replace with your password
bcrypt.hash(password, 12).then(hash => {
  console.log('ADMIN_PASSWORD_HASH=' + hash);
});
"
```

#### Secure Admin Username
- **DO NOT USE**: admin, administrator, root, user
- **USE**: Your company name, unique identifier, or random string
- Example: `hudsondigital_admin`, `hds_admin_2024`

### 2. Environment Variables Setup

Create `.env.production` file:

```bash
# Core Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Security & Authentication (REQUIRED)
JWT_SECRET=your-32-character-secure-secret-here
ADMIN_USERNAME=your-secure-admin-username
ADMIN_PASSWORD_HASH=your-bcrypt-hashed-password

# Database (REQUIRED)
DATABASE_URL=postgresql://user:password@host:port/database

# Email Service (REQUIRED)
RESEND_API_KEY=re_your-resend-api-key
RESEND_FROM_EMAIL=noreply@your-domain.com
CONTACT_EMAIL=contact@your-domain.com

# Analytics (OPTIONAL)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_POSTHOG_KEY=phc_your-posthog-key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Feature Flags (OPTIONAL)
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_ERROR_REPORTING=true
NEXT_PUBLIC_MAINTENANCE_MODE=false
```

### 3. Security Validation

Run the security validation script:

```bash
# Set temporary environment variables for validation
export JWT_SECRET="your-32-character-secure-secret-here"
export ADMIN_USERNAME="your-secure-admin-username"
export ADMIN_PASSWORD="YourSecurePassword123!"
export RESEND_API_KEY="re_your-resend-api-key"
export DATABASE_URL="postgresql://user:password@host:port/database"
export NEXT_PUBLIC_APP_URL="https://your-domain.com"

# Run validation
node scripts/validate-security.cjs
```

Expected output:
```
✅ ALL SECURITY VALIDATIONS PASSED!
🚀 Security Status: PRODUCTION READY
🎯 Security Score: 9.2/10 - EXCELLENT
```

## 🔧 Deployment Methods

### Option 1: Vercel Deployment (Recommended)

#### Setup Vercel Account
1. Install Vercel CLI: `npm i -g vercel`
2. Login: `vercel login`
3. Link project: `vercel link`

#### Set Environment Variables
```bash
# Set production environment variables in Vercel
vercel env add JWT_SECRET
vercel env add ADMIN_USERNAME
vercel env add ADMIN_PASSWORD_HASH
vercel env add DATABASE_URL
vercel env add RESEND_API_KEY
vercel env add RESEND_FROM_EMAIL
vercel env add CONTACT_EMAIL
vercel env add NEXT_PUBLIC_APP_URL

# Optional variables
vercel env add NEXT_PUBLIC_GA_MEASUREMENT_ID
vercel env add NEXT_PUBLIC_POSTHOG_KEY
```

#### Deploy
```bash
# Deploy to production
vercel --prod

# Verify deployment
curl -I https://your-domain.vercel.app/
```

### Option 2: Docker Deployment

#### Build Docker Image
```bash
# Build production image
docker build -t hudson-digital-solutions .

# Run with environment file
docker run -d \
  --name hudson-app \
  --env-file .env.production \
  -p 3000:3000 \
  hudson-digital-solutions
```

#### Docker Compose (Advanced)
```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env.production
    restart: unless-stopped
    depends_on:
      - db
      
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: hudson_digital
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: your-db-password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

Deploy with:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Option 3: Traditional VPS/Server

#### Prerequisites
- Node.js 18+ installed
- PM2 process manager
- Nginx reverse proxy
- SSL certificate (Let's Encrypt)

#### Build and Deploy
```bash
# 1. Build application
npm run build

# 2. Install PM2 globally
npm install -g pm2

# 3. Create PM2 ecosystem file
# ecosystem.config.js
module.exports = {
  apps: [{
    name: 'hudson-digital-solutions',
    script: 'npm',
    args: 'start',
    env_file: '.env.production',
    instances: 'max',
    exec_mode: 'cluster',
    max_memory_restart: '1G',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
  }]
}

# 4. Start with PM2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

#### Nginx Configuration
```nginx
# /etc/nginx/sites-available/hudson-digital
server {
    listen 80;
    listen [::]:80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE+AESGCM:ECDHE+CHACHA20:DHE+AESGCM:DHE+CHACHA20:!aNULL:!MD5:!DSS;
    ssl_prefer_server_ciphers off;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔍 Post-Deployment Verification

### 1. Security Headers Check
```bash
# Check security headers
curl -I https://your-domain.com/

# Expected headers:
# Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-...
# Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
# X-Frame-Options: DENY
# X-Content-Type-Options: nosniff
```

### 2. Authentication Test
```bash
# Test login endpoint (should fail with rate limiting after 5 attempts)
for i in {1..6}; do 
  curl -X POST https://your-domain.com/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"test","password":"wrong"}' \
    -w "\nHTTP Status: %{http_code}\n"
done
```

### 3. SSL/TLS Check
```bash
# Check SSL rating (should be A+)
curl -s "https://api.ssllabs.com/api/v3/analyze?host=your-domain.com" | jq '.endpoints[0].grade'
```

### 4. Performance Check
```bash
# Check response times
curl -w "@curl-format.txt" -o /dev/null -s https://your-domain.com/

# curl-format.txt:
#      time_namelookup:  %{time_namelookup}s\n
#         time_connect:  %{time_connect}s\n
#      time_appconnect:  %{time_appconnect}s\n
#     time_pretransfer:  %{time_pretransfer}s\n
#        time_redirect:  %{time_redirect}s\n
#   time_starttransfer:  %{time_starttransfer}s\n
#                     ----------\n
#           time_total:  %{time_total}s\n
```

## 🔧 Monitoring & Maintenance

### 1. Log Monitoring
```bash
# PM2 logs
pm2 logs hudson-digital-solutions

# Docker logs
docker logs hudson-app

# Vercel logs
vercel logs
```

### 2. Security Monitoring
- Monitor failed authentication attempts
- Set up alerts for rate limiting triggers
- Review security headers periodically
- Update dependencies regularly

### 3. Performance Monitoring
- Monitor response times
- Check memory usage
- Monitor database performance
- Set up uptime monitoring

## 🚨 Emergency Procedures

### Security Incident Response
1. **Immediate Actions**:
   - Rotate JWT_SECRET immediately
   - Disable admin account temporarily
   - Review authentication logs
   - Check for unusual activity

2. **Investigation**:
   - Analyze access logs
   - Check for data breaches
   - Identify attack vectors
   - Document incident

3. **Recovery**:
   - Apply security patches
   - Update passwords
   - Enhance monitoring
   - Communicate with stakeholders

### Backup & Recovery
```bash
# Database backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Code backup
git tag release-$(date +%Y%m%d_%H%M%S)
git push origin --tags
```

## ✅ Final Checklist

Before going live, ensure:

- [ ] All environment variables are set correctly
- [ ] Security validation script passes
- [ ] SSL certificate is valid and configured
- [ ] Security headers are present
- [ ] Authentication is working correctly
- [ ] Rate limiting is functional
- [ ] Monitoring is set up
- [ ] Backup procedures are in place
- [ ] Team has access to production systems
- [ ] Documentation is updated

## 🎯 Success Metrics

Your deployment is successful when:
- Security validation score: 9.0+/10
- SSL Labs rating: A or A+
- Authentication works without issues
- Rate limiting prevents brute force attacks
- All security headers are present
- Performance is within acceptable limits
- Monitoring alerts are configured

---

**🚀 You're ready for production deployment!**

Contact support if you encounter any issues during deployment.