import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Image, ImageBackground, Linking, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { fetchAnnouncements, fetchBmkgForecast, fetchMountains, fetchMyBookings, fetchNews } from '../../api/client';
import type { BmkgForecastItem, BmkgForecastResponse, NewsItem } from '../../api/client';
import AppScaffold from '../common/AppScaffold';
import Skeleton from '../common/Skeleton';
import { useAuthContext } from '../../context/AuthContext';

// Mengubah kondisi cuaca (string) menjadi nama ikon FontAwesome
const toWeatherIcon = (condition: string): keyof typeof FontAwesome.glyphMap => {
  // Ubah teks kondisi menjadi huruf kapital agar pencocokan tidak sensitif terhadap kapitalisasi
  const key = condition.toUpperCase();
  // Jika kondisi mengandung kata hujan, rain, atau storm
  // maka tampilkan ikon tetesan air
  if (key.includes('HUJAN') || key.includes('RAIN') || key.includes('STORM')) return 'tint';
  // Jika kondisi mengandung kata berawan, cloud, kabut, atau fog
  // maka tampilkan ikon awan
  if (key.includes('BERAWAN') || key.includes('CLOUD') || key.includes('KABUT') || key.includes('FOG')) return 'cloud';
  return 'sun-o';
};

const BMKG_ADM4 = '16.09.13.2008';
const CARD_GAP = 12;
const WEATHER_HORIZONTAL_INSET = 56;

// Data cadangan yang akan ditampilkan jika informasi berita atau pengumuman tidak tersedia dari sumber utama
const fallbackInfo = [
  {
    title: 'Jalur Papahan Dibuka Normal',
    body: 'Pendakian Gunung Pesagi via Papahan dibuka dengan kuota terbatas. Pendaki wajib membawa identitas dan perlengkapan hujan.',
  },
  {
    title: 'Briefing Basecamp Pukul 06.00',
    body: 'Seluruh rombongan diminta hadir 30 menit sebelum sesi pendakian untuk pengecekan tiket, logistik, dan arahan jalur.',
  },
];

// Data berita cadangan yang ditampilkan saat data dari server tidak tersedia
const fallbackNews: NewsItem[] = [
  {
    id: 'news-fallback-1',
    title: 'Jalur Papahan Dibuka Normal untuk Pendakian Pekan Ini',
    description: 'Pantau pembaruan resmi cuaca dan jalur melalui CMS PesagiGo.',
    imageUrl: 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&w=1200&q=80',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'news-fallback-2',
    title: 'Basecamp Pesagi Tambah Area Check-in Pendaki',
    description: 'Area registrasi diperluas agar proses validasi tiket lebih cepat dan tertib.',
    imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'news-fallback-3',
    title: 'Cuaca Sore Berpotensi Hujan Ringan',
    description: 'Petugas mengimbau pendaki membawa jas hujan dan pelindung tas sebelum summit.',
    imageUrl: 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=1200&q=80',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'news-fallback-4',
    title: 'Preservasi Flora Endemik di Gunung Pesagi Berjalan Sukses',
    description: 'Tim konservasi berhasil menanam 500 pohon spesies asli di area puncak.',
    imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'news-fallback-5',
    title: 'Pelatihan Pemandu Lokal Pesagi Ditingkatkan',
    description: 'Basecamp melakukan program sertifikasi pemandu untuk meningkatkan keselamatan pendaki.',
    imageUrl: 'https://images.unsplash.com/photo-1552519507-da3effeff00c?auto=format&fit=crop&w=1200&q=80',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'news-fallback-6',
    title: 'Jalur Alternatif Pesagi Segera Dibuka Akhir Bulan',
    description: 'Jalur baru menawarkan pengalaman berbeda dengan pemandangan yang spektakuler.',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80',
    createdAt: new Date().toISOString(),
  },
];

// Mengubah string tanggal/waktu menjadi objek Date dengan penyesuaian format dan zona waktu
const parseLocalDateTime = (value?: string) => {
  if (!value) return null;
  const normalized = value.includes('T') ? value : value.replace(' ', 'T');
  const withTimezone = /([+-]\d{2}:\d{2}|Z)$/.test(normalized) ? normalized : `${normalized}+07:00`;
  const date = new Date(withTimezone);
  return Number.isNaN(date.getTime()) ? null : date;
};

