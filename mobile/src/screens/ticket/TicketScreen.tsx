import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import { useNavigation, useRoute } from '@react-navigation/native';
import { fetchTicket, scanTicketCode, TicketScanResponse } from '../../api/client';
import { getApiBaseUrl } from '../../config/api';
import { useAuthContext } from '../../context/AuthContext';
import AppScaffold from '../common/AppScaffold';

// Struktur data tiket pendakian yang diterima dari API
type TicketData = {
  ticketCode: string;
  ticketPdfUrl: string;
  bookingId: string;
  mountain: string;
  climbDate: string;
  quantity: number;
};

// Data tiket cadangan yang digunakan saat data tiket utama tidak tersedia
const fallbackTicket: TicketData = {
  ticketCode: 'PSG-DUMMY-2405',
  ticketPdfUrl: '',
  bookingId: 'booking-dummy-1',
  mountain: 'Gunung Pesagi',
  climbDate: '2026-06-15T06:00:00+07:00',
  quantity: 3,
};

// Inisialisasi state, navigasi, dan data yang digunakan pada halaman tiket
export default function TicketScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { session } = useAuthContext();
  const [ticket, setTicket] = useState<TicketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scanCode, setScanCode] = useState('');
  const [scanLoading, setScanLoading] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<TicketScanResponse | null>(null);
  const [downloadInfo, setDownloadInfo] = useState<string | null>(null);
  const ticketId = route.params?.ticketId as string | undefined;
  const isAdmin = session?.user?.role === 'ADMIN';

  // Membuat tampilan barcode sederhana berdasarkan kode tiket
  const renderBarcode = (value: string) => {
    const bars = value.split('').flatMap((char, index) => {
      const code = char.charCodeAt(0) + index;
      return [1, 2, 3, 4].map((step) => ((code + step) % 2 === 0 ? 3 : 1));
    });
    return (
      <View style={styles.barcodeWrap}>
        <View style={styles.barcodeRow}>
          {bars.map((barWidth, idx) => (
            <View key={`${value}-${idx}`} style={[styles.bar, { width: barWidth }]} />
          ))}
        </View>
        <Text style={styles.barcodeCode}>{value}</Text>
      </View>
    );
  };

  // Memuat data tiket berdasarkan ID tiket yang dipilih
  useEffect(() => {
    const load = async () => {
      // Menggunakan data fallback jika pengguna belum login atau ID tiket tidak tersedia
      if (!session?.accessToken || !ticketId) {
        setTicket(fallbackTicket);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        // Mengambil data tiket dari server
        const data = await fetchTicket(session.accessToken, ticketId);
        setTicket(data as TicketData);
        setScanCode((data as TicketData).ticketCode);
      } catch (err) {
        // Menampilkan tiket dummy jika gagal mengambil data
        setTicket(fallbackTicket);
        setError(err instanceof Error ? `${err.message} - menampilkan tiket dummy.` : 'Tiket belum tersedia - menampilkan tiket dummy.');
        setScanCode(fallbackTicket.ticketCode);
      } finally {
        // Mengakhiri proses loading
        setLoading(false);
      }
    };
    void load();
  }, [session?.accessToken, ticketId]);

  // Memverifikasi tiket berdasarkan kode yang dimasukkan admin
  const verifyTicket = async () => {
    // Memastikan admin sudah login
    if (!session?.accessToken) {
      setScanError('Login admin diperlukan untuk verifikasi tiket.');
      return;
    }
    // Memastikan kode tiket telah diisi
    if (!scanCode.trim()) {
      setScanError('Masukkan kode tiket.');
      return;
    }
    setScanLoading(true);
    setScanError(null);
    setScanResult(null);
    try {
      // Mengirim kode tiket untuk proses verifikasi
      const result = await scanTicketCode(session.accessToken, scanCode.trim());
      setScanResult(result);
    } catch (err) {
      // Menampilkan pesan kesalahan jika verifikasi gagal
      setScanError(err instanceof Error ? err.message : 'Gagal verifikasi tiket');
    } finally {
      // Mengakhiri status loading
      setScanLoading(false);
    }
  };

  // Mengunduh dan menyimpan PDF tiket ke perangkat pengguna
  const openTicketPdf = async () => {
    // Memastikan file PDF tiket tersedia
    if (!ticket?.ticketPdfUrl) {
      setError('PDF tiket belum tersedia.');
      return;
    }
    // Memastikan pengguna sudah login
    if (!session?.accessToken) {
      setError('Login diperlukan untuk mengunduh PDF tiket resmi.');
      return;
    }

    try {
      const safeName = (session?.user?.fullName ?? 'pendaki')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      const safeMountain = ticket.mountain
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      const dateKey = new Date(ticket.climbDate).toISOString().slice(0, 10);
      const filename = `tiket-${safeName}-${ticket.bookingId}-${safeMountain}-${dateKey}.pdf`;
      if (!FileSystem.documentDirectory) {
        setError('Lokasi penyimpanan tidak tersedia di perangkat ini.');
        return;
      }
      const targetUri = `${FileSystem.documentDirectory}${filename}`;
      const pdfUrl = `${getApiBaseUrl()}/api/bookings/${ticket.bookingId}/ticket/pdf`;

      setDownloadInfo('Mengunduh PDF tiket...');
      await FileSystem.downloadAsync(pdfUrl, targetUri, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      });
      setDownloadInfo(`PDF tersimpan: ${filename}`);
    } catch {
      setDownloadInfo(null);
      setError('Gagal mengunduh PDF tiket.');
    }
  };

  return (
    <AppScaffold title="Detail Tiket">
      <ScrollView style={styles.page} contentContainerStyle={styles.content}>
        {loading ? <ActivityIndicator color="#135efd" /> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {ticket ? (
          <View style={styles.card}>
            <Text style={styles.title}>Kode Booking</Text>
            <Text style={styles.code}>{ticket.ticketCode}</Text>
            {renderBarcode(ticket.ticketCode)}
            <Text style={styles.barcodeHint}>Gunakan kode di barcode ini untuk validasi tiket pada CMS Admin.</Text>
            <Text style={styles.meta}>Gunung: {ticket.mountain}</Text>
            <Text style={styles.meta}>Jalur: Papahan</Text>
            <Text style={styles.meta}>
              Tanggal: {new Date(ticket.climbDate).toLocaleDateString('id-ID')}
            </Text>
            <Text style={styles.meta}>Sesi: Pagi (06:00 - 07:00 WIB)</Text>
            <Text style={styles.meta}>Jumlah Pendaki: {ticket.quantity} orang</Text>
            <Text style={styles.active}>Status: AKTIF</Text>
            <Pressable style={styles.primaryBtn} onPress={() => navigation.navigate('TicketHistory')}>
              <Text style={styles.primaryText}>Lihat Tiket Saya</Text>
            </Pressable>
            <Pressable style={styles.downloadBtn} onPress={openTicketPdf}>
              <Text style={styles.downloadText}>Download PDF Tiket</Text>
            </Pressable>
            {downloadInfo ? <Text style={styles.downloadInfo}>{downloadInfo}</Text> : null}
            <Pressable style={styles.secondaryBtn} onPress={() => navigation.navigate('MainTabs')}>
              <Text style={styles.secondaryText}>Kembali ke Beranda</Text>
            </Pressable>
          </View>
        ) : null}
        {isAdmin ? (
          <View style={styles.verifyCard}>
            <Text style={styles.verifyTitle}>Verifikasi Tiket (Admin)</Text>
            <TextInput
              value={scanCode}
              onChangeText={setScanCode}
              placeholder="Masukkan kode tiket"
              style={styles.verifyInput}
              autoCapitalize="characters"
            />
            <Pressable style={styles.verifyButton} onPress={verifyTicket} disabled={scanLoading}>
              <Text style={styles.verifyButtonText}>{scanLoading ? 'Memverifikasi...' : 'Verifikasi Tiket'}</Text>
            </Pressable>
            {scanError ? <Text style={styles.verifyError}>{scanError}</Text> : null}
            {scanResult ? (
              <View style={styles.verifyResult}>
                <Text style={styles.verifyMeta}>Kode: {scanResult.ticketCode ?? '-'}</Text>
                <Text style={styles.verifyMeta}>Pendaki: {scanResult.holder}</Text>
                <Text style={styles.verifyMeta}>Gunung: {scanResult.mountain}</Text>
                <Text style={styles.verifyMeta}>Tanggal: {new Date(scanResult.climbDate).toLocaleDateString('id-ID')}</Text>
                <Text style={styles.verifyMeta}>Status Booking: {scanResult.status}</Text>
                <Text style={styles.verifyMeta}>Status Bayar: {scanResult.paymentStatus ?? '-'}</Text>
              </View>
            ) : null}
          </View>
        ) : null}
      </ScrollView>
    </AppScaffold>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#f3f5f8' },
  content: { padding: 16, paddingBottom: 110 },
  card: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#dce4ef', padding: 16, alignItems: 'center' },
  title: { color: '#475569', fontSize: 14, fontWeight: '700' },
  code: { color: '#0f172a', fontSize: 32, fontWeight: '900', marginTop: 6, marginBottom: 12 },
  barcodeWrap: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 12,
    marginBottom: 4,
  },
  barcodeRow: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'center',
    gap: 1,
  },
  bar: { backgroundColor: '#0f172a' },
  barcodeCode: { textAlign: 'center', marginTop: 8, color: '#0f172a', fontSize: 13, letterSpacing: 1, fontWeight: '700' },
  barcodeHint: { color: '#64748b', fontSize: 11, lineHeight: 16, marginTop: 8, textAlign: 'center' },
  meta: { color: '#334155', fontSize: 14, marginTop: 10 },
  active: { color: '#135efd', fontSize: 13, marginTop: 10, fontWeight: '800' },
  primaryBtn: { marginTop: 16, width: '100%', borderRadius: 8, backgroundColor: '#135efd', paddingVertical: 12, alignItems: 'center' },
  primaryText: { color: '#fff', fontWeight: '800' },
  downloadBtn: { marginTop: 10, width: '100%', borderRadius: 10, borderWidth: 1, borderColor: '#135efd', paddingVertical: 12, alignItems: 'center' },
  downloadText: { color: '#135efd', fontWeight: '800' },
  downloadInfo: { marginTop: 8, color: '#0f766e', fontSize: 12, fontWeight: '600', textAlign: 'center' },
  secondaryBtn: { marginTop: 10, width: '100%', borderRadius: 12, borderWidth: 1, borderColor: '#cbd5e1', paddingVertical: 12, alignItems: 'center' },
  secondaryText: { color: '#1e293b', fontWeight: '700' },
  error: { color: '#b91c1c', fontSize: 13, fontWeight: '600' },
  verifyCard: { marginTop: 14, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#dce4ef', padding: 14, gap: 10 },
  verifyTitle: { color: '#0f172a', fontSize: 16, fontWeight: '800' },
  verifyInput: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#0f172a' },
  verifyButton: { borderRadius: 10, backgroundColor: '#135efd', alignItems: 'center', paddingVertical: 11 },
  verifyButtonText: { color: '#fff', fontWeight: '800' },
  verifyError: { color: '#b91c1c', fontSize: 12, fontWeight: '600' },
  verifyResult: { borderRadius: 10, borderWidth: 1, borderColor: '#dbe4ef', padding: 10, gap: 4, backgroundColor: '#f8fbff' },
  verifyMeta: { color: '#334155', fontSize: 13 },
});
