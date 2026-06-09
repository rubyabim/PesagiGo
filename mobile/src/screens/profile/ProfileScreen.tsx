import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { fetchMyBookings } from '../../api/client';
import { useAuthContext } from '../../context/AuthContext';
import AppScaffold from '../common/AppScaffold';

// Struktur data ringkas untuk informasi booking pendakian
type LiteBooking = {
  id: string;
  status: string;
  quantity: number;
  totalPrice: number;
  session?: { mountain?: { name?: string }; date?: string };
};

export default function ProfileScreen() {
  // Inisialisasi state dan data yang digunakan pada halaman profil pengguna
  const navigation = useNavigation<any>();
  const { ready, session, logout } = useAuthContext();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookings, setBookings] = useState<LiteBooking[]>([]);

  // Memuat riwayat booking pengguna setelah berhasil login
  useEffect(() => {
    if (!session?.accessToken) {
      setBookings([]);
      return;
    }

    const load = async () => {
      setBusy(true);
      setError(null);
      try {
        const data = await fetchMyBookings(session.accessToken);
        setBookings(data as LiteBooking[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal memuat booking');
      } finally {
        setBusy(false);
      }
    };

    void load();
  }, [session?.accessToken]);

  if (!ready) {
    return (
      <AppScaffold title="Profil">
        <View style={styles.center}>
          <ActivityIndicator color="#135efd" />
        </View>
      </AppScaffold>
    );
  }

  if (!session) {
    return (
      <AppScaffold title="Profil">
        <ScrollView style={styles.page} contentContainerStyle={styles.content}>
          <View style={styles.card}>
            <Text style={styles.title}>Login </Text>
            <Text style={styles.subtitle}>Login diperlukan untuk melihat dashboard profil, tiket, dan riwayat booking.</Text>
            <Pressable style={styles.loginBtn} onPress={() => navigation.navigate('Auth', { screen: 'Login' })}>
              <Text style={styles.loginBtnText}>Masuk / Daftar</Text>
            </Pressable>
          </View>
        </ScrollView>
      </AppScaffold>
    );
  }

  const totalTicket = bookings.reduce((sum, item) => sum + item.quantity, 0);
  const totalSpend = bookings.reduce((sum, item) => sum + item.totalPrice, 0);

  return (
    <AppScaffold title="Profil">
      <ScrollView style={styles.page} contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>{session.user.fullName}</Text>
          <Text style={styles.profileLine}>{session.user.email}</Text>
          <Text style={styles.profileLine}>Role: {session.user.role}</Text>
        </View>

        <View style={styles.statsWrap}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Booking</Text>
            <Text style={styles.statValue}>{bookings.length}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Tiket</Text>
            <Text style={styles.statValue}>{totalTicket}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Belanja</Text>
            <Text style={styles.statValue}>Rp {totalSpend.toLocaleString('id-ID')}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Menu Akun</Text>
          <Pressable style={styles.menuItem} onPress={() => navigation.navigate('Weather')}>
            <Text style={styles.menuText}>Tiket Saya</Text>
          </Pressable>
          <Pressable style={styles.menuItem}>
            <Text style={styles.menuText}>Data Diri</Text>
          </Pressable>
          <Pressable style={styles.menuItem} onPress={() => navigation.navigate('TicketHistory')}>
            <Text style={styles.menuText}>Riwayat Booking</Text>
          </Pressable>
          <Pressable style={styles.menuItem}>
            <Text style={styles.menuText}>Metode Pembayaran</Text>
          </Pressable>
          <Pressable style={styles.menuItem} onPress={() => navigation.navigate('Map')}>
            <Text style={styles.menuText}>Bantuan & Kontak</Text>
          </Pressable>
          <Pressable style={styles.menuItem}>
            <Text style={styles.menuText}>Pengaturan</Text>
          </Pressable>
          <Pressable style={styles.logoutBtn} onPress={logout}>
            <Text style={styles.logoutText}>Keluar</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Riwayat Booking</Text>
          {busy ? <ActivityIndicator color="#135efd" /> : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {!busy && bookings.length === 0 ? <Text style={styles.empty}>Belum ada booking.</Text> : null}
          {bookings.map((item) => (
            <View key={item.id} style={styles.bookingItem}>
              <Text style={styles.bookingTitle}>{item.session?.mountain?.name ?? 'Gunung Pesagi'}</Text>
              <Text style={styles.bookingMeta}>{item.status} | qty {item.quantity} | Rp {item.totalPrice.toLocaleString('id-ID')}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </AppScaffold>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#f3f6f4' },
  content: { padding: 16, paddingBottom: 100, gap: 12 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f3f6f4' },
  card: { backgroundColor: '#fff', borderRadius: 18, borderWidth: 1, borderColor: '#dbe5df', padding: 16, gap: 8 },
  statsWrap: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  statCard: {
    flexGrow: 1,
    minWidth: 100,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#d8e2dc',
    backgroundColor: '#f9fcfb',
    padding: 10,
  },
  statLabel: { color: '#4f6259', fontSize: 12, fontWeight: '600' },
  statValue: { color: '#19322a', fontSize: 15, fontWeight: '800', marginTop: 4 },
  title: { color: '#12231d', fontSize: 24, fontWeight: '900' },
  subtitle: { color: '#4f6259', fontSize: 15, lineHeight: 24 },
  profileLine: { color: '#355247', fontSize: 14 },
  logoutBtn: { marginTop: 8, borderRadius: 10, borderWidth: 1, borderColor: '#d7e2dc', paddingVertical: 10, alignItems: 'center' },
  loginBtn: { marginTop: 8, borderRadius: 10, backgroundColor: '#135efd', paddingVertical: 12, alignItems: 'center' },
  loginBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  logoutText: { color: '#123628', fontWeight: '700' },
  sectionTitle: { color: '#12231d', fontSize: 19, fontWeight: '800' },
  menuItem: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e1eae5',
    backgroundColor: '#fbfdfc',
    paddingVertical: 11,
    paddingHorizontal: 12,
  },
  menuText: { color: '#1b3027', fontWeight: '700', fontSize: 14 },
  error: { color: '#c53030', fontSize: 13, fontWeight: '600' },
  empty: { color: '#556b61', fontSize: 14 },
  bookingItem: { borderRadius: 12, borderWidth: 1, borderColor: '#e1eae5', padding: 12, backgroundColor: '#fbfdfc' },
  bookingTitle: { color: '#1b3027', fontWeight: '800', fontSize: 15 },
  bookingMeta: { color: '#4f6259', fontSize: 13, marginTop: 4 },
});
