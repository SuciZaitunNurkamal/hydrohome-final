// hydrohome-backend/server.js
const express = require('express');
const cors = require('cors');
const db = require('./database'); // Mengimpor koneksi database kita
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Mengizinkan permintaan lintas domain dari frontend React
app.use(express.json()); // Mengizinkan parsing body request sebagai JSON
app.use(express.urlencoded({ extended: true })); // Untuk parsing form data

// Middleware untuk melayani gambar statis (untuk catatan pertumbuhan jika di-upload)
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR);
}
app.use('/uploads', express.static(UPLOADS_DIR));


// --- API ROUTES ---

// 1. Users (Dasar)
// Registrasi Pengguna
app.post('/api/register', (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Mohon lengkapi semua bidang.' });
  }

  // Di aplikasi nyata, Anda harus melakukan hashing password di sini (misal: bcrypt)
  db.run('INSERT INTO USERS (username, email, password) VALUES (?, ?, ?)',
    [username, email, password],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(409).json({ message: 'Username atau email sudah terdaftar.' });
        }
        return res.status(500).json({ message: 'Gagal mendaftar pengguna.', error: err.message });
      }
      res.status(201).json({ message: 'Pengguna berhasil terdaftar!', userId: this.lastID });
    }
  );
});

// Login Pengguna (Sangat dasar, tanpa JWT/sesi)
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Mohon lengkapi email dan password.' });
  }

  // Di aplikasi nyata, bandingkan dengan hashed password
  db.get('SELECT * FROM USERS WHERE email = ? AND password = ?', [email, password], (err, user) => {
    if (err) {
      return res.status(500).json({ message: 'Terjadi kesalahan server.', error: err.message });
    }
    if (!user) {
      return res.status(401).json({ message: 'Email atau password salah.' });
    }
    // Di sini Anda akan membuat dan mengirimkan JWT Token
    res.status(200).json({ message: 'Login berhasil!', user: { id: user.id, username: user.username, email: user.email, role: user.role } });
  });
});


// 2. Plants
// Mendapatkan semua tanaman
app.get('/api/plants', (req, res) => {
  db.all('SELECT * FROM PLANTS', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: 'Gagal mengambil data tanaman.', error: err.message });
    }
    res.json(rows);
  });
});

// Mendapatkan tanaman berdasarkan ID
app.get('/api/plants/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM PLANTS WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ message: 'Gagal mengambil detail tanaman.', error: err.message });
    }
    if (!row) {
      return res.status(404).json({ message: 'Tanaman tidak ditemukan.' });
    }
    res.json(row);
  });
});

// Menambah tanaman baru (Admin only - perlu middleware otentikasi)
app.post('/api/plants', (req, res) => {
  // Asumsi: Admin sudah diautentikasi
  const { name, category, difficulty_level, growth_time, description, care_tips, image_url } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'Nama tanaman wajib diisi.' });
  }
  db.run('INSERT INTO PLANTS (name, category, difficulty_level, growth_time, description, care_tips, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [name, category, difficulty_level, growth_time, description, care_tips, image_url],
    function(err) {
      if (err) {
        return res.status(500).json({ message: 'Gagal menambahkan tanaman.', error: err.message });
      }
      res.status(201).json({ message: 'Tanaman berhasil ditambahkan!', plantId: this.lastID });
    }
  );
});

// Mengupdate tanaman (Admin only - perlu middleware otentikasi)
app.put('/api/plants/:id', (req, res) => {
  // Asumsi: Admin sudah diautentikasi
  const { id } = req.params;
  const { name, category, difficulty_level, growth_time, description, care_tips, image_url } = req.body;
  db.run('UPDATE PLANTS SET name = ?, category = ?, difficulty_level = ?, growth_time = ?, description = ?, care_tips = ?, image_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [name, category, difficulty_level, growth_time, description, care_tips, image_url, id],
    function(err) {
      if (err) {
        return res.status(500).json({ message: 'Gagal mengupdate tanaman.', error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ message: 'Tanaman tidak ditemukan.' });
      }
      res.json({ message: 'Tanaman berhasil diupdate!' });
    }
  );
});

