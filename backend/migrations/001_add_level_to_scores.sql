-- Add level column to scores table if it doesn't exist
ALTER TABLE scores ADD COLUMN level INT DEFAULT 1 AFTER score;
ALTER TABLE scores ADD INDEX idx_username_game_level (username, game_id, level);
