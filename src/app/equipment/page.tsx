import { query } from '@/lib/db'
import styles from './page.module.css'
import LabDisplay from './LabDisplay'
import { RowDataPacket } from 'mysql2'

interface LabCategory extends RowDataPacket {
    id: string
    key: string
    label: string
    description: string
    icon: string
    labs: any[]
}

export default async function EquipmentPage() {
    const categories = await query<LabCategory[]>('SELECT * FROM lab_categories ORDER BY createdAt ASC')
    const labs = await query<any[]>('SELECT * FROM labs')

    // Transform data to match component structure
    const categoriesWithLabs = categories.map(cat => ({
        ...cat,
        labs: labs.filter(lab => lab.categoryId === cat.id)
    }));

    return (
        <main className={styles.main}>
            <div className={styles.header}>
                <h2>Lab Equipment</h2>
                <p>
                    State-of-the-art tools available for student innovation projects.
                </p>
            </div>

            <LabDisplay categories={categoriesWithLabs} />
        </main>
    )
}
