import { useEffect } from 'react';
import { ActivityIndicator, Image, ImageBackground, StyleSheet, Text, View } from 'react-native';

export default function SplashScreen({ navigation }: { navigation: any }) {
  useEffect(() => {
    const id = setTimeout(() => navigation.replace('MainTabs'), 1400);
    return () => clearTimeout(id);
  }, [navigation]);

  return (
    <ImageBackground source={require('../pesagi.jpg')} style={styles.page} imageStyle={styles.bgImage}>
      <View style={styles.overlay}>
        <Image source={require('../logo.jpeg')} style={styles.logoCircle} />
        <Text style={styles.title}>PesagiGo</Text>
        <Text style={styles.subtitle}>Pesan Tiket Pendakian Gunung Pesagi via Papahan Lebih Mudah & Resmi</Text>
        <ActivityIndicator color="#ffffff" style={styles.loader} />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  bgImage: { resizeMode: 'cover' },
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(8, 30, 20, 0.45)', padding: 26 },
  logoCircle: { width: 112, height: 112, borderRadius: 56, borderWidth: 2, borderColor: 'rgba(255,255,255,0.6)' },
  title: { marginTop: 18, color: '#fff', fontSize: 42, fontWeight: '900' },
  subtitle: { marginTop: 12, color: '#eaf5ee', fontSize: 16, lineHeight: 24, textAlign: 'center' },
  loader: { marginTop: 32 },
});
