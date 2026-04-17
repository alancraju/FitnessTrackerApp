const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = require('./database/db');
const app = express();

app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_123';

// Load food dataset
const datasetPath = path.resolve(__dirname, 'data', 'indian_foods.json');
let foodsDataset = [];
try {
  const data = fs.readFileSync(datasetPath, 'utf-8');
  foodsDataset = JSON.parse(data);
} catch(err) {
  console.log("Could not load foods dataset or file is missing.");
}

// Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

function calculateTDEE(weight, height, age, gender, activityLevel) {
  let bmr = (10 * weight) + (6.25 * height) - (5 * age);
  if (gender === 'M') bmr += 5; else bmr -= 161;
  const multipliers = { 'Sedentary': 1.2, 'Active': 1.55, 'Very Active': 1.725 };
  return bmr * (multipliers[activityLevel] || 1.2);
}

function calculateGoalCal(weight, targetWeight, tdee) {
  const diff = weight - targetWeight;
  if (diff > 0) return Math.round(tdee - 500);
  if (diff < 0) return Math.round(tdee + 500);
  return Math.round(tdee);
}

// --- AUTHENTICATION ROUTES ---

app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, height, weight, target_weight, age, gender, activity_level } = req.body;
  if (!name || !email || !password || !height || !weight) {
    return res.status(400).json({ error: 'Required fields missing' });
  }

  try {
    const { rows } = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (rows.length > 0) return res.status(400).json({ error: 'Email already exists' });

    const hashedPassword = bcrypt.hashSync(password, 10);
    const tdee = calculateTDEE(weight, height, age, gender, activity_level);
    const goal = calculateGoalCal(weight, target_weight, tdee);

    const insertQuery = `
      INSERT INTO users (name, email, password, height, weight, target_weight, age, gender, activity_level, calorie_goal)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id
    `;
    const result = await pool.query(insertQuery, [name, email, hashedPassword, height, weight, target_weight, age, gender, activity_level, goal]);
    const insertId = result.rows[0].id;
    
    const token = jwt.sign({ id: insertId, email }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ message: 'User created', token, user: { id: insertId, name, email, height, weight, target_weight, age, gender, activity_level, calorie_goal: goal } });
  } catch (error) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = rows[0];
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const validPassword = bcrypt.compareSync(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ message: 'Logged in successfully', token, user });
  } catch (error) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, name, email, height, weight, target_weight, age, gender, activity_level, calorie_goal FROM users WHERE id = $1', [req.user.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/users/profile', authenticateToken, async (req, res) => {
  const { height, weight, target_weight, age, gender, activity_level } = req.body;
  try {
    const tdee = calculateTDEE(weight, height, age, gender, activity_level);
    const newGoal = calculateGoalCal(weight, target_weight, tdee);

    const updateQuery = `UPDATE users SET height=$1, weight=$2, target_weight=$3, age=$4, gender=$5, activity_level=$6, calorie_goal=$7 WHERE id=$8`;
    await pool.query(updateQuery, [height, weight, target_weight, age, gender, activity_level, newGoal, req.user.id]);
    
    res.json({ message: 'Profile updated', calorie_goal: newGoal });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// --- FOOD LOGGING ROUTES ---

app.get('/api/food/search', (req, res) => {
  const query = req.query.q?.toLowerCase() || '';
  if (!query) return res.json([]);
  const results = foodsDataset.filter(food => food.name.toLowerCase().includes(query)).slice(0, 10);
  res.json(results);
});

app.post('/api/food/log', authenticateToken, async (req, res) => {
  const { name, calories, protein, fat, carbs, quantity, date } = req.body;
  try {
    await pool.query(
      'INSERT INTO food_logs (user_id, name, calories, protein, fat, carbs, quantity, date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [req.user.id, name, calories, protein, fat, carbs, quantity, date]
    );
    res.json({ message: 'Food logged' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get daily summary
app.get('/api/food/summary/:date', authenticateToken, async (req, res) => {
  const date = req.params.date;
  try {
    const userRow = await pool.query('SELECT calorie_goal FROM users WHERE id = $1', [req.user.id]);
    const goal = userRow.rows[0]?.calorie_goal || 2000;
    
    const logsRow = await pool.query('SELECT * FROM food_logs WHERE user_id = $1 AND date = $2', [req.user.id, date]);
    const logs = logsRow.rows;
    
    let totalCalories = 0, totalProtein = 0, totalFat = 0, totalCarbs = 0;
    logs.forEach(log => {
      totalCalories += log.calories;
      totalProtein += log.protein;
      totalFat += log.fat;
      totalCarbs += log.carbs;
    });

    const waterRow = await pool.query('SELECT SUM(glasses) as total FROM water_logs WHERE user_id = $1 AND date = $2', [req.user.id, date]);
    const waterGlasses = parseInt(waterRow.rows[0]?.total || 0, 10);

    res.json({
      calorie_goal: goal,
      total_calories: totalCalories,
      total_protein: totalProtein,
      total_fat: totalFat,
      total_carbs: totalCarbs,
      water_glasses: waterGlasses,
      logs
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Water Tracking
app.post('/api/water/log', authenticateToken, async (req, res) => {
  const { date } = req.body;
  try {
    await pool.query('INSERT INTO water_logs (user_id, glasses, date) VALUES ($1, 1, $2)', [req.user.id, date]);
    res.json({ message: 'Glass added' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get historical basic stats (last 7 days example)
app.get('/api/food/history', authenticateToken, async (req, res) => {
  try {
    // Postgres grouping requires slightly different syntax but simple grouping usually works
    const { rows } = await pool.query(
      'SELECT date, SUM(calories) as total_calories FROM food_logs WHERE user_id = $1 GROUP BY date ORDER BY date DESC LIMIT 7',
      [req.user.id]
    );
    res.json(rows.reverse());
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Recommendations Endpoint
app.get('/api/recommendations', authenticateToken, async (req, res) => {
  const date = req.query.date || new Date().toISOString().split('T')[0];
  try {
    const userRow = await pool.query('SELECT calorie_goal FROM users WHERE id = $1', [req.user.id]);
    const goal = userRow.rows[0]?.calorie_goal || 2000;
    
    const logsRow = await pool.query('SELECT SUM(calories) as total FROM food_logs WHERE user_id = $1 AND date = $2', [req.user.id, date]);
    const consumed = parseFloat(logsRow.rows[0]?.total || 0);
    const difference = consumed - goal;

    let exercises = [];
    let food_suggestions = [];

    const getFoodSuggestions = (filterFn, count = 3) => {
      const filtered = foodsDataset.filter(filterFn);
      const shuffled = filtered.sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count).map(f => ({ name: f.name, calories: f.calories }));
    };

    if (difference > 0) {
      const minutesRunning = Math.round(difference / 10);
      const minutesWalking = Math.round(difference / 5);
      const minutesCycling = Math.round(difference / 8); 

      exercises = [
        { type: 'Running', duration: `${minutesRunning} mins`, icon: 'Activity' },
        { type: 'Brisk Walking', duration: `${minutesWalking} mins`, icon: 'Footprints' },
        { type: 'Cycling', duration: `${minutesCycling} mins`, icon: 'Bike' }
      ];
      food_suggestions = getFoodSuggestions(f => f.calories <= 150, 3);
      if(food_suggestions.length === 0) food_suggestions = [{name: 'Green Salad', calories: 50}];
    } else {
      exercises = [
        { type: 'Light Yoga', duration: '15 mins', icon: 'Activity' },
        { type: 'Walking', duration: '30 mins', icon: 'Footprints' }
      ];
      food_suggestions = getFoodSuggestions(f => f.calories > 0, 3);
    }

    res.json({
      consumed,
      goal,
      over_limit: difference > 0,
      excess_calories: difference > 0 ? difference : 0,
      exercises,
      food_suggestions
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
