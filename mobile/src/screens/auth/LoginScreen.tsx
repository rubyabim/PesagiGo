import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { loginUser } from '../../api/client';
import { useAuthContext } from '../../context/AuthContext';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import AppScaffold from '../common/AppScaffold';

type Nav = StackNavigationProp<AuthStackParamList>;

export default function LoginScreen() {
  const navigation = useNavigation<Nav>();
  const { setSession } = useAuthContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onLogin = async () => {
    setBusy(true);
    setError(null);
    try {
      const result = await loginUser({ email: email.trim(), password });
      setSession(result);
      navigation.getParent()?.navigate('MainTabs', { screen: 'Home' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login gagal');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppScaffold title="Akun">
      <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.title}>Masuk Akun</Text>
        <Text style={styles.subtitle}>Gunakan akun pendaki untuk akses tiket dan riwayat booking.</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#7b8178"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#7b8178"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Pressable style={[styles.button, busy && styles.buttonDisabled]} onPress={onLogin} disabled={busy}>
          {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Login</Text>}
        </Pressable>
        <Pressable style={styles.link} onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={styles.linkText}>Lupa Password?</Text>
        </Pressable>
        <Pressable style={styles.link} onPress={() => navigation.navigate('Register')}>
          <Text style={styles.linkText}>Belum punya akun? Daftar</Text>
        </Pressable>
      </View>
      </ScrollView>
    </AppScaffold>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#f3f6f4' },
  content: { padding: 16, paddingBottom: 80 },
  card: { backgroundColor: '#fff', borderRadius: 18, borderWidth: 1, borderColor: '#dbe5df', padding: 18, gap: 10 },
  title: { color: '#0f172a', fontSize: 30, fontWeight: '900' },
  subtitle: { color: '#4f6259', fontSize: 14, lineHeight: 22 },
  input: {
    borderWidth: 1,
    borderColor: '#dbe5df',
    borderRadius: 12,
    backgroundColor: '#fbfdfc',
    paddingHorizontal: 12,
    paddingVertical: 11,
    color: '#12231d',
  },
  button: { marginTop: 6, backgroundColor: '#2563eb', borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  buttonDisabled: { opacity: 0.65 },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  error: { color: '#c53030', fontSize: 13, fontWeight: '600' },
  link: { alignItems: 'center', paddingVertical: 8 },
  linkText: { color: '#1d4ed8', fontWeight: '700', fontSize: 13 },
});
