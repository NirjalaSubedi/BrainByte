# Debugging Level Save Issue

## Problem
Frontend shows level correctly (Level 3, etc.) but database saves level as 1.

## Solution - Follow These Steps

### Step 1: Verify Database Column Exists
Open phpMyAdmin and run:
```sql
DESC scores;
```

**Expected output:** Should show a `level` column with INT type

**If NOT there:** Run this migration:
```sql
ALTER TABLE scores ADD COLUMN level INT DEFAULT 1 AFTER score;
ALTER TABLE scores ADD INDEX idx_username_game_level (username, game_id, level);
```

### Step 2: Check Existing Data
```sql
SELECT id, username, score, level FROM scores ORDER BY id DESC LIMIT 5;
```

**Expected:** Recent scores should show the correct level, not all 1s

**If all are 1:** The migration is working but levels are not being sent from frontend

### Step 3: Check Browser Console
1. Open Game and reach Level 3
2. Finish the game and go to GameOver page
3. Open **Browser Console (F12 or Ctrl+Shift+I)**
4. Look for these console logs:
   - `GameOver received - score: X level: 3 username: ...`
   - `Sending score data to backend: {username: ..., game_id: ..., score: X, level: 3}`

**If level shows as 1 or undefined:** The issue is in the frontend

### Step 4: Check Backend Logs
1. Open your terminal where backend is running
2. After GameOver screen, look for this log:
   ```
   Saving score - username: X game_id: fruit-slicer score: X level: 3 finalLevel: 3
   ```

**If level shows as 1 or 0:** The backend is not receiving the level from frontend

### Step 5: Verify Network Request
1. Open **Browser Developer Tools** (F12)
2. Go to **Network** tab
3. Finish the game and go to GameOver
4. Look for a POST request to `http://localhost:5000/add-score`
5. Click it and check the **Request Payload** - should show `"level": 3`

## Common Issues & Fixes

### Issue 1: Level column doesn't exist in database
**Fix:** Run the migration SQL commands above

### Issue 2: Frontend shows Level 3 but sends level: 1
**Solution:** 
- The issue is in Game.jsx navigation
- Make sure the `level` state is being passed to navigate()
- Check if level dependency is in the useEffect array

### Issue 3: Level is undefined in console logs
**Solution:**
- The Game.jsx is not passing the level to GameOver
- Check if Game.jsx useEffect has `level` in dependencies

### Issue 4: Backend receives level but doesn't save
**Solution:**
- Check if the `level` column exists in the database
- Check for SQL errors in backend console

## Quick Fix Checklist
- [ ] Database `level` column exists (DESC scores)
- [ ] Browser console shows correct level
- [ ] Network request shows level in payload
- [ ] Backend console logs show correct level
- [ ] Database has recent records with level > 1

## Testing
After fixes, test by:
1. Playing the game and reaching Level 3
2. Checking browser console logs
3. Checking database: `SELECT * FROM scores WHERE username='YOUR_USERNAME' ORDER BY id DESC LIMIT 1;`
4. The level field should show 3, not 1
