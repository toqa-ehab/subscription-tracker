const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3001;

// In-memory user store. For production, replace with a real database.
const users = new Map(); // key: email, value: { id, name, email, password }

app.use(cors());
app.use(express.json());

// Health check
app.get('/', (_req, res) => {
  res.json({ status: 'ok', service: 'auth' });
});

// Register endpoint
app.post('/users/register', (req, res) => {
  const { email, password, name } = req.body || {};

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  if (users.has(email)) {
    return res.status(409).json({ error: 'User already exists' });
  }

  const id = Date.now().toString();
  const user = { id, name, email, password };
  users.set(email, user);

  return res.status(201).json({
    id,
    token: Buffer.from(`${email}:${Date.now()}`).toString('base64'),
    email,
    name,
  });
});

// Login endpoint
app.post('/users/login', (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = users.get(email);
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  return res.json({
    id: user.id,
    token: Buffer.from(`${email}:${Date.now()}`).toString('base64'),
    email: user.email,
    name: user.name,
  });
});

app.listen(port, () => {
  console.log(`Auth server running on http://localhost:${port}`);
});

