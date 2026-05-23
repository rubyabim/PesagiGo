import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import AppScaffold from '../common/AppScaffold';

export default function MountainDetailScreen({ navigation }: { navigation: any }) {
  const schedules = ['Sabtu, 24 Mei 2026', 'Minggu, 25 Mei 2026', 'Sabtu, 31 Mei 2026'];

  return (
    <AppScaffold title="Detail Gunung" variant="plain" onBackPress={() => navigation.goBack()}>
      <ScrollView style={styles.page} contentContainerStyle={styles.content}>
        <Image source={require('../../pesagi.jpg')} style={styles.heroImage} />
        <View style={styles.card}>
          <Text style={styles.title}>Gunung Pesagi via Papahan</Text>
          <Text style={styles.desc}>Gunung Pesagi adalah gunung berapi tidak aktif dengan pemandangan alam indah dan jalur pendakian menantang.</Text>
          <View style={styles.grid}>
            <Text style={styles.meta}>Ketinggian: 2.262 mdpl</Text>
            <Text style={styles.meta}>Kesulitan: Sedang</Text>
            <Text style={styles.meta}>Jalur: Papahan</Text>
            <Text style={styles.meta}>Estimasi: 6-8 jam</Text>
            <Text style={styles.meta}>Fasilitas: Parkir, Toilet, Mushola</Text>
          </View>
        </View>
        <View style={styles.card}>
          <Text style={styles.section}>Jadwal Pendakian</Text>
          {schedules.map((item) => (
            <View key={item} style={styles.row}>
              <Text style={styles.rowText}>{item}</Text>
              <Text style={styles.ok}>Tersedia</Text>
            </View>
          ))}
          <Pressable style={styles.button} onPress={() => navigation.navigate('SelectDate')}>
            <Text style={styles.buttonText}>Pesan Sekarang</Text>
          </Pressable>
        </View>
      </ScrollView>
    </AppScaffold>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F3F5F8' },
  content: { padding: 14, paddingBottom: 110, gap: 10 },
  heroImage: { width: '100%', height: 176, borderRadius: 12 },
  card: { borderRadius: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: '#DFE5EE', padding: 12, gap: 8 },
  title: { color: '#0F172A', fontSize: 20, fontWeight: '900' },
  desc: { color: '#64748B', fontSize: 12, lineHeight: 18 },
  grid: { gap: 4 },
  meta: { color: '#0F172A', fontSize: 12, fontWeight: '600' },
  section: { color: '#0F172A', fontSize: 16, fontWeight: '800' },
  row: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#EDF2F7', paddingVertical: 8 },
  rowText: { color: '#334155', fontSize: 12 },
  ok: { color: '#15803D', fontWeight: '700', fontSize: 12 },
  button: { marginTop: 8, borderRadius: 10, backgroundColor: '#135efd', alignItems: 'center', paddingVertical: 12 },
  buttonText: { color: '#fff', fontWeight: '800' },
});
