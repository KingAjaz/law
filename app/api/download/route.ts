import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const url = searchParams.get('url')
        const filename = searchParams.get('filename') || 'document'

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 })
        }

        // Verify user is authenticated
        const supabase = createSupabaseServer()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Fetch the file from Supabase Storage
        const response = await fetch(url)

        if (!response.ok) {
            throw new Error(`Failed to fetch file: ${response.statusText}`)
        }

        const blob = await response.blob()
        const mimeType = response.headers.get('content-type') || 'application/octet-stream'

        // Create a new response with the file and force-download headers
        return new NextResponse(blob, {
            status: 200,
            headers: {
                'Content-Type': mimeType,
                'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
                'Cache-Control': 'no-cache',
            },
        })
    } catch (error: any) {
        console.error('Download proxy ERROR DETAILS:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        })
        return NextResponse.json(
            { error: error.message || 'Failed to download file' },
            { status: 500 }
        )
    }
}
