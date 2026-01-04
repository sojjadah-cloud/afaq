import { getSession } from '@/lib/auth'
import AboutClient from './AboutClient'

export default async function AboutPage() {
    const session = await getSession()

    // Management hierarchy data
    const managementTeam = {
        patron: {
            name: 'Col. Ahmed Al-Harthi',
            title: 'Patron',
            role: 'Commandant, MTC',
            image: null
        },
        advisor: {
            name: 'Dr. Khalid Al-Rashdi',
            title: 'Faculty Advisor',
            role: 'Head of Engineering Department',
            image: null
        },
        president: {
            name: 'Capt. Salim Al-Balushi',
            title: 'Club President',
            role: 'Senior Lecturer, Innovation Hub',
            image: null
        },
        executives: [
            { name: 'Lt. Mohammed Al-Hinai', title: 'Vice President', role: 'Research Coordinator' },
            { name: 'WO1 Fatima Al-Zadjali', title: 'Secretary General', role: 'Admin Operations' },
            { name: 'Sgt. Yusuf Al-Kindi', title: 'Treasurer', role: 'Financial Management' }
        ],
        heads: [
            { name: 'Cpl. Mariam Al-Lawati', title: 'Head of Projects', role: 'Project Management' },
            { name: 'Cpl. Hassan Al-Siyabi', title: 'Head of Research', role: 'Research Division' },
            { name: 'LCpl. Sara Al-Habsi', title: 'Head of Events', role: 'Events & Workshops' },
            { name: 'LCpl. Omar Al-Maskari', title: 'Head of Media', role: 'Communications' }
        ]
    }

    const contactInfo = {
        email: 'afaq.innovation@mtc.edu.om',
        phone: '+968 2441 2345',
        location: 'Building A, Room 105, Military Technological College, Al Khoudh',
        hours: 'Sunday - Thursday: 08:00 - 16:00',
        social: {
            instagram: '@afaq_innovation',
            twitter: '@AFAQ_MTC'
        }
    }

    return (
        <AboutClient
            managementTeam={managementTeam}
            contactInfo={contactInfo}
            isLoggedIn={session.isLoggedIn || false}
        />
    )
}
