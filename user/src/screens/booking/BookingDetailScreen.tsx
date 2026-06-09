import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { fetchBookingDetail, fetchMyBookings } from '../../api/client';
import { useAuthContext } from '../../context/AuthContext';
import AppScaffold from '../common/AppScaffold';

type LiteBooking = {
  id: string;
  status: string;
  quantity: number;
  totalPrice: number;
  session?: { mountain?: { name?: string }; date?: string };
};

export default function BookingDetailScreen({ route, navigation }: { route: any; navigation: any }) {
  const { session } = useAuthContext();
  const [booking, setBooking] = useState<LiteBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const bookingId = route.params?.bookingId as string | undefined;

  useEffect(() => {
    const load = async () => {
      if (!session?.accessToken) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        if (bookingId) {
          setBooking((await fetchBookingDetail(session.accessToken, bookingId)) as LiteBooking);
        } else {
          const list = await fetchMyBookings(session.accessToken);
          setBooking((list[0] as LiteBooking) ?? null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal memuat ringkasan');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [bookingId, session?.accessToken]);

  const formattedDate = useMemo(() => {
    if (!booking?.session?.date) {
      return '-';
    }
    return new Date(booking.session.date).toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }, [booking?.session?.date]);

  return (
    <AppScaffold title="Ringkasan Pesanan">
      <ScrollView style={styles.page} contentContainerStyle={styles.content}>
        {loading ? <ActivityIndicator color="#135efd" /> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {booking ? (
          <View style={styles.card}>
            <Text style={styles.title}>Gunung Pesagi via Papahan</Text>
            <View style={styles.row}><Text style={styles.key}>Tanggal Pendakian</Text><Text style={styles.value}>{formattedDate}</Text></View>
            <View style={styles.row}><Text style={styles.key}>Sesi Pendakian</Text><Text style={styles.value}>Sesi Pagi</Text></View>
            <View style={styles.row}><Text style={styles.key}>Jalur Pendakian</Text><Text style={styles.value}>Papahan</Text></View>
            <View style={styles.row}><Text style={styles.key}>Jumlah Pendaki</Text><Text style={styles.value}>{booking.quantity} orang</Text></View>
            <View style={styles.row}><Text style={styles.key}>Total Pembayaran</Text><Text style={styles.price}>Rp {booking.totalPrice.toLocaleString('id-ID')}</Text></View>
          </View>
        ) : null}
        {booking ? (
          <Pressable style={styles.button} onPress={() => navigation.navigate('PaymentMethod', { bookingId: booking.id })}>
            <Text style={styles.buttonText}>Lanjutkan ke Pembayaran</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </AppScaffold>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F3F5F8' },
  content: { padding: 16, paddingBottom: 110, gap: 12 },
  card: { borderRadius: 12, borderWidth: 1, borderColor: '#DFE5EE', backgroundColor: '#fff', padding: 14, gap: 8 },
  title: { color: '#0F172A', fontSize: 20, fontWeight: '900' },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  key: { color: '#64748B', fontSize: 12 },
  value: { color: '#0F172A', fontSize: 12, fontWeight: '700' },
  price: { color: '#0F172A', fontSize: 18, fontWeight: '900' },
  button: { borderRadius: 10, backgroundColor: '#135efd', paddingVertical: 12, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '800' },
  error: { color: '#DC2626', fontSize: 12, fontWeight: '700' },
});
