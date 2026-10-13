'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from '../admin.module.css'
import { deleteLabItem, saveLabCategory, saveLabItem } from '@/actions/admin'

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
    const [filter, setFilter] = useState<string>('ALL')
    const [search, setSearch] = useState('')
    const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(null)
    const [editingLab, setEditingLab] = useState<Partial<AdminLab> | null>(null)
    const [error, setError] = useState('')
    const [busy, setBusy] = useState(false)

    const categoryName = (id: string) => categories.find(c => c.id === id)?.label || '—'
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
        const result = await action(new FormData(e.currentTarget))
        setBusy(false)
        if (result.error) setError(result.error)
        else {
            close()
            router.refresh()
        }
    }

    const remove = async (lab: AdminLab) => {
        if (!confirm(`Delete "${lab.name}"? This cannot be undone.`)) return
        const result = await deleteLabItem(lab.id)
        if (result.error) alert(result.error)
        else router.refresh()
    }

    return (
        <>
            <h3 className={styles.blockTitle}>Categories &amp; technicians</h3>
            <div className={styles.categoryAdminGrid}>
                {categories.map(c => (
                    <div key={c.id} className={styles.categoryAdminCard}>
                        <div className={styles.categoryAdminHead}>
                            <span className={styles.categoryAdminIcon}><i className={c.icon}></i></span>
                            <div>
                                <strong>{c.label}</strong>
                                <small>{labs.filter(l => l.categoryId === c.id).length} items</small>
                            </div>
                        </div>
                        <p>{c.description}</p>
                        <div className={styles.categoryAdminTech}>
                            <i className="fa-solid fa-user-gear"></i>
                            <span>{c.technician || 'No technician assigned'}{c.technicianContact && <><br /><small>{c.technicianContact}</small></>}</span>
                        </div>
                        <button type="button" className={styles.secondaryBtn} onClick={() => { setError(''); setEditingCategory(c) }}>
                            <i className="fa-solid fa-pen"></i> Edit
                        </button>
                    </div>
                ))}
            </div>

            <h3 className={styles.blockTitle}>Items</h3>
            <div className={styles.toolbar}>
                <div className={styles.searchBox}>
                    <i className="fa-solid fa-magnifying-glass"></i>
                    <input type="search" placeholder="Search by name, tag or location" value={search} onChange={e => setSearch(e.target.value)} aria-label="Search items" />
                </div>
                <div className={styles.toolbarActions}>
                    <button
                        type="button"
                        className={styles.primaryBtn}
                        onClick={() => { setError(''); setEditingLab({ categoryId: filter !== 'ALL' ? filter : categories[0]?.id, capacity: 1, isBookable: true }) }}
                    >
                        <i className="fa-solid fa-plus"></i> Add Item
                    </button>
                </div>
            </div>
            <div className={styles.filterBar}>
                <button type="button" className={`${styles.filterBtn} ${filter === 'ALL' ? styles.active : ''}`} onClick={() => setFilter('ALL')}>All ({labs.length})</button>
                {categories.map(c => (
                    <button key={c.id} type="button" className={`${styles.filterBtn} ${filter === c.id ? styles.active : ''}`} onClick={() => setFilter(c.id)}>
                        {c.label} ({labs.filter(l => l.categoryId === c.id).length})
                    </button>
                ))}
            </div>

            <div className={styles.section}>
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Category</th>
                                <th>Location</th>
                                <th>Capacity</th>
                                <th>Booking</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {visible.length === 0 ? (
                                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No items match your filters.</td></tr>
                            ) : visible.map(l => (
                                <tr key={l.id}>
                                    <td>
                                        <strong>{l.name}</strong> <small style={{ color: '#94a3b8' }}>· {l.tag}</small>
                                        <br />
                                        <small style={{ color: '#64748b' }}>{l.shortDesc}</small>
                                    </td>
                                    <td>{categoryName(l.categoryId)}</td>
                                    <td>{l.location || '—'}</td>
                                    <td>{l.capacity}</td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${l.isBookable ? styles.approved : styles.rejected}`}>
                                            {l.isBookable ? 'Available' : 'Hidden'}
                                        </span>
                                        {l.activeBookings > 0 && <><br /><small style={{ color: '#64748b' }}>{l.activeBookings} active booking{l.activeBookings > 1 ? 's' : ''}</small></>}
                                    </td>
                                    <td>
                                        <div className={styles.actionBtns}>
                                            <button type="button" className={styles.cancelBtn} onClick={() => { setError(''); setEditingLab(l) }}>
                                                <i className="fa-solid fa-pen"></i> Edit
                                            </button>
                                            <button type="button" className={styles.rejectBtn} onClick={() => remove(l)}>
                                                <i className="fa-solid fa-trash"></i> Delete
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
                            <h3 id="cat-title">Edit Category</h3>
                            <button type="button" className={styles.modalClose} onClick={() => setEditingCategory(null)} aria-label="Close"><i className="fa fa-times"></i></button>
                        </div>
                        <form className={styles.modalBody} onSubmit={e => submit(e, saveLabCategory, () => setEditingCategory(null))}>
                            <input type="hidden" name="id" value={editingCategory.id} />
                            <label className={styles.field}><span>Name *</span><input name="label" defaultValue={editingCategory.label} required /></label>
                            <label className={styles.field}><span>Description</span><textarea name="description" rows={3} defaultValue={editingCategory.description} /></label>
                            <div className={styles.formGrid2}>
                                <label className={styles.field}><span>Technician</span><input name="technician" defaultValue={editingCategory.technician} placeholder="e.g. Eng. Khalid Al-Rashdi" /></label>
                                <label className={styles.field}><span>Contact</span><input name="technicianContact" defaultValue={editingCategory.technicianContact} placeholder="e.g. Ext. 2201" /></label>
                            </div>
                            {error && <div className={styles.formError}>{error}</div>}
                            <div className={styles.modalActions}>
                                <button type="button" className={styles.secondaryBtn} onClick={() => setEditingCategory(null)}>Cancel</button>
                                <button type="submit" className={styles.primaryBtn} disabled={busy}>{busy ? 'Saving...' : 'Save'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {editingLab && (
                <div className={styles.modalOverlay} onClick={() => setEditingLab(null)}>
                    <div className={styles.modalBox} role="dialog" aria-modal="true" aria-labelledby="lab-title" onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHead}>
                            <h3 id="lab-title">{editingLab.id ? 'Edit Item' : 'Add Item'}</h3>
                            <button type="button" className={styles.modalClose} onClick={() => setEditingLab(null)} aria-label="Close"><i className="fa fa-times"></i></button>
                        </div>
                        <form className={styles.modalBody} onSubmit={e => submit(e, saveLabItem, () => setEditingLab(null))}>
                            <input type="hidden" name="id" value={editingLab.id || ''} />
                            <label className={styles.field}><span>Name *</span><input name="name" defaultValue={editingLab.name} required /></label>
                            <label className={styles.field}><span>Description</span><textarea name="shortDesc" rows={2} defaultValue={editingLab.shortDesc} /></label>
                            <div className={styles.formGrid2}>
                                <label className={styles.field}>
                                    <span>Category *</span>
                                    <select name="categoryId" defaultValue={editingLab.categoryId} required>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                                    </select>
                                </label>
                                <label className={styles.field}><span>Tag</span><input name="tag" defaultValue={editingLab.tag} placeholder="e.g. Electronics" /></label>
                            </div>
                            <div className={styles.formGrid2}>
                                <label className={styles.field}><span>Capacity / units *</span><input name="capacity" type="number" min={1} max={1000} defaultValue={editingLab.capacity} required /></label>
                                <label className={styles.field}><span>Location</span><input name="location" defaultValue={editingLab.location} /></label>
                            </div>
                            <label className={styles.checkField}>
                                <input type="checkbox" name="isBookable" defaultChecked={editingLab.isBookable ?? true} /> Available for booking
                            </label>
                            {error && <div className={styles.formError}>{error}</div>}
                            <div className={styles.modalActions}>
                                <button type="button" className={styles.secondaryBtn} onClick={() => setEditingLab(null)}>Cancel</button>
                                <button type="submit" className={styles.primaryBtn} disabled={busy}>{busy ? 'Saving...' : 'Save'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}
