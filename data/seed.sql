-- AFAQ Innovation Portal: bundled SQLite database.
-- Executed once by src/lib/db.ts when data/afaq.db does not exist yet.
-- Demo accounts use the password Demo@12345; role buttons on /login need no password.

PRAGMA foreign_keys = OFF;

-- ============================================================ schema
CREATE TABLE IF NOT EXISTS `departments` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `code` varchar(191) NOT NULL,
  `description` text DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `programmes` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `code` varchar(191) NOT NULL,
  `departmentId` varchar(191) NOT NULL,
  `level` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `users` (
  `id` varchar(191) NOT NULL,
  `militaryId` varchar(191) NOT NULL,
  `password` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `role` TEXT NOT NULL DEFAULT 'STUDENT',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `student_profiles` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `fullName` varchar(191) NOT NULL,
  `phone` varchar(191) DEFAULT NULL,
  `departmentId` varchar(191) NOT NULL,
  `programmeId` varchar(191) NOT NULL,
  `yearLevel` varchar(191) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `lab_categories` (
  `id` varchar(191) NOT NULL,
  `key` varchar(191) NOT NULL,
  `label` varchar(191) NOT NULL,
  `description` text NOT NULL,
  `icon` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `labs` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `shortDesc` varchar(191) NOT NULL,
  `tag` varchar(191) NOT NULL,
  `categoryId` varchar(191) NOT NULL,
  `departmentId` varchar(191) DEFAULT NULL,
  `capacity` int(11) NOT NULL DEFAULT 1,
  `isBookable` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `lab_bookings` (
  `id` varchar(191) NOT NULL,
  `labId` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `bookingDate` datetime(3) NOT NULL,
  `timeSlot` varchar(191) NOT NULL,
  `purpose` text DEFAULT NULL,
  `status` TEXT NOT NULL DEFAULT 'PENDING',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `projects` (
  `id` varchar(191) NOT NULL,
  `title` varchar(191) NOT NULL,
  `description` text NOT NULL,
  `status` TEXT NOT NULL,
  `category` varchar(191) NOT NULL,
  `progress` int(11) NOT NULL DEFAULT 0,
  `startDate` datetime(3) DEFAULT NULL,
  `endDate` datetime(3) DEFAULT NULL,
  `createdById` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `project_members` (
  `id` varchar(191) NOT NULL,
  `projectId` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `role` varchar(191) NOT NULL DEFAULT 'Member',
  `status` TEXT NOT NULL DEFAULT 'PENDING',
  `joinedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `project_attachments` (
  `id` varchar(191) NOT NULL,
  `projectId` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `url` varchar(191) NOT NULL,
  `type` varchar(191) NOT NULL,
  `uploadedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `research` (
  `id` varchar(191) NOT NULL,
  `title` varchar(191) NOT NULL,
  `abstract` text NOT NULL,
  `authors` text NOT NULL,
  `category` varchar(191) NOT NULL,
  `publicationDate` datetime(3) DEFAULT NULL,
  `url` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `events` (
  `id` varchar(191) NOT NULL,
  `title` varchar(191) NOT NULL,
  `description` text NOT NULL,
  `category` varchar(191) NOT NULL,
  `startDate` datetime(3) NOT NULL,
  `endDate` datetime(3) DEFAULT NULL,
  `location` varchar(191) DEFAULT NULL,
  `capacity` int(11) DEFAULT NULL,
  `createdById` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `event_registrations` (
  `id` varchar(191) NOT NULL,
  `eventId` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `status` TEXT NOT NULL DEFAULT 'REGISTERED',
  `registeredAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `club_news` (
  `id` varchar(191) NOT NULL,
  `title` varchar(255) NOT NULL,
  `summary` text NOT NULL,
  `imageUrl` varchar(500) DEFAULT NULL,
  `type` TEXT NOT NULL DEFAULT 'NEWS',
  `eventDate` date DEFAULT NULL,
  `createdById` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `forum_categories` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `description` text DEFAULT NULL,
  `icon` varchar(191) DEFAULT NULL,
  `color` varchar(191) DEFAULT '#3b82f6',
  `sortOrder` int(11) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `forum_posts` (
  `id` varchar(191) NOT NULL,
  `title` varchar(200) DEFAULT NULL,
  `content` text NOT NULL,
  `categoryId` varchar(191) NOT NULL,
  `authorId` varchar(191) NOT NULL,
  `parentId` varchar(191) DEFAULT NULL,
  `replyToId` varchar(191) DEFAULT NULL,
  `isPinned` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `forum_mute_settings` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `postId` varchar(191) NOT NULL,
  `muteTopicReplies` tinyint(1) NOT NULL DEFAULT 0,
  `muteThreadReplies` tinyint(1) NOT NULL DEFAULT 0,
  `muteQuoteReplies` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `club_registrations` (
  `id` varchar(191) NOT NULL,
  `fullName` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `phone` varchar(191) DEFAULT NULL,
  `militaryId` varchar(191) NOT NULL,
  `department` varchar(191) NOT NULL,
  `yearLevel` varchar(191) DEFAULT NULL,
  `interests` text DEFAULT NULL,
  `motivation` text DEFAULT NULL,
  `userId` varchar(191) DEFAULT NULL,
  `status` TEXT NOT NULL DEFAULT 'PENDING',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime(3) DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `contact_messages` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `phone` varchar(191) DEFAULT NULL,
  `subject` varchar(191) NOT NULL,
  `message` text NOT NULL,
  `status` TEXT NOT NULL DEFAULT 'NEW',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime(3) DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `notifications` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `type` varchar(191) NOT NULL,
  `title` varchar(191) NOT NULL,
  `message` text DEFAULT NULL,
  `link` varchar(191) DEFAULT NULL,
  `isRead` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) DEFAULT NULL,
  `action` varchar(191) NOT NULL,
  `tableName` varchar(191) DEFAULT NULL,
  `recordId` varchar(191) DEFAULT NULL,
  `oldData` text DEFAULT NULL,
  `newData` text DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `skills` (
  `id` varchar(191) NOT NULL,
  `profileId` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `trainings` (
  `id` varchar(191) NOT NULL,
  `profileId` varchar(191) NOT NULL,
  `title` varchar(191) NOT NULL,
  `provider` varchar(191) NOT NULL,
  `year` varchar(191) NOT NULL,
  `hours` varchar(191) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `competitions` (
  `id` varchar(191) NOT NULL,
  `profileId` varchar(191) NOT NULL,
  `eventName` varchar(191) NOT NULL,
  `role` varchar(191) NOT NULL,
  `year` varchar(191) NOT NULL,
  `result` varchar(191) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `experiences` (
  `id` varchar(191) NOT NULL,
  `profileId` varchar(191) NOT NULL,
  `title` varchar(191) NOT NULL,
  `place` varchar(191) NOT NULL,
  `year` varchar(191) NOT NULL,
  `type` varchar(191) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
);

CREATE INDEX IF NOT EXISTS `audit_logs_action_idx` ON `audit_logs` (`action`);
CREATE INDEX IF NOT EXISTS `audit_logs_userId_idx` ON `audit_logs` (`userId`);
CREATE INDEX IF NOT EXISTS `club_registrations_status_idx` ON `club_registrations` (`status`);
CREATE INDEX IF NOT EXISTS `competitions_profileId_fkey` ON `competitions` (`profileId`);
CREATE INDEX IF NOT EXISTS `contact_messages_status_idx` ON `contact_messages` (`status`);
CREATE UNIQUE INDEX IF NOT EXISTS `departments_code_key` ON `departments` (`code`);
CREATE UNIQUE INDEX IF NOT EXISTS `departments_name_key` ON `departments` (`name`);
CREATE UNIQUE INDEX IF NOT EXISTS `event_registrations_eventId_userId_key` ON `event_registrations` (`eventId`,`userId`);
CREATE INDEX IF NOT EXISTS `event_registrations_userId_fkey` ON `event_registrations` (`userId`);
CREATE INDEX IF NOT EXISTS `events_createdById_fkey` ON `events` (`createdById`);
CREATE INDEX IF NOT EXISTS `experiences_profileId_fkey` ON `experiences` (`profileId`);
CREATE UNIQUE INDEX IF NOT EXISTS `forum_mute_userId_postId` ON `forum_mute_settings` (`userId`,`postId`);
CREATE INDEX IF NOT EXISTS `forum_posts_authorId_idx` ON `forum_posts` (`authorId`);
CREATE INDEX IF NOT EXISTS `forum_posts_categoryId_idx` ON `forum_posts` (`categoryId`);
CREATE INDEX IF NOT EXISTS `forum_posts_parentId_idx` ON `forum_posts` (`parentId`);
CREATE INDEX IF NOT EXISTS `lab_bookings_labId_fkey` ON `lab_bookings` (`labId`);
CREATE INDEX IF NOT EXISTS `lab_bookings_userId_fkey` ON `lab_bookings` (`userId`);
CREATE UNIQUE INDEX IF NOT EXISTS `lab_categories_key_key` ON `lab_categories` (`key`);
CREATE INDEX IF NOT EXISTS `labs_categoryId_fkey` ON `labs` (`categoryId`);
CREATE INDEX IF NOT EXISTS `labs_departmentId_fkey` ON `labs` (`departmentId`);
CREATE INDEX IF NOT EXISTS `notifications_isRead_idx` ON `notifications` (`isRead`);
CREATE INDEX IF NOT EXISTS `notifications_userId_idx` ON `notifications` (`userId`);
CREATE UNIQUE INDEX IF NOT EXISTS `programmes_code_key` ON `programmes` (`code`);
CREATE INDEX IF NOT EXISTS `programmes_departmentId_fkey` ON `programmes` (`departmentId`);
CREATE INDEX IF NOT EXISTS `project_attachments_projectId_fkey` ON `project_attachments` (`projectId`);
CREATE UNIQUE INDEX IF NOT EXISTS `project_members_projectId_userId_key` ON `project_members` (`projectId`,`userId`);
CREATE INDEX IF NOT EXISTS `project_members_userId_fkey` ON `project_members` (`userId`);
CREATE INDEX IF NOT EXISTS `projects_createdById_fkey` ON `projects` (`createdById`);
CREATE INDEX IF NOT EXISTS `skills_profileId_fkey` ON `skills` (`profileId`);
CREATE INDEX IF NOT EXISTS `student_profiles_departmentId_fkey` ON `student_profiles` (`departmentId`);
CREATE INDEX IF NOT EXISTS `student_profiles_programmeId_fkey` ON `student_profiles` (`programmeId`);
CREATE UNIQUE INDEX IF NOT EXISTS `student_profiles_userId_key` ON `student_profiles` (`userId`);
CREATE INDEX IF NOT EXISTS `trainings_profileId_fkey` ON `trainings` (`profileId`);
CREATE UNIQUE INDEX IF NOT EXISTS `users_email_key` ON `users` (`email`);
CREATE UNIQUE INDEX IF NOT EXISTS `users_militaryId_key` ON `users` (`militaryId`);

-- ============================================================ data

-- departments (6)
INSERT INTO `departments` (`id`, `name`, `code`, `description`, `createdAt`, `updatedAt`) VALUES ('dept_5506vkhdc_1781383987820', 'Cyber Security Department', 'CS', 'Information security, network defence and digital forensics', '2026-06-14 00:53:07.000', '2026-06-14 00:53:07.000');
INSERT INTO `departments` (`id`, `name`, `code`, `description`, `createdAt`, `updatedAt`) VALUES ('dept_m3mvoqmty_1781383987825', 'Marine Engineering Department', 'ME', 'Marine propulsion, naval systems and offshore engineering', '2026-06-14 00:53:07.000', '2026-06-14 00:53:07.000');
INSERT INTO `departments` (`id`, `name`, `code`, `description`, `createdAt`, `updatedAt`) VALUES ('dept_aeronautical', 'Aeronautical Engineering Department', 'AE', 'Aircraft structures, avionics and flight systems', '2026-06-14 00:53:07.000', '2026-06-14 00:53:07.000');
INSERT INTO `departments` (`id`, `name`, `code`, `description`, `createdAt`, `updatedAt`) VALUES ('dept_systems', 'Systems Engineering Department', 'SE', 'Communications, computer and electrical systems engineering', '2026-06-14 00:53:07.000', '2026-06-14 00:53:07.000');
INSERT INTO `departments` (`id`, `name`, `code`, `description`, `createdAt`, `updatedAt`) VALUES ('dept_civil', 'Civil Engineering Department', 'CE', 'Infrastructure, structures and construction engineering', '2026-06-14 00:53:07.000', '2026-06-14 00:53:07.000');
INSERT INTO `departments` (`id`, `name`, `code`, `description`, `createdAt`, `updatedAt`) VALUES ('dept_foundation', 'Foundation Department', 'FD', 'English, mathematics and science foundation programme', '2026-06-14 00:53:07.000', '2026-06-14 00:53:07.000');

-- programmes (7)
INSERT INTO `programmes` (`id`, `name`, `code`, `departmentId`, `level`, `createdAt`, `updatedAt`) VALUES ('prog_ack8z0rqi_1781383987833', 'BEng in Computer Security', 'BENG-CS', 'dept_5506vkhdc_1781383987820', 'Bachelor', '2026-06-14 00:53:07.000', '2026-06-14 00:53:07.000');
INSERT INTO `programmes` (`id`, `name`, `code`, `departmentId`, `level`, `createdAt`, `updatedAt`) VALUES ('prog_vfz5nfqeh_1781383987837', 'BEng in Marine Engineering', 'BENG-ME', 'dept_m3mvoqmty_1781383987825', 'Bachelor', '2026-06-14 00:53:07.000', '2026-06-14 00:53:07.000');
INSERT INTO `programmes` (`id`, `name`, `code`, `departmentId`, `level`, `createdAt`, `updatedAt`) VALUES ('prog_beng_ae', 'BEng in Aeronautical Engineering', 'BENG-AE', 'dept_aeronautical', 'Bachelor', '2026-06-14 00:53:07.000', '2026-06-14 00:53:07.000');
INSERT INTO `programmes` (`id`, `name`, `code`, `departmentId`, `level`, `createdAt`, `updatedAt`) VALUES ('prog_beng_comms', 'BEng in Communication Systems', 'BENG-COM', 'dept_systems', 'Bachelor', '2026-06-14 00:53:07.000', '2026-06-14 00:53:07.000');
INSERT INTO `programmes` (`id`, `name`, `code`, `departmentId`, `level`, `createdAt`, `updatedAt`) VALUES ('prog_beng_compeng', 'BEng in Computer Engineering', 'BENG-CE', 'dept_systems', 'Bachelor', '2026-06-14 00:53:07.000', '2026-06-14 00:53:07.000');
INSERT INTO `programmes` (`id`, `name`, `code`, `departmentId`, `level`, `createdAt`, `updatedAt`) VALUES ('prog_beng_civil', 'BEng in Civil Engineering', 'BENG-CIV', 'dept_civil', 'Bachelor', '2026-06-14 00:53:07.000', '2026-06-14 00:53:07.000');
INSERT INTO `programmes` (`id`, `name`, `code`, `departmentId`, `level`, `createdAt`, `updatedAt`) VALUES ('prog_foundation', 'Foundation Programme', 'FOUND', 'dept_foundation', 'Foundation', '2026-06-14 00:53:07.000', '2026-06-14 00:53:07.000');

-- users (12)
INSERT INTO `users` (`id`, `militaryId`, `password`, `email`, `role`, `createdAt`, `updatedAt`) VALUES ('usr_1781384107881', 'A-1001', '$2b$10$pEsTQFSeOWZxtbbnflpnuuCbdj4jnUvWjpN6KwmK8n.izpTXOgXKK', 'director@afaq.local', 'ADMIN', '2026-06-14 00:55:07.000', '2026-06-14 00:55:07.000');
INSERT INTO `users` (`id`, `militaryId`, `password`, `email`, `role`, `createdAt`, `updatedAt`) VALUES ('usr_demo_staff', 'S-1001', '$2b$10$pEsTQFSeOWZxtbbnflpnuuCbdj4jnUvWjpN6KwmK8n.izpTXOgXKK', 'khalid.rashdi@afaq.local', 'STAFF', '2026-09-15 09:47:31.000', '2026-09-15 09:47:31.000');
INSERT INTO `users` (`id`, `militaryId`, `password`, `email`, `role`, `createdAt`, `updatedAt`) VALUES ('usr_mllh3lh8i_1781383987843', '2100003', '$2b$10$pEsTQFSeOWZxtbbnflpnuuCbdj4jnUvWjpN6KwmK8n.izpTXOgXKK', 'ahmed.balushi@afaq.local', 'STUDENT', '2026-06-14 00:53:07.000', '2026-06-14 00:53:07.000');
INSERT INTO `users` (`id`, `militaryId`, `password`, `email`, `role`, `createdAt`, `updatedAt`) VALUES ('usr_staff_huda', 'S-1002', '$2b$10$pEsTQFSeOWZxtbbnflpnuuCbdj4jnUvWjpN6KwmK8n.izpTXOgXKK', 'huda.zadjali@afaq.local', 'STAFF', '2026-09-20 08:00:00.000', '2026-09-20 08:00:00.000');
INSERT INTO `users` (`id`, `militaryId`, `password`, `email`, `role`, `createdAt`, `updatedAt`) VALUES ('usr_fatma', '2100004', '$2b$10$pEsTQFSeOWZxtbbnflpnuuCbdj4jnUvWjpN6KwmK8n.izpTXOgXKK', 'fatma.lawati@afaq.local', 'STUDENT', '2026-06-20 10:00:00.000', '2026-06-20 10:00:00.000');
INSERT INTO `users` (`id`, `militaryId`, `password`, `email`, `role`, `createdAt`, `updatedAt`) VALUES ('usr_hassan', '2100005', '$2b$10$pEsTQFSeOWZxtbbnflpnuuCbdj4jnUvWjpN6KwmK8n.izpTXOgXKK', 'hassan.siyabi@afaq.local', 'STUDENT', '2026-06-21 10:00:00.000', '2026-06-21 10:00:00.000');
INSERT INTO `users` (`id`, `militaryId`, `password`, `email`, `role`, `createdAt`, `updatedAt`) VALUES ('usr_maryam', '2100006', '$2b$10$pEsTQFSeOWZxtbbnflpnuuCbdj4jnUvWjpN6KwmK8n.izpTXOgXKK', 'maryam.hinai@afaq.local', 'STUDENT', '2026-06-22 10:00:00.000', '2026-06-22 10:00:00.000');
INSERT INTO `users` (`id`, `militaryId`, `password`, `email`, `role`, `createdAt`, `updatedAt`) VALUES ('usr_yusuf', '2100007', '$2b$10$pEsTQFSeOWZxtbbnflpnuuCbdj4jnUvWjpN6KwmK8n.izpTXOgXKK', 'yusuf.kindi@afaq.local', 'STUDENT', '2026-06-23 10:00:00.000', '2026-06-23 10:00:00.000');
INSERT INTO `users` (`id`, `militaryId`, `password`, `email`, `role`, `createdAt`, `updatedAt`) VALUES ('usr_aisha', '2100008', '$2b$10$pEsTQFSeOWZxtbbnflpnuuCbdj4jnUvWjpN6KwmK8n.izpTXOgXKK', 'aisha.busaidi@afaq.local', 'STUDENT', '2026-06-24 10:00:00.000', '2026-06-24 10:00:00.000');
INSERT INTO `users` (`id`, `militaryId`, `password`, `email`, `role`, `createdAt`, `updatedAt`) VALUES ('usr_omar', '2100009', '$2b$10$pEsTQFSeOWZxtbbnflpnuuCbdj4jnUvWjpN6KwmK8n.izpTXOgXKK', 'omar.maamari@afaq.local', 'STUDENT', '2026-06-25 10:00:00.000', '2026-06-25 10:00:00.000');
INSERT INTO `users` (`id`, `militaryId`, `password`, `email`, `role`, `createdAt`, `updatedAt`) VALUES ('usr_noor', '2100010', '$2b$10$pEsTQFSeOWZxtbbnflpnuuCbdj4jnUvWjpN6KwmK8n.izpTXOgXKK', 'noor.rawahi@afaq.local', 'STUDENT', '2026-06-26 10:00:00.000', '2026-06-26 10:00:00.000');
INSERT INTO `users` (`id`, `militaryId`, `password`, `email`, `role`, `createdAt`, `updatedAt`) VALUES ('usr_said', '2100011', '$2b$10$pEsTQFSeOWZxtbbnflpnuuCbdj4jnUvWjpN6KwmK8n.izpTXOgXKK', 'said.ghafri@afaq.local', 'STUDENT', '2026-06-27 10:00:00.000', '2026-06-27 10:00:00.000');

-- student_profiles (12)
INSERT INTO `student_profiles` (`id`, `userId`, `fullName`, `phone`, `departmentId`, `programmeId`, `yearLevel`, `bio`, `createdAt`, `updatedAt`) VALUES ('sp_1781384107886', 'usr_1781384107881', 'Dr. Salim Al-Harthy', '+968 9900 1001', 'dept_5506vkhdc_1781383987820', 'prog_ack8z0rqi_1781383987833', NULL, 'Director of the AFAQ Scientific Club. Oversees innovation tracks, partnerships and the annual exhibition.', '2026-06-14 00:55:07.000', '2026-06-14 00:55:07.000');
INSERT INTO `student_profiles` (`id`, `userId`, `fullName`, `phone`, `departmentId`, `programmeId`, `yearLevel`, `bio`, `createdAt`, `updatedAt`) VALUES ('sp_8usifsmnk_1781383987923', 'usr_mllh3lh8i_1781383987843', 'Ahmed Al-Balushi', '+968 9123 4567', 'dept_5506vkhdc_1781383987820', 'prog_ack8z0rqi_1781383987833', 'Level 3', 'Level 3 Cyber Security cadet. Interested in threat detection, IoT security and applied machine learning.', '2026-06-14 00:53:07.000', '2026-06-14 00:53:07.000');
INSERT INTO `student_profiles` (`id`, `userId`, `fullName`, `phone`, `departmentId`, `programmeId`, `yearLevel`, `bio`, `createdAt`, `updatedAt`) VALUES ('sp_staff', 'usr_demo_staff', 'Eng. Khalid Al-Rashdi', '+968 9900 1002', 'dept_systems', 'prog_beng_compeng', NULL, 'Lab supervisor for the club labs and fabrication spaces. Mentors the Robotics and IoT tracks.', '2026-09-15 09:47:31.000', '2026-09-15 09:47:31.000');
INSERT INTO `student_profiles` (`id`, `userId`, `fullName`, `phone`, `departmentId`, `programmeId`, `yearLevel`, `bio`, `createdAt`, `updatedAt`) VALUES ('sp_huda', 'usr_staff_huda', 'Dr. Huda Al-Zadjali', '+968 9900 1003', 'dept_5506vkhdc_1781383987820', 'prog_ack8z0rqi_1781383987833', NULL, 'Research coordinator. Supervises student publications, theses and conference submissions.', '2026-09-20 08:00:00.000', '2026-09-20 08:00:00.000');
INSERT INTO `student_profiles` (`id`, `userId`, `fullName`, `phone`, `departmentId`, `programmeId`, `yearLevel`, `bio`, `createdAt`, `updatedAt`) VALUES ('sp_fatma', 'usr_fatma', 'Fatma Al-Lawati', '+968 9123 4004', 'dept_5506vkhdc_1781383987820', 'prog_ack8z0rqi_1781383987833', 'Level 4', 'Security awareness and social-engineering research. CTF team captain.', '2026-06-20 10:00:00.000', '2026-06-20 10:00:00.000');
INSERT INTO `student_profiles` (`id`, `userId`, `fullName`, `phone`, `departmentId`, `programmeId`, `yearLevel`, `bio`, `createdAt`, `updatedAt`) VALUES ('sp_hassan', 'usr_hassan', 'Hassan Al-Siyabi', '+968 9123 4005', 'dept_aeronautical', 'prog_beng_ae', 'Level 3', 'UAV design and swarm robotics. Leads the drone build team.', '2026-06-21 10:00:00.000', '2026-06-21 10:00:00.000');
INSERT INTO `student_profiles` (`id`, `userId`, `fullName`, `phone`, `departmentId`, `programmeId`, `yearLevel`, `bio`, `createdAt`, `updatedAt`) VALUES ('sp_maryam', 'usr_maryam', 'Maryam Al-Hinai', '+968 9123 4006', 'dept_systems', 'prog_beng_compeng', 'Level 2', 'Optimisation and data analytics for logistics problems.', '2026-06-22 10:00:00.000', '2026-06-22 10:00:00.000');
INSERT INTO `student_profiles` (`id`, `userId`, `fullName`, `phone`, `departmentId`, `programmeId`, `yearLevel`, `bio`, `createdAt`, `updatedAt`) VALUES ('sp_yusuf', 'usr_yusuf', 'Yusuf Al-Kindi', '+968 9123 4007', 'dept_m3mvoqmty_1781383987825', 'prog_vfz5nfqeh_1781383987837', 'Graduate', 'Condition monitoring and predictive maintenance of marine engines.', '2026-06-23 10:00:00.000', '2026-06-23 10:00:00.000');
INSERT INTO `student_profiles` (`id`, `userId`, `fullName`, `phone`, `departmentId`, `programmeId`, `yearLevel`, `bio`, `createdAt`, `updatedAt`) VALUES ('sp_aisha', 'usr_aisha', 'Aisha Al-Busaidi', '+968 9123 4008', 'dept_5506vkhdc_1781383987820', 'prog_ack8z0rqi_1781383987833', 'Level 3', 'Secure mobile development and applied cryptography.', '2026-06-24 10:00:00.000', '2026-06-24 10:00:00.000');
INSERT INTO `student_profiles` (`id`, `userId`, `fullName`, `phone`, `departmentId`, `programmeId`, `yearLevel`, `bio`, `createdAt`, `updatedAt`) VALUES ('sp_omar', 'usr_omar', 'Omar Al-Maamari', '+968 9123 4009', 'dept_systems', 'prog_beng_comms', 'Level 4', 'RFID systems, embedded hardware and reinforcement learning.', '2026-06-25 10:00:00.000', '2026-06-25 10:00:00.000');
INSERT INTO `student_profiles` (`id`, `userId`, `fullName`, `phone`, `departmentId`, `programmeId`, `yearLevel`, `bio`, `createdAt`, `updatedAt`) VALUES ('sp_noor', 'usr_noor', 'Noor Al-Rawahi', '+968 9123 4010', 'dept_aeronautical', 'prog_beng_ae', 'Level 2', 'Computer vision for aircraft inspection.', '2026-06-26 10:00:00.000', '2026-06-26 10:00:00.000');
INSERT INTO `student_profiles` (`id`, `userId`, `fullName`, `phone`, `departmentId`, `programmeId`, `yearLevel`, `bio`, `createdAt`, `updatedAt`) VALUES ('sp_said', 'usr_said', 'Said Al-Ghafri', '+968 9123 4011', 'dept_civil', 'prog_beng_civil', 'Level 1', 'Renewable energy and smart infrastructure.', '2026-06-27 10:00:00.000', '2026-06-27 10:00:00.000');

-- lab_categories (6)
INSERT INTO `lab_categories` (`id`, `key`, `label`, `description`, `icon`, `createdAt`, `updatedAt`) VALUES ('cat_8h741j3ss_1781383987929', 'club', 'Scientific Club Labs', 'Student-driven labs under the scientific club.', 'fa-solid fa-users', '2026-06-14 00:53:07.000', '2026-06-14 00:53:07.000');
INSERT INTO `lab_categories` (`id`, `key`, `label`, `description`, `icon`, `createdAt`, `updatedAt`) VALUES ('cat_dy6mxl6z2_1781383987943', 'tools', 'Tools & Equipment', 'Shared tools and portable equipment.', 'fa-solid fa-toolbox', '2026-06-14 00:53:07.000', '2026-06-14 00:53:07.000');
INSERT INTO `lab_categories` (`id`, `key`, `label`, `description`, `icon`, `createdAt`, `updatedAt`) VALUES ('cat_fab_demo', 'fabrication', 'Fabrication Lab', 'Rapid prototyping, 3D printing and laser cutting.', 'fa-solid fa-cube', '2026-09-26 20:28:05.000', '2026-09-26 20:28:05.000');
INSERT INTO `lab_categories` (`id`, `key`, `label`, `description`, `icon`, `createdAt`, `updatedAt`) VALUES ('cat_kfn2csxey_1781383987939', 'handsOn', 'Hands-on Labs', 'Practical labs for building and testing.', 'fa-solid fa-screwdriver-wrench', '2026-06-14 00:53:07.000', '2026-06-14 00:53:07.000');
INSERT INTO `lab_categories` (`id`, `key`, `label`, `description`, `icon`, `createdAt`, `updatedAt`) VALUES ('cat_kq4urdi3v_1781383987934', 'specialised', 'Specialised Labs', 'Labs managed by academic departments.', 'fa-solid fa-microscope', '2026-06-14 00:53:07.000', '2026-06-14 00:53:07.000');
INSERT INTO `lab_categories` (`id`, `key`, `label`, `description`, `icon`, `createdAt`, `updatedAt`) VALUES ('cat_media_demo', 'media', 'Media & Design Studio', 'Content creation, design and multimedia production.', 'fa-solid fa-photo-film', '2026-09-26 20:28:05.000', '2026-09-26 20:28:05.000');

-- labs (26)
INSERT INTO `labs` (`id`, `name`, `shortDesc`, `tag`, `categoryId`, `departmentId`, `capacity`, `isBookable`, `createdAt`, `updatedAt`) VALUES ('lab_049e2fo7g_1781383987969', 'IoT Simulation Lab', 'Deploy sensors.', 'IoT', 'cat_kfn2csxey_1781383987939', NULL, 18, 1, '2026-06-14 00:53:07.000', '2026-06-14 00:53:07.000');
INSERT INTO `labs` (`id`, `name`, `shortDesc`, `tag`, `categoryId`, `departmentId`, `capacity`, `isBookable`, `createdAt`, `updatedAt`) VALUES ('lab_5yprmhwzm_1781383987946', 'Arduino Starter Lab', 'First steps with microcontrollers.', 'Electronics', 'cat_8h741j3ss_1781383987929', NULL, 15, 1, '2026-06-14 00:53:07.000', '2026-06-14 00:53:07.000');
INSERT INTO `labs` (`id`, `name`, `shortDesc`, `tag`, `categoryId`, `departmentId`, `capacity`, `isBookable`, `createdAt`, `updatedAt`) VALUES ('lab_6dzs5ihzy_1781383987953', 'AI & Ideas Corner', 'Discuss AI concepts.', 'AI / Ideas', 'cat_8h741j3ss_1781383987929', NULL, 20, 1, '2026-06-14 00:53:07.000', '2026-06-14 00:53:07.000');
INSERT INTO `labs` (`id`, `name`, `shortDesc`, `tag`, `categoryId`, `departmentId`, `capacity`, `isBookable`, `createdAt`, `updatedAt`) VALUES ('lab_an5aehatw_1781383987971', 'Soldering Station Set', 'Full soldering kit.', 'Tool', 'cat_dy6mxl6z2_1781383987943', NULL, 1, 1, '2026-06-14 00:53:07.000', '2026-06-14 00:53:07.000');
INSERT INTO `labs` (`id`, `name`, `shortDesc`, `tag`, `categoryId`, `departmentId`, `capacity`, `isBookable`, `createdAt`, `updatedAt`) VALUES ('lab_demo_01', 'Drone Assembly Lab', 'Build and test small quadcopters.', 'Drones', 'cat_8h741j3ss_1781383987929', NULL, 6, 1, '2026-09-26 20:28:23.000', '2026-09-26 20:28:23.000');
INSERT INTO `labs` (`id`, `name`, `shortDesc`, `tag`, `categoryId`, `departmentId`, `capacity`, `isBookable`, `createdAt`, `updatedAt`) VALUES ('lab_demo_02', 'Sensors & Actuators Bench', 'Explore sensors, motors and actuators.', 'Electronics', 'cat_8h741j3ss_1781383987929', NULL, 4, 1, '2026-09-26 20:28:23.000', '2026-09-26 20:28:23.000');
INSERT INTO `labs` (`id`, `name`, `shortDesc`, `tag`, `categoryId`, `departmentId`, `capacity`, `isBookable`, `createdAt`, `updatedAt`) VALUES ('lab_demo_03', '3D Printer Station', 'FDM 3D printers for quick prototypes.', 'Tool', 'cat_dy6mxl6z2_1781383987943', NULL, 2, 1, '2026-09-26 20:28:23.000', '2026-09-26 20:28:23.000');
INSERT INTO `labs` (`id`, `name`, `shortDesc`, `tag`, `categoryId`, `departmentId`, `capacity`, `isBookable`, `createdAt`, `updatedAt`) VALUES ('lab_demo_04', 'Precision Instruments Kit', 'Calipers, multimeters and oscilloscopes.', 'Tool', 'cat_dy6mxl6z2_1781383987943', NULL, 5, 1, '2026-09-26 20:28:23.000', '2026-09-26 20:28:23.000');
INSERT INTO `labs` (`id`, `name`, `shortDesc`, `tag`, `categoryId`, `departmentId`, `capacity`, `isBookable`, `createdAt`, `updatedAt`) VALUES ('lab_demo_05', 'Welding & Fabrication Bay', 'Metalwork and welding practice.', 'Mechanical', 'cat_kfn2csxey_1781383987939', NULL, 4, 1, '2026-09-26 20:28:23.000', '2026-09-26 20:28:23.000');
INSERT INTO `labs` (`id`, `name`, `shortDesc`, `tag`, `categoryId`, `departmentId`, `capacity`, `isBookable`, `createdAt`, `updatedAt`) VALUES ('lab_demo_06', 'Renewable Energy Rig', 'Solar and wind micro-generation setups.', 'Power', 'cat_kfn2csxey_1781383987939', NULL, 6, 1, '2026-09-26 20:28:23.000', '2026-09-26 20:28:23.000');
INSERT INTO `labs` (`id`, `name`, `shortDesc`, `tag`, `categoryId`, `departmentId`, `capacity`, `isBookable`, `createdAt`, `updatedAt`) VALUES ('lab_demo_07', 'Network Security Range', 'Isolated network for penetration testing practice.', 'Cybersecurity', 'cat_kq4urdi3v_1781383987934', NULL, 8, 1, '2026-09-26 20:28:23.000', '2026-09-26 20:28:23.000');
INSERT INTO `labs` (`id`, `name`, `shortDesc`, `tag`, `categoryId`, `departmentId`, `capacity`, `isBookable`, `createdAt`, `updatedAt`) VALUES ('lab_demo_08', 'Machine Learning Cluster', 'GPU workstations for ML training.', 'Data / AI', 'cat_kq4urdi3v_1781383987934', NULL, 6, 1, '2026-09-26 20:28:23.000', '2026-09-26 20:28:23.000');
INSERT INTO `labs` (`id`, `name`, `shortDesc`, `tag`, `categoryId`, `departmentId`, `capacity`, `isBookable`, `createdAt`, `updatedAt`) VALUES ('lab_demo_09', 'Laser Cutting Station', 'Precision laser cutting for wood and acrylic.', 'Fabrication', 'cat_fab_demo', NULL, 3, 1, '2026-09-26 20:28:23.000', '2026-09-26 20:28:23.000');
INSERT INTO `labs` (`id`, `name`, `shortDesc`, `tag`, `categoryId`, `departmentId`, `capacity`, `isBookable`, `createdAt`, `updatedAt`) VALUES ('lab_demo_10', 'CNC Router Bay', 'Computer-controlled routing and milling.', 'Fabrication', 'cat_fab_demo', NULL, 2, 1, '2026-09-26 20:28:23.000', '2026-09-26 20:28:23.000');
INSERT INTO `labs` (`id`, `name`, `shortDesc`, `tag`, `categoryId`, `departmentId`, `capacity`, `isBookable`, `createdAt`, `updatedAt`) VALUES ('lab_demo_11', '3D Scanning Rig', 'High-resolution 3D object scanning.', 'Fabrication', 'cat_fab_demo', NULL, 4, 1, '2026-09-26 20:28:23.000', '2026-09-26 20:28:23.000');
INSERT INTO `labs` (`id`, `name`, `shortDesc`, `tag`, `categoryId`, `departmentId`, `capacity`, `isBookable`, `createdAt`, `updatedAt`) VALUES ('lab_demo_12', 'Video Production Studio', 'Green screen, lighting and camera gear.', 'Media', 'cat_media_demo', NULL, 6, 1, '2026-09-26 20:28:23.000', '2026-09-26 20:28:23.000');
INSERT INTO `labs` (`id`, `name`, `shortDesc`, `tag`, `categoryId`, `departmentId`, `capacity`, `isBookable`, `createdAt`, `updatedAt`) VALUES ('lab_demo_13', 'Graphic Design Suite', 'Workstations with design software licenses.', 'Design', 'cat_media_demo', NULL, 8, 1, '2026-09-26 20:28:23.000', '2026-09-26 20:28:23.000');
INSERT INTO `labs` (`id`, `name`, `shortDesc`, `tag`, `categoryId`, `departmentId`, `capacity`, `isBookable`, `createdAt`, `updatedAt`) VALUES ('lab_demo_14', 'Podcast & Audio Booth', 'Sound-treated recording booth.', 'Audio', 'cat_media_demo', NULL, 2, 1, '2026-09-26 20:28:23.000', '2026-09-26 20:28:23.000');
INSERT INTO `labs` (`id`, `name`, `shortDesc`, `tag`, `categoryId`, `departmentId`, `capacity`, `isBookable`, `createdAt`, `updatedAt`) VALUES ('lab_ficpc8cs1_1781383987975', 'General Hand Toolbox', 'Screwdrivers, pliers.', 'Tool', 'cat_dy6mxl6z2_1781383987943', NULL, 1, 1, '2026-06-14 00:53:07.000', '2026-06-14 00:53:07.000');
INSERT INTO `labs` (`id`, `name`, `shortDesc`, `tag`, `categoryId`, `departmentId`, `capacity`, `isBookable`, `createdAt`, `updatedAt`) VALUES ('lab_jc9x1ycfj_1781383987955', 'Cybersecurity Lab', 'Honeypots and monitoring.', 'Cybersecurity', 'cat_kq4urdi3v_1781383987934', 'dept_5506vkhdc_1781383987820', 25, 1, '2026-06-14 00:53:07.000', '2026-06-14 00:53:07.000');
INSERT INTO `labs` (`id`, `name`, `shortDesc`, `tag`, `categoryId`, `departmentId`, `capacity`, `isBookable`, `createdAt`, `updatedAt`) VALUES ('lab_kdvodgfr4_1781383987958', 'PCB Design Lab', 'From schematic to board.', 'Electronics', 'cat_kq4urdi3v_1781383987934', NULL, 10, 1, '2026-06-14 00:53:07.000', '2026-06-14 00:53:07.000');
INSERT INTO `labs` (`id`, `name`, `shortDesc`, `tag`, `categoryId`, `departmentId`, `capacity`, `isBookable`, `createdAt`, `updatedAt`) VALUES ('lab_r0oo3z9vf_1781383987973', 'Measurement Pack', 'Multimeter and probes.', 'Tool', 'cat_dy6mxl6z2_1781383987943', NULL, 1, 1, '2026-06-14 00:53:07.000', '2026-06-14 00:53:07.000');
INSERT INTO `labs` (`id`, `name`, `shortDesc`, `tag`, `categoryId`, `departmentId`, `capacity`, `isBookable`, `createdAt`, `updatedAt`) VALUES ('lab_ri541k72k_1781383987964', 'Mechanical Assembly Lab', 'Frames and mounts.', 'Mechanical', 'cat_kfn2csxey_1781383987939', 'dept_m3mvoqmty_1781383987825', 15, 1, '2026-06-14 00:53:07.000', '2026-06-14 00:53:07.000');
INSERT INTO `labs` (`id`, `name`, `shortDesc`, `tag`, `categoryId`, `departmentId`, `capacity`, `isBookable`, `createdAt`, `updatedAt`) VALUES ('lab_stmui8vw3_1781383987961', 'Data & AI Lab', 'Model training.', 'Data / AI', 'cat_kq4urdi3v_1781383987934', NULL, 20, 1, '2026-06-14 00:53:07.000', '2026-06-14 00:53:07.000');
INSERT INTO `labs` (`id`, `name`, `shortDesc`, `tag`, `categoryId`, `departmentId`, `capacity`, `isBookable`, `createdAt`, `updatedAt`) VALUES ('lab_u14k8i2aw_1781383987950', 'Robotics Practice Lab', 'Testing small robots.', 'Robotics', 'cat_8h741j3ss_1781383987929', NULL, 12, 1, '2026-06-14 00:53:07.000', '2026-06-14 00:53:07.000');
INSERT INTO `labs` (`id`, `name`, `shortDesc`, `tag`, `categoryId`, `departmentId`, `capacity`, `isBookable`, `createdAt`, `updatedAt`) VALUES ('lab_xx6gtxv91_1781383987967', 'Power & Control Lab', 'Motors and relays.', 'Power', 'cat_kfn2csxey_1781383987939', NULL, 12, 1, '2026-06-14 00:53:07.000', '2026-06-14 00:53:07.000');

-- lab_bookings (10)
INSERT INTO `lab_bookings` (`id`, `labId`, `userId`, `bookingDate`, `timeSlot`, `purpose`, `status`, `createdAt`, `updatedAt`) VALUES ('booking_1', 'lab_049e2fo7g_1781383987969', 'usr_mllh3lh8i_1781383987843', '2026-10-21 00:00:00.000', '10:00-12:00', 'Testing LoRaWAN sensor nodes for the Smart Campus project', 'PENDING', '2026-09-10 09:00:00.000', '2026-09-10 09:00:00.000');
INSERT INTO `lab_bookings` (`id`, `labId`, `userId`, `bookingDate`, `timeSlot`, `purpose`, `status`, `createdAt`, `updatedAt`) VALUES ('booking_2', 'lab_jc9x1ycfj_1781383987955', 'usr_mllh3lh8i_1781383987843', '2026-10-15 00:00:00.000', '14:00-16:00', 'Pilot run of the threat monitoring agent', 'APPROVED', '2026-09-11 09:00:00.000', '2026-09-11 09:00:00.000');
INSERT INTO `lab_bookings` (`id`, `labId`, `userId`, `bookingDate`, `timeSlot`, `purpose`, `status`, `createdAt`, `updatedAt`) VALUES ('booking_3', 'lab_demo_07', 'usr_mllh3lh8i_1781383987843', '2026-09-22 00:00:00.000', '08:00-10:00', 'CTF practice session', 'COMPLETED', '2026-09-12 09:00:00.000', '2026-09-12 09:00:00.000');
INSERT INTO `lab_bookings` (`id`, `labId`, `userId`, `bookingDate`, `timeSlot`, `purpose`, `status`, `createdAt`, `updatedAt`) VALUES ('booking_4', 'lab_demo_01', 'usr_hassan', '2026-10-19 00:00:00.000', '08:00-10:00', 'Swarm formation flight test with four drones', 'APPROVED', '2026-09-13 09:00:00.000', '2026-09-13 09:00:00.000');
INSERT INTO `lab_bookings` (`id`, `labId`, `userId`, `bookingDate`, `timeSlot`, `purpose`, `status`, `createdAt`, `updatedAt`) VALUES ('booking_5', 'lab_demo_08', 'usr_yusuf', '2026-10-22 00:00:00.000', '12:00-14:00', 'Training the engine fault-prediction model', 'PENDING', '2026-09-14 09:00:00.000', '2026-09-14 09:00:00.000');
INSERT INTO `lab_bookings` (`id`, `labId`, `userId`, `bookingDate`, `timeSlot`, `purpose`, `status`, `createdAt`, `updatedAt`) VALUES ('booking_6', 'lab_demo_09', 'usr_said', '2026-10-23 00:00:00.000', '10:00-12:00', 'Cutting the smart bench electronics enclosure', 'PENDING', '2026-09-15 09:00:00.000', '2026-09-15 09:00:00.000');
INSERT INTO `lab_bookings` (`id`, `labId`, `userId`, `bookingDate`, `timeSlot`, `purpose`, `status`, `createdAt`, `updatedAt`) VALUES ('booking_7', 'lab_stmui8vw3_1781383987961', 'usr_maryam', '2026-09-30 00:00:00.000', '10:00-12:00', 'Benchmarking route optimisation solvers', 'COMPLETED', '2026-09-16 09:00:00.000', '2026-09-16 09:00:00.000');
INSERT INTO `lab_bookings` (`id`, `labId`, `userId`, `bookingDate`, `timeSlot`, `purpose`, `status`, `createdAt`, `updatedAt`) VALUES ('booking_8', 'lab_demo_03', 'usr_hassan', '2026-09-18 00:00:00.000', '14:00-16:00', 'Printing payload mount prototypes', 'COMPLETED', '2026-09-17 09:00:00.000', '2026-09-17 09:00:00.000');
INSERT INTO `lab_bookings` (`id`, `labId`, `userId`, `bookingDate`, `timeSlot`, `purpose`, `status`, `createdAt`, `updatedAt`) VALUES ('booking_9', 'lab_u14k8i2aw_1781383987950', 'usr_omar', '2026-10-08 00:00:00.000', '08:00-10:00', 'RFID kiosk integration test', 'CANCELLED', '2026-09-18 09:00:00.000', '2026-09-18 09:00:00.000');
INSERT INTO `lab_bookings` (`id`, `labId`, `userId`, `bookingDate`, `timeSlot`, `purpose`, `status`, `createdAt`, `updatedAt`) VALUES ('booking_10', 'lab_demo_06', 'usr_said', '2026-10-01 00:00:00.000', '12:00-14:00', 'Measuring solar panel output', 'REJECTED', '2026-09-19 09:00:00.000', '2026-09-19 09:00:00.000');

-- projects (12)
INSERT INTO `projects` (`id`, `title`, `description`, `status`, `category`, `progress`, `startDate`, `endDate`, `createdById`, `createdAt`, `updatedAt`) VALUES ('proj_98nuulgzk_1781383987978', 'Autonomous Line-Following Robot', 'An educational robot that follows a track using an infrared sensor array and a PID controller. Built as a teaching kit for new club members.

**Outcomes**
- 10 kits assembled and used in the Arduino Fundamentals workshop
- Full build guide and code published for members', 'COMPLETED', 'Robotics', 100, '2025-10-01 00:00:00.000', '2026-01-20 00:00:00.000', 'usr_mllh3lh8i_1781383987843', '2026-06-14 00:53:07.000', '2026-06-20 09:00:00.000');
INSERT INTO `projects` (`id`, `title`, `description`, `status`, `category`, `progress`, `startDate`, `endDate`, `createdById`, `createdAt`, `updatedAt`) VALUES ('proj_gul0xhaye_1781383987982', 'Internal Threat Monitoring Platform', 'A behaviour-based monitoring system that learns normal user activity on lab workstations and flags anomalies such as unusual login times, bulk file access or USB exfiltration.

**Current milestones**
- Endpoint agent collecting process and file events (done)
- Baseline model for normal behaviour (done)
- Analyst dashboard with alert triage (in progress)

Pilot deployment in the Cybersecurity Lab is planned for next month.', 'DEVELOPMENT', 'Cybersecurity', 70, '2026-03-01 00:00:00.000', NULL, 'usr_mllh3lh8i_1781383987843', '2026-06-14 00:53:07.000', '2026-10-08 14:05:00.000');
INSERT INTO `projects` (`id`, `title`, `description`, `status`, `category`, `progress`, `startDate`, `endDate`, `createdById`, `createdAt`, `updatedAt`) VALUES ('proj_gv4piexwj_1781383987989', 'Smart Campus IoT Network', 'A campus-wide network of low-power sensors that monitors temperature, air quality and room occupancy across classrooms and labs.

**Objectives**
- Deploy 40 LoRaWAN sensor nodes across two academic buildings
- Build a live dashboard for facilities and the club
- Use occupancy data to cut air-conditioning energy use

The team is currently selecting hardware and surveying gateway locations.', 'START', 'IoT', 15, '2026-09-01 00:00:00.000', NULL, 'usr_mllh3lh8i_1781383987843', '2026-06-14 00:53:07.000', '2026-10-02 11:20:00.000');
INSERT INTO `projects` (`id`, `title`, `description`, `status`, `category`, `progress`, `startDate`, `endDate`, `createdById`, `createdAt`, `updatedAt`) VALUES ('proj_water_buoy', 'Coastal Water Quality Buoy', 'A solar-powered floating buoy that measures pH, turbidity, dissolved oxygen and temperature along the coast and reports readings over GSM.

**Outcomes**
- Three buoys deployed for six months near Muscat
- Results published in the Research Hub
- Recognised at the Gulf Engineering Conference', 'COMPLETED', 'Sustainability', 100, '2025-04-01 00:00:00.000', '2025-10-15 00:00:00.000', 'usr_yusuf', '2026-06-23 10:30:00.000', '2026-06-30 12:00:00.000');
INSERT INTO `projects` (`id`, `title`, `description`, `status`, `category`, `progress`, `startDate`, `endDate`, `createdById`, `createdAt`, `updatedAt`) VALUES ('proj_drone_swarm', 'Drone Swarm Search & Rescue Simulator', 'A simulation environment for testing decentralised coordination algorithms that let a swarm of small drones search an area and locate survivors.

**Current milestones**
- Physics simulation with 20 agents (done)
- Area-coverage algorithm (in progress)
- Field test with four real drones in the Drone Assembly Lab (planned)', 'DEVELOPMENT', 'AI', 55, '2026-02-15 00:00:00.000', NULL, 'usr_hassan', '2026-06-21 11:00:00.000', '2026-10-06 16:40:00.000');
INSERT INTO `projects` (`id`, `title`, `description`, `status`, `category`, `progress`, `startDate`, `endDate`, `createdById`, `createdAt`, `updatedAt`) VALUES ('proj_marine_pdm', 'Predictive Maintenance Dashboard for Marine Engines', 'Turns vibration and thermal sensor data from marine diesel engines into early warnings for maintenance crews, building on the related thesis in the Research Hub.

**Current milestones**
- Data pipeline from the engine test bench (done)
- Fault-prediction model (in progress)
- Crew-facing dashboard (planned)', 'DEVELOPMENT', 'AI', 40, '2026-05-01 00:00:00.000', NULL, 'usr_yusuf', '2026-06-23 11:00:00.000', '2026-09-28 10:15:00.000');
INSERT INTO `projects` (`id`, `title`, `description`, `status`, `category`, `progress`, `startDate`, `endDate`, `createdById`, `createdAt`, `updatedAt`) VALUES ('proj_phishing_sim', 'Phishing Awareness Training Simulator', 'A safe, internal platform that sends simulated phishing emails and gives instant, friendly training to anyone who clicks.

**Outcomes**
- Used in two college-wide awareness campaigns
- Click rate dropped from 31% to 9% between campaigns
- Adopted by the college IT department', 'COMPLETED', 'Cybersecurity', 100, '2025-11-01 00:00:00.000', '2026-05-30 00:00:00.000', 'usr_fatma', '2026-06-20 10:30:00.000', '2026-07-02 09:00:00.000');
INSERT INTO `projects` (`id`, `title`, `description`, `status`, `category`, `progress`, `startDate`, `endDate`, `createdById`, `createdAt`, `updatedAt`) VALUES ('proj_solar_bench', 'Solar-Powered Smart Bench', 'An outdoor bench with a solar panel, USB charging, night lighting and a small weather station.

**Objectives**
- Design a weather-proof electronics enclosure
- Build and install a prototype near the student centre
- Log energy generation and usage for a full semester', 'START', 'Sustainability', 10, '2026-10-01 00:00:00.000', NULL, 'usr_said', '2026-06-27 12:00:00.000', '2026-10-05 13:30:00.000');
INSERT INTO `projects` (`id`, `title`, `description`, `status`, `category`, `progress`, `startDate`, `endDate`, `createdById`, `createdAt`, `updatedAt`) VALUES ('proj_rfid_inventory', 'RFID Inventory Tracking for Workshops', 'Tags every tool and instrument in the club workshops so that check-out, return and missing items are tracked automatically.

**Current milestones**
- 150 tools tagged in the Tools & Equipment store (done)
- Check-out kiosk with student ID scan (done)
- Integration with lab bookings (in progress)', 'DEVELOPMENT', 'Smart Logistics', 65, '2026-03-15 00:00:00.000', NULL, 'usr_omar', '2026-06-25 10:30:00.000', '2026-10-09 15:00:00.000');
INSERT INTO `projects` (`id`, `title`, `description`, `status`, `category`, `progress`, `startDate`, `endDate`, `createdById`, `createdAt`, `updatedAt`) VALUES ('proj_route_opt', 'Fleet Route Optimisation Tool', 'A planning tool that suggests efficient delivery routes for a small vehicle fleet, taking time windows and vehicle capacity into account.

**Objectives**
- Collect a realistic dataset of delivery requests
- Compare heuristic and exact solvers
- Build a simple map-based planning interface', 'START', 'Smart Logistics', 5, '2026-10-10 00:00:00.000', NULL, 'usr_maryam', '2026-06-22 10:30:00.000', '2026-10-10 09:00:00.000');
INSERT INTO `projects` (`id`, `title`, `description`, `status`, `category`, `progress`, `startDate`, `endDate`, `createdById`, `createdAt`, `updatedAt`) VALUES ('proj_aircraft_vision', 'AI Visual Inspection of Aircraft Panels', 'A camera rig and deep-learning model that detects dents, scratches and corrosion on aircraft skin panels during routine inspections.

**Plan**
- Build an annotated image dataset with the Aeronautical department
- Train and evaluate a defect-detection model
- Prototype a handheld inspection app', 'PENDING_APPROVAL', 'AI', 0, NULL, NULL, 'usr_noor', '2026-10-07 10:00:00.000', '2026-10-07 10:05:00.000');
INSERT INTO `projects` (`id`, `title`, `description`, `status`, `category`, `progress`, `startDate`, `endDate`, `createdById`, `createdAt`, `updatedAt`) VALUES ('proj_secure_msg', 'Secure Messaging App for Field Teams', 'An end-to-end encrypted messaging app for small field teams that works over unreliable networks and supports message expiry.

**Status**
- Encryption protocol and key exchange (done)
- Android app with offline queueing (done)
- Security review by Dr. Huda Al-Zadjali (done)

Submitted for completion review.', 'PENDING_COMPLETION', 'Cybersecurity', 95, '2026-01-10 00:00:00.000', NULL, 'usr_aisha', '2026-06-24 10:30:00.000', '2026-10-11 17:20:00.000');

-- project_members (25)
INSERT INTO `project_members` (`id`, `projectId`, `userId`, `role`, `status`, `joinedAt`) VALUES ('pm_owner_proj_gv4piexwj_1781383987989', 'proj_gv4piexwj_1781383987989', 'usr_mllh3lh8i_1781383987843', 'Owner', 'APPROVED', '2026-06-14 00:53:07.000');
INSERT INTO `project_members` (`id`, `projectId`, `userId`, `role`, `status`, `joinedAt`) VALUES ('pm_owner_proj_gul0xhaye_1781383987982', 'proj_gul0xhaye_1781383987982', 'usr_mllh3lh8i_1781383987843', 'Owner', 'APPROVED', '2026-06-14 00:53:07.000');
INSERT INTO `project_members` (`id`, `projectId`, `userId`, `role`, `status`, `joinedAt`) VALUES ('pm_owner_proj_98nuulgzk_1781383987978', 'proj_98nuulgzk_1781383987978', 'usr_mllh3lh8i_1781383987843', 'Owner', 'APPROVED', '2026-06-14 00:53:07.000');
INSERT INTO `project_members` (`id`, `projectId`, `userId`, `role`, `status`, `joinedAt`) VALUES ('pm_owner_proj_water_buoy', 'proj_water_buoy', 'usr_yusuf', 'Owner', 'APPROVED', '2026-06-23 10:30:00.000');
INSERT INTO `project_members` (`id`, `projectId`, `userId`, `role`, `status`, `joinedAt`) VALUES ('pm_owner_proj_drone_swarm', 'proj_drone_swarm', 'usr_hassan', 'Owner', 'APPROVED', '2026-06-21 11:00:00.000');
INSERT INTO `project_members` (`id`, `projectId`, `userId`, `role`, `status`, `joinedAt`) VALUES ('pm_owner_proj_marine_pdm', 'proj_marine_pdm', 'usr_yusuf', 'Owner', 'APPROVED', '2026-06-23 11:00:00.000');
INSERT INTO `project_members` (`id`, `projectId`, `userId`, `role`, `status`, `joinedAt`) VALUES ('pm_owner_proj_phishing_sim', 'proj_phishing_sim', 'usr_fatma', 'Owner', 'APPROVED', '2026-06-20 10:30:00.000');
INSERT INTO `project_members` (`id`, `projectId`, `userId`, `role`, `status`, `joinedAt`) VALUES ('pm_owner_proj_solar_bench', 'proj_solar_bench', 'usr_said', 'Owner', 'APPROVED', '2026-06-27 12:00:00.000');
INSERT INTO `project_members` (`id`, `projectId`, `userId`, `role`, `status`, `joinedAt`) VALUES ('pm_owner_proj_rfid_inventory', 'proj_rfid_inventory', 'usr_omar', 'Owner', 'APPROVED', '2026-06-25 10:30:00.000');
INSERT INTO `project_members` (`id`, `projectId`, `userId`, `role`, `status`, `joinedAt`) VALUES ('pm_owner_proj_route_opt', 'proj_route_opt', 'usr_maryam', 'Owner', 'APPROVED', '2026-06-22 10:30:00.000');
INSERT INTO `project_members` (`id`, `projectId`, `userId`, `role`, `status`, `joinedAt`) VALUES ('pm_owner_proj_aircraft_vision', 'proj_aircraft_vision', 'usr_noor', 'Owner', 'APPROVED', '2026-10-07 10:00:00.000');
INSERT INTO `project_members` (`id`, `projectId`, `userId`, `role`, `status`, `joinedAt`) VALUES ('pm_owner_proj_secure_msg', 'proj_secure_msg', 'usr_aisha', 'Owner', 'APPROVED', '2026-06-24 10:30:00.000');
INSERT INTO `project_members` (`id`, `projectId`, `userId`, `role`, `status`, `joinedAt`) VALUES ('pm_1', 'proj_gv4piexwj_1781383987989', 'usr_maryam', 'Member', 'APPROVED', '2026-09-03 00:00:00.000');
INSERT INTO `project_members` (`id`, `projectId`, `userId`, `role`, `status`, `joinedAt`) VALUES ('pm_2', 'proj_gv4piexwj_1781383987989', 'usr_omar', 'Member', 'APPROVED', '2026-09-04 00:00:00.000');
INSERT INTO `project_members` (`id`, `projectId`, `userId`, `role`, `status`, `joinedAt`) VALUES ('pm_3', 'proj_gul0xhaye_1781383987982', 'usr_aisha', 'Member', 'APPROVED', '2026-03-05 00:00:00.000');
INSERT INTO `project_members` (`id`, `projectId`, `userId`, `role`, `status`, `joinedAt`) VALUES ('pm_4', 'proj_gul0xhaye_1781383987982', 'usr_omar', 'Member', 'PENDING', '2026-10-10 12:00:00.000');
INSERT INTO `project_members` (`id`, `projectId`, `userId`, `role`, `status`, `joinedAt`) VALUES ('pm_5', 'proj_98nuulgzk_1781383987978', 'usr_hassan', 'Member', 'APPROVED', '2025-10-05 00:00:00.000');
INSERT INTO `project_members` (`id`, `projectId`, `userId`, `role`, `status`, `joinedAt`) VALUES ('pm_6', 'proj_water_buoy', 'usr_said', 'Member', 'APPROVED', '2025-04-10 00:00:00.000');
INSERT INTO `project_members` (`id`, `projectId`, `userId`, `role`, `status`, `joinedAt`) VALUES ('pm_7', 'proj_drone_swarm', 'usr_noor', 'Member', 'APPROVED', '2026-02-20 00:00:00.000');
INSERT INTO `project_members` (`id`, `projectId`, `userId`, `role`, `status`, `joinedAt`) VALUES ('pm_8', 'proj_drone_swarm', 'usr_mllh3lh8i_1781383987843', 'Member', 'PENDING', '2026-10-09 18:30:00.000');
INSERT INTO `project_members` (`id`, `projectId`, `userId`, `role`, `status`, `joinedAt`) VALUES ('pm_9', 'proj_marine_pdm', 'usr_maryam', 'Member', 'APPROVED', '2026-05-05 00:00:00.000');
INSERT INTO `project_members` (`id`, `projectId`, `userId`, `role`, `status`, `joinedAt`) VALUES ('pm_10', 'proj_phishing_sim', 'usr_aisha', 'Member', 'APPROVED', '2025-11-02 00:00:00.000');
INSERT INTO `project_members` (`id`, `projectId`, `userId`, `role`, `status`, `joinedAt`) VALUES ('pm_11', 'proj_solar_bench', 'usr_yusuf', 'Member', 'APPROVED', '2026-10-02 00:00:00.000');
INSERT INTO `project_members` (`id`, `projectId`, `userId`, `role`, `status`, `joinedAt`) VALUES ('pm_12', 'proj_rfid_inventory', 'usr_mllh3lh8i_1781383987843', 'Member', 'APPROVED', '2026-03-20 00:00:00.000');
INSERT INTO `project_members` (`id`, `projectId`, `userId`, `role`, `status`, `joinedAt`) VALUES ('pm_13', 'proj_secure_msg', 'usr_fatma', 'Member', 'APPROVED', '2026-01-12 00:00:00.000');

-- research (9)
INSERT INTO `research` (`id`, `title`, `abstract`, `authors`, `category`, `publicationDate`, `url`, `createdAt`, `updatedAt`) VALUES ('res_demo_1', 'Low-Cost IoT Water Quality Monitoring for Coastal Oman', 'This paper presents a low-cost, solar-powered IoT sensor network designed to monitor water quality parameters such as pH, turbidity, and dissolved oxygen along the coastal areas of Oman. The system was field-tested over six months and demonstrated reliable long-term operation with minimal maintenance, providing actionable data for environmental agencies and local fisheries.', 'Cadet A. Al-Balushi, Dr. Khalid Al-Rashdi', 'Published', '2025-11-02 00:00:00.000', NULL, '2026-09-26 19:45:13.000', '2026-09-26 19:45:13.000');
INSERT INTO `research` (`id`, `title`, `abstract`, `authors`, `category`, `publicationDate`, `url`, `createdAt`, `updatedAt`) VALUES ('res_demo_2', 'Autonomous Drone Swarm Coordination for Search and Rescue', 'An ongoing research effort exploring decentralized coordination algorithms for small drone swarms operating in GPS-denied environments, with applications in search and rescue missions across mountainous terrain.', 'Cpl. Hassan Al-Siyabi, Lt. Mohammed Al-Hinai', 'Ongoing', NULL, NULL, '2026-09-26 19:45:13.000', '2026-09-26 19:45:13.000');
INSERT INTO `research` (`id`, `title`, `abstract`, `authors`, `category`, `publicationDate`, `url`, `createdAt`, `updatedAt`) VALUES ('res_demo_3', 'Predictive Maintenance of Marine Diesel Engines using Machine Learning', 'A thesis investigating the use of vibration and thermal sensor data combined with supervised machine learning models to predict maintenance needs of marine diesel engines before failure occurs, reducing downtime and repair costs.', 'Sgt. Yusuf Al-Kindi', 'Thesis', '2025-06-15 00:00:00.000', NULL, '2026-09-26 19:45:13.000', '2026-09-26 19:45:13.000');
INSERT INTO `research` (`id`, `title`, `abstract`, `authors`, `category`, `publicationDate`, `url`, `createdAt`, `updatedAt`) VALUES ('res_ids_iot', 'Lightweight Intrusion Detection for IoT Edge Devices', 'We propose a compact anomaly-based intrusion detection model that runs directly on low-power IoT gateways. Using feature selection and a quantised decision-tree ensemble, the model detects common botnet and scanning attacks with 96% accuracy while using under 64 KB of memory. Presented at the Gulf Engineering Conference 2025.', 'Fatma Al-Lawati, Dr. Huda Al-Zadjali', 'Conference', '2025-11-14 00:00:00.000', NULL, '2026-07-01 09:00:00.000', '2026-07-01 09:00:00.000');
INSERT INTO `research` (`id`, `title`, `abstract`, `authors`, `category`, `publicationDate`, `url`, `createdAt`, `updatedAt`) VALUES ('res_concrete', 'Embedded Sensors for Corrosion Monitoring in Coastal Concrete', 'Coastal concrete structures in Oman face accelerated reinforcement corrosion. This paper evaluates low-cost embedded resistivity and humidity sensors for continuous monitoring and compares their readings with laboratory half-cell potential tests over a 12-week exposure trial.', 'Said Al-Ghafri, Eng. Khalid Al-Rashdi', 'Conference', '2026-03-10 00:00:00.000', NULL, '2026-07-02 09:00:00.000', '2026-07-02 09:00:00.000');
INSERT INTO `research` (`id`, `title`, `abstract`, `authors`, `category`, `publicationDate`, `url`, `createdAt`, `updatedAt`) VALUES ('res_uav_mount', 'Modular Quick-Release Payload Mount for Small UAVs', 'A patent application for a tool-free, vibration-damped payload mount that lets small UAVs swap cameras, sensors or delivery modules in under ten seconds. The design is 3D-printable and was developed in the AFAQ Fabrication Lab.', 'Hassan Al-Siyabi, Eng. Khalid Al-Rashdi', 'Patent', '2026-02-01 00:00:00.000', NULL, '2026-07-03 09:00:00.000', '2026-07-03 09:00:00.000');
INSERT INTO `research` (`id`, `title`, `abstract`, `authors`, `category`, `publicationDate`, `url`, `createdAt`, `updatedAt`) VALUES ('res_phishing', 'Phishing Susceptibility among Technical College Students: A Field Study', 'Using the AFAQ Phishing Awareness Training Simulator, we measured how 600 students and staff responded to simulated phishing campaigns. Immediate micro-training after a click reduced repeat susceptibility by 71%. We discuss which lure types were most effective and recommend a campaign schedule for colleges.', 'Fatma Al-Lawati, Aisha Al-Busaidi, Dr. Huda Al-Zadjali', 'Published', '2026-05-20 00:00:00.000', NULL, '2026-07-04 09:00:00.000', '2026-07-04 09:00:00.000');
INSERT INTO `research` (`id`, `title`, `abstract`, `authors`, `category`, `publicationDate`, `url`, `createdAt`, `updatedAt`) VALUES ('res_rl_warehouse', 'Reinforcement Learning for Warehouse Robot Path Planning', 'An ongoing study comparing deep reinforcement learning with classical planners for multi-robot path planning in narrow warehouse aisles. Early simulation results show fewer collisions and shorter completion times when robots share a learned congestion map.', 'Omar Al-Maamari, Maryam Al-Hinai', 'Ongoing', NULL, NULL, '2026-07-05 09:00:00.000', '2026-07-05 09:00:00.000');
INSERT INTO `research` (`id`, `title`, `abstract`, `authors`, `category`, `publicationDate`, `url`, `createdAt`, `updatedAt`) VALUES ('res_avionics_fw', 'Secure Firmware Updates for Embedded Avionics', 'This thesis designs and evaluates a signed, rollback-protected firmware update process for small embedded avionics units, balancing security guarantees against the tight memory and certification constraints of airborne systems.', 'Noor Al-Rawahi', 'Thesis', '2026-06-30 00:00:00.000', NULL, '2026-07-06 09:00:00.000', '2026-07-06 09:00:00.000');

-- events (10)
INSERT INTO `events` (`id`, `title`, `description`, `category`, `startDate`, `endDate`, `location`, `capacity`, `createdById`, `createdAt`, `updatedAt`) VALUES ('evt_jufbemi46_1781383987992', 'Induction Week 2025/2026', 'A three-day welcome programme for new AFAQ members: club tour, lab safety induction, track introductions and team-forming sessions.', 'Workshop', '2025-09-14 08:00:00.000', '2025-09-16 14:00:00.000', 'Main Auditorium', 200, 'usr_1781384107881', '2026-06-14 00:53:07.000', '2026-06-14 00:53:07.000');
INSERT INTO `events` (`id`, `title`, `description`, `category`, `startDate`, `endDate`, `location`, `capacity`, `createdById`, `createdAt`, `updatedAt`) VALUES ('evt_arduino_ws', 'Arduino Fundamentals Workshop', 'Hands-on introduction to microcontrollers: digital and analog I/O, sensors and motors. Participants build the AFAQ line-following robot kit.', 'Workshop', '2025-11-05 09:00:00.000', '2025-11-05 13:00:00.000', 'Arduino Starter Lab', 15, 'usr_demo_staff', '2026-01-10 09:00:00.000', '2026-01-10 09:00:00.000');
INSERT INTO `events` (`id`, `title`, `description`, `category`, `startDate`, `endDate`, `location`, `capacity`, `createdById`, `createdAt`, `updatedAt`) VALUES ('evt_ctf_night', 'CTF Night: Capture the Flag', 'A six-hour jeopardy-style CTF covering web, crypto, forensics and reverse engineering. Teams of three; prizes for the top teams.', 'Competition', '2026-02-18 17:00:00.000', '2026-02-18 23:00:00.000', 'Cybersecurity Lab', 60, 'usr_staff_huda', '2026-02-10 09:00:00.000', '2026-02-10 09:00:00.000');
INSERT INTO `events` (`id`, `title`, `description`, `category`, `startDate`, `endDate`, `location`, `capacity`, `createdById`, `createdAt`, `updatedAt`) VALUES ('evt_exhibition_26', 'AFAQ Innovation Exhibition 2026', 'The annual showcase of club projects for faculty, industry partners and visitors, with judging across all innovation tracks.', 'Exhibition', '2026-04-20 09:00:00.000', '2026-04-21 15:00:00.000', 'Main Exhibition Hall', 400, 'usr_1781384107881', '2026-03-10 09:00:00.000', '2026-03-10 09:00:00.000');
INSERT INTO `events` (`id`, `title`, `description`, `category`, `startDate`, `endDate`, `location`, `capacity`, `createdById`, `createdAt`, `updatedAt`) VALUES ('evt_drone_bootcamp', 'Drone Building Bootcamp', 'Build, configure and fly a small quadcopter in one day. Covers frame assembly, flight controller setup, safety and basic piloting.', 'Workshop', '2026-10-27 09:00:00.000', '2026-10-27 15:00:00.000', 'Drone Assembly Lab', 12, 'usr_demo_staff', '2026-04-10 09:00:00.000', '2026-04-10 09:00:00.000');
INSERT INTO `events` (`id`, `title`, `description`, `category`, `startDate`, `endDate`, `location`, `capacity`, `createdById`, `createdAt`, `updatedAt`) VALUES ('evt_ai_logistics', 'Seminar: AI in Defence Logistics', 'Guest speakers discuss how machine learning is used for demand forecasting, predictive maintenance and route planning in defence logistics.', 'Seminar', '2026-11-10 10:00:00.000', '2026-11-10 12:00:00.000', 'Main Auditorium', 200, 'usr_1781384107881', '2026-05-10 09:00:00.000', '2026-05-10 09:00:00.000');
INSERT INTO `events` (`id`, `title`, `description`, `category`, `startDate`, `endDate`, `location`, `capacity`, `createdById`, `createdAt`, `updatedAt`) VALUES ('evt_cyber_selection', 'National Cyber Challenge: Team Selection', 'Qualifying round to select the six members who will represent the college at the National Cyber Challenge.', 'Competition', '2026-11-24 16:00:00.000', '2026-11-24 21:00:00.000', 'Cybersecurity Lab', 40, 'usr_staff_huda', '2026-06-10 09:00:00.000', '2026-06-10 09:00:00.000');
INSERT INTO `events` (`id`, `title`, `description`, `category`, `startDate`, `endDate`, `location`, `capacity`, `createdById`, `createdAt`, `updatedAt`) VALUES ('evt_hackathon', 'Sustainability Hackathon', 'A 32-hour hackathon on energy, water and waste challenges on campus. Mentors from the Sustainability track will support every team.', 'Competition', '2026-12-08 08:00:00.000', '2026-12-09 16:00:00.000', 'AI & Ideas Corner', 80, 'usr_1781384107881', '2026-07-10 09:00:00.000', '2026-07-10 09:00:00.000');
INSERT INTO `events` (`id`, `title`, `description`, `category`, `startDate`, `endDate`, `location`, `capacity`, `createdById`, `createdAt`, `updatedAt`) VALUES ('evt_3dprint_ws', 'Workshop: 3D Printing & Rapid Prototyping', 'From CAD model to physical part: slicing, material choice, print settings and post-processing for functional prototypes.', 'Workshop', '2027-01-12 09:00:00.000', '2027-01-12 13:00:00.000', 'Fabrication Lab', 15, 'usr_demo_staff', '2026-08-10 09:00:00.000', '2026-08-10 09:00:00.000');
INSERT INTO `events` (`id`, `title`, `description`, `category`, `startDate`, `endDate`, `location`, `capacity`, `createdById`, `createdAt`, `updatedAt`) VALUES ('evt_exhibition_27', 'AFAQ Innovation Exhibition 2027', 'Next year''s annual showcase. Project teams can register their exhibits from December.', 'Exhibition', '2027-02-15 09:00:00.000', '2027-02-16 15:00:00.000', 'Main Exhibition Hall', 400, 'usr_1781384107881', '2026-09-10 09:00:00.000', '2026-09-10 09:00:00.000');

-- event_registrations (30)
INSERT INTO `event_registrations` (`id`, `eventId`, `userId`, `status`, `registeredAt`) VALUES ('ereg_1', 'evt_jufbemi46_1781383987992', 'usr_mllh3lh8i_1781383987843', 'REGISTERED', '2026-10-01 12:00:00.000');
INSERT INTO `event_registrations` (`id`, `eventId`, `userId`, `status`, `registeredAt`) VALUES ('ereg_2', 'evt_jufbemi46_1781383987992', 'usr_fatma', 'REGISTERED', '2026-10-02 12:00:00.000');
INSERT INTO `event_registrations` (`id`, `eventId`, `userId`, `status`, `registeredAt`) VALUES ('ereg_3', 'evt_jufbemi46_1781383987992', 'usr_hassan', 'REGISTERED', '2026-10-03 12:00:00.000');
INSERT INTO `event_registrations` (`id`, `eventId`, `userId`, `status`, `registeredAt`) VALUES ('ereg_4', 'evt_jufbemi46_1781383987992', 'usr_maryam', 'REGISTERED', '2026-10-04 12:00:00.000');
INSERT INTO `event_registrations` (`id`, `eventId`, `userId`, `status`, `registeredAt`) VALUES ('ereg_5', 'evt_jufbemi46_1781383987992', 'usr_aisha', 'REGISTERED', '2026-10-05 12:00:00.000');
INSERT INTO `event_registrations` (`id`, `eventId`, `userId`, `status`, `registeredAt`) VALUES ('ereg_6', 'evt_jufbemi46_1781383987992', 'usr_omar', 'REGISTERED', '2026-10-06 12:00:00.000');
INSERT INTO `event_registrations` (`id`, `eventId`, `userId`, `status`, `registeredAt`) VALUES ('ereg_7', 'evt_arduino_ws', 'usr_mllh3lh8i_1781383987843', 'REGISTERED', '2026-10-01 12:00:00.000');
INSERT INTO `event_registrations` (`id`, `eventId`, `userId`, `status`, `registeredAt`) VALUES ('ereg_8', 'evt_arduino_ws', 'usr_said', 'REGISTERED', '2026-10-02 12:00:00.000');
INSERT INTO `event_registrations` (`id`, `eventId`, `userId`, `status`, `registeredAt`) VALUES ('ereg_9', 'evt_arduino_ws', 'usr_noor', 'REGISTERED', '2026-10-03 12:00:00.000');
INSERT INTO `event_registrations` (`id`, `eventId`, `userId`, `status`, `registeredAt`) VALUES ('ereg_10', 'evt_arduino_ws', 'usr_maryam', 'REGISTERED', '2026-10-04 12:00:00.000');
INSERT INTO `event_registrations` (`id`, `eventId`, `userId`, `status`, `registeredAt`) VALUES ('ereg_11', 'evt_ctf_night', 'usr_fatma', 'REGISTERED', '2026-10-01 12:00:00.000');
INSERT INTO `event_registrations` (`id`, `eventId`, `userId`, `status`, `registeredAt`) VALUES ('ereg_12', 'evt_ctf_night', 'usr_aisha', 'REGISTERED', '2026-10-02 12:00:00.000');
INSERT INTO `event_registrations` (`id`, `eventId`, `userId`, `status`, `registeredAt`) VALUES ('ereg_13', 'evt_ctf_night', 'usr_mllh3lh8i_1781383987843', 'REGISTERED', '2026-10-03 12:00:00.000');
INSERT INTO `event_registrations` (`id`, `eventId`, `userId`, `status`, `registeredAt`) VALUES ('ereg_14', 'evt_ctf_night', 'usr_omar', 'REGISTERED', '2026-10-04 12:00:00.000');
INSERT INTO `event_registrations` (`id`, `eventId`, `userId`, `status`, `registeredAt`) VALUES ('ereg_15', 'evt_exhibition_26', 'usr_yusuf', 'REGISTERED', '2026-10-01 12:00:00.000');
INSERT INTO `event_registrations` (`id`, `eventId`, `userId`, `status`, `registeredAt`) VALUES ('ereg_16', 'evt_exhibition_26', 'usr_fatma', 'REGISTERED', '2026-10-02 12:00:00.000');
INSERT INTO `event_registrations` (`id`, `eventId`, `userId`, `status`, `registeredAt`) VALUES ('ereg_17', 'evt_exhibition_26', 'usr_hassan', 'REGISTERED', '2026-10-03 12:00:00.000');
INSERT INTO `event_registrations` (`id`, `eventId`, `userId`, `status`, `registeredAt`) VALUES ('ereg_18', 'evt_exhibition_26', 'usr_mllh3lh8i_1781383987843', 'REGISTERED', '2026-10-04 12:00:00.000');
INSERT INTO `event_registrations` (`id`, `eventId`, `userId`, `status`, `registeredAt`) VALUES ('ereg_19', 'evt_exhibition_26', 'usr_aisha', 'REGISTERED', '2026-10-05 12:00:00.000');
INSERT INTO `event_registrations` (`id`, `eventId`, `userId`, `status`, `registeredAt`) VALUES ('ereg_20', 'evt_drone_bootcamp', 'usr_hassan', 'REGISTERED', '2026-10-01 12:00:00.000');
INSERT INTO `event_registrations` (`id`, `eventId`, `userId`, `status`, `registeredAt`) VALUES ('ereg_21', 'evt_drone_bootcamp', 'usr_noor', 'REGISTERED', '2026-10-02 12:00:00.000');
INSERT INTO `event_registrations` (`id`, `eventId`, `userId`, `status`, `registeredAt`) VALUES ('ereg_22', 'evt_drone_bootcamp', 'usr_mllh3lh8i_1781383987843', 'REGISTERED', '2026-10-03 12:00:00.000');
INSERT INTO `event_registrations` (`id`, `eventId`, `userId`, `status`, `registeredAt`) VALUES ('ereg_23', 'evt_ai_logistics', 'usr_maryam', 'REGISTERED', '2026-10-01 12:00:00.000');
INSERT INTO `event_registrations` (`id`, `eventId`, `userId`, `status`, `registeredAt`) VALUES ('ereg_24', 'evt_ai_logistics', 'usr_omar', 'REGISTERED', '2026-10-02 12:00:00.000');
INSERT INTO `event_registrations` (`id`, `eventId`, `userId`, `status`, `registeredAt`) VALUES ('ereg_25', 'evt_ai_logistics', 'usr_yusuf', 'REGISTERED', '2026-10-03 12:00:00.000');
INSERT INTO `event_registrations` (`id`, `eventId`, `userId`, `status`, `registeredAt`) VALUES ('ereg_26', 'evt_cyber_selection', 'usr_fatma', 'REGISTERED', '2026-10-01 12:00:00.000');
INSERT INTO `event_registrations` (`id`, `eventId`, `userId`, `status`, `registeredAt`) VALUES ('ereg_27', 'evt_cyber_selection', 'usr_aisha', 'REGISTERED', '2026-10-02 12:00:00.000');
INSERT INTO `event_registrations` (`id`, `eventId`, `userId`, `status`, `registeredAt`) VALUES ('ereg_28', 'evt_cyber_selection', 'usr_mllh3lh8i_1781383987843', 'REGISTERED', '2026-10-03 12:00:00.000');
INSERT INTO `event_registrations` (`id`, `eventId`, `userId`, `status`, `registeredAt`) VALUES ('ereg_29', 'evt_hackathon', 'usr_said', 'REGISTERED', '2026-10-01 12:00:00.000');
INSERT INTO `event_registrations` (`id`, `eventId`, `userId`, `status`, `registeredAt`) VALUES ('ereg_30', 'evt_hackathon', 'usr_maryam', 'REGISTERED', '2026-10-02 12:00:00.000');

-- club_news (10)
INSERT INTO `club_news` (`id`, `title`, `summary`, `imageUrl`, `type`, `eventDate`, `createdById`, `createdAt`, `updatedAt`) VALUES ('ach_demo_1', 'First Place at National Robotics Challenge', 'The AFAQ Robotics team won first place at the National Robotics Challenge 2025, competing against 12 teams from colleges across Oman.', 'https://picsum.photos/seed/afaqrobotics/600/400', 'ACHIEVEMENT', '2025-08-20', 'usr_1781384107881', '2026-09-26 19:51:03.000', '2026-09-26 19:51:03.000');
INSERT INTO `club_news` (`id`, `title`, `summary`, `imageUrl`, `type`, `eventDate`, `createdById`, `createdAt`, `updatedAt`) VALUES ('ach_demo_2', 'Published Research Recognized at Gulf Engineering Conference', 'Our members'' research on IoT water quality monitoring was recognized as one of the top 5 papers at the Gulf Engineering Conference 2025.', NULL, 'ACHIEVEMENT', '2025-11-15', 'usr_1781384107881', '2026-09-26 19:51:03.000', '2026-09-26 19:51:03.000');
INSERT INTO `club_news` (`id`, `title`, `summary`, `imageUrl`, `type`, `eventDate`, `createdById`, `createdAt`, `updatedAt`) VALUES ('news_demo_1', 'AFAQ Innovation Club Launches Cybersecurity Track', 'AFAQ has officially launched a new Cybersecurity track for the 2025/2026 academic year, offering hands-on labs and mentorship for students interested in defensive and offensive security.', NULL, 'NEWS', '2025-09-10', 'usr_1781384107881', '2026-09-26 19:51:03.000', '2026-09-26 19:51:03.000');
INSERT INTO `club_news` (`id`, `title`, `summary`, `imageUrl`, `type`, `eventDate`, `createdById`, `createdAt`, `updatedAt`) VALUES ('news_demo_2', 'Induction Week Wraps Up with Record Attendance', 'This year''s Induction Week saw the highest turnout in AFAQ history, with over 150 new members joining across all five innovation tracks.', NULL, 'NEWS', '2025-10-05', 'usr_1781384107881', '2026-09-26 19:51:03.000', '2026-09-26 19:51:03.000');
INSERT INTO `club_news` (`id`, `title`, `summary`, `imageUrl`, `type`, `eventDate`, `createdById`, `createdAt`, `updatedAt`) VALUES ('news_induction_26', 'Induction Week 2026/2027 Welcomes 120 New Members', 'The new academic year opened with the largest induction in AFAQ history: 120 new members toured the labs, completed safety training and joined their first innovation track.', NULL, 'NEWS', '2026-09-20', 'usr_1781384107881', '2026-09-20 09:00:00.000', '2026-09-20 09:00:00.000');
INSERT INTO `club_news` (`id`, `title`, `summary`, `imageUrl`, `type`, `eventDate`, `createdById`, `createdAt`, `updatedAt`) VALUES ('news_fab_lab', 'New Fabrication Lab Opens with Laser Cutter and CNC Router', 'The club''s Fabrication Lab is now open for bookings, with a laser cutting station, a CNC router bay and a 3D scanning rig available to trained members.', NULL, 'NEWS', '2026-08-30', 'usr_1781384107881', '2026-08-30 09:00:00.000', '2026-08-30 09:00:00.000');
INSERT INTO `club_news` (`id`, `title`, `summary`, `imageUrl`, `type`, `eventDate`, `createdById`, `createdAt`, `updatedAt`) VALUES ('news_cyber_reg', 'Registration Open for National Cyber Challenge Team Selection', 'Members interested in representing the college at the National Cyber Challenge can now register for the qualifying round on 24 November.', NULL, 'NEWS', '2026-10-05', 'usr_1781384107881', '2026-10-05 09:00:00.000', '2026-10-05 09:00:00.000');
INSERT INTO `club_news` (`id`, `title`, `summary`, `imageUrl`, `type`, `eventDate`, `createdById`, `createdAt`, `updatedAt`) VALUES ('ach_gold_oman', 'Gold Medal at the Oman Innovation Exhibition', 'The Coastal Water Quality Buoy team won the gold medal in the sustainability category at the national innovation exhibition.', NULL, 'ACHIEVEMENT', '2026-05-12', 'usr_1781384107881', '2026-05-12 09:00:00.000', '2026-05-12 09:00:00.000');
INSERT INTO `club_news` (`id`, `title`, `summary`, `imageUrl`, `type`, `eventDate`, `createdById`, `createdAt`, `updatedAt`) VALUES ('ach_phishing_adopted', 'Phishing Simulator Adopted by College IT Department', 'The Phishing Awareness Training Simulator built by AFAQ members is now part of the college''s official security awareness programme.', NULL, 'ACHIEVEMENT', '2026-07-02', 'usr_1781384107881', '2026-07-02 09:00:00.000', '2026-07-02 09:00:00.000');
INSERT INTO `club_news` (`id`, `title`, `summary`, `imageUrl`, `type`, `eventDate`, `createdById`, `createdAt`, `updatedAt`) VALUES ('ach_patent', 'Patent Filed for UAV Quick-Release Payload Mount', 'A patent application has been filed for the modular payload mount designed by Hassan Al-Siyabi with support from the Fabrication Lab.', NULL, 'ACHIEVEMENT', '2026-02-10', 'usr_1781384107881', '2026-02-10 09:00:00.000', '2026-02-10 09:00:00.000');

-- forum_categories (6)
INSERT INTO `forum_categories` (`id`, `name`, `description`, `icon`, `color`, `sortOrder`, `createdAt`, `updatedAt`) VALUES ('cat_announcements', 'Announcements', 'Official announcements from AFAQ staff and leadership.', 'fa-bullhorn', '#ef4444', 1, '2026-06-14 01:05:21.346', '2026-06-14 01:05:21.346');
INSERT INTO `forum_categories` (`id`, `name`, `description`, `icon`, `color`, `sortOrder`, `createdAt`, `updatedAt`) VALUES ('cat_events', 'Events & Activities', 'Discuss upcoming events, workshops, and club activities.', 'fa-calendar', '#10b981', 4, '2026-06-14 01:05:21.357', '2026-06-14 01:05:21.357');
INSERT INTO `forum_categories` (`id`, `name`, `description`, `icon`, `color`, `sortOrder`, `createdAt`, `updatedAt`) VALUES ('cat_general', 'General Discussion', 'General topics, introductions, and community chat.', 'fa-comments', '#6b7280', 6, '2026-06-14 01:05:21.363', '2026-06-14 01:05:21.363');
INSERT INTO `forum_categories` (`id`, `name`, `description`, `icon`, `color`, `sortOrder`, `createdAt`, `updatedAt`) VALUES ('cat_labs', 'Lab Discussions', 'Questions, tips, and discussions about lab sessions.', 'fa-microscope', '#3b82f6', 5, '2026-06-14 01:05:21.360', '2026-06-14 01:05:21.360');
INSERT INTO `forum_categories` (`id`, `name`, `description`, `icon`, `color`, `sortOrder`, `createdAt`, `updatedAt`) VALUES ('cat_projects', 'Projects & Ideas', 'Share your project ideas and get feedback from the community.', 'fa-lightbulb', '#f59e0b', 2, '2026-06-14 01:05:21.353', '2026-06-14 01:05:21.353');
INSERT INTO `forum_categories` (`id`, `name`, `description`, `icon`, `color`, `sortOrder`, `createdAt`, `updatedAt`) VALUES ('cat_research', 'Research & Tech', 'Discuss research papers, technologies, and academic topics.', 'fa-flask', '#8b5cf6', 3, '2026-06-14 01:05:21.355', '2026-06-14 01:05:21.355');

-- forum_posts (20)
INSERT INTO `forum_posts` (`id`, `title`, `content`, `categoryId`, `authorId`, `parentId`, `replyToId`, `isPinned`, `createdAt`, `updatedAt`) VALUES ('topic_1', 'Welcome to the AFAQ Innovation Portal - Start Here', 'Welcome to the official portal of the AFAQ Scientific Club!

Here you can:
- Start or join **innovation projects** across our six tracks
- Book **labs and equipment**
- Register for **events**, workshops and competitions
- Share your work in the **Research Hub**

Please read the lab booking rules before your first booking. See you in the labs!', 'cat_announcements', 'usr_1781384107881', NULL, NULL, 1, '2026-09-01 08:00:00.000', '2026-09-01 08:00:00.000');
INSERT INTO `forum_posts` (`id`, `title`, `content`, `categoryId`, `authorId`, `parentId`, `replyToId`, `isPinned`, `createdAt`, `updatedAt`) VALUES ('reply_2', NULL, 'Great to have everything in one place. Looking forward to this year!', 'cat_announcements', 'usr_mllh3lh8i_1781383987843', 'topic_1', NULL, 0, '2026-09-01 10:12:00.000', '2026-09-01 10:12:00.000');
INSERT INTO `forum_posts` (`id`, `title`, `content`, `categoryId`, `authorId`, `parentId`, `replyToId`, `isPinned`, `createdAt`, `updatedAt`) VALUES ('topic_3', 'Lab Booking Rules for Semester 1, 2026/2027', 'A few rules to keep the labs available for everyone:

- Book at least **24 hours** in advance
- Maximum of **two slots per week** per member
- Cancel through the portal if you cannot attend
- Equipment marked *trained members only* requires a completed induction

Bookings not used without cancellation may be restricted.', 'cat_announcements', 'usr_demo_staff', NULL, NULL, 1, '2026-09-02 09:00:00.000', '2026-09-02 09:00:00.000');
INSERT INTO `forum_posts` (`id`, `title`, `content`, `categoryId`, `authorId`, `parentId`, `replyToId`, `isPinned`, `createdAt`, `updatedAt`) VALUES ('topic_4', 'Looking for teammates: Smart Campus IoT Network', 'We are starting the Smart Campus IoT Network project and need members with experience in LoRaWAN, embedded C or dashboard development. Reply here or request to join from the project page.', 'cat_projects', 'usr_mllh3lh8i_1781383987843', NULL, NULL, 0, '2026-09-03 13:00:00.000', '2026-09-03 13:00:00.000');
INSERT INTO `forum_posts` (`id`, `title`, `content`, `categoryId`, `authorId`, `parentId`, `replyToId`, `isPinned`, `createdAt`, `updatedAt`) VALUES ('reply_5', NULL, 'I can help with the dashboard and data side. Just sent a join request.', 'cat_projects', 'usr_maryam', 'topic_4', NULL, 0, '2026-09-03 15:20:00.000', '2026-09-03 15:20:00.000');
INSERT INTO `forum_posts` (`id`, `title`, `content`, `categoryId`, `authorId`, `parentId`, `replyToId`, `isPinned`, `createdAt`, `updatedAt`) VALUES ('reply_6', NULL, 'I have worked with LoRa modules on the RFID project, happy to help with the gateways.', 'cat_projects', 'usr_omar', 'topic_4', NULL, 0, '2026-09-04 09:45:00.000', '2026-09-04 09:45:00.000');
INSERT INTO `forum_posts` (`id`, `title`, `content`, `categoryId`, `authorId`, `parentId`, `replyToId`, `isPinned`, `createdAt`, `updatedAt`) VALUES ('topic_7', 'Idea: solar charging points around campus', 'What do you think about small solar charging points near the student centre and cafeteria? This could grow from the Solar-Powered Smart Bench project.', 'cat_projects', 'usr_said', NULL, NULL, 0, '2026-10-03 11:00:00.000', '2026-10-03 11:00:00.000');
INSERT INTO `forum_posts` (`id`, `title`, `content`, `categoryId`, `authorId`, `parentId`, `replyToId`, `isPinned`, `createdAt`, `updatedAt`) VALUES ('reply_8', NULL, 'Good idea. We should log usage first with the bench prototype to size the panels properly.', 'cat_projects', 'usr_yusuf', 'topic_7', NULL, 0, '2026-10-03 14:30:00.000', '2026-10-03 14:30:00.000');
INSERT INTO `forum_posts` (`id`, `title`, `content`, `categoryId`, `authorId`, `parentId`, `replyToId`, `isPinned`, `createdAt`, `updatedAt`) VALUES ('topic_9', 'Best resources for learning reinforcement learning?', 'For our warehouse path-planning research we are moving to deep RL. Which courses or books would you recommend for getting started quickly?', 'cat_research', 'usr_omar', NULL, NULL, 0, '2026-09-15 19:00:00.000', '2026-09-15 19:00:00.000');
INSERT INTO `forum_posts` (`id`, `title`, `content`, `categoryId`, `authorId`, `parentId`, `replyToId`, `isPinned`, `createdAt`, `updatedAt`) VALUES ('reply_10', NULL, 'Start with Sutton & Barto for the foundations, then try a hands-on course with a simulation library. Happy to review your plan.', 'cat_research', 'usr_staff_huda', 'topic_9', NULL, 0, '2026-09-16 08:30:00.000', '2026-09-16 08:30:00.000');
INSERT INTO `forum_posts` (`id`, `title`, `content`, `categoryId`, `authorId`, `parentId`, `replyToId`, `isPinned`, `createdAt`, `updatedAt`) VALUES ('reply_11', NULL, 'The Data & AI Lab has GPUs you can book for training runs.', 'cat_research', 'usr_maryam', 'topic_9', NULL, 0, '2026-09-16 10:05:00.000', '2026-09-16 10:05:00.000');
INSERT INTO `forum_posts` (`id`, `title`, `content`, `categoryId`, `authorId`, `parentId`, `replyToId`, `isPinned`, `createdAt`, `updatedAt`) VALUES ('topic_12', 'CTF Night recap and write-ups', 'Thanks to everyone who joined CTF Night! Team write-ups for the web and forensics challenges are now in the club drive. Ask your questions about the solutions here.', 'cat_events', 'usr_fatma', NULL, NULL, 0, '2026-02-20 12:00:00.000', '2026-02-20 12:00:00.000');
INSERT INTO `forum_posts` (`id`, `title`, `content`, `categoryId`, `authorId`, `parentId`, `replyToId`, `isPinned`, `createdAt`, `updatedAt`) VALUES ('reply_13', NULL, 'The forensics PCAP challenge was my favourite. The write-up explains the DNS tunnelling trick really well.', 'cat_events', 'usr_aisha', 'topic_12', NULL, 0, '2026-02-20 16:40:00.000', '2026-02-20 16:40:00.000');
INSERT INTO `forum_posts` (`id`, `title`, `content`, `categoryId`, `authorId`, `parentId`, `replyToId`, `isPinned`, `createdAt`, `updatedAt`) VALUES ('reply_14', NULL, 'Can we run a short session on the crypto challenges before the National Cyber Challenge selection?', 'cat_events', 'usr_mllh3lh8i_1781383987843', 'topic_12', NULL, 0, '2026-10-06 18:10:00.000', '2026-10-06 18:10:00.000');
INSERT INTO `forum_posts` (`id`, `title`, `content`, `categoryId`, `authorId`, `parentId`, `replyToId`, `isPinned`, `createdAt`, `updatedAt`) VALUES ('topic_15', 'Fabrication Lab: recommended settings for PETG', 'For functional parts in PETG we recommend 240 °C nozzle, 80 °C bed, 40% infill and slower first layers. Always remove prints only after the bed cools down.', 'cat_labs', 'usr_demo_staff', NULL, NULL, 0, '2026-09-05 10:00:00.000', '2026-09-05 10:00:00.000');
INSERT INTO `forum_posts` (`id`, `title`, `content`, `categoryId`, `authorId`, `parentId`, `replyToId`, `isPinned`, `createdAt`, `updatedAt`) VALUES ('reply_16', NULL, 'These settings worked well for our drone payload mounts. Thanks!', 'cat_labs', 'usr_hassan', 'topic_15', NULL, 0, '2026-09-06 12:15:00.000', '2026-09-06 12:15:00.000');
INSERT INTO `forum_posts` (`id`, `title`, `content`, `categoryId`, `authorId`, `parentId`, `replyToId`, `isPinned`, `createdAt`, `updatedAt`) VALUES ('topic_17', 'Introduce yourself!', 'New to AFAQ? Tell us your name, department and which track interests you the most.', 'cat_general', 'usr_1781384107881', NULL, NULL, 0, '2026-09-01 09:00:00.000', '2026-09-01 09:00:00.000');
INSERT INTO `forum_posts` (`id`, `title`, `content`, `categoryId`, `authorId`, `parentId`, `replyToId`, `isPinned`, `createdAt`, `updatedAt`) VALUES ('reply_18', NULL, 'Said, Civil Engineering Level 1. Interested in Sustainability and smart infrastructure.', 'cat_general', 'usr_said', 'topic_17', NULL, 0, '2026-09-02 08:20:00.000', '2026-09-02 08:20:00.000');
INSERT INTO `forum_posts` (`id`, `title`, `content`, `categoryId`, `authorId`, `parentId`, `replyToId`, `isPinned`, `createdAt`, `updatedAt`) VALUES ('reply_19', NULL, 'Noor, Aeronautical Engineering. I want to work on AI for aircraft inspection.', 'cat_general', 'usr_noor', 'topic_17', NULL, 0, '2026-09-02 11:05:00.000', '2026-09-02 11:05:00.000');
INSERT INTO `forum_posts` (`id`, `title`, `content`, `categoryId`, `authorId`, `parentId`, `replyToId`, `isPinned`, `createdAt`, `updatedAt`) VALUES ('reply_20', NULL, 'Maryam, Computer Engineering. Smart Logistics and optimisation!', 'cat_general', 'usr_maryam', 'topic_17', NULL, 0, '2026-09-03 09:30:00.000', '2026-09-03 09:30:00.000');

-- club_registrations (5)
INSERT INTO `club_registrations` (`id`, `fullName`, `email`, `phone`, `militaryId`, `department`, `yearLevel`, `interests`, `motivation`, `userId`, `status`, `createdAt`, `updatedAt`) VALUES ('reg_1', 'Khalfan Al-Mukhaini', 'khalfan.mukhaini@afaq.local', '+968 9123 4012', '2100012', 'Aeronautical Engineering', 'Level 1', 'Robotics, Drones', 'I want to learn how to build and program drones and take part in competitions.', NULL, 'PENDING', '2026-10-09 14:00:00.000', '2026-10-09 14:00:00.000');
INSERT INTO `club_registrations` (`id`, `fullName`, `email`, `phone`, `militaryId`, `department`, `yearLevel`, `interests`, `motivation`, `userId`, `status`, `createdAt`, `updatedAt`) VALUES ('reg_2', 'Shamsa Al-Riyami', 'shamsa.riyami@afaq.local', '+968 9123 4013', '2100013', 'Cyber Security', 'Level 2', 'Cybersecurity, AI', 'I enjoy CTF challenges and want to join the cyber team.', NULL, 'PENDING', '2026-10-11 10:30:00.000', '2026-10-11 10:30:00.000');
INSERT INTO `club_registrations` (`id`, `fullName`, `email`, `phone`, `militaryId`, `department`, `yearLevel`, `interests`, `motivation`, `userId`, `status`, `createdAt`, `updatedAt`) VALUES ('reg_3', 'Faisal Al-Shukaili', 'faisal.shukaili@afaq.local', '+968 9123 4014', '2100014', 'Marine Engineering', 'Level 3', 'Sustainability, IoT', 'Interested in ocean monitoring after seeing the water quality buoy at the exhibition.', NULL, 'APPROVED', '2026-09-12 09:00:00.000', '2026-09-12 09:00:00.000');
INSERT INTO `club_registrations` (`id`, `fullName`, `email`, `phone`, `militaryId`, `department`, `yearLevel`, `interests`, `motivation`, `userId`, `status`, `createdAt`, `updatedAt`) VALUES ('reg_4', 'Huda Al-Farsi', 'huda.farsi@afaq.local', '+968 9123 4015', '2100015', 'Systems Engineering', 'Level 2', 'Smart Logistics', 'I would like to apply my optimisation coursework to real problems.', NULL, 'APPROVED', '2026-09-13 11:00:00.000', '2026-09-13 11:00:00.000');
INSERT INTO `club_registrations` (`id`, `fullName`, `email`, `phone`, `militaryId`, `department`, `yearLevel`, `interests`, `motivation`, `userId`, `status`, `createdAt`, `updatedAt`) VALUES ('reg_5', 'Test Applicant', 'duplicate@afaq.local', NULL, '2100016', 'Foundation Department', 'Level 1', 'General', 'Duplicate submission.', NULL, 'REJECTED', '2026-09-14 12:00:00.000', '2026-09-14 12:00:00.000');

-- contact_messages (4)
INSERT INTO `contact_messages` (`id`, `name`, `email`, `phone`, `subject`, `message`, `status`, `createdAt`, `updatedAt`) VALUES ('contact_1', 'Eng. Ali Al-Habsi', 'ali.habsi@partner.afaq.local', '+968 2400 1100', 'Project Collaboration', 'Our company would like to sponsor a smart logistics project and offer mentoring. Who is the right contact?', 'NEW', '2026-10-10 09:15:00.000', '2026-10-10 09:15:00.000');
INSERT INTO `contact_messages` (`id`, `name`, `email`, `phone`, `subject`, `message`, `status`, `createdAt`, `updatedAt`) VALUES ('contact_2', 'Maryam Al-Hinai', 'maryam.hinai@afaq.local', NULL, 'Lab Booking', 'Is it possible to book the Data & AI Lab for a full day for a training run?', 'READ', '2026-10-04 13:00:00.000', '2026-10-04 13:00:00.000');
INSERT INTO `contact_messages` (`id`, `name`, `email`, `phone`, `subject`, `message`, `status`, `createdAt`, `updatedAt`) VALUES ('contact_3', 'Visitor', 'visitor@afaq.local', NULL, 'Event Information', 'Is the AI in Defence Logistics seminar open to visitors from other colleges?', 'REPLIED', '2026-10-02 10:00:00.000', '2026-10-02 10:00:00.000');
INSERT INTO `contact_messages` (`id`, `name`, `email`, `phone`, `subject`, `message`, `status`, `createdAt`, `updatedAt`) VALUES ('contact_4', 'Said Al-Ghafri', 'said.ghafri@afaq.local', NULL, 'Technical Support', 'I could not upload a large PDF to my project. Resolved after compressing it - thanks!', 'CLOSED', '2026-09-25 16:00:00.000', '2026-09-25 16:00:00.000');

-- notifications (8)
INSERT INTO `notifications` (`id`, `userId`, `type`, `title`, `message`, `link`, `isRead`, `createdAt`) VALUES ('notif_1', 'usr_mllh3lh8i_1781383987843', 'BOOKING_APPROVED', 'Booking Approved', 'Your Cybersecurity Lab booking on 15 Oct (14:00-16:00) was approved.', '/lab-booking', 0, '2026-10-12 09:00:00.000');
INSERT INTO `notifications` (`id`, `userId`, `type`, `title`, `message`, `link`, `isRead`, `createdAt`) VALUES ('notif_2', 'usr_mllh3lh8i_1781383987843', 'EVENT_REMINDER', 'Upcoming Event', 'Drone Building Bootcamp starts on 27 Oct at the Drone Assembly Lab.', '/events/evt_drone_bootcamp', 0, '2026-10-12 10:00:00.000');
INSERT INTO `notifications` (`id`, `userId`, `type`, `title`, `message`, `link`, `isRead`, `createdAt`) VALUES ('notif_3', 'usr_mllh3lh8i_1781383987843', 'FORUM_REPLY', 'New Reply in Your Topic', 'Omar Al-Maamari replied in your topic "Looking for teammates: Smart Campus IoT Network"', '/forums/topic/topic_4', 1, '2026-09-04 09:45:00.000');
INSERT INTO `notifications` (`id`, `userId`, `type`, `title`, `message`, `link`, `isRead`, `createdAt`) VALUES ('notif_4', 'usr_mllh3lh8i_1781383987843', 'ANNOUNCEMENT', 'New Announcement', 'Welcome to the AFAQ Innovation Portal - Start Here', '/forums/topic/topic_1', 1, '2026-09-01 08:00:00.000');
INSERT INTO `notifications` (`id`, `userId`, `type`, `title`, `message`, `link`, `isRead`, `createdAt`) VALUES ('notif_5', 'usr_1781384107881', 'PROJECT_APPROVAL', 'Project Awaiting Approval', 'Noor Al-Rawahi submitted "AI Visual Inspection of Aircraft Panels" for approval.', '/admin/projects', 0, '2026-10-07 10:05:00.000');
INSERT INTO `notifications` (`id`, `userId`, `type`, `title`, `message`, `link`, `isRead`, `createdAt`) VALUES ('notif_6', 'usr_1781384107881', 'PROJECT_COMPLETION', 'Completion Review Requested', 'Aisha Al-Busaidi requested completion of "Secure Messaging App for Field Teams".', '/admin/projects', 0, '2026-10-11 17:20:00.000');
INSERT INTO `notifications` (`id`, `userId`, `type`, `title`, `message`, `link`, `isRead`, `createdAt`) VALUES ('notif_7', 'usr_demo_staff', 'BOOKING_REQUEST', 'New Booking Request', 'Said Al-Ghafri requested the Laser Cutting Station on 23 Oct.', '/admin/bookings', 0, '2026-10-12 08:30:00.000');
INSERT INTO `notifications` (`id`, `userId`, `type`, `title`, `message`, `link`, `isRead`, `createdAt`) VALUES ('notif_8', 'usr_hassan', 'BOOKING_APPROVED', 'Booking Approved', 'Your Drone Assembly Lab booking on 19 Oct was approved.', '/lab-booking', 0, '2026-10-12 09:10:00.000');

-- audit_logs (12)
INSERT INTO `audit_logs` (`id`, `userId`, `action`, `tableName`, `recordId`, `oldData`, `newData`, `createdAt`) VALUES ('log_1', 'usr_1781384107881', 'EVENT_CREATED', 'events', 'evt_drone_bootcamp', NULL, '{"title":"Drone Building Bootcamp"}', '2026-09-10 09:00:00.000');
INSERT INTO `audit_logs` (`id`, `userId`, `action`, `tableName`, `recordId`, `oldData`, `newData`, `createdAt`) VALUES ('log_2', 'usr_fatma', 'USER_REGISTERED', 'users', 'usr_fatma', NULL, '{"militaryId":"2100004"}', '2026-06-20 10:00:00.000');
INSERT INTO `audit_logs` (`id`, `userId`, `action`, `tableName`, `recordId`, `oldData`, `newData`, `createdAt`) VALUES ('log_3', 'usr_1781384107881', 'PROJECT_APPROVED', 'projects', 'proj_rfid_inventory', NULL, '{"status":"DEVELOPMENT"}', '2026-03-16 11:00:00.000');
INSERT INTO `audit_logs` (`id`, `userId`, `action`, `tableName`, `recordId`, `oldData`, `newData`, `createdAt`) VALUES ('log_4', 'usr_1781384107881', 'PROJECT_COMPLETED', 'projects', 'proj_phishing_sim', NULL, '{"status":"COMPLETED"}', '2026-06-01 10:00:00.000');
INSERT INTO `audit_logs` (`id`, `userId`, `action`, `tableName`, `recordId`, `oldData`, `newData`, `createdAt`) VALUES ('log_5', 'usr_demo_staff', 'BOOKING_APPROVED', 'lab_bookings', 'booking_4', NULL, '{"status":"APPROVED"}', '2026-10-12 09:10:00.000');
INSERT INTO `audit_logs` (`id`, `userId`, `action`, `tableName`, `recordId`, `oldData`, `newData`, `createdAt`) VALUES ('log_6', 'usr_demo_staff', 'BOOKING_APPROVED', 'lab_bookings', 'booking_2', NULL, '{"status":"APPROVED"}', '2026-10-12 09:00:00.000');
INSERT INTO `audit_logs` (`id`, `userId`, `action`, `tableName`, `recordId`, `oldData`, `newData`, `createdAt`) VALUES ('log_7', 'usr_demo_staff', 'BOOKING_REJECTED', 'lab_bookings', 'booking_10', NULL, '{"status":"REJECTED","reason":"Rig under maintenance"}', '2026-09-29 15:00:00.000');
INSERT INTO `audit_logs` (`id`, `userId`, `action`, `tableName`, `recordId`, `oldData`, `newData`, `createdAt`) VALUES ('log_8', 'usr_1781384107881', 'EVENT_CREATED', 'events', 'evt_cyber_selection', NULL, '{"title":"National Cyber Challenge: Team Selection"}', '2026-09-20 12:00:00.000');
INSERT INTO `audit_logs` (`id`, `userId`, `action`, `tableName`, `recordId`, `oldData`, `newData`, `createdAt`) VALUES ('log_9', 'usr_mllh3lh8i_1781383987843', 'EVENT_REGISTERED', 'event_registrations', 'evt_drone_bootcamp', NULL, '{"eventId":"evt_drone_bootcamp"}', '2026-10-03 12:00:00.000');
INSERT INTO `audit_logs` (`id`, `userId`, `action`, `tableName`, `recordId`, `oldData`, `newData`, `createdAt`) VALUES ('log_10', 'usr_noor', 'PROJECT_APPROVAL_REQUESTED', 'projects', 'proj_aircraft_vision', NULL, '{"status":"PENDING_APPROVAL"}', '2026-10-07 10:05:00.000');
INSERT INTO `audit_logs` (`id`, `userId`, `action`, `tableName`, `recordId`, `oldData`, `newData`, `createdAt`) VALUES ('log_11', 'usr_aisha', 'PROJECT_COMPLETION_REQUESTED', 'projects', 'proj_secure_msg', NULL, '{"status":"PENDING_COMPLETION"}', '2026-10-11 17:20:00.000');
INSERT INTO `audit_logs` (`id`, `userId`, `action`, `tableName`, `recordId`, `oldData`, `newData`, `createdAt`) VALUES ('log_12', 'usr_1781384107881', 'CLUB_REGISTRATION_APPROVED', 'club_registrations', 'reg_3', NULL, '{"status":"APPROVED"}', '2026-09-15 10:00:00.000');
