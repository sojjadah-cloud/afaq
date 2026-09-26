import AboutClient from './AboutClient'

export default function AboutPage() {
    // Management hierarchy data
    const managementTeam = {
        patron: {
            name: 'Brig. Ahmed Al-Hadidi',
            title: 'Patron',
            role: 'Commandant, MTC',
            image: null
        },
        advisor: {
            name: 'Dr. Talib Al-Harthi',
            title: 'Faculty Advisor',
            role: 'Academic Supervisor',
            image: null
        },
        president: {
            name: '1st Lt. (Air) Wahab',
            title: 'Coordinating Officer',
            role: 'Club Supervisor',
            image: null
        },
        executives: [
            { name: 'President', title: 'Club Leadership', role: 'AFAQ Scientific Club' },
            { name: 'Vice President', title: 'Club Leadership', role: 'AFAQ Scientific Club' }
        ],
        heads: [
            { name: 'Research Committee', title: 'Scientific Research & Innovation', role: 'Committee' },
            { name: 'Media Committee', title: 'Media & Public Relations', role: 'Committee' },
            { name: 'Admin Committee', title: 'Administration & Development', role: 'Committee' }
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
        />
    )
}
