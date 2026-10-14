import { query } from '@/lib/db'
import { RowDataPacket } from '@/lib/types'
import AdminNav from '@/components/AdminNav'
import styles from '../admin.module.css'
import EquipmentAdminClient, { AdminCategory, AdminLab } from './EquipmentAdminClient'
import { pageTitle } from '@/lib/metadata'
import { getT } from '@/i18n/server'

export const generateMetadata = () => pageTitle('Equipment Management')

export const dynamic = 'force-dynamic'

export default async function AdminEquipmentPage() {
    const { t } = await getT()
    const categories = await query<RowDataPacket[]>(
        'SELECT id, key, label, description, icon, technician, technicianContact FROM lab_categories ORDER BY sortOrder, createdAt'
    )
    const labs = await query<RowDataPacket[]>(`
        SELECT l.id, l.name, l.shortDesc, l.tag, l.categoryId, l.capacity, l.location, l.isBookable,
               (SELECT COUNT(*) FROM lab_bookings b WHERE b.labId = l.id AND b.status IN ('PENDING', 'APPROVED')) as activeBookings
        FROM labs l ORDER BY l.name
    `)

    return (
        <main className={styles.main}>
            <div className={styles.header}>
                <h2>{t('Equipment Management')}</h2>
                <p>{t('Workshops, labs, tools and the technicians responsible for them')}</p>
            </div>
            <AdminNav />
            <EquipmentAdminClient
                categories={categories.map(c => ({
                    id: c.id, key: c.key, label: c.label, description: c.description || '', icon: c.icon || 'fa-solid fa-flask',
                    technician: c.technician || '', technicianContact: c.technicianContact || '',
                })) as AdminCategory[]}
                labs={labs.map(l => ({
                    id: l.id, name: l.name, shortDesc: l.shortDesc || '', tag: l.tag || '', categoryId: l.categoryId,
                    capacity: Number(l.capacity) || 1, location: l.location || '', isBookable: Boolean(l.isBookable),
                    activeBookings: Number(l.activeBookings) || 0,
                })) as AdminLab[]}
            />
        </main>
    )
}
