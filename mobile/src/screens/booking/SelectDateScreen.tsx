import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { fetchSessions, Session } from '../../api/client';
import AppScaffold from '../common/AppScaffold';

// Label nama hari dalam bahasa Indonesia (singkatan)
const days = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
// Label nama bulan dalam bahasa Indonesia
const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

// Halaman pemilihan tanggal pendakian
export default function SelectDateScreen({ navigation }: { navigation: any }) {
  const now = new Date();
  // State untuk mengatur bulan dan tahun yang sedang ditampilkan pada kalender
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  // Menyimpan tanggal yang dipilih oleh pengguna
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  // Status loading saat mengambil data sesi pendakian
  const [loadingSessions, setLoadingSessions] = useState(true);
  // Data ketersediaan kuota per tanggal
  const [sessionsByDate, setSessionsByDate] = useState<Record<string, { available: number; total: number }>>({});

  // Membuat daftar pilihan tahun untuk kalender (± beberapa tahun dari tahun sekarang)
  const yearOptions = useMemo(() => {
    const start = now.getFullYear() - 1;
    return Array.from({ length: 6 }, (_, i) => start + i);
  }, [now]);

  // Membuat struktur grid kalender (termasuk hari dari bulan sebelumnya dan berikutnya)
  const calendarCells = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstWeekday = (firstDay.getDay() + 6) % 7; // Mon=0
    // Menyimpan semua sel kalender (prev month, current month, next month)
    const cells: Array<{ day: number; monthOffset: -1 | 0 | 1; date: Date }> = [];

    // Mengisi hari dari bulan sebelumnya
    const prevMonthTotal = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = firstWeekday - 1; i >= 0; i -= 1) {
      const day = prevMonthTotal - i;
      cells.push({
        day,
        monthOffset: -1,
        date: new Date(currentYear, currentMonth - 1, day),
      });
    }

    // Mengisi hari pada bulan berjalan
    for (let day = 1; day <= totalDays; day += 1) {
      cells.push({
        day,
        monthOffset: 0,
        date: new Date(currentYear, currentMonth, day),
      });
    }

    // Mengisi sisa grid dengan hari bulan berikutnya agar selalu kelipatan 7
    while (cells.length % 7 !== 0) {
      const day = cells.length - (firstWeekday + totalDays) + 1;
      cells.push({
        day,
        monthOffset: 1,
        date: new Date(currentYear, currentMonth + 1, day),
      });
    }

    return cells;
  }, [currentMonth, currentYear]);

  // Mengubah objek Date menjadi string key untuk kebutuhan mapping data (tanpa padding)
  const toDateKey = (date: Date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  // Mengubah objek Date menjadi format ISO-like (YYYY-MM-DD)
  const toIsoDateKey = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  // Key tanggal yang dipilih (format tanpa padding)
  const selectedKey = selectedDate ? toDateKey(selectedDate) : '';
  // Key tanggal yang dipilih (format ISO YYYY-MM-DD)
  const selectedIsoKey = selectedDate ? toIsoDateKey(selectedDate) : '';

  // Memuat data sesi pendakian dan mengelompokkannya berdasarkan tanggal
  useEffect(() => {
    const loadSessions = async () => {
      setLoadingSessions(true);
      try {
        // Mengambil daftar sesi dari API
        const list = await fetchSessions();
        // Mengelompokkan data sesi berdasarkan tanggal (YYYY-MM-DD)
        const next: Record<string, { available: number; total: number }> = {};
        (list as Session[]).forEach((item) => {
          const isoKey = item.date.slice(0, 10);
          if (!next[isoKey]) {
            next[isoKey] = { available: 0, total: 0 };
          }
          next[isoKey].available += item.quotaAvailable;
          next[isoKey].total += item.quotaTotal;
        });
        setSessionsByDate(next);
      } catch {
        setSessionsByDate({});
      } finally {
        setLoadingSessions(false);
      }
    };
    void loadSessions();
  }, []);

  const getStatus = (date: Date): 'available' | 'full' | 'empty' => {
    const data = sessionsByDate[toIsoDateKey(date)];
    if (!data) return 'empty';
    if (data.available <= 0) return 'full';
    return 'available';
  };

  const moveMonth = (delta: number) => {
    const next = new Date(currentYear, currentMonth + delta, 1);
    setCurrentMonth(next.getMonth());
    setCurrentYear(next.getFullYear());
  };

  const selectedStatus = selectedDate ? getStatus(selectedDate) : null;
  const selectedQuota = selectedIsoKey ? sessionsByDate[selectedIsoKey] : undefined;
  const canContinue = !!selectedDate && selectedStatus === 'available';

  return (
    <AppScaffold title="Pilih Tanggal" variant="plain" onBackPress={() => navigation.goBack()}>
      <ScrollView style={styles.page} contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.subtitle}>Pilih tanggal pendakian</Text>
          <View style={styles.monthRow}>
            <Pressable style={styles.navBtn} onPress={() => moveMonth(-1)}>
              <Text style={styles.navBtnText}>{'<'}</Text>
            </Pressable>
            <Text style={styles.month}>{monthNames[currentMonth]} {currentYear}</Text>
            <Pressable style={styles.navBtn} onPress={() => moveMonth(1)}>
              <Text style={styles.navBtnText}>{'>'}</Text>
            </Pressable>
          </View>
          <View style={styles.yearRow}>
            {yearOptions.map((year) => (
              <Pressable key={year} style={[styles.yearChip, year === currentYear && styles.yearChipActive]} onPress={() => setCurrentYear(year)}>
                <Text style={[styles.yearChipText, year === currentYear && styles.yearChipTextActive]}>{year}</Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.weekRow}>{days.map((d) => <Text key={d} style={styles.day}>{d}</Text>)}</View>
          <View style={styles.grid}>
            {calendarCells.map((cell) => {
              const status = getStatus(cell.date);
              const isSelected = selectedKey === toDateKey(cell.date);
              const isOtherMonth = cell.monthOffset !== 0;
              return (
                <Pressable
                  key={`${cell.day}-${cell.monthOffset}-${toDateKey(cell.date)}`}
                  onPress={() => !isOtherMonth && setSelectedDate(cell.date)}
                  style={[
                    styles.dateCell,
                    isSelected && styles.dateActive,
                    status === 'full' && !isSelected && styles.dateFull,
                    status === 'empty' && !isSelected && !isOtherMonth && styles.dateEmpty,
                    isOtherMonth && styles.dateOtherMonth,
                  ]}
                >
                  <Text style={[styles.dateText, (isSelected || status === 'full') && styles.dateTextAlt, isOtherMonth && styles.dateOtherMonthText]}>
                    {cell.day}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={styles.legend}>
            <Text style={{ color: '#135efd' }}>* Tersedia</Text>   <Text style={{ color: '#DC2626' }}>* Penuh</Text>   <Text style={{ color: '#94A3B8' }}>* Belum ada jadwal</Text>
          </Text>
          <View style={styles.selectedBox}>
            <Text style={styles.selectedLabel}>Tanggal Terpilih</Text>
            <Text style={styles.selectedDate}>
              {selectedDate
                ? selectedDate.toLocaleDateString('id-ID', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })
                : '-'}
            </Text>
            <Text style={styles.selectedQuota}>
              {selectedDate
                ? selectedStatus === 'full'
                  ? 'Kuota penuh'
                  : selectedStatus === 'empty'
                    ? 'Belum ada jadwal pendakian di tanggal ini'
                    : `Kuota Tersedia: ${selectedQuota?.available ?? 0}/${selectedQuota?.total ?? 0}`
                : 'Pilih tanggal dulu'}
            </Text>
          </View>
          {loadingSessions ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="small" color="#135efd" />
              <Text style={styles.loadingText}>Memuat kuota live...</Text>
            </View>
          ) : null}
          <Pressable style={[styles.button, !canContinue && styles.buttonDisabled]} disabled={!canContinue} onPress={() => navigation.navigate('SelectSession')}>
            <Text style={styles.buttonText}>Lanjutkan</Text>
          </Pressable>
        </View>
      </ScrollView>
    </AppScaffold>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F3F5F8' },
  content: { padding: 14, paddingBottom: 110 },
  card: { borderRadius: 12, borderWidth: 1, borderColor: '#DFE5EE', backgroundColor: '#fff', padding: 12 },
  subtitle: { color: '#64748B', fontSize: 13, textAlign: 'center', marginTop: 2 },
  monthRow: { marginTop: 10, marginBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  month: { color: '#0F172A', fontWeight: '800', fontSize: 24, textAlign: 'center' },
  navBtn: { width: 34, height: 34, borderRadius: 17, borderWidth: 1, borderColor: '#D5DEE9', alignItems: 'center', justifyContent: 'center' },
  navBtnText: { fontSize: 16, fontWeight: '800', color: '#334155' },
  yearRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  yearChip: { borderRadius: 999, borderWidth: 1, borderColor: '#D6DEE8', paddingHorizontal: 10, paddingVertical: 4 },
  yearChipActive: { backgroundColor: '#135efd', borderColor: '#135efd' },
  yearChipText: { color: '#475569', fontSize: 12, fontWeight: '700' },
  yearChipTextActive: { color: '#fff' },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  day: { width: 36, textAlign: 'center', color: '#64748B', fontSize: 12, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  dateCell: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  dateActive: { backgroundColor: '#135efd' },
  dateFull: { backgroundColor: '#DC2626' },
  dateEmpty: { backgroundColor: '#EEF2F7' },
  dateOtherMonth: { backgroundColor: '#F8FAFC' },
  dateText: { color: '#334155', fontSize: 12, fontWeight: '700' },
  dateTextAlt: { color: '#fff' },
  dateOtherMonthText: { color: '#A0AEC0' },
  legend: { marginTop: 12, color: '#64748B', fontSize: 12 },
  selectedBox: { marginTop: 12, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#fff', padding: 12 },
  selectedLabel: { color: '#64748B', fontSize: 12 },
  selectedDate: { color: '#0F172A', fontSize: 18, fontWeight: '900', marginTop: 6, textTransform: 'capitalize' },
  selectedQuota: { color: '#334155', fontSize: 13, marginTop: 4 },
  loadingWrap: { marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 8 },
  loadingText: { color: '#475569', fontSize: 12, fontWeight: '600' },
  button: { marginTop: 14, borderRadius: 10, backgroundColor: '#135efd', paddingVertical: 12, alignItems: 'center' },
  buttonDisabled: { backgroundColor: '#A8B8C8' },
  buttonText: { color: '#fff', fontWeight: '800' },
});
