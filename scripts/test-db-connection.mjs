#!/usr/bin/env node

/**
 * Database Connection Test Script
 * 
 * This script tests your Supabase Cloud connection and verifies
 * that your admin dashboard APIs will work correctly.
 */

import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

async function testDatabaseConnection() {
  console.log('🔍 Testing Supabase Cloud Connection...\n')
  
  const prisma = new PrismaClient({
    log: ['query', 'error', 'warn'],
  })

  try {
    // Test 1: Basic Connection
    console.log('1️⃣ Testing basic database connection...')
    await prisma.$connect()
    console.log('   ✅ Connected to database successfully!')
    
    // Test 2: Check if tables exist
    console.log('\n2️⃣ Checking database schema...')
    
    try {
      const tableCheck = await prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('contacts', 'newsletter_subscribers', 'page_views', 'lead_magnets')
      `
      
      console.log('   📋 Found tables:', tableCheck.map(t => t.table_name).join(', '))
      
      if (tableCheck.length === 0) {
        console.log('   ⚠️  No Prisma tables found. Run: npx prisma db push')
      }
    } catch (error) {
      console.log('   ⚠️  Tables not found. You may need to run: npx prisma db push')
    }
    
    // Test 3: Check if we can query (basic read test)
    console.log('\n3️⃣ Testing database queries...')
    
    try {
      const contactCount = await prisma.contact.count()
      console.log(`   📊 Contacts in database: ${contactCount}`)
      
      if (contactCount === 0) {
        console.log('   💡 No contacts yet. Submit a form to create test data!')
      }
    } catch (error) {
      console.log('   ⚠️  Could not query contacts table. Schema may need to be created.')
    }
    
    // Test 4: Test environment variables
    console.log('\n4️⃣ Checking environment configuration...')
    
    const requiredVars = [
      'DATABASE_URL',
      'NEXT_PUBLIC_SUPABASE_URL', 
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'JWT_SECRET',
      'ADMIN_USERNAME',
      'ADMIN_PASSWORD'
    ]
    
    const missingVars = requiredVars.filter(varName => !process.env[varName])
    
    if (missingVars.length === 0) {
      console.log('   ✅ All required environment variables are set!')
    } else {
      console.log('   ⚠️  Missing environment variables:', missingVars.join(', '))
    }
    
    // Test 5: Admin API simulation
    console.log('\n5️⃣ Testing admin API endpoints...')
    
    try {
      // Simulate what the admin dashboard does
      const [contacts, analytics] = await Promise.all([
        prisma.contact.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' }
        }),
        prisma.contact.groupBy({
          by: ['status'],
          _count: { id: true }
        })
      ])
      
      console.log('   ✅ Admin queries working correctly!')
      console.log(`   📈 Recent contacts: ${contacts.length}`)
      console.log(`   📊 Status breakdown: ${analytics.length} different statuses`)
      
    } catch (error) {
      console.log('   ⚠️  Admin queries failed. Schema needs to be created.')
    }
    
    console.log('\n🎉 Database connection test completed!')
    console.log('\n📋 Next Steps:')
    console.log('   1. If tables are missing: npx prisma db push')
    console.log('   2. Start your server: npm run dev') 
    console.log('   3. Visit: http://localhost:3000/admin')
    console.log('   4. Submit test forms to generate data')
    
  } catch (error) {
    console.error('\n❌ Database connection failed!')
    console.error('\n🔧 Common fixes:')
    console.error('   1. Check your DATABASE_URL in .env.local')
    console.error('   2. Verify Supabase project is not paused')
    console.error('   3. Ensure your password is correct')
    console.error('\n📋 Error details:')
    console.error(error.message)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the test
testDatabaseConnection().catch((error) => {
  console.error('Script failed:', error)
  process.exit(1)
})