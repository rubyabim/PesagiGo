import { useCallback, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import { Announcement, fetchAnnouncements, fetchNews, fetchRules, NewsItem, RuleItem } from '../api/client';
import AppScaffold from './common/AppScaffold';
import Skeleton from './common/Skeleton';

// Tipe kategori tab yang tersedia pada halaman promosi
type PromoTab = 'pengumuman' | 'aturan' | 'fasilitas';

// Struktur data untuk kartu promosi yang ditampilkan
type PromoCard = {
  id: string;
  title: string;
  description: string;
  imageUrl?: string | null;
};

// Kartu promosi yang ditampilkan jika data belum tersedia
const fallbackPromo: PromoCard[] = [
  {
    id: 'promo-fallback-1',
    title: 'Fasilitas Basecamp Papahan',
    description: 'Tersedia area registrasi, toilet, titik kumpul rombongan, dan tempat pengecekan perlengkapan sebelum pendakian.',
  },
  {
    id: 'promo-fallback-2',
    title: 'Paket Parkir dan Penitipan',
    description: 'Pendaki bisa menitipkan kendaraan di area basecamp resmi selama periode pendakian berlangsung.',
  },
  {
    id: 'promo-fallback-3',
    title: 'Ruang Istirahat dan Makanan Ringan',
    description: 'Basecamp menyediakan ruang istirahat dengan minuman ringan dan camilan untuk persiapan sebelum pendakian.',
  },
  {
    id: 'promo-fallback-4',
    title: 'Layanan Informasi 24 Jam',
    description: 'Tim basecamp siap membantu informasi jalur, kondisi cuaca, dan jadwal pendakian kapan saja.',
  },
];

// Kartu informasi yang ditampilkan jika data belum tersedia
const fallbackInfo: PromoCard[] = [
  {
    id: 'info-fallback-1',
    title: 'Jalur Pendakian Dibuka Normal',
    description: 'Jalur via Papahan dapat dilalui dengan estimasi 4-6 jam. Tetap ikuti arahan petugas basecamp dan jangan keluar dari jalur resmi.',
  },
  {
    id: 'info-fallback-2',
    title: 'Wajib Check-in di Basecamp',
    description: 'Pendaki wajib menunjukkan tiket, identitas, dan daftar anggota rombongan sebelum memulai pendakian.',
  },
  {
    id: 'info-fallback-3',
    title: 'Perhatikan Cuaca Sore Hari',
    description: 'Potensi hujan ringan sering muncul menjelang sore. Siapkan jas hujan, pelindung tas, dan lampu kepala.',
  },
  {
    id: 'info-fallback-4',
    title: 'Pemberitahuan Arus Pendaki',
    description: 'Periksakan status arus pendakian pagi ini sebelum berangkat untuk menghindari kemacetan di jalur utama.',
  },
  {
    id: 'info-fallback-5',
    title: 'Pembaruan Status Basecamp',
    description: 'Pantau ketersediaan tempat istirahat dan fasilitas pendukung di basecamp sebelum tiba di lokasi.',
  },
];

// Kartu aturan yang ditampilkan jika data belum tersedia
const fallbackRules: PromoCard[] = [
  {
    id: 'rules-fallback-1',
    title: 'Aturan Dasar Pendakian',
    description: 'Ikuti jalur resmi, patuhi petunjuk ranger, dan jaga keamanan bersama selama pendakian.',
  },
  {
    id: 'rules-fallback-2',
    title: 'Jaga Kebersihan',
    description: 'Selalu bawa pulang sampah pribadi dan jangan tinggalkan jejak di alam.',
  },
  {
    id: 'rules-fallback-3',
    title: 'Jangan Merusak Alam',
    description: 'Lindungi alam dengan tidak memetik tumbuhan, merusak batu, atau menyentuh satwa liar.',
  },
  {
    id: 'rules-fallback-4',
    title: 'Etika Sesama Pendaki',
    description: 'Hormati jarak dan privasi, bantu pendaki lain yang membutuhkan, serta tetap sopan dan tenang di jalur.',
  },
  {
    id: 'rules-fallback-5',
    title: 'Keselamatan',
    description: 'Pastikan perlengkapan lengkap, koordinasi dengan tim, dan hindari area berbahaya saat mendaki.',
  },
  {
    id: 'rules-fallback-6',
    title: 'Larangan Api Unggun',
    description: 'Dilarang menyalakan api di luar area yang ditetapkan untuk mencegah kebakaran hutan.',
  },
  {
    id: 'rules-fallback-7',
    title: 'Volume Suara',
    description: 'Jaga kebisingan agar tidak mengganggu satwa dan pendaki lain di jalur.',
  },
];

// Mengonversi data berita menjadi format kartu promosi
function mapPromo(news: NewsItem[]): PromoCard[] {
  return news.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    imageUrl: item.imageUrl,
  }));
}

// Mengonversi data pengumuman menjadi format kartu promosi
function mapInformation(announcements: Announcement[]): PromoCard[] {
  return announcements.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.content,
    imageUrl: item.imageUrl,
  }));
}

// Mengonversi data aturan pendakian menjadi format kartu promosi
function mapRules(rules: RuleItem[]): PromoCard[] {
  return rules.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    imageUrl: item.imageUrl,
  }));
}

