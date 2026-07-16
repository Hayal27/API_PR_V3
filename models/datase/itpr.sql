-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 16, 2026 at 01:23 PM
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
-- Database: `itpr`
--

-- --------------------------------------------------------

--
-- Table structure for table `approvalhierarchy`
--

CREATE TABLE `approvalhierarchy` (
  `id` int(11) NOT NULL,
  `role_id` int(11) DEFAULT NULL,
  `department_id` int(11) DEFAULT NULL,
  `next_role_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `approvalworkflow`
--

CREATE TABLE `approvalworkflow` (
  `approvalworkflow_id` int(11) NOT NULL,
  `plan_id` int(11) DEFAULT NULL,
  `approver_id` int(11) DEFAULT NULL,
  `status` enum('completed','in progress','Pending','Approved','Declined') DEFAULT 'Pending',
  `comment` text DEFAULT NULL,
  `approval_date` datetime DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `report_id` int(11) DEFAULT NULL,
  `report_status` enum('Pending','Approved','Declined') DEFAULT 'Pending',
  `rating` decimal(5,2) DEFAULT NULL,
  `comment_writer` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `approvalworkflow`
--

INSERT INTO `approvalworkflow` (`approvalworkflow_id`, `plan_id`, `approver_id`, `status`, `comment`, `approval_date`, `approved_at`, `report_id`, `report_status`, `rating`, `comment_writer`) VALUES
(415, 224, 72, 'completed', '', '2025-11-24 08:20:42', NULL, NULL, 'Pending', NULL, ''),
(416, 225, 72, 'completed', '', '2025-11-24 08:20:20', NULL, NULL, 'Pending', NULL, ''),
(417, 226, 72, 'completed', '', '2025-11-24 08:20:25', NULL, NULL, 'Pending', NULL, ''),
(418, 227, 72, 'completed', '', '2025-11-24 08:20:38', NULL, NULL, 'Pending', NULL, ''),
(419, 228, 72, 'completed', '', '2025-11-24 08:20:47', NULL, NULL, 'Pending', NULL, ''),
(420, 229, 72, 'completed', '', '2025-11-24 08:20:51', NULL, NULL, 'Pending', NULL, ''),
(421, 230, 72, 'completed', '', '2025-11-24 08:20:29', NULL, NULL, 'Pending', NULL, ''),
(422, 231, 72, 'Approved', '', '2025-11-24 08:20:33', NULL, NULL, 'Pending', NULL, ''),
(423, 232, 72, 'Declined', 'you need to update ', '2026-03-11 19:01:05', NULL, NULL, 'Pending', NULL, 'olana olana'),
(425, 234, 72, 'Pending', NULL, '2025-11-25 09:03:13', NULL, NULL, 'Pending', NULL, ''),
(427, 236, 72, 'Approved', '', '2025-11-29 04:53:29', NULL, NULL, 'Pending', NULL, ''),
(428, 237, 72, 'Approved', 'REFERRED by olana olana: ', '2025-11-27 03:49:26', NULL, NULL, 'Pending', NULL, 'olana olana'),
(429, 237, 141, 'Pending', 'Referred from olana olana', '2025-11-27 03:49:26', NULL, NULL, 'Pending', NULL, ''),
(430, 238, 72, 'Approved', 'REFERRED by olana olana: this issue ....', '2026-03-11 17:11:29', NULL, NULL, 'Pending', NULL, 'olana olana'),
(431, 239, 72, 'Pending', NULL, '2025-12-11 07:28:06', NULL, NULL, 'Pending', NULL, ''),
(432, 240, 72, 'Pending', NULL, '2025-12-11 07:34:19', NULL, NULL, 'Pending', NULL, ''),
(433, 241, 72, 'Pending', '', '2025-12-11 08:38:43', NULL, NULL, 'Pending', NULL, ''),
(434, 242, 72, 'Pending', NULL, '2025-12-11 11:30:28', NULL, NULL, 'Pending', NULL, ''),
(435, 243, 72, 'Pending', NULL, '2025-12-15 02:52:45', NULL, NULL, 'Pending', NULL, ''),
(436, 244, 72, 'Pending', NULL, '2025-12-15 04:21:12', NULL, NULL, 'Pending', NULL, ''),
(437, 245, 72, 'Pending', NULL, '2025-12-15 07:15:21', NULL, NULL, 'Pending', NULL, ''),
(438, 246, 72, 'Pending', NULL, '2025-12-15 07:28:13', NULL, NULL, 'Pending', NULL, ''),
(439, 247, 148, 'Approved', 'REFERRED by belete esubalew: eyew', '2026-03-11 17:26:48', NULL, NULL, 'Pending', NULL, 'belete esubalew'),
(440, 248, 150, 'Approved', 'REFERRED by belete esubalew: check this out ', '2026-03-11 17:24:26', NULL, NULL, 'Pending', NULL, 'belete esubalew'),
(441, 249, 143, 'Pending', NULL, '2026-03-09 10:08:12', NULL, NULL, 'Pending', NULL, ''),
(442, 250, 72, 'Pending', NULL, '2026-03-09 11:16:56', NULL, NULL, 'Pending', NULL, ''),
(443, 251, 143, 'Pending', NULL, '2026-03-10 11:06:01', NULL, NULL, 'Pending', NULL, ''),
(444, 252, 143, 'Approved', 'REFERRED by olana olana: ', '2026-03-11 14:39:15', NULL, NULL, 'Pending', NULL, 'olana olana'),
(445, 252, 142, 'Approved', 'REFERRED by belete esubalew: review it by you self', '2026-03-11 14:40:37', NULL, NULL, 'Pending', NULL, 'belete esubalew'),
(446, 252, 72, 'Approved', '', '2026-03-11 17:10:36', NULL, NULL, 'Pending', NULL, ''),
(447, 232, 142, 'Approved', 'REFERRED by belete esubalew: cheek out this', '2026-03-11 18:55:02', NULL, NULL, 'Pending', NULL, 'belete esubalew'),
(448, 238, 142, 'Approved', 'REFERRED by belete esubalew: note mine', '2026-03-11 17:13:09', NULL, NULL, 'Pending', NULL, 'belete esubalew'),
(449, 238, 72, 'Pending', 'Referred from belete esubalew', '2026-03-11 17:13:09', NULL, NULL, 'Pending', NULL, ''),
(450, 248, 72, 'Approved', 'REFERRED by olana olana: bele eyew', '2026-03-11 17:25:36', NULL, NULL, 'Pending', NULL, 'olana olana'),
(451, 248, 142, 'Approved', 'REFERRED by belete esubalew: test', '2026-03-11 18:55:53', NULL, NULL, 'Pending', NULL, 'belete esubalew'),
(452, 247, 72, 'Approved', 'REFERRED by belete esubalew: cheek this', '2026-03-11 17:27:26', NULL, NULL, 'Pending', NULL, 'belete esubalew'),
(453, 247, 72, 'Approved', 'REFERRED by olana olana: tets', '2026-03-11 18:51:52', NULL, NULL, 'Pending', NULL, 'olana olana'),
(454, 247, 142, 'Pending', 'Referred from olana olana', '2026-03-11 18:51:52', NULL, NULL, 'Pending', NULL, ''),
(455, 232, 72, 'Declined', 'you need to update ', '2026-03-11 19:01:05', NULL, NULL, 'Pending', NULL, ''),
(456, 248, 72, 'Approved', 'REFERRED by belete esubalew: cheek this out ', '2026-03-11 18:56:32', NULL, NULL, 'Pending', NULL, 'belete esubalew'),
(457, 248, 72, 'Pending', 'Referred from belete esubalew', '2026-03-11 18:56:32', NULL, NULL, 'Pending', NULL, '');

-- --------------------------------------------------------

--
-- Table structure for table `approval_workflow_history`
--

CREATE TABLE `approval_workflow_history` (
  `history_id` int(11) NOT NULL,
  `plan_id` int(11) NOT NULL,
  `approver_id` int(11) NOT NULL,
  `approver_name` varchar(255) NOT NULL,
  `approver_role` varchar(100) NOT NULL,
  `status` enum('Pending','Approved','Declined') NOT NULL,
  `comment` text DEFAULT NULL,
  `action_date` datetime DEFAULT current_timestamp(),
  `step_number` int(11) NOT NULL,
  `is_current_step` tinyint(1) DEFAULT 0,
  `created_by_user_id` int(11) NOT NULL,
  `created_by_name` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `approval_workflow_history`
--

INSERT INTO `approval_workflow_history` (`history_id`, `plan_id`, `approver_id`, `approver_name`, `approver_role`, `status`, `comment`, `action_date`, `step_number`, `is_current_step`, `created_by_user_id`, `created_by_name`, `created_at`, `updated_at`) VALUES
(105, 224, 72, 'Unknown', 'Unknown', 'Pending', 'Plan submitted for approval', '2025-11-24 08:08:46', 1, 1, 40, 'Unknown', '2025-11-24 13:08:46', '2025-11-24 13:08:46'),
(106, 225, 72, 'Unknown', 'Unknown', 'Pending', 'Plan submitted for approval', '2025-11-24 08:10:39', 1, 1, 40, 'Unknown', '2025-11-24 13:10:39', '2025-11-24 13:10:39'),
(107, 226, 72, 'Unknown', 'Unknown', 'Pending', 'Plan submitted for approval', '2025-11-24 08:12:00', 1, 1, 40, 'Unknown', '2025-11-24 13:12:00', '2025-11-24 13:12:00'),
(108, 227, 72, 'Unknown', 'Unknown', 'Pending', 'Plan submitted for approval', '2025-11-24 08:13:52', 1, 1, 40, 'Unknown', '2025-11-24 13:13:52', '2025-11-24 13:13:52'),
(109, 228, 72, 'Unknown', 'Unknown', 'Pending', 'Plan submitted for approval', '2025-11-24 08:15:35', 1, 1, 40, 'Unknown', '2025-11-24 13:15:35', '2025-11-24 13:15:35'),
(110, 229, 72, 'Unknown', 'Unknown', 'Pending', 'Plan submitted for approval', '2025-11-24 08:17:12', 1, 1, 40, 'Unknown', '2025-11-24 13:17:12', '2025-11-24 13:17:12'),
(111, 230, 72, 'Unknown', 'Unknown', 'Pending', 'Plan submitted for approval', '2025-11-24 08:18:53', 1, 1, 40, 'Unknown', '2025-11-24 13:18:53', '2025-11-24 13:18:53'),
(112, 231, 72, 'Unknown', 'Unknown', 'Pending', 'Plan submitted for approval', '2025-11-24 08:20:06', 1, 1, 40, 'Unknown', '2025-11-24 13:20:06', '2025-11-24 13:20:06'),
(113, 232, 72, 'Unknown', 'Unknown', 'Pending', 'Plan submitted for approval', '2025-11-25 08:55:46', 1, 1, 40, 'Unknown', '2025-11-25 13:55:46', '2025-11-25 13:55:46'),
(115, 234, 72, 'Unknown', 'Unknown', 'Pending', 'Plan submitted for approval', '2025-11-25 09:03:13', 1, 1, 40, 'Unknown', '2025-11-25 14:03:13', '2025-11-25 14:03:13'),
(117, 236, 72, 'Unknown', 'Unknown', 'Pending', 'Plan submitted for approval', '2025-11-27 03:46:05', 1, 1, 40, 'Unknown', '2025-11-27 08:46:05', '2025-11-27 08:46:05'),
(118, 237, 72, 'Unknown', 'Unknown', 'Pending', 'Plan submitted for approval', '2025-11-27 03:48:50', 1, 1, 40, 'Unknown', '2025-11-27 08:48:50', '2025-11-27 08:48:50'),
(119, 238, 72, 'Unknown', 'Unknown', 'Pending', 'Plan submitted for approval', '2025-11-27 08:57:07', 1, 1, 40, 'Unknown', '2025-11-27 13:57:07', '2025-11-27 13:57:07'),
(120, 239, 72, 'Unknown', 'Unknown', 'Pending', 'Plan submitted for approval', '2025-12-11 07:28:06', 1, 1, 40, 'Unknown', '2025-12-11 12:28:06', '2025-12-11 12:28:06'),
(121, 240, 72, 'Unknown', 'Unknown', 'Pending', 'Plan submitted for approval', '2025-12-11 07:34:19', 1, 1, 40, 'Unknown', '2025-12-11 12:34:19', '2025-12-11 12:34:19'),
(122, 241, 72, 'Unknown', 'Unknown', 'Pending', 'Plan submitted for approval', '2025-12-11 08:24:23', 1, 1, 25, 'Unknown', '2025-12-11 13:24:23', '2025-12-11 13:24:23'),
(123, 242, 72, 'Unknown', 'Unknown', 'Pending', 'Plan submitted for approval', '2025-12-11 11:30:29', 1, 1, 25, 'Unknown', '2025-12-11 16:30:29', '2025-12-11 16:30:29'),
(124, 243, 72, 'Unknown', 'Unknown', 'Pending', 'Plan submitted for approval', '2025-12-15 02:52:45', 1, 1, 40, 'Unknown', '2025-12-15 07:52:45', '2025-12-15 07:52:45'),
(125, 244, 72, 'Unknown', 'Unknown', 'Pending', 'Plan submitted for approval', '2025-12-15 04:21:12', 1, 1, 40, 'Unknown', '2025-12-15 09:21:12', '2025-12-15 09:21:12'),
(126, 245, 72, 'Unknown', 'Unknown', 'Pending', 'Plan submitted for approval', '2025-12-15 07:15:21', 1, 1, 40, 'Unknown', '2025-12-15 12:15:21', '2025-12-15 12:15:21'),
(127, 246, 72, 'Unknown', 'Unknown', 'Pending', 'Plan submitted for approval', '2025-12-15 07:28:13', 1, 1, 40, 'Unknown', '2025-12-15 12:28:13', '2025-12-15 12:28:13'),
(128, 247, 148, 'Unknown', 'Unknown', 'Pending', 'Plan submitted for approval', '2025-12-16 08:22:07', 1, 1, 76, 'Unknown', '2025-12-16 13:22:07', '2025-12-16 13:22:07'),
(129, 248, 150, 'Unknown', 'Unknown', 'Pending', 'Plan submitted for approval', '2025-12-16 13:36:52', 1, 1, 78, 'Unknown', '2025-12-16 18:36:52', '2025-12-16 18:36:52'),
(130, 249, 143, 'Unknown', 'Unknown', 'Pending', 'Plan submitted for approval', '2026-03-09 10:08:12', 1, 1, 40, 'Unknown', '2026-03-09 07:08:12', '2026-03-09 07:08:12'),
(131, 250, 72, 'Unknown', 'Unknown', 'Pending', 'Plan submitted for approval', '2026-03-09 11:16:56', 1, 1, 40, 'Unknown', '2026-03-09 08:16:56', '2026-03-09 08:16:56'),
(132, 251, 143, 'Unknown', 'Unknown', 'Pending', 'Plan submitted for approval', '2026-03-10 11:06:01', 1, 1, 40, 'Unknown', '2026-03-10 08:06:01', '2026-03-10 08:06:01'),
(133, 252, 143, 'Unknown', 'Unknown', 'Pending', 'Plan submitted for approval', '2026-03-11 14:12:30', 1, 1, 40, 'Unknown', '2026-03-11 11:12:30', '2026-03-11 11:12:30');

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `action` varchar(50) NOT NULL,
  `description` text NOT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `audit_logs`
--

INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `description`, `metadata`, `created_at`) VALUES
(6, NULL, 'CREATE_ROLE', 'Created role: sinior-expert', '{\"role_id\":28,\"role_name\":\"sinior-expert\"}', '2025-11-11 12:16:24'),
(7, 25, 'LOGOUT', 'User olana@itp.et logged out', '{\"user_id\":\"25\",\"username\":\"olana@itp.et\",\"employee_name\":\"Olana\",\"logout_time\":\"2025-11-29T09:52:52.464Z\",\"timestamp\":\"2025-11-29T09:52:52.465Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/25\",\"method\":\"PUT\"}', '2025-11-29 09:52:52'),
(8, 25, 'LOGIN', 'User olana@itp.et logged in successfully', '{\"username\":\"olana@itp.et\",\"user_id\":25,\"role_id\":2,\"employee_id\":72,\"employee_name\":\"Olana\",\"department_id\":2,\"login_time\":\"2025-11-29T09:53:02.916Z\",\"timestamp\":\"2025-11-29T09:53:02.917Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2025-11-29 09:53:02'),
(9, 25, 'LOGOUT', 'User olana@itp.et logged out', '{\"user_id\":\"25\",\"username\":\"olana@itp.et\",\"employee_name\":\"Olana\",\"logout_time\":\"2025-11-29T10:03:38.264Z\",\"timestamp\":\"2025-11-29T10:03:38.265Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/25\",\"method\":\"PUT\"}', '2025-11-29 10:03:38'),
(10, 25, 'LOGIN', 'User olana@itp.et logged in successfully', '{\"username\":\"olana@itp.et\",\"user_id\":25,\"role_id\":2,\"employee_id\":72,\"employee_name\":\"Olana\",\"department_id\":2,\"login_time\":\"2025-11-29T10:03:44.139Z\",\"timestamp\":\"2025-11-29T10:03:44.139Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2025-11-29 10:03:44'),
(11, 40, 'LOGOUT', 'User ezira@itpark.et logged out', '{\"user_id\":\"40\",\"username\":\"ezira@itpark.et\",\"employee_name\":\"Ezira\",\"logout_time\":\"2025-11-29T10:05:51.820Z\",\"timestamp\":\"2025-11-29T10:05:51.820Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/40\",\"method\":\"PUT\"}', '2025-11-29 10:05:51'),
(12, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":2,\"login_time\":\"2025-11-29T10:06:09.457Z\",\"timestamp\":\"2025-11-29T10:06:09.457Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2025-11-29 10:06:09'),
(13, 40, 'LOGOUT', 'User ezira@itpark.et logged out', '{\"user_id\":\"40\",\"username\":\"ezira@itpark.et\",\"employee_name\":\"Ezira\",\"logout_time\":\"2025-11-29T10:08:36.243Z\",\"timestamp\":\"2025-11-29T10:08:36.243Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/40\",\"method\":\"PUT\"}', '2025-11-29 10:08:36'),
(14, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":2,\"login_time\":\"2025-11-29T10:08:50.735Z\",\"timestamp\":\"2025-11-29T10:08:50.735Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2025-11-29 10:08:50'),
(15, 40, 'LOGOUT', 'User ezira@itpark.et logged out', '{\"user_id\":\"40\",\"username\":\"ezira@itpark.et\",\"employee_name\":\"Ezira\",\"logout_time\":\"2025-11-29T10:09:29.060Z\",\"timestamp\":\"2025-11-29T10:09:29.060Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/40\",\"method\":\"PUT\"}', '2025-11-29 10:09:29'),
(16, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":2,\"login_time\":\"2025-11-29T10:09:41.425Z\",\"timestamp\":\"2025-11-29T10:09:41.425Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2025-11-29 10:09:41'),
(17, 40, 'LOGOUT', 'User ezira@itpark.et logged out', '{\"user_id\":\"40\",\"username\":\"ezira@itpark.et\",\"employee_name\":\"Ezira\",\"logout_time\":\"2025-11-29T10:15:07.314Z\",\"timestamp\":\"2025-11-29T10:15:07.315Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/40\",\"method\":\"PUT\"}', '2025-11-29 10:15:07'),
(18, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":2,\"login_time\":\"2025-11-29T10:16:10.640Z\",\"timestamp\":\"2025-11-29T10:16:10.640Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2025-11-29 10:16:10'),
(19, 25, 'LOGOUT', 'User olana@itp.et logged out', '{\"user_id\":\"25\",\"username\":\"olana@itp.et\",\"employee_name\":\"Olana\",\"logout_time\":\"2025-11-29T10:16:17.832Z\",\"timestamp\":\"2025-11-29T10:16:17.832Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/25\",\"method\":\"PUT\"}', '2025-11-29 10:16:17'),
(20, 25, 'LOGIN', 'User olana@itp.et logged in successfully', '{\"username\":\"olana@itp.et\",\"user_id\":25,\"role_id\":2,\"employee_id\":72,\"employee_name\":\"Olana\",\"department_id\":2,\"login_time\":\"2025-11-29T10:16:23.776Z\",\"timestamp\":\"2025-11-29T10:16:23.776Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2025-11-29 10:16:23'),
(21, 25, 'LOGOUT', 'User olana@itp.et logged out', '{\"user_id\":\"25\",\"username\":\"olana@itp.et\",\"employee_name\":\"Olana\",\"logout_time\":\"2025-11-29T10:51:18.355Z\",\"timestamp\":\"2025-11-29T10:51:18.355Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/25\",\"method\":\"PUT\"}', '2025-11-29 10:51:18'),
(22, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":2,\"login_time\":\"2025-11-29T10:51:45.198Z\",\"timestamp\":\"2025-11-29T10:51:45.198Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2025-11-29 10:51:45'),
(23, 40, 'LOGOUT', 'User ezira@itpark.et logged out', '{\"user_id\":\"40\",\"username\":\"ezira@itpark.et\",\"employee_name\":\"Ezira\",\"logout_time\":\"2025-11-29T10:53:32.592Z\",\"timestamp\":\"2025-11-29T10:53:32.592Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/40\",\"method\":\"PUT\"}', '2025-11-29 10:53:32'),
(24, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":2,\"login_time\":\"2025-11-29T10:53:36.735Z\",\"timestamp\":\"2025-11-29T10:53:36.735Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2025-11-29 10:53:36'),
(25, 40, 'LOGOUT', 'User ezira@itpark.et logged out', '{\"user_id\":\"40\",\"username\":\"ezira@itpark.et\",\"employee_name\":\"Ezira\",\"logout_time\":\"2025-11-29T10:54:27.675Z\",\"timestamp\":\"2025-11-29T10:54:27.675Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/40\",\"method\":\"PUT\"}', '2025-11-29 10:54:27'),
(26, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":2,\"login_time\":\"2025-11-29T10:54:33.903Z\",\"timestamp\":\"2025-11-29T10:54:33.903Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2025-11-29 10:54:33'),
(27, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":2,\"login_time\":\"2025-11-29T10:56:14.410Z\",\"timestamp\":\"2025-11-29T10:56:14.411Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2025-11-29 10:56:14'),
(28, NULL, 'CREATE_ROLE', 'Created role: Ceo', '{\"role_id\":29,\"role_name\":\"Ceo\"}', '2025-11-29 11:08:22'),
(29, NULL, 'LOGIN_FAILED', 'Login failed: User not found - ezira@itpark.et	', '{\"username\":\"ezira@itpark.et\\t\",\"reason\":\"user_not_found\",\"timestamp\":\"2025-12-11T06:59:30.962Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2025-12-11 06:59:30'),
(30, NULL, 'LOGIN_FAILED', 'Login failed: User not found - ezira@itpark.et	', '{\"username\":\"ezira@itpark.et\\t\",\"reason\":\"user_not_found\",\"timestamp\":\"2025-12-11T06:59:32.842Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2025-12-11 06:59:32'),
(31, NULL, 'LOGIN_FAILED', 'Login failed: User not found - ezira@itpark.et	', '{\"username\":\"ezira@itpark.et\\t\",\"reason\":\"user_not_found\",\"timestamp\":\"2025-12-11T06:59:33.851Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2025-12-11 06:59:33'),
(32, NULL, 'LOGIN_FAILED', 'Login failed: User not found - ezira@itpark.et	', '{\"username\":\"ezira@itpark.et\\t\",\"reason\":\"user_not_found\",\"timestamp\":\"2025-12-11T07:01:41.113Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2025-12-11 07:01:41'),
(34, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":2,\"login_time\":\"2025-12-11T07:03:41.268Z\",\"timestamp\":\"2025-12-11T07:03:41.268Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2025-12-11 07:03:41'),
(35, 40, 'LOGOUT', 'User ezira@itpark.et logged out', '{\"user_id\":\"40\",\"username\":\"ezira@itpark.et\",\"employee_name\":\"Ezira\",\"logout_time\":\"2025-12-11T07:31:41.356Z\",\"timestamp\":\"2025-12-11T07:31:41.356Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/40\",\"method\":\"PUT\"}', '2025-12-11 07:31:41'),
(36, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":2,\"login_time\":\"2025-12-11T07:32:02.241Z\",\"timestamp\":\"2025-12-11T07:32:02.241Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2025-12-11 07:32:02'),
(37, 40, 'LOGOUT', 'User ezira@itpark.et logged out', '{\"user_id\":\"40\",\"username\":\"ezira@itpark.et\",\"employee_name\":\"Ezira\",\"logout_time\":\"2025-12-11T12:36:39.925Z\",\"timestamp\":\"2025-12-11T12:36:39.934Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/40\",\"method\":\"PUT\"}', '2025-12-11 12:36:39'),
(38, NULL, 'LOGIN_FAILED', 'Login failed: User not found - olana@itpark.et', '{\"username\":\"olana@itpark.et\",\"reason\":\"user_not_found\",\"timestamp\":\"2025-12-11T12:37:02.426Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2025-12-11 12:37:02'),
(39, 25, 'LOGIN', 'User olana@itp.et logged in successfully', '{\"username\":\"olana@itp.et\",\"user_id\":25,\"role_id\":2,\"employee_id\":72,\"employee_name\":\"Olana\",\"department_id\":2,\"login_time\":\"2025-12-11T12:37:22.382Z\",\"timestamp\":\"2025-12-11T12:37:22.382Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2025-12-11 12:37:22'),
(41, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":2,\"login_time\":\"2025-12-15T06:57:34.876Z\",\"timestamp\":\"2025-12-15T06:57:34.876Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2025-12-15 06:57:34'),
(42, NULL, 'UPDATE_ROLE', 'Updated role: IT Directorate', '{\"role_id\":\"5\",\"role_name\":\"IT Directorate\",\"status\":1}', '2025-12-16 11:14:42'),
(43, NULL, 'UPDATE_ROLE', 'Updated role: CEO', '{\"role_id\":\"29\",\"role_name\":\"CEO\",\"status\":1}', '2025-12-16 11:14:58'),
(44, NULL, 'CREATE_ROLE', 'Created role: Construction Directorate', '{\"role_id\":30,\"role_name\":\"Construction Directorate\"}', '2025-12-16 11:15:48'),
(45, NULL, 'CREATE_ROLE', 'Created role: Corporation Directorate', '{\"role_id\":31,\"role_name\":\"Corporation Directorate\"}', '2025-12-16 11:16:18'),
(46, NULL, 'UPDATE_ROLE', 'Updated role: Department Head', '{\"role_id\":\"6\",\"role_name\":\"Department Head\",\"status\":1}', '2025-12-16 11:17:00'),
(47, NULL, 'UPDATE_ROLE', 'Updated role: Section Head', '{\"role_id\":\"7\",\"role_name\":\"Section Head\",\"status\":1}', '2025-12-16 11:17:20'),
(48, NULL, 'CREATE_ROLE', 'Created role: Strategic Advisor', '{\"role_id\":32,\"role_name\":\"Strategic Advisor\"}', '2025-12-16 11:18:32'),
(49, 40, 'UPDATE_ROLE', 'Updated role: General manager', '{\"role_id\":\"3\",\"role_name\":\"General manager\",\"hierarchy_level\":12,\"description\":\"General Management\",\"status\":1,\"timestamp\":\"2025-12-16T12:06:26.253Z\",\"ip_address\":null,\"user_agent\":null,\"endpoint\":null,\"method\":null}', '2025-12-16 12:06:26'),
(50, 40, 'LOGOUT', 'User ezira@itpark.et logged out', '{\"user_id\":\"40\",\"username\":\"ezira@itpark.et\",\"employee_name\":\"Ezira\",\"logout_time\":\"2025-12-16T12:18:46.276Z\",\"timestamp\":\"2025-12-16T12:18:46.276Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/40\",\"method\":\"PUT\"}', '2025-12-16 12:18:46'),
(51, 40, 'LOGIN_FAILED', 'Login failed: Invalid credentials or inactive account for ezira@itpark.et', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"reason\":\"invalid_password\",\"user_status\":\"1\",\"timestamp\":\"2025-12-16T12:18:58.794Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2025-12-16 12:18:58'),
(52, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":2,\"login_time\":\"2025-12-16T12:19:11.043Z\",\"timestamp\":\"2025-12-16T12:19:11.043Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2025-12-16 12:19:11'),
(53, 40, 'LOGOUT', 'User ezira@itpark.et logged out', '{\"user_id\":\"40\",\"username\":\"ezira@itpark.et\",\"employee_name\":\"Ezira\",\"logout_time\":\"2025-12-16T12:23:08.056Z\",\"timestamp\":\"2025-12-16T12:23:08.056Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/40\",\"method\":\"PUT\"}', '2025-12-16 12:23:08'),
(54, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":2,\"login_time\":\"2025-12-16T12:23:23.678Z\",\"timestamp\":\"2025-12-16T12:23:23.678Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2025-12-16 12:23:23'),
(55, 40, 'LOGOUT', 'User ezira@itpark.et logged out', '{\"user_id\":\"40\",\"username\":\"ezira@itpark.et\",\"employee_name\":\"Ezira\",\"logout_time\":\"2025-12-16T12:23:33.480Z\",\"timestamp\":\"2025-12-16T12:23:33.480Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/40\",\"method\":\"PUT\"}', '2025-12-16 12:23:33'),
(56, 25, 'LOGOUT', 'User olana@itp.et logged out', '{\"user_id\":\"25\",\"username\":\"olana@itp.et\",\"employee_name\":\"Olana\",\"logout_time\":\"2025-12-16T12:24:15.417Z\",\"timestamp\":\"2025-12-16T12:24:15.417Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/25\",\"method\":\"PUT\"}', '2025-12-16 12:24:15'),
(57, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":2,\"login_time\":\"2025-12-16T12:24:28.248Z\",\"timestamp\":\"2025-12-16T12:24:28.248Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2025-12-16 12:24:28'),
(58, 76, 'LOGIN', 'User hayaltamrat@itp.et logged in successfully', '{\"username\":\"hayaltamrat@itp.et\",\"user_id\":76,\"role_id\":8,\"employee_id\":149,\"employee_name\":\"Hayal Tamrat\",\"department_id\":null,\"login_time\":\"2025-12-16T12:25:38.813Z\",\"timestamp\":\"2025-12-16T12:25:38.813Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2025-12-16 12:25:38'),
(59, 76, 'LOGOUT', 'User hayaltamrat@itp.et logged out', '{\"user_id\":\"76\",\"username\":\"hayaltamrat@itp.et\",\"employee_name\":\"Hayal Tamrat\",\"logout_time\":\"2025-12-16T13:25:48.477Z\",\"timestamp\":\"2025-12-16T13:25:48.478Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/76\",\"method\":\"PUT\"}', '2025-12-16 13:25:48'),
(60, 75, 'LOGIN', 'User softwaresection@itp.et logged in successfully', '{\"username\":\"softwaresection@itp.et\",\"user_id\":75,\"role_id\":7,\"employee_id\":148,\"employee_name\":\"software section\",\"department_id\":18,\"login_time\":\"2025-12-16T13:26:06.635Z\",\"timestamp\":\"2025-12-16T13:26:06.635Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2025-12-16 13:26:06'),
(61, 75, 'LOGOUT', 'User softwaresection@itp.et logged out', '{\"user_id\":\"75\",\"username\":\"softwaresection@itp.et\",\"employee_name\":\"software section\",\"logout_time\":\"2025-12-16T13:30:04.324Z\",\"timestamp\":\"2025-12-16T13:30:04.324Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/75\",\"method\":\"PUT\"}', '2025-12-16 13:30:04'),
(62, 75, 'LOGIN', 'User softwaresection@itp.et logged in successfully', '{\"username\":\"softwaresection@itp.et\",\"user_id\":75,\"role_id\":7,\"employee_id\":148,\"employee_name\":\"software section\",\"department_id\":18,\"login_time\":\"2025-12-16T13:30:23.343Z\",\"timestamp\":\"2025-12-16T13:30:23.343Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2025-12-16 13:30:23'),
(63, 75, 'LOGIN', 'User softwaresection@itp.et logged in successfully', '{\"username\":\"softwaresection@itp.et\",\"user_id\":75,\"role_id\":7,\"employee_id\":148,\"employee_name\":\"software section\",\"department_id\":18,\"login_time\":\"2025-12-16T13:31:41.350Z\",\"timestamp\":\"2025-12-16T13:31:41.350Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2025-12-16 13:31:41'),
(64, 40, 'LOGOUT', 'User ezira@itpark.et logged out', '{\"user_id\":\"40\",\"username\":\"ezira@itpark.et\",\"employee_name\":\"Ezira\",\"logout_time\":\"2025-12-16T13:56:24.138Z\",\"timestamp\":\"2025-12-16T13:56:24.139Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/40\",\"method\":\"PUT\"}', '2025-12-16 13:56:24'),
(65, 78, 'LOGIN', 'User simegnewasme@itp.et logged in successfully', '{\"username\":\"simegnewasme@itp.et\",\"user_id\":78,\"role_id\":7,\"employee_id\":151,\"employee_name\":\"simegnew asme\",\"department_id\":15,\"login_time\":\"2025-12-16T13:56:35.842Z\",\"timestamp\":\"2025-12-16T13:56:35.842Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2025-12-16 13:56:35'),
(66, 78, 'LOGOUT', 'User simegnewasme@itp.et logged out', '{\"user_id\":\"78\",\"username\":\"simegnewasme@itp.et\",\"employee_name\":\"simegnew asme\",\"logout_time\":\"2025-12-16T13:56:45.687Z\",\"timestamp\":\"2025-12-16T13:56:45.687Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/78\",\"method\":\"PUT\"}', '2025-12-16 13:56:45'),
(67, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":2,\"login_time\":\"2025-12-16T13:56:52.940Z\",\"timestamp\":\"2025-12-16T13:56:52.940Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2025-12-16 13:56:52'),
(68, 40, 'LOGOUT', 'User ezira@itpark.et logged out', '{\"user_id\":\"40\",\"username\":\"ezira@itpark.et\",\"employee_name\":\"Ezira\",\"logout_time\":\"2025-12-16T13:57:09.857Z\",\"timestamp\":\"2025-12-16T13:57:09.857Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/40\",\"method\":\"PUT\"}', '2025-12-16 13:57:09'),
(69, 73, 'LOGIN', 'User tsehayu@itp.et logged in successfully', '{\"username\":\"tsehayu@itp.et\",\"user_id\":73,\"role_id\":5,\"employee_id\":146,\"employee_name\":\"tsuhayu directorate\",\"department_id\":11,\"login_time\":\"2025-12-16T13:57:16.277Z\",\"timestamp\":\"2025-12-16T13:57:16.278Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2025-12-16 13:57:16'),
(70, 73, 'LOGOUT', 'User tsehayu@itp.et logged out', '{\"user_id\":\"73\",\"username\":\"tsehayu@itp.et\",\"employee_name\":\"tsuhayu directorate\",\"logout_time\":\"2025-12-16T13:57:21.751Z\",\"timestamp\":\"2025-12-16T13:57:21.751Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/73\",\"method\":\"PUT\"}', '2025-12-16 13:57:21'),
(71, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":2,\"login_time\":\"2025-12-16T13:57:25.912Z\",\"timestamp\":\"2025-12-16T13:57:25.912Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2025-12-16 13:57:25'),
(72, 40, 'LOGOUT', 'User ezira@itpark.et logged out', '{\"user_id\":\"40\",\"username\":\"ezira@itpark.et\",\"employee_name\":\"Ezira\",\"logout_time\":\"2025-12-16T13:59:17.017Z\",\"timestamp\":\"2025-12-16T13:59:17.017Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/40\",\"method\":\"PUT\"}', '2025-12-16 13:59:17'),
(73, 73, 'LOGIN', 'User tsehayu@itp.et logged in successfully', '{\"username\":\"tsehayu@itp.et\",\"user_id\":73,\"role_id\":5,\"employee_id\":146,\"employee_name\":\"tsuhayu directorate\",\"department_id\":11,\"login_time\":\"2025-12-16T13:59:23.584Z\",\"timestamp\":\"2025-12-16T13:59:23.584Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2025-12-16 13:59:23'),
(74, 75, 'LOGOUT', 'User softwaresection@itp.et logged out', '{\"user_id\":\"75\",\"username\":\"softwaresection@itp.et\",\"employee_name\":\"software section\",\"logout_time\":\"2025-12-16T13:59:36.353Z\",\"timestamp\":\"2025-12-16T13:59:36.353Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/75\",\"method\":\"PUT\"}', '2025-12-16 13:59:36'),
(75, 73, 'LOGIN', 'User tsehayu@itp.et logged in successfully', '{\"username\":\"tsehayu@itp.et\",\"user_id\":73,\"role_id\":5,\"employee_id\":146,\"employee_name\":\"tsuhayu directorate\",\"department_id\":11,\"login_time\":\"2025-12-16T13:59:46.022Z\",\"timestamp\":\"2025-12-16T13:59:46.023Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2025-12-16 13:59:46'),
(76, 73, 'LOGOUT', 'User tsehayu@itp.et logged out', '{\"user_id\":\"73\",\"username\":\"tsehayu@itp.et\",\"employee_name\":\"tsuhayu directorate\",\"logout_time\":\"2025-12-16T14:00:49.592Z\",\"timestamp\":\"2025-12-16T14:00:49.592Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/73\",\"method\":\"PUT\"}', '2025-12-16 14:00:49'),
(77, 70, 'LOGIN', 'User olanaabebe@itp.et logged in successfully', '{\"username\":\"olanaabebe@itp.et\",\"user_id\":70,\"role_id\":2,\"employee_id\":143,\"employee_name\":\"olana abebe\",\"department_id\":10,\"login_time\":\"2025-12-16T14:01:05.707Z\",\"timestamp\":\"2025-12-16T14:01:05.707Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2025-12-16 14:01:05'),
(78, 70, 'LOGOUT', 'User olanaabebe@itp.et logged out', '{\"user_id\":\"70\",\"username\":\"olanaabebe@itp.et\",\"employee_name\":\"olana abebe\",\"logout_time\":\"2025-12-16T18:35:29.921Z\",\"timestamp\":\"2025-12-16T18:35:29.921Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/70\",\"method\":\"PUT\"}', '2025-12-16 18:35:29'),
(79, 78, 'LOGIN', 'User simegnewasme@itp.et logged in successfully', '{\"username\":\"simegnewasme@itp.et\",\"user_id\":78,\"role_id\":7,\"employee_id\":151,\"employee_name\":\"simegnew asme\",\"department_id\":15,\"login_time\":\"2025-12-16T18:36:09.895Z\",\"timestamp\":\"2025-12-16T18:36:09.896Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2025-12-16 18:36:09'),
(80, 78, 'LOGOUT', 'User simegnewasme@itp.et logged out', '{\"user_id\":\"78\",\"username\":\"simegnewasme@itp.et\",\"employee_name\":\"simegnew asme\",\"logout_time\":\"2025-12-16T18:37:14.748Z\",\"timestamp\":\"2025-12-16T18:37:14.749Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/78\",\"method\":\"PUT\"}', '2025-12-16 18:37:14'),
(81, 70, 'LOGIN', 'User olanaabebe@itp.et logged in successfully', '{\"username\":\"olanaabebe@itp.et\",\"user_id\":70,\"role_id\":2,\"employee_id\":143,\"employee_name\":\"olana abebe\",\"department_id\":10,\"login_time\":\"2025-12-16T18:37:28.810Z\",\"timestamp\":\"2025-12-16T18:37:28.810Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2025-12-16 18:37:28'),
(82, 70, 'LOGOUT', 'User olanaabebe@itp.et logged out', '{\"user_id\":\"70\",\"username\":\"olanaabebe@itp.et\",\"employee_name\":\"olana abebe\",\"logout_time\":\"2025-12-16T18:37:43.185Z\",\"timestamp\":\"2025-12-16T18:37:43.185Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/70\",\"method\":\"PUT\"}', '2025-12-16 18:37:43'),
(83, 69, 'LOGIN', 'User belete@itp.et logged in successfully', '{\"username\":\"belete@itp.et\",\"user_id\":69,\"role_id\":29,\"employee_id\":142,\"employee_name\":\"belete esubalew\",\"department_id\":null,\"login_time\":\"2025-12-16T18:37:59.400Z\",\"timestamp\":\"2025-12-16T18:37:59.400Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2025-12-16 18:37:59'),
(84, NULL, 'LOGIN_FAILED', 'Login failed: User not found - esubalew@itp.et', '{\"username\":\"esubalew@itp.et\",\"reason\":\"user_not_found\",\"timestamp\":\"2025-12-17T08:39:35.580Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2025-12-17 08:39:35'),
(85, 70, 'LOGIN', 'User olanaabebe@itp.et logged in successfully', '{\"username\":\"olanaabebe@itp.et\",\"user_id\":70,\"role_id\":2,\"employee_id\":143,\"employee_name\":\"olana abebe\",\"department_id\":10,\"login_time\":\"2025-12-17T08:40:21.960Z\",\"timestamp\":\"2025-12-17T08:40:21.960Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2025-12-17 08:40:21'),
(86, 70, 'LOGOUT', 'User olanaabebe@itp.et logged out', '{\"user_id\":\"70\",\"username\":\"olanaabebe@itp.et\",\"employee_name\":\"olana abebe\",\"logout_time\":\"2025-12-17T08:46:29.178Z\",\"timestamp\":\"2025-12-17T08:46:29.179Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/70\",\"method\":\"PUT\"}', '2025-12-17 08:46:29'),
(87, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":2,\"login_time\":\"2025-12-17T08:47:01.874Z\",\"timestamp\":\"2025-12-17T08:47:01.874Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2025-12-17 08:47:01'),
(88, 68, 'LOGOUT', 'User Hayaltamrat1@gmail.com logged out', '{\"user_id\":\"68\",\"username\":\"Hayaltamrat1@gmail.com\",\"employee_name\":\"hayal Tamrat\",\"logout_time\":\"2025-12-17T08:48:51.337Z\",\"timestamp\":\"2025-12-17T08:48:51.337Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/68\",\"method\":\"PUT\"}', '2025-12-17 08:48:51'),
(89, 78, 'LOGIN', 'User simegnewasme@itp.et logged in successfully', '{\"username\":\"simegnewasme@itp.et\",\"user_id\":78,\"role_id\":7,\"employee_id\":151,\"employee_name\":\"simegnew asme\",\"department_id\":15,\"login_time\":\"2025-12-17T08:49:03.525Z\",\"timestamp\":\"2025-12-17T08:49:03.525Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2025-12-17 08:49:03'),
(90, 78, 'LOGOUT', 'User simegnewasme@itp.et logged out', '{\"user_id\":\"78\",\"username\":\"simegnewasme@itp.et\",\"employee_name\":\"simegnew asme\",\"logout_time\":\"2025-12-17T08:49:23.539Z\",\"timestamp\":\"2025-12-17T08:49:23.539Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/78\",\"method\":\"PUT\"}', '2025-12-17 08:49:23'),
(91, 78, 'LOGIN', 'User simegnewasme@itp.et logged in successfully', '{\"username\":\"simegnewasme@itp.et\",\"user_id\":78,\"role_id\":7,\"employee_id\":151,\"employee_name\":\"simegnew asme\",\"department_id\":15,\"login_time\":\"2025-12-17T12:17:15.408Z\",\"timestamp\":\"2025-12-17T12:17:15.418Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2025-12-17 12:17:15'),
(92, NULL, 'LOGIN_FAILED', 'Login failed: User not found - hayal@itp.it', '{\"username\":\"hayal@itp.it\",\"reason\":\"user_not_found\",\"timestamp\":\"2026-02-13T11:50:50.232Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-02-13 11:50:50'),
(93, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":2,\"login_time\":\"2026-02-13T11:51:20.921Z\",\"timestamp\":\"2026-02-13T11:51:20.921Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-02-13 11:51:20'),
(94, NULL, 'LOGIN_FAILED', 'Login failed: User not found - hayalt@itp.it', '{\"username\":\"hayalt@itp.it\",\"reason\":\"user_not_found\",\"timestamp\":\"2026-03-05T06:46:32.648Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-05 06:46:32'),
(95, 76, 'LOGIN', 'User hayaltamrat@itp.et logged in successfully', '{\"username\":\"hayaltamrat@itp.et\",\"user_id\":76,\"role_id\":8,\"employee_id\":149,\"employee_name\":\"Hayal Tamrat\",\"department_id\":18,\"login_time\":\"2026-03-05T06:46:38.402Z\",\"timestamp\":\"2026-03-05T06:46:38.402Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-05 06:46:38'),
(96, 76, 'LOGOUT', 'User hayaltamrat@itp.et logged out', '{\"user_id\":\"76\",\"username\":\"hayaltamrat@itp.et\",\"employee_name\":\"Hayal Tamrat\",\"logout_time\":\"2026-03-05T06:49:18.695Z\",\"timestamp\":\"2026-03-05T06:49:18.695Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/76\",\"method\":\"PUT\"}', '2026-03-05 06:49:18'),
(97, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":2,\"login_time\":\"2026-03-05T06:49:31.288Z\",\"timestamp\":\"2026-03-05T06:49:31.288Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-05 06:49:31'),
(98, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":2,\"login_time\":\"2026-03-06T06:21:29.144Z\",\"timestamp\":\"2026-03-06T06:21:29.144Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-06 06:21:29'),
(99, NULL, 'LOGIN_FAILED', 'Login failed: User not found - nathan27', '{\"username\":\"nathan27\",\"reason\":\"user_not_found\",\"timestamp\":\"2026-03-06T13:33:24.998Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Linux; Android 11; SAMSUNG SM-G980F Build/PPR1.180610.011) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.35 Mobile Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-06 13:33:25'),
(100, NULL, 'LOGIN_FAILED', 'Login failed: User not found - ezira@itpark.et	', '{\"username\":\"ezira@itpark.et\\t\",\"reason\":\"user_not_found\",\"timestamp\":\"2026-03-10T16:34:38.570Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-10 16:34:38'),
(101, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":2,\"login_time\":\"2026-03-10T16:34:44.625Z\",\"timestamp\":\"2026-03-10T16:34:44.626Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-10 16:34:44'),
(102, NULL, 'LOGIN_FAILED', 'Login failed: User not found - ezira@itpark.et	', '{\"username\":\"ezira@itpark.et\\t\",\"reason\":\"user_not_found\",\"timestamp\":\"2026-03-11T05:55:38.877Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-11 05:55:38'),
(103, NULL, 'LOGIN_FAILED', 'Login failed: User not found - ezira@itpark.et	', '{\"username\":\"ezira@itpark.et\\t\",\"reason\":\"user_not_found\",\"timestamp\":\"2026-03-11T05:55:39.950Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-11 05:55:39'),
(104, 25, 'LOGIN', 'User olana@itp.et logged in successfully', '{\"username\":\"olana@itp.et\",\"user_id\":25,\"role_id\":2,\"employee_id\":72,\"employee_name\":\"Olana\",\"department_id\":2,\"login_time\":\"2026-03-11T05:59:12.259Z\",\"timestamp\":\"2026-03-11T05:59:12.259Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-11 05:59:12'),
(105, 69, 'LOGIN_FAILED', 'Login failed: Invalid credentials or inactive account for belete@itp.et', '{\"username\":\"belete@itp.et\",\"user_id\":69,\"reason\":\"invalid_password\",\"user_status\":\"1\",\"timestamp\":\"2026-03-11T11:16:12.305Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-11 11:16:12'),
(106, 69, 'LOGIN_FAILED', 'Login failed: Invalid credentials or inactive account for belete@itp.et', '{\"username\":\"belete@itp.et\",\"user_id\":69,\"reason\":\"invalid_password\",\"user_status\":\"1\",\"timestamp\":\"2026-03-11T11:16:18.340Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-11 11:16:18'),
(107, 25, 'LOGOUT', 'User olana@itp.et logged out', '{\"user_id\":\"25\",\"username\":\"olana@itp.et\",\"employee_name\":\"Olana\",\"logout_time\":\"2026-03-11T11:16:23.015Z\",\"timestamp\":\"2026-03-11T11:16:23.015Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/25\",\"method\":\"PUT\"}', '2026-03-11 11:16:23'),
(108, 69, 'LOGIN', 'User belete@itp.et logged in successfully', '{\"username\":\"belete@itp.et\",\"user_id\":69,\"role_id\":29,\"employee_id\":142,\"employee_name\":\"belete esubalew\",\"department_id\":null,\"login_time\":\"2026-03-11T11:16:34.680Z\",\"timestamp\":\"2026-03-11T11:16:34.680Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-11 11:16:34'),
(109, 25, 'LOGIN_FAILED', 'Login failed: Invalid credentials or inactive account for olana@itp.et', '{\"username\":\"olana@itp.et\",\"user_id\":25,\"reason\":\"invalid_password\",\"user_status\":\"1\",\"timestamp\":\"2026-03-11T11:16:53.345Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-11 11:16:53'),
(110, 69, 'LOGIN_FAILED', 'Login failed: Invalid credentials or inactive account for belete@itp.et', '{\"username\":\"belete@itp.et\",\"user_id\":69,\"reason\":\"invalid_password\",\"user_status\":\"1\",\"timestamp\":\"2026-03-11T11:17:11.148Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-11 11:17:11'),
(111, 69, 'LOGIN', 'User belete@itp.et logged in successfully', '{\"username\":\"belete@itp.et\",\"user_id\":69,\"role_id\":29,\"employee_id\":142,\"employee_name\":\"belete esubalew\",\"department_id\":null,\"login_time\":\"2026-03-11T11:17:28.515Z\",\"timestamp\":\"2026-03-11T11:17:28.515Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-11 11:17:28'),
(112, 69, 'LOGOUT', 'User belete@itp.et logged out', '{\"user_id\":\"69\",\"username\":\"belete@itp.et\",\"employee_name\":\"belete esubalew\",\"logout_time\":\"2026-03-11T11:17:36.776Z\",\"timestamp\":\"2026-03-11T11:17:36.776Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/69\",\"method\":\"PUT\"}', '2026-03-11 11:17:36'),
(113, 25, 'LOGIN', 'User olana@itp.et logged in successfully', '{\"username\":\"olana@itp.et\",\"user_id\":25,\"role_id\":2,\"employee_id\":72,\"employee_name\":\"Olana\",\"department_id\":2,\"login_time\":\"2026-03-11T11:17:41.476Z\",\"timestamp\":\"2026-03-11T11:17:41.476Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-11 11:17:41'),
(114, 69, 'LOGIN', 'User belete@itp.et logged in successfully', '{\"username\":\"belete@itp.et\",\"user_id\":69,\"role_id\":29,\"employee_id\":142,\"employee_name\":\"belete esubalew\",\"department_id\":null,\"login_time\":\"2026-03-11T11:28:57.917Z\",\"timestamp\":\"2026-03-11T11:28:57.917Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-11 11:28:57'),
(115, 69, 'LOGIN', 'User belete@itp.et logged in successfully', '{\"username\":\"belete@itp.et\",\"user_id\":69,\"role_id\":29,\"employee_id\":142,\"employee_name\":\"belete esubalew\",\"department_id\":null,\"login_time\":\"2026-03-11T11:29:44.782Z\",\"timestamp\":\"2026-03-11T11:29:44.782Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-11 11:29:44'),
(116, 25, 'LOGIN', 'User olana@itp.et logged in successfully', '{\"username\":\"olana@itp.et\",\"user_id\":25,\"role_id\":2,\"employee_id\":72,\"employee_name\":\"Olana\",\"department_id\":2,\"login_time\":\"2026-03-11T16:37:51.259Z\",\"timestamp\":\"2026-03-11T16:37:51.259Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-11 16:37:51'),
(117, 40, 'LOGOUT', 'User ezira@itpark.et logged out', '{\"user_id\":\"40\",\"username\":\"ezira@itpark.et\",\"employee_name\":\"Ezira\",\"logout_time\":\"2026-03-13T07:49:15.476Z\",\"timestamp\":\"2026-03-13T07:49:15.477Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/40\",\"method\":\"PUT\"}', '2026-03-13 07:49:15'),
(118, NULL, 'LOGIN_FAILED', 'Login failed: User not found - olana@itpark.et', '{\"username\":\"olana@itpark.et\",\"reason\":\"user_not_found\",\"timestamp\":\"2026-03-13T07:49:26.981Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-13 07:49:26');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `description`, `metadata`, `created_at`) VALUES
(119, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":2,\"login_time\":\"2026-03-13T07:50:15.707Z\",\"timestamp\":\"2026-03-13T07:50:15.707Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-13 07:50:15'),
(120, 40, 'LOGOUT', 'User ezira@itpark.et logged out', '{\"user_id\":\"40\",\"username\":\"ezira@itpark.et\",\"employee_name\":\"Ezira\",\"logout_time\":\"2026-03-16T07:34:48.630Z\",\"timestamp\":\"2026-03-16T07:34:48.630Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/40\",\"method\":\"PUT\"}', '2026-03-16 07:34:48'),
(121, NULL, 'LOGIN_FAILED', 'Login failed: User not found - olana@itpark.et', '{\"username\":\"olana@itpark.et\",\"reason\":\"user_not_found\",\"timestamp\":\"2026-03-16T07:34:55.631Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-16 07:34:55'),
(122, NULL, 'LOGIN_FAILED', 'Login failed: User not found - olana@itc.et', '{\"username\":\"olana@itc.et\",\"reason\":\"user_not_found\",\"timestamp\":\"2026-03-16T07:35:02.646Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-16 07:35:02'),
(123, NULL, 'LOGIN_FAILED', 'Login failed: User not found - olana@itpc.et', '{\"username\":\"olana@itpc.et\",\"reason\":\"user_not_found\",\"timestamp\":\"2026-03-16T07:35:07.296Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-16 07:35:07'),
(124, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":2,\"login_time\":\"2026-03-16T07:35:23.000Z\",\"timestamp\":\"2026-03-16T07:35:23.000Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-16 07:35:23'),
(125, 40, 'LOGOUT', 'User ezira@itpark.et logged out', '{\"user_id\":\"40\",\"username\":\"ezira@itpark.et\",\"employee_name\":\"Ezira\",\"logout_time\":\"2026-03-16T07:35:27.909Z\",\"timestamp\":\"2026-03-16T07:35:27.909Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/40\",\"method\":\"PUT\"}', '2026-03-16 07:35:27'),
(126, NULL, 'LOGIN_FAILED', 'Login failed: User not found - olana@itpark.et', '{\"username\":\"olana@itpark.et\",\"reason\":\"user_not_found\",\"timestamp\":\"2026-03-16T07:35:34.531Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-16 07:35:34'),
(127, 25, 'LOGIN', 'User olana@itp.et logged in successfully', '{\"username\":\"olana@itp.et\",\"user_id\":25,\"role_id\":2,\"employee_id\":72,\"employee_name\":\"Olana\",\"department_id\":2,\"login_time\":\"2026-03-16T07:36:51.811Z\",\"timestamp\":\"2026-03-16T07:36:51.811Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-16 07:36:51');

-- --------------------------------------------------------

--
-- Table structure for table `chat_participants`
--

CREATE TABLE `chat_participants` (
  `participant_id` int(11) NOT NULL,
  `conversation_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `joined_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `last_read_at` timestamp NULL DEFAULT NULL,
  `is_admin` tinyint(1) DEFAULT 0,
  `is_muted` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `chat_participants`
--

INSERT INTO `chat_participants` (`participant_id`, `conversation_id`, `user_id`, `joined_at`, `last_read_at`, `is_admin`, `is_muted`) VALUES
(1, 1, 40, '2025-11-27 12:01:24', '2025-11-27 14:01:50', 1, 0),
(2, 2, 25, '2025-11-27 12:02:29', '2025-11-28 13:28:40', 1, 0),
(3, 3, 40, '2025-11-27 12:10:25', '2025-11-28 09:33:14', 1, 0),
(4, 4, 25, '2025-11-27 12:18:05', '2025-11-27 12:36:20', 1, 0),
(5, 5, 25, '2025-11-27 12:32:21', '2025-11-27 12:37:35', 1, 0),
(6, 5, 48, '2025-11-27 12:32:21', NULL, 0, 0),
(7, 6, 25, '2025-11-27 12:37:35', '2025-11-28 13:27:32', 1, 0),
(8, 6, 24, '2025-11-27 12:37:35', NULL, 0, 0),
(9, 7, 25, '2025-11-27 12:37:52', '2025-11-28 08:31:13', 1, 0),
(10, 7, 55, '2025-11-27 12:37:52', NULL, 0, 0),
(11, 8, 25, '2025-11-27 12:39:14', '2026-03-11 06:01:25', 1, 0),
(12, 8, 40, '2025-11-27 12:39:14', '2026-03-06 08:34:55', 0, 0),
(14, 9, 37, '2025-11-27 12:47:03', NULL, 0, 0),
(15, 3, 25, '2025-11-27 12:50:37', '2025-11-28 13:38:21', 1, 0),
(17, 10, 48, '2025-11-27 12:56:49', NULL, 0, 0),
(18, 10, 13, '2025-11-27 12:57:12', NULL, 1, 0),
(19, 10, 25, '2025-11-27 12:57:21', '2025-11-28 13:10:17', 1, 0),
(20, 11, 40, '2025-11-27 13:08:01', '2025-11-28 09:41:06', 1, 0),
(21, 11, 54, '2025-11-27 13:08:01', NULL, 0, 0),
(22, 10, 40, '2025-11-27 13:15:44', '2026-03-06 08:35:05', 0, 0),
(23, 12, 25, '2025-11-28 08:31:08', '2025-11-28 08:31:10', 1, 0),
(24, 12, 54, '2025-11-28 08:31:08', NULL, 0, 0),
(25, 13, 25, '2025-11-28 08:31:15', '2025-11-28 08:31:15', 1, 0),
(26, 13, 43, '2025-11-28 08:31:15', NULL, 0, 0),
(27, 14, 25, '2025-11-28 08:31:16', '2025-11-28 08:31:20', 1, 0),
(28, 14, 57, '2025-11-28 08:31:16', NULL, 0, 0),
(29, 15, 25, '2025-11-28 09:57:43', '2025-11-29 07:44:22', 1, 0),
(30, 15, 7, '2025-11-28 09:57:43', NULL, 0, 0);

-- --------------------------------------------------------

--
-- Table structure for table `chat_settings`
--

CREATE TABLE `chat_settings` (
  `setting_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `notification_enabled` tinyint(1) DEFAULT 1,
  `sound_enabled` tinyint(1) DEFAULT 1,
  `desktop_notifications` tinyint(1) DEFAULT 1,
  `message_preview` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `conversations`
--

CREATE TABLE `conversations` (
  `conversation_id` int(11) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `conversation_type` enum('direct','group','channel') DEFAULT 'direct',
  `created_by` int(11) DEFAULT NULL,
  `is_archived` tinyint(1) DEFAULT 0,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `conversations`
--

INSERT INTO `conversations` (`conversation_id`, `title`, `conversation_type`, `created_by`, `is_archived`, `updated_at`, `created_at`) VALUES
(1, 'hayal', 'group', 40, 0, '2025-11-27 13:36:20', '2025-11-27 12:01:24'),
(2, 'olana', 'group', 25, 0, '2025-11-28 11:55:54', '2025-11-27 12:02:29'),
(3, 'test', 'group', 40, 0, '2025-11-28 09:31:39', '2025-11-27 12:10:25'),
(4, 'test1', 'group', 25, 0, '2025-11-27 12:18:05', '2025-11-27 12:18:05'),
(5, 'DM_25_48', 'direct', 25, 0, '2025-11-27 12:37:27', '2025-11-27 12:32:21'),
(6, 'DM_25_24', 'direct', 25, 0, '2025-11-27 12:38:15', '2025-11-27 12:37:35'),
(7, 'DM_25_55', 'direct', 25, 0, '2025-11-27 12:37:59', '2025-11-27 12:37:52'),
(8, 'DM_25_40', 'direct', 25, 0, '2025-11-28 13:46:15', '2025-11-27 12:39:14'),
(9, 'it goup', 'group', 25, 0, '2025-11-27 12:45:52', '2025-11-27 12:40:02'),
(10, 'it staff', 'group', 40, 0, '2025-11-28 09:34:31', '2025-11-27 12:56:07'),
(11, 'DM_40_54', 'direct', 40, 0, '2025-11-27 13:08:01', '2025-11-27 13:08:01'),
(12, 'DM_25_54', 'direct', 25, 0, '2025-11-28 08:31:08', '2025-11-28 08:31:08'),
(13, 'DM_25_43', 'direct', 25, 0, '2025-11-28 08:31:15', '2025-11-28 08:31:15'),
(14, 'DM_25_57', 'direct', 25, 0, '2025-11-28 08:31:16', '2025-11-28 08:31:16'),
(15, 'DM_25_7', 'direct', 25, 0, '2025-11-28 13:38:44', '2025-11-28 09:57:43');

-- --------------------------------------------------------

--
-- Table structure for table `cost`
--

CREATE TABLE `cost` (
  `cost_id` bigint(20) UNSIGNED NOT NULL,
  `cost_name` varchar(255) NOT NULL,
  `cost_type` varchar(100) NOT NULL,
  `exchange` decimal(15,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `departments`
--

CREATE TABLE `departments` (
  `department_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `departments`
--

INSERT INTO `departments` (`department_id`, `name`) VALUES
(1, 'አካውንቲንግ እና ፋይናንስ'),
(2, 'ኢንፎርሜሽን ቴክኖሎጂ ልማት'),
(3, 'ኮንስትራክሽን'),
(4, 'ኦዲት'),
(5, 'ቢዝነስ ዴቨሎፕመንት'),
(6, 'ህግ'),
(10, 'Deputy CEO'),
(11, 'IT Directorate'),
(14, 'Digital Service and Infrastructure Devevelopment'),
(15, 'Reaserch Section '),
(16, 'Encubation Section '),
(17, 'Network and Infrastructure '),
(18, 'Software development');

-- --------------------------------------------------------

--
-- Table structure for table `employees`
--

CREATE TABLE `employees` (
  `employee_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `role_id` int(11) DEFAULT NULL,
  `department_id` int(11) DEFAULT NULL,
  `supervisor_id` int(11) DEFAULT NULL,
  `fname` varchar(255) DEFAULT NULL,
  `lname` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `sex` enum('M','F') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `employees`
--

INSERT INTO `employees` (`employee_id`, `name`, `role_id`, `department_id`, `supervisor_id`, `fname`, `lname`, `email`, `phone`, `sex`) VALUES
(47, 'admin admin', 1, 2, 1, 'admin', 'admin', 'admin@email.com', '123-456-7890', 'M'),
(49, 'senayt', 3, 2, 73, 'senayt', 'Brihan', 'senayt@itp.et', '0933499093', 'M'),
(50, 'Smegnew', 5, 2, 49, 'Smegnew', 'Asemie', 'simegn@itp.org', '099000000', 'M'),
(58, 'nebyat', 6, 17, 147, 'Nebyat', 'Tsegabirhan', 'nebyat@itp.et', '0900000000', 'F'),
(71, 'admin', 1, 2, 72, 'admin', 'admin', 'adminadmin@itp.et', '09373773333', 'M'),
(72, 'Olana', 2, 2, NULL, 'olana', 'olana', 'olana@itp.et', '09373773333', 'M'),
(73, 'Getachew', 9, NULL, 72, 'Getachew', 'Atinte', 'getachew@itp.et', '09373773333', 'M'),
(74, 'Habtam', 6, 1, 73, 'Habtamua', 'kebede', 'habtam@itp.et', '0933499097', 'F'),
(76, 'Ermiyas', 5, 3, 49, 'Ermias', 'Ketema', 'ermiyas@itp.et', '090000000', 'M'),
(77, 'Walelign', 6, 3, 76, 'Walelign', 'Abateneh', 'walelign@itp.et', '0988883388', 'M'),
(103, 'Getachew Atinte', 9, NULL, 72, 'Atinte', 'Getachew', 'getachew@itpark.et', '0911000000', 'M'),
(104, 'Merso Gobena', 6, 2, 50, 'Merso', 'Gobena', 'merso@itpark.et', '090000000', 'M'),
(106, 'Eskedar Teshager', 6, 2, 50, 'Eskedar ', 'Teshager', 'eskedar@itpark.et', '0911000000', 'F'),
(107, 'Samuel Medihn', 8, 2, 72, 'Samuel ', 'medhn', 'samuel@itpark.et', '091100000', 'M'),
(108, 'Yesuf Fanta', 8, 2, 104, 'Yesuf', 'Fenta', 'yesuf@itpark.et', '0900000000', 'M'),
(109, 'Ezira', 1, 2, 72, 'Ezira', 'Mantegaftot', 'ezira@itpark.et', '091100000', 'M'),
(110, 'Yosef Kinfe', 8, 1, 74, 'Yosef', 'Kinfe', 'yosef@itpark.et', '0900000000', 'M'),
(111, 'Sintayew', 8, 1, 74, 'Sintayew ', 'Mogese', 'sintayew@itpark.et', '0900000000', 'F'),
(112, 'Arega', 8, 1, 74, 'Arega', 'Asalifew', 'arega@itpark.et', '0900000000', 'M'),
(113, 'Birtukan', 8, 1, 74, 'Birtukan', 'Gemechu', 'birtukan@itpark.et', '0900000000', 'F'),
(114, 'Sisaynesh', 8, 1, 74, 'Sisaynesh ', 'Gizaw', 'sisaynesh@itpark.et', '0900000000', 'F'),
(115, 'Yetemegn', 8, 1, 74, 'Yetemegn', 'Andarge', 'yetemegn@itpark.et', '0900000000', 'F'),
(116, 'Erimias Ketema', 5, 3, 49, 'Ermias ', 'Keteme', 'ermiasketeme@itpark.et', '0916000000', 'M'),
(117, 'Hayal Tamrat', 8, 2, 58, 'Hayal', 'Tamrat', 'hayal@itpark.et', '0916048977', 'M'),
(118, 'Desta Bekele', 6, 3, 116, 'Desta', 'Bekele', 'desta@itpark.et', '0911000000', 'M'),
(119, 'Sintayehu Tesfaye', 8, 3, 118, 'Sintayehu', 'Tesfaye', 'sintayehu@itpark.et', '0910000000', 'M'),
(120, 'Kasu Adare', 8, 3, 118, 'Kasu ', 'Adare', 'kasu@itpark.et', '0910000000', 'M'),
(122, 'Wonde Suleman', 8, 3, 118, 'Wonde', 'Suleman', 'wonde@itpark.et', '0910000000', 'M'),
(123, 'Eyasu Yeshitila', 8, 3, 118, 'Eyasu', 'Yeshitila', 'eyasu@itpark.et', '0910000000', 'M'),
(125, 'Alemayehu Deresa', 8, 3, 118, 'Alemayehu', 'Deresa', 'alemayehu@itpark.et', '0910000000', 'M'),
(126, 'Amanuel Girma', 8, 3, 77, 'Amanual', 'Girma', 'amanuelgirma@itpark.et', '0911000000', 'M'),
(128, 'Mihretu Debebe', 8, 3, 116, 'Mihretu', 'Debebe', 'mihretu@itpark.et', '0910000000', 'M'),
(129, 'Birhanu Legese', 8, 3, 116, 'Birhanu', 'Legese', 'birhanu@itpark.et', '0910000000', 'M'),
(130, 'Melat Bezu', 8, 3, 77, 'Melat', 'Bezu', 'melatbezu@itpark.et', '0911000000', 'F'),
(131, 'Teshale', 8, 1, 74, 'Teshale ', 'Mola', 'teshale@itpark.et', '0900000000', 'M'),
(132, 'Getahun', 8, 1, 74, 'Getahun', 'Faji', 'getahun@itpark.et', '0900000000', 'M'),
(133, 'Gelana', 8, 1, 74, 'Gelana', 'Olana', 'gelana@itpark.et', '0900000000', 'M'),
(134, 'Tsehay', 8, 1, 74, 'Tsehay', 'Alemu', 'tsehay@itpark.et', '0900000000', 'F'),
(135, 'Lemlem', 8, 1, 74, 'Lemlem', 'Degefe', 'lemlem@itpark.et', '0900000000', 'F'),
(136, 'Walelign Abera', 8, 4, 103, 'Walelign', 'Abera', 'walelign@itpark.et', '0900000000', 'M'),
(137, 'Fetane Aage', 8, 5, 103, 'Fetane', 'Arage', 'fetane@itpark.et', '0900000000', 'M'),
(138, 'Petros', 8, 6, 103, 'Petros', 'Abraham', 'petros@itpark.et', '0900000000', 'M'),
(139, 'hayal Tamrat', 8, 2, 72, 'hayal', 'Tamrat', 'hayaltamrat@gmail.com', '0916048978', 'M'),
(141, 'hayal Tamrat', 7, 2, 58, 'hayal', 'Tamrat', 'Hayaltamrat1@gmail.com', '0916048977', 'M'),
(142, 'belete esubalew', 29, NULL, NULL, 'belete', 'esubalew', 'belete@itp.et', '0913566735', 'M'),
(143, 'olana abebe', 2, 10, 142, 'olana', 'abebe', 'olanaabebe@itp.et', '0913566735', 'M'),
(144, 'walelgn abera', 30, NULL, 143, 'walelgn', 'abera', 'walelgnabera@itp.et', '0913566735', 'M'),
(145, 'corporate admin', 31, NULL, 143, 'corporate', 'admin', 'coporateadmin@itp.et', '0913566735', 'M'),
(146, 'tsuhayu directorate', 5, 11, 143, 'tsuhayu', 'directorate', 'tsehayu@itp.et', '0913566735', 'M'),
(147, 'it deparment', 6, 14, 146, 'it', 'deparment', 'itdepartment@itp.et', '0913566735', 'M'),
(148, 'software section', 7, 18, 147, 'software', 'section', 'softwaresection@itp.et', '0913566735', 'F'),
(149, 'Hayal Tamrat', 8, 18, 148, 'Hayal', 'Tamrat', 'hayaltamrat@itp.et', '0913566735', 'M'),
(150, 'ecubation department', 6, 16, 146, 'ecubation', 'department', 'encubationdepartment@itp.et', '0913566735', 'M'),
(151, 'simegnew asme', 7, 15, 150, 'simegnew', 'asme', 'simegnewasme@itp.et', '0916048977', 'M');

-- --------------------------------------------------------

--
-- Table structure for table `forwarded_messages`
--

CREATE TABLE `forwarded_messages` (
  `forward_id` int(11) NOT NULL,
  `original_message_id` int(11) NOT NULL,
  `forwarded_message_id` int(11) NOT NULL,
  `forwarded_by` int(11) NOT NULL,
  `forwarded_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `forwarded_messages`
--

INSERT INTO `forwarded_messages` (`forward_id`, `original_message_id`, `forwarded_message_id`, `forwarded_by`, `forwarded_at`) VALUES
(1, 5, 8, 25, '2025-11-27 12:45:38'),
(2, 5, 9, 25, '2025-11-27 12:45:42'),
(3, 12, 14, 25, '2025-11-27 13:02:10'),
(4, 12, 15, 25, '2025-11-27 13:02:13'),
(5, 12, 16, 25, '2025-11-27 13:02:17'),
(6, 12, 17, 25, '2025-11-27 13:02:18'),
(7, 7, 24, 40, '2025-11-27 13:35:56'),
(8, 18, 30, 40, '2025-11-27 14:02:34'),
(9, 81, 83, 25, '2025-11-28 13:39:40');

-- --------------------------------------------------------

--
-- Table structure for table `goals`
--

CREATE TABLE `goals` (
  `goal_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_by` int(11) DEFAULT NULL,
  `year` int(11) DEFAULT NULL,
  `quarter` varchar(2) DEFAULT NULL,
  `employee_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `goals`
--

INSERT INTO `goals` (`goal_id`, `user_id`, `name`, `description`, `created_at`, `updated_at`, `created_by`, `year`, `quarter`, `employee_id`) VALUES
(87, 26, 'ግብ 1. የIT ካምፓኒዎችን ወደ ፓርኩ በመሳብ የሥራ ዕድልና የውጭ ቀጥተኛ ኢንቨስትመንት መፍጠር', 'የIT ካምፓኒዎችን ወደ ፓርኩ በመሳብ የሥራ ዕድልና የውጭ ቀጥተኛ ኢንቨስትመንት መፍጠር', '2025-03-12 04:36:46', '2025-04-16 03:39:28', NULL, 2017, '3', 73),
(88, 26, 'ግብ 2. የፓርኩ ነዋሪዎች (የአይቲ ካምፓኒዎች) ቴክኖልጂ እንዲያሸጋግሩ እና ምርታቸውን ወይም አገሌግልታቸውን ለውጪ ገበያ በማቅረብ የውጭ ምንዛሪ እንዱያስገኙ ማዴረግ', 'የፓርኩ ነዋሪዎች (የአይቲ ካምፓኒዎች) ቴክኖልጂ እንዲያሸጋግሩ እና ምርታቸውን ወይም አገሌግልታቸውን ለውጪ ገበያ በማቅረብ የውጭ ምንዛሪ እንዱያስገኙ ማዴረግ', '2025-03-12 04:44:06', '2025-04-16 03:39:33', NULL, 2017, '3', 73),
(89, 26, 'ግብ 3. ለደንበኞች  ደረጃውን የጠበቀ አገልግልት ማቅረብ ', 'የፓርኩ ነዋሪዎች (የአይቲ ካምፓኒዎች) ቴክኖልጂ እንዲያሸጋግሩ እና ምርታቸውን ወይም አገሌግልታቸውን ለውጪ ገበያ በማቅረብ የውጭ ምንዛሪ እንዱያስገኙ ማዴረግ', '2025-03-12 04:52:17', '2025-04-16 03:39:36', NULL, 2017, '3', 73),
(90, 26, 'ግብ 4. በIT ኢንደስትሪ የተሰማሩ ካምፓኒዎችን ለመሳብ የሚያስችል ዓለም አቀፍ ደረጃ የጠበቀ መሰረተ -ልማትና ፋሲሉቲ ሟሟላት/ማደስ ', 'በIT ኢንደስትሪ የተሰማሩ ካምፓኒዎችን ለመሳብ የሚያስችል ዓለም አቀፍ ደረጃ የጠበቀ መሰረተ -ልማትና ፋሲሉቲ ሟሟላት/ማደስ ', '2025-03-13 04:35:15', '2025-04-16 03:39:40', NULL, 2017, '3', 73),
(91, 26, 'ግብ 5. የሥራ አመራር፣ የገቢ አሰባበሰብ፣ የሀብት አስተዳደር እና አጠቃቀም ተግባራትንና አቅሞችን አጠናክሮ ማስቀጠል ', 'የሥራ አመራር፣ የገቢ አሰባበሰብ፣ የሀብት አስተዳደር እና አጠቃቀም ተግባራትንና አቅሞችን አጠናክሮ ማስቀጠል', '2025-03-13 04:37:15', '2025-04-16 03:39:44', NULL, 2017, '3', 73),
(94, 40, 'test goal', 'test goal', '2025-12-11 02:33:31', '2025-12-11 02:33:31', NULL, 2025, '1', 109),
(95, 40, 'my test', 'my test', '2025-12-11 03:19:32', '2026-03-10 11:01:19', NULL, 2019, '1', 109),
(96, 40, 'my test 2', 'my test 2', '2026-03-10 11:02:09', '2026-03-10 11:02:09', NULL, 2018, '3', 109);

-- --------------------------------------------------------

--
-- Table structure for table `income`
--

CREATE TABLE `income` (
  `income_id` bigint(20) UNSIGNED NOT NULL,
  `income_name` varchar(255) NOT NULL,
  `income_type` varchar(100) NOT NULL,
  `income_exchange_dollar` decimal(15,2) DEFAULT NULL,
  `income_exchange_etb` decimal(15,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `meetings`
--

CREATE TABLE `meetings` (
  `meeting_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `meeting_type` enum('one-on-one','team','department','company-wide','client','other') DEFAULT 'team',
  `start_time` datetime NOT NULL,
  `end_time` datetime NOT NULL,
  `location` varchar(255) DEFAULT NULL,
  `meeting_link` varchar(500) DEFAULT NULL,
  `zoom_meeting_id` varchar(255) DEFAULT NULL,
  `zoom_passcode` varchar(100) DEFAULT NULL,
  `status` enum('scheduled','in-progress','completed','cancelled','rescheduled') DEFAULT 'scheduled',
  `priority` enum('low','medium','high','urgent') DEFAULT 'medium',
  `is_recurring` tinyint(1) DEFAULT 0,
  `recurrence_pattern` varchar(100) DEFAULT NULL,
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `reminder_sent` tinyint(1) DEFAULT 0,
  `agenda` text DEFAULT NULL,
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `meetings`
--

INSERT INTO `meetings` (`meeting_id`, `title`, `description`, `meeting_type`, `start_time`, `end_time`, `location`, `meeting_link`, `zoom_meeting_id`, `zoom_passcode`, `status`, `priority`, `is_recurring`, `recurrence_pattern`, `created_by`, `created_at`, `updated_at`, `reminder_sent`, `agenda`, `notes`) VALUES
(1, 'test', 'fas', 'team', '2025-11-28 09:04:00', '2025-11-28 09:04:00', 'here', '', NULL, NULL, 'cancelled', 'high', 0, '', 40, '2025-11-28 14:04:37', '2025-11-28 14:05:24', 0, 'test ', NULL),
(2, 'w', 'weere', 'department', '2025-11-28 21:12:00', '2025-11-28 10:07:00', '', '', NULL, NULL, 'completed', 'high', 0, '', 40, '2025-11-28 14:08:19', '2025-11-28 18:29:15', 0, 'sas', '\nSummary: the meeting is ended'),
(3, 'test', 'test meeting', 'company-wide', '2025-11-29 12:22:00', '2025-11-29 18:25:00', '', '', NULL, NULL, 'cancelled', 'urgent', 0, '', 25, '2025-11-28 16:14:11', '2025-11-28 17:28:53', 0, 'about someting', '\nPostponed: tets'),
(4, 'test 0', 'hayal', 'department', '2025-11-28 12:51:00', '2025-11-28 18:51:00', '', '', '', '', 'rescheduled', 'medium', 0, '', 25, '2025-11-28 17:31:42', '2025-11-28 17:46:02', 0, 'any thing', '\nPostponed: nothing\nPostponed: ytuasdias'),
(5, 'hayal', 'test', 'team', '2025-12-06 03:10:00', '2025-11-29 09:12:00', 'smart room', '', '', '', 'scheduled', 'medium', 0, '', 40, '2025-11-29 08:07:14', '2025-11-29 08:07:14', 0, 'nothing to say', NULL),
(6, 'Test Meeting - Email Notification Test', 'This is an automated test to verify email notifications', 'team', '2025-11-30 03:11:59', '2025-11-30 04:11:59', 'Conference Room A', 'https://zoom.us/j/test123456', '123 456 789', 'test123', 'scheduled', 'medium', 0, NULL, 6, '2025-11-29 08:11:59', '2025-11-29 08:11:59', 0, 'Test agenda for email verification', NULL),
(7, 'qwe', 'weqweqwe', 'department', '2025-11-29 03:18:00', '2025-11-29 03:19:00', '', '', '', '', 'scheduled', 'medium', 0, '', 25, '2025-11-29 08:14:28', '2025-11-29 08:14:28', 0, 'eqweqwe', NULL),
(8, 'Test Meeting - Email Notification Test', 'This is an automated test to verify email notifications', 'team', '2025-11-30 03:22:13', '2025-11-30 04:22:13', 'Conference Room A', 'https://zoom.us/j/test123456', '123 456 789', 'test123', 'scheduled', 'medium', 0, NULL, 6, '2025-11-29 08:22:13', '2025-11-29 08:22:13', 0, 'Test agenda for email verification', NULL),
(9, 'wqqq', '', 'team', '2025-12-06 03:29:00', '2026-02-19 03:31:00', '', '', '', '', 'scheduled', 'medium', 0, '', 40, '2025-11-29 08:31:56', '2025-11-29 08:31:56', 0, '', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `meeting_attachments`
--

CREATE TABLE `meeting_attachments` (
  `attachment_id` int(11) NOT NULL,
  `meeting_id` int(11) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_type` varchar(50) DEFAULT NULL,
  `file_size` bigint(20) DEFAULT NULL,
  `uploaded_by` int(11) NOT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `meeting_attachments`
--

INSERT INTO `meeting_attachments` (`attachment_id`, `meeting_id`, `file_name`, `file_path`, `file_type`, `file_size`, `uploaded_by`, `uploaded_at`) VALUES
(1, 5, 'Screenshot From 2025-09-07 06-26-16.png', 'uploads/meeting_attachments/attachments-1764403634570-427323425.png', 'image/png', 150378, 40, '2025-11-29 08:07:14'),
(2, 7, 'power.jpg', 'uploads/meeting_attachments/attachments-1764404068410-26135534.jpg', 'image/jpeg', 482302, 25, '2025-11-29 08:14:28');

-- --------------------------------------------------------

--
-- Table structure for table `meeting_minutes`
--

CREATE TABLE `meeting_minutes` (
  `minute_id` int(11) NOT NULL,
  `meeting_id` int(11) NOT NULL,
  `content` text NOT NULL,
  `action_items` text DEFAULT NULL,
  `decisions` text DEFAULT NULL,
  `next_steps` text DEFAULT NULL,
  `recorded_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `meeting_minutes`
--

INSERT INTO `meeting_minutes` (`minute_id`, `meeting_id`, `content`, `action_items`, `decisions`, `next_steps`, `recorded_by`, `created_at`, `updated_at`) VALUES
(1, 2, 'the meeting is ended', '', NULL, NULL, 40, '2025-11-28 18:29:15', '2025-11-28 18:29:15');

-- --------------------------------------------------------

--
-- Table structure for table `meeting_participants`
--

CREATE TABLE `meeting_participants` (
  `participant_id` int(11) NOT NULL,
  `meeting_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `role` enum('organizer','required','optional') DEFAULT 'required',
  `response_status` enum('pending','accepted','declined','tentative') DEFAULT 'pending',
  `attended` tinyint(1) DEFAULT 0,
  `email_sent` tinyint(1) DEFAULT 0,
  `reminder_sent` tinyint(1) DEFAULT 0,
  `joined_at` datetime DEFAULT NULL,
  `left_at` datetime DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `meeting_participants`
--

INSERT INTO `meeting_participants` (`participant_id`, `meeting_id`, `user_id`, `role`, `response_status`, `attended`, `email_sent`, `reminder_sent`, `joined_at`, `left_at`, `notes`, `created_at`) VALUES
(1, 1, 40, 'organizer', 'accepted', 0, 0, 0, NULL, NULL, NULL, '2025-11-28 14:04:37'),
(2, 1, 24, 'required', 'pending', 0, 0, 0, NULL, NULL, NULL, '2025-11-28 14:04:37'),
(3, 1, 26, 'required', 'pending', 0, 0, 0, NULL, NULL, NULL, '2025-11-28 14:04:37'),
(4, 1, 49, 'required', 'pending', 0, 0, 0, NULL, NULL, NULL, '2025-11-28 14:04:37'),
(5, 1, 54, 'required', 'pending', 0, 0, 0, NULL, NULL, NULL, '2025-11-28 14:04:37'),
(6, 1, 55, 'required', 'pending', 0, 0, 0, NULL, NULL, NULL, '2025-11-28 14:04:37'),
(7, 1, 44, 'required', 'pending', 0, 0, 0, NULL, NULL, NULL, '2025-11-28 14:04:37'),
(8, 1, 57, 'required', 'pending', 0, 0, 0, NULL, NULL, NULL, '2025-11-28 14:04:37'),
(9, 1, 13, 'required', 'pending', 0, 0, 0, NULL, NULL, NULL, '2025-11-28 14:04:37'),
(10, 2, 40, 'organizer', 'accepted', 0, 0, 0, NULL, NULL, NULL, '2025-11-28 14:08:19'),
(11, 2, 24, 'required', 'pending', 0, 0, 0, NULL, NULL, NULL, '2025-11-28 14:08:19'),
(12, 2, 37, 'required', 'pending', 0, 0, 0, NULL, NULL, NULL, '2025-11-28 14:08:19'),
(13, 2, 25, 'required', 'accepted', 0, 0, 0, NULL, NULL, NULL, '2025-11-28 14:08:19'),
(14, 3, 25, 'organizer', 'accepted', 0, 0, 0, NULL, NULL, NULL, '2025-11-28 16:14:11'),
(15, 3, 24, 'required', 'pending', 0, 0, 0, NULL, NULL, NULL, '2025-11-28 16:14:11'),
(16, 3, 7, 'required', 'pending', 0, 0, 0, NULL, NULL, NULL, '2025-11-28 16:14:11'),
(17, 3, 40, 'required', 'accepted', 0, 0, 0, NULL, NULL, NULL, '2025-11-28 16:14:11'),
(18, 4, 25, 'organizer', 'accepted', 0, 0, 0, NULL, NULL, NULL, '2025-11-28 17:31:42'),
(19, 4, 67, 'required', 'pending', 0, 0, 0, NULL, NULL, NULL, '2025-11-28 17:31:42'),
(20, 4, 40, 'required', 'accepted', 0, 0, 0, NULL, NULL, NULL, '2025-11-28 17:31:42'),
(21, 5, 40, 'organizer', 'accepted', 0, 0, 0, NULL, NULL, NULL, '2025-11-29 08:07:14'),
(22, 5, 25, 'required', 'pending', 0, 0, 0, NULL, NULL, NULL, '2025-11-29 08:07:14'),
(23, 5, 38, 'required', 'pending', 0, 0, 0, NULL, NULL, NULL, '2025-11-29 08:07:14'),
(24, 5, 13, 'required', 'pending', 0, 0, 0, NULL, NULL, NULL, '2025-11-29 08:07:14'),
(25, 5, 24, 'required', 'pending', 0, 0, 0, NULL, NULL, NULL, '2025-11-29 08:07:14'),
(26, 6, 6, 'organizer', 'accepted', 0, 0, 0, NULL, NULL, NULL, '2025-11-29 08:11:59'),
(27, 6, 7, 'required', 'pending', 0, 1, 0, NULL, NULL, NULL, '2025-11-29 08:11:59'),
(28, 6, 13, 'required', 'pending', 0, 1, 0, NULL, NULL, NULL, '2025-11-29 08:11:59'),
(29, 6, 24, 'required', 'pending', 0, 1, 0, NULL, NULL, NULL, '2025-11-29 08:11:59'),
(30, 7, 25, 'organizer', 'accepted', 0, 0, 0, NULL, NULL, NULL, '2025-11-29 08:14:28'),
(31, 7, 24, 'required', 'pending', 0, 0, 0, NULL, NULL, NULL, '2025-11-29 08:14:28'),
(32, 7, 40, 'required', 'pending', 0, 0, 0, NULL, NULL, NULL, '2025-11-29 08:14:28'),
(33, 7, 26, 'required', 'pending', 0, 0, 0, NULL, NULL, NULL, '2025-11-29 08:14:28'),
(34, 7, 60, 'required', 'pending', 0, 0, 0, NULL, NULL, NULL, '2025-11-29 08:14:28'),
(35, 8, 6, 'organizer', 'accepted', 0, 0, 0, NULL, NULL, NULL, '2025-11-29 08:22:13'),
(36, 8, 7, 'required', 'pending', 0, 1, 0, NULL, NULL, NULL, '2025-11-29 08:22:13'),
(37, 8, 13, 'required', 'pending', 0, 1, 0, NULL, NULL, NULL, '2025-11-29 08:22:13'),
(38, 8, 24, 'required', 'pending', 0, 1, 0, NULL, NULL, NULL, '2025-11-29 08:22:13'),
(39, 9, 40, 'organizer', 'accepted', 0, 0, 0, NULL, NULL, NULL, '2025-11-29 08:31:56'),
(40, 9, 24, 'required', 'pending', 0, 1, 0, NULL, NULL, NULL, '2025-11-29 08:31:56'),
(41, 9, 43, 'required', 'pending', 0, 1, 0, NULL, NULL, NULL, '2025-11-29 08:31:56'),
(42, 9, 25, 'required', 'pending', 0, 1, 0, NULL, NULL, NULL, '2025-11-29 08:31:56');

-- --------------------------------------------------------

--
-- Table structure for table `meeting_reminders`
--

CREATE TABLE `meeting_reminders` (
  `reminder_id` int(11) NOT NULL,
  `meeting_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `reminder_time` datetime NOT NULL,
  `reminder_type` enum('email','notification','both') DEFAULT 'both',
  `sent` tinyint(1) DEFAULT 0,
  `sent_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `menu_items`
--

CREATE TABLE `menu_items` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `path` varchar(255) NOT NULL,
  `icon` varchar(50) NOT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `sort_order` int(11) DEFAULT 0,
  `file_name` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `menu_items`
--

INSERT INTO `menu_items` (`id`, `name`, `path`, `icon`, `parent_id`, `sort_order`, `file_name`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Dashboard', '/', 'bi-speedometer2', NULL, 1, NULL, 1, '2025-08-12 09:45:03', '2025-11-29 09:20:20'),
(2, 'User Management', '#', 'bi-people', NULL, 2, NULL, 1, '2025-08-12 09:45:03', '2025-08-12 09:45:03'),
(3, 'Add Employee', '/EmployeeForm', 'bi-person-plus', 2, 1, NULL, 1, '2025-08-12 09:45:03', '2025-08-12 09:45:03'),
(4, 'Manage Accounts', '/UserTable', 'bi-table', 2, 2, NULL, 1, '2025-08-12 09:45:03', '2025-08-12 09:45:03'),
(5, 'User Registration', '/UserForm', 'bi-person-add', 2, 3, NULL, 1, '2025-08-12 09:45:03', '2025-08-12 09:45:03'),
(6, 'Reports', '#', 'bi-file-earmark-text', NULL, 3, NULL, 1, '2025-08-12 09:45:03', '2025-08-12 09:45:03'),
(7, 'Analytics', '/reports/analytics', 'bi-graph-up', 6, 1, NULL, 1, '2025-08-12 09:45:03', '2025-08-12 09:45:03'),
(8, 'Export Data', '/reports/export', 'bi-download', 6, 2, NULL, 1, '2025-08-12 09:45:03', '2025-08-12 09:45:03'),
(9, 'Planning & Strategy', '#', 'bi-diagram-3', NULL, 4, NULL, 1, '2025-08-12 09:45:03', '2025-08-12 09:45:03'),
(10, 'Strategy Plans', '/Stategy-plan/View', 'bi-clipboard-check', 9, 1, NULL, 1, '2025-08-12 09:45:03', '2025-12-11 08:49:16'),
(11, 'add plan', '/plan/PlanSteps/Add', 'bi-bullseye', 9, 2, 'StafPlanSteps.jsx', 0, '2025-08-12 09:45:03', '2025-08-13 11:36:42'),
(12, 'Objectives', '/objectives', 'bi-target', 9, 3, NULL, 1, '2025-08-12 09:45:03', '2025-08-12 09:45:03'),
(13, 'Main Dashboard', '/ceo/dashboard', 'bi-building', NULL, 5, NULL, 1, '2025-08-12 09:45:03', '2025-12-16 12:21:40'),
(14, 'Organization Plans', '/ceo/plans', 'bi-diagram-2', 13, 1, NULL, 1, '2025-08-12 09:45:03', '2025-08-12 09:45:03'),
(15, 'Strategic Reports', '/ceo/reports', 'bi-file-earmark-bar-graph', 13, 2, NULL, 1, '2025-08-12 09:45:03', '2025-08-12 09:45:03'),
(16, 'Team Management', '#', 'bi-people-fill', NULL, 6, NULL, 1, '2025-08-12 09:45:03', '2025-08-12 09:45:03'),
(17, 'Team Dashboard', '/team/dashboard', 'bi-kanban', 16, 1, NULL, 1, '2025-08-12 09:45:03', '2025-08-12 09:45:03'),
(18, 'Team Plans', '/team/plans', 'bi-list-check', 16, 2, NULL, 1, '2025-08-12 09:45:03', '2025-08-12 09:45:03'),
(19, 'Team Reports', '/team/reports', 'bi-clipboard-data', 16, 3, NULL, 1, '2025-08-12 09:45:03', '2025-08-12 09:45:03'),
(20, 'My Workspace', '#', 'bi-person-workspace', NULL, 7, NULL, 1, '2025-08-12 09:45:03', '2025-08-12 09:45:03'),
(21, 'My Plans', '/staff/plans', 'bi-journal-check', 20, 1, NULL, 1, '2025-08-12 09:45:03', '2025-08-12 09:45:03'),
(22, 'My Reports', '/staff/reports', 'bi-journal-text', 20, 2, NULL, 1, '2025-08-12 09:45:03', '2025-08-12 09:45:03'),
(23, 'My Tasks', '/staff/tasks', 'bi-check2-square', 20, 3, NULL, 1, '2025-08-12 09:45:03', '2025-08-12 09:45:03'),
(24, 'System Administration', '#', 'bi-gear-fill', NULL, 8, NULL, 1, '2025-08-12 09:45:03', '2025-08-12 09:45:03'),
(25, 'Settings', '/settings', 'bi-gear', 24, 1, NULL, 1, '2025-08-12 09:45:03', '2025-08-12 09:45:03'),
(26, 'Menu Permissions', '/menu-permissions', 'bi-shield-lock', 24, 2, NULL, 1, '2025-08-12 09:45:03', '2025-08-12 09:45:03'),
(27, 'System Logs', '/admin/logs', 'bi-file-text', 24, 3, NULL, 1, '2025-08-12 09:45:03', '2025-08-12 09:45:03'),
(28, 'Backup & Restore', '/admin/backup', 'bi-cloud-arrow-up', 24, 4, NULL, 1, '2025-08-12 09:45:03', '2025-08-12 09:45:03'),
(29, 'Profile', '/ProfilePictureUpload', 'bi-person-circle', NULL, 9, NULL, 1, '2025-08-12 09:45:03', '2025-08-12 09:45:03'),
(30, 'Communication', '#', 'bi-chat-dots', NULL, 10, NULL, 1, '2025-08-12 09:45:03', '2025-08-12 09:45:03'),
(31, 'Messages', '/messages', 'bi-envelope', 30, 1, NULL, 1, '2025-08-12 09:45:03', '2025-08-12 09:45:03'),
(32, 'Notifications', '/notifications', 'bi-bell', 30, 2, NULL, 1, '2025-08-12 09:45:03', '2025-08-12 09:45:03'),
(33, 'Finance & Resources', '#', 'bi-currency-dollar', NULL, 11, NULL, 1, '2025-08-12 09:45:03', '2025-08-12 09:45:03'),
(34, 'Budget Planning', '/finance/budget', 'bi-calculator', 33, 1, NULL, 1, '2025-08-12 09:45:03', '2025-08-12 09:45:03'),
(35, 'Resource Allocation', '/finance/resources', 'bi-pie-chart', 33, 2, NULL, 1, '2025-08-12 09:45:03', '2025-08-12 09:45:03'),
(36, 'Help & Support', '#', 'bi-question-circle', NULL, 12, NULL, 1, '2025-08-12 09:45:03', '2025-08-12 09:45:03'),
(37, 'Documentation', '/help/docs', 'bi-book', 36, 1, NULL, 1, '2025-08-12 09:45:03', '2025-08-12 09:45:03'),
(38, 'Support Tickets', '/help/tickets', 'bi-headset', 36, 2, NULL, 1, '2025-08-12 09:45:03', '2025-08-12 09:45:03'),
(40, 'Plan Managment', '/admin', 'bi-file-earmark-text', NULL, 1, 'UserManagement.jsx', 1, '2025-08-12 12:44:57', '2025-12-16 12:20:49'),
(41, 'CEO View Submitted Plan', '/plan/View', 'bi-shield-lock', 40, 1, 'UserManagement.jsx', 0, '2025-08-12 12:54:13', '2025-08-13 11:22:44'),
(42, 'CEO Plan', './', 'bi-file-earmark-text', NULL, 2, NULL, 0, '2025-08-12 13:41:19', '2025-08-12 19:03:29'),
(43, 'Report', './', 'bi-activity', NULL, 1, NULL, 1, '2025-08-12 13:46:59', '2025-12-16 12:21:22'),
(44, 'CEO view submitted plan', '../plan/View', 'bi-activity', 40, 1, 'CeoSubmittedViewPlan.jsx', 0, '2025-08-12 13:56:53', '2025-08-13 12:08:27'),
(45, 'My Plan Managment', './', 'bi-file-earmark-text', NULL, 4, NULL, 1, '2025-08-12 14:00:41', '2025-12-16 12:22:47'),
(46, 'Add Report', '/report/Add', 'bi-activity', 6, 2, 'StaffAddReport.jsx', 0, '2025-08-12 14:02:38', '2025-08-13 13:07:34'),
(47, 'Add Report', '/plan/view/add-report/', 'bi-file-plus', 6, 3, 'StafAddReport.jsx', 0, '2025-08-12 17:57:39', '2025-08-14 18:45:58'),
(48, 'Admin Dashboard ', '/admin/dashboard-analytics', 'bi-house', NULL, 2, 'AdminDashboard.jsx', 1, '2025-08-12 19:08:35', '2025-11-29 10:05:45'),
(49, 'CEO View Submitted Plan', '/plan/View', 'bi-gear', 40, 1, 'CeoSubmittedViewPlan.jsx', 0, '2025-08-13 11:14:34', '2025-08-13 11:19:22'),
(50, 'Ceo viewe submitted plans', '/plan/View', 'bi-gear', 40, 1, 'CeoSubmittedViewPlan', 0, '2025-08-13 11:41:23', '2025-08-13 11:43:04'),
(51, 'Organization Plan ', '/plan/ViewOrgPlan', 'bi-file-earmark-text', NULL, 1, 'CeoViewOrgPlan.jsx', 1, '2025-08-13 12:24:12', '2025-08-13 12:24:12'),
(52, 'Organization Report', '/report/ViewOrgReport', 'bi-file-earmark-text', NULL, 1, 'CeoViewOrgReport.jsx', 1, '2025-08-13 12:26:57', '2025-08-13 12:26:57'),
(53, 'Ceo View Declined Report', '/report/CeoViewDeclinedReport', 'bi-file-earmark-text', 43, 1, 'CeoViewDeclinedReport.jsx', 0, '2025-08-13 12:30:26', '2025-08-13 12:33:20'),
(54, 'View declined report', '/report/CeoViewDeclinedReport', 'bi-file-earmark-text', 43, 1, 'CeoViewDeclinedReport', 1, '2025-08-13 12:37:11', '2025-12-16 12:21:08'),
(55, 'Incoming Plans', '/plan/View', '', 40, 1, 'CeoSubmittedViewPlan.jsx', 1, '2025-08-13 12:40:32', '2025-12-16 12:20:38'),
(56, 'View Declined Plan', '/plan/CeoViewDeclinedPlan', 'bi-file-earmark-text', NULL, 1, 'CeoViewDeclinedPlan.jsx', 1, '2025-08-13 12:44:34', '2025-08-13 12:44:34'),
(57, 'My report', '/report/View_myreport', 'bi-file-earmark-text', 6, 1, 'CeoViewReport.jsx', 1, '2025-08-13 12:52:45', '2025-08-13 12:52:45'),
(58, 'View submitted report', '/report/Viewapprovedreport', '', 6, 1, 'TeamleaderSubmittedViewReport.jsx', 1, '2025-08-13 13:04:31', '2025-08-13 13:04:31'),
(59, 'add plan', '/plan/PlanSteps/Add', '', 45, 1, 'StafPlanSteps.jsx', 1, '2025-08-13 13:08:42', '2025-08-13 13:08:42'),
(60, 'View my plan', '/plan/View_myplan', '', 45, 1, 'StaffViewPlan.jsx', 1, '2025-08-13 17:27:37', '2025-08-13 17:27:37'),
(61, 'add report', '/plan/view/add-report/:planId', 'bi-file-earmark-text', 6, 1, 'StafAddReport.jsx', 0, '2025-08-14 03:32:48', '2025-08-14 03:38:13'),
(62, 'add report', '/plan/view/add-report/', 'bi-file-earmark-text', 6, 1, 'StafAddReport.jsx', 0, '2025-08-14 18:53:30', '2025-08-14 19:01:28'),
(63, 'AddReport', '/plan/view/add-report/', '', NULL, 1, 'StafAddReport.jsx', 0, '2025-08-14 19:05:20', '2025-08-14 19:07:41'),
(64, 'resreved Dashboard', '/ceo/dashboard', 'bi-house', NULL, 1, 'CeoDashboard.jsx', 1, '2025-08-14 19:28:06', '2025-11-29 10:05:18'),
(65, 'declined-plan ', '/plan/StaffViewDeclinedPlan', 'bi-file-earmark-text', 45, 3, 'StaffViewDeclinedPlan.jsx', 1, '2025-08-18 12:28:58', '2025-08-18 12:28:58'),
(66, 'Submitted Reports', '/report/Viewapprovedreport', 'bi-file-earmark-text', 6, 2, 'TeamleaderSubmittedViewReport.jsx', 1, '2025-08-18 13:14:21', '2025-08-18 13:14:21'),
(67, 'approved plan', '/plan/View_myplan', 'bi-file-earmark-text', 40, 2, 'StaffViewPlan.jsx', 1, '2025-08-18 17:57:06', '2025-08-18 17:57:06'),
(68, 'add report ', '/plan/view/add-report/:planId', '', 6, 4, 'StafAddReport.jsx', 1, '2025-08-19 05:48:57', '2025-08-19 05:48:57'),
(69, 'Organization Structure', '/admin/org-structure', 'bi bi-diagram-3', NULL, 99, NULL, 1, '2025-12-15 13:18:47', '2025-12-15 13:18:47');

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `message_id` int(11) NOT NULL,
  `conversation_id` int(11) DEFAULT NULL,
  `sender_id` int(11) NOT NULL,
  `receiver_id` int(11) DEFAULT NULL,
  `content` text NOT NULL,
  `message_type` enum('text','image','file','system') DEFAULT 'text',
  `file_path` varchar(500) DEFAULT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `is_edited` tinyint(1) DEFAULT 0,
  `edited_at` timestamp NULL DEFAULT NULL,
  `is_deleted` tinyint(1) DEFAULT 0,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `parent_message_id` int(11) DEFAULT NULL,
  `reaction_count` int(11) DEFAULT 0,
  `sent_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `messages`
--

INSERT INTO `messages` (`message_id`, `conversation_id`, `sender_id`, `receiver_id`, `content`, `message_type`, `file_path`, `file_name`, `is_edited`, `edited_at`, `is_deleted`, `deleted_at`, `parent_message_id`, `reaction_count`, `sent_at`) VALUES
(1, 2, 25, NULL, 'hello', 'text', NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-27 12:02:36'),
(2, 5, 25, NULL, 'hello', 'text', NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-27 12:37:27'),
(3, 7, 25, NULL, 'ato aman', 'text', NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-27 12:37:59'),
(4, 6, 25, NULL, 'ato ezira', 'text', NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-27 12:38:15'),
(5, 8, 25, NULL, 'ee sewye', 'text', NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-27 12:39:19'),
(6, 8, 40, NULL, 'selam aleka', 'text', NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-27 12:39:33'),
(7, 8, 25, NULL, 'qq', 'text', NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-27 12:45:21'),
(8, 9, 25, NULL, '[Forwarded] ee sewye', 'text', NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-27 12:45:38'),
(9, 9, 25, NULL, '[Forwarded] ee sewye', 'text', NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-27 12:45:42'),
(10, 9, 25, NULL, '@null ', 'text', NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-27 12:45:52'),
(11, 8, 25, NULL, '@null dasda', 'text', NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-27 12:46:08'),
(12, 10, 25, NULL, 'hello', 'text', NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-27 12:57:48'),
(13, 10, 25, NULL, 'ehh', 'text', NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-27 12:58:30'),
(14, 8, 25, NULL, '[Forwarded] hello', 'text', NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-27 13:02:10'),
(15, 8, 25, NULL, '[Forwarded] hello', 'text', NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-27 13:02:13'),
(16, 8, 25, NULL, '[Forwarded] hello', 'text', NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-27 13:02:17'),
(17, 8, 25, NULL, '[Forwarded] hello', 'text', NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-27 13:02:18'),
(18, 10, 25, NULL, 'test', 'text', NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-27 13:13:45'),
(19, 10, 40, NULL, 'test replay', 'text', NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-27 13:14:07'),
(20, 10, 25, NULL, '@Olana I thinh it is good', 'text', NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-27 13:28:12'),
(21, 8, 40, NULL, 'hello sir', 'text', NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-27 13:29:25'),
(22, 8, 40, NULL, 'hello sir', 'text', NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-27 13:29:28'),
(23, 8, 40, NULL, 'hello', 'text', NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-27 13:29:50'),
(24, 1, 40, NULL, '[Forwarded] qq', 'text', NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-27 13:35:56'),
(25, 1, 40, NULL, 'asd', 'text', NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-27 13:36:20'),
(26, 8, 40, NULL, 'enya', 'text', NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-27 13:41:23'),
(27, 10, 40, NULL, 'beseb', 'text', NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-27 13:42:01'),
(28, 10, 40, NULL, '@Ezira eeh', 'text', NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-27 14:00:53'),
(29, 10, 40, NULL, 'baya', 'text', NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-27 14:01:06'),
(30, 8, 40, NULL, '[Forwarded] test', 'text', NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-27 14:02:34'),
(31, 3, 25, NULL, 'endet aderk ezira', 'text', NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 08:21:12'),
(32, 8, 25, NULL, 'dena aderk ezira', 'text', NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 08:21:46'),
(33, 10, 25, NULL, '??', 'text', NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 08:37:30'),
(34, 3, 40, NULL, 'hello', 'text', NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 08:46:51'),
(35, 3, 40, NULL, 'ymesgen', 'text', NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 08:51:23'),
(36, 10, 40, NULL, 'as', 'text', NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 09:01:52'),
(37, 10, 40, NULL, 'ds', 'text', NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 09:11:08'),
(38, 10, 40, NULL, 'belew', 'text', NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 09:11:22'),
(39, 10, 40, NULL, 'dadad', 'text', NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 09:11:59'),
(40, 3, 40, NULL, 'sa', 'text', NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 09:18:18'),
(41, 3, 40, NULL, 'oriya', 'text', NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 09:31:39'),
(42, 10, 40, NULL, 'dadad', 'text', NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 09:34:22'),
(43, 10, 40, NULL, 'das', 'text', NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 09:34:23'),
(44, 10, 40, NULL, 'dasdas', 'text', NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 09:34:23'),
(45, 10, 40, NULL, 'd', 'text', NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 09:34:24'),
(46, 10, 40, NULL, 'd', 'text', NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 09:34:25'),
(47, 10, 40, NULL, 'ddas', 'text', NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 09:34:25'),
(48, 10, 40, NULL, 'ddasdasd', 'text', NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 09:34:25'),
(49, 10, 40, NULL, 'dass', 'text', NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 09:34:26'),
(50, 10, 40, NULL, 'dad', 'text', NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 09:34:26'),
(51, 10, 40, NULL, 'dadasd', 'text', NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 09:34:26'),
(52, 10, 40, NULL, 'dadasdasdas', 'text', NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 09:34:27'),
(53, 10, 40, NULL, 'assd', 'text', NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 09:34:27'),
(54, 10, 40, NULL, 'assdasd', 'text', NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 09:34:28'),
(55, 10, 40, NULL, 'da', 'text', NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 09:34:28'),
(56, 10, 40, NULL, 'dadas', 'text', NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 09:34:28'),
(57, 10, 40, NULL, 'dsa', 'text', NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 09:34:29'),
(58, 10, 40, NULL, 'dsaa', 'text', NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 09:34:30'),
(59, 10, 40, NULL, 'da', 'text', NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 09:34:30'),
(60, 10, 40, NULL, 'a', 'text', NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 09:34:31'),
(61, 10, 40, NULL, 'a', 'text', NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 09:34:31'),
(62, 8, 40, NULL, 'l', 'text', NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 09:37:21'),
(63, 8, 40, NULL, '1', 'text', NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 09:41:35'),
(64, 8, 40, NULL, '2', 'text', NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 09:41:39'),
(65, 8, 40, NULL, '23', 'text', NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 09:41:40'),
(66, 8, 40, NULL, '4', 'text', NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 09:41:48'),
(67, 8, 40, NULL, '5', 'text', NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 09:41:49'),
(68, 8, 40, NULL, '6', 'text', NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 09:41:51'),
(69, 8, 40, NULL, '7', 'text', NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 09:41:53'),
(70, 8, 40, NULL, '8', 'text', NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 09:41:54'),
(71, 8, 40, NULL, '9', 'text', NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 09:41:56'),
(72, 8, 40, NULL, '12', 'text', NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 09:41:58'),
(73, 8, 40, NULL, '13', 'text', NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 09:42:00'),
(74, 8, 40, NULL, '14', 'text', NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 09:42:01'),
(75, 8, 40, NULL, '15', 'text', NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 09:42:03'),
(76, 8, 40, NULL, '1', 'text', NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 09:42:04'),
(77, 8, 40, NULL, '1', 'text', NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 09:42:06'),
(78, 8, 40, NULL, 'd', 'text', NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 09:46:44'),
(79, 15, 25, NULL, 'selam', 'text', NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 09:57:54'),
(80, 2, 25, NULL, 'a', 'text', NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 11:55:54'),
(81, 15, 25, NULL, 'power.jpg', 'image', '/uploads/1764337076677-749029094-power.jpg', 'power.jpg', 0, NULL, 0, NULL, NULL, 1, '2025-11-28 13:37:56'),
(82, 15, 25, NULL, 'lonchina.txt', 'file', '/uploads/1764337123988-379555737-lonchina.txt', 'lonchina.txt', 0, NULL, 0, NULL, NULL, 0, '2025-11-28 13:38:44'),
(83, 8, 25, NULL, '[Forwarded] power.jpg', 'image', '/uploads/1764337076677-749029094-power.jpg', 'power.jpg', 0, NULL, 0, NULL, NULL, 1, '2025-11-28 13:39:40'),
(84, 8, 40, NULL, '123 test', 'text', NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 13:45:41'),
(85, 8, 40, NULL, 'test 2', 'text', NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 13:46:15');

-- --------------------------------------------------------

--
-- Table structure for table `message_attachments`
--

CREATE TABLE `message_attachments` (
  `attachment_id` int(11) NOT NULL,
  `message_id` int(11) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_type` varchar(50) NOT NULL,
  `file_size` bigint(20) DEFAULT 0,
  `uploaded_by` int(11) NOT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `message_mentions`
--

CREATE TABLE `message_mentions` (
  `mention_id` int(11) NOT NULL,
  `message_id` int(11) NOT NULL,
  `mentioned_user_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `message_reactions`
--

CREATE TABLE `message_reactions` (
  `reaction_id` int(11) NOT NULL,
  `message_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `emoji` varchar(10) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `message_reactions`
--

INSERT INTO `message_reactions` (`reaction_id`, `message_id`, `user_id`, `emoji`, `created_at`) VALUES
(1, 81, 25, '❤️', '2025-11-28 13:38:00'),
(2, 83, 40, '❤️', '2025-11-28 13:44:10');

-- --------------------------------------------------------

--
-- Table structure for table `message_read_receipts`
--

CREATE TABLE `message_read_receipts` (
  `receipt_id` int(11) NOT NULL,
  `message_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `read_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `message_read_receipts`
--

INSERT INTO `message_read_receipts` (`receipt_id`, `message_id`, `user_id`, `read_at`) VALUES
(1, 5, 40, '2025-11-27 12:39:29'),
(2, 6, 25, '2025-11-27 12:39:34'),
(3, 7, 40, '2025-11-27 12:49:15'),
(4, 11, 40, '2025-11-27 12:49:15'),
(6, 12, 40, '2025-11-27 12:57:50'),
(7, 13, 40, '2025-11-27 12:58:31'),
(8, 18, 40, '2025-11-27 13:13:57'),
(9, 19, 25, '2025-11-27 13:14:08'),
(10, 14, 40, '2025-11-27 13:22:26'),
(11, 15, 40, '2025-11-27 13:22:26'),
(12, 16, 40, '2025-11-27 13:22:26'),
(13, 17, 40, '2025-11-27 13:22:26'),
(17, 21, 25, '2025-11-27 13:30:03'),
(18, 22, 25, '2025-11-27 13:30:03'),
(19, 23, 25, '2025-11-27 13:30:03'),
(20, 20, 40, '2025-11-27 13:41:52'),
(21, 26, 25, '2025-11-27 13:43:24'),
(22, 30, 25, '2025-11-27 14:02:52'),
(23, 27, 25, '2025-11-28 08:37:24'),
(24, 28, 25, '2025-11-28 08:37:24'),
(25, 29, 25, '2025-11-28 08:37:24'),
(26, 33, 40, '2025-11-28 08:46:24'),
(27, 31, 40, '2025-11-28 08:46:30'),
(28, 34, 25, '2025-11-28 08:46:52'),
(29, 32, 40, '2025-11-28 09:21:04'),
(30, 62, 25, '2025-11-28 09:43:50'),
(31, 63, 25, '2025-11-28 09:43:50'),
(32, 64, 25, '2025-11-28 09:43:50'),
(33, 65, 25, '2025-11-28 09:43:50'),
(34, 66, 25, '2025-11-28 09:43:50'),
(35, 67, 25, '2025-11-28 09:43:50'),
(36, 68, 25, '2025-11-28 09:43:50'),
(37, 69, 25, '2025-11-28 09:43:50'),
(38, 70, 25, '2025-11-28 09:43:50'),
(39, 71, 25, '2025-11-28 09:43:50'),
(40, 72, 25, '2025-11-28 09:43:50'),
(41, 73, 25, '2025-11-28 09:43:50'),
(42, 74, 25, '2025-11-28 09:43:50'),
(43, 75, 25, '2025-11-28 09:43:50'),
(44, 76, 25, '2025-11-28 09:43:50'),
(45, 77, 25, '2025-11-28 09:43:50'),
(61, 36, 25, '2025-11-28 09:44:47'),
(62, 37, 25, '2025-11-28 09:44:47'),
(63, 38, 25, '2025-11-28 09:44:47'),
(64, 39, 25, '2025-11-28 09:44:47'),
(65, 42, 25, '2025-11-28 09:44:47'),
(66, 43, 25, '2025-11-28 09:44:47'),
(67, 44, 25, '2025-11-28 09:44:47'),
(68, 45, 25, '2025-11-28 09:44:47'),
(69, 46, 25, '2025-11-28 09:44:47'),
(70, 47, 25, '2025-11-28 09:44:47'),
(71, 48, 25, '2025-11-28 09:44:47'),
(72, 49, 25, '2025-11-28 09:44:47'),
(73, 50, 25, '2025-11-28 09:44:47'),
(74, 51, 25, '2025-11-28 09:44:47'),
(75, 52, 25, '2025-11-28 09:44:47'),
(76, 53, 25, '2025-11-28 09:44:47'),
(77, 54, 25, '2025-11-28 09:44:47'),
(78, 55, 25, '2025-11-28 09:44:47'),
(79, 56, 25, '2025-11-28 09:44:47'),
(80, 57, 25, '2025-11-28 09:44:47'),
(81, 58, 25, '2025-11-28 09:44:47'),
(82, 59, 25, '2025-11-28 09:44:47'),
(83, 60, 25, '2025-11-28 09:44:47'),
(84, 61, 25, '2025-11-28 09:44:47'),
(92, 78, 25, '2025-11-28 09:57:09'),
(93, 35, 25, '2025-11-28 13:38:21'),
(94, 40, 25, '2025-11-28 13:38:21'),
(95, 41, 25, '2025-11-28 13:38:21'),
(96, 83, 40, '2025-11-28 13:39:56'),
(97, 84, 25, '2026-03-11 06:01:25'),
(98, 85, 25, '2026-03-11 06:01:25');

-- --------------------------------------------------------

--
-- Table structure for table `monthly_tasks`
--

CREATE TABLE `monthly_tasks` (
  `monthly_task_id` int(11) NOT NULL,
  `specific_objective_detail_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `weight` decimal(5,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `progress` decimal(5,2) NOT NULL DEFAULT 0.00,
  `status` enum('Pending','In Progress','Completed') NOT NULL DEFAULT 'Pending',
  `description` text DEFAULT NULL,
  `attachment` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `monthly_tasks`
--

INSERT INTO `monthly_tasks` (`monthly_task_id`, `specific_objective_detail_id`, `name`, `weight`, `created_at`, `updated_at`, `progress`, `status`, `description`, `attachment`) VALUES
(1, 795, 'test1 month', 4.00, '2025-12-11 13:24:05', '2025-12-11 13:24:05', 0.00, 'Pending', NULL, NULL),
(2, 795, 'test2 month', 4.00, '2025-12-11 13:24:05', '2025-12-11 13:24:05', 0.00, 'Pending', NULL, NULL),
(3, 795, 'test3 month', 4.00, '2025-12-11 13:24:05', '2025-12-11 13:24:05', 0.00, 'Pending', NULL, NULL),
(4, 782, '1', 1.00, '2025-12-15 07:09:20', '2025-12-15 07:09:20', 0.00, 'Pending', NULL, NULL),
(5, 785, '1', 1.00, '2025-12-15 07:20:28', '2025-12-15 07:20:28', 0.00, 'Pending', NULL, NULL),
(6, 779, '2', 2.00, '2025-12-15 07:21:42', '2025-12-15 08:53:58', 0.00, 'Pending', '1ssfsddsd', NULL),
(7, 797, '10', 10.00, '2025-12-15 08:00:25', '2025-12-15 08:58:26', 100.00, 'Pending', '100', NULL),
(8, 797, '2', 2.00, '2025-12-15 08:00:25', '2025-12-15 08:59:49', 2.00, 'Pending', 'dsasdasdas', '1765788878386-164123216-Screenshot_From_2025-09-07_06-26-16.png'),
(9, 797, '10', 10.00, '2025-12-15 09:08:23', '2025-12-15 09:08:23', 0.00, 'Pending', NULL, NULL),
(10, 797, '2', 2.00, '2025-12-15 09:08:23', '2025-12-15 09:08:23', 0.00, 'Pending', NULL, NULL),
(11, 798, 'm1 ', 12.00, '2025-12-15 11:47:52', '2025-12-15 11:55:40', 12.00, 'Pending', 'something here', '1765799303724-592166953-Screenshot_From_2025-10-25_08-22-05.png'),
(12, 798, 'm2', 12.00, '2025-12-15 11:47:52', '2025-12-15 11:50:19', 12.00, 'Pending', NULL, NULL),
(13, 794, 'test', 100.00, '2025-12-15 12:13:29', '2025-12-15 12:13:39', 100.00, 'Pending', 'sfafasf', NULL),
(22, 800, 'dasds', 3.00, '2025-12-15 12:45:02', '2025-12-15 12:45:40', 100.00, 'Pending', 'ggfgdg', NULL),
(23, 800, 'fsdfs', 3.00, '2025-12-15 12:45:02', '2025-12-15 12:46:32', 55.00, 'Pending', 'fdsf', NULL),
(24, 793, 'month 1', 30.00, '2026-03-06 08:25:30', '2026-03-06 08:26:55', 30.00, 'Pending', NULL, NULL),
(25, 793, 'month 1', 30.00, '2026-03-06 08:29:28', '2026-03-06 08:29:28', 0.00, 'Pending', NULL, NULL),
(26, 793, 'm2', 70.00, '2026-03-06 08:29:28', '2026-03-06 08:29:28', 0.00, 'Pending', NULL, NULL),
(27, 793, 'month 1', 30.00, '2026-03-06 08:29:36', '2026-03-06 08:29:36', 0.00, 'Pending', NULL, NULL),
(28, 793, 'month 1', 30.00, '2026-03-06 08:29:36', '2026-03-06 08:29:36', 0.00, 'Pending', NULL, NULL),
(29, 793, 'm2', 70.00, '2026-03-06 08:29:36', '2026-03-06 08:30:38', 70.00, 'Pending', 'somthing', NULL),
(30, 786, 'tet1', 100.00, '2026-03-06 08:32:52', '2026-03-06 08:33:36', 100.00, 'Pending', 'test', '1772785997904-331430856-qr-code__8_.png');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `notification_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `plan_id` int(11) DEFAULT NULL,
  `type` enum('comment','reply','status_change','deadline_alert','plan_update','meeting','task','message') NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`data`)),
  `is_read` tinyint(1) DEFAULT 0,
  `priority` enum('low','medium','high','urgent') DEFAULT 'medium',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `read_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`notification_id`, `user_id`, `plan_id`, `type`, `title`, `message`, `data`, `is_read`, `priority`, `created_at`, `read_at`, `expires_at`) VALUES
(38, 78, 248, 'deadline_alert', 'Plan Deadline Alert: 3 days remaining', 'Plan \"ግብ 1. የIT ካምፓኒዎችን ወደ ፓርኩ በመሳብ የሥራ ዕድልና የውጭ ቀጥተኛ ኢንቨስትመንት መፍጠር\" deadline is approaching in 3 days. Please review and take necessary action.', '{\"deadline\":\"2026-03-15T21:00:00.000Z\",\"days_until_deadline\":3,\"plan_name\":\"ግብ 1. የIT ካምፓኒዎችን ወደ ፓርኩ በመሳብ የሥራ ዕድልና የውጭ ቀጥተኛ ኢንቨስትመንት መፍጠር\",\"execution_percentage\":0}', 0, 'high', '2026-03-13 07:42:49', NULL, '2026-03-20 07:42:49'),
(39, 78, 248, 'deadline_alert', 'Plan Deadline Passed!', 'Plan \"ግብ 1. የIT ካምፓኒዎችን ወደ ፓርኩ በመሳብ የሥራ ዕድልና የውጭ ቀጥተኛ ኢንቨስትመንት መፍጠር\" deadline has passed. Immediate action required.', '{\"deadline\":\"2026-03-15T21:00:00.000Z\",\"days_until_deadline\":0,\"plan_name\":\"ግብ 1. የIT ካምፓኒዎችን ወደ ፓርኩ በመሳብ የሥራ ዕድልና የውጭ ቀጥተኛ ኢንቨስትመንት መፍጠር\",\"execution_percentage\":0}', 0, 'urgent', '2026-03-16 07:32:49', NULL, '2026-03-23 07:32:49');

-- --------------------------------------------------------

--
-- Table structure for table `objectives`
--

CREATE TABLE `objectives` (
  `objective_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_by` int(11) DEFAULT NULL,
  `year` int(11) DEFAULT NULL,
  `quarter` varchar(2) DEFAULT NULL,
  `employee_id` int(11) NOT NULL,
  `goal_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `objectives`
--

INSERT INTO `objectives` (`objective_id`, `user_id`, `name`, `description`, `created_at`, `updated_at`, `created_by`, `year`, `quarter`, `employee_id`, `goal_id`) VALUES
(113, 26, 'ዓላማ 1.1 የIT ካምፓኒዎችን በመሳብ የተፈጠረ ቀጥተኛና ተጓዳኝ የሥራ ዕዴል ማሳደግ', 'የIT ካምፓኒዎችን በመሳብ የተፈጠረ ቀጥተኛና ተጓዳኝ የሥራ ዕዴል ማሳደግ', '2025-03-12 04:37:52', '2025-04-09 11:19:55', NULL, NULL, NULL, 0, 87),
(114, 26, 'ዓላማ 1.2 የIT ካምፓኒዎችን በመሳብ የተፈጠረ የሀገር ውስጥ እና የውጭ ቀጥተኛ ኢንቨስትመንት (FDI) ማሳደግ ', 'የIT ካምፓኒዎችን በመሳብ የተፈጠረ የሀገር ውስጥ እና የውጭ ቀጥተኛ ኢንቨስትመንት (FDI) ማሳደግ ', '2025-03-12 04:42:33', '2025-04-09 11:20:37', NULL, NULL, NULL, 0, 87),
(115, 26, 'ዓላማ 2.1 የተፈጠረ የቴከኖልጂ ሽግግር ', 'የተፈጠረ የቴከኖልጂ ሽግግር ', '2025-03-12 04:45:27', '2025-03-13 04:17:48', NULL, NULL, NULL, 0, 88),
(116, 26, 'ዓላማ 2.2 ከኤክስፖርት የተገኘ የውጭ ምንዛሪ ማሳደግ', 'ከኤክስፖርት የተገኘ የውጭ ምንዛሪ ማሳደግ', '2025-03-12 04:48:25', '2025-04-09 11:21:02', NULL, NULL, NULL, 0, 88),
(117, 26, 'ዓላማ 2.3 ከተተኪ ምርቶች/አገልግሎት የተገኘ ገቢ ማሳደግ ', 'ከተተኪ ምርቶች/አገልግሎት የተገኘ ገቢ ማሳደግ ', '2025-03-12 04:49:59', '2025-04-09 11:24:52', NULL, NULL, NULL, 0, 88),
(118, 26, 'ዓላማ 3.1 የለማ መሬት በንዑስ ሊዝ የወሰደ ካምፓኒዎችን ብዛት፣ ለካምፓኒዎች አገልግልት የዋለን መሬት ስፋት እና አገሌግልት የተሰጠበትን አማካይ ጊዜ ማሻሻል ', 'የለማ መሬት በንዑስ ሉዝ የወሰደ ካምፓኒዎችን ብዛት፣ የካምፓኒዎች አገሌግልት የዋለን መሬት ስፋት እና አገሌግልት የተሰጠበትን አማካይ ጊዜ ማሻሻሌ የለማ መሬት በንዑስ ሊዝ የወሰደ ካምፓኒዎችን ብዛት፣ ለካምፓኒዎች አገልግልት የዋለን መሬት ስፋት እና አገሌግልት የተሰጠበትን አማካይ ጊዜ ማሻሻል', '2025-03-12 04:54:07', '2025-04-09 11:23:48', NULL, NULL, NULL, 0, 89),
(119, 26, 'ዓላማ 3.2 የመገልገያ ህንጻ ኪራይ የወሰደ ካምፓኒዎችን ብዛት፣ የተከራዮች አገልግሎት የዋለን የቦታ ስፋትና አገሌግልት የተሰጠበትን አማካይ ጊዜ ማሻሻል ', 'የመገልገያ ህንጻ ኪራይ የወሰደ ካምፓኒዎችን ብዛት፣ የተከራዮች አገልግሎት የዋለን የቦታ ስፋትና አገሌግልት የተሰጠበትን አማካይ ጊዜ ማሻሻል ', '2025-03-12 04:59:38', '2025-04-09 11:25:27', NULL, NULL, NULL, 0, 89),
(120, 26, 'ዓላማ 3.3 በስታርትአፕ አክሰለሬሽን እና በኢንኩቤሽን ፕሮግራሞች ተጠቃሚ የሆኑ ካምፓኒዎች ብዛት ማሳደግ ', 'በስታርትአፕ አክሰለሬሽን እና በኢንኩቤሽን ፕሮግራሞች ተጠቃሚ የሆኑ ካምፓኒዎች ብዛት ማሳደግ ', '2025-03-12 05:03:50', '2025-03-12 05:03:50', NULL, NULL, NULL, 0, 89),
(121, 26, 'ዓላማ 3.4 የቢዝነስ ትስስር የማድረግ የተፈጠረ መድረክ (ኩነት)', 'የቢዝነስ ትስስር ሇማዴረግ የተፈጠረ መድረክ (ኩነት)', '2025-03-12 05:06:36', '2025-04-09 11:26:28', NULL, NULL, NULL, 0, 89),
(122, 26, 'ዓላማ 4.1 የአዱስ መሠረተ -ሌማትና ፋሲሉቲ ግንባታ ዲዛይን ማዘጋጀት ', 'የአዱስ መሠረተ -ሌማትና ፋሲሉቲ ግንባታ ዲዛይን ማዘጋጀት ', '2025-03-13 04:35:58', '2025-04-09 11:27:02', NULL, NULL, NULL, 0, 90),
(123, 26, 'ዓሊማ 3.5 ለነዋሪዎች ደረጃውን የጠበቀ አገልግሎት መስጠታቸው የተረጋገጠ የጋራ አገሌግልት መስጫ ፋሲሉቲዎች ', 'ለነዋሪዎች ደረጃውን የጠበቀ አገልግሎት መስጠታቸው የተረጋገጠ የጋራ አገሌግልት መስጫ ፋሲሉቲዎች ', '2025-03-13 04:42:29', '2025-04-09 11:27:36', NULL, NULL, NULL, 0, 89),
(124, 26, 'ዓላማ 3.6 ለነዋሪዎች ብቃት ያለው የሰው ኃይል አቅርቦት (Talent Pool) እንዲኖር ማስቻል', 'ለነዋሪዎች ብቃት ያለው የሰው ኃይል አቅርቦት (Talent Pool) እንዲኖር ማስቻል', '2025-03-13 04:48:45', '2025-04-09 11:28:15', NULL, NULL, NULL, 0, 89),
(125, 26, 'ዓላማ 4.2 ዓለም አቀፍ ደረጃን የጠበቀ አዲስ መሠረተ - ልማትና ፋሲሉቲ መገንባት/ማስፋፋት', 'ዓለም አቀፍ ደረጃን የጠበቀ አዲስ መሠረተ - ልማትና ፋሲሉቲ መገንባት/ማስፋፋት', '2025-03-13 04:58:40', '2025-04-09 11:28:45', NULL, NULL, NULL, 0, 90),
(126, 26, 'ዓላማ 4.3 ቀድሞ የለማ መሠረተ-ልማትና ፋሲልቲ የማደስ ሥራ ማካሄድ', 'ቀድሞ የለማ መሠረተ-ልማትና ፋሲሊቲ የማደስ ሥራ ማካሄድ', '2025-03-13 05:11:16', '2025-04-09 11:37:13', NULL, NULL, NULL, 0, 90),
(127, 26, 'ዓላማ 4.4 የኮርፖሬሽኑን ኢኮ-ቴክኖልጂ ዘሊቂነት ማረጋጋጥ ', 'የኮርፖሬሽኑን ኢኮ-ቴክኖልጂ ዘሊቂነት ማረጋጋጥ ', '2025-03-13 05:17:10', '2025-03-13 05:17:10', NULL, NULL, NULL, 0, 90),
(128, 26, 'ዓላማ 5.1 የኢ.ቴ.ፓ.ኮ. ዓላማ ማሳኪያ አደረጃጀትና የአስተዲደር መመሪያዎችን ማሻሻል፣ የሰው ሀይል ማሟላትና አቅም ማጎሌበት', 'የኢ.ቴ.ፓ.ኮ. ዓላማ ማሳኪያ አደረጃጀትና የአስተዲደር መመሪያዎችን ማሻሻል፣ የሰው ሀይል ማሟላትና አቅም ማጎሌበት', '2025-03-13 05:19:37', '2025-04-09 11:30:46', NULL, NULL, NULL, 0, 91),
(129, 26, 'ዓላማ 5.2 የኮርፖሬሽኑን ገቢ አሰባሰብ እና ፋይናንስ አጠቃቀም አጠናክሮ ማስቀጠል ', 'የኮርፖሬሽኑን ገቢ አሰባሰብ እና ፋይናንስ አጠቃቀም አጠናክሮ ማስቀጠል', '2025-03-13 05:23:48', '2025-04-09 11:31:11', NULL, NULL, NULL, 0, 91),
(130, 26, 'ዓላማ 5.3 የኮርፖሬሽኑ በጀትና ንብረት በአግባቡ ጥቅም ሊይ ስለመዋሉ በውስጥ ኦዱት ማረጋገጥ ', 'የኮርፖሬሽኑ በጀትና ንብረት በአግባቡ ጥቅም ሊይ ስለመዋሉ በውስጥ ኦዱት ማረጋገጥ ', '2025-03-13 05:27:27', '2025-04-09 11:38:12', NULL, NULL, NULL, 0, 91),
(131, 26, 'ዓላማ 5.4 ኮርፖሬሽኑን ንብረት አያያዝና አጠቃቀም ሥራ ማካሄድ ', ' ኮርፖሬሽኑን ንብረት አያያዝና አጠቃቀም ሥራ ማካሄድ', '2025-03-13 05:29:03', '2025-04-09 11:38:43', NULL, NULL, NULL, 0, 91),
(132, 26, 'ዓላማ 5.5 የኮርፖሬሽኑን ሥራ በIT እንዲደገፍ የማዴረግ ሥራ አጠናክሮ ማስቀጠል', 'የኮርፖሬሽኑን ሥራ በIT እንዲደገፍ የማዴረግ ሥራ አጠናክሮ ማስቀጠል', '2025-03-13 05:31:19', '2025-04-09 11:39:19', NULL, NULL, NULL, 0, 91),
(133, 26, 'ዓላማ 5.6 ቢዝነስ ካምፓኒዎችን የመሳብ የፕሮሞሽን ሥራ ማካሄድ', 'ቢዝነስ ካምፓኒዎችን የመሳብ የፕሮሞሽን ሥራ ማካሄድ ', '2025-03-13 05:33:15', '2025-04-09 11:40:15', NULL, NULL, NULL, 0, 91),
(134, 26, 'ዓላማ 5.7 በህግ ጉዲዮች ሊይ የማማከርና የመፈጸም አገሌግልት መስጠት ', 'በህግ ጉዲዮች ሊይ የማማከርና የመፈጸም አገሌግልት መስጠት ', '2025-03-13 05:37:03', '2025-03-13 05:37:03', NULL, NULL, NULL, 0, 91),
(135, 26, 'ዓሊማ 5.8 የኮርፖሬሽኑን ሥራዎች የሚያግዙና የሚያቀላጥፉ ማንዋልችን ማዘጋጀት', 'የኮርፖሬሽኑን ሥራዎች የሚያግዙና የሚያቀልጥፉ ማንዋልችን ማዘጋጀት', '2025-03-13 05:39:25', '2025-04-09 11:41:09', NULL, NULL, NULL, 0, 91),
(136, 26, 'ዓላማ 5.9 ከባለ ድርሻዎች ጋር ስምምነት ማድረግ ', 'ከባለ ድርሻዎች ጋር ስምምነት ማድረግ ', '2025-03-13 05:42:09', '2025-04-09 11:41:37', NULL, NULL, NULL, 0, 91),
(137, 26, 'ዓሊማ 5.10 ተጨማሪ የቢዝነስ እድሎችን ማጥናትና መተግበር ', 'ተጨማሪ የቢዝነስ እድሎችን ማጥናትና መተግበር ', '2025-03-13 05:45:27', '2025-04-09 11:42:41', NULL, NULL, NULL, 0, 91),
(138, 26, 'ዓላማ 5.11 የገቢ ማስገኛ ስራዎችን ከተባባሪዎቸ/ሇጋሽ አካሊት ጋር መስራት ', 'የገቢ ማስገኛ ስራዎችን ከተባባሪዎቸ/ሇጋሽ አካሊት ጋር መስራት ', '2025-03-13 05:48:29', '2025-03-13 05:48:29', NULL, NULL, NULL, 0, 91),
(139, 40, 'test objective', 'test onbjective', '2025-12-11 02:39:51', '2025-12-11 02:39:51', NULL, NULL, NULL, 109, 94),
(140, 40, 'objective test 2', 'objective test 2', '2025-12-11 03:23:32', '2025-12-11 03:23:32', NULL, NULL, NULL, 109, 95),
(141, 40, 'my test', 'my test', '2026-03-10 11:02:33', '2026-03-10 11:02:33', NULL, NULL, NULL, 109, 96);

-- --------------------------------------------------------

--
-- Table structure for table `organization_groups`
--

CREATE TABLE `organization_groups` (
  `group_id` int(11) NOT NULL,
  `conversation_id` int(11) NOT NULL,
  `organization_id` int(11) DEFAULT NULL,
  `department_id` int(11) DEFAULT NULL,
  `group_name` varchar(255) NOT NULL,
  `group_description` text DEFAULT NULL,
  `group_icon` varchar(500) DEFAULT NULL,
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `organization_groups`
--

INSERT INTO `organization_groups` (`group_id`, `conversation_id`, `organization_id`, `department_id`, `group_name`, `group_description`, `group_icon`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 3, NULL, NULL, 'test', 'something', NULL, 40, '2025-11-27 12:10:25', '2025-11-27 12:55:11'),
(2, 4, NULL, NULL, 'test1', 'ets da', NULL, 25, '2025-11-27 12:18:05', '2025-11-27 12:18:05'),
(3, 9, NULL, NULL, 'it goup', 'selamta', NULL, 25, '2025-11-27 12:40:02', '2025-11-27 12:40:02'),
(4, 10, NULL, NULL, 'it staff', 'it group', NULL, 40, '2025-11-27 12:56:07', '2025-11-27 13:15:45');

-- --------------------------------------------------------

--
-- Table structure for table `organization_structure`
--

CREATE TABLE `organization_structure` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `name_amharic` varchar(255) NOT NULL,
  `type` varchar(50) NOT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `level` int(11) DEFAULT 1,
  `description` text DEFAULT NULL,
  `head_employee_id` int(11) DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `organization_structure`
--

INSERT INTO `organization_structure` (`id`, `name`, `name_amharic`, `type`, `parent_id`, `level`, `description`, `head_employee_id`, `status`, `created_at`, `updated_at`) VALUES
(9, 'CEO', 'CEO', 'CEO', NULL, 1, 'CEO', NULL, 'active', '2025-12-16 07:33:36', '2025-12-16 07:33:36'),
(10, 'Deputy CEO', 'Deputy CEO', 'Deputy CEO', 9, 2, 'Deputy CEO', NULL, 'active', '2025-12-16 07:34:14', '2025-12-16 07:34:14'),
(11, 'IT Directorate', 'IT Directorate', 'Directorate', 10, 3, 'IT Directorate', NULL, 'active', '2025-12-16 07:35:17', '2025-12-16 07:35:17'),
(12, 'Constraction  Directorate', 'Constraction  Directorate', 'Directorate', 10, 3, 'Constraction  Directorate', NULL, 'active', '2025-12-16 07:35:45', '2025-12-16 07:35:45'),
(13, 'Inovation and Encubation Department', 'Inovation and Encubation Department', 'Department', 11, 4, 'Inovation and Encubation Department', NULL, 'active', '2025-12-16 07:39:08', '2025-12-16 07:39:08'),
(14, 'Digital Service and Infrastructure Devevelopment', 'Digital Service and Infrastructure Devevelopment', 'Department', 11, 4, 'Digital Service and Infrastructure Devevelopment', NULL, 'active', '2025-12-16 07:40:31', '2025-12-16 07:40:31'),
(15, 'Reaserch Section ', 'Reaserch Section ', 'Section', 13, 5, 'Reaserch Section ', NULL, 'active', '2025-12-16 07:41:09', '2025-12-16 07:41:09'),
(16, 'Encubation Section ', 'Encubation Section ', 'Section', 13, 5, 'Encubation Section ', NULL, 'active', '2025-12-16 07:41:37', '2025-12-16 07:41:37'),
(17, 'Network and Infrastructure ', 'Network and Infrastructure ', 'Section', 14, 5, 'Network and Infrastructure ', NULL, 'active', '2025-12-16 07:42:18', '2025-12-16 07:42:18'),
(18, 'Software development', 'Software development', 'Section', 14, 5, 'Software development', NULL, 'active', '2025-12-16 07:43:06', '2025-12-16 07:43:06'),
(19, 'Ciyber Security ', 'Ciyber Security ', 'Section', 14, 5, 'Ciyber Security ', NULL, 'active', '2025-12-16 07:43:29', '2025-12-16 07:43:29'),
(20, 'Construction and Design ', 'Construction and Design ', 'Department', 12, 4, 'Construction and Design ', NULL, 'active', '2025-12-16 07:45:58', '2025-12-16 07:45:58'),
(21, 'Construction ', 'Construction', 'Section', 20, 5, 'Construction', NULL, 'active', '2025-12-16 07:46:29', '2025-12-16 07:46:29'),
(22, 'Design ', 'Design', 'Section', 20, 5, 'Design Section ', NULL, 'active', '2025-12-16 07:46:51', '2025-12-16 07:46:51'),
(24, 'Land and Office Managment', 'Land and Office Managment', 'Department', 12, 4, 'Land and Office Managment', NULL, 'active', '2025-12-16 07:49:24', '2025-12-16 07:49:24'),
(25, 'Utilities and service ', 'Utilities and service ', 'Department', 12, 4, 'Utilities and service ', NULL, 'active', '2025-12-16 07:50:30', '2025-12-16 07:50:30'),
(26, 'Enviroment and Greenery ', 'Enviroment and Greenery ', 'Department', 12, 4, 'Enviroment and Greenery ', NULL, 'active', '2025-12-16 07:51:34', '2025-12-16 07:51:34'),
(27, 'Markating ', 'Markating ', 'Department', 10, 3, 'Markating Department', NULL, 'active', '2025-12-16 07:54:07', '2025-12-16 07:54:07'),
(28, 'Markating and Sales ', 'Markating and Sales ', 'Section', 27, 4, 'Markating and Sales ', NULL, 'active', '2025-12-16 07:54:49', '2025-12-16 07:54:49'),
(29, 'Investor Support', 'Investor Support', 'Section', 27, 4, 'Investor Support', NULL, 'active', '2025-12-16 07:55:18', '2025-12-16 07:55:18'),
(30, 'Bussines Development and Support', 'Bussines Development and Support', 'Section', 27, 4, 'Bussines Development and Support', NULL, 'active', '2025-12-16 07:56:02', '2025-12-16 07:56:02'),
(31, 'Corporate Adminstration Directorate', 'Corporate Adminstration Directorate', 'Directorate', 9, 2, 'Corporate Adminstration Directorate', NULL, 'active', '2025-12-16 07:57:02', '2025-12-16 07:57:25'),
(32, 'Finance Department', 'Finance Department', 'Department', 31, 3, 'Finance Department', NULL, 'active', '2025-12-16 07:58:00', '2025-12-16 07:58:00'),
(33, 'HR Department', 'HR Department', 'Department', 31, 3, 'HR Department', NULL, 'active', '2025-12-16 07:58:22', '2025-12-16 07:58:22'),
(34, 'Procrument and Resource Admin', 'Procrument and Resource Admin', 'Department', 31, 3, 'Procrument and Resource Admin', NULL, 'active', '2025-12-16 07:59:08', '2025-12-16 07:59:08'),
(35, 'Income and Cost Section ', 'Income and Cost Section ', 'Section', 32, 4, 'Income and Cost Section ', NULL, 'active', '2025-12-16 08:00:55', '2025-12-16 08:00:55'),
(36, 'Budget Section ', 'Budget Section ', 'Section', 32, 4, 'Budget Section ', NULL, 'active', '2025-12-16 08:02:21', '2025-12-16 08:02:21'),
(37, 'Procrument Section ', 'Procrument Section ', 'Section', 34, 4, 'Procrument Section ', NULL, 'active', '2025-12-16 08:02:56', '2025-12-16 08:03:46'),
(38, 'Inventory Admin', 'Inventory Admin', 'Section', 34, 4, 'Inventory Admin', NULL, 'active', '2025-12-16 08:02:58', '2025-12-16 08:04:30'),
(39, 'General Service ', 'General Service ', 'Section', 34, 4, 'General Service ', NULL, 'active', '2025-12-16 08:05:25', '2025-12-16 08:05:25'),
(40, 'HR Admin ', 'HR Admin ', 'Section', 33, 4, 'HR Admin ', NULL, 'active', '2025-12-16 08:06:04', '2025-12-16 08:06:04'),
(41, 'Training and HR development', 'Training and HR development', 'Section', 33, 4, 'Training and HR development', NULL, 'active', '2025-12-16 08:06:49', '2025-12-16 08:06:49'),
(42, 'Security ', 'Security ', 'Department', 9, 2, NULL, NULL, 'active', '2025-12-16 08:53:00', '2025-12-16 08:53:00'),
(43, 'CEO Office Addmistration ', 'CEO Office Addmistration ', 'Department', 9, 2, NULL, NULL, 'active', '2025-12-16 08:53:55', '2025-12-16 08:53:55'),
(44, 'Law Department', 'Law Department', 'Department', 9, 2, NULL, NULL, 'active', '2025-12-16 08:54:21', '2025-12-16 08:54:35'),
(45, 'Strategic Advisor', 'Strategic Advisor', 'unit', 9, 2, NULL, NULL, 'active', '2025-12-16 08:56:27', '2025-12-16 08:57:07'),
(46, 'Law Service ', 'Law Service ', 'Section', 44, 3, NULL, NULL, 'active', '2025-12-16 08:58:26', '2025-12-16 08:58:26'),
(47, 'Complaice Section ', 'Complaice Section ', 'Section', 44, 3, NULL, NULL, 'active', '2025-12-16 08:58:47', '2025-12-16 08:58:47'),
(48, 'Auditor', 'Auditor', 'Section', 9, 2, NULL, NULL, 'active', '2025-12-16 08:59:47', '2025-12-16 08:59:47'),
(49, 'Corporation Communication Section ', 'Corporation Communication Section ', 'Section', 9, 2, NULL, NULL, 'active', '2025-12-16 09:00:36', '2025-12-16 09:00:36'),
(50, 'Plan and followup ', 'Plan and followup ', 'Section', 9, 2, NULL, NULL, 'active', '2025-12-16 09:01:49', '2025-12-16 09:01:49');

-- --------------------------------------------------------

--
-- Table structure for table `organization_types`
--

CREATE TABLE `organization_types` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `color` varchar(50) DEFAULT 'from-gray-600 to-gray-700',
  `level_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `organization_types`
--

INSERT INTO `organization_types` (`id`, `name`, `description`, `color`, `level_order`, `created_at`) VALUES
(1, 'CEO', 'Top level organization', 'from-purple-600 to-purple-700', 1, '2025-12-15 13:52:30'),
(2, 'Department', 'Major functional area', 'from-blue-600 to-blue-700', 4, '2025-12-15 13:52:30'),
(3, 'Directorate', 'Sub-division of department', 'from-teal-600 to-teal-700', 3, '2025-12-15 13:52:30'),
(4, 'Section', 'Specific section', 'from-green-600 to-green-700', 5, '2025-12-15 13:52:30'),
(7, 'Deputy CEO', 'Deputy CEO', 'from-orange-600 to-orange-700', 2, '2025-12-16 07:31:32'),
(8, 'unit', 'unit', 'linear-gradient(to right, #7c3aed, #5b21b6)', 6, '2025-12-16 08:55:42');

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_otp`
--

CREATE TABLE `password_reset_otp` (
  `otp_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `otp_code` varchar(6) NOT NULL,
  `is_used` tinyint(1) DEFAULT 0,
  `attempts` int(11) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp(),
  `expires_at` datetime DEFAULT NULL,
  `verified_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `password_reset_otp`
--

INSERT INTO `password_reset_otp` (`otp_id`, `user_id`, `email`, `otp_code`, `is_used`, `attempts`, `created_at`, `expires_at`, `verified_at`) VALUES
(1, 67, 'hayaltamrat@gmail.com', '756687', 0, 0, '2025-11-29 06:37:20', '2025-11-29 06:52:20', NULL),
(2, 7, 'simegn@itp.org', '702875', 0, 0, '2025-11-29 06:41:14', '2025-11-29 06:56:14', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `plans`
--

CREATE TABLE `plans` (
  `plan_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `department_id` int(11) DEFAULT NULL,
  `supervisor_id` int(11) DEFAULT NULL,
  `employee_id` int(11) DEFAULT NULL,
  `goal_id` int(11) DEFAULT NULL,
  `objective_id` int(11) DEFAULT NULL,
  `specific_objective_id` int(11) DEFAULT NULL,
  `specific_objective_detail_id` int(11) DEFAULT NULL,
  `status` enum('Pending','Approved') NOT NULL DEFAULT 'Pending',
  `year` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `report_status` enum('Pending','Approved','Declined') DEFAULT 'Approved',
  `department_name` varchar(255) NOT NULL,
  `editing_status` enum('active','deactivate') NOT NULL DEFAULT 'deactivate',
  `reporting` enum('active','deactivate') NOT NULL DEFAULT 'deactivate',
  `report_progress` enum('on_progress','completed') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `plans`
--

INSERT INTO `plans` (`plan_id`, `user_id`, `department_id`, `supervisor_id`, `employee_id`, `goal_id`, `objective_id`, `specific_objective_id`, `specific_objective_detail_id`, `status`, `year`, `created_at`, `updated_at`, `report_status`, `department_name`, `editing_status`, `reporting`, `report_progress`) VALUES
(224, 40, 2, 72, 109, 90, 127, 548, 779, 'Pending', 2025, '2025-11-24 13:08:46', '2025-11-24 13:20:42', 'Approved', 'ኢንፎርሜሽን ቴክኖሎጂ ልማት', 'deactivate', 'active', NULL),
(225, 40, 2, 72, 109, 88, 116, 475, 780, 'Pending', 2025, '2025-11-24 13:10:39', '2025-11-24 13:20:20', 'Approved', 'ኢንፎርሜሽን ቴክኖሎጂ ልማት', 'deactivate', 'active', NULL),
(226, 40, 2, 72, 109, 88, 116, 475, 781, 'Pending', 2025, '2025-11-24 13:12:00', '2025-11-24 13:20:25', 'Approved', 'ኢንፎርሜሽን ቴክኖሎጂ ልማት', 'deactivate', 'active', NULL),
(227, 40, 2, 72, 109, 89, 123, 505, 782, 'Pending', 2025, '2025-11-24 13:13:52', '2025-11-24 13:20:38', 'Approved', 'ኢንፎርሜሽን ቴክኖሎጂ ልማት', 'deactivate', 'active', NULL),
(228, 40, 2, 72, 109, 91, 129, 562, 783, 'Pending', 2025, '2025-11-24 13:15:35', '2025-11-24 13:20:47', 'Approved', 'ኢንፎርሜሽን ቴክኖሎጂ ልማት', 'deactivate', 'active', NULL),
(229, 40, 2, 72, 109, 91, 132, 573, 784, 'Pending', 2025, '2025-11-24 13:17:12', '2025-11-24 13:20:51', 'Approved', 'ኢንፎርሜሽን ቴክኖሎጂ ልማት', 'deactivate', 'active', NULL),
(230, 40, 2, 72, 109, 88, 116, 475, 785, 'Pending', 2025, '2025-11-24 13:18:53', '2025-11-24 13:20:29', 'Approved', 'ኢንፎርሜሽን ቴክኖሎጂ ልማት', 'deactivate', 'active', NULL),
(231, 40, 2, 72, 109, 88, 117, 479, 786, 'Pending', 2025, '2025-11-24 13:20:06', '2025-11-24 13:20:33', 'Approved', 'ኢንፎርሜሽን ቴክኖሎጂ ልማት', 'deactivate', 'active', NULL),
(232, 40, 2, 72, 109, 88, 116, 475, 787, 'Pending', 2025, '2025-11-25 13:55:46', '2025-11-25 13:55:46', 'Approved', 'ኢንፎርሜሽን ቴክኖሎጂ ልማት', 'deactivate', 'deactivate', NULL),
(234, 40, 2, 72, 109, 88, 116, 475, 788, 'Pending', 2025, '2025-11-25 14:03:13', '2025-11-25 14:03:13', 'Approved', 'ኢንፎርሜሽን ቴክኖሎጂ ልማት', 'deactivate', 'deactivate', NULL),
(236, 40, 2, 72, 109, 87, 113, 461, 790, 'Pending', 2025, '2025-11-27 08:46:05', '2025-11-29 09:53:29', 'Approved', 'ኢንፎርሜሽን ቴክኖሎጂ ልማት', 'deactivate', 'active', NULL),
(237, 40, 2, 72, 109, 88, 117, 478, 791, 'Pending', 2025, '2025-11-27 08:48:50', '2025-11-27 08:48:50', 'Approved', 'ኢንፎርሜሽን ቴክኖሎጂ ልማት', 'deactivate', 'deactivate', NULL),
(238, 40, 2, 72, 109, 89, 120, 495, 792, 'Pending', 2025, '2025-11-27 13:57:07', '2025-11-27 13:57:07', 'Approved', 'ኢንፎርሜሽን ቴክኖሎጂ ልማት', 'deactivate', 'deactivate', NULL),
(239, 40, 2, 72, 109, 95, 140, 603, 793, 'Pending', 2025, '2025-12-11 12:28:06', '2025-12-11 12:28:06', 'Approved', 'ኢንፎርሜሽን ቴክኖሎጂ ልማት', 'deactivate', 'deactivate', NULL),
(240, 40, 2, 72, 109, 95, 140, 603, 794, 'Pending', 2025, '2025-12-11 12:34:19', '2025-12-11 12:34:19', 'Approved', 'ኢንፎርሜሽን ቴክኖሎጂ ልማት', 'deactivate', 'deactivate', NULL),
(241, 25, 2, 72, 72, 95, 140, 603, 795, 'Pending', 2025, '2025-12-11 13:24:22', '2025-12-11 13:24:22', 'Approved', 'ኢንፎርሜሽን ቴክኖሎጂ ልማት', 'deactivate', 'deactivate', NULL),
(242, 25, 2, 72, 72, 90, 125, 523, 796, 'Pending', 2025, '2025-12-11 16:30:28', '2025-12-11 16:30:28', 'Approved', 'ኢንፎርሜሽን ቴክኖሎጂ ልማት', 'deactivate', 'deactivate', NULL),
(243, 40, 2, 72, 109, 94, 139, 602, 797, 'Pending', 2025, '2025-12-15 07:52:45', '2025-12-15 07:52:45', 'Approved', 'ኢንፎርሜሽን ቴክኖሎጂ ልማት', 'deactivate', 'deactivate', NULL),
(244, 40, 2, 72, 109, 94, 139, 602, 798, 'Pending', 2025, '2025-12-15 09:21:12', '2025-12-15 09:21:12', 'Approved', 'ኢንፎርሜሽን ቴክኖሎጂ ልማት', 'deactivate', 'deactivate', NULL),
(245, 40, 2, 72, 109, 94, 139, 602, 799, 'Pending', 2025, '2025-12-15 12:15:21', '2025-12-15 12:15:21', 'Approved', 'ኢንፎርሜሽን ቴክኖሎጂ ልማት', 'deactivate', 'deactivate', NULL),
(246, 40, 2, 72, 109, 94, 139, 602, 800, 'Pending', 2025, '2025-12-15 12:28:13', '2025-12-15 12:28:13', 'Approved', 'ኢንፎርሜሽን ቴክኖሎጂ ልማት', 'deactivate', 'deactivate', NULL),
(247, 76, 18, 148, 149, 94, 139, 602, 801, 'Pending', 2025, '2025-12-16 13:22:07', '2025-12-16 13:22:07', 'Approved', 'Expert', 'deactivate', 'deactivate', NULL),
(248, 78, 15, 150, 151, 87, 113, 461, 802, 'Pending', 2025, '2025-12-16 18:36:52', '2025-12-16 18:36:52', 'Approved', 'Section Head', 'deactivate', 'deactivate', NULL),
(249, 40, 2, 143, 109, 91, 129, 560, 803, 'Pending', 2026, '2026-03-09 07:08:12', '2026-03-09 07:08:12', 'Approved', 'Admin', 'deactivate', 'deactivate', NULL),
(250, 40, 2, 72, 109, 91, 130, 567, 805, 'Pending', 2026, '2026-03-09 08:16:56', '2026-03-09 08:16:56', 'Approved', 'Admin', 'deactivate', 'deactivate', NULL),
(251, 40, 2, 143, 109, 96, 141, 604, 806, 'Pending', 2026, '2026-03-10 08:06:01', '2026-03-10 08:06:01', 'Approved', 'Admin', 'deactivate', 'deactivate', NULL),
(252, 40, 2, 72, 109, 96, 141, 604, 807, 'Pending', 2026, '2026-03-11 11:12:30', '2026-03-11 14:10:36', 'Approved', 'Admin', 'deactivate', 'active', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `reportfile`
--

CREATE TABLE `reportfile` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `specific_objective_id` int(11) DEFAULT NULL,
  `file_name` text NOT NULL,
  `file_path` text NOT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `reports`
--

CREATE TABLE `reports` (
  `report_id` int(11) NOT NULL,
  `plan_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `report_content` text NOT NULL,
  `status` enum('Pending','Approved','Declined') DEFAULT 'Approved',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `reports`
--

INSERT INTO `reports` (`report_id`, `plan_id`, `user_id`, `report_content`, `status`, `created_at`, `updated_at`) VALUES
(10, 212, 40, 'test adeta yusd ', 'Approved', '2025-11-24 08:15:59', '2025-11-24 08:24:01'),
(11, 188, 40, 'asad', 'Approved', '2025-11-24 09:57:18', '2025-11-24 09:57:18'),
(12, 225, 40, 'something', 'Approved', '2025-11-26 09:30:04', '2025-11-26 09:30:04');

-- --------------------------------------------------------

--
-- Table structure for table `report_attachments`
--

CREATE TABLE `report_attachments` (
  `attachment_id` int(11) NOT NULL,
  `report_id` int(11) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_size` bigint(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `report_attachments`
--

INSERT INTO `report_attachments` (`attachment_id`, `report_id`, `file_name`, `file_path`, `file_size`, `created_at`) VALUES
(14, 10, 'Screenshot From 2025-09-07 06-24-30.png', '/home/hayal/Desktop/EITPRV2/backend/uploads/1763972158993-474526997-Screenshot_From_2025-09-07_06-24-30.png', 339520, '2025-11-24 08:15:59'),
(15, 10, 'Screenshot From 2025-09-07 06-26-16.png', '/home/hayal/Desktop/EITPRV2/backend/uploads/1763972159033-421744629-Screenshot_From_2025-09-07_06-26-16.png', 150378, '2025-11-24 08:15:59'),
(16, 10, 'Screenshot From 2025-10-25 08-22-05.png', '/home/hayal/Desktop/EITPRV2/backend/uploads/1763972159035-377618366-Screenshot_From_2025-10-25_08-22-05.png', 213839, '2025-11-24 08:15:59'),
(17, 11, 'Screenshot From 2025-09-07 06-26-16.png', '/home/hayal/Desktop/EITPRV2/backend/uploads/1763978238276-696413871-Screenshot_From_2025-09-07_06-26-16.png', 150378, '2025-11-24 09:57:19'),
(18, 12, 'Screenshot From 2025-09-07 06-24-30.png', '/home/hayal/Desktop/EITPRV2/backend/uploads/1764149404214-126332371-Screenshot_From_2025-09-07_06-24-30.png', 339520, '2025-11-26 09:30:04'),
(19, 12, 'Screenshot From 2025-09-07 06-26-16.png', '/home/hayal/Desktop/EITPRV2/backend/uploads/1764149404263-422820152-Screenshot_From_2025-09-07_06-26-16.png', 150378, '2025-11-26 09:30:04');

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `role_id` int(11) NOT NULL,
  `role_name` varchar(50) NOT NULL,
  `hierarchy_level` int(11) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `status` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`role_id`, `role_name`, `hierarchy_level`, `description`, `status`) VALUES
(1, 'Admin', 1, 'System Administrator', 1),
(2, 'Deputy CEO', 3, 'Deputy Chief Executive Officer', 1),
(3, 'General manager', 12, 'General Management', 1),
(5, 'IT Directorate', 6, 'Information Technology Directorate', 1),
(6, 'Department Head', 7, 'Department Head', 1),
(7, 'Section Head', 8, 'Section Head', 1),
(8, 'Expert', 10, 'Expert', 1),
(9, 'ፕላን እና ሪፖርት', 11, 'Planning and Reporting', 1),
(28, 'sinior-expert', 9, 'Senior Expert', 1),
(29, 'CEO', 2, 'Chief Executive Officer', 1),
(30, 'Construction Directorate', 6, 'Construction Directorate', 1),
(31, 'Corporation Directorate', 6, 'Corporation Directorate', 1),
(32, 'Strategic Advisor', 4, 'Strategic Advisory Role', 1);

-- --------------------------------------------------------

--
-- Table structure for table `role_permissions`
--

CREATE TABLE `role_permissions` (
  `id` int(11) NOT NULL,
  `role_id` int(11) NOT NULL,
  `menu_item_id` int(11) NOT NULL,
  `can_view` tinyint(1) DEFAULT 1,
  `can_create` tinyint(1) DEFAULT 0,
  `can_edit` tinyint(1) DEFAULT 0,
  `can_delete` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `role_permissions`
--

INSERT INTO `role_permissions` (`id`, `role_id`, `menu_item_id`, `can_view`, `can_create`, `can_edit`, `can_delete`, `created_at`, `updated_at`) VALUES
(587, 28, 59, 1, 1, 1, 1, '2025-11-29 11:07:38', '2025-11-29 11:07:38'),
(588, 28, 1, 1, 1, 1, 1, '2025-11-29 11:07:38', '2025-11-29 11:07:38'),
(589, 28, 51, 1, 1, 1, 1, '2025-11-29 11:07:38', '2025-11-29 11:07:38'),
(590, 28, 52, 1, 1, 1, 1, '2025-11-29 11:07:38', '2025-11-29 11:07:38'),
(591, 28, 60, 1, 1, 1, 1, '2025-11-29 11:07:38', '2025-11-29 11:07:38'),
(592, 28, 65, 1, 1, 1, 1, '2025-11-29 11:07:38', '2025-11-29 11:07:38'),
(593, 28, 45, 1, 1, 1, 1, '2025-11-29 11:07:38', '2025-11-29 11:07:38'),
(594, 28, 29, 1, 1, 1, 1, '2025-11-29 11:07:38', '2025-11-29 11:07:38'),
(595, 2, 59, 1, 0, 0, 0, '2025-11-29 11:08:02', '2025-11-29 11:08:02'),
(596, 2, 55, 1, 1, 1, 1, '2025-11-29 11:08:02', '2025-11-29 11:08:02'),
(597, 2, 40, 1, 1, 1, 1, '2025-11-29 11:08:02', '2025-11-29 11:08:02'),
(598, 2, 1, 1, 0, 0, 0, '2025-11-29 11:08:02', '2025-11-29 11:08:02'),
(599, 2, 51, 1, 1, 1, 1, '2025-11-29 11:08:02', '2025-11-29 11:08:02'),
(600, 2, 52, 1, 1, 1, 1, '2025-11-29 11:08:02', '2025-11-29 11:08:02'),
(601, 2, 60, 1, 0, 0, 0, '2025-11-29 11:08:02', '2025-11-29 11:08:02'),
(602, 2, 65, 1, 0, 0, 0, '2025-11-29 11:08:02', '2025-11-29 11:08:02'),
(603, 2, 12, 1, 0, 0, 0, '2025-11-29 11:08:02', '2025-11-29 11:08:02'),
(604, 2, 9, 1, 0, 0, 0, '2025-11-29 11:08:02', '2025-11-29 11:08:02'),
(605, 2, 45, 1, 0, 0, 0, '2025-11-29 11:08:02', '2025-11-29 11:08:02'),
(606, 2, 29, 1, 1, 1, 1, '2025-11-29 11:08:02', '2025-11-29 11:08:02'),
(607, 29, 59, 1, 0, 0, 0, '2025-11-29 11:10:49', '2025-11-29 11:10:49'),
(608, 29, 55, 1, 1, 1, 1, '2025-11-29 11:10:49', '2025-11-29 11:10:49'),
(609, 29, 40, 1, 1, 1, 1, '2025-11-29 11:10:49', '2025-11-29 11:10:49'),
(610, 29, 1, 1, 1, 1, 1, '2025-11-29 11:10:49', '2025-11-29 11:10:49'),
(611, 29, 51, 1, 0, 0, 0, '2025-11-29 11:10:49', '2025-11-29 11:10:49'),
(612, 29, 52, 1, 0, 0, 0, '2025-11-29 11:10:49', '2025-11-29 11:10:49'),
(613, 29, 60, 1, 0, 0, 0, '2025-11-29 11:10:49', '2025-11-29 11:10:49'),
(614, 29, 65, 1, 0, 0, 0, '2025-11-29 11:10:49', '2025-11-29 11:10:49'),
(615, 29, 45, 1, 0, 0, 0, '2025-11-29 11:10:49', '2025-11-29 11:10:49'),
(616, 29, 29, 1, 0, 0, 0, '2025-11-29 11:10:49', '2025-11-29 11:10:49'),
(640, 1, 3, 1, 1, 1, 1, '2025-12-11 08:45:02', '2025-12-11 08:45:02'),
(641, 1, 59, 1, 1, 1, 1, '2025-12-11 08:45:02', '2025-12-11 08:45:02'),
(642, 1, 34, 1, 1, 1, 1, '2025-12-11 08:45:02', '2025-12-11 08:45:02'),
(643, 1, 55, 1, 1, 1, 1, '2025-12-11 08:45:02', '2025-12-11 08:45:02'),
(644, 1, 40, 1, 1, 1, 1, '2025-12-11 08:45:02', '2025-12-11 08:45:02'),
(645, 1, 1, 1, 1, 1, 1, '2025-12-11 08:45:02', '2025-12-11 08:45:02'),
(646, 1, 31, 1, 1, 1, 1, '2025-12-11 08:45:02', '2025-12-11 08:45:02'),
(647, 1, 51, 1, 1, 1, 1, '2025-12-11 08:45:02', '2025-12-11 08:45:02'),
(648, 1, 52, 1, 1, 1, 1, '2025-12-11 08:45:02', '2025-12-11 08:45:02'),
(649, 1, 10, 1, 1, 1, 1, '2025-12-11 08:45:02', '2025-12-11 08:45:02'),
(650, 1, 60, 1, 1, 1, 1, '2025-12-11 08:45:02', '2025-12-11 08:45:02'),
(651, 1, 48, 1, 1, 1, 1, '2025-12-11 08:45:02', '2025-12-11 08:45:02'),
(652, 1, 4, 1, 1, 1, 1, '2025-12-11 08:45:02', '2025-12-11 08:45:02'),
(653, 1, 26, 1, 1, 1, 1, '2025-12-11 08:45:02', '2025-12-11 08:45:02'),
(654, 1, 32, 1, 1, 1, 1, '2025-12-11 08:45:02', '2025-12-11 08:45:02'),
(655, 1, 35, 1, 1, 1, 1, '2025-12-11 08:45:02', '2025-12-11 08:45:02'),
(656, 1, 2, 1, 1, 1, 1, '2025-12-11 08:45:02', '2025-12-11 08:45:02'),
(657, 1, 65, 1, 1, 1, 1, '2025-12-11 08:45:02', '2025-12-11 08:45:02'),
(658, 1, 12, 1, 1, 1, 1, '2025-12-11 08:45:02', '2025-12-11 08:45:02'),
(659, 1, 9, 1, 1, 1, 1, '2025-12-11 08:45:02', '2025-12-11 08:45:02'),
(660, 1, 45, 1, 1, 1, 1, '2025-12-11 08:45:02', '2025-12-11 08:45:02'),
(661, 1, 24, 1, 1, 1, 1, '2025-12-11 08:45:02', '2025-12-11 08:45:02'),
(662, 1, 29, 1, 1, 1, 1, '2025-12-11 08:45:02', '2025-12-11 08:45:02'),
(663, 1, 30, 1, 1, 1, 1, '2025-12-11 08:45:02', '2025-12-11 08:45:02'),
(664, 1, 69, 1, 1, 1, 1, '2025-12-15 13:18:47', '2025-12-15 13:18:47'),
(665, 8, 59, 1, 1, 1, 1, '2025-12-16 12:27:30', '2025-12-16 12:27:30'),
(666, 8, 1, 1, 1, 1, 1, '2025-12-16 12:27:30', '2025-12-16 12:27:30'),
(667, 8, 51, 1, 1, 1, 1, '2025-12-16 12:27:30', '2025-12-16 12:27:30'),
(668, 8, 52, 1, 1, 1, 1, '2025-12-16 12:27:30', '2025-12-16 12:27:30'),
(669, 8, 60, 1, 1, 1, 1, '2025-12-16 12:27:30', '2025-12-16 12:27:30'),
(670, 8, 65, 1, 1, 1, 1, '2025-12-16 12:27:30', '2025-12-16 12:27:30'),
(671, 8, 45, 1, 1, 1, 1, '2025-12-16 12:27:30', '2025-12-16 12:27:30'),
(672, 8, 29, 1, 1, 1, 1, '2025-12-16 12:27:30', '2025-12-16 12:27:30'),
(693, 7, 59, 1, 1, 1, 1, '2025-12-16 13:32:58', '2025-12-16 13:32:58'),
(694, 7, 1, 1, 1, 1, 1, '2025-12-16 13:32:58', '2025-12-16 13:32:58'),
(695, 7, 55, 1, 1, 1, 1, '2025-12-16 13:32:58', '2025-12-16 13:32:58'),
(696, 7, 51, 1, 1, 1, 1, '2025-12-16 13:32:58', '2025-12-16 13:32:58'),
(697, 7, 52, 1, 1, 1, 1, '2025-12-16 13:32:58', '2025-12-16 13:32:58'),
(698, 7, 40, 1, 1, 1, 1, '2025-12-16 13:32:58', '2025-12-16 13:32:58'),
(699, 7, 60, 1, 1, 1, 1, '2025-12-16 13:32:58', '2025-12-16 13:32:58'),
(700, 7, 67, 1, 1, 1, 1, '2025-12-16 13:32:58', '2025-12-16 13:32:58'),
(701, 7, 65, 1, 1, 1, 1, '2025-12-16 13:32:58', '2025-12-16 13:32:58'),
(702, 7, 45, 1, 1, 1, 1, '2025-12-16 13:32:58', '2025-12-16 13:32:58'),
(703, 7, 29, 1, 1, 1, 1, '2025-12-16 13:32:58', '2025-12-16 13:32:58'),
(704, 5, 59, 1, 1, 1, 1, '2025-12-16 13:59:14', '2025-12-16 13:59:14'),
(705, 5, 1, 1, 1, 1, 1, '2025-12-16 13:59:14', '2025-12-16 13:59:14'),
(706, 5, 55, 1, 1, 1, 1, '2025-12-16 13:59:14', '2025-12-16 13:59:14'),
(707, 5, 51, 1, 1, 1, 1, '2025-12-16 13:59:14', '2025-12-16 13:59:14'),
(708, 5, 52, 1, 1, 1, 1, '2025-12-16 13:59:14', '2025-12-16 13:59:14'),
(709, 5, 40, 1, 1, 1, 1, '2025-12-16 13:59:14', '2025-12-16 13:59:14'),
(710, 5, 60, 1, 1, 1, 1, '2025-12-16 13:59:14', '2025-12-16 13:59:14'),
(711, 5, 65, 1, 1, 1, 1, '2025-12-16 13:59:14', '2025-12-16 13:59:14'),
(712, 5, 45, 1, 1, 1, 1, '2025-12-16 13:59:14', '2025-12-16 13:59:14'),
(713, 5, 29, 1, 1, 1, 1, '2025-12-16 13:59:14', '2025-12-16 13:59:14');

-- --------------------------------------------------------

--
-- Table structure for table `specific_objectives`
--

CREATE TABLE `specific_objectives` (
  `specific_objective_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `objective_id` int(11) DEFAULT NULL,
  `specific_objective_name` varchar(255) NOT NULL,
  `details` text DEFAULT NULL,
  `baseline` varchar(255) DEFAULT NULL,
  `plan` text DEFAULT NULL,
  `measurement` text DEFAULT NULL,
  `execution_percentage` decimal(5,2) DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deadline_quarter` enum('Q1','Q2','Q3','Q4') NOT NULL,
  `deadline` date DEFAULT NULL,
  `priority` varchar(20) NOT NULL,
  `department_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `count` int(11) NOT NULL,
  `progress` enum('started','on going','completed') NOT NULL DEFAULT 'started',
  `income_id` int(11) DEFAULT NULL,
  `cost_id` int(11) DEFAULT NULL,
  `view` enum('የፋይናንስ ዕይታ','የተገልጋይ ዕይታ','የውስጥ አሰራር ዕይታ','የመማማርና ዕድገት ዕይታ') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `specific_objectives`
--

INSERT INTO `specific_objectives` (`specific_objective_id`, `user_id`, `objective_id`, `specific_objective_name`, `details`, `baseline`, `plan`, `measurement`, `execution_percentage`, `created_at`, `updated_at`, `deadline_quarter`, `deadline`, `priority`, `department_id`, `name`, `count`, `progress`, `income_id`, `cost_id`, `view`) VALUES
(461, 26, 113, '1.1.1 በንዑስ ሊዝ መሬት በወሰደ ካምፓኒዎች በቀጥታ የተፈጠረ የሥራ ዕዴል በሰው ብዛት', NULL, NULL, NULL, NULL, 0.00, '2025-03-12 11:38:56', '2025-04-09 12:10:50', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የተገልጋይ ዕይታ'),
(462, 26, 113, '1.1.2 የህንጻ ኪራይ በወሰዱ ካምፓኒዎች በቀጥታ የተፈጠረ የሥራ ዕድል በሰው ብዛት ', NULL, NULL, NULL, NULL, 0.00, '2025-03-12 11:39:17', '2025-04-09 12:10:57', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የተገልጋይ ዕይታ'),
(463, 26, 113, '1.1.3 ከካምፓኒዎቹ ሥራ ጋር ተያይዞ በተጓዳኝ የተፈጠረ የሥራ ዕድል በሰው ብዛት', NULL, NULL, NULL, NULL, 0.00, '2025-03-12 11:39:36', '2025-04-09 12:11:01', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የተገልጋይ ዕይታ'),
(465, 26, 114, '1.2.1 በንዑስ ሊዝ መሬት በወሰደ እና ቢሮ በተከራየ አልሚ ካምፓኒዎች የተፈጠረ ቀጥተኛ የውጭ ኢንቨስትመንት (በሚሉዮን ዶሊር)', NULL, NULL, NULL, NULL, 0.00, '2025-03-12 11:42:58', '2025-04-09 12:11:07', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የተገልጋይ ዕይታ'),
(466, 26, 114, '1.2.2 በንዑስ ሉዝ መሬት በወሰደ እና ቢሮ በተከራዩ አሌሚ ካምፓኒዎች የተፈጠረ የሀገር ውስጥ ኢንቨስትመንት (በሚሉዮን ብር)', NULL, NULL, NULL, NULL, 0.00, '2025-03-12 11:43:14', '2025-04-09 12:11:13', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የተገልጋይ ዕይታ'),
(467, 26, 115, '2.1.1 የቴክኖልጂ ሽግግር ሇማዴረግ የሰሇጠኑ ሰሌጣኞች ብዛት ', NULL, NULL, NULL, NULL, 0.00, '2025-03-12 11:45:54', '2025-04-09 12:11:18', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የተገልጋይ ዕይታ'),
(468, 26, 115, '2.1.2 የቴክኖልጂ ሽግግር ሇማዴረግ የተፈጠረ ሥሌጠና ብዛት በዓይነት', NULL, NULL, NULL, NULL, 0.00, '2025-03-12 11:46:11', '2025-04-09 12:11:22', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የተገልጋይ ዕይታ'),
(469, 26, 115, '2.1.3 የተሇየ የቴክኖልጂ ብቃት ይዞ ከውጭ ሀገር የመጣ ባሇሙያን መተካት የቻሇ የሀገር ውስጥ ባሇሙያ ብዛት በቁጥር ', NULL, NULL, NULL, NULL, 0.00, '2025-03-12 11:46:26', '2025-04-09 12:11:26', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የተገልጋይ ዕይታ'),
(470, 26, 115, '2.1.4 በተሇየ የቴክኖልጂ ብቃት ሰርቲፋይዴ የሆነ (የብቃት ማረገጋገጫ ዕውቅና ያገኘ) ባሇሙያ ብዛት በቁጥር', NULL, NULL, NULL, NULL, 0.00, '2025-03-12 11:46:46', '2025-04-09 12:11:31', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የተገልጋይ ዕይታ'),
(471, 26, 115, '2.1.5 በኢንፎርሜሽን ቴክኖልጂ ዘርፍ የአዕምሯዊ ንብረት ጥበቃ ያገኘ ባሇሙያ ብዛት በቁጥር', NULL, NULL, NULL, NULL, 0.00, '2025-03-12 11:47:00', '2025-04-09 12:11:34', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የተገልጋይ ዕይታ'),
(472, 26, 115, '2.1.6 በኢንፎርሜሽን ቴክኖልጂ ዘርፍ የአዕምሯዊ ንብረት ምዝገባ ያገኘ ዴርጅት ብዛት በቁጥር', NULL, NULL, NULL, NULL, 0.00, '2025-03-12 11:47:24', '2025-04-09 12:11:39', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የተገልጋይ ዕይታ'),
(473, 26, 115, '2.1.7 በኢንፎርሜሽን ቴክኖልጂ ዘርፍ የአዕምሯዊ ንብረት ማመሌከቻ ያቀረበ ባሇሙያ/ዴርጅት ብዛት በቁጥር', NULL, NULL, NULL, NULL, 0.00, '2025-03-12 11:47:40', '2025-04-09 12:11:43', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የተገልጋይ ዕይታ'),
(474, 26, 116, '2.2.1 በንዑስ ሉዝ መሬት ከወሰደ ካምፓኒዎች ምርት/አገሌግልት ሽያጭ የተገኘ የወጪ ንግዴ ገቢ (በሚሉዮን ድሊር)', NULL, NULL, NULL, NULL, 0.00, '2025-03-12 11:48:56', '2025-04-09 12:11:47', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የተገልጋይ ዕይታ'),
(475, 26, 116, '2.2.2 የህንጻ ኪራይ ከወሰደ ካምፓኒዎች ምርት/አገሌግልት ሽያጭ የተገኘ የወጪ ንግዴ ገቢ (በሚሉዮን ድሊር)', NULL, NULL, NULL, NULL, 0.00, '2025-03-12 11:49:12', '2025-04-09 12:11:52', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የተገልጋይ ዕይታ'),
(477, 26, 117, '2.3.1. በሀገር ውስጥ የተመረተ ተተኪ ምርት/አገሌግልት ዓይነት ብዛት', NULL, NULL, NULL, NULL, 0.00, '2025-03-12 11:50:30', '2025-04-09 12:12:00', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የተገልጋይ ዕይታ'),
(478, 26, 117, '2.3.2. ተተኪ ምርት/አገሌግልት በሀገር ውስጥ ያመረቱ ካምፓኒዎች ብዛት በቁጥር', NULL, NULL, NULL, NULL, 0.00, '2025-03-12 11:50:49', '2025-04-09 12:12:03', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የተገልጋይ ዕይታ'),
(479, 26, 117, '2.3.3. በሀገር ውስጥ ከተሸጠ ተተኪ ምርት ሽያጭ የተገኘ ጠቅሊሊ ገቢ (በቢሉዮን ብር)', NULL, NULL, NULL, NULL, 0.00, '2025-03-12 11:51:10', '2025-04-09 12:12:06', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የተገልጋይ ዕይታ'),
(480, 26, 118, '3.1.1 የሇማ መሬት በንዑስ ሉዝ ከሚተሊሇፍሊቸው ካምፓኒዎች ጋር የተፈጸመ ውሌ ስምምነት ብዛት በቁጥር', NULL, NULL, NULL, NULL, 0.00, '2025-03-12 11:54:30', '2025-04-09 12:12:10', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የተገልጋይ ዕይታ'),
(481, 26, 118, '3.1.2 የሇማ መሬት በንዑስ ሉዝ ሇመውሰዴ ርክክብ የተፈጸመሊቸው ካምፓኒዎች ብዛት በቁጥር', NULL, NULL, NULL, NULL, 0.00, '2025-03-12 11:54:50', '2025-04-09 12:12:14', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የተገልጋይ ዕይታ'),
(482, 26, 118, '3 3.1.3 የካምፓኒዎች በንዑስ ሉዝ የተሰጠ የመሬት ስፋት በካሬ ሜትር ', NULL, NULL, NULL, NULL, 0.00, '2025-03-12 11:55:37', '2025-04-09 12:12:18', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የተገልጋይ ዕይታ'),
(483, 26, 118, '3.1.4. የለማ መሬት በንዑስ ሉዝ ሇወሰደ ካምፓኒዎች የተሰጠ የባለቤትነት ማረጋገጫ ካርታ ብዛት በቁጥር', NULL, NULL, NULL, NULL, 0.00, '2025-03-12 11:56:15', '2025-04-09 12:12:23', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የተገልጋይ ዕይታ'),
(484, 26, 118, '3.1.5 የለማ መሬት በንዑስ ሉዝ  የወሰዱ ካምፓኒዎች የጸደቀ የግንባታ ዱዛይን ብዛት በቁጥር', NULL, NULL, NULL, NULL, 0.00, '2025-03-12 11:56:54', '2025-04-09 12:12:28', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የተገልጋይ ዕይታ'),
(485, 26, 118, '3.1.6 የለማ መሬት በንዑስ ሉዝ የወሰደ ካምፓኒዎች የተሰጠ የግንባታ ፈቃዴ ሰርቲፊኬት ብዛት በቁጥር', NULL, NULL, NULL, NULL, 0.00, '2025-03-12 11:57:23', '2025-04-09 12:12:32', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የተገልጋይ ዕይታ'),
(486, 26, 118, '3.1.7 የለማ መሬት በንዑስ ሊዝ የማስተላለፍ ለእያንዲንዱ ካምፓኒ አገሌግልት የተሰጠበት አማካይ ጊዜ በቀን', NULL, NULL, NULL, NULL, 0.00, '2025-03-12 11:58:44', '2025-04-09 12:12:36', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የተገልጋይ ዕይታ'),
(487, 26, 119, '3.2.1 የመገሌገያ ህንጻ ኪራይ ለመውሰዴ ውሌ የፈጸሙ ካምፓኒዎች ብዛት በቁጥር', NULL, NULL, NULL, NULL, 0.00, '2025-03-12 12:00:21', '2025-04-09 12:12:40', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የተገልጋይ ዕይታ'),
(488, 26, 119, '3.2.2 የመገሌገያ ህንጻ ኪራይ የተረከቡ ካምፓኒዎች (ብዛት በቁጥር)', NULL, NULL, NULL, NULL, 0.00, '2025-03-12 12:00:39', '2025-04-09 12:12:45', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የተገልጋይ ዕይታ'),
(489, 26, 119, '3.2.3 የካምፓኒዎች በኪራይ የተሰጠ የሥራ ቦታ (ህንጻ/ክፍሌ) ስፋት በካሬ ሜትር ', NULL, NULL, NULL, NULL, 0.00, '2025-03-12 12:01:09', '2025-04-09 12:12:50', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የተገልጋይ ዕይታ'),
(490, 26, 119, '3.2.4 በበጀት ዓመቱ ውስጥ የመስሪያ ቦታ በኪራይ ለወሰደ ካምፓኒዎች አገሌግልት የተሰጠበት አማካይ ጊዜ በቀን', NULL, NULL, NULL, NULL, 0.00, '2025-03-12 12:01:41', '2025-04-09 12:12:57', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የተገልጋይ ዕይታ'),
(491, 26, 119, '3.2.5 የመገሌገያ ህንጻ ሇተከራዩ ካምፓኒዎች የጸዯቀ ዱዛይን ብዛት በቁጥር', NULL, NULL, NULL, NULL, 0.00, '2025-03-12 12:02:00', '2025-04-09 12:13:01', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የተገልጋይ ዕይታ'),
(492, 26, 119, '3.2.6 የመገሌገያ ህንጻ ኪራይ የወሰደ ካምፓኒዎች አፈጻጸም ሊይ የተካሄዯ ዴጋፍ፣ ክትትሌና ቁጥጥር በካምፓኔ ብዛት ', NULL, NULL, NULL, NULL, 0.00, '2025-03-12 12:02:20', '2025-04-09 12:13:07', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የተገልጋይ ዕይታ'),
(493, 26, 120, '3.3.1 ሇኢንኩቤሽን ፕሮግራም ሰነዴ ማዘጋጀት', NULL, NULL, NULL, NULL, 0.00, '2025-03-12 12:04:09', '2025-04-09 12:13:12', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የተገልጋይ ዕይታ'),
(494, 26, 120, '3.3.2 በአክሰሇሬሽን ፕሮግራሞች ተጠቃሚ የሆኑ ካምፓኒዎች ብዛት በቁጥር', NULL, NULL, NULL, NULL, 0.00, '2025-03-12 12:04:32', '2025-04-09 12:13:17', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የተገልጋይ ዕይታ'),
(495, 26, 120, '3.3.3 በኢንኩቤሽን ፕሮግራሞች ተጠቃሚ የሆኑ ካምፓኒዎች ብዛት በቁጥር', NULL, NULL, NULL, NULL, 0.00, '2025-03-12 12:04:47', '2025-04-09 12:13:23', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የተገልጋይ ዕይታ'),
(496, 26, 120, '3.3.4 በኢንኩቤሽን ፕሮግራሞች ተጠቃሚ የሆኑ ወጣት ብዛት በቁጥር', NULL, NULL, NULL, NULL, 0.00, '2025-03-12 12:05:02', '2025-04-09 12:13:27', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የተገልጋይ ዕይታ'),
(497, 26, 120, '3.3.5 በኢንኩቤሽን ፕሮግራሞች ተጠቃሚ ከሆኑት መካከሌ ውጤታማ የሆኑ ወጣቶች ብዛት', NULL, NULL, NULL, NULL, 0.00, '2025-03-12 12:05:27', '2025-04-09 12:13:31', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የተገልጋይ ዕይታ'),
(498, 26, 120, '3.3.6 የኢንኩቤተሮች ዴጋፍና ክትትሌ ጊዜ ብዛት', NULL, NULL, NULL, NULL, 0.00, '2025-03-12 12:05:52', '2025-04-09 12:13:35', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የተገልጋይ ዕይታ'),
(499, 26, 121, '3.4.1 ለኗሪዎች የተፈጠሩ የገበያ ትስስር መዴረኮች ብዛት ', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 11:40:08', '2025-04-09 12:13:40', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የተገልጋይ ዕይታ'),
(500, 26, 121, ' 3.4.2 ከኗሪዎች ጋር የተዯረጉ የመግባቢያ ስምምነቶች ብዛት ', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 11:40:28', '2025-04-09 12:13:43', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የተገልጋይ ዕይታ'),
(501, 26, 121, '3.4.3 ከኗሪዎች ጋር የተዯረጉ የፓርትነርሺፕ ስምምነቶች በዛት ', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 11:40:42', '2025-04-09 12:13:47', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የተገልጋይ ዕይታ'),
(502, 26, 121, '3.4.4 ኗሪዎችን ከሥራ ፈሊጊዎች ጋር ለማገናኘት የተፈጠረ ሁነት ብዛት (ሇሥራ ዕዴሌ ፈጠራ)', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 11:41:59', '2025-04-09 12:13:52', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የተገልጋይ ዕይታ'),
(503, 26, 123, '3.5.1 ከዓመቱ 365 ቀናት ውስጥ ለፓርኩ ነዋሪዎች የኢንተርኔት አገሌግልት የተሰጠበት ቀን ብዛት', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 11:43:04', '2025-04-09 12:13:57', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የተገልጋይ ዕይታ'),
(504, 26, 123, '3.5.2 ከዓመቱ 365 ቀናት ውስጥ በፓርኩ ተግባራዊ የተዯረገ የዯህንነት ካሜራ አገሌግልት በቀን ብዛት', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 11:43:26', '2025-04-09 12:14:02', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የተገልጋይ ዕይታ'),
(505, 26, 123, '3.5.3 ከዓመቱ 250 የሥራ ቀናት ውስጥ ሇፓርኩ ነዋሪዎች የውሃ አገሌግልት የተሰጠበት ቀን ብዛት', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 11:46:01', '2025-04-09 12:14:06', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የተገልጋይ ዕይታ'),
(506, 26, 123, '3.5.4 ከዓመቱ 250 የሥራ ቀናት ውስጥ ለፓርኩ ነዋሪዎች የኤላክትሪክ አገሌግልት የተሰጠበት ቀን ብዛት', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 11:46:25', '2025-03-13 11:46:25', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የውስጥ አሰራር ዕይታ'),
(507, 26, 123, '3.5.5 ከዓመቱ 250 የሥራ ቀናት ውስጥ በፓርኩ ነዋሪዎች ዘንዴ በዋጋና በጥራት ተቀባይነት ያሇው የካፊቴሪያ አገሌግልት የተሰጠበት ቀን ብዛት', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 11:46:48', '2025-04-09 12:14:13', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የተገልጋይ ዕይታ'),
(508, 26, 123, '3.5.6 ከዓመቱ 250 የሥራ ቀናት ውስጥ ከፓርኩ ነዋሪዎች የተሟሊ የስብሰባ አዲራሽ (30 ሰው የሚይዝ አዲራሽ) አገሌግልት የተሰጠበት ቀን ብዛት', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 11:47:13', '2025-04-09 12:14:18', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የተገልጋይ ዕይታ'),
(509, 26, 123, '3.5.7 ከዓመቱ 250 የሥራ ቀናት ውስጥ ሇ300 የፓርኩ ነዋሪዎች የትራንስፖርት ሰርቪስ አገሌግልት የተሰጠበት ቀን', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 11:47:30', '2025-04-09 12:14:22', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የተገልጋይ ዕይታ'),
(510, 26, 123, '3.5.8 ከዓመቱ 250 የሥራ ቀናት ውስጥ ለደንበኞች የአንዴ መስኮት አገሌግልት የተሰጠበት ቀን ብዛት', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 11:47:50', '2025-04-09 12:14:28', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የተገልጋይ ዕይታ'),
(511, 26, 123, '3.5.9 ከዓመቱ 365 ቀናት ውስጥ ለደንበኞች የአንዴ መስኮት ፖርታሌ አገሌግልት የተሰጠበት ቀን ብዛት', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 11:48:16', '2025-04-09 12:14:32', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የተገልጋይ ዕይታ'),
(512, 26, 124, '3.6.1 ለፓርኩ የሰው ኃይሌ አቅርቦት (Talent Pool) በመፍጠር ሇነዋሪዎች የቀረበ ብቃት ያሇው የሰው ኃይሌ ብዛት', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 11:49:29', '2025-04-09 12:14:36', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የተገልጋይ ዕይታ'),
(513, 26, 124, '3.6.2 በተፈጠረው ታለንት ፑሌ ሊይ በመመስረት የተቀጠሩ ሰሌጣኞች ብዛት', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 11:49:53', '2025-04-09 12:14:41', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የተገልጋይ ዕይታ'),
(514, 26, 122, '4.1.1 የተዘጋጀ መዋቅራዊ ማስተር ፕሊን ጥናት\nሰነዴ\n', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 11:52:37', '2025-04-09 12:16:38', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የውስጥ አሰራር ዕይታ'),
(515, 26, 122, '4.1.2 የተቀናጀ የመሰረተ ሌማት የዱዛይን እና ተያያዥ ሰነዴ ብዛት በመቶኛ (የዉሃ፣ የፍሳሽ፣ የኤላክትሪክ፣ የመንገዴ እና የቴላኮም) ', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 11:53:03', '2025-04-09 12:16:43', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የውስጥ አሰራር ዕይታ'),
(516, 26, 122, '4.1.3 የተጠናቀቀ የከርሰ ምዴር ዉሃ ቁፋሮ የዱዛይን እና ተያያዥ ሰነዴ ብዛት በቁጥር', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 11:53:18', '2025-04-09 12:16:48', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የውስጥ አሰራር ዕይታ'),
(517, 26, 122, '4.1.4 የተጠናቀቀ የዕቃ ማከማቻ መጋዘን እና ወርክ ሾፕ የዱዛይን እና ተያያዥ ሰነዴ ብዛት በቁጥር', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 11:53:29', '2025-04-09 12:16:52', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የውስጥ አሰራር ዕይታ'),
(518, 26, 122, '4.1.5 የተጠናቀቀ B+G+12 ቅይጥ ህንፃ የዱዛይን እና ተያያዥ ሰነዴ ብዛት በቁጥር', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 11:55:56', '2025-04-09 12:17:55', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የውስጥ አሰራር ዕይታ'),
(519, 26, 122, '4.1.6 በፓርኩ የፋይበር መስመር ዱዛይን ሊይ የተከነወነ ማሻሻያ በሰነዴ ብዛት', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 11:56:05', '2025-04-09 12:18:01', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የውስጥ አሰራር ዕይታ'),
(520, 26, 122, '4.1.7 የተጠናቀቀ የኤላክትሪከ ሰብስቴሽን ዱዛይንና ተያያዥ ሰነዴ ብዛት በቁጥር', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 11:56:37', '2025-04-09 12:18:06', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የውስጥ አሰራር ዕይታ'),
(521, 26, 122, '4.1.8 የተጠናቀቀ የውስጥ ሇውስጥ አገናኝ መንገዴ ዱዛይንና ተያያዥ ሰነዴ ብዛት', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 11:56:48', '2025-03-13 11:56:48', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የውስጥ አሰራር ዕይታ'),
(522, 26, 125, '4.2.1 የተገነቡ 2 የግቢ መግቢያ እና መዉጫ ዋና በሮች እና ላልች 3 ተጨማሪ በሮች ብዛት', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 12:01:32', '2025-04-09 12:18:13', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የውስጥ አሰራር ዕይታ'),
(523, 26, 125, '4.2.2 በተመረጡ ቦታዎች የተገነቡ የመኪና ማቆሚያዎች ብዛት (ሇ2 አዲዱስ ቦታዎች እና ሇነባር ህንፃዎች አገሌግልት የሚውለ)', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 12:02:14', '2025-03-13 12:02:14', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የውስጥ አሰራር ዕይታ'),
(524, 26, 125, '4.2.3 የፓርኩን ዯህንነትና ጥበቃ ሇማጠናከር እና ገጽታ ሇመጨመር የተገነባ አጥር (በኪ. ሜትር)', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 12:02:23', '2025-03-13 12:02:23', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የውስጥ አሰራር ዕይታ'),
(525, 26, 125, '4.2.4 ግንባታው የተጠናቀቀ የከርሰ ምዴር ዉሃ ጉዴጓዴ ቁፋሮ (የጉዴጓዴ ብዛት በቁጥር)', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 12:02:30', '2025-04-09 12:18:19', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የውስጥ አሰራር ዕይታ'),
(526, 26, 125, '4.2.5 በ2000 ካሬ ሜትር ቦታ ሊይ የተገነባ የዕቃ ማከማቻ መጋዘን እና ዎርክሾፕ (ብዛት በቁጥር) ', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 12:02:47', '2025-04-09 12:18:25', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የውስጥ አሰራር ዕይታ'),
(527, 26, 125, '4.2.6 የተገነባ የኤላክትሪክ ሀይሌ ሰብስቴሽን (በሜ.ጋ ዋት) ', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 12:03:02', '2025-04-09 12:18:29', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የውስጥ አሰራር ዕይታ'),
(528, 26, 125, '4.2.7 ለፌዴራል ፖሉስ መገሌገያ የተገነባ ካምፕ (በቁጥር)', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 12:03:36', '2025-04-09 12:18:34', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የውስጥ አሰራር ዕይታ'),
(529, 26, 125, '4.2.8 የተገነባ ላንዴ ስኬፕ (ብዛት በቁጥር)', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 12:03:59', '2025-04-09 12:18:38', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የውስጥ አሰራር ዕይታ'),
(530, 26, 125, '4.2.9 የተገነባ የውስጥ የውስጥ አገናኝ መንገዴ በኪ.ሜ. ', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 12:04:19', '2025-04-09 12:18:43', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የውስጥ አሰራር ዕይታ'),
(531, 26, 125, '4.2.10 ለጥበቃ መገሌገያ የተገነባ የጥበቃ ማማ ብዛት በቁጥር', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 12:05:02', '2025-03-13 12:05:02', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የውስጥ አሰራር ዕይታ'),
(532, 26, 125, '4.2.11 በፓርኩ የተገነባ የቪሳት ሲስተም ብዛት', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 12:05:15', '2025-04-09 12:18:48', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የውስጥ አሰራር ዕይታ'),
(533, 26, 125, '4.2.12 በፓርኩ የተዘረጉ የዯህንነት ካሜራዎች ብዛት ', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 12:05:31', '2025-04-09 12:18:51', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የውስጥ አሰራር ዕይታ'),
(534, 26, 125, '4.2.13 አዱስ የኤላክትሪክ ሀይሌ ያገኘ ህንጻ ብዛት ', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 12:05:46', '2025-04-09 12:18:55', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የውስጥ አሰራር ዕይታ'),
(535, 26, 125, '4.2.14 አዱስ የውሀ መስመር ያገኘ ህንጻ ብዛት', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 12:05:59', '2025-04-09 12:18:59', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የውስጥ አሰራር ዕይታ'),
(536, 26, 126, '4.3.1 የታዯሰ ህንጻ ብዛት', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 12:12:21', '2025-04-09 12:19:05', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የውስጥ አሰራር ዕይታ'),
(537, 26, 126, '4.3.2 የህንጻ አገሌግልት መሰረተ-ሌማትና መሰረታዊ ስትራክቸር እዴሳትና ጥገና የተዯረገሇት ህንጻ ብዛት', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 12:12:37', '2025-04-09 12:19:08', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የውስጥ አሰራር ዕይታ'),
(538, 26, 126, '4.3.3 ከ15/.4 ወደ 33/.4 ኪሎ ቮልት የተለወጠ ትራንስፎርመር ብዛት ', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 12:13:30', '2025-04-09 12:19:13', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የውስጥ አሰራር ዕይታ'),
(539, 26, 126, '4.3.4 ዕዴሳት የተደረገለት ካፊቴሪያ ስፋት በካሬ ሜትር ', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 12:13:58', '2025-03-13 12:13:58', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የውስጥ አሰራር ዕይታ'),
(540, 26, 126, '4.3.5 ዕዴሳት የተደረገለት ፓምፕ ቤት ስፋት በካሬ ሜትር', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 12:14:25', '2025-03-13 12:14:25', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የውስጥ አሰራር ዕይታ'),
(541, 26, 126, '4.3.6 እዴሳት የተደረገለት ሊንዴስኬፕ ብዛት', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 12:14:43', '2025-04-09 12:19:19', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የውስጥ አሰራር ዕይታ'),
(542, 26, 126, '4.3.7 ጥገና የተደረገለት የመንገዴ መብራት ብዛት', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 12:15:12', '2025-04-09 12:19:24', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የውስጥ አሰራር ዕይታ'),
(543, 26, 126, '4.3.8 በፓርኩ ህንፃዎች በሚኝ Public WiFi ሊይ የተከናወነ ጥገና', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 12:15:23', '2025-04-09 12:19:28', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የውስጥ አሰራር ዕይታ'),
(544, 26, 126, '4.3.9 እዴሳት የተደረገለት የዯህንነት ካሜራ ብዛት ', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 12:15:41', '2025-04-09 12:19:32', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የውስጥ አሰራር ዕይታ'),
(545, 26, 126, '4.3.10 እዴሳት የተደረገለት የአንዴ መስኮት አገሌግልት ዱጂታሌ ሲስተም ብዛት ', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 12:16:08', '2025-03-13 12:16:08', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የውስጥ አሰራር ዕይታ'),
(546, 26, 126, '4.3.11 እዴሳት የተደረገለት የጋራ መገሌገያ አዲራሽ ስፋት በካሬ ሜትር', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 12:16:33', '2025-04-09 12:19:37', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የውስጥ አሰራር ዕይታ'),
(547, 26, 127, '4.4.1 የተከናወነ የአረንጓዳ ሌማት ሽፋን በሺህ ካ/ሜ', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 12:18:05', '2025-03-13 12:18:05', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የውስጥ አሰራር ዕይታ'),
(548, 26, 127, '4.4.2 እንክብካቤ የተዯረገሇት የአረንጓዳ ሌማት ሽፋን በሺህ ካ/ሜ', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 12:18:20', '2025-04-09 12:19:42', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የውስጥ አሰራር ዕይታ'),
(549, 26, 127, '4.4.3 በዓመት አራት ጊዜ በፓርኩ በሚገኙ ዴርጅቶች ሊይ የተካሄዯ የአከባቢ ብክሇት ቁጥጥርና ክትትሌ ', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 12:18:30', '2025-04-09 12:19:45', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የውስጥ አሰራር ዕይታ'),
(550, 26, 128, '5.1.1 የፓርኩ አደረጃጀት ጥልቀት ባለው ጥናት እስከሚዘጋጅ ዴረስ ስራውን መሸከም በሚችሌ ሁኔታ ተዘጋጅቶ የጸዯቀ ጊዜያዊ አዯረጃጀት ሰነዴ', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 12:20:50', '2025-03-13 12:20:50', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የውስጥ አሰራር ዕይታ'),
(551, 26, 128, '5.1.2 ጊዜያዊ አደረጃጀትን በመከተሌ በሌዩ ሌዩ ዘዳ የተሟሊ ጠቅሊሊ የሰራተኛ ብዛት ', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 12:21:11', '2025-04-09 12:20:12', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የውስጥ አሰራር ዕይታ'),
(552, 26, 128, '5.1.3 በኮርፖሬሽኑ እና በሠራተኞች ስራ አፈጻጸም ውጤት መካከሌ ያሇውን ክፍተት በዲሰሳ ጥናት በመሇየት የተሰጠ የአቅም ግንባታ ስሌጠና ብዛት ', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 12:21:27', '2025-04-09 12:23:23', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የመማማርና ዕድገት ዕይታ'),
(553, 26, 128, '5.1.4 የመካከልለኛና የረጅም ጊዜ ስሌጠና የተሰጣቸው የኮርፖሬሽኑ ሠራተኞች ብዛት (ሇ3 ሠራተኞች የመካከሇኛ ጊዜ፣ ሇ5 ሠራተኞች የአጭር ጊዜ እና ሇ2 ሠራተኞች የረጅም ጊዜ)', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 12:21:50', '2025-04-09 12:23:29', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የመማማርና ዕድገት ዕይታ'),
(554, 26, 128, '5.1.5 በተመሳሳይ የስራ ባህሪያቸው በተመረጡ ዓሇም አቀፍ ተወዲዲሪ ፓርኮች ጋር በ2 ዙር የሌምዴ ሌውውጥ (ምርጥ ተሞክሮ) የወሰደ የኮርፖሬሽኑ ሠራተኞች ብዛት', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 12:22:06', '2025-03-13 12:22:06', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, ''),
(555, 26, 128, '5.1.6 ከተለያዩ የሌማት አጋሮች ጋር በመተባር የሥራ ሊይ ሌምምዴ በማዴረግ አቅማቸውን አጎሌብተው እየሰሩ በሚገኙባቸው ዴርጅቶች ውስጥ ባለበት እንዱቆዩ የተዯረጉ ወይም ሥራ ፈጣሪ የሆኑ ሰዎች ብዛት', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 12:22:22', '2025-04-09 12:23:54', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የመማማርና ዕድገት ዕይታ'),
(556, 26, 128, '5.1.7 የISO ስታንዲርዴ በፓርኩ ሊይ ተግባራዊ ሇማዴረግ የተዘጋጀ የቅዴመ ዝግጅት ሰነዴ', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 12:22:38', '2025-04-09 12:23:58', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የመማማርና ዕድገት ዕይታ'),
(557, 26, 128, '5.1.8 ለፓርኩ የተሰጠ ISO ስታንዲርዴ የምስክር ወረቀት ብዛት በቁጥር', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 12:23:00', '2025-04-09 12:24:07', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የመማማርና ዕድገት ዕይታ'),
(558, 26, 129, '5.2.1 በንዑስ ሉዝ መሬት ከወሰደ ካምፓኒዎች የተሰበሰበ ገቢ (የተፈጸመ የሉዝ ክፍያ) በሺህ ብር', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 12:25:06', '2025-04-09 12:27:41', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የፋይናንስ ዕይታ'),
(559, 26, 129, '5.2.2 በንዑስ ሉዝ መሬት ከወሰደ ካምፓኒዎች በድሊር የተሰበሰበ ገቢ (የተፈጸመ የሉዝ ክፍያ) በሺህ ድሊር', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 12:25:21', '2025-04-09 12:27:45', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የፋይናንስ ዕይታ'),
(560, 26, 129, '5.2.3 የህንጻ ኪራይ ከወሰደ ካምፓኒዎች በብር የተሰበሰበ ገቢ (የተፈጸመ የኪራይ ክፍያ) በሺህ ብር', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 12:25:28', '2025-03-13 12:25:28', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የፋይናንስ ዕይታ'),
(561, 26, 129, '5.2.4 የህንጻ ኪራይ ከወሰደ ካምፓኒዎች በድሊር የተሰበሰበ ገቢ (የተፈጸመ የኪራይ ክፍያ) በሺህ ድሊር', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 12:25:37', '2025-04-09 12:27:53', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የፋይናንስ ዕይታ'),
(562, 26, 129, '5.2.5 በዕቅድ እየተመራ ሥራ ሊይ የዋለ መበኛ በጀት በሚ ብር ', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 12:25:45', '2025-04-09 14:03:07', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የፋይናንስ ዕይታ'),
(563, 26, 129, '5.2.6 በዕቅድ እየተመራ ሥራ ሊይ የዋለ ካፒታሌ በጀት በሚ ብር', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 12:25:59', '2025-04-09 14:02:03', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የፋይናንስ ዕይታ'),
(564, 26, 129, '5.2.7 ከሌሎች የገቢ ምንጮች የተሰበሰበ ገቢ በሺህ ብር ', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 12:26:07', '2025-04-09 14:01:43', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የፋይናንስ ዕይታ'),
(565, 26, 129, '5.2.8 በግዥ ፍላጎት ላይ በመመስረተ የተዘጋጀ ዕቅድን ተከትል የተፈጸመ የጨረታ ግዥ በጊዜ ድግግሞሽ ብዛት', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 12:26:16', '2025-04-09 14:01:14', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የፋይናንስ ዕይታ'),
(566, 26, 130, '5.3.1 የኮርፖሬሽኑ በጀት በአግባቡ ጥቅም ሊይ ስለመዋሉ የተረጋገጠበት የውስጥ ኦዱት ሰነድ', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 12:28:05', '2025-04-09 14:00:13', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የውስጥ አሰራር ዕይታ'),
(567, 26, 130, '5.3.2 የኮርፖሬሽኑ ዕቃ/አገሌግልት ግዥ በአግባቡ ሰለመካሄዱ የተረጋገጠበት የውስጥ ኦዱት ሰነድ', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 12:28:14', '2025-04-09 13:59:44', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የውስጥ አሰራር ዕይታ'),
(568, 26, 130, '5.3.3 የኮርፖሬሽኑ ንብረትና የተሸከርካሪ አያያዝና አጠቃቀም በአግባቡ ስአለመፈጸሙ የተረጋገጠበት የውስጥ ኦዱት ሰነድ', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 12:28:24', '2025-04-09 13:59:05', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የውስጥ አሰራር ዕይታ'),
(569, 26, 131, '5.4.1 የተከናወነ የንብረት ቆጠራና ምዝገባ የተከናወነበት የጊዜ ድግግሞሽ ብዛት', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 12:29:49', '2025-04-09 13:55:44', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የውስጥ አሰራር ዕይታ'),
(570, 26, 131, '5.4.2 የሚወገዱ ንብረቶች ተለይተው ለውሳኔ የቀረቡበት ሰነድ', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 12:30:02', '2025-04-09 13:53:06', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የውስጥ አሰራር ዕይታ'),
(571, 26, 131, '5.4.3 የኮርፖሬሽኑ ሥራ የዋለ የትራንስፖርት አገልግሎት በተሸከርካሪ ብዛት', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 12:30:40', '2025-04-09 13:51:19', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የውስጥ አሰራር ዕይታ'),
(572, 26, 132, '5.5.1 በኮርፖሬሽኑ የተዘረጋ የኮርፖሬት ኢንተርፕራይዝ ሪሶርስ ፕሊኒንግ (ERP) ሥርዓት', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 12:32:02', '2025-04-09 13:30:14', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የውስጥ አሰራር ዕይታ'),
(573, 26, 132, '5.5.2 የተተገበረ የኢንተርፕራይዝ ኢሜይሌ ሥርዓት ብዛት', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 12:32:10', '2025-04-09 13:32:02', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የውስጥ አሰራር ዕይታ'),
(574, 26, 132, '5.5.3 የIT ዘርፉን ታሳቢ በማድረግ ከሚመለከተው አካል ጋር በመተባበር የተከፈተ አንድ ዲጂታል ሊይብረሪ', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 12:32:19', '2025-04-09 13:49:41', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የውስጥ አሰራር ዕይታ'),
(575, 26, 133, ' 5.6.1 የተከናወነ ሀገር አቀፍ የኢኖቬሽን ውድድር (Innovation challenge) ብዛት', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 12:33:48', '2025-04-09 13:48:45', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የውስጥ አሰራር ዕይታ'),
(576, 26, 133, '5.6.2 ፓርኩን ለማስተዋወቅ ሥራ ሊይ የዋለ የማስታወቂያ ዘዳዎች ብዛት', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 12:34:13', '2025-03-13 12:34:13', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የውስጥ አሰራር ዕይታ'),
(577, 26, 134, '5.7.1 በህግ ጉዲዮች ሊይ የተሰጠ የማማከር አገሌግልት ብዛት ', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 12:37:51', '2025-04-09 13:32:15', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የውስጥ አሰራር ዕይታ'),
(578, 26, 134, '5.7.2 የተተገበሩ የኮርፖሬሽኑ ጥቅም ማስጠበቂያ ኬዞች ብዛት ', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 12:37:56', '2025-03-13 12:37:56', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የውስጥ አሰራር ዕይታ'),
(579, 26, 134, '5.7.3 አዲስ የተፈጸመ የመሬት ንዑስ ሊዝ ውል በሰነድ ብዛት ', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 12:38:03', '2025-04-09 13:47:09', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የውስጥ አሰራር ዕይታ'),
(580, 26, 134, '5.7.4 የመሬት ንዑስ ሊዝ ከወሰደ ድርጅቶች ጋር በጥበቃና መሰል ጉዳዮች ላይ የተፈጸመ አዲስ ውል በሰነዴ ብዛት', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 12:38:15', '2025-04-09 13:46:44', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የውስጥ አሰራር ዕይታ'),
(581, 26, 134, '5.7.5 አዲስ የተዘጋጁ የህንጻ ኪራይ ውል በውሌ ሰነድ ብዛት ', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 12:38:23', '2025-04-09 13:47:23', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የውስጥ አሰራር ዕይታ'),
(582, 26, 134, '5.7.6 የአፈጻጸም ክትትል የተደረገባቸው ሌዩ ሌዩ ውልች በውል ሰነድ ብዛት', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 12:38:36', '2025-04-09 13:47:16', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የውስጥ አሰራር ዕይታ'),
(583, 26, 134, '5.7.8 የፓርኩን ጸጥታና ደህንነት የማጠናከር የተዘጋጁ መድረኮች/ስምምነቶች ብዛት', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 12:38:45', '2025-04-09 13:45:27', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የውስጥ አሰራር ዕይታ'),
(584, 26, 135, ' 5.8.1 የተዘጋጁ ሌዩ ሌዩ ማንዋልች ብዛት (ከዲዛይንና ግንባታ ፈቃዴ፣ ከባለሀብቶች ህንጻ አጠቃቀም እና ከኪራይ ቢሮ አጠቃቀም ጋር የተያያዘ)', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 12:40:38', '2025-04-09 13:45:01', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የውስጥ አሰራር ዕይታ'),
(585, 26, 135, '5.8.2 ተሻሽለው የጸደቁ ሰራተኛና አሰሪን የሚመሇከቱ የተሇያዩ መመሪያዎች ብዛት (የሥራ መሪዎች መተዲደሪያ ደንብ፤ የሰራተኞች አስተዲደር፤ የጤናና ጥቅማ ጥቅሞች እንዱሁም የትምህርትና ስሌጠና መመሪያ)', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 12:40:45', '2025-04-09 13:44:29', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የውስጥ አሰራር ዕይታ'),
(586, 26, 136, '5.9.1 ከትምህርት ተቋማት ጋር የተደረገ ስምምነት ብዛት', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 12:43:44', '2025-04-09 13:43:16', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የተገልጋይ ዕይታ'),
(587, 26, 136, '5.9.2 በአይሲቲ ዘርፍ ከተደራጁ ማህበራት ጋር የተደረገ ስምምነት ብዛት', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 12:43:51', '2025-04-09 13:42:55', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የተገልጋይ ዕይታ'),
(588, 26, 136, '5.9.3 ከልማት አጋሮች ጋር የተደረገ ስምምነት ብዛት', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 12:43:57', '2025-04-09 13:42:37', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የተገልጋይ ዕይታ'),
(589, 26, 136, '5.9.4 ከአገልግሎት ሰጪ ድርጅቶች ጋር የተዯረገ ስምምነት ብዛት ', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 12:44:04', '2025-04-09 13:42:22', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የተገልጋይ ዕይታ'),
(590, 26, 136, '5.9.5 ከአለም አቀፍ ድርጅቶችና ማህበራት ጋር የተፈጠረ ትብብር ብዛት ', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 12:44:35', '2025-04-09 13:41:58', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የተገልጋይ ዕይታ'),
(591, 26, 136, '5.9.6 የተፈጠረ ስትራተጂያዊ ሽርክና/ ፓርትነርሽፕ ብዛት ', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 12:44:51', '2025-04-09 13:33:58', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የተገልጋይ ዕይታ'),
(592, 26, 137, '5.10.1 በጥናት የተለዩ የቢዝነስ እድሎች ብዛት', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 12:46:24', '2025-04-09 13:41:38', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የፋይናንስ ዕይታ'),
(593, 26, 137, '5.10.2 ከተባባሪዎች ጋር የሇሙ የቢዝነስ እዴሎች ብዛት', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 12:46:32', '2025-04-09 13:39:47', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የፋይናንስ ዕይታ'),
(594, 26, 137, '5.10.3 ከፓርኩ ንዋሪዎች ጋር የተተገበሩ የገቢ ስራዎቸ ብዛት', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 12:46:41', '2025-03-13 12:46:41', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የፋይናንስ ዕይታ'),
(595, 26, 137, '5.10.4 ከፓርኩ ንዋሪዎች ጋር በትብብር በመስራት የተገኘ ገቢ በሺህ ብር', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 12:46:49', '2025-04-09 13:35:21', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የፋይናንስ ዕይታ'),
(596, 26, 137, '5.10.5 ለነዋሪዎች የሚቀርቡ አገልግሎቶችን ዋጋ ለመተመን የተደረገ ጥናት ብዛት', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 12:47:14', '2025-04-09 13:39:21', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የፋይናንስ ዕይታ'),
(597, 26, 137, '5.10.6 ለነዋሪዎች በክፍያ ከሚቀርቡ አገሌግልቶች የተገኘ ገቢ በሺህ ብር', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 12:47:33', '2025-04-09 13:35:29', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የፋይናንስ ዕይታ'),
(598, 26, 138, '5.11.1 የተዘጋጁ የገንዘብ ማፈላለጊያ \nፕሮፖዛልች ብዛት ', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 12:49:21', '2025-04-09 13:38:57', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የፋይናንስ ዕይታ'),
(599, 26, 138, '5.11.2 የተተገበሩ የገቢ ማስገኛ ፕሮጅክቶች ብዛት', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 12:49:28', '2025-04-09 13:35:38', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የፋይናንስ ዕይታ'),
(600, 26, 138, '5.11.3 ከለጋሽ/ተባባሪ አካሊት የተገኘ ዴጋፍ \nበሺህ ብር ', NULL, NULL, NULL, NULL, 0.00, '2025-03-13 12:49:38', '2025-04-09 13:37:41', 'Q1', NULL, '', 0, '', 0, 'started', NULL, NULL, 'የፋይናንስ ዕይታ'),
(602, 40, 139, 'test spesific detail ', NULL, NULL, NULL, NULL, 0.00, '2025-12-11 07:42:44', '2025-12-11 07:42:44', 'Q1', NULL, 'አስፈላጊ', 2, 'test spesific detail ', 1, 'started', NULL, NULL, 'የፋይናንስ ዕይታ'),
(603, 40, 140, 'specific objective detail test 2', NULL, NULL, NULL, NULL, 0.00, '2025-12-11 08:31:01', '2025-12-11 08:31:01', 'Q1', NULL, 'አስፈላጊ', 2, 'specific objective detail test 2', 1, 'started', NULL, NULL, 'የተገልጋይ ዕይታ'),
(604, 40, 141, 'my test', NULL, NULL, NULL, NULL, 0.00, '2026-03-10 08:03:20', '2026-03-10 08:03:20', 'Q1', NULL, 'አስፈላጊ', 2, 'my test', 1, 'started', NULL, NULL, 'የመማማርና ዕድገት ዕይታ');

-- --------------------------------------------------------

--
-- Table structure for table `specific_objective_details`
--

CREATE TABLE `specific_objective_details` (
  `specific_objective_detail_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `specific_objective_detailname` varchar(255) NOT NULL,
  `details` text DEFAULT NULL,
  `baseline` varchar(255) DEFAULT NULL,
  `plan` text DEFAULT NULL,
  `measurement` text DEFAULT NULL,
  `execution_percentage` decimal(5,2) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `year` int(11) NOT NULL,
  `month` int(11) DEFAULT NULL,
  `day` int(11) DEFAULT NULL,
  `deadline` date DEFAULT NULL,
  `status` varchar(50) NOT NULL,
  `priority` varchar(20) NOT NULL,
  `department_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` varchar(100) NOT NULL,
  `count` int(100) NOT NULL,
  `outcome` decimal(10,2) DEFAULT NULL,
  `progress` enum('started','on going','completed') NOT NULL DEFAULT 'started',
  `created_by` varchar(255) NOT NULL,
  `specific_objective_id` int(11) DEFAULT NULL,
  `plan_type` varchar(255) DEFAULT NULL,
  `income_exchange` varchar(255) DEFAULT NULL,
  `cost_type` varchar(255) DEFAULT NULL,
  `employment_type` varchar(255) DEFAULT NULL,
  `incomeName` varchar(255) DEFAULT NULL,
  `costName` varchar(255) DEFAULT NULL,
  `attribute` text DEFAULT NULL,
  `CIbaseline` decimal(15,2) DEFAULT NULL,
  `CIplan` decimal(15,2) DEFAULT NULL,
  `CIoutcome` decimal(15,2) DEFAULT NULL,
  `CIexecution_percentage` decimal(5,2) DEFAULT NULL,
  `editing_status` enum('active','deactivate') NOT NULL DEFAULT 'active',
  `reporting` enum('active','deactivate') NOT NULL DEFAULT 'active',
  `goal_id` int(11) DEFAULT NULL,
  `project_type` varchar(255) DEFAULT NULL,
  `income_plan_type` varchar(255) DEFAULT NULL,
  `employee_of` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `specific_objective_details`
--

INSERT INTO `specific_objective_details` (`specific_objective_detail_id`, `user_id`, `specific_objective_detailname`, `details`, `baseline`, `plan`, `measurement`, `execution_percentage`, `created_at`, `updated_at`, `year`, `month`, `day`, `deadline`, `status`, `priority`, `department_id`, `name`, `description`, `count`, `outcome`, `progress`, `created_by`, `specific_objective_id`, `plan_type`, `income_exchange`, `cost_type`, `employment_type`, `incomeName`, `costName`, `attribute`, `CIbaseline`, `CIplan`, `CIoutcome`, `CIexecution_percentage`, `editing_status`, `reporting`, `goal_id`, `project_type`, `income_plan_type`, `employee_of`) VALUES
(779, 40, 'cost 1', 'cost 1', '0', '100', 'present', 100.00, '2025-11-24 13:08:36', '2025-11-24 13:52:23', 2020, 8, 2, '2025-11-25', 'Pending', 'መደበኛ', 2, 'cost 1', 'cost 1', 1, 99.98, 'started', 'Ezira', 548, 'cost', NULL, 'regular_budget', NULL, NULL, 'Fuel Allowance', NULL, 0.00, 1000.00, 1000.00, 100.00, 'active', 'active', 90, NULL, NULL, NULL),
(780, 40, 'capital cost', 'capital cost', '0', '100', 'present', 100.00, '2025-11-24 13:10:30', '2025-11-24 13:44:38', 2020, 2, 2, '2025-12-05', 'Pending', 'በጣም አስፈላጊ', 2, 'capital cost', 'capital cost', 1, 100.00, 'started', 'Ezira', 475, 'cost', NULL, 'capital_project_budget', NULL, NULL, 'Infrstructure Consultancy', NULL, 0.00, 100.00, 100.00, 100.00, 'active', 'active', 88, NULL, NULL, NULL),
(781, 40, 'income ETB', 'income ETB', '0', '100', 'present', 100.00, '2025-11-24 13:11:48', '2025-11-24 13:45:08', 2020, 6, 2, '2025-12-13', 'Pending', 'በጣም አስፈላጊ', 2, 'income ETB', 'income ETB', 1, 100.00, 'started', 'Ezira', 475, 'income', 'etb', NULL, NULL, NULL, NULL, NULL, 0.00, 1000.00, 1000.00, 100.00, 'active', 'active', 88, NULL, NULL, NULL),
(782, 40, 'income USD', 'income USD', '0', '100', 'present', 100.00, '2025-11-24 13:13:39', '2025-11-24 13:46:48', 2020, 4, 2, '2025-11-29', 'Pending', 'አስፈላጊ', 2, 'income USD', 'income USD', 1, 100.00, 'started', 'Ezira', 505, 'income', 'usd', NULL, NULL, NULL, NULL, NULL, 1.00, 1000.00, 1000.01, 100.00, 'active', 'active', 89, NULL, NULL, NULL),
(783, 40, 'imployee fulltime', 'imployee fulltime', '0', '100', 'present', 100.00, '2025-11-24 13:15:27', '2025-11-24 13:47:14', 2020, 12, 2, '2025-11-29', 'Pending', 'በጣም አስፈላጊ', 2, 'imployee fulltime', 'imployee fulltime', 1, 100.00, 'started', 'Ezira', 562, 'hr', NULL, NULL, 'full_time', NULL, NULL, NULL, 0.00, 6.00, 6.00, 100.00, 'active', 'active', 91, NULL, NULL, NULL),
(784, 40, 'employees-contrat', 'employees-contrat', '0', '100', 'present', 100.00, '2025-11-24 13:17:03', '2025-11-24 13:48:06', 2020, 11, 2, '2025-12-06', 'Pending', 'በጣም አስፈላጊ', 2, 'employees-contrat', 'employees-contrat', 1, 100.00, 'started', 'Ezira', 573, 'hr', NULL, NULL, 'contract', NULL, NULL, NULL, 0.00, 4.00, 4.00, 100.00, 'active', 'active', 91, NULL, NULL, NULL),
(785, 40, 'erp system', 'erp system', '0', '100', 'present', 100.00, '2025-11-24 13:18:43', '2025-11-27 11:27:45', 2020, 3, 9, '2025-12-06', 'Pending', 'በጣም አስፈላጊ', 2, 'erp system', 'erp system', 1, 100.00, 'started', 'Ezira', 475, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, NULL, NULL, 'active', 'active', 88, NULL, NULL, NULL),
(786, 40, 'building project', 'building project', '0', '100', 'present', NULL, '2025-11-24 13:19:54', '2025-11-24 13:19:54', 2020, 10, 7, '2025-12-06', 'Pending', 'በጣም አስፈላጊ', 2, 'building project', 'building project', 1, NULL, 'started', 'Ezira', 479, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, NULL, NULL, 'active', 'active', 88, NULL, NULL, NULL),
(787, 40, 'house rent ', 'house rent ', '0', '100', 'present', NULL, '2025-11-25 13:55:36', '2025-11-25 13:55:36', 2020, 3, 12, '2025-12-06', 'Pending', 'በጣም አስፈላጊ', 2, 'house rent ', 'house rent ', 1, NULL, 'started', 'Ezira', 475, 'income', 'etb', NULL, NULL, NULL, NULL, NULL, 0.00, 50000.00, NULL, NULL, 'active', 'active', 88, NULL, NULL, NULL),
(788, 40, 'my-attendances', 'ወጪ ስም', '0', '100', 'present', NULL, '2025-11-25 14:03:02', '2025-11-25 14:03:02', 2020, 9, 22, '2025-11-29', 'Pending', 'አስፈላጊ', 2, 'my-attendances', 'ወጪ ስም', 1, NULL, 'started', 'Ezira', 475, 'income', 'etb', NULL, NULL, 'ከመሬት ንኡስ ሊዝ', NULL, NULL, 0.00, 100.00, NULL, NULL, 'active', 'active', 88, NULL, NULL, NULL),
(789, 40, 'service assignment', 'wewe', '0', '100', 'present', NULL, '2025-11-26 08:59:33', '2025-11-26 08:59:33', 2000, 11, 12, '2025-11-28', 'Pending', 'በጣም አስፈላጊ', 2, 'service assignment', 'wewe', 1, NULL, 'started', 'Ezira', 475, 'cost', NULL, 'regular_budget', NULL, NULL, 'Bonus', NULL, 0.00, 100.00, NULL, NULL, 'active', 'active', 88, NULL, NULL, NULL),
(790, 40, 'የኢንቨስትመንት ማሳደጊያ ፕሮግራም', 'የውጭ ኢንቨስትመንት ለመሳብ የሚደረግ ጥረት', '100', '500', 'በሚሊዮን ብር', NULL, '2025-11-27 08:46:05', '2025-11-27 08:46:05', 2025, 6, 27, '2026-02-25', 'Pending', 'አስፈላጊ', 2, 'የኢንቨስትመንት ማሳደጊያ ፕሮግራም', 'የውጭ ኢንቨስትመንት ለመሳብ የሚደረግ ጥረት', 1, NULL, 'started', 'Ezira', 461, 'cost', NULL, 'capital', NULL, NULL, 'infrastructure', NULL, 1000000.00, 5000000.00, NULL, NULL, 'active', 'active', 87, NULL, NULL, NULL),
(791, 40, 'service assignment', 'fasfas', '0', '100', 'present', NULL, '2025-11-27 08:48:35', '2025-11-27 08:48:35', 2000, 6, 12, '2025-12-06', 'Pending', 'አስፈላጊ', 2, 'service assignment', 'fasfas', 1, NULL, 'started', 'Ezira', 478, 'income', 'usd', NULL, NULL, 'ከህንጻ ኪራይ', NULL, NULL, 0.00, 100.00, NULL, NULL, 'active', 'active', 88, NULL, NULL, NULL),
(792, 40, 'my-attendances', 'taeawa', '0', '100', 'present', NULL, '2025-11-27 13:56:41', '2025-11-27 13:56:41', 2020, 4, 1, '2025-12-06', 'Pending', 'መደበኛ', 2, 'my-attendances', 'taeawa', 1, NULL, 'started', 'Ezira', 495, 'cost', NULL, 'regular_budget', NULL, NULL, 'Cash Indemnity Allowance', NULL, 0.00, 100.00, NULL, NULL, 'active', 'active', 89, NULL, NULL, NULL),
(793, 40, 'transport', 'test', '0', '100', 'present', NULL, '2025-12-11 12:27:37', '2025-12-11 12:27:37', 2024, 2, 10, '2026-01-03', 'Pending', 'በጣም አስፈላጊ', 2, 'transport', 'test', 1, NULL, 'started', 'Ezira', 603, 'cost', NULL, 'regular_budget', NULL, NULL, 'Building Insurance', NULL, 0.00, 1000.00, NULL, NULL, 'active', 'active', 95, NULL, NULL, NULL),
(794, 40, 'my-attendances', 'test', '0', '100', 'present', NULL, '2025-12-11 12:33:55', '2025-12-11 12:33:55', 1221, 2, 1, '2026-01-03', 'Pending', 'በጣም አስፈላጊ', 2, 'my-attendances', 'test', 1, NULL, 'started', 'Ezira', 603, 'hr', NULL, NULL, 'full_time', NULL, NULL, NULL, 0.00, 100.00, NULL, NULL, 'active', 'active', 95, NULL, NULL, NULL),
(795, 25, 'test0', 'test0', '0', '12', 'present', NULL, '2025-12-11 13:24:05', '2025-12-11 13:38:43', 2025, 11, 29, '2026-03-14', 'Pending', 'አስፈላጊ', 2, 'test0', 'test0', 1, NULL, 'started', 'olana', 603, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, NULL, NULL, 'active', 'active', 95, NULL, NULL, NULL),
(796, 25, 'service assignment', 'yest', '0', '100', 'present', NULL, '2025-12-11 16:30:12', '2025-12-11 16:30:12', 2025, 11, 30, '2026-01-02', 'Pending', 'አስፈላጊ', 2, 'service assignment', 'yest', 1, NULL, 'started', 'olana', 523, 'cost', NULL, 'regular_budget', NULL, NULL, 'Basic Salary Expense', NULL, 0.00, 100.00, NULL, NULL, 'active', 'active', 90, NULL, NULL, NULL),
(797, 40, 'service assignment', 'service assignment', '0', '12', 'present', NULL, '2025-12-15 07:52:34', '2025-12-15 07:52:34', 2025, 11, 12, '2027-05-15', 'Pending', 'አስፈላጊ', 2, 'service assignment', 'service assignment', 1, NULL, 'started', 'Ezira', 602, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, NULL, NULL, 'active', 'active', 94, NULL, NULL, NULL),
(798, 40, 'pharmacy', 'pharmacy', '0', '24', 'present', NULL, '2025-12-15 09:21:02', '2025-12-15 09:21:02', 2025, 11, 30, '2026-01-03', 'Pending', 'አስፈላጊ', 2, 'pharmacy', 'pharmacy', 1, NULL, 'started', 'Ezira', 602, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, NULL, NULL, 'active', 'active', 94, NULL, NULL, NULL),
(799, 40, 'enterprice', 'enterprice', '0', '100', 'present', NULL, '2025-12-15 12:15:11', '2025-12-15 12:15:11', 2025, 12, 7, '2025-12-17', 'Pending', 'አስፈላጊ', 2, 'enterprice', 'enterprice', 1, NULL, 'started', 'Ezira', 602, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, NULL, NULL, 'active', 'active', 94, NULL, NULL, NULL),
(800, 40, 'enterprice', 'enterprice', '0', '6', 'present', NULL, '2025-12-15 12:27:58', '2025-12-15 12:27:58', 2025, 12, 17, '2025-12-26', 'Pending', 'አስፈላጊ', 2, 'enterprice', 'enterprice', 1, NULL, 'started', 'Ezira', 602, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, NULL, NULL, 'active', 'active', 94, NULL, NULL, NULL),
(801, 76, 'gatehring System Requerment', 'gatehring System Requerment', '0', '20', 'present', NULL, '2025-12-16 13:21:32', '2025-12-16 13:21:32', 2025, 11, 29, '2026-01-24', 'Pending', 'በጣም አስፈላጊ', 18, 'gatehring System Requerment', 'gatehring System Requerment', 1, NULL, 'started', 'Hayal', 602, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, NULL, NULL, 'active', 'active', 94, NULL, NULL, NULL),
(802, 78, 'የኢንቨስትመንት ማሳደጊያ ፕሮግራም', 'የውጭ ኢንቨስትመንት ለመሳብ የሚደረግ ጥረት', '100', '500', 'በሚሊዮን ብር', NULL, '2025-12-16 18:36:52', '2025-12-16 18:36:52', 2025, 6, 16, '2026-03-16', 'Pending', 'አስፈላጊ', 15, 'የኢንቨስትመንት ማሳደጊያ ፕሮግራም', 'የውጭ ኢንቨስትመንት ለመሳብ የሚደረግ ጥረት', 1, NULL, 'started', 'simegnew', 461, 'cost', NULL, 'capital', NULL, NULL, 'infrastructure', NULL, 1000000.00, 5000000.00, NULL, NULL, 'active', 'active', 87, NULL, NULL, NULL),
(803, 40, 'test', '000', '0', '12', 'present', NULL, '2026-03-09 07:07:53', '2026-03-09 07:07:53', 2026, 3, 9, '2026-03-10', 'Pending', 'አስፈላጊ', 2, 'test', '000', 1, NULL, 'started', 'Ezira', 560, 'income', 'usd', NULL, NULL, 'import_export_substitution', NULL, NULL, 0.00, 100000.00, NULL, NULL, 'active', 'active', 91, NULL, NULL, NULL),
(804, 40, 'my-resignations', '0000', '0', '89', 'present', NULL, '2026-03-09 07:17:41', '2026-03-09 07:17:41', 2032, 6, 9, '2032-06-17', 'Pending', 'በጣም አስፈላጊ', 2, 'my-resignations', '0000', 1, NULL, 'started', 'Ezira', 568, 'general', NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, NULL, NULL, 'active', 'active', 91, NULL, NULL, NULL),
(805, 40, 'my-resignations', 'test', '0', '12', 'present', NULL, '2026-03-09 08:16:34', '2026-03-09 08:16:34', 2024, 1, 9, '2026-03-11', 'Pending', 'በጣም አስፈላጊ', 2, 'my-resignations', 'test', 1, NULL, 'started', 'Ezira', 567, 'general', NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, NULL, NULL, 'active', 'active', 91, NULL, NULL, NULL),
(806, 40, 'my-resignations', 'my test', '0', '100', 'present', NULL, '2026-03-10 08:05:45', '2026-03-10 08:05:45', 2018, 7, 28, '2026-05-29', 'Pending', 'አስፈላጊ', 2, 'my-resignations', 'my test', 1, NULL, 'started', 'Ezira', 604, 'general', NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, NULL, NULL, 'active', 'active', 96, NULL, NULL, NULL),
(807, 40, 'doing some thing ', 'doing some thing ', '0', '100', 'present', NULL, '2026-03-11 11:12:08', '2026-03-11 11:12:08', 2018, 7, 1, '2026-05-29', 'Pending', 'በጣም አስፈላጊ', 2, 'doing some thing ', 'doing some thing ', 1, NULL, 'started', 'Ezira', 604, 'income', 'usd', NULL, NULL, 'lease_land', NULL, NULL, 0.00, 1000000.00, NULL, NULL, 'active', 'active', 96, NULL, 'internal', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `supervisor_comments`
--

CREATE TABLE `supervisor_comments` (
  `comment_id` int(11) NOT NULL,
  `plan_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `parent_comment_id` int(11) DEFAULT NULL,
  `comment_text` text NOT NULL,
  `comment_type` enum('comment','reply') NOT NULL DEFAULT 'comment',
  `is_edited` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `supervisor_comments`
--

INSERT INTO `supervisor_comments` (`comment_id`, `plan_id`, `user_id`, `parent_comment_id`, `comment_text`, `comment_type`, `is_edited`, `created_at`, `updated_at`) VALUES
(18, 237, 25, NULL, 'do some thin g here', 'comment', 0, '2025-11-27 08:52:23', '2025-11-27 08:52:23');

-- --------------------------------------------------------

--
-- Table structure for table `tasks`
--

CREATE TABLE `tasks` (
  `task_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `priority` enum('low','medium','high') DEFAULT 'medium',
  `due_date` date DEFAULT NULL,
  `category` varchar(50) DEFAULT 'general',
  `tags` varchar(255) DEFAULT NULL,
  `status` enum('pending','in_progress','completed') DEFAULT 'pending',
  `completed_subtasks` int(11) DEFAULT 0,
  `total_subtasks` int(11) DEFAULT 0,
  `assigned_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tasks`
--

INSERT INTO `tasks` (`task_id`, `user_id`, `title`, `description`, `priority`, `due_date`, `category`, `tags`, `status`, `completed_subtasks`, `total_subtasks`, `assigned_by`, `created_at`, `updated_at`) VALUES
(1, 40, 'some issue', 'do some thing for me ', 'high', '2025-11-28', 'work', NULL, 'completed', 0, 0, 40, '2025-11-28 08:00:51', '2025-11-28 08:08:13'),
(2, 40, 'task 2 ', 'hayal ... some ', 'medium', '2025-11-26', 'urgent', NULL, 'pending', 0, 0, 40, '2025-11-28 08:02:18', '2025-11-28 08:02:18'),
(3, 25, 'some thing to do ', 'somethim\n', 'high', '2025-11-27', 'urgent', NULL, 'pending', 0, 0, 25, '2025-11-28 08:12:17', '2025-11-28 08:12:17'),
(4, 25, 'wwww', 'weqeqw', 'medium', '2025-11-27', 'general', NULL, 'completed', 0, 0, 25, '2025-11-28 08:12:55', '2025-11-28 08:28:22');

-- --------------------------------------------------------

--
-- Table structure for table `task_reminders`
--

CREATE TABLE `task_reminders` (
  `reminder_id` int(11) NOT NULL,
  `task_id` int(11) NOT NULL,
  `reminder_time` datetime NOT NULL,
  `reminder_type` varchar(50) DEFAULT 'notification',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `user_name` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `status` enum('1','0') DEFAULT '1',
  `online_flag` tinyint(1) DEFAULT 0,
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `role_id` int(11) DEFAULT NULL,
  `avatar_url` varchar(255) DEFAULT NULL,
  `password_changed_at` datetime DEFAULT NULL,
  `last_password_change` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `employee_id`, `user_name`, `password`, `created_at`, `status`, `online_flag`, `updated_at`, `role_id`, `avatar_url`, `password_changed_at`, `last_password_change`) VALUES
(6, 49, 'senayt@itpark.et', '$2b$10$ktd.Y1lVFq4EOyoKkDZnhu6yJ1JNWBykmrpmFUKMBsSo4b4/IP/7K', '2024-11-11 23:41:28', '1', 0, '2025-04-11 06:25:16', 3, '/uploads/1743579206516-photo_2025-04-02_00-29-51.jpg', NULL, NULL),
(7, 50, 'simegn@itpark.et', '$2b$10$6SbuHMtP7XMbwVdakqMr1eTCY9QIhHxabIBHgI.CZpN9wqROs8rr6', '2024-11-11 23:44:17', '1', 0, '2025-06-29 23:56:38', 5, '/uploads/1743578325155-photo_2025-04-02_00-17-31.jpg', NULL, NULL),
(13, 58, 'nebyat@itpark.et', '$2b$10$5X.XMQQMRay/6zJDdEReI.MLzAcq.ed9xBk5OO4UELVvaG2fckm5K', '2024-11-14 01:06:52', '1', 0, '2025-12-16 08:20:56', 7, '/uploads/1743579067141-photo_2025-04-02_00-29-51.jpg', NULL, NULL),
(24, 71, 'adminadmin@itp.et', '$2b$10$b5EbPdhsv7X8E9Aekdzv/eHngE6qS/57Irctvr/4xXVfYzY6Dp2ae', '2025-03-09 07:25:00', '1', 0, '2025-11-24 01:07:58', 1, '/uploads/1744027060876-hayal.jpg', NULL, NULL),
(25, 72, 'olana@itp.et', '$2b$10$zIyhU/Zh7zj33VZA.m8NsOC5sdIN95EBB7SejpM10VZUjk2Kk/oVu', '2025-03-09 07:31:21', '1', 1, '2026-03-11 14:17:41', 2, '/uploads/1758533033860-photo_2025-09-22_05-21-45.jpg', NULL, NULL),
(26, 73, 'getachew@itp.et', '$2b$10$RRnJrr5To6jpJYjhCQZtUOI2Lq58h.ZXwDZknfVfSdJ0RdjPysqZq', '2025-03-09 07:32:30', '1', 0, '2025-08-12 15:33:50', 9, '/uploads/1743579384865-photo_2025-04-02_00-30-25.jpg', NULL, NULL),
(27, 74, 'habtamua@itp.et', '$2b$10$XQS7x6DJBK0WDrManmY15u4WX07d5QJ.StT.JjnLom86FKXhbUHL6', '2025-03-13 04:26:03', '1', 0, '2025-04-08 11:28:30', 6, NULL, NULL, NULL),
(30, 77, 'walelign@itp.et', '$2b$10$y4f7LsF5rsigVqFj.yTmMOO162DWm0Og7UKPwMZQ5mvD1nKfI/eya', '2025-03-28 04:42:16', '1', 0, '2025-03-28 05:20:13', 6, NULL, NULL, NULL),
(36, 104, 'merso@itpark.et', '$2b$10$QwZKF6X8DeaYv0aG2Ck.ZurxabUhg7C6oSZObgqz2jxenA6oG3tgC', '2025-04-08 11:09:57', '1', 0, '2025-04-09 11:09:33', 6, NULL, NULL, NULL),
(37, 106, 'eskedar@itpark.et', '$2b$10$RFIb4x3.YaOAMKLfdcc.f.Fx0.sWIM53Wd/yJnnxkFtZWYH9apFVK', '2025-04-08 11:10:59', '1', 0, '2025-06-29 23:55:34', 6, '/uploads/1744374354484-photo_2025-04-02_00-29-51.jpg', NULL, NULL),
(38, 107, 'samuel@itpark.et', '$2b$10$NAJiyQBLPjs3I4mLihlcre0YQr6jvEPD7xVqqDUWwu4VU2gCrS.li', '2025-04-08 11:12:41', '1', 0, '2025-11-14 01:03:28', 8, '/uploads/1744370443189-photo_2025-04-11_03-52-50.jpg', NULL, NULL),
(39, 108, 'yesuf@itpark.et', '$2b$10$oJA4cwtDhG9U0P7qAuF0ju8iRuXmiKZIVWQV1FKkr4XgrqFqwzAs2', '2025-04-08 11:13:55', '1', 0, '2025-04-08 11:13:55', 8, NULL, NULL, NULL),
(40, 109, 'ezira@itpark.et', '$2b$10$Aewol/o0/lNUINI0oa18ueWl0BNcTCE5E36e6RjDW2AKEJ0c1gw5W', '2025-04-08 11:14:19', '1', 0, '2026-03-16 10:35:27', 1, '/uploads/1772693434219-404A0276.JPG', NULL, NULL),
(41, 110, 'yosef@itpark.et', '$2b$10$2SSKh6sgwhBG5g3zf2J1Heb9RO./BOH99gUdpBs7BSwe7ze.kxCy6', '2025-04-08 11:25:58', '1', 0, '2025-04-08 11:25:58', 8, NULL, NULL, NULL),
(42, 111, 'sintayew@itpark.et', '$2b$10$sodAFnSejmX/2YYA1xvvX.mrqrEj/.NXyyQP9Skmk3uVcElDIM5AS', '2025-04-08 11:28:45', '1', 0, '2025-04-08 11:28:45', 8, NULL, NULL, NULL),
(43, 112, 'arega@itpark.et', '$2b$10$3urSF/9HQVwO/LAbIvqrZOjqgt8QTp0LQYDbvZf1J5R728BmXPrX2', '2025-04-08 11:30:32', '1', 0, '2025-04-08 11:30:32', 8, NULL, NULL, NULL),
(44, 113, 'birtukan@itpark.et', '$2b$10$qVEVJJQyc8z.HDU/DeFEeeT4wWEtkIOf8Bb5chESXh.FSdWWrUIL2', '2025-04-08 11:32:07', '1', 0, '2025-04-08 11:32:07', 8, NULL, NULL, NULL),
(45, 114, 'sisaynesh@itpark.et', '$2b$10$THEpmJgJlnYMPb4hxtRfSeQKEWGypX755IJ4rBbppv9XMzf9BXAlW', '2025-04-08 11:33:29', '1', 0, '2025-04-08 11:33:29', 8, NULL, NULL, NULL),
(46, 115, 'yetemegn@itpark.et', '$2b$10$yvlUCiePJuwdupdsmD2cou0bqiuy0Ew2myO/rpvSWaSkfyTP44QHC', '2025-04-08 11:36:44', '1', 0, '2025-04-08 11:36:44', 8, NULL, NULL, NULL),
(47, 116, 'ermiasketeme@itpark.et', '$2b$10$peonxfeeYUyrpK5rMqjn3.iHFYyqhQW.Hf8lIFs4MwpNBDx/0.uMC', '2025-04-08 11:49:23', '1', 0, '2025-04-08 11:49:23', 5, NULL, NULL, NULL),
(48, 117, 'hayal@itpark.et', '$2b$10$cGjccRkN7zFCXGuwXxGL7.1eoMEqAOQqNG3nV0yqxdAF233QhizdG', '2025-04-08 12:05:57', '1', 0, '2025-11-11 02:17:36', 8, '/uploads/1744189498550-hayal.jpg', NULL, NULL),
(49, 118, 'desta@itpark.et', '$2b$10$GDyZerrIK.lkz8qE8nWnhe.KhhnZavLZID7fv.i9Qt/v.zqlSiP5m', '2025-04-08 12:14:44', '1', 0, '2025-04-08 12:14:44', 6, NULL, NULL, NULL),
(50, 119, 'sintayehu@itpark.et', '$2b$10$DXzaFBncpcI0Wlxoms4d2uHqkB5n6l4BQ/Dy0tvaR/D3Wc5q0b5cS', '2025-04-08 12:19:13', '1', 0, '2025-04-08 12:19:13', 8, NULL, NULL, NULL),
(51, 120, 'kasu@itpark.et', '$2b$10$QnCoXOk6z.hvB4R4LFNQGOeJ35ECgtjlMfJQ6ulUYbVqjJ991nQnW', '2025-04-08 12:20:08', '1', 0, '2025-04-08 12:20:08', 8, NULL, NULL, NULL),
(52, 122, 'wonde@itpark.et', '$2b$10$NKrqmG4UP8J3E2eAeCsmceUewxhxRDjf8DVYom3gUopacNuchemK2', '2025-04-08 12:21:20', '1', 0, '2025-04-08 12:21:20', 8, NULL, NULL, NULL),
(53, 123, 'eyasu@itpark.et', '$2b$10$MYOsvGOV5Ag5/3FWWwegCeI.1o53bAK.Pe6NB4c/k5kecxAZTng72', '2025-04-08 12:21:59', '1', 0, '2025-04-08 12:21:59', 8, NULL, NULL, NULL),
(54, 125, 'alemayehu@itpark.et', '$2b$10$kHtidFBJS1lAeZAk3N6YFelEa1oSasxbK.rZ.kpHYqTsjrKHKuLEa', '2025-04-08 12:22:49', '1', 0, '2025-04-08 12:22:49', 8, NULL, NULL, NULL),
(55, 126, 'amanuelgirma@itpark.et', '$2b$10$z0VNMfDBGITbhXjnZEix6.fNJ4vZe2mSCm5jq8eUtqvzqDYvpfI6e', '2025-04-08 12:23:02', '1', 0, '2025-04-08 12:23:02', 8, NULL, NULL, NULL),
(56, 128, 'mihretu@itpark.et', '$2b$10$02heLI.ZhHYA6xyLnVYQ..Upk6l4Wa3RiA4PikPPIS.IPAnrF3Q5W', '2025-04-08 12:24:43', '1', 0, '2025-04-08 12:24:43', 8, NULL, NULL, NULL),
(57, 129, 'birhanu@itpark.et', '$2b$10$.6BH8eoPUmUCSgalbq7n8eYHn/vmnP7s2FMKqg6vt6UfiFiDjzolq', '2025-04-08 12:25:15', '1', 0, '2025-04-08 12:25:15', 8, NULL, NULL, NULL),
(58, 130, 'melatbezu@itpark.et', '$2b$10$RoTkA75XfPYfmuD80a56MuZukYym9MwJwnUomrW42Idgvks25nTcG', '2025-04-08 12:26:35', '1', 0, '2025-04-08 12:26:35', 8, NULL, NULL, NULL),
(59, 131, 'teshale@itpark.et', '$2b$10$Ut269nuOctgezvVyFlId7.2vkAf8OX9Q6V/tSIWjvhe3M0ofvTS9m', '2025-04-08 14:07:18', '1', 0, '2025-04-08 14:07:18', 8, NULL, NULL, NULL),
(60, 132, 'getahun@itpark.et', '$2b$10$SsYR7VDhQ3oYPjyRwx9RveG.kK1X4GaGyzhuyzOgIIcMwBF2OqMYe', '2025-04-08 14:08:25', '1', 0, '2025-04-08 14:08:25', 8, NULL, NULL, NULL),
(61, 133, 'gelana@itpark.et', '$2b$10$szx/h08/Hs3A0u0lsDUW6uLCv1fP506gQ3ODzfcMWI8MfxIoL2qMO', '2025-04-08 14:09:36', '1', 0, '2025-04-08 14:09:36', 8, NULL, NULL, NULL),
(62, 134, 'tsehay@itpark.et', '$2b$10$UGNnzRoo2F0NLTaHAN9TQOqBKcgQ6FIyhk4y2klqnVV5q7rQlYth.', '2025-04-08 14:10:42', '1', 0, '2025-04-08 14:10:42', 8, NULL, NULL, NULL),
(63, 135, 'lemlem@itpark.et', '$2b$10$ZlacPpG7.rxebiyTjonEju4F/pfO6I.tN9z6Y3ibkUnMFUpvh92fa', '2025-04-08 14:11:58', '1', 0, '2025-04-08 14:11:58', 8, NULL, NULL, NULL),
(64, 136, 'walelign@itpark.et', '$2b$10$h6T1aGfli.4J81Rs8HD2FeEgebEiOSIvUU9gAhOR.SpNA0bk6UOgG', '2025-04-08 14:15:49', '1', 0, '2025-04-08 14:15:49', 8, NULL, NULL, NULL),
(65, 137, 'fetane@itpark.et', '$2b$10$hFVSW71vOYvYZV.T7.YLgum32E83vV58USL5bBEycOxTC8EFdzqsu', '2025-04-08 14:18:37', '1', 0, '2025-04-08 14:18:37', 8, NULL, NULL, NULL),
(66, 138, 'petros@itpark.et', '$2b$10$CL6oomef/SmALzPCWPyW2eyAcRkLXnnNRYpSX4oGbtJ0h5FD7dCRG', '2025-04-08 16:04:45', '1', 0, '2025-04-08 16:04:45', 8, NULL, NULL, NULL),
(67, 139, 'hayaltamrat@gmail.com', '$2b$10$cOsHat9hyhpEU8/P0UEAmO79h8epVcCBow9KLc76WCKairb5j64ei', '2025-09-11 03:37:37', '1', 0, '2025-09-15 08:31:23', 8, NULL, NULL, NULL),
(68, 141, 'Hayaltamrat1@gmail.com', '$2b$10$MSzFOJh5.ONo0LuNTbEmneOULXAzSASIJ2PJCibtN5rv0w62h/GIK', '2025-11-12 04:42:39', '1', 0, '2025-11-22 14:06:09', 7, NULL, NULL, NULL),
(69, 142, 'belete@itp.et', '$2b$10$eWJnHs3.DqxaUg2KjV2yEeWLDGw.02WSUntvuJma1Bw5vQXvr/ZjO', '2025-12-16 06:20:28', '1', 1, '2026-03-11 14:28:57', 29, NULL, NULL, NULL),
(70, 143, 'olanaabebe@itp.et', '$2b$10$uoaYznfbIaTENcmKRMOwpOKp59HLc9dViAvM9aTdfxKg4gXE/vqbK', '2025-12-16 06:24:23', '1', 0, '2025-12-17 03:46:29', 2, NULL, NULL, NULL),
(71, 144, 'walelgnabera@itp.et', '$2b$10$LZM2AAjHccID2/j0SCtNCeKm4pUdMgI1qBTVNbaeJP0Yv/qzqZWw6', '2025-12-16 07:08:28', '1', 0, '2025-12-16 07:08:28', 30, NULL, NULL, NULL),
(72, 145, 'coporateadmin@itp.et', '$2b$10$xJu0MtRguEdi2MYGI6FS2uepxQyaGTr4wH9xaQf2MQiD9cx/iZ57e', '2025-12-16 07:10:18', '1', 0, '2025-12-16 07:10:18', 31, NULL, NULL, NULL),
(73, 146, 'tsehayu@itp.et', '$2b$10$iDqYRmpdwMqaZtdDmiN/C.VqKlKET8S7CksiDCK1BbxWRViz4MvUW', '2025-12-16 07:11:54', '1', 0, '2025-12-16 09:00:49', 5, NULL, NULL, NULL),
(74, 147, 'itdepartment@itp.et', '$2b$10$Hu1n2Jgemq4WeVEbD4gOi.Wl0kYxc1s45kKk3gJyK82CfTXfce8Gm', '2025-12-16 07:15:06', '1', 0, '2025-12-16 07:15:06', 6, NULL, NULL, NULL),
(75, 148, 'softwaresection@itp.et', '$2b$10$re2aU67JJ.4Tz9DUOCKcUOyMqhgCIiF60Ukzq5c2AfnpOOywBncP2', '2025-12-16 07:16:23', '1', 0, '2025-12-16 08:59:36', 7, NULL, NULL, NULL),
(76, 149, 'hayaltamrat@itp.et', '$2b$10$JxidUyzA1q8173mK3eGjje6vvt0..2E3binD00RJ4vYV8PFhK7aY6', '2025-12-16 07:18:36', '1', 0, '2026-03-05 09:49:18', 8, '/uploads/1765888095841-1743514222367-hayal.jpg', NULL, NULL),
(77, 150, 'encubationdepartment@itp.et', '$2b$10$P78YK8xTzvyJSBByNFYCxePaaHnP8ZXRqhsZHvWCNjZYcSrunQDnW', '2025-12-16 08:51:40', '1', 0, '2025-12-16 08:51:40', 6, NULL, NULL, NULL),
(78, 151, 'simegnewasme@itp.et', '$2b$10$HP4FWLs.2/x6ol21JlwW7eHFlc81Nix8oK2G84vw9oluOyEXvKz5y', '2025-12-16 08:52:48', '1', 1, '2025-12-17 07:17:15', 7, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `user_presence`
--

CREATE TABLE `user_presence` (
  `presence_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `is_online` tinyint(1) DEFAULT 0,
  `last_seen` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `status` enum('online','away','offline','do_not_disturb') DEFAULT 'offline'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `weekly_tasks`
--

CREATE TABLE `weekly_tasks` (
  `weekly_task_id` int(11) NOT NULL,
  `monthly_task_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `weight` decimal(5,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `progress` decimal(5,2) NOT NULL DEFAULT 0.00,
  `status` enum('Pending','In Progress','Completed') NOT NULL DEFAULT 'Pending',
  `description` text DEFAULT NULL,
  `attachment` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `weekly_tasks`
--

INSERT INTO `weekly_tasks` (`weekly_task_id`, `monthly_task_id`, `name`, `weight`, `created_at`, `updated_at`, `progress`, `status`, `description`, `attachment`) VALUES
(1, 1, 'week 1 test', 1.00, '2025-12-11 13:24:05', '2025-12-11 13:24:05', 0.00, 'Pending', NULL, NULL),
(2, 1, 'week 2 test', 1.00, '2025-12-11 13:24:05', '2025-12-11 13:24:05', 0.00, 'Pending', NULL, NULL),
(3, 1, 'week 3 test', 1.00, '2025-12-11 13:24:05', '2025-12-11 13:24:05', 0.00, 'Pending', NULL, NULL),
(4, 1, 'week 4 test', 1.00, '2025-12-11 13:24:05', '2025-12-11 13:24:05', 0.00, 'Pending', NULL, NULL),
(5, 2, 'week 1 test', 1.00, '2025-12-11 13:24:05', '2025-12-11 13:24:05', 0.00, 'Pending', NULL, NULL),
(6, 2, 'week 1 test', 1.00, '2025-12-11 13:24:05', '2025-12-11 13:24:05', 0.00, 'Pending', NULL, NULL),
(7, 2, 'week 1 test', 1.00, '2025-12-11 13:24:05', '2025-12-11 13:24:05', 0.00, 'Pending', NULL, NULL),
(8, 2, 'week 1 test', 1.00, '2025-12-11 13:24:05', '2025-12-11 13:24:05', 0.00, 'Pending', NULL, NULL),
(9, 3, 'week 1 test', 1.00, '2025-12-11 13:24:05', '2025-12-11 13:24:05', 0.00, 'Pending', NULL, NULL),
(10, 3, 'week 1 test', 1.00, '2025-12-11 13:24:05', '2025-12-11 13:24:05', 0.00, 'Pending', NULL, NULL),
(11, 3, 'week 1 test', 1.00, '2025-12-11 13:24:05', '2025-12-11 13:24:05', 0.00, 'Pending', NULL, NULL),
(12, 3, 'week 1 test', 1.00, '2025-12-11 13:24:05', '2025-12-11 13:24:05', 0.00, 'Pending', NULL, NULL),
(13, 8, '1', 1.00, '2025-12-15 08:00:25', '2025-12-15 08:55:38', 100.00, 'Pending', NULL, '1765788923968-862286874-Screenshot_From_2025-10-25_08-22-05.png'),
(14, 8, '2', 1.00, '2025-12-15 08:00:25', '2025-12-15 08:59:49', 100.00, 'Pending', NULL, NULL),
(15, 9, 'dwada', 5.00, '2025-12-15 09:08:23', '2025-12-15 09:08:23', 0.00, 'Pending', NULL, NULL),
(16, 9, 'dawd', 5.00, '2025-12-15 09:08:23', '2025-12-15 09:08:23', 0.00, 'Pending', NULL, NULL),
(17, 10, '1', 1.00, '2025-12-15 09:08:23', '2025-12-15 09:08:23', 0.00, 'Pending', NULL, NULL),
(18, 10, '2', 1.00, '2025-12-15 09:08:23', '2025-12-15 09:08:23', 0.00, 'Pending', NULL, NULL),
(19, 11, 'wee1', 6.00, '2025-12-15 11:47:52', '2025-12-15 11:55:34', 100.00, 'Pending', 'something', '1765799361881-518666216-Screenshot_From_2025-09-07_06-24-30.png'),
(20, 11, 'wee2', 6.00, '2025-12-15 11:47:52', '2025-12-15 11:55:40', 100.00, 'Pending', 'something ', NULL),
(21, 12, 'wee3', 6.00, '2025-12-15 11:47:52', '2025-12-15 11:50:38', 100.00, 'Pending', 'something', NULL),
(22, 12, 'week4', 6.00, '2025-12-15 11:47:52', '2025-12-15 11:50:29', 100.00, 'Pending', 'soemthing ', NULL),
(34, 22, 'dsad', 50.00, '2025-12-15 12:45:02', '2025-12-15 12:45:24', 100.00, 'Pending', 'gdfgdf', NULL),
(35, 22, '50', 50.00, '2025-12-15 12:45:02', '2025-12-15 12:45:40', 100.00, 'Pending', NULL, NULL),
(36, 23, 'fsdsdf', 50.00, '2025-12-15 12:45:02', '2025-12-15 12:46:22', 60.00, 'Pending', 'gddsg', NULL),
(37, 23, 'fdsfsd', 50.00, '2025-12-15 12:45:02', '2025-12-15 12:47:21', 50.00, 'Pending', 'gsgf', '1765802841943-546633877-Screenshot_From_2025-09-07_06-24-30.png'),
(38, 24, 'week 1', 5.00, '2026-03-06 08:25:30', '2026-03-06 08:26:22', 100.00, 'Pending', NULL, NULL),
(39, 24, 'week 2', 5.00, '2026-03-06 08:25:30', '2026-03-06 08:26:32', 100.00, 'Pending', NULL, NULL),
(40, 24, 'week 3', 10.00, '2026-03-06 08:25:30', '2026-03-06 08:26:49', 100.00, 'Pending', NULL, NULL),
(41, 24, 'week 4', 10.00, '2026-03-06 08:25:30', '2026-03-06 08:26:55', 100.00, 'Pending', NULL, NULL),
(42, 25, 'week 1', 5.00, '2026-03-06 08:29:28', '2026-03-06 08:29:28', 0.00, 'Pending', NULL, NULL),
(43, 25, 'week 2', 5.00, '2026-03-06 08:29:28', '2026-03-06 08:29:28', 0.00, 'Pending', NULL, NULL),
(44, 25, 'week 3', 10.00, '2026-03-06 08:29:28', '2026-03-06 08:29:28', 0.00, 'Pending', NULL, NULL),
(45, 25, 'week 4', 10.00, '2026-03-06 08:29:28', '2026-03-06 08:29:28', 0.00, 'Pending', NULL, NULL),
(46, 26, 'm2w1', 70.00, '2026-03-06 08:29:28', '2026-03-06 08:29:28', 0.00, 'Pending', NULL, NULL),
(47, 27, 'week 1', 5.00, '2026-03-06 08:29:36', '2026-03-06 08:29:36', 0.00, 'Pending', NULL, NULL),
(48, 27, 'week 2', 5.00, '2026-03-06 08:29:36', '2026-03-06 08:29:36', 0.00, 'Pending', NULL, NULL),
(49, 27, 'week 3', 10.00, '2026-03-06 08:29:36', '2026-03-06 08:29:36', 0.00, 'Pending', NULL, NULL),
(50, 27, 'week 4', 10.00, '2026-03-06 08:29:36', '2026-03-06 08:29:36', 0.00, 'Pending', NULL, NULL),
(51, 28, 'week 1', 5.00, '2026-03-06 08:29:36', '2026-03-06 08:29:36', 0.00, 'Pending', NULL, NULL),
(52, 28, 'week 2', 5.00, '2026-03-06 08:29:36', '2026-03-06 08:29:36', 0.00, 'Pending', NULL, NULL),
(53, 28, 'week 3', 10.00, '2026-03-06 08:29:36', '2026-03-06 08:29:36', 0.00, 'Pending', NULL, NULL),
(54, 28, 'week 4', 10.00, '2026-03-06 08:29:36', '2026-03-06 08:29:36', 0.00, 'Pending', NULL, NULL),
(55, 29, 'm2w1', 70.00, '2026-03-06 08:29:36', '2026-03-06 08:30:38', 100.00, 'Pending', 'somthing done', NULL),
(56, 30, 'w1', 50.00, '2026-03-06 08:32:52', '2026-03-06 08:33:31', 100.00, 'Pending', '', NULL),
(57, 30, 'w2', 50.00, '2026-03-06 08:32:52', '2026-03-06 08:33:47', 100.00, 'Pending', 'test', '1772786027475-686369000-qr-code__3_.png');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `approvalhierarchy`
--
ALTER TABLE `approvalhierarchy`
  ADD PRIMARY KEY (`id`),
  ADD KEY `role_id` (`role_id`),
  ADD KEY `department_id` (`department_id`),
  ADD KEY `next_role_id` (`next_role_id`);

--
-- Indexes for table `approvalworkflow`
--
ALTER TABLE `approvalworkflow`
  ADD PRIMARY KEY (`approvalworkflow_id`),
  ADD KEY `plan_id` (`plan_id`),
  ADD KEY `approver_id` (`approver_id`);

--
-- Indexes for table `approval_workflow_history`
--
ALTER TABLE `approval_workflow_history`
  ADD PRIMARY KEY (`history_id`),
  ADD KEY `idx_plan_id` (`plan_id`),
  ADD KEY `idx_approver_id` (`approver_id`),
  ADD KEY `idx_created_by_user_id` (`created_by_user_id`),
  ADD KEY `idx_step_number` (`step_number`);

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_action` (`action`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `chat_participants`
--
ALTER TABLE `chat_participants`
  ADD PRIMARY KEY (`participant_id`),
  ADD UNIQUE KEY `unique_conversation_user` (`conversation_id`,`user_id`),
  ADD KEY `idx_chat_participants_user` (`user_id`),
  ADD KEY `idx_chat_participants_conversation` (`conversation_id`);

--
-- Indexes for table `chat_settings`
--
ALTER TABLE `chat_settings`
  ADD PRIMARY KEY (`setting_id`),
  ADD UNIQUE KEY `unique_user` (`user_id`);

--
-- Indexes for table `conversations`
--
ALTER TABLE `conversations`
  ADD PRIMARY KEY (`conversation_id`);

--
-- Indexes for table `cost`
--
ALTER TABLE `cost`
  ADD PRIMARY KEY (`cost_id`);

--
-- Indexes for table `departments`
--
ALTER TABLE `departments`
  ADD PRIMARY KEY (`department_id`);

--
-- Indexes for table `employees`
--
ALTER TABLE `employees`
  ADD PRIMARY KEY (`employee_id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `role_id` (`role_id`),
  ADD KEY `supervisor_id` (`supervisor_id`),
  ADD KEY `employees_ibfk_2` (`department_id`),
  ADD KEY `idx_employee_id` (`employee_id`);

--
-- Indexes for table `forwarded_messages`
--
ALTER TABLE `forwarded_messages`
  ADD PRIMARY KEY (`forward_id`),
  ADD KEY `forwarded_by` (`forwarded_by`),
  ADD KEY `idx_forwarded_messages_original` (`original_message_id`),
  ADD KEY `idx_forwarded_messages_forwarded` (`forwarded_message_id`);

--
-- Indexes for table `goals`
--
ALTER TABLE `goals`
  ADD PRIMARY KEY (`goal_id`);

--
-- Indexes for table `income`
--
ALTER TABLE `income`
  ADD PRIMARY KEY (`income_id`);

--
-- Indexes for table `meetings`
--
ALTER TABLE `meetings`
  ADD PRIMARY KEY (`meeting_id`),
  ADD KEY `idx_created_by` (`created_by`),
  ADD KEY `idx_start_time` (`start_time`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_meetings_date_range` (`start_time`,`end_time`),
  ADD KEY `idx_meetings_created_by_status` (`created_by`,`status`);

--
-- Indexes for table `meeting_attachments`
--
ALTER TABLE `meeting_attachments`
  ADD PRIMARY KEY (`attachment_id`),
  ADD KEY `idx_meeting_id` (`meeting_id`),
  ADD KEY `uploaded_by` (`uploaded_by`);

--
-- Indexes for table `meeting_minutes`
--
ALTER TABLE `meeting_minutes`
  ADD PRIMARY KEY (`minute_id`),
  ADD KEY `idx_meeting_id` (`meeting_id`),
  ADD KEY `recorded_by` (`recorded_by`);

--
-- Indexes for table `meeting_participants`
--
ALTER TABLE `meeting_participants`
  ADD PRIMARY KEY (`participant_id`),
  ADD UNIQUE KEY `unique_meeting_user` (`meeting_id`,`user_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_response_status` (`response_status`),
  ADD KEY `idx_participants_meeting_response` (`meeting_id`,`response_status`);

--
-- Indexes for table `meeting_reminders`
--
ALTER TABLE `meeting_reminders`
  ADD PRIMARY KEY (`reminder_id`),
  ADD KEY `idx_meeting_user` (`meeting_id`,`user_id`),
  ADD KEY `idx_reminder_time` (`reminder_time`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `idx_reminders_pending` (`sent`,`reminder_time`);

--
-- Indexes for table `menu_items`
--
ALTER TABLE `menu_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `parent_id` (`parent_id`),
  ADD KEY `sort_order` (`sort_order`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`message_id`),
  ADD KEY `sender_id` (`sender_id`),
  ADD KEY `receiver_id` (`receiver_id`),
  ADD KEY `conversation_id` (`conversation_id`),
  ADD KEY `idx_messages_conversation` (`conversation_id`),
  ADD KEY `idx_messages_sender` (`sender_id`),
  ADD KEY `idx_messages_sent_at` (`sent_at`);

--
-- Indexes for table `message_attachments`
--
ALTER TABLE `message_attachments`
  ADD PRIMARY KEY (`attachment_id`),
  ADD KEY `uploaded_by` (`uploaded_by`),
  ADD KEY `idx_message_attachments_message` (`message_id`);

--
-- Indexes for table `message_mentions`
--
ALTER TABLE `message_mentions`
  ADD PRIMARY KEY (`mention_id`),
  ADD KEY `idx_message_mentions_message` (`message_id`),
  ADD KEY `idx_message_mentions_user` (`mentioned_user_id`);

--
-- Indexes for table `message_reactions`
--
ALTER TABLE `message_reactions`
  ADD PRIMARY KEY (`reaction_id`),
  ADD UNIQUE KEY `unique_user_message_emoji` (`message_id`,`user_id`,`emoji`),
  ADD KEY `idx_message_reactions_message` (`message_id`),
  ADD KEY `idx_message_reactions_user` (`user_id`);

--
-- Indexes for table `message_read_receipts`
--
ALTER TABLE `message_read_receipts`
  ADD PRIMARY KEY (`receipt_id`),
  ADD UNIQUE KEY `unique_message_user` (`message_id`,`user_id`),
  ADD KEY `idx_message_read_receipts_message` (`message_id`),
  ADD KEY `idx_message_read_receipts_user` (`user_id`);

--
-- Indexes for table `monthly_tasks`
--
ALTER TABLE `monthly_tasks`
  ADD PRIMARY KEY (`monthly_task_id`),
  ADD KEY `idx_specific_objective_detail` (`specific_objective_detail_id`),
  ADD KEY `idx_monthly_task_weight` (`weight`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`notification_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_plan_id` (`plan_id`),
  ADD KEY `idx_type` (`type`),
  ADD KEY `idx_is_read` (`is_read`),
  ADD KEY `idx_created_at` (`created_at`),
  ADD KEY `idx_priority` (`priority`),
  ADD KEY `idx_user_unread` (`user_id`,`is_read`),
  ADD KEY `idx_user_type` (`user_id`,`type`),
  ADD KEY `idx_plan_user` (`plan_id`,`user_id`);

--
-- Indexes for table `objectives`
--
ALTER TABLE `objectives`
  ADD PRIMARY KEY (`objective_id`),
  ADD KEY `fk_goals` (`goal_id`);

--
-- Indexes for table `organization_groups`
--
ALTER TABLE `organization_groups`
  ADD PRIMARY KEY (`group_id`),
  ADD UNIQUE KEY `unique_conversation_group` (`conversation_id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_organization_groups_conversation` (`conversation_id`);

--
-- Indexes for table `organization_structure`
--
ALTER TABLE `organization_structure`
  ADD PRIMARY KEY (`id`),
  ADD KEY `parent_id` (`parent_id`);

--
-- Indexes for table `organization_types`
--
ALTER TABLE `organization_types`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `password_reset_otp`
--
ALTER TABLE `password_reset_otp`
  ADD PRIMARY KEY (`otp_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `email` (`email`),
  ADD KEY `otp_code` (`otp_code`),
  ADD KEY `idx_otp_user_email` (`user_id`,`email`),
  ADD KEY `idx_otp_expires` (`expires_at`);

--
-- Indexes for table `plans`
--
ALTER TABLE `plans`
  ADD PRIMARY KEY (`plan_id`),
  ADD UNIQUE KEY `plan_id` (`plan_id`),
  ADD KEY `FK_employee_id` (`employee_id`),
  ADD KEY `fk_goal` (`goal_id`),
  ADD KEY `fk_objective` (`objective_id`),
  ADD KEY `fk_specific_objective` (`specific_objective_id`),
  ADD KEY `fk_user` (`user_id`),
  ADD KEY `fk_department` (`department_id`),
  ADD KEY `fk_specific_objective_detail` (`specific_objective_detail_id`);

--
-- Indexes for table `reportfile`
--
ALTER TABLE `reportfile`
  ADD PRIMARY KEY (`id`),
  ADD KEY `specific_objective_id` (`specific_objective_id`);

--
-- Indexes for table `reports`
--
ALTER TABLE `reports`
  ADD PRIMARY KEY (`report_id`),
  ADD KEY `plan_id` (`plan_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `report_attachments`
--
ALTER TABLE `report_attachments`
  ADD PRIMARY KEY (`attachment_id`),
  ADD KEY `report_id` (`report_id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`role_id`),
  ADD UNIQUE KEY `role_name` (`role_name`),
  ADD KEY `idx_hierarchy_level` (`hierarchy_level`);

--
-- Indexes for table `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_role_menu` (`role_id`,`menu_item_id`),
  ADD KEY `menu_item_id` (`menu_item_id`);

--
-- Indexes for table `specific_objectives`
--
ALTER TABLE `specific_objectives`
  ADD PRIMARY KEY (`specific_objective_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `fk_specific_objectives_objective_id` (`objective_id`),
  ADD KEY `idx_income_id` (`income_id`),
  ADD KEY `idx_cost_id` (`cost_id`);

--
-- Indexes for table `specific_objective_details`
--
ALTER TABLE `specific_objective_details`
  ADD PRIMARY KEY (`specific_objective_detail_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `fk_specific_objective_detail_specific_objective_id` (`specific_objective_id`),
  ADD KEY `fk_specific_objective_details_goal` (`goal_id`);

--
-- Indexes for table `supervisor_comments`
--
ALTER TABLE `supervisor_comments`
  ADD PRIMARY KEY (`comment_id`),
  ADD KEY `idx_plan_id` (`plan_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_parent_comment_id` (`parent_comment_id`),
  ADD KEY `idx_created_at` (`created_at`),
  ADD KEY `idx_plan_user` (`plan_id`,`user_id`),
  ADD KEY `idx_comment_type` (`comment_type`);

--
-- Indexes for table `tasks`
--
ALTER TABLE `tasks`
  ADD PRIMARY KEY (`task_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `assigned_by` (`assigned_by`);

--
-- Indexes for table `task_reminders`
--
ALTER TABLE `task_reminders`
  ADD PRIMARY KEY (`reminder_id`),
  ADD KEY `task_id` (`task_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `username` (`user_name`),
  ADD KEY `employee_id` (`employee_id`),
  ADD KEY `fk_role_id` (`role_id`);

--
-- Indexes for table `user_presence`
--
ALTER TABLE `user_presence`
  ADD PRIMARY KEY (`presence_id`),
  ADD UNIQUE KEY `unique_user_presence` (`user_id`),
  ADD KEY `idx_user_presence_online` (`is_online`),
  ADD KEY `idx_user_presence_status` (`status`);

--
-- Indexes for table `weekly_tasks`
--
ALTER TABLE `weekly_tasks`
  ADD PRIMARY KEY (`weekly_task_id`),
  ADD KEY `idx_monthly_task` (`monthly_task_id`),
  ADD KEY `idx_weekly_task_weight` (`weight`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `approvalhierarchy`
--
ALTER TABLE `approvalhierarchy`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `approvalworkflow`
--
ALTER TABLE `approvalworkflow`
  MODIFY `approvalworkflow_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=458;

--
-- AUTO_INCREMENT for table `approval_workflow_history`
--
ALTER TABLE `approval_workflow_history`
  MODIFY `history_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=134;

--
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=128;

--
-- AUTO_INCREMENT for table `chat_participants`
--
ALTER TABLE `chat_participants`
  MODIFY `participant_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `chat_settings`
--
ALTER TABLE `chat_settings`
  MODIFY `setting_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `conversations`
--
ALTER TABLE `conversations`
  MODIFY `conversation_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `cost`
--
ALTER TABLE `cost`
  MODIFY `cost_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `employees`
--
ALTER TABLE `employees`
  MODIFY `employee_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=152;

--
-- AUTO_INCREMENT for table `forwarded_messages`
--
ALTER TABLE `forwarded_messages`
  MODIFY `forward_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `goals`
--
ALTER TABLE `goals`
  MODIFY `goal_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=97;

--
-- AUTO_INCREMENT for table `income`
--
ALTER TABLE `income`
  MODIFY `income_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `meetings`
--
ALTER TABLE `meetings`
  MODIFY `meeting_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `meeting_attachments`
--
ALTER TABLE `meeting_attachments`
  MODIFY `attachment_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `meeting_minutes`
--
ALTER TABLE `meeting_minutes`
  MODIFY `minute_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `meeting_participants`
--
ALTER TABLE `meeting_participants`
  MODIFY `participant_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- AUTO_INCREMENT for table `meeting_reminders`
--
ALTER TABLE `meeting_reminders`
  MODIFY `reminder_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `menu_items`
--
ALTER TABLE `menu_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=70;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `message_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=86;

--
-- AUTO_INCREMENT for table `message_attachments`
--
ALTER TABLE `message_attachments`
  MODIFY `attachment_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `message_mentions`
--
ALTER TABLE `message_mentions`
  MODIFY `mention_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `message_reactions`
--
ALTER TABLE `message_reactions`
  MODIFY `reaction_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `message_read_receipts`
--
ALTER TABLE `message_read_receipts`
  MODIFY `receipt_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=99;

--
-- AUTO_INCREMENT for table `monthly_tasks`
--
ALTER TABLE `monthly_tasks`
  MODIFY `monthly_task_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `notification_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- AUTO_INCREMENT for table `objectives`
--
ALTER TABLE `objectives`
  MODIFY `objective_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=142;

--
-- AUTO_INCREMENT for table `organization_groups`
--
ALTER TABLE `organization_groups`
  MODIFY `group_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `organization_structure`
--
ALTER TABLE `organization_structure`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;

--
-- AUTO_INCREMENT for table `organization_types`
--
ALTER TABLE `organization_types`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `password_reset_otp`
--
ALTER TABLE `password_reset_otp`
  MODIFY `otp_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `plans`
--
ALTER TABLE `plans`
  MODIFY `plan_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=253;

--
-- AUTO_INCREMENT for table `reportfile`
--
ALTER TABLE `reportfile`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `reports`
--
ALTER TABLE `reports`
  MODIFY `report_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `report_attachments`
--
ALTER TABLE `report_attachments`
  MODIFY `attachment_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `role_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT for table `role_permissions`
--
ALTER TABLE `role_permissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=714;

--
-- AUTO_INCREMENT for table `specific_objectives`
--
ALTER TABLE `specific_objectives`
  MODIFY `specific_objective_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=605;

--
-- AUTO_INCREMENT for table `specific_objective_details`
--
ALTER TABLE `specific_objective_details`
  MODIFY `specific_objective_detail_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=808;

--
-- AUTO_INCREMENT for table `supervisor_comments`
--
ALTER TABLE `supervisor_comments`
  MODIFY `comment_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `tasks`
--
ALTER TABLE `tasks`
  MODIFY `task_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `task_reminders`
--
ALTER TABLE `task_reminders`
  MODIFY `reminder_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=79;

--
-- AUTO_INCREMENT for table `user_presence`
--
ALTER TABLE `user_presence`
  MODIFY `presence_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `weekly_tasks`
--
ALTER TABLE `weekly_tasks`
  MODIFY `weekly_task_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=58;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `approvalhierarchy`
--
ALTER TABLE `approvalhierarchy`
  ADD CONSTRAINT `approvalhierarchy_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`),
  ADD CONSTRAINT `approvalhierarchy_ibfk_3` FOREIGN KEY (`next_role_id`) REFERENCES `roles` (`role_id`);

--
-- Constraints for table `approvalworkflow`
--
ALTER TABLE `approvalworkflow`
  ADD CONSTRAINT `approvalworkflow_ibfk_1` FOREIGN KEY (`plan_id`) REFERENCES `plans` (`plan_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `approvalworkflow_ibfk_3` FOREIGN KEY (`approver_id`) REFERENCES `employees` (`employee_id`) ON DELETE SET NULL;

--
-- Constraints for table `approval_workflow_history`
--
ALTER TABLE `approval_workflow_history`
  ADD CONSTRAINT `approval_workflow_history_ibfk_1` FOREIGN KEY (`plan_id`) REFERENCES `plans` (`plan_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `approval_workflow_history_ibfk_2` FOREIGN KEY (`approver_id`) REFERENCES `employees` (`employee_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `approval_workflow_history_ibfk_3` FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD CONSTRAINT `audit_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `chat_participants`
--
ALTER TABLE `chat_participants`
  ADD CONSTRAINT `chat_participants_ibfk_1` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`conversation_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `chat_participants_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `chat_settings`
--
ALTER TABLE `chat_settings`
  ADD CONSTRAINT `chat_settings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `employees`
--
ALTER TABLE `employees`
  ADD CONSTRAINT `employees_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`),
  ADD CONSTRAINT `employees_ibfk_2` FOREIGN KEY (`department_id`) REFERENCES `departments` (`department_id`);

--
-- Constraints for table `forwarded_messages`
--
ALTER TABLE `forwarded_messages`
  ADD CONSTRAINT `forwarded_messages_ibfk_1` FOREIGN KEY (`original_message_id`) REFERENCES `messages` (`message_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `forwarded_messages_ibfk_2` FOREIGN KEY (`forwarded_message_id`) REFERENCES `messages` (`message_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `forwarded_messages_ibfk_3` FOREIGN KEY (`forwarded_by`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `meetings`
--
ALTER TABLE `meetings`
  ADD CONSTRAINT `meetings_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `meeting_attachments`
--
ALTER TABLE `meeting_attachments`
  ADD CONSTRAINT `meeting_attachments_ibfk_1` FOREIGN KEY (`meeting_id`) REFERENCES `meetings` (`meeting_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `meeting_attachments_ibfk_2` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `meeting_minutes`
--
ALTER TABLE `meeting_minutes`
  ADD CONSTRAINT `meeting_minutes_ibfk_1` FOREIGN KEY (`meeting_id`) REFERENCES `meetings` (`meeting_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `meeting_minutes_ibfk_2` FOREIGN KEY (`recorded_by`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `meeting_participants`
--
ALTER TABLE `meeting_participants`
  ADD CONSTRAINT `meeting_participants_ibfk_1` FOREIGN KEY (`meeting_id`) REFERENCES `meetings` (`meeting_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `meeting_participants_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `meeting_reminders`
--
ALTER TABLE `meeting_reminders`
  ADD CONSTRAINT `meeting_reminders_ibfk_1` FOREIGN KEY (`meeting_id`) REFERENCES `meetings` (`meeting_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `meeting_reminders_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `messages_ibfk_3` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`conversation_id`) ON DELETE CASCADE;

--
-- Constraints for table `message_attachments`
--
ALTER TABLE `message_attachments`
  ADD CONSTRAINT `message_attachments_ibfk_1` FOREIGN KEY (`message_id`) REFERENCES `messages` (`message_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `message_attachments_ibfk_2` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `message_mentions`
--
ALTER TABLE `message_mentions`
  ADD CONSTRAINT `message_mentions_ibfk_1` FOREIGN KEY (`message_id`) REFERENCES `messages` (`message_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `message_mentions_ibfk_2` FOREIGN KEY (`mentioned_user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `message_reactions`
--
ALTER TABLE `message_reactions`
  ADD CONSTRAINT `message_reactions_ibfk_1` FOREIGN KEY (`message_id`) REFERENCES `messages` (`message_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `message_reactions_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `message_read_receipts`
--
ALTER TABLE `message_read_receipts`
  ADD CONSTRAINT `message_read_receipts_ibfk_1` FOREIGN KEY (`message_id`) REFERENCES `messages` (`message_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `message_read_receipts_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `monthly_tasks`
--
ALTER TABLE `monthly_tasks`
  ADD CONSTRAINT `fk_monthly_task_detail` FOREIGN KEY (`specific_objective_detail_id`) REFERENCES `specific_objective_details` (`specific_objective_detail_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `notifications_ibfk_2` FOREIGN KEY (`plan_id`) REFERENCES `plans` (`plan_id`) ON DELETE CASCADE;

--
-- Constraints for table `objectives`
--
ALTER TABLE `objectives`
  ADD CONSTRAINT `fk_goals` FOREIGN KEY (`goal_id`) REFERENCES `goals` (`goal_id`) ON DELETE CASCADE;

--
-- Constraints for table `organization_groups`
--
ALTER TABLE `organization_groups`
  ADD CONSTRAINT `organization_groups_ibfk_1` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`conversation_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `organization_groups_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `organization_structure`
--
ALTER TABLE `organization_structure`
  ADD CONSTRAINT `organization_structure_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `organization_structure` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `password_reset_otp`
--
ALTER TABLE `password_reset_otp`
  ADD CONSTRAINT `fk_password_reset_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `plans`
--
ALTER TABLE `plans`
  ADD CONSTRAINT `FK_employee_id` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`),
  ADD CONSTRAINT `fk_department` FOREIGN KEY (`department_id`) REFERENCES `departments` (`department_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_goal` FOREIGN KEY (`goal_id`) REFERENCES `goals` (`goal_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_objective` FOREIGN KEY (`objective_id`) REFERENCES `objectives` (`objective_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_specific_objective` FOREIGN KEY (`specific_objective_id`) REFERENCES `specific_objectives` (`specific_objective_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_specific_objective_detail` FOREIGN KEY (`specific_objective_detail_id`) REFERENCES `specific_objective_details` (`specific_objective_detail_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `reportfile`
--
ALTER TABLE `reportfile`
  ADD CONSTRAINT `reportfile_ibfk_1` FOREIGN KEY (`specific_objective_id`) REFERENCES `specific_objective_details` (`specific_objective_detail_id`) ON DELETE CASCADE;

--
-- Constraints for table `report_attachments`
--
ALTER TABLE `report_attachments`
  ADD CONSTRAINT `report_attachments_ibfk_1` FOREIGN KEY (`report_id`) REFERENCES `reports` (`report_id`) ON DELETE CASCADE;

--
-- Constraints for table `tasks`
--
ALTER TABLE `tasks`
  ADD CONSTRAINT `tasks_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `tasks_ibfk_2` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `task_reminders`
--
ALTER TABLE `task_reminders`
  ADD CONSTRAINT `task_reminders_ibfk_1` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`task_id`) ON DELETE CASCADE;

--
-- Constraints for table `user_presence`
--
ALTER TABLE `user_presence`
  ADD CONSTRAINT `user_presence_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `weekly_tasks`
--
ALTER TABLE `weekly_tasks`
  ADD CONSTRAINT `fk_weekly_task_monthly` FOREIGN KEY (`monthly_task_id`) REFERENCES `monthly_tasks` (`monthly_task_id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