// Menghapus tanaman (Admin only - perlu middleware otentikasi)
app.delete('/api/plants/:id', (req, res) => {
  // Asumsi: Admin sudah diautentikasi
  const { id } = req.params;
  db.run('DELETE FROM PLANTS WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ message: 'Gagal menghapus tanaman.', error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Tanaman tidak ditemukan.' });
    }
    res.json({ message: 'Tanaman berhasil dihapus!' });
  });
});


// 3. Guides
// Mendapatkan semua panduan
app.get('/api/guides', (req, res) => {
  db.all('SELECT * FROM GUIDES', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: 'Gagal mengambil data panduan.', error: err.message });
    }
    res.json(rows);
  });
});

// Mendapatkan panduan berdasarkan ID
app.get('/api/guides/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM GUIDES WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ message: 'Gagal mengambil detail panduan.', error: err.message });
    }
    if (!row) {
      return res.status(404).json({ message: 'Panduan tidak ditemukan.' });
    }
    res.json(row);
  });
});


// 4. Projects
// Mendapatkan semua proyek pengguna (perlu otentikasi)
app.get('/api/projects', (req, res) => {
  // Asumsi: user_id bisa diambil dari token otentikasi
  const userId = req.query.user_id || 1; // Dummy user_id untuk testing
  db.all(`
    SELECT p.*, pl.name AS plant_name
    FROM PROJECTS p
    JOIN PLANTS pl ON p.plant_id = pl.id
    WHERE p.user_id = ?
  `, [userId], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: 'Gagal mengambil proyek.', error: err.message });
    }
    res.json(rows);
  });
});

// Membuat proyek baru (perlu otentikasi)
app.post('/api/projects', (req, res) => {
  // Asumsi: user_id bisa diambil dari token otentikasi
  const userId = req.body.user_id || 1; // Dummy user_id untuk testing
  const { name, plant_id, system_type, start_date, status, notes } = req.body;

  if (!name || !plant_id || !start_date) {
    return res.status(400).json({ message: 'Nama proyek, tanaman, dan tanggal mulai wajib diisi.' });
  }

  db.run('INSERT INTO PROJECTS (user_id, plant_id, name, system_type, start_date, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [userId, plant_id, name, system_type, start_date, status, notes],
    function(err) {
      if (err) {
        return res.status(500).json({ message: 'Gagal membuat proyek baru.', error: err.message });
      }
      res.status(201).json({ message: 'Proyek berhasil dibuat!', projectId: this.lastID });
    }
  );
});


// 5. Growth Records
// Mendapatkan catatan pertumbuhan untuk proyek tertentu
app.get('/api/projects/:projectId/growth-records', (req, res) => {
  const { projectId } = req.params;
  db.all('SELECT * FROM GROWTH_RECORDS WHERE project_id = ? ORDER BY record_date DESC', [projectId], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: 'Gagal mengambil catatan pertumbuhan.', error: err.message });
    }
    res.json(rows);
  });
});

// Menambah catatan pertumbuhan baru (perlu otentikasi)
// Note: Untuk upload gambar, Anda akan memerlukan middleware seperti `multer`
app.post('/api/projects/:projectId/growth-records', (req, res) => {
  // Untuk saat ini, kita anggap image_url langsung dikirimkan atau dikosongkan.
  // Implementasi upload file yang sebenarnya memerlukan library seperti 'multer'.
  const { projectId } = req.params;
  const { record_date, plant_height, plant_status, notes, image_url } = req.body; // image_url (string) atau biarkan kosong

  if (!record_date || !plant_height || !plant_status) {
    return res.status(400).json({ message: 'Tanggal, tinggi, dan status wajib diisi.' });
  }

  db.run('INSERT INTO GROWTH_RECORDS (project_id, record_date, plant_height, plant_status, notes, image_url) VALUES (?, ?, ?, ?, ?, ?)',
    [projectId, record_date, plant_height, plant_status, notes, image_url],
    function(err) {
      if (err) {
        return res.status(500).json({ message: 'Gagal menambahkan catatan pertumbuhan.', error: err.message });
      }
      res.status(201).json({ message: 'Catatan pertumbuhan berhasil ditambahkan!', recordId: this.lastID });
    }
  );
});


// Start server
app.listen(PORT, () => {
  console.log(`Backend server berjalan di http://localhost:${PORT}`);
});