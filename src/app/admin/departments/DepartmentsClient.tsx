'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from '../admin.module.css'
import { deleteProgramme, saveDepartment, saveProgramme } from '@/actions/admin'

interface Programme {
    id: string
    name: string
    code: string
    level: string
    departmentId: string
    studentCount: number
}

export interface AdminDepartment {
    id: string
    name: string
    code: string
    description: string
    memberCount: number
    projectCount: number
    programmes: Programme[]
}

const LEVELS = ['Foundation', 'Diploma', 'Bachelor', 'Master']

export default function DepartmentsClient({ departments }: { departments: AdminDepartment[] }) {
    const router = useRouter()
    const [editingDept, setEditingDept] = useState<Partial<AdminDepartment> | null>(null)
    const [editingProg, setEditingProg] = useState<Partial<Programme> | null>(null)
    const [error, setError] = useState('')
    const [busy, setBusy] = useState(false)

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

    const removeProgramme = async (p: Programme) => {
        if (!confirm(`Delete the programme "${p.name}"?`)) return
        const result = await deleteProgramme(p.id)
        if (result.error) alert(result.error)
        else router.refresh()
    }

    return (
        <>
            <div className={styles.toolbar}>
                <p className={styles.hint}>Department codes appear in project links (for example /projects/development/se) and cannot be changed once created.</p>
                <div className={styles.toolbarActions}>
                    <button type="button" className={styles.primaryBtn} onClick={() => { setError(''); setEditingDept({}) }}>
                        <i className="fa-solid fa-plus"></i> Add Department
                    </button>
                </div>
            </div>

            <div className={styles.deptList}>
                {departments.map(d => (
                    <section key={d.id} className={styles.section}>
                        <div className={styles.deptHead}>
                            <div>
                                <h3 className={styles.deptName}>{d.name} <span className={styles.codeTag}>{d.code}</span></h3>
                                <p className={styles.hint}>{d.description || 'No description'}</p>
                                <p className={styles.deptStats}>
                                    <span><i className="fa-solid fa-users"></i> {d.memberCount} members</span>
                                    <span><i className="fa-solid fa-lightbulb"></i> {d.projectCount} projects</span>
                                </p>
                            </div>
                            <div className={styles.toolbarActions}>
                                <button type="button" className={styles.secondaryBtn} onClick={() => { setError(''); setEditingDept(d) }}>
                                    <i className="fa-solid fa-pen"></i> Edit
                                </button>
                                <button type="button" className={styles.secondaryBtn} onClick={() => { setError(''); setEditingProg({ departmentId: d.id, level: 'Bachelor' }) }}>
                                    <i className="fa-solid fa-plus"></i> Programme
                                </button>
                            </div>
                        </div>

                        {d.programmes.length === 0 ? (
                            <p className={styles.hint}>No programmes yet.</p>
                        ) : (
                            <ul className={styles.programmeList}>
                                {d.programmes.map(p => (
                                    <li key={p.id}>
                                        <div>
                                            <strong>{p.name}</strong>
                                            <small>{p.code} · {p.level} · {p.studentCount} {p.studentCount === 1 ? 'student' : 'students'}</small>
                                        </div>
                                        <div className={styles.actionBtns}>
                                            <button type="button" className={styles.cancelBtn} onClick={() => { setError(''); setEditingProg(p) }} aria-label={`Edit ${p.name}`}>
                                                <i className="fa-solid fa-pen"></i>
                                            </button>
                                            <button type="button" className={styles.rejectBtn} onClick={() => removeProgramme(p)} aria-label={`Delete ${p.name}`}>
                                                <i className="fa-solid fa-trash"></i>
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                ))}
            </div>

            {editingDept && (
                <div className={styles.modalOverlay} onClick={() => setEditingDept(null)}>
                    <div className={styles.modalBox} role="dialog" aria-modal="true" aria-labelledby="dept-title" onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHead}>
                            <h3 id="dept-title">{editingDept.id ? 'Edit Department' : 'Add Department'}</h3>
                            <button type="button" className={styles.modalClose} onClick={() => setEditingDept(null)} aria-label="Close"><i className="fa fa-times"></i></button>
                        </div>
                        <form className={styles.modalBody} onSubmit={e => submit(e, saveDepartment, () => setEditingDept(null))}>
                            <input type="hidden" name="id" value={editingDept.id || ''} />
                            <label className={styles.field}><span>Name *</span><input name="name" defaultValue={editingDept.name} required placeholder="e.g. Geomatics Engineering Department" /></label>
                            <label className={styles.field}>
                                <span>Code *</span>
                                <input name="code" defaultValue={editingDept.code} required={!editingDept.id} disabled={!!editingDept.id} maxLength={5} placeholder="e.g. GE" />
                            </label>
                            <label className={styles.field}><span>Description</span><textarea name="description" rows={3} defaultValue={editingDept.description} /></label>
                            {error && <div className={styles.formError}>{error}</div>}
                            <div className={styles.modalActions}>
                                <button type="button" className={styles.secondaryBtn} onClick={() => setEditingDept(null)}>Cancel</button>
                                <button type="submit" className={styles.primaryBtn} disabled={busy}>{busy ? 'Saving...' : 'Save'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {editingProg && (
                <div className={styles.modalOverlay} onClick={() => setEditingProg(null)}>
                    <div className={styles.modalBox} role="dialog" aria-modal="true" aria-labelledby="prog-title" onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHead}>
                            <h3 id="prog-title">{editingProg.id ? 'Edit Programme' : 'Add Programme'}</h3>
                            <button type="button" className={styles.modalClose} onClick={() => setEditingProg(null)} aria-label="Close"><i className="fa fa-times"></i></button>
                        </div>
                        <form className={styles.modalBody} onSubmit={e => submit(e, saveProgramme, () => setEditingProg(null))}>
                            <input type="hidden" name="id" value={editingProg.id || ''} />
                            <label className={styles.field}><span>Name *</span><input name="name" defaultValue={editingProg.name} required placeholder="e.g. BEng in Geomatics Engineering" /></label>
                            <div className={styles.formGrid2}>
                                <label className={styles.field}><span>Code *</span><input name="code" defaultValue={editingProg.code} required placeholder="e.g. BENG-GE" /></label>
                                <label className={styles.field}>
                                    <span>Level</span>
                                    <select name="level" defaultValue={editingProg.level}>
                                        {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                                    </select>
                                </label>
                            </div>
                            <label className={styles.field}>
                                <span>Department *</span>
                                <select name="departmentId" defaultValue={editingProg.departmentId} required>
                                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                            </label>
                            {error && <div className={styles.formError}>{error}</div>}
                            <div className={styles.modalActions}>
                                <button type="button" className={styles.secondaryBtn} onClick={() => setEditingProg(null)}>Cancel</button>
                                <button type="submit" className={styles.primaryBtn} disabled={busy}>{busy ? 'Saving...' : 'Save'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}
