'use client'

import { useEffect } from 'react'

// Copies each table's column headings onto its cells as data-label, so the
// admin tables can collapse into labelled cards on small screens (see admin.module.css).
export default function TableLabels({ rootId }: { rootId: string }) {
    useEffect(() => {
        const root = document.getElementById(rootId)
        if (!root) return

        const label = () => {
            root.querySelectorAll('table').forEach(table => {
                const headings = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent?.trim() || '')
                if (!headings.length) return
                table.querySelectorAll('tbody tr').forEach(row => {
                    Array.from(row.children).forEach((cell, i) => {
                        if (headings[i] && cell.getAttribute('data-label') !== headings[i]) {
                            cell.setAttribute('data-label', headings[i])
                        }
                    })
                })
            })
        }

        label()
        const observer = new MutationObserver(label)
        observer.observe(root, { childList: true, subtree: true })
        return () => observer.disconnect()
    }, [rootId])

    return null
}
