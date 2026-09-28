USE founders_activity;

CREATE TABLE IF NOT EXISTS activity_assignees (
  activity_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (activity_id, user_id),
  CONSTRAINT fk_assignees_activity FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
  CONSTRAINT fk_assignees_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

INSERT IGNORE INTO activity_assignees (activity_id, user_id)
SELECT id, assigned_to FROM activities;
