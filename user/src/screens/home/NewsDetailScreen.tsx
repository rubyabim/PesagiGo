import { ScrollView, StyleSheet, Text, View, Image } from 'react-native';
import AppScaffold from '../common/AppScaffold';

export default function NewsDetailScreen({ route, navigation }: { route: any; navigation: any }) {
  const item = route.params?.news;

  return (
    <AppScaffold title="Berita Pesagi" variant="plain" onBackPress={() => navigation.goBack()}>
      <ScrollView style={styles.page} contentContainerStyle={styles.content}>
        {item?.imageUrl ? <Image source={{ uri: item.imageUrl }} style={styles.heroImage} resizeMode="cover" /> : null}
        <View style={styles.body}>
          <Text style={styles.title}>{item?.title ?? 'Berita Gunung Pesagi'}</Text>
          <Text style={styles.date}>
            {(item?.publishedAt || item?.createdAt)
              ? new Date(item.publishedAt || item.createdAt).toLocaleDateString('id-ID', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })
              : 'Tanggal belum tersedia'}
          </Text>
          <Text style={styles.articleText}>{item?.description ?? 'Isi berita belum tersedia.'}</Text>
        </View>
      </ScrollView>
    </AppScaffold>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#f3f5f8' },
  content: { paddingBottom: 30 },
  heroImage: { width: '100%', height: 240 },
  body: { paddingHorizontal: 14, paddingVertical: 14 },
  title: { color: '#0f172a', fontSize: 24, lineHeight: 32, fontWeight: '900' },
  date: { color: '#64748b', fontSize: 12, marginTop: 6, marginBottom: 12, fontWeight: '600' },
  articleText: { color: '#334155', fontSize: 15, lineHeight: 24, fontWeight: '500' },
});
