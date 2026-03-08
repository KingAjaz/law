import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function PUT(request: Request) {
    try {
        const supabase = createRouteHandlerClient({ cookies })

        // Check authentication
        const { data: { session }, error: authError } = await supabase.auth.getSession()
        if (authError || !session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const userId = session.user.id

        // Parse request body
        const body = await request.json()
        const { full_name, phone_number, address, city, state, country } = body

        // 1. Update public.users table (full_name)
        if (full_name) {
            const { error: userError } = await supabase
                .from('users')
                .update({
                    full_name,
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId)

            if (userError) {
                console.error('Error updating user profile:', userError)
                return NextResponse.json({ error: 'Failed to update user profile' }, { status: 500 })
            }
        }

        // 2. Update kyc_data table if the user has completed KYC
        // We only update fields that are explicitly provided
        const kycUpdates: any = {}
        if (full_name) {
            const parts = full_name.split(' ')
            kycUpdates.first_name = parts[0]
            kycUpdates.last_name = parts.length > 1 ? parts.slice(1).join(' ') : ''
        }
        if (phone_number !== undefined) kycUpdates.phone_number = phone_number
        if (address !== undefined) kycUpdates.address = address
        if (city !== undefined) kycUpdates.city = city
        if (state !== undefined) kycUpdates.state = state
        if (country !== undefined) kycUpdates.country = country

        if (Object.keys(kycUpdates).length > 0) {
            kycUpdates.updated_at = new Date().toISOString()

            const { error: kycError } = await supabase
                .from('kyc_data')
                .update(kycUpdates)
                .eq('user_id', userId)

            // It's possible the user hasn't done KYC yet, so we don't strictly fail if this fails silently,
            // but if there's an actual database error, we log it.
            if (kycError) {
                console.error('Error updating KYC data:', kycError)
            }
        }

        return NextResponse.json({ success: true, message: 'Profile updated successfully' })
    } catch (error) {
        console.error('Server error during profile update:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
