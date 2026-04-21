'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  AuthResponse,
  Booking,
  TicketResponse,
  createBooking,
  fetchApiHealth,
  fetchMountains,
  fetchMyBookings,
  fetchSessions,
  fetchTicket,
  fetchWeather,
  getApiBaseUrl,
  loginUser,
  payBooking,
  registerUser,
  runSeed,
} from '../lib/api';

type IntegrationData = {
  health?: {
    status: string;
    service: string;
    timestamp: string;
  };
  mountains: Array<{ id: string; name: string; location: string }>;
  sessions: Array<{ id: string; mountainId: string; date: string; quotaAvailable: number; price: number }>;
  weather: Array<{ id: string; forecastDate: string; summary: string; mountain: { name: string } }>;
  bookings: Booking[];
  ticket?: TicketResponse;
};

export default function Home() {
  // URL backend dibaca sekali saat komponen dibuat.
  const apiBaseUrl = useMemo(() => getApiBaseUrl(), []);

  // State form autentikasi dan alur booking.
  const [registerForm, setRegisterForm] = useState({
    fullName: 'Pendaki Demo',
    email: `demo.${Date.now()}@pesagigo.local`,
    password: 'rahasia123',
    phone: '081234567890',
  });
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: 'rahasia123',
  });
  const [bookingQty, setBookingQty] = useState(1);
  const [payMethod, setPayMethod] = useState('VA-BCA');
  const [auth, setAuth] = useState<AuthResponse | null>(null);
  const [data, setData] = useState<IntegrationData>({
    mountains: [],
    sessions: [],
    weather: [],
    bookings: [],
  });
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [selectedBookingId, setSelectedBookingId] = useState<string>('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('Siap menjalankan integrasi.');
  const [error, setError] = useState<string | null>(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [showPdfPreview, setShowPdfPreview] = useState(false);

  // Token dipakai untuk memanggil endpoint yang membutuhkan login.
  const authToken = auth?.accessToken ?? '';

  useEffect(() => {
    return () => {
      if (pdfPreviewUrl) {
        URL.revokeObjectURL(pdfPreviewUrl);
      }
    };
  }, [pdfPreviewUrl]);

  async function refreshPublicData() {
    // Ambil semua data publik secara paralel agar lebih cepat.
    const [health, mountains, sessions, weather] = await Promise.all([
      fetchApiHealth(),
      fetchMountains(),
      fetchSessions(),
      fetchWeather(),
    ]);

    setData((prev) => ({
      ...prev,
      health,
      mountains: mountains.map((item) => ({
        id: item.id,
        name: item.name,
        location: item.location,
      })),
      sessions: sessions.map((item) => ({
        id: item.id,
        mountainId: item.mountainId,
        date: item.date,
        quotaAvailable: item.quotaAvailable,
        price: item.price,
      })),
      weather: weather.map((item) => ({
        id: item.id,
        forecastDate: item.forecastDate,
        summary: item.summary,
        mountain: { name: item.mountain.name },
      })),
    }));

    setSelectedSessionId((current) => current || sessions[0]?.id || '');
  }

  async function refreshMyBookings(token: string) {
    // Ambil booking milik user yang sedang login.
    const bookings = await fetchMyBookings(token);
    setData((prev) => ({
      ...prev,
      bookings,
    }));

    setSelectedBookingId((current) => current || bookings[0]?.id || '');
  }

  async function withAction(action: () => Promise<void>) {
    // Bungkus semua aksi supaya loading dan error konsisten.
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Terjadi error tidak dikenal';
      setError(msg);
    } finally {
      setBusy(false);
    }
  }

  const handleSeed = () =>
    withAction(async () => {
      // Menjalankan seed agar data demo siap digunakan.
      const result = await runSeed();
      setMessage(result.message);
      await refreshPublicData();
    });

  const handleSyncPublic = () =>
    withAction(async () => {
      // Sinkron data publik terbaru dari backend.
      await refreshPublicData();
      setMessage('Data publik berhasil disinkronkan.');
    });

  const handleRegister = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    withAction(async () => {
      // Daftar user baru lalu langsung muat data awal.
      const result = await registerUser(registerForm);
      setAuth(result);
      setLoginForm((prev) => ({ ...prev, email: registerForm.email }));
      setMessage(result.message);
      await refreshPublicData();
      await refreshMyBookings(result.accessToken);
    });
  };

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    withAction(async () => {
      // Login user lalu ambil data publik dan booking user.
      const result = await loginUser(loginForm);
      setAuth(result);
      setMessage(result.message);
      await refreshPublicData();
      await refreshMyBookings(result.accessToken);
    });
  };

  const handleCreateBooking = () =>
    withAction(async () => {
      // Validasi dasar sebelum membuat booking.
      if (!authToken) {
        throw new Error('Login terlebih dahulu.');
      }
      if (!selectedSessionId) {
        throw new Error('Pilih sesi pendakian terlebih dahulu.');
      }

      const booking = await createBooking(authToken, {
        sessionId: selectedSessionId,
        quantity: bookingQty,
      });
      setMessage(`Booking berhasil dibuat: ${booking.id}`);
      await refreshPublicData();
      await refreshMyBookings(authToken);
      setSelectedBookingId(booking.id);
    });

  const handlePayBooking = () =>
    withAction(async () => {
      // Bayar booking yang dipilih oleh user.
      if (!authToken) {
        throw new Error('Login terlebih dahulu.');
      }
      if (!selectedBookingId) {
        throw new Error('Pilih booking yang akan dibayar.');
      }

      const result = await payBooking(authToken, selectedBookingId, {
        method: payMethod,
      });
      setMessage(result.message);
      await refreshMyBookings(authToken);
    });

  const handleGetTicket = () =>
    withAction(async () => {
      // Ambil detail tiket setelah booking dibayar.
      if (!authToken) {
        throw new Error('Login terlebih dahulu.');
      }
      if (!selectedBookingId) {
        throw new Error('Pilih booking untuk ambil tiket.');
      }

      const ticket = await fetchTicket(authToken, selectedBookingId);
      setData((prev) => ({
        ...prev,
        ticket,
      }));
      setMessage(`Tiket didapatkan: ${ticket.ticketCode}`);
    });

  const handlePreviewTicketPdf = () =>
    withAction(async () => {
      if (!authToken) {
        throw new Error('Login terlebih dahulu.');
      }

      if (!data.ticket?.ticketPdfUrl) {
        throw new Error('Ambil tiket terlebih dahulu agar URL PDF tersedia.');
      }

      const response = await fetch(data.ticket.ticketPdfUrl, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        let messageText = `Gagal mengambil PDF (${response.status})`;
        try {
          const payload = (await response.json()) as { message?: string | string[] };
          if (Array.isArray(payload.message)) {
            messageText = payload.message.join(', ');
          } else if (payload.message) {
            messageText = payload.message;
          }
        } catch {
          // Gunakan pesan default jika response bukan JSON.
        }
        throw new Error(messageText);
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);

      if (pdfPreviewUrl) {
        URL.revokeObjectURL(pdfPreviewUrl);
      }

      setPdfPreviewUrl(objectUrl);
      setShowPdfPreview(true);
      setMessage('Preview PDF tiket berhasil dibuka.');
    });

  const closePdfPreview = () => {
    if (pdfPreviewUrl) {
      URL.revokeObjectURL(pdfPreviewUrl);
    }
    setPdfPreviewUrl(null);
    setShowPdfPreview(false);
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100 md:px-8">
      {/* Konsol sederhana untuk uji alur integrasi CMS ke backend. */}
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-5">
        <h1 className="text-3xl font-bold">PesagiGo CMS Integration Console</h1>
        <p className="text-sm text-slate-300">API Base URL: {apiBaseUrl}</p>
        <p className="rounded-lg border border-cyan-500/40 bg-cyan-500/10 p-3 text-sm text-cyan-100">{message}</p>
        {error ? (
          <p className="rounded-lg border border-rose-500/40 bg-rose-500/10 p-3 text-sm text-rose-200">Error: {error}</p>
        ) : null}

        {/* Grid dua kolom untuk seluruh panel integrasi. */}
        <div className="grid gap-5 lg:grid-cols-2">
          {/* Panel ini untuk inisialisasi dan sinkron data publik. */}
          <section className="rounded-xl border border-slate-700 bg-slate-900/80 p-4">
            <h2 className="mb-3 text-lg font-semibold">Setup Data</h2>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleSeed}
                disabled={busy}
                className="rounded bg-amber-500 px-3 py-2 text-sm font-semibold text-amber-950 disabled:opacity-60"
              >
                Seed Backend
              </button>
              <button
                type="button"
                onClick={handleSyncPublic}
                disabled={busy}
                className="rounded bg-cyan-500 px-3 py-2 text-sm font-semibold text-cyan-950 disabled:opacity-60"
              >
                Sync Public Data
              </button>
            </div>
            <div className="mt-4 space-y-2 text-sm text-slate-300">
              <p>Health: {data.health ? `${data.health.service} (${data.health.status})` : '-'}</p>
              <p>Mountains: {data.mountains.length}</p>
              <p>Sessions: {data.sessions.length}</p>
              <p>Weather rows: {data.weather.length}</p>
            </div>
          </section>

          {/* Panel autentikasi untuk daftar dan login pengguna. */}
          <section className="rounded-xl border border-slate-700 bg-slate-900/80 p-4">
            <h2 className="mb-3 text-lg font-semibold">Auth</h2>
            <form onSubmit={handleRegister} className="mb-4 grid gap-2">
              <input
                value={registerForm.fullName}
                onChange={(event) =>
                  setRegisterForm((prev) => ({ ...prev, fullName: event.target.value }))
                }
                placeholder="Full name"
                className="rounded border border-slate-600 bg-slate-800 px-3 py-2 text-sm"
              />
              <input
                value={registerForm.email}
                onChange={(event) =>
                  setRegisterForm((prev) => ({ ...prev, email: event.target.value }))
                }
                placeholder="Email"
                className="rounded border border-slate-600 bg-slate-800 px-3 py-2 text-sm"
              />
              <input
                type="password"
                value={registerForm.password}
                onChange={(event) =>
                  setRegisterForm((prev) => ({ ...prev, password: event.target.value }))
                }
                placeholder="Password"
                className="rounded border border-slate-600 bg-slate-800 px-3 py-2 text-sm"
              />
              <button
                type="submit"
                disabled={busy}
                className="rounded bg-emerald-500 px-3 py-2 text-sm font-semibold text-emerald-950 disabled:opacity-60"
              >
                Register
              </button>
            </form>

            <form onSubmit={handleLogin} className="grid gap-2">
              <input
                value={loginForm.email}
                onChange={(event) =>
                  setLoginForm((prev) => ({ ...prev, email: event.target.value }))
                }
                placeholder="Email"
                className="rounded border border-slate-600 bg-slate-800 px-3 py-2 text-sm"
              />
              <input
                type="password"
                value={loginForm.password}
                onChange={(event) =>
                  setLoginForm((prev) => ({ ...prev, password: event.target.value }))
                }
                placeholder="Password"
                className="rounded border border-slate-600 bg-slate-800 px-3 py-2 text-sm"
              />
              <button
                type="submit"
                disabled={busy}
                className="rounded bg-indigo-500 px-3 py-2 text-sm font-semibold text-indigo-950 disabled:opacity-60"
              >
                Login
              </button>
            </form>

            <p className="mt-3 text-xs text-slate-300">
              User aktif: {auth?.user.email ?? '-'}
            </p>
          </section>

          {/* Panel alur booking mulai pilih sesi sampai ambil tiket. */}
          <section className="rounded-xl border border-slate-700 bg-slate-900/80 p-4">
            <h2 className="mb-3 text-lg font-semibold">Booking Flow</h2>
            <label className="mb-1 block text-xs text-slate-300">Pilih Session</label>
            <select
              value={selectedSessionId}
              onChange={(event) => setSelectedSessionId(event.target.value)}
              className="mb-2 w-full rounded border border-slate-600 bg-slate-800 px-3 py-2 text-sm"
            >
              <option value="">-- pilih sesi --</option>
              {data.sessions.map((session) => (
                <option key={session.id} value={session.id}>
                  {session.id.slice(0, 8)} | {new Date(session.date).toLocaleDateString()} | quota {session.quotaAvailable} | Rp{session.price}
                </option>
              ))}
            </select>
            <label className="mb-1 block text-xs text-slate-300">Jumlah Tiket</label>
            <input
              type="number"
              min={1}
              value={bookingQty}
              onChange={(event) => setBookingQty(Number(event.target.value || 1))}
              className="mb-3 w-full rounded border border-slate-600 bg-slate-800 px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={handleCreateBooking}
              disabled={busy}
              className="mb-3 w-full rounded bg-teal-500 px-3 py-2 text-sm font-semibold text-teal-950 disabled:opacity-60"
            >
              Buat Booking
            </button>

            <label className="mb-1 block text-xs text-slate-300">Pilih Booking</label>
            <select
              value={selectedBookingId}
              onChange={(event) => setSelectedBookingId(event.target.value)}
              className="mb-2 w-full rounded border border-slate-600 bg-slate-800 px-3 py-2 text-sm"
            >
              <option value="">-- pilih booking --</option>
              {data.bookings.map((booking) => (
                <option key={booking.id} value={booking.id}>
                  {booking.id.slice(0, 8)} | {booking.status} | qty {booking.quantity}
                </option>
              ))}
            </select>
            <input
              value={payMethod}
              onChange={(event) => setPayMethod(event.target.value)}
              className="mb-2 w-full rounded border border-slate-600 bg-slate-800 px-3 py-2 text-sm"
              placeholder="Metode pembayaran"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handlePayBooking}
                disabled={busy}
                className="w-full rounded bg-fuchsia-500 px-3 py-2 text-sm font-semibold text-fuchsia-950 disabled:opacity-60"
              >
                Bayar Booking
              </button>
              <button
                type="button"
                onClick={handleGetTicket}
                disabled={busy}
                className="w-full rounded bg-lime-500 px-3 py-2 text-sm font-semibold text-lime-950 disabled:opacity-60"
              >
                Ambil Tiket
              </button>
            </div>
          </section>

          {/* Panel ringkasan untuk cuaca, riwayat booking, dan tiket. */}
          <section className="rounded-xl border border-slate-700 bg-slate-900/80 p-4">
            <h2 className="mb-3 text-lg font-semibold">Ringkasan</h2>
            <p className="mb-1 text-sm text-slate-300">Cuaca:</p>
            <ul className="mb-3 max-h-32 overflow-auto text-xs text-slate-200">
              {data.weather.slice(0, 8).map((item) => (
                <li key={item.id}>
                  {new Date(item.forecastDate).toLocaleDateString()} - {item.mountain.name} - {item.summary}
                </li>
              ))}
            </ul>

            <p className="mb-1 text-sm text-slate-300">Riwayat booking:</p>
            <ul className="mb-3 max-h-32 overflow-auto text-xs text-slate-200">
              {data.bookings.map((item) => (
                <li key={item.id}>
                  {item.id.slice(0, 8)} | {item.status} | qty {item.quantity} | Rp{item.totalPrice}
                </li>
              ))}
            </ul>

            <p className="text-sm text-slate-300">Tiket:</p>
            <p className="text-xs text-slate-200">
              {data.ticket
                ? `${data.ticket.ticketCode} (${data.ticket.mountain})`
                : 'Belum ada tiket diambil.'}
            </p>
            <p className="text-xs text-cyan-300">
              {data.ticket?.ticketPdfUrl ? `PDF: ${data.ticket.ticketPdfUrl}` : ''}
            </p>
            <button
              type="button"
              onClick={handlePreviewTicketPdf}
              disabled={busy || !data.ticket?.ticketPdfUrl}
              className="mt-2 rounded bg-cyan-500 px-3 py-2 text-xs font-semibold text-cyan-950 disabled:opacity-60"
            >
              Preview PDF + QR
            </button>
          </section>
        </div>
      </section>

      {showPdfPreview && pdfPreviewUrl ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4">
          <div className="w-full max-w-5xl rounded-xl border border-slate-700 bg-slate-900 p-3 shadow-2xl">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-100">Preview Tiket PDF + QR</p>
              <button
                type="button"
                onClick={closePdfPreview}
                className="rounded bg-rose-500 px-3 py-1 text-xs font-semibold text-rose-950"
              >
                Tutup
              </button>
            </div>
            <iframe
              src={pdfPreviewUrl}
              title="Preview tiket PDF"
              className="h-[75vh] w-full rounded border border-slate-700 bg-white"
            />
          </div>
        </div>
      ) : null}
    </main>
  );
}
