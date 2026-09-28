USE founders_activity;

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
