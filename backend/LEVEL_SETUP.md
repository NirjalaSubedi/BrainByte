# Database Level Setup Instructions

## Overview
The Fruit Slicer game now saves and displays player levels alongside their scores. Follow these steps to set up the database.

## Step 1: Run the Migration
Open phpMyAdmin or MySQL command line and execute this SQL:

```sql
-- Add level column to scores table if it doesn't exist
ALTER TABLE scores ADD COLUMN level INT DEFAULT 1 AFTER score;
ALTER TABLE scores ADD INDEX idx_username_game_level (username, game_id, level);
```

## Step 2: Verify the Changes

Run this query to check if the column was added:
```sql
DESCRIBE scores;
```

You should see a `level` column with INT type and default value 1.

## What Changed

### Backend (server.js)
- **POST /add-score**: Now accepts `level` parameter and saves it to the database
- **GET /scores/:game/top**: Returns level information for each player
- **GET /scores/:game/user/:username**: Returns the player's maximum level achieved

### Frontend Updates

#### Game.jsx
- Passes the current `level` to GameOver page when game ends

#### GameOver.jsx  
- Receives level from Game.jsx
- Displays the level achieved in the "Level X" badge
- Shows each player's level in the leaderboard (from database)
- Sends level to backend when saving the score

#### Home.jsx
- Displays top 3 players only (changed from 5)
- Shows "Lvl X" for each player from database level (fallback to calculated level if not in DB)

## Level System
- Levels are determined by the highest level achieved during gameplay
- When a player completes a level with a high score, their level is updated
- The leaderboard displays the maximum level each player has reached
- Fallback: If level is not in database, it's calculated based on score thresholds (5 levels total)

## Database Schema
```sql
CREATE TABLE scores (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(100) NOT NULL,
  game_id VARCHAR(50) NOT NULL,
  score INT NOT NULL,
  level INT DEFAULT 1,
  played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_username_game_level (username, game_id, level)
);
```
