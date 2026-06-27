const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
require('dotenv').config();

const pool = require('./config/db');
const authMiddleware = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretportfoliojwtkey123!';

// Express Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded files statically
app.use('/uploads', express.static(uploadsDir));
// Serve public assets/portfolio files statically
app.use(express.static(__dirname));

// Multer Storage Configuration for Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname.replace(/\s+/g, '_'));
  }
});
const upload = multer({ storage });

// Database Auto-Initialization check & Admin Seeding
async function initializeServer() {
  try {
    // Check if users table is empty and seed default admin
    const [rows] = await pool.query('SELECT COUNT(*) AS count FROM users');
    if (parseInt(rows[0].count, 10) === 0) {
      const passwordHash = await bcrypt.hash('admin123', 10);
      await pool.query('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', ['admin', passwordHash, 'admin']);
      console.log('Seeded default admin account successfully. Username: admin, Password: admin123');
    }
  } catch (error) {
    console.error('Error checking database initialization:', error.message);
  }
}

// ==========================================
// 1. PUBLIC API ROUTES (NO AUTHENTICATION)
// ==========================================

// Get Hero info
app.get('/api/hero', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM hero LIMIT 1');
    res.json(rows[0] || { name: 'Alfian Seftina Sari', role_text: 'Software Engineer' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get Profile Info
app.get('/api/profile', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM profile_info LIMIT 1');
    res.json(rows[0] || { email: 'alfianseftina@gmail.com', location: 'Tanjungpinang', cv_path: '' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get About Info
app.get('/api/about', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM about LIMIT 1');
    res.json(rows[0] || { title: 'About Me', bio_paragraph_1: 'Hi, I am Alfian', image_path: '' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get Skills list
app.get('/api/skills', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM skills');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get Projects list
app.get('/api/projects', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM projects');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get Experience list
app.get('/api/experience', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM experience ORDER BY year DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get Certificates list
app.get('/api/certificates', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM certificates');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get Social Media list
app.get('/api/socials', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM socials');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Post Contact Message submission
app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: 'Please fill in all fields.' });
  }
  try {
    await pool.query('INSERT INTO messages (full_name, email, message) VALUES (?, ?, ?)', [name, email, message]);
    res.json({ success: true, message: 'Message sent successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 2. AUTHENTICATION ROUTES
// ==========================================

// Login
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password required.' });
  }

  try {
    const [users] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid username or password.' });
    }

    const user = users[0];
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Invalid username or password.' });
    }

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ success: true, token, username: user.username });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Verify Token
app.get('/api/auth/verify', authMiddleware, (req, res) => {
  res.json({ success: true, user: req.user });
});

// ==========================================
// 3. SECURED ADMIN ROUTES (REQUIRES AUTH)
// ==========================================

// --- messages (Inbox) ---
app.get('/api/admin/messages', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM messages ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/admin/messages/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM messages WHERE id = ?', [id]);
    res.json({ success: true, message: 'Message deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- hero CRUD ---
app.post('/api/admin/hero', authMiddleware, async (req, res) => {
  const { name, role_text } = req.body;
  if (!name || !role_text) {
    return res.status(400).json({ success: false, message: 'Name and role required.' });
  }
  try {
    await pool.query('UPDATE hero SET name = ?, role_text = ? WHERE id = 1', [name, role_text]);
    res.json({ success: true, message: 'Hero content updated.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- profile CRUD & CV Upload ---
app.post('/api/admin/profile', authMiddleware, upload.single('cv'), async (req, res) => {
  const { email, location } = req.body;
  if (!email || !location) {
    return res.status(400).json({ success: false, message: 'Email and location required.' });
  }
  try {
    let query = 'UPDATE profile_info SET email = ?, location = ?';
    let params = [email, location];

    if (req.file) {
      const relativePath = 'uploads/' + req.file.filename;
      query += ', cv_path = ?';
      params.push(relativePath);
    }
    query += ' WHERE id = 1';

    await pool.query(query, params);
    res.json({ success: true, message: 'Profile content updated.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- about CRUD & Image Upload ---
app.post('/api/admin/about', authMiddleware, upload.single('about_image'), async (req, res) => {
  const { title, bio_paragraph_1, bio_paragraph_2, bio_paragraph_3 } = req.body;
  if (!title || !bio_paragraph_1) {
    return res.status(400).json({ success: false, message: 'Title and main paragraph required.' });
  }
  try {
    let query = 'UPDATE about SET title = ?, bio_paragraph_1 = ?, bio_paragraph_2 = ?, bio_paragraph_3 = ?';
    let params = [title, bio_paragraph_1, bio_paragraph_2, bio_paragraph_3];

    if (req.file) {
      const relativePath = 'uploads/' + req.file.filename;
      query += ', image_path = ?';
      params.push(relativePath);
    }
    query += ' WHERE id = 1';

    await pool.query(query, params);
    res.json({ success: true, message: 'About content updated.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- skills CRUD ---
app.post('/api/admin/skills', authMiddleware, async (req, res) => {
  const { category, name } = req.body;
  if (!category || !name) {
    return res.status(400).json({ success: false, message: 'Category and skill name required.' });
  }
  try {
    const [result] = await pool.query('INSERT INTO skills (category, name) VALUES (?, ?)', [category, name]);
    res.json({ success: true, id: result.insertId, message: 'Skill added successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/admin/skills/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM skills WHERE id = ?', [id]);
    res.json({ success: true, message: 'Skill deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- projects CRUD & Thumbnail Upload ---
app.post('/api/admin/projects', authMiddleware, upload.single('thumbnail'), async (req, res) => {
  const { title, description, tags, github_url } = req.body;
  if (!title || !description || !tags || !github_url) {
    return res.status(400).json({ success: false, message: 'All project text fields required.' });
  }
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Project thumbnail file is required.' });
  }
  try {
    const relativePath = 'uploads/' + req.file.filename;
    const [result] = await pool.query(
      'INSERT INTO projects (title, description, thumbnail_path, tags, github_url) VALUES (?, ?, ?, ?, ?)',
      [title, description, relativePath, tags, github_url]
    );
    res.json({ success: true, id: result.insertId, message: 'Project created successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/admin/projects/:id', authMiddleware, upload.single('thumbnail'), async (req, res) => {
  const { id } = req.params;
  const { title, description, tags, github_url } = req.body;
  if (!title || !description || !tags || !github_url) {
    return res.status(400).json({ success: false, message: 'All project text fields required.' });
  }
  try {
    let query = 'UPDATE projects SET title = ?, description = ?, tags = ?, github_url = ?';
    let params = [title, description, tags, github_url];

    if (req.file) {
      const relativePath = 'uploads/' + req.file.filename;
      query += ', thumbnail_path = ?';
      params.push(relativePath);
    }
    query += ' WHERE id = ?';
    params.push(id);

    await pool.query(query, params);
    res.json({ success: true, message: 'Project updated successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/admin/projects/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM projects WHERE id = ?', [id]);
    res.json({ success: true, message: 'Project deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- experience CRUD ---
app.post('/api/admin/experience', authMiddleware, async (req, res) => {
  const { year, role, organization, description } = req.body;
  if (!year || !role || !organization || !description) {
    return res.status(400).json({ success: false, message: 'All experience fields required.' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO experience (year, role, organization, description) VALUES (?, ?, ?, ?)',
      [year, role, organization, description]
    );
    res.json({ success: true, id: result.insertId, message: 'Experience added successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/admin/experience/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM experience WHERE id = ?', [id]);
    res.json({ success: true, message: 'Experience deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- certificates CRUD & Image Upload ---
app.post('/api/admin/certificates', authMiddleware, upload.single('certificate_image'), async (req, res) => {
  const { title, delay_class } = req.body;
  if (!title) {
    return res.status(400).json({ success: false, message: 'Certificate title required.' });
  }
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Certificate image file required.' });
  }
  try {
    const relativePath = 'uploads/' + req.file.filename;
    const [result] = await pool.query(
      'INSERT INTO certificates (title, image_path, delay_class) VALUES (?, ?, ?)',
      [title, relativePath, delay_class || '']
    );
    res.json({ success: true, id: result.insertId, message: 'Certificate uploaded successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/admin/certificates/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM certificates WHERE id = ?', [id]);
    res.json({ success: true, message: 'Certificate deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- social media CRUD ---
app.post('/api/admin/socials', authMiddleware, async (req, res) => {
  const { platform, url } = req.body;
  if (!platform || !url) {
    return res.status(400).json({ success: false, message: 'Platform and URL required.' });
  }
  try {
    const [rows] = await pool.query('SELECT * FROM socials WHERE platform = ?', [platform]);
    if (rows.length > 0) {
      await pool.query('UPDATE socials SET url = ? WHERE platform = ?', [url, platform]);
      res.json({ success: true, message: 'Social link updated.' });
    } else {
      const [result] = await pool.query('INSERT INTO socials (platform, url) VALUES (?, ?)', [platform, url]);
      res.json({ success: true, id: result.insertId, message: 'Social link added.' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/admin/socials/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM socials WHERE id = ?', [id]);
    res.json({ success: true, message: 'Social link deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Fallback: Send public client files for all unhandled client routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Launch server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  initializeServer();
});
