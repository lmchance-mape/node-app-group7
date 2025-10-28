// server.js
require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('public'));

// =============================================
// ROUTES TO SERVE HTML FILES
// =============================================
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/logon.html');
});

app.get('/dashboard', (req, res) => {
  res.sendFile(__dirname + '/public/dashboard.html');
});

// =============================================
// HELPER FUNCTIONS & AUTHENTICATION MIDDLEWARE
// =============================================
async function createConnection() {
  return await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
}

async function authenticateToken(req, res, next) {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token.' });
    }

    try {
      const connection = await createConnection();
      const [rows] = await connection.execute(
        'SELECT email FROM user WHERE email = ?',
        [decoded.email]
      );
      await connection.end();

      if (rows.length === 0) {
        return res.status(403).json({ message: 'Account not found or deactivated.' });
      }

      req.user = decoded;
      next();
    } catch (dbError) {
      console.error(dbError);
      res.status(500).json({ message: 'Database error during authentication.' });
    }
  });
}

// =============================================
// ACCOUNT CREATION & LOGIN
// =============================================
app.post('/api/create-account', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const connection = await createConnection();
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Insert with notification_pref + created_at
    const [result] = await connection.execute(
      'INSERT INTO user (email, password, notification_pref, created_at) VALUES (?, ?, ?, NOW())',
      [email, hashedPassword, 'email']
    );

    await connection.end();
    res.status(201).json({ message: 'Account created successfully!' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(409).json({ message: 'An account with this email already exists.' });
    } else {
      console.error(error);
      res.status(500).json({ message: 'Error creating account.' });
    }
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const connection = await createConnection();
    const [rows] = await connection.execute('SELECT * FROM user WHERE email = ?', [email]);
    await connection.end();

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const user = rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error logging in.' });
  }
});

// =============================================
// INVENTORY ROUTES
// =============================================

// ADD ITEM
app.post('/api/inventory', authenticateToken, async (req, res) => {
  const {
    name,
    quantity,
    expiry_date,
    price,
    category,
    date_acquired,
    serving_size,
    servings_per_container,
    calories,
    protein,
    carbs,
    fat
  } = req.body;

  if (!name || !quantity || !expiry_date) {
    return res.status(400).json({ message: 'Name, quantity, and expiry date are required.' });
  }

  try {
    const connection = await createConnection();
    const [result] = await connection.execute(
      `INSERT INTO inventory 
        (user_email, name, quantity, expiry_date, price, category, date_acquired, 
         serving_size, servings_per_container, calories, protein, carbs, fat) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.email,
        name,
        quantity,
        expiry_date,
        price || null,
        category || null,
        date_acquired || null,
        serving_size || null,
        servings_per_container || null,
        calories || null,
        protein || null,
        carbs || null,
        fat || null
      ]
    );
    await connection.end();

    res.status(201).json({
      message: 'Item added successfully!',
      item_id: result.insertId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error adding item.' });
  }
});

// GET USER INVENTORY
app.get('/api/inventory', authenticateToken, async (req, res) => {
  try {
    const connection = await createConnection();
    const [rows] = await connection.execute(
      `SELECT item_id, user_email, name, quantity, expiry_date, price, category, 
              date_acquired, serving_size, servings_per_container, calories, protein, carbs, fat 
       FROM inventory 
       WHERE user_email = ? 
       ORDER BY expiry_date ASC`,
      [req.user.email]
    );
    await connection.end();
    res.status(200).json({ items: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving inventory.' });
  }
});

// UPDATE ITEM
app.put('/api/inventory/:id', authenticateToken, async (req, res) => {
  const itemId = req.params.id;
  const userEmail = req.user.email;

  const {
    name,
    quantity,
    expiry_date,
    date_acquired,
    serving_size,
    servings_per_container,
    calories,
    protein,
    carbs,
    fat
  } = req.body;

  try {
    const connection = await createConnection();
    await connection.execute(
      `UPDATE inventory
       SET name = ?, quantity = ?, expiry_date = ?, date_acquired = ?, 
           serving_size = ?, servings_per_container = ?, calories = ?, 
           protein = ?, carbs = ?, fat = ?
       WHERE item_id = ? AND user_email = ?`,
      [name, quantity, expiry_date, date_acquired, serving_size,
       servings_per_container, calories, protein, carbs, fat, itemId, userEmail]
    );
    await connection.end();

    res.json({ message: 'Item updated successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Update failed', error: err });
  }
});

// DELETE ITEM
app.delete('/api/inventory/:id', authenticateToken, async (req, res) => {
  const itemId = req.params.id;
  const userEmail = req.user.email;

  try {
    const connection = await createConnection();
    await connection.execute('DELETE FROM inventory WHERE item_id = ? AND user_email = ?', [itemId, userEmail]);
    await connection.end();

    res.json({ message: 'Item deleted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Delete failed', error: err });
  }
});

// =============================================
// START SERVER
// =============================================
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
