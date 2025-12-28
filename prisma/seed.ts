import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
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

    //Create demo user
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

    // Create Lab Categories
    const clubCat = await prisma.labCategory.upsert({
        where: { key: 'club' },
        update: {},
        create: {
            key: 'club',
            label: 'Scientific Club Labs',
            description: 'Student-driven labs under the scientific club, ideal for early-stage ideas and club projects.',
            icon: 'fa-solid fa-users',
        },
    })

    const specialisedCat = await prisma.labCategory.upsert({
        where: { key: 'specialised' },
        update: {},
        create: {
            key: 'specialised',
            label: 'Specialised Labs',
            description: 'Labs managed by academic departments or experts for deeper, advanced technical work.',
            icon: 'fa-solid fa-microscope',
        },
    })

    const handsOnCat = await prisma.labCategory.upsert({
        where: { key: 'handsOn' },
        update: {},
        create: {
            key: 'handsOn',
            label: 'Hands-on Labs',
            description: 'Practical labs for building, wiring, assembling, and testing physical systems.',
            icon: 'fa-solid fa-screwdriver-wrench',
        },
    })

    const toolsCat = await prisma.labCategory.upsert({
        where: { key: 'tools' },
        update: {},
        create: {
            key: 'tools',
            label: 'Tools & Equipment',
            description: 'Shared tools and portable equipment that can be booked for AFAQ-related work.',
            icon: 'fa-solid fa-toolbox',
        },
    })

    // Create Labs
    await prisma.lab.createMany({
        data: [
            // Club labs
            {
                name: 'Arduino Starter Lab',
                shortDesc: 'First steps with microcontrollers.',
                tag: 'Electronics',
                categoryId: clubCat.id,
                capacity: 15,
            },
            {
                name: 'Robotics Practice Lab',
                shortDesc: 'Testing small robots and platforms.',
                tag: 'Robotics',
                categoryId: clubCat.id,
                capacity: 12,
            },
            {
                name: 'AI & Ideas Corner',
                shortDesc: 'Discuss AI concepts inside campus.',
                tag: 'AI / Ideas',
                categoryId: clubCat.id,
                capacity: 20,
            },
            // Specialised labs
            {
                name: 'Cybersecurity Lab',
                shortDesc: 'Honeypots, monitoring, and attack analysis.',
                tag: 'Cybersecurity',
                categoryId: specialisedCat.id,
                departmentId: cyberDept.id,
                capacity: 25,
            },
            {
                name: 'PCB Design Lab',
                shortDesc: 'From schematic to ready board.',
                tag: 'Electronics',
                categoryId: specialisedCat.id,
                capacity: 10,
            },
            {
                name: 'Data & AI Lab',
                shortDesc: 'Model training and evaluation.',
                tag: 'Data / AI',
                categoryId: specialisedCat.id,
                capacity: 20,
            },
            // Hands-on labs
            {
                name: 'Mechanical Assembly Lab',
                shortDesc: 'Frames, mounts, and moving parts.',
                tag: 'Mechanical',
                categoryId: handsOnCat.id,
                departmentId: engDept.id,
                capacity: 15,
            },
            {
                name: 'Power & Control Lab',
                shortDesc: 'Motors, relays, control circuits.',
                tag: 'Power',
                categoryId: handsOnCat.id,
                capacity: 12,
            },
            {
                name: 'IoT Simulation Lab',
                shortDesc: 'Deploy sensors and gateways.',
                tag: 'IoT',
                categoryId: handsOnCat.id,
                capacity: 18,
            },
            // Tools
            {
                name: 'Soldering Station Set',
                shortDesc: 'Full soldering kit for boards.',
                tag: 'Tool',
                categoryId: toolsCat.id,
                capacity: 1,
            },
            {
                name: 'Measurement Pack',
                shortDesc: 'Multimeter and probes.',
                tag: 'Tool',
                categoryId: toolsCat.id,
                capacity: 1,
            },
            {
                name: 'General Hand Toolbox',
                shortDesc: 'Screwdrivers, pliers, cutters.',
                tag: 'Tool',
                categoryId: toolsCat.id,
                capacity: 1,
            },
        ],
        skipDuplicates: true,
    })

    // Create sample projects
    await prisma.project.createMany({
        data: [
            {
                title: 'Autonomous Line-Following Robot',
                description: 'Educational robot for navigation and obstacle avoidance labs.',
                status: 'COMPLETED',
                category: 'Robotics',
                progress: 100,
                createdById: demoUser.id,
            },
            {
                title: 'Internal Threat Monitoring Platform',
                description: 'Behaviour-based monitoring system to detect unusual access patterns and insider risks.',
                status: 'DEVELOPMENT',
                category: 'Cybersecurity',
                progress: 70,
                createdById: demoUser.id,
            },
            {
                title: 'Smart Campus IoT Network',
                description: 'IoT sensor network for monitoring environmental conditions across campus.',
                status: 'START',
                category: 'IoT',
                progress: 15,
                createdById: demoUser.id,
            },
        ],
        skipDuplicates: true,
    })

    // Create sample event
    await prisma.event.create({
        data: {
            title: 'Induction Week 2025/2026',
            description: 'A strategic start for AFAQ members to connect, collaborate, and transform ideas into innovation impact.',
            category: 'Workshop',
            startDate: new Date('2025-01-15'),
            endDate: new Date('2025-01-17'),
            location: 'Main Auditorium',
            capacity: 200,
            createdById: demoUser.id,
        },
    })

    console.log('✅ Database seeded successfully!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
