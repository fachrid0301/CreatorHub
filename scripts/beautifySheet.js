require('dotenv').config();
const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

/**
 * Script Otomatis: Desain & Format Spreadsheet CreatorHub Menjadi Profesional
 * Menata header, warna brand oranye, kolom presisi, dropdown validation, 
 * conditional formatting (status chips), dan zebra striping.
 */

async function beautifySheet() {
  console.log('🎨 [CreatorHub] Memulai proses desain otomatis Google Sheet...');

  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  const sheetName = process.env.GOOGLE_SHEET_NAME || 'Creators';

  if (!spreadsheetId) {
    console.error('❌ GOOGLE_SHEET_ID belum diisi di file .env.');
    console.error('ℹ️  Buka file .env dan isi GOOGLE_SHEET_ID terlebih dahulu.');
    process.exit(1);
  }

  // Cek otentikasi
  let auth;
  if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE) {
    const keyPath = path.isAbsolute(process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE)
      ? process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE
      : path.join(process.cwd(), process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE);

    if (!fs.existsSync(keyPath)) {
      console.error(`❌ File kunci JSON tidak ditemukan di: ${keyPath}`);
      process.exit(1);
    }

    auth = new google.auth.GoogleAuth({
      keyFile: keyPath,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
  } else if (process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
    const privateKey = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');
    auth = new google.auth.JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
  } else {
    console.error('❌ Kredensial Service Account belum diisi di file .env.');
    process.exit(1);
  }

  const sheets = google.sheets({ version: 'v4', auth });

  try {
    // 1. Ambil metadata spreadsheet
    const meta = await sheets.spreadsheets.get({ spreadsheetId });
    let targetSheet = meta.data.sheets.find(s => s.properties.title === sheetName);

    if (!targetSheet) {
      console.log(`ℹ️  Tab '${sheetName}' belum ada, membuat tab baru...`);
      const addSheetRes = await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: { title: sheetName }
              }
            }
          ]
        }
      });
      targetSheet = addSheetRes.data.replies[0].addSheet;
    }

    const sheetId = targetSheet.properties.sheetId;
    console.log(`📌 Menerapkan desain pada Tab: '${sheetName}' (ID: ${sheetId})...`);

    // Lebar kolom ideal dalam pixel
    const columnWidths = [
      95,   // A: ID
      180,  // B: Nama Lengkap
      200,  // C: Email
      140,  // D: WhatsApp
      110,  // E: Platform
      140,  // F: Username
      120,  // G: Followers
      160,  // H: Kategori
      180,  // I: Portofolio
      160,  // J: Foto Profil
      260,  // K: Bio
      140,  // L: Rate Card
      120,  // M: Status
      150,  // N: Tanggal Daftar
      150   // O: Terakhir Diperbarui
    ];

    const requests = [];

    // A. Bekukan Header (Freeze Row 1) & Beri warna tab oranye
    requests.push({
      updateSheetProperties: {
        properties: {
          sheetId: sheetId,
          tabColor: { red: 0.917, green: 0.345, blue: 0.047 }, // Brand Orange #EA580C
          gridProperties: {
            frozenRowCount: 1
          }
        },
        fields: 'tabColor,gridProperties.frozenRowCount'
      }
    });

    // B. Format Header Baris 1: Background Oranye CreatorHub, Teks Putih Tebal, Rata Tengah
    requests.push({
      repeatCell: {
        range: {
          sheetId: sheetId,
          startRowIndex: 0,
          endRowIndex: 1,
          startColumnIndex: 0,
          endColumnIndex: 15
        },
        cell: {
          userEnteredFormat: {
            backgroundColor: { red: 0.917, green: 0.345, blue: 0.047 }, // #EA580C
            textFormat: {
              foregroundColor: { red: 1.0, green: 1.0, blue: 1.0 }, // Putih
              bold: true,
              fontSize: 10
            },
            horizontalAlignment: 'CENTER',
            verticalAlignment: 'MIDDLE',
            wrapStrategy: 'WRAP'
          }
        },
        fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment,wrapStrategy)'
      }
    });

    // Atur tinggi baris header menjadi 40px
    requests.push({
      updateDimensionProperties: {
        range: {
          sheetId: sheetId,
          dimension: 'ROWS',
          startIndex: 0,
          endIndex: 1
        },
        properties: {
          pixelSize: 42
        },
        fields: 'pixelSize'
      }
    });

    // C. Atur Lebar Tiap Kolom secara Presisi
    columnWidths.forEach((width, index) => {
      requests.push({
        updateDimensionProperties: {
          range: {
            sheetId: sheetId,
            dimension: 'COLUMNS',
            startIndex: index,
            endIndex: index + 1
          },
          properties: {
            pixelSize: width
          },
          fields: 'pixelSize'
        }
      });
    });

    // D. Format Angka Followers (Kolom G) sebagai Number dengan Ribuan (#,##0)
    requests.push({
      repeatCell: {
        range: {
          sheetId: sheetId,
          startRowIndex: 1,
          startColumnIndex: 6, // Kolom G (0-indexed = 6)
          endColumnIndex: 7
        },
        cell: {
          userEnteredFormat: {
            numberFormat: {
              type: 'NUMBER',
              pattern: '#,##0'
            },
            horizontalAlignment: 'RIGHT'
          }
        },
        fields: 'userEnteredFormat(numberFormat,horizontalAlignment)'
      }
    });

    // E. Rata Tengah Kolom ID (A), Platform (E), Status (M), Tanggal (N, O)
    [0, 4, 12, 13, 14].forEach(colIndex => {
      requests.push({
        repeatCell: {
          range: {
            sheetId: sheetId,
            startRowIndex: 1,
            startColumnIndex: colIndex,
            endColumnIndex: colIndex + 1
          },
          cell: {
            userEnteredFormat: {
              horizontalAlignment: 'CENTER'
            }
          },
          fields: 'userEnteredFormat.horizontalAlignment'
        }
      });
    });

    // F. Dropdown Validasi Data (Platform: Instagram, TikTok, YouTube, X)
    requests.push({
      setDataValidation: {
        range: {
          sheetId: sheetId,
          startRowIndex: 1,
          startColumnIndex: 4, // Kolom E
          endColumnIndex: 5
        },
        rule: {
          condition: {
            type: 'ONE_OF_LIST',
            values: [
              { userEnteredValue: 'Instagram' },
              { userEnteredValue: 'TikTok' },
              { userEnteredValue: 'YouTube' },
              { userEnteredValue: 'X' }
            ]
          },
          showCustomUi: true,
          strict: true
        }
      }
    });

    // G. Dropdown Validasi Data (Kategori Konten)
    requests.push({
      setDataValidation: {
        range: {
          sheetId: sheetId,
          startRowIndex: 1,
          startColumnIndex: 7, // Kolom H
          endColumnIndex: 8
        },
        rule: {
          condition: {
            type: 'ONE_OF_LIST',
            values: [
              { userEnteredValue: 'Beauty & Fashion' },
              { userEnteredValue: 'Tech & Gadget' },
              { userEnteredValue: 'Food & Culinary' },
              { userEnteredValue: 'Gaming & Esports' },
              { userEnteredValue: 'Lifestyle & Travel' },
              { userEnteredValue: 'Education & Business' },
              { userEnteredValue: 'Health & Fitness' },
              { userEnteredValue: 'Entertainment' }
            ]
          },
          showCustomUi: true,
          strict: true
        }
      }
    });

    // H. Dropdown Validasi Data (Status: Pending, Approved, Rejected)
    requests.push({
      setDataValidation: {
        range: {
          sheetId: sheetId,
          startRowIndex: 1,
          startColumnIndex: 12, // Kolom M
          endColumnIndex: 13
        },
        rule: {
          condition: {
            type: 'ONE_OF_LIST',
            values: [
              { userEnteredValue: 'Pending' },
              { userEnteredValue: 'Approved' },
              { userEnteredValue: 'Rejected' }
            ]
          },
          showCustomUi: true,
          strict: true
        }
      }
    });

    // I. Conditional Formatting untuk Kolom Status (Chips Warna Otomatis)
    // 1. Approved -> Background Hijau Lembut (#DCFCE7), Teks Hijau Tua (#166534)
    requests.push({
      addConditionalFormatRule: {
        rule: {
          ranges: [{
            sheetId: sheetId,
            startRowIndex: 1,
            startColumnIndex: 12,
            endColumnIndex: 13
          }],
          booleanRule: {
            condition: {
              type: 'TEXT_EQ',
              values: [{ userEnteredValue: 'Approved' }]
            },
            format: {
              backgroundColor: { red: 0.863, green: 0.988, blue: 0.906 },
              textFormat: {
                foregroundColor: { red: 0.086, green: 0.396, blue: 0.204 },
                bold: true
              }
            }
          }
        },
        index: 0
      }
    });

    // 2. Pending -> Background Kuning Lembut (#FEF3C7), Teks Amber (#92400E)
    requests.push({
      addConditionalFormatRule: {
        rule: {
          ranges: [{
            sheetId: sheetId,
            startRowIndex: 1,
            startColumnIndex: 12,
            endColumnIndex: 13
          }],
          booleanRule: {
            condition: {
              type: 'TEXT_EQ',
              values: [{ userEnteredValue: 'Pending' }]
            },
            format: {
              backgroundColor: { red: 0.996, green: 0.953, blue: 0.780 },
              textFormat: {
                foregroundColor: { red: 0.573, green: 0.251, blue: 0.055 },
                bold: true
              }
            }
          }
        },
        index: 1
      }
    });

    // 3. Rejected -> Background Merah Lembut (#FEE2E2), Teks Merah Tua (#991B1B)
    requests.push({
      addConditionalFormatRule: {
        rule: {
          ranges: [{
            sheetId: sheetId,
            startRowIndex: 1,
            startColumnIndex: 12,
            endColumnIndex: 13
          }],
          booleanRule: {
            condition: {
              type: 'TEXT_EQ',
              values: [{ userEnteredValue: 'Rejected' }]
            },
            format: {
              backgroundColor: { red: 0.996, green: 0.886, blue: 0.886 },
              textFormat: {
                foregroundColor: { red: 0.600, green: 0.106, blue: 0.106 },
                bold: true
              }
            }
          }
        },
        index: 2
      }
    });

    // Eksekusi semua format batchUpdate sekaligus
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests }
    });

    console.log('✅ Desain visual tab Creators berhasil diterapkan!');

    // =========================================================================
    // J. Opsional: Buat Tab '📊 Dashboard KPI' dengan formula analitik otomatis!
    // =========================================================================
    const dashboardTitle = '📊 Dashboard';
    let dashSheet = meta.data.sheets.find(s => s.properties.title === dashboardTitle);

    if (!dashSheet) {
      console.log(`ℹ️  Membuat tab ringkasan eksekutif '${dashboardTitle}'...`);
      const addDashRes = await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: dashboardTitle,
                  tabColor: { red: 0.118, green: 0.161, blue: 0.231 } // Slate Dark
                }
              }
            }
          ]
        }
      });
      dashSheet = addDashRes.data.replies[0].addSheet;
    }

    const dashSheetId = dashSheet.properties.sheetId;

    // Isi konten dan formula di tab Dashboard KPI
    const dashboardValues = [
      ['CREATORHUB - EXECUTIVE KPI DASHBOARD', '', '', ''],
      ['Metrik Utama', 'Formula Real-Time', 'Nilai Saat Ini', 'Keterangan'],
      ['Total Pendaftar', '=COUNTA(Creators!A2:A)', '', 'Total seluruh kreator yang mendaftar'],
      ['Kreator Approved (Tayang)', '=COUNTIF(Creators!M2:M, "Approved")', '', 'Kreator lolos kurasi & tayang di web'],
      ['Kreator Pending (Review)', '=COUNTIF(Creators!M2:M, "Pending")', '', 'Menunggu persetujuan admin'],
      ['Kreator Rejected (Ditolak)', '=COUNTIF(Creators!M2:M, "Rejected")', '', 'Pendaftar yang tidak memenuhi syarat'],
      ['Total Audience Reach', '=SUMIF(Creators!M2:M, "Approved", Creators!G2:G)', '', 'Akumulasi followers kreator aktif'],
      ['Rata-rata Followers', '=AVERAGEIF(Creators!M2:M, "Approved", Creators!G2:G)', '', 'Rata-rata followers kreator aktif'],
      ['', '', '', ''],
      ['Distribusi Platform', 'Formula', 'Jumlah', 'Persentase'],
      ['Instagram', '=COUNTIF(Creators!E2:E, "Instagram")', '', ''],
      ['TikTok', '=COUNTIF(Creators!E2:E, "TikTok")', '', ''],
      ['YouTube', '=COUNTIF(Creators!E2:E, "YouTube")', '', ''],
      ['X (Twitter)', '=COUNTIF(Creators!E2:E, "X")', '', '']
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${dashboardTitle}!A1:D14`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: dashboardValues
      }
    });

    // Beri format visual pada Tab Dashboard KPI
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          // Banner Judul A1:D1
          {
            repeatCell: {
              range: {
                sheetId: dashSheetId,
                startRowIndex: 0,
                endRowIndex: 1,
                startColumnIndex: 0,
                endColumnIndex: 4
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.059, green: 0.090, blue: 0.165 }, // #0F172A
                  textFormat: { foregroundColor: { red: 1, green: 1, blue: 1 }, bold: true, fontSize: 12 },
                  horizontalAlignment: 'LEFT'
                }
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)'
            }
          },
          // Header Baris 2 & 10
          {
            repeatCell: {
              range: {
                sheetId: dashSheetId,
                startRowIndex: 1,
                endRowIndex: 2,
                startColumnIndex: 0,
                endColumnIndex: 4
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.917, green: 0.345, blue: 0.047 },
                  textFormat: { foregroundColor: { red: 1, green: 1, blue: 1 }, bold: true },
                  horizontalAlignment: 'CENTER'
                }
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)'
            }
          },
          {
            repeatCell: {
              range: {
                sheetId: dashSheetId,
                startRowIndex: 9,
                endRowIndex: 10,
                startColumnIndex: 0,
                endColumnIndex: 4
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.917, green: 0.345, blue: 0.047 },
                  textFormat: { foregroundColor: { red: 1, green: 1, blue: 1 }, bold: true },
                  horizontalAlignment: 'CENTER'
                }
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)'
            }
          },
          // Lebar kolom dashboard
          {
            updateDimensionProperties: {
              range: { sheetId: dashSheetId, dimension: 'COLUMNS', startIndex: 0, endIndex: 1 },
              properties: { pixelSize: 220 },
              fields: 'pixelSize'
            }
          },
          {
            updateDimensionProperties: {
              range: { sheetId: dashSheetId, dimension: 'COLUMNS', startIndex: 1, endIndex: 2 },
              properties: { pixelSize: 260 },
              fields: 'pixelSize'
            }
          },
          {
            updateDimensionProperties: {
              range: { sheetId: dashSheetId, dimension: 'COLUMNS', startIndex: 2, endIndex: 4 },
              properties: { pixelSize: 220 },
              fields: 'pixelSize'
            }
          }
        ]
      }
    });

    console.log('✅ Tab Dashboard KPI berhasil dibuat dan diformat otomatis!');
    console.log('====================================================');
    console.log('🎉 Selesai! Desain spreadsheet Anda kini tampil modern, rapi, dan profesional.');
    console.log('====================================================');

  } catch (error) {
    console.error('❌ Terjadi kesalahan saat memformat spreadsheet:', error.message);
  }
}

beautifySheet();
