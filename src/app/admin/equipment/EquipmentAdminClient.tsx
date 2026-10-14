'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from '../admin.module.css'
import { deleteLabItem, saveLabCategory, saveLabItem } from '@/actions/admin'
import { useT } from '@/i18n/client'

export interface AdminCategory {
    id: string
    key: string
    label: string
    description: string
    icon: string
    technician: string
    technicianContact: string
}

export interface AdminLab {
    id: string
    name: string
    shortDesc: string
    tag: string
    categoryId: string
    capacity: number
    location: string
    isBookable: boolean
    activeBookings: number
}

export default function EquipmentAdminClient({ categories, labs }: { categories: AdminCategory[]; labs: AdminLab[] }) {
    const router = useRouter()
    const t = useT()
    const [filter, setFilter] = useState<string>('ALL')
    const [search, setSearch] = useState('')
    const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(null)
    const [editingLab, setEditingLab] = useState<Partial<AdminLab> | null>(null)
    const [error, setError] = useState('')
    const [busy, setBusy] = useState(false)

    const categoryName = (id: string) => { const label = categories.find(c => c.id === id)?.label; return label ? t(label) : '—' }
    const visible = useMemo(() => {
        const q = search.trim().toLowerCase()
        return labs.filter(l =>
            (filter === 'ALL' || l.categoryId === filter) &&
            (!q || [l.name, l.tag, l.location, l.shortDesc].some(v => v.toLowerCase().includes(q)))
        )
    }, [labs, filter, search])

    const submit = async (e: React.FormEvent<HTMLFormElement>, action: (fd: FormData) => Promise<{ error?: string }>, close: () => void) => {
        e.preventDefault()
        setError('')
        setBusy(true)
        const result = await action(new FormData(e.currentTarget)).catch(() => ({ error: 'Something went wrong. Please try again.' }))
        setBusy(false)
        if (result.error) setError(t(result.error))
        else {
            close()
            router.refresh()
        }
    }

    const remove = async (lab: AdminLab) => {
        if (!confirm(t('Delete "{name}"? This cannot be undone.', { name: lab.name }))) return
        const result = await deleteLabItem(lab.id)
        if (result.error) alert(t(result.error))
        else router.refresh()
    }

    return (
        <>
            <h3 className={styles.blockTitle}>{t('Categories & technicians')}</h3>
            <div className={styles.categoryAdminGrid}>
                {categories.map(c => (
                    <div key={c.id} className={styles.categoryAdminCard}>
                        <div className={styles.categoryAdminHead}>
                            <span className={styles.categoryAdminIcon} aria-hidden="true"><i className={c.icon}></i></span>
                            <div>
                                <strong>{t(c.label)}</strong>
                                <small>{t('{n} items', { n: labs.filter(l => l.categoryId === c.id).length })}</small>
                            </div>
                        </div>
                        <p>{t(c.description)}</p>
                        <div className={styles.categoryAdminTech}>
                            <i className="fa-solid fa-user-gear" aria-hidden="true"></i>
                            <span>{c.technician || t('No technician assigned')}{c.technicianContact && <><br /><small dir="ltr">{c.technicianContact}</small></>}</span>
                        </div>
                        <button type="button" className={styles.secondaryBtn} onClick={() => { setError(''); setEditingCategory(c) }} aria-label={t('Edit {name}', { name: t(c.label) })}>
                            <i className="fa-solid fa-pen" aria-hidden="true"></i> {t('Edit')}
                        </button>
                    </div>
                ))}
            </div>

            <h3 className={styles.blockTitle}>{t('Items')}</h3>
            <div className={styles.toolbar}>
                <div className={styles.searchBox}>
                    <i className="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
                    <input type="search" placeholder={t('Search by name, tag or location')} value={search} onChange={e => setSearch(e.target.value)} aria-label={t('Search items')} />
                </div>
                <div className={styles.toolbarActions}>
                    <button
                        type="button"
                        className={styles.primaryBtn}
                        onClick={() => { setError(''); setEditingLab({ categoryId: filter !== 'ALL' ? filter : categories[0]?.id, capacity: 1, isBookable: true }) }}
                    >
                        <i className="fa-solid fa-plus" aria-hidden="true"></i> {t('Add Item')}
                    </button>
                </div>
            </div>
            <div className={styles.filterBar}>
                <button type="button" className={`${styles.filterBtn} ${filter === 'ALL' ? styles.active : ''}`} onClick={() => setFilter('ALL')}>{t('All')} ({labs.length})</button>
                {categories.map(c => (
                    <button key={c.id} type="button" className={`${styles.filterBtn} ${filter === c.id ? styles.active : ''}`} onClick={() => setFilter(c.id)}>
                        {t(c.label)} ({labs.filter(l => l.categoryId === c.id).length})
                    </button>
                ))}
            </div>

            <div className={styles.section}>
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>{t('Item')}</th>
                                <th>{t('Category')}</th>
                                <th>{t('Location')}</th>
                                <th>{t('Capacity')}</th>
                                <th>{t('Booking')}</th>
                                <th>{t('Actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {visible.length === 0 ? (
                                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>{t('No items match your filters.')}</td></tr>
                            ) : visible.map(l => (
                                <tr key={l.id}>
                                    <td>
                                        <strong>{l.name}</strong> <small style={{ color: '#94a3b8' }}>· {t(l.tag)}</small>
                                        <br />
                                        <small style={{ color: '#64748b' }}>{l.shortDesc}</small>
                                    </td>
                                    <td>{categoryName(l.categoryId)}</td>
                                    <td>{l.location || '—'}</td>
                                    <td>{l.capacity}</td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${l.isBookable ? styles.approved : styles.rejected}`}>
                                            {l.isBookable ? t('Available') : t('Hidden')}
                                        </span>
                                        {l.activeBookings > 0 && <><br /><small style={{ color: '#64748b' }}>{t('{n} active bookings', { n: l.activeBookings })}</small></>}
                                    </td>
                                    <td>
                                        <div className={styles.actionBtns}>
                                            <button type="button" className={styles.cancelBtn} onClick={() => { setError(''); setEditingLab(l) }} aria-label={t('Edit {name}', { name: l.name })}>
                                                <i className="fa-solid fa-pen" aria-hidden="true"></i> {t('Edit')}
                                            </button>
                                            <button type="button" className={styles.rejectBtn} onClick={() => remove(l)} aria-label={t('Delete {name}', { name: l.name })}>
                                                <i className="fa-solid fa-trash" aria-hidden="true"></i> {t('Delete')}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {editingCategory && (
                <div className={styles.modalOverlay} onClick={() => setEditingCategory(null)}>
                    <div className={styles.modalBox} role="dialog" aria-modal="true" aria-labelledby="cat-title" onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHead}>
                            <h3 id="cat-title">{t('Edit Category')}</h3>
                            <button type="button" className={styles.modalClose} onClick={() => setEditingCategory(null)} aria-label={t('Close')}><i className="fa fa-times" aria-hidden="true"></i></button>
                        </div>
                        <form className={styles.modalBody} onSubmit={e => submit(e, saveLabCategory, () => setEditingCategory(null))}>
                            <input type="hidden" name="id" value={editingCategory.id} />
                            <label className={styles.field}><span>{t('Name')} *</span><input name="label" defaultValue={editingCategory.label} required /></label>
                            <label className={styles.field}><span>{t('Description')}</span><textarea name="description" rows={3} defaultValue={editingCategory.description} /></label>
                            <div className={styles.formGrid2}>
                                <label className={styles.field}><span>{t('Technician')}</span><input name="technician" defaultValue={editingCategory.technician} placeholder={t('e.g. Eng. Khalid Al-Rashdi')} /></label>
                                <label className={styles.field}><span>{t('Contact')}</span><input name="technicianContact" defaultValue={editingCategory.technicianContact} placeholder={t('e.g. Ext. 2201')} /></label>
                            </div>
                            {error && <div className={styles.formError} role="alert">{error}</div>}
                            <div className={styles.modalActions}>
                                <button type="button" className={styles.secondaryBtn} onClick={() => setEditingCategory(null)}>{t('Cancel')}</button>
                                <button type="submit" className={styles.primaryBtn} disabled={busy}>{busy ? t('Saving...') : t('Save')}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {editingLab && (
                <div className={styles.modalOverlay} onClick={() => setEditingLab(null)}>
                    <div className={styles.modalBox} role="dialog" aria-modal="true" aria-labelledby="lab-title" onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHead}>
                            <h3 id="lab-title">{editingLab.id ? t('Edit Item') : t('Add Item')}</h3>
                            <button type="button" className={styles.modalClose} onClick={() => setEditingLab(null)} aria-label={t('Close')}><i className="fa fa-times" aria-hidden="true"></i></button>
                        </div>
                        <form className={styles.modalBody} onSubmit={e => submit(e, saveLabItem, () => setEditingLab(null))}>
                            <input type="hidden" name="id" value={editingLab.id || ''} />
                            <label className={styles.field}><span>{t('Name')} *</span><input name="name" defaultValue={editingLab.name} required /></label>
                            <label className={styles.field}><span>{t('Description')}</span><textarea name="shortDesc" rows={2} defaultValue={editingLab.shortDesc} /></label>
                            <div className={styles.formGrid2}>
                                <label className={styles.field}>
                                    <span>{t('Category')} *</span>
                                    <select name="categoryId" defaultValue={editingLab.categoryId} required>
                                        {categories.map(c => <option key={c.id} value={c.id}>{t(c.label)}</option>)}
                                    </select>
                                </label>
                                <label className={styles.field}><span>{t('Tag')}</span><input name="tag" defaultValue={editingLab.tag} placeholder={t('e.g. Electronics')} /></label>
                            </div>
                            <div className={styles.formGrid2}>
                                <label className={styles.field}><span>{t('Capacity / units')} *</span><input name="capacity" type="number" min={1} max={1000} defaultValue={editingLab.capacity} required /></label>
                                <label className={styles.field}><span>{t('Location')}</span><input name="location" defaultValue={editingLab.location} /></label>
                            </div>
                            <label className={styles.checkField}>
                                <input type="checkbox" name="isBookable" defaultChecked={editingLab.isBookable ?? true} /> {t('Available for booking')}
                            </label>
                            {error && <div className={styles.formError} role="alert">{error}</div>}
                            <div className={styles.modalActions}>
                                <button type="button" className={styles.secondaryBtn} onClick={() => setEditingLab(null)}>{t('Cancel')}</button>
                                <button type="submit" className={styles.primaryBtn} disabled={busy}>{busy ? t('Saving...') : t('Save')}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}
