-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 12, 2026 at 07:53 PM
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
-- Table structure for table `action_plan_quarter_activations`
--

CREATE TABLE `action_plan_quarter_activations` (
  `id` int(11) NOT NULL,
  `specific_objective_detail_id` int(11) NOT NULL,
  `year` int(11) NOT NULL,
  `quarter` varchar(10) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
(1, 1, 143, 'Pending', NULL, '2026-08-12 20:08:20', NULL, NULL, 'Pending', NULL, '');

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
(175, 469, 143, 'Unknown', 'Unknown', 'Pending', 'Plan submitted for approval', '2026-08-09 09:41:47', 1, 1, 73, 'Unknown', '2026-08-09 06:41:47', '2026-08-09 06:41:47'),
(179, 473, 143, 'Unknown', 'Unknown', 'Pending', 'Plan submitted for approval', '2026-08-10 20:26:00', 1, 1, 73, 'Unknown', '2026-08-10 17:26:00', '2026-08-10 17:26:00'),
(180, 474, 143, 'Unknown', 'Unknown', 'Pending', 'Plan submitted for approval', '2026-08-11 10:34:14', 1, 1, 73, 'Unknown', '2026-08-11 07:34:14', '2026-08-11 07:34:14'),
(181, 475, 143, 'Unknown', 'Unknown', 'Pending', 'Plan submitted for approval', '2026-08-11 21:47:09', 1, 1, 73, 'Unknown', '2026-08-11 18:47:09', '2026-08-11 18:47:09'),
(182, 1, 143, 'Unknown', 'Unknown', 'Pending', 'Plan submitted for approval', '2026-08-12 20:08:20', 1, 1, 73, 'Unknown', '2026-08-12 17:08:20', '2026-08-12 17:08:20');

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
(127, 25, 'LOGIN', 'User olana@itp.et logged in successfully', '{\"username\":\"olana@itp.et\",\"user_id\":25,\"role_id\":2,\"employee_id\":72,\"employee_name\":\"Olana\",\"department_id\":2,\"login_time\":\"2026-03-16T07:36:51.811Z\",\"timestamp\":\"2026-03-16T07:36:51.811Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-16 07:36:51'),
(128, NULL, 'LOGIN_FAILED', 'Login failed: User not found - user40', '{\"username\":\"user40\",\"reason\":\"user_not_found\",\"timestamp\":\"2026-03-17T07:02:03.446Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-17 07:02:03'),
(129, 40, 'LOGOUT', 'User ezira@itpark.et logged out', '{\"user_id\":\"40\",\"username\":\"ezira@itpark.et\",\"employee_name\":\"Ezira\",\"logout_time\":\"2026-03-17T07:04:19.855Z\",\"timestamp\":\"2026-03-17T07:04:19.855Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/40\",\"method\":\"PUT\"}', '2026-03-17 07:04:19'),
(130, NULL, 'LOGIN_FAILED', 'Login failed: User not found - user40', '{\"username\":\"user40\",\"reason\":\"user_not_found\",\"timestamp\":\"2026-03-17T07:04:26.160Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-17 07:04:26'),
(131, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":2,\"login_time\":\"2026-03-17T07:05:19.035Z\",\"timestamp\":\"2026-03-17T07:05:19.035Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-17 07:05:19'),
(132, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":2,\"login_time\":\"2026-03-17T07:05:44.282Z\",\"timestamp\":\"2026-03-17T07:05:44.282Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-17 07:05:44'),
(133, NULL, 'LOGIN_FAILED', 'Login failed: Password not provided for username undefined', '{\"reason\":\"missing_password\",\"timestamp\":\"2026-03-17T07:11:30.576Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"node\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-17 07:11:30'),
(134, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":2,\"login_time\":\"2026-03-17T07:11:58.158Z\",\"timestamp\":\"2026-03-17T07:11:58.158Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"node\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-17 07:11:58'),
(135, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":2,\"login_time\":\"2026-03-17T07:13:44.885Z\",\"timestamp\":\"2026-03-17T07:13:44.885Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"node\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-17 07:13:44'),
(136, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":2,\"login_time\":\"2026-03-17T07:13:59.715Z\",\"timestamp\":\"2026-03-17T07:13:59.716Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"node\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-17 07:13:59'),
(137, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":2,\"login_time\":\"2026-03-17T07:14:18.289Z\",\"timestamp\":\"2026-03-17T07:14:18.289Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"node\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-17 07:14:18'),
(138, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":2,\"login_time\":\"2026-03-17T07:20:25.046Z\",\"timestamp\":\"2026-03-17T07:20:25.046Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"node\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-17 07:20:25'),
(139, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":2,\"login_time\":\"2026-03-17T07:20:41.873Z\",\"timestamp\":\"2026-03-17T07:20:41.873Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"node\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-17 07:20:41'),
(140, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":2,\"login_time\":\"2026-03-17T07:21:04.556Z\",\"timestamp\":\"2026-03-17T07:21:04.556Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"node\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-17 07:21:04'),
(141, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":2,\"login_time\":\"2026-03-17T07:21:23.638Z\",\"timestamp\":\"2026-03-17T07:21:23.638Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"node\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-17 07:21:23'),
(142, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":2,\"login_time\":\"2026-03-17T07:21:45.396Z\",\"timestamp\":\"2026-03-17T07:21:45.396Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"node\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-17 07:21:45'),
(143, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":2,\"login_time\":\"2026-03-17T07:22:31.904Z\",\"timestamp\":\"2026-03-17T07:22:31.905Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"node\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-17 07:22:31'),
(144, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":2,\"login_time\":\"2026-03-17T07:23:06.118Z\",\"timestamp\":\"2026-03-17T07:23:06.118Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"node\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-17 07:23:06'),
(145, 25, 'LOGOUT', 'User olana@itp.et logged out', '{\"user_id\":\"25\",\"username\":\"olana@itp.et\",\"employee_name\":\"Olana\",\"logout_time\":\"2026-03-17T14:00:59.389Z\",\"timestamp\":\"2026-03-17T14:00:59.389Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/25\",\"method\":\"PUT\"}', '2026-03-17 14:00:59'),
(146, 25, 'LOGIN', 'User olana@itp.et logged in successfully', '{\"username\":\"olana@itp.et\",\"user_id\":25,\"role_id\":2,\"employee_id\":72,\"employee_name\":\"Olana\",\"department_id\":2,\"login_time\":\"2026-03-17T14:06:21.233Z\",\"timestamp\":\"2026-03-17T14:06:21.233Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-17 14:06:21'),
(147, 40, 'LOGOUT', 'User ezira@itpark.et logged out', '{\"user_id\":\"40\",\"username\":\"ezira@itpark.et\",\"employee_name\":\"Ezira\",\"logout_time\":\"2026-03-18T12:34:38.708Z\",\"timestamp\":\"2026-03-18T12:34:38.709Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/40\",\"method\":\"PUT\"}', '2026-03-18 12:34:38'),
(148, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":2,\"login_time\":\"2026-03-18T12:34:47.986Z\",\"timestamp\":\"2026-03-18T12:34:47.986Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-18 12:34:47'),
(149, 25, 'LOGOUT', 'User olana@itp.et logged out', '{\"user_id\":\"25\",\"username\":\"olana@itp.et\",\"employee_name\":\"Olana\",\"logout_time\":\"2026-03-18T12:44:03.497Z\",\"timestamp\":\"2026-03-18T12:44:03.497Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/25\",\"method\":\"PUT\"}', '2026-03-18 12:44:03'),
(150, 25, 'LOGIN', 'User olana@itp.et logged in successfully', '{\"username\":\"olana@itp.et\",\"user_id\":25,\"role_id\":2,\"employee_id\":72,\"employee_name\":\"Olana\",\"department_id\":2,\"login_time\":\"2026-03-18T12:44:07.287Z\",\"timestamp\":\"2026-03-18T12:44:07.287Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-18 12:44:07'),
(151, 25, 'LOGOUT', 'User olana@itp.et logged out', '{\"user_id\":\"25\",\"username\":\"olana@itp.et\",\"employee_name\":\"Olana\",\"logout_time\":\"2026-03-18T13:49:09.887Z\",\"timestamp\":\"2026-03-18T13:49:09.887Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/25\",\"method\":\"PUT\"}', '2026-03-18 13:49:09'),
(152, 25, 'LOGIN', 'User olana@itp.et logged in successfully', '{\"username\":\"olana@itp.et\",\"user_id\":25,\"role_id\":2,\"employee_id\":72,\"employee_name\":\"Olana\",\"department_id\":2,\"login_time\":\"2026-03-18T13:49:14.444Z\",\"timestamp\":\"2026-03-18T13:49:14.444Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-18 13:49:14'),
(153, 25, 'LOGOUT', 'User olana@itp.et logged out', '{\"user_id\":\"25\",\"username\":\"olana@itp.et\",\"employee_name\":\"Olana\",\"logout_time\":\"2026-03-18T13:54:23.178Z\",\"timestamp\":\"2026-03-18T13:54:23.178Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/25\",\"method\":\"PUT\"}', '2026-03-18 13:54:23'),
(154, 25, 'LOGIN', 'User olana@itp.et logged in successfully', '{\"username\":\"olana@itp.et\",\"user_id\":25,\"role_id\":2,\"employee_id\":72,\"employee_name\":\"Olana\",\"department_id\":2,\"login_time\":\"2026-03-18T13:54:24.655Z\",\"timestamp\":\"2026-03-18T13:54:24.655Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-18 13:54:24'),
(155, 40, 'LOGOUT', 'User ezira@itpark.et logged out', '{\"user_id\":\"40\",\"username\":\"ezira@itpark.et\",\"employee_name\":\"Ezira\",\"logout_time\":\"2026-03-19T09:04:39.357Z\",\"timestamp\":\"2026-03-19T09:04:39.357Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/40\",\"method\":\"PUT\"}', '2026-03-19 09:04:39'),
(156, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":2,\"login_time\":\"2026-03-19T09:04:41.445Z\",\"timestamp\":\"2026-03-19T09:04:41.445Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-19 09:04:41'),
(157, 25, 'LOGOUT', 'User olana@itp.et logged out', '{\"user_id\":\"25\",\"username\":\"olana@itp.et\",\"employee_name\":\"Olana\",\"logout_time\":\"2026-03-19T09:06:52.421Z\",\"timestamp\":\"2026-03-19T09:06:52.422Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/25\",\"method\":\"PUT\"}', '2026-03-19 09:06:52'),
(158, 25, 'LOGIN', 'User olana@itp.et logged in successfully', '{\"username\":\"olana@itp.et\",\"user_id\":25,\"role_id\":2,\"employee_id\":72,\"employee_name\":\"Olana\",\"department_id\":2,\"login_time\":\"2026-03-19T09:06:55.688Z\",\"timestamp\":\"2026-03-19T09:06:55.688Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-19 09:06:55'),
(159, 25, 'LOGOUT', 'User olana@itp.et logged out', '{\"user_id\":\"25\",\"username\":\"olana@itp.et\",\"employee_name\":\"Olana\",\"logout_time\":\"2026-03-19T10:19:01.978Z\",\"timestamp\":\"2026-03-19T10:19:01.978Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/25\",\"method\":\"PUT\"}', '2026-03-19 10:19:01'),
(160, 25, 'LOGIN', 'User olana@itp.et logged in successfully', '{\"username\":\"olana@itp.et\",\"user_id\":25,\"role_id\":2,\"employee_id\":72,\"employee_name\":\"Olana\",\"department_id\":2,\"login_time\":\"2026-03-19T10:19:27.424Z\",\"timestamp\":\"2026-03-19T10:19:27.424Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-19 10:19:27'),
(161, 25, 'LOGOUT', 'User olana@itp.et logged out', '{\"user_id\":\"25\",\"username\":\"olana@itp.et\",\"employee_name\":\"Olana\",\"logout_time\":\"2026-03-19T10:19:43.284Z\",\"timestamp\":\"2026-03-19T10:19:43.284Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/25\",\"method\":\"PUT\"}', '2026-03-19 10:19:43'),
(162, 25, 'LOGIN', 'User olana@itp.et logged in successfully', '{\"username\":\"olana@itp.et\",\"user_id\":25,\"role_id\":2,\"employee_id\":72,\"employee_name\":\"Olana\",\"department_id\":2,\"login_time\":\"2026-03-19T10:20:10.136Z\",\"timestamp\":\"2026-03-19T10:20:10.136Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-19 10:20:10'),
(163, 25, 'LOGOUT', 'User olana@itp.et logged out', '{\"user_id\":\"25\",\"username\":\"olana@itp.et\",\"employee_name\":\"Olana\",\"logout_time\":\"2026-03-20T04:59:38.230Z\",\"timestamp\":\"2026-03-20T04:59:38.230Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/25\",\"method\":\"PUT\"}', '2026-03-20 04:59:38'),
(164, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":2,\"login_time\":\"2026-03-20T04:59:42.305Z\",\"timestamp\":\"2026-03-20T04:59:42.305Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-20 04:59:42'),
(165, 40, 'LOGOUT', 'User ezira@itpark.et logged out', '{\"user_id\":\"40\",\"username\":\"ezira@itpark.et\",\"employee_name\":\"Ezira\",\"logout_time\":\"2026-03-20T06:14:22.918Z\",\"timestamp\":\"2026-03-20T06:14:22.918Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/40\",\"method\":\"PUT\"}', '2026-03-20 06:14:22'),
(166, 79, 'LOGIN', 'User Milliongoraw@gmail.com logged in successfully', '{\"username\":\"Milliongoraw@gmail.com\",\"user_id\":79,\"role_id\":6,\"employee_id\":152,\"employee_name\":\"Million  Goraw\",\"department_id\":null,\"login_time\":\"2026-03-20T06:14:42.433Z\",\"timestamp\":\"2026-03-20T06:14:42.433Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-20 06:14:42'),
(167, 79, 'LOGOUT', 'User Milliongoraw@gmail.com logged out', '{\"user_id\":\"79\",\"username\":\"Milliongoraw@gmail.com\",\"employee_name\":\"Million  Goraw\",\"logout_time\":\"2026-03-20T06:15:04.398Z\",\"timestamp\":\"2026-03-20T06:15:04.398Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/79\",\"method\":\"PUT\"}', '2026-03-20 06:15:04'),
(168, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":2,\"login_time\":\"2026-03-20T06:15:45.528Z\",\"timestamp\":\"2026-03-20T06:15:45.528Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-20 06:15:45'),
(169, 40, 'LOGOUT', 'User ezira@itpark.et logged out', '{\"user_id\":\"40\",\"username\":\"ezira@itpark.et\",\"employee_name\":\"Ezira\",\"logout_time\":\"2026-03-20T06:21:25.920Z\",\"timestamp\":\"2026-03-20T06:21:25.920Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/40\",\"method\":\"PUT\"}', '2026-03-20 06:21:25'),
(170, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":2,\"login_time\":\"2026-03-20T06:21:31.261Z\",\"timestamp\":\"2026-03-20T06:21:31.261Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-20 06:21:31'),
(171, 40, 'LOGOUT', 'User ezira@itpark.et logged out', '{\"user_id\":\"40\",\"username\":\"ezira@itpark.et\",\"employee_name\":\"Ezira\",\"logout_time\":\"2026-03-20T06:21:38.300Z\",\"timestamp\":\"2026-03-20T06:21:38.300Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/40\",\"method\":\"PUT\"}', '2026-03-20 06:21:38'),
(172, 79, 'LOGIN', 'User Milliongoraw@gmail.com logged in successfully', '{\"username\":\"Milliongoraw@gmail.com\",\"user_id\":79,\"role_id\":6,\"employee_id\":152,\"employee_name\":\"Million  Goraw\",\"department_id\":null,\"login_time\":\"2026-03-20T06:21:43.759Z\",\"timestamp\":\"2026-03-20T06:21:43.759Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-20 06:21:43'),
(173, 79, 'LOGOUT', 'User Milliongoraw@gmail.com logged out', '{\"user_id\":\"79\",\"username\":\"Milliongoraw@gmail.com\",\"employee_name\":\"Million  Goraw\",\"logout_time\":\"2026-03-20T06:22:24.253Z\",\"timestamp\":\"2026-03-20T06:22:24.253Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/79\",\"method\":\"PUT\"}', '2026-03-20 06:22:24'),
(174, 25, 'LOGIN', 'User olana@itp.et logged in successfully', '{\"username\":\"olana@itp.et\",\"user_id\":25,\"role_id\":2,\"employee_id\":72,\"employee_name\":\"Olana\",\"department_id\":2,\"login_time\":\"2026-03-20T06:22:32.385Z\",\"timestamp\":\"2026-03-20T06:22:32.385Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-20 06:22:32'),
(175, 40, 'LOGOUT', 'User ezira@itpark.et logged out', '{\"user_id\":\"40\",\"username\":\"ezira@itpark.et\",\"employee_name\":\"Ezira\",\"logout_time\":\"2026-03-20T11:25:44.371Z\",\"timestamp\":\"2026-03-20T11:25:44.371Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/40\",\"method\":\"PUT\"}', '2026-03-20 11:25:44'),
(176, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":2,\"login_time\":\"2026-03-20T11:25:57.027Z\",\"timestamp\":\"2026-03-20T11:25:57.027Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-20 11:25:57'),
(177, 25, 'LOGOUT', 'User olana@itp.et logged out', '{\"user_id\":\"25\",\"username\":\"olana@itp.et\",\"employee_name\":\"Olana\",\"logout_time\":\"2026-03-20T11:26:00.124Z\",\"timestamp\":\"2026-03-20T11:26:00.124Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/25\",\"method\":\"PUT\"}', '2026-03-20 11:26:00'),
(178, 79, 'LOGIN', 'User Milliongoraw@gmail.com logged in successfully', '{\"username\":\"Milliongoraw@gmail.com\",\"user_id\":79,\"role_id\":6,\"employee_id\":152,\"employee_name\":\"Million  Goraw\",\"department_id\":null,\"login_time\":\"2026-03-20T11:26:04.965Z\",\"timestamp\":\"2026-03-20T11:26:04.965Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-20 11:26:04'),
(179, 40, 'LOGOUT', 'User ezira@itpark.et logged out', '{\"user_id\":\"40\",\"username\":\"ezira@itpark.et\",\"employee_name\":\"Ezira\",\"logout_time\":\"2026-03-20T11:43:26.257Z\",\"timestamp\":\"2026-03-20T11:43:26.258Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/40\",\"method\":\"PUT\"}', '2026-03-20 11:43:26'),
(180, 67, 'LOGIN', 'User hayaltamrat@gmail.com logged in successfully', '{\"username\":\"hayaltamrat@gmail.com\",\"user_id\":67,\"role_id\":8,\"employee_id\":139,\"employee_name\":\"hayal Tamrat\",\"department_id\":2,\"login_time\":\"2026-03-20T11:43:33.662Z\",\"timestamp\":\"2026-03-20T11:43:33.662Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-20 11:43:33'),
(181, 67, 'LOGOUT', 'User hayaltamrat@gmail.com logged out', '{\"user_id\":\"67\",\"username\":\"hayaltamrat@gmail.com\",\"employee_name\":\"hayal Tamrat\",\"logout_time\":\"2026-03-20T11:46:34.691Z\",\"timestamp\":\"2026-03-20T11:46:34.691Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/67\",\"method\":\"PUT\"}', '2026-03-20 11:46:34'),
(182, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":2,\"login_time\":\"2026-03-20T11:46:39.337Z\",\"timestamp\":\"2026-03-20T11:46:39.337Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-20 11:46:39'),
(183, 79, 'LOGOUT', 'User Milliongoraw@gmail.com logged out', '{\"user_id\":\"79\",\"username\":\"Milliongoraw@gmail.com\",\"employee_name\":\"Million  Goraw\",\"logout_time\":\"2026-03-20T11:48:12.794Z\",\"timestamp\":\"2026-03-20T11:48:12.794Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/79\",\"method\":\"PUT\"}', '2026-03-20 11:48:12'),
(184, 79, 'LOGIN', 'User Milliongoraw@gmail.com logged in successfully', '{\"username\":\"Milliongoraw@gmail.com\",\"user_id\":79,\"role_id\":6,\"employee_id\":152,\"employee_name\":\"Million  Goraw\",\"department_id\":null,\"login_time\":\"2026-03-20T11:48:27.820Z\",\"timestamp\":\"2026-03-20T11:48:27.821Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-20 11:48:27'),
(185, 40, 'LOGOUT', 'User ezira@itpark.et logged out', '{\"user_id\":\"40\",\"username\":\"ezira@itpark.et\",\"employee_name\":\"Ezira\",\"logout_time\":\"2026-03-20T12:42:23.863Z\",\"timestamp\":\"2026-03-20T12:42:23.863Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/40\",\"method\":\"PUT\"}', '2026-03-20 12:42:23'),
(186, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":2,\"login_time\":\"2026-03-20T12:42:31.468Z\",\"timestamp\":\"2026-03-20T12:42:31.468Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-20 12:42:31'),
(187, 40, 'LOGOUT', 'User ezira@itpark.et logged out', '{\"user_id\":\"40\",\"username\":\"ezira@itpark.et\",\"employee_name\":\"Ezira\",\"logout_time\":\"2026-03-20T12:51:01.992Z\",\"timestamp\":\"2026-03-20T12:51:01.992Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/40\",\"method\":\"PUT\"}', '2026-03-20 12:51:01'),
(188, 67, 'LOGIN', 'User hayaltamrat@gmail.com logged in successfully', '{\"username\":\"hayaltamrat@gmail.com\",\"user_id\":67,\"role_id\":8,\"employee_id\":139,\"employee_name\":\"hayal Tamrat\",\"department_id\":2,\"login_time\":\"2026-03-20T12:51:06.734Z\",\"timestamp\":\"2026-03-20T12:51:06.734Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-20 12:51:06'),
(189, 67, 'LOGOUT', 'User hayaltamrat@gmail.com logged out', '{\"user_id\":\"67\",\"username\":\"hayaltamrat@gmail.com\",\"employee_name\":\"hayal Tamrat\",\"logout_time\":\"2026-03-20T12:52:20.057Z\",\"timestamp\":\"2026-03-20T12:52:20.057Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/67\",\"method\":\"PUT\"}', '2026-03-20 12:52:20'),
(190, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":2,\"login_time\":\"2026-03-20T12:52:29.462Z\",\"timestamp\":\"2026-03-20T12:52:29.462Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-20 12:52:29'),
(191, 79, 'LOGOUT', 'User Milliongoraw@gmail.com logged out', '{\"user_id\":\"79\",\"username\":\"Milliongoraw@gmail.com\",\"employee_name\":\"Million  Goraw\",\"logout_time\":\"2026-03-20T12:55:10.534Z\",\"timestamp\":\"2026-03-20T12:55:10.534Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/79\",\"method\":\"PUT\"}', '2026-03-20 12:55:10'),
(192, 79, 'LOGIN', 'User Milliongoraw@gmail.com logged in successfully', '{\"username\":\"Milliongoraw@gmail.com\",\"user_id\":79,\"role_id\":6,\"employee_id\":152,\"employee_name\":\"Million  Goraw\",\"department_id\":null,\"login_time\":\"2026-03-20T12:55:22.961Z\",\"timestamp\":\"2026-03-20T12:55:22.961Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-20 12:55:23'),
(193, 40, 'LOGOUT', 'User ezira@itpark.et logged out', '{\"user_id\":\"40\",\"username\":\"ezira@itpark.et\",\"employee_name\":\"Ezira\",\"logout_time\":\"2026-03-20T12:55:42.718Z\",\"timestamp\":\"2026-03-20T12:55:42.718Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/40\",\"method\":\"PUT\"}', '2026-03-20 12:55:42'),
(194, 73, 'LOGIN', 'User tsehayu@itp.et logged in successfully', '{\"username\":\"tsehayu@itp.et\",\"user_id\":73,\"role_id\":5,\"employee_id\":146,\"employee_name\":\"tsuhayu directorate\",\"department_id\":11,\"login_time\":\"2026-03-20T12:55:46.404Z\",\"timestamp\":\"2026-03-20T12:55:46.404Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-20 12:55:46'),
(195, 79, 'LOGOUT', 'User Milliongoraw@gmail.com logged out', '{\"user_id\":\"79\",\"username\":\"Milliongoraw@gmail.com\",\"employee_name\":\"Million  Goraw\",\"logout_time\":\"2026-03-20T12:56:41.411Z\",\"timestamp\":\"2026-03-20T12:56:41.411Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/79\",\"method\":\"PUT\"}', '2026-03-20 12:56:41'),
(196, 76, 'LOGIN', 'User hayaltamrat@itp.et logged in successfully', '{\"username\":\"hayaltamrat@itp.et\",\"user_id\":76,\"role_id\":8,\"employee_id\":149,\"employee_name\":\"Hayal Tamrat\",\"department_id\":18,\"login_time\":\"2026-03-20T12:56:51.051Z\",\"timestamp\":\"2026-03-20T12:56:51.051Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-20 12:56:51'),
(197, 76, 'LOGOUT', 'User hayaltamrat@itp.et logged out', '{\"user_id\":\"76\",\"username\":\"hayaltamrat@itp.et\",\"employee_name\":\"Hayal Tamrat\",\"logout_time\":\"2026-03-20T12:57:17.511Z\",\"timestamp\":\"2026-03-20T12:57:17.511Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/76\",\"method\":\"PUT\"}', '2026-03-20 12:57:17'),
(198, 73, 'LOGOUT', 'User tsehayu@itp.et logged out', '{\"user_id\":\"73\",\"username\":\"tsehayu@itp.et\",\"employee_name\":\"tsuhayu directorate\",\"logout_time\":\"2026-03-20T12:57:25.270Z\",\"timestamp\":\"2026-03-20T12:57:25.270Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/73\",\"method\":\"PUT\"}', '2026-03-20 12:57:25'),
(199, 67, 'LOGIN', 'User hayaltamrat@gmail.com logged in successfully', '{\"username\":\"hayaltamrat@gmail.com\",\"user_id\":67,\"role_id\":8,\"employee_id\":139,\"employee_name\":\"hayal Tamrat\",\"department_id\":2,\"login_time\":\"2026-03-20T12:57:32.001Z\",\"timestamp\":\"2026-03-20T12:57:32.001Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-20 12:57:32'),
(200, 25, 'LOGIN', 'User olana@itp.et logged in successfully', '{\"username\":\"olana@itp.et\",\"user_id\":25,\"role_id\":2,\"employee_id\":72,\"employee_name\":\"Olana\",\"department_id\":2,\"login_time\":\"2026-03-20T12:58:26.591Z\",\"timestamp\":\"2026-03-20T12:58:26.591Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-20 12:58:26'),
(201, 25, 'LOGOUT', 'User olana@itp.et logged out', '{\"user_id\":\"25\",\"username\":\"olana@itp.et\",\"employee_name\":\"Olana\",\"logout_time\":\"2026-03-20T12:59:22.150Z\",\"timestamp\":\"2026-03-20T12:59:22.150Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/25\",\"method\":\"PUT\"}', '2026-03-20 12:59:22'),
(202, 73, 'LOGIN', 'User tsehayu@itp.et logged in successfully', '{\"username\":\"tsehayu@itp.et\",\"user_id\":73,\"role_id\":5,\"employee_id\":146,\"employee_name\":\"tsuhayu directorate\",\"department_id\":11,\"login_time\":\"2026-03-20T12:59:35.789Z\",\"timestamp\":\"2026-03-20T12:59:35.790Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-20 12:59:35'),
(203, 73, 'LOGOUT', 'User tsehayu@itp.et logged out', '{\"user_id\":\"73\",\"username\":\"tsehayu@itp.et\",\"employee_name\":\"tsuhayu directorate\",\"logout_time\":\"2026-03-20T12:59:45.782Z\",\"timestamp\":\"2026-03-20T12:59:45.782Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/73\",\"method\":\"PUT\"}', '2026-03-20 12:59:45'),
(204, 25, 'LOGIN', 'User olana@itp.et logged in successfully', '{\"username\":\"olana@itp.et\",\"user_id\":25,\"role_id\":2,\"employee_id\":72,\"employee_name\":\"Olana\",\"department_id\":2,\"login_time\":\"2026-03-20T12:59:54.790Z\",\"timestamp\":\"2026-03-20T12:59:54.790Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-20 12:59:54'),
(205, 67, 'LOGOUT', 'User hayaltamrat@gmail.com logged out', '{\"user_id\":\"67\",\"username\":\"hayaltamrat@gmail.com\",\"employee_name\":\"hayal Tamrat\",\"logout_time\":\"2026-03-20T14:23:56.812Z\",\"timestamp\":\"2026-03-20T14:23:56.812Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/67\",\"method\":\"PUT\"}', '2026-03-20 14:23:56'),
(206, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":2,\"login_time\":\"2026-03-20T14:24:02.870Z\",\"timestamp\":\"2026-03-20T14:24:02.870Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-20 14:24:02'),
(207, 25, 'LOGOUT', 'User olana@itp.et logged out', '{\"user_id\":\"25\",\"username\":\"olana@itp.et\",\"employee_name\":\"Olana\",\"logout_time\":\"2026-03-20T14:25:21.647Z\",\"timestamp\":\"2026-03-20T14:25:21.647Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/25\",\"method\":\"PUT\"}', '2026-03-20 14:25:21'),
(208, 25, 'LOGIN', 'User olana@itp.et logged in successfully', '{\"username\":\"olana@itp.et\",\"user_id\":25,\"role_id\":2,\"employee_id\":72,\"employee_name\":\"Olana\",\"department_id\":2,\"login_time\":\"2026-03-20T14:25:23.472Z\",\"timestamp\":\"2026-03-20T14:25:23.472Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-20 14:25:23'),
(209, 25, 'LOGOUT', 'User olana@itp.et logged out', '{\"user_id\":\"25\",\"username\":\"olana@itp.et\",\"employee_name\":\"Olana\",\"logout_time\":\"2026-03-20T14:25:58.555Z\",\"timestamp\":\"2026-03-20T14:25:58.555Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/25\",\"method\":\"PUT\"}', '2026-03-20 14:25:58'),
(210, 79, 'LOGIN', 'User Milliongoraw@gmail.com logged in successfully', '{\"username\":\"Milliongoraw@gmail.com\",\"user_id\":79,\"role_id\":6,\"employee_id\":152,\"employee_name\":\"Million  Goraw\",\"department_id\":null,\"login_time\":\"2026-03-20T14:26:05.270Z\",\"timestamp\":\"2026-03-20T14:26:05.270Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-20 14:26:05'),
(211, 40, 'LOGOUT', 'User ezira@itpark.et logged out', '{\"user_id\":\"40\",\"username\":\"ezira@itpark.et\",\"employee_name\":\"Ezira\",\"logout_time\":\"2026-03-20T14:48:27.507Z\",\"timestamp\":\"2026-03-20T14:48:27.507Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/40\",\"method\":\"PUT\"}', '2026-03-20 14:48:27'),
(212, 73, 'LOGIN', 'User tsehayu@itp.et logged in successfully', '{\"username\":\"tsehayu@itp.et\",\"user_id\":73,\"role_id\":5,\"employee_id\":146,\"employee_name\":\"tsuhayu directorate\",\"department_id\":11,\"login_time\":\"2026-03-20T14:48:41.218Z\",\"timestamp\":\"2026-03-20T14:48:41.219Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-20 14:48:41'),
(213, 73, 'LOGOUT', 'User tsehayu@itp.et logged out', '{\"user_id\":\"73\",\"username\":\"tsehayu@itp.et\",\"employee_name\":\"tsuhayu directorate\",\"logout_time\":\"2026-03-20T14:49:07.939Z\",\"timestamp\":\"2026-03-20T14:49:07.939Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/73\",\"method\":\"PUT\"}', '2026-03-20 14:49:07'),
(214, 25, 'LOGIN', 'User olana@itp.et logged in successfully', '{\"username\":\"olana@itp.et\",\"user_id\":25,\"role_id\":2,\"employee_id\":72,\"employee_name\":\"Olana\",\"department_id\":2,\"login_time\":\"2026-03-20T14:49:12.132Z\",\"timestamp\":\"2026-03-20T14:49:12.132Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-20 14:49:12'),
(215, 25, 'LOGOUT', 'User olana@itp.et logged out', '{\"user_id\":\"25\",\"username\":\"olana@itp.et\",\"employee_name\":\"Olana\",\"logout_time\":\"2026-03-20T14:50:01.457Z\",\"timestamp\":\"2026-03-20T14:50:01.457Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/25\",\"method\":\"PUT\"}', '2026-03-20 14:50:01'),
(216, 69, 'LOGIN', 'User belete@itp.et logged in successfully', '{\"username\":\"belete@itp.et\",\"user_id\":69,\"role_id\":29,\"employee_id\":142,\"employee_name\":\"belete esubalew\",\"department_id\":null,\"login_time\":\"2026-03-20T14:50:11.157Z\",\"timestamp\":\"2026-03-20T14:50:11.157Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-20 14:50:11'),
(217, 79, 'LOGOUT', 'User Milliongoraw@gmail.com logged out', '{\"user_id\":\"79\",\"username\":\"Milliongoraw@gmail.com\",\"employee_name\":\"Million  Goraw\",\"logout_time\":\"2026-03-20T14:51:44.603Z\",\"timestamp\":\"2026-03-20T14:51:44.603Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/79\",\"method\":\"PUT\"}', '2026-03-20 14:51:44'),
(218, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":2,\"login_time\":\"2026-03-20T14:51:49.842Z\",\"timestamp\":\"2026-03-20T14:51:49.842Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-20 14:51:49'),
(219, 40, 'LOGOUT', 'User ezira@itpark.et logged out', '{\"user_id\":\"40\",\"username\":\"ezira@itpark.et\",\"employee_name\":\"Ezira\",\"logout_time\":\"2026-03-20T15:38:41.176Z\",\"timestamp\":\"2026-03-20T15:38:41.176Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/40\",\"method\":\"PUT\"}', '2026-03-20 15:38:41'),
(220, 67, 'LOGIN', 'User hayaltamrat@gmail.com logged in successfully', '{\"username\":\"hayaltamrat@gmail.com\",\"user_id\":67,\"role_id\":8,\"employee_id\":139,\"employee_name\":\"hayal Tamrat\",\"department_id\":2,\"login_time\":\"2026-03-20T15:39:13.142Z\",\"timestamp\":\"2026-03-20T15:39:13.142Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-20 15:39:13'),
(221, 69, 'LOGOUT', 'User belete@itp.et logged out', '{\"user_id\":\"69\",\"username\":\"belete@itp.et\",\"employee_name\":\"belete esubalew\",\"logout_time\":\"2026-03-20T15:39:41.225Z\",\"timestamp\":\"2026-03-20T15:39:41.225Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/69\",\"method\":\"PUT\"}', '2026-03-20 15:39:41'),
(222, 79, 'LOGIN', 'User milliongoraw@gmail.com logged in successfully', '{\"username\":\"milliongoraw@gmail.com\",\"user_id\":79,\"role_id\":6,\"employee_id\":152,\"employee_name\":\"Million  Goraw\",\"department_id\":null,\"login_time\":\"2026-03-20T15:40:12.455Z\",\"timestamp\":\"2026-03-20T15:40:12.455Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-20 15:40:12');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `description`, `metadata`, `created_at`) VALUES
(223, 79, 'LOGOUT', 'User Milliongoraw@gmail.com logged out', '{\"user_id\":\"79\",\"username\":\"Milliongoraw@gmail.com\",\"employee_name\":\"Million  Goraw\",\"logout_time\":\"2026-03-20T15:54:51.413Z\",\"timestamp\":\"2026-03-20T15:54:51.413Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/79\",\"method\":\"PUT\"}', '2026-03-20 15:54:51'),
(224, 73, 'LOGIN', 'User tsehayu@itp.et logged in successfully', '{\"username\":\"tsehayu@itp.et\",\"user_id\":73,\"role_id\":5,\"employee_id\":146,\"employee_name\":\"tsuhayu directorate\",\"department_id\":11,\"login_time\":\"2026-03-20T15:55:02.050Z\",\"timestamp\":\"2026-03-20T15:55:02.050Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-20 15:55:02'),
(225, 67, 'LOGOUT', 'User hayaltamrat@gmail.com logged out', '{\"user_id\":\"67\",\"username\":\"hayaltamrat@gmail.com\",\"employee_name\":\"hayal Tamrat\",\"logout_time\":\"2026-03-20T17:55:31.160Z\",\"timestamp\":\"2026-03-20T17:55:31.161Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/67\",\"method\":\"PUT\"}', '2026-03-20 17:55:31'),
(226, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":2,\"login_time\":\"2026-03-20T17:55:42.092Z\",\"timestamp\":\"2026-03-20T17:55:42.092Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-20 17:55:42'),
(227, 73, 'LOGOUT', 'User tsehayu@itp.et logged out', '{\"user_id\":\"73\",\"username\":\"tsehayu@itp.et\",\"employee_name\":\"tsuhayu directorate\",\"logout_time\":\"2026-03-20T18:00:42.883Z\",\"timestamp\":\"2026-03-20T18:00:42.883Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/73\",\"method\":\"PUT\"}', '2026-03-20 18:00:42'),
(228, 79, 'LOGIN', 'User milliongoraw@gmail.com logged in successfully', '{\"username\":\"milliongoraw@gmail.com\",\"user_id\":79,\"role_id\":6,\"employee_id\":152,\"employee_name\":\"Million  Goraw\",\"department_id\":null,\"login_time\":\"2026-03-20T18:00:51.019Z\",\"timestamp\":\"2026-03-20T18:00:51.019Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-20 18:00:51'),
(229, 40, 'LOGOUT', 'User ezira@itpark.et logged out', '{\"user_id\":\"40\",\"username\":\"ezira@itpark.et\",\"employee_name\":\"Ezira\",\"logout_time\":\"2026-03-20T18:01:42.161Z\",\"timestamp\":\"2026-03-20T18:01:42.161Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/40\",\"method\":\"PUT\"}', '2026-03-20 18:01:42'),
(230, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":2,\"login_time\":\"2026-03-20T18:01:44.929Z\",\"timestamp\":\"2026-03-20T18:01:44.929Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-20 18:01:44'),
(231, 40, 'LOGOUT', 'User ezira@itpark.et logged out', '{\"user_id\":\"40\",\"username\":\"ezira@itpark.et\",\"employee_name\":\"Ezira\",\"logout_time\":\"2026-03-21T06:07:40.574Z\",\"timestamp\":\"2026-03-21T06:07:40.574Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/40\",\"method\":\"PUT\"}', '2026-03-21 06:07:40'),
(232, 73, 'LOGIN', 'User tsehayu@itp.et logged in successfully', '{\"username\":\"tsehayu@itp.et\",\"user_id\":73,\"role_id\":5,\"employee_id\":146,\"employee_name\":\"tsuhayu directorate\",\"department_id\":11,\"login_time\":\"2026-03-21T06:07:48.060Z\",\"timestamp\":\"2026-03-21T06:07:48.060Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-21 06:07:48'),
(233, 79, 'LOGOUT', 'User Milliongoraw@gmail.com logged out', '{\"user_id\":\"79\",\"username\":\"Milliongoraw@gmail.com\",\"employee_name\":\"Million  Goraw\",\"logout_time\":\"2026-03-21T14:25:35.277Z\",\"timestamp\":\"2026-03-21T14:25:35.277Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/79\",\"method\":\"PUT\"}', '2026-03-21 14:25:35'),
(234, 73, 'LOGIN', 'User tsehayu@itp.et logged in successfully', '{\"username\":\"tsehayu@itp.et\",\"user_id\":73,\"role_id\":5,\"employee_id\":146,\"employee_name\":\"tsuhayu directorate\",\"department_id\":11,\"login_time\":\"2026-03-21T14:25:49.105Z\",\"timestamp\":\"2026-03-21T14:25:49.105Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-21 14:25:49'),
(235, 73, 'LOGOUT', 'User tsehayu@itp.et logged out', '{\"user_id\":\"73\",\"username\":\"tsehayu@itp.et\",\"employee_name\":\"tsuhayu directorate\",\"logout_time\":\"2026-03-23T06:09:05.418Z\",\"timestamp\":\"2026-03-23T06:09:05.418Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/73\",\"method\":\"PUT\"}', '2026-03-23 06:09:05'),
(236, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":2,\"login_time\":\"2026-03-23T06:09:09.608Z\",\"timestamp\":\"2026-03-23T06:09:09.608Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-23 06:09:09'),
(237, 40, 'LOGOUT', 'User ezira@itpark.et logged out', '{\"user_id\":\"40\",\"username\":\"ezira@itpark.et\",\"employee_name\":\"Ezira\",\"logout_time\":\"2026-03-23T06:46:13.770Z\",\"timestamp\":\"2026-03-23T06:46:13.770Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/40\",\"method\":\"PUT\"}', '2026-03-23 06:46:13'),
(238, 79, 'LOGIN', 'User milliongoraw@gmail.com logged in successfully', '{\"username\":\"milliongoraw@gmail.com\",\"user_id\":79,\"role_id\":6,\"employee_id\":152,\"employee_name\":\"Million  Goraw\",\"department_id\":null,\"login_time\":\"2026-03-23T06:46:20.769Z\",\"timestamp\":\"2026-03-23T06:46:20.769Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-23 06:46:20'),
(239, 79, 'LOGOUT', 'User Milliongoraw@gmail.com logged out', '{\"user_id\":\"79\",\"username\":\"Milliongoraw@gmail.com\",\"employee_name\":\"Million  Goraw\",\"logout_time\":\"2026-03-23T09:05:02.339Z\",\"timestamp\":\"2026-03-23T09:05:02.339Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/79\",\"method\":\"PUT\"}', '2026-03-23 09:05:02'),
(240, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":null,\"login_time\":\"2026-03-23T09:05:10.721Z\",\"timestamp\":\"2026-03-23T09:05:10.721Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-23 09:05:10'),
(241, 73, 'LOGOUT', 'User tsehayu@itp.et logged out', '{\"user_id\":\"73\",\"username\":\"tsehayu@itp.et\",\"employee_name\":\"tsuhayu directorate\",\"logout_time\":\"2026-03-23T11:09:02.387Z\",\"timestamp\":\"2026-03-23T11:09:02.387Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/73\",\"method\":\"PUT\"}', '2026-03-23 11:09:02'),
(242, 76, 'LOGIN', 'User hayaltamrat@itp.et logged in successfully', '{\"username\":\"hayaltamrat@itp.et\",\"user_id\":76,\"role_id\":8,\"employee_id\":149,\"employee_name\":\"Hayal Tamrat\",\"department_id\":18,\"login_time\":\"2026-03-23T11:09:09.662Z\",\"timestamp\":\"2026-03-23T11:09:09.662Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-23 11:09:09'),
(243, 76, 'LOGOUT', 'User hayaltamrat@itp.et logged out', '{\"user_id\":\"76\",\"username\":\"hayaltamrat@itp.et\",\"employee_name\":\"Hayal Tamrat\",\"logout_time\":\"2026-03-23T11:10:04.589Z\",\"timestamp\":\"2026-03-23T11:10:04.589Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/76\",\"method\":\"PUT\"}', '2026-03-23 11:10:04'),
(244, 79, 'LOGIN', 'User Milliongoraw@gmail.com logged in successfully', '{\"username\":\"Milliongoraw@gmail.com\",\"user_id\":79,\"role_id\":6,\"employee_id\":152,\"employee_name\":\"Million  Goraw\",\"department_id\":null,\"login_time\":\"2026-03-23T11:10:09.244Z\",\"timestamp\":\"2026-03-23T11:10:09.244Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-23 11:10:09'),
(245, 79, 'LOGOUT', 'User Milliongoraw@gmail.com logged out', '{\"user_id\":\"79\",\"username\":\"Milliongoraw@gmail.com\",\"employee_name\":\"Million  Goraw\",\"logout_time\":\"2026-03-24T12:18:01.564Z\",\"timestamp\":\"2026-03-24T12:18:01.564Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/79\",\"method\":\"PUT\"}', '2026-03-24 12:18:01'),
(246, 76, 'LOGIN', 'User hayaltamrat@itp.et logged in successfully', '{\"username\":\"hayaltamrat@itp.et\",\"user_id\":76,\"role_id\":8,\"employee_id\":149,\"employee_name\":\"Hayal Tamrat\",\"department_id\":18,\"login_time\":\"2026-03-24T12:18:08.502Z\",\"timestamp\":\"2026-03-24T12:18:08.502Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-24 12:18:08'),
(247, 76, 'LOGOUT', 'User hayaltamrat@itp.et logged out', '{\"user_id\":\"76\",\"username\":\"hayaltamrat@itp.et\",\"employee_name\":\"Hayal Tamrat\",\"logout_time\":\"2026-03-24T12:19:35.590Z\",\"timestamp\":\"2026-03-24T12:19:35.590Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/76\",\"method\":\"PUT\"}', '2026-03-24 12:19:35'),
(248, 73, 'LOGIN', 'User tsehayu@itp.et logged in successfully', '{\"username\":\"tsehayu@itp.et\",\"user_id\":73,\"role_id\":5,\"employee_id\":146,\"employee_name\":\"tsuhayu directorate\",\"department_id\":11,\"login_time\":\"2026-03-24T12:19:43.718Z\",\"timestamp\":\"2026-03-24T12:19:43.718Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-24 12:19:43'),
(249, 73, 'LOGOUT', 'User tsehayu@itp.et logged out', '{\"user_id\":\"73\",\"username\":\"tsehayu@itp.et\",\"employee_name\":\"tsuhayu directorate\",\"logout_time\":\"2026-03-24T12:20:13.733Z\",\"timestamp\":\"2026-03-24T12:20:13.733Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/73\",\"method\":\"PUT\"}', '2026-03-24 12:20:13'),
(250, 25, 'LOGIN', 'User olana@itp.et logged in successfully', '{\"username\":\"olana@itp.et\",\"user_id\":25,\"role_id\":2,\"employee_id\":72,\"employee_name\":\"Olana\",\"department_id\":2,\"login_time\":\"2026-03-24T12:20:20.588Z\",\"timestamp\":\"2026-03-24T12:20:20.588Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-24 12:20:20'),
(251, 25, 'LOGOUT', 'User olana@itp.et logged out', '{\"user_id\":\"25\",\"username\":\"olana@itp.et\",\"employee_name\":\"Olana\",\"logout_time\":\"2026-03-24T12:21:23.347Z\",\"timestamp\":\"2026-03-24T12:21:23.347Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/25\",\"method\":\"PUT\"}', '2026-03-24 12:21:23'),
(252, 69, 'LOGIN', 'User belete@itp.et logged in successfully', '{\"username\":\"belete@itp.et\",\"user_id\":69,\"role_id\":29,\"employee_id\":142,\"employee_name\":\"belete esubalew\",\"department_id\":null,\"login_time\":\"2026-03-24T12:21:34.708Z\",\"timestamp\":\"2026-03-24T12:21:34.708Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-24 12:21:34'),
(253, 69, 'LOGOUT', 'User belete@itp.et logged out', '{\"user_id\":\"69\",\"username\":\"belete@itp.et\",\"employee_name\":\"belete esubalew\",\"logout_time\":\"2026-03-24T12:34:13.089Z\",\"timestamp\":\"2026-03-24T12:34:13.089Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/69\",\"method\":\"PUT\"}', '2026-03-24 12:34:13'),
(254, 79, 'LOGIN', 'User Milliongoraw@gmail.com logged in successfully', '{\"username\":\"Milliongoraw@gmail.com\",\"user_id\":79,\"role_id\":6,\"employee_id\":152,\"employee_name\":\"Million  Goraw\",\"department_id\":null,\"login_time\":\"2026-03-24T12:34:24.451Z\",\"timestamp\":\"2026-03-24T12:34:24.451Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-24 12:34:24'),
(255, 25, 'LOGOUT', 'User olana@itp.et logged out', '{\"user_id\":\"25\",\"username\":\"olana@itp.et\",\"employee_name\":\"Olana\",\"logout_time\":\"2026-03-24T13:33:15.375Z\",\"timestamp\":\"2026-03-24T13:33:15.375Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/25\",\"method\":\"PUT\"}', '2026-03-24 13:33:15'),
(256, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":null,\"login_time\":\"2026-03-24T19:02:54.255Z\",\"timestamp\":\"2026-03-24T19:02:54.255Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-24 19:02:54'),
(257, 40, 'LOGOUT', 'User ezira@itpark.et logged out', '{\"user_id\":\"40\",\"username\":\"ezira@itpark.et\",\"employee_name\":\"Ezira\",\"logout_time\":\"2026-03-25T06:24:26.752Z\",\"timestamp\":\"2026-03-25T06:24:26.752Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/40\",\"method\":\"PUT\"}', '2026-03-25 06:24:26'),
(258, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":null,\"login_time\":\"2026-03-25T06:33:02.689Z\",\"timestamp\":\"2026-03-25T06:33:02.689Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-25 06:33:02'),
(524, 40, 'LOGOUT', 'User ezira@itpark.et logged out', '{\"user_id\":\"40\",\"username\":\"ezira@itpark.et\",\"employee_name\":\"Ezira\",\"logout_time\":\"2026-03-25T07:38:40.605Z\",\"timestamp\":\"2026-03-25T07:38:40.605Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/40\",\"method\":\"PUT\"}', '2026-03-25 07:38:40'),
(525, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":null,\"login_time\":\"2026-03-25T07:38:43.335Z\",\"timestamp\":\"2026-03-25T07:38:43.335Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-25 07:38:43'),
(526, 24, 'TASK_CREATE', 'Created task: \"Fix API timeout issues\" assigned to team', '{\"ip_address\":\"192.168.1.198\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/tasks/187\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"task_id\":187}', '2026-03-11 00:30:40'),
(527, 76, 'PLAN_DELETE', 'Deleted plan: \"Marketing Strategy 2026\" (ID 351)', '{\"ip_address\":\"192.168.1.193\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/plans/351\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"plan_id\":351}', '2026-03-23 04:40:13'),
(528, 57, 'PLAN_CREATE', 'Created plan: \"Construction Safety Roadmap\" (ID 249)', '{\"ip_address\":\"192.168.1.95\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/plans/249\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.064Z\",\"plan_id\":249}', '2026-03-17 21:10:19'),
(529, 79, 'PLAN_UPDATE', 'Updated plan: \"Annual IT Infrastructure Upgrade\" — revised budget & timeline', '{\"ip_address\":\"192.168.1.33\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/plans/317\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"plan_id\":317}', '2026-03-19 09:48:08'),
(530, 43, 'REPORT_DECLINE', 'Declined report: \"Q1 Financial Summary Report\" — data inconsistency', '{\"ip_address\":\"192.168.1.26\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/reports/612\",\"method\":\"GET\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"report_id\":612}', '2026-03-16 15:54:30'),
(531, 27, 'REPORT_SUBMIT', 'Submitted report: \"Q1 Financial Summary Report\" for review', '{\"ip_address\":\"192.168.1.28\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/reports/549\",\"method\":\"GET\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"report_id\":549}', '2026-03-09 00:29:37'),
(532, 38, 'REPORT_CREATE', 'Created report: \"Annual Audit Report 2024\"', '{\"ip_address\":\"192.168.1.84\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/reports/469\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"report_id\":469}', '2026-02-28 21:31:00'),
(533, 41, 'MENU_DELETE', 'Deleted menu item \"Tasks\" and cleaned up role_permissions', '{\"ip_address\":\"192.168.1.193\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/menu-permissions\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"role\":\"Expert\",\"menu\":\"Tasks\"}', '2026-02-27 00:14:19'),
(534, 46, 'PLAN_APPROVE', 'Approved plan: \"Legal Compliance Review Plan\" (ID 301)', '{\"ip_address\":\"192.168.1.22\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/plans/301\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"plan_id\":301}', '2026-02-27 07:46:15'),
(535, 79, 'TASK_COMPLETE', 'Completed task: \"Prepare Q2 budget sheet\" (ID 275) ahead of schedule', '{\"ip_address\":\"192.168.1.100\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/tasks/275\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"task_id\":275}', '2026-03-12 12:48:02'),
(536, 26, 'TASK_DELETE', 'Deleted task: \"Update employee records\" (ID 146) — cancelled', '{\"ip_address\":\"192.168.1.141\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/tasks/146\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"task_id\":146}', '2026-03-10 23:48:16'),
(537, 44, 'MENU_CREATE', 'Created menu item: \"Dashboard\" (path /dashboard)', '{\"ip_address\":\"192.168.1.198\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/menu-permissions\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"role\":\"Staff\",\"menu\":\"Dashboard\"}', '2026-03-10 12:22:37'),
(538, 52, 'TASK_COMPLETE', 'Completed task: \"Prepare Q2 budget sheet\" (ID 195) ahead of schedule', '{\"ip_address\":\"192.168.1.41\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/tasks/195\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"task_id\":195}', '2026-03-12 10:24:32'),
(539, 64, 'PLAN_VIEW', 'Viewed plan: \"Employee Training Programme 2025\"', '{\"ip_address\":\"192.168.1.154\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/plans/403\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"plan_id\":403}', '2026-02-23 23:40:44'),
(540, 56, 'PLAN_APPROVE', 'Approved plan: \"Q2 Budget Forecast Plan\" (ID 226)', '{\"ip_address\":\"192.168.1.27\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/plans/226\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"plan_id\":226}', '2026-03-16 11:36:31'),
(541, 79, 'REPORT_DECLINE', 'Declined report: \"Monthly Employee Performance\" — data inconsistency', '{\"ip_address\":\"192.168.1.50\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/reports/674\",\"method\":\"GET\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"report_id\":674}', '2026-03-04 15:21:05'),
(542, 46, 'REPORT_UPDATE', 'Updated report: \"Construction Progress Report\" — added Q3 data', '{\"ip_address\":\"192.168.1.136\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/reports/345\",\"method\":\"GET\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"report_id\":345}', '2026-02-25 16:56:05'),
(543, 43, 'PLAN_VIEW', 'Viewed plan: \"Q2 Budget Forecast Plan\"', '{\"ip_address\":\"192.168.1.27\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/plans/203\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"plan_id\":203}', '2026-03-15 01:12:12'),
(544, 55, 'TASK_COMPLETE', 'Completed task: \"Update employee records\" (ID 189) ahead of schedule', '{\"ip_address\":\"192.168.1.58\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/tasks/189\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"task_id\":189}', '2026-03-22 02:59:18'),
(545, 25, 'REPORT_SUBMIT', 'Submitted report: \"Q1 Financial Summary Report\" for review', '{\"ip_address\":\"192.168.1.189\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/reports/414\",\"method\":\"GET\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"report_id\":414}', '2026-03-07 16:28:51'),
(546, 43, 'PLAN_DELETE', 'Deleted plan: \"HR Onboarding Automation\" (ID 423)', '{\"ip_address\":\"192.168.1.33\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/plans/423\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"plan_id\":423}', '2026-03-16 16:01:49'),
(547, 40, 'TASK_DELETE', 'Deleted task: \"Deploy hotfix to production\" (ID 173) — cancelled', '{\"ip_address\":\"192.168.1.56\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/tasks/173\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"task_id\":173}', '2026-03-01 21:29:35'),
(548, 37, 'REPORT_CREATE', 'Created report: \"IT Incident Response Report\"', '{\"ip_address\":\"192.168.1.54\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/reports/473\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"report_id\":473}', '2026-03-20 18:50:03'),
(549, 68, 'PLAN_SUBMIT', 'Submitted plan: \"Q2 Budget Forecast Plan\" for approval', '{\"ip_address\":\"192.168.1.188\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/plans/155\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"plan_id\":155}', '2026-03-23 13:31:16'),
(550, 6, 'MENU_UPDATE', 'Updated menu item \"Tasks\" — changed icon & display order', '{\"ip_address\":\"192.168.1.80\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/menu-permissions\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"role\":\"Manager\",\"menu\":\"Tasks\"}', '2026-03-04 14:19:43'),
(551, 73, 'PLAN_UPDATE', 'Updated plan: \"Annual IT Infrastructure Upgrade\" — revised budget & timeline', '{\"ip_address\":\"192.168.1.144\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/plans/267\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"plan_id\":267}', '2026-03-16 14:02:43'),
(552, 52, 'TASK_CREATE', 'Created task: \"Review server backups\" assigned to team', '{\"ip_address\":\"192.168.1.115\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/tasks/213\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"task_id\":213}', '2026-03-05 01:48:26'),
(553, 7, 'REPORT_UPDATE', 'Updated report: \"Risk Assessment Report\" — added Q3 data', '{\"ip_address\":\"192.168.1.93\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/reports/306\",\"method\":\"GET\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"report_id\":306}', '2026-03-17 01:38:54'),
(554, 50, 'TASK_UPDATE', 'Updated task: \"Update employee records\" — changed deadline & priority', '{\"ip_address\":\"192.168.1.19\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/tasks/26\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"task_id\":26}', '2026-03-05 20:41:10'),
(555, 69, 'REPORT_DECLINE', 'Declined report: \"Q1 Financial Summary Report\" — data inconsistency', '{\"ip_address\":\"192.168.1.150\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/reports/280\",\"method\":\"GET\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"report_id\":280}', '2026-03-08 06:29:37'),
(556, 25, 'REPORT_CREATE', 'Created report: \"Budget Variance Analysis\"', '{\"ip_address\":\"192.168.1.145\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/reports/538\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"report_id\":538}', '2026-02-25 19:06:24'),
(557, 40, 'TASK_COMPLETE', 'Completed task: \"Fix API timeout issues\" (ID 240) ahead of schedule', '{\"ip_address\":\"192.168.1.197\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/tasks/240\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"task_id\":240}', '2026-03-25 02:43:17'),
(558, 56, 'TASK_CREATE', 'Created task: \"Train new team members\" assigned to team', '{\"ip_address\":\"192.168.1.170\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/tasks/131\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"task_id\":131}', '2026-03-20 19:30:38'),
(559, 54, 'TASK_UPDATE', 'Updated task: \"Update employee records\" — changed deadline & priority', '{\"ip_address\":\"192.168.1.60\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/tasks/215\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"task_id\":215}', '2026-03-18 07:13:11'),
(560, 7, 'TASK_CREATE', 'Created task: \"Update employee records\" assigned to team', '{\"ip_address\":\"192.168.1.133\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/tasks/268\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"task_id\":268}', '2026-03-15 23:47:10'),
(561, 74, 'TASK_COMPLETE', 'Completed task: \"Complete security audit\" (ID 220) ahead of schedule', '{\"ip_address\":\"192.168.1.96\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/tasks/220\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"task_id\":220}', '2026-02-25 04:51:29'),
(562, 38, 'PLAN_CREATE', 'Created plan: \"Annual IT Infrastructure Upgrade\" (ID 338)', '{\"ip_address\":\"192.168.1.176\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/plans/338\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"plan_id\":338}', '2026-03-11 11:08:17'),
(563, 64, 'PLAN_CREATE', 'Created plan: \"Employee Training Programme 2025\" (ID 204)', '{\"ip_address\":\"192.168.1.64\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/plans/204\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"plan_id\":204}', '2026-03-08 17:34:23'),
(564, 26, 'TASK_UPDATE', 'Updated task: \"Train new team members\" — changed deadline & priority', '{\"ip_address\":\"192.168.1.150\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/tasks/216\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"task_id\":216}', '2026-03-12 09:07:06'),
(565, 66, 'PLAN_DELETE', 'Deleted plan: \"Marketing Strategy 2026\" (ID 362)', '{\"ip_address\":\"192.168.1.65\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/plans/362\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"plan_id\":362}', '2026-03-18 00:39:56'),
(566, 79, 'TASK_UPDATE', 'Updated task: \"Update employee records\" — changed deadline & priority', '{\"ip_address\":\"192.168.1.111\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/tasks/83\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"task_id\":83}', '2026-02-26 13:02:32'),
(567, 55, 'PLAN_DECLINE', 'Declined plan: \"Digital Transformation Initiative\" — insufficient detail', '{\"ip_address\":\"192.168.1.15\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/plans/257\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"plan_id\":257}', '2026-03-15 19:36:21'),
(568, 75, 'ROLE_DELETE', 'Deleted role \"Manager\" and reassigned 3 users', '{\"ip_address\":\"192.168.1.62\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/menu-permissions\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"role\":\"Manager\",\"menu\":\"Admin Panel\"}', '2026-03-19 01:43:33'),
(569, 61, 'TASK_DELETE', 'Deleted task: \"Review server backups\" (ID 118) — cancelled', '{\"ip_address\":\"192.168.1.161\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/tasks/118\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"task_id\":118}', '2026-03-20 18:10:54'),
(570, 52, 'PLAN_CREATE', 'Created plan: \"Q2 Budget Forecast Plan\" (ID 212)', '{\"ip_address\":\"192.168.1.110\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/plans/212\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"plan_id\":212}', '2026-03-23 18:46:11'),
(571, 59, 'PLAN_CREATE', 'Created plan: \"Employee Training Programme 2025\" (ID 219)', '{\"ip_address\":\"192.168.1.169\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/plans/219\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"plan_id\":219}', '2026-03-15 15:48:40'),
(572, 49, 'REPORT_CREATE', 'Created report: \"Annual Audit Report 2024\"', '{\"ip_address\":\"192.168.1.150\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/reports/331\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"report_id\":331}', '2026-02-28 23:20:04'),
(573, 75, 'MEETING_POSTPONE', 'Postponed meeting: \"Q2 Strategy Meeting\" to next week', '{\"ip_address\":\"192.168.1.116\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/meetings/46\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"meeting_id\":46}', '2026-03-23 16:21:38'),
(574, 48, 'PLAN_DECLINE', 'Declined plan: \"Marketing Strategy 2026\" — insufficient detail', '{\"ip_address\":\"192.168.1.39\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/plans/235\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"plan_id\":235}', '2026-03-17 19:27:17'),
(575, 78, 'ROLE_DELETE', 'Deleted role \"Manager\" and reassigned 5 users', '{\"ip_address\":\"192.168.1.34\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/menu-permissions\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"role\":\"Manager\",\"menu\":\"Settings\"}', '2026-03-06 03:11:18'),
(576, 42, 'SYSTEM_START', 'Server started on port 5001 — DB connected, 16 routes registered', '{\"ip_address\":\"192.168.1.84\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/system/start\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\"}', '2026-03-21 08:46:55'),
(577, 27, 'SETTINGS_CHANGE', 'System setting changed: session_timeout updated', '{\"ip_address\":\"192.168.1.144\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/settings\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\"}', '2026-03-13 13:08:17'),
(578, 71, 'PLAN_UPDATE', 'Updated plan: \"Annual IT Infrastructure Upgrade\" — revised budget & timeline', '{\"ip_address\":\"192.168.1.138\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/plans/231\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"plan_id\":231}', '2026-03-18 03:24:02'),
(579, 63, 'REPORT_CREATE', 'Created report: \"Construction Progress Report\"', '{\"ip_address\":\"192.168.1.179\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/reports/374\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"report_id\":374}', '2026-02-23 21:55:51'),
(580, 47, 'REPORT_SUBMIT', 'Submitted report: \"Monthly Employee Performance\" for review', '{\"ip_address\":\"192.168.1.110\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/reports/615\",\"method\":\"GET\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"report_id\":615}', '2026-03-20 22:16:03'),
(581, 44, 'REPORT_SUBMIT', 'Submitted report: \"Budget Variance Analysis\" for review', '{\"ip_address\":\"192.168.1.110\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/reports/620\",\"method\":\"GET\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"report_id\":620}', '2026-03-10 12:46:57'),
(582, 65, 'REPORT_UPDATE', 'Updated report: \"Q1 Financial Summary Report\" — added Q3 data', '{\"ip_address\":\"192.168.1.101\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/reports/337\",\"method\":\"GET\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"report_id\":337}', '2026-03-08 11:57:29'),
(583, 46, 'REPORT_DELETE', 'Deleted report: \"Annual Audit Report 2024\" (ID 295)', '{\"ip_address\":\"192.168.1.24\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/reports/295\",\"method\":\"GET\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"report_id\":295}', '2026-03-07 15:21:11'),
(584, 37, 'PLAN_VIEW', 'Viewed plan: \"Marketing Strategy 2026\"', '{\"ip_address\":\"192.168.1.48\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/plans/148\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"plan_id\":148}', '2026-02-26 10:58:27'),
(585, 58, 'REPORT_SUBMIT', 'Submitted report: \"Annual Audit Report 2024\" for review', '{\"ip_address\":\"192.168.1.24\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/reports/605\",\"method\":\"GET\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"report_id\":605}', '2026-03-08 19:40:06'),
(586, 44, 'DATA_EXPORT', 'Data exported: employees table — 3230 rows as CSV', '{\"ip_address\":\"192.168.1.107\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/admin/export\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\"}', '2026-03-24 13:51:13'),
(587, NULL, 'SYSTEM_ERROR', 'Unhandled exception in /api/plans/approve — Timeout', '{\"ip_address\":\"192.168.1.199\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/system/errors\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\"}', '2026-03-18 04:57:58'),
(588, 74, 'REPORT_DECLINE', 'Declined report: \"Construction Progress Report\" — data inconsistency', '{\"ip_address\":\"192.168.1.12\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/reports/461\",\"method\":\"GET\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"report_id\":461}', '2026-03-19 08:42:59'),
(589, 26, 'TASK_CREATE', 'Created task: \"Train new team members\" assigned to team', '{\"ip_address\":\"192.168.1.115\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/tasks/133\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"task_id\":133}', '2026-03-20 11:55:11'),
(590, 37, 'TASK_DELETE', 'Deleted task: \"Prepare Q2 budget sheet\" (ID 281) — cancelled', '{\"ip_address\":\"192.168.1.143\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/tasks/281\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"task_id\":281}', '2026-03-06 02:22:17'),
(591, 42, 'TASK_UPDATE', 'Updated task: \"Prepare Q2 budget sheet\" — changed deadline & priority', '{\"ip_address\":\"192.168.1.59\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/tasks/83\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"task_id\":83}', '2026-03-16 11:51:06'),
(592, 30, 'PLAN_CREATE', 'Created plan: \"Q2 Budget Forecast Plan\" (ID 199)', '{\"ip_address\":\"192.168.1.28\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/plans/199\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"plan_id\":199}', '2026-03-15 18:26:18'),
(593, 37, 'TASK_UPDATE', 'Updated task: \"Deploy hotfix to production\" — changed deadline & priority', '{\"ip_address\":\"192.168.1.44\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/tasks/117\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"task_id\":117}', '2026-03-04 09:44:41'),
(594, 13, 'REPORT_APPROVE', 'Approved report: \"Risk Assessment Report\"', '{\"ip_address\":\"192.168.1.162\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/reports/664\",\"method\":\"GET\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"report_id\":664}', '2026-03-11 12:04:15'),
(595, 77, 'DATA_EXPORT', 'Scheduled database backup completed — 84 MB archived', '{\"ip_address\":\"192.168.1.128\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/admin/backup\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\"}', '2026-03-17 18:17:19'),
(596, 59, 'REPORT_DELETE', 'Deleted report: \"Q1 Financial Summary Report\" (ID 346)', '{\"ip_address\":\"192.168.1.64\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/reports/346\",\"method\":\"GET\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"report_id\":346}', '2026-03-04 09:58:08'),
(597, 75, 'PLAN_DELETE', 'Deleted plan: \"Legal Compliance Review Plan\" (ID 470)', '{\"ip_address\":\"192.168.1.127\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/plans/470\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"plan_id\":470}', '2026-03-12 02:09:03'),
(598, 62, 'MENU_DELETE', 'Deleted menu item \"Plans\" and cleaned up role_permissions', '{\"ip_address\":\"192.168.1.93\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/menu-permissions\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"role\":\"Team Leader\",\"menu\":\"Plans\"}', '2026-03-03 21:27:53'),
(599, 49, 'TASK_CREATE', 'Created task: \"Prepare Q2 budget sheet\" assigned to team', '{\"ip_address\":\"192.168.1.14\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/tasks/158\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"task_id\":158}', '2026-03-16 10:02:43'),
(600, 73, 'REPORT_DELETE', 'Deleted report: \"IT Incident Response Report\" (ID 335)', '{\"ip_address\":\"192.168.1.83\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/reports/335\",\"method\":\"GET\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"report_id\":335}', '2026-03-07 07:19:51'),
(601, 73, 'REPORT_DECLINE', 'Declined report: \"Risk Assessment Report\" — data inconsistency', '{\"ip_address\":\"192.168.1.62\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/reports/445\",\"method\":\"GET\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"report_id\":445}', '2026-03-19 03:47:24'),
(602, 49, 'REPORT_CREATE', 'Created report: \"IT Incident Response Report\"', '{\"ip_address\":\"192.168.1.151\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/reports/507\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"report_id\":507}', '2026-03-08 11:42:10'),
(603, 73, 'SYSTEM_ERROR', 'Unhandled exception in /api/reports — DB connection lost', '{\"ip_address\":\"192.168.1.80\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/system/errors\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\"}', '2026-03-10 00:50:24'),
(604, 26, 'MENU_UPDATE', 'Updated menu item \"Settings\" — changed icon & display order', '{\"ip_address\":\"192.168.1.75\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/menu-permissions\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"role\":\"Staff\",\"menu\":\"Settings\"}', '2026-03-12 13:08:38'),
(605, 49, 'PLAN_DECLINE', 'Declined plan: \"HR Onboarding Automation\" — insufficient detail', '{\"ip_address\":\"192.168.1.24\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/plans/180\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"plan_id\":180}', '2026-03-11 16:21:28'),
(606, 41, 'TASK_CREATE', 'Created task: \"Train new team members\" assigned to team', '{\"ip_address\":\"192.168.1.34\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/tasks/8\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"task_id\":8}', '2026-03-14 01:26:38'),
(607, 26, 'PLAN_DECLINE', 'Declined plan: \"Digital Transformation Initiative\" — insufficient detail', '{\"ip_address\":\"192.168.1.171\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/plans/142\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"plan_id\":142}', '2026-03-16 17:14:41'),
(608, 78, 'PLAN_CREATE', 'Created plan: \"Employee Training Programme 2025\" (ID 272)', '{\"ip_address\":\"192.168.1.67\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/plans/272\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"plan_id\":272}', '2026-02-24 00:46:46'),
(609, 65, 'ROLE_UPDATE', 'Updated role \"Manager\" — renamed & permission set revised', '{\"ip_address\":\"192.168.1.110\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/menu-permissions\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"role\":\"Manager\",\"menu\":\"Admin Panel\"}', '2026-03-24 23:40:54'),
(610, 37, 'ROLE_CREATE', 'Created new role: \"Manager Level 1\"', '{\"ip_address\":\"192.168.1.188\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/menu-permissions\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"role\":\"Manager\",\"menu\":\"Settings\"}', '2026-03-15 06:42:10'),
(611, 67, 'ROLE_CREATE', 'Created new role: \"Staff Level 2\"', '{\"ip_address\":\"192.168.1.117\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/menu-permissions\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"role\":\"Staff\",\"menu\":\"Admin Panel\"}', '2026-02-26 14:03:55'),
(612, 62, 'PERMISSION_UPDATE', 'Updated permissions for role \"Team Leader\" — toggled access to [Dashboard, Reports]', '{\"ip_address\":\"192.168.1.183\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/menu-permissions\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"role\":\"Team Leader\",\"menu\":\"Dashboard\"}', '2026-02-27 17:43:09'),
(613, 77, 'SETTINGS_CHANGE', 'System setting changed: email_notifications updated', '{\"ip_address\":\"192.168.1.55\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/settings\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\"}', '2026-03-03 01:29:50'),
(614, NULL, 'DATA_EXPORT', 'Data exported: audit_logs table — 493 rows as CSV', '{\"ip_address\":\"192.168.1.199\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/admin/export\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\"}', '2026-03-08 07:56:18'),
(615, 38, 'ROLE_UPDATE', 'Updated role \"Admin\" — renamed & permission set revised', '{\"ip_address\":\"192.168.1.85\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/menu-permissions\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"role\":\"Admin\",\"menu\":\"Settings\"}', '2026-03-19 23:26:46'),
(616, 73, 'SYSTEM_ERROR', 'Unhandled exception in /api/plans/approve — DB connection lost', '{\"ip_address\":\"192.168.1.94\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/system/errors\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\"}', '2026-03-12 05:33:38'),
(617, NULL, 'SETTINGS_CHANGE', 'System setting changed: session_timeout updated', '{\"ip_address\":\"192.168.1.64\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/settings\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\"}', '2026-03-18 04:24:59'),
(618, 55, 'REPORT_DECLINE', 'Declined report: \"Budget Variance Analysis\" — data inconsistency', '{\"ip_address\":\"192.168.1.71\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/reports/471\",\"method\":\"GET\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"report_id\":471}', '2026-03-16 04:32:31');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `description`, `metadata`, `created_at`) VALUES
(619, 39, 'ROLE_UPDATE', 'Updated role \"Staff\" — renamed & permission set revised', '{\"ip_address\":\"192.168.1.185\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/menu-permissions\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"role\":\"Staff\",\"menu\":\"Tasks\"}', '2026-02-28 12:34:12'),
(620, 27, 'SETTINGS_CHANGE', 'System setting changed: max_login_attempts updated', '{\"ip_address\":\"192.168.1.97\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/settings\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\"}', '2026-02-26 11:23:59'),
(621, 74, 'PLAN_UPDATE', 'Updated plan: \"Q2 Budget Forecast Plan\" — revised budget & timeline', '{\"ip_address\":\"192.168.1.55\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/plans/222\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"plan_id\":222}', '2026-03-09 02:53:24'),
(622, 78, 'PLAN_UPDATE', 'Updated plan: \"Annual IT Infrastructure Upgrade\" — revised budget & timeline', '{\"ip_address\":\"192.168.1.67\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/plans/308\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"plan_id\":308}', '2026-03-14 05:55:14'),
(623, 63, 'PLAN_APPROVE', 'Approved plan: \"Annual IT Infrastructure Upgrade\" (ID 121)', '{\"ip_address\":\"192.168.1.15\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/plans/121\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"plan_id\":121}', '2026-03-04 15:34:27'),
(624, 73, 'SETTINGS_CHANGE', 'System setting changed: max_login_attempts updated', '{\"ip_address\":\"192.168.1.56\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/settings\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\"}', '2026-03-02 14:11:38'),
(625, 55, 'PERMISSION_UPDATE', 'Updated permissions for role \"Manager\" — toggled access to [Plans, Tasks]', '{\"ip_address\":\"192.168.1.102\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/menu-permissions\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"role\":\"Manager\",\"menu\":\"Plans\"}', '2026-03-01 00:21:16'),
(626, 38, 'TASK_DELETE', 'Deleted task: \"Deploy hotfix to production\" (ID 51) — cancelled', '{\"ip_address\":\"192.168.1.128\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/tasks/51\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"task_id\":51}', '2026-03-14 00:39:39'),
(627, 43, 'TASK_COMPLETE', 'Completed task: \"Review server backups\" (ID 52) ahead of schedule', '{\"ip_address\":\"192.168.1.195\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/tasks/52\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"task_id\":52}', '2026-03-05 03:34:11'),
(628, NULL, 'SETTINGS_CHANGE', 'System setting changed: backup_schedule updated', '{\"ip_address\":\"192.168.1.64\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/settings\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\"}', '2026-02-27 15:48:20'),
(629, 77, 'TASK_COMPLETE', 'Completed task: \"Complete security audit\" (ID 129) ahead of schedule', '{\"ip_address\":\"192.168.1.152\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/tasks/129\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"task_id\":129}', '2026-03-13 06:40:18'),
(630, 47, 'DATA_EXPORT', 'Scheduled database backup completed — 169 MB archived', '{\"ip_address\":\"192.168.1.144\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/admin/backup\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\"}', '2026-03-23 22:42:16'),
(631, 77, 'MEETING_JOIN', 'Joined meeting: \"Q2 Strategy Meeting\"', '{\"ip_address\":\"192.168.1.22\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/meetings/68\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"meeting_id\":68}', '2026-03-05 17:07:30'),
(632, 41, 'MENU_DELETE', 'Deleted menu item \"Settings\" and cleaned up role_permissions', '{\"ip_address\":\"192.168.1.71\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/menu-permissions\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"role\":\"Admin\",\"menu\":\"Settings\"}', '2026-03-08 10:41:24'),
(633, 57, 'TASK_COMPLETE', 'Completed task: \"Prepare Q2 budget sheet\" (ID 76) ahead of schedule', '{\"ip_address\":\"192.168.1.134\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/tasks/76\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"task_id\":76}', '2026-03-21 07:35:58'),
(634, 75, 'TASK_CREATE', 'Created task: \"Train new team members\" assigned to team', '{\"ip_address\":\"192.168.1.48\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/tasks/73\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"task_id\":73}', '2026-02-25 21:22:41'),
(635, 76, 'ROLE_UPDATE', 'Updated role \"Expert\" — renamed & permission set revised', '{\"ip_address\":\"192.168.1.152\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/menu-permissions\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"role\":\"Expert\",\"menu\":\"Settings\"}', '2026-03-16 02:36:57'),
(636, 37, 'TASK_COMPLETE', 'Completed task: \"Review server backups\" (ID 163) ahead of schedule', '{\"ip_address\":\"192.168.1.30\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/tasks/163\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"task_id\":163}', '2026-03-07 14:53:15'),
(637, 75, 'PLAN_APPROVE', 'Approved plan: \"Marketing Strategy 2026\" (ID 187)', '{\"ip_address\":\"192.168.1.199\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/plans/187\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"plan_id\":187}', '2026-03-15 11:52:16'),
(638, 62, 'PLAN_CREATE', 'Created plan: \"Marketing Strategy 2026\" (ID 395)', '{\"ip_address\":\"192.168.1.152\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/plans/395\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"plan_id\":395}', '2026-03-14 14:29:35'),
(639, 42, 'MEETING_END', 'Ended meeting: \"Budget Review Session\" — duration 20 minutes', '{\"ip_address\":\"192.168.1.36\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/meetings/56\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"meeting_id\":56}', '2026-03-03 16:20:58'),
(640, 27, 'TASK_CREATE', 'Created task: \"Review server backups\" assigned to team', '{\"ip_address\":\"192.168.1.63\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/tasks/183\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"task_id\":183}', '2026-03-11 10:21:56'),
(641, 51, 'REPORT_UPDATE', 'Updated report: \"Construction Progress Report\" — added Q3 data', '{\"ip_address\":\"192.168.1.19\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/reports/544\",\"method\":\"GET\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"report_id\":544}', '2026-03-20 21:55:01'),
(642, 52, 'MEETING_CREATE', 'Scheduled meeting: \"Q2 Strategy Meeting\" — 7 attendees invited', '{\"ip_address\":\"192.168.1.49\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/meetings/1\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"meeting_id\":1}', '2026-02-28 21:20:42'),
(643, 37, 'TASK_UPDATE', 'Updated task: \"Fix API timeout issues\" — changed deadline & priority', '{\"ip_address\":\"192.168.1.84\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/tasks/112\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"task_id\":112}', '2026-03-18 20:31:39'),
(644, 7, 'PLAN_DECLINE', 'Declined plan: \"Q2 Budget Forecast Plan\" — insufficient detail', '{\"ip_address\":\"192.168.1.68\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/plans/439\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"plan_id\":439}', '2026-03-06 23:57:18'),
(645, 46, 'REPORT_APPROVE', 'Approved report: \"Q1 Financial Summary Report\"', '{\"ip_address\":\"192.168.1.167\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/reports/685\",\"method\":\"GET\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"report_id\":685}', '2026-03-01 03:25:25'),
(646, 76, 'TASK_DELETE', 'Deleted task: \"Fix API timeout issues\" (ID 33) — cancelled', '{\"ip_address\":\"192.168.1.36\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/tasks/33\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"task_id\":33}', '2026-03-23 22:22:38'),
(647, 77, 'REPORT_DECLINE', 'Declined report: \"Budget Variance Analysis\" — data inconsistency', '{\"ip_address\":\"192.168.1.171\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/reports/671\",\"method\":\"GET\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"report_id\":671}', '2026-03-02 06:53:51'),
(648, 79, 'PLAN_CREATE', 'Created plan: \"Employee Training Programme 2025\" (ID 179)', '{\"ip_address\":\"192.168.1.171\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/plans/179\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"plan_id\":179}', '2026-02-28 09:15:17'),
(649, 42, 'MEETING_POSTPONE', 'Postponed meeting: \"Audit Debrief\" to next week', '{\"ip_address\":\"192.168.1.143\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/meetings/39\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"meeting_id\":39}', '2026-03-20 22:42:35'),
(650, 55, 'REPORT_UPDATE', 'Updated report: \"IT Incident Response Report\" — added Q3 data', '{\"ip_address\":\"192.168.1.187\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/reports/393\",\"method\":\"GET\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"report_id\":393}', '2026-03-08 21:27:03'),
(651, 7, 'MEETING_JOIN', 'Joined meeting: \"Budget Review Session\"', '{\"ip_address\":\"192.168.1.124\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/meetings/59\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"meeting_id\":59}', '2026-02-24 21:18:52'),
(652, NULL, 'SYSTEM_ERROR', 'Unhandled exception in /api/users — DB connection lost', '{\"ip_address\":\"192.168.1.179\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/system/errors\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\"}', '2026-03-06 01:45:02'),
(653, 13, 'REPORT_APPROVE', 'Approved report: \"Annual Audit Report 2024\"', '{\"ip_address\":\"192.168.1.98\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/reports/648\",\"method\":\"GET\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"report_id\":648}', '2026-03-08 05:18:27'),
(654, 45, 'REPORT_DECLINE', 'Declined report: \"Risk Assessment Report\" — data inconsistency', '{\"ip_address\":\"192.168.1.173\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/reports/699\",\"method\":\"GET\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"report_id\":699}', '2026-03-13 13:45:25'),
(655, 64, 'PLAN_DECLINE', 'Declined plan: \"HR Onboarding Automation\" — insufficient detail', '{\"ip_address\":\"192.168.1.178\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/plans/459\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"plan_id\":459}', '2026-03-20 18:56:13'),
(656, 25, 'TASK_COMPLETE', 'Completed task: \"Prepare Q2 budget sheet\" (ID 108) ahead of schedule', '{\"ip_address\":\"192.168.1.92\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/tasks/108\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"task_id\":108}', '2026-03-06 12:35:02'),
(657, 64, 'PLAN_UPDATE', 'Updated plan: \"Employee Training Programme 2025\" — revised budget & timeline', '{\"ip_address\":\"192.168.1.14\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/plans/322\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"plan_id\":322}', '2026-02-23 16:26:25'),
(658, 42, 'TASK_CREATE', 'Created task: \"Complete security audit\" assigned to team', '{\"ip_address\":\"192.168.1.198\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/tasks/267\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"task_id\":267}', '2026-03-09 13:06:45'),
(659, 62, 'MENU_CREATE', 'Created menu item: \"Tasks\" (path /tasks)', '{\"ip_address\":\"192.168.1.50\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/menu-permissions\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"role\":\"Team Leader\",\"menu\":\"Tasks\"}', '2026-03-09 10:18:45'),
(660, 38, 'REPORT_CREATE', 'Created report: \"Budget Variance Analysis\"', '{\"ip_address\":\"192.168.1.162\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/reports/376\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"report_id\":376}', '2026-03-25 00:16:25'),
(661, 58, 'REPORT_CREATE', 'Created report: \"Risk Assessment Report\"', '{\"ip_address\":\"192.168.1.20\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/reports/499\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"report_id\":499}', '2026-03-15 03:18:10'),
(662, 77, 'TASK_DELETE', 'Deleted task: \"Fix API timeout issues\" (ID 110) — cancelled', '{\"ip_address\":\"192.168.1.93\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/tasks/110\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"task_id\":110}', '2026-03-15 20:40:58'),
(663, 55, 'REPORT_SUBMIT', 'Submitted report: \"Construction Progress Report\" for review', '{\"ip_address\":\"192.168.1.31\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/reports/547\",\"method\":\"GET\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"report_id\":547}', '2026-02-24 23:27:08'),
(664, 49, 'PLAN_SUBMIT', 'Submitted plan: \"Digital Transformation Initiative\" for approval', '{\"ip_address\":\"192.168.1.176\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/plans/485\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"plan_id\":485}', '2026-03-09 06:25:38'),
(665, 56, 'MENU_CREATE', 'Created menu item: \"Reports\" (path /reports)', '{\"ip_address\":\"192.168.1.33\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/menu-permissions\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"role\":\"Manager\",\"menu\":\"Reports\"}', '2026-03-19 02:54:25'),
(666, 54, 'PLAN_SUBMIT', 'Submitted plan: \"Marketing Strategy 2026\" for approval', '{\"ip_address\":\"192.168.1.36\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/plans/365\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"plan_id\":365}', '2026-03-14 18:40:06'),
(667, 40, 'MENU_DELETE', 'Deleted menu item \"Plans\" and cleaned up role_permissions', '{\"ip_address\":\"192.168.1.61\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/menu-permissions\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"role\":\"Admin\",\"menu\":\"Plans\"}', '2026-03-11 22:53:02'),
(668, 61, 'MENU_CREATE', 'Created menu item: \"Reports\" (path /reports)', '{\"ip_address\":\"192.168.1.58\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/menu-permissions\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"role\":\"Staff\",\"menu\":\"Reports\"}', '2026-03-10 11:42:47'),
(669, 67, 'TASK_UPDATE', 'Updated task: \"Review server backups\" — changed deadline & priority', '{\"ip_address\":\"192.168.1.198\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/tasks/271\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"task_id\":271}', '2026-03-23 19:05:20'),
(670, 77, 'PLAN_UPDATE', 'Updated plan: \"Employee Training Programme 2025\" — revised budget & timeline', '{\"ip_address\":\"192.168.1.182\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/plans/387\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"plan_id\":387}', '2026-03-02 15:02:16'),
(671, 40, 'PLAN_VIEW', 'Viewed plan: \"Q2 Budget Forecast Plan\"', '{\"ip_address\":\"192.168.1.193\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/plans/393\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"plan_id\":393}', '2026-03-08 11:22:10'),
(672, 48, 'PLAN_CREATE', 'Created plan: \"Digital Transformation Initiative\" (ID 247)', '{\"ip_address\":\"192.168.1.117\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/plans/247\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"plan_id\":247}', '2026-03-09 07:45:46'),
(673, 55, 'ROLE_DELETE', 'Deleted role \"Team Leader\" and reassigned 7 users', '{\"ip_address\":\"192.168.1.105\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/menu-permissions\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"role\":\"Team Leader\",\"menu\":\"Reports\"}', '2026-03-14 06:41:41'),
(674, 56, 'MENU_CREATE', 'Created menu item: \"Reports\" (path /reports)', '{\"ip_address\":\"192.168.1.189\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/menu-permissions\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"role\":\"Manager\",\"menu\":\"Reports\"}', '2026-03-17 21:48:39'),
(675, NULL, 'SYSTEM_START', 'Server started on port 5001 — DB connected, 19 routes registered', '{\"ip_address\":\"192.168.1.73\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/system/start\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\"}', '2026-03-08 09:27:02'),
(676, 61, 'TASK_UPDATE', 'Updated task: \"Train new team members\" — changed deadline & priority', '{\"ip_address\":\"192.168.1.189\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/tasks/221\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"task_id\":221}', '2026-03-10 20:03:36'),
(677, 40, 'MENU_CREATE', 'Created menu item: \"Settings\" (path /settings)', '{\"ip_address\":\"192.168.1.189\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/menu-permissions\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"role\":\"Team Leader\",\"menu\":\"Settings\"}', '2026-03-09 05:22:31'),
(678, 24, 'REPORT_VIEW', 'Viewed report: \"Annual Audit Report 2024\"', '{\"ip_address\":\"192.168.1.16\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/reports/442\",\"method\":\"GET\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"report_id\":442}', '2026-03-14 23:41:33'),
(679, 49, 'MEETING_JOIN', 'Joined meeting: \"Audit Debrief\"', '{\"ip_address\":\"192.168.1.190\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/meetings/53\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"meeting_id\":53}', '2026-03-12 13:52:25'),
(680, 40, 'PLAN_CREATE', 'Created plan: \"Q2 Budget Forecast Plan\" (ID 297)', '{\"ip_address\":\"192.168.1.186\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/plans/297\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"plan_id\":297}', '2026-02-28 15:51:32'),
(681, 78, 'PLAN_APPROVE', 'Approved plan: \"Legal Compliance Review Plan\" (ID 220)', '{\"ip_address\":\"192.168.1.138\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/plans/220\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"plan_id\":220}', '2026-03-09 14:56:06'),
(682, 73, 'REPORT_UPDATE', 'Updated report: \"IT Incident Response Report\" — added Q3 data', '{\"ip_address\":\"192.168.1.41\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/reports/646\",\"method\":\"GET\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"report_id\":646}', '2026-02-24 16:55:11'),
(683, 6, 'MEETING_END', 'Ended meeting: \"Budget Review Session\" — duration 27 minutes', '{\"ip_address\":\"192.168.1.167\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/meetings/28\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"meeting_id\":28}', '2026-03-11 12:48:20'),
(684, 79, 'PLAN_CREATE', 'Created plan: \"Q2 Budget Forecast Plan\" (ID 164)', '{\"ip_address\":\"192.168.1.187\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/plans/164\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"plan_id\":164}', '2026-02-25 08:17:13'),
(685, 51, 'ROLE_CREATE', 'Created new role: \"Admin Level 2\"', '{\"ip_address\":\"192.168.1.44\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/menu-permissions\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"role\":\"Admin\",\"menu\":\"Dashboard\"}', '2026-03-24 16:35:17'),
(686, 62, 'SYSTEM_ERROR', 'Unhandled exception in /api/plans/approve — Null reference', '{\"ip_address\":\"192.168.1.156\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/system/errors\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\"}', '2026-03-20 04:53:15'),
(687, 75, 'ROLE_UPDATE', 'Updated role \"Staff\" — renamed & permission set revised', '{\"ip_address\":\"192.168.1.42\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/menu-permissions\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"role\":\"Staff\",\"menu\":\"Settings\"}', '2026-02-27 07:16:16'),
(688, 48, 'MENU_UPDATE', 'Updated menu item \"Reports\" — changed icon & display order', '{\"ip_address\":\"192.168.1.45\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/menu-permissions\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"role\":\"Staff\",\"menu\":\"Reports\"}', '2026-02-25 21:55:38'),
(689, 62, 'REPORT_VIEW', 'Viewed report: \"Annual Audit Report 2024\"', '{\"ip_address\":\"192.168.1.47\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/reports/660\",\"method\":\"GET\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"report_id\":660}', '2026-03-16 10:14:17'),
(690, 76, 'TASK_UPDATE', 'Updated task: \"Complete security audit\" — changed deadline & priority', '{\"ip_address\":\"192.168.1.109\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/tasks/67\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"task_id\":67}', '2026-03-09 23:14:10'),
(691, 24, 'REPORT_DECLINE', 'Declined report: \"Monthly Employee Performance\" — data inconsistency', '{\"ip_address\":\"192.168.1.192\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/reports/442\",\"method\":\"GET\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"report_id\":442}', '2026-03-05 18:15:37'),
(692, 63, 'PLAN_DECLINE', 'Declined plan: \"Employee Training Programme 2025\" — insufficient detail', '{\"ip_address\":\"192.168.1.169\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/plans/475\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"plan_id\":475}', '2026-03-13 18:06:15'),
(693, 67, 'REPORT_UPDATE', 'Updated report: \"Budget Variance Analysis\" — added Q3 data', '{\"ip_address\":\"192.168.1.195\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/reports/679\",\"method\":\"GET\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"report_id\":679}', '2026-02-26 14:32:16'),
(694, 56, 'REPORT_DELETE', 'Deleted report: \"Construction Progress Report\" (ID 588)', '{\"ip_address\":\"192.168.1.86\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/reports/588\",\"method\":\"GET\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"report_id\":588}', '2026-03-25 03:15:58'),
(695, 27, 'REPORT_DECLINE', 'Declined report: \"Construction Progress Report\" — data inconsistency', '{\"ip_address\":\"192.168.1.153\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/reports/682\",\"method\":\"GET\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"report_id\":682}', '2026-03-03 06:30:21'),
(696, 41, 'ROLE_DELETE', 'Deleted role \"Manager\" and reassigned 3 users', '{\"ip_address\":\"192.168.1.79\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/menu-permissions\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"role\":\"Manager\",\"menu\":\"Admin Panel\"}', '2026-02-27 17:10:57'),
(697, 67, 'PLAN_APPROVE', 'Approved plan: \"HR Onboarding Automation\" (ID 271)', '{\"ip_address\":\"192.168.1.159\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/plans/271\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"plan_id\":271}', '2026-02-24 02:34:44'),
(698, NULL, 'SYSTEM_ERROR', 'Unhandled exception in /api/reports — Timeout', '{\"ip_address\":\"192.168.1.37\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/system/errors\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\"}', '2026-03-05 01:10:29'),
(699, 57, 'TASK_COMPLETE', 'Completed task: \"Review server backups\" (ID 299) ahead of schedule', '{\"ip_address\":\"192.168.1.78\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/tasks/299\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"task_id\":299}', '2026-03-16 08:18:07'),
(700, 25, 'MENU_UPDATE', 'Updated menu item \"Admin Panel\" — changed icon & display order', '{\"ip_address\":\"192.168.1.179\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/menu-permissions\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"role\":\"Admin\",\"menu\":\"Admin Panel\"}', '2026-03-22 13:47:04'),
(701, 13, 'ROLE_DELETE', 'Deleted role \"Staff\" and reassigned 2 users', '{\"ip_address\":\"192.168.1.194\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/menu-permissions\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"role\":\"Staff\",\"menu\":\"Dashboard\"}', '2026-03-08 07:40:59'),
(702, 39, 'MENU_DELETE', 'Deleted menu item \"Reports\" and cleaned up role_permissions', '{\"ip_address\":\"192.168.1.109\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/menu-permissions\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"role\":\"Expert\",\"menu\":\"Reports\"}', '2026-03-01 09:31:07'),
(703, 44, 'ROLE_UPDATE', 'Updated role \"Manager\" — renamed & permission set revised', '{\"ip_address\":\"192.168.1.129\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/menu-permissions\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"role\":\"Manager\",\"menu\":\"Admin Panel\"}', '2026-03-20 20:20:43'),
(704, 70, 'PLAN_APPROVE', 'Approved plan: \"Digital Transformation Initiative\" (ID 463)', '{\"ip_address\":\"192.168.1.49\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/plans/463\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"plan_id\":463}', '2026-03-11 08:05:12'),
(705, 24, 'TASK_CREATE', 'Created task: \"Prepare Q2 budget sheet\" assigned to team', '{\"ip_address\":\"192.168.1.39\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/tasks/149\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"task_id\":149}', '2026-03-05 06:46:53'),
(706, 43, 'SYSTEM_ERROR', 'Unhandled exception in /api/users — DB connection lost', '{\"ip_address\":\"192.168.1.188\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/system/errors\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\"}', '2026-03-19 23:35:11'),
(707, 38, 'PLAN_DECLINE', 'Declined plan: \"Annual IT Infrastructure Upgrade\" — insufficient detail', '{\"ip_address\":\"192.168.1.153\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/plans/103\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"plan_id\":103}', '2026-03-15 13:29:09'),
(708, 73, 'TASK_COMPLETE', 'Completed task: \"Prepare Q2 budget sheet\" (ID 8) ahead of schedule', '{\"ip_address\":\"192.168.1.97\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/tasks/8\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"task_id\":8}', '2026-03-23 02:13:20'),
(709, 66, 'PLAN_DELETE', 'Deleted plan: \"Digital Transformation Initiative\" (ID 188)', '{\"ip_address\":\"192.168.1.118\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/plans/188\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"plan_id\":188}', '2026-03-24 17:01:18'),
(710, 71, 'PLAN_SUBMIT', 'Submitted plan: \"Digital Transformation Initiative\" for approval', '{\"ip_address\":\"192.168.1.79\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/plans/316\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"plan_id\":316}', '2026-02-24 13:17:43'),
(711, 59, 'PLAN_SUBMIT', 'Submitted plan: \"Annual IT Infrastructure Upgrade\" for approval', '{\"ip_address\":\"192.168.1.89\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/plans/305\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"plan_id\":305}', '2026-03-09 10:38:10'),
(712, 49, 'PLAN_CREATE', 'Created plan: \"HR Onboarding Automation\" (ID 128)', '{\"ip_address\":\"192.168.1.178\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/plans/128\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"plan_id\":128}', '2026-02-24 07:06:54'),
(713, NULL, 'DATA_EXPORT', 'Scheduled database backup completed — 69 MB archived', '{\"ip_address\":\"192.168.1.82\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/admin/backup\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\"}', '2026-03-15 12:33:31'),
(714, 6, 'PLAN_CREATE', 'Created plan: \"Employee Training Programme 2025\" (ID 312)', '{\"ip_address\":\"192.168.1.196\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/plans/312\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"plan_id\":312}', '2026-03-21 07:53:39'),
(715, 54, 'PLAN_UPDATE', 'Updated plan: \"Employee Training Programme 2025\" — revised budget & timeline', '{\"ip_address\":\"192.168.1.74\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/plans/195\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"plan_id\":195}', '2026-03-11 00:27:26'),
(716, 6, 'PERMISSION_UPDATE', 'Updated permissions for role \"Manager\" — toggled access to [Reports, Settings]', '{\"ip_address\":\"192.168.1.89\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/menu-permissions\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"role\":\"Manager\",\"menu\":\"Reports\"}', '2026-03-02 02:35:49'),
(717, 51, 'TASK_CREATE', 'Created task: \"Train new team members\" assigned to team', '{\"ip_address\":\"192.168.1.11\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/tasks/145\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"task_id\":145}', '2026-03-03 07:07:11'),
(718, 60, 'TASK_COMPLETE', 'Completed task: \"Train new team members\" (ID 114) ahead of schedule', '{\"ip_address\":\"192.168.1.160\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/tasks/114\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"task_id\":114}', '2026-03-12 08:11:06'),
(719, 59, 'REPORT_DECLINE', 'Declined report: \"Risk Assessment Report\" — data inconsistency', '{\"ip_address\":\"192.168.1.161\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/reports/366\",\"method\":\"GET\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"report_id\":366}', '2026-03-02 19:50:04'),
(720, 46, 'TASK_CREATE', 'Created task: \"Prepare Q2 budget sheet\" assigned to team', '{\"ip_address\":\"192.168.1.116\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/tasks/122\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"task_id\":122}', '2026-03-10 18:17:36'),
(721, 77, 'ROLE_DELETE', 'Deleted role \"Expert\" and reassigned 5 users', '{\"ip_address\":\"192.168.1.150\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/menu-permissions\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"role\":\"Expert\",\"menu\":\"Reports\"}', '2026-03-15 20:37:05'),
(722, 74, 'SYSTEM_START', 'Server started on port 5001 — DB connected, 10 routes registered', '{\"ip_address\":\"192.168.1.14\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/system/start\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\"}', '2026-03-18 08:37:42'),
(723, 64, 'MEETING_CREATE', 'Scheduled meeting: \"Budget Review Session\" — 12 attendees invited', '{\"ip_address\":\"192.168.1.34\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/meetings/26\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"meeting_id\":26}', '2026-03-08 00:25:28'),
(724, 52, 'REPORT_UPDATE', 'Updated report: \"Risk Assessment Report\" — added Q3 data', '{\"ip_address\":\"192.168.1.84\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/reports/268\",\"method\":\"GET\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"report_id\":268}', '2026-02-24 02:48:29'),
(725, 68, 'REPORT_APPROVE', 'Approved report: \"Annual Audit Report 2024\"', '{\"ip_address\":\"192.168.1.140\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/reports/349\",\"method\":\"GET\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"report_id\":349}', '2026-03-21 04:21:11'),
(726, 37, 'ROLE_CREATE', 'Created new role: \"Expert Level 3\"', '{\"ip_address\":\"192.168.1.173\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/menu-permissions\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"role\":\"Expert\",\"menu\":\"Admin Panel\"}', '2026-03-22 10:18:50'),
(727, 48, 'REPORT_DECLINE', 'Declined report: \"Monthly Employee Performance\" — data inconsistency', '{\"ip_address\":\"192.168.1.197\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/reports/404\",\"method\":\"GET\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"report_id\":404}', '2026-03-09 10:41:17'),
(728, 48, 'MENU_DELETE', 'Deleted menu item \"Plans\" and cleaned up role_permissions', '{\"ip_address\":\"192.168.1.51\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/menu-permissions\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"role\":\"Team Leader\",\"menu\":\"Plans\"}', '2026-03-23 04:18:21'),
(729, 78, 'TASK_DELETE', 'Deleted task: \"Prepare Q2 budget sheet\" (ID 258) — cancelled', '{\"ip_address\":\"192.168.1.174\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/tasks/258\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"task_id\":258}', '2026-03-09 20:26:13'),
(730, 36, 'MEETING_POSTPONE', 'Postponed meeting: \"IT Daily Standup\" to next week', '{\"ip_address\":\"192.168.1.15\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/meetings/90\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"meeting_id\":90}', '2026-03-10 13:55:50'),
(731, NULL, 'SYSTEM_ERROR', 'Unhandled exception in /api/users — Null reference', '{\"ip_address\":\"192.168.1.36\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/system/errors\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\"}', '2026-03-07 21:57:25'),
(732, 71, 'REPORT_UPDATE', 'Updated report: \"Annual Audit Report 2024\" — added Q3 data', '{\"ip_address\":\"192.168.1.89\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/reports/209\",\"method\":\"GET\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"report_id\":209}', '2026-03-06 11:26:29'),
(733, 49, 'PLAN_UPDATE', 'Updated plan: \"Construction Safety Roadmap\" — revised budget & timeline', '{\"ip_address\":\"192.168.1.152\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/plans/364\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"plan_id\":364}', '2026-03-02 21:47:01'),
(734, 55, 'REPORT_APPROVE', 'Approved report: \"IT Incident Response Report\"', '{\"ip_address\":\"192.168.1.155\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/reports/588\",\"method\":\"GET\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"report_id\":588}', '2026-02-28 12:55:36'),
(735, 61, 'MEETING_JOIN', 'Joined meeting: \"Budget Review Session\"', '{\"ip_address\":\"192.168.1.109\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/meetings/8\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"meeting_id\":8}', '2026-03-23 07:21:36'),
(736, 68, 'TASK_CREATE', 'Created task: \"Complete security audit\" assigned to team', '{\"ip_address\":\"192.168.1.30\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/tasks/140\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"task_id\":140}', '2026-03-17 12:18:44'),
(737, 47, 'MEETING_CREATE', 'Scheduled meeting: \"Audit Debrief\" — 5 attendees invited', '{\"ip_address\":\"192.168.1.153\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/meetings/83\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"meeting_id\":83}', '2026-03-12 16:12:46'),
(738, 26, 'TASK_CREATE', 'Created task: \"Review server backups\" assigned to team', '{\"ip_address\":\"192.168.1.37\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/tasks/122\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"task_id\":122}', '2026-03-07 03:03:50'),
(739, 30, 'MEETING_CREATE', 'Scheduled meeting: \"Budget Review Session\" — 12 attendees invited', '{\"ip_address\":\"192.168.1.159\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/meetings/88\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"meeting_id\":88}', '2026-02-28 04:05:26'),
(740, 49, 'PLAN_SUBMIT', 'Submitted plan: \"Digital Transformation Initiative\" for approval', '{\"ip_address\":\"192.168.1.108\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/plans/375\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"plan_id\":375}', '2026-02-27 21:00:10'),
(741, 74, 'REPORT_UPDATE', 'Updated report: \"Budget Variance Analysis\" — added Q3 data', '{\"ip_address\":\"192.168.1.138\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/reports/296\",\"method\":\"GET\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"report_id\":296}', '2026-03-06 03:09:50'),
(742, NULL, 'SETTINGS_CHANGE', 'System setting changed: session_timeout updated', '{\"ip_address\":\"192.168.1.166\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/settings\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\"}', '2026-03-16 20:26:40'),
(743, 73, 'MEETING_CREATE', 'Scheduled meeting: \"Budget Review Session\" — 13 attendees invited', '{\"ip_address\":\"192.168.1.11\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/meetings/46\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"meeting_id\":46}', '2026-03-19 19:50:49'),
(744, 58, 'PLAN_UPDATE', 'Updated plan: \"Legal Compliance Review Plan\" — revised budget & timeline', '{\"ip_address\":\"192.168.1.153\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/plans/114\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"plan_id\":114}', '2026-03-25 01:42:24'),
(745, 13, 'PLAN_CREATE', 'Created plan: \"Legal Compliance Review Plan\" (ID 253)', '{\"ip_address\":\"192.168.1.110\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/plans/253\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"plan_id\":253}', '2026-03-17 23:31:58'),
(746, 25, 'TASK_DELETE', 'Deleted task: \"Deploy hotfix to production\" (ID 102) — cancelled', '{\"ip_address\":\"192.168.1.163\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/tasks/102\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"task_id\":102}', '2026-03-04 18:03:02'),
(747, 71, 'MENU_UPDATE', 'Updated menu item \"Admin Panel\" — changed icon & display order', '{\"ip_address\":\"192.168.1.96\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/menu-permissions\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"role\":\"Staff\",\"menu\":\"Admin Panel\"}', '2026-03-02 23:06:17'),
(748, NULL, 'SYSTEM_ERROR', 'Unhandled exception in /api/reports — Null reference', '{\"ip_address\":\"192.168.1.65\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/system/errors\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\"}', '2026-03-09 11:51:36'),
(749, 53, 'REPORT_VIEW', 'Viewed report: \"Risk Assessment Report\"', '{\"ip_address\":\"192.168.1.120\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/reports/302\",\"method\":\"GET\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"report_id\":302}', '2026-03-13 05:30:39'),
(750, 24, 'REPORT_DELETE', 'Deleted report: \"Risk Assessment Report\" (ID 372)', '{\"ip_address\":\"192.168.1.109\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/reports/372\",\"method\":\"GET\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"report_id\":372}', '2026-03-20 08:26:50'),
(751, NULL, 'SYSTEM_START', 'Server started on port 5001 — DB connected, 17 routes registered', '{\"ip_address\":\"192.168.1.98\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/system/start\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\"}', '2026-03-19 14:39:08'),
(752, 70, 'MEETING_POSTPONE', 'Postponed meeting: \"Audit Debrief\" to next week', '{\"ip_address\":\"192.168.1.18\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/meetings/84\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"meeting_id\":84}', '2026-02-25 03:25:09'),
(753, 42, 'PLAN_DECLINE', 'Declined plan: \"Marketing Strategy 2026\" — insufficient detail', '{\"ip_address\":\"192.168.1.144\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/plans/311\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"plan_id\":311}', '2026-03-24 17:34:08'),
(754, NULL, 'SETTINGS_CHANGE', 'System setting changed: backup_schedule updated', '{\"ip_address\":\"192.168.1.36\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/settings\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\"}', '2026-02-24 05:51:28'),
(755, 45, 'SETTINGS_CHANGE', 'System setting changed: backup_schedule updated', '{\"ip_address\":\"192.168.1.10\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/settings\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\"}', '2026-03-20 10:04:14'),
(756, 70, 'MEETING_UPDATE', 'Updated meeting: \"Annual Planning Workshop\" — agenda revised', '{\"ip_address\":\"192.168.1.163\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/meetings/95\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"meeting_id\":95}', '2026-03-06 18:16:08'),
(757, 50, 'REPORT_DELETE', 'Deleted report: \"IT Incident Response Report\" (ID 482)', '{\"ip_address\":\"192.168.1.73\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/reports/482\",\"method\":\"GET\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"report_id\":482}', '2026-03-16 02:42:33'),
(758, 65, 'PLAN_UPDATE', 'Updated plan: \"Legal Compliance Review Plan\" — revised budget & timeline', '{\"ip_address\":\"192.168.1.175\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/plans/323\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"plan_id\":323}', '2026-03-19 19:21:21'),
(759, 50, 'REPORT_SUBMIT', 'Submitted report: \"Construction Progress Report\" for review', '{\"ip_address\":\"192.168.1.167\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/reports/219\",\"method\":\"GET\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"report_id\":219}', '2026-03-09 02:40:21'),
(760, 27, 'PLAN_APPROVE', 'Approved plan: \"Marketing Strategy 2026\" (ID 417)', '{\"ip_address\":\"192.168.1.74\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/plans/417\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"plan_id\":417}', '2026-03-11 00:18:27'),
(761, 50, 'REPORT_UPDATE', 'Updated report: \"Q1 Financial Summary Report\" — added Q3 data', '{\"ip_address\":\"192.168.1.110\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/reports/483\",\"method\":\"GET\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"report_id\":483}', '2026-02-27 14:21:31'),
(762, 27, 'TASK_CREATE', 'Created task: \"Prepare Q2 budget sheet\" assigned to team', '{\"ip_address\":\"192.168.1.58\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/tasks/245\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"task_id\":245}', '2026-02-27 03:49:24'),
(763, 50, 'PLAN_APPROVE', 'Approved plan: \"Legal Compliance Review Plan\" (ID 110)', '{\"ip_address\":\"192.168.1.197\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/plans/110\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"plan_id\":110}', '2026-03-24 06:58:19'),
(764, 26, 'REPORT_VIEW', 'Viewed report: \"Construction Progress Report\"', '{\"ip_address\":\"192.168.1.179\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/reports/498\",\"method\":\"GET\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"report_id\":498}', '2026-03-17 13:51:10'),
(765, 70, 'MEETING_POSTPONE', 'Postponed meeting: \"Q2 Strategy Meeting\" to next week', '{\"ip_address\":\"192.168.1.146\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/meetings/12\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"meeting_id\":12}', '2026-03-24 14:22:04'),
(766, 61, 'MEETING_CREATE', 'Scheduled meeting: \"IT Daily Standup\" — 14 attendees invited', '{\"ip_address\":\"192.168.1.16\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/meetings/5\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"meeting_id\":5}', '2026-03-12 17:12:53');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `description`, `metadata`, `created_at`) VALUES
(767, 56, 'ROLE_DELETE', 'Deleted role \"Team Leader\" and reassigned 3 users', '{\"ip_address\":\"192.168.1.123\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/menu-permissions\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"role\":\"Team Leader\",\"menu\":\"Tasks\"}', '2026-02-28 17:16:02'),
(768, 75, 'MENU_DELETE', 'Deleted menu item \"Settings\" and cleaned up role_permissions', '{\"ip_address\":\"192.168.1.31\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/menu-permissions\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"role\":\"Staff\",\"menu\":\"Settings\"}', '2026-03-20 00:37:37'),
(769, 69, 'PLAN_CREATE', 'Created plan: \"Construction Safety Roadmap\" (ID 283)', '{\"ip_address\":\"192.168.1.39\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/plans/283\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"plan_id\":283}', '2026-03-03 00:54:31'),
(770, 60, 'MENU_DELETE', 'Deleted menu item \"Reports\" and cleaned up role_permissions', '{\"ip_address\":\"192.168.1.46\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/menu-permissions\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"role\":\"Team Leader\",\"menu\":\"Reports\"}', '2026-03-14 19:11:59'),
(771, 60, 'PERMISSION_UPDATE', 'Updated permissions for role \"Manager\" — toggled access to [Tasks, Admin Panel]', '{\"ip_address\":\"192.168.1.54\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/menu-permissions\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"role\":\"Manager\",\"menu\":\"Tasks\"}', '2026-03-12 12:20:25'),
(772, 36, 'REPORT_SUBMIT', 'Submitted report: \"Annual Audit Report 2024\" for review', '{\"ip_address\":\"192.168.1.160\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/reports/648\",\"method\":\"GET\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"report_id\":648}', '2026-02-28 17:17:22'),
(773, 59, 'MEETING_CREATE', 'Scheduled meeting: \"Q2 Strategy Meeting\" — 11 attendees invited', '{\"ip_address\":\"192.168.1.81\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/meetings/76\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"meeting_id\":76}', '2026-03-07 06:46:43'),
(774, 60, 'TASK_COMPLETE', 'Completed task: \"Review server backups\" (ID 104) ahead of schedule', '{\"ip_address\":\"192.168.1.152\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/tasks/104\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"task_id\":104}', '2026-03-14 14:19:55'),
(775, 73, 'REPORT_UPDATE', 'Updated report: \"Q1 Financial Summary Report\" — added Q3 data', '{\"ip_address\":\"192.168.1.143\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/reports/523\",\"method\":\"GET\",\"timestamp\":\"2026-03-25T07:41:46.065Z\",\"report_id\":523}', '2026-03-18 09:19:10'),
(776, 60, 'SYSTEM_START', 'Server started on port 5001 — DB connected, 19 routes registered', '{\"ip_address\":\"192.168.1.36\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/system/start\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\"}', '2026-03-15 13:13:19'),
(777, 65, 'MEETING_JOIN', 'Joined meeting: \"Annual Planning Workshop\"', '{\"ip_address\":\"192.168.1.182\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/meetings/72\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"meeting_id\":72}', '2026-03-12 05:49:18'),
(778, 56, 'DATA_EXPORT', 'Scheduled database backup completed — 62 MB archived', '{\"ip_address\":\"192.168.1.31\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/admin/backup\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\"}', '2026-02-28 11:09:24'),
(779, 40, 'MEETING_POSTPONE', 'Postponed meeting: \"IT Daily Standup\" to next week', '{\"ip_address\":\"192.168.1.169\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/meetings/71\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"meeting_id\":71}', '2026-02-27 07:24:12'),
(780, NULL, 'DATA_EXPORT', 'Scheduled database backup completed — 41 MB archived', '{\"ip_address\":\"192.168.1.50\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/admin/backup\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\"}', '2026-02-28 06:38:34'),
(781, 55, 'MEETING_END', 'Ended meeting: \"Budget Review Session\" — duration 141 minutes', '{\"ip_address\":\"192.168.1.11\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/meetings/23\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"meeting_id\":23}', '2026-03-12 09:22:41'),
(782, 37, 'SYSTEM_START', 'Server started on port 5001 — DB connected, 11 routes registered', '{\"ip_address\":\"192.168.1.67\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/system/start\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\"}', '2026-03-10 01:00:24'),
(783, 73, 'SYSTEM_START', 'Server started on port 5001 — DB connected, 11 routes registered', '{\"ip_address\":\"192.168.1.135\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/system/start\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\"}', '2026-03-12 02:12:43'),
(784, 64, 'MEETING_END', 'Ended meeting: \"Q2 Strategy Meeting\" — duration 25 minutes', '{\"ip_address\":\"192.168.1.33\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/meetings/51\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"meeting_id\":51}', '2026-03-05 06:02:14'),
(785, 27, 'DATA_EXPORT', 'Data exported: employees table — 4154 rows as CSV', '{\"ip_address\":\"192.168.1.179\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/admin/export\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\"}', '2026-03-03 05:30:46'),
(786, 72, 'DATA_EXPORT', 'Data exported: reports table — 1809 rows as CSV', '{\"ip_address\":\"192.168.1.134\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/admin/export\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\"}', '2026-03-17 09:23:23'),
(787, 46, 'SYSTEM_START', 'Server started on port 5001 — DB connected, 10 routes registered', '{\"ip_address\":\"192.168.1.22\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/system/start\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\"}', '2026-03-08 22:20:39'),
(788, 67, 'MEETING_CREATE', 'Scheduled meeting: \"Audit Debrief\" — 2 attendees invited', '{\"ip_address\":\"192.168.1.37\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/meetings/65\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"meeting_id\":65}', '2026-03-24 06:11:57'),
(789, 42, 'MEETING_POSTPONE', 'Postponed meeting: \"Q2 Strategy Meeting\" to next week', '{\"ip_address\":\"192.168.1.69\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/meetings/34\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"meeting_id\":34}', '2026-03-24 01:50:40'),
(790, 49, 'TASK_CREATE', 'Created task: \"Complete security audit\" assigned to team', '{\"ip_address\":\"192.168.1.75\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/tasks/177\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:41:46.066Z\",\"task_id\":177}', '2026-03-01 12:14:12'),
(791, 64, 'ROLE_CREATE', 'Created new role: \"Manager Level 3\"', '{\"ip_address\":\"192.168.1.155\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/menu-permissions\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.291Z\",\"role\":\"Manager\",\"menu\":\"Dashboard\"}', '2026-03-18 23:14:23'),
(792, 72, 'REPORT_UPDATE', 'Updated report: \"IT Incident Response Report\" — added Q3 data', '{\"ip_address\":\"192.168.1.49\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/reports/600\",\"method\":\"GET\",\"timestamp\":\"2026-03-25T07:42:22.290Z\",\"report_id\":600}', '2026-03-14 15:25:25'),
(793, 37, 'REPORT_UPDATE', 'Updated report: \"IT Incident Response Report\" — added Q3 data', '{\"ip_address\":\"192.168.1.41\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/reports/307\",\"method\":\"GET\",\"timestamp\":\"2026-03-25T07:42:22.290Z\",\"report_id\":307}', '2026-02-24 01:37:45'),
(794, 42, 'REPORT_SUBMIT', 'Submitted report: \"Construction Progress Report\" for review', '{\"ip_address\":\"192.168.1.42\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/reports/574\",\"method\":\"GET\",\"timestamp\":\"2026-03-25T07:42:22.289Z\",\"report_id\":574}', '2026-03-15 12:15:58'),
(795, 69, 'REPORT_DELETE', 'Deleted report: \"Budget Variance Analysis\" (ID 495)', '{\"ip_address\":\"192.168.1.18\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/reports/495\",\"method\":\"GET\",\"timestamp\":\"2026-03-25T07:42:22.290Z\",\"report_id\":495}', '2026-03-23 22:03:41'),
(796, 77, 'REPORT_DELETE', 'Deleted report: \"Risk Assessment Report\" (ID 340)', '{\"ip_address\":\"192.168.1.87\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/reports/340\",\"method\":\"GET\",\"timestamp\":\"2026-03-25T07:42:22.289Z\",\"report_id\":340}', '2026-03-19 18:54:52'),
(797, 71, 'REPORT_UPDATE', 'Updated report: \"Budget Variance Analysis\" — added Q3 data', '{\"ip_address\":\"192.168.1.52\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/reports/349\",\"method\":\"GET\",\"timestamp\":\"2026-03-25T07:42:22.289Z\",\"report_id\":349}', '2026-03-16 22:51:21'),
(798, 66, 'REPORT_CREATE', 'Created report: \"Q1 Financial Summary Report\"', '{\"ip_address\":\"192.168.1.37\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/reports/532\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.289Z\",\"report_id\":532}', '2026-03-01 09:49:02'),
(799, 65, 'REPORT_APPROVE', 'Approved report: \"Monthly Employee Performance\"', '{\"ip_address\":\"192.168.1.32\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/reports/670\",\"method\":\"GET\",\"timestamp\":\"2026-03-25T07:42:22.289Z\",\"report_id\":670}', '2026-03-24 14:49:53'),
(800, 44, 'REPORT_APPROVE', 'Approved report: \"Risk Assessment Report\"', '{\"ip_address\":\"192.168.1.173\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/reports/236\",\"method\":\"GET\",\"timestamp\":\"2026-03-25T07:42:22.290Z\",\"report_id\":236}', '2026-02-23 17:46:26'),
(801, 76, 'REPORT_APPROVE', 'Approved report: \"Q1 Financial Summary Report\"', '{\"ip_address\":\"192.168.1.131\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/reports/547\",\"method\":\"GET\",\"timestamp\":\"2026-03-25T07:42:22.290Z\",\"report_id\":547}', '2026-03-11 18:35:19'),
(802, 69, 'REPORT_DECLINE', 'Declined report: \"Construction Progress Report\" — data inconsistency', '{\"ip_address\":\"192.168.1.198\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/reports/432\",\"method\":\"GET\",\"timestamp\":\"2026-03-25T07:42:22.289Z\",\"report_id\":432}', '2026-03-07 03:06:25'),
(803, 78, 'REPORT_DELETE', 'Deleted report: \"Risk Assessment Report\" (ID 315)', '{\"ip_address\":\"192.168.1.37\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/reports/315\",\"method\":\"GET\",\"timestamp\":\"2026-03-25T07:42:22.289Z\",\"report_id\":315}', '2026-03-11 03:48:54'),
(804, 25, 'REPORT_VIEW', 'Viewed report: \"Annual Audit Report 2024\"', '{\"ip_address\":\"192.168.1.159\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/reports/415\",\"method\":\"GET\",\"timestamp\":\"2026-03-25T07:42:22.290Z\",\"report_id\":415}', '2026-03-04 12:33:51'),
(805, 51, 'REPORT_CREATE', 'Created report: \"IT Incident Response Report\"', '{\"ip_address\":\"192.168.1.112\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/reports/523\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.289Z\",\"report_id\":523}', '2026-03-21 16:54:05'),
(806, 36, 'REPORT_APPROVE', 'Approved report: \"Q1 Financial Summary Report\"', '{\"ip_address\":\"192.168.1.165\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/reports/671\",\"method\":\"GET\",\"timestamp\":\"2026-03-25T07:42:22.290Z\",\"report_id\":671}', '2026-03-23 02:27:57'),
(807, 37, 'REPORT_SUBMIT', 'Submitted report: \"Budget Variance Analysis\" for review', '{\"ip_address\":\"192.168.1.22\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/reports/557\",\"method\":\"GET\",\"timestamp\":\"2026-03-25T07:42:22.290Z\",\"report_id\":557}', '2026-03-20 10:16:37'),
(808, 6, 'REPORT_APPROVE', 'Approved report: \"Monthly Employee Performance\"', '{\"ip_address\":\"192.168.1.138\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/reports/489\",\"method\":\"GET\",\"timestamp\":\"2026-03-25T07:42:22.290Z\",\"report_id\":489}', '2026-02-25 10:01:55'),
(809, 72, 'REPORT_DECLINE', 'Declined report: \"Q1 Financial Summary Report\" — data inconsistency', '{\"ip_address\":\"192.168.1.106\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/reports/554\",\"method\":\"GET\",\"timestamp\":\"2026-03-25T07:42:22.289Z\",\"report_id\":554}', '2026-03-06 13:34:01'),
(810, 69, 'REPORT_SUBMIT', 'Submitted report: \"Budget Variance Analysis\" for review', '{\"ip_address\":\"192.168.1.150\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/reports/255\",\"method\":\"GET\",\"timestamp\":\"2026-03-25T07:42:22.289Z\",\"report_id\":255}', '2026-03-14 21:58:03'),
(811, 38, 'REPORT_SUBMIT', 'Submitted report: \"Budget Variance Analysis\" for review', '{\"ip_address\":\"192.168.1.97\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/reports/504\",\"method\":\"GET\",\"timestamp\":\"2026-03-25T07:42:22.289Z\",\"report_id\":504}', '2026-02-25 16:14:48'),
(812, 73, 'PLAN_CREATE', 'Created plan: \"Legal Compliance Review Plan\" (ID 479)', '{\"ip_address\":\"192.168.1.179\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/plans/479\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.288Z\",\"plan_id\":479}', '2026-02-23 05:14:35'),
(813, 60, 'MENU_CREATE', 'Created menu item: \"Plans\" (path /plans)', '{\"ip_address\":\"192.168.1.94\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/menu-permissions\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.291Z\",\"role\":\"Admin\",\"menu\":\"Plans\"}', '2026-03-10 17:25:33'),
(814, 62, 'PLAN_APPROVE', 'Approved plan: \"HR Onboarding Automation\" (ID 246)', '{\"ip_address\":\"192.168.1.116\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/plans/246\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:42:22.289Z\",\"plan_id\":246}', '2026-02-28 17:00:04'),
(815, 73, 'REPORT_UPDATE', 'Updated report: \"Budget Variance Analysis\" — added Q3 data', '{\"ip_address\":\"192.168.1.194\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/reports/423\",\"method\":\"GET\",\"timestamp\":\"2026-03-25T07:42:22.290Z\",\"report_id\":423}', '2026-03-22 18:54:52'),
(816, 51, 'MEETING_JOIN', 'Joined meeting: \"IT Daily Standup\"', '{\"ip_address\":\"192.168.1.50\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/meetings/14\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.293Z\",\"meeting_id\":14}', '2026-03-14 23:08:22'),
(817, 44, 'MENU_DELETE', 'Deleted menu item \"Reports\" and cleaned up role_permissions', '{\"ip_address\":\"192.168.1.137\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/menu-permissions\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.291Z\",\"role\":\"Admin\",\"menu\":\"Reports\"}', '2026-02-23 16:19:08'),
(818, 6, 'REPORT_UPDATE', 'Updated report: \"Annual Audit Report 2024\" — added Q3 data', '{\"ip_address\":\"192.168.1.46\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/reports/292\",\"method\":\"GET\",\"timestamp\":\"2026-03-25T07:42:22.290Z\",\"report_id\":292}', '2026-03-12 13:07:28'),
(819, 46, 'PLAN_DECLINE', 'Declined plan: \"Annual IT Infrastructure Upgrade\" — insufficient detail', '{\"ip_address\":\"192.168.1.144\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/plans/348\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:42:22.289Z\",\"plan_id\":348}', '2026-03-02 08:11:51'),
(820, 55, 'MENU_DELETE', 'Deleted menu item \"Settings\" and cleaned up role_permissions', '{\"ip_address\":\"192.168.1.124\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/menu-permissions\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.291Z\",\"role\":\"Manager\",\"menu\":\"Settings\"}', '2026-03-07 19:59:40'),
(821, 52, 'PLAN_DELETE', 'Deleted plan: \"Digital Transformation Initiative\" (ID 230)', '{\"ip_address\":\"192.168.1.190\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/plans/230\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:42:22.289Z\",\"plan_id\":230}', '2026-03-05 03:27:33'),
(822, 79, 'TASK_UPDATE', 'Updated task: \"Train new team members\" — changed deadline & priority', '{\"ip_address\":\"192.168.1.151\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/tasks/29\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:42:22.292Z\",\"task_id\":29}', '2026-02-24 06:31:02'),
(823, 38, 'ROLE_CREATE', 'Created new role: \"Admin Level 3\"', '{\"ip_address\":\"192.168.1.59\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/menu-permissions\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.291Z\",\"role\":\"Admin\",\"menu\":\"Settings\"}', '2026-03-24 11:11:32'),
(824, 48, 'PLAN_VIEW', 'Viewed plan: \"Annual IT Infrastructure Upgrade\"', '{\"ip_address\":\"192.168.1.15\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/plans/182\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:42:22.289Z\",\"plan_id\":182}', '2026-03-11 22:31:01'),
(825, 79, 'PLAN_CREATE', 'Created plan: \"HR Onboarding Automation\" (ID 326)', '{\"ip_address\":\"192.168.1.109\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/plans/326\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.288Z\",\"plan_id\":326}', '2026-03-22 15:27:33'),
(826, 6, 'TASK_COMPLETE', 'Completed task: \"Review server backups\" (ID 241) ahead of schedule', '{\"ip_address\":\"192.168.1.35\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/tasks/241\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:42:22.292Z\",\"task_id\":241}', '2026-03-20 10:02:04'),
(827, 55, 'PLAN_DELETE', 'Deleted plan: \"Digital Transformation Initiative\" (ID 180)', '{\"ip_address\":\"192.168.1.54\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/plans/180\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:42:22.288Z\",\"plan_id\":180}', '2026-03-19 11:39:10'),
(828, 7, 'PERMISSION_UPDATE', 'Updated permissions for role \"Expert\" — toggled access to [Tasks, Dashboard]', '{\"ip_address\":\"192.168.1.135\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/menu-permissions\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.291Z\",\"role\":\"Expert\",\"menu\":\"Tasks\"}', '2026-03-02 03:00:28'),
(829, 71, 'TASK_DELETE', 'Deleted task: \"Deploy hotfix to production\" (ID 157) — cancelled', '{\"ip_address\":\"192.168.1.23\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/tasks/157\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:42:22.292Z\",\"task_id\":157}', '2026-02-27 03:33:36'),
(830, 66, 'MEETING_JOIN', 'Joined meeting: \"Annual Planning Workshop\"', '{\"ip_address\":\"192.168.1.97\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/meetings/18\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.293Z\",\"meeting_id\":18}', '2026-03-23 07:11:53'),
(831, 50, 'PLAN_CREATE', 'Created plan: \"Q2 Budget Forecast Plan\" (ID 218)', '{\"ip_address\":\"192.168.1.81\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/plans/218\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.289Z\",\"plan_id\":218}', '2026-03-18 23:53:34'),
(832, 56, 'PLAN_VIEW', 'Viewed plan: \"Employee Training Programme 2025\"', '{\"ip_address\":\"192.168.1.137\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/plans/166\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:42:22.288Z\",\"plan_id\":166}', '2026-03-02 17:51:52'),
(833, 73, 'MEETING_UPDATE', 'Updated meeting: \"Audit Debrief\" — agenda revised', '{\"ip_address\":\"192.168.1.200\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/meetings/60\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.293Z\",\"meeting_id\":60}', '2026-03-15 12:22:46'),
(834, 60, 'PLAN_VIEW', 'Viewed plan: \"Digital Transformation Initiative\"', '{\"ip_address\":\"192.168.1.193\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/plans/483\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:42:22.289Z\",\"plan_id\":483}', '2026-03-11 09:33:48'),
(835, 38, 'REPORT_CREATE', 'Created report: \"Monthly Employee Performance\"', '{\"ip_address\":\"192.168.1.77\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/reports/399\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.289Z\",\"report_id\":399}', '2026-03-07 05:23:46'),
(836, 45, 'PLAN_VIEW', 'Viewed plan: \"Marketing Strategy 2026\"', '{\"ip_address\":\"192.168.1.167\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/plans/179\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:42:22.288Z\",\"plan_id\":179}', '2026-03-15 20:07:24'),
(837, 27, 'TASK_DELETE', 'Deleted task: \"Fix API timeout issues\" (ID 1) — cancelled', '{\"ip_address\":\"192.168.1.174\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/tasks/1\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:42:22.292Z\",\"task_id\":1}', '2026-03-04 03:31:53'),
(838, NULL, 'SYSTEM_START', 'Server started on port 5001 — DB connected, 8 routes registered', '{\"ip_address\":\"192.168.1.65\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/system/start\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.293Z\"}', '2026-03-18 01:14:06'),
(839, 55, 'PLAN_SUBMIT', 'Submitted plan: \"Legal Compliance Review Plan\" for approval', '{\"ip_address\":\"192.168.1.24\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/plans/492\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:42:22.289Z\",\"plan_id\":492}', '2026-03-18 23:59:50'),
(840, 79, 'MEETING_JOIN', 'Joined meeting: \"IT Daily Standup\"', '{\"ip_address\":\"192.168.1.32\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/meetings/53\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.293Z\",\"meeting_id\":53}', '2026-03-02 06:25:17'),
(841, 70, 'TASK_CREATE', 'Created task: \"Prepare Q2 budget sheet\" assigned to team', '{\"ip_address\":\"192.168.1.134\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/tasks/50\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.292Z\",\"task_id\":50}', '2026-02-27 19:26:09'),
(842, 59, 'TASK_CREATE', 'Created task: \"Train new team members\" assigned to team', '{\"ip_address\":\"192.168.1.86\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/tasks/267\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.292Z\",\"task_id\":267}', '2026-03-13 22:46:22'),
(843, 59, 'REPORT_APPROVE', 'Approved report: \"Construction Progress Report\"', '{\"ip_address\":\"192.168.1.158\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/reports/637\",\"method\":\"GET\",\"timestamp\":\"2026-03-25T07:42:22.290Z\",\"report_id\":637}', '2026-03-20 13:39:41'),
(844, 75, 'TASK_CREATE', 'Created task: \"Train new team members\" assigned to team', '{\"ip_address\":\"192.168.1.106\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/tasks/57\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.292Z\",\"task_id\":57}', '2026-03-12 16:06:26'),
(845, 65, 'SETTINGS_CHANGE', 'System setting changed: backup_schedule updated', '{\"ip_address\":\"192.168.1.176\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/settings\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.293Z\"}', '2026-03-22 09:34:44'),
(846, 39, 'TASK_DELETE', 'Deleted task: \"Update employee records\" (ID 269) — cancelled', '{\"ip_address\":\"192.168.1.101\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/tasks/269\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:42:22.292Z\",\"task_id\":269}', '2026-03-21 20:32:49'),
(847, 60, 'ROLE_UPDATE', 'Updated role \"Team Leader\" — renamed & permission set revised', '{\"ip_address\":\"192.168.1.70\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/menu-permissions\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.291Z\",\"role\":\"Team Leader\",\"menu\":\"Dashboard\"}', '2026-03-01 13:21:40'),
(848, 27, 'PLAN_APPROVE', 'Approved plan: \"Legal Compliance Review Plan\" (ID 345)', '{\"ip_address\":\"192.168.1.152\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/plans/345\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:42:22.288Z\",\"plan_id\":345}', '2026-02-25 23:22:46'),
(849, 65, 'TASK_UPDATE', 'Updated task: \"Deploy hotfix to production\" — changed deadline & priority', '{\"ip_address\":\"192.168.1.155\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/tasks/261\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:42:22.292Z\",\"task_id\":261}', '2026-03-19 01:37:30'),
(850, 47, 'TASK_COMPLETE', 'Completed task: \"Update employee records\" (ID 69) ahead of schedule', '{\"ip_address\":\"192.168.1.37\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/tasks/69\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:42:22.292Z\",\"task_id\":69}', '2026-03-05 15:16:13'),
(851, 56, 'REPORT_SUBMIT', 'Submitted report: \"Construction Progress Report\" for review', '{\"ip_address\":\"192.168.1.46\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/reports/456\",\"method\":\"GET\",\"timestamp\":\"2026-03-25T07:42:22.290Z\",\"report_id\":456}', '2026-03-17 18:08:20'),
(852, 26, 'TASK_CREATE', 'Created task: \"Deploy hotfix to production\" assigned to team', '{\"ip_address\":\"192.168.1.77\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/tasks/239\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.292Z\",\"task_id\":239}', '2026-03-07 18:12:30'),
(853, 71, 'PLAN_VIEW', 'Viewed plan: \"Legal Compliance Review Plan\"', '{\"ip_address\":\"192.168.1.170\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/plans/317\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:42:22.289Z\",\"plan_id\":317}', '2026-03-09 22:40:54'),
(854, 79, 'TASK_CREATE', 'Created task: \"Complete security audit\" assigned to team', '{\"ip_address\":\"192.168.1.141\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/tasks/176\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.292Z\",\"task_id\":176}', '2026-03-25 02:29:27'),
(855, 67, 'PLAN_VIEW', 'Viewed plan: \"Construction Safety Roadmap\"', '{\"ip_address\":\"192.168.1.34\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/plans/163\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:42:22.288Z\",\"plan_id\":163}', '2026-03-15 16:37:06'),
(856, 51, 'PERMISSION_UPDATE', 'Updated permissions for role \"Admin\" — toggled access to [Plans, Plans]', '{\"ip_address\":\"192.168.1.33\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/menu-permissions\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.291Z\",\"role\":\"Admin\",\"menu\":\"Plans\"}', '2026-03-18 12:13:01'),
(857, 60, 'PERMISSION_UPDATE', 'Updated permissions for role \"Staff\" — toggled access to [Dashboard, Plans]', '{\"ip_address\":\"192.168.1.109\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/menu-permissions\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.291Z\",\"role\":\"Staff\",\"menu\":\"Dashboard\"}', '2026-03-05 08:46:11'),
(858, 78, 'TASK_CREATE', 'Created task: \"Prepare Q2 budget sheet\" assigned to team', '{\"ip_address\":\"192.168.1.55\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/tasks/200\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.292Z\",\"task_id\":200}', '2026-03-08 23:22:19'),
(859, NULL, 'DATA_EXPORT', 'Data exported: employees table — 1515 rows as CSV', '{\"ip_address\":\"192.168.1.173\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/admin/export\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.293Z\"}', '2026-03-10 13:55:36'),
(860, 74, 'DATA_EXPORT', 'Data exported: audit_logs table — 1474 rows as CSV', '{\"ip_address\":\"192.168.1.86\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/admin/export\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.293Z\"}', '2026-03-06 03:59:06'),
(861, 41, 'PLAN_SUBMIT', 'Submitted plan: \"HR Onboarding Automation\" for approval', '{\"ip_address\":\"192.168.1.165\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/plans/250\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:42:22.288Z\",\"plan_id\":250}', '2026-03-25 02:29:54'),
(862, 56, 'DATA_EXPORT', 'Scheduled database backup completed — 162 MB archived', '{\"ip_address\":\"192.168.1.148\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/admin/backup\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.292Z\"}', '2026-02-25 17:05:26'),
(863, 77, 'REPORT_DELETE', 'Deleted report: \"Construction Progress Report\" (ID 411)', '{\"ip_address\":\"192.168.1.69\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/reports/411\",\"method\":\"GET\",\"timestamp\":\"2026-03-25T07:42:22.290Z\",\"report_id\":411}', '2026-03-19 23:34:14'),
(864, 55, 'TASK_UPDATE', 'Updated task: \"Train new team members\" — changed deadline & priority', '{\"ip_address\":\"192.168.1.161\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/tasks/1\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:42:22.292Z\",\"task_id\":1}', '2026-03-18 16:37:26'),
(865, 72, 'REPORT_APPROVE', 'Approved report: \"Monthly Employee Performance\"', '{\"ip_address\":\"192.168.1.47\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/reports/268\",\"method\":\"GET\",\"timestamp\":\"2026-03-25T07:42:22.290Z\",\"report_id\":268}', '2026-02-27 03:20:16'),
(866, 37, 'PLAN_APPROVE', 'Approved plan: \"Digital Transformation Initiative\" (ID 297)', '{\"ip_address\":\"192.168.1.63\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/plans/297\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:42:22.289Z\",\"plan_id\":297}', '2026-03-08 12:21:59'),
(867, 7, 'PLAN_DECLINE', 'Declined plan: \"Marketing Strategy 2026\" — insufficient detail', '{\"ip_address\":\"192.168.1.23\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/plans/270\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:42:22.288Z\",\"plan_id\":270}', '2026-03-05 12:50:37'),
(868, 50, 'MEETING_JOIN', 'Joined meeting: \"IT Daily Standup\"', '{\"ip_address\":\"192.168.1.187\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/meetings/14\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.293Z\",\"meeting_id\":14}', '2026-02-27 10:56:30'),
(869, 45, 'PLAN_APPROVE', 'Approved plan: \"Construction Safety Roadmap\" (ID 378)', '{\"ip_address\":\"192.168.1.122\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/plans/378\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:42:22.288Z\",\"plan_id\":378}', '2026-03-01 03:45:46'),
(870, 78, 'REPORT_DECLINE', 'Declined report: \"Q1 Financial Summary Report\" — data inconsistency', '{\"ip_address\":\"192.168.1.159\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/reports/561\",\"method\":\"GET\",\"timestamp\":\"2026-03-25T07:42:22.290Z\",\"report_id\":561}', '2026-03-16 15:33:12'),
(871, 38, 'PLAN_DELETE', 'Deleted plan: \"HR Onboarding Automation\" (ID 419)', '{\"ip_address\":\"192.168.1.134\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/plans/419\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:42:22.289Z\",\"plan_id\":419}', '2026-02-27 04:33:07'),
(872, 59, 'PLAN_SUBMIT', 'Submitted plan: \"Marketing Strategy 2026\" for approval', '{\"ip_address\":\"192.168.1.76\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/plans/329\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:42:22.289Z\",\"plan_id\":329}', '2026-03-04 14:38:42'),
(873, 38, 'TASK_COMPLETE', 'Completed task: \"Fix API timeout issues\" (ID 46) ahead of schedule', '{\"ip_address\":\"192.168.1.60\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/tasks/46\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:42:22.292Z\",\"task_id\":46}', '2026-03-17 19:36:43'),
(874, 42, 'MEETING_POSTPONE', 'Postponed meeting: \"Annual Planning Workshop\" to next week', '{\"ip_address\":\"192.168.1.84\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/meetings/21\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.293Z\",\"meeting_id\":21}', '2026-03-23 17:41:07'),
(875, 24, 'MEETING_JOIN', 'Joined meeting: \"IT Daily Standup\"', '{\"ip_address\":\"192.168.1.52\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/meetings/8\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.293Z\",\"meeting_id\":8}', '2026-02-25 01:17:08'),
(876, 59, 'REPORT_DELETE', 'Deleted report: \"Q1 Financial Summary Report\" (ID 498)', '{\"ip_address\":\"192.168.1.109\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/reports/498\",\"method\":\"GET\",\"timestamp\":\"2026-03-25T07:42:22.290Z\",\"report_id\":498}', '2026-03-24 01:06:20'),
(877, 25, 'PLAN_CREATE', 'Created plan: \"Legal Compliance Review Plan\" (ID 136)', '{\"ip_address\":\"192.168.1.51\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/plans/136\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.288Z\",\"plan_id\":136}', '2026-03-04 17:28:39'),
(878, 7, 'TASK_CREATE', 'Created task: \"Prepare Q2 budget sheet\" assigned to team', '{\"ip_address\":\"192.168.1.78\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/tasks/189\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.292Z\",\"task_id\":189}', '2026-02-27 00:01:13'),
(879, 59, 'SYSTEM_ERROR', 'Unhandled exception in /api/plans/approve — Null reference', '{\"ip_address\":\"192.168.1.82\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/system/errors\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.293Z\"}', '2026-03-24 18:21:08'),
(880, 43, 'MEETING_CREATE', 'Scheduled meeting: \"Q2 Strategy Meeting\" — 9 attendees invited', '{\"ip_address\":\"192.168.1.137\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/meetings/32\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.293Z\",\"meeting_id\":32}', '2026-03-16 12:47:33'),
(881, 13, 'MENU_CREATE', 'Created menu item: \"Settings\" (path /settings)', '{\"ip_address\":\"192.168.1.154\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/menu-permissions\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.291Z\",\"role\":\"Admin\",\"menu\":\"Settings\"}', '2026-03-10 02:29:20'),
(882, 66, 'DATA_EXPORT', 'Data exported: audit_logs table — 2184 rows as CSV', '{\"ip_address\":\"192.168.1.57\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/admin/export\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.293Z\"}', '2026-03-14 20:42:43'),
(883, 41, 'SYSTEM_START', 'Server started on port 5001 — DB connected, 18 routes registered', '{\"ip_address\":\"192.168.1.85\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/system/start\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.293Z\"}', '2026-03-10 14:48:54'),
(884, 43, 'PLAN_DELETE', 'Deleted plan: \"Employee Training Programme 2025\" (ID 327)', '{\"ip_address\":\"192.168.1.24\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/plans/327\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:42:22.289Z\",\"plan_id\":327}', '2026-03-15 00:17:01'),
(885, 66, 'MENU_DELETE', 'Deleted menu item \"Dashboard\" and cleaned up role_permissions', '{\"ip_address\":\"192.168.1.188\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/menu-permissions\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.291Z\",\"role\":\"Staff\",\"menu\":\"Dashboard\"}', '2026-03-10 12:59:20'),
(886, 51, 'MENU_DELETE', 'Deleted menu item \"Reports\" and cleaned up role_permissions', '{\"ip_address\":\"192.168.1.141\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/menu-permissions\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.291Z\",\"role\":\"Manager\",\"menu\":\"Reports\"}', '2026-02-27 03:55:31'),
(887, 13, 'REPORT_VIEW', 'Viewed report: \"Construction Progress Report\"', '{\"ip_address\":\"192.168.1.134\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/reports/305\",\"method\":\"GET\",\"timestamp\":\"2026-03-25T07:42:22.289Z\",\"report_id\":305}', '2026-03-07 21:32:07'),
(888, 61, 'ROLE_DELETE', 'Deleted role \"Admin\" and reassigned 6 users', '{\"ip_address\":\"192.168.1.122\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/menu-permissions\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.291Z\",\"role\":\"Admin\",\"menu\":\"Tasks\"}', '2026-03-18 23:26:55'),
(889, 6, 'TASK_UPDATE', 'Updated task: \"Train new team members\" — changed deadline & priority', '{\"ip_address\":\"192.168.1.13\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/tasks/277\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:42:22.292Z\",\"task_id\":277}', '2026-03-04 09:03:11'),
(890, 47, 'ROLE_DELETE', 'Deleted role \"Staff\" and reassigned 6 users', '{\"ip_address\":\"192.168.1.136\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/menu-permissions\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.291Z\",\"role\":\"Staff\",\"menu\":\"Plans\"}', '2026-02-27 03:29:47'),
(891, 56, 'MENU_UPDATE', 'Updated menu item \"Plans\" — changed icon & display order', '{\"ip_address\":\"192.168.1.106\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/menu-permissions\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.290Z\",\"role\":\"Expert\",\"menu\":\"Plans\"}', '2026-03-24 04:20:28'),
(892, 65, 'TASK_COMPLETE', 'Completed task: \"Fix API timeout issues\" (ID 173) ahead of schedule', '{\"ip_address\":\"192.168.1.11\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/tasks/173\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:42:22.292Z\",\"task_id\":173}', '2026-03-23 07:12:27'),
(893, 51, 'REPORT_VIEW', 'Viewed report: \"Q1 Financial Summary Report\"', '{\"ip_address\":\"192.168.1.154\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/reports/323\",\"method\":\"GET\",\"timestamp\":\"2026-03-25T07:42:22.290Z\",\"report_id\":323}', '2026-03-16 17:33:39'),
(894, 25, 'MEETING_JOIN', 'Joined meeting: \"Q2 Strategy Meeting\"', '{\"ip_address\":\"192.168.1.172\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/meetings/73\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.293Z\",\"meeting_id\":73}', '2026-03-21 06:07:09'),
(895, 27, 'PLAN_VIEW', 'Viewed plan: \"Digital Transformation Initiative\"', '{\"ip_address\":\"192.168.1.167\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/plans/137\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:42:22.289Z\",\"plan_id\":137}', '2026-03-06 13:13:32'),
(896, 64, 'PLAN_DECLINE', 'Declined plan: \"Legal Compliance Review Plan\" — insufficient detail', '{\"ip_address\":\"192.168.1.95\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/plans/170\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:42:22.289Z\",\"plan_id\":170}', '2026-03-15 05:14:23'),
(897, 79, 'PLAN_UPDATE', 'Updated plan: \"HR Onboarding Automation\" — revised budget & timeline', '{\"ip_address\":\"192.168.1.15\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/plans/239\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:42:22.288Z\",\"plan_id\":239}', '2026-02-26 04:40:23'),
(898, 70, 'DATA_EXPORT', 'Data exported: employees table — 1316 rows as CSV', '{\"ip_address\":\"192.168.1.195\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/admin/export\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.292Z\"}', '2026-03-04 21:42:39'),
(899, 47, 'PLAN_CREATE', 'Created plan: \"Q2 Budget Forecast Plan\" (ID 265)', '{\"ip_address\":\"192.168.1.60\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/plans/265\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.289Z\",\"plan_id\":265}', '2026-03-20 15:09:37'),
(900, NULL, 'DATA_EXPORT', 'Scheduled database backup completed — 108 MB archived', '{\"ip_address\":\"192.168.1.22\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/admin/backup\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.293Z\"}', '2026-03-04 20:02:47'),
(901, 60, 'PLAN_VIEW', 'Viewed plan: \"HR Onboarding Automation\"', '{\"ip_address\":\"192.168.1.198\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/plans/388\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:42:22.288Z\",\"plan_id\":388}', '2026-03-07 09:00:34'),
(902, 79, 'REPORT_SUBMIT', 'Submitted report: \"Budget Variance Analysis\" for review', '{\"ip_address\":\"192.168.1.96\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/reports/378\",\"method\":\"GET\",\"timestamp\":\"2026-03-25T07:42:22.290Z\",\"report_id\":378}', '2026-03-22 14:42:08'),
(903, 52, 'DATA_EXPORT', 'Data exported: reports table — 2170 rows as CSV', '{\"ip_address\":\"192.168.1.88\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/admin/export\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.293Z\"}', '2026-03-09 01:54:17'),
(904, 46, 'PLAN_VIEW', 'Viewed plan: \"Marketing Strategy 2026\"', '{\"ip_address\":\"192.168.1.101\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/plans/313\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:42:22.288Z\",\"plan_id\":313}', '2026-02-26 04:25:53'),
(905, 42, 'DATA_EXPORT', 'Data exported: reports table — 1549 rows as CSV', '{\"ip_address\":\"192.168.1.165\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/admin/export\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.292Z\"}', '2026-02-27 21:13:07'),
(906, 56, 'PLAN_APPROVE', 'Approved plan: \"Q2 Budget Forecast Plan\" (ID 103)', '{\"ip_address\":\"192.168.1.86\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/plans/103\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:42:22.288Z\",\"plan_id\":103}', '2026-03-05 17:39:22'),
(907, 69, 'REPORT_SUBMIT', 'Submitted report: \"Monthly Employee Performance\" for review', '{\"ip_address\":\"192.168.1.191\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/reports/401\",\"method\":\"GET\",\"timestamp\":\"2026-03-25T07:42:22.289Z\",\"report_id\":401}', '2026-03-21 23:50:41'),
(908, 65, 'TASK_CREATE', 'Created task: \"Prepare Q2 budget sheet\" assigned to team', '{\"ip_address\":\"192.168.1.150\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/tasks/255\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.292Z\",\"task_id\":255}', '2026-02-24 01:18:28'),
(909, 78, 'TASK_DELETE', 'Deleted task: \"Review server backups\" (ID 217) — cancelled', '{\"ip_address\":\"192.168.1.123\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/tasks/217\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:42:22.292Z\",\"task_id\":217}', '2026-03-03 12:27:31'),
(910, 78, 'MENU_CREATE', 'Created menu item: \"Plans\" (path /plans)', '{\"ip_address\":\"192.168.1.29\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/menu-permissions\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.291Z\",\"role\":\"Manager\",\"menu\":\"Plans\"}', '2026-03-02 06:56:52'),
(911, 38, 'SETTINGS_CHANGE', 'System setting changed: email_notifications updated', '{\"ip_address\":\"192.168.1.167\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/settings\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.293Z\"}', '2026-03-18 16:38:41'),
(912, 64, 'PLAN_VIEW', 'Viewed plan: \"Construction Safety Roadmap\"', '{\"ip_address\":\"192.168.1.74\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/plans/481\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:42:22.288Z\",\"plan_id\":481}', '2026-03-06 06:28:00'),
(913, 78, 'REPORT_CREATE', 'Created report: \"Annual Audit Report 2024\"', '{\"ip_address\":\"192.168.1.167\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/reports/580\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.290Z\",\"report_id\":580}', '2026-03-06 18:45:32'),
(914, 63, 'PLAN_DECLINE', 'Declined plan: \"Annual IT Infrastructure Upgrade\" — insufficient detail', '{\"ip_address\":\"192.168.1.165\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/plans/134\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:42:22.289Z\",\"plan_id\":134}', '2026-02-25 16:27:04'),
(915, 41, 'MEETING_END', 'Ended meeting: \"Q2 Strategy Meeting\" — duration 131 minutes', '{\"ip_address\":\"192.168.1.50\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/meetings/27\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.293Z\",\"meeting_id\":27}', '2026-03-08 11:32:06'),
(916, 53, 'REPORT_APPROVE', 'Approved report: \"Budget Variance Analysis\"', '{\"ip_address\":\"192.168.1.94\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/reports/632\",\"method\":\"GET\",\"timestamp\":\"2026-03-25T07:42:22.289Z\",\"report_id\":632}', '2026-03-04 14:31:58');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `description`, `metadata`, `created_at`) VALUES
(917, 51, 'MENU_DELETE', 'Deleted menu item \"Settings\" and cleaned up role_permissions', '{\"ip_address\":\"192.168.1.179\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/menu-permissions\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.291Z\",\"role\":\"Expert\",\"menu\":\"Settings\"}', '2026-02-28 11:22:02'),
(918, 30, 'MEETING_END', 'Ended meeting: \"Audit Debrief\" — duration 136 minutes', '{\"ip_address\":\"192.168.1.94\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/meetings/88\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.293Z\",\"meeting_id\":88}', '2026-02-25 16:48:05'),
(919, 39, 'PLAN_DELETE', 'Deleted plan: \"HR Onboarding Automation\" (ID 202)', '{\"ip_address\":\"192.168.1.63\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/plans/202\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:42:22.286Z\",\"plan_id\":202}', '2026-03-07 05:48:39'),
(920, 72, 'MEETING_CREATE', 'Scheduled meeting: \"Audit Debrief\" — 7 attendees invited', '{\"ip_address\":\"192.168.1.18\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/meetings/41\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.293Z\",\"meeting_id\":41}', '2026-02-28 19:25:04'),
(921, 61, 'TASK_COMPLETE', 'Completed task: \"Train new team members\" (ID 256) ahead of schedule', '{\"ip_address\":\"192.168.1.115\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/tasks/256\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:42:22.292Z\",\"task_id\":256}', '2026-02-28 16:09:57'),
(922, 47, 'PLAN_SUBMIT', 'Submitted plan: \"Digital Transformation Initiative\" for approval', '{\"ip_address\":\"192.168.1.27\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/plans/305\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:42:22.289Z\",\"plan_id\":305}', '2026-03-06 16:20:52'),
(923, 38, 'PLAN_DECLINE', 'Declined plan: \"Digital Transformation Initiative\" — insufficient detail', '{\"ip_address\":\"192.168.1.165\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/plans/292\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:42:22.289Z\",\"plan_id\":292}', '2026-03-08 07:52:02'),
(924, 78, 'PLAN_DECLINE', 'Declined plan: \"Q2 Budget Forecast Plan\" — insufficient detail', '{\"ip_address\":\"192.168.1.44\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/plans/160\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:42:22.288Z\",\"plan_id\":160}', '2026-03-03 07:56:32'),
(925, NULL, 'SYSTEM_START', 'Server started on port 5001 — DB connected, 17 routes registered', '{\"ip_address\":\"192.168.1.113\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/system/start\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.293Z\"}', '2026-03-11 04:52:51'),
(926, 64, 'PLAN_UPDATE', 'Updated plan: \"Marketing Strategy 2026\" — revised budget & timeline', '{\"ip_address\":\"192.168.1.128\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/plans/200\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:42:22.288Z\",\"plan_id\":200}', '2026-03-13 10:10:07'),
(927, 52, 'REPORT_DELETE', 'Deleted report: \"Monthly Employee Performance\" (ID 615)', '{\"ip_address\":\"192.168.1.83\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/reports/615\",\"method\":\"GET\",\"timestamp\":\"2026-03-25T07:42:22.289Z\",\"report_id\":615}', '2026-02-23 14:29:38'),
(928, 40, 'SETTINGS_CHANGE', 'System setting changed: session_timeout updated', '{\"ip_address\":\"192.168.1.73\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/settings\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.293Z\"}', '2026-03-17 05:11:46'),
(929, 45, 'TASK_DELETE', 'Deleted task: \"Fix API timeout issues\" (ID 17) — cancelled', '{\"ip_address\":\"192.168.1.25\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/tasks/17\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:42:22.292Z\",\"task_id\":17}', '2026-03-02 06:04:03'),
(930, 50, 'PLAN_VIEW', 'Viewed plan: \"HR Onboarding Automation\"', '{\"ip_address\":\"192.168.1.56\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/plans/169\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:42:22.288Z\",\"plan_id\":169}', '2026-03-05 06:53:23'),
(931, 37, 'REPORT_DELETE', 'Deleted report: \"Risk Assessment Report\" (ID 635)', '{\"ip_address\":\"192.168.1.119\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/reports/635\",\"method\":\"GET\",\"timestamp\":\"2026-03-25T07:42:22.290Z\",\"report_id\":635}', '2026-03-11 03:58:46'),
(932, 72, 'TASK_COMPLETE', 'Completed task: \"Prepare Q2 budget sheet\" (ID 192) ahead of schedule', '{\"ip_address\":\"192.168.1.96\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/tasks/192\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:42:22.292Z\",\"task_id\":192}', '2026-03-07 06:03:15'),
(933, NULL, 'SYSTEM_ERROR', 'Unhandled exception in /api/reports — DB connection lost', '{\"ip_address\":\"192.168.1.54\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/system/errors\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.293Z\"}', '2026-03-24 16:53:33'),
(934, 6, 'PLAN_VIEW', 'Viewed plan: \"Employee Training Programme 2025\"', '{\"ip_address\":\"192.168.1.72\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/plans/391\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:42:22.289Z\",\"plan_id\":391}', '2026-02-28 18:21:37'),
(935, 7, 'MENU_UPDATE', 'Updated menu item \"Dashboard\" — changed icon & display order', '{\"ip_address\":\"192.168.1.105\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/menu-permissions\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.290Z\",\"role\":\"Manager\",\"menu\":\"Dashboard\"}', '2026-03-05 14:59:32'),
(936, 56, 'TASK_COMPLETE', 'Completed task: \"Review server backups\" (ID 165) ahead of schedule', '{\"ip_address\":\"192.168.1.130\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/tasks/165\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:42:22.292Z\",\"task_id\":165}', '2026-03-06 20:47:05'),
(937, 56, 'MENU_CREATE', 'Created menu item: \"Plans\" (path /plans)', '{\"ip_address\":\"192.168.1.94\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/menu-permissions\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.291Z\",\"role\":\"Manager\",\"menu\":\"Plans\"}', '2026-02-26 18:15:47'),
(938, 37, 'REPORT_APPROVE', 'Approved report: \"Monthly Employee Performance\"', '{\"ip_address\":\"192.168.1.136\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/reports/618\",\"method\":\"GET\",\"timestamp\":\"2026-03-25T07:42:22.289Z\",\"report_id\":618}', '2026-03-09 19:38:57'),
(939, 50, 'REPORT_DELETE', 'Deleted report: \"IT Incident Response Report\" (ID 491)', '{\"ip_address\":\"192.168.1.51\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/reports/491\",\"method\":\"GET\",\"timestamp\":\"2026-03-25T07:42:22.289Z\",\"report_id\":491}', '2026-02-26 22:08:45'),
(940, 79, 'MEETING_UPDATE', 'Updated meeting: \"Budget Review Session\" — agenda revised', '{\"ip_address\":\"192.168.1.105\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/meetings/66\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.293Z\",\"meeting_id\":66}', '2026-03-15 11:47:40'),
(941, 62, 'DATA_EXPORT', 'Scheduled database backup completed — 180 MB archived', '{\"ip_address\":\"192.168.1.69\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/admin/backup\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.292Z\"}', '2026-03-19 19:25:18'),
(942, 6, 'TASK_DELETE', 'Deleted task: \"Prepare Q2 budget sheet\" (ID 275) — cancelled', '{\"ip_address\":\"192.168.1.193\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/tasks/275\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:42:22.292Z\",\"task_id\":275}', '2026-03-11 21:18:59'),
(943, 58, 'PLAN_DECLINE', 'Declined plan: \"Legal Compliance Review Plan\" — insufficient detail', '{\"ip_address\":\"192.168.1.76\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/plans/110\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:42:22.288Z\",\"plan_id\":110}', '2026-02-25 17:14:19'),
(944, 26, 'ROLE_UPDATE', 'Updated role \"Manager\" — renamed & permission set revised', '{\"ip_address\":\"192.168.1.186\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/menu-permissions\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.291Z\",\"role\":\"Manager\",\"menu\":\"Tasks\"}', '2026-02-25 11:01:45'),
(945, 45, 'REPORT_APPROVE', 'Approved report: \"Budget Variance Analysis\"', '{\"ip_address\":\"192.168.1.180\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/reports/609\",\"method\":\"GET\",\"timestamp\":\"2026-03-25T07:42:22.289Z\",\"report_id\":609}', '2026-02-24 01:13:40'),
(946, 68, 'TASK_COMPLETE', 'Completed task: \"Fix API timeout issues\" (ID 104) ahead of schedule', '{\"ip_address\":\"192.168.1.84\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/tasks/104\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:42:22.292Z\",\"task_id\":104}', '2026-03-22 19:13:21'),
(947, 70, 'MEETING_UPDATE', 'Updated meeting: \"Q2 Strategy Meeting\" — agenda revised', '{\"ip_address\":\"192.168.1.17\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/meetings/33\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.293Z\",\"meeting_id\":33}', '2026-02-24 19:17:15'),
(948, 79, 'PLAN_VIEW', 'Viewed plan: \"Marketing Strategy 2026\"', '{\"ip_address\":\"192.168.1.55\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/plans/209\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:42:22.288Z\",\"plan_id\":209}', '2026-03-18 06:19:36'),
(949, NULL, 'SYSTEM_ERROR', 'Unhandled exception in /api/reports — Null reference', '{\"ip_address\":\"192.168.1.21\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/system/errors\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.293Z\"}', '2026-03-19 15:11:21'),
(950, 74, 'PLAN_UPDATE', 'Updated plan: \"Construction Safety Roadmap\" — revised budget & timeline', '{\"ip_address\":\"192.168.1.188\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/plans/495\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:42:22.288Z\",\"plan_id\":495}', '2026-03-11 00:21:41'),
(951, 74, 'MENU_DELETE', 'Deleted menu item \"Reports\" and cleaned up role_permissions', '{\"ip_address\":\"192.168.1.184\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/menu-permissions\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.291Z\",\"role\":\"Manager\",\"menu\":\"Reports\"}', '2026-02-23 18:05:28'),
(952, 7, 'MENU_CREATE', 'Created menu item: \"Tasks\" (path /tasks)', '{\"ip_address\":\"192.168.1.108\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/menu-permissions\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.291Z\",\"role\":\"Expert\",\"menu\":\"Tasks\"}', '2026-02-27 05:20:57'),
(953, 30, 'MENU_UPDATE', 'Updated menu item \"Settings\" — changed icon & display order', '{\"ip_address\":\"192.168.1.92\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/menu-permissions\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.291Z\",\"role\":\"Team Leader\",\"menu\":\"Settings\"}', '2026-03-02 19:52:00'),
(954, 71, 'REPORT_SUBMIT', 'Submitted report: \"Annual Audit Report 2024\" for review', '{\"ip_address\":\"192.168.1.91\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/reports/261\",\"method\":\"GET\",\"timestamp\":\"2026-03-25T07:42:22.290Z\",\"report_id\":261}', '2026-03-14 01:10:31'),
(955, 46, 'PLAN_CREATE', 'Created plan: \"Digital Transformation Initiative\" (ID 150)', '{\"ip_address\":\"192.168.1.199\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/plans/150\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.289Z\",\"plan_id\":150}', '2026-03-16 17:04:31'),
(956, 64, 'REPORT_APPROVE', 'Approved report: \"Monthly Employee Performance\"', '{\"ip_address\":\"192.168.1.96\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/reports/605\",\"method\":\"GET\",\"timestamp\":\"2026-03-25T07:42:22.290Z\",\"report_id\":605}', '2026-02-26 00:16:31'),
(957, 64, 'TASK_COMPLETE', 'Completed task: \"Update employee records\" (ID 218) ahead of schedule', '{\"ip_address\":\"192.168.1.46\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/tasks/218\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:42:22.292Z\",\"task_id\":218}', '2026-03-03 06:42:16'),
(958, 74, 'PLAN_UPDATE', 'Updated plan: \"Digital Transformation Initiative\" — revised budget & timeline', '{\"ip_address\":\"192.168.1.174\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/plans/191\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:42:22.289Z\",\"plan_id\":191}', '2026-02-26 20:45:49'),
(959, 77, 'PLAN_APPROVE', 'Approved plan: \"Marketing Strategy 2026\" (ID 217)', '{\"ip_address\":\"192.168.1.106\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/plans/217\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:42:22.288Z\",\"plan_id\":217}', '2026-02-28 06:28:10'),
(960, 13, 'MEETING_UPDATE', 'Updated meeting: \"Annual Planning Workshop\" — agenda revised', '{\"ip_address\":\"192.168.1.99\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/meetings/63\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.293Z\",\"meeting_id\":63}', '2026-03-12 22:31:58'),
(961, 57, 'REPORT_UPDATE', 'Updated report: \"Construction Progress Report\" — added Q3 data', '{\"ip_address\":\"192.168.1.177\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/reports/602\",\"method\":\"GET\",\"timestamp\":\"2026-03-25T07:42:22.290Z\",\"report_id\":602}', '2026-02-27 11:55:07'),
(962, 79, 'MEETING_UPDATE', 'Updated meeting: \"Budget Review Session\" — agenda revised', '{\"ip_address\":\"192.168.1.87\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/meetings/64\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.293Z\",\"meeting_id\":64}', '2026-02-27 01:15:16'),
(963, 56, 'ROLE_UPDATE', 'Updated role \"Expert\" — renamed & permission set revised', '{\"ip_address\":\"192.168.1.166\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/menu-permissions\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.291Z\",\"role\":\"Expert\",\"menu\":\"Admin Panel\"}', '2026-02-27 00:13:05'),
(964, 26, 'TASK_COMPLETE', 'Completed task: \"Fix API timeout issues\" (ID 280) ahead of schedule', '{\"ip_address\":\"192.168.1.112\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/tasks/280\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:42:22.292Z\",\"task_id\":280}', '2026-03-17 16:23:10'),
(965, 50, 'MEETING_CREATE', 'Scheduled meeting: \"IT Daily Standup\" — 13 attendees invited', '{\"ip_address\":\"192.168.1.132\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/meetings/47\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.293Z\",\"meeting_id\":47}', '2026-03-16 10:29:12'),
(966, 62, 'TASK_COMPLETE', 'Completed task: \"Fix API timeout issues\" (ID 150) ahead of schedule', '{\"ip_address\":\"192.168.1.15\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/tasks/150\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:42:22.292Z\",\"task_id\":150}', '2026-03-24 15:11:46'),
(967, 75, 'PLAN_CREATE', 'Created plan: \"Annual IT Infrastructure Upgrade\" (ID 478)', '{\"ip_address\":\"192.168.1.92\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/plans/478\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.288Z\",\"plan_id\":478}', '2026-03-04 16:10:20'),
(968, 66, 'MENU_UPDATE', 'Updated menu item \"Admin Panel\" — changed icon & display order', '{\"ip_address\":\"192.168.1.57\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/menu-permissions\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.291Z\",\"role\":\"Staff\",\"menu\":\"Admin Panel\"}', '2026-02-28 11:17:29'),
(969, 73, 'REPORT_SUBMIT', 'Submitted report: \"Budget Variance Analysis\" for review', '{\"ip_address\":\"192.168.1.152\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/reports/202\",\"method\":\"GET\",\"timestamp\":\"2026-03-25T07:42:22.289Z\",\"report_id\":202}', '2026-03-15 00:47:44'),
(970, 24, 'REPORT_APPROVE', 'Approved report: \"Q1 Financial Summary Report\"', '{\"ip_address\":\"192.168.1.46\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/reports/478\",\"method\":\"GET\",\"timestamp\":\"2026-03-25T07:42:22.289Z\",\"report_id\":478}', '2026-03-23 02:04:50'),
(971, 53, 'ROLE_UPDATE', 'Updated role \"Expert\" — renamed & permission set revised', '{\"ip_address\":\"192.168.1.186\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/menu-permissions\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.291Z\",\"role\":\"Expert\",\"menu\":\"Admin Panel\"}', '2026-03-18 08:04:23'),
(972, 60, 'TASK_CREATE', 'Created task: \"Review server backups\" assigned to team', '{\"ip_address\":\"192.168.1.146\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/tasks/281\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.292Z\",\"task_id\":281}', '2026-03-04 22:28:57'),
(973, 43, 'ROLE_CREATE', 'Created new role: \"Team Leader Level 2\"', '{\"ip_address\":\"192.168.1.20\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/menu-permissions\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.291Z\",\"role\":\"Team Leader\",\"menu\":\"Settings\"}', '2026-03-06 16:45:13'),
(974, 59, 'ROLE_CREATE', 'Created new role: \"Staff Level 1\"', '{\"ip_address\":\"192.168.1.166\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/menu-permissions\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.290Z\",\"role\":\"Staff\",\"menu\":\"Tasks\"}', '2026-02-27 21:23:33'),
(975, 54, 'SYSTEM_ERROR', 'Unhandled exception in /api/users — JWT expired', '{\"ip_address\":\"192.168.1.28\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/system/errors\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.292Z\"}', '2026-02-28 10:23:59'),
(976, 70, 'PLAN_UPDATE', 'Updated plan: \"HR Onboarding Automation\" — revised budget & timeline', '{\"ip_address\":\"192.168.1.127\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/plans/392\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:42:22.289Z\",\"plan_id\":392}', '2026-02-24 03:17:17'),
(977, 77, 'PLAN_SUBMIT', 'Submitted plan: \"Digital Transformation Initiative\" for approval', '{\"ip_address\":\"192.168.1.115\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/plans/499\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:42:22.289Z\",\"plan_id\":499}', '2026-02-26 18:17:02'),
(978, 59, 'SYSTEM_ERROR', 'Unhandled exception in /api/plans/approve — Null reference', '{\"ip_address\":\"192.168.1.116\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/system/errors\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.293Z\"}', '2026-02-26 03:18:22'),
(979, 24, 'PLAN_UPDATE', 'Updated plan: \"Legal Compliance Review Plan\" — revised budget & timeline', '{\"ip_address\":\"192.168.1.138\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/plans/156\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:42:22.289Z\",\"plan_id\":156}', '2026-03-04 10:01:12'),
(980, 68, 'MENU_DELETE', 'Deleted menu item \"Reports\" and cleaned up role_permissions', '{\"ip_address\":\"192.168.1.100\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/menu-permissions\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.291Z\",\"role\":\"Admin\",\"menu\":\"Reports\"}', '2026-02-25 09:37:07'),
(981, 38, 'TASK_COMPLETE', 'Completed task: \"Train new team members\" (ID 290) ahead of schedule', '{\"ip_address\":\"192.168.1.42\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/tasks/290\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:42:22.292Z\",\"task_id\":290}', '2026-03-11 15:14:57'),
(982, 38, 'SYSTEM_ERROR', 'Unhandled exception in /api/users — Timeout', '{\"ip_address\":\"192.168.1.113\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/system/errors\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.292Z\"}', '2026-02-26 09:08:19'),
(983, 46, 'TASK_UPDATE', 'Updated task: \"Update employee records\" — changed deadline & priority', '{\"ip_address\":\"192.168.1.85\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/tasks/14\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:42:22.292Z\",\"task_id\":14}', '2026-03-24 10:28:35'),
(984, 40, 'REPORT_DELETE', 'Deleted report: \"IT Incident Response Report\" (ID 469)', '{\"ip_address\":\"192.168.1.192\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/reports/469\",\"method\":\"GET\",\"timestamp\":\"2026-03-25T07:42:22.290Z\",\"report_id\":469}', '2026-03-03 22:04:05'),
(985, NULL, 'SYSTEM_START', 'Server started on port 5001 — DB connected, 20 routes registered', '{\"ip_address\":\"192.168.1.118\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/system/start\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.293Z\"}', '2026-02-25 12:32:03'),
(986, 36, 'PLAN_SUBMIT', 'Submitted plan: \"HR Onboarding Automation\" for approval', '{\"ip_address\":\"192.168.1.48\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/plans/402\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:42:22.289Z\",\"plan_id\":402}', '2026-02-25 10:07:01'),
(987, NULL, 'SYSTEM_START', 'Server started on port 5001 — DB connected, 13 routes registered', '{\"ip_address\":\"192.168.1.74\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/system/start\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.293Z\"}', '2026-03-10 22:34:17'),
(988, 27, 'PLAN_VIEW', 'Viewed plan: \"Marketing Strategy 2026\"', '{\"ip_address\":\"192.168.1.184\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/plans/130\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:42:22.289Z\",\"plan_id\":130}', '2026-02-27 01:18:53'),
(989, 53, 'MEETING_JOIN', 'Joined meeting: \"Budget Review Session\"', '{\"ip_address\":\"192.168.1.28\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/meetings/53\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.293Z\",\"meeting_id\":53}', '2026-03-13 06:31:19'),
(990, 7, 'ROLE_UPDATE', 'Updated role \"Staff\" — renamed & permission set revised', '{\"ip_address\":\"192.168.1.25\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/menu-permissions\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.291Z\",\"role\":\"Staff\",\"menu\":\"Dashboard\"}', '2026-03-04 02:06:51'),
(991, NULL, 'DATA_EXPORT', 'Data exported: plans table — 869 rows as CSV', '{\"ip_address\":\"192.168.1.85\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/admin/export\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.293Z\"}', '2026-03-22 00:00:22'),
(992, 62, 'SYSTEM_START', 'Server started on port 5001 — DB connected, 15 routes registered', '{\"ip_address\":\"192.168.1.195\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/system/start\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.293Z\"}', '2026-03-01 18:59:33'),
(993, 61, 'TASK_UPDATE', 'Updated task: \"Fix API timeout issues\" — changed deadline & priority', '{\"ip_address\":\"192.168.1.30\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/tasks/110\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:42:22.292Z\",\"task_id\":110}', '2026-03-18 02:20:56'),
(994, 53, 'TASK_CREATE', 'Created task: \"Fix API timeout issues\" assigned to team', '{\"ip_address\":\"192.168.1.76\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/tasks/186\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.291Z\",\"task_id\":186}', '2026-03-03 13:36:11'),
(995, 38, 'TASK_UPDATE', 'Updated task: \"Complete security audit\" — changed deadline & priority', '{\"ip_address\":\"192.168.1.188\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/tasks/274\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:42:22.292Z\",\"task_id\":274}', '2026-03-24 16:17:08'),
(996, 26, 'MENU_DELETE', 'Deleted menu item \"Settings\" and cleaned up role_permissions', '{\"ip_address\":\"192.168.1.96\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/menu-permissions\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.291Z\",\"role\":\"Manager\",\"menu\":\"Settings\"}', '2026-03-19 19:39:26'),
(997, 40, 'TASK_UPDATE', 'Updated task: \"Complete security audit\" — changed deadline & priority', '{\"ip_address\":\"192.168.1.160\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/tasks/233\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:42:22.292Z\",\"task_id\":233}', '2026-03-05 14:45:56'),
(998, NULL, 'SYSTEM_ERROR', 'Unhandled exception in /api/reports — DB connection lost', '{\"ip_address\":\"192.168.1.179\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/system/errors\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.293Z\"}', '2026-03-01 07:18:37'),
(999, 61, 'PLAN_DELETE', 'Deleted plan: \"Marketing Strategy 2026\" (ID 273)', '{\"ip_address\":\"192.168.1.154\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/plans/273\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:42:22.288Z\",\"plan_id\":273}', '2026-02-23 06:01:50'),
(1000, 48, 'TASK_CREATE', 'Created task: \"Update employee records\" assigned to team', '{\"ip_address\":\"192.168.1.68\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/tasks/275\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.292Z\",\"task_id\":275}', '2026-03-08 23:59:32'),
(1001, 40, 'ROLE_CREATE', 'Created new role: \"Manager Level 1\"', '{\"ip_address\":\"192.168.1.182\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/menu-permissions\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.290Z\",\"role\":\"Manager\",\"menu\":\"Plans\"}', '2026-03-23 22:43:38'),
(1002, 59, 'PLAN_UPDATE', 'Updated plan: \"Digital Transformation Initiative\" — revised budget & timeline', '{\"ip_address\":\"192.168.1.53\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/plans/317\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:42:22.288Z\",\"plan_id\":317}', '2026-03-10 01:00:31'),
(1003, 56, 'MEETING_CREATE', 'Scheduled meeting: \"IT Daily Standup\" — 10 attendees invited', '{\"ip_address\":\"192.168.1.55\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/meetings/96\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.293Z\",\"meeting_id\":96}', '2026-02-27 21:38:09'),
(1004, 75, 'DATA_EXPORT', 'Scheduled database backup completed — 186 MB archived', '{\"ip_address\":\"192.168.1.40\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/admin/backup\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.293Z\"}', '2026-03-22 16:56:34'),
(1005, 75, 'TASK_COMPLETE', 'Completed task: \"Review server backups\" (ID 105) ahead of schedule', '{\"ip_address\":\"192.168.1.55\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/tasks/105\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:42:22.292Z\",\"task_id\":105}', '2026-02-26 05:57:12'),
(1006, 27, 'PLAN_DELETE', 'Deleted plan: \"Annual IT Infrastructure Upgrade\" (ID 168)', '{\"ip_address\":\"192.168.1.194\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/plans/168\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:42:22.289Z\",\"plan_id\":168}', '2026-03-11 00:38:32'),
(1007, 46, 'TASK_COMPLETE', 'Completed task: \"Fix API timeout issues\" (ID 88) ahead of schedule', '{\"ip_address\":\"192.168.1.89\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/tasks/88\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:42:22.292Z\",\"task_id\":88}', '2026-03-01 15:43:19'),
(1008, 65, 'REPORT_DELETE', 'Deleted report: \"Monthly Employee Performance\" (ID 256)', '{\"ip_address\":\"192.168.1.144\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/reports/256\",\"method\":\"GET\",\"timestamp\":\"2026-03-25T07:42:22.290Z\",\"report_id\":256}', '2026-03-22 19:36:41'),
(1009, 38, 'TASK_DELETE', 'Deleted task: \"Complete security audit\" (ID 97) — cancelled', '{\"ip_address\":\"192.168.1.92\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/tasks/97\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:42:22.292Z\",\"task_id\":97}', '2026-03-01 14:27:55'),
(1010, 63, 'PLAN_DELETE', 'Deleted plan: \"Legal Compliance Review Plan\" (ID 344)', '{\"ip_address\":\"192.168.1.54\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/plans/344\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:42:22.289Z\",\"plan_id\":344}', '2026-02-27 08:56:57'),
(1011, 70, 'MEETING_JOIN', 'Joined meeting: \"Audit Debrief\"', '{\"ip_address\":\"192.168.1.67\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/meetings/36\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.293Z\",\"meeting_id\":36}', '2026-03-12 16:59:52'),
(1012, 64, 'TASK_COMPLETE', 'Completed task: \"Review server backups\" (ID 18) ahead of schedule', '{\"ip_address\":\"192.168.1.19\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/tasks/18\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:42:22.292Z\",\"task_id\":18}', '2026-03-20 20:44:00'),
(1013, NULL, 'SYSTEM_START', 'Server started on port 5001 — DB connected, 19 routes registered', '{\"ip_address\":\"192.168.1.122\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/system/start\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.292Z\"}', '2026-03-21 10:17:12'),
(1014, 73, 'REPORT_SUBMIT', 'Submitted report: \"Risk Assessment Report\" for review', '{\"ip_address\":\"192.168.1.76\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/reports/277\",\"method\":\"GET\",\"timestamp\":\"2026-03-25T07:42:22.290Z\",\"report_id\":277}', '2026-03-21 01:09:30'),
(1015, 70, 'TASK_COMPLETE', 'Completed task: \"Review server backups\" (ID 283) ahead of schedule', '{\"ip_address\":\"192.168.1.118\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/tasks/283\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:42:22.292Z\",\"task_id\":283}', '2026-02-23 15:06:43'),
(1016, 66, 'MEETING_END', 'Ended meeting: \"Annual Planning Workshop\" — duration 51 minutes', '{\"ip_address\":\"192.168.1.187\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/meetings/41\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.293Z\",\"meeting_id\":41}', '2026-02-27 06:38:24'),
(1017, 50, 'PERMISSION_UPDATE', 'Updated permissions for role \"Expert\" — toggled access to [Settings, Plans]', '{\"ip_address\":\"192.168.1.91\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/menu-permissions\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.291Z\",\"role\":\"Expert\",\"menu\":\"Settings\"}', '2026-02-28 21:23:35'),
(1018, 58, 'PLAN_UPDATE', 'Updated plan: \"Legal Compliance Review Plan\" — revised budget & timeline', '{\"ip_address\":\"192.168.1.119\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/plans/370\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:42:22.289Z\",\"plan_id\":370}', '2026-02-23 04:56:19'),
(1019, 55, 'MENU_DELETE', 'Deleted menu item \"Plans\" and cleaned up role_permissions', '{\"ip_address\":\"192.168.1.115\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/menu-permissions\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.291Z\",\"role\":\"Team Leader\",\"menu\":\"Plans\"}', '2026-03-17 13:25:51'),
(1020, 44, 'MEETING_CREATE', 'Scheduled meeting: \"Q2 Strategy Meeting\" — 12 attendees invited', '{\"ip_address\":\"192.168.1.65\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/meetings/65\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.293Z\",\"meeting_id\":65}', '2026-03-13 00:51:36'),
(1021, 70, 'ROLE_CREATE', 'Created new role: \"Staff Level 3\"', '{\"ip_address\":\"192.168.1.98\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/menu-permissions\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.291Z\",\"role\":\"Staff\",\"menu\":\"Admin Panel\"}', '2026-03-23 03:01:28'),
(1022, 72, 'PLAN_SUBMIT', 'Submitted plan: \"Legal Compliance Review Plan\" for approval', '{\"ip_address\":\"192.168.1.195\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/plans/295\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:42:22.289Z\",\"plan_id\":295}', '2026-03-15 08:29:29'),
(1023, 78, 'ROLE_UPDATE', 'Updated role \"Expert\" — renamed & permission set revised', '{\"ip_address\":\"192.168.1.77\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/menu-permissions\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.291Z\",\"role\":\"Expert\",\"menu\":\"Dashboard\"}', '2026-03-20 19:17:44'),
(1024, 37, 'TASK_COMPLETE', 'Completed task: \"Update employee records\" (ID 274) ahead of schedule', '{\"ip_address\":\"192.168.1.43\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/tasks/274\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:42:22.292Z\",\"task_id\":274}', '2026-03-21 07:17:21'),
(1025, 42, 'SYSTEM_ERROR', 'Unhandled exception in /api/plans/approve — JWT expired', '{\"ip_address\":\"192.168.1.37\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/system/errors\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.292Z\"}', '2026-02-25 02:16:20'),
(1026, 49, 'REPORT_UPDATE', 'Updated report: \"Monthly Employee Performance\" — added Q3 data', '{\"ip_address\":\"192.168.1.140\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/reports/435\",\"method\":\"GET\",\"timestamp\":\"2026-03-25T07:42:22.290Z\",\"report_id\":435}', '2026-03-13 04:36:22'),
(1027, 41, 'DATA_EXPORT', 'Data exported: plans table — 1918 rows as CSV', '{\"ip_address\":\"192.168.1.96\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/admin/export\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.292Z\"}', '2026-02-28 07:36:49'),
(1028, 54, 'MENU_DELETE', 'Deleted menu item \"Plans\" and cleaned up role_permissions', '{\"ip_address\":\"192.168.1.156\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/menu-permissions\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.291Z\",\"role\":\"Team Leader\",\"menu\":\"Plans\"}', '2026-03-19 07:35:31'),
(1029, 61, 'TASK_DELETE', 'Deleted task: \"Complete security audit\" (ID 151) — cancelled', '{\"ip_address\":\"192.168.1.183\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/tasks/151\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:42:22.292Z\",\"task_id\":151}', '2026-03-06 19:12:24'),
(1030, 39, 'REPORT_DELETE', 'Deleted report: \"IT Incident Response Report\" (ID 385)', '{\"ip_address\":\"192.168.1.16\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/reports/385\",\"method\":\"GET\",\"timestamp\":\"2026-03-25T07:42:22.290Z\",\"report_id\":385}', '2026-03-02 09:45:16'),
(1031, 51, 'TASK_UPDATE', 'Updated task: \"Deploy hotfix to production\" — changed deadline & priority', '{\"ip_address\":\"192.168.1.148\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/tasks/31\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:42:22.291Z\",\"task_id\":31}', '2026-03-18 13:47:14'),
(1032, 58, 'REPORT_DECLINE', 'Declined report: \"Risk Assessment Report\" — data inconsistency', '{\"ip_address\":\"192.168.1.141\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/reports/475\",\"method\":\"GET\",\"timestamp\":\"2026-03-25T07:42:22.290Z\",\"report_id\":475}', '2026-03-07 18:11:33'),
(1033, 30, 'PERMISSION_UPDATE', 'Updated permissions for role \"Team Leader\" — toggled access to [Reports, Plans]', '{\"ip_address\":\"192.168.1.18\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/menu-permissions\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.291Z\",\"role\":\"Team Leader\",\"menu\":\"Reports\"}', '2026-03-07 01:43:39'),
(1034, 59, 'MEETING_CREATE', 'Scheduled meeting: \"Q2 Strategy Meeting\" — 10 attendees invited', '{\"ip_address\":\"192.168.1.76\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/meetings/83\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.293Z\",\"meeting_id\":83}', '2026-03-21 22:10:23'),
(1035, 44, 'REPORT_VIEW', 'Viewed report: \"Q1 Financial Summary Report\"', '{\"ip_address\":\"192.168.1.71\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/reports/291\",\"method\":\"GET\",\"timestamp\":\"2026-03-25T07:42:22.289Z\",\"report_id\":291}', '2026-03-08 01:53:42'),
(1036, 69, 'ROLE_CREATE', 'Created new role: \"Staff Level 3\"', '{\"ip_address\":\"192.168.1.150\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/menu-permissions\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.291Z\",\"role\":\"Staff\",\"menu\":\"Tasks\"}', '2026-03-13 14:29:53'),
(1037, 56, 'TASK_COMPLETE', 'Completed task: \"Deploy hotfix to production\" (ID 107) ahead of schedule', '{\"ip_address\":\"192.168.1.86\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/tasks/107\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:42:22.292Z\",\"task_id\":107}', '2026-03-23 12:48:02'),
(1038, 26, 'PLAN_UPDATE', 'Updated plan: \"Marketing Strategy 2026\" — revised budget & timeline', '{\"ip_address\":\"192.168.1.86\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/plans/145\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:42:22.289Z\",\"plan_id\":145}', '2026-03-06 11:51:27'),
(1039, 55, 'PLAN_DECLINE', 'Declined plan: \"Annual IT Infrastructure Upgrade\" — insufficient detail', '{\"ip_address\":\"192.168.1.143\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/plans/205\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:42:22.289Z\",\"plan_id\":205}', '2026-03-21 02:09:37'),
(1040, 26, 'MEETING_POSTPONE', 'Postponed meeting: \"Budget Review Session\" to next week', '{\"ip_address\":\"192.168.1.53\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/meetings/15\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.293Z\",\"meeting_id\":15}', '2026-03-09 12:17:20'),
(1041, 67, 'ROLE_UPDATE', 'Updated role \"Expert\" — renamed & permission set revised', '{\"ip_address\":\"192.168.1.54\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/menu-permissions\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.291Z\",\"role\":\"Expert\",\"menu\":\"Tasks\"}', '2026-03-22 19:28:55'),
(1042, 76, 'DATA_EXPORT', 'Scheduled database backup completed — 148 MB archived', '{\"ip_address\":\"192.168.1.120\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/admin/backup\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.293Z\"}', '2026-03-24 03:52:20'),
(1043, 76, 'TASK_DELETE', 'Deleted task: \"Update employee records\" (ID 71) — cancelled', '{\"ip_address\":\"192.168.1.114\",\"user_agent\":\"Mozilla/5.0 (X11; Linux x86_64) Firefox/125\",\"endpoint\":\"/api/tasks/71\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:42:22.292Z\",\"task_id\":71}', '2026-03-07 04:17:35'),
(1044, 79, 'REPORT_CREATE', 'Created report: \"Monthly Employee Performance\"', '{\"ip_address\":\"192.168.1.97\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/reports/664\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.290Z\",\"report_id\":664}', '2026-03-10 15:29:12'),
(1045, 51, 'TASK_COMPLETE', 'Completed task: \"Complete security audit\" (ID 170) ahead of schedule', '{\"ip_address\":\"192.168.1.110\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/tasks/170\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:42:22.292Z\",\"task_id\":170}', '2026-03-09 07:00:55'),
(1046, 56, 'PLAN_DECLINE', 'Declined plan: \"HR Onboarding Automation\" — insufficient detail', '{\"ip_address\":\"192.168.1.44\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/plans/176\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:42:22.288Z\",\"plan_id\":176}', '2026-03-14 18:56:05'),
(1047, 52, 'REPORT_DELETE', 'Deleted report: \"Q1 Financial Summary Report\" (ID 589)', '{\"ip_address\":\"192.168.1.36\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/reports/589\",\"method\":\"GET\",\"timestamp\":\"2026-03-25T07:42:22.289Z\",\"report_id\":589}', '2026-02-28 16:03:31'),
(1048, 73, 'REPORT_APPROVE', 'Approved report: \"Construction Progress Report\"', '{\"ip_address\":\"192.168.1.174\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/reports/573\",\"method\":\"GET\",\"timestamp\":\"2026-03-25T07:42:22.289Z\",\"report_id\":573}', '2026-03-24 08:19:35'),
(1049, 64, 'SETTINGS_CHANGE', 'System setting changed: backup_schedule updated', '{\"ip_address\":\"192.168.1.65\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/settings\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.293Z\"}', '2026-03-09 10:42:18'),
(1050, 75, 'TASK_COMPLETE', 'Completed task: \"Deploy hotfix to production\" (ID 253) ahead of schedule', '{\"ip_address\":\"192.168.1.151\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/tasks/253\",\"method\":\"PUT\",\"timestamp\":\"2026-03-25T07:42:22.292Z\",\"task_id\":253}', '2026-03-07 00:18:59'),
(1051, NULL, 'SETTINGS_CHANGE', 'System setting changed: backup_schedule updated', '{\"ip_address\":\"192.168.1.134\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/settings\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.293Z\"}', '2026-03-11 07:02:48'),
(1052, 72, 'SYSTEM_ERROR', 'Unhandled exception in /api/reports — DB connection lost', '{\"ip_address\":\"192.168.1.74\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/system/errors\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.292Z\"}', '2026-03-21 03:06:36'),
(1053, 67, 'MEETING_CREATE', 'Scheduled meeting: \"IT Daily Standup\" — 10 attendees invited', '{\"ip_address\":\"192.168.1.66\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/meetings/17\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.293Z\",\"meeting_id\":17}', '2026-03-20 12:22:59'),
(1054, 26, 'TASK_CREATE', 'Created task: \"Review server backups\" assigned to team', '{\"ip_address\":\"192.168.1.181\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124\",\"endpoint\":\"/api/tasks/202\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.292Z\",\"task_id\":202}', '2026-03-02 23:34:34'),
(1055, 49, 'SYSTEM_ERROR', 'Unhandled exception in /api/plans/approve — Null reference', '{\"ip_address\":\"192.168.1.195\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605\",\"endpoint\":\"/api/system/errors\",\"method\":\"POST\",\"timestamp\":\"2026-03-25T07:42:22.292Z\"}', '2026-03-05 09:43:55'),
(1056, 40, 'LOGOUT', 'User ezira@itpark.et logged out', '{\"user_id\":\"40\",\"username\":\"ezira@itpark.et\",\"employee_name\":\"Ezira\",\"logout_time\":\"2026-03-25T07:55:21.413Z\",\"timestamp\":\"2026-03-25T07:55:21.413Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/40\",\"method\":\"PUT\"}', '2026-03-25 07:55:21'),
(1057, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":null,\"login_time\":\"2026-03-25T08:14:06.413Z\",\"timestamp\":\"2026-03-25T08:14:06.413Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-03-25 08:14:06'),
(1058, 40, 'LOGOUT', 'User ezira@itpark.et logged out', '{\"user_id\":\"40\",\"username\":\"ezira@itpark.et\",\"employee_name\":\"Ezira\",\"logout_time\":\"2026-03-25T10:52:15.280Z\",\"timestamp\":\"2026-03-25T10:52:15.281Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/40\",\"method\":\"PUT\"}', '2026-03-25 10:52:15'),
(1059, NULL, 'LOGIN_FAILED', 'Login failed: User not found - ewunetu@itp.et', '{\"username\":\"ewunetu@itp.et\",\"reason\":\"user_not_found\",\"timestamp\":\"2026-04-07T16:30:59.927Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-04-07 16:30:59'),
(1060, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":null,\"login_time\":\"2026-04-07T16:31:09.845Z\",\"timestamp\":\"2026-04-07T16:31:09.845Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-04-07 16:31:09'),
(1061, 40, 'LOGOUT', 'User ezira@itpark.et logged out', '{\"user_id\":\"40\",\"username\":\"ezira@itpark.et\",\"employee_name\":\"Ezira\",\"logout_time\":\"2026-04-07T16:31:17.928Z\",\"timestamp\":\"2026-04-07T16:31:17.928Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/40\",\"method\":\"PUT\"}', '2026-04-07 16:31:17');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `description`, `metadata`, `created_at`) VALUES
(1062, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":null,\"login_time\":\"2026-04-07T16:31:59.512Z\",\"timestamp\":\"2026-04-07T16:31:59.512Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-04-07 16:31:59'),
(1063, 40, 'LOGOUT', 'User ezira@itpark.et logged out', '{\"user_id\":\"40\",\"username\":\"ezira@itpark.et\",\"employee_name\":\"Ezira\",\"logout_time\":\"2026-04-07T16:32:37.328Z\",\"timestamp\":\"2026-04-07T16:32:37.328Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/40\",\"method\":\"PUT\"}', '2026-04-07 16:32:37'),
(1064, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":null,\"login_time\":\"2026-04-07T16:37:01.096Z\",\"timestamp\":\"2026-04-07T16:37:01.096Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-04-07 16:37:01'),
(1065, 40, 'LOGOUT', 'User ezira@itpark.et logged out', '{\"user_id\":\"40\",\"username\":\"ezira@itpark.et\",\"employee_name\":\"Ezira\",\"logout_time\":\"2026-04-07T16:58:24.654Z\",\"timestamp\":\"2026-04-07T16:58:24.654Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/40\",\"method\":\"PUT\"}', '2026-04-07 16:58:24'),
(1066, 79, 'LOGIN', 'User Milliongoraw@gmail.com logged in successfully', '{\"username\":\"Milliongoraw@gmail.com\",\"user_id\":79,\"role_id\":6,\"employee_id\":152,\"employee_name\":\"Million  Goraw\",\"department_id\":null,\"login_time\":\"2026-04-07T16:58:31.863Z\",\"timestamp\":\"2026-04-07T16:58:31.863Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-04-07 16:58:31'),
(1067, 79, 'LOGOUT', 'User Milliongoraw@gmail.com logged out', '{\"user_id\":\"79\",\"username\":\"Milliongoraw@gmail.com\",\"employee_name\":\"Million  Goraw\",\"logout_time\":\"2026-04-07T17:08:30.221Z\",\"timestamp\":\"2026-04-07T17:08:30.221Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/79\",\"method\":\"PUT\"}', '2026-04-07 17:08:30'),
(1068, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":null,\"login_time\":\"2026-04-07T17:08:38.721Z\",\"timestamp\":\"2026-04-07T17:08:38.721Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-04-07 17:08:38'),
(1069, 40, 'LOGOUT', 'User ezira@itpark.et logged out', '{\"user_id\":\"40\",\"username\":\"ezira@itpark.et\",\"employee_name\":\"Ezira\",\"logout_time\":\"2026-04-07T17:09:49.934Z\",\"timestamp\":\"2026-04-07T17:09:49.934Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/40\",\"method\":\"PUT\"}', '2026-04-07 17:09:49'),
(1070, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":null,\"login_time\":\"2026-07-12T09:28:35.656Z\",\"timestamp\":\"2026-07-12T09:28:35.656Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-07-12 09:28:35'),
(1071, 40, 'LOGOUT', 'User ezira@itpark.et logged out', '{\"user_id\":\"40\",\"username\":\"ezira@itpark.et\",\"employee_name\":\"Ezira\",\"logout_time\":\"2026-07-12T09:30:34.498Z\",\"timestamp\":\"2026-07-12T09:30:34.498Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/40\",\"method\":\"PUT\"}', '2026-07-12 09:30:34'),
(1072, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":null,\"login_time\":\"2026-07-12T09:33:38.774Z\",\"timestamp\":\"2026-07-12T09:33:38.774Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-07-12 09:33:38'),
(1074, 25, 'LOGIN', 'User olana@itp.et logged in successfully', '{\"username\":\"olana@itp.et\",\"user_id\":25,\"role_id\":2,\"employee_id\":72,\"employee_name\":\"Olana\",\"department_id\":2,\"login_time\":\"2026-07-12T10:13:07.480Z\",\"timestamp\":\"2026-07-12T10:13:07.480Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-07-12 10:13:07'),
(1075, 40, 'LOGOUT', 'User ezira@itpark.et logged out', '{\"user_id\":\"40\",\"username\":\"ezira@itpark.et\",\"employee_name\":\"Ezira\",\"logout_time\":\"2026-07-15T08:08:49.553Z\",\"timestamp\":\"2026-07-15T08:08:49.553Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/40\",\"method\":\"PUT\"}', '2026-07-15 08:08:49'),
(1076, 80, 'LOGIN', 'User feruzkorichoyimer@gmail.com logged in successfully', '{\"username\":\"feruzkorichoyimer@gmail.com\",\"user_id\":80,\"role_id\":9,\"employee_id\":153,\"employee_name\":\"feruz  koricho\",\"department_id\":null,\"login_time\":\"2026-07-15T08:08:57.576Z\",\"timestamp\":\"2026-07-15T08:08:57.576Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-07-15 08:08:57'),
(1077, 80, 'LOGOUT', 'User feruzkorichoyimer@gmail.com logged out', '{\"user_id\":\"80\",\"username\":\"feruzkorichoyimer@gmail.com\",\"employee_name\":\"feruz  koricho\",\"logout_time\":\"2026-07-15T08:09:06.073Z\",\"timestamp\":\"2026-07-15T08:09:06.073Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/80\",\"method\":\"PUT\"}', '2026-07-15 08:09:06'),
(1078, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":null,\"login_time\":\"2026-07-15T08:09:11.307Z\",\"timestamp\":\"2026-07-15T08:09:11.307Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-07-15 08:09:11'),
(1079, 40, 'LOGOUT', 'User ezira@itpark.et logged out', '{\"user_id\":\"40\",\"username\":\"ezira@itpark.et\",\"employee_name\":\"Ezira\",\"logout_time\":\"2026-07-15T08:11:51.758Z\",\"timestamp\":\"2026-07-15T08:11:51.758Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/40\",\"method\":\"PUT\"}', '2026-07-15 08:11:51'),
(1080, 80, 'LOGIN', 'User feruzkorichoyimer@gmail.com logged in successfully', '{\"username\":\"feruzkorichoyimer@gmail.com\",\"user_id\":80,\"role_id\":9,\"employee_id\":153,\"employee_name\":\"feruz  koricho\",\"department_id\":null,\"login_time\":\"2026-07-15T08:12:00.120Z\",\"timestamp\":\"2026-07-15T08:12:00.120Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-07-15 08:12:00'),
(1081, 25, 'LOGOUT', 'User olana@itp.et logged out', '{\"user_id\":\"25\",\"username\":\"olana@itp.et\",\"employee_name\":\"Olana\",\"logout_time\":\"2026-07-15T08:12:21.508Z\",\"timestamp\":\"2026-07-15T08:12:21.508Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/25\",\"method\":\"PUT\"}', '2026-07-15 08:12:21'),
(1082, 80, 'LOGIN', 'User feruzkorichoyimer@gmail.com logged in successfully', '{\"username\":\"feruzkorichoyimer@gmail.com\",\"user_id\":80,\"role_id\":9,\"employee_id\":153,\"employee_name\":\"feruz  koricho\",\"department_id\":null,\"login_time\":\"2026-07-15T08:12:29.109Z\",\"timestamp\":\"2026-07-15T08:12:29.109Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-07-15 08:12:29'),
(1083, 80, 'LOGIN_FAILED', 'Login failed: Invalid credentials or inactive account for feruzkorichoyimer@gmail.com', '{\"username\":\"feruzkorichoyimer@gmail.com\",\"user_id\":80,\"reason\":\"invalid_password\",\"user_status\":\"1\",\"timestamp\":\"2026-07-15T08:20:18.326Z\",\"ip_address\":\"172.21.96.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-07-15 08:20:18'),
(1084, 80, 'LOGOUT', 'User feruzkorichoyimer@gmail.com logged out', '{\"user_id\":\"80\",\"username\":\"feruzkorichoyimer@gmail.com\",\"employee_name\":\"feruz  koricho\",\"logout_time\":\"2026-07-15T08:20:30.863Z\",\"timestamp\":\"2026-07-15T08:20:30.863Z\",\"ip_address\":\"172.21.96.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/80\",\"method\":\"PUT\"}', '2026-07-15 08:20:30'),
(1085, 80, 'LOGIN', 'User feruzkorichoyimer@gmail.com logged in successfully', '{\"username\":\"feruzkorichoyimer@gmail.com\",\"user_id\":80,\"role_id\":9,\"employee_id\":153,\"employee_name\":\"feruz  koricho\",\"department_id\":null,\"login_time\":\"2026-07-15T08:20:48.211Z\",\"timestamp\":\"2026-07-15T08:20:48.211Z\",\"ip_address\":\"172.21.96.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-07-15 08:20:48'),
(1086, 80, 'LOGIN', 'User feruzkorichoyimer@gmail.com logged in successfully', '{\"username\":\"feruzkorichoyimer@gmail.com\",\"user_id\":80,\"role_id\":9,\"employee_id\":153,\"employee_name\":\"feruz  koricho\",\"department_id\":null,\"login_time\":\"2026-07-15T08:20:56.944Z\",\"timestamp\":\"2026-07-15T08:20:56.944Z\",\"ip_address\":\"172.21.96.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-07-15 08:20:56'),
(1087, 80, 'LOGIN', 'User feruzkorichoyimer@gmail.com logged in successfully', '{\"username\":\"feruzkorichoyimer@gmail.com\",\"user_id\":80,\"role_id\":9,\"employee_id\":153,\"employee_name\":\"feruz  koricho\",\"department_id\":null,\"login_time\":\"2026-07-15T08:27:49.595Z\",\"timestamp\":\"2026-07-15T08:27:49.595Z\",\"ip_address\":\"192.168.0.178\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-07-15 08:27:49'),
(1088, 80, 'LOGOUT', 'User feruzkorichoyimer@gmail.com logged out', '{\"user_id\":\"80\",\"username\":\"feruzkorichoyimer@gmail.com\",\"employee_name\":\"feruz  koricho\",\"logout_time\":\"2026-07-15T08:38:41.925Z\",\"timestamp\":\"2026-07-15T08:38:41.925Z\",\"ip_address\":\"192.168.0.223\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/80\",\"method\":\"PUT\"}', '2026-07-15 08:38:41'),
(1089, 80, 'LOGOUT', 'User feruzkorichoyimer@gmail.com logged out', '{\"user_id\":\"80\",\"username\":\"feruzkorichoyimer@gmail.com\",\"employee_name\":\"feruz  koricho\",\"logout_time\":\"2026-07-15T08:39:49.673Z\",\"timestamp\":\"2026-07-15T08:39:49.673Z\",\"ip_address\":\"192.168.0.223\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/80\",\"method\":\"PUT\"}', '2026-07-15 08:39:49'),
(1090, NULL, 'LOGIN_FAILED', 'Login failed: User not found - ezira@itpark.et	', '{\"username\":\"ezira@itpark.et\\t\",\"reason\":\"user_not_found\",\"timestamp\":\"2026-07-15T08:39:56.629Z\",\"ip_address\":\"192.168.0.223\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-07-15 08:39:56'),
(1091, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":null,\"login_time\":\"2026-07-15T08:40:00.606Z\",\"timestamp\":\"2026-07-15T08:40:00.606Z\",\"ip_address\":\"192.168.0.223\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-07-15 08:40:00'),
(1092, 80, 'LOGOUT', 'User feruzkorichoyimer@gmail.com logged out', '{\"user_id\":\"80\",\"username\":\"feruzkorichoyimer@gmail.com\",\"employee_name\":\"feruz  koricho\",\"logout_time\":\"2026-07-31T07:56:53.478Z\",\"timestamp\":\"2026-07-31T07:56:53.478Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/80\",\"method\":\"PUT\"}', '2026-07-31 07:56:53'),
(1093, 73, 'LOGIN', 'User tsehayu@itp.et logged in successfully', '{\"username\":\"tsehayu@itp.et\",\"user_id\":73,\"role_id\":5,\"employee_id\":146,\"employee_name\":\"tsuhayu directorate\",\"department_id\":11,\"login_time\":\"2026-07-31T07:56:59.519Z\",\"timestamp\":\"2026-07-31T07:56:59.520Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-07-31 07:56:59'),
(1094, 73, 'LOGOUT', 'User tsehayu@itp.et logged out', '{\"user_id\":\"73\",\"username\":\"tsehayu@itp.et\",\"employee_name\":\"tsuhayu directorate\",\"logout_time\":\"2026-07-31T09:14:26.256Z\",\"timestamp\":\"2026-07-31T09:14:26.256Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/73\",\"method\":\"PUT\"}', '2026-07-31 09:14:26'),
(1095, 80, 'LOGIN', 'User feruzkorichoyimer@gmail.com logged in successfully', '{\"username\":\"feruzkorichoyimer@gmail.com\",\"user_id\":80,\"role_id\":9,\"employee_id\":153,\"employee_name\":\"feruz  koricho\",\"department_id\":50,\"login_time\":\"2026-07-31T09:14:34.647Z\",\"timestamp\":\"2026-07-31T09:14:34.647Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-07-31 09:14:34'),
(1096, 80, 'LOGOUT', 'User feruzkorichoyimer@gmail.com logged out', '{\"user_id\":\"80\",\"username\":\"feruzkorichoyimer@gmail.com\",\"employee_name\":\"feruz  koricho\",\"logout_time\":\"2026-07-31T17:37:48.146Z\",\"timestamp\":\"2026-07-31T17:37:48.146Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/80\",\"method\":\"PUT\"}', '2026-07-31 17:37:48'),
(1097, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":null,\"login_time\":\"2026-08-02T17:41:06.851Z\",\"timestamp\":\"2026-08-02T17:41:06.851Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-02 17:41:06'),
(1098, 40, 'LOGOUT', 'User ezira@itpark.et logged out', '{\"user_id\":\"40\",\"username\":\"ezira@itpark.et\",\"employee_name\":\"Ezira\",\"logout_time\":\"2026-08-02T17:41:57.156Z\",\"timestamp\":\"2026-08-02T17:41:57.156Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/40\",\"method\":\"PUT\"}', '2026-08-02 17:41:57'),
(1099, 80, 'LOGIN', 'User feruzkorichoyimer@gmail.com logged in successfully', '{\"username\":\"feruzkorichoyimer@gmail.com\",\"user_id\":80,\"role_id\":9,\"employee_id\":153,\"employee_name\":\"feruz  koricho\",\"department_id\":50,\"login_time\":\"2026-08-02T17:42:07.945Z\",\"timestamp\":\"2026-08-02T17:42:07.945Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-02 17:42:08'),
(1100, 80, 'LOGOUT', 'User feruzkorichoyimer@gmail.com logged out', '{\"user_id\":\"80\",\"username\":\"feruzkorichoyimer@gmail.com\",\"employee_name\":\"feruz  koricho\",\"logout_time\":\"2026-08-02T17:53:02.586Z\",\"timestamp\":\"2026-08-02T17:53:02.586Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/80\",\"method\":\"PUT\"}', '2026-08-02 17:53:02'),
(1101, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":null,\"login_time\":\"2026-08-02T17:53:13.969Z\",\"timestamp\":\"2026-08-02T17:53:13.969Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-02 17:53:13'),
(1102, 40, 'LOGOUT', 'User ezira@itpark.et logged out', '{\"user_id\":\"40\",\"username\":\"ezira@itpark.et\",\"employee_name\":\"Ezira\",\"logout_time\":\"2026-08-02T17:57:30.093Z\",\"timestamp\":\"2026-08-02T17:57:30.093Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/40\",\"method\":\"PUT\"}', '2026-08-02 17:57:30'),
(1103, 80, 'LOGIN', 'User feruzkorichoyimer@gmail.com logged in successfully', '{\"username\":\"feruzkorichoyimer@gmail.com\",\"user_id\":80,\"role_id\":9,\"employee_id\":153,\"employee_name\":\"feruz  koricho\",\"department_id\":50,\"login_time\":\"2026-08-02T17:57:39.365Z\",\"timestamp\":\"2026-08-02T17:57:39.365Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-02 17:57:39'),
(1104, 80, 'LOGOUT', 'User feruzkorichoyimer@gmail.com logged out', '{\"user_id\":\"80\",\"username\":\"feruzkorichoyimer@gmail.com\",\"employee_name\":\"feruz  koricho\",\"logout_time\":\"2026-08-02T18:25:47.605Z\",\"timestamp\":\"2026-08-02T18:25:47.606Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/80\",\"method\":\"PUT\"}', '2026-08-02 18:25:47'),
(1105, 80, 'LOGIN', 'User feruzkorichoyimer@gmail.com logged in successfully', '{\"username\":\"feruzkorichoyimer@gmail.com\",\"user_id\":80,\"role_id\":9,\"employee_id\":153,\"employee_name\":\"feruz  koricho\",\"department_id\":50,\"login_time\":\"2026-08-02T18:25:49.801Z\",\"timestamp\":\"2026-08-02T18:25:49.801Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-02 18:25:49'),
(1106, 40, 'LOGIN_FAILED', 'Login failed: Invalid credentials or inactive account for ezira@itpark.et', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"reason\":\"invalid_password\",\"user_status\":\"1\",\"timestamp\":\"2026-08-05T06:49:52.858Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-05 06:49:52'),
(1107, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":null,\"login_time\":\"2026-08-05T06:49:58.513Z\",\"timestamp\":\"2026-08-05T06:49:58.513Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-05 06:49:58'),
(1108, 25, 'LOGOUT', 'User olana@itp.et logged out', '{\"user_id\":\"25\",\"username\":\"olana@itp.et\",\"employee_name\":\"Olana\",\"logout_time\":\"2026-08-07T12:58:13.598Z\",\"timestamp\":\"2026-08-07T12:58:13.599Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/25\",\"method\":\"PUT\"}', '2026-08-07 12:58:13'),
(1109, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":null,\"login_time\":\"2026-08-07T12:58:19.942Z\",\"timestamp\":\"2026-08-07T12:58:19.942Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-07 12:58:19'),
(1110, 40, 'LOGOUT', 'User ezira@itpark.et logged out', '{\"user_id\":\"40\",\"username\":\"ezira@itpark.et\",\"employee_name\":\"Ezira\",\"logout_time\":\"2026-08-07T13:02:16.455Z\",\"timestamp\":\"2026-08-07T13:02:16.455Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/40\",\"method\":\"PUT\"}', '2026-08-07 13:02:16'),
(1111, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":null,\"login_time\":\"2026-08-07T13:02:21.868Z\",\"timestamp\":\"2026-08-07T13:02:21.868Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-07 13:02:21'),
(1112, 40, 'LOGOUT', 'User ezira@itpark.et logged out', '{\"user_id\":\"40\",\"username\":\"ezira@itpark.et\",\"employee_name\":\"Ezira\",\"logout_time\":\"2026-08-07T13:02:45.285Z\",\"timestamp\":\"2026-08-07T13:02:45.285Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/40\",\"method\":\"PUT\"}', '2026-08-07 13:02:45'),
(1113, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":null,\"login_time\":\"2026-08-07T13:02:55.021Z\",\"timestamp\":\"2026-08-07T13:02:55.021Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-07 13:02:55'),
(1114, 40, 'LOGOUT', 'User ezira@itpark.et logged out', '{\"user_id\":\"40\",\"username\":\"ezira@itpark.et\",\"employee_name\":\"Ezira\",\"logout_time\":\"2026-08-07T13:04:04.580Z\",\"timestamp\":\"2026-08-07T13:04:04.580Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/40\",\"method\":\"PUT\"}', '2026-08-07 13:04:04'),
(1115, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":null,\"login_time\":\"2026-08-07T13:04:30.731Z\",\"timestamp\":\"2026-08-07T13:04:30.731Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-07 13:04:30'),
(1116, 25, 'LOGIN', 'User olana@itp.et logged in successfully', '{\"username\":\"olana@itp.et\",\"user_id\":25,\"role_id\":2,\"employee_id\":72,\"employee_name\":\"Olana\",\"department_id\":2,\"login_time\":\"2026-08-07T13:05:35.416Z\",\"timestamp\":\"2026-08-07T13:05:35.416Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-07 13:05:35'),
(1117, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":null,\"login_time\":\"2026-08-07T13:25:30.963Z\",\"timestamp\":\"2026-08-07T13:25:30.964Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-07 13:25:30'),
(1118, 40, 'LOGOUT', 'User ezira@itpark.et logged out', '{\"user_id\":\"40\",\"username\":\"ezira@itpark.et\",\"employee_name\":\"Ezira\",\"logout_time\":\"2026-08-07T13:36:03.505Z\",\"timestamp\":\"2026-08-07T13:36:03.505Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/40\",\"method\":\"PUT\"}', '2026-08-07 13:36:03'),
(1119, 25, 'LOGIN', 'User olana@itp.et logged in successfully', '{\"username\":\"olana@itp.et\",\"user_id\":25,\"role_id\":2,\"employee_id\":72,\"employee_name\":\"Olana\",\"department_id\":2,\"login_time\":\"2026-08-07T13:36:06.312Z\",\"timestamp\":\"2026-08-07T13:36:06.312Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-07 13:36:06'),
(1120, 25, 'LOGOUT', 'User olana@itp.et logged out', '{\"user_id\":\"25\",\"username\":\"olana@itp.et\",\"employee_name\":\"Olana\",\"logout_time\":\"2026-08-07T13:38:59.609Z\",\"timestamp\":\"2026-08-07T13:38:59.609Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/25\",\"method\":\"PUT\"}', '2026-08-07 13:38:59'),
(1121, 79, 'LOGIN', 'User milliongoraw@gmail.com logged in successfully', '{\"username\":\"milliongoraw@gmail.com\",\"user_id\":79,\"role_id\":6,\"employee_id\":152,\"employee_name\":\"Million  Goraw\",\"department_id\":null,\"login_time\":\"2026-08-07T13:39:04.779Z\",\"timestamp\":\"2026-08-07T13:39:04.779Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-07 13:39:04'),
(1122, 79, 'LOGIN', 'User milliongoraw@gmail.com logged in successfully', '{\"username\":\"milliongoraw@gmail.com\",\"user_id\":79,\"role_id\":6,\"employee_id\":152,\"employee_name\":\"Million  Goraw\",\"department_id\":null,\"login_time\":\"2026-08-08T04:49:17.987Z\",\"timestamp\":\"2026-08-08T04:49:17.988Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-08 04:49:17'),
(1123, 79, 'LOGOUT', 'User Milliongoraw@gmail.com logged out', '{\"user_id\":\"79\",\"username\":\"Milliongoraw@gmail.com\",\"employee_name\":\"Million  Goraw\",\"logout_time\":\"2026-08-08T04:51:35.722Z\",\"timestamp\":\"2026-08-08T04:51:35.722Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/79\",\"method\":\"PUT\"}', '2026-08-08 04:51:35'),
(1124, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":null,\"login_time\":\"2026-08-08T04:51:40.481Z\",\"timestamp\":\"2026-08-08T04:51:40.481Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-08 04:51:40'),
(1125, 40, 'LOGOUT', 'User ezira@itpark.et logged out', '{\"user_id\":\"40\",\"username\":\"ezira@itpark.et\",\"employee_name\":\"Ezira\",\"logout_time\":\"2026-08-08T04:57:43.648Z\",\"timestamp\":\"2026-08-08T04:57:43.648Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/40\",\"method\":\"PUT\"}', '2026-08-08 04:57:43'),
(1126, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":null,\"login_time\":\"2026-08-08T04:57:50.819Z\",\"timestamp\":\"2026-08-08T04:57:50.819Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-08 04:57:50'),
(1127, 40, 'LOGOUT', 'User ezira@itpark.et logged out', '{\"user_id\":\"40\",\"username\":\"ezira@itpark.et\",\"employee_name\":\"Ezira\",\"logout_time\":\"2026-08-08T05:05:41.847Z\",\"timestamp\":\"2026-08-08T05:05:41.847Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/40\",\"method\":\"PUT\"}', '2026-08-08 05:05:41'),
(1128, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":null,\"login_time\":\"2026-08-08T05:05:43.461Z\",\"timestamp\":\"2026-08-08T05:05:43.461Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-08 05:05:43'),
(1129, 40, 'LOGOUT', 'User ezira@itpark.et logged out', '{\"user_id\":\"40\",\"username\":\"ezira@itpark.et\",\"employee_name\":\"Ezira\",\"logout_time\":\"2026-08-08T05:12:54.797Z\",\"timestamp\":\"2026-08-08T05:12:54.797Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/40\",\"method\":\"PUT\"}', '2026-08-08 05:12:54'),
(1130, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":null,\"login_time\":\"2026-08-08T05:13:10.157Z\",\"timestamp\":\"2026-08-08T05:13:10.157Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-08 05:13:10'),
(1131, 40, 'LOGOUT', 'User ezira@itpark.et logged out', '{\"user_id\":\"40\",\"username\":\"ezira@itpark.et\",\"employee_name\":\"Ezira\",\"logout_time\":\"2026-08-08T05:14:48.120Z\",\"timestamp\":\"2026-08-08T05:14:48.120Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/40\",\"method\":\"PUT\"}', '2026-08-08 05:14:48'),
(1132, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":null,\"login_time\":\"2026-08-08T05:15:18.837Z\",\"timestamp\":\"2026-08-08T05:15:18.837Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-08 05:15:18'),
(1133, 40, 'LOGOUT', 'User ezira@itpark.et logged out', '{\"user_id\":\"40\",\"username\":\"ezira@itpark.et\",\"employee_name\":\"Ezira\",\"logout_time\":\"2026-08-08T05:19:29.050Z\",\"timestamp\":\"2026-08-08T05:19:29.050Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/40\",\"method\":\"PUT\"}', '2026-08-08 05:19:29'),
(1134, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":null,\"login_time\":\"2026-08-08T05:19:31.653Z\",\"timestamp\":\"2026-08-08T05:19:31.653Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-08 05:19:31'),
(1135, 40, 'LOGOUT', 'User ezira@itpark.et logged out', '{\"user_id\":\"40\",\"username\":\"ezira@itpark.et\",\"employee_name\":\"Ezira\",\"logout_time\":\"2026-08-08T05:23:29.101Z\",\"timestamp\":\"2026-08-08T05:23:29.101Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/40\",\"method\":\"PUT\"}', '2026-08-08 05:23:29'),
(1136, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":null,\"login_time\":\"2026-08-08T05:23:45.198Z\",\"timestamp\":\"2026-08-08T05:23:45.198Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-08 05:23:45'),
(1137, 40, 'LOGOUT', 'User ezira@itpark.et logged out', '{\"user_id\":\"40\",\"username\":\"ezira@itpark.et\",\"employee_name\":\"Ezira\",\"logout_time\":\"2026-08-08T05:26:55.284Z\",\"timestamp\":\"2026-08-08T05:26:55.284Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/40\",\"method\":\"PUT\"}', '2026-08-08 05:26:55'),
(1138, 40, 'LOGOUT', 'User ezira@itpark.et logged out', '{\"user_id\":\"40\",\"username\":\"ezira@itpark.et\",\"employee_name\":\"Ezira\",\"logout_time\":\"2026-08-08T05:27:57.532Z\",\"timestamp\":\"2026-08-08T05:27:57.532Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/40\",\"method\":\"PUT\"}', '2026-08-08 05:27:57'),
(1139, 79, 'LOGIN', 'User milliongoraw@gmail.com logged in successfully', '{\"username\":\"milliongoraw@gmail.com\",\"user_id\":79,\"role_id\":6,\"employee_id\":152,\"employee_name\":\"Million  Goraw\",\"department_id\":null,\"login_time\":\"2026-08-08T05:28:02.748Z\",\"timestamp\":\"2026-08-08T05:28:02.748Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-08 05:28:02'),
(1140, 79, 'LOGOUT', 'User Milliongoraw@gmail.com logged out', '{\"user_id\":\"79\",\"username\":\"Milliongoraw@gmail.com\",\"employee_name\":\"Million  Goraw\",\"logout_time\":\"2026-08-08T05:29:23.900Z\",\"timestamp\":\"2026-08-08T05:29:23.900Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/79\",\"method\":\"PUT\"}', '2026-08-08 05:29:23'),
(1141, 79, 'LOGIN', 'User milliongoraw@gmail.com logged in successfully', '{\"username\":\"milliongoraw@gmail.com\",\"user_id\":79,\"role_id\":6,\"employee_id\":152,\"employee_name\":\"Million  Goraw\",\"department_id\":null,\"login_time\":\"2026-08-08T05:29:27.553Z\",\"timestamp\":\"2026-08-08T05:29:27.553Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-08 05:29:27'),
(1142, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":null,\"login_time\":\"2026-08-08T05:33:27.155Z\",\"timestamp\":\"2026-08-08T05:33:27.155Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-08 05:33:27'),
(1143, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":null,\"login_time\":\"2026-08-08T07:25:57.338Z\",\"timestamp\":\"2026-08-08T07:25:57.338Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-08 07:25:57'),
(1144, 40, 'LOGOUT', 'User ezira@itpark.et logged out', '{\"user_id\":\"40\",\"username\":\"ezira@itpark.et\",\"employee_name\":\"Ezira\",\"logout_time\":\"2026-08-08T07:26:23.048Z\",\"timestamp\":\"2026-08-08T07:26:23.048Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/40\",\"method\":\"PUT\"}', '2026-08-08 07:26:23'),
(1145, 40, 'LOGOUT', 'User ezira@itpark.et logged out', '{\"user_id\":\"40\",\"username\":\"ezira@itpark.et\",\"employee_name\":\"Ezira\",\"logout_time\":\"2026-08-08T07:26:30.611Z\",\"timestamp\":\"2026-08-08T07:26:30.611Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/40\",\"method\":\"PUT\"}', '2026-08-08 07:26:30'),
(1146, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":null,\"login_time\":\"2026-08-08T07:27:48.422Z\",\"timestamp\":\"2026-08-08T07:27:48.422Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-08 07:27:48'),
(1147, 79, 'LOGOUT', 'User Milliongoraw@gmail.com logged out', '{\"user_id\":\"79\",\"username\":\"Milliongoraw@gmail.com\",\"employee_name\":\"Million  Goraw\",\"logout_time\":\"2026-08-08T07:35:49.956Z\",\"timestamp\":\"2026-08-08T07:35:49.956Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/79\",\"method\":\"PUT\"}', '2026-08-08 07:35:49'),
(1148, 73, 'LOGIN', 'User tsehayu@itp.et logged in successfully', '{\"username\":\"tsehayu@itp.et\",\"user_id\":73,\"role_id\":5,\"employee_id\":146,\"employee_name\":\"tsuhayu directorate\",\"department_id\":11,\"login_time\":\"2026-08-08T07:35:55.164Z\",\"timestamp\":\"2026-08-08T07:35:55.164Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-08 07:35:55'),
(1149, 73, 'LOGOUT', 'User tsehayu@itp.et logged out', '{\"user_id\":\"73\",\"username\":\"tsehayu@itp.et\",\"employee_name\":\"tsuhayu directorate\",\"logout_time\":\"2026-08-08T07:36:22.863Z\",\"timestamp\":\"2026-08-08T07:36:22.863Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/73\",\"method\":\"PUT\"}', '2026-08-08 07:36:22'),
(1150, 79, 'LOGIN', 'User milliongoraw@gmail.com logged in successfully', '{\"username\":\"milliongoraw@gmail.com\",\"user_id\":79,\"role_id\":6,\"employee_id\":152,\"employee_name\":\"Million  Goraw\",\"department_id\":null,\"login_time\":\"2026-08-08T07:36:30.996Z\",\"timestamp\":\"2026-08-08T07:36:30.996Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-08 07:36:31'),
(1151, 79, 'LOGIN', 'User milliongoraw@gmail.com logged in successfully', '{\"username\":\"milliongoraw@gmail.com\",\"user_id\":79,\"role_id\":6,\"employee_id\":152,\"employee_name\":\"Million  Goraw\",\"department_id\":null,\"login_time\":\"2026-08-08T17:30:12.426Z\",\"timestamp\":\"2026-08-08T17:30:12.427Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-08 17:30:12'),
(1152, 79, 'LOGOUT', 'User Milliongoraw@gmail.com logged out', '{\"user_id\":\"79\",\"username\":\"Milliongoraw@gmail.com\",\"employee_name\":\"Million  Goraw\",\"logout_time\":\"2026-08-09T06:21:49.784Z\",\"timestamp\":\"2026-08-09T06:21:49.785Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/79\",\"method\":\"PUT\"}', '2026-08-09 06:21:49'),
(1153, 73, 'LOGIN', 'User tsehayu@itp.et logged in successfully', '{\"username\":\"tsehayu@itp.et\",\"user_id\":73,\"role_id\":5,\"employee_id\":146,\"employee_name\":\"tsuhayu directorate\",\"department_id\":11,\"login_time\":\"2026-08-09T06:21:59.995Z\",\"timestamp\":\"2026-08-09T06:21:59.995Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-09 06:21:59'),
(1154, 73, 'LOGOUT', 'User tsehayu@itp.et logged out', '{\"user_id\":\"73\",\"username\":\"tsehayu@itp.et\",\"employee_name\":\"tsuhayu directorate\",\"logout_time\":\"2026-08-09T06:26:37.252Z\",\"timestamp\":\"2026-08-09T06:26:37.252Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/73\",\"method\":\"PUT\"}', '2026-08-09 06:26:37'),
(1155, 73, 'LOGIN', 'User tsehayu@itp.et logged in successfully', '{\"username\":\"tsehayu@itp.et\",\"user_id\":73,\"role_id\":5,\"employee_id\":146,\"employee_name\":\"tsuhayu directorate\",\"department_id\":11,\"login_time\":\"2026-08-09T06:26:45.611Z\",\"timestamp\":\"2026-08-09T06:26:45.611Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-09 06:26:45'),
(1156, 73, 'LOGOUT', 'User tsehayu@itp.et logged out', '{\"user_id\":\"73\",\"username\":\"tsehayu@itp.et\",\"employee_name\":\"tsuhayu directorate\",\"logout_time\":\"2026-08-09T06:49:06.472Z\",\"timestamp\":\"2026-08-09T06:49:06.473Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/73\",\"method\":\"PUT\"}', '2026-08-09 06:49:06'),
(1157, 25, 'LOGIN', 'User olana@itp.et logged in successfully', '{\"username\":\"olana@itp.et\",\"user_id\":25,\"role_id\":2,\"employee_id\":72,\"employee_name\":\"Olana\",\"department_id\":2,\"login_time\":\"2026-08-09T06:49:13.932Z\",\"timestamp\":\"2026-08-09T06:49:13.932Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-09 06:49:13'),
(1158, 25, 'LOGOUT', 'User olana@itp.et logged out', '{\"user_id\":\"25\",\"username\":\"olana@itp.et\",\"employee_name\":\"Olana\",\"logout_time\":\"2026-08-09T06:51:03.232Z\",\"timestamp\":\"2026-08-09T06:51:03.233Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/25\",\"method\":\"PUT\"}', '2026-08-09 06:51:03'),
(1159, 25, 'LOGIN', 'User olana@itp.et logged in successfully', '{\"username\":\"olana@itp.et\",\"user_id\":25,\"role_id\":2,\"employee_id\":72,\"employee_name\":\"Olana\",\"department_id\":2,\"login_time\":\"2026-08-09T06:51:09.455Z\",\"timestamp\":\"2026-08-09T06:51:09.455Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-09 06:51:09'),
(1160, 25, 'LOGOUT', 'User olana@itp.et logged out', '{\"user_id\":\"25\",\"username\":\"olana@itp.et\",\"employee_name\":\"Olana\",\"logout_time\":\"2026-08-09T06:51:36.829Z\",\"timestamp\":\"2026-08-09T06:51:36.829Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/25\",\"method\":\"PUT\"}', '2026-08-09 06:51:36'),
(1161, 73, 'LOGIN', 'User tsehayu@itp.et logged in successfully', '{\"username\":\"tsehayu@itp.et\",\"user_id\":73,\"role_id\":5,\"employee_id\":146,\"employee_name\":\"tsuhayu directorate\",\"department_id\":11,\"login_time\":\"2026-08-09T06:51:42.641Z\",\"timestamp\":\"2026-08-09T06:51:42.641Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-09 06:51:42');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `description`, `metadata`, `created_at`) VALUES
(1162, 73, 'LOGIN', 'User tsehayu@itp.et logged in successfully', '{\"username\":\"tsehayu@itp.et\",\"user_id\":73,\"role_id\":5,\"employee_id\":146,\"employee_name\":\"tsuhayu directorate\",\"department_id\":11,\"login_time\":\"2026-08-09T09:40:59.482Z\",\"timestamp\":\"2026-08-09T09:40:59.483Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-09 09:40:59'),
(1163, 73, 'LOGOUT', 'User tsehayu@itp.et logged out', '{\"user_id\":\"73\",\"username\":\"tsehayu@itp.et\",\"employee_name\":\"tsuhayu directorate\",\"logout_time\":\"2026-08-09T09:52:29.689Z\",\"timestamp\":\"2026-08-09T09:52:29.689Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/73\",\"method\":\"PUT\"}', '2026-08-09 09:52:29'),
(1164, 79, 'LOGIN', 'User milliongoraw@gmail.com logged in successfully', '{\"username\":\"milliongoraw@gmail.com\",\"user_id\":79,\"role_id\":6,\"employee_id\":152,\"employee_name\":\"Million  Goraw\",\"department_id\":null,\"login_time\":\"2026-08-09T09:52:40.948Z\",\"timestamp\":\"2026-08-09T09:52:40.948Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-09 09:52:40'),
(1165, 79, 'LOGOUT', 'User Milliongoraw@gmail.com logged out', '{\"user_id\":\"79\",\"username\":\"Milliongoraw@gmail.com\",\"employee_name\":\"Million  Goraw\",\"logout_time\":\"2026-08-09T12:06:39.013Z\",\"timestamp\":\"2026-08-09T12:06:39.014Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/79\",\"method\":\"PUT\"}', '2026-08-09 12:06:39'),
(1166, 25, 'LOGIN', 'User olana@itp.et logged in successfully', '{\"username\":\"olana@itp.et\",\"user_id\":25,\"role_id\":2,\"employee_id\":72,\"employee_name\":\"Olana\",\"department_id\":2,\"login_time\":\"2026-08-09T12:06:46.821Z\",\"timestamp\":\"2026-08-09T12:06:46.821Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-09 12:06:46'),
(1167, 25, 'LOGOUT', 'User olana@itp.et logged out', '{\"user_id\":\"25\",\"username\":\"olana@itp.et\",\"employee_name\":\"Olana\",\"logout_time\":\"2026-08-09T17:10:00.421Z\",\"timestamp\":\"2026-08-09T17:10:00.421Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/25\",\"method\":\"PUT\"}', '2026-08-09 17:10:00'),
(1168, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":null,\"login_time\":\"2026-08-09T17:10:07.068Z\",\"timestamp\":\"2026-08-09T17:10:07.068Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-09 17:10:07'),
(1169, 40, 'LOGOUT', 'User ezira@itpark.et logged out', '{\"user_id\":\"40\",\"username\":\"ezira@itpark.et\",\"employee_name\":\"Ezira\",\"logout_time\":\"2026-08-09T17:11:00.546Z\",\"timestamp\":\"2026-08-09T17:11:00.547Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/40\",\"method\":\"PUT\"}', '2026-08-09 17:11:00'),
(1170, 25, 'LOGIN', 'User olana@itp.et logged in successfully', '{\"username\":\"olana@itp.et\",\"user_id\":25,\"role_id\":2,\"employee_id\":72,\"employee_name\":\"Olana\",\"department_id\":2,\"login_time\":\"2026-08-09T17:11:08.568Z\",\"timestamp\":\"2026-08-09T17:11:08.568Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-09 17:11:08'),
(1171, 25, 'LOGOUT', 'User olana@itp.et logged out', '{\"user_id\":\"25\",\"username\":\"olana@itp.et\",\"employee_name\":\"Olana\",\"logout_time\":\"2026-08-09T18:19:53.164Z\",\"timestamp\":\"2026-08-09T18:19:53.164Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/25\",\"method\":\"PUT\"}', '2026-08-09 18:19:53'),
(1172, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":null,\"login_time\":\"2026-08-09T18:19:58.701Z\",\"timestamp\":\"2026-08-09T18:19:58.701Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-09 18:19:58'),
(1173, 40, 'LOGOUT', 'User ezira@itpark.et logged out', '{\"user_id\":\"40\",\"username\":\"ezira@itpark.et\",\"employee_name\":\"Ezira\",\"logout_time\":\"2026-08-09T18:20:41.926Z\",\"timestamp\":\"2026-08-09T18:20:41.926Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/40\",\"method\":\"PUT\"}', '2026-08-09 18:20:41'),
(1174, 73, 'LOGIN', 'User tsehayu@itp.et logged in successfully', '{\"username\":\"tsehayu@itp.et\",\"user_id\":73,\"role_id\":5,\"employee_id\":146,\"employee_name\":\"tsuhayu directorate\",\"department_id\":11,\"login_time\":\"2026-08-09T18:20:50.249Z\",\"timestamp\":\"2026-08-09T18:20:50.250Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-09 18:20:50'),
(1175, 73, 'LOGOUT', 'User tsehayu@itp.et logged out', '{\"user_id\":\"73\",\"username\":\"tsehayu@itp.et\",\"employee_name\":\"tsuhayu directorate\",\"logout_time\":\"2026-08-09T18:24:02.107Z\",\"timestamp\":\"2026-08-09T18:24:02.107Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/73\",\"method\":\"PUT\"}', '2026-08-09 18:24:02'),
(1176, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":null,\"login_time\":\"2026-08-09T18:24:07.694Z\",\"timestamp\":\"2026-08-09T18:24:07.694Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-09 18:24:07'),
(1177, 40, 'LOGOUT', 'User ezira@itpark.et logged out', '{\"user_id\":\"40\",\"username\":\"ezira@itpark.et\",\"employee_name\":\"Ezira\",\"logout_time\":\"2026-08-09T18:35:19.482Z\",\"timestamp\":\"2026-08-09T18:35:19.482Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/40\",\"method\":\"PUT\"}', '2026-08-09 18:35:19'),
(1178, 73, 'LOGIN', 'User tsehayu@itp.et logged in successfully', '{\"username\":\"tsehayu@itp.et\",\"user_id\":73,\"role_id\":5,\"employee_id\":146,\"employee_name\":\"tsuhayu directorate\",\"department_id\":11,\"login_time\":\"2026-08-09T18:35:31.235Z\",\"timestamp\":\"2026-08-09T18:35:31.235Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-09 18:35:31'),
(1179, 73, 'LOGOUT', 'User tsehayu@itp.et logged out', '{\"user_id\":\"73\",\"username\":\"tsehayu@itp.et\",\"employee_name\":\"tsuhayu directorate\",\"logout_time\":\"2026-08-09T18:47:57.180Z\",\"timestamp\":\"2026-08-09T18:47:57.180Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/73\",\"method\":\"PUT\"}', '2026-08-09 18:47:57'),
(1180, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":null,\"login_time\":\"2026-08-09T18:48:04.155Z\",\"timestamp\":\"2026-08-09T18:48:04.155Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-09 18:48:04'),
(1181, 40, 'LOGOUT', 'User ezira@itpark.et logged out', '{\"user_id\":\"40\",\"username\":\"ezira@itpark.et\",\"employee_name\":\"Ezira\",\"logout_time\":\"2026-08-09T18:50:27.097Z\",\"timestamp\":\"2026-08-09T18:50:27.098Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/40\",\"method\":\"PUT\"}', '2026-08-09 18:50:27'),
(1182, 73, 'LOGIN', 'User tsehayu@itp.et logged in successfully', '{\"username\":\"tsehayu@itp.et\",\"user_id\":73,\"role_id\":5,\"employee_id\":146,\"employee_name\":\"tsuhayu directorate\",\"department_id\":11,\"login_time\":\"2026-08-09T18:50:55.060Z\",\"timestamp\":\"2026-08-09T18:50:55.060Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-09 18:50:55'),
(1183, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":null,\"login_time\":\"2026-08-09T19:03:58.742Z\",\"timestamp\":\"2026-08-09T19:03:58.742Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-09 19:03:58'),
(1184, 40, 'LOGOUT', 'User ezira@itpark.et logged out', '{\"user_id\":\"40\",\"username\":\"ezira@itpark.et\",\"employee_name\":\"Ezira\",\"logout_time\":\"2026-08-09T20:00:44.207Z\",\"timestamp\":\"2026-08-09T20:00:44.208Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/40\",\"method\":\"PUT\"}', '2026-08-09 20:00:44'),
(1185, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":null,\"login_time\":\"2026-08-09T20:00:46.798Z\",\"timestamp\":\"2026-08-09T20:00:46.798Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-09 20:00:46'),
(1186, 73, 'LOGOUT', 'User tsehayu@itp.et logged out', '{\"user_id\":\"73\",\"username\":\"tsehayu@itp.et\",\"employee_name\":\"tsuhayu directorate\",\"logout_time\":\"2026-08-10T07:30:02.469Z\",\"timestamp\":\"2026-08-10T07:30:02.470Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/73\",\"method\":\"PUT\"}', '2026-08-10 07:30:02'),
(1187, 40, 'LOGOUT', 'User ezira@itpark.et logged out', '{\"user_id\":\"40\",\"username\":\"ezira@itpark.et\",\"employee_name\":\"Ezira\",\"logout_time\":\"2026-08-10T07:30:11.852Z\",\"timestamp\":\"2026-08-10T07:30:11.852Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/40\",\"method\":\"PUT\"}', '2026-08-10 07:30:11'),
(1188, 25, 'LOGIN', 'User olana@itp.et logged in successfully', '{\"username\":\"olana@itp.et\",\"user_id\":25,\"role_id\":2,\"employee_id\":72,\"employee_name\":\"Olana\",\"department_id\":2,\"login_time\":\"2026-08-10T07:30:18.994Z\",\"timestamp\":\"2026-08-10T07:30:18.994Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-10 07:30:18'),
(1189, 73, 'LOGIN', 'User tsehayu@itp.et logged in successfully', '{\"username\":\"tsehayu@itp.et\",\"user_id\":73,\"role_id\":5,\"employee_id\":146,\"employee_name\":\"tsuhayu directorate\",\"department_id\":11,\"login_time\":\"2026-08-10T07:38:55.489Z\",\"timestamp\":\"2026-08-10T07:38:55.489Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-10 07:38:55'),
(1190, 73, 'LOGOUT', 'User tsehayu@itp.et logged out', '{\"user_id\":\"73\",\"username\":\"tsehayu@itp.et\",\"employee_name\":\"tsuhayu directorate\",\"logout_time\":\"2026-08-10T07:43:11.137Z\",\"timestamp\":\"2026-08-10T07:43:11.137Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/73\",\"method\":\"PUT\"}', '2026-08-10 07:43:11'),
(1191, 25, 'LOGOUT', 'User olana@itp.et logged out', '{\"user_id\":\"25\",\"username\":\"olana@itp.et\",\"employee_name\":\"Olana\",\"logout_time\":\"2026-08-10T07:43:19.335Z\",\"timestamp\":\"2026-08-10T07:43:19.336Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/25\",\"method\":\"PUT\"}', '2026-08-10 07:43:19'),
(1192, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":null,\"login_time\":\"2026-08-10T07:43:23.496Z\",\"timestamp\":\"2026-08-10T07:43:23.496Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-10 07:43:23'),
(1193, 73, 'LOGIN', 'User tsehayu@itp.et logged in successfully', '{\"username\":\"tsehayu@itp.et\",\"user_id\":73,\"role_id\":5,\"employee_id\":146,\"employee_name\":\"tsuhayu directorate\",\"department_id\":11,\"login_time\":\"2026-08-10T07:59:50.374Z\",\"timestamp\":\"2026-08-10T07:59:50.374Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-10 07:59:50'),
(1194, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":null,\"login_time\":\"2026-08-10T12:01:03.743Z\",\"timestamp\":\"2026-08-10T12:01:03.743Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-10 12:01:03'),
(1195, 40, 'LOGOUT', 'User ezira@itpark.et logged out', '{\"user_id\":\"40\",\"username\":\"ezira@itpark.et\",\"employee_name\":\"Ezira\",\"logout_time\":\"2026-08-11T06:27:53.562Z\",\"timestamp\":\"2026-08-11T06:27:53.562Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/40\",\"method\":\"PUT\"}', '2026-08-11 06:27:53'),
(1196, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":null,\"login_time\":\"2026-08-11T06:33:22.159Z\",\"timestamp\":\"2026-08-11T06:33:22.159Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-11 06:33:22'),
(1197, 40, 'LOGOUT', 'User ezira@itpark.et logged out', '{\"user_id\":\"40\",\"username\":\"ezira@itpark.et\",\"employee_name\":\"Ezira\",\"logout_time\":\"2026-08-11T06:33:25.974Z\",\"timestamp\":\"2026-08-11T06:33:25.974Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/40\",\"method\":\"PUT\"}', '2026-08-11 06:33:25'),
(1198, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":null,\"login_time\":\"2026-08-11T06:54:07.724Z\",\"timestamp\":\"2026-08-11T06:54:07.724Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-11 06:54:07'),
(1199, 40, 'LOGOUT', 'User ezira@itpark.et logged out', '{\"user_id\":\"40\",\"username\":\"ezira@itpark.et\",\"employee_name\":\"Ezira\",\"logout_time\":\"2026-08-11T06:54:10.218Z\",\"timestamp\":\"2026-08-11T06:54:10.218Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/40\",\"method\":\"PUT\"}', '2026-08-11 06:54:10'),
(1200, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":null,\"login_time\":\"2026-08-11T07:18:17.411Z\",\"timestamp\":\"2026-08-11T07:18:17.411Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-11 07:18:17'),
(1201, 40, 'LOGOUT', 'User ezira@itpark.et logged out', '{\"user_id\":\"40\",\"username\":\"ezira@itpark.et\",\"employee_name\":\"Ezira\",\"logout_time\":\"2026-08-11T07:18:21.618Z\",\"timestamp\":\"2026-08-11T07:18:21.618Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/40\",\"method\":\"PUT\"}', '2026-08-11 07:18:21'),
(1202, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":null,\"login_time\":\"2026-08-11T07:21:36.543Z\",\"timestamp\":\"2026-08-11T07:21:36.543Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-11 07:21:36'),
(1203, 40, 'LOGOUT', 'User ezira@itpark.et logged out', '{\"user_id\":\"40\",\"username\":\"ezira@itpark.et\",\"employee_name\":\"Ezira\",\"logout_time\":\"2026-08-11T11:55:12.205Z\",\"timestamp\":\"2026-08-11T11:55:12.206Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/40\",\"method\":\"PUT\"}', '2026-08-11 11:55:12'),
(1204, 73, 'LOGOUT', 'User tsehayu@itp.et logged out', '{\"user_id\":\"73\",\"username\":\"tsehayu@itp.et\",\"employee_name\":\"tsuhayu directorate\",\"logout_time\":\"2026-08-11T11:55:51.733Z\",\"timestamp\":\"2026-08-11T11:55:51.733Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/73\",\"method\":\"PUT\"}', '2026-08-11 11:55:51'),
(1205, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":null,\"login_time\":\"2026-08-11T11:56:23.694Z\",\"timestamp\":\"2026-08-11T11:56:23.694Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-11 11:56:23'),
(1206, 40, 'LOGOUT', 'User ezira@itpark.et logged out', '{\"user_id\":\"40\",\"username\":\"ezira@itpark.et\",\"employee_name\":\"Ezira\",\"logout_time\":\"2026-08-11T12:21:18.486Z\",\"timestamp\":\"2026-08-11T12:21:18.487Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/40\",\"method\":\"PUT\"}', '2026-08-11 12:21:18'),
(1207, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":null,\"login_time\":\"2026-08-11T12:21:19.462Z\",\"timestamp\":\"2026-08-11T12:21:19.462Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-11 12:21:19'),
(1208, NULL, 'LOGIN_FAILED', 'Login failed: User not found - ermiyas@itp.et', '{\"username\":\"ermiyas@itp.et\",\"reason\":\"user_not_found\",\"timestamp\":\"2026-08-11T13:35:22.959Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-11 13:35:22'),
(1209, 73, 'LOGIN', 'User tsehayu@itp.et logged in successfully', '{\"username\":\"tsehayu@itp.et\",\"user_id\":73,\"role_id\":5,\"employee_id\":146,\"employee_name\":\"tsuhayu directorate\",\"department_id\":11,\"login_time\":\"2026-08-11T13:35:42.023Z\",\"timestamp\":\"2026-08-11T13:35:42.023Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-11 13:35:42'),
(1210, 40, 'LOGOUT', 'User ezira@itpark.et logged out', '{\"user_id\":\"40\",\"username\":\"ezira@itpark.et\",\"employee_name\":\"Ezira\",\"logout_time\":\"2026-08-11T18:55:48.755Z\",\"timestamp\":\"2026-08-11T18:55:48.757Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/40\",\"method\":\"PUT\"}', '2026-08-11 18:55:48'),
(1211, 67, 'LOGIN', 'User hayaltamrat@gmail.com logged in successfully', '{\"username\":\"hayaltamrat@gmail.com\",\"user_id\":67,\"role_id\":8,\"employee_id\":139,\"employee_name\":\"hayal Tamrat\",\"department_id\":null,\"login_time\":\"2026-08-11T18:55:55.475Z\",\"timestamp\":\"2026-08-11T18:55:55.475Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-11 18:55:55'),
(1212, 67, 'LOGOUT', 'User hayaltamrat@gmail.com logged out', '{\"user_id\":\"67\",\"username\":\"hayaltamrat@gmail.com\",\"employee_name\":\"hayal Tamrat\",\"logout_time\":\"2026-08-11T18:56:11.525Z\",\"timestamp\":\"2026-08-11T18:56:11.525Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/67\",\"method\":\"PUT\"}', '2026-08-11 18:56:11'),
(1213, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":null,\"login_time\":\"2026-08-11T18:56:16.879Z\",\"timestamp\":\"2026-08-11T18:56:16.879Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-11 18:56:16'),
(1214, 40, 'LOGOUT', 'User ezira@itpark.et logged out', '{\"user_id\":\"40\",\"username\":\"ezira@itpark.et\",\"employee_name\":\"Ezira\",\"logout_time\":\"2026-08-11T18:56:47.061Z\",\"timestamp\":\"2026-08-11T18:56:47.061Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/40\",\"method\":\"PUT\"}', '2026-08-11 18:56:47'),
(1215, 79, 'LOGIN', 'User milliongoraw@gmail.com logged in successfully', '{\"username\":\"milliongoraw@gmail.com\",\"user_id\":79,\"role_id\":6,\"employee_id\":152,\"employee_name\":\"Million  Goraw\",\"department_id\":null,\"login_time\":\"2026-08-11T18:56:53.580Z\",\"timestamp\":\"2026-08-11T18:56:53.580Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-11 18:56:53'),
(1216, 79, 'LOGOUT', 'User Milliongoraw@gmail.com logged out', '{\"user_id\":\"79\",\"username\":\"Milliongoraw@gmail.com\",\"employee_name\":\"Million  Goraw\",\"logout_time\":\"2026-08-11T19:24:08.315Z\",\"timestamp\":\"2026-08-11T19:24:08.315Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/79\",\"method\":\"PUT\"}', '2026-08-11 19:24:08'),
(1217, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":null,\"login_time\":\"2026-08-11T19:24:19.017Z\",\"timestamp\":\"2026-08-11T19:24:19.017Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-11 19:24:19'),
(1218, 40, 'LOGOUT', 'User ezira@itpark.et logged out', '{\"user_id\":\"40\",\"username\":\"ezira@itpark.et\",\"employee_name\":\"Ezira\",\"logout_time\":\"2026-08-11T19:25:53.513Z\",\"timestamp\":\"2026-08-11T19:25:53.513Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/40\",\"method\":\"PUT\"}', '2026-08-11 19:25:53'),
(1219, 79, 'LOGIN', 'User milliongoraw@gmail.com logged in successfully', '{\"username\":\"milliongoraw@gmail.com\",\"user_id\":79,\"role_id\":6,\"employee_id\":152,\"employee_name\":\"Million  Goraw\",\"department_id\":null,\"login_time\":\"2026-08-11T19:26:01.227Z\",\"timestamp\":\"2026-08-11T19:26:01.227Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-11 19:26:01'),
(1220, 79, 'LOGOUT', 'User Milliongoraw@gmail.com logged out', '{\"user_id\":\"79\",\"username\":\"Milliongoraw@gmail.com\",\"employee_name\":\"Million  Goraw\",\"logout_time\":\"2026-08-11T19:33:07.575Z\",\"timestamp\":\"2026-08-11T19:33:07.576Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/79\",\"method\":\"PUT\"}', '2026-08-11 19:33:07'),
(1221, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":null,\"login_time\":\"2026-08-11T19:33:16.415Z\",\"timestamp\":\"2026-08-11T19:33:16.415Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-11 19:33:16'),
(1222, 73, 'LOGOUT', 'User tsehayu@itp.et logged out', '{\"user_id\":\"73\",\"username\":\"tsehayu@itp.et\",\"employee_name\":\"tsuhayu directorate\",\"logout_time\":\"2026-08-12T03:27:46.690Z\",\"timestamp\":\"2026-08-12T03:27:46.691Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/73\",\"method\":\"PUT\"}', '2026-08-12 03:27:46'),
(1223, NULL, 'LOGIN_FAILED', 'Login failed: User not found - CMS url= https://admin.ethiopianitpark.et username= million.goraw@ethiopianitpark.et pass= Itpc@123  VMMS url = https://vmms.ethiopianitpark.et username= million.goraw@ethiopianitpark.et pass= Itpc@123  Plan and Report url = https://Itpr.ethiopianitpark.et username= million.goraw@ethiopianitpark.et pass= Itpc@123   letter and document  url = https://lms.ethiopianitpark.et username= million.goraw@ethiopianitpark.et pass= Itpc@123   External letter applicant portal  https://portal.ethiopianitpark.et/login  Internal Visitor issue portal https://lms.ethiopianitpark.et/visitor', '{\"username\":\"CMS url= https://admin.ethiopianitpark.et username= million.goraw@ethiopianitpark.et pass= Itpc@123  VMMS url = https://vmms.ethiopianitpark.et username= million.goraw@ethiopianitpark.et pass= Itpc@123  Plan and Report url = https://Itpr.ethiopianitpark.et username= million.goraw@ethiopianitpark.et pass= Itpc@123   letter and document  url = https://lms.ethiopianitpark.et username= million.goraw@ethiopianitpark.et pass= Itpc@123   External letter applicant portal  https://portal.ethiopianitpark.et/login  Internal Visitor issue portal https://lms.ethiopianitpark.et/visitor\",\"reason\":\"user_not_found\",\"timestamp\":\"2026-08-12T03:29:12.979Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-12 03:29:12'),
(1224, NULL, 'LOGIN_FAILED', 'Login failed: User not found -  million.goraw@ethiopianitpark.et', '{\"username\":\" million.goraw@ethiopianitpark.et\",\"reason\":\"user_not_found\",\"timestamp\":\"2026-08-12T03:29:31.738Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-12 03:29:31'),
(1225, NULL, 'LOGIN_FAILED', 'Login failed: User not found - million.goraw@ethiopianitpark.et', '{\"username\":\"million.goraw@ethiopianitpark.et\",\"reason\":\"user_not_found\",\"timestamp\":\"2026-08-12T03:29:43.641Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-12 03:29:43'),
(1226, NULL, 'LOGIN_FAILED', 'Login failed: User not found - million.goraw@ethiopianitpark.et', '{\"username\":\"million.goraw@ethiopianitpark.et\",\"reason\":\"user_not_found\",\"timestamp\":\"2026-08-12T03:30:02.173Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-12 03:30:02'),
(1227, 40, 'LOGOUT', 'User ezira@itpark.et logged out', '{\"user_id\":\"40\",\"username\":\"ezira@itpark.et\",\"employee_name\":\"Ezira\",\"logout_time\":\"2026-08-12T03:30:13.934Z\",\"timestamp\":\"2026-08-12T03:30:13.934Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/40\",\"method\":\"PUT\"}', '2026-08-12 03:30:13'),
(1228, 79, 'LOGIN', 'User milliongoraw@gmail.com logged in successfully', '{\"username\":\"milliongoraw@gmail.com\",\"user_id\":79,\"role_id\":6,\"employee_id\":152,\"employee_name\":\"Million  Goraw\",\"department_id\":null,\"login_time\":\"2026-08-12T03:30:29.629Z\",\"timestamp\":\"2026-08-12T03:30:29.629Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-12 03:30:29'),
(1229, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":null,\"login_time\":\"2026-08-12T03:32:15.946Z\",\"timestamp\":\"2026-08-12T03:32:15.946Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-12 03:32:15'),
(1230, 79, 'LOGOUT', 'User Milliongoraw@gmail.com logged out', '{\"user_id\":\"79\",\"username\":\"Milliongoraw@gmail.com\",\"employee_name\":\"Million  Goraw\",\"logout_time\":\"2026-08-12T06:02:55.296Z\",\"timestamp\":\"2026-08-12T06:02:55.298Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/79\",\"method\":\"PUT\"}', '2026-08-12 06:02:55'),
(1231, 73, 'LOGIN', 'User tsehayu@itp.et logged in successfully', '{\"username\":\"tsehayu@itp.et\",\"user_id\":73,\"role_id\":5,\"employee_id\":146,\"employee_name\":\"tsuhayu directorate\",\"department_id\":11,\"login_time\":\"2026-08-12T06:02:59.985Z\",\"timestamp\":\"2026-08-12T06:02:59.985Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-12 06:02:59'),
(1232, 40, 'LOGOUT', 'User ezira@itpark.et logged out', '{\"user_id\":\"40\",\"username\":\"ezira@itpark.et\",\"employee_name\":\"Ezira\",\"logout_time\":\"2026-08-12T07:03:54.554Z\",\"timestamp\":\"2026-08-12T07:03:54.555Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/40\",\"method\":\"PUT\"}', '2026-08-12 07:03:54'),
(1233, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":null,\"login_time\":\"2026-08-12T07:40:18.324Z\",\"timestamp\":\"2026-08-12T07:40:18.325Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-12 07:40:18'),
(1234, 40, 'LOGOUT', 'User ezira@itpark.et logged out', '{\"user_id\":\"40\",\"username\":\"ezira@itpark.et\",\"employee_name\":\"Ezira\",\"logout_time\":\"2026-08-12T07:44:28.411Z\",\"timestamp\":\"2026-08-12T07:44:28.411Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/40\",\"method\":\"PUT\"}', '2026-08-12 07:44:28'),
(1235, NULL, 'LOGIN_FAILED', 'Login failed: User not found - tsehayu.tliahun@ethiopianitpark.te', '{\"username\":\"tsehayu.tliahun@ethiopianitpark.te\",\"reason\":\"user_not_found\",\"timestamp\":\"2026-08-12T07:45:18.007Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-12 07:45:18'),
(1236, NULL, 'LOGIN_FAILED', 'Login failed: User not found - tsehayu.tliahun@ethiopianitpark.et', '{\"username\":\"tsehayu.tliahun@ethiopianitpark.et\",\"reason\":\"user_not_found\",\"timestamp\":\"2026-08-12T07:45:21.944Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-12 07:45:21'),
(1237, NULL, 'LOGIN_FAILED', 'Login failed: User not found - tsehayu.tilahun@ethiopianitpark.et', '{\"username\":\"tsehayu.tilahun@ethiopianitpark.et\",\"reason\":\"user_not_found\",\"timestamp\":\"2026-08-12T07:45:38.497Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-12 07:45:38'),
(1238, 73, 'LOGIN', 'User tsehayu@itp.et logged in successfully', '{\"username\":\"tsehayu@itp.et\",\"user_id\":73,\"role_id\":5,\"employee_id\":146,\"employee_name\":\"tsuhayu directorate\",\"department_id\":11,\"login_time\":\"2026-08-12T07:45:57.342Z\",\"timestamp\":\"2026-08-12T07:45:57.342Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-12 07:45:57'),
(1239, 73, 'LOGOUT', 'User tsehayu@itp.et logged out', '{\"user_id\":\"73\",\"username\":\"tsehayu@itp.et\",\"employee_name\":\"tsuhayu directorate\",\"logout_time\":\"2026-08-12T07:48:00.770Z\",\"timestamp\":\"2026-08-12T07:48:00.770Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/73\",\"method\":\"PUT\"}', '2026-08-12 07:48:00'),
(1240, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":null,\"login_time\":\"2026-08-12T07:48:06.591Z\",\"timestamp\":\"2026-08-12T07:48:06.591Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-12 07:48:06'),
(1241, 40, 'LOGOUT', 'User ezira@itpark.et logged out', '{\"user_id\":\"40\",\"username\":\"ezira@itpark.et\",\"employee_name\":\"Ezira\",\"logout_time\":\"2026-08-12T07:49:54.174Z\",\"timestamp\":\"2026-08-12T07:49:54.174Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/40\",\"method\":\"PUT\"}', '2026-08-12 07:49:54'),
(1242, 73, 'LOGIN', 'User tsehayu@itp.et logged in successfully', '{\"username\":\"tsehayu@itp.et\",\"user_id\":73,\"role_id\":5,\"employee_id\":146,\"employee_name\":\"tsuhayu directorate\",\"department_id\":11,\"login_time\":\"2026-08-12T07:50:21.629Z\",\"timestamp\":\"2026-08-12T07:50:21.629Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-12 07:50:21'),
(1243, 73, 'LOGOUT', 'User tsehayu@itp.et logged out', '{\"user_id\":\"73\",\"username\":\"tsehayu@itp.et\",\"employee_name\":\"tsuhayu directorate\",\"logout_time\":\"2026-08-12T07:59:31.739Z\",\"timestamp\":\"2026-08-12T07:59:31.739Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/73\",\"method\":\"PUT\"}', '2026-08-12 07:59:31'),
(1244, 79, 'LOGIN', 'User milliongoraw@gmail.com logged in successfully', '{\"username\":\"milliongoraw@gmail.com\",\"user_id\":79,\"role_id\":6,\"employee_id\":152,\"employee_name\":\"Million  Goraw\",\"department_id\":null,\"login_time\":\"2026-08-12T07:59:38.191Z\",\"timestamp\":\"2026-08-12T07:59:38.191Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-12 07:59:38'),
(1245, 79, 'LOGOUT', 'User Milliongoraw@gmail.com logged out', '{\"user_id\":\"79\",\"username\":\"Milliongoraw@gmail.com\",\"employee_name\":\"Million  Goraw\",\"logout_time\":\"2026-08-12T08:08:32.890Z\",\"timestamp\":\"2026-08-12T08:08:32.890Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/79\",\"method\":\"PUT\"}', '2026-08-12 08:08:32'),
(1246, 73, 'LOGOUT', 'User tsehayu@itp.et logged out', '{\"user_id\":\"73\",\"username\":\"tsehayu@itp.et\",\"employee_name\":\"tsuhayu directorate\",\"logout_time\":\"2026-08-12T08:09:05.700Z\",\"timestamp\":\"2026-08-12T08:09:05.700Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/73\",\"method\":\"PUT\"}', '2026-08-12 08:09:05'),
(1247, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":null,\"login_time\":\"2026-08-12T08:09:37.743Z\",\"timestamp\":\"2026-08-12T08:09:37.743Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-12 08:09:37'),
(1248, 79, 'LOGIN', 'User milliongoraw@gmail.com logged in successfully', '{\"username\":\"milliongoraw@gmail.com\",\"user_id\":79,\"role_id\":6,\"employee_id\":152,\"employee_name\":\"Million  Goraw\",\"department_id\":null,\"login_time\":\"2026-08-12T11:54:23.254Z\",\"timestamp\":\"2026-08-12T11:54:23.255Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-12 11:54:23'),
(1249, 79, 'LOGOUT', 'User Milliongoraw@gmail.com logged out', '{\"user_id\":\"79\",\"username\":\"Milliongoraw@gmail.com\",\"employee_name\":\"Million  Goraw\",\"logout_time\":\"2026-08-12T11:54:28.760Z\",\"timestamp\":\"2026-08-12T11:54:28.760Z\",\"ip_address\":\"192.168.32.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/79\",\"method\":\"PUT\"}', '2026-08-12 11:54:28'),
(1250, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":null,\"login_time\":\"2026-08-12T11:55:57.425Z\",\"timestamp\":\"2026-08-12T11:55:57.425Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8875\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-12 11:55:57'),
(1251, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":null,\"login_time\":\"2026-08-12T11:56:54.809Z\",\"timestamp\":\"2026-08-12T11:56:54.809Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8875\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-12 11:56:54'),
(1252, 79, 'LOGIN', 'User milliongoraw@gmail.com logged in successfully', '{\"username\":\"milliongoraw@gmail.com\",\"user_id\":79,\"role_id\":6,\"employee_id\":152,\"employee_name\":\"Million  Goraw\",\"department_id\":null,\"login_time\":\"2026-08-12T12:05:58.388Z\",\"timestamp\":\"2026-08-12T12:05:58.388Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-12 12:05:58'),
(1253, 79, 'LOGIN', 'User milliongoraw@gmail.com logged in successfully', '{\"username\":\"milliongoraw@gmail.com\",\"user_id\":79,\"role_id\":6,\"employee_id\":152,\"employee_name\":\"Million  Goraw\",\"department_id\":null,\"login_time\":\"2026-08-12T12:06:08.003Z\",\"timestamp\":\"2026-08-12T12:06:08.003Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-12 12:06:08'),
(1254, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":null,\"login_time\":\"2026-08-12T16:06:18.231Z\",\"timestamp\":\"2026-08-12T16:06:18.231Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-12 16:06:18'),
(1255, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":null,\"login_time\":\"2026-08-12T16:10:40.582Z\",\"timestamp\":\"2026-08-12T16:10:40.582Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-12 16:10:40'),
(1256, 40, 'LOGOUT', 'User ezira@itpark.et logged out', '{\"user_id\":\"40\",\"username\":\"ezira@itpark.et\",\"employee_name\":\"Ezira\",\"logout_time\":\"2026-08-12T16:13:44.072Z\",\"timestamp\":\"2026-08-12T16:13:44.072Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/40\",\"method\":\"PUT\"}', '2026-08-12 16:13:44'),
(1257, 73, 'LOGIN', 'User tsehayu@itp.et logged in successfully', '{\"username\":\"tsehayu@itp.et\",\"user_id\":73,\"role_id\":5,\"employee_id\":146,\"employee_name\":\"tsuhayu directorate\",\"department_id\":11,\"login_time\":\"2026-08-12T16:13:50.837Z\",\"timestamp\":\"2026-08-12T16:13:50.837Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-12 16:13:50'),
(1258, 73, 'LOGOUT', 'User tsehayu@itp.et logged out', '{\"user_id\":\"73\",\"username\":\"tsehayu@itp.et\",\"employee_name\":\"tsuhayu directorate\",\"logout_time\":\"2026-08-12T16:44:36.819Z\",\"timestamp\":\"2026-08-12T16:44:36.819Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/73\",\"method\":\"PUT\"}', '2026-08-12 16:44:36'),
(1259, 79, 'LOGIN', 'User milliongoraw@gmail.com logged in successfully', '{\"username\":\"milliongoraw@gmail.com\",\"user_id\":79,\"role_id\":6,\"employee_id\":152,\"employee_name\":\"Million  Goraw\",\"department_id\":null,\"login_time\":\"2026-08-12T16:44:44.594Z\",\"timestamp\":\"2026-08-12T16:44:44.594Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-12 16:44:44');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `description`, `metadata`, `created_at`) VALUES
(1260, 79, 'LOGOUT', 'User Milliongoraw@gmail.com logged out', '{\"user_id\":\"79\",\"username\":\"Milliongoraw@gmail.com\",\"employee_name\":\"Million  Goraw\",\"logout_time\":\"2026-08-12T16:45:41.793Z\",\"timestamp\":\"2026-08-12T16:45:41.793Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/79\",\"method\":\"PUT\"}', '2026-08-12 16:45:41'),
(1261, 79, 'LOGIN', 'User milliongoraw@gmail.com logged in successfully', '{\"username\":\"milliongoraw@gmail.com\",\"user_id\":79,\"role_id\":6,\"employee_id\":152,\"employee_name\":\"Million  Goraw\",\"department_id\":null,\"login_time\":\"2026-08-12T16:45:56.877Z\",\"timestamp\":\"2026-08-12T16:45:56.877Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-12 16:45:56'),
(1262, 79, 'LOGOUT', 'User Milliongoraw@gmail.com logged out', '{\"user_id\":\"79\",\"username\":\"Milliongoraw@gmail.com\",\"employee_name\":\"Million  Goraw\",\"logout_time\":\"2026-08-12T16:46:06.986Z\",\"timestamp\":\"2026-08-12T16:46:06.986Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/79\",\"method\":\"PUT\"}', '2026-08-12 16:46:06'),
(1263, 73, 'LOGIN', 'User tsehayu@itp.et logged in successfully', '{\"username\":\"tsehayu@itp.et\",\"user_id\":73,\"role_id\":5,\"employee_id\":146,\"employee_name\":\"tsuhayu directorate\",\"department_id\":11,\"login_time\":\"2026-08-12T16:46:12.835Z\",\"timestamp\":\"2026-08-12T16:46:12.835Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-12 16:46:12'),
(1264, 73, 'LOGOUT', 'User tsehayu@itp.et logged out', '{\"user_id\":\"73\",\"username\":\"tsehayu@itp.et\",\"employee_name\":\"tsuhayu directorate\",\"logout_time\":\"2026-08-12T16:46:42.869Z\",\"timestamp\":\"2026-08-12T16:46:42.869Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/73\",\"method\":\"PUT\"}', '2026-08-12 16:46:42'),
(1265, 73, 'LOGIN', 'User tsehayu@itp.et logged in successfully', '{\"username\":\"tsehayu@itp.et\",\"user_id\":73,\"role_id\":5,\"employee_id\":146,\"employee_name\":\"tsuhayu directorate\",\"department_id\":11,\"login_time\":\"2026-08-12T16:46:46.770Z\",\"timestamp\":\"2026-08-12T16:46:46.770Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-12 16:46:46'),
(1266, 73, 'LOGOUT', 'User tsehayu@itp.et logged out', '{\"user_id\":\"73\",\"username\":\"tsehayu@itp.et\",\"employee_name\":\"tsuhayu directorate\",\"logout_time\":\"2026-08-12T16:47:08.367Z\",\"timestamp\":\"2026-08-12T16:47:08.367Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/73\",\"method\":\"PUT\"}', '2026-08-12 16:47:08'),
(1267, 73, 'LOGIN', 'User tsehayu@itp.et logged in successfully', '{\"username\":\"tsehayu@itp.et\",\"user_id\":73,\"role_id\":5,\"employee_id\":146,\"employee_name\":\"tsuhayu directorate\",\"department_id\":11,\"login_time\":\"2026-08-12T16:47:10.819Z\",\"timestamp\":\"2026-08-12T16:47:10.819Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-12 16:47:10'),
(1268, 73, 'LOGOUT', 'User tsehayu@itp.et logged out', '{\"user_id\":\"73\",\"username\":\"tsehayu@itp.et\",\"employee_name\":\"tsuhayu directorate\",\"logout_time\":\"2026-08-12T16:47:17.991Z\",\"timestamp\":\"2026-08-12T16:47:17.991Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/73\",\"method\":\"PUT\"}', '2026-08-12 16:47:17'),
(1269, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":null,\"login_time\":\"2026-08-12T16:47:23.200Z\",\"timestamp\":\"2026-08-12T16:47:23.200Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-12 16:47:23'),
(1270, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":null,\"login_time\":\"2026-08-12T16:49:45.325Z\",\"timestamp\":\"2026-08-12T16:49:45.325Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-12 16:49:45'),
(1271, 40, 'LOGOUT', 'User ezira@itpark.et logged out', '{\"user_id\":\"40\",\"username\":\"ezira@itpark.et\",\"employee_name\":\"Ezira\",\"logout_time\":\"2026-08-12T16:51:38.358Z\",\"timestamp\":\"2026-08-12T16:51:38.358Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/40\",\"method\":\"PUT\"}', '2026-08-12 16:51:38'),
(1272, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":null,\"login_time\":\"2026-08-12T16:51:41.326Z\",\"timestamp\":\"2026-08-12T16:51:41.327Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-12 16:51:41'),
(1273, 40, 'LOGOUT', 'User ezira@itpark.et logged out', '{\"user_id\":\"40\",\"username\":\"ezira@itpark.et\",\"employee_name\":\"Ezira\",\"logout_time\":\"2026-08-12T16:52:24.694Z\",\"timestamp\":\"2026-08-12T16:52:24.694Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0\",\"endpoint\":\"/logout/40\",\"method\":\"PUT\"}', '2026-08-12 16:52:24'),
(1274, 79, 'LOGIN', 'User milliongoraw@gmail.com logged in successfully', '{\"username\":\"milliongoraw@gmail.com\",\"user_id\":79,\"role_id\":6,\"employee_id\":152,\"employee_name\":\"Million  Goraw\",\"department_id\":null,\"login_time\":\"2026-08-12T16:52:31.199Z\",\"timestamp\":\"2026-08-12T16:52:31.199Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-12 16:52:31'),
(1275, 79, 'LOGOUT', 'User Milliongoraw@gmail.com logged out', '{\"user_id\":\"79\",\"username\":\"Milliongoraw@gmail.com\",\"employee_name\":\"Million  Goraw\",\"logout_time\":\"2026-08-12T16:52:54.449Z\",\"timestamp\":\"2026-08-12T16:52:54.449Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0\",\"endpoint\":\"/logout/79\",\"method\":\"PUT\"}', '2026-08-12 16:52:54'),
(1276, 40, 'LOGIN', 'User ezira@itpark.et logged in successfully', '{\"username\":\"ezira@itpark.et\",\"user_id\":40,\"role_id\":1,\"employee_id\":109,\"employee_name\":\"Ezira\",\"department_id\":null,\"login_time\":\"2026-08-12T16:52:59.805Z\",\"timestamp\":\"2026-08-12T16:52:59.805Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-12 16:52:59'),
(1277, 40, 'LOGOUT', 'User ezira@itpark.et logged out', '{\"user_id\":\"40\",\"username\":\"ezira@itpark.et\",\"employee_name\":\"Ezira\",\"logout_time\":\"2026-08-12T17:07:04.136Z\",\"timestamp\":\"2026-08-12T17:07:04.137Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0\",\"endpoint\":\"/logout/40\",\"method\":\"PUT\"}', '2026-08-12 17:07:04'),
(1278, 73, 'LOGIN', 'User tsehayu@itp.et logged in successfully', '{\"username\":\"tsehayu@itp.et\",\"user_id\":73,\"role_id\":5,\"employee_id\":146,\"employee_name\":\"tsuhayu directorate\",\"department_id\":11,\"login_time\":\"2026-08-12T17:07:10.488Z\",\"timestamp\":\"2026-08-12T17:07:10.488Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-12 17:07:10'),
(1279, 40, 'LOGOUT', 'User ezira@itpark.et logged out', '{\"user_id\":\"40\",\"username\":\"ezira@itpark.et\",\"employee_name\":\"Ezira\",\"logout_time\":\"2026-08-12T17:27:03.223Z\",\"timestamp\":\"2026-08-12T17:27:03.223Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/logout/40\",\"method\":\"PUT\"}', '2026-08-12 17:27:03'),
(1280, 79, 'LOGIN', 'User milliongoraw@gmail.com logged in successfully', '{\"username\":\"milliongoraw@gmail.com\",\"user_id\":79,\"role_id\":6,\"employee_id\":152,\"employee_name\":\"Million  Goraw\",\"department_id\":null,\"login_time\":\"2026-08-12T17:27:08.199Z\",\"timestamp\":\"2026-08-12T17:27:08.199Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-12 17:27:08'),
(1281, 73, 'LOGOUT', 'User tsehayu@itp.et logged out', '{\"user_id\":\"73\",\"username\":\"tsehayu@itp.et\",\"employee_name\":\"tsuhayu directorate\",\"logout_time\":\"2026-08-12T17:28:18.950Z\",\"timestamp\":\"2026-08-12T17:28:18.950Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0\",\"endpoint\":\"/logout/73\",\"method\":\"PUT\"}', '2026-08-12 17:28:18'),
(1282, 79, 'LOGIN', 'User milliongoraw@gmail.com logged in successfully', '{\"username\":\"milliongoraw@gmail.com\",\"user_id\":79,\"role_id\":6,\"employee_id\":152,\"employee_name\":\"Million  Goraw\",\"department_id\":null,\"login_time\":\"2026-08-12T17:28:22.611Z\",\"timestamp\":\"2026-08-12T17:28:22.611Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-12 17:28:22'),
(1283, 79, 'LOGOUT', 'User Milliongoraw@gmail.com logged out', '{\"user_id\":\"79\",\"username\":\"Milliongoraw@gmail.com\",\"employee_name\":\"Million  Goraw\",\"logout_time\":\"2026-08-12T17:30:02.322Z\",\"timestamp\":\"2026-08-12T17:30:02.322Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0\",\"endpoint\":\"/logout/79\",\"method\":\"PUT\"}', '2026-08-12 17:30:02'),
(1284, 73, 'LOGIN', 'User tsehayu@itp.et logged in successfully', '{\"username\":\"tsehayu@itp.et\",\"user_id\":73,\"role_id\":5,\"employee_id\":146,\"employee_name\":\"tsuhayu directorate\",\"department_id\":11,\"login_time\":\"2026-08-12T17:30:08.514Z\",\"timestamp\":\"2026-08-12T17:30:08.514Z\",\"ip_address\":\"127.0.0.1\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0\",\"endpoint\":\"/login\",\"method\":\"POST\"}', '2026-08-12 17:30:08');

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
(3, 3, 40, '2025-11-27 12:10:25', '2026-04-07 16:58:22', 1, 0),
(4, 4, 25, '2025-11-27 12:18:05', '2025-11-27 12:36:20', 1, 0),
(5, 5, 25, '2025-11-27 12:32:21', '2025-11-27 12:37:35', 1, 0),
(6, 5, 48, '2025-11-27 12:32:21', NULL, 0, 0),
(7, 6, 25, '2025-11-27 12:37:35', '2025-11-28 13:27:32', 1, 0),
(8, 6, 24, '2025-11-27 12:37:35', NULL, 0, 0),
(9, 7, 25, '2025-11-27 12:37:52', '2025-11-28 08:31:13', 1, 0),
(10, 7, 55, '2025-11-27 12:37:52', NULL, 0, 0),
(11, 8, 25, '2025-11-27 12:39:14', '2026-03-11 06:01:25', 1, 0),
(12, 8, 40, '2025-11-27 12:39:14', '2026-03-24 09:32:35', 0, 0),
(14, 9, 37, '2025-11-27 12:47:03', NULL, 0, 0),
(15, 3, 25, '2025-11-27 12:50:37', '2025-11-28 13:38:21', 1, 0),
(17, 10, 48, '2025-11-27 12:56:49', NULL, 0, 0),
(18, 10, 13, '2025-11-27 12:57:12', NULL, 1, 0),
(19, 10, 25, '2025-11-27 12:57:21', '2025-11-28 13:10:17', 1, 0),
(20, 11, 40, '2025-11-27 13:08:01', '2025-11-28 09:41:06', 1, 0),
(21, 11, 54, '2025-11-27 13:08:01', NULL, 0, 0),
(22, 10, 40, '2025-11-27 13:15:44', '2026-03-25 09:08:42', 0, 0),
(23, 12, 25, '2025-11-28 08:31:08', '2025-11-28 08:31:10', 1, 0),
(24, 12, 54, '2025-11-28 08:31:08', NULL, 0, 0),
(25, 13, 25, '2025-11-28 08:31:15', '2025-11-28 08:31:15', 1, 0),
(26, 13, 43, '2025-11-28 08:31:15', NULL, 0, 0),
(27, 14, 25, '2025-11-28 08:31:16', '2025-11-28 08:31:20', 1, 0),
(28, 14, 57, '2025-11-28 08:31:16', NULL, 0, 0),
(29, 15, 25, '2025-11-28 09:57:43', '2025-11-29 07:44:22', 1, 0),
(30, 15, 7, '2025-11-28 09:57:43', NULL, 0, 0),
(31, 16, 40, '2026-03-20 17:57:59', '2026-03-24 08:05:23', 1, 0),
(32, 16, 62, '2026-03-20 17:57:59', NULL, 0, 0),
(33, 17, 73, '2026-03-20 17:58:28', '2026-03-20 18:00:29', 1, 0),
(34, 17, 40, '2026-03-20 17:58:28', '2026-03-24 09:10:42', 0, 0),
(35, 18, 73, '2026-03-20 18:00:29', '2026-03-20 18:00:29', 1, 0),
(36, 18, 79, '2026-03-20 18:00:29', '2026-03-24 11:31:40', 0, 0),
(37, 19, 40, '2026-03-24 08:15:50', '2026-03-24 11:52:06', 1, 0),
(38, 19, 79, '2026-03-24 08:15:50', '2026-03-24 11:52:25', 0, 0),
(39, 20, 79, '2026-03-24 11:32:00', '2026-03-24 11:32:00', 1, 0),
(40, 20, 24, '2026-03-24 11:32:00', NULL, 0, 0),
(41, 3, 79, '2026-03-24 11:53:44', '2026-04-07 17:08:29', 0, 0),
(42, 3, 76, '2026-03-24 11:54:05', NULL, 0, 0),
(43, 3, 68, '2026-03-25 09:09:19', NULL, 0, 0),
(44, 21, 40, '2026-03-25 09:09:59', '2026-04-07 16:53:09', 1, 0),
(45, 21, 24, '2026-03-25 09:09:59', NULL, 0, 0),
(46, 22, 40, '2026-04-07 16:53:08', '2026-04-07 16:53:57', 1, 0),
(48, 22, 54, '2026-04-07 16:53:47', NULL, 0, 0);

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
(3, 'test', 'group', 40, 0, '2026-04-07 16:54:36', '2025-11-27 12:10:25'),
(4, 'test1', 'group', 25, 0, '2025-11-27 12:18:05', '2025-11-27 12:18:05'),
(5, 'DM_25_48', 'direct', 25, 0, '2025-11-27 12:37:27', '2025-11-27 12:32:21'),
(6, 'DM_25_24', 'direct', 25, 0, '2025-11-27 12:38:15', '2025-11-27 12:37:35'),
(7, 'DM_25_55', 'direct', 25, 0, '2025-11-27 12:37:59', '2025-11-27 12:37:52'),
(8, 'DM_25_40', 'direct', 25, 0, '2026-03-24 09:32:35', '2025-11-27 12:39:14'),
(9, 'it goup', 'group', 25, 0, '2025-11-27 12:45:52', '2025-11-27 12:40:02'),
(10, 'it staff', 'group', 40, 0, '2025-11-28 09:34:31', '2025-11-27 12:56:07'),
(11, 'DM_40_54', 'direct', 40, 0, '2025-11-27 13:08:01', '2025-11-27 13:08:01'),
(12, 'DM_25_54', 'direct', 25, 0, '2025-11-28 08:31:08', '2025-11-28 08:31:08'),
(13, 'DM_25_43', 'direct', 25, 0, '2025-11-28 08:31:15', '2025-11-28 08:31:15'),
(14, 'DM_25_57', 'direct', 25, 0, '2025-11-28 08:31:16', '2025-11-28 08:31:16'),
(15, 'DM_25_7', 'direct', 25, 0, '2025-11-28 13:38:44', '2025-11-28 09:57:43'),
(16, 'DM_40_62', 'direct', 40, 0, '2026-03-20 17:58:02', '2026-03-20 17:57:59'),
(17, 'DM_73_40', 'direct', 73, 0, '2026-03-20 17:59:56', '2026-03-20 17:58:28'),
(18, 'DM_73_79', 'direct', 73, 0, '2026-03-20 18:00:29', '2026-03-20 18:00:29'),
(19, 'DM_40_79', 'direct', 40, 0, '2026-03-24 11:52:06', '2026-03-24 08:15:50'),
(20, 'DM_79_24', 'direct', 79, 0, '2026-03-24 11:32:00', '2026-03-24 11:32:00'),
(21, 'DM_40_24', 'direct', 40, 0, '2026-03-25 09:10:03', '2026-03-25 09:09:59'),
(22, 'demo ', 'group', 40, 0, '2026-04-07 16:53:08', '2026-04-07 16:53:08');

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
-- Table structure for table `daily_tasks`
--

CREATE TABLE `daily_tasks` (
  `daily_task_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `priority` enum('low','medium','high') NOT NULL DEFAULT 'medium',
  `status` enum('todo','in_progress','done') NOT NULL DEFAULT 'todo',
  `task_date` date NOT NULL,
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `category` varchar(100) DEFAULT 'general',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `daily_tasks`
--

INSERT INTO `daily_tasks` (`daily_task_id`, `user_id`, `title`, `description`, `priority`, `status`, `task_date`, `start_time`, `end_time`, `category`, `notes`, `created_at`, `updated_at`) VALUES
(1, 40, 'test daily task', 'test daily task', 'medium', 'done', '2026-03-18', '16:35:00', '15:38:00', 'general', NULL, '2026-03-18 12:41:28', '2026-03-18 12:41:53'),
(2, 40, 'some thing', 'something', 'high', 'todo', '2026-04-07', '07:40:00', '19:42:00', 'meeting', NULL, '2026-04-07 16:41:18', '2026-04-07 16:41:18'),
(3, 40, 'test ', 'tets ', 'high', 'done', '2026-08-10', '23:03:00', '15:03:00', 'meeting', NULL, '2026-08-10 08:03:34', '2026-08-10 08:04:13');

-- --------------------------------------------------------

--
-- Table structure for table `data_quality_checks`
--

CREATE TABLE `data_quality_checks` (
  `check_id` int(11) NOT NULL,
  `action_plan_id` int(11) NOT NULL,
  `reporting_period` varchar(20) DEFAULT NULL,
  `is_valid` tinyint(1) DEFAULT 0,
  `is_reliable` tinyint(1) DEFAULT 0,
  `is_timely` tinyint(1) DEFAULT 0,
  `is_complete` tinyint(1) DEFAULT 0,
  `is_accurate` tinyint(1) DEFAULT 0,
  `is_integral` tinyint(1) DEFAULT 0,
  `supervisor_id` int(11) DEFAULT NULL,
  `supervisor_note` text DEFAULT NULL,
  `signed_off_at` timestamp NULL DEFAULT NULL,
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `data_quality_checks`
--

INSERT INTO `data_quality_checks` (`check_id`, `action_plan_id`, `reporting_period`, `is_valid`, `is_reliable`, `is_timely`, `is_complete`, `is_accurate`, `is_integral`, `supervisor_id`, `supervisor_note`, `signed_off_at`, `submitted_at`) VALUES
(1, 1032, '2026-08', 1, 1, 1, 1, 0, 0, NULL, NULL, NULL, '2026-08-10 07:53:14');

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
(18, 'Software development'),
(50, 'Plan and followup ');

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
  `sex` enum('M','F') DEFAULT NULL,
  `telegram_username` varchar(100) DEFAULT NULL,
  `telegram_chat_id` bigint(20) DEFAULT NULL,
  `position` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `employees`
--

INSERT INTO `employees` (`employee_id`, `name`, `role_id`, `department_id`, `supervisor_id`, `fname`, `lname`, `email`, `phone`, `sex`, `telegram_username`, `telegram_chat_id`, `position`) VALUES
(47, 'admin admin', 1, 2, 1, 'admin', 'admin', 'admin@email.com', '123-456-7890', 'M', NULL, NULL, NULL),
(49, 'senayt', 3, 2, 73, 'senayt', 'Brihan', 'senayt@itp.et', '0933499093', 'M', NULL, NULL, NULL),
(50, 'Smegnew', 5, 2, 49, 'Smegnew', 'Asemie', 'simegn@itp.org', '099000000', 'M', NULL, NULL, NULL),
(58, 'nebyat', 6, 17, 147, 'Nebyat', 'Tsegabirhan', 'nebyat@itp.et', '0900000000', 'F', NULL, NULL, NULL),
(71, 'admin', 1, 2, 72, 'admin', 'admin', 'adminadmin@itp.et', '09373773333', 'M', NULL, NULL, NULL),
(72, 'Olana', 2, 2, NULL, 'olana', 'olana', 'olana@itp.et', '09373773333', 'M', NULL, NULL, NULL),
(73, 'Getachew', 9, NULL, 72, 'Getachew', 'Atinte', 'getachew@itp.et', '09373773333', 'M', NULL, NULL, NULL),
(74, 'Habtam', 6, 1, 73, 'Habtamua', 'kebede', 'habtam@itp.et', '0933499097', 'F', NULL, NULL, NULL),
(76, 'Ermiyas', 5, 3, 49, 'Ermias', 'Ketema', 'ermiyas@itp.et', '090000000', 'M', NULL, NULL, NULL),
(77, 'Walelign', 6, 3, 76, 'Walelign', 'Abateneh', 'walelign@itp.et', '0988883388', 'M', NULL, NULL, NULL),
(103, 'Getachew Atinte', 9, NULL, 72, 'Atinte', 'Getachew', 'getachew@itpark.et', '0911000000', 'M', NULL, NULL, NULL),
(104, 'Merso Gobena', 6, 2, 50, 'Merso', 'Gobena', 'merso@itpark.et', '090000000', 'M', NULL, NULL, NULL),
(106, 'Eskedar Teshager', 6, 2, 50, 'Eskedar ', 'Teshager', 'eskedar@itpark.et', '0911000000', 'F', NULL, NULL, NULL),
(107, 'Samuel Medihn', 8, 2, 72, 'Samuel ', 'medhn', 'samuel@itpark.et', '091100000', 'M', NULL, NULL, NULL),
(108, 'Yesuf Fanta', 8, 2, 104, 'Yesuf', 'Fenta', 'yesuf@itpark.et', '0900000000', 'M', NULL, NULL, NULL),
(109, 'Ezira', 1, NULL, 72, 'Ezira', 'Mantegaftot', 'ezira@itpark.et', '091100000', 'M', NULL, NULL, NULL),
(110, 'Yosef Kinfe', 8, 1, 74, 'Yosef', 'Kinfe', 'yosef@itpark.et', '0900000000', 'M', NULL, NULL, NULL),
(111, 'Sintayew', 8, 1, 74, 'Sintayew ', 'Mogese', 'sintayew@itpark.et', '0900000000', 'F', NULL, NULL, NULL),
(112, 'Arega', 8, 1, 74, 'Arega', 'Asalifew', 'arega@itpark.et', '0900000000', 'M', NULL, NULL, NULL),
(113, 'Birtukan', 8, 1, 74, 'Birtukan', 'Gemechu', 'birtukan@itpark.et', '0900000000', 'F', NULL, NULL, NULL),
(114, 'Sisaynesh', 8, 1, 74, 'Sisaynesh ', 'Gizaw', 'sisaynesh@itpark.et', '0900000000', 'F', NULL, NULL, NULL),
(115, 'Yetemegn', 8, 1, 74, 'Yetemegn', 'Andarge', 'yetemegn@itpark.et', '0900000000', 'F', NULL, NULL, NULL),
(116, 'Erimias Ketema', 5, 3, 49, 'Ermias ', 'Keteme', 'ermiasketeme@itpark.et', '0916000000', 'M', NULL, NULL, NULL),
(117, 'Hayal Tamrat', 8, 2, 58, 'Hayal', 'Tamrat', 'hayal@itpark.et', '0916048977', 'M', NULL, NULL, NULL),
(118, 'Desta Bekele', 6, 3, 116, 'Desta', 'Bekele', 'desta@itpark.et', '0911000000', 'M', NULL, NULL, NULL),
(119, 'Sintayehu Tesfaye', 8, 3, 118, 'Sintayehu', 'Tesfaye', 'sintayehu@itpark.et', '0910000000', 'M', NULL, NULL, NULL),
(120, 'Kasu Adare', 8, 3, 118, 'Kasu ', 'Adare', 'kasu@itpark.et', '0910000000', 'M', NULL, NULL, NULL),
(122, 'Wonde Suleman', 8, 3, 118, 'Wonde', 'Suleman', 'wonde@itpark.et', '0910000000', 'M', NULL, NULL, NULL),
(123, 'Eyasu Yeshitila', 8, 3, 118, 'Eyasu', 'Yeshitila', 'eyasu@itpark.et', '0910000000', 'M', NULL, NULL, NULL),
(125, 'Alemayehu Deresa', 8, 3, 118, 'Alemayehu', 'Deresa', 'alemayehu@itpark.et', '0910000000', 'M', NULL, NULL, NULL),
(126, 'Amanuel Girma', 8, 3, 77, 'Amanual', 'Girma', 'amanuelgirma@itpark.et', '0911000000', 'M', NULL, NULL, NULL),
(128, 'Mihretu Debebe', 8, 3, 116, 'Mihretu', 'Debebe', 'mihretu@itpark.et', '0910000000', 'M', NULL, NULL, NULL),
(129, 'Birhanu Legese', 8, 3, 116, 'Birhanu', 'Legese', 'birhanu@itpark.et', '0910000000', 'M', NULL, NULL, NULL),
(130, 'Melat Bezu', 8, 3, 77, 'Melat', 'Bezu', 'melatbezu@itpark.et', '0911000000', 'F', NULL, NULL, NULL),
(131, 'Teshale', 8, 1, 74, 'Teshale ', 'Mola', 'teshale@itpark.et', '0900000000', 'M', NULL, NULL, NULL),
(132, 'Getahun', 8, 1, 74, 'Getahun', 'Faji', 'getahun@itpark.et', '0900000000', 'M', NULL, NULL, NULL),
(133, 'Gelana', 8, 1, 74, 'Gelana', 'Olana', 'gelana@itpark.et', '0900000000', 'M', NULL, NULL, NULL),
(134, 'Tsehay', 8, 1, 74, 'Tsehay', 'Alemu', 'tsehay@itpark.et', '0900000000', 'F', NULL, NULL, NULL),
(135, 'Lemlem', 8, 1, 74, 'Lemlem', 'Degefe', 'lemlem@itpark.et', '0900000000', 'F', NULL, NULL, NULL),
(136, 'Walelign Abera', 8, 4, 103, 'Walelign', 'Abera', 'walelign@itpark.et', '0900000000', 'M', NULL, NULL, NULL),
(137, 'Fetane Aage', 8, 5, 103, 'Fetane', 'Arage', 'fetane@itpark.et', '0900000000', 'M', NULL, NULL, NULL),
(138, 'Petros', 8, 6, 103, 'Petros', 'Abraham', 'petros@itpark.et', '0900000000', 'M', NULL, NULL, NULL),
(139, 'hayal Tamrat', 8, NULL, 72, 'hayal', 'Tamrat', 'hayaltamrat@gmail.com', '0916048978', 'M', NULL, NULL, NULL),
(141, 'hayal Tamrat', 7, 2, 58, 'hayal', 'Tamrat', 'Hayaltamrat1@gmail.com', '0916048977', 'M', NULL, NULL, NULL),
(142, 'belete esubalew', 29, NULL, NULL, 'belete', 'esubalew', 'belete@itp.et', '0913566735', 'M', NULL, NULL, NULL),
(143, 'olana abebe', 2, 10, 142, 'olana', 'abebe', 'olanaabebe@itp.et', '0913566735', 'M', NULL, NULL, NULL),
(144, 'walelgn abera', 30, NULL, 143, 'walelgn', 'abera', 'walelgnabera@itp.et', '0913566735', 'M', NULL, NULL, NULL),
(145, 'corporate admin', 31, NULL, 143, 'corporate', 'admin', 'coporateadmin@itp.et', '0913566735', 'M', NULL, NULL, NULL),
(146, 'tsuhayu directorate', 5, 11, 143, 'tsuhayu', 'directorate', 'tsehayu@itp.et', '0913566735', 'M', NULL, NULL, NULL),
(147, 'it deparment', 6, 14, 146, 'it', 'deparment', 'itdepartment@itp.et', '0913566735', 'M', NULL, NULL, NULL),
(148, 'software section', 7, 18, 147, 'software', 'section', 'softwaresection@itp.et', '0913566735', 'F', NULL, NULL, NULL),
(149, 'Hayal Tamrat', 8, 18, 148, 'Hayal', 'Tamrat Girum', 'hayaltamrat@itp.et', '0913566735', 'M', 'https://t.me/Hayal_tamrat', 6158593976, NULL),
(150, 'ecubation department', 6, 16, 146, 'ecubation', 'department', 'encubationdepartment@itp.et', '0913566735', 'M', NULL, NULL, NULL),
(151, 'simegnew asme', 7, 15, 150, 'simegnew', 'asme', 'simegnewasme@itp.et', '0916048977', 'M', NULL, NULL, NULL),
(152, 'Million  Goraw', 6, NULL, NULL, 'Million ', 'Goraw', 'Milliongoraw@gmail.com', '0916048977', 'M', NULL, NULL, NULL),
(153, 'feruz  koricho', 9, 50, 143, 'feruz ', 'koricho', 'feruzkorichoyimer@gmail.com', '0913566735', 'F', '@ethiocloud', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `employee_positions`
--

CREATE TABLE `employee_positions` (
  `id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `org_node_id` int(11) NOT NULL,
  `is_primary` tinyint(1) DEFAULT 0,
  `is_delegation` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `position_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `employee_positions`
--

INSERT INTO `employee_positions` (`id`, `employee_id`, `org_node_id`, `is_primary`, `is_delegation`, `created_at`, `position_id`) VALUES
(1, 151, 13, 1, 0, '2026-03-19 11:10:44', NULL),
(2, 151, 15, 0, 1, '2026-03-19 11:11:39', NULL),
(3, 151, 16, 0, 1, '2026-03-19 11:11:50', NULL),
(4, 146, 11, 1, 0, '2026-03-19 11:12:47', NULL),
(5, 149, 52, 1, 0, '2026-03-19 11:21:25', NULL),
(6, 109, 55, 1, 0, '2026-03-20 05:31:29', NULL),
(7, 152, 14, 1, 1, '2026-03-20 05:38:43', NULL),
(8, 152, 17, 0, 1, '2026-03-20 05:39:19', NULL),
(9, 152, 18, 0, 1, '2026-03-20 05:39:35', NULL),
(10, 143, 10, 1, 0, '2026-03-20 05:40:11', NULL),
(11, 142, 9, 1, 0, '2026-03-20 05:41:17', NULL),
(12, 139, 52, 1, 0, '2026-03-20 11:47:21', NULL),
(13, 72, 10, 1, 0, '2026-03-20 14:00:50', NULL),
(14, 146, 14, 1, 0, '2026-03-23 06:56:06', NULL),
(15, 117, 19, 1, 0, '2026-03-23 06:56:06', NULL),
(17, 109, 55, 1, 0, '2026-03-23 08:48:56', NULL),
(18, 139, 26, 1, 0, '2026-03-23 08:48:56', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `evaluations`
--

CREATE TABLE `evaluations` (
  `evaluation_id` int(11) NOT NULL,
  `type` enum('mid_term','annual','thematic') NOT NULL,
  `title` varchar(255) NOT NULL,
  `timing` varchar(100) DEFAULT NULL,
  `key_questions` text DEFAULT NULL,
  `led_by` varchar(255) DEFAULT NULL,
  `status` enum('planned','in_progress','completed') DEFAULT 'planned',
  `findings` text DEFAULT NULL,
  `recommendations` text DEFAULT NULL,
  `period_year` int(11) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `evaluations`
--

INSERT INTO `evaluations` (`evaluation_id`, `type`, `title`, `timing`, `key_questions`, `led_by`, `status`, `findings`, `recommendations`, `period_year`, `created_by`, `created_at`) VALUES
(1, 'thematic', 'test', NULL, 'test', 'test', 'planned', NULL, NULL, 2026, 25, '2026-08-09 18:06:08');

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
(9, 81, 83, 25, '2025-11-28 13:39:40'),
(10, 89, 90, 73, '2026-03-20 18:00:29');

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
  `employee_id` int(11) NOT NULL,
  `weight` float DEFAULT 100,
  `pillar_id` int(11) DEFAULT NULL,
  `start_year` int(11) DEFAULT NULL,
  `end_year` int(11) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `goals`
--

INSERT INTO `goals` (`goal_id`, `user_id`, `name`, `description`, `created_at`, `updated_at`, `created_by`, `year`, `quarter`, `employee_id`, `weight`, `pillar_id`, `start_year`, `end_year`, `is_active`) VALUES
(225, 80, 'ግብ 1 .  ዓለም አቀፍ ደረጃውን የጠበቀ እና ዘመናዊ መሰረተ ልማት ማልማት', 'Smart infrastructure and Digital Platform ', '2026-07-15 11:30:45', '2026-08-11 16:00:35', NULL, 2019, '1', 153, 12, 1, 2018, 2024, 1),
(226, 40, 'ግብ 2 የፓርኩን ተወዳዳሪነትና ገፅታን በማጠናከር ኢንቨስትመንትን መሳብ', 'የፓርኩን ተወዳዳሪነትና ገፅታን በማጠናከር ኢንቨስትመንትን መሳብ', '2026-08-10 20:17:45', '2026-08-11 15:59:57', NULL, 2019, '1', 109, 10, 1, 2018, 2024, 1);

-- --------------------------------------------------------

--
-- Table structure for table `goal_quarter_activations`
--

CREATE TABLE `goal_quarter_activations` (
  `id` int(11) NOT NULL,
  `goal_id` int(11) NOT NULL,
  `year` int(11) NOT NULL,
  `quarter` varchar(10) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `goal_quarter_activations`
--

INSERT INTO `goal_quarter_activations` (`id`, `goal_id`, `year`, `quarter`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 225, 2019, '1', 1, '2026-08-11 15:30:15', '2026-08-11 21:51:55'),
(2, 225, 2019, '2', 0, '2026-08-11 15:30:19', '2026-08-11 15:35:57'),
(5, 226, 2019, '2', 0, '2026-08-11 15:35:42', '2026-08-11 15:35:42'),
(6, 226, 2019, '3', 0, '2026-08-11 15:35:42', '2026-08-11 15:35:42'),
(7, 226, 2019, '4', 0, '2026-08-11 15:35:43', '2026-08-11 15:35:43'),
(8, 226, 2020, '1', 0, '2026-08-11 15:35:44', '2026-08-11 15:35:44'),
(9, 226, 2020, '2', 0, '2026-08-11 15:35:45', '2026-08-11 15:35:45'),
(10, 226, 2020, '4', 0, '2026-08-11 15:35:46', '2026-08-11 15:35:46'),
(11, 226, 2023, '3', 0, '2026-08-11 15:35:49', '2026-08-11 15:35:49'),
(12, 226, 2023, '4', 0, '2026-08-11 15:35:49', '2026-08-11 15:35:49'),
(13, 226, 2023, '2', 0, '2026-08-11 15:35:50', '2026-08-11 15:35:50'),
(14, 226, 2024, '1', 0, '2026-08-11 15:35:51', '2026-08-11 15:35:51'),
(16, 225, 2019, '4', 0, '2026-08-11 15:35:59', '2026-08-11 15:35:59'),
(17, 225, 2023, '2', 0, '2026-08-11 15:36:00', '2026-08-11 15:36:00'),
(18, 225, 2023, '1', 0, '2026-08-11 15:36:00', '2026-08-11 15:36:00'),
(19, 225, 2023, '3', 0, '2026-08-11 15:36:01', '2026-08-11 15:36:01'),
(20, 225, 2023, '4', 0, '2026-08-11 15:36:02', '2026-08-11 15:36:02'),
(21, 225, 2020, '3', 0, '2026-08-11 15:36:04', '2026-08-11 15:36:04'),
(22, 225, 2020, '2', 0, '2026-08-11 15:36:05', '2026-08-11 15:36:05'),
(23, 225, 2020, '1', 0, '2026-08-11 15:36:06', '2026-08-11 15:36:06'),
(24, 225, 2020, '4', 0, '2026-08-11 15:36:08', '2026-08-11 15:36:08'),
(25, 225, 2024, '1', 0, '2026-08-11 15:36:09', '2026-08-11 15:36:09'),
(26, 226, 2023, '1', 0, '2026-08-11 15:36:19', '2026-08-11 15:36:19'),
(27, 226, 2020, '3', 0, '2026-08-11 15:36:19', '2026-08-11 15:36:19'),
(28, 226, 2024, '2', 0, '2026-08-11 15:36:20', '2026-08-11 15:36:20'),
(29, 226, 2024, '3', 0, '2026-08-11 15:36:20', '2026-08-11 15:36:20'),
(30, 226, 2024, '4', 0, '2026-08-11 15:36:21', '2026-08-11 15:36:21'),
(31, 226, 2021, '1', 0, '2026-08-11 15:36:21', '2026-08-11 15:36:21'),
(32, 226, 2021, '2', 0, '2026-08-11 15:36:22', '2026-08-11 15:36:22'),
(33, 226, 2021, '3', 0, '2026-08-11 15:36:23', '2026-08-11 15:36:23'),
(34, 226, 2021, '4', 0, '2026-08-11 15:36:24', '2026-08-11 15:36:24'),
(35, 226, 2022, '1', 0, '2026-08-11 15:36:24', '2026-08-11 15:36:24'),
(36, 226, 2022, '2', 0, '2026-08-11 15:36:25', '2026-08-11 15:36:25'),
(37, 226, 2022, '3', 0, '2026-08-11 15:36:25', '2026-08-11 15:36:25'),
(38, 226, 2022, '4', 0, '2026-08-11 15:36:25', '2026-08-11 16:00:47'),
(39, 225, 2019, '3', 0, '2026-08-11 15:36:29', '2026-08-11 15:36:29'),
(40, 225, 2024, '2', 0, '2026-08-11 15:36:30', '2026-08-11 15:36:30'),
(41, 225, 2024, '3', 0, '2026-08-11 15:36:30', '2026-08-11 15:36:30'),
(42, 225, 2024, '4', 0, '2026-08-11 15:36:31', '2026-08-11 15:36:31'),
(43, 225, 2021, '1', 0, '2026-08-11 15:36:31', '2026-08-11 15:36:31'),
(44, 225, 2021, '2', 0, '2026-08-11 15:36:32', '2026-08-11 15:36:32'),
(45, 225, 2021, '3', 0, '2026-08-11 15:36:32', '2026-08-11 15:36:32'),
(46, 225, 2021, '4', 0, '2026-08-11 15:36:32', '2026-08-11 15:36:32'),
(47, 225, 2022, '1', 0, '2026-08-11 15:36:33', '2026-08-11 15:36:33'),
(48, 225, 2022, '2', 0, '2026-08-11 15:36:33', '2026-08-11 15:36:33'),
(49, 225, 2022, '3', 0, '2026-08-11 15:36:34', '2026-08-11 15:36:34'),
(50, 225, 2022, '4', 0, '2026-08-11 15:36:34', '2026-08-11 15:36:34'),
(51, 226, 2019, '1', 1, '2026-08-11 15:48:10', '2026-08-11 16:01:35'),
(54, 226, 2018, '1', 0, '2026-08-11 16:00:00', '2026-08-11 16:00:00'),
(55, 226, 2018, '2', 0, '2026-08-11 16:00:01', '2026-08-11 16:00:01'),
(56, 226, 2018, '3', 0, '2026-08-11 16:00:02', '2026-08-11 16:00:02'),
(59, 225, 2018, '4', 1, '2026-08-11 16:00:39', '2026-08-11 16:01:09'),
(60, 225, 2018, '3', 0, '2026-08-11 16:00:40', '2026-08-11 16:00:40'),
(61, 225, 2018, '2', 0, '2026-08-11 16:00:41', '2026-08-11 16:00:41'),
(64, 225, 2018, '1', 0, '2026-08-11 16:01:10', '2026-08-11 16:01:10'),
(66, 226, 2018, '4', 1, '2026-08-11 16:01:37', '2026-08-11 16:04:12');

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
-- Table structure for table `kpi_quarter_activations`
--

CREATE TABLE `kpi_quarter_activations` (
  `id` int(11) NOT NULL,
  `specific_objective_id` int(11) NOT NULL,
  `year` int(11) NOT NULL,
  `quarter` varchar(10) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `kpi_quarter_activations`
--

INSERT INTO `kpi_quarter_activations` (`id`, `specific_objective_id`, `year`, `quarter`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 734, 2018, '4', 0, '2026-08-11 16:36:15', '2026-08-11 16:36:15');

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
(9, 'wqqq', '', 'team', '2025-12-06 03:29:00', '2026-02-19 03:31:00', '', '', '', '', 'scheduled', 'medium', 0, '', 40, '2025-11-29 08:31:56', '2025-11-29 08:31:56', 0, '', NULL),
(10, 'test', 'test', 'team', '2026-03-24 11:29:00', '2026-03-24 11:54:00', 'test', '', '', '', 'scheduled', 'high', 0, '', 40, '2026-03-24 07:30:49', '2026-03-24 07:30:49', 0, 'test', NULL),
(11, 'test', 'test', 'team', '2026-03-24 10:40:00', '2026-03-24 11:37:00', 'smart...', '', '', '', 'scheduled', 'medium', 0, '', 79, '2026-03-24 07:37:47', '2026-03-24 07:37:47', 0, 'scrum', NULL),
(12, 'tets', 'tets', 'department', '2026-08-10 12:08:00', '2026-08-10 13:06:00', 'smart ...', '', '', '', 'scheduled', 'medium', 0, '', 40, '2026-08-10 08:07:56', '2026-08-10 08:07:56', 0, 'tets ', NULL);

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
(2, 7, 'power.jpg', 'uploads/meeting_attachments/attachments-1764404068410-26135534.jpg', 'image/jpeg', 482302, 25, '2025-11-29 08:14:28'),
(3, 10, 'DIKO-Receipt-DIKO-18098e6a-3cb4-4fab-88e9-a2b7bd7dd7c7.pdf', 'uploads\\meeting_attachments\\attachments-1774337449502-729872282.pdf', 'application/pdf', 7058540, 40, '2026-03-24 07:30:49'),
(4, 11, 'photo_2026-03-23_17-00-16.jpg', 'uploads\\meeting_attachments\\attachments-1774337867014-836665245.jpg', 'image/jpeg', 196429, 79, '2026-03-24 07:37:47');

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
(42, 9, 25, 'required', 'pending', 0, 1, 0, NULL, NULL, NULL, '2025-11-29 08:31:56'),
(43, 10, 40, 'organizer', 'accepted', 0, 0, 0, NULL, NULL, NULL, '2026-03-24 07:30:49'),
(44, 10, 48, 'required', 'pending', 0, 1, 0, NULL, NULL, NULL, '2026-03-24 07:30:49'),
(45, 11, 79, 'organizer', 'accepted', 0, 0, 0, NULL, NULL, NULL, '2026-03-24 07:37:47'),
(46, 11, 76, 'required', 'pending', 0, 1, 0, NULL, NULL, NULL, '2026-03-24 07:37:47'),
(47, 11, 48, 'required', 'pending', 0, 1, 0, NULL, NULL, NULL, '2026-03-24 07:37:47'),
(48, 11, 68, 'required', 'pending', 0, 1, 0, NULL, NULL, NULL, '2026-03-24 07:37:47'),
(49, 11, 67, 'required', 'pending', 0, 1, 0, NULL, NULL, NULL, '2026-03-24 07:37:47'),
(50, 11, 40, 'required', 'tentative', 0, 1, 0, NULL, NULL, 'test ', '2026-03-24 07:37:47'),
(51, 11, 62, 'required', 'pending', 0, 1, 0, NULL, NULL, NULL, '2026-03-24 07:37:47'),
(52, 11, 24, 'required', 'pending', 0, 1, 0, NULL, NULL, NULL, '2026-03-24 07:37:47'),
(53, 12, 24, 'required', 'pending', 0, 1, 0, NULL, NULL, NULL, '2026-08-10 08:07:56'),
(54, 12, 40, 'organizer', 'accepted', 0, 0, 0, NULL, NULL, NULL, '2026-08-10 08:07:56'),
(55, 12, 69, 'required', 'pending', 0, 1, 0, NULL, NULL, NULL, '2026-08-10 08:07:56'),
(56, 12, 73, 'required', 'tentative', 0, 1, 0, NULL, NULL, 'I cant ', '2026-08-10 08:07:56'),
(57, 12, 76, 'required', 'pending', 0, 1, 0, NULL, NULL, NULL, '2026-08-10 08:07:56');

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

--
-- Dumping data for table `meeting_reminders`
--

INSERT INTO `meeting_reminders` (`reminder_id`, `meeting_id`, `user_id`, `reminder_time`, `reminder_type`, `sent`, `sent_at`, `created_at`) VALUES
(1, 11, 76, '2026-03-24 10:40:00', 'both', 1, '2026-03-24 10:40:00', '2026-03-24 07:40:00'),
(2, 12, 76, '2026-08-10 12:05:11', 'both', 1, '2026-08-10 12:05:11', '2026-08-10 09:05:11');

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
(2, 'User Management', '/UserTable', 'bi-people', 24, 2, NULL, 1, '2025-08-12 09:45:03', '2026-03-25 07:42:24'),
(3, 'Add Employee', '/EmployeeForm', 'bi-person-plus', 24, 1, NULL, 1, '2025-08-12 09:45:03', '2026-03-25 07:51:48'),
(4, 'Manage Accounts', '/UserTable', 'bi-table', 24, 2, NULL, 1, '2025-08-12 09:45:03', '2026-03-25 07:52:07'),
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
(20, 'My Workspace', '#', 'bi-person-workspace', NULL, 7, NULL, 1, '2025-08-12 09:45:03', '2025-08-12 09:45:03'),
(21, 'My Plans', '/staff/plans', 'bi-journal-check', 20, 1, NULL, 1, '2025-08-12 09:45:03', '2025-08-12 09:45:03'),
(22, 'My Reports', '/staff/reports', 'bi-journal-text', 20, 2, NULL, 1, '2025-08-12 09:45:03', '2025-08-12 09:45:03'),
(23, 'My Tasks', '/staff/tasks', 'bi-check2-square', 20, 3, NULL, 1, '2025-08-12 09:45:03', '2025-08-12 09:45:03'),
(24, 'System Administration', '#', 'bi-gear-fill', NULL, 8, NULL, 1, '2025-08-12 09:45:03', '2025-08-12 09:45:03'),
(25, 'Settings', '/settings', 'bi-gear', 24, 1, NULL, 1, '2025-08-12 09:45:03', '2025-08-12 09:45:03'),
(26, 'Menu Permissions', '/menu-permissions', 'bi-shield-lock', 24, 2, NULL, 1, '2025-08-12 09:45:03', '2025-08-12 09:45:03'),
(27, 'System Logs', '/admin/logs', 'bi-file-text', 24, 3, NULL, 1, '2025-08-12 09:45:03', '2025-08-12 09:45:03'),
(29, 'Profile', '/ProfilePictureUpload', 'bi-person-circle', NULL, 9, NULL, 1, '2025-08-12 09:45:03', '2025-08-12 09:45:03'),
(30, 'Communication', '#', 'bi-chat-dots', NULL, 10, NULL, 0, '2025-08-12 09:45:03', '2026-03-25 07:08:35'),
(31, 'Messages', '/messages', 'bi-envelope', 30, 1, NULL, 0, '2025-08-12 09:45:03', '2026-03-25 07:12:08'),
(32, 'Notifications', '/notifications', 'bi-bell', 30, 2, NULL, 1, '2025-08-12 09:45:03', '2025-08-12 09:45:03'),
(33, 'Finance & Resources', '#', 'bi-currency-dollar', NULL, 11, NULL, 0, '2025-08-12 09:45:03', '2026-03-25 07:08:42'),
(34, 'Budget Planning', '/finance/budget', 'bi-calculator', 33, 1, NULL, 0, '2025-08-12 09:45:03', '2026-03-25 07:10:45'),
(35, 'Resource Allocation', '/finance/resources', 'bi-pie-chart', 33, 2, NULL, 1, '2025-08-12 09:45:03', '2025-08-12 09:45:03'),
(36, 'Help & Support', '#', 'bi-question-circle', NULL, 12, NULL, 0, '2025-08-12 09:45:03', '2026-03-25 07:08:48'),
(37, 'Documentation', '/help/docs', 'bi-book', 36, 1, NULL, 0, '2025-08-12 09:45:03', '2026-03-25 07:11:45'),
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
(69, 'Organization Structure', '/admin/org-structure', 'bi bi-diagram-3', NULL, 99, NULL, 1, '2025-12-15 13:18:47', '2025-12-15 13:18:47'),
(70, 'Task Management', '#', 'bi-list-check', NULL, 15, NULL, 1, '2026-03-18 12:31:28', '2026-03-18 12:31:28'),
(71, 'Task Assignment', '/tasks/assignment', 'bi-person-plus', 70, 1, NULL, 1, '2026-03-18 12:31:28', '2026-03-18 12:31:28'),
(72, 'My Tasks', '/tasks/management', 'bi-journal-check', 70, 2, NULL, 1, '2026-03-18 12:31:28', '2026-03-18 12:31:28'),
(73, 'Daily Planner', '/tasks/daily', 'bi-calendar-event', 70, 3, NULL, 1, '2026-03-18 12:31:28', '2026-03-18 12:31:28'),
(74, 'Task Breakdowns', '/tasks/breakdown', 'bi-diagram-3', 70, 5, NULL, 1, '2026-03-19 09:01:16', '2026-03-19 09:01:16'),
(75, 'Employee Positions', '/admin/employee-positions', 'bi-diagram-2', 24, 4, NULL, 1, '2026-03-19 11:00:37', '2026-03-25 07:51:38'),
(76, 'Plan Types', '/plan-types', 'bi bi-tags', NULL, 90, 'PlanTypesManager.jsx', 1, '2026-08-07 12:59:24', '2026-08-07 12:59:24'),
(77, 'Action Plan Breakdown', '/plan/action-plan-breakdown', 'bi bi-diagram-3', 45, 55, 'ActionPlanBreakdownPage.jsx', 1, '2026-08-08 04:51:13', '2026-08-08 05:22:25'),
(78, 'M&E Compliance', '/me/compliance', 'bi bi-shield-check', NULL, 60, 'MECompliancePage.jsx', 1, '2026-08-09 16:40:45', '2026-08-09 16:40:45'),
(79, 'Executive Report', '/reports/executive', 'bi bi-bar-chart-steps', NULL, 65, 'ExecutiveReportPage.jsx', 1, '2026-08-09 20:02:54', '2026-08-09 20:02:54'),
(80, 'Plan Pillars', '/plan-pillars', 'bi-columns-gap', 9, 15, 'PlanPillarsPage.jsx', 1, '2026-08-11 12:19:43', '2026-08-11 12:19:43'),
(81, 'Goal Configuration', '/goal-config', 'bi-sliders', 9, 16, 'GoalConfigPage.jsx', 1, '2026-08-11 12:19:43', '2026-08-11 12:19:43');

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
  `message_type` enum('text','image','file','system','plan') DEFAULT 'text',
  `file_path` varchar(500) DEFAULT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `metadata` text DEFAULT NULL,
  `is_edited` tinyint(1) DEFAULT 0,
  `edited_at` timestamp NULL DEFAULT NULL,
  `is_deleted` tinyint(1) DEFAULT 0,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `parent_message_id` int(11) DEFAULT NULL,
  `reaction_count` int(11) DEFAULT 0,
  `sent_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `messages`
--

INSERT INTO `messages` (`message_id`, `conversation_id`, `sender_id`, `receiver_id`, `content`, `message_type`, `file_path`, `file_name`, `metadata`, `is_edited`, `edited_at`, `is_deleted`, `deleted_at`, `parent_message_id`, `reaction_count`, `sent_at`) VALUES
(1, 2, 25, NULL, 'hello', 'text', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-27 12:02:36'),
(2, 5, 25, NULL, 'hello', 'text', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-27 12:37:27'),
(3, 7, 25, NULL, 'ato aman', 'text', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-27 12:37:59'),
(4, 6, 25, NULL, 'ato ezira', 'text', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-27 12:38:15'),
(5, 8, 25, NULL, 'ee sewye', 'text', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-27 12:39:19'),
(6, 8, 40, NULL, 'selam aleka', 'text', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-27 12:39:33'),
(7, 8, 25, NULL, 'qq', 'text', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-27 12:45:21'),
(8, 9, 25, NULL, '[Forwarded] ee sewye', 'text', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-27 12:45:38'),
(9, 9, 25, NULL, '[Forwarded] ee sewye', 'text', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-27 12:45:42'),
(10, 9, 25, NULL, '@null ', 'text', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-27 12:45:52'),
(11, 8, 25, NULL, '@null dasda', 'text', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-27 12:46:08'),
(12, 10, 25, NULL, 'hello', 'text', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-27 12:57:48'),
(13, 10, 25, NULL, 'ehh', 'text', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-27 12:58:30'),
(14, 8, 25, NULL, '[Forwarded] hello', 'text', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-27 13:02:10'),
(15, 8, 25, NULL, '[Forwarded] hello', 'text', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-27 13:02:13'),
(16, 8, 25, NULL, '[Forwarded] hello', 'text', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-27 13:02:17'),
(17, 8, 25, NULL, '[Forwarded] hello', 'text', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-27 13:02:18'),
(18, 10, 25, NULL, 'test', 'text', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-27 13:13:45'),
(19, 10, 40, NULL, 'test replay', 'text', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-27 13:14:07'),
(20, 10, 25, NULL, '@Olana I thinh it is good', 'text', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-27 13:28:12'),
(21, 8, 40, NULL, 'hello sir', 'text', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-27 13:29:25'),
(22, 8, 40, NULL, 'hello sir', 'text', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-27 13:29:28'),
(23, 8, 40, NULL, 'hello', 'text', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-27 13:29:50'),
(24, 1, 40, NULL, '[Forwarded] qq', 'text', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-27 13:35:56'),
(25, 1, 40, NULL, 'asd', 'text', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-27 13:36:20'),
(26, 8, 40, NULL, 'enya', 'text', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-27 13:41:23'),
(27, 10, 40, NULL, 'beseb', 'text', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-27 13:42:01'),
(28, 10, 40, NULL, '@Ezira eeh', 'text', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-27 14:00:53'),
(29, 10, 40, NULL, 'baya', 'text', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-27 14:01:06'),
(30, 8, 40, NULL, '[Forwarded] test', 'text', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-27 14:02:34'),
(31, 3, 25, NULL, 'endet aderk ezira', 'text', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 08:21:12'),
(32, 8, 25, NULL, 'dena aderk ezira', 'text', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 08:21:46'),
(33, 10, 25, NULL, '??', 'text', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 08:37:30'),
(34, 3, 40, NULL, 'hello', 'text', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 08:46:51'),
(35, 3, 40, NULL, 'ymesgen', 'text', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 08:51:23'),
(36, 10, 40, NULL, 'as', 'text', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 09:01:52'),
(37, 10, 40, NULL, 'ds', 'text', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 09:11:08'),
(38, 10, 40, NULL, 'belew', 'text', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 09:11:22'),
(39, 10, 40, NULL, 'dadad', 'text', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 09:11:59'),
(40, 3, 40, NULL, 'sa', 'text', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 09:18:18'),
(41, 3, 40, NULL, 'oriya', 'text', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 09:31:39'),
(42, 10, 40, NULL, 'dadad', 'text', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 09:34:22'),
(43, 10, 40, NULL, 'das', 'text', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 09:34:23'),
(44, 10, 40, NULL, 'dasdas', 'text', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 09:34:23'),
(45, 10, 40, NULL, 'd', 'text', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 09:34:24'),
(46, 10, 40, NULL, 'd', 'text', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 09:34:25'),
(47, 10, 40, NULL, 'ddas', 'text', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 09:34:25'),
(48, 10, 40, NULL, 'ddasdasd', 'text', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 09:34:25'),
(49, 10, 40, NULL, 'dass', 'text', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 09:34:26'),
(50, 10, 40, NULL, 'dad', 'text', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 09:34:26'),
(51, 10, 40, NULL, 'dadasd', 'text', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 09:34:26'),
(52, 10, 40, NULL, 'dadasdasdas', 'text', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 09:34:27'),
(53, 10, 40, NULL, 'assd', 'text', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 09:34:27'),
(54, 10, 40, NULL, 'assdasd', 'text', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 09:34:28'),
(55, 10, 40, NULL, 'da', 'text', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 09:34:28'),
(56, 10, 40, NULL, 'dadas', 'text', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 09:34:28'),
(57, 10, 40, NULL, 'dsa', 'text', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 09:34:29'),
(58, 10, 40, NULL, 'dsaa', 'text', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 09:34:30'),
(59, 10, 40, NULL, 'da', 'text', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 09:34:30'),
(60, 10, 40, NULL, 'a', 'text', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 09:34:31'),
(61, 10, 40, NULL, 'a', 'text', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 09:34:31'),
(62, 8, 40, NULL, 'l', 'text', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 09:37:21'),
(63, 8, 40, NULL, '1', 'text', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 09:41:35'),
(64, 8, 40, NULL, '2', 'text', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 09:41:39'),
(65, 8, 40, NULL, '23', 'text', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 09:41:40'),
(66, 8, 40, NULL, '4', 'text', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 09:41:48'),
(67, 8, 40, NULL, '5', 'text', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 09:41:49'),
(68, 8, 40, NULL, '6', 'text', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 09:41:51'),
(69, 8, 40, NULL, '7', 'text', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 09:41:53'),
(70, 8, 40, NULL, '8', 'text', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 09:41:54'),
(71, 8, 40, NULL, '9', 'text', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 09:41:56'),
(72, 8, 40, NULL, '12', 'text', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 09:41:58'),
(73, 8, 40, NULL, '13', 'text', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 09:42:00'),
(74, 8, 40, NULL, '14', 'text', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 09:42:01'),
(75, 8, 40, NULL, '15', 'text', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 09:42:03'),
(76, 8, 40, NULL, '1', 'text', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 09:42:04'),
(77, 8, 40, NULL, '1', 'text', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 09:42:06'),
(78, 8, 40, NULL, 'd', 'text', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 09:46:44'),
(79, 15, 25, NULL, 'selam', 'text', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 09:57:54'),
(80, 2, 25, NULL, 'a', 'text', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 11:55:54'),
(81, 15, 25, NULL, 'power.jpg', 'image', '/uploads/1764337076677-749029094-power.jpg', 'power.jpg', NULL, 0, NULL, 0, NULL, NULL, 1, '2025-11-28 13:37:56'),
(82, 15, 25, NULL, 'lonchina.txt', 'file', '/uploads/1764337123988-379555737-lonchina.txt', 'lonchina.txt', NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 13:38:44'),
(83, 8, 25, NULL, '[Forwarded] power.jpg', 'image', '/uploads/1764337076677-749029094-power.jpg', 'power.jpg', NULL, 0, NULL, 0, NULL, NULL, 2, '2025-11-28 13:39:40'),
(84, 8, 40, NULL, '123 test', 'text', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2025-11-28 13:45:41'),
(85, 8, 40, NULL, 'test 2', 'text', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 1, '2025-11-28 13:46:15'),
(86, 16, 40, NULL, 'hey', 'text', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2026-03-20 17:58:02'),
(87, 17, 73, NULL, 'ezra', 'text', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2026-03-20 17:58:35'),
(88, 17, 40, NULL, 'hi selam selam', 'text', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2026-03-20 17:59:05'),
(89, 17, 73, NULL, 'photo-1769516414427-210211205.png', 'image', '/uploads/1774029596146-55626248-photo-1769516414427-210211205.png', 'photo-1769516414427-210211205.png', NULL, 0, NULL, 0, NULL, NULL, 0, '2026-03-20 17:59:56'),
(90, 18, 73, NULL, '[Forwarded] photo-1769516414427-210211205.png', 'image', '/uploads/1774029596146-55626248-photo-1769516414427-210211205.png', 'photo-1769516414427-210211205.png', NULL, 0, NULL, 0, NULL, NULL, 1, '2026-03-20 18:00:29'),
(91, 8, 40, NULL, 'what', 'text', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2026-03-24 09:05:50'),
(92, 8, 40, NULL, 'ERP Software', '', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2026-03-24 09:32:35'),
(93, 19, 40, NULL, 'ERP Software', '', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2026-03-24 09:33:02'),
(94, 19, 79, NULL, 'የቢሮ ኪራይ ገቢ', '', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2026-03-24 09:38:22'),
(95, 19, 40, NULL, 'ERP Software', '', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2026-03-24 09:39:42'),
(96, 19, 40, NULL, 'የቢሮ ኪራይ ገቢ', '', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2026-03-24 09:44:04'),
(97, 19, 79, NULL, 'የቢሮ ኪራይ ገቢ', '', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2026-03-24 11:22:00'),
(98, 19, 79, NULL, 'የቢሮ ኪራይ ገቢ', '', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2026-03-24 11:30:31'),
(99, 19, 79, NULL, 'የቢሮ ኪራይ ገቢ', 'plan', NULL, NULL, '{\"plan_id\":372,\"goal\":\"ግብ 2. የቴክኖሎጂ ፓርክ አገልግሎት ጥራት ማሻሻል\",\"detail\":\"የቢሮ ኪራይ ገቢ\",\"status\":\"completed\",\"weight\":\"50\",\"year\":2024}', 0, NULL, 0, NULL, NULL, 2, '2026-03-24 11:50:19'),
(100, 19, 40, NULL, '@Million  Goraw test message', 'text', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2026-03-24 11:52:06'),
(101, 3, 79, NULL, 'የቢሮ ኪራይ ገቢ', 'plan', NULL, NULL, '{\"plan_id\":372,\"goal\":\"ግብ 2. የቴክኖሎጂ ፓርክ አገልግሎት ጥራት ማሻሻል\",\"detail\":\"የቢሮ ኪራይ ገቢ\",\"status\":\"completed\",\"weight\":\"50\",\"year\":2024}', 0, NULL, 0, NULL, NULL, 0, '2026-03-24 12:12:00'),
(102, 3, 40, NULL, 'የክላውድ ሰርቨር ማሳደጊያ', 'plan', NULL, NULL, '{\"plan_id\":345,\"goal\":\"ግብ 1. የIT ካምፓኒዎችን ወደ ፓርኩ በመሳብ የሥራ ዕድልና የውጭ ቀጥተኛ ኢንቨስትመንት መፍጠር\",\"detail\":\"የክላውድ ሰርቨር ማሳደጊያ\",\"status\":\"Pending\",\"weight\":\"10\",\"year\":2017}', 0, NULL, 0, NULL, NULL, 0, '2026-03-25 09:09:37'),
(103, 21, 40, NULL, 'hello', 'text', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2026-03-25 09:10:03'),
(104, 3, 40, NULL, 'የመሠረተ ልማት ዝርጋታ', 'plan', NULL, NULL, '{\"plan_id\":334,\"goal\":\"ግብ 1. የIT ካምፓኒዎችን ወደ ፓርኩ በመሳብ የሥራ ዕድልና የውጭ ቀጥተኛ ኢንቨስትመንት መፍጠር\",\"detail\":\"የመሠረተ ልማት ዝርጋታ\",\"status\":\"Pending\",\"weight\":\"500\",\"year\":2017}', 0, NULL, 0, NULL, NULL, 0, '2026-04-07 16:52:11'),
(105, 3, 40, NULL, 'hell gays what do you think about this plan', 'text', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2026-04-07 16:52:38'),
(106, 3, 40, NULL, 'something', 'text', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2026-04-07 16:54:14'),
(107, 3, 40, NULL, 'EITP_VMMS_Presentation (5).pptx', 'file', '/uploads/1775580854239-167838816-EITP_VMMS_Presentation__5_.pptx', 'EITP_VMMS_Presentation (5).pptx', NULL, 0, NULL, 0, NULL, NULL, 0, '2026-04-07 16:54:14'),
(108, 3, 40, NULL, 'tes', 'text', NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, 0, '2026-04-07 16:54:36'),
(109, 3, 40, NULL, 'ChatGPT Image Mar 25, 2026, 06_07_43 AM.png', 'image', '/uploads/1775580876720-141362684-ChatGPT_Image_Mar_25__2026__06_07_43_AM.png', 'ChatGPT Image Mar 25, 2026, 06_07_43 AM.png', NULL, 0, NULL, 0, NULL, NULL, 1, '2026-04-07 16:54:36');

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `message_reactions`
--

INSERT INTO `message_reactions` (`reaction_id`, `message_id`, `user_id`, `emoji`, `created_at`) VALUES
(1, 81, 25, '❤️', '2025-11-28 13:38:00'),
(2, 83, 40, '❤️', '2025-11-28 13:44:10'),
(3, 90, 79, '????', '2026-03-20 18:01:09'),
(4, 83, 40, '????', '2026-03-24 09:05:25'),
(5, 85, 40, '????', '2026-03-24 09:05:38'),
(7, 99, 40, '????', '2026-03-24 11:51:36'),
(8, 99, 40, '❤️', '2026-03-24 11:51:23'),
(10, 109, 40, '❤️', '2026-04-07 16:54:43');

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
(98, 85, 25, '2026-03-11 06:01:25'),
(99, 87, 40, '2026-03-20 17:58:53'),
(100, 88, 73, '2026-03-20 17:59:18'),
(101, 90, 79, '2026-03-20 18:00:56'),
(102, 89, 40, '2026-03-20 18:01:25'),
(103, 93, 79, '2026-03-24 09:33:14'),
(104, 94, 40, '2026-03-24 09:39:42'),
(105, 95, 79, '2026-03-24 09:41:44'),
(106, 96, 79, '2026-03-24 09:45:34'),
(107, 97, 40, '2026-03-24 11:50:45'),
(108, 98, 40, '2026-03-24 11:50:45'),
(109, 99, 40, '2026-03-24 11:50:45'),
(110, 100, 79, '2026-03-24 11:52:25'),
(111, 31, 79, '2026-03-24 12:11:55'),
(112, 34, 79, '2026-03-24 12:11:55'),
(113, 35, 79, '2026-03-24 12:11:55'),
(114, 40, 79, '2026-03-24 12:11:55'),
(115, 41, 79, '2026-03-24 12:11:55'),
(118, 101, 40, '2026-03-24 12:12:09'),
(119, 102, 79, '2026-03-25 11:14:10'),
(120, 104, 79, '2026-04-07 17:04:17'),
(121, 105, 79, '2026-04-07 17:04:17'),
(122, 106, 79, '2026-04-07 17:04:17'),
(123, 107, 79, '2026-04-07 17:04:17'),
(124, 108, 79, '2026-04-07 17:04:17'),
(125, 109, 79, '2026-04-07 17:04:17');

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
  `attachment` varchar(255) DEFAULT NULL,
  `actual_amount` decimal(15,4) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `monthly_tasks`
--

INSERT INTO `monthly_tasks` (`monthly_task_id`, `specific_objective_detail_id`, `name`, `weight`, `created_at`, `updated_at`, `progress`, `status`, `description`, `attachment`, `actual_amount`) VALUES
(1, 1, 'INCOME DETAILS', 0.50, '2026-08-12 17:11:01', '2026-08-12 17:31:02', 100.00, 'Pending', '3000', NULL, 3000.0000),
(2, 1, 'INCOME DETAILS 2', 0.50, '2026-08-12 17:11:01', '2026-08-12 17:31:02', 100.00, 'Pending', '', NULL, 13000.0000);

-- --------------------------------------------------------

--
-- Table structure for table `monthly_task_assignees`
--

CREATE TABLE `monthly_task_assignees` (
  `id` int(11) NOT NULL,
  `monthly_task_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `assigned_by` int(11) NOT NULL,
  `assigned_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `monthly_task_assignees`
--

INSERT INTO `monthly_task_assignees` (`id`, `monthly_task_id`, `user_id`, `assigned_by`, `assigned_at`) VALUES
(13, 1, 40, 73, '2026-08-12 17:31:02'),
(14, 2, 79, 73, '2026-08-12 17:31:02');

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
(71, 40, NULL, '', '⚠️ Task Progress Alert from Supervisor', 'Attention Ezira Mantegaftot: Your assigned breakdown task progress requires an urgent update. Please push your progress and evidence as soon as possible.', NULL, 1, 'urgent', '2026-08-08 18:56:08', '2026-08-08 18:56:53', NULL),
(72, 40, NULL, '', '⚠️ Task Progress Alert from Supervisor', 'Attention Ezira Mantegaftot: Your assigned breakdown task progress requires an urgent update. Please push your progress and evidence as soon as possible.\n\nezira do your best', NULL, 1, 'urgent', '2026-08-09 03:51:07', '2026-08-09 03:54:27', NULL),
(73, 79, NULL, '', '⚡ Progress Pushed: sytem requrment', 'Ezira Mantegaftot updated progress to 71% on \"sytem requrment\". Notes: testt.', '{\"task_id\":\"57\",\"task_type\":\"monthly\",\"detail_id\":1029,\"progress\":\"71\",\"pusher_name\":\"Ezira Mantegaftot\",\"target_page\":\"supervisor_breakdown\"}', 1, 'high', '2026-08-09 05:00:29', '2026-08-09 05:00:50', NULL),
(74, 70, 469, '', 'New Plan Approval Request', 'A new plan has been submitted for approval at the Deputy CEO level.', NULL, 0, 'high', '2026-08-09 06:41:47', NULL, NULL),
(75, 40, NULL, 'task', 'New Task: Software Pruduct', '📋 *New Task Assigned to You*\n\n*Task:* Software Pruduct\n*Priority:* 🟡 MEDIUM\n*Due Date:* 📅 Sun, Nov 29, 2026\n*Category:* action_plan:1030\n*Assigned By:* olana olana (Deputy CEO)\n\n*Description:*\nSoftware Pruduct\n\n_Please open the ITPCR app to view and start this task._', '{\"assignment_id\":5,\"task_title\":\"Software Pruduct\",\"priority\":\"medium\",\"due_date\":\"2026-11-29\",\"category\":\"action_plan:1030\",\"assigned_by_name\":\"olana olana\"}', 1, 'medium', '2026-08-09 18:19:45', '2026-08-09 18:20:03', NULL),
(77, 73, NULL, '', '⚡ Progress Pushed: income KPI', 'Ezira Mantegaftot pushed progress on \"income KPI\" for Action Plan \"income KPI\" (Weight: 1). Target: 0.5 ETB | Achieved: 100 ETB (100% completed). Notes: No notes provided.', '{\"task_id\":\"60\",\"task_type\":\"monthly\",\"detail_id\":1031,\"plan_name\":\"income KPI\",\"plan_type\":\"income\",\"plan_weight\":1,\"plan_target\":0.5,\"actual_amount\":100,\"unit\":\"ETB\",\"progress\":100,\"pusher_name\":\"Ezira Mantegaftot\",\"target_page\":\"supervisor_breakdown\"}', 1, 'high', '2026-08-09 19:20:54', '2026-08-09 19:26:15', NULL),
(79, 73, NULL, '', '⚡ Progress Pushed: system requ...', 'Ezira Mantegaftot pushed progress on \"system requ...\" for Action Plan \"bonus\" (Weight: 1). Target: 0.5 number | Achieved: 49,982 number (100% completed). Notes: test .', '{\"task_id\":\"61\",\"task_type\":\"monthly\",\"detail_id\":1032,\"plan_name\":\"bonus\",\"plan_type\":\"cost\",\"plan_weight\":1,\"plan_target\":0.5,\"actual_amount\":49982,\"unit\":\"number\",\"progress\":100,\"pusher_name\":\"Ezira Mantegaftot\",\"target_page\":\"supervisor_breakdown\"}', 1, 'high', '2026-08-10 07:27:02', '2026-08-10 07:27:11', NULL),
(80, 73, NULL, '', '⚠️ Task Progress Alert from Supervisor', 'Attention tsuhayu directorate: Your assigned breakdown task progress requires an urgent update. Please push your progress and evidence as soon as possible.', NULL, 1, 'urgent', '2026-08-10 07:38:48', '2026-08-10 07:39:01', NULL),
(81, 40, NULL, '', '⚠️ Task Progress Alert from Supervisor', 'Attention Ezira Mantegaftot: Your assigned breakdown task progress requires an urgent update. Please push your progress and evidence as soon as possible.', NULL, 1, 'urgent', '2026-08-10 07:40:00', '2026-08-10 12:45:06', NULL),
(82, 40, NULL, 'task', 'New Task: test ', '📋 *New Task Assigned to You*\n\n*Task:* test \n*Priority:* 🟡 URGENT\n*Due Date:* 📅 Mon, Aug 10, 2026\n*Category:* general\n*Assigned By:* tsuhayu directorate (IT Directorate)\n\n*Description:*\ntest \n\n_Please open the ITPCR app to view and start this task._', '{\"assignment_id\":6,\"task_title\":\"test \",\"priority\":\"urgent\",\"due_date\":\"2026-08-10\",\"category\":\"general\",\"assigned_by_name\":\"tsuhayu directorate\"}', 1, 'medium', '2026-08-10 08:00:40', '2026-08-10 08:00:45', NULL),
(83, 76, NULL, 'meeting', 'New Meeting Invitation: tets', 'You\'ve been invited to a meeting \"tets\" scheduled for 8/10/2026, 12:08:00 PM', NULL, 0, 'medium', '2026-08-10 08:07:56', NULL, NULL),
(84, 69, NULL, 'meeting', 'New Meeting Invitation: tets', 'You\'ve been invited to a meeting \"tets\" scheduled for 8/10/2026, 12:08:00 PM', NULL, 0, 'medium', '2026-08-10 08:07:56', NULL, NULL),
(85, 73, NULL, 'meeting', 'New Meeting Invitation: tets', 'You\'ve been invited to a meeting \"tets\" scheduled for 8/10/2026, 12:08:00 PM', NULL, 0, 'medium', '2026-08-10 08:07:56', NULL, NULL),
(86, 24, NULL, 'meeting', 'New Meeting Invitation: tets', 'You\'ve been invited to a meeting \"tets\" scheduled for 8/10/2026, 12:08:00 PM', NULL, 0, 'medium', '2026-08-10 08:07:56', NULL, NULL),
(88, 40, NULL, 'task', 'New Task: ግዢ (Purchase)', '📋 *New Task Assigned to You*\n\n*Task:* ግዢ (Purchase)\n*Priority:* 🟡 MEDIUM\n*Due Date:* 📅 Tue, Dec 8, 2026\n*Category:* action_plan:1033\n*Assigned By:* tsuhayu directorate (IT Directorate)\n\n*Description:*\nግዢ (Purchase)\n\n_Please open the ITPCR app to view and start this task._', '{\"assignment_id\":7,\"task_title\":\"ግዢ (Purchase)\",\"priority\":\"medium\",\"due_date\":\"2026-12-08\",\"category\":\"action_plan:1033\",\"assigned_by_name\":\"tsuhayu directorate\"}', 1, 'medium', '2026-08-10 13:06:43', '2026-08-10 13:06:48', NULL),
(89, 73, NULL, '', '⚡ Progress Pushed: preparing bid', 'Ezira Mantegaftot pushed progress on \"preparing bid\" for Action Plan \"ግዢ (Purchase)\" (Weight: 0.5). Target: 0.5 number | Achieved: 7 number (100% completed). Notes: No notes provided.', '{\"task_id\":\"62\",\"task_type\":\"monthly\",\"detail_id\":1033,\"plan_name\":\"ግዢ (Purchase)\",\"plan_type\":\"purchase\",\"plan_weight\":0.5,\"plan_target\":0.5,\"actual_amount\":7,\"unit\":\"number\",\"progress\":100,\"pusher_name\":\"Ezira Mantegaftot\",\"target_page\":\"supervisor_breakdown\"}', 0, 'high', '2026-08-10 13:21:40', NULL, NULL),
(90, 70, 473, '', 'New Plan Approval Request', 'A new plan has been submitted for approval at the Deputy CEO level.', NULL, 0, 'high', '2026-08-10 17:26:00', NULL, NULL),
(91, 73, NULL, '', '⚡ Progress Pushed: local investment ', 'Ezira Mantegaftot pushed progress on \"local investment \" for Action Plan \"local investment\" (Weight: 2). Target: 2 number | Achieved: 200,000 number (100% completed). Notes: No notes provided.', '{\"task_id\":\"63\",\"task_type\":\"monthly\",\"detail_id\":1034,\"plan_name\":\"local investment\",\"plan_type\":\"_________________\",\"plan_weight\":2,\"plan_target\":2,\"actual_amount\":200000,\"unit\":\"number\",\"progress\":100,\"pusher_name\":\"Ezira Mantegaftot\",\"target_page\":\"supervisor_breakdown\"}', 0, 'high', '2026-08-10 18:21:43', NULL, NULL),
(92, 70, 474, '', 'New Plan Approval Request', 'A new plan has been submitted for approval at the Deputy CEO level.', NULL, 0, 'high', '2026-08-11 07:34:14', NULL, NULL),
(93, 73, NULL, '', '⚡ Progress Pushed: FDI', 'Ezira Mantegaftot pushed progress on \"FDI\" for Action Plan \"test action \" (Weight: 1). Target: 1 number | Achieved: 500,000 number (100% completed). Notes: note .', '{\"task_id\":\"64\",\"task_type\":\"monthly\",\"detail_id\":1035,\"plan_name\":\"test action \",\"plan_type\":\"____\",\"plan_weight\":1,\"plan_target\":1,\"actual_amount\":500000,\"unit\":\"number\",\"progress\":100,\"pusher_name\":\"Ezira Mantegaftot\",\"target_page\":\"supervisor_breakdown\"}', 1, 'high', '2026-08-11 07:41:25', '2026-08-11 07:41:46', NULL),
(94, 73, NULL, '', '⚠️ Task Progress Alert from Supervisor', 'Attention tsuhayu directorate: Your assigned breakdown task progress requires an urgent update. Please push your progress and evidence as soon as possible.', NULL, 0, 'urgent', '2026-08-11 07:43:31', NULL, NULL),
(95, 76, NULL, '', '⚠️ Task Progress Alert from Supervisor', 'Attention Hayal Tamrat Girum: Your assigned breakdown task progress requires an urgent update. Please push your progress and evidence as soon as possible.', NULL, 0, 'urgent', '2026-08-11 07:44:58', NULL, NULL),
(96, 40, NULL, '', '⚠️ Task Progress Alert from Supervisor', 'Attention Ezira Mantegaftot: Your assigned breakdown task progress requires an urgent update. Please push your progress and evidence as soon as possible.', NULL, 0, 'urgent', '2026-08-11 07:45:04', NULL, NULL),
(97, 70, 475, '', 'New Plan Approval Request', 'A new plan has been submitted for approval at the Deputy CEO level.', NULL, 0, 'high', '2026-08-11 18:47:09', NULL, NULL),
(98, 79, NULL, '', '⚡ Action Plan Breakdown Delegation', 'You have been designated as Breakdown Manager/Supervisor for \" KPI አስተማማኝ የፋሲሊቲ ኦፕሬሽንስ እና የአገልግሎት አቅርቦትን ማረጋገጥ\". You can now access and manage its breakdown on the Action Plan Breakdown page.', NULL, 1, 'high', '2026-08-11 19:14:49', '2026-08-11 19:15:08', NULL),
(99, 40, NULL, 'task', '📋 Breakdown Task Assigned', 'You have been assigned to monthly breakdown task \"hayal\"', NULL, 0, 'medium', '2026-08-12 03:31:44', NULL, NULL),
(100, 40, NULL, 'task', '📋 Breakdown Task Assigned', 'You have been assigned to monthly breakdown task \"hayal\"', NULL, 1, 'medium', '2026-08-12 03:31:48', '2026-08-12 03:32:22', NULL),
(101, 40, NULL, 'task', '📋 Breakdown Task Assigned', 'You have been assigned to monthly breakdown task \"hayal\"', NULL, 0, 'medium', '2026-08-12 03:31:48', NULL, NULL),
(102, 40, NULL, 'task', '📋 Breakdown Task Assigned', 'You have been assigned to monthly breakdown task \"hayal\"', NULL, 0, 'medium', '2026-08-12 03:37:47', NULL, NULL),
(103, 40, NULL, 'task', '📋 Breakdown Task Assigned', 'You have been assigned to monthly breakdown task \"hayal\"', NULL, 0, 'medium', '2026-08-12 03:37:47', NULL, NULL),
(104, 40, NULL, 'task', '📋 Breakdown Task Assigned', 'You have been assigned to monthly breakdown task \"hayal\"', NULL, 0, 'medium', '2026-08-12 06:04:43', NULL, NULL),
(105, 40, NULL, 'task', '📋 Breakdown Task Assigned', 'You have been assigned to monthly breakdown task \"hayal\"', NULL, 0, 'medium', '2026-08-12 06:06:32', NULL, NULL),
(106, 73, NULL, 'task', '📋 Self-Assigned Breakdown Task', 'You self-assigned monthly task \"test self\"', NULL, 0, 'medium', '2026-08-12 06:06:32', NULL, NULL),
(107, 40, NULL, 'task', '📋 Breakdown Task Assigned', 'You have been assigned to monthly breakdown task \"hayal\"', NULL, 0, 'medium', '2026-08-12 06:06:32', NULL, NULL),
(108, 73, NULL, 'task', '📋 Self-Assigned Breakdown Task', 'You self-assigned monthly task \"test self\"', NULL, 0, 'medium', '2026-08-12 06:06:32', NULL, NULL),
(109, 79, NULL, '', '⚡ Action Plan Breakdown Delegation', 'You have been designated as Breakdown Manager/Supervisor for \" KPI አስተማማኝ የፋሲሊቲ ኦፕሬሽንስ እና የአገልግሎት አቅርቦትን ማረጋገጥ\". You can now access and manage its breakdown on the Action Plan Breakdown page.', NULL, 1, 'high', '2026-08-12 07:58:43', '2026-08-12 16:44:51', NULL),
(110, 73, NULL, '', '⚡ Progress Pushed: hayal', 'Ezira Mantegaftot pushed progress on \"hayal\" for Action Plan \" KPI አስተማማኝ የፋሲሊቲ ኦፕሬሽንስ እና የአገልግሎት አቅርቦትን ማረጋገጥ\" (Weight: 2). Target: 2 number | Achieved: 700,000 number (100% completed). Notes: No notes provided.', '{\"task_id\":\"67\",\"task_type\":\"monthly\",\"detail_id\":1036,\"plan_name\":\" KPI አስተማማኝ የፋሲሊቲ ኦፕሬሽንስ እና የአገልግሎት አቅርቦትን ማረጋገጥ\",\"plan_type\":\"income\",\"plan_weight\":2,\"plan_target\":2,\"actual_amount\":700000,\"unit\":\"number\",\"progress\":100,\"pusher_name\":\"Ezira Mantegaftot\",\"target_page\":\"supervisor_breakdown\"}', 0, 'high', '2026-08-12 16:56:45', NULL, NULL),
(111, 70, 1, '', 'New Plan Approval Request', 'A new plan has been submitted for approval at the Deputy CEO level.', NULL, 0, 'high', '2026-08-12 17:08:20', NULL, NULL),
(112, 40, NULL, 'task', '📋 Breakdown Task Assigned', 'You have been assigned to monthly breakdown task \"INCOME DETAILS\"', NULL, 1, 'medium', '2026-08-12 17:11:01', '2026-08-12 17:11:44', NULL),
(113, 79, NULL, 'task', '📋 Breakdown Task Assigned', 'You have been assigned to monthly breakdown task \"INCOME DETAILS 2\"', NULL, 0, 'medium', '2026-08-12 17:11:01', NULL, NULL),
(114, 73, NULL, '', '⚡ Progress Pushed: INCOME DETAILS', 'Ezira Mantegaftot pushed progress on \"INCOME DETAILS\" for Action Plan \"INCOME DETAILS\" (Weight: 2). Target: 1 number | Achieved: 30,000 number (100% completed). Notes: 3000.', '{\"task_id\":\"1\",\"task_type\":\"monthly\",\"detail_id\":1,\"plan_name\":\"INCOME DETAILS\",\"plan_type\":\"income\",\"plan_weight\":2,\"plan_target\":1,\"actual_amount\":30000,\"unit\":\"number\",\"progress\":100,\"pusher_name\":\"Ezira Mantegaftot\",\"target_page\":\"supervisor_breakdown\"}', 0, 'high', '2026-08-12 17:12:24', NULL, NULL),
(115, 40, NULL, 'task', '📋 Breakdown Task Assigned', 'You have been assigned to monthly breakdown task \"INCOME DETAILS\"', NULL, 0, 'medium', '2026-08-12 17:25:30', NULL, NULL),
(116, 79, NULL, 'task', '📋 Breakdown Task Assigned', 'You have been assigned to monthly breakdown task \"INCOME DETAILS 2\"', NULL, 1, 'medium', '2026-08-12 17:25:30', '2026-08-12 17:29:14', NULL),
(117, 40, NULL, 'task', '📋 Breakdown Task Assigned', 'You have been assigned to monthly breakdown task \"INCOME DETAILS\"', NULL, 0, 'medium', '2026-08-12 17:25:30', NULL, NULL),
(118, 79, NULL, 'task', '📋 Breakdown Task Assigned', 'You have been assigned to monthly breakdown task \"INCOME DETAILS 2\"', NULL, 0, 'medium', '2026-08-12 17:25:30', NULL, NULL),
(119, 73, NULL, '', '⚡ Progress Pushed: INCOME DETAILS', 'Ezira Mantegaftot pushed progress on \"INCOME DETAILS\" for Action Plan \"INCOME DETAILS\" (Weight: 2). Target: 1 number | Achieved: 3,000 number (100% completed). Notes: 3000.', '{\"task_id\":\"1\",\"task_type\":\"monthly\",\"detail_id\":1,\"plan_name\":\"INCOME DETAILS\",\"plan_type\":\"income\",\"plan_weight\":2,\"plan_target\":1,\"actual_amount\":3000,\"unit\":\"number\",\"progress\":100,\"pusher_name\":\"Ezira Mantegaftot\",\"target_page\":\"supervisor_breakdown\"}', 0, 'high', '2026-08-12 17:26:24', NULL, NULL),
(120, 73, NULL, '', '⚡ Progress Pushed: INCOME DETAILS 2', 'Million  Goraw pushed progress on \"INCOME DETAILS 2\" for Action Plan \"INCOME DETAILS\" (Weight: 2). Target: 1 number | Achieved: 13,000 number (100% completed). Notes: No notes provided.', '{\"task_id\":\"2\",\"task_type\":\"monthly\",\"detail_id\":1,\"plan_name\":\"INCOME DETAILS\",\"plan_type\":\"income\",\"plan_weight\":2,\"plan_target\":1,\"actual_amount\":13000,\"unit\":\"number\",\"progress\":100,\"pusher_name\":\"Million  Goraw\",\"target_page\":\"supervisor_breakdown\"}', 0, 'high', '2026-08-12 17:29:58', NULL, NULL),
(121, 40, NULL, 'task', '📋 Breakdown Task Assigned', 'You have been assigned to monthly breakdown task \"INCOME DETAILS\"', NULL, 0, 'medium', '2026-08-12 17:31:02', NULL, NULL),
(122, 79, NULL, 'task', '📋 Breakdown Task Assigned', 'You have been assigned to monthly breakdown task \"INCOME DETAILS 2\"', NULL, 0, 'medium', '2026-08-12 17:31:02', NULL, NULL),
(123, 40, NULL, 'task', '📋 Breakdown Task Assigned', 'You have been assigned to monthly breakdown task \"INCOME DETAILS\"', NULL, 0, 'medium', '2026-08-12 17:31:02', NULL, NULL),
(124, 79, NULL, 'task', '📋 Breakdown Task Assigned', 'You have been assigned to monthly breakdown task \"INCOME DETAILS 2\"', NULL, 0, 'medium', '2026-08-12 17:31:02', NULL, NULL);

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
  `goal_id` int(11) DEFAULT NULL,
  `weight` float DEFAULT 100
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `objectives`
--

INSERT INTO `objectives` (`objective_id`, `user_id`, `name`, `description`, `created_at`, `updated_at`, `created_by`, `year`, `quarter`, `employee_id`, `goal_id`, `weight`) VALUES
(270, 80, 'ዓላማ 1.1 	አስተማማኝ የፋሲሊቲ ኦፕሬሽንስ እና የአገልግሎት አቅርቦትን ማረጋገጥ', 'አስተማማኝ የፋሲሊቲ ኦፕሬሽንስ እና የአገልግሎት አቅርቦትን ማረጋገጥ', '2026-07-15 11:33:12', '2026-08-07 17:29:09', NULL, NULL, NULL, 153, 225, 5),
(274, 40, 'ዓላማ 2.1	የዓለም አቀፍ ገበያ ተደራሽነትን ለማሻሻል በዲጂታል ቴክኖሎጂ ዘርፍ የውጭ ቀጥተኛ ኢንቨስትመንትን መሳብ።', 'የዓለም አቀፍ ገበያ ተደራሽነትን ለማሻሻል በዲጂታል ቴክኖሎጂ ዘርፍ የውጭ ቀጥተኛ ኢንቨስትመንትን መሳብ።', '2026-08-10 20:18:45', '2026-08-10 20:18:45', NULL, NULL, NULL, 109, 226, 5),
(275, 40, 'ዓላማ 1.2 አስተማማኝ የፋሲሊቲ ኦፕሬሽንስ እና የአገልግሎት አቅርቦትን ማረጋገጥ', 'አስተማማኝ የፋሲሊቲ ኦፕሬሽንስ እና የአገልግሎት አቅርቦትን ማረጋገጥ', '2026-08-11 21:44:49', '2026-08-11 21:44:49', NULL, NULL, NULL, 109, 225, 4);

-- --------------------------------------------------------

--
-- Table structure for table `objective_quarter_activations`
--

CREATE TABLE `objective_quarter_activations` (
  `id` int(11) NOT NULL,
  `objective_id` int(11) NOT NULL,
  `year` int(11) NOT NULL,
  `quarter` varchar(10) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `objective_quarter_activations`
--

INSERT INTO `objective_quarter_activations` (`id`, `objective_id`, `year`, `quarter`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 270, 2018, '4', 0, '2026-08-11 16:36:34', '2026-08-11 16:55:50'),
(4, 273, 2018, '4', 0, '2026-08-11 21:19:37', '2026-08-11 21:19:37'),
(5, 272, 2018, '4', 0, '2026-08-11 21:19:40', '2026-08-11 21:19:40'),
(6, 271, 2018, '4', 0, '2026-08-11 21:19:44', '2026-08-11 21:19:44'),
(7, 274, 2018, '4', 0, '2026-08-11 21:20:29', '2026-08-11 21:20:29');

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
(1, 3, NULL, NULL, 'test', 'something', NULL, 40, '2025-11-27 12:10:25', '2026-03-24 11:53:20'),
(2, 4, NULL, NULL, 'test1', 'ets da', NULL, 25, '2025-11-27 12:18:05', '2025-11-27 12:18:05'),
(3, 9, NULL, NULL, 'it goup', 'selamta', NULL, 25, '2025-11-27 12:40:02', '2025-11-27 12:40:02'),
(4, 10, NULL, NULL, 'it staff', 'it group', NULL, 40, '2025-11-27 12:56:07', '2025-11-27 13:15:45'),
(5, 22, NULL, NULL, 'demo ', 'demo group', NULL, 40, '2026-04-07 16:53:08', '2026-04-07 16:53:08');

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
(50, 'Plan and followup ', 'Plan and followup ', 'Section', 9, 2, NULL, NULL, 'active', '2025-12-16 09:01:49', '2025-12-16 09:01:49'),
(51, 'Senior', 'Senior', 'Senior Software Developer', 18, 6, NULL, NULL, 'active', '2026-03-19 11:18:02', '2026-03-19 11:18:02'),
(52, 'Specialist', 'Specialist', ' Software Developer Specialist', 18, 6, NULL, NULL, 'active', '2026-03-19 11:18:31', '2026-03-19 11:18:31'),
(53, 'Assistant', 'Assistant', ' Software Developer Assistant', 18, 6, NULL, NULL, 'active', '2026-03-19 11:18:52', '2026-03-19 11:18:52'),
(54, 'Senior System admin', 'Senior System admin', 'Senior', 17, 6, NULL, NULL, 'active', '2026-03-20 05:29:38', '2026-03-20 05:29:38'),
(55, ' System admin Specialist', ' System admin Specialist', 'Specialist', 17, 6, NULL, NULL, 'active', '2026-03-20 05:30:06', '2026-03-20 05:30:06'),
(56, ' System admin Asistant', ' System admin Asistant', 'Assistant', 17, 6, NULL, NULL, 'active', '2026-03-20 05:30:31', '2026-03-20 05:30:31');

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
(4, 'Division', 'Specific Division', 'from-green-600 to-green-700', 5, '2025-12-15 13:52:30'),
(7, 'Deputy CEO', 'Deputy CEO', 'from-orange-600 to-orange-700', 2, '2025-12-16 07:31:32'),
(8, 'unit', 'unit', 'linear-gradient(to right, #7c3aed, #5b21b6)', 6, '2025-12-16 08:55:42'),
(9, 'Senior Software Developer', 'Senior Software Developer', 'linear-gradient(to right, #e11d48, #9f1239)', 7, '2026-03-19 11:15:29'),
(10, ' Software Developer Specialist', 'Software Developer Specialist', 'from-gray-600 to-gray-700', 8, '2026-03-19 11:16:04'),
(11, ' Software Developer Assistant', ' Software Developer Assistant', 'from-gray-600 to-gray-700', 9, '2026-03-19 11:16:52'),
(12, 'Senior', 'Senior', 'linear-gradient(to right, #4f46e5, #3730a3)', 10, '2026-03-20 05:27:27'),
(13, 'Specialist', 'Specialist', 'linear-gradient(to right, #059669, #065f46)', 11, '2026-03-20 05:27:54'),
(14, 'Assistant', 'Assistant', 'linear-gradient(to right, #0284c7, #075985)', 12, '2026-03-20 05:28:22');

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
(1, 73, 11, 143, 146, 225, 275, 742, 1, 'Pending', 2026, '2026-08-12 17:08:20', '2026-08-12 17:08:20', 'Approved', 'IT Directorate', 'deactivate', 'deactivate', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `plan_approval_steps`
--

CREATE TABLE `plan_approval_steps` (
  `id` int(11) NOT NULL,
  `plan_id` int(11) NOT NULL,
  `step_number` int(11) NOT NULL,
  `org_node_id` int(11) NOT NULL,
  `org_node_name` varchar(255) DEFAULT NULL,
  `approver_employee_id` int(11) DEFAULT NULL,
  `approver_name` varchar(255) DEFAULT NULL,
  `status` enum('Pending','Approved','Declined','Skipped') DEFAULT 'Pending',
  `comment` text DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `plan_approval_steps`
--

INSERT INTO `plan_approval_steps` (`id`, `plan_id`, `step_number`, `org_node_id`, `org_node_name`, `approver_employee_id`, `approver_name`, `status`, `comment`, `approved_at`, `created_at`) VALUES
(888, 469, 1, 10, 'Deputy CEO', 143, 'olana abebe', 'Pending', NULL, NULL, '2026-08-09 09:41:47'),
(889, 469, 2, 9, 'CEO', 142, 'belete esubalew', 'Pending', NULL, NULL, '2026-08-09 09:41:47'),
(896, 473, 1, 10, 'Deputy CEO', 143, 'olana abebe', 'Pending', NULL, NULL, '2026-08-10 20:26:00'),
(897, 473, 2, 9, 'CEO', 142, 'belete esubalew', 'Pending', NULL, NULL, '2026-08-10 20:26:00'),
(898, 474, 1, 10, 'Deputy CEO', 143, 'olana abebe', 'Pending', NULL, NULL, '2026-08-11 10:34:14'),
(899, 474, 2, 9, 'CEO', 142, 'belete esubalew', 'Pending', NULL, NULL, '2026-08-11 10:34:14'),
(900, 475, 1, 10, 'Deputy CEO', 143, 'olana abebe', 'Pending', NULL, NULL, '2026-08-11 21:47:09'),
(901, 475, 2, 9, 'CEO', 142, 'belete esubalew', 'Pending', NULL, NULL, '2026-08-11 21:47:09'),
(902, 1, 1, 10, 'Deputy CEO', 143, 'olana abebe', 'Pending', NULL, NULL, '2026-08-12 20:08:20'),
(903, 1, 2, 9, 'CEO', 142, 'belete esubalew', 'Pending', NULL, NULL, '2026-08-12 20:08:20');

-- --------------------------------------------------------

--
-- Table structure for table `plan_breakdown_supervisors`
--

CREATE TABLE `plan_breakdown_supervisors` (
  `id` int(11) NOT NULL,
  `specific_objective_detail_id` int(11) NOT NULL,
  `supervisor_user_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `plan_breakdown_supervisors`
--

INSERT INTO `plan_breakdown_supervisors` (`id`, `specific_objective_detail_id`, `supervisor_user_id`, `created_at`) VALUES
(4, 1034, 40, '2026-08-11 18:39:11'),
(8, 1036, 79, '2026-08-12 07:58:43');

-- --------------------------------------------------------

--
-- Table structure for table `plan_pillars`
--

CREATE TABLE `plan_pillars` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `code` varchar(50) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `sort_order` int(11) DEFAULT 10,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `plan_pillars`
--

INSERT INTO `plan_pillars` (`id`, `name`, `code`, `description`, `is_active`, `sort_order`, `created_at`, `updated_at`) VALUES
(1, 'Smart Infrastructure & Digital Platform', 'SD1', 'World-class physical & digital infrastructure', 1, 1, '2026-08-11 15:26:37', '2026-08-11 15:26:37');

-- --------------------------------------------------------

--
-- Table structure for table `plan_types`
--

CREATE TABLE `plan_types` (
  `id` int(11) NOT NULL,
  `value` varchar(100) NOT NULL,
  `label` varchar(100) NOT NULL,
  `label_en` varchar(100) NOT NULL,
  `color` varchar(200) DEFAULT 'bg-gray-50 text-gray-700 border-gray-200',
  `is_default` tinyint(1) DEFAULT 0,
  `sort_order` int(11) DEFAULT 100,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `field_config` longtext DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `plan_types`
--

INSERT INTO `plan_types` (`id`, `value`, `label`, `label_en`, `color`, `is_default`, `sort_order`, `created_at`, `updated_at`, `field_config`) VALUES
(1, 'cost', 'ወጪ', 'Cost', 'bg-orange-50 text-orange-700 border-orange-200', 1, 1, '2026-08-07 15:59:19', '2026-08-10 15:06:43', '{\"sectionTitle\":\"COST DETAILS (የወጪ መረጃ)\",\"fields\":[{\"id\":\"f_group1\",\"type\":\"button_group\",\"label\":\"ወጪ አይነት\",\"options\":[\"መደበኛ ወጪ\",\"ካፒታል ወጪ\"]},{\"id\":\"f_dropdown\",\"type\":\"dropdown\",\"label\":\"ወጪ ስም\",\"options\":[\"Annual Leave Expense\",\"Basic Salary Expense\",\"Bonus\",\"Building Insurance\",\"Building Rent Expense\",\"Cash Indemnity Allowance\",\"Fuel and Lubricants\",\"Housing Allowance\",\"Medical and Hospitalization\",\"Other Allowances\",\"Pension Contribution 11%\",\"Stationery and Office Supplies\",\"Telephone, Fax, and Internet Expenses\",\"Transport Allowance\",\"Vehicle Rent Expense\",\"Plant, Machinery and Equipment\",\"Office Furnitures, Equipment and Fixtures\",\"ICT Equipments\",\"Vehicles and Vehicles Accessories\",\"Construction Equipment\",\"Other Fixed Assets\",\"Other\"],\"useIndependentOptions\":true,\"optionsByButton\":{\"መደበኛ ወጪ\":[\"Annual Leave Expense\",\"Basic Salary Expense\",\"Bonus\",\"Building Insurance\",\"Building Rent Expense\",\"Cash Indemnity Allowance\",\"Fuel and Lubricants\",\"Housing Allowance\",\"Medical and Hospitalization\",\"Other Allowances\",\"Pension Contribution 11%\",\"Stationery and Office Supplies\",\"Telephone\",\"Fax\",\"and Internet Expenses\",\"Transport Allowance\",\"Vehicle Rent Expense\",\"Plant\",\"Machinery and Equipment\",\"Office Furnitures\",\"Equipment and Fixtures\",\"ICT Equipments\",\"Vehicles and Vehicles Accessories\",\"Construction Equipment\",\"Other Fixed Assets\",\"Other\"],\"ካፒታል ወጪ\":[\"Technology and Core Infrastructure Upgrades\",\"data center expantion\",\"Public Infrastructure\",\"Replacement\",\"Modernization\",\"and Maintenance\",\"Business Expansion and Growth\"]}},{\"id\":\"f_baseline\",\"type\":\"number\",\"label\":\"Baseline Budget\",\"placeholder\":\"0\"},{\"id\":\"f_plan\",\"type\":\"number\",\"label\":\"Plan Budget\",\"placeholder\":\"0\"}]}'),
(2, 'income', 'ገቢ', 'Income', 'bg-emerald-50 text-emerald-700 border-emerald-200', 1, 2, '2026-08-07 15:59:19', '2026-08-07 16:20:02', '{\"sectionTitle\":\"INCOME DETAILS (የገቢ መረጃ)\",\"group1Title\":\"ምንዛሬ\",\"group1Options\":[\"ETB\",\"USD\"],\"group2Title\":\"የገቢ እቅድ አይነት\",\"group2Options\":[\"Internal\",\"Tenant\"],\"dropdownTitle\":\"ገቢ ስም\",\"dropdownOptions\":[\"Lease Land\",\"Office Rent\",\"Consulting\",\"SW Products\",\"Import & Export Substitution\",\"Other\"],\"baselineLabel\":\"Baseline Income\",\"planLabel\":\"Plan Income\"}'),
(3, 'hr', 'ሰራተኞች', 'HR', 'bg-purple-50 text-purple-700 border-purple-200', 1, 3, '2026-08-07 15:59:19', '2026-08-07 16:20:02', '{\"sectionTitle\":\"HR DETAILS (የሰራተኞች መረጃ)\",\"group1Title\":\"Employee Of\",\"group1Options\":[\"Internal\",\"Tenant\",\"Both\"],\"group2Title\":\"ሰራተኞች አይነት\",\"group2Options\":[\"Full Time\",\"Part Time\",\"Contract\",\"Internship\",\"Externship\",\"Freelancing\"],\"dropdownTitle\":\"\",\"dropdownOptions\":[],\"baselineLabel\":\"Baseline Count\",\"planLabel\":\"Plan Count\"}'),
(4, 'project', 'ፕሮጀክት', 'Project', 'bg-blue-50 text-blue-700 border-blue-200', 1, 4, '2026-08-07 15:59:19', '2026-08-07 16:20:02', '{\"sectionTitle\":\"PROJECT DETAILS (የፕሮጀክት መረጃ)\",\"group1Title\":\"የፕሮጀክት አይነት\",\"group1Options\":[\"IT Project\",\"Construction\",\"Other\"],\"group2Title\":\"\",\"group2Options\":[],\"dropdownTitle\":\"ፕሮጀክት ስም\",\"dropdownOptions\":[\"IT Infrastructure Setup\",\"Software Development\",\"Building Construction\",\"Other\"],\"baselineLabel\":\"Baseline Target\",\"planLabel\":\"Plan Target\"}'),
(5, 'general', 'ጠቅላላ', 'General', 'bg-gray-50 text-gray-700 border-gray-200', 1, 5, '2026-08-07 15:59:19', '2026-08-07 16:20:02', '{\"sectionTitle\":\"GENERAL DETAILS (ጠቅላላ መረጃ)\",\"group1Title\":\"ምድብ\",\"group1Options\":[\"Standard\",\"Special\"],\"group2Title\":\"\",\"group2Options\":[],\"dropdownTitle\":\"ዝርዝር ስም\",\"dropdownOptions\":[\"General Task\",\"Operational\",\"Other\"],\"baselineLabel\":\"Baseline Value\",\"planLabel\":\"Plan Value\"}'),
(6, 'test', 'ሙከራ', 'test', 'bg-gray-50 text-gray-700 border-gray-200', 0, 100, '2026-08-07 16:23:56', '2026-08-07 16:23:56', '{\"sectionTitle\":\"TEST DETAILS (ሙከራ)\",\"fields\":[{\"id\":\"f_1786109036142_1\",\"type\":\"button_group\",\"label\":\"ምድብ (Category)\",\"options\":[\"Standard\",\"Special\"]},{\"id\":\"f_1786109036142_2\",\"type\":\"dropdown\",\"label\":\"ዝርዝር (Select Option)\",\"options\":[\"Option 1\",\"Option 2\",\"Other\"]},{\"id\":\"f_1786109036142_3\",\"type\":\"number\",\"label\":\"Baseline Value\",\"placeholder\":\"0\"},{\"id\":\"f_1786109036142_4\",\"type\":\"number\",\"label\":\"Plan Value\",\"placeholder\":\"0\"}]}'),
(7, 'job_creation', 'ስራ እድል ፈጠራ', 'job creation', 'bg-slate-100 text-slate-700 border-slate-300', 0, 100, '2026-08-07 16:29:27', '2026-08-10 15:03:18', '{\"sectionTitle\":\"JOB CREATION DETAILS (ስራ እድል ፈጠራ)\",\"fields\":[{\"id\":\"f_1786109367674_1\",\"type\":\"button_group\",\"label\":\"ምድብ (Category)\",\"options\":[\"Internal\",\"Tenant\",\"Both\"]},{\"id\":\"f_1786109367674_2\",\"type\":\"dropdown\",\"label\":\"የቅጥሩ አይነት(Employment Type )\",\"options\":[\"Full time\",\"Parttime\",\"Contract\",\"Remote\",\"Other\"],\"useIndependentOptions\":true,\"optionsByButton\":{\"Internal\":[\"full time\",\"contrat\"],\"Tenant\":[\"full time\",\"remote\",\"parttime\"],\"Both\":[\"full time\",\"contrat\",\"remote\",\"parttime\"]}},{\"id\":\"f_1786109367674_3\",\"type\":\"number\",\"label\":\"Baseline Value\",\"placeholder\":\"0\"},{\"id\":\"f_1786109367674_4\",\"type\":\"number\",\"label\":\"Plan(target) Value\",\"placeholder\":\"0\"}]}'),
(8, 'test_3', 'test 3', 'test 3', 'bg-slate-100 text-slate-700 border-slate-300', 0, 100, '2026-08-10 10:01:47', '2026-08-10 10:01:47', '{\"sectionTitle\":\"TEST 3 DETAILS (test 3)\",\"fields\":[{\"id\":\"f_1786345307776_1\",\"type\":\"button_group\",\"label\":\"ምድብ (Category)\",\"options\":[\"Standard\",\"Special\"]},{\"id\":\"f_1786345307776_2\",\"type\":\"dropdown\",\"label\":\"ዝርዝር (Select Option)\",\"options\":[\"Option 1\",\"Option 2\",\"Other\"]},{\"id\":\"f_1786345307776_3\",\"type\":\"number\",\"label\":\"Baseline Value\",\"placeholder\":\"0\"},{\"id\":\"f_1786345307776_4\",\"type\":\"number\",\"label\":\"Plan Value\",\"placeholder\":\"0\"}]}'),
(9, 'purchase', 'ግዢ', 'Purchase', 'bg-blue-50 text-blue-700 border-blue-200', 0, 100, '2026-08-10 15:39:25', '2026-08-10 15:51:45', '{\"sectionTitle\":\"PURCHASE DETAILS (ግዢ)\",\"fields\":[{\"id\":\"f_1786366260659_vdg\",\"type\":\"text\",\"label\":\"የ እቅዱ ስም\",\"placeholder\":\"Enter text…\"},{\"id\":\"f_1786365565835_2\",\"type\":\"dropdown\",\"label\":\"የግዢ ስም\",\"options\":[\"vehicle\",\"table\",\"laptop\"],\"useIndependentOptions\":false},{\"id\":\"f_1786365565835_3\",\"type\":\"number\",\"label\":\"Baseline Value in real number\",\"placeholder\":\"0\"},{\"id\":\"f_1786365565835_4\",\"type\":\"number\",\"label\":\"Plan Value in number\",\"placeholder\":\"0\"}]}'),
(10, '____', 'FDI', 'ፍድአይ', 'bg-purple-50 text-purple-700 border-purple-200', 0, 100, '2026-08-10 16:23:38', '2026-08-10 16:31:26', '{\"sectionTitle\":\"ፍድአይ DETAILS (FDI)\",\"fields\":[{\"id\":\"f_1786368597757_k1t\",\"type\":\"text\",\"label\":\"Action plan name \",\"placeholder\":\"Enter text…\"},{\"id\":\"f_1786368218388_1\",\"type\":\"button_group\",\"label\":\"Exchange\",\"options\":[\"USD\",\"ETB\"]},{\"id\":\"f_1786368218388_3\",\"type\":\"number\",\"label\":\"Baseline Value\",\"placeholder\":\"0\"},{\"id\":\"f_1786368218388_4\",\"type\":\"number\",\"label\":\"Plan Value\",\"placeholder\":\"0\"}]}'),
(11, '_________________', 'Local Investment', 'የሃገር ውስጥ ኢንቨስትመንት', 'bg-gray-50 text-gray-700 border-gray-200', 0, 100, '2026-08-10 16:32:39', '2026-08-10 16:33:56', '{\"sectionTitle\":\"የሃገር ውስጥ ኢንቨስትመንት DETAILS (Local Investment)\",\"fields\":[{\"id\":\"f_1786368770501_joj\",\"type\":\"text\",\"label\":\"Action plan name \",\"placeholder\":\"Enter text…\"},{\"id\":\"f_1786368759642_1\",\"type\":\"button_group\",\"label\":\"Exchange\",\"options\":[\"USD\",\"ETB\"]},{\"id\":\"f_1786368759642_3\",\"type\":\"number\",\"label\":\"Baseline Value\",\"placeholder\":\"0\"},{\"id\":\"f_1786368759642_4\",\"type\":\"number\",\"label\":\"Plan Value\",\"placeholder\":\"0\"}]}'),
(12, '___________', 'Technology Transfer', 'የ እውቀት ሽግግር', 'bg-lime-50 text-lime-700 border-lime-200', 0, 100, '2026-08-10 16:34:30', '2026-08-10 16:37:46', '{\"sectionTitle\":\"የ እውቀት ሽግግር DETAILS (Technology Transfer)\",\"fields\":[{\"id\":\"f_1786368883876_lbi\",\"type\":\"text\",\"label\":\"Action plan name \",\"placeholder\":\"Enter text…\"},{\"id\":\"f_1786368870304_2\",\"type\":\"dropdown\",\"label\":\"እቅዱ\",\"options\":[\"ፓቴንት መብት ያስመዘገቡ\",\"የ አጭር ጊዜ ስልጠና የተሰጣቸው\",\"የ እውቀት ሽግግር ያካሄዱ\"],\"useIndependentOptions\":false},{\"id\":\"f_1786368870304_3\",\"type\":\"number\",\"label\":\"Baseline Value\",\"placeholder\":\"0\"},{\"id\":\"f_1786368870304_4\",\"type\":\"number\",\"label\":\"Plan Value\",\"placeholder\":\"0\"}]}'),
(13, '___', 'Innovation', 'ፈጠራ', 'bg-cyan-50 text-cyan-700 border-cyan-200', 0, 100, '2026-08-10 16:38:13', '2026-08-10 16:38:39', '{\"sectionTitle\":\"ፈጠራ DETAILS (Innovation)\",\"fields\":[{\"id\":\"f_1786369097379_dn6\",\"type\":\"text\",\"label\":\"Action plan name \",\"placeholder\":\"Enter text…\"},{\"id\":\"f_1786369093012_3\",\"type\":\"number\",\"label\":\"Baseline Value\",\"placeholder\":\"0\"},{\"id\":\"f_1786369093012_4\",\"type\":\"number\",\"label\":\"Plan Value\",\"placeholder\":\"0\"}]}'),
(14, '_______', 'Startup', 'ስታርት አፕ', 'bg-purple-50 text-purple-700 border-purple-200', 0, 100, '2026-08-10 16:39:06', '2026-08-10 16:39:38', '{\"sectionTitle\":\"ስታርት አፕ DETAILS (Startup)\",\"fields\":[{\"id\":\"f_1786369155882_cny\",\"type\":\"text\",\"label\":\"Action plan name \",\"placeholder\":\"Enter text…\"},{\"id\":\"f_1786369146764_3\",\"type\":\"number\",\"label\":\"Baseline Value\",\"placeholder\":\"0\"},{\"id\":\"f_1786369146764_4\",\"type\":\"number\",\"label\":\"Plan Value\",\"placeholder\":\"0\"}]}'),
(15, '_____________', 'Export', 'ለ ውጪ ገበያ የቀረበ', 'bg-lime-50 text-lime-700 border-lime-200', 0, 100, '2026-08-10 16:40:21', '2026-08-10 16:41:11', '{\"sectionTitle\":\"ለ ውጪ ገበያ የቀረበ DETAILS (Export)\",\"fields\":[{\"id\":\"f_1786369226337_1g0\",\"type\":\"text\",\"label\":\"Action plan name \",\"placeholder\":\"Enter text…\"},{\"id\":\"f_1786369221271_1\",\"type\":\"button_group\",\"label\":\"Exchange\",\"options\":[\"USD\",\"ETB\"]},{\"id\":\"f_1786369221271_3\",\"type\":\"number\",\"label\":\"Baseline Value\",\"placeholder\":\"0\"},{\"id\":\"f_1786369221271_4\",\"type\":\"number\",\"label\":\"Plan Value\",\"placeholder\":\"0\"}]}'),
(16, 'import_substitution', 'የውጪ ምርት ምትክ', 'Import Substitution', 'bg-blue-50 text-blue-700 border-blue-200', 0, 100, '2026-08-10 16:42:22', '2026-08-10 16:43:44', '{\"sectionTitle\":\"IMPORT SUBSTITUTION  DETAILS (የውጪ ምርት ምትክ)\",\"fields\":[{\"id\":\"f_1786369358201_x60\",\"type\":\"text\",\"label\":\"Action plan name \",\"placeholder\":\"Enter text…\"},{\"id\":\"f_1786369342188_1\",\"type\":\"button_group\",\"label\":\"Exchange\",\"options\":[\"USD\",\"ETB\"]},{\"id\":\"f_1786369342188_3\",\"type\":\"number\",\"label\":\"Baseline Value\",\"placeholder\":\"0\"},{\"id\":\"f_1786369342188_4\",\"type\":\"number\",\"label\":\"Plan Value\",\"placeholder\":\"0\"}]}'),
(17, 'physical_infrastructure', 'አካላዊ መሠረተ ልማት', 'Physical infrastructure', 'bg-teal-50 text-teal-700 border-teal-200', 0, 100, '2026-08-10 16:45:55', '2026-08-10 16:45:55', '{\"sectionTitle\":\"PHYSICAL INFRASTRUCTURE DETAILS (አካላዊ መሠረተ ልማት)\",\"fields\":[{\"id\":\"f_1786369555576_1\",\"type\":\"button_group\",\"label\":\"ምድብ (Category)\",\"options\":[\"Standard\",\"Special\"]},{\"id\":\"f_1786369555576_2\",\"type\":\"dropdown\",\"label\":\"ዝርዝር (Select Option)\",\"options\":[\"Option 1\",\"Option 2\",\"Other\"],\"useIndependentOptions\":true,\"optionsByButton\":{\"Standard\":[\"Standard Item 1\",\"Standard Item 2\",\"Standard Other\"],\"Special\":[\"Special Item A\",\"Special Item B\",\"Special Other\"]},\"optionsByButtonStr\":{\"Standard\":\"Standard Item 1, Standard Item 2, Standard Other\",\"Special\":\"Special Item A, Special Item B, Special Other\"}},{\"id\":\"f_1786369555576_3\",\"type\":\"number\",\"label\":\"Baseline Value\",\"placeholder\":\"0\"},{\"id\":\"f_1786369555576_4\",\"type\":\"number\",\"label\":\"Plan Value\",\"placeholder\":\"0\"}]}'),
(18, 'digital_infrastructure_and_platforms', 'ዲጂታል መሠረተ ልማት እና መድረኮች', 'Digital Infrastructure and Platforms', 'bg-gray-50 text-gray-700 border-gray-200', 0, 100, '2026-08-10 16:46:09', '2026-08-10 16:46:09', '{\"sectionTitle\":\"DIGITAL INFRASTRUCTURE AND PLATFORMS DETAILS (ዲጂታል መሠረተ ልማት እና መድረኮች)\",\"fields\":[{\"id\":\"f_1786369569533_1\",\"type\":\"button_group\",\"label\":\"ምድብ (Category)\",\"options\":[\"Standard\",\"Special\"]},{\"id\":\"f_1786369569533_2\",\"type\":\"dropdown\",\"label\":\"ዝርዝር (Select Option)\",\"options\":[\"Option 1\",\"Option 2\",\"Other\"],\"useIndependentOptions\":true,\"optionsByButton\":{\"Standard\":[\"Standard Item 1\",\"Standard Item 2\",\"Standard Other\"],\"Special\":[\"Special Item A\",\"Special Item B\",\"Special Other\"]},\"optionsByButtonStr\":{\"Standard\":\"Standard Item 1, Standard Item 2, Standard Other\",\"Special\":\"Special Item A, Special Item B, Special Other\"}},{\"id\":\"f_1786369569533_3\",\"type\":\"number\",\"label\":\"Baseline Value\",\"placeholder\":\"0\"},{\"id\":\"f_1786369569533_4\",\"type\":\"number\",\"label\":\"Plan Value\",\"placeholder\":\"0\"}]}'),
(19, 'ai_enabled_smart_manufacturing', 'በአርቴፊሻል ኢንተለጀንስ የታገዘ ዘመናዊ ማኑፋክቸሪንግ', 'AI enabled Smart Manufacturing', 'bg-slate-100 text-slate-700 border-slate-300', 0, 100, '2026-08-10 16:46:23', '2026-08-10 16:46:23', '{\"sectionTitle\":\"AI ENABLED SMART MANUFACTURING DETAILS (በአርቴፊሻል ኢንተለጀንስ የታገዘ ዘመናዊ ማኑፋክቸሪንግ)\",\"fields\":[{\"id\":\"f_1786369583655_1\",\"type\":\"button_group\",\"label\":\"ምድብ (Category)\",\"options\":[\"Standard\",\"Special\"]},{\"id\":\"f_1786369583655_2\",\"type\":\"dropdown\",\"label\":\"ዝርዝር (Select Option)\",\"options\":[\"Option 1\",\"Option 2\",\"Other\"],\"useIndependentOptions\":true,\"optionsByButton\":{\"Standard\":[\"Standard Item 1\",\"Standard Item 2\",\"Standard Other\"],\"Special\":[\"Special Item A\",\"Special Item B\",\"Special Other\"]},\"optionsByButtonStr\":{\"Standard\":\"Standard Item 1, Standard Item 2, Standard Other\",\"Special\":\"Special Item A, Special Item B, Special Other\"}},{\"id\":\"f_1786369583655_3\",\"type\":\"number\",\"label\":\"Baseline Value\",\"placeholder\":\"0\"},{\"id\":\"f_1786369583655_4\",\"type\":\"number\",\"label\":\"Plan Value\",\"placeholder\":\"0\"}]}'),
(20, 'investment_attraction', 'የኢንቨስትመንት ሳቢነት / ኢንቨስትመንት መሳብ', 'Investment Attraction', 'bg-teal-50 text-teal-700 border-teal-200', 0, 100, '2026-08-10 16:46:39', '2026-08-10 16:46:39', '{\"sectionTitle\":\"INVESTMENT ATTRACTION DETAILS (የኢንቨስትመንት ሳቢነት / ኢንቨስትመንት መሳብ)\",\"fields\":[{\"id\":\"f_1786369599458_1\",\"type\":\"button_group\",\"label\":\"ምድብ (Category)\",\"options\":[\"Standard\",\"Special\"]},{\"id\":\"f_1786369599458_2\",\"type\":\"dropdown\",\"label\":\"ዝርዝር (Select Option)\",\"options\":[\"Option 1\",\"Option 2\",\"Other\"],\"useIndependentOptions\":true,\"optionsByButton\":{\"Standard\":[\"Standard Item 1\",\"Standard Item 2\",\"Standard Other\"],\"Special\":[\"Special Item A\",\"Special Item B\",\"Special Other\"]},\"optionsByButtonStr\":{\"Standard\":\"Standard Item 1, Standard Item 2, Standard Other\",\"Special\":\"Special Item A, Special Item B, Special Other\"}},{\"id\":\"f_1786369599458_3\",\"type\":\"number\",\"label\":\"Baseline Value\",\"placeholder\":\"0\"},{\"id\":\"f_1786369599458_4\",\"type\":\"number\",\"label\":\"Plan Value\",\"placeholder\":\"0\"}]}'),
(21, 'research___innovation', 'ምርምር እና ፈጠራ', 'Research & Innovation', 'bg-teal-50 text-teal-700 border-teal-200', 0, 100, '2026-08-10 16:46:50', '2026-08-10 16:46:50', '{\"sectionTitle\":\"RESEARCH & INNOVATION DETAILS (ምርምር እና ፈጠራ)\",\"fields\":[{\"id\":\"f_1786369610938_1\",\"type\":\"button_group\",\"label\":\"ምድብ (Category)\",\"options\":[\"Standard\",\"Special\"]},{\"id\":\"f_1786369610938_2\",\"type\":\"dropdown\",\"label\":\"ዝርዝር (Select Option)\",\"options\":[\"Option 1\",\"Option 2\",\"Other\"],\"useIndependentOptions\":true,\"optionsByButton\":{\"Standard\":[\"Standard Item 1\",\"Standard Item 2\",\"Standard Other\"],\"Special\":[\"Special Item A\",\"Special Item B\",\"Special Other\"]},\"optionsByButtonStr\":{\"Standard\":\"Standard Item 1, Standard Item 2, Standard Other\",\"Special\":\"Special Item A, Special Item B, Special Other\"}},{\"id\":\"f_1786369610938_3\",\"type\":\"number\",\"label\":\"Baseline Value\",\"placeholder\":\"0\"},{\"id\":\"f_1786369610938_4\",\"type\":\"number\",\"label\":\"Plan Value\",\"placeholder\":\"0\"}]}'),
(22, 'digital_talent___incubation', 'የዲጂታል ብቃት እና ኢንኩቤሽን', 'Digital talent & Incubation', 'bg-purple-50 text-purple-700 border-purple-200', 0, 100, '2026-08-10 16:47:40', '2026-08-10 16:47:40', '{\"sectionTitle\":\"DIGITAL TALENT & INCUBATION DETAILS (የዲጂታል ብቃት እና ኢንኩቤሽን)\",\"fields\":[{\"id\":\"f_1786369660919_1\",\"type\":\"button_group\",\"label\":\"ምድብ (Category)\",\"options\":[\"Standard\",\"Special\"]},{\"id\":\"f_1786369660919_2\",\"type\":\"dropdown\",\"label\":\"ዝርዝር (Select Option)\",\"options\":[\"Option 1\",\"Option 2\",\"Other\"],\"useIndependentOptions\":true,\"optionsByButton\":{\"Standard\":[\"Standard Item 1\",\"Standard Item 2\",\"Standard Other\"],\"Special\":[\"Special Item A\",\"Special Item B\",\"Special Other\"]},\"optionsByButtonStr\":{\"Standard\":\"Standard Item 1, Standard Item 2, Standard Other\",\"Special\":\"Special Item A, Special Item B, Special Other\"}},{\"id\":\"f_1786369660919_3\",\"type\":\"number\",\"label\":\"Baseline Value\",\"placeholder\":\"0\"},{\"id\":\"f_1786369660919_4\",\"type\":\"number\",\"label\":\"Plan Value\",\"placeholder\":\"0\"}]}'),
(23, 'import_substitution_and_home_grown_technology', 'የገቢ ምርትን መተካት እና ሀገር በቀል ቴክኖሎጂ', 'Import Substitution and Home grown technology', 'bg-teal-50 text-teal-700 border-teal-200', 0, 100, '2026-08-10 16:47:58', '2026-08-10 16:47:58', '{\"sectionTitle\":\"IMPORT SUBSTITUTION AND HOME GROWN TECHNOLOGY DETAILS (የገቢ ምርትን መተካት እና ሀገር በቀል ቴክኖሎጂ)\",\"fields\":[{\"id\":\"f_1786369678479_1\",\"type\":\"button_group\",\"label\":\"ምድብ (Category)\",\"options\":[\"Standard\",\"Special\"]},{\"id\":\"f_1786369678479_2\",\"type\":\"dropdown\",\"label\":\"ዝርዝር (Select Option)\",\"options\":[\"Option 1\",\"Option 2\",\"Other\"],\"useIndependentOptions\":true,\"optionsByButton\":{\"Standard\":[\"Standard Item 1\",\"Standard Item 2\",\"Standard Other\"],\"Special\":[\"Special Item A\",\"Special Item B\",\"Special Other\"]},\"optionsByButtonStr\":{\"Standard\":\"Standard Item 1, Standard Item 2, Standard Other\",\"Special\":\"Special Item A, Special Item B, Special Other\"}},{\"id\":\"f_1786369678479_3\",\"type\":\"number\",\"label\":\"Baseline Value\",\"placeholder\":\"0\"},{\"id\":\"f_1786369678479_4\",\"type\":\"number\",\"label\":\"Plan Value\",\"placeholder\":\"0\"}]}'),
(24, '__________', 'Smart Security', 'ዘመናዊ ደህንነት', 'bg-gray-50 text-gray-700 border-gray-200', 0, 100, '2026-08-10 16:48:18', '2026-08-10 16:48:18', '{\"sectionTitle\":\"ዘመናዊ ደህንነት DETAILS (Smart Security)\",\"fields\":[{\"id\":\"f_1786369698440_1\",\"type\":\"button_group\",\"label\":\"ምድብ (Category)\",\"options\":[\"Standard\",\"Special\"]},{\"id\":\"f_1786369698440_2\",\"type\":\"dropdown\",\"label\":\"ዝርዝር (Select Option)\",\"options\":[\"Option 1\",\"Option 2\",\"Other\"],\"useIndependentOptions\":true,\"optionsByButton\":{\"Standard\":[\"Standard Item 1\",\"Standard Item 2\",\"Standard Other\"],\"Special\":[\"Special Item A\",\"Special Item B\",\"Special Other\"]},\"optionsByButtonStr\":{\"Standard\":\"Standard Item 1, Standard Item 2, Standard Other\",\"Special\":\"Special Item A, Special Item B, Special Other\"}},{\"id\":\"f_1786369698440_3\",\"type\":\"number\",\"label\":\"Baseline Value\",\"placeholder\":\"0\"},{\"id\":\"f_1786369698440_4\",\"type\":\"number\",\"label\":\"Plan Value\",\"placeholder\":\"0\"}]}'),
(25, 'digital_corporate_service_and_audit', 'ዲጂታል የኮርፖሬት አገልግሎት እና ኦዲት', 'Digital Corporate Service and Audit', 'bg-teal-50 text-teal-700 border-teal-200', 0, 100, '2026-08-10 16:48:39', '2026-08-10 16:48:39', '{\"sectionTitle\":\"DIGITAL CORPORATE SERVICE AND AUDIT DETAILS (ዲጂታል የኮርፖሬት አገልግሎት እና ኦዲት)\",\"fields\":[{\"id\":\"f_1786369719334_1\",\"type\":\"button_group\",\"label\":\"ምድብ (Category)\",\"options\":[\"Standard\",\"Special\"]},{\"id\":\"f_1786369719334_2\",\"type\":\"dropdown\",\"label\":\"ዝርዝር (Select Option)\",\"options\":[\"Option 1\",\"Option 2\",\"Other\"],\"useIndependentOptions\":true,\"optionsByButton\":{\"Standard\":[\"Standard Item 1\",\"Standard Item 2\",\"Standard Other\"],\"Special\":[\"Special Item A\",\"Special Item B\",\"Special Other\"]},\"optionsByButtonStr\":{\"Standard\":\"Standard Item 1, Standard Item 2, Standard Other\",\"Special\":\"Special Item A, Special Item B, Special Other\"}},{\"id\":\"f_1786369719334_3\",\"type\":\"number\",\"label\":\"Baseline Value\",\"placeholder\":\"0\"},{\"id\":\"f_1786369719334_4\",\"type\":\"number\",\"label\":\"Plan Value\",\"placeholder\":\"0\"}]}'),
(26, 'legal___policy_framework', 'የህግ እና ፖሊሲ ማዕቀፍ', 'Legal & Policy Framework', 'bg-indigo-50 text-indigo-700 border-indigo-200', 0, 100, '2026-08-10 16:48:56', '2026-08-10 16:48:56', '{\"sectionTitle\":\"LEGAL & POLICY FRAMEWORK DETAILS (የህግ እና ፖሊሲ ማዕቀፍ)\",\"fields\":[{\"id\":\"f_1786369736904_1\",\"type\":\"button_group\",\"label\":\"ምድብ (Category)\",\"options\":[\"Standard\",\"Special\"]},{\"id\":\"f_1786369736904_2\",\"type\":\"dropdown\",\"label\":\"ዝርዝር (Select Option)\",\"options\":[\"Option 1\",\"Option 2\",\"Other\"],\"useIndependentOptions\":true,\"optionsByButton\":{\"Standard\":[\"Standard Item 1\",\"Standard Item 2\",\"Standard Other\"],\"Special\":[\"Special Item A\",\"Special Item B\",\"Special Other\"]},\"optionsByButtonStr\":{\"Standard\":\"Standard Item 1, Standard Item 2, Standard Other\",\"Special\":\"Special Item A, Special Item B, Special Other\"}},{\"id\":\"f_1786369736904_3\",\"type\":\"number\",\"label\":\"Baseline Value\",\"placeholder\":\"0\"},{\"id\":\"f_1786369736904_4\",\"type\":\"number\",\"label\":\"Plan Value\",\"placeholder\":\"0\"}]}'),
(27, 'hr__procurement___general_service', 'የሰው ሀብት፣ ግዢ እና ጠቅላላ አገልግሎት', 'HR, Procurement & General Service', 'bg-blue-50 text-blue-700 border-blue-200', 0, 100, '2026-08-10 16:49:12', '2026-08-10 16:49:12', '{\"sectionTitle\":\"HR, PROCUREMENT & GENERAL SERVICE DETAILS (የሰው ሀብት፣ ግዢ እና ጠቅላላ አገልግሎት)\",\"fields\":[{\"id\":\"f_1786369752804_1\",\"type\":\"button_group\",\"label\":\"ምድብ (Category)\",\"options\":[\"Standard\",\"Special\"]},{\"id\":\"f_1786369752804_2\",\"type\":\"dropdown\",\"label\":\"ዝርዝር (Select Option)\",\"options\":[\"Option 1\",\"Option 2\",\"Other\"],\"useIndependentOptions\":true,\"optionsByButton\":{\"Standard\":[\"Standard Item 1\",\"Standard Item 2\",\"Standard Other\"],\"Special\":[\"Special Item A\",\"Special Item B\",\"Special Other\"]},\"optionsByButtonStr\":{\"Standard\":\"Standard Item 1, Standard Item 2, Standard Other\",\"Special\":\"Special Item A, Special Item B, Special Other\"}},{\"id\":\"f_1786369752804_3\",\"type\":\"number\",\"label\":\"Baseline Value\",\"placeholder\":\"0\"},{\"id\":\"f_1786369752804_4\",\"type\":\"number\",\"label\":\"Plan Value\",\"placeholder\":\"0\"}]}');

-- --------------------------------------------------------

--
-- Table structure for table `positions`
--

CREATE TABLE `positions` (
  `position_id` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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

-- --------------------------------------------------------

--
-- Table structure for table `risk_flags`
--

CREATE TABLE `risk_flags` (
  `risk_id` int(11) NOT NULL,
  `action_plan_id` int(11) NOT NULL,
  `risk_level` enum('critical','high','medium','low') NOT NULL DEFAULT 'medium',
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `mitigation` text DEFAULT NULL,
  `escalation_target` varchar(100) DEFAULT NULL,
  `status` enum('open','monitoring','resolved') DEFAULT 'open',
  `reported_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
(716, 3, 70, 1, 1, 1, 1, '2026-03-18 12:31:28', '2026-03-18 12:31:28'),
(719, 7, 70, 1, 1, 1, 1, '2026-03-18 12:31:28', '2026-03-18 12:31:28'),
(720, 8, 70, 1, 1, 1, 1, '2026-03-18 12:31:28', '2026-03-18 12:31:28'),
(722, 28, 70, 1, 1, 1, 1, '2026-03-18 12:31:28', '2026-03-18 12:31:28'),
(724, 30, 70, 1, 1, 1, 1, '2026-03-18 12:31:28', '2026-03-18 12:31:28'),
(725, 31, 70, 1, 1, 1, 1, '2026-03-18 12:31:28', '2026-03-18 12:31:28'),
(726, 32, 70, 1, 1, 1, 1, '2026-03-18 12:31:28', '2026-03-18 12:31:28'),
(731, 3, 71, 1, 1, 1, 1, '2026-03-18 12:31:28', '2026-03-18 12:31:28'),
(734, 7, 71, 1, 1, 1, 1, '2026-03-18 12:31:28', '2026-03-18 12:31:28'),
(735, 8, 71, 1, 1, 1, 1, '2026-03-18 12:31:28', '2026-03-18 12:31:28'),
(737, 28, 71, 1, 1, 1, 1, '2026-03-18 12:31:28', '2026-03-18 12:31:28'),
(739, 30, 71, 1, 1, 1, 1, '2026-03-18 12:31:28', '2026-03-18 12:31:28'),
(740, 31, 71, 1, 1, 1, 1, '2026-03-18 12:31:28', '2026-03-18 12:31:28'),
(741, 32, 71, 1, 1, 1, 1, '2026-03-18 12:31:28', '2026-03-18 12:31:28'),
(746, 3, 72, 1, 1, 1, 1, '2026-03-18 12:31:28', '2026-03-18 12:31:28'),
(749, 7, 72, 1, 1, 1, 1, '2026-03-18 12:31:28', '2026-03-18 12:31:28'),
(750, 8, 72, 1, 1, 1, 1, '2026-03-18 12:31:28', '2026-03-18 12:31:28'),
(752, 28, 72, 1, 1, 1, 1, '2026-03-18 12:31:28', '2026-03-18 12:31:28'),
(754, 30, 72, 1, 1, 1, 1, '2026-03-18 12:31:28', '2026-03-18 12:31:28'),
(755, 31, 72, 1, 1, 1, 1, '2026-03-18 12:31:28', '2026-03-18 12:31:28'),
(756, 32, 72, 1, 1, 1, 1, '2026-03-18 12:31:28', '2026-03-18 12:31:28'),
(761, 3, 73, 1, 1, 1, 1, '2026-03-18 12:31:28', '2026-03-18 12:31:28'),
(764, 7, 73, 1, 1, 1, 1, '2026-03-18 12:31:28', '2026-03-18 12:31:28'),
(765, 8, 73, 1, 1, 1, 1, '2026-03-18 12:31:28', '2026-03-18 12:31:28'),
(767, 28, 73, 1, 1, 1, 1, '2026-03-18 12:31:28', '2026-03-18 12:31:28'),
(769, 30, 73, 1, 1, 1, 1, '2026-03-18 12:31:28', '2026-03-18 12:31:28'),
(770, 31, 73, 1, 1, 1, 1, '2026-03-18 12:31:28', '2026-03-18 12:31:28'),
(771, 32, 73, 1, 1, 1, 1, '2026-03-18 12:31:28', '2026-03-18 12:31:28'),
(772, 1, 3, 1, 1, 1, 1, '2026-03-19 09:04:02', '2026-03-19 09:04:02'),
(773, 1, 59, 1, 1, 1, 1, '2026-03-19 09:04:02', '2026-03-19 09:04:02'),
(774, 1, 34, 1, 1, 1, 1, '2026-03-19 09:04:02', '2026-03-19 09:04:02'),
(775, 1, 1, 1, 1, 1, 1, '2026-03-19 09:04:02', '2026-03-19 09:04:02'),
(776, 1, 55, 1, 1, 1, 1, '2026-03-19 09:04:02', '2026-03-19 09:04:02'),
(777, 1, 31, 1, 1, 1, 1, '2026-03-19 09:04:02', '2026-03-19 09:04:02'),
(778, 1, 51, 1, 1, 1, 1, '2026-03-19 09:04:02', '2026-03-19 09:04:02'),
(779, 1, 52, 1, 1, 1, 1, '2026-03-19 09:04:02', '2026-03-19 09:04:02'),
(780, 1, 40, 1, 1, 1, 1, '2026-03-19 09:04:02', '2026-03-19 09:04:02'),
(781, 1, 10, 1, 1, 1, 1, '2026-03-19 09:04:02', '2026-03-19 09:04:02'),
(782, 1, 71, 1, 1, 1, 1, '2026-03-19 09:04:02', '2026-03-19 09:04:02'),
(783, 1, 60, 1, 1, 1, 1, '2026-03-19 09:04:02', '2026-03-19 09:04:02'),
(784, 1, 48, 1, 1, 1, 1, '2026-03-19 09:04:02', '2026-03-19 09:04:02'),
(785, 1, 4, 1, 1, 1, 1, '2026-03-19 09:04:02', '2026-03-19 09:04:02'),
(786, 1, 26, 1, 1, 1, 1, '2026-03-19 09:04:02', '2026-03-19 09:04:02'),
(787, 1, 72, 1, 1, 1, 1, '2026-03-19 09:04:02', '2026-03-19 09:04:02'),
(788, 1, 32, 1, 1, 1, 1, '2026-03-19 09:04:02', '2026-03-19 09:04:02'),
(789, 1, 35, 1, 1, 1, 1, '2026-03-19 09:04:02', '2026-03-19 09:04:02'),
(790, 1, 2, 1, 1, 1, 1, '2026-03-19 09:04:02', '2026-03-19 09:04:02'),
(791, 1, 73, 1, 1, 1, 1, '2026-03-19 09:04:02', '2026-03-19 09:04:02'),
(792, 1, 65, 1, 1, 1, 1, '2026-03-19 09:04:02', '2026-03-19 09:04:02'),
(793, 1, 12, 1, 1, 1, 1, '2026-03-19 09:04:02', '2026-03-19 09:04:02'),
(794, 1, 45, 1, 1, 1, 1, '2026-03-19 09:04:02', '2026-03-19 09:04:02'),
(795, 1, 9, 1, 1, 1, 1, '2026-03-19 09:04:02', '2026-03-19 09:04:02'),
(796, 1, 74, 1, 1, 1, 1, '2026-03-19 09:04:02', '2026-03-19 09:04:02'),
(797, 1, 24, 1, 1, 1, 1, '2026-03-19 09:04:02', '2026-03-19 09:04:02'),
(798, 1, 29, 1, 1, 1, 1, '2026-03-19 09:04:02', '2026-03-19 09:04:02'),
(799, 1, 30, 1, 1, 1, 1, '2026-03-19 09:04:02', '2026-03-19 09:04:02'),
(800, 1, 70, 1, 1, 1, 1, '2026-03-19 09:04:02', '2026-03-19 09:04:02'),
(801, 1, 69, 1, 1, 1, 1, '2026-03-19 09:04:02', '2026-03-19 09:04:02'),
(802, 29, 59, 1, 0, 0, 0, '2026-03-19 10:18:46', '2026-03-19 10:18:46'),
(803, 29, 1, 1, 1, 1, 1, '2026-03-19 10:18:46', '2026-03-19 10:18:46'),
(804, 29, 55, 1, 1, 1, 1, '2026-03-19 10:18:46', '2026-03-19 10:18:46'),
(805, 29, 51, 1, 0, 0, 0, '2026-03-19 10:18:46', '2026-03-19 10:18:46'),
(806, 29, 52, 1, 0, 0, 0, '2026-03-19 10:18:46', '2026-03-19 10:18:46'),
(807, 29, 40, 1, 1, 1, 1, '2026-03-19 10:18:46', '2026-03-19 10:18:46'),
(808, 29, 71, 1, 1, 1, 1, '2026-03-19 10:18:46', '2026-03-19 10:18:46'),
(809, 29, 60, 1, 0, 0, 0, '2026-03-19 10:18:46', '2026-03-19 10:18:46'),
(810, 29, 72, 1, 1, 1, 1, '2026-03-19 10:18:46', '2026-03-19 10:18:46'),
(811, 29, 73, 1, 1, 1, 1, '2026-03-19 10:18:46', '2026-03-19 10:18:46'),
(812, 29, 65, 1, 0, 0, 0, '2026-03-19 10:18:46', '2026-03-19 10:18:46'),
(813, 29, 45, 1, 0, 0, 0, '2026-03-19 10:18:46', '2026-03-19 10:18:46'),
(814, 29, 74, 1, 1, 1, 1, '2026-03-19 10:18:46', '2026-03-19 10:18:46'),
(815, 29, 29, 1, 0, 0, 0, '2026-03-19 10:18:46', '2026-03-19 10:18:46'),
(816, 29, 70, 1, 1, 1, 1, '2026-03-19 10:18:46', '2026-03-19 10:18:46'),
(817, 2, 59, 1, 0, 0, 0, '2026-03-19 10:19:23', '2026-03-19 10:19:23'),
(818, 2, 1, 1, 0, 0, 0, '2026-03-19 10:19:23', '2026-03-19 10:19:23'),
(819, 2, 55, 1, 1, 1, 1, '2026-03-19 10:19:23', '2026-03-19 10:19:23'),
(820, 2, 51, 1, 1, 1, 1, '2026-03-19 10:19:23', '2026-03-19 10:19:23'),
(821, 2, 52, 1, 1, 1, 1, '2026-03-19 10:19:23', '2026-03-19 10:19:23'),
(822, 2, 40, 1, 1, 1, 1, '2026-03-19 10:19:23', '2026-03-19 10:19:23'),
(823, 2, 71, 1, 1, 1, 1, '2026-03-19 10:19:23', '2026-03-19 10:19:23'),
(824, 2, 60, 1, 0, 0, 0, '2026-03-19 10:19:23', '2026-03-19 10:19:23'),
(825, 2, 72, 1, 1, 1, 1, '2026-03-19 10:19:23', '2026-03-19 10:19:23'),
(826, 2, 73, 1, 1, 1, 1, '2026-03-19 10:19:23', '2026-03-19 10:19:23'),
(827, 2, 65, 1, 0, 0, 0, '2026-03-19 10:19:23', '2026-03-19 10:19:23'),
(828, 2, 12, 1, 0, 0, 0, '2026-03-19 10:19:23', '2026-03-19 10:19:23'),
(829, 2, 45, 1, 0, 0, 0, '2026-03-19 10:19:23', '2026-03-19 10:19:23'),
(830, 2, 9, 1, 0, 0, 0, '2026-03-19 10:19:23', '2026-03-19 10:19:23'),
(831, 2, 74, 1, 1, 1, 1, '2026-03-19 10:19:23', '2026-03-19 10:19:23'),
(832, 2, 29, 1, 1, 1, 1, '2026-03-19 10:19:23', '2026-03-19 10:19:23'),
(833, 2, 70, 1, 1, 1, 1, '2026-03-19 10:19:23', '2026-03-19 10:19:23'),
(834, 1, 75, 1, 1, 1, 1, '2026-03-19 11:03:00', '2026-03-19 11:03:00'),
(835, 29, 75, 1, 1, 1, 1, '2026-03-19 11:03:00', '2026-03-19 11:03:00'),
(865, 1, 27, 1, 1, 1, 1, '2026-03-25 07:26:29', '2026-03-25 07:26:29'),
(870, 9, 59, 1, 1, 1, 1, '2026-07-15 08:11:20', '2026-07-15 08:11:20'),
(876, 9, 10, 1, 1, 1, 1, '2026-07-15 08:11:20', '2026-07-15 08:11:20'),
(877, 9, 71, 1, 1, 1, 1, '2026-07-15 08:11:20', '2026-07-15 08:11:20'),
(879, 9, 60, 1, 1, 1, 1, '2026-07-15 08:11:20', '2026-07-15 08:11:20'),
(880, 9, 11, 1, 1, 1, 1, '2026-07-15 08:11:20', '2026-07-15 08:11:20'),
(881, 9, 72, 1, 1, 1, 1, '2026-07-15 08:11:20', '2026-07-15 08:11:20'),
(882, 9, 73, 1, 1, 1, 1, '2026-07-15 08:11:20', '2026-07-15 08:11:20'),
(883, 9, 65, 1, 1, 1, 1, '2026-07-15 08:11:20', '2026-07-15 08:11:20'),
(884, 9, 12, 1, 1, 1, 1, '2026-07-15 08:11:20', '2026-07-15 08:11:20'),
(885, 9, 45, 1, 1, 1, 1, '2026-07-15 08:11:20', '2026-07-15 08:11:20'),
(886, 9, 9, 1, 1, 1, 1, '2026-07-15 08:11:20', '2026-07-15 08:11:20'),
(887, 9, 70, 1, 1, 1, 1, '2026-07-15 08:11:20', '2026-07-15 08:11:20'),
(888, 9, 56, 1, 1, 1, 1, '2026-07-15 08:11:24', '2026-07-15 08:11:24'),
(889, 9, 40, 1, 1, 1, 1, '2026-07-15 08:11:26', '2026-07-15 08:11:26'),
(890, 9, 52, 1, 1, 1, 1, '2026-07-15 08:11:26', '2026-07-15 08:11:26'),
(892, 9, 63, 1, 1, 1, 1, '2026-07-15 08:11:28', '2026-07-15 08:11:28'),
(893, 9, 1, 1, 1, 1, 1, '2026-07-15 08:11:29', '2026-07-15 08:11:29'),
(894, 9, 51, 1, 1, 1, 1, '2026-07-15 08:11:30', '2026-07-15 08:11:30'),
(895, 9, 74, 1, 1, 1, 1, '2026-07-15 08:11:46', '2026-07-15 08:11:46'),
(896, 1, 76, 1, 1, 1, 1, '2026-08-07 13:02:10', '2026-08-07 13:02:10'),
(898, 2, 77, 1, 1, 1, 1, '2026-08-08 05:12:15', '2026-08-08 05:12:15'),
(899, 3, 77, 1, 1, 1, 1, '2026-08-08 05:12:15', '2026-08-08 05:12:15'),
(900, 4, 77, 1, 1, 1, 1, '2026-08-08 05:12:15', '2026-08-08 05:12:15'),
(901, 29, 77, 1, 1, 1, 1, '2026-08-08 05:12:15', '2026-08-08 05:12:15'),
(902, 1, 77, 1, 1, 1, 1, '2026-08-08 05:22:52', '2026-08-08 05:22:52'),
(904, 6, 59, 1, 1, 1, 1, '2026-08-08 05:29:01', '2026-08-08 05:29:01'),
(905, 6, 7, 1, 1, 1, 1, '2026-08-08 05:29:01', '2026-08-08 05:29:01'),
(906, 6, 1, 1, 1, 1, 1, '2026-08-08 05:29:01', '2026-08-08 05:29:01'),
(907, 6, 55, 1, 1, 1, 1, '2026-08-08 05:29:01', '2026-08-08 05:29:01'),
(908, 6, 57, 1, 1, 1, 1, '2026-08-08 05:29:01', '2026-08-08 05:29:01'),
(909, 6, 51, 1, 1, 1, 1, '2026-08-08 05:29:01', '2026-08-08 05:29:01'),
(910, 6, 14, 1, 1, 1, 1, '2026-08-08 05:29:01', '2026-08-08 05:29:01'),
(911, 6, 52, 1, 1, 1, 1, '2026-08-08 05:29:01', '2026-08-08 05:29:01'),
(912, 6, 40, 1, 1, 1, 1, '2026-08-08 05:29:01', '2026-08-08 05:29:01'),
(913, 6, 43, 1, 1, 1, 1, '2026-08-08 05:29:01', '2026-08-08 05:29:01'),
(914, 6, 71, 1, 1, 1, 1, '2026-08-08 05:29:01', '2026-08-08 05:29:01'),
(915, 6, 56, 1, 1, 1, 1, '2026-08-08 05:29:01', '2026-08-08 05:29:01'),
(916, 6, 54, 1, 1, 1, 1, '2026-08-08 05:29:01', '2026-08-08 05:29:01'),
(917, 6, 60, 1, 1, 1, 1, '2026-08-08 05:29:01', '2026-08-08 05:29:01'),
(918, 6, 58, 1, 1, 1, 1, '2026-08-08 05:29:01', '2026-08-08 05:29:01'),
(919, 6, 48, 1, 1, 1, 1, '2026-08-08 05:29:01', '2026-08-08 05:29:01'),
(920, 6, 67, 1, 1, 1, 1, '2026-08-08 05:29:01', '2026-08-08 05:29:01'),
(921, 6, 72, 1, 1, 1, 1, '2026-08-08 05:29:01', '2026-08-08 05:29:01'),
(922, 6, 32, 1, 1, 1, 1, '2026-08-08 05:29:01', '2026-08-08 05:29:01'),
(923, 6, 15, 1, 1, 1, 1, '2026-08-08 05:29:01', '2026-08-08 05:29:01'),
(924, 6, 73, 1, 1, 1, 1, '2026-08-08 05:29:01', '2026-08-08 05:29:01'),
(925, 6, 65, 1, 1, 1, 1, '2026-08-08 05:29:01', '2026-08-08 05:29:01'),
(926, 6, 6, 1, 1, 1, 1, '2026-08-08 05:29:01', '2026-08-08 05:29:01'),
(927, 6, 45, 1, 1, 1, 1, '2026-08-08 05:29:01', '2026-08-08 05:29:01'),
(928, 6, 13, 1, 1, 1, 1, '2026-08-08 05:29:01', '2026-08-08 05:29:01'),
(929, 6, 74, 1, 1, 1, 1, '2026-08-08 05:29:01', '2026-08-08 05:29:01'),
(930, 6, 29, 1, 1, 1, 1, '2026-08-08 05:29:01', '2026-08-08 05:29:01'),
(931, 6, 70, 1, 1, 1, 1, '2026-08-08 05:29:01', '2026-08-08 05:29:01'),
(932, 6, 77, 1, 1, 1, 1, '2026-08-08 05:29:01', '2026-08-08 05:29:01'),
(934, 5, 59, 1, 1, 1, 1, '2026-08-09 06:26:24', '2026-08-09 06:26:24'),
(935, 5, 1, 1, 1, 1, 1, '2026-08-09 06:26:24', '2026-08-09 06:26:24'),
(936, 5, 55, 1, 1, 1, 1, '2026-08-09 06:26:24', '2026-08-09 06:26:24'),
(937, 5, 51, 1, 1, 1, 1, '2026-08-09 06:26:24', '2026-08-09 06:26:24'),
(938, 5, 52, 1, 1, 1, 1, '2026-08-09 06:26:24', '2026-08-09 06:26:24'),
(940, 5, 71, 1, 1, 1, 1, '2026-08-09 06:26:24', '2026-08-09 06:26:24'),
(941, 5, 60, 1, 1, 1, 1, '2026-08-09 06:26:24', '2026-08-09 06:26:24'),
(942, 5, 72, 1, 1, 1, 1, '2026-08-09 06:26:24', '2026-08-09 06:26:24'),
(943, 5, 73, 1, 1, 1, 1, '2026-08-09 06:26:24', '2026-08-09 06:26:24'),
(944, 5, 65, 1, 1, 1, 1, '2026-08-09 06:26:24', '2026-08-09 06:26:24'),
(945, 5, 45, 1, 1, 1, 1, '2026-08-09 06:26:24', '2026-08-09 06:26:24'),
(947, 5, 70, 1, 1, 1, 1, '2026-08-09 06:26:24', '2026-08-09 06:26:24'),
(948, 5, 77, 1, 1, 1, 1, '2026-08-09 06:26:24', '2026-08-09 06:26:24'),
(949, 1, 78, 1, 1, 1, 1, '2026-08-09 16:40:45', '2026-08-09 16:40:45'),
(950, 4, 78, 1, 1, 1, 1, '2026-08-09 16:40:45', '2026-08-09 16:40:45'),
(951, 2, 78, 1, 1, 1, 1, '2026-08-09 16:40:45', '2026-08-09 16:40:45'),
(952, 3, 78, 1, 1, 1, 1, '2026-08-09 16:40:45', '2026-08-09 16:40:45'),
(953, 29, 78, 1, 1, 1, 1, '2026-08-09 16:40:45', '2026-08-09 16:40:45'),
(954, 1, 79, 1, 1, 1, 1, '2026-08-09 20:02:54', '2026-08-09 20:02:54'),
(955, 5, 79, 1, 1, 1, 1, '2026-08-09 20:02:54', '2026-08-09 20:02:54'),
(956, 29, 79, 1, 1, 1, 1, '2026-08-09 20:02:54', '2026-08-09 20:02:54'),
(957, 4, 79, 1, 1, 1, 1, '2026-08-09 20:02:54', '2026-08-09 20:02:54'),
(958, 2, 79, 1, 1, 1, 1, '2026-08-09 20:02:54', '2026-08-09 20:02:54'),
(959, 3, 79, 1, 1, 1, 1, '2026-08-09 20:02:54', '2026-08-09 20:02:54'),
(960, 1, 80, 1, 1, 1, 1, '2026-08-11 12:20:42', '2026-08-11 12:20:42'),
(961, 29, 80, 1, 1, 1, 1, '2026-08-11 12:20:42', '2026-08-11 12:20:42'),
(962, 2, 80, 1, 1, 1, 1, '2026-08-11 12:20:42', '2026-08-11 12:20:42'),
(963, 32, 80, 1, 1, 1, 1, '2026-08-11 12:20:42', '2026-08-11 12:20:42'),
(964, 5, 80, 1, 1, 1, 1, '2026-08-11 12:20:42', '2026-08-11 12:20:42'),
(965, 30, 80, 1, 1, 1, 1, '2026-08-11 12:20:42', '2026-08-11 12:20:42'),
(966, 31, 80, 1, 1, 1, 1, '2026-08-11 12:20:42', '2026-08-11 12:20:42'),
(967, 6, 80, 1, 1, 1, 1, '2026-08-11 12:20:42', '2026-08-11 12:20:42'),
(968, 7, 80, 1, 1, 1, 1, '2026-08-11 12:20:42', '2026-08-11 12:20:42'),
(969, 28, 80, 1, 1, 1, 1, '2026-08-11 12:20:42', '2026-08-11 12:20:42'),
(970, 8, 80, 1, 1, 1, 1, '2026-08-11 12:20:42', '2026-08-11 12:20:42'),
(971, 9, 80, 1, 1, 1, 1, '2026-08-11 12:20:42', '2026-08-11 12:20:42'),
(972, 3, 80, 1, 1, 1, 1, '2026-08-11 12:20:42', '2026-08-11 12:20:42'),
(973, 1, 81, 1, 1, 1, 1, '2026-08-11 12:20:42', '2026-08-11 12:20:42'),
(974, 29, 81, 1, 1, 1, 1, '2026-08-11 12:20:42', '2026-08-11 12:20:42'),
(975, 2, 81, 1, 1, 1, 1, '2026-08-11 12:20:42', '2026-08-11 12:20:42'),
(976, 32, 81, 1, 1, 1, 1, '2026-08-11 12:20:42', '2026-08-11 12:20:42'),
(977, 5, 81, 1, 1, 1, 1, '2026-08-11 12:20:42', '2026-08-11 12:20:42'),
(978, 30, 81, 1, 1, 1, 1, '2026-08-11 12:20:42', '2026-08-11 12:20:42'),
(979, 31, 81, 1, 1, 1, 1, '2026-08-11 12:20:42', '2026-08-11 12:20:42'),
(980, 6, 81, 1, 1, 1, 1, '2026-08-11 12:20:42', '2026-08-11 12:20:42'),
(981, 7, 81, 1, 1, 1, 1, '2026-08-11 12:20:42', '2026-08-11 12:20:42'),
(982, 28, 81, 1, 1, 1, 1, '2026-08-11 12:20:42', '2026-08-11 12:20:42'),
(983, 8, 81, 1, 1, 1, 1, '2026-08-11 12:20:42', '2026-08-11 12:20:42'),
(984, 9, 81, 1, 1, 1, 1, '2026-08-11 12:20:42', '2026-08-11 12:20:42'),
(985, 3, 81, 1, 1, 1, 1, '2026-08-11 12:20:42', '2026-08-11 12:20:42');

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
  `view` enum('የፋይናንስ ዕይታ','የተገልጋይ ዕይታ','የውስጥ አሰራር ዕይታ','የመማማርና ዕድገት ዕይታ') DEFAULT NULL,
  `org_node_ids` text DEFAULT NULL,
  `supportive_org_node_ids` text DEFAULT NULL,
  `weight` decimal(10,2) DEFAULT 100.00 COMMENT 'KPI weight (total budget for action plans)',
  `plan_type` varchar(100) DEFAULT 'general'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `specific_objectives`
--

INSERT INTO `specific_objectives` (`specific_objective_id`, `user_id`, `objective_id`, `specific_objective_name`, `details`, `baseline`, `plan`, `measurement`, `execution_percentage`, `created_at`, `updated_at`, `deadline_quarter`, `deadline`, `priority`, `department_id`, `name`, `count`, `progress`, `income_id`, `cost_id`, `view`, `org_node_ids`, `supportive_org_node_ids`, `weight`, `plan_type`) VALUES
(734, 40, 270, 'test kepi 4', NULL, NULL, NULL, NULL, 0.00, '2026-08-07 17:18:43', '2026-08-07 17:18:43', 'Q1', NULL, 'አስፈላጊ', 32, 'test kepi 4', 1, 'started', NULL, NULL, 'የውስጥ አሰራር ዕይታ', '[\"32\",\"11\",\"14\",\"17\",\"56\",\"55\",\"54\"]', NULL, 3.00, 'job_creation'),
(735, 40, 271, 'ERP', NULL, NULL, NULL, NULL, 0.00, '2026-08-08 07:29:04', '2026-08-08 07:29:04', 'Q1', NULL, 'አስፈላጊ', 14, 'ERP', 1, 'started', NULL, NULL, 'የውስጥ አሰራር ዕይታ', '[\"14\"]', NULL, 4.00, 'project'),
(736, 40, 270, 'Income plan KPI', NULL, NULL, NULL, NULL, 0.00, '2026-08-09 06:21:27', '2026-08-11 07:28:35', 'Q1', NULL, 'አስፈላጊ', 11, 'Income plan KPI', 1, 'started', NULL, NULL, 'የፋይናንስ ዕይታ', '[\"11\"]', NULL, 1.00, 'income'),
(737, 40, 272, 'income KPI', NULL, NULL, NULL, NULL, 100.00, '2026-08-09 19:07:12', '2026-08-09 19:20:54', 'Q1', NULL, 'አስፈላጊ', 11, 'income KPI', 1, 'started', NULL, NULL, 'የፋይናንስ ዕይታ', '[\"11\"]', NULL, 1.00, 'income'),
(738, 40, 273, 'test kpi 4', NULL, NULL, NULL, NULL, 49.98, '2026-08-10 07:14:05', '2026-08-10 07:27:02', 'Q1', NULL, 'አስፈላጊ', 11, 'test kpi 4', 1, 'started', NULL, NULL, 'የፋይናንስ ዕይታ', '[\"11\",\"32\"]', NULL, 1.00, 'cost'),
(739, 40, 273, 'የግዢ እቅድ', NULL, NULL, NULL, NULL, 70.00, '2026-08-10 12:47:16', '2026-08-10 13:21:40', 'Q1', NULL, 'አስፈላጊ', 11, 'የግዢ እቅድ', 1, 'started', NULL, NULL, 'የፋይናንስ ዕይታ', '[\"11\"]', NULL, 0.50, 'purchase'),
(740, 40, 274, 'Local Investment', NULL, NULL, NULL, NULL, 20.00, '2026-08-10 17:21:26', '2026-08-10 18:21:43', 'Q1', NULL, 'አስፈላጊ', 11, 'Local Investment', 1, 'started', NULL, NULL, 'የፋይናንስ ዕይታ', '[\"11\"]', NULL, 2.00, '_________________'),
(741, 40, 270, 'FDI', NULL, NULL, NULL, NULL, 50.00, '2026-08-11 07:30:07', '2026-08-12 07:42:01', 'Q1', NULL, 'አስፈላጊ', 11, 'FDI', 1, 'started', NULL, NULL, 'የፋይናንስ ዕይታ', '[\"11\"]', '[\"32\"]', 0.50, '____'),
(742, 40, 275, 'KPI አስተማማኝ የፋሲሊቲ ኦፕሬሽንስ እና የአገልግሎት አቅርቦትን ማረጋገጥ', NULL, NULL, NULL, NULL, 16.00, '2026-08-11 18:45:33', '2026-08-12 17:29:58', 'Q1', NULL, 'አስፈላጊ', 11, 'KPI አስተማማኝ የፋሲሊቲ ኦፕሬሽንስ እና የአገልግሎት አቅርቦትን ማረጋገጥ', 1, 'started', NULL, NULL, 'የፋይናንስ ዕይታ', '[\"11\"]', NULL, 2.00, 'income');

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
  `CIbaseline` decimal(15,2) DEFAULT NULL,
  `CIplan` decimal(15,2) DEFAULT NULL,
  `CIoutcome` decimal(15,2) DEFAULT NULL,
  `CIexecution_percentage` decimal(5,2) DEFAULT NULL,
  `editing_status` enum('active','deactivate') NOT NULL DEFAULT 'active',
  `reporting` enum('active','deactivate') NOT NULL DEFAULT 'active',
  `goal_id` int(11) DEFAULT NULL,
  `project_type` varchar(255) DEFAULT NULL,
  `income_plan_type` varchar(255) DEFAULT NULL,
  `employee_of` varchar(255) DEFAULT NULL,
  `weight` decimal(10,2) DEFAULT 0.00 COMMENT 'Action plan weight contribution'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `specific_objective_details`
--

INSERT INTO `specific_objective_details` (`specific_objective_detail_id`, `user_id`, `specific_objective_detailname`, `details`, `baseline`, `plan`, `measurement`, `execution_percentage`, `created_at`, `updated_at`, `year`, `month`, `day`, `deadline`, `status`, `priority`, `department_id`, `name`, `description`, `count`, `outcome`, `progress`, `created_by`, `specific_objective_id`, `plan_type`, `income_exchange`, `cost_type`, `employment_type`, `incomeName`, `costName`, `CIbaseline`, `CIplan`, `CIoutcome`, `CIexecution_percentage`, `editing_status`, `reporting`, `goal_id`, `project_type`, `income_plan_type`, `employee_of`, `weight`) VALUES
(1, 73, 'INCOME DETAILS', 'INCOME DETAILS', '0', '1', 'number', 16.00, '2026-08-12 17:08:18', '2026-08-12 17:29:58', 2019, 1, 1, '2026-12-09', 'Pending', 'አስፈላጊ', 11, 'INCOME DETAILS', 'INCOME DETAILS', 1, 13000.00, 'started', 'tsuhayu', 742, 'income', NULL, NULL, NULL, NULL, NULL, 0.00, 100000.00, NULL, 16.00, 'active', 'active', 225, NULL, NULL, NULL, 2.00);

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
(19, 371, 79, NULL, 'what the hell is this', 'comment', 0, '2026-03-24 09:08:19', '2026-03-24 09:08:19'),
(20, 372, 79, NULL, 'I dont think the excution is fair so you need to cheek it again', 'comment', 0, '2026-04-07 17:08:12', '2026-04-07 17:08:12');

-- --------------------------------------------------------

--
-- Table structure for table `system_settings`
--

CREATE TABLE `system_settings` (
  `setting_key` varchar(255) NOT NULL,
  `setting_value` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `system_settings`
--

INSERT INTO `system_settings` (`setting_key`, `setting_value`) VALUES
('GROQ_API_KEY', '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');

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

-- --------------------------------------------------------

--
-- Table structure for table `task_assignments`
--

CREATE TABLE `task_assignments` (
  `assignment_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `assigned_by` int(11) NOT NULL COMMENT 'User who assigned the task',
  `assigned_to` int(11) NOT NULL COMMENT 'User who is assigned the task',
  `priority` enum('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
  `status` enum('pending','in_progress','completed','confirmed','rejected') NOT NULL DEFAULT 'pending',
  `due_date` datetime DEFAULT NULL,
  `category` varchar(100) DEFAULT 'general',
  `attachment` varchar(255) DEFAULT NULL,
  `completion_note` text DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `confirmed_at` datetime DEFAULT NULL,
  `completed_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `task_assignments`
--

INSERT INTO `task_assignments` (`assignment_id`, `title`, `description`, `assigned_by`, `assigned_to`, `priority`, `status`, `due_date`, `category`, `attachment`, `completion_note`, `rejection_reason`, `confirmed_at`, `completed_at`, `created_at`, `updated_at`) VALUES
(5, 'Software Pruduct', 'Software Pruduct', 25, 40, 'medium', 'pending', '2026-11-29 00:00:00', 'action_plan:1030', NULL, NULL, NULL, NULL, NULL, '2026-08-09 18:19:45', '2026-08-09 18:19:45'),
(6, 'test ', 'test ', 73, 40, 'urgent', 'pending', '2026-08-10 00:00:00', 'general', NULL, NULL, NULL, NULL, NULL, '2026-08-10 08:00:40', '2026-08-10 08:00:40'),
(7, 'ግዢ (Purchase)', 'ግዢ (Purchase)', 73, 40, 'medium', 'pending', '2026-12-08 00:00:00', 'action_plan:1033', NULL, NULL, NULL, NULL, NULL, '2026-08-10 13:06:43', '2026-08-10 13:06:43');

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
(25, 72, 'olana@itp.et', '$2b$10$zIyhU/Zh7zj33VZA.m8NsOC5sdIN95EBB7SejpM10VZUjk2Kk/oVu', '2025-03-09 07:31:21', '1', 0, '2026-08-10 10:43:19', 2, '/uploads/1758533033860-photo_2025-09-22_05-21-45.jpg', NULL, NULL),
(26, 73, 'getachew@itp.et', '$2b$10$RRnJrr5To6jpJYjhCQZtUOI2Lq58h.ZXwDZknfVfSdJ0RdjPysqZq', '2025-03-09 07:32:30', '1', 0, '2025-08-12 15:33:50', 9, '/uploads/1743579384865-photo_2025-04-02_00-30-25.jpg', NULL, NULL),
(27, 74, 'habtamua@itp.et', '$2b$10$XQS7x6DJBK0WDrManmY15u4WX07d5QJ.StT.JjnLom86FKXhbUHL6', '2025-03-13 04:26:03', '1', 0, '2025-04-08 11:28:30', 6, NULL, NULL, NULL),
(30, 77, 'walelign@itp.et', '$2b$10$y4f7LsF5rsigVqFj.yTmMOO162DWm0Og7UKPwMZQ5mvD1nKfI/eya', '2025-03-28 04:42:16', '1', 0, '2025-03-28 05:20:13', 6, NULL, NULL, NULL),
(36, 104, 'merso@itpark.et', '$2b$10$QwZKF6X8DeaYv0aG2Ck.ZurxabUhg7C6oSZObgqz2jxenA6oG3tgC', '2025-04-08 11:09:57', '1', 0, '2025-04-09 11:09:33', 6, NULL, NULL, NULL),
(37, 106, 'eskedar@itpark.et', '$2b$10$RFIb4x3.YaOAMKLfdcc.f.Fx0.sWIM53Wd/yJnnxkFtZWYH9apFVK', '2025-04-08 11:10:59', '1', 0, '2025-06-29 23:55:34', 6, '/uploads/1744374354484-photo_2025-04-02_00-29-51.jpg', NULL, NULL),
(38, 107, 'samuel@itpark.et', '$2b$10$NAJiyQBLPjs3I4mLihlcre0YQr6jvEPD7xVqqDUWwu4VU2gCrS.li', '2025-04-08 11:12:41', '1', 0, '2025-11-14 01:03:28', 8, '/uploads/1744370443189-photo_2025-04-11_03-52-50.jpg', NULL, NULL),
(39, 108, 'yesuf@itpark.et', '$2b$10$oJA4cwtDhG9U0P7qAuF0ju8iRuXmiKZIVWQV1FKkr4XgrqFqwzAs2', '2025-04-08 11:13:55', '1', 0, '2025-04-08 11:13:55', 8, NULL, NULL, NULL),
(40, 109, 'ezira@itpark.et', '$2b$10$Aewol/o0/lNUINI0oa18ueWl0BNcTCE5E36e6RjDW2AKEJ0c1gw5W', '2025-04-08 11:14:19', '1', 0, '2026-08-12 20:07:04', 1, '/uploads/1772693434219-404A0276.JPG', NULL, NULL),
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
(67, 139, 'hayaltamrat@gmail.com', '$2b$10$cOsHat9hyhpEU8/P0UEAmO79h8epVcCBow9KLc76WCKairb5j64ei', '2025-09-11 03:37:37', '1', 0, '2026-08-11 21:56:11', 8, NULL, NULL, NULL),
(68, 141, 'Hayaltamrat1@gmail.com', '$2b$10$MSzFOJh5.ONo0LuNTbEmneOULXAzSASIJ2PJCibtN5rv0w62h/GIK', '2025-11-12 04:42:39', '', 0, '2026-08-08 21:09:56', 7, NULL, NULL, NULL),
(69, 142, 'belete@itp.et', '$2b$10$eWJnHs3.DqxaUg2KjV2yEeWLDGw.02WSUntvuJma1Bw5vQXvr/ZjO', '2025-12-16 06:20:28', '1', 0, '2026-03-24 15:34:13', 29, '/uploads/1774354918770-3X2A0265.JPG', NULL, NULL),
(70, 143, 'olanaabebe@itp.et', '$2b$10$uoaYznfbIaTENcmKRMOwpOKp59HLc9dViAvM9aTdfxKg4gXE/vqbK', '2025-12-16 06:24:23', '1', 0, '2025-12-17 03:46:29', 2, NULL, NULL, NULL),
(71, 144, 'walelgnabera@itp.et', '$2b$10$LZM2AAjHccID2/j0SCtNCeKm4pUdMgI1qBTVNbaeJP0Yv/qzqZWw6', '2025-12-16 07:08:28', '1', 0, '2025-12-16 07:08:28', 30, NULL, NULL, NULL),
(72, 145, 'coporateadmin@itp.et', '$2b$10$xJu0MtRguEdi2MYGI6FS2uepxQyaGTr4wH9xaQf2MQiD9cx/iZ57e', '2025-12-16 07:10:18', '1', 0, '2025-12-16 07:10:18', 31, NULL, NULL, NULL),
(73, 146, 'tsehayu@itp.et', '$2b$10$iDqYRmpdwMqaZtdDmiN/C.VqKlKET8S7CksiDCK1BbxWRViz4MvUW', '2025-12-16 07:11:54', '1', 1, '2026-08-12 20:30:08', 5, '/uploads/1774354805110-3X2A0276.JPG', NULL, NULL),
(74, 147, 'itdepartment@itp.et', '$2b$10$Hu1n2Jgemq4WeVEbD4gOi.Wl0kYxc1s45kKk3gJyK82CfTXfce8Gm', '2025-12-16 07:15:06', '1', 0, '2025-12-16 07:15:06', 6, NULL, NULL, NULL),
(75, 148, 'softwaresection@itp.et', '$2b$10$re2aU67JJ.4Tz9DUOCKcUOyMqhgCIiF60Ukzq5c2AfnpOOywBncP2', '2025-12-16 07:16:23', '1', 0, '2025-12-16 08:59:36', 7, NULL, NULL, NULL),
(76, 149, 'hayaltamrat@itp.et', '$2b$10$JxidUyzA1q8173mK3eGjje6vvt0..2E3binD00RJ4vYV8PFhK7aY6', '2025-12-16 07:18:36', '1', 0, '2026-03-24 15:19:35', 8, '/uploads/1765888095841-1743514222367-hayal.jpg', NULL, NULL),
(77, 150, 'encubationdepartment@itp.et', '$2b$10$P78YK8xTzvyJSBByNFYCxePaaHnP8ZXRqhsZHvWCNjZYcSrunQDnW', '2025-12-16 08:51:40', '1', 0, '2025-12-16 08:51:40', 6, NULL, NULL, NULL),
(78, 151, 'simegnewasme@itp.et', '$2b$10$HP4FWLs.2/x6ol21JlwW7eHFlc81Nix8oK2G84vw9oluOyEXvKz5y', '2025-12-16 08:52:48', '1', 1, '2025-12-17 07:17:15', 7, NULL, NULL, NULL),
(79, 152, 'Milliongoraw@gmail.com', '$2b$10$HtfbyhrbZz1XlS.X/Z8SK.kEvlWhipxagJRy5m/xM21gwZOxZNgyu', '2026-03-20 08:37:18', '1', 0, '2026-08-12 20:30:02', 6, '/uploads/1774354652794-million.JPG', NULL, NULL),
(80, 153, 'feruzkorichoyimer@gmail.com', '$2b$10$.QmWscPrD7MXEmqS0ffZOOJXAPmk4S53qf.h2OJ/MElQq8426Pcsa', '2026-07-15 11:07:17', '1', 1, '2026-08-02 21:25:49', 9, NULL, NULL, NULL);

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
  `attachment` varchar(255) DEFAULT NULL,
  `actual_amount` decimal(15,4) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `weekly_task_assignees`
--

CREATE TABLE `weekly_task_assignees` (
  `id` int(11) NOT NULL,
  `weekly_task_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `assigned_by` int(11) NOT NULL,
  `assigned_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `action_plan_quarter_activations`
--
ALTER TABLE `action_plan_quarter_activations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_ap_year_quarter` (`specific_objective_detail_id`,`year`,`quarter`);

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
-- Indexes for table `daily_tasks`
--
ALTER TABLE `daily_tasks`
  ADD PRIMARY KEY (`daily_task_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_task_date` (`task_date`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `data_quality_checks`
--
ALTER TABLE `data_quality_checks`
  ADD PRIMARY KEY (`check_id`),
  ADD UNIQUE KEY `unique_plan_period` (`action_plan_id`,`reporting_period`);

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
-- Indexes for table `employee_positions`
--
ALTER TABLE `employee_positions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `employee_id` (`employee_id`),
  ADD KEY `org_node_id` (`org_node_id`);

--
-- Indexes for table `evaluations`
--
ALTER TABLE `evaluations`
  ADD PRIMARY KEY (`evaluation_id`);

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
-- Indexes for table `goal_quarter_activations`
--
ALTER TABLE `goal_quarter_activations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_goal_year_quarter` (`goal_id`,`year`,`quarter`);

--
-- Indexes for table `income`
--
ALTER TABLE `income`
  ADD PRIMARY KEY (`income_id`);

--
-- Indexes for table `kpi_quarter_activations`
--
ALTER TABLE `kpi_quarter_activations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_kpi_year_quarter` (`specific_objective_id`,`year`,`quarter`);

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
-- Indexes for table `monthly_task_assignees`
--
ALTER TABLE `monthly_task_assignees`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_monthly_assignee` (`monthly_task_id`,`user_id`);

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
-- Indexes for table `objective_quarter_activations`
--
ALTER TABLE `objective_quarter_activations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_obj_year_quarter` (`objective_id`,`year`,`quarter`);

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
-- Indexes for table `plan_approval_steps`
--
ALTER TABLE `plan_approval_steps`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_plan_step` (`plan_id`,`step_number`),
  ADD KEY `org_node_id` (`org_node_id`),
  ADD KEY `approver_employee_id` (`approver_employee_id`);

--
-- Indexes for table `plan_breakdown_supervisors`
--
ALTER TABLE `plan_breakdown_supervisors`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `idx_unique_supervisor` (`specific_objective_detail_id`,`supervisor_user_id`);

--
-- Indexes for table `plan_pillars`
--
ALTER TABLE `plan_pillars`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `plan_types`
--
ALTER TABLE `plan_types`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `value` (`value`);

--
-- Indexes for table `positions`
--
ALTER TABLE `positions`
  ADD PRIMARY KEY (`position_id`);

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
-- Indexes for table `risk_flags`
--
ALTER TABLE `risk_flags`
  ADD PRIMARY KEY (`risk_id`);

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
-- Indexes for table `system_settings`
--
ALTER TABLE `system_settings`
  ADD PRIMARY KEY (`setting_key`);

--
-- Indexes for table `tasks`
--
ALTER TABLE `tasks`
  ADD PRIMARY KEY (`task_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `assigned_by` (`assigned_by`);

--
-- Indexes for table `task_assignments`
--
ALTER TABLE `task_assignments`
  ADD PRIMARY KEY (`assignment_id`),
  ADD KEY `idx_assigned_by` (`assigned_by`),
  ADD KEY `idx_assigned_to` (`assigned_to`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_due_date` (`due_date`);

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
-- Indexes for table `weekly_task_assignees`
--
ALTER TABLE `weekly_task_assignees`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_weekly_assignee` (`weekly_task_id`,`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `action_plan_quarter_activations`
--
ALTER TABLE `action_plan_quarter_activations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `approvalhierarchy`
--
ALTER TABLE `approvalhierarchy`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `approvalworkflow`
--
ALTER TABLE `approvalworkflow`
  MODIFY `approvalworkflow_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `approval_workflow_history`
--
ALTER TABLE `approval_workflow_history`
  MODIFY `history_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=183;

--
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1285;

--
-- AUTO_INCREMENT for table `chat_participants`
--
ALTER TABLE `chat_participants`
  MODIFY `participant_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=49;

--
-- AUTO_INCREMENT for table `chat_settings`
--
ALTER TABLE `chat_settings`
  MODIFY `setting_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `conversations`
--
ALTER TABLE `conversations`
  MODIFY `conversation_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `cost`
--
ALTER TABLE `cost`
  MODIFY `cost_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `daily_tasks`
--
ALTER TABLE `daily_tasks`
  MODIFY `daily_task_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `data_quality_checks`
--
ALTER TABLE `data_quality_checks`
  MODIFY `check_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `employees`
--
ALTER TABLE `employees`
  MODIFY `employee_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=154;

--
-- AUTO_INCREMENT for table `employee_positions`
--
ALTER TABLE `employee_positions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `evaluations`
--
ALTER TABLE `evaluations`
  MODIFY `evaluation_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `forwarded_messages`
--
ALTER TABLE `forwarded_messages`
  MODIFY `forward_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `goals`
--
ALTER TABLE `goals`
  MODIFY `goal_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=227;

--
-- AUTO_INCREMENT for table `goal_quarter_activations`
--
ALTER TABLE `goal_quarter_activations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=71;

--
-- AUTO_INCREMENT for table `income`
--
ALTER TABLE `income`
  MODIFY `income_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `kpi_quarter_activations`
--
ALTER TABLE `kpi_quarter_activations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `meetings`
--
ALTER TABLE `meetings`
  MODIFY `meeting_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `meeting_attachments`
--
ALTER TABLE `meeting_attachments`
  MODIFY `attachment_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `meeting_minutes`
--
ALTER TABLE `meeting_minutes`
  MODIFY `minute_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `meeting_participants`
--
ALTER TABLE `meeting_participants`
  MODIFY `participant_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=58;

--
-- AUTO_INCREMENT for table `meeting_reminders`
--
ALTER TABLE `meeting_reminders`
  MODIFY `reminder_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `menu_items`
--
ALTER TABLE `menu_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=82;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `message_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=110;

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
  MODIFY `reaction_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `message_read_receipts`
--
ALTER TABLE `message_read_receipts`
  MODIFY `receipt_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=126;

--
-- AUTO_INCREMENT for table `monthly_tasks`
--
ALTER TABLE `monthly_tasks`
  MODIFY `monthly_task_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `monthly_task_assignees`
--
ALTER TABLE `monthly_task_assignees`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `notification_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=125;

--
-- AUTO_INCREMENT for table `objectives`
--
ALTER TABLE `objectives`
  MODIFY `objective_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=276;

--
-- AUTO_INCREMENT for table `objective_quarter_activations`
--
ALTER TABLE `objective_quarter_activations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `organization_groups`
--
ALTER TABLE `organization_groups`
  MODIFY `group_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `organization_structure`
--
ALTER TABLE `organization_structure`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=57;

--
-- AUTO_INCREMENT for table `organization_types`
--
ALTER TABLE `organization_types`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `password_reset_otp`
--
ALTER TABLE `password_reset_otp`
  MODIFY `otp_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `plans`
--
ALTER TABLE `plans`
  MODIFY `plan_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `plan_approval_steps`
--
ALTER TABLE `plan_approval_steps`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=904;

--
-- AUTO_INCREMENT for table `plan_breakdown_supervisors`
--
ALTER TABLE `plan_breakdown_supervisors`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `plan_pillars`
--
ALTER TABLE `plan_pillars`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `plan_types`
--
ALTER TABLE `plan_types`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `positions`
--
ALTER TABLE `positions`
  MODIFY `position_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `reportfile`
--
ALTER TABLE `reportfile`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `reports`
--
ALTER TABLE `reports`
  MODIFY `report_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=119;

--
-- AUTO_INCREMENT for table `report_attachments`
--
ALTER TABLE `report_attachments`
  MODIFY `attachment_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `risk_flags`
--
ALTER TABLE `risk_flags`
  MODIFY `risk_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `role_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT for table `role_permissions`
--
ALTER TABLE `role_permissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2442;

--
-- AUTO_INCREMENT for table `specific_objectives`
--
ALTER TABLE `specific_objectives`
  MODIFY `specific_objective_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=743;

--
-- AUTO_INCREMENT for table `specific_objective_details`
--
ALTER TABLE `specific_objective_details`
  MODIFY `specific_objective_detail_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `supervisor_comments`
--
ALTER TABLE `supervisor_comments`
  MODIFY `comment_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `tasks`
--
ALTER TABLE `tasks`
  MODIFY `task_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `task_assignments`
--
ALTER TABLE `task_assignments`
  MODIFY `assignment_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `task_reminders`
--
ALTER TABLE `task_reminders`
  MODIFY `reminder_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=81;

--
-- AUTO_INCREMENT for table `user_presence`
--
ALTER TABLE `user_presence`
  MODIFY `presence_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `weekly_tasks`
--
ALTER TABLE `weekly_tasks`
  MODIFY `weekly_task_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `weekly_task_assignees`
--
ALTER TABLE `weekly_task_assignees`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

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
-- Constraints for table `daily_tasks`
--
ALTER TABLE `daily_tasks`
  ADD CONSTRAINT `fk_daily_task_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `employees`
--
ALTER TABLE `employees`
  ADD CONSTRAINT `employees_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`),
  ADD CONSTRAINT `employees_ibfk_2` FOREIGN KEY (`department_id`) REFERENCES `departments` (`department_id`);

--
-- Constraints for table `employee_positions`
--
ALTER TABLE `employee_positions`
  ADD CONSTRAINT `employee_positions_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `employee_positions_ibfk_2` FOREIGN KEY (`org_node_id`) REFERENCES `organization_structure` (`id`) ON DELETE CASCADE;

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
-- Constraints for table `monthly_task_assignees`
--
ALTER TABLE `monthly_task_assignees`
  ADD CONSTRAINT `monthly_task_assignees_ibfk_1` FOREIGN KEY (`monthly_task_id`) REFERENCES `monthly_tasks` (`monthly_task_id`) ON DELETE CASCADE;

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
-- Constraints for table `plan_approval_steps`
--
ALTER TABLE `plan_approval_steps`
  ADD CONSTRAINT `plan_approval_steps_ibfk_1` FOREIGN KEY (`plan_id`) REFERENCES `plans` (`plan_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `plan_approval_steps_ibfk_2` FOREIGN KEY (`org_node_id`) REFERENCES `organization_structure` (`id`),
  ADD CONSTRAINT `plan_approval_steps_ibfk_3` FOREIGN KEY (`approver_employee_id`) REFERENCES `employees` (`employee_id`);

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
-- Constraints for table `task_assignments`
--
ALTER TABLE `task_assignments`
  ADD CONSTRAINT `fk_assignment_assigned_by` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_assignment_assigned_to` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

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

--
-- Constraints for table `weekly_task_assignees`
--
ALTER TABLE `weekly_task_assignees`
  ADD CONSTRAINT `weekly_task_assignees_ibfk_1` FOREIGN KEY (`weekly_task_id`) REFERENCES `weekly_tasks` (`weekly_task_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
