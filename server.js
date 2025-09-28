// Simple Express server with sqlite3 for Club Management
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const DB_FILE = path.join(__dirname, 'clubs.db');

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize DB (create file and table if not exists)
const dbExists = fs.existsSync(DB_FILE);
const db = new sqlite3.Database(DB_FILE, (err) => {
  if (err) return console.error('DB open error:', err.message);
});
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS clubs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    contact TEXT,
    meetings TEXT
  );`);
  if (!dbExists) {
    // insert example rows
    const stmt = db.prepare("INSERT INTO clubs (name, description, contact, meetings) VALUES (?, ?, ?, ?)");
    stmt.run("Robotics Club", "Build robots & compete in challenges", "robotics@school.edu", "Fridays 4pm");
    stmt.run("Art Club", "Drawing, painting, and creative workshops", "art@school.edu", "Wednesdays 5pm");
    stmt.finalize();
  }
});

// API: list clubs
app.get('/api/clubs', (req, res) => {
  db.all("SELECT * FROM clubs ORDER BY id DESC", [], (err, rows) => {
    if (err) return res.status(500).json({error: err.message});
    res.json(rows);
  });
});

// API: add club
app.post('/api/clubs', (req, res) => {
  const { name, description, contact, meetings } = req.body;
  if (!name) return res.status(400).json({ error: "Name is required" });
  const stmt = db.prepare("INSERT INTO clubs (name, description, contact, meetings) VALUES (?, ?, ?, ?)");
  stmt.run(name, description || '', contact || '', meetings || '', function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
  });
  stmt.finalize();
});

// API: delete club
app.delete('/api/clubs/:id', (req, res) => {
  const id = req.params.id;
  db.run("DELETE FROM clubs WHERE id = ?", [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: "Not found" });
    res.json({ deleted: true });
  });
});

// Serve index.html for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});