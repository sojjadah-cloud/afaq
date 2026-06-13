const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

function makeId(prefix = 'id') {
    return `${prefix}_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`;
}

async function main() {
    console.log('🌱 Starting database seed via mysql2...');
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'afaq_innovation'
    });

    try {
        // 1. Departments
        let [depts] = await connection.execute('SELECT id FROM departments WHERE code = ?', ['CS']);
        let cyberDeptId;
        if (depts.length > 0) {
            cyberDeptId = depts[0].id;
        } else {
            cyberDeptId = makeId('dept');
            await connection.execute(
                'INSERT INTO departments (id, name, code, description, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())',
                [cyberDeptId, 'Cyber Security Department', 'CS', 'Department focused on cybersecurity and information security']
            );
        }

        [depts] = await connection.execute('SELECT id FROM departments WHERE code = ?', ['ME']);
        let engDeptId;
        if (depts.length > 0) {
            engDeptId = depts[0].id;
        } else {
            engDeptId = makeId('dept');
            await connection.execute(
                'INSERT INTO departments (id, name, code, description, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())',
                [engDeptId, 'Mechanical Engineering Department', 'ME', 'Department for mechanical and robotics engineering']
            );
        }
        console.log('✓ Departments processed');

        // 2. Programmes
        let [progs] = await connection.execute('SELECT id FROM programmes WHERE code = ?', ['BENG-CS']);
        let cyberProgId;
        if (progs.length > 0) {
            cyberProgId = progs[0].id;
        } else {
            cyberProgId = makeId('prog');
            await connection.execute(
                'INSERT INTO programmes (id, name, code, departmentId, level, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
                [cyberProgId, 'BEng in Computer Security', 'BENG-CS', cyberDeptId, 'Bachelor']
            );
        }

        [progs] = await connection.execute('SELECT id FROM programmes WHERE code = ?', ['BENG-ME']);
        let mechProgId;
        if (progs.length > 0) {
            mechProgId = progs[0].id;
        } else {
            mechProgId = makeId('prog');
            await connection.execute(
                'INSERT INTO programmes (id, name, code, departmentId, level, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
                [mechProgId, 'BEng in Mechanical Engineering', 'BENG-ME', engDeptId, 'Bachelor']
            );
        }
        console.log('✓ Programmes processed');

        // 3. Demo User
        let [users] = await connection.execute('SELECT id FROM users WHERE militaryId = ?', ['2101006']);
        let demoUserId;
        if (users.length > 0) {
            demoUserId = users[0].id;
        } else {
            demoUserId = makeId('usr');
            const hashedPassword = await bcrypt.hash('password123', 10);
            await connection.execute(
                'INSERT INTO users (id, militaryId, email, password, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
                [demoUserId, '2101006', 'student2101006@mtc.edu.om', hashedPassword, 'STUDENT']
            );
        }
        console.log('✓ Demo user processed');

        // 4. Student Profile
        let [profiles] = await connection.execute('SELECT id FROM student_profiles WHERE userId = ?', [demoUserId]);
        if (profiles.length === 0) {
            const profileId = makeId('sp');
            await connection.execute(
                'INSERT INTO student_profiles (id, userId, fullName, phone, departmentId, programmeId, yearLevel, bio, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
                [profileId, demoUserId, 'Ahmed Al-Balushi', '+968 9123 4567', cyberDeptId, cyberProgId, 'Level 3', 'Interested in cybersecurity and AI applications']
            );
        }
        console.log('✓ Student profile processed');

        // 5. Lab Categories
        const categories = [
            { key: 'club', label: 'Scientific Club Labs', description: 'Student-driven labs under the scientific club.', icon: 'fa-solid fa-users' },
            { key: 'specialised', label: 'Specialised Labs', description: 'Labs managed by academic departments.', icon: 'fa-solid fa-microscope' },
            { key: 'handsOn', label: 'Hands-on Labs', description: 'Practical labs for building and testing.', icon: 'fa-solid fa-screwdriver-wrench' },
            { key: 'tools', label: 'Tools & Equipment', description: 'Shared tools and portable equipment.', icon: 'fa-solid fa-toolbox' }
        ];

        const catIds = {};
        for (const cat of categories) {
            let [dbCats] = await connection.execute('SELECT id FROM lab_categories WHERE `key` = ?', [cat.key]);
            if (dbCats.length > 0) {
                catIds[cat.key] = dbCats[0].id;
            } else {
                const catId = makeId('cat');
                await connection.execute(
                    'INSERT INTO lab_categories (id, `key`, label, description, icon, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
                    [catId, cat.key, cat.label, cat.description, cat.icon]
                );
                catIds[cat.key] = catId;
            }
        }
        console.log('✓ Lab categories processed');

        // 6. Labs
        const labs = [
            { name: 'Arduino Starter Lab', shortDesc: 'First steps with microcontrollers.', tag: 'Electronics', categoryKey: 'club', capacity: 15 },
            { name: 'Robotics Practice Lab', shortDesc: 'Testing small robots.', tag: 'Robotics', categoryKey: 'club', capacity: 12 },
            { name: 'AI & Ideas Corner', shortDesc: 'Discuss AI concepts.', tag: 'AI / Ideas', categoryKey: 'club', capacity: 20 },
            { name: 'Cybersecurity Lab', shortDesc: 'Honeypots and monitoring.', tag: 'Cybersecurity', categoryKey: 'specialised', departmentId: cyberDeptId, capacity: 25 },
            { name: 'PCB Design Lab', shortDesc: 'From schematic to board.', tag: 'Electronics', categoryKey: 'specialised', capacity: 10 },
            { name: 'Data & AI Lab', shortDesc: 'Model training.', tag: 'Data / AI', categoryKey: 'specialised', capacity: 20 },
            { name: 'Mechanical Assembly Lab', shortDesc: 'Frames and mounts.', tag: 'Mechanical', categoryKey: 'handsOn', departmentId: engDeptId, capacity: 15 },
            { name: 'Power & Control Lab', shortDesc: 'Motors and relays.', tag: 'Power', categoryKey: 'handsOn', capacity: 12 },
            { name: 'IoT Simulation Lab', shortDesc: 'Deploy sensors.', tag: 'IoT', categoryKey: 'handsOn', capacity: 18 },
            { name: 'Soldering Station Set', shortDesc: 'Full soldering kit.', tag: 'Tool', categoryKey: 'tools', capacity: 1 },
            { name: 'Measurement Pack', shortDesc: 'Multimeter and probes.', tag: 'Tool', categoryKey: 'tools', capacity: 1 },
            { name: 'General Hand Toolbox', shortDesc: 'Screwdrivers, pliers.', tag: 'Tool', categoryKey: 'tools', capacity: 1 },
        ];

        for (const lab of labs) {
            let [dbLabs] = await connection.execute('SELECT id FROM labs WHERE name = ?', [lab.name]);
            if (dbLabs.length === 0) {
                const labId = makeId('lab');
                await connection.execute(
                    'INSERT INTO labs (id, name, shortDesc, tag, categoryId, departmentId, capacity, isBookable, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
                    [labId, lab.name, lab.shortDesc, lab.tag, catIds[lab.categoryKey], lab.departmentId || null, lab.capacity, true]
                );
            }
        }
        console.log('✓ Labs processed');

        // 7. Projects
        const projects = [
            { title: 'Autonomous Line-Following Robot', description: 'Educational robot for navigation.', status: 'COMPLETED', category: 'Robotics', progress: 100 },
            { title: 'Internal Threat Monitoring Platform', description: 'Behaviour-based monitoring system.', status: 'DEVELOPMENT', category: 'Cybersecurity', progress: 70 },
            { title: 'Smart Campus IoT Network', description: 'IoT sensor network for campus.', status: 'START', category: 'IoT', progress: 15 }
        ];

        for (const proj of projects) {
            let [dbProjs] = await connection.execute('SELECT id FROM projects WHERE title = ?', [proj.title]);
            if (dbProjs.length === 0) {
                const projId = makeId('proj');
                await connection.execute(
                    'INSERT INTO projects (id, title, description, status, category, progress, startDate, endDate, createdById, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, NULL, NULL, ?, NOW(), NOW())',
                    [projId, proj.title, proj.description, proj.status, proj.category, proj.progress, demoUserId]
                );
            }
        }
        console.log('✓ Projects processed');

        // 8. Event
        let [events] = await connection.execute('SELECT id FROM events WHERE title = ?', ['Induction Week 2025/2026']);
        if (events.length === 0) {
            const eventId = makeId('evt');
            await connection.execute(
                'INSERT INTO events (id, title, description, category, startDate, endDate, location, capacity, createdById, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
                [eventId, 'Induction Week 2025/2026', 'Strategic start for AFAQ members.', 'Workshop', new Date('2025-01-15'), new Date('2025-01-17'), 'Main Auditorium', 200, demoUserId]
            );
        }
        console.log('✓ Event processed');
        
        console.log('\n✅ Database seeded successfully via mysql2!');
    } catch (err) {
        console.error('❌ Error seeding database:', err);
        throw err;
    } finally {
        await connection.end();
    }
}

main().catch(err => {
    process.exit(1);
});
