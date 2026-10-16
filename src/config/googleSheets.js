const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

// Header kolom di Google Sheet
const SHEET_HEADERS = [
  'ID',
  'Nama Lengkap',
  'Email',
  'WhatsApp',
  'Platform',
  'Username',
  'Followers',
  'Kategori',
  'Portofolio',
  'Foto Profil',
  'Bio',
  'Rate Card',
  'Status',
  'Tanggal Daftar',
  'Terakhir Diperbarui'
];

// Data awal (fallback & seed saat Google Sheets belum terhubung)
let memoryStore = [
  {
    id: 'CR-1001',
    name: 'Alya Rahmadhani',
    email: 'alya.style@example.com',
    whatsapp: '081234567801',
    platform: 'Instagram',
    username: '@alyarahma.style',
    followers: 245000,
    category: 'Beauty & Fashion',
    portfolio: 'https://instagram.com/alyarahma.style',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    bio: 'Beauty enthusiast & fashion stylist fokus pada tutorial makeup natural dan outfit inspiratif harian.',
    rateCard: 'Rp 2.500.000 / Reels',
    status: 'Approved',
    createdAt: '2026-09-15 10:20:00',
    updatedAt: '2026-09-15 10:20:00'
  },
  {
    id: 'CR-1002',
    name: 'Dimas Rizky Tech',
    email: 'dimas.gadget@example.com',
    whatsapp: '081234567802',
    platform: 'YouTube',
    username: '@DimasTechReviews',
    followers: 680000,
    category: 'Tech & Gadget',
    portfolio: 'https://youtube.com/@DimasTechReviews',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    bio: 'Reviewer gadget objektif, unboxing smartphone, laptop, dan tips produktivitas teknologi masa kini.',
    rateCard: 'Rp 6.000.000 / Video',
    status: 'Approved',
    createdAt: '2026-09-18 14:10:00',
    updatedAt: '2026-09-18 14:10:00'
  },
  {
    id: 'CR-1003',
    name: 'Jessica Kuliner',
    email: 'jessica.makan@example.com',
    whatsapp: '081234567803',
    platform: 'TikTok',
    username: '@jessicakulinernusantara',
    followers: 1250000,
    category: 'Food & Culinary',
    portfolio: 'https://tiktok.com/@jessicakulinernusantara',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    bio: 'Food vlogger pecinta street food nusantara & cafe hidden gems di Jabodetabek & kota besar Indonesia.',
    rateCard: 'Rp 4.000.000 / Video',
    status: 'Approved',
    createdAt: '2026-09-20 09:45:00',
    updatedAt: '2026-09-20 09:45:00'
  },
  {
    id: 'CR-1004',
    name: 'Bintang Perkasa',
    email: 'bintang.gaming@example.com',
    whatsapp: '081234567804',
    platform: 'TikTok',
    username: '@bintangplays',
    followers: 430000,
    category: 'Gaming & Esports',
    portfolio: 'https://tiktok.com/@bintangplays',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    bio: 'Mobile gamer, live streamer kompetitif MLBB & Valorant dengan interaksi penonton yang sangat aktif.',
    rateCard: 'Rp 3.000.000 / Campaign',
    status: 'Approved',
    createdAt: '2026-09-25 16:30:00',
    updatedAt: '2026-09-25 16:30:00'
  },
  {
    id: 'CR-1005',
    name: 'Nadia Safira',
    email: 'nadia.travel@example.com',
    whatsapp: '081234567805',
    platform: 'Instagram',
    username: '@nadiasafira.travels',
    followers: 180000,
    category: 'Lifestyle & Travel',
    portfolio: 'https://instagram.com/nadiasafira.travels',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    bio: 'Travel story teller, solo backpacker, review resort estetik dan rekomendasi wisata hemat di Indonesia.',
    rateCard: 'Rp 2.000.000 / Post',
    status: 'Approved',
    createdAt: '2026-09-28 11:15:00',
    updatedAt: '2026-09-28 11:15:00'
  },
  {
    id: 'CR-1006',
    name: 'Kevin Santoso Finansial',
    email: 'kevin.fintech@example.com',
    whatsapp: '081234567806',
    platform: 'Instagram',
    username: '@kevinsantoso.id',
    followers: 95000,
    category: 'Education & Business',
    portfolio: 'https://instagram.com/kevinsantoso.id',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
    bio: 'Edukasi investasi, tips keuangan generasi muda, analisis tren bisnis dan literasi finansial praktis.',
    rateCard: 'Rp 1.800.000 / Carousel',
    status: 'Pending',
    createdAt: '2026-10-02 08:30:00',
    updatedAt: '2026-10-02 08:30:00'
  },
  {
    id: 'CR-1007',
    name: 'Siti Maharani',
    email: 'maharani.fit@example.com',
    whatsapp: '081234567807',
    platform: 'TikTok',
    username: '@maharani.wellness',
    followers: 72000,
    category: 'Health & Fitness',
    portfolio: 'https://tiktok.com/@maharani.wellness',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    bio: 'Certified workout coach, clean eating recipes, panduan hidup sehat seimbang untuk wanita karier.',
    rateCard: 'Rp 1.500.000 / Video',
    status: 'Pending',
    createdAt: '2026-10-05 13:20:00',
    updatedAt: '2026-10-05 13:20:00'
  }
];

