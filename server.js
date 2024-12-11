const express = require('express');
const bodyParser = require("body-parser");
const path = require('path');
const mysql = require('mysql2');
const app = express();

app.use(bodyParser.json());
// Konfigurasi koneksi database
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Ganti dengan username MySQL jika berbeda
    password: '', // Ganti dengan password MySQL jika ada
    database: 'healing_db', // Ganti dengan nama database
});

// Tes koneksi ke database
db.connect((err) => {
    if (err) {
        console.error('Koneksi ke database gagal:', err.message);
        process.exit(1); // Hentikan proses jika koneksi gagal
    }
    console.log('Terhubung ke database MySQL!');
});

// Middleware untuk parsing JSON dan form-urlencoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware untuk melayani file statis dari folder 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Route untuk menyediakan halaman login
app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/user-profile', (req, res) => {
    const userId = req.session.userId; // Misalnya, Anda menyimpan userId dalam session setelah login
    const sql = 'SELECT * FROM users WHERE id = ?';
    db.query(sql, [userId], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Terjadi kesalahan saat mengambil data pengguna.' });
        }
        res.json(result[0]);  // Mengirimkan data pengguna sebagai respons
    });
});

// Route untuk menangani login
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email dan password harus diisi!' });
    }

    const sql = 'SELECT * FROM users WHERE email = ? AND password = ?';
    db.query(sql, [email, password], (err, result) => {
        if (err) {
            console.error('Gagal mengambil data pengguna:', err.message);
            return res.status(500).json({ error: 'Terjadi kesalahan saat memeriksa kredensial.' });
        }

        if (result.length > 0) {
            // Pengguna ditemukan, login berhasil
            res.json({ success: true, message: 'Login berhasil!' });
        } else {
            // Pengguna tidak ditemukan
            res.status(401).json({ success: false, message: 'Email atau password salah!' });
        }
    });
});

// Halaman setelah login berhasil
app.get('/dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});
// Route untuk menyediakan halaman list-booking.html
app.get('/list-booking.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'list-booking.html'));
});

// Route untuk menyediakan halaman curhat
app.get('/curhat.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'curhat.html'));
});

// API untuk menyimpan curhat
app.post('/curhat', (req, res) => {
    const { user_name, message } = req.body;

    if (!user_name || !message) {
        return res.status(400).json({ error: 'Nama dan pesan curhat harus diisi!' });
    }

    const sql = 'INSERT INTO curhats (user_name, message) VALUES (?, ?)';
    db.query(sql, [user_name, message], (err, result) => {
        if (err) {
            console.error('Gagal menyimpan curhat:', err.message);
            return res.status(500).json({ error: 'Terjadi kesalahan saat menyimpan curhat.' });
        }
        res.json({ message: 'Curhat berhasil disimpan!' });
    });
});

// API untuk mengambil daftar curhat
app.get('/curhats', (req, res) => {
    const sql = 'SELECT * FROM curhats ORDER BY created_at DESC';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Gagal mengambil curhat:', err.message);
            return res.status(500).json({ error: 'Terjadi kesalahan saat mengambil data curhat.' });
        }
        res.json(results);
    });
});

// API untuk mendapatkan daftar bookings
app.get('/bookings', (req, res) => {
    const sql = 'SELECT * FROM bookings ORDER BY created_at DESC';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Gagal mengambil data dari database:', err.message);
            return res.status(500).json({ error: 'Terjadi kesalahan saat mengambil data.' });
        }
        res.json(results); // Kirim data bookings dalam format JSON
    });
});

// API untuk menyimpan data booking (opsional, jika formulir masih digunakan)
app.post('/booking', (req, res) => {
    const { firstName, lastName, address, phone } = req.body;

    if (!firstName || !lastName || !phone) {
        return res.status(400).json({ error: 'Data tidak lengkap!' });
    }

    const sql = 'INSERT INTO bookings (first_name, last_name, address, phone) VALUES (?, ?, ?, ?)';
    db.query(sql, [firstName, lastName, address, phone], (err, result) => {
        if (err) {
            console.error('Gagal menyimpan data ke database:', err.message);
            return res.status(500).json({ error: 'Terjadi kesalahan saat menyimpan data.' });
        }
        console.log('Data booking berhasil disimpan:', result);
        res.json({ message: 'Booking berhasil disimpan!' });
    });
});

app.post('/chatbot', (req, res) => {
    const { message } = req.body;
    const lowerCaseMessage = message.toLowerCase();

    let response;

    // Logika respons berbasis kata kunci
    if (lowerCaseMessage.includes('halo')) {
        response = 'Halo! Saya Dokter yang sedang on duty. Apa yang bisa saya bantu? 😊';
    } else if (lowerCaseMessage.includes('healing')) {
        response = 'Healing adalah proses pemulihan diri. Apa yang bisa saya bantu untuk Anda?';
    } else if (lowerCaseMessage.includes('stress') || lowerCaseMessage.includes('stres')) {
        response = 'Stress memang berat. Cobalah ambil napas dalam-dalam, dan ceritakan apa yang membuat Anda merasa seperti ini.';
    } else if (lowerCaseMessage.includes('mental health') || lowerCaseMessage.includes('kesehatan mental')) {
        response = 'Kesehatan mental adalah bagian penting dari hidup kita. Apakah Anda ingin berbicara lebih jauh tentang ini?';
    } else if (lowerCaseMessage.includes('butuh bantuan')) {
        response = 'Tidak apa-apa untuk meminta bantuan. Anda dapat berbicara dengan saya atau konselor profesional kami.';
    } else if (lowerCaseMessage.includes('terima kasih')) {
        response = 'Sama-sama! Jika ada yang ingin dibicarakan lagi, saya di sini untuk Anda. 😊';
    } else {
        response = 'Maaf, saya tidak mengerti. Bisa dijelaskan lebih detail?';
    }

    // Kirim respons ke frontend
    res.json({ response });
});



// Jalankan server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});
