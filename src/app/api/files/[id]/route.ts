import { getSession } from '@/lib/auth'
import { getActiveUser } from '@/lib/session'
import { query } from '@/lib/db'
import { RowDataPacket } from '@/lib/types'

export const dynamic = 'force-dynamic'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
    const user = await getActiveUser(await getSession())
    if (!user) {
        return new Response('Unauthorized', { status: 401 })
    }

    const { id } = await params
    const rows = await query<RowDataPacket[]>('SELECT name, mimeType, size, data FROM files WHERE id = ?', [id])
    const file = rows[0]
    if (!file) {
        return new Response('Not found', { status: 404 })
    }

    // Only images render inline; everything else downloads so the browser never executes it.
    const disposition = String(file.mimeType).startsWith('image/') ? 'inline' : 'attachment'
    return new Response(new Uint8Array(file.data), {
        headers: {
            'Content-Type': file.mimeType,
            'Content-Length': String(file.size),
            'Content-Disposition': `${disposition}; filename*=UTF-8''${encodeURIComponent(file.name)}`,
            'Cache-Control': 'private, max-age=3600',
            'X-Content-Type-Options': 'nosniff',
        },
    })
}
