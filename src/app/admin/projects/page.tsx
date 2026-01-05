import { getPendingProjects } from '@/actions/projects'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import ProjectsApprovalClient from './ProjectsApprovalClient'

export default async function AdminProjectsPage() {
    const session = await getSession()

    if (!session.isLoggedIn || (session.role !== 'ADMIN' && session.role !== 'STAFF')) {
        redirect('/')
    }

    const pendingProjects = await getPendingProjects()

    return (
        <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#1a202c', marginBottom: '0.5rem' }}>
                    <i className="fa-solid fa-tasks" style={{ marginRight: '0.75rem', color: 'var(--gold)' }}></i>
                    Project Approvals
                </h1>
                <p style={{ color: '#718096' }}>Review and approve project submissions and completion requests.</p>
            </div>

            <ProjectsApprovalClient projects={pendingProjects as any} />
        </main>
    )
}
