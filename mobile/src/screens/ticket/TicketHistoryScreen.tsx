import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { fetchMyBookings } from '../../api/client';
import { useAuthContext } from '../../context/AuthContext';
import AppScaffold from '../common/AppScaffold';

type TicketTab = 'ALL' | 'PAID' | 'PENDING_PAYMENT' | 'CANCELLED';

type LiteBooking = {
  id: string;
  status: 'PAID' | 'PENDING_PAYMENT' | 'CANCELLED';
  quantity: number;
  totalPrice: number;
  session?: { mountain?: { name?: string }; date?: string };
};

const tabs: { id: TicketTab; label: string }[] = [
  { id: 'ALL', label: 'Semua' },
  { id: 'PAID', label: 'Aktif' },
  { id: 'PENDING_PAYMENT', label: 'Belum Bayar' },
  { id: 'CANCELLED', label: 'Dibatalkan' },
];

const fallbackBookings: LiteBooking[] = [
  {
    id: 'booking-dummy-paid',
    status: 'PAID',
    quantity: 3,
    totalPrice: 225000,
    session: { mountain: { name: 'Gunung Pesagi' }, date: '2026-06-15T06:00:00+07:00' },
  },
  {
    id: 'booking-dummy-pending',
    status: 'PENDING_PAYMENT',
    quantity: 2,
    totalPrice: 150000,
    session: { mountain: { name: 'Gunung Pesagi' }, date: '2026-06-22T07:00:00+07:00' },
  },
  {
    id: 'booking-dummy-cancelled',
    status: 'CANCELLED',
    quantity: 1,
    totalPrice: 75000,
    session: { mountain: { name: 'Gunung Pesagi' }, date: '2026-05-30T06:00:00+07:00' },
  },
];

export default function TicketHistoryScreen() {
  const navigation = useNavigation<any>();
  const { session } = useAuthContext();
  const [tab, setTab] = useState<TicketTab>('ALL');
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<LiteBooking[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!session?.accessToken) {
        setBookings(fallbackBookings);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await fetchMyBookings(session.accessToken);
        const nextBookings = data as LiteBooking[];
        setBookings(nextBookings.length > 0 ? nextBookings : fallbackBookings);
      } catch (err) {
        setBookings(fallbackBookings);
        setError(err instanceof Error ? err.message : 'Gagal memuat tiket');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [session?.accessToken]);

  const filtered = useMemo(() => {
    if (tab === 'ALL') {
      return bookings;
    }
    return bookings.filter((item) => item.status === tab);
  }, [bookings, tab]);

  return (
    <AppScaffold title="Tiket Saya">
      <ScrollView style={styles.page} contentContainerStyle={styles.content}>
        {!session?.accessToken ? <Text style={styles.note}>Menampilkan data dummy tiket. Login untuk melihat tiket asli.</Text> : null}
        <View style={styles.tabRow}>
          {tabs.map((item) => (
            <Pressable key={item.id} style={[styles.tabBtn, tab === item.id && styles.tabBtnActive]} onPress={() => setTab(item.id)}>
              <Text style={[styles.tabText, tab === item.id && styles.tabTextActive]}>{item.label}</Text>
            </Pressable>
          ))}
        </View>
        {loading ? <ActivityIndicator color="#2563eb" /> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {filtered.map((item) => (
          <View key={item.id} style={styles.ticketCard}>
            <Text style={styles.badge}>{item.status.replace('_', ' ')}</Text>
            <View style={styles.mainRow}>
              <View style={styles.leftCol}>
                <Text style={styles.mountain}>{item.session?.mountain?.name ?? 'Gunung Pesagi'}</Text>
                <Text style={styles.meta}>Jalur: Papahan</Text>
                <Text style={styles.meta}>{new Date(item.session?.date ?? '').toLocaleDateString('id-ID')}</Text>
                <Text style={styles.meta}>{item.quantity} pendaki</Text>
                <Text style={styles.price}>Rp {item.totalPrice.toLocaleString('id-ID')}</Text>
              </View>
              <View style={styles.qrMock}>
                <View style={styles.qrDot} />
              </View>
            </View>
            <Pressable style={styles.btn} onPress={() => navigation.navigate('Ticket', { ticketId: item.id })}>
              <Text style={styles.btnText}>Lihat Detail Tiket</Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </AppScaffold>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#f2f6fb' },
  content: { padding: 16, paddingBottom: 110, gap: 10 },
  note: { color: '#64748b', fontSize: 14 },
  tabRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  tabBtn: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, backgroundColor: '#e2e8f0' },
  tabBtnActive: { backgroundColor: '#2563eb' },
  tabText: { color: '#334155', fontWeight: '700', fontSize: 12 },
  tabTextActive: { color: '#fff' },
  ticketCard: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#dce4ef', padding: 12 },
  mainRow: { flexDirection: 'row', gap: 10, alignItems: 'center', marginTop: 8 },
  leftCol: { flex: 1 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, backgroundColor: '#dcfce7', color: '#166534', fontSize: 11, fontWeight: '800' },
  mountain: { color: '#0f172a', fontSize: 16, fontWeight: '800' },
  meta: { color: '#475569', marginTop: 3, fontSize: 13 },
  price: { color: '#0f172a', marginTop: 8, fontWeight: '900', fontSize: 16 },
  qrMock: { width: 78, height: 78, borderWidth: 6, borderColor: '#0f172a', alignItems: 'center', justifyContent: 'center' },
  qrDot: { width: 26, height: 26, backgroundColor: '#0f172a' },
  btn: { marginTop: 10, borderRadius: 10, borderWidth: 1, borderColor: '#135efd', paddingVertical: 10, alignItems: 'center' },
  btnText: { color: '#135efd', fontWeight: '700' },
  error: { color: '#b91c1c', fontSize: 13, fontWeight: '600' },
});
