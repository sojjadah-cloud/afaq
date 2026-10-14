'use client'

import { useState } from 'react'
import {
    exportBookingsCSV, exportClubRegistrationsCSV, exportContactMessagesCSV,
    exportEventsCSV, exportProjectsCSV, exportUsersCSV,
} from '@/actions/export'
import { useT } from '@/i18n/client'

const EXPORTS = {
    projects: exportProjectsCSV,
    bookings: exportBookingsCSV,
    users: exportUsersCSV,
    registrations: exportClubRegistrationsCSV,
    messages: exportContactMessagesCSV,
    events: exportEventsCSV,
}

export default function ExportButton({ kind, label = 'Export CSV' }: { kind: keyof typeof EXPORTS; label?: string }) {
    const t = useT()
    const [busy, setBusy] = useState(false)

    const download = async () => {
        setBusy(true)
        const result = await EXPORTS[kind]().catch(() => ({ error: 'Something went wrong. Please try again.' }))
        setBusy(false)
        if ('error' in result && result.error) {
            alert(t(result.error))
            return
        }
        if (!('csv' in result) || !result.csv) return
        // The BOM makes Excel read the file as UTF-8 (needed for Arabic names).
        const blob = new Blob(['﻿' + result.csv], { type: 'text/csv;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = result.filename || `${kind}.csv`
        a.click()
        URL.revokeObjectURL(url)
    }

    return (
        <button
            type="button"
            onClick={download}
            disabled={busy}
            style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.45rem',
                padding: '0.55rem 1rem', borderRadius: '10px', border: '1px solid #d1fae5',
                background: '#ecfdf5', color: '#047857', fontWeight: 700, fontSize: '0.88rem',
                cursor: busy ? 'wait' : 'pointer', whiteSpace: 'nowrap',
            }}
        >
            <i className={busy ? 'fa fa-spinner fa-spin' : 'fa-solid fa-file-csv'} aria-hidden="true"></i> {busy ? t('Exporting...') : t(label)}
        </button>
    )
}
