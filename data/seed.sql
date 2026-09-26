PRAGMA foreign_keys = OFF;

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

CREATE TABLE IF NOT EXISTS `departments` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `code` varchar(191) NOT NULL,
  `description` text DEFAULT NULL,
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

CREATE TABLE IF NOT EXISTS `project_attachments` (
  `id` varchar(191) NOT NULL,
  `projectId` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `url` varchar(191) NOT NULL,
  `type` varchar(191) NOT NULL,
  `uploadedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
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

CREATE TABLE IF NOT EXISTS `skills` (
  `id` varchar(191) NOT NULL,
  `profileId` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
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


-- Indexes
CREATE INDEX IF NOT EXISTS `audit_logs_userId_idx` ON `audit_logs` (`userId`);
CREATE INDEX IF NOT EXISTS `audit_logs_action_idx` ON `audit_logs` (`action`);
CREATE INDEX IF NOT EXISTS `club_registrations_status_idx` ON `club_registrations` (`status`);
CREATE INDEX IF NOT EXISTS `competitions_profileId_fkey` ON `competitions` (`profileId`);
CREATE INDEX IF NOT EXISTS `contact_messages_status_idx` ON `contact_messages` (`status`);
CREATE UNIQUE INDEX IF NOT EXISTS `departments_name_key` ON `departments` (`name`);
CREATE UNIQUE INDEX IF NOT EXISTS `departments_code_key` ON `departments` (`code`);
CREATE UNIQUE INDEX IF NOT EXISTS `event_registrations_eventId_userId_key` ON `event_registrations` (`eventId`,`userId`);
CREATE INDEX IF NOT EXISTS `event_registrations_userId_fkey` ON `event_registrations` (`userId`);
CREATE INDEX IF NOT EXISTS `events_createdById_fkey` ON `events` (`createdById`);
CREATE INDEX IF NOT EXISTS `experiences_profileId_fkey` ON `experiences` (`profileId`);
CREATE UNIQUE INDEX IF NOT EXISTS `forum_mute_userId_postId` ON `forum_mute_settings` (`userId`,`postId`);
CREATE INDEX IF NOT EXISTS `forum_posts_categoryId_idx` ON `forum_posts` (`categoryId`);
CREATE INDEX IF NOT EXISTS `forum_posts_parentId_idx` ON `forum_posts` (`parentId`);
CREATE INDEX IF NOT EXISTS `forum_posts_authorId_idx` ON `forum_posts` (`authorId`);
CREATE INDEX IF NOT EXISTS `lab_bookings_labId_fkey` ON `lab_bookings` (`labId`);
CREATE INDEX IF NOT EXISTS `lab_bookings_userId_fkey` ON `lab_bookings` (`userId`);
CREATE UNIQUE INDEX IF NOT EXISTS `lab_categories_key_key` ON `lab_categories` (`key`);
CREATE INDEX IF NOT EXISTS `labs_categoryId_fkey` ON `labs` (`categoryId`);
CREATE INDEX IF NOT EXISTS `labs_departmentId_fkey` ON `labs` (`departmentId`);
CREATE INDEX IF NOT EXISTS `notifications_userId_idx` ON `notifications` (`userId`);
CREATE INDEX IF NOT EXISTS `notifications_isRead_idx` ON `notifications` (`isRead`);
CREATE UNIQUE INDEX IF NOT EXISTS `programmes_code_key` ON `programmes` (`code`);
CREATE INDEX IF NOT EXISTS `programmes_departmentId_fkey` ON `programmes` (`departmentId`);
CREATE INDEX IF NOT EXISTS `project_attachments_projectId_fkey` ON `project_attachments` (`projectId`);
CREATE UNIQUE INDEX IF NOT EXISTS `project_members_projectId_userId_key` ON `project_members` (`projectId`,`userId`);
CREATE INDEX IF NOT EXISTS `project_members_userId_fkey` ON `project_members` (`userId`);
CREATE INDEX IF NOT EXISTS `projects_createdById_fkey` ON `projects` (`createdById`);
CREATE INDEX IF NOT EXISTS `skills_profileId_fkey` ON `skills` (`profileId`);
CREATE UNIQUE INDEX IF NOT EXISTS `student_profiles_userId_key` ON `student_profiles` (`userId`);
CREATE INDEX IF NOT EXISTS `student_profiles_departmentId_fkey` ON `student_profiles` (`departmentId`);
CREATE INDEX IF NOT EXISTS `student_profiles_programmeId_fkey` ON `student_profiles` (`programmeId`);
CREATE INDEX IF NOT EXISTS `trainings_profileId_fkey` ON `trainings` (`profileId`);
CREATE UNIQUE INDEX IF NOT EXISTS `users_militaryId_key` ON `users` (`militaryId`);
CREATE UNIQUE INDEX IF NOT EXISTS `users_email_key` ON `users` (`email`);


-- Seed data
INSERT INTO `audit_logs` VALUES ('log_1781385819165','usr_1781384107881','PROJECT_APPROVAL_REQUESTED','projects','proj_1781385339018',NULL,'{"status":"PENDING_APPROVAL"}','2026-06-14 01:23:39.000'),('log_1781414662585','usr_1781384107881','PROJECT_APPROVAL_REQUESTED','projects','proj_1781414652292',NULL,'{"status":"PENDING_APPROVAL"}','2026-06-14 09:24:22.000'),('log_1781414897397','usr_1781384107881','EVENT_CREATED','events','evt_1781414897368',NULL,'{"title":"science week ","category":"Exhibition","startDate":"2026-06-14T09:28"}','2026-06-14 09:28:17.000');
INSERT INTO `club_news` VALUES ('ach_demo_1','First Place at National Robotics Challenge','The AFAQ Robotics team won first place at the National Robotics Challenge 2025, competing against 12 teams from colleges across Oman.','https://picsum.photos/seed/afaqrobotics/600/400','ACHIEVEMENT','2025-08-20',NULL,'2026-09-26 19:51:03.000','2026-09-26 19:51:03.000'),('ach_demo_2','Published Research Recognized at Gulf Engineering Conference','Our members'' research on IoT water quality monitoring was recognized as one of the top 5 papers at the Gulf Engineering Conference 2025.',NULL,'ACHIEVEMENT','2025-11-15',NULL,'2026-09-26 19:51:03.000','2026-09-26 19:51:03.000'),('news_demo_1','AFAQ Innovation Club Launches Cybersecurity Track','AFAQ has officially launched a new Cybersecurity track for the 2025/2026 academic year, offering hands-on labs and mentorship for students interested in defensive and offensive security.',NULL,'NEWS','2025-09-10',NULL,'2026-09-26 19:51:03.000','2026-09-26 19:51:03.000'),('news_demo_2','Induction Week Wraps Up with Record Attendance','This year''s Induction Week saw the highest turnout in AFAQ history, with over 150 new members joining across all five innovation tracks.',NULL,'NEWS','2025-10-05',NULL,'2026-09-26 19:51:03.000','2026-09-26 19:51:03.000');
INSERT INTO `club_registrations` VALUES ('reg_1781385181800','Muhannad ','naeem@bouslati.com','94996269','2004002','Marin Engineering','Year 5','iot','intrest ','usr_1781384107881','PENDING','2026-06-14 01:13:01.000','2026-06-14 01:13:01.800'),('reg_1781414535092','Muhannad ','mohndnaeem11@gmail.com','92549426','2101111','Marin Engineering','Year 4','iot','intrest ','usr_1781384107881','APPROVED','2026-06-14 09:22:15.000','2026-06-14 09:30:45.000');
INSERT INTO `contact_messages` VALUES ('contact_1781384975132','mohnd','naeem@bouslati.com',NULL,'Lab Booking','تتتتت','NEW','2026-06-14 01:09:35.000','2026-06-14 01:09:35.134'),('contact_1781414970230','mohnd','mohndnaeem11@gmail.com','94996269','Lab Booking','test','CLOSED','2026-06-14 09:29:30.000','2026-06-14 09:31:53.000');
INSERT INTO `departments` VALUES ('dept_5506vkhdc_1781383987820','Cyber Security Department','CS','Department focused on cybersecurity and information security','2026-06-14 00:53:07.000','2026-06-14 00:53:07.000'),('dept_m3mvoqmty_1781383987825','Mechanical Engineering Department','ME','Department for mechanical and robotics engineering','2026-06-14 00:53:07.000','2026-06-14 00:53:07.000');
INSERT INTO `events` VALUES ('evt_1781414897368','science week ','event ','Exhibition','2026-06-14 09:28:00.000','2026-06-18 09:28:00.000','suhar',1000,'usr_1781384107881','2026-06-14 09:28:17.000','2026-06-14 09:28:17.000'),('evt_jufbemi46_1781383987992','Induction Week 2025/2026','Strategic start for AFAQ members.','Workshop','2025-01-15 04:00:00.000','2025-01-17 04:00:00.000','Main Auditorium',200,'usr_mllh3lh8i_1781383987843','2026-06-14 00:53:07.000','2026-06-14 00:53:07.000');
INSERT INTO `forum_categories` VALUES ('cat_announcements','Announcements','Official announcements from AFAQ staff and leadership.','fa-bullhorn','#ef4444',1,'2026-06-14 01:05:21.346','2026-06-14 01:05:21.346'),('cat_events','Events & Activities','Discuss upcoming events, workshops, and club activities.','fa-calendar','#10b981',4,'2026-06-14 01:05:21.357','2026-06-14 01:05:21.357'),('cat_general','General Discussion','General topics, introductions, and community chat.','fa-comments','#6b7280',6,'2026-06-14 01:05:21.363','2026-06-14 01:05:21.363'),('cat_labs','Lab Discussions','Questions, tips, and discussions about lab sessions.','fa-microscope','#3b82f6',5,'2026-06-14 01:05:21.360','2026-06-14 01:05:21.360'),('cat_projects','Projects & Ideas','Share your project ideas and get feedback from the community.','fa-lightbulb','#f59e0b',2,'2026-06-14 01:05:21.353','2026-06-14 01:05:21.353'),('cat_research','Research & Tech','Discuss research papers, technologies, and academic topics.','fa-flask','#8b5cf6',3,'2026-06-14 01:05:21.355','2026-06-14 01:05:21.355');
INSERT INTO `forum_posts` VALUES ('post_1781384826372','السلام عليكم ','عندي استفسار . هل ممكن مساعدة ؟','cat_events','usr_1781384107881',NULL,NULL,0,'2026-06-14 01:07:06.000','2026-06-14 09:32:46.000'),('post_1781385495581','this is test annousment ','test','cat_announcements','usr_1781384107881',NULL,NULL,0,'2026-06-14 01:18:15.000','2026-06-14 09:34:33.000'),('reply_1781384881412',NULL,'هل في احد ؟\r\n','cat_events','usr_1781384107881','post_1781384826372',NULL,0,'2026-06-14 01:08:01.000','2026-06-14 01:08:01.000'),('reply_1781386263743',NULL,'test','cat_announcements','usr_mllh3lh8i_1781383987843','post_1781385495581',NULL,0,'2026-06-14 01:31:03.000','2026-06-14 01:31:03.000'),('reply_1781415166288',NULL,'نعم ممكن ','cat_events','usr_1781384107881','post_1781384826372',NULL,0,'2026-06-14 09:32:46.000','2026-06-14 09:32:46.000'),('reply_1781415273111',NULL,'test\r\n','cat_announcements','usr_mllh3lh8i_1781383987843','post_1781385495581',NULL,0,'2026-06-14 09:34:33.000','2026-06-14 09:34:33.000');
INSERT INTO `lab_bookings` VALUES ('booking_1781385636572','lab_jc9x1ycfj_1781383987955','usr_1781384107881','2026-06-16 00:00:00.000','08:00-10:00','test','APPROVED','2026-06-14 01:20:36.000','2026-06-14 09:30:17.000'),('booking_1781414850314','lab_jc9x1ycfj_1781383987955','usr_1781384107881','2026-06-16 00:00:00.000','14:00-16:00','to test ','CANCELLED','2026-06-14 09:27:30.000','2026-06-14 09:30:10.000');
INSERT INTO `lab_categories` VALUES ('cat_8h741j3ss_1781383987929','club','Scientific Club Labs','Student-driven labs under the scientific club.','fa-solid fa-users','2026-06-14 00:53:07.000','2026-06-14 00:53:07.000'),('cat_dy6mxl6z2_1781383987943','tools','Tools & Equipment','Shared tools and portable equipment.','fa-solid fa-toolbox','2026-06-14 00:53:07.000','2026-06-14 00:53:07.000'),('cat_fab_demo','fabrication','Fabrication Lab','Rapid prototyping, 3D printing and laser cutting.','fa-solid fa-cube','2026-09-26 20:28:05.000','2026-09-26 20:28:05.000'),('cat_kfn2csxey_1781383987939','handsOn','Hands-on Labs','Practical labs for building and testing.','fa-solid fa-screwdriver-wrench','2026-06-14 00:53:07.000','2026-06-14 00:53:07.000'),('cat_kq4urdi3v_1781383987934','specialised','Specialised Labs','Labs managed by academic departments.','fa-solid fa-microscope','2026-06-14 00:53:07.000','2026-06-14 00:53:07.000'),('cat_media_demo','media','Media & Design Studio','Content creation, design and multimedia production.','fa-solid fa-photo-film','2026-09-26 20:28:05.000','2026-09-26 20:28:05.000');
INSERT INTO `labs` VALUES ('lab_049e2fo7g_1781383987969','IoT Simulation Lab','Deploy sensors.','IoT','cat_kfn2csxey_1781383987939',NULL,18,1,'2026-06-14 00:53:07.000','2026-06-14 00:53:07.000'),('lab_5yprmhwzm_1781383987946','Arduino Starter Lab','First steps with microcontrollers.','Electronics','cat_8h741j3ss_1781383987929',NULL,15,1,'2026-06-14 00:53:07.000','2026-06-14 00:53:07.000'),('lab_6dzs5ihzy_1781383987953','AI & Ideas Corner','Discuss AI concepts.','AI / Ideas','cat_8h741j3ss_1781383987929',NULL,20,1,'2026-06-14 00:53:07.000','2026-06-14 00:53:07.000'),('lab_an5aehatw_1781383987971','Soldering Station Set','Full soldering kit.','Tool','cat_dy6mxl6z2_1781383987943',NULL,1,1,'2026-06-14 00:53:07.000','2026-06-14 00:53:07.000'),('lab_demo_01','Drone Assembly Lab','Build and test small quadcopters.','Drones','cat_8h741j3ss_1781383987929',NULL,6,1,'2026-09-26 20:28:23.000','2026-09-26 20:28:23.000'),('lab_demo_02','Sensors & Actuators Bench','Explore sensors, motors and actuators.','Electronics','cat_8h741j3ss_1781383987929',NULL,4,1,'2026-09-26 20:28:23.000','2026-09-26 20:28:23.000'),('lab_demo_03','3D Printer Station','FDM 3D printers for quick prototypes.','Tool','cat_dy6mxl6z2_1781383987943',NULL,2,1,'2026-09-26 20:28:23.000','2026-09-26 20:28:23.000'),('lab_demo_04','Precision Instruments Kit','Calipers, multimeters and oscilloscopes.','Tool','cat_dy6mxl6z2_1781383987943',NULL,5,1,'2026-09-26 20:28:23.000','2026-09-26 20:28:23.000'),('lab_demo_05','Welding & Fabrication Bay','Metalwork and welding practice.','Mechanical','cat_kfn2csxey_1781383987939',NULL,4,1,'2026-09-26 20:28:23.000','2026-09-26 20:28:23.000'),('lab_demo_06','Renewable Energy Rig','Solar and wind micro-generation setups.','Power','cat_kfn2csxey_1781383987939',NULL,6,1,'2026-09-26 20:28:23.000','2026-09-26 20:28:23.000'),('lab_demo_07','Network Security Range','Isolated network for penetration testing practice.','Cybersecurity','cat_kq4urdi3v_1781383987934',NULL,8,1,'2026-09-26 20:28:23.000','2026-09-26 20:28:23.000'),('lab_demo_08','Machine Learning Cluster','GPU workstations for ML training.','Data / AI','cat_kq4urdi3v_1781383987934',NULL,6,1,'2026-09-26 20:28:23.000','2026-09-26 20:28:23.000'),('lab_demo_09','Laser Cutting Station','Precision laser cutting for wood and acrylic.','Fabrication','cat_fab_demo',NULL,3,1,'2026-09-26 20:28:23.000','2026-09-26 20:28:23.000'),('lab_demo_10','CNC Router Bay','Computer-controlled routing and milling.','Fabrication','cat_fab_demo',NULL,2,1,'2026-09-26 20:28:23.000','2026-09-26 20:28:23.000'),('lab_demo_11','3D Scanning Rig','High-resolution 3D object scanning.','Fabrication','cat_fab_demo',NULL,4,1,'2026-09-26 20:28:23.000','2026-09-26 20:28:23.000'),('lab_demo_12','Video Production Studio','Green screen, lighting and camera gear.','Media','cat_media_demo',NULL,6,1,'2026-09-26 20:28:23.000','2026-09-26 20:28:23.000'),('lab_demo_13','Graphic Design Suite','Workstations with design software licenses.','Design','cat_media_demo',NULL,8,1,'2026-09-26 20:28:23.000','2026-09-26 20:28:23.000'),('lab_demo_14','Podcast & Audio Booth','Sound-treated recording booth.','Audio','cat_media_demo',NULL,2,1,'2026-09-26 20:28:23.000','2026-09-26 20:28:23.000'),('lab_ficpc8cs1_1781383987975','General Hand Toolbox','Screwdrivers, pliers.','Tool','cat_dy6mxl6z2_1781383987943',NULL,1,1,'2026-06-14 00:53:07.000','2026-06-14 00:53:07.000'),('lab_jc9x1ycfj_1781383987955','Cybersecurity Lab','Honeypots and monitoring.','Cybersecurity','cat_kq4urdi3v_1781383987934','dept_5506vkhdc_1781383987820',25,1,'2026-06-14 00:53:07.000','2026-06-14 00:53:07.000'),('lab_kdvodgfr4_1781383987958','PCB Design Lab','From schematic to board.','Electronics','cat_kq4urdi3v_1781383987934',NULL,10,1,'2026-06-14 00:53:07.000','2026-06-14 00:53:07.000'),('lab_r0oo3z9vf_1781383987973','Measurement Pack','Multimeter and probes.','Tool','cat_dy6mxl6z2_1781383987943',NULL,1,1,'2026-06-14 00:53:07.000','2026-06-14 00:53:07.000'),('lab_ri541k72k_1781383987964','Mechanical Assembly Lab','Frames and mounts.','Mechanical','cat_kfn2csxey_1781383987939','dept_m3mvoqmty_1781383987825',15,1,'2026-06-14 00:53:07.000','2026-06-14 00:53:07.000'),('lab_stmui8vw3_1781383987961','Data & AI Lab','Model training.','Data / AI','cat_kq4urdi3v_1781383987934',NULL,20,1,'2026-06-14 00:53:07.000','2026-06-14 00:53:07.000'),('lab_u14k8i2aw_1781383987950','Robotics Practice Lab','Testing small robots.','Robotics','cat_8h741j3ss_1781383987929',NULL,12,1,'2026-06-14 00:53:07.000','2026-06-14 00:53:07.000'),('lab_xx6gtxv91_1781383987967','Power & Control Lab','Motors and relays.','Power','cat_kfn2csxey_1781383987939',NULL,12,1,'2026-06-14 00:53:07.000','2026-06-14 00:53:07.000');
INSERT INTO `notifications` VALUES ('notif_1781385495586_90fhpg','usr_mllh3lh8i_1781383987843','ANNOUNCEMENT','📢 New Announcement','this is test annousment ...','/forums/topic/post_1781385495581',1,'2026-06-14 01:18:15.000'),('notif_1781386263764_8k9jh3','usr_1781384107881','FORUM_REPLY','New Reply in Your Topic','Ahmed Al-Balushi replied in your topic: "this is test annousment ..."','/forums/topic/post_1781385495581',0,'2026-06-14 01:31:03.000'),('notif_1781415273129_z22fu6','usr_1781384107881','FORUM_REPLY','New Reply in Your Topic','Ahmed Al-Balushi replied in your topic: "this is test annousment ..."','/forums/topic/post_1781385495581',0,'2026-06-14 09:34:33.000');
INSERT INTO `programmes` VALUES ('prog_ack8z0rqi_1781383987833','BEng in Computer Security','BENG-CS','dept_5506vkhdc_1781383987820','Bachelor','2026-06-14 00:53:07.000','2026-06-14 00:53:07.000'),('prog_vfz5nfqeh_1781383987837','BEng in Mechanical Engineering','BENG-ME','dept_m3mvoqmty_1781383987825','Bachelor','2026-06-14 00:53:07.000','2026-06-14 00:53:07.000');
INSERT INTO `project_attachments` VALUES ('att_1781385357733','proj_1781385339018','DCT_Final.pptx','/uploads/1781385357727-DCTFinal.pptx.pptx','DOCUMENT','2026-06-14 01:15:57.000');
INSERT INTO `project_members` VALUES ('pm_1781385339030','proj_1781385339018','usr_1781384107881','Owner','APPROVED','2026-06-14 01:15:39.000'),('pm_1781414616422','proj_gul0xhaye_1781383987982','usr_1781384107881','Member','PENDING','2026-06-14 09:23:36.000'),('pm_1781414652309','proj_1781414652292','usr_1781384107881','Owner','APPROVED','2026-06-14 09:24:12.000');
INSERT INTO `projects` VALUES ('proj_1781385339018','honeypot','cyper project\r\n![Screenshot 2026-06-08 192734.png](/uploads/1781385412943-Screenshot20260608192734.jpg.jpg)\r\ntext','','Technology',0,NULL,NULL,'usr_1781384107881','2026-06-14 01:15:39.000','2026-06-14 01:23:39.000'),('proj_1781414652292','honeypot ','cyper project','','Technology',0,NULL,NULL,'usr_1781384107881','2026-06-14 09:24:12.000','2026-06-14 09:24:22.000'),('proj_98nuulgzk_1781383987978','Autonomous Line-Following Robot','Educational robot for navigation.','COMPLETED','Robotics',100,NULL,NULL,'usr_mllh3lh8i_1781383987843','2026-06-14 00:53:07.000','2026-06-14 00:53:07.000'),('proj_gul0xhaye_1781383987982','Internal Threat Monitoring Platform','Behaviour-based monitoring system.','DEVELOPMENT','Cybersecurity',70,NULL,NULL,'usr_mllh3lh8i_1781383987843','2026-06-14 00:53:07.000','2026-06-14 00:53:07.000'),('proj_gv4piexwj_1781383987989','Smart Campus IoT Network','IoT sensor network for campus.','START','IoT',15,NULL,NULL,'usr_mllh3lh8i_1781383987843','2026-06-14 00:53:07.000','2026-06-14 00:53:07.000');
INSERT INTO `research` VALUES ('res_demo_1','Low-Cost IoT Water Quality Monitoring for Coastal Oman','This paper presents a low-cost, solar-powered IoT sensor network designed to monitor water quality parameters such as pH, turbidity, and dissolved oxygen along the coastal areas of Oman. The system was field-tested over six months and demonstrated reliable long-term operation with minimal maintenance, providing actionable data for environmental agencies and local fisheries.','Cadet A. Al-Balushi, Dr. Khalid Al-Rashdi','Published','2025-11-02 00:00:00.000','https://example.com/iot-water-quality','2026-09-26 19:45:13.000','2026-09-26 19:45:13.000'),('res_demo_2','Autonomous Drone Swarm Coordination for Search and Rescue','An ongoing research effort exploring decentralized coordination algorithms for small drone swarms operating in GPS-denied environments, with applications in search and rescue missions across mountainous terrain.','Cpl. Hassan Al-Siyabi, Lt. Mohammed Al-Hinai','Ongoing',NULL,NULL,'2026-09-26 19:45:13.000','2026-09-26 19:45:13.000'),('res_demo_3','Predictive Maintenance of Marine Diesel Engines using Machine Learning','A thesis investigating the use of vibration and thermal sensor data combined with supervised machine learning models to predict maintenance needs of marine diesel engines before failure occurs, reducing downtime and repair costs.','Sgt. Yusuf Al-Kindi','Thesis','2025-06-15 00:00:00.000',NULL,'2026-09-26 19:45:13.000','2026-09-26 19:45:13.000');
INSERT INTO `student_profiles` VALUES ('sp_1781384107886','usr_1781384107881','Muhannad ',NULL,'dept_5506vkhdc_1781383987820','prog_ack8z0rqi_1781383987833','Graduate',NULL,'2026-06-14 00:55:07.000','2026-06-14 00:55:07.000'),('sp_8usifsmnk_1781383987923','usr_mllh3lh8i_1781383987843','Ahmed Al-Balushi','+968 9123 4567','dept_5506vkhdc_1781383987820','prog_ack8z0rqi_1781383987833','Level 3','Interested in cybersecurity and AI applications','2026-06-14 00:53:07.000','2026-06-14 00:53:07.000');
INSERT INTO `users` VALUES ('usr_1781384107881','2101001','$2b$10$btVbZfjYSbMHXjnm.X2H.uESHBzs1hLQaXOVTEarZzS6ypEXnxe4y','mohndnaeem11@gmail.com','ADMIN','2026-06-14 00:55:07.000','2026-06-14 00:55:07.000'),('usr_demo_staff','DEMO-STAFF','$2b$10$6otm0GdNIJQi4R8gmvB/tefMvJgoDDM68FyIS0oMDIiMmAw5OV2g2','demo.staff@afaq.local','STAFF','2026-09-15 09:47:31.000','2026-09-15 09:47:31.000'),('usr_mllh3lh8i_1781383987843','2101006','$2b$10$pioBe1DgGe4KcNh6frOvm.7eLts9c7dBdDt7c2E10jHMxxsBeo576','student2101006@mtc.edu.om','STUDENT','2026-06-14 00:53:07.000','2026-06-14 00:53:07.000');
