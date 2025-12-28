const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')

// Prisma 7 gets datasourceUrl from prisma.config.ts
const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Starting database seed...')

    // Create Departments
    const cyberDept = await prisma.department.upsert({
        where: { code: 'CS' },
        update: {},
        create: {
            name: 'Cyber Security Department',
            code: 'CS',
            description: 'Department focused on cybersecurity and information security',
        },
    })

    const engDept = await prisma.department.upsert({
        where: { code: 'ME' },
        update: {},
        create: {
            name: 'Mechanical Engineering Department',
            code: 'ME',
            description: 'Department for mechanical and robotics engineering',
        },
    })

    console.log('✓ Departments created')

    // Create Programmes
    const cyberProg = await prisma.programme.upsert({
        where: { code: 'BENG-CS' },
        update: {},
        create: {
            name: 'BEng in Computer Security',
            code: 'BENG-CS',
            departmentId: cyberDept.id,
            level: 'Bachelor',
        },
    })

    const mechProg = await prisma.programme.upsert({
        where: { code: 'BENG-ME' },
        update: {},
        create: {
            name: 'BEng in Mechanical Engineering',
            code: 'BENG-ME',
            departmentId: engDept.id,
            level: 'Bachelor',
        },
    })

    console.log('✓ Programmes created')

    // Create demo user
    const hashedPassword = await bcrypt.hash('password123', 10)

    const demoUser = await prisma.user.upsert({
        where: { militaryId: '2101006' },
        update: {},
        create: {
            militaryId: '2101006',
            email: 'student2101006@mtc.edu.om',
            password: hashedPassword,
            role: 'STUDENT',
        },
    })

    console.log('✓ Demo user created (Military ID: 2101006)')

    // Create student profile
    await prisma.studentProfile.upsert({
        where: { userId: demoUser.id },
        update: {},
        create: {
            userId: demoUser.id,
            fullName: 'Ahmed Al-Balushi',
            phone: '+968 9123 4567',
            departmentId: cyberDept.id,
            programmeId: cyberProg.id,
            yearLevel: 'Level 3',
            bio: 'Interested in cybersecurity and AI applications',
        },
    })

    console.log('✓ Student profile created')

    // Create Lab Categories
    const clubCat = await prisma.labCategory.upsert({
        where: { key: 'club' },
        update: {},
        create: {
            key: 'club',
            label: 'Scientific Club Labs',
            description: 'Student-driven labs under the scientific club.',
            icon: 'fa-solid fa-users',
        },
    })

    const specialisedCat = await prisma.labCategory.upsert({
        where: { key: 'specialised' },
        update: {},
        create: {
            key: 'specialised',
            label: 'Specialised Labs',
            description: 'Labs managed by academic departments.',
            icon: 'fa-solid fa-microscope',
        },
    })

    const handsOnCat = await prisma.labCategory.upsert({
        where: { key: 'handsOn' },
        update: {},
        create: {
            key: 'handsOn',
            label: 'Hands-on Labs',
            description: 'Practical labs for building and testing.',
            icon: 'fa-solid fa-screwdriver-wrench',
        },
    })

    const toolsCat = await prisma.labCategory.upsert({
        where: { key: 'tools' },
        update: {},
        create: {
            key: 'tools',
            label: 'Tools & Equipment',
            description: 'Shared tools and portable equipment.',
            icon: 'fa-solid fa-toolbox',
        },
    })

    console.log('✓ Lab categories created')

    // Create Labs
    await prisma.lab.createMany({
        data: [
            { name: 'Arduino Starter Lab', shortDesc: 'First steps with microcontrollers.', tag: 'Electronics', categoryId: clubCat.id, capacity: 15 },
            { name: 'Robotics Practice Lab', shortDesc: 'Testing small robots.', tag: 'Robotics', categoryId: clubCat.id, capacity: 12 },
            { name: 'AI & Ideas Corner', shortDesc: 'Discuss AI concepts.', tag: 'AI / Ideas', categoryId: clubCat.id, capacity: 20 },
            { name: 'Cybersecurity Lab', shortDesc: 'Honeypots and monitoring.', tag: 'Cybersecurity', categoryId: specialisedCat.id, departmentId: cyberDept.id, capacity: 25 },
            { name: 'PCB Design Lab', shortDesc: 'From schematic to board.', tag: 'Electronics', categoryId: specialisedCat.id, capacity: 10 },
            { name: 'Data & AI Lab', shortDesc: 'Model training.', tag: 'Data / AI', categoryId: specialisedCat.id, capacity: 20 },
            { name: 'Mechanical Assembly Lab', shortDesc: 'Frames and mounts.', tag: 'Mechanical', categoryId: handsOnCat.id, departmentId: engDept.id, capacity: 15 },
            { name: 'Power & Control Lab', shortDesc: 'Motors and relays.', tag: 'Power', categoryId: handsOnCat.id, capacity: 12 },
            { name: 'IoT Simulation Lab', shortDesc: 'Deploy sensors.', tag: 'IoT', categoryId: handsOnCat.id, capacity: 18 },
            { name: 'Soldering Station Set', shortDesc: 'Full soldering kit.', tag: 'Tool', categoryId: toolsCat.id, capacity: 1 },
            { name: 'Measurement Pack', shortDesc: 'Multimeter and probes.', tag: 'Tool', categoryId: toolsCat.id, capacity: 1 },
            { name: 'General Hand Toolbox', shortDesc: 'Screwdrivers, pliers.', tag: 'Tool', categoryId: toolsCat.id, capacity: 1 },
        ],
        skipDuplicates: true,
    })

    console.log('✓ Labs created (12 labs)')

    // Create sample projects
    await prisma.project.createMany({
        data: [
            {
                title: 'Autonomous Line-Following Robot',
                description: 'Educational robot for navigation.',
                status: 'COMPLETED',
                category: 'Robotics',
                progress: 100,
                createdById: demoUser.id,
            },
            {
                title: 'Internal Threat Monitoring Platform',
                description: 'Behaviour-based monitoring system.',
                status: 'DEVELOPMENT',
                category: 'Cybersecurity',
                progress: 70,
                createdById: demoUser.id,
            },
            {
                title: 'Smart Campus IoT Network',
                description: 'IoT sensor network for campus.',
                status: 'START',
                category: 'IoT',
                progress: 15,
                createdById: demoUser.id,
            },
        ],
        skipDuplicates: true,
    })

    console.log('✓ Projects created (3 sample projects)')

    // Create sample event
    await prisma.event.create({
        data: {
            title: 'Induction Week 2025/2026',
            description: 'Strategic start for AFAQ members.',
            category: 'Workshop',
            startDate: new Date('2025-01-15'),
            endDate: new Date('2025-01-17'),
            location: 'Main Auditorium',
            capacity: 200,
            createdById: demoUser.id,
        },
    })

    console.log('✓ Event created')
    console.log('\n✅ Database seeded successfully!')
    console.log('\n📝 Login credentials:')
    console.log('   Military ID: 2101006')
    console.log('   Password: password123\n')
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:')
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
