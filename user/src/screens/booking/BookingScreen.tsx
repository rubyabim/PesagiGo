import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { createBooking, fetchSessions, Session } from '../../api/client';
import { useAuthContext } from '../../context/AuthContext';
import AppScaffold from '../common/AppScaffold';

export default function BookingScreen() {
  const navigation = useNavigation<any>();
  const { session } = useAuthContext();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [contactName, setContactName] = useState('');
  const [nik, setNik] = useState('');
  const [phone, setPhone] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [climbDate, setClimbDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [memberCount, setMemberCount] = useState('1');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoadingSessions(true);
      try {
        const data = await fetchSessions();
        setSessions(data);
        if (data.length > 0) {
          setSelectedSessionId(data[0].id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal memuat sesi');
      } finally {
        setLoadingSessions(false);
      }
    };

    void load();
  }, []);

  const selectedSession = useMemo(
    () => sessions.find((item) => item.id === selectedSessionId) ?? null,
    [selectedSessionId, sessions],
  );

  const onCreateBooking = async () => {
    if (!session?.accessToken) {
      setError('Login dulu sebelum booking tiket.');
      navigation.navigate('Auth');
      return;
    }
    if (!selectedSessionId) {
      setError('Pilih sesi pendakian.');
      return;
    }
    if (!contactName.trim()) {
      setError('Nama pendaki wajib diisi.');
      return;
    }
    if (!/^\d{16}$/.test(nik.trim())) {
      setError('NIK harus 16 digit angka.');
      return;
    }
    if (!/^\d{10,15}$/.test(phone.trim())) {
      setError('Nomor HP harus 10-15 digit angka.');
      return;
    }
    if (!climbDate.trim() || !returnDate.trim()) {
      setError('Tanggal naik dan turun wajib diisi.');
      return;
    }
    const qty = Number(quantity) || 1;
    const members = Number(memberCount) || 1;
    if (qty < 1 || members < 1) {
      setError('Jumlah tiket dan jumlah anggota minimal 1.');
      return;
    }

    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const result = await createBooking(session.accessToken, {
        sessionId: selectedSessionId,
        quantity: qty,
      });
      setMessage(
        `Booking berhasil dibuat (${result.id.slice(0, 8)}). Data: ${contactName}, anggota ${members}, naik ${climbDate}, turun ${returnDate}.`,
      );
      navigation.navigate('BookingDetail', { bookingId: result.id });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Booking gagal');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppScaffold title="Pesan Tiket">
      <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.title}>Pesan Tiket</Text>
        <Text style={styles.subtitle}>Pilih jadwal, tentukan jumlah tiket, lalu lanjutkan booking.</Text>

        {loadingSessions ? <ActivityIndicator color="#135efd" /> : null}
        {!loadingSessions && sessions.length === 0 ? <Text style={styles.empty}>Sesi belum tersedia.</Text> : null}

        <View style={styles.chipWrap}>
          {sessions.slice(0, 8).map((item) => {
            const active = item.id === selectedSessionId;
            return (
              <Pressable
                key={item.id}
                style={[styles.sessionChip, active && styles.sessionChipActive]}
                onPress={() => setSelectedSessionId(item.id)}
              >
                <Text style={[styles.sessionChipText, active && styles.sessionChipTextActive]}>
                  {new Date(item.date).toLocaleDateString('id-ID')}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {selectedSession ? (
          <View style={styles.sessionInfo}>
            <Text style={styles.sessionTitle}>{selectedSession.mountain.name}</Text>
            <Text style={styles.sessionMeta}>Kuota tersedia: {selectedSession.quotaAvailable}</Text>
            <Text style={styles.sessionMeta}>Harga: Rp {selectedSession.price.toLocaleString('id-ID')}</Text>
          </View>
        ) : null}

        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={quantity}
          onChangeText={setQuantity}
          placeholder="Jumlah tiket"
          placeholderTextColor="#7b8178"
        />
        <TextInput
          style={styles.input}
          value={contactName}
          onChangeText={setContactName}
          placeholder="Nama lengkap ketua rombongan"
          placeholderTextColor="#7b8178"
        />
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={nik}
          onChangeText={setNik}
          placeholder="NIK (16 digit)"
          placeholderTextColor="#7b8178"
          maxLength={16}
        />
        <TextInput
          style={styles.input}
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
          placeholder="Nomor HP aktif"
          placeholderTextColor="#7b8178"
        />
        <TextInput
          style={styles.input}
          keyboardType="phone-pad"
          value={emergencyPhone}
          onChangeText={setEmergencyPhone}
          placeholder="Nomor kontak darurat (opsional)"
          placeholderTextColor="#7b8178"
        />
        <TextInput
          style={styles.input}
          value={climbDate}
          onChangeText={setClimbDate}
          placeholder="Tanggal naik (YYYY-MM-DD)"
          placeholderTextColor="#7b8178"
        />
        <TextInput
          style={styles.input}
          value={returnDate}
          onChangeText={setReturnDate}
          placeholder="Tanggal turun (YYYY-MM-DD)"
          placeholderTextColor="#7b8178"
        />
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={memberCount}
          onChangeText={setMemberCount}
          placeholder="Jumlah anggota rombongan"
          placeholderTextColor="#7b8178"
        />
        <TextInput
          style={[styles.input, styles.textarea]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Catatan tambahan (opsional)"
          placeholderTextColor="#7b8178"
          multiline
          numberOfLines={4}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {message ? <Text style={styles.ok}>{message}</Text> : null}
        {!session?.accessToken ? (
          <Pressable style={styles.loginButton} onPress={() => navigation.navigate('Auth')}>
            <Text style={styles.loginButtonText}>Login Untuk Pesan Tiket</Text>
          </Pressable>
        ) : null}
        <Pressable style={[styles.button, busy && styles.buttonDisabled]} onPress={onCreateBooking} disabled={busy}>
          {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Buat Booking</Text>}
        </Pressable>
      </View>
      </ScrollView>
    </AppScaffold>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#f3f5f8' },
  content: { padding: 16, paddingBottom: 100 },
  card: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#dbe5df', padding: 14, gap: 10 },
  title: { color: '#0f172a', fontSize: 24, fontWeight: '900' },
  subtitle: { color: '#64748b', fontSize: 12, lineHeight: 18 },
  empty: { color: '#556b61', fontSize: 14 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  sessionChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#dbe5df',
    backgroundColor: '#fbfdfc',
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  sessionChipActive: { backgroundColor: '#135efd', borderColor: '#135efd' },
  sessionChipText: { color: '#2f443b', fontWeight: '600', fontSize: 12 },
  sessionChipTextActive: { color: '#fff' },
  sessionInfo: { borderRadius: 12, borderWidth: 1, borderColor: '#e1eae5', backgroundColor: '#fbfdfc', padding: 12, gap: 4 },
  sessionTitle: { color: '#1b3027', fontSize: 16, fontWeight: '800' },
  sessionMeta: { color: '#4f6259', fontSize: 13 },
  input: {
    borderWidth: 1,
    borderColor: '#dbe5df',
    borderRadius: 10,
    backgroundColor: '#fbfdfc',
    paddingHorizontal: 12,
    paddingVertical: 11,
    color: '#12231d',
  },
  textarea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  button: { marginTop: 4, backgroundColor: '#135efd', borderRadius: 8, paddingVertical: 12, alignItems: 'center' },
  loginButton: { marginTop: 4, backgroundColor: '#135efd', borderRadius: 8, paddingVertical: 12, alignItems: 'center' },
  loginButtonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  buttonDisabled: { opacity: 0.65 },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  error: { color: '#c53030', fontSize: 13, fontWeight: '600' },
  ok: { color: '#1d7a45', fontSize: 13, fontWeight: '600' },
});
