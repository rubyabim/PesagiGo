const fs = require('node:fs');
const path = require('node:path');
const bcrypt = require('bcrypt');
const { Client } = require('pg');

const apiRoot = path.resolve(__dirname, '..');
const envPath = path.join(apiRoot, '.env');

function readEnv(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  return fs
    .readFileSync(filePath, 'utf8')
    .split(/\r?\n/)
    .reduce((env, line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) {
        return env;
      }

      const separator = trimmed.indexOf('=');
      if (separator === -1) {
        return env;
      }

      const key = trimmed.slice(0, separator).trim();
      const value = trimmed
        .slice(separator + 1)
        .trim()
        .replace(/^['"]|['"]$/g, '');
      env[key] = value;
      return env;
    }, {});
}

const fileEnv = readEnv(envPath);
const databaseUrl = process.env.DATABASE_URL || fileEnv.DATABASE_URL;
const authDatabaseUrl =
  process.env.AUTH_DATABASE_URL || fileEnv.AUTH_DATABASE_URL || databaseUrl;

if (!databaseUrl) {
  console.error('DATABASE_URL tidak ditemukan. Isi Api/.env dulu.');
  process.exit(1);
}

const now = new Date('2026-05-24T07:00:00.000Z');
const iso = (value) => new Date(value).toISOString();
const adminPassword = process.env.SEED_ADMIN_PASSWORD || fileEnv.SEED_ADMIN_PASSWORD;
const userPassword = process.env.SEED_USER_PASSWORD || fileEnv.SEED_USER_PASSWORD;

if (!adminPassword || !userPassword) {
  console.error('SEED_ADMIN_PASSWORD dan SEED_USER_PASSWORD wajib diisi lewat environment atau Api/.env.');
  process.exit(1);
}

async function upsertUsers(client) {
  const adminHash = await bcrypt.hash(adminPassword, 10);
  const userHash = await bcrypt.hash(userPassword, 10);

  await client.query(
    `
      INSERT INTO "User" ("id", "fullName", "email", "phone", "passwordHash", "role", "createdAt", "updatedAt")
      VALUES
        ('test_admin_cms', 'Admin PesagiGo', 'admin@pesagigo.local', '081200000001', $1, 'ADMIN', $3, $3),
        ('test_user_mobile', 'Abim Febriansyah', 'abim@pesagigo.local', '081234567890', $2, 'USER', $3, $3)
      ON CONFLICT ("email") DO UPDATE SET
        "fullName" = EXCLUDED."fullName",
        "phone" = EXCLUDED."phone",
        "passwordHash" = EXCLUDED."passwordHash",
        "role" = EXCLUDED."role",
        "updatedAt" = EXCLUDED."updatedAt"
    `,
    [adminHash, userHash, now],
  );
}

async function seedMainDatabase() {
  const client = new Client({ connectionString: databaseUrl });
  await client.connect();

  try {
    await client.query('BEGIN');
    await upsertUsers(client);

    await client.query(
      `
        INSERT INTO "Mountain" ("id", "name", "location", "description", "bestSeason", "createdAt", "updatedAt")
        VALUES (
          'test_mountain_pesagi',
          'Gunung Pesagi via Papahan',
          'Lampung Barat',
          'Gunung Pesagi adalah gunung berapi tidak aktif dengan jalur pendakian yang menantang dan pemandangan alam khas Lampung Barat.',
          'Mei sampai September',
          $1,
          $1
        )
        ON CONFLICT ("name") DO UPDATE SET
          "location" = EXCLUDED."location",
          "description" = EXCLUDED."description",
          "bestSeason" = EXCLUDED."bestSeason",
          "updatedAt" = EXCLUDED."updatedAt"
      `,
      [now],
    );

    await client.query(
      `
        INSERT INTO "Trail" ("id", "mountainId", "name", "difficulty", "distanceKm", "estimatedHours", "description", "createdAt", "updatedAt")
        VALUES
          ('test_trail_papahan', 'test_mountain_pesagi', 'Jalur Papahan', 'MEDIUM', 7.2, 6, 'Jalur utama via Papahan dengan tanjakan sedang dan pos registrasi yang mudah dijangkau.', $1, $1),
          ('test_trail_register', 'test_mountain_pesagi', 'Jalur Register', 'HARD', 8.4, 7, 'Jalur alternatif dengan beberapa bagian curam dan vegetasi rapat.', $1, $1),
          ('test_trail_basecamp', 'test_mountain_pesagi', 'Jalur Basecamp Barat', 'EASY', 4.8, 4, 'Jalur pendek untuk simulasi pendakian dan latihan fisik ringan.', $1, $1)
        ON CONFLICT ("mountainId", "name") DO UPDATE SET
          "difficulty" = EXCLUDED."difficulty",
          "distanceKm" = EXCLUDED."distanceKm",
          "estimatedHours" = EXCLUDED."estimatedHours",
          "description" = EXCLUDED."description",
          "updatedAt" = EXCLUDED."updatedAt"
      `,
      [now],
    );

    await client.query(
      `
        INSERT INTO "ClimbSession" ("id", "mountainId", "date", "quotaTotal", "quotaBooked", "price", "createdAt", "updatedAt")
        VALUES
          ('test_session_20260524', 'test_mountain_pesagi', $1, 40, 20, 25000, $5, $5),
          ('test_session_20260525', 'test_mountain_pesagi', $2, 40, 15, 25000, $5, $5),
          ('test_session_20260531', 'test_mountain_pesagi', $3, 40, 10, 25000, $5, $5),
          ('test_session_20260607', 'test_mountain_pesagi', $4, 40, 8, 30000, $5, $5)
        ON CONFLICT ("mountainId", "date") DO UPDATE SET
          "quotaTotal" = EXCLUDED."quotaTotal",
          "quotaBooked" = EXCLUDED."quotaBooked",
          "price" = EXCLUDED."price",
          "updatedAt" = EXCLUDED."updatedAt"
      `,
      [
        iso('2026-05-24T00:00:00.000Z'),
        iso('2026-05-25T00:00:00.000Z'),
        iso('2026-05-31T00:00:00.000Z'),
        iso('2026-06-07T00:00:00.000Z'),
        now,
      ],
    );

    await client.query(
      `
        INSERT INTO "Booking" ("id", "userId", "sessionId", "quantity", "totalPrice", "status", "ticketCode", "ticketPdfUrl", "createdAt", "updatedAt")
        VALUES
          ('test_booking_paid', 'test_user_mobile', 'test_session_20260524', 2, 50000, 'PAID', 'PG20260524-0001', '/tickets/test_booking_paid/pdf', $1, $1),
          ('test_booking_pending', 'test_user_mobile', 'test_session_20260525', 1, 25000, 'PENDING_PAYMENT', NULL, NULL, $1, $1),
          ('test_booking_cancelled', 'test_user_mobile', 'test_session_20260531', 1, 25000, 'CANCELLED', NULL, NULL, $1, $1)
        ON CONFLICT ("id") DO UPDATE SET
          "userId" = EXCLUDED."userId",
          "sessionId" = EXCLUDED."sessionId",
          "quantity" = EXCLUDED."quantity",
          "totalPrice" = EXCLUDED."totalPrice",
          "status" = EXCLUDED."status",
          "ticketCode" = EXCLUDED."ticketCode",
          "ticketPdfUrl" = EXCLUDED."ticketPdfUrl",
          "updatedAt" = EXCLUDED."updatedAt"
      `,
      [now],
    );

    await client.query(
      `
        INSERT INTO "Payment" ("id", "bookingId", "method", "providerRef", "amount", "status", "paidAt", "createdAt", "updatedAt")
        VALUES
          ('test_payment_paid', 'test_booking_paid', 'Transfer Bank', 'TEST-TRX-0001', 50000, 'SUCCESS', $1, $1, $1),
          ('test_payment_pending', 'test_booking_pending', 'E-Wallet', 'TEST-TRX-0002', 25000, 'PENDING', NULL, $1, $1)
        ON CONFLICT ("bookingId") DO UPDATE SET
          "method" = EXCLUDED."method",
          "providerRef" = EXCLUDED."providerRef",
          "amount" = EXCLUDED."amount",
          "status" = EXCLUDED."status",
          "paidAt" = EXCLUDED."paidAt",
          "updatedAt" = EXCLUDED."updatedAt"
      `,
      [now],
    );

    await client.query(
      `
        INSERT INTO "WeatherForecast" ("id", "mountainId", "forecastDate", "condition", "temperatureC", "windKph", "note", "createdAt", "updatedAt")
        VALUES
          ('test_weather_20260524', 'test_mountain_pesagi', $1, 'CLOUDY', 22, 9, 'Cuaca teduh, jalur aman untuk pendakian pagi.', $5, $5),
          ('test_weather_20260525', 'test_mountain_pesagi', $2, 'SUNNY', 24, 7, 'Cerah berawan, tetap bawa jas hujan ringan.', $5, $5),
          ('test_weather_20260531', 'test_mountain_pesagi', $3, 'LIGHT_RAIN', 21, 12, 'Potensi hujan ringan setelah siang.', $5, $5),
          ('test_weather_20260607', 'test_mountain_pesagi', $4, 'FOG', 20, 8, 'Kabut tipis di area puncak saat pagi.', $5, $5)
        ON CONFLICT ("mountainId", "forecastDate") DO UPDATE SET
          "condition" = EXCLUDED."condition",
          "temperatureC" = EXCLUDED."temperatureC",
          "windKph" = EXCLUDED."windKph",
          "note" = EXCLUDED."note",
          "updatedAt" = EXCLUDED."updatedAt"
      `,
      [
        iso('2026-05-24T00:00:00.000Z'),
        iso('2026-05-25T00:00:00.000Z'),
        iso('2026-05-31T00:00:00.000Z'),
        iso('2026-06-07T00:00:00.000Z'),
        now,
      ],
    );

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
}

async function seedAuthDatabase() {
  if (!authDatabaseUrl || authDatabaseUrl === databaseUrl) {
    return;
  }

  const client = new Client({ connectionString: authDatabaseUrl });
  await client.connect();
  try {
    await upsertUsers(client);
  } finally {
    await client.end();
  }
}

function writeContentStore() {
  const store = {
    announcements: [
      {
        id: 'test_announcement_quota',
        title: 'Kuota Pendakian Akhir Pekan Terbatas',
        content:
          'Kuota akhir pekan dibatasi agar jalur tetap aman. Pesan tiket lebih awal melalui aplikasi PesagiGo.',
        level: 'INFO',
        createdAt: iso('2026-05-10T08:00:00.000Z'),
        updatedAt: now.toISOString(),
      },
      {
        id: 'test_announcement_registration',
        title: 'Pendaftaran Pendakian Gunung Pesagi Telah Dibuka',
        content:
          'Pendaftaran pendakian via Papahan sudah tersedia untuk tanggal 24 Mei sampai 7 Juni 2026.',
        level: 'INFO',
        createdAt: iso('2026-05-12T08:00:00.000Z'),
        updatedAt: now.toISOString(),
      },
      {
        id: 'test_announcement_weather',
        title: 'Waspada Hujan Ringan di Jalur Sore',
        content:
          'Pendaki sesi sore disarankan membawa jas hujan dan mengecek prakiraan cuaca sebelum berangkat.',
        level: 'WARNING',
        createdAt: iso('2026-05-18T08:00:00.000Z'),
        updatedAt: now.toISOString(),
      },
    ],
    news: [
      {
        id: 'test_news_registration',
        title: 'Registrasi Pendakian Digital Dibuka',
        description:
          'PesagiGo kini mendukung pemesanan tiket, pembayaran, dan QR Code pendakian langsung dari mobile.',
        publishedAt: iso('2026-05-10T08:00:00.000Z'),
        createdAt: iso('2026-05-10T08:00:00.000Z'),
        updatedAt: now.toISOString(),
      },
      {
        id: 'test_news_basecamp',
        title: 'Basecamp Papahan Siap Melayani Pendaki',
        description:
          'Petugas basecamp siap membantu validasi tiket dan informasi jalur untuk pendaki Gunung Pesagi.',
        publishedAt: iso('2026-05-16T08:00:00.000Z'),
        createdAt: iso('2026-05-16T08:00:00.000Z'),
        updatedAt: now.toISOString(),
      },
    ],
    rules: [
      {
        id: 'test_rule_preparation',
        title: 'Persiapan Sebelum Mendaki',
        description:
          'Bawa identitas, tiket QR, air minum, jaket, obat pribadi, dan pastikan kondisi fisik siap.',
        createdAt: iso('2026-05-01T08:00:00.000Z'),
        updatedAt: now.toISOString(),
      },
      {
        id: 'test_rule_during',
        title: 'Selama Pendakian',
        description:
          'Ikuti jalur resmi, jangan meninggalkan sampah, dan laporkan kondisi darurat ke petugas.',
        createdAt: iso('2026-05-02T08:00:00.000Z'),
        updatedAt: now.toISOString(),
      },
      {
        id: 'test_rule_etika',
        title: 'Etika Pendakian',
        description:
          'Hormati warga sekitar, sesama pendaki, dan area konservasi Gunung Pesagi.',
        createdAt: iso('2026-05-03T08:00:00.000Z'),
        updatedAt: now.toISOString(),
      },
      {
        id: 'test_rule_emergency',
        title: 'Keadaan Darurat',
        description:
          'Gunakan kontak admin pada aplikasi dan tetap bersama rombongan jika cuaca memburuk.',
        createdAt: iso('2026-05-04T08:00:00.000Z'),
        updatedAt: now.toISOString(),
      },
    ],
  };

  const targets = [
    path.join(apiRoot, 'data', 'content.json'),
    path.join(apiRoot, 'services', 'admin-service', 'data', 'content.json'),
  ];

  for (const target of targets) {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, `${JSON.stringify(store, null, 2)}\n`, 'utf8');
  }
}

async function main() {
  await seedMainDatabase();
  await seedAuthDatabase();
  writeContentStore();

  console.log('Seed data test berhasil dibuat.');
  console.log('CMS admin: admin@pesagigo.local');
  console.log('User mobile: abim@pesagigo.local');
}

main().catch((error) => {
  console.error('Seed data test gagal:');
  console.error(error);
  process.exit(1);
});
