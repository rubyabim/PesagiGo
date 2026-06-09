import { ReactNode, useEffect, useRef } from 'react';
import { Animated, Image, Linking, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';

type AppScaffoldProps = {
  title: string;
  subtitle?: string;
  variant?: 'brand' | 'plain';
  onBackPress?: (() => void) | null;
  showWhatsApp?: boolean;
  headerWeatherItems?: string[];
  headerWeatherLoading?: boolean;
  children: ReactNode;
};

export default function AppScaffold({
  title,
  subtitle,
  variant = 'brand',
  onBackPress = null,
  showWhatsApp = false,
  headerWeatherItems = [],
  headerWeatherLoading = false,
  children,
}: AppScaffoldProps) {
  const navigation = useNavigation<any>();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 260,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const openWhatsApp = () => {
    const phone = '6281234567890';
    const text = encodeURIComponent('Halo admin PesagiGo, saya mau tanya terkait pendakian.');
    const url = `https://wa.me/${phone}?text=${text}`;
    Linking.openURL(url).catch(() => undefined);
  };

  return (
    <SafeAreaView style={styles.page}>
      {variant === 'brand' ? (
        <View style={styles.topBar}>
          <Pressable style={styles.brandRow} onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}>
            <Image source={require('../../logo.jpeg')} style={styles.logo} />
            <View>
              <Text style={styles.brandName}>PesagiGo</Text>
              <Text style={styles.brandSub}>{subtitle ?? title}</Text>
              {headerWeatherLoading ? (
                <Text style={styles.weatherLine}>Memuat cuaca...</Text>
              ) : headerWeatherItems.length > 0 ? (
                <Text numberOfLines={2} style={styles.weatherLine}>
                  {headerWeatherItems.join('  •  ')}
                </Text>
              ) : null}
            </View>
          </Pressable>
        </View>
      ) : (
        <View style={styles.plainTopBar}>
          <Pressable style={styles.backBtn} onPress={onBackPress ?? undefined}>
            <FontAwesome name="angle-left" size={22} color="#0f172a" />
          </Pressable>
          <Text style={styles.plainTitle}>{title}</Text>
          <View style={styles.backBtn} />
        </View>
      )}

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>{children}</Animated.View>

      {showWhatsApp ? (
        <Pressable style={styles.waFab} onPress={openWhatsApp}>
          <FontAwesome name="whatsapp" size={28} color="#16a34a" />
        </Pressable>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#f3f6fa' },
  topBar: {
    marginHorizontal: 0,
    marginTop: 0,
    borderBottomWidth: 1,
    borderColor: '#0d4f63',
    backgroundColor: '#0f5a72',
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  plainTopBar: {
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  plainTitle: { color: '#0f172a', fontSize: 30, fontWeight: '900' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logo: { width: 40, height: 40, borderRadius: 20 },
  brandName: { color: '#ffffff', fontSize: 24, fontWeight: '800' },
  brandSub: { color: '#d8eef9', fontSize: 12, marginTop: -2 },
  weatherLine: { color: '#c5ecff', fontSize: 11, marginTop: 4, maxWidth: 290, fontWeight: '600' },
  content: { flex: 1 },
  waFab: {
    position: 'absolute',
    right: 18,
    bottom: 118,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e7f8ef',
    borderWidth: 1,
    borderColor: '#b7e7c8',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0b2014',
    shadowOpacity: 0.28,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 7,
  },
});
