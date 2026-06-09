import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import AppScaffold from './common/AppScaffold';

const guides = [
  { title: 'Persiapan Sebelum Mendaki', desc: 'Peralatan dan fisik yang disarankan.' },
  { title: 'Selama Pendakian', desc: 'Tips aman, ritme jalan, dan manajemen air.' },
  { title: 'Etika Pendakian', desc: 'Jaga alam, hormati sesama pendaki.' },
  { title: 'Keadaan Darurat', desc: 'Langkah saat cuaca buruk atau cedera.' },
];

export default function PanduanScreen() {
  return (
    <AppScaffold title="Panduan">
      <ScrollView style={styles.page} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Panduan Pendakian</Text>
        {guides.map((item) => (
          <View key={item.title} style={styles.item}>
            <View style={styles.itemHead}>
              <View style={styles.iconWrap}>
                <FontAwesome name="bookmark-o" size={14} color="#135efd" />
              </View>
              <View style={styles.itemText}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemDesc}>{item.desc}</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </AppScaffold>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#f3f5f8' },
  content: { padding: 16, paddingBottom: 110, gap: 10 },
  title: { color: '#0f172a', fontSize: 26, fontWeight: '900' },
  item: { borderRadius: 12, borderWidth: 1, borderColor: '#dbe4ef', backgroundColor: '#fff', padding: 12 },
  itemHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconWrap: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#e8f7ee', alignItems: 'center', justifyContent: 'center' },
  itemText: { flex: 1 },
  itemTitle: { color: '#0f172a', fontSize: 14, fontWeight: '800' },
  itemDesc: { color: '#64748b', fontSize: 12, marginTop: 3, lineHeight: 17 },
});
