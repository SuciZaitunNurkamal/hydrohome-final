// hydrohome-backend/database.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'hydrohome.db');

// Buka koneksi database
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    db.run(`PRAGMA foreign_keys = ON;`); // Mengaktifkan Foreign Keys untuk integritas data

    // Kita akan membuat tabel secara berurutan menggunakan callback
    db.serialize(() => { // db.serialize() memastikan eksekusi perintah SQL secara berurutan
      // Membuat tabel USERS
      db.run(`CREATE TABLE IF NOT EXISTS USERS (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'pengguna' NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`, (err) => {
        if (err) console.error("Error creating USERS table:", err.message);
        // Tambahkan dummy user hanya setelah tabel USERS terbuat
        db.get(`SELECT COUNT(*) as count FROM USERS WHERE username = 'testuser'`, (err, row) => {
          if (err) { console.error("Error checking users count:", err.message); return; }
          if (row.count === 0) {
              console.log('Adding dummy user data...');
              db.run(`INSERT INTO USERS (username, email, password, role) VALUES (?, ?, ?, ?)`,
                  ['testuser', 'test@example.com', 'password123', 'pengguna'],
                  function(err) { if (err) console.error("Error inserting test user:", err.message); }
              );
              db.run(`INSERT INTO USERS (username, email, password, role) VALUES (?, ?, ?, ?)`,
                  ['adminuser', 'admin@example.com', 'admin123', 'admin'],
                  function(err) { if (err) console.error("Error inserting admin user:", err.message); }
              );
          }
        });
      });

      // Membuat tabel PLANTS
      db.run(`CREATE TABLE IF NOT EXISTS PLANTS (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category TEXT,
        difficulty_level TEXT,
        growth_time TEXT,
        description TEXT,
        care_tips TEXT,
        image_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`, (err) => {
        if (err) console.error("Error creating PLANTS table:", err.message);
        // Tambahkan dummy data hanya setelah tabel PLANTS terbuat
        db.get(`SELECT COUNT(*) as count FROM PLANTS`, (err, row) => {
            if (err) { console.error("Error checking plants count:", err.message); return; }
            if (row.count === 0) {
                console.log('Adding dummy data to PLANTS table...');
                db.run(`INSERT INTO PLANTS (name, category, difficulty_level, growth_time, description, care_tips, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    ['Tomat Ceri', 'Buah', 'Mudah', '70 Hari', 'Tomat ceri adalah buah kecil manis yang mudah ditanam di rumah.', 'Pastikan mendapat sinar matahari penuh dan siram secara teratur.', 'https://picsum.photos/id/10/400/300'], function(err) { if (err) console.error("Error inserting plant 1:", err.message); });
                db.run(`INSERT INTO PLANTS (name, category, difficulty_level, growth_time, description, care_tips, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    ['Selada Romaine', 'Sayuran Daun', 'Sangat Mudah', '45 Hari', 'Selada romaine renyah dan cocok untuk salad. Ideal untuk hidroponik.', 'Jaga kelembaban tanah/nutrisi dan hindari suhu terlalu panas.', 'https://picsum.photos/id/12/400/300'], function(err) { if (err) console.error("Error inserting plant 2:", err.message); });
                db.run(`INSERT INTO PLANTS (name, category, difficulty_level, growth_time, description, care_tips, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    ['Cabai Rawit', 'Bumbu', 'Menengah', '90 Hari', 'Cabai rawit memberikan rasa pedas yang kuat. Cocok ditanam di pot.', 'Membutuhkan banyak sinar matahari dan tanah yang drainasenya baik.', 'https://picsum.photos/id/13/400/300'], function(err) { if (err) console.error("Error inserting plant 3:", err.message); });
                db.run(`INSERT INTO PLANTS (name, category, difficulty_level, growth_time, description, care_tips, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    ['Bayam', 'Sayuran Daun', 'Mudah', '30 Hari', 'Bayam adalah sayuran hijau yang cepat tumbuh dan kaya nutrisi.', 'Butuh banyak air dan sinar matahari parsial.', 'https://picsum.photos/id/14/400/300'], function(err) { if (err) console.error("Error inserting plant 4:", err.message); });
                db.run(`INSERT INTO PLANTS (name, category, difficulty_level, growth_time, description, care_tips, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    ['Timun', 'Buah', 'Menengah', '60 Hari', 'Timun adalah tanaman merambat yang menghasilkan buah segar dan renyah.', 'Membutuhkan penyangga dan penyiraman konsisten.', 'https://picsum.photos/id/15/400/300'], function(err) { if (err) console.error("Error inserting plant 5:", err.message); });
            }
        });
      });

      // Membuat tabel GUIDES
      db.run(`CREATE TABLE IF NOT EXISTS GUIDES (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        category TEXT,
        content TEXT,
        difficulty_level TEXT,
        image_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`, (err) => {
        if (err) console.error("Error creating GUIDES table:", err.message);
        // Tambahkan dummy data hanya setelah tabel GUIDES terbuat
        db.get(`SELECT COUNT(*) as count FROM GUIDES`, (err, row) => {
            if (err) { console.error("Error checking guides count:", err.message); return; }
            if (row.count === 0) {
                console.log('Adding dummy data to GUIDES table...');
                db.run(`INSERT INTO GUIDES (title, category, content, difficulty_level, image_url) VALUES (?, ?, ?, ?, ?)`,
                    ['Panduan Menanam Tomat untuk Pemula', 'Teknik', 'Pelajari langkah-langkah dasar menanam tomat dari biji hingga panen di rumah.', 'Dasar', 'https://picsum.photos/id/20/400/300'], function(err) { if (err) console.error("Error inserting guide 1:", err.message); });
                db.run(`INSERT INTO GUIDES (title, category, content, difficulty_level, image_url) VALUES (?, ?, ?, ?, ?)`,
                    ['Dasar-dasar Hidroponik untuk Pemula', 'Teknik', 'Memahami sistem hidroponik dan bagaimana cara memulainya dengan sederhana di rumah.', 'Menengah', 'https://picsum.photos/id/21/400/300'], function(err) { if (err) console.error("Error inserting guide 2:", err.message); });
                db.run(`INSERT INTO GUIDES (title, category, content, difficulty_level, image_url) VALUES (?, ?, ?, ?, ?)`,
                    ['Mengatasi Hama Tanaman di Rumah', 'Perawatan', 'Panduan lengkap untuk mengidentifikasi dan mengatasi hama umum pada tanaman rumah Anda.', 'Dasar', 'https://picsum.photos/id/22/400/300'], function(err) { if (err) console.error("Error inserting guide 3:", err.message); });
            }
        });
      });

      // Membuat tabel PROJECTS
      db.run(`CREATE TABLE IF NOT EXISTS PROJECTS (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        plant_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        system_type TEXT,
        start_date DATE NOT NULL,
        status TEXT DEFAULT 'Aktif' NOT NULL,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES USERS(id) ON DELETE CASCADE,
        FOREIGN KEY (plant_id) REFERENCES PLANTS(id) ON DELETE CASCADE
      )`, (err) => {
        if (err) console.error("Error creating PROJECTS table:", err.message);
      });

      // Membuat tabel GROWTH_RECORDS
      db.run(`CREATE TABLE IF NOT EXISTS GROWTH_RECORDS (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL,
        record_date DATE NOT NULL,
        plant_height REAL,
        plant_status TEXT,
        notes TEXT,
        image_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES PROJECTS(id) ON DELETE CASCADE
      )`, (err) => {
        if (err) console.error("Error creating GROWTH_RECORDS table:", err.message);
      });

      console.log('Database tables checked/created successfully.');
    });
  }
});

module.exports = db;