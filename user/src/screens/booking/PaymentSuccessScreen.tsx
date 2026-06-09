import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import AppScaffold from '../common/AppScaffold';

export default function PaymentSuccessScreen({ route, navigation }: { route: any; navigation: any }) {
  const bookingId = route.params?.bookingId ?? 'PG240526-0012';
  return (
    <AppScaffold title="Pembayaran Berhasil">
      <ScrollView style={styles.page} contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <View style={styles.check}>
            <Text style={styles.checkText}>✓</Text>
          </View>
          <Text style={styles.title}>Pembayaran Berhasil!</Text>
          <Text style={styles.desc}>Tiket pendakian kamu telah dikonfirmasi.</Text>
          <View style={styles.codeBox}>
            <Text style={styles.codeLabel}>Kode Booking</Text>
            <Text style={styles.code}>{bookingId}</Text>
          </View>
          <Pressable style={styles.primaryBtn} onPress={() => navigation.navigate('Ticket', { ticketId: route.params?.ticketId })}>
            <Text style={styles.primaryText}>Lihat Tiket</Text>
          </Pressable>
          <Pressable style={styles.secondaryBtn} onPress={() => navigation.navigate('MainTabs')}>
            <Text style={styles.secondaryText}>Kembali ke Beranda</Text>
          </Pressable>
        </View>
      </ScrollView>
    </AppScaffold>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F3F5F8' },
  content: { padding: 16, paddingBottom: 110 },
  card: { borderRadius: 12, borderWidth: 1, borderColor: '#DFE5EE', backgroundColor: '#fff', padding: 16, alignItems: 'center' },
  check: { width: 84, height: 84, borderRadius: 42, backgroundColor: '#135efd', alignItems: 'center', justifyContent: 'center' },
  checkText: { color: '#fff', fontSize: 42, fontWeight: '900' },
  title: { marginTop: 14, color: '#0F172A', fontSize: 24, fontWeight: '900' },
  desc: { marginTop: 6, color: '#64748B', fontSize: 13, textAlign: 'center' },
  codeBox: { marginTop: 16, width: '100%', borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', padding: 12, alignItems: 'center' },
  codeLabel: { color: '#64748B', fontSize: 12 },
  code: { color: '#0F172A', fontSize: 26, fontWeight: '900', marginTop: 4 },
  primaryBtn: { marginTop: 14, width: '100%', borderRadius: 10, backgroundColor: '#135efd', paddingVertical: 12, alignItems: 'center' },
  primaryText: { color: '#fff', fontWeight: '800' },
  secondaryBtn: { marginTop: 10, width: '100%', borderRadius: 10, borderWidth: 1, borderColor: '#CBD5E1', paddingVertical: 12, alignItems: 'center' },
  secondaryText: { color: '#1E293B', fontWeight: '700' },
});
