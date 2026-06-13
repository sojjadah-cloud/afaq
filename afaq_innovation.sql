-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 13, 2026 at 11:46 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `afaq_innovation`
--

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) DEFAULT NULL,
  `action` varchar(191) NOT NULL,
  `tableName` varchar(191) DEFAULT NULL,
  `recordId` varchar(191) DEFAULT NULL,
  `oldData` text DEFAULT NULL,
  `newData` text DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `audit_logs`
--

INSERT INTO `audit_logs` (`id`, `userId`, `action`, `tableName`, `recordId`, `oldData`, `newData`, `createdAt`) VALUES
('log_1781385819165', 'usr_1781384107881', 'PROJECT_APPROVAL_REQUESTED', 'projects', 'proj_1781385339018', NULL, '{\"status\":\"PENDING_APPROVAL\"}', '2026-06-14 01:23:39.000');

-- --------------------------------------------------------

--
-- Table structure for table `club_registrations`
--

CREATE TABLE `club_registrations` (
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
  `status` enum('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `club_registrations`
--

INSERT INTO `club_registrations` (`id`, `fullName`, `email`, `phone`, `militaryId`, `department`, `yearLevel`, `interests`, `motivation`, `userId`, `status`, `createdAt`, `updatedAt`) VALUES
('reg_1781385181800', 'Muhannad ', 'naeem@bouslati.com', '94996269', '2004002', 'Marin Engineering', 'Year 5', 'iot', 'intrest ', 'usr_1781384107881', 'PENDING', '2026-06-14 01:13:01.000', '2026-06-14 01:13:01.800');

-- --------------------------------------------------------

--
-- Table structure for table `competitions`
--

CREATE TABLE `competitions` (
  `id` varchar(191) NOT NULL,
  `profileId` varchar(191) NOT NULL,
  `eventName` varchar(191) NOT NULL,
  `role` varchar(191) NOT NULL,
  `year` varchar(191) NOT NULL,
  `result` varchar(191) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `contact_messages`
--

CREATE TABLE `contact_messages` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `phone` varchar(191) DEFAULT NULL,
  `subject` varchar(191) NOT NULL,
  `message` text NOT NULL,
  `status` enum('NEW','READ','REPLIED','CLOSED') NOT NULL DEFAULT 'NEW',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `contact_messages`
--

INSERT INTO `contact_messages` (`id`, `name`, `email`, `phone`, `subject`, `message`, `status`, `createdAt`, `updatedAt`) VALUES
('contact_1781384975132', 'mohnd', 'naeem@bouslati.com', NULL, 'Lab Booking', 'تتتتت', 'NEW', '2026-06-14 01:09:35.000', '2026-06-14 01:09:35.134');

-- --------------------------------------------------------

--
-- Table structure for table `departments`
--

CREATE TABLE `departments` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `code` varchar(191) NOT NULL,
  `description` text DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `departments`
--

INSERT INTO `departments` (`id`, `name`, `code`, `description`, `createdAt`, `updatedAt`) VALUES
('dept_5506vkhdc_1781383987820', 'Cyber Security Department', 'CS', 'Department focused on cybersecurity and information security', '2026-06-14 00:53:07.000', '2026-06-14 00:53:07.000'),
('dept_m3mvoqmty_1781383987825', 'Mechanical Engineering Department', 'ME', 'Department for mechanical and robotics engineering', '2026-06-14 00:53:07.000', '2026-06-14 00:53:07.000');

-- --------------------------------------------------------

--
-- Table structure for table `events`
--

CREATE TABLE `events` (
  `id` varchar(191) NOT NULL,
  `title` varchar(191) NOT NULL,
  `description` text NOT NULL,
  `category` varchar(191) NOT NULL,
  `startDate` datetime(3) NOT NULL,
  `endDate` datetime(3) DEFAULT NULL,
  `location` varchar(191) DEFAULT NULL,
  `capacity` int(11) DEFAULT NULL,
  `createdById` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `events`
--

INSERT INTO `events` (`id`, `title`, `description`, `category`, `startDate`, `endDate`, `location`, `capacity`, `createdById`, `createdAt`, `updatedAt`) VALUES
('evt_jufbemi46_1781383987992', 'Induction Week 2025/2026', 'Strategic start for AFAQ members.', 'Workshop', '2025-01-15 04:00:00.000', '2025-01-17 04:00:00.000', 'Main Auditorium', 200, 'usr_mllh3lh8i_1781383987843', '2026-06-14 00:53:07.000', '2026-06-14 00:53:07.000');

-- --------------------------------------------------------

--
-- Table structure for table `event_registrations`
--

CREATE TABLE `event_registrations` (
  `id` varchar(191) NOT NULL,
  `eventId` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `status` enum('REGISTERED','ATTENDED','CANCELLED') NOT NULL DEFAULT 'REGISTERED',
  `registeredAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `experiences`
--

CREATE TABLE `experiences` (
  `id` varchar(191) NOT NULL,
  `profileId` varchar(191) NOT NULL,
  `title` varchar(191) NOT NULL,
  `place` varchar(191) NOT NULL,
  `year` varchar(191) NOT NULL,
  `type` varchar(191) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `forum_categories`
--

CREATE TABLE `forum_categories` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `description` text DEFAULT NULL,
  `icon` varchar(191) DEFAULT NULL,
  `color` varchar(191) DEFAULT '#3b82f6',
  `sortOrder` int(11) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `forum_categories`
--

INSERT INTO `forum_categories` (`id`, `name`, `description`, `icon`, `color`, `sortOrder`, `createdAt`, `updatedAt`) VALUES
('cat_announcements', 'Announcements', 'Official announcements from AFAQ staff and leadership.', 'fa-bullhorn', '#ef4444', 1, '2026-06-14 01:05:21.346', '2026-06-14 01:05:21.346'),
('cat_events', 'Events & Activities', 'Discuss upcoming events, workshops, and club activities.', 'fa-calendar', '#10b981', 4, '2026-06-14 01:05:21.357', '2026-06-14 01:05:21.357'),
('cat_general', 'General Discussion', 'General topics, introductions, and community chat.', 'fa-comments', '#6b7280', 6, '2026-06-14 01:05:21.363', '2026-06-14 01:05:21.363'),
('cat_labs', 'Lab Discussions', 'Questions, tips, and discussions about lab sessions.', 'fa-microscope', '#3b82f6', 5, '2026-06-14 01:05:21.360', '2026-06-14 01:05:21.360'),
('cat_projects', 'Projects & Ideas', 'Share your project ideas and get feedback from the community.', 'fa-lightbulb', '#f59e0b', 2, '2026-06-14 01:05:21.353', '2026-06-14 01:05:21.353'),
('cat_research', 'Research & Tech', 'Discuss research papers, technologies, and academic topics.', 'fa-flask', '#8b5cf6', 3, '2026-06-14 01:05:21.355', '2026-06-14 01:05:21.355');

-- --------------------------------------------------------

--
-- Table structure for table `forum_mute_settings`
--

CREATE TABLE `forum_mute_settings` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `postId` varchar(191) NOT NULL,
  `muteTopicReplies` tinyint(1) NOT NULL DEFAULT 0,
  `muteThreadReplies` tinyint(1) NOT NULL DEFAULT 0,
  `muteQuoteReplies` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `forum_posts`
--

CREATE TABLE `forum_posts` (
  `id` varchar(191) NOT NULL,
  `title` varchar(200) DEFAULT NULL,
  `content` text NOT NULL,
  `categoryId` varchar(191) NOT NULL,
  `authorId` varchar(191) NOT NULL,
  `parentId` varchar(191) DEFAULT NULL,
  `replyToId` varchar(191) DEFAULT NULL,
  `isPinned` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `forum_posts`
--

INSERT INTO `forum_posts` (`id`, `title`, `content`, `categoryId`, `authorId`, `parentId`, `replyToId`, `isPinned`, `createdAt`, `updatedAt`) VALUES
('post_1781384826372', 'السلام عليكم ', 'عندي استفسار . هل ممكن مساعدة ؟', 'cat_events', 'usr_1781384107881', NULL, NULL, 0, '2026-06-14 01:07:06.000', '2026-06-14 01:08:01.000'),
('post_1781385495581', 'this is test annousment ', 'test', 'cat_announcements', 'usr_1781384107881', NULL, NULL, 0, '2026-06-14 01:18:15.000', '2026-06-14 01:31:03.000'),
('reply_1781384881412', NULL, 'هل في احد ؟\r\n', 'cat_events', 'usr_1781384107881', 'post_1781384826372', NULL, 0, '2026-06-14 01:08:01.000', '2026-06-14 01:08:01.000'),
('reply_1781386263743', NULL, 'test', 'cat_announcements', 'usr_mllh3lh8i_1781383987843', 'post_1781385495581', NULL, 0, '2026-06-14 01:31:03.000', '2026-06-14 01:31:03.000');

-- --------------------------------------------------------

--
-- Table structure for table `labs`
--

CREATE TABLE `labs` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `shortDesc` varchar(191) NOT NULL,
  `tag` varchar(191) NOT NULL,
  `categoryId` varchar(191) NOT NULL,
  `departmentId` varchar(191) DEFAULT NULL,
  `capacity` int(11) NOT NULL DEFAULT 1,
  `isBookable` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `labs`
--

INSERT INTO `labs` (`id`, `name`, `shortDesc`, `tag`, `categoryId`, `departmentId`, `capacity`, `isBookable`, `createdAt`, `updatedAt`) VALUES
('lab_049e2fo7g_1781383987969', 'IoT Simulation Lab', 'Deploy sensors.', 'IoT', 'cat_kfn2csxey_1781383987939', NULL, 18, 1, '2026-06-14 00:53:07.000', '2026-06-14 00:53:07.000'),
('lab_5yprmhwzm_1781383987946', 'Arduino Starter Lab', 'First steps with microcontrollers.', 'Electronics', 'cat_8h741j3ss_1781383987929', NULL, 15, 1, '2026-06-14 00:53:07.000', '2026-06-14 00:53:07.000'),
('lab_6dzs5ihzy_1781383987953', 'AI & Ideas Corner', 'Discuss AI concepts.', 'AI / Ideas', 'cat_8h741j3ss_1781383987929', NULL, 20, 1, '2026-06-14 00:53:07.000', '2026-06-14 00:53:07.000'),
('lab_an5aehatw_1781383987971', 'Soldering Station Set', 'Full soldering kit.', 'Tool', 'cat_dy6mxl6z2_1781383987943', NULL, 1, 1, '2026-06-14 00:53:07.000', '2026-06-14 00:53:07.000'),
('lab_ficpc8cs1_1781383987975', 'General Hand Toolbox', 'Screwdrivers, pliers.', 'Tool', 'cat_dy6mxl6z2_1781383987943', NULL, 1, 1, '2026-06-14 00:53:07.000', '2026-06-14 00:53:07.000'),
('lab_jc9x1ycfj_1781383987955', 'Cybersecurity Lab', 'Honeypots and monitoring.', 'Cybersecurity', 'cat_kq4urdi3v_1781383987934', 'dept_5506vkhdc_1781383987820', 25, 1, '2026-06-14 00:53:07.000', '2026-06-14 00:53:07.000'),
('lab_kdvodgfr4_1781383987958', 'PCB Design Lab', 'From schematic to board.', 'Electronics', 'cat_kq4urdi3v_1781383987934', NULL, 10, 1, '2026-06-14 00:53:07.000', '2026-06-14 00:53:07.000'),
('lab_r0oo3z9vf_1781383987973', 'Measurement Pack', 'Multimeter and probes.', 'Tool', 'cat_dy6mxl6z2_1781383987943', NULL, 1, 1, '2026-06-14 00:53:07.000', '2026-06-14 00:53:07.000'),
('lab_ri541k72k_1781383987964', 'Mechanical Assembly Lab', 'Frames and mounts.', 'Mechanical', 'cat_kfn2csxey_1781383987939', 'dept_m3mvoqmty_1781383987825', 15, 1, '2026-06-14 00:53:07.000', '2026-06-14 00:53:07.000'),
('lab_stmui8vw3_1781383987961', 'Data & AI Lab', 'Model training.', 'Data / AI', 'cat_kq4urdi3v_1781383987934', NULL, 20, 1, '2026-06-14 00:53:07.000', '2026-06-14 00:53:07.000'),
('lab_u14k8i2aw_1781383987950', 'Robotics Practice Lab', 'Testing small robots.', 'Robotics', 'cat_8h741j3ss_1781383987929', NULL, 12, 1, '2026-06-14 00:53:07.000', '2026-06-14 00:53:07.000'),
('lab_xx6gtxv91_1781383987967', 'Power & Control Lab', 'Motors and relays.', 'Power', 'cat_kfn2csxey_1781383987939', NULL, 12, 1, '2026-06-14 00:53:07.000', '2026-06-14 00:53:07.000');

-- --------------------------------------------------------

--
-- Table structure for table `lab_bookings`
--

CREATE TABLE `lab_bookings` (
  `id` varchar(191) NOT NULL,
  `labId` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `bookingDate` datetime(3) NOT NULL,
  `timeSlot` varchar(191) NOT NULL,
  `purpose` text DEFAULT NULL,
  `status` enum('PENDING','APPROVED','REJECTED','COMPLETED','CANCELLED') NOT NULL DEFAULT 'PENDING',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `lab_bookings`
--

INSERT INTO `lab_bookings` (`id`, `labId`, `userId`, `bookingDate`, `timeSlot`, `purpose`, `status`, `createdAt`, `updatedAt`) VALUES
('booking_1781385636572', 'lab_jc9x1ycfj_1781383987955', 'usr_1781384107881', '2026-06-16 00:00:00.000', '08:00-10:00', 'test', 'PENDING', '2026-06-14 01:20:36.000', '2026-06-14 01:20:36.000');

-- --------------------------------------------------------

--
-- Table structure for table `lab_categories`
--

CREATE TABLE `lab_categories` (
  `id` varchar(191) NOT NULL,
  `key` varchar(191) NOT NULL,
  `label` varchar(191) NOT NULL,
  `description` text NOT NULL,
  `icon` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `lab_categories`
--

INSERT INTO `lab_categories` (`id`, `key`, `label`, `description`, `icon`, `createdAt`, `updatedAt`) VALUES
('cat_8h741j3ss_1781383987929', 'club', 'Scientific Club Labs', 'Student-driven labs under the scientific club.', 'fa-solid fa-users', '2026-06-14 00:53:07.000', '2026-06-14 00:53:07.000'),
('cat_dy6mxl6z2_1781383987943', 'tools', 'Tools & Equipment', 'Shared tools and portable equipment.', 'fa-solid fa-toolbox', '2026-06-14 00:53:07.000', '2026-06-14 00:53:07.000'),
('cat_kfn2csxey_1781383987939', 'handsOn', 'Hands-on Labs', 'Practical labs for building and testing.', 'fa-solid fa-screwdriver-wrench', '2026-06-14 00:53:07.000', '2026-06-14 00:53:07.000'),
('cat_kq4urdi3v_1781383987934', 'specialised', 'Specialised Labs', 'Labs managed by academic departments.', 'fa-solid fa-microscope', '2026-06-14 00:53:07.000', '2026-06-14 00:53:07.000');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `type` varchar(191) NOT NULL,
  `title` varchar(191) NOT NULL,
  `message` text DEFAULT NULL,
  `link` varchar(191) DEFAULT NULL,
  `isRead` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `userId`, `type`, `title`, `message`, `link`, `isRead`, `createdAt`) VALUES
('notif_1781385495586_90fhpg', 'usr_mllh3lh8i_1781383987843', 'ANNOUNCEMENT', '📢 New Announcement', 'this is test annousment ...', '/forums/topic/post_1781385495581', 1, '2026-06-14 01:18:15.000'),
('notif_1781386263764_8k9jh3', 'usr_1781384107881', 'FORUM_REPLY', 'New Reply in Your Topic', 'Ahmed Al-Balushi replied in your topic: \"this is test annousment ...\"', '/forums/topic/post_1781385495581', 0, '2026-06-14 01:31:03.000');

-- --------------------------------------------------------

--
-- Table structure for table `programmes`
--

CREATE TABLE `programmes` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `code` varchar(191) NOT NULL,
  `departmentId` varchar(191) NOT NULL,
  `level` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `programmes`
--

INSERT INTO `programmes` (`id`, `name`, `code`, `departmentId`, `level`, `createdAt`, `updatedAt`) VALUES
('prog_ack8z0rqi_1781383987833', 'BEng in Computer Security', 'BENG-CS', 'dept_5506vkhdc_1781383987820', 'Bachelor', '2026-06-14 00:53:07.000', '2026-06-14 00:53:07.000'),
('prog_vfz5nfqeh_1781383987837', 'BEng in Mechanical Engineering', 'BENG-ME', 'dept_m3mvoqmty_1781383987825', 'Bachelor', '2026-06-14 00:53:07.000', '2026-06-14 00:53:07.000');

-- --------------------------------------------------------

--
-- Table structure for table `projects`
--

CREATE TABLE `projects` (
  `id` varchar(191) NOT NULL,
  `title` varchar(191) NOT NULL,
  `description` text NOT NULL,
  `status` enum('START','DEVELOPMENT','COMPLETED') NOT NULL,
  `category` varchar(191) NOT NULL,
  `progress` int(11) NOT NULL DEFAULT 0,
  `startDate` datetime(3) DEFAULT NULL,
  `endDate` datetime(3) DEFAULT NULL,
  `createdById` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `projects`
--

INSERT INTO `projects` (`id`, `title`, `description`, `status`, `category`, `progress`, `startDate`, `endDate`, `createdById`, `createdAt`, `updatedAt`) VALUES
('proj_1781385339018', 'honeypot', 'cyper project\r\n![Screenshot 2026-06-08 192734.png](/uploads/1781385412943-Screenshot20260608192734.jpg.jpg)\r\ntext', '', 'Technology', 0, NULL, NULL, 'usr_1781384107881', '2026-06-14 01:15:39.000', '2026-06-14 01:23:39.000'),
('proj_98nuulgzk_1781383987978', 'Autonomous Line-Following Robot', 'Educational robot for navigation.', 'COMPLETED', 'Robotics', 100, NULL, NULL, 'usr_mllh3lh8i_1781383987843', '2026-06-14 00:53:07.000', '2026-06-14 00:53:07.000'),
('proj_gul0xhaye_1781383987982', 'Internal Threat Monitoring Platform', 'Behaviour-based monitoring system.', 'DEVELOPMENT', 'Cybersecurity', 70, NULL, NULL, 'usr_mllh3lh8i_1781383987843', '2026-06-14 00:53:07.000', '2026-06-14 00:53:07.000'),
('proj_gv4piexwj_1781383987989', 'Smart Campus IoT Network', 'IoT sensor network for campus.', 'START', 'IoT', 15, NULL, NULL, 'usr_mllh3lh8i_1781383987843', '2026-06-14 00:53:07.000', '2026-06-14 00:53:07.000');

-- --------------------------------------------------------

--
-- Table structure for table `project_attachments`
--

CREATE TABLE `project_attachments` (
  `id` varchar(191) NOT NULL,
  `projectId` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `url` varchar(191) NOT NULL,
  `type` varchar(191) NOT NULL,
  `uploadedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `project_attachments`
--

INSERT INTO `project_attachments` (`id`, `projectId`, `name`, `url`, `type`, `uploadedAt`) VALUES
('att_1781385357733', 'proj_1781385339018', 'DCT_Final.pptx', '/uploads/1781385357727-DCTFinal.pptx.pptx', 'DOCUMENT', '2026-06-14 01:15:57.000');

-- --------------------------------------------------------

--
-- Table structure for table `project_members`
--

CREATE TABLE `project_members` (
  `id` varchar(191) NOT NULL,
  `projectId` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `role` varchar(191) NOT NULL DEFAULT 'Member',
  `status` enum('PENDING','APPROVED','REJECTED','INVITED') NOT NULL DEFAULT 'PENDING',
  `joinedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `project_members`
--

INSERT INTO `project_members` (`id`, `projectId`, `userId`, `role`, `status`, `joinedAt`) VALUES
('pm_1781385339030', 'proj_1781385339018', 'usr_1781384107881', 'Owner', 'APPROVED', '2026-06-14 01:15:39.000');

-- --------------------------------------------------------

--
-- Table structure for table `research`
--

CREATE TABLE `research` (
  `id` varchar(191) NOT NULL,
  `title` varchar(191) NOT NULL,
  `abstract` text NOT NULL,
  `authors` text NOT NULL,
  `category` varchar(191) NOT NULL,
  `publicationDate` datetime(3) DEFAULT NULL,
  `url` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `skills`
--

CREATE TABLE `skills` (
  `id` varchar(191) NOT NULL,
  `profileId` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `student_profiles`
--

CREATE TABLE `student_profiles` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `fullName` varchar(191) NOT NULL,
  `phone` varchar(191) DEFAULT NULL,
  `departmentId` varchar(191) NOT NULL,
  `programmeId` varchar(191) NOT NULL,
  `yearLevel` varchar(191) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `student_profiles`
--

INSERT INTO `student_profiles` (`id`, `userId`, `fullName`, `phone`, `departmentId`, `programmeId`, `yearLevel`, `bio`, `createdAt`, `updatedAt`) VALUES
('sp_1781384107886', 'usr_1781384107881', 'Muhannad ', NULL, 'dept_5506vkhdc_1781383987820', 'prog_ack8z0rqi_1781383987833', 'Graduate', NULL, '2026-06-14 00:55:07.000', '2026-06-14 00:55:07.000'),
('sp_8usifsmnk_1781383987923', 'usr_mllh3lh8i_1781383987843', 'Ahmed Al-Balushi', '+968 9123 4567', 'dept_5506vkhdc_1781383987820', 'prog_ack8z0rqi_1781383987833', 'Level 3', 'Interested in cybersecurity and AI applications', '2026-06-14 00:53:07.000', '2026-06-14 00:53:07.000');

-- --------------------------------------------------------

--
-- Table structure for table `trainings`
--

CREATE TABLE `trainings` (
  `id` varchar(191) NOT NULL,
  `profileId` varchar(191) NOT NULL,
  `title` varchar(191) NOT NULL,
  `provider` varchar(191) NOT NULL,
  `year` varchar(191) NOT NULL,
  `hours` varchar(191) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` varchar(191) NOT NULL,
  `militaryId` varchar(191) NOT NULL,
  `password` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `role` enum('STUDENT','STAFF','ADMIN') NOT NULL DEFAULT 'STUDENT',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `militaryId`, `password`, `email`, `role`, `createdAt`, `updatedAt`) VALUES
('usr_1781384107881', '2101001', '$2b$10$btVbZfjYSbMHXjnm.X2H.uESHBzs1hLQaXOVTEarZzS6ypEXnxe4y', 'mohndnaeem11@gmail.com', 'ADMIN', '2026-06-14 00:55:07.000', '2026-06-14 00:55:07.000'),
('usr_mllh3lh8i_1781383987843', '2101006', '$2b$10$pioBe1DgGe4KcNh6frOvm.7eLts9c7dBdDt7c2E10jHMxxsBeo576', 'student2101006@mtc.edu.om', 'STUDENT', '2026-06-14 00:53:07.000', '2026-06-14 00:53:07.000');

-- --------------------------------------------------------

--
-- Table structure for table `_prisma_migrations`
--

CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) NOT NULL,
  `checksum` varchar(64) NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) NOT NULL,
  `logs` text DEFAULT NULL,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `applied_steps_count` int(10) UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `_prisma_migrations`
--

INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`) VALUES
('5b9e3434-c25f-4f35-b420-da6cb4ea7189', 'fe021944d9620a1af6e613616b3116439e12b152a253065d339396190b3114e8', '2026-06-13 20:43:26.420', '20260613204325_init', NULL, NULL, '2026-06-13 20:43:25.217', 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `audit_logs_userId_idx` (`userId`),
  ADD KEY `audit_logs_action_idx` (`action`);

--
-- Indexes for table `club_registrations`
--
ALTER TABLE `club_registrations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `club_registrations_status_idx` (`status`);

--
-- Indexes for table `competitions`
--
ALTER TABLE `competitions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `competitions_profileId_fkey` (`profileId`);

--
-- Indexes for table `contact_messages`
--
ALTER TABLE `contact_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `contact_messages_status_idx` (`status`);

--
-- Indexes for table `departments`
--
ALTER TABLE `departments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `departments_name_key` (`name`),
  ADD UNIQUE KEY `departments_code_key` (`code`);

--
-- Indexes for table `events`
--
ALTER TABLE `events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `events_createdById_fkey` (`createdById`);

--
-- Indexes for table `event_registrations`
--
ALTER TABLE `event_registrations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `event_registrations_eventId_userId_key` (`eventId`,`userId`),
  ADD KEY `event_registrations_userId_fkey` (`userId`);

--
-- Indexes for table `experiences`
--
ALTER TABLE `experiences`
  ADD PRIMARY KEY (`id`),
  ADD KEY `experiences_profileId_fkey` (`profileId`);

--
-- Indexes for table `forum_categories`
--
ALTER TABLE `forum_categories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `forum_mute_settings`
--
ALTER TABLE `forum_mute_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `forum_mute_userId_postId` (`userId`,`postId`);

--
-- Indexes for table `forum_posts`
--
ALTER TABLE `forum_posts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `forum_posts_categoryId_idx` (`categoryId`),
  ADD KEY `forum_posts_parentId_idx` (`parentId`),
  ADD KEY `forum_posts_authorId_idx` (`authorId`);

--
-- Indexes for table `labs`
--
ALTER TABLE `labs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `labs_categoryId_fkey` (`categoryId`),
  ADD KEY `labs_departmentId_fkey` (`departmentId`);

--
-- Indexes for table `lab_bookings`
--
ALTER TABLE `lab_bookings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `lab_bookings_labId_fkey` (`labId`),
  ADD KEY `lab_bookings_userId_fkey` (`userId`);

--
-- Indexes for table `lab_categories`
--
ALTER TABLE `lab_categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `lab_categories_key_key` (`key`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `notifications_userId_idx` (`userId`),
  ADD KEY `notifications_isRead_idx` (`isRead`);

--
-- Indexes for table `programmes`
--
ALTER TABLE `programmes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `programmes_code_key` (`code`),
  ADD KEY `programmes_departmentId_fkey` (`departmentId`);

--
-- Indexes for table `projects`
--
ALTER TABLE `projects`
  ADD PRIMARY KEY (`id`),
  ADD KEY `projects_createdById_fkey` (`createdById`);

--
-- Indexes for table `project_attachments`
--
ALTER TABLE `project_attachments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `project_attachments_projectId_fkey` (`projectId`);

--
-- Indexes for table `project_members`
--
ALTER TABLE `project_members`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `project_members_projectId_userId_key` (`projectId`,`userId`),
  ADD KEY `project_members_userId_fkey` (`userId`);

--
-- Indexes for table `research`
--
ALTER TABLE `research`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `skills`
--
ALTER TABLE `skills`
  ADD PRIMARY KEY (`id`),
  ADD KEY `skills_profileId_fkey` (`profileId`);

--
-- Indexes for table `student_profiles`
--
ALTER TABLE `student_profiles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `student_profiles_userId_key` (`userId`),
  ADD KEY `student_profiles_departmentId_fkey` (`departmentId`),
  ADD KEY `student_profiles_programmeId_fkey` (`programmeId`);

--
-- Indexes for table `trainings`
--
ALTER TABLE `trainings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `trainings_profileId_fkey` (`profileId`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_militaryId_key` (`militaryId`),
  ADD UNIQUE KEY `users_email_key` (`email`);

--
-- Indexes for table `_prisma_migrations`
--
ALTER TABLE `_prisma_migrations`
  ADD PRIMARY KEY (`id`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `competitions`
--
ALTER TABLE `competitions`
  ADD CONSTRAINT `competitions_profileId_fkey` FOREIGN KEY (`profileId`) REFERENCES `student_profiles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `events`
--
ALTER TABLE `events`
  ADD CONSTRAINT `events_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `event_registrations`
--
ALTER TABLE `event_registrations`
  ADD CONSTRAINT `event_registrations_eventId_fkey` FOREIGN KEY (`eventId`) REFERENCES `events` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `event_registrations_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `experiences`
--
ALTER TABLE `experiences`
  ADD CONSTRAINT `experiences_profileId_fkey` FOREIGN KEY (`profileId`) REFERENCES `student_profiles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `labs`
--
ALTER TABLE `labs`
  ADD CONSTRAINT `labs_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `lab_categories` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `labs_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `departments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `lab_bookings`
--
ALTER TABLE `lab_bookings`
  ADD CONSTRAINT `lab_bookings_labId_fkey` FOREIGN KEY (`labId`) REFERENCES `labs` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `lab_bookings_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `programmes`
--
ALTER TABLE `programmes`
  ADD CONSTRAINT `programmes_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `departments` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `projects`
--
ALTER TABLE `projects`
  ADD CONSTRAINT `projects_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `project_attachments`
--
ALTER TABLE `project_attachments`
  ADD CONSTRAINT `project_attachments_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `project_members`
--
ALTER TABLE `project_members`
  ADD CONSTRAINT `project_members_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `project_members_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `skills`
--
ALTER TABLE `skills`
  ADD CONSTRAINT `skills_profileId_fkey` FOREIGN KEY (`profileId`) REFERENCES `student_profiles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `student_profiles`
--
ALTER TABLE `student_profiles`
  ADD CONSTRAINT `student_profiles_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `departments` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `student_profiles_programmeId_fkey` FOREIGN KEY (`programmeId`) REFERENCES `programmes` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `student_profiles_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `trainings`
--
ALTER TABLE `trainings`
  ADD CONSTRAINT `trainings_profileId_fkey` FOREIGN KEY (`profileId`) REFERENCES `student_profiles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