class GoogleSheetsService {
  constructor() {
    this.sheets = null;
    this.spreadsheetId = process.env.GOOGLE_SHEET_ID;
    this.sheetName = process.env.GOOGLE_SHEET_NAME || 'Creators';
    this.isReady = false;
    this.initAttempted = false;
  }

  /**
   * Cek apakah konfigurasi Google Sheets telah diatur di .env
   */
  hasCredentials() {
    const hasKeyFile = !!process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE && fs.existsSync(
      path.isAbsolute(process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE)
        ? process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE
        : path.join(process.cwd(), process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE)
    );
    const hasInlineKeys = !!process.env.GOOGLE_CLIENT_EMAIL && !!process.env.GOOGLE_PRIVATE_KEY;
    return !!this.spreadsheetId && (hasKeyFile || hasInlineKeys);
  }

  /**
   * Inisialisasi Google Auth Client
   */
  async init() {
    if (this.initAttempted) return this.isReady;
    this.initAttempted = true;

    if (!this.hasCredentials()) {
      console.warn('⚠️  [CreatorHub] Google Sheets API belum dikonfigurasi lengkap di .env.');
      console.warn('ℹ️  [CreatorHub] Mode Mock Data Aktif. Website berjalan penuh dengan penyimpanan sementara.');
      console.warn('ℹ️  Lihat README.md untuk panduan mengisi GOOGLE_SHEET_ID dan kredensial Service Account.');
      this.isReady = false;
      return false;
    }

    try {
      let auth;

      if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE) {
        const keyPath = path.isAbsolute(process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE)
          ? process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE
          : path.join(process.cwd(), process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE);

        auth = new google.auth.GoogleAuth({
          keyFile: keyPath,
          scopes: ['https://www.googleapis.com/auth/spreadsheets']
        });
      } else {
        const privateKey = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');
        auth = new google.auth.JWT({
          email: process.env.GOOGLE_CLIENT_EMAIL,
          key: privateKey,
          scopes: ['https://www.googleapis.com/auth/spreadsheets']
        });
      }

      this.sheets = google.sheets({ version: 'v4', auth });
      await this.ensureSheetSetup();
      this.isReady = true;
      console.log('✅ [CreatorHub] Terhubung ke Google Sheets API v4 (Spreadsheet ID:', this.spreadsheetId, ')');
      return true;
    } catch (error) {
      console.error('❌ [CreatorHub] Gagal menginisialisasi Google Sheets API:', error.message);
      console.warn('ℹ️  Beralih ke mode fallback memory store.');
      this.isReady = false;
      return false;
    }
  }

  /**
   * Pastikan header dan sheet 'Creators' ada di spreadsheet
   */
  async ensureSheetSetup() {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: `${this.sheetName}!A1:O1`
      });

      const rows = response.data.values;
      if (!rows || rows.length === 0 || rows[0].length === 0) {
        // Tulis header jika kosong
        await this.sheets.spreadsheets.values.update({
          spreadsheetId: this.spreadsheetId,
          range: `${this.sheetName}!A1:O1`,
          valueInputOption: 'RAW',
          requestBody: {
            values: [SHEET_HEADERS]
          }
        });
        console.log('📋 [CreatorHub] Header kolom Google Sheet berhasil dibuat.');

        // Masukkan data awal jika sheet benar-benar kosong
        const initialRows = memoryStore.map(item => this.mapObjectToRow(item));
        await this.sheets.spreadsheets.values.append({
          spreadsheetId: this.spreadsheetId,
          range: `${this.sheetName}!A2`,
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: initialRows
          }
        });
        console.log(`✨ [CreatorHub] ${initialRows.length} data awal berhasil disinkronkan ke Google Sheet.`);

        // Terapkan desain visual & formatting otomatis (Freeze row, warna oranye, lebar kolom, chips)
        await this.applySheetFormatting();
      }
    } catch (err) {
      // Jika sheetName belum ada di spreadsheet, buat sheet baru
      if (err.message && err.message.includes('Unable to parse range')) {
        try {
          await this.sheets.spreadsheets.batchUpdate({
            spreadsheetId: this.spreadsheetId,
            requestBody: {
              requests: [
                {
                  addSheet: {
                    properties: { title: this.sheetName }
                  }
                }
              ]
            }
          });
          await this.sheets.spreadsheets.values.update({
            spreadsheetId: this.spreadsheetId,
            range: `${this.sheetName}!A1:O1`,
            valueInputOption: 'RAW',
            requestBody: {
              values: [SHEET_HEADERS]
            }
          });
          console.log(`📋 [CreatorHub] Tab sheet '${this.sheetName}' berhasil dibuat.`);
          await this.applySheetFormatting();
        } catch (subErr) {
          console.error('Error saat membuat tab sheet:', subErr.message);
        }
      } else {
        throw err;
      }
    }
  }

  /**
   * Terapkan format desain profesional (Freeze row, warna oranye, lebar kolom presisi, dropdown validation)
   */
  async applySheetFormatting() {
    try {
      const meta = await this.sheets.spreadsheets.get({ spreadsheetId: this.spreadsheetId });
      const targetSheet = meta.data.sheets.find(s => s.properties.title === this.sheetName);
      if (!targetSheet) return;
      const sheetId = targetSheet.properties.sheetId;

      const columnWidths = [95, 180, 200, 140, 110, 140, 120, 160, 180, 160, 260, 140, 120, 150, 150];
      const requests = [
        // Freeze Row 1 & Tab Color Orange
        {
          updateSheetProperties: {
            properties: {
              sheetId: sheetId,
              tabColor: { red: 0.917, green: 0.345, blue: 0.047 },
              gridProperties: { frozenRowCount: 1 }
            },
            fields: 'tabColor,gridProperties.frozenRowCount'
          }
        },
        // Header Format A1:O1 (Orange background, white text, bold, center)
        {
          repeatCell: {
            range: { sheetId: sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: 15 },
            cell: {
              userEnteredFormat: {
                backgroundColor: { red: 0.917, green: 0.345, blue: 0.047 },
                textFormat: { foregroundColor: { red: 1, green: 1, blue: 1 }, bold: true, fontSize: 10 },
                horizontalAlignment: 'CENTER',
                verticalAlignment: 'MIDDLE',
                wrapStrategy: 'WRAP'
              }
            },
            fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment,wrapStrategy)'
          }
        },
        // Header row height
        {
          updateDimensionProperties: {
            range: { sheetId: sheetId, dimension: 'ROWS', startIndex: 0, endIndex: 1 },
            properties: { pixelSize: 42 },
            fields: 'pixelSize'
          }
        }
      ];

      // Lebar kolom
      columnWidths.forEach((width, index) => {
        requests.push({
          updateDimensionProperties: {
            range: { sheetId: sheetId, dimension: 'COLUMNS', startIndex: index, endIndex: index + 1 },
            properties: { pixelSize: width },
            fields: 'pixelSize'
          }
        });
      });

      // Format Followers (Kolom G) sebagai number dengan ribuan (#,##0)
      requests.push({
        repeatCell: {
          range: { sheetId: sheetId, startRowIndex: 1, startColumnIndex: 6, endColumnIndex: 7 },
          cell: {
            userEnteredFormat: {
              numberFormat: { type: 'NUMBER', pattern: '#,##0' },
              horizontalAlignment: 'RIGHT'
            }
          },
          fields: 'userEnteredFormat(numberFormat,horizontalAlignment)'
        }
      });

      // Conditional formatting untuk status (Approved = soft green, Pending = soft amber, Rejected = soft red)
      requests.push(
        {
          addConditionalFormatRule: {
            rule: {
              ranges: [{ sheetId: sheetId, startRowIndex: 1, startColumnIndex: 12, endColumnIndex: 13 }],
              booleanRule: {
                condition: { type: 'TEXT_EQ', values: [{ userEnteredValue: 'Approved' }] },
                format: {
                  backgroundColor: { red: 0.863, green: 0.988, blue: 0.906 },
                  textFormat: { foregroundColor: { red: 0.086, green: 0.396, blue: 0.204 }, bold: true }
                }
              }
            },
            index: 0
          }
        },
        {
          addConditionalFormatRule: {
            rule: {
              ranges: [{ sheetId: sheetId, startRowIndex: 1, startColumnIndex: 12, endColumnIndex: 13 }],
              booleanRule: {
                condition: { type: 'TEXT_EQ', values: [{ userEnteredValue: 'Pending' }] },
                format: {
                  backgroundColor: { red: 0.996, green: 0.953, blue: 0.780 },
                  textFormat: { foregroundColor: { red: 0.573, green: 0.251, blue: 0.055 }, bold: true }
                }
              }
            },
            index: 1
          }
        },
        {
          addConditionalFormatRule: {
            rule: {
              ranges: [{ sheetId: sheetId, startRowIndex: 1, startColumnIndex: 12, endColumnIndex: 13 }],
              booleanRule: {
                condition: { type: 'TEXT_EQ', values: [{ userEnteredValue: 'Rejected' }] },
                format: {
                  backgroundColor: { red: 0.996, green: 0.886, blue: 0.886 },
                  textFormat: { foregroundColor: { red: 0.600, green: 0.106, blue: 0.106 }, bold: true }
                }
              }
            },
            index: 2
          }
        }
      );

      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId: this.spreadsheetId,
        requestBody: { requests }
      });
      console.log('🎨 [CreatorHub] Desain visual profesional berhasil diterapkan pada Google Sheet.');
    } catch (err) {
      console.warn('ℹ️  Format otomatis sheet dilewati:', err.message);
    }
  }

  mapRowToObject(row, rowIndex) {
    return {
      _rowIndex: rowIndex, // index baris fisik di Google Sheet
      id: row[0] || '',
      name: row[1] || '',
      email: row[2] || '',
      whatsapp: row[3] || '',
      platform: row[4] || '',
      username: row[5] || '',
      followers: Number(row[6]) || 0,
      category: row[7] || '',
      portfolio: row[8] || '',
      avatar: row[9] || '',
      bio: row[10] || '',
      rateCard: row[11] || '',
      status: row[12] || 'Pending',
      createdAt: row[13] || '',
      updatedAt: row[14] || ''
    };
  }

  mapObjectToRow(obj) {
    return [
      obj.id || '',
      obj.name || '',
      obj.email || '',
      obj.whatsapp || '',
      obj.platform || '',
      obj.username || '',
      obj.followers || 0,
      obj.category || '',
      obj.portfolio || '',
      obj.avatar || '',
      obj.bio || '',
      obj.rateCard || '',
      obj.status || 'Pending',
      obj.createdAt || new Date().toISOString().replace('T', ' ').substring(0, 19),
      obj.updatedAt || new Date().toISOString().replace('T', ' ').substring(0, 19)
    ];
  }

  /**
   * Mengambil semua data kreator
   */
  async getAllCreators() {
    await this.init();

    if (!this.isReady) {
      return [...memoryStore];
    }

    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: `${this.sheetName}!A2:O`
      });

      const rows = response.data.values || [];
      return rows.map((row, index) => this.mapRowToObject(row, index + 2));
    } catch (error) {
      console.error('Error membaca data dari Google Sheets:', error.message);
      return [...memoryStore];
    }
  }

  /**
   * Menambah kreator baru ke Google Sheet
   */
  async addCreator(creatorData) {
    await this.init();

    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const newCreator = {
      id: `CR-${Date.now().toString().slice(-6)}`,
      name: creatorData.name.trim(),
      email: creatorData.email.trim(),
      whatsapp: creatorData.whatsapp.trim(),
      platform: creatorData.platform || 'Instagram',
      username: creatorData.username.startsWith('@') ? creatorData.username.trim() : `@${creatorData.username.trim()}`,
      followers: parseInt(creatorData.followers, 10) || 0,
      category: creatorData.category || 'General',
      portfolio: creatorData.portfolio ? creatorData.portfolio.trim() : '',
      avatar: creatorData.avatar ? creatorData.avatar.trim() : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
      bio: creatorData.bio ? creatorData.bio.trim() : '',
      rateCard: creatorData.rateCard ? creatorData.rateCard.trim() : '-',
      status: 'Pending', // Default status selalu Pending untuk diverifikasi admin
      createdAt: timestamp,
      updatedAt: timestamp
    };

    if (!this.isReady) {
      memoryStore.unshift(newCreator);
      return newCreator;
    }

    try {
      const rowValues = this.mapObjectToRow(newCreator);
      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: `${this.sheetName}!A2`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [rowValues]
        }
      });
      return newCreator;
    } catch (error) {
      console.error('Error menyimpan kreator ke Google Sheets:', error.message);
      // Fallback
      memoryStore.unshift(newCreator);
      return newCreator;
    }
  }

  /**
   * Memperbarui data kreator (misal ubah status Pending -> Approved/Rejected atau edit data)
   */
  async updateCreator(id, updateData) {
    await this.init();

    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

    if (!this.isReady) {
      const index = memoryStore.findIndex(c => c.id === id);
      if (index === -1) throw new Error(`Kreator dengan ID ${id} tidak ditemukan.`);
      memoryStore[index] = {
        ...memoryStore[index],
        ...updateData,
        updatedAt: timestamp
      };
      return memoryStore[index];
    }

    try {
      // Cari baris kreator
      const creators = await this.getAllCreators();
      const target = creators.find(c => c.id === id);
      if (!target) {
        throw new Error(`Kreator dengan ID ${id} tidak ditemukan di Google Sheet.`);
      }

      const merged = {
        ...target,
        ...updateData,
        updatedAt: timestamp
      };

      const rowIndex = target._rowIndex;
      const rowValues = this.mapObjectToRow(merged);

      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: `${this.sheetName}!A${rowIndex}:O${rowIndex}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [rowValues]
        }
      });

      return merged;
    } catch (error) {
      console.error(`Error memperbarui kreator ${id} di Google Sheets:`, error.message);
      throw error;
    }
  }

  /**
   * Menghapus baris kreator dari Google Sheet
   */
  async deleteCreator(id) {
    await this.init();

    if (!this.isReady) {
      const initialLen = memoryStore.length;
      memoryStore = memoryStore.filter(c => c.id !== id);
      if (memoryStore.length === initialLen) throw new Error(`Kreator dengan ID ${id} tidak ditemukan.`);
      return { success: true, message: `Kreator ${id} berhasil dihapus.` };
    }

    try {
      const creators = await this.getAllCreators();
      const target = creators.find(c => c.id === id);
      if (!target) {
        throw new Error(`Kreator dengan ID ${id} tidak ditemukan di Google Sheet.`);
      }

      const rowIndex = target._rowIndex; // 1-indexed

      // Dapatkan Sheet ID (angka gid)
      const sheetMeta = await this.sheets.spreadsheets.get({
        spreadsheetId: this.spreadsheetId
      });
      const sheetObj = sheetMeta.data.sheets.find(s => s.properties.title === this.sheetName);
      const sheetGid = sheetObj ? sheetObj.properties.sheetId : 0;

      // Hapus baris dengan batchUpdate
      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId: this.spreadsheetId,
        requestBody: {
          requests: [
            {
              deleteDimension: {
                range: {
                  sheetId: sheetGid,
                  dimension: 'ROWS',
                  startIndex: rowIndex - 1, // 0-indexed
                  endIndex: rowIndex
                }
              }
            }
          ]
        }
      });

      return { success: true, message: `Kreator ${id} berhasil dihapus dari Google Sheets.` };
    } catch (error) {
      console.error(`Error menghapus kreator ${id} di Google Sheets:`, error.message);
      throw error;
    }
  }

  /**
   * Dapatkan status koneksi saat ini
   */
  getStatus() {
    return {
      connected: this.isReady,
      mode: this.isReady ? 'Google Sheets API (Live)' : 'Local Fallback Store',
      spreadsheetId: this.spreadsheetId ? (this.spreadsheetId.substring(0, 8) + '...' + this.spreadsheetId.slice(-4)) : 'Belum diatur',
      sheetName: this.sheetName
    };
  }
}

module.exports = new GoogleSheetsService();
