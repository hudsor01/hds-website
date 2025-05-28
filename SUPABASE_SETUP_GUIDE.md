# Supabase Cloud Setup Guide

## 🚀 **Quick Setup for Your Admin Dashboard**

Your admin dashboard is ready to work! You just need to configure your Supabase Cloud connection.

### Step 1: Get Your Supabase Credentials

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **Database**
4. Copy your **Connection string** (starts with `postgresql://postgres:...`)
5. Go to **Settings** → **API** 
6. Copy your **Project URL** and **anon public key**

### Step 2: Update Your .env.local File

Replace these values in your `.env.local` file:

```bash
# Replace [PASSWORD] and [PROJECT_REF] with your actual values
DATABASE_URL=postgresql://postgres:[YOUR_PASSWORD]@db.[YOUR_PROJECT_REF].supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:[YOUR_PASSWORD]@db.[YOUR_PROJECT_REF].supabase.co:5432/postgres

# Replace [PROJECT_REF] with your actual project reference  
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR_PROJECT_REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR_ACTUAL_ANON_KEY]
SUPABASE_SERVICE_ROLE_KEY=[YOUR_ACTUAL_SERVICE_ROLE_KEY]

# For email functionality (get from resend.com)
RESEND_API_KEY=re_[YOUR_ACTUAL_RESEND_KEY]
RESEND_FROM_EMAIL=noreply@yourdomain.com
CONTACT_EMAIL=hello@yourdomain.com
```

### Step 3: Set Up Your Database Schema

You have two options:

#### Option A: Use Prisma (Recommended)
```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Optional: Add some test data
npx prisma db seed
```

#### Option B: Use Supabase Migrations
```bash
# If you prefer to use your existing Supabase migrations
npx supabase db reset
```

### Step 4: Test Your Connection

```bash
# Test the database connection
npx prisma db pull

# Start your development server
npm run dev
```

### Step 5: Access Your Admin Dashboard

1. Start the server: `npm run dev`
2. Go to: `http://localhost:3000/admin`
3. Login with:
   - Username: `admin`
   - Password: `TestPassword123!`

## 🔧 **What Your Admin Dashboard Includes**

✅ **Working Features:**
- Contact management with real database queries
- Lead management and analytics  
- Dashboard analytics with real data
- Form submissions automatically stored
- Status management for leads/contacts
- Filtering and search functionality

✅ **Ready APIs:**
- `api.admin.getContacts` - Get all contacts with pagination
- `api.admin.getLeads` - Get all leads with filtering
- `api.admin.getContactAnalytics` - Real analytics data
- `api.admin.updateContactStatus` - Status management
- `api.admin.updateLeadStatus` - Lead pipeline management

## 🐛 **Troubleshooting**

### "Database connection failed"
- Double-check your `DATABASE_URL` in `.env.local`
- Make sure your Supabase project is not paused
- Verify your password doesn't contain special characters that need escaping

### "No data showing in admin dashboard"
- Run `npx prisma db push` to create tables
- Submit a test contact form to generate sample data
- Check that your environment variables are loaded correctly

### "Environment validation failed"
- Make sure all required variables are set in `.env.local`
- Restart your development server after changing environment variables

## 📊 **Sample Data**

Once connected, you can create sample data by:

1. Visiting your website and submitting contact forms
2. Using the Prisma Studio: `npx prisma studio`
3. Running the seed script (if available): `npx prisma db seed`

Your admin dashboard will immediately show real data once you have any contacts or form submissions!