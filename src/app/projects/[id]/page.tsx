import { query } from '@/lib/db'
import { getSession } from '@/lib/auth'
import styles from './page.module.css'
import Link from 'next/link'
import { RowDataPacket } from '@/lib/types'
import { notFound } from 'next/navigation'
import ProjectActions from './ProjectActions'
import ProjectActivity, { ActivityItem, SupervisorPicker } from './ProjectActivity'
import { MarkdownRenderer } from '@/components/MarkdownRenderer'
import { initials } from '@/lib/utils'
import { CLUB_SLUG } from '@/lib/sections'
import { STAGES, StageKey, STATUS_LABELS } from '../stages'

export const dynamic = 'force-dynamic'

function fileIcon(name: string) {
    const ext = (String(name).split('.').pop() || '').toLowerCase()
    if (ext === 'pdf') return 'fa-file-pdf'
    if (ext === 'doc' || ext === 'docx') return 'fa-file-word'
    if (ext === 'ppt' || ext === 'pptx') return 'fa-file-powerpoint'
    if (ext === 'xls' || ext === 'xlsx') return 'fa-file-excel'
    if (ext === 'zip') return 'fa-file-zipper'
    return 'fa-file'
}

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
        `SELECT p.*, u.militaryId, sp.fullName as creatorName, d.name as departmentName, d.code as departmentCode
       FROM projects p
       LEFT JOIN users u ON p.createdById = u.id
       LEFT JOIN student_profiles sp ON u.id = sp.userId
       LEFT JOIN departments d ON d.id = p.departmentId
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

    const activityRows = await query<RowDataPacket[]>(
        `SELECT pu.id, pu.type, pu.message, pu.progress, pu.createdAt, u.role as authorRole,
                COALESCE(sp.fullName, u.militaryId, 'Former member') as authorName
         FROM project_updates pu
         LEFT JOIN users u ON u.id = pu.userId
         LEFT JOIN student_profiles sp ON sp.userId = pu.userId
         WHERE pu.projectId = ?
         ORDER BY pu.createdAt DESC`,
        [id]
    )
    const activity: ActivityItem[] = activityRows.map(r => ({
        id: r.id, type: r.type, message: r.message, progress: r.progress === null ? null : Number(r.progress),
        createdAt: String(r.createdAt), authorName: r.authorName, authorRole: r.authorRole || '',
    }))

    const isStaff = session.role === 'ADMIN' || session.role === 'STAFF'
    const isApprovedMember = isOwner || members.some(m => m.userId === session.userId && m.status === 'APPROVED')
    const supervisorRows = project.supervisorId
        ? await query<RowDataPacket[]>(
            'SELECT COALESCE(sp.fullName, u.militaryId) as name FROM users u LEFT JOIN student_profiles sp ON sp.userId = u.id WHERE u.id = ?',
            [project.supervisorId]
        )
        : []
    const supervisorName = supervisorRows[0]?.name || ''
    const staffOptions = isStaff
        ? await query<RowDataPacket[]>(
            `SELECT u.id, COALESCE(sp.fullName, u.militaryId) as name FROM users u
             LEFT JOIN student_profiles sp ON sp.userId = u.id
             WHERE u.role IN ('STAFF', 'ADMIN') AND u.isActive = 1 ORDER BY name`
        )
        : []

    // Approved members for ownership transfer
    const approvedMembers = members.filter(m => m.status === 'APPROVED')

    const sectionName = project.departmentName ? String(project.departmentName).replace(/ Department$/, '') : 'Scientific Club'
    const sectionSlug = project.departmentCode ? String(project.departmentCode).toLowerCase() : CLUB_SLUG
    const stage = (Object.keys(STAGES) as StageKey[]).find(k => (STAGES[k].statuses as readonly string[]).includes(project.status))
    const backHref = stage ? `/projects/${stage}/${sectionSlug}` : '/projects'

    return (
        <main className={styles.main}>
            <div className={styles.header}>
                <Link href={backHref} className={styles.backLink}>
                    <i className="fa-solid fa-arrow-left"></i> Back to {stage ? sectionName : 'Projects'}
                </Link>
                <div className={styles.titleSection}>
                    <h1>{project.title}</h1>
                    <span className={`${styles.status} ${styles[project.status.toLowerCase()]}`}>
                        {STATUS_LABELS[project.status] || project.status}
                    </span>
                </div>
                <div className={styles.meta}>
                    <span className={styles.metaItem}>
                        <i className="fa-solid fa-building-columns"></i> {sectionName}
                    </span>
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
                                            <a href={att.url} download={att.name} className={styles.fileLink}>
                                                <i className={`fa-solid ${fileIcon(att.name)}`}></i>
                                                <span>{att.name}</span>
                                                <i className="fa-solid fa-download" style={{ marginLeft: 'auto' }}></i>
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    <ProjectActivity
                        projectId={id}
                        items={activity}
                        canPostUpdate={isApprovedMember}
                        canPostFeedback={!isApprovedMember && isStaff}
                        currentProgress={Number(project.progress) || 0}
                        isCompleted={project.status === 'COMPLETED'}
                    />
                </div>

                <aside className={styles.sidebar}>
                    <div className={styles.card}>
                        <h3>Supervisor</h3>
                        {supervisorName ? (
                            <div className={styles.member}>
                                <div className={styles.memberAvatar}>{initials(supervisorName)}</div>
                                <div className={styles.memberInfo}>
                                    <span className={styles.memberName}>{supervisorName}</span>
                                    <span className={styles.memberRole}>Supervisor</span>
                                </div>
                            </div>
                        ) : (
                            <p className={styles.empty}>No supervisor assigned yet.</p>
                        )}
                        {isStaff && (
                            <SupervisorPicker
                                projectId={id}
                                current={project.supervisorId || ''}
                                staff={staffOptions.map(s => ({ id: String(s.id), name: String(s.name) }))}
                            />
                        )}
                    </div>

                    <div className={styles.card}>
                        <h3>Team Members</h3>
                        <div className={styles.memberList}>
                            {members.filter(m => m.status === 'APPROVED' || m.role === 'Owner').length === 0 ? (
                                <p className={styles.empty}>No active members.</p>
                            ) : (
                                members.filter(m => m.status === 'APPROVED' || m.role === 'Owner' || m.status === undefined).map(member => (
                                    <div key={member.userId} className={styles.member}>
                                        <div className={styles.memberAvatar}>
                                            {initials(member.fullName || member.militaryId)}
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
                                isAdmin={session.role === 'ADMIN'}
                            />
                        </div>
                    )}
                </aside>
            </div>
        </main>
    )
}
