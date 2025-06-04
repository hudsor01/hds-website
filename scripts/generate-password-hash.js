#!/usr/bin/env node

/**
 * Password Hash Generator
 * 
 * Generates bcrypt hashes for admin passwords
 * Usage: npm run generate:password-hash
 */

import bcrypt from 'bcrypt'
import readline from 'readline'
import { stdin as input, stdout as output } from 'process'

const rl = readline.createInterface({ input, output })

// Function to ask a question
function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve)
  })
}

// Function to ask for password with hidden input
function askPassword(question) {
  return new Promise((resolve) => {
    const stdin = process.stdin
    const stdout = process.stdout

    stdout.write(question)
    stdin.setRawMode(true)
    stdin.resume()
    stdin.setEncoding('utf8')

    let password = ''
    
    const onData = (char) => {
      char = char.toString()
      
      switch (char) {
        case '\n':
        case '\r':
        case '\u0004':
          // Enter or Ctrl-D
          stdin.setRawMode(false)
          stdin.pause()
          stdin.removeListener('data', onData)
          stdout.write('\n')
          resolve(password)
          break
        case '\u0003':
          // Ctrl-C
          stdout.write('\n')
          process.exit()
          break
        case '\u007f':
        case '\b':
          // Backspace
          if (password.length > 0) {
            password = password.slice(0, -1)
            stdout.write('\b \b')
          }
          break
        default:
          // Regular character
          password += char
          stdout.write('*')
          break
      }
    }
    
    stdin.on('data', onData)
  })
}

async function generateHash() {
  console.log('🔐 Admin Password Hash Generator\n')
  console.log('This tool generates a secure bcrypt hash for your admin password.')
  console.log('Use this hash in your ADMIN_PASSWORD_HASH environment variable.\n')

  try {
    // Get password
    const password = await askPassword('Enter admin password (min 8 chars): ')

    // Validate password
    if (password.length < 8) {
      console.error('❌ Password must be at least 8 characters long')
      process.exit(1)
    }

    // Check password complexity
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)
    const hasNonalphas = /\W/.test(password)

    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasNonalphas) {
      console.warn('⚠️  Warning: Password should contain uppercase, lowercase, numbers, and special characters')
      const confirm = await ask('Continue anyway? (y/N): ')
      if (confirm.toLowerCase() !== 'y') {
        process.exit(0)
      }
    }

    // Generate hash
    console.log('\n⏳ Generating hash...')
    const saltRounds = 12 // Recommended for production
    const hash = await bcrypt.hash(password, saltRounds)

    // Display results
    console.log('\n✅ Hash generated successfully!\n')
    console.log('Add this to your .env file:')
    console.log('─'.repeat(60))
    console.log(`ADMIN_PASSWORD_HASH=${hash}`)
    console.log('─'.repeat(60))
    console.log('\n💡 Tips:')
    console.log('• Remove ADMIN_PASSWORD from your .env file when using ADMIN_PASSWORD_HASH')
    console.log('• Keep your password safe - you cannot recover it from the hash')
    console.log('• Use different passwords for different environments')

  } catch (error) {
    console.error('❌ Error generating hash:', error.message)
    process.exit(1)
  } finally {
    rl.close()
  }
}

// Run the generator
generateHash()
