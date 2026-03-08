import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function DELETE(request: Request) {
    try {
        const supabase = createRouteHandlerClient({ cookies })

        // Check authentication
        const { data: { session }, error: authError } = await supabase.auth.getSession()
        if (authError || !session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Call the custom RPC to delete the user account from auth.users
        const { error: deleteError } = await supabase.rpc('delete_user_account')

        if (deleteError) {
            console.error('Error invoking delete_user_account RPC:', deleteError)
            return NextResponse.json({ error: 'Failed to delete account. Please contact support.' }, { status: 500 })
        }

        // Sign out to clear local session cookies
        await supabase.auth.signOut()

        return NextResponse.json({ success: true, message: 'Account deleted successfully' })
    } catch (error) {
        console.error('Server error during account deletion:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