// Memformat tanggal BMKG menjadi format singkat yang mudah dibaca
const formatBmkgShort = (value?: string) => {
  const date = parseLocalDateTime(value);
  if (!date) return value ?? '-';
  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Menggabungkan seluruh data prakiraan cuaca BMKG menjadi satu array
const flattenBmkgForecast = (response: BmkgForecastResponse | null): BmkgForecastItem[] => {
  const blocks = response?.data?.[0]?.cuaca ?? [];
  return blocks.flat();
};

export default function HomeScreen() {
  // Inisialisasi navigasi, state, ref, dan data yang digunakan pada halaman Home
  const navigation = useNavigation<any>();
  const { width } = useWindowDimensions();
  const weatherCardWidth = Math.max(112, Math.floor((width - WEATHER_HORIZONTAL_INSET - CARD_GAP) / 2));
  const newsCardWidth = Math.max(250, width - 28);
  const newsScrollRef = useRef<ScrollView | null>(null);
  const newsIndexRef = useRef(0);
  const [latestInfo, setLatestInfo] = useState<{ title: string; body: string }[]>([]);
  const [loadingInfo, setLoadingInfo] = useState(true);
  const [headlineNews, setHeadlineNews] = useState<NewsItem[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [bmkgLoading, setBmkgLoading] = useState(true);
  const [bmkgError, setBmkgError] = useState<string | null>(null);
  const [bmkgHourly, setBmkgHourly] = useState<BmkgForecastItem[]>([]);
  const [bookedCount, setBookedCount] = useState(0);
  const [bookingCountLoading, setBookingCountLoading] = useState(true);
  const [bookingCountError, setBookingCountError] = useState<string | null>(null);
  const [basecampLabel, setBasecampLabel] = useState('Papahan, Lampung Barat');
  const [basecampMapUrl, setBasecampMapUrl] = useState('https://www.google.com/maps/search/?api=1&query=-5.0426,104.1213');
  const [basecampMapPreviewUrl] = useState(
    'https://staticmap.openstreetmap.de/staticmap.php?center=-5.0426,104.1213&zoom=12&size=640x320&markers=-5.0426,104.1213,red-pushpin',
  );
  const { session } = useAuthContext();
  const openBasecampMap = () => Linking.openURL(basecampMapUrl).catch(() => undefined);

  // Mengambil data berita terbaru dan menggunakan data fallback jika terjadi kegagalan
  useEffect(() => {
    const syncNews = async () => {
      try {
        const news = await fetchNews();
        setHeadlineNews(news.length > 0 ? news.slice(0, 3) : fallbackNews);
      } catch {
        setHeadlineNews(fallbackNews);
      } finally {
        setLoadingNews(false);
      }
    };
    void syncNews();
  }, []);

  // Menggeser carousel berita secara otomatis dalam interval tertentu
  useEffect(() => {
    if (headlineNews.length <= 1) return;
    const timer = setInterval(() => {
      newsIndexRef.current = (newsIndexRef.current + 1) % headlineNews.length;
      const nextX = newsIndexRef.current * (newsCardWidth + CARD_GAP);
      newsScrollRef.current?.scrollTo({ x: nextX, y: 0, animated: true });
    }, 2800);

    return () => clearInterval(timer);
  }, [headlineNews.length, newsCardWidth]);

  // Mengambil informasi pengumuman terbaru dan menampilkan data fallback jika diperlukan
  useEffect(() => {
    const syncInfo = async () => {
      try {
        const announcements = await fetchAnnouncements();
        const merged = [
          ...announcements.slice(0, 1).map((item) => ({ title: item.title, body: item.content })),
        ];
        setLatestInfo(merged.length > 0 ? merged : fallbackInfo);
      } catch {
        setLatestInfo(fallbackInfo);
      } finally {
        setLoadingInfo(false);
      }
    };
    void syncInfo();
  }, []);

  // Mengambil informasi lokasi basecamp dan menggunakan data default jika gagal
  useEffect(() => {
    const loadBasecamp = async () => {
      try {
        const mountains = await fetchMountains();
        const first = mountains[0];
        if (!first) return;
        const location = first.location || 'Papahan, Lampung Barat';
        setBasecampLabel(location);
        setBasecampMapUrl(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`);
      } catch {
        // keep fallback
      }
    };
    void loadBasecamp();
  }, []);

  // Mengambil dan menghitung total tiket yang telah dipesan oleh pengguna
  useEffect(() => {
    const loadBookingCount = async () => {
      if (!session?.accessToken) {
        setBookedCount(0);
        setBookingCountLoading(false);
        return;
      }

      setBookingCountLoading(true);
      setBookingCountError(null);

      try {
        const bookings = await fetchMyBookings(session.accessToken);
        const totalBooked = bookings.reduce((sum, item) => sum + item.quantity, 0);
        setBookedCount(totalBooked);
      } catch (error) {
        setBookingCountError(error instanceof Error ? error.message : 'Gagal memuat kuota tiket');
        setBookedCount(0);
      } finally {
        setBookingCountLoading(false);
      }
    };

    void loadBookingCount();
  }, [session?.accessToken]);

  useEffect(() => {
    const loadBmkgForecast = async () => {
      setBmkgLoading(true);
      setBmkgError(null);
      try {
        const response = await fetchBmkgForecast(BMKG_ADM4);
        setBmkgHourly(flattenBmkgForecast(response));
      } catch (error) {
        setBmkgError(error instanceof Error ? error.message : 'Gagal memuat cuaca BMKG');
        setBmkgHourly([]);
      } finally {
        setBmkgLoading(false);
      }
    };
    void loadBmkgForecast();
  }, []);

  const bmkgCardItems = useMemo(() => (bmkgHourly.length > 0 ? bmkgHourly : []), [bmkgHourly]);

  return (
    <AppScaffold title="Beranda" showWhatsApp>
      <ScrollView style={styles.page} contentContainerStyle={styles.content}>
        <Text style={styles.welcome}>Selamat Datang!</Text>
        <Text style={styles.ask}>Siap mendaki Gunung Pesagi?</Text>

        <View style={styles.mainCard}>
          <ImageBackground source={require('../../pesagi.jpg')} style={styles.hero} imageStyle={styles.heroImage}>
            <View style={styles.overlay}>
              <Text style={styles.heroTitle}>Gunung Pesagi</Text>
              <Text style={styles.heroCopy}>via Papahan</Text>
            </View>
          </ImageBackground>
          <View style={styles.statRow}>
            <Text style={styles.stat}>Ketinggian{'\n'}{'\n'}{'\n'}2.262 mdpl</Text>
            <Text style={styles.stat}>Waktu Tempuh{'\n'}{'\n'}4-6 Jam</Text>
            <Text style={styles.stat}>Jalur Pendakian{'\n'}{'\n'}Papahan</Text>
            <Text style={styles.stat}>Tingkat Kesulitan{'\n'}{'\n'}Menengah</Text>
          </View>
          <Pressable style={styles.primaryButton} onPress={() => navigation.getParent()?.navigate('MountainDetail' as never)}>
            <Text style={styles.primaryButtonText}>Pesan Tiket Sekarang</Text>
          </Pressable>
        </View>

        <View style={styles.quotaCard}>
          <Text style={styles.quotaTitle}>Kuota Pendakian</Text>
          <Text style={styles.quotaValue}>200 orang</Text>
          <Text style={styles.quotaMeta}>
            Terpesan: {bookingCountLoading ? 'Memuat...' : `${bookedCount} orang`}
          </Text>
          <Text style={styles.quotaMeta}>
            Sisa kuota: {bookingCountLoading ? '-' : `${Math.max(0, 200 - bookedCount)} orang`}
          </Text>
          {!session?.accessToken ? (
            <Text style={styles.quotaNote}>Login untuk melihat jumlah tiket yang sudah dipesan.</Text>
          ) : null}
          {bookingCountError ? <Text style={styles.errorText}>{bookingCountError}</Text> : null}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Kenapa PesagiGo?</Text>
          <View style={styles.featureBox}>
            <Text style={styles.featureTitle}>Data Akurat</Text>
            <Text style={styles.featureBody}>Informasi lengkap dan terverifikasi.</Text>
          </View>
          <View style={styles.featureBox}>
            <Text style={styles.featureTitle}>Booking Mudah</Text>
            <Text style={styles.featureBody}>Pesan tiket dalam 3 menit.</Text>
          </View>
          <View style={styles.featureBox}>
            <Text style={styles.featureTitle}>Pembayaran Aman</Text>
            <Text style={styles.featureBody}>Transaksi aman dan terpercaya.</Text>
          </View>
          {loadingInfo ? (
            <View style={styles.cmsInfoWrap}>
              <Skeleton height={14} />
              <Skeleton height={44} />
              <Skeleton height={44} />
            </View>
          ) : latestInfo.length > 0 ? (
            <View style={styles.cmsInfoWrap}>
              <Text style={styles.cmsInfoTitle}>Update Dari CMS</Text>
              {latestInfo.map((item) => (
                <View key={item.title} style={styles.cmsInfoItem}>
                  <Text style={styles.cmsInfoItemTitle}>{item.title}</Text>
                  <Text numberOfLines={2} style={styles.cmsInfoItemBody}>
                    {item.body}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>

        <View style={styles.newsSection}>
          <Text style={styles.newsTitle}>Berita Gunung Pesagi</Text>
          {loadingNews ? (
            <View style={styles.newsCard}>
              <Skeleton height={150} />
              <View style={styles.newsBody}>
                <Skeleton height={14} />
                <Skeleton height={14} />
              </View>
            </View>
          ) : (
            <ScrollView
              ref={newsScrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.newsScroll}
              snapToInterval={newsCardWidth + CARD_GAP}
              decelerationRate="fast"
            >
              {headlineNews.map((item) => (
                <Pressable
                  key={item.id}
                  style={[styles.newsCard, { width: newsCardWidth }]}
                  onPress={() => navigation.getParent()?.navigate('NewsDetail' as never, { news: item } as never)}
                >
                  {item.imageUrl ? (
                    <Image source={{ uri: item.imageUrl }} style={styles.newsImage} resizeMode="cover" />
                  ) : (
                    <View style={styles.newsPlaceholder}>
                      <Text style={styles.newsPlaceholderText}>PESAGIGO</Text>
                    </View>
                  )}
                  <View style={styles.newsBody}>
                    <Text style={styles.newsHeadline} numberOfLines={2}>
                      {item.title}
                    </Text>
                    <Text style={styles.newsDesc} numberOfLines={2}>
                      {item.description}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          )}
        </View>

        <View style={styles.weatherCard}>
          <Text style={styles.weatherTitle}>Grafik Cuaca Gunung Pesagi</Text>
          {bmkgLoading ? (
            <Skeleton height={170} />
          ) : bmkgError ? (
            <Text style={styles.weatherEmpty}>{bmkgError}</Text>
          ) : bmkgCardItems.length === 0 ? (
            <Text style={styles.weatherEmpty}>Data cuaca belum tersedia.</Text>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.weatherScroll}
              snapToInterval={weatherCardWidth + CARD_GAP}
              decelerationRate="fast"
            >
              {bmkgCardItems.map((item, index) => (
                <View key={`${item.local_datetime}-${index}`} style={[styles.weatherItem, { width: weatherCardWidth }]}>
                  <Text style={styles.chartLabel}>{formatBmkgShort(item.local_datetime || item.datetime)}</Text>
                  <Text style={styles.tempText}>{Math.round(item.t)}°C</Text>
                  <FontAwesome name={toWeatherIcon(item.weather_desc || item.weather_desc_en)} size={34} color="#135efd" />
                  <Text numberOfLines={1} style={styles.chartCondition}>
                    {item.weather_desc || item.weather_desc_en}
                  </Text>
                  <Text style={styles.chartMeta}>Kelembapan {item.hu}%</Text>
                  <Text style={styles.chartMeta}>Angin {item.ws} km/jam - Hujan {item.tp} mm</Text>
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        <View style={styles.mapCard}>
          <Text style={styles.mapTitle}>Map Basecamp Gunung Pesagi</Text>
          <Pressable style={styles.mapPreview} onPress={openBasecampMap}>
            <ImageBackground source={{ uri: basecampMapPreviewUrl }} imageStyle={styles.mapImage} style={styles.mapImageWrap}>
              <View style={styles.mapTopInfo}>
                <FontAwesome name="tree" size={16} color="#135efd" />
                <View>
                  <Text style={styles.mapTopTitle}>Gunung Pesagi</Text>
                  <Text style={styles.mapTopSub}>2.262 mdpl</Text>
                </View>
              </View>
              <View style={styles.pinMarker}>
                <FontAwesome name="map-marker" size={30} color="#135efd" />
              </View>
            </ImageBackground>
          </Pressable>

          <Pressable style={styles.basecampInfo} onPress={openBasecampMap}>
            <View style={styles.basecampIconWrap}>
              <FontAwesome name="tree" size={18} color="#ffffff" />
            </View>
            <View style={styles.basecampTextWrap}>
              <Text style={styles.basecampLabel}>Basecamp</Text>
              <Text style={styles.basecampLocation} numberOfLines={1}>
                {basecampLabel}
              </Text>
              <Text style={styles.basecampSub}>Lokasi resmi pendakian</Text>
            </View>
            <FontAwesome name="angle-right" size={24} color="#6b7280" />
          </Pressable>

          <Pressable style={styles.mapButton} onPress={openBasecampMap}>
            <FontAwesome name="map-o" size={16} color="#ffffff" />
            <Text style={styles.mapButtonText}>Buka Rute ke Basecamp</Text>
          </Pressable>
        </View>
      </ScrollView>
    </AppScaffold>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#f3f5f8' },
  content: { padding: 14, paddingBottom: 120, gap: 12 },
  welcome: { color: '#0f172a', fontSize: 40, fontWeight: '900', lineHeight: 46 },
  ask: { color: '#475569', fontSize: 14, marginTop: -2 },
  mainCard: { borderRadius: 14, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#fff', padding: 12, gap: 10 },
  hero: { minHeight: 180, justifyContent: 'flex-end', borderRadius: 10, overflow: 'hidden' },
  heroImage: { resizeMode: 'cover' },
  overlay: { backgroundColor: 'rgba(3, 26, 45, 0.45)', paddingHorizontal: 12, paddingVertical: 10, gap: 2 },
  heroTitle: { color: '#ffffff', fontSize: 36, fontWeight: '900' },
  heroCopy: { color: '#e2edf7', fontSize: 15, fontWeight: '700' },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 6 },
  stat: { flex: 1, textAlign: 'center', color: '#0f172a', fontSize: 11, lineHeight: 16, fontWeight: '700' },
  primaryButton: { borderRadius: 8, backgroundColor: '#135efd', paddingVertical: 11, alignItems: 'center' },
  primaryButtonText: { color: '#ffffff', fontSize: 14, fontWeight: '800' },
  sectionCard: { borderRadius: 14, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#ffffff', padding: 14, gap: 10 },
  sectionTitle: { color: '#0f172a', fontSize: 36, fontWeight: '900', lineHeight: 40 },
  featureBox: { borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#ffffff', padding: 12, gap: 3 },
  featureTitle: { color: '#0f172a', fontSize: 16, fontWeight: '800' },
  featureBody: { color: '#475569', fontSize: 12, lineHeight: 18 },
  quotaCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#dbe4ef',
    padding: 16,
    gap: 6,
    marginTop: 12,
  },
  quotaTitle: { color: '#0f172a', fontSize: 14, fontWeight: '800' },
  quotaValue: { color: '#135efd', fontSize: 20, fontWeight: '900', marginTop: 2 },
  quotaMeta: { color: '#475569', fontSize: 13, marginTop: 4 },
  quotaNote: { color: '#64748b', fontSize: 12, marginTop: 8 },
  errorText: { color: '#b91c1c', fontSize: 12, marginTop: 6 },
  cmsInfoWrap: { borderRadius: 12, borderWidth: 1, borderColor: '#dbe4ef', backgroundColor: '#f8fbff', padding: 10, gap: 6 },
  cmsInfoTitle: { color: '#0f172a', fontSize: 13, fontWeight: '800' },
  cmsInfoItem: { borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#fff', padding: 8 },
  cmsInfoItemTitle: { color: '#1e293b', fontSize: 12, fontWeight: '800' },
  cmsInfoItemBody: { color: '#64748b', fontSize: 11, marginTop: 2, lineHeight: 16 },
  newsSection: { gap: 10 },
  newsTitle: { color: '#0f172a', fontSize: 18, fontWeight: '800' },
  newsScroll: { gap: CARD_GAP },
  newsCard: { borderRadius: 14, borderWidth: 1, borderColor: '#dbe5df', backgroundColor: '#fff', overflow: 'hidden' },
  newsImage: { width: '100%', height: 150 },
  newsPlaceholder: { width: '100%', height: 150, backgroundColor: '#dbeafe', alignItems: 'center', justifyContent: 'center' },
  newsPlaceholderText: { color: '#1d4ed8', fontSize: 22, fontWeight: '900' },
  newsBody: { paddingHorizontal: 12, paddingVertical: 10 },
  newsHeadline: { color: '#334155', fontSize: 18, lineHeight: 24, fontWeight: '800' },
  newsDesc: { marginTop: 4, color: '#64748b', fontSize: 12, lineHeight: 18 },
  weatherCard: { borderRadius: 16, borderWidth: 1, borderColor: '#dbe5df', backgroundColor: '#ffffff', padding: 14, gap: 10 },
  weatherTitle: { color: '#0f172a', fontSize: 18, fontWeight: '800' },
  weatherScroll: { gap: CARD_GAP, paddingRight: 14 },
  weatherItem: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f8fafc',
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
    gap: 6,
  },
  chartLabel: { color: '#135efd', fontSize: 16, fontWeight: '700' },
  tempText: { color: '#135efd', fontSize: 38, lineHeight: 42, fontWeight: '800' },
  chartCondition: { marginTop: 2, color: '#475569', fontSize: 14, textTransform: 'capitalize' },
  chartMeta: { color: '#94a3b8', fontSize: 11, textAlign: 'center' },
  weatherEmpty: { color: '#64748b', fontSize: 12, fontWeight: '600' },
  mapCard: { borderRadius: 16, borderWidth: 1, borderColor: '#dbe5df', backgroundColor: '#ffffff', padding: 14, gap: 10 },
  mapTitle: { color: '#0f172a', fontSize: 18, fontWeight: '800' },
  mapPreview: { borderRadius: 12, borderWidth: 1, borderColor: '#d1e5d7', overflow: 'hidden' },
  mapImageWrap: { minHeight: 190, justifyContent: 'space-between', padding: 14 },
  mapImage: { resizeMode: 'cover' },
  mapTopInfo: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  mapTopTitle: { color: '#14532d', fontSize: 14, fontWeight: '800' },
  mapTopSub: { color: '#4b5563', fontSize: 12, fontWeight: '600' },
  pinMarker: { alignSelf: 'center', marginBottom: 10 },
  basecampInfo: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  basecampIconWrap: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#135efd', alignItems: 'center', justifyContent: 'center' },
  basecampTextWrap: { flex: 1, gap: 1 },
  basecampLabel: { color: '#135efd', fontSize: 13, fontWeight: '800' },
  basecampLocation: { color: '#111827', fontSize: 20, lineHeight: 24, fontWeight: '800' },
  basecampSub: { color: '#6b7280', fontSize: 12, fontWeight: '500' },
  mapButton: {
    borderRadius: 10,
    backgroundColor: '#135efd',
    paddingVertical: 13,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  mapButtonText: { color: '#ffffff', fontSize: 15, fontWeight: '800' },
});
