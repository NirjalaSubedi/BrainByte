-- Database Verification Script

-- Check if level column exists in scores table
DESC scores;

-- If level column doesn't exist, add it
-- ALTER TABLE scores ADD COLUMN level INT DEFAULT 1 AFTER score;

-- Check the actual data in the scores table
SELECT id, username, game_id, score, level, played_at FROM scores ORDER BY played_at DESC LIMIT 10;

-- Check if there are any records with level NULL or 0
SELECT id, username, score, level FROM scores WHERE level IS NULL OR level = 0;

-- Update any NULL levels to 1
-- UPDATE scores SET level = 1 WHERE level IS NULL;
