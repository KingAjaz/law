const { readFileSync, existsSync } = require('fs')
const { join } = require('path')
const { execSync } = require('child_process')

// Load environment variables from .env.local if it exists
function loadEnv() {
  const envPath = join(process.cwd(), '.env.local')
  if (existsSync(envPath)) {
    const envContent = readFileSync(envPath, 'utf-8')
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^=:#]+)=(.*)$/)
      if (match) {
        const key = match[1].trim()
        let value = match[2].trim()
        // Remove quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1)
        }
        if (!process.env[key]) {
          process.env[key] = value
        }
      }
    })
  }
}

loadEnv()

async function runMigration(filename) {
  console.log(`\n📄 Running migration: ${filename}...`)
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase environment variables!')
    console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local')
    process.exit(1)
  }
  
  // Extract connection details from Supabase URL
  // Format: https://[project-ref].supabase.co
  const match = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)
  if (!match) {
    console.error('❌ Invalid Supabase URL format')
    process.exit(1)
  }
  
  const projectRef = match[1]
  
  // Supabase connection string format
  // postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
  // We need to get the password from the service key or ask the user
  
  const migrationPath = join(process.cwd(), 'supabase', 'migrations', filename)
  const sql = readFileSync(migrationPath, 'utf-8')
  
  console.log('\n⚠️  To run migrations via terminal, you have a few options:')
  console.log('\n1. Use Supabase Dashboard SQL Editor (easiest):')
  console.log(`   - Open: ${supabaseUrl.replace('/rest/v1', '')}`)
  console.log(`   - Go to SQL Editor`)
  console.log(`   - Copy contents of: ${migrationPath}`)
  console.log('   - Paste and run')
  
  console.log('\n2. Use Supabase CLI (if installed):')
  console.log('   - Install: https://github.com/supabase/cli#install-the-cli')
  console.log('   - Run: supabase db push')
  
  console.log('\n3. Use psql with connection string:')
  console.log('   - Get your database password from Supabase Dashboard')
  console.log('   - Run: psql "postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres" -f ' + migrationPath)
  
  console.log(`\n📄 Migration file location: ${migrationPath}`)
  console.log('\n📋 SQL Content:')
  console.log('─'.repeat(60))
  console.log(sql.substring(0, 500))
  if (sql.length > 500) {
    console.log(`... (${sql.length - 500} more characters)`)
  }
  console.log('─'.repeat(60))
}

async function main() {
  const migrationFile = process.argv[2]
  
  if (!migrationFile) {
    console.error('❌ Please provide a migration filename')
    console.error('Usage: node scripts/run-migration-psql.js <migration-file>')
    console.error('Example: node scripts/run-migration-psql.js 003_update_pricing_tiers.sql')
    process.exit(1)
  }
  
  await runMigration(migrationFile)
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
