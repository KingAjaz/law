import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in environment')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

async function syncUsers() {
    try {
        console.log('Fetching all auth users...')

        // Fetch all users using the admin API
        let allUsers = []
        let page = 1
        const limit = 500

        while (true) {
            const { data, error } = await supabase.auth.admin.listUsers({
                page: page,
                perPage: limit
            })

            if (error) throw error

            allUsers = [...allUsers, ...data.users]

            if (data.users.length < limit) {
                break
            }
            page++
        }

        console.log(`Found ${allUsers.length} total users in auth.users`)

        let syncedCount = 0
        let failedCount = 0

        console.log('Syncing users to public.profiles...')
        for (const user of allUsers) {
            if (!user.email) continue;

            const fullName = user.user_metadata?.full_name ||
                user.user_metadata?.name ||
                user.user_metadata?.display_name ||
                user.email.split('@')[0]

            const { error } = await supabase.from('profiles').upsert({
                id: user.id,
                email: user.email,
                full_name: fullName,
                role: 'user'
            }, { onConflict: 'id', ignoreDuplicates: true })

            if (error) {
                console.error(`Error syncing user ${user.email}:`, error.message)
                failedCount++
            } else {
                syncedCount++
            }
        }

        console.log('-----------------------------------')
        console.log(`Synchronization Complete!`)
        console.log(`Checked and Synced: ${syncedCount} users`)
        if (failedCount > 0) {
            console.log(`Failed to sync: ${failedCount} users`)
        }
        console.log('-----------------------------------')

    } catch (err) {
        console.error('An error occurred during sync:', err)
    }
}

syncUsers()
