import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type ApiHealth = {
  status: string;
  service: string;
  timestamp: string;
};

function getApiBaseUrl() {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3001';
  }

  return 'http://localhost:3001';
}

export default function App() {
  const apiBaseUrl = useMemo(() => getApiBaseUrl(), []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [health, setHealth] = useState<ApiHealth | null>(null);

  const checkConnection = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${apiBaseUrl}/api/health`);
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data = (await response.json()) as ApiHealth;
      setHealth(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      setHealth(null);
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl]);

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#020617" />
      <View style={styles.container}>
        <Text style={styles.title}>PesagiGo Mobile - API Status</Text>
        <Text style={styles.baseUrl}>API Base URL: {apiBaseUrl}</Text>

        {loading ? (
          <View style={styles.card}>
            <ActivityIndicator color="#22d3ee" />
            <Text style={styles.text}>Mengecek koneksi backend...</Text>
          </View>
        ) : error ? (
          <View style={[styles.card, styles.errorCard]}>
            <Text style={styles.errorTitle}>Backend belum terhubung</Text>
            <Text style={styles.text}>Error: {error}</Text>
          </View>
        ) : (
          <View style={[styles.card, styles.successCard]}>
            <Text style={styles.successTitle}>Backend terhubung</Text>
            <Text style={styles.text}>Service: {health?.service}</Text>
            <Text style={styles.text}>Status: {health?.status}</Text>
            <Text style={styles.text}>Time: {health?.timestamp}</Text>
          </View>
        )}

        <Pressable onPress={checkConnection} style={styles.button}>
          <Text style={styles.buttonText}>Cek Ulang Koneksi</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#020617',
  },
  container: {
    flex: 1,
    padding: 20,
    gap: 16,
  },
  title: {
    color: '#e2e8f0',
    fontSize: 24,
    fontWeight: '700',
  },
  baseUrl: {
    color: '#67e8f9',
    fontSize: 13,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: '#0f172a',
    padding: 14,
    gap: 8,
  },
  successCard: {
    borderColor: '#10b981',
  },
  errorCard: {
    borderColor: '#fb7185',
  },
  successTitle: {
    color: '#6ee7b7',
    fontSize: 16,
    fontWeight: '700',
  },
  errorTitle: {
    color: '#fda4af',
    fontSize: 16,
    fontWeight: '700',
  },
  text: {
    color: '#cbd5e1',
    fontSize: 14,
  },
  button: {
    marginTop: 8,
    borderRadius: 10,
    backgroundColor: '#0891b2',
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#e0f2fe',
    fontSize: 14,
    fontWeight: '600',
  },
});
