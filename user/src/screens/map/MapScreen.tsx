import { useEffect, useMemo, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Announcement, fetchAnnouncements, fetchMountains } from '../../api/client';
import AppScaffold from '../common/AppScaffold';

// Struktur data lokasi atau titik penting pada peta
type MapSpot = {
  id: string;
  title: string;
  subtitle: string;
  mapUrl: string;
};
// Data lokasi cadangan yang digunakan jika data peta tidak tersedia
const fallbackSpot: MapSpot = {
  id: 'pesagi-main',
  title: 'Gunung Pesagi via Papahan',
  subtitle: 'Titik utama pendakian',
  mapUrl: 'https://www.google.com/maps/search/?api=1&query=-5.0426,104.1213',
};

// Inisialisasi data lokasi yang akan ditampilkan pada halaman peta
export default function MapScreen() {
  const [spots, setSpots] = useState<MapSpot[]>([fallbackSpot]);

  // Memuat data peta dari CMS dan data gunung, lalu menggabungkannya menjadi daftar lokasi
  useEffect(() => {
    const loadMapData = async () => {
      try {
        const [mountains, announcements] = await Promise.all([fetchMountains(), fetchAnnouncements()]);
        // Mengambil data spot dari CMS (hanya yang memiliki mapUrl)
        const cmsSpots = (announcements as Announcement[])
          .filter((item) => !!item.mapUrl)
          .map((item) => ({
            id: item.id,
            title: item.title,
            subtitle: item.content,
            mapUrl: item.mapUrl as string,
          }));

        // Mengubah data gunung menjadi format MapSpot
        const mountainSpots = mountains.map((m) => ({
          id: m.id,
          title: m.name,
          subtitle: m.location,
          mapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(m.location)}`,
        }));

        // Menggabungkan semua data spot
        const merged = [...cmsSpots, ...mountainSpots];
        setSpots(merged.length > 0 ? merged : [fallbackSpot]);
      } catch {
        // Jika gagal, gunakan data fallback
        setSpots([fallbackSpot]);
      }
    };

    void loadMapData();
  }, []);

  // Menentukan spot utama (featured) dari daftar lokasi peta
  const featured = useMemo(() => spots[0] ?? fallbackSpot, [spots]);

  const openMap = (mapUrl: string) => {
    Linking.openURL(mapUrl).catch(() => undefined);
  };

  return (
    <AppScaffold title="Bantuan">
      <ScrollView style={styles.page} contentContainerStyle={styles.content}>
        <View style={styles.helpCard}>
          <Text style={styles.helpTitle}>Bantuan & Kontak</Text>
          <Text style={styles.helpText}>Admin siap membantu pertanyaan jalur, cuaca, dan proses booking.</Text>
        </View>
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>{featured.title}</Text>
          <Text style={styles.heroSubtitle}>{featured.subtitle}</Text>
          <Pressable style={styles.primaryButton} onPress={() => openMap(featured.mapUrl)}>
            <Text style={styles.primaryButtonText}>Buka Lokasi Utama</Text>
          </Pressable>
        </View>

        <View style={styles.listCard}>
          <Text style={styles.sectionTitle}>Titik Peta dari CMS</Text>
          {spots.map((spot) => (
            <View key={spot.id} style={styles.itemRow}>
              <View style={styles.itemTextWrap}>
                <Text style={styles.itemTitle}>{spot.title}</Text>
                <Text style={styles.itemSubtitle} numberOfLines={2}>
                  {spot.subtitle}
                </Text>
              </View>
              <Pressable style={styles.linkBtn} onPress={() => openMap(spot.mapUrl)}>
                <Text style={styles.linkText}>Buka</Text>
              </Pressable>
            </View>
          ))}
        </View>
      </ScrollView>
    </AppScaffold>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#e9f2f7' },
  content: { padding: 14, paddingBottom: 120, gap: 12 },
  helpCard: { borderRadius: 16, borderWidth: 1, borderColor: '#cfe0ea', backgroundColor: '#fff', padding: 12, gap: 4 },
  helpTitle: { color: '#0f172a', fontSize: 18, fontWeight: '800' },
  helpText: { color: '#475569', fontSize: 13, lineHeight: 19 },
  heroCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#c7d8e3',
    backgroundColor: '#f7fcff',
    padding: 16,
    gap: 8,
  },
  heroTitle: { color: '#0f2a44', fontSize: 25, fontWeight: '900' },
  heroSubtitle: { color: '#4a5f72', fontSize: 14, lineHeight: 22 },
  primaryButton: {
    marginTop: 6,
    borderRadius: 12,
    backgroundColor: '#135efd',
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryButtonText: { color: '#fff', fontWeight: '800' },
  listCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#cfe0ea',
    backgroundColor: '#fff',
    padding: 12,
    gap: 8,
  },
  sectionTitle: { color: '#16263f', fontSize: 18, fontWeight: '800' },
  itemRow: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e3ebf2',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  itemTextWrap: { flex: 1 },
  itemTitle: { color: '#172a46', fontWeight: '800', fontSize: 14 },
  itemSubtitle: { color: '#5a6b7e', fontSize: 12, marginTop: 3, lineHeight: 18 },
  linkBtn: { borderRadius: 10, backgroundColor: '#0ea5e9', paddingVertical: 8, paddingHorizontal: 12 },
  linkText: { color: '#fff', fontWeight: '700', fontSize: 12 },
});
