import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';
import AppScaffold from '../common/AppScaffold';

const sessions = [
  { id: 'pagi', title: 'Sesi Pagi', time: '06.00 - 09.00 WIB', quota: '20/30' },
  { id: 'siang', title: 'Sesi Siang', time: '10.00 - 13.00 WIB', quota: '10/30' },
  { id: 'sore', title: 'Sesi Sore', time: '14.00 - 17.00 WIB', quota: '5/30' },
];

export default function SelectSessionScreen({ navigation }: { navigation: any }) {
  const [selected, setSelected] = useState('pagi');
  return (
    <AppScaffold title="Pilih Sesi" variant="plain" onBackPress={() => navigation.goBack()}>
      <ScrollView style={styles.page} contentContainerStyle={styles.content}>
        <Text style={styles.sub}>Pilih sesi pendakian</Text>
        {sessions.map((item) => {
          const active = item.id === selected;
          return (
            <Pressable key={item.id} style={[styles.card, active && styles.cardActive]} onPress={() => setSelected(item.id)}>
              <View>
                <Text style={[styles.title, active && styles.activeText]}>{item.title}</Text>
                <Text style={[styles.meta, active && styles.activeText]}>{item.time}</Text>
                <Text style={[styles.meta, active && styles.activeText]}>Kuota: {item.quota}</Text>
              </View>
              <View style={[styles.radio, active && styles.radioActive]} />
            </Pressable>
          );
        })}
        <Pressable style={styles.button} onPress={() => navigation.navigate('Booking')}>
          <Text style={styles.buttonText}>Lanjutkan</Text>
        </Pressable>
      </ScrollView>
    </AppScaffold>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F3F5F8' },
  content: { padding: 14, paddingBottom: 110, gap: 10 },
  sub: { color: '#64748B', textAlign: 'center', fontSize: 13, marginBottom: 4 },
  card: { borderRadius: 12, borderWidth: 1, borderColor: '#DFE5EE', backgroundColor: '#fff', padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardActive: { borderColor: '#135efd', backgroundColor: '#EAF1FF' },
  title: { color: '#0F172A', fontSize: 16, fontWeight: '800' },
  meta: { color: '#64748B', fontSize: 12, marginTop: 2 },
  activeText: { color: '#14532D' },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#CBD5E1' },
  radioActive: { backgroundColor: '#135efd', borderColor: '#135efd' },
  button: { marginTop: 10, borderRadius: 10, backgroundColor: '#135efd', paddingVertical: 12, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '800' },
});
