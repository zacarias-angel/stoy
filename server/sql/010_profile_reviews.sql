-- Reputacion publica: cada persona puede dejar una sola resena por perfil.
CREATE TABLE IF NOT EXISTS profile_reviews (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  reviewer_user_id BIGINT UNSIGNED NOT NULL,
  reviewed_user_id BIGINT UNSIGNED NOT NULL,
  rating TINYINT UNSIGNED NOT NULL,
  comment VARCHAR(500) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_profile_reviews_reviewer_reviewed (reviewer_user_id, reviewed_user_id),
  KEY idx_profile_reviews_reviewed_created (reviewed_user_id, created_at),
  CONSTRAINT fk_profile_reviews_reviewer FOREIGN KEY (reviewer_user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_profile_reviews_reviewed FOREIGN KEY (reviewed_user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
