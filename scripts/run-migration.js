const { readFileSync } = require('fs')
const { join } = require('path')
const https = require('https')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables!')
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// Extract project reference from Supabase URL
const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1]
if (!projectRef) {
  console.error('❌ Invalid Supabase URL format')
  process.exit(1)
}

async function runMigration(filename) {
  console.log(`\n📄 Running migration: ${filename}...`)
  
  try {
    const migrationPath = join(process.cwd(), 'supabase', 'migrations', filename)
    const sql = readFileSync(migrationPath, 'utf-8')
    
    // Split SQL into statements (respecting semicolons inside functions/blocks)
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`)
    
    // Execute each statement using Supabase REST API
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';'
      console.log(`\n⏳ Executing statement ${i + 1}/${statements.length}...`)
      
      try {
        await executeSQL(statement)
        console.log(`✅ Statement ${i + 1} completed`)
      } catch (error) {
        console.error(`❌ Error in statement ${i + 1}:`, error.message)
        console.error(`SQL: ${statement.substring(0, 100)}...`)
        throw error
      }
    }
    
    console.log(`\n✅ Migration ${filename} completed successfully!`)
    return true
  } catch (error) {
    console.error(`❌ Error running migration ${filename}:`, error.message)
    return false
  }
}

function executeSQL(sql) {
  return new Promise((resolve, reject) => {
    const url = new URL(`https://api.supabase.com/v1/projects/${projectRef}/database/query`)
    
    const options = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
      },
    }
    
    const req = https.request(url, options, (res) => {
      let data = ''
      
      res.on('data', (chunk) => {
        data += chunk
      })
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(data))
        } else {
          try {
            const error = JSON.parse(data)
            reject(new Error(error.message || `HTTP ${res.statusCode}: ${data}`))
          } catch {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`))
          }
        }
      })
    })
    
    req.on('error', (error) => {
      reject(error)
    })
    
    req.write(JSON.stringify({ query: sql }))
    req.end()
  })
}

async function main() {
  const migrationFile = process.argv[2]
  
  if (!migrationFile) {
    console.error('❌ Please provide a migration filename')
    console.error('Usage: node scripts/run-migration.js <migration-file>')
    console.error('Example: node scripts/run-migration.js 003_update_pricing_tiers.sql')
    process.exit(1)
  }
  
  const success = await runMigration(migrationFile)
  process.exit(success ? 0 : 1)
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
