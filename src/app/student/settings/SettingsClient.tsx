'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { changePassword, updateProfile } from '@/actions/student'
import styles from './settings.module.css'
import { useT } from '@/i18n/client'

interface Profile {
    fullName: string
    phone: string
    bio: string
    departmentId: string
    programmeId: string
    yearLevel: string
    militaryId: string
    email: string
    role: string
}

type Status = { type: 'success' | 'error'; text: string } | null

export default function SettingsClient({ profile, departments, programmes }: {
    profile: Profile
    departments: { id: string; name: string }[]
    programmes: { id: string; name: string; departmentId: string }[]
}) {
    const router = useRouter()
    const t = useT()
    const [dept, setDept] = useState(profile.departmentId)
    const [profileStatus, setProfileStatus] = useState<Status>(null)
    const [passwordStatus, setPasswordStatus] = useState<Status>(null)
    const [busy, setBusy] = useState<'profile' | 'password' | null>(null)
    const isStudent = profile.role === 'STUDENT'

    const saveProfile = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setBusy('profile')
        setProfileStatus(null)
        const result = await updateProfile(new FormData(e.currentTarget)).catch(() => ({ error: 'Something went wrong. Please try again.' }))
        setBusy(null)
        if ('error' in result && result.error) setProfileStatus({ type: 'error', text: t(result.error) })
        else {
            setProfileStatus({ type: 'success', text: t('Your profile has been saved.') })
            router.refresh()
        }
    }

    const savePassword = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const form = e.currentTarget
        setBusy('password')
        setPasswordStatus(null)
        const result = await changePassword(new FormData(form)).catch(() => ({ error: 'Something went wrong. Please try again.' }))
        setBusy(null)
        if ('error' in result && result.error) setPasswordStatus({ type: 'error', text: t(result.error) })
        else {
            form.reset()
            setPasswordStatus({ type: 'success', text: t('Password changed. You have been signed out on other devices.') })
        }
    }

    return (
        <div className={styles.grid}>
            <section className={styles.card} aria-labelledby="profile-title">
                <h3 id="profile-title"><i className="fa-solid fa-id-card" aria-hidden="true"></i> {t('Personal details')}</h3>
                <div className={styles.readonly}>
                    <div><small>{t('Military ID')}</small><strong dir="ltr">{profile.militaryId}</strong></div>
                    <div><small>{t('Email')}</small><strong dir="ltr">{profile.email}</strong></div>
                </div>
                <form onSubmit={saveProfile} className={styles.form}>
                    <label className={styles.field}>
                        <span>{t('Full Name')} *</span>
                        <input name="fullName" defaultValue={profile.fullName} required minLength={3} maxLength={100} autoComplete="name" />
                    </label>
                    <label className={styles.field}>
                        <span>{t('Phone')}</span>
                        <input name="phone" type="tel" defaultValue={profile.phone} placeholder="+968 9123 4567" autoComplete="tel" />
                    </label>
                    <div className={styles.row}>
                        <label className={styles.field}>
                            <span>{t('Department')} *</span>
                            <select name="departmentId" value={dept} onChange={e => setDept(e.target.value)} required>
                                <option value="">{t('Select...')}</option>
                                {departments.map(d => <option key={d.id} value={d.id}>{t(d.name)}</option>)}
                            </select>
                        </label>
                        <label className={styles.field}>
                            <span>{t('Programme')}{isStudent ? ' *' : ''}</span>
                            <select name="programmeId" defaultValue={dept === profile.departmentId ? profile.programmeId : ''} key={dept} required={isStudent}>
                                <option value="">{isStudent ? t('Select...') : t('None')}</option>
                                {programmes.filter(p => p.departmentId === dept).map(p => <option key={p.id} value={p.id}>{t(p.name)}</option>)}
                            </select>
                        </label>
                    </div>
                    {isStudent && (
                        <label className={styles.field}>
                            <span>{t('Year Level')}</span>
                            <select name="yearLevel" defaultValue={profile.yearLevel}>
                                <option value="">{t('Not specified')}</option>
                                {['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Graduate'].map(l => <option key={l} value={l}>{t(l)}</option>)}
                            </select>
                        </label>
                    )}
                    <label className={styles.field}>
                        <span>{t('Short bio')}</span>
                        <textarea name="bio" rows={3} maxLength={500} defaultValue={profile.bio} placeholder={t('Your interests and skills')} />
                    </label>
                    {profileStatus && <div className={profileStatus.type === 'success' ? styles.success : styles.error} role="status">{profileStatus.text}</div>}
                    <button type="submit" className={styles.submit} disabled={busy === 'profile'}>
                        {busy === 'profile' ? t('Saving...') : t('Save details')}
                    </button>
                </form>
            </section>

            <section className={styles.card} aria-labelledby="password-title">
                <h3 id="password-title"><i className="fa-solid fa-lock" aria-hidden="true"></i> {t('Change password')}</h3>
                <form onSubmit={savePassword} className={styles.form}>
                    <label className={styles.field}>
                        <span>{t('Current password')} *</span>
                        <input name="currentPassword" type="password" required autoComplete="current-password" />
                    </label>
                    <label className={styles.field}>
                        <span>{t('New password')} *</span>
                        <input name="newPassword" type="password" required minLength={8} autoComplete="new-password" />
                        <small>{t('At least 8 characters, with letters and numbers.')}</small>
                    </label>
                    <label className={styles.field}>
                        <span>{t('Confirm new password')} *</span>
                        <input name="confirmPassword" type="password" required minLength={8} autoComplete="new-password" />
                    </label>
                    {passwordStatus && <div className={passwordStatus.type === 'success' ? styles.success : styles.error} role="status">{passwordStatus.text}</div>}
                    <button type="submit" className={styles.submit} disabled={busy === 'password'}>
                        {busy === 'password' ? t('Updating...') : t('Change password')}
                    </button>
                </form>
            </section>
        </div>
    )
}
