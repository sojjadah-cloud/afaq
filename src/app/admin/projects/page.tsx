import { getPendingProjects } from '@/actions/projects'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import ProjectsApprovalClient from './ProjectsApprovalClient'
import styles from '../admin.module.css'
import AdminNav from '@/components/AdminNav'

export const dynamic = 'force-dynamic'

export default async function AdminProjectsPage() {
    const session = await getSession()

    if (!session.isLoggedIn || (session.role !== 'ADMIN' && session.role !== 'STAFF')) {
        redirect('/')
    }

    const pendingProjects = await getPendingProjects()

    return (
        <main className={styles.main}>
            <div className={styles.header}>
                <h2>Project Approvals</h2>
                <p>Review and approve project submissions and completion requests</p>
            </div>

            <AdminNav />

            <ProjectsApprovalClient projects={pendingProjects as any} />
        </main>
    )
}
