import { getPendingProjects } from '@/actions/projects'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import ProjectsApprovalClient from './ProjectsApprovalClient'
import styles from '../admin.module.css'
import AdminNav from '@/components/AdminNav'
import ExportButton from '@/components/ExportButton'
import { pageTitle } from '@/lib/metadata'
import { getT } from '@/i18n/server'

export const generateMetadata = () => pageTitle('Project Approvals')

export const dynamic = 'force-dynamic'

export default async function AdminProjectsPage() {
    const { t } = await getT()
    const session = await getSession()

    if (!session.isLoggedIn || (session.role !== 'ADMIN' && session.role !== 'STAFF')) {
        redirect('/')
    }

    const pendingProjects = await getPendingProjects()

    return (
        <main className={styles.main}>
            <div className={styles.header}>
                <h2>{t('Project Approvals')}</h2>
                <p>{t('Review and approve project submissions and completion requests')}</p>
            </div>

            <AdminNav />

            <div className={styles.exportRow}>
                <ExportButton kind="projects" label="Export all projects" />
            </div>

            <ProjectsApprovalClient projects={pendingProjects as any} />
        </main>
    )
}