// Inisialisasi state dan data yang digunakan pada halaman informasi lokasi
export default function LocationsScreen() {
  const navigation = useNavigation<any>();
  const [tab, setTab] = useState<PromoTab>('pengumuman');
  const [promoItems, setPromoItems] = useState<PromoCard[]>(fallbackPromo);
  const [informationItems, setInformationItems] = useState<PromoCard[]>(fallbackInfo);
  const [ruleItems, setRuleItems] = useState<PromoCard[]>(fallbackRules);
  const [loading, setLoading] = useState(true);

  // Memuat dan menyinkronkan data CMS saat halaman mendapatkan fokus
  useFocusEffect(
    useCallback(() => {
    const syncCms = async () => {
      try {
        const [news, announcements, rules] = await Promise.all([fetchNews(), fetchAnnouncements(), fetchRules()]);
        const promo = mapPromo(news);
        const info = mapInformation(announcements);
        const ruleList = mapRules(rules);
        setPromoItems(promo.length > 0 ? promo : fallbackPromo);
        setInformationItems(info.length > 0 ? info : fallbackInfo);
        setRuleItems(ruleList.length > 0 ? ruleList : fallbackRules);
      } catch {
        setPromoItems(fallbackPromo);
        setInformationItems(fallbackInfo);
        setRuleItems(fallbackRules);
      } finally {
        setLoading(false);
      }
    };
    void syncCms();
      return undefined;
    }, []),
  );

  // Menentukan data yang ditampilkan berdasarkan tab yang sedang aktif
  const activeItems = useMemo(() => {
    if (tab === 'pengumuman') {
      return informationItems;
    }
    if (tab === 'aturan') {
      return ruleItems;
    }
    return promoItems;
  }, [informationItems, promoItems, ruleItems, tab]);

  return (
    <AppScaffold title="Informasi">
      <View style={styles.page}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerText}>
            <Text style={styles.title}>Informasi</Text>
            <Text style={styles.subtitle}>Informasi resmi pendakian Gunung Pesagi</Text>
          </View>
          <Pressable style={styles.infoButton} onPress={() => navigation.getParent()?.navigate('MountainDetail' as never)}>
            <FontAwesome name="info-circle" size={18} color="#135efd" />
          </Pressable>
        </View>
      </View>

      <View style={styles.tabBar}>
        <Pressable style={styles.tabButton} onPress={() => setTab('pengumuman')}>
          <Text style={[styles.tabText, tab === 'pengumuman' && styles.tabTextActive]}>Pengumuman</Text>
          {tab === 'pengumuman' ? <View style={styles.activeLine} /> : null}
        </Pressable>
        <Pressable style={styles.tabButton} onPress={() => setTab('aturan')}>
          <Text style={[styles.tabText, tab === 'aturan' && styles.tabTextActive]}>Aturan</Text>
          {tab === 'aturan' ? <View style={styles.activeLine} /> : null}
        </Pressable>
        <Pressable style={styles.tabButton} onPress={() => setTab('fasilitas')}>
          <Text style={[styles.tabText, tab === 'fasilitas' && styles.tabTextActive]}>Fasilitas</Text>
          {tab === 'fasilitas' ? <View style={styles.activeLine} /> : null}
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.listContent}>
        {loading ? (
          <>
            <View style={styles.card}><Skeleton height={134} radius={0} /><View style={{ padding: 12, gap: 8 }}><Skeleton height={16} /><Skeleton height={14} /></View></View>
            <View style={styles.card}><Skeleton height={134} radius={0} /><View style={{ padding: 12, gap: 8 }}><Skeleton height={16} /><Skeleton height={14} /></View></View>
          </>
        ) : null}
        {!loading
          ? activeItems.map((item) => (
          <View key={item.id} style={styles.card}>
            {item.imageUrl ? (
              <Image source={{ uri: item.imageUrl }} style={styles.cardImage} resizeMode="cover" />
            ) : (
              <View style={styles.cardFallback}>
                <Text style={styles.cardFallbackText}>PesagiGo</Text>
              </View>
            )}
            <Text style={styles.cardTitle}>{item.title.toUpperCase()}</Text>
            <Text numberOfLines={3} style={styles.cardDesc}>
              {item.description}
            </Text>
          </View>
            ))
          : null}
      </ScrollView>
      </View>
    </AppScaffold>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#f3f5f8' },
  header: { paddingHorizontal: 14, paddingTop: 14, paddingBottom: 8 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  headerText: { flex: 1 },
  title: { color: '#0f172a', fontSize: 28, fontWeight: '900' },
  subtitle: { color: '#64748b', fontSize: 13, marginTop: 2 },
  infoButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#e8f7ee', alignItems: 'center', justifyContent: 'center' },
  tabBar: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    paddingHorizontal: 12,
  },
  tabButton: { flex: 1, alignItems: 'center', paddingTop: 10, paddingBottom: 8 },
  tabText: { color: '#64748b', fontSize: 14, fontWeight: '700' },
  tabTextActive: { color: '#135efd' },
  activeLine: { marginTop: 8, height: 2, borderRadius: 2, width: '100%', backgroundColor: '#135efd' },
  listContent: { padding: 12, gap: 10, paddingBottom: 120 },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dbe4ef',
    backgroundColor: '#ffffff',
    overflow: 'hidden',
  },
  cardImage: { width: '100%', height: 134 },
  cardFallback: {
    height: 134,
    backgroundColor: '#dae6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardFallbackText: { color: '#30508a', fontSize: 22, fontWeight: '900' },
  cardTitle: { color: '#0f172a', fontSize: 16, fontWeight: '700', lineHeight: 23, paddingHorizontal: 12, paddingTop: 10 },
  cardDesc: { color: '#64748b', fontSize: 12, lineHeight: 18, paddingHorizontal: 12, paddingTop: 4, paddingBottom: 10 },
});
