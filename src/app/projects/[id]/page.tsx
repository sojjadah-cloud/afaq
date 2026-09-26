import { query } from '@/lib/db'
import { getSession } from '@/lib/auth'
import styles from './page.module.css'
import Link from 'next/link'
import { RowDataPacket } from 'mysql2'
import { notFound } from 'next/navigation'
import ProjectActions from './ProjectActions'
import { MarkdownRenderer } from '@/components/MarkdownRenderer'

export const dynamic = 'force-dynamic'

interface Project extends RowDataPacket {
    id: string
    title: string
    description: string
    status: string
    category: string
    progress: number
    createdById: string
    createdAt: Date
    updatedAt: Date
    creatorName: string
}

interface Member extends RowDataPacket {
    userId: string
    fullName: string
    militaryId: string
    role: string
    status: string
}

export default async function ProjectDetails({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const session = await getSession()

    // Fetch Project Details with Creator Name
    const projects = await query<Project[]>(
        `SELECT p.*, u.militaryId, sp.fullName as creatorName 
       FROM projects p 
       LEFT JOIN users u ON p.createdById = u.id
       LEFT JOIN student_profiles sp ON u.id = sp.userId
       WHERE p.id = ?`,
        [id]
    )

    const project = projects[0]

    if (!project) {
        notFound()
    }

    // Fetch Project Members
    const members = await query<Member[]>(
        `SELECT pm.userId, pm.role, pm.status, sp.fullName, u.militaryId 
       FROM project_members pm
       JOIN users u ON pm.userId = u.id
       LEFT JOIN student_profiles sp ON u.id = sp.userId
       WHERE pm.projectId = ?`,
        [id]
    )

    // Fetch Attachments
    const attachments = await query<RowDataPacket[]>(
        'SELECT * FROM project_attachments WHERE projectId = ? ORDER BY uploadedAt DESC',
        [id]
    )

    // Check membership status
    let isMember = false
    let memberStatus
    const membership = members.find(m => m.userId === session.userId)
    if (membership) {
        isMember = true
        memberStatus = membership.status
    }

    const isOwner = project.createdById === session.userId

    // Fetch pending members if owner
    let pendingMembers: any[] = []
    if (isOwner) {
        pendingMembers = await query(
            `SELECT pm.userId, sp.fullName, u.militaryId 
             FROM project_members pm
             JOIN users u ON pm.userId = u.id
             LEFT JOIN student_profiles sp ON u.id = sp.userId
             WHERE pm.projectId = ? AND pm.status = 'PENDING'`,
            [id]
        )
    }

    // Approved members for ownership transfer
    const approvedMembers = members.filter(m => m.status === 'APPROVED')

    return (
        <main className={styles.main}>
            {/* ... Existing Header ... */}
            <div className={styles.header}>
                <Link href="/projects" className={styles.backLink}>
                    <i className="fa-solid fa-arrow-left"></i> Back to Projects
                </Link>
                <div className={styles.titleSection}>
                    <h1>{project.title}</h1>
                    <span className={`${styles.status} ${styles[project.status.toLowerCase()]}`}>
                        {project.status}
                    </span>
                </div>
                <div className={styles.meta}>
                    <span className={styles.metaItem}>
                        <i className="fa-solid fa-tag"></i> {project.category}
                    </span>
                    <span className={styles.metaItem}>
                        <i className="fa-solid fa-calendar"></i> {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                    <span className={styles.metaItem}>
                        <i className="fa-solid fa-user"></i> {project.creatorName || `User ${project.createdById}`}
                    </span>
                </div>
            </div>

            <div className={styles.grid}>
                <div className={styles.content}>
                    <section className={styles.section}>
                        <h2>Description</h2>
                        <div className={`${styles.description} markdown-content`}>
                            <MarkdownRenderer content={project.description} />
                        </div>
                    </section>

                    <section className={styles.section}>
                        <h2>Progress</h2>
                        <div className={styles.progressContainer}>
                            <div className={styles.progressBar}>
                                <div
                                    className={styles.progressFill}
                                    style={{ width: `${project.progress}%` }}
                                ></div>
                            </div>
                            <span className={styles.progressText}>{project.progress}% Complete</span>
                        </div>
                    </section>

                    {attachments.length > 0 && (
                        <section className={styles.section}>
                            <h2>Attachments</h2>
                            <div className={styles.attachmentList}>
                                {attachments.map(att => (
                                    <div key={att.id} className={styles.attachmentItem}>
                                        {att.type === 'IMAGE' ? (
                                            <div className={styles.imageWrapper}>
                                                <img
                                                    src={att.url}
                                                    alt={att.name}
                                                    className={styles.projectImage}
                                                />
                                                <span className={styles.imageCaption}>{att.name}</span>
                                            </div>
                                        ) : (
                                            <a href={att.url} target="_blank" rel="noopener noreferrer" className={styles.fileLink}>
                                                <i className="fa-solid fa-file-pdf"></i>
                                                {att.name}
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                <aside className={styles.sidebar}>
                    <div className={styles.card}>
                        <h3>Team Members</h3>
                        <div className={styles.memberList}>
                            {members.filter(m => m.status === 'APPROVED' || m.role === 'Owner').length === 0 ? (
                                <p className={styles.empty}>No active members.</p>
                            ) : (
                                members.filter(m => m.status === 'APPROVED' || m.role === 'Owner' || m.status === undefined).map(member => (
                                    <div key={member.userId} className={styles.member}>
                                        <div className={styles.memberAvatar}>
                                            {(member.fullName || member.militaryId).charAt(0)}
                                        </div>
                                        <div className={styles.memberInfo}>
                                            <span className={styles.memberName}>
                                                {member.fullName || `Cadet ${member.militaryId}`}
                                            </span>
                                            <span className={styles.memberRole}>{member.role}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {session.isLoggedIn && (
                        <div className={styles.card}>
                            <h3>Actions</h3>
                            <ProjectActions
                                projectId={id}
                                isOwner={isOwner}
                                isMember={isMember}
                                memberStatus={memberStatus}
                                pendingMembers={pendingMembers}
                                initialTitle={project.title}
                                initialDescription={project.description}
                                projectStatus={project.status}
                                approvedMembers={approvedMembers}
                            />
                        </div>
                    )}
                </aside>
            </div>
        </main>
    )
}
