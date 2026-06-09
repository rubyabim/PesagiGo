import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { AuthStackParamList } from '../../navigation/AuthNavigator';
import AppScaffold from '../common/AppScaffold';

type Nav = StackNavigationProp<AuthStackParamList>;

export default function ForgotPasswordScreen() {
  const navigation = useNavigation<Nav>();
  const [identity, setIdentity] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const onSubmit = () => {
    if (!identity.trim()) {
      setMessage('Isi email atau nomor HP terlebih dahulu.');
      return;
    }
    setMessage('Link reset sudah dikirim. Silakan cek email/nomor HP kamu.');
  };

  return (
    <AppScaffold title="Lupa Password">
      <ScrollView style={styles.page} contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>Lupa Password</Text>
          <Text style={styles.subtitle}>
            Masukkan email atau nomor HP terdaftar untuk menerima link reset password.
          </Text>
          <TextInput
            style={styles.input}
            value={identity}
            onChangeText={setIdentity}
            placeholder="Masukkan email atau nomor HP"
            placeholderTextColor="#94a3b8"
          />
          <Pressable style={styles.btn} onPress={onSubmit}>
            <Text style={styles.btnText}>Kirim Link Reset</Text>
          </Pressable>
          {message ? <Text style={styles.message}>{message}</Text> : null}
          <Pressable style={styles.link} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.linkText}>Kembali ke Login</Text>
          </Pressable>
        </View>
      </ScrollView>
    </AppScaffold>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#f2f6fb' },
  content: { padding: 16, paddingBottom: 100 },
  card: { backgroundColor: '#fff', borderRadius: 18, borderWidth: 1, borderColor: '#dce4ef', padding: 18, gap: 10 },
  title: { color: '#0f172a', fontSize: 30, fontWeight: '900' },
  subtitle: { color: '#475569', fontSize: 14, lineHeight: 22 },
  input: {
    borderWidth: 1,
    borderColor: '#dce4ef',
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 11,
    color: '#0f172a',
  },
  btn: { marginTop: 6, borderRadius: 12, backgroundColor: '#2563eb', paddingVertical: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  message: { color: '#334155', fontSize: 13, lineHeight: 20 },
  link: { alignItems: 'center', paddingVertical: 8 },
  linkText: { color: '#1d4ed8', fontWeight: '700', fontSize: 13 },
});
