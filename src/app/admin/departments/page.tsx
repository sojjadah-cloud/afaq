import { redirect } from 'next/navigation'
import { query } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { RowDataPacket } from '@/lib/types'
import AdminNav from '@/components/AdminNav'
import styles from '../admin.module.css'
import DepartmentsClient, { AdminDepartment } from './DepartmentsClient'
import { pageTitle } from '@/lib/metadata'
import { getT } from '@/i18n/server'

export const generateMetadata = () => pageTitle('Departments & Programmes')

export const dynamic = 'force-dynamic'

export default async function AdminDepartmentsPage() {
    const { t } = await getT()
    const session = await getSession()
    if (session.role !== 'ADMIN') redirect('/staff')

    const departments = await query<RowDataPacket[]>(`
        SELECT d.id, d.name, d.code, d.description,
               (SELECT COUNT(*) FROM student_profiles sp WHERE sp.departmentId = d.id) as memberCount,
               (SELECT COUNT(*) FROM projects p WHERE p.departmentId = d.id) as projectCount
        FROM departments d ORDER BY d.name
    `)
    const programmes = await query<RowDataPacket[]>(`
        SELECT pr.id, pr.name, pr.code, pr.level, pr.departmentId,
               (SELECT COUNT(*) FROM student_profiles sp WHERE sp.programmeId = pr.id) as studentCount
        FROM programmes pr ORDER BY pr.name
    `)

    const data: AdminDepartment[] = departments.map(d => ({
        id: d.id,
        name: d.name,
        code: d.code,
        description: d.description || '',
        memberCount: Number(d.memberCount) || 0,
        projectCount: Number(d.projectCount) || 0,
        programmes: programmes
            .filter(p => p.departmentId === d.id)
            .map(p => ({ id: p.id, name: p.name, code: p.code, level: p.level || 'Bachelor', departmentId: p.departmentId, studentCount: Number(p.studentCount) || 0 })),
    }))

    return (
        <main className={styles.main}>
            <div className={styles.header}>
                <h2>{t('Departments')}</h2>
                <p>{t('Academic departments and their programmes')}</p>
            </div>
            <AdminNav />
            <DepartmentsClient departments={data} />
        </main>
    )
}
