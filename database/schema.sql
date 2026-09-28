CREATE DATABASE IF NOT EXISTS founders_activity
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE founders_activity;

CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('FOUNDER', 'TEAM_MEMBER') NOT NULL DEFAULT 'TEAM_MEMBER',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS sessions (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  token VARCHAR(64) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL,
  CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS activities (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  assigned_to INT UNSIGNED NOT NULL,
  assigned_by INT UNSIGNED NOT NULL,
  priority ENUM('LOW', 'MEDIUM', 'HIGH') NOT NULL DEFAULT 'MEDIUM',
  due_date DATE NULL,
  status ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED') NOT NULL DEFAULT 'PENDING',
  completion_date DATE NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_activities_assigned_to FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_activities_assigned_by FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS activity_assignees (
  activity_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (activity_id, user_id),
  CONSTRAINT fk_assignees_activity FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
  CONSTRAINT fk_assignees_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS activity_updates (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  activity_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  message TEXT NOT NULL,
  update_type ENUM('COMMENT', 'STATUS', 'PROGRESS') NOT NULL DEFAULT 'COMMENT',
  old_status VARCHAR(20) NULL,
  new_status VARCHAR(20) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_updates_activity FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
  CONSTRAINT fk_updates_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_updates_activity_created (activity_id, created_at)
) ENGINE=InnoDB;

-- Default password for all seed users: password
INSERT INTO users (name, email, password, role) VALUES
('Aarav Founder', 'aarav@company.com', '$2y$10$2ZbJ1Kqkc0aQwIFXkjhbG.AJgvtDO2KMgIhKZsGkbPxA4Hx6Babqe', 'FOUNDER'),
('Priya Founder', 'priya@company.com', '$2y$10$2ZbJ1Kqkc0aQwIFXkjhbG.AJgvtDO2KMgIhKZsGkbPxA4Hx6Babqe', 'FOUNDER'),
('Rohan Member', 'rohan@company.com', '$2y$10$2ZbJ1Kqkc0aQwIFXkjhbG.AJgvtDO2KMgIhKZsGkbPxA4Hx6Babqe', 'TEAM_MEMBER'),
('Neha Member', 'neha@company.com', '$2y$10$2ZbJ1Kqkc0aQwIFXkjhbG.AJgvtDO2KMgIhKZsGkbPxA4Hx6Babqe', 'TEAM_MEMBER');
