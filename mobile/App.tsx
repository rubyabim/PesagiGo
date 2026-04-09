import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { getApiBaseUrl } from './src/config/api';
import {
  AuthResponse,
  Booking,
  TicketResponse,
  createBooking,
  fetchApiHealth,
  fetchMountains,
  fetchMyBookings,
  fetchSessions,
  fetchTicket,
  fetchWeather,
  loginUser,
  payBooking,
  registerUser,
  runSeed,
} from './src/api/client';

export default function App() {
  const apiBaseUrl = useMemo(() => getApiBaseUrl(), []);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState('Siap untuk integrasi mobile-backend.');
  const [auth, setAuth] = useState<AuthResponse | null>(null);
  const [health, setHealth] = useState<string>('belum sinkron');
  const [mountainsCount, setMountainsCount] = useState(0);
  const [sessions, setSessions] = useState<Array<{ id: string; label: string }>>([]);
  const [weatherCount, setWeatherCount] = useState(0);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [ticket, setTicket] = useState<TicketResponse | null>(null);

  const [registerForm, setRegisterForm] = useState({
    fullName: 'Pendaki Mobile',
    email: `mobile.${Date.now()}@pesagigo.local`,
    password: 'rahasia123',
    phone: '081299991111',
  });
  const [loginForm, setLoginForm] = useState({ email: '', password: 'rahasia123' });
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [selectedBookingId, setSelectedBookingId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('VA-BNI');

  const token = auth?.accessToken ?? '';

  async function withAction(action: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setBusy(false);
    }
  }

  async function syncPublicData() {
    const [healthData, mountainsData, sessionsData, weatherData] = await Promise.all([
      fetchApiHealth(),
      fetchMountains(),
      fetchSessions(),
      fetchWeather(),
    ]);

    setHealth(`${healthData.service} (${healthData.status})`);
    setMountainsCount(mountainsData.length);
    setWeatherCount(weatherData.length);

    const nextSessions = sessionsData.map((item) => ({
      id: item.id,
      label: `${item.mountain.name} | ${new Date(item.date).toLocaleDateString()} | quota ${item.quotaAvailable}`,
    }));
    setSessions(nextSessions);
    if (!selectedSessionId && nextSessions.length > 0) {
      setSelectedSessionId(nextSessions[0].id);
    }
  }

  async function syncMyBookings(currentToken: string) {
    const result = await fetchMyBookings(currentToken);
    setBookings(result);
    if (!selectedBookingId && result.length > 0) {
      setSelectedBookingId(result[0].id);
    }
  }

  const handleSeed = () =>
    withAction(async () => {
      const result = await runSeed();
      setMessage(result.message);
      await syncPublicData();
    });

  const handleSyncPublic = () =>
    withAction(async () => {
      await syncPublicData();
      setMessage('Data publik tersinkron.');
    });

  const handleRegister = () =>
    withAction(async () => {
      const result = await registerUser(registerForm);
      setAuth(result);
      setLoginForm((prev) => ({ ...prev, email: registerForm.email }));
      setMessage(result.message);
      await syncPublicData();
      await syncMyBookings(result.accessToken);
    });

  const handleLogin = () =>
    withAction(async () => {
      const result = await loginUser(loginForm);
      setAuth(result);
      setMessage(result.message);
      await syncPublicData();
      await syncMyBookings(result.accessToken);
    });

  const handleCreateBooking = () =>
    withAction(async () => {
      if (!token) {
        throw new Error('Login terlebih dahulu.');
      }
      if (!selectedSessionId) {
        throw new Error('Pilih session dulu.');
      }

      const created = await createBooking(token, {
        sessionId: selectedSessionId,
        quantity: Number(quantity || '1'),
      });
      setMessage(`Booking berhasil: ${created.id}`);
      await syncMyBookings(token);
      setSelectedBookingId(created.id);
    });

  const handlePayBooking = () =>
    withAction(async () => {
      if (!token) {
        throw new Error('Login terlebih dahulu.');
      }
      if (!selectedBookingId) {
        throw new Error('Pilih booking dulu.');
      }

      const result = await payBooking(token, selectedBookingId, {
        method: paymentMethod,
      });
      setMessage(result.message);
      await syncMyBookings(token);
    });

  const handleGetTicket = () =>
    withAction(async () => {
      if (!token) {
        throw new Error('Login terlebih dahulu.');
      }
      if (!selectedBookingId) {
        throw new Error('Pilih booking dulu.');
      }

      const data = await fetchTicket(token, selectedBookingId);
      setTicket(data);
      setMessage(`Tiket aktif: ${data.ticketCode}`);
    });

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#020617" />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>PesagiGo Mobile Integration Console</Text>
        <Text style={styles.baseUrl}>API: {apiBaseUrl}</Text>
        <Text style={styles.message}>{message}</Text>

        {error ? (
          <View style={[styles.card, styles.errorCard]}>
            <Text style={styles.errorTitle}>Terjadi error</Text>
            <Text style={styles.text}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Setup</Text>
          <View style={styles.row}>
            <Pressable onPress={handleSeed} style={styles.button} disabled={busy}>
              <Text style={styles.buttonText}>Seed</Text>
            </Pressable>
            <Pressable onPress={handleSyncPublic} style={styles.button} disabled={busy}>
              <Text style={styles.buttonText}>Sync</Text>
            </Pressable>
          </View>
          <Text style={styles.text}>Health: {health}</Text>
          <Text style={styles.text}>Mountains: {mountainsCount}</Text>
          <Text style={styles.text}>Sessions: {sessions.length}</Text>
          <Text style={styles.text}>Weather rows: {weatherCount}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Auth</Text>
          <TextInput
            style={styles.input}
            value={registerForm.fullName}
            onChangeText={(value) => setRegisterForm((prev) => ({ ...prev, fullName: value }))}
            placeholder="Nama lengkap"
            placeholderTextColor="#64748b"
          />
          <TextInput
            style={styles.input}
            value={registerForm.email}
            onChangeText={(value) => setRegisterForm((prev) => ({ ...prev, email: value }))}
            placeholder="Email register"
            placeholderTextColor="#64748b"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            value={registerForm.password}
            onChangeText={(value) => setRegisterForm((prev) => ({ ...prev, password: value }))}
            placeholder="Password"
            placeholderTextColor="#64748b"
            secureTextEntry
          />
          <View style={styles.row}>
            <Pressable onPress={handleRegister} style={styles.button} disabled={busy}>
              <Text style={styles.buttonText}>Register</Text>
            </Pressable>
            <Pressable onPress={handleLogin} style={styles.button} disabled={busy}>
              <Text style={styles.buttonText}>Login</Text>
            </Pressable>
          </View>
          <TextInput
            style={styles.input}
            value={loginForm.email}
            onChangeText={(value) => setLoginForm((prev) => ({ ...prev, email: value }))}
            placeholder="Email login"
            placeholderTextColor="#64748b"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            value={loginForm.password}
            onChangeText={(value) => setLoginForm((prev) => ({ ...prev, password: value }))}
            placeholder="Password login"
            placeholderTextColor="#64748b"
            secureTextEntry
          />
          <Text style={styles.text}>User aktif: {auth?.user.email ?? '-'}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Booking</Text>
          <TextInput
            style={styles.input}
            value={selectedSessionId}
            onChangeText={setSelectedSessionId}
            placeholder="Session ID"
            placeholderTextColor="#64748b"
          />
          <TextInput
            style={styles.input}
            value={quantity}
            onChangeText={setQuantity}
            placeholder="Quantity"
            keyboardType="numeric"
            placeholderTextColor="#64748b"
          />
          <Pressable onPress={handleCreateBooking} style={styles.button} disabled={busy}>
            <Text style={styles.buttonText}>Create Booking</Text>
          </Pressable>
          <TextInput
            style={styles.input}
            value={selectedBookingId}
            onChangeText={setSelectedBookingId}
            placeholder="Booking ID"
            placeholderTextColor="#64748b"
          />
          <TextInput
            style={styles.input}
            value={paymentMethod}
            onChangeText={setPaymentMethod}
            placeholder="Payment method"
            placeholderTextColor="#64748b"
          />
          <View style={styles.row}>
            <Pressable onPress={handlePayBooking} style={styles.button} disabled={busy}>
              <Text style={styles.buttonText}>Pay</Text>
            </Pressable>
            <Pressable onPress={handleGetTicket} style={styles.button} disabled={busy}>
              <Text style={styles.buttonText}>Ticket</Text>
            </Pressable>
          </View>
          <Text style={styles.text}>Bookings: {bookings.length}</Text>
          {bookings.slice(0, 5).map((item) => (
            <Text key={item.id} style={styles.smallText}>
              {item.id.slice(0, 8)} | {item.status} | qty {item.quantity}
            </Text>
          ))}
          <Text style={styles.smallText}>
            Session options: {sessions.slice(0, 3).map((item) => item.label).join(' || ') || '-'}
          </Text>
          <Text style={styles.smallText}>
            Ticket: {ticket ? `${ticket.ticketCode} | ${ticket.mountain}` : 'belum ada'}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#020617',
  },
  container: {
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
  message: {
    color: '#bae6fd',
    fontSize: 13,
    borderColor: '#155e75',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#0c4a6e',
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: '#0f172a',
    padding: 14,
    gap: 8,
  },
  sectionTitle: {
    color: '#e2e8f0',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  input: {
    borderColor: '#475569',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 9,
    color: '#e2e8f0',
    backgroundColor: '#1e293b',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
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
    marginTop: 4,
    borderRadius: 10,
    backgroundColor: '#0891b2',
    paddingVertical: 12,
    alignItems: 'center',
    flex: 1,
  },
  buttonText: {
    color: '#e0f2fe',
    fontSize: 14,
    fontWeight: '600',
  },
  smallText: {
    color: '#cbd5e1',
    fontSize: 12,
  },
});
