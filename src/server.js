require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const creatorRoutes = require('./routes/creatorRoutes');
const adminRoutes = require('./routes/adminRoutes');
const sheetsService = require('./config/googleSheets');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware keamanan dan parsing
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve file statis frontend (HTML, CSS, JS, Assets)
app.use(express.static(path.join(__dirname, '../public')));

// Routing API
app.use('/api/creators', creatorRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    appName: 'CreatorHub Marketplace',
    timestamp: new Date().toISOString(),
    googleSheets: sheetsService.getStatus()
  });
});

// Routing halaman bersih (Clean URL aliases)
app.get('/explore', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/creators.html'));
});

app.get('/creators', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/creators.html'));
});

app.get('/join', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/register.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/register.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/admin.html'));
});

// 404 & Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

// Jalankan Server dengan fallback port otomatis jika port 3000 sedang terpakai
function startServer(portToTry) {
  const server = app.listen(portToTry, async () => {
    console.log('====================================================');
    console.log(`🚀 CreatorHub Server berjalan di: http://localhost:${portToTry}`);
    console.log(`🌐 Halaman Utama:       http://localhost:${portToTry}`);
    console.log(`🔍 Explore Creators:    http://localhost:${portToTry}/creators.html`);
    console.log(`📝 Form Pendaftaran:    http://localhost:${portToTry}/register.html`);
    console.log(`⚙️  Dashboard Admin:     http://localhost:${portToTry}/admin.html`);
    console.log('====================================================');

    // Inisialisasi koneksi Google Sheets
    try {
      await sheetsService.init();
    } catch (err) {
      console.error('Koneksi Google Sheets gagal saat startup:', err.message);
    }
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      const nextPort = Number(portToTry) + 1;
      console.warn(`⚠️  Port ${portToTry} sedang digunakan oleh aplikasi lain.`);
      console.log(`🔄 Mengalihkan server ke port ${nextPort}...`);
      startServer(nextPort);
    } else {
      console.error('Server error:', err);
    }
  });
}

startServer(PORT);

