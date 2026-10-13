'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cancelMyBooking } from '@/actions/student'

export default function CancelBookingButton({ bookingId, label }: { bookingId: string; label: string }) {
    const router = useRouter()
    const [busy, setBusy] = useState(false)

    const cancel = async () => {
        if (!confirm(`Cancel your booking for ${label}?`)) return
        setBusy(true)
        const result = await cancelMyBooking(bookingId).catch(() => ({ error: 'Something went wrong. Please try again.' }))
        setBusy(false)
        if ('error' in result && result.error) alert(result.error)
        else router.refresh()
    }

    return (
        <button
            type="button"
            onClick={cancel}
            disabled={busy}
            style={{
                padding: '0.45rem 0.85rem', borderRadius: '8px', border: '1px solid #fecaca',
                background: '#fff5f5', color: '#b91c1c', fontWeight: 600, fontSize: '0.85rem',
                cursor: busy ? 'wait' : 'pointer', whiteSpace: 'nowrap',
            }}
        >
            {busy ? 'Cancelling...' : 'Cancel'}
        </button>
    )
}
