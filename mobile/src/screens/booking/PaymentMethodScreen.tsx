import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { payBooking } from '../../api/client';
import { useAuthContext } from '../../context/AuthContext';
import AppScaffold from '../common/AppScaffold';

// Daftar metode pembayaran yang tersedia
const methods = [
  { id: 'BRI', label: 'Bank BRI' },
  { id: 'BCA', label: 'Bank BCA' },
  { id: 'BNI', label: 'Bank BNI' },
  { id: 'MANDIRI', label: 'Bank Mandiri' },
  { id: 'OVO', label: 'OVO' },
  { id: 'DANA', label: 'DANA' },
  { id: 'GOPAY', label: 'GoPay' },
  { id: 'SHOPEEPAY', label: 'ShopeePay' },
];

// Halaman pemilihan metode pembayaran untuk booking
export default function PaymentMethodScreen({ route, navigation }: { route: any; navigation: any }) {
  const { session } = useAuthContext();
  // State metode pembayaran yang dipilih (default: metode pertama)
  const [selected, setSelected] = useState(methods[0].id);
  // State loading saat proses pembayaran
  const [busy, setBusy] = useState(false);
  // State untuk menampilkan pesan error
  const [error, setError] = useState<string | null>(null);
  // ID booking yang dikirim dari halaman sebelumnya
  const bookingId = route.params?.bookingId as string | undefined;

  // Proses pembayaran booking berdasarkan metode yang dipilih
  const onPay = async () => {
    // Validasi akses token dan bookingId
    if (!session?.accessToken || !bookingId) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const result = await payBooking(session.accessToken, bookingId, { method: selected });
      navigation.replace('PaymentSuccess', {
        bookingId: result.booking.id,
        ticketId: result.booking.id,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Pembayaran gagal');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppScaffold title="Metode Pembayaran">
      <ScrollView style={styles.page} contentContainerStyle={styles.content}>
        <View style={styles.card}>
          {methods.map((item) => {
            const active = item.id === selected;
            return (
              <Pressable key={item.id} style={styles.row} onPress={() => setSelected(item.id)}>
                <Text style={styles.label}>{item.label}</Text>
                <View style={[styles.radio, active && styles.radioActive]} />
              </Pressable>
            );
          })}
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Pressable style={styles.button} onPress={onPay} disabled={busy}>
            {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Bayar Sekarang</Text>}
          </Pressable>
        </View>
      </ScrollView>
    </AppScaffold>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F3F5F8' },
  content: { padding: 16, paddingBottom: 110 },
  card: { borderRadius: 12, borderWidth: 1, borderColor: '#DFE5EE', backgroundColor: '#fff', padding: 12, gap: 6 },
  row: { borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#fff', paddingVertical: 11, paddingHorizontal: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { color: '#0F172A', fontWeight: '700', fontSize: 13 },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: '#CBD5E1' },
  radioActive: { backgroundColor: '#135efd', borderColor: '#135efd' },
  button: { marginTop: 10, borderRadius: 10, backgroundColor: '#135efd', paddingVertical: 12, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '800' },
  error: { color: '#DC2626', fontSize: 12, fontWeight: '700', marginTop: 4 },
});
