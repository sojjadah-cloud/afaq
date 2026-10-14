'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { registerUser, getDepartmentsAndProgrammes } from '@/actions/auth'
import styles from './page.module.css'
import { useT } from '@/i18n/client'
import LanguageSwitch from '@/components/LanguageSwitch'

interface Department {
    id: string
    name: string
    code: string
}

interface Programme {
    id: string
    name: string
    code: string
    departmentId: string
}

export default function RegisterPage() {
    const router = useRouter()
    const t = useT()
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [departments, setDepartments] = useState<Department[]>([])
    const [programmes, setProgrammes] = useState<Programme[]>([])
    const [selectedDept, setSelectedDept] = useState('')
    const [filteredProgrammes, setFilteredProgrammes] = useState<Programme[]>([])

    useEffect(() => {
        async function loadData() {
            const data = await getDepartmentsAndProgrammes()
            setDepartments(data.departments as Department[])
            setProgrammes(data.programmes as Programme[])
        }
        loadData()
    }, [])

    useEffect(() => {
        if (selectedDept) {
            setFilteredProgrammes(programmes.filter(p => p.departmentId === selectedDept))
        } else {
            setFilteredProgrammes([])
        }
    }, [selectedDept, programmes])

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError('')
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const result = await registerUser(formData)

        if (result?.error) {
            setError(t(result.error))
            setLoading(false)
        } else {
            router.push('/')
            router.refresh()
        }
    }

    return (
        <div className={styles.container}>
            {/* Left Side - Branding */}
            <div className={styles.brandingSide}>
                <div className={styles.brandingContent}>
                    <div className={styles.logo} aria-hidden="true">
                        <i className="fa fa-rocket"></i>
                    </div>
                    <h1>{t('AFAQ Innovation')}</h1>
                    <p>{t('Join the Military Technological College Innovation Community')}</p>

                    <div className={styles.features}>
                        <div className={styles.feature}>
                            <i className="fa fa-graduation-cap"></i>
                            <span>{t('Student Access')}</span>
                        </div>
                        <div className={styles.feature}>
                            <i className="fa fa-project-diagram"></i>
                            <span>{t('Create Projects')}</span>
                        </div>
                        <div className={styles.feature}>
                            <i className="fa fa-comments"></i>
                            <span>{t('Join Discussions')}</span>
                        </div>
                        <div className={styles.feature}>
                            <i className="fa fa-trophy"></i>
                            <span>{t('Earn Recognition')}</span>
                        </div>
                    </div>
                </div>
                <div className={styles.brandingFooter}>
                    <p>© {new Date().getFullYear()} {t('AFAQ Innovation Portal')}</p>
                </div>
            </div>

            {/* Right Side - Register Form */}
            <div className={styles.formSide}>
                <div className={styles.formContainer}>
                    <div className={styles.formHeader}>
                        <LanguageSwitch className={styles.langBtn} />
                        <h2>{t('Create Account')}</h2>
                        <p>{t('Register to access the innovation portal')}</p>
                    </div>

                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="fullName">
                                <i className="fa fa-user" aria-hidden="true"></i> {t('Full Name')}
                            </label>
                            <input
                                type="text"
                                id="fullName"
                                name="fullName"
                                placeholder={t('Enter your full name')}
                                required
                                autoComplete="name"
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="militaryId">
                                <i className="fa fa-id-card" aria-hidden="true"></i> {t('Military ID')}
                            </label>
                            <input
                                type="text"
                                id="militaryId"
                                name="militaryId"
                                placeholder={t('Enter your military ID')}
                                dir="ltr"
                                required
                                autoComplete="username"
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="email">
                                <i className="fa fa-envelope" aria-hidden="true"></i> {t('Email')}
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                placeholder={t('Enter your email address')}
                                required
                                autoComplete="email"
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="departmentId">
                                <i className="fa fa-building" aria-hidden="true"></i> {t('Department')}
                            </label>
                            <select
                                id="departmentId"
                                name="departmentId"
                                required
                                value={selectedDept}
                                onChange={(e) => setSelectedDept(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.875rem 1rem',
                                    fontSize: '1rem',
                                    border: '2px solid #e2e8f0',
                                    borderRadius: '12px',
                                    outline: 'none',
                                    background: '#f8fafc',
                                    cursor: 'pointer'
                                }}
                            >
                                <option value="">{t('Select your department')}</option>
                                {departments.map(dept => (
                                    <option key={dept.id} value={dept.id}>{t(dept.name)}</option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="programmeId">
                                <i className="fa fa-book" aria-hidden="true"></i> {t('Programme')}
                            </label>
                            <select
                                id="programmeId"
                                name="programmeId"
                                required
                                disabled={!selectedDept}
                                style={{
                                    width: '100%',
                                    padding: '0.875rem 1rem',
                                    fontSize: '1rem',
                                    border: '2px solid #e2e8f0',
                                    borderRadius: '12px',
                                    outline: 'none',
                                    background: selectedDept ? '#f8fafc' : '#f1f5f9',
                                    cursor: selectedDept ? 'pointer' : 'not-allowed',
                                    opacity: selectedDept ? 1 : 0.7
                                }}
                            >
                                <option value="">{selectedDept ? t('Select your programme') : t('Select department first')}</option>
                                {filteredProgrammes.map(prog => (
                                    <option key={prog.id} value={prog.id}>{t(prog.name)}</option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="yearLevel">
                                <i className="fa fa-layer-group" aria-hidden="true"></i> {t('Year Level')}
                            </label>
                            <select
                                id="yearLevel"
                                name="yearLevel"
                                style={{
                                    width: '100%',
                                    padding: '0.875rem 1rem',
                                    fontSize: '1rem',
                                    border: '2px solid #e2e8f0',
                                    borderRadius: '12px',
                                    outline: 'none',
                                    background: '#f8fafc',
                                    cursor: 'pointer'
                                }}
                            >
                                <option value="">{t('Select your year (optional)')}</option>
                                <option value="Level 1">{t('Level 1')}</option>
                                <option value="Level 2">{t('Level 2')}</option>
                                <option value="Level 3">{t('Level 3')}</option>
                                <option value="Level 4">{t('Level 4')}</option>
                                <option value="Graduate">{t('Graduate')}</option>
                            </select>
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="password">
                                <i className="fa fa-lock" aria-hidden="true"></i> {t('Password')}
                            </label>
                            <div className={styles.passwordInput}>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    name="password"
                                    placeholder={t('At least 8 characters, letters and numbers')}
                                    required
                                    minLength={8}
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    className={styles.togglePassword}
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? t('Hide password') : t('Show password')}
                                >
                                    <i className={`fa ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} aria-hidden="true"></i>
                                </button>
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="confirmPassword">
                                <i className="fa fa-lock" aria-hidden="true"></i> {t('Confirm Password')}
                            </label>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="confirmPassword"
                                name="confirmPassword"
                                placeholder={t('Confirm your password')}
                                required
                                minLength={8}
                                autoComplete="new-password"
                            />
                        </div>

                        {error && (
                            <div className={styles.error} role="alert">
                                <i className="fa fa-exclamation-circle" aria-hidden="true"></i> {error}
                            </div>
                        )}

                        <button type="submit" className={styles.submitBtn} disabled={loading}>
                            {loading ? (
                                <><i className="fa fa-spinner fa-spin" aria-hidden="true"></i> {t('Creating Account...')}</>
                            ) : (
                                <><i className="fa fa-user-plus" aria-hidden="true"></i> {t('Create Account')}</>
                            )}
                        </button>
                    </form>

                    <div className={styles.divider}>
                        <span>{t('or')}</span>
                    </div>

                    <Link href="/login" className={styles.signupBtn}>
                        <i className="fa fa-sign-in-alt" aria-hidden="true"></i> {t('Already have an account? Sign In')}
                    </Link>

                    <div className={styles.formFooter}>
                        <Link href="/" className={styles.backLink}>
                            <i className="fa fa-arrow-left" aria-hidden="true"></i> {t('Back to Home')}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
