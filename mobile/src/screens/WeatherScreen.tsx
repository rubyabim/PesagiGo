import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import {
  fetchRealtimePesagiWeather,
  fetchWeather as fetchBackendWeather,
  RealtimeWeather,
  WeatherForecast,
} from '../api/client';
import realtimeService from '../services/realtimeService';
import AppScaffold from './common/AppScaffold';

const conditionLabels: Record<string, string> = {
  SUNNY: 'Cerah',
  CLOUDY: 'Berawan',
  LIGHT_RAIN: 'Hujan Ringan',
  HEAVY_RAIN: 'Hujan Lebat',
  STORM: 'Badai',
  FOG: 'Berkabut',
  Clear: 'Cerah',
  Clouds: 'Berawan',
  Rain: 'Hujan',
  Drizzle: 'Gerimis',
  Thunderstorm: 'Badai Petir',
  Mist: 'Berkabut',
  Haze: 'Berkabut',
  Fog: 'Berkabut',
};

const getConditionLabel = (condition: string, fallback?: string) => {
  const label = conditionLabels[condition] ?? fallback ?? condition;
  return label.charAt(0).toUpperCase() + label.slice(1);
};

const getWeatherTone = (condition: string) => {
  if (condition === 'STORM' || condition === 'Thunderstorm') {
    return { label: 'Waspada badai', color: '#f97316' };
  }
  if (condition === 'HEAVY_RAIN' || condition === 'Rain') {
    return { label: 'Siapkan jas hujan', color: '#5eead4' };
  }
  if (condition === 'LIGHT_RAIN' || condition === 'Drizzle') {
    return { label: 'Hujan ringan', color: '#99f6e4' };
  }
  if (condition === 'FOG' || condition === 'Mist' || condition === 'Haze' || condition === 'Fog') {
    return { label: 'Jarak pandang terbatas', color: '#cbd5e1' };
  }
  return { label: 'Aman dipantau', color: '#bbf7d0' };
};

const formatObservedDate = (dateValue: string) => {
  const date = new Date(dateValue);
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
};

const formatObservedTime = (dateValue: string) => {
  const date = new Date(dateValue);
  return new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const fallbackWeather = {
  location: 'Gunung Pesagi, Lampung Barat',
  condition: 'Clouds',
  description: 'Berawan',
  temperatureC: 24,
  feelsLikeC: 24,
  humidity: 82,
  windKph: 8,
  observedAt: new Date().toISOString(),
  source: 'Mode tampilan sementara',
};

const WeatherScreen = () => {
  const [weather, setWeather] = useState<WeatherForecast[]>([]);
  const [lampungBaratWeather, setLampungBaratWeather] =
    useState<RealtimeWeather | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    void loadWeatherData();
  }, []);

  useEffect(() => {
    realtimeService.connect();

    const refreshWeather = async (event?: { scope?: string }) => {
      if (event?.scope && event.scope !== 'weather') {
        return;
      }

      await loadWeatherData();
    };

    const removeRefresh = realtimeService.onAppRefresh(refreshWeather);
    const removeWeather = realtimeService.onWeatherUpdate(() => {
      void loadWeatherData();
    });

    return () => {
      removeRefresh();
      removeWeather();
    };
  }, []);

  const loadWeatherData = async () => {
    try {
      const [backendResult, realtimeResult] = await Promise.allSettled([
        fetchBackendWeather(),
        fetchRealtimePesagiWeather(),
      ]);

      if (backendResult.status === 'fulfilled') {
        setWeather(backendResult.value);
      } else {
        setWeather([]);
      }

      setLampungBaratWeather(
        realtimeResult.status === 'fulfilled' ? realtimeResult.value : null,
      );
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWeatherData();
    setRefreshing(false);
  };

  const mainWeather = useMemo(() => {
    if (lampungBaratWeather) {
      return {
        location: lampungBaratWeather.location,
        condition: lampungBaratWeather.condition,
        description: lampungBaratWeather.description,
        temperatureC: lampungBaratWeather.temperatureC,
        feelsLikeC: lampungBaratWeather.feelsLikeC,
        humidity: lampungBaratWeather.humidity,
        windKph: lampungBaratWeather.windKph,
        observedAt: lampungBaratWeather.observedAt,
        source: lampungBaratWeather.source,
      };
    }

    const forecast = weather[0];
    if (!forecast) {
      return fallbackWeather;
    }

    return {
      location: forecast.mountain?.name ?? 'Gunung Pesagi',
      condition: forecast.condition,
      description: getConditionLabel(forecast.condition),
      temperatureC: forecast.temperatureC,
      feelsLikeC: forecast.temperatureC,
      humidity: 0,
      windKph: forecast.windKph ?? 0,
      observedAt: forecast.forecastDate,
      source: 'Backend Weather Service',
    };
  }, [lampungBaratWeather, weather]);

  if (loading) {
    return (
      <AppScaffold title="Cuaca">
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#135efd" />
          <Text style={styles.loadingText}>Memuat cuaca terbaru...</Text>
        </View>
      </AppScaffold>
    );
  }

  const conditionLabel = getConditionLabel(mainWeather.condition, mainWeather.description);
  const tone = getWeatherTone(mainWeather.condition);
  const rainForecasts = weather.filter((item) =>
    ['LIGHT_RAIN', 'HEAVY_RAIN', 'STORM'].includes(item.condition),
  );

  return (
    <AppScaffold title="Cuaca">
      <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#ffffff"
        />
      }
      >
      <View style={styles.heroCard}>
        <View style={styles.topBar}>
          <View style={styles.brandRow}>
            <View style={styles.brandDot}>
              <FontAwesome name="leaf" size={12} color="#dcfce7" />
            </View>
            <Text style={styles.brandText}>PesagiGo Weather</Text>
          </View>
          <Text style={styles.timeText}>{formatObservedTime(mainWeather.observedAt)} WIB</Text>
        </View>

        <View style={styles.heroMain}>
          <View style={styles.heroCopy}>
            <Text style={styles.dayText}>{formatObservedDate(mainWeather.observedAt)}</Text>
            <Text style={styles.conditionTitle}>{conditionLabel}</Text>
            <Text style={styles.conditionSubtitle}>
              Cuaca terkini di {mainWeather.location}. Data disajikan dalam bahasa Indonesia
              untuk membantu persiapan pendakian.
            </Text>
          </View>

          <View style={styles.temperatureWrap}>
            <Text style={styles.temperatureValue}>{Math.round(mainWeather.temperatureC)}°</Text>
            <Text style={styles.temperatureUnit}>C</Text>
          </View>
        </View>

        <View style={styles.cloudScene}>
          <View style={[styles.cloudBubble, styles.cloudOne]} />
          <View style={[styles.cloudBubble, styles.cloudTwo]} />
          <View style={[styles.cloudBubble, styles.cloudThree]} />
          <View style={styles.rainLines}>
            {[0, 1, 2, 3, 4, 5].map((line) => (
              <View key={line} style={styles.rainLine} />
            ))}
          </View>
        </View>

        <View style={styles.metricRow}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Terasa</Text>
            <Text style={styles.metricValue}>{Math.round(mainWeather.feelsLikeC)}°C</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Kelembapan</Text>
            <Text style={styles.metricValue}>
              {mainWeather.humidity > 0 ? `${mainWeather.humidity}%` : '-'}
            </Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Angin</Text>
            <Text style={styles.metricValue}>{mainWeather.windKph} km/jam</Text>
          </View>
        </View>

        <View style={styles.statusStrip}>
          <View style={[styles.statusDot, { backgroundColor: tone.color }]} />
          <Text style={styles.statusText}>{tone.label}</Text>
          <Text style={styles.sourceText}>Sumber: {mainWeather.source}</Text>
        </View>
      </View>

      <View style={styles.forecastPanel}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Prakiraan Gunung</Text>
          <Text style={styles.sectionCount}>{weather.length} data</Text>
        </View>

        {weather.length === 0 ? (
          <Text style={styles.emptyForecast}>Belum ada prakiraan cuaca dari backend.</Text>
        ) : (
          weather.slice(0, 5).map((forecast) => (
            <View key={forecast.id} style={styles.forecastRow}>
              <View style={styles.forecastIcon}>
                <FontAwesome
                  name={forecast.condition === 'SUNNY' ? 'sun-o' : forecast.condition === 'CLOUDY' ? 'cloud' : 'tint'}
                  size={18}
                  color="#166534"
                />
              </View>
              <View style={styles.forecastTextWrap}>
                <Text style={styles.forecastTitle}>{forecast.mountain?.name ?? 'Gunung'}</Text>
                <Text style={styles.forecastDate}>
                  {formatObservedDate(forecast.forecastDate)}
                </Text>
              </View>
              <View style={styles.forecastRight}>
                <Text style={styles.forecastTemp}>{Math.round(forecast.temperatureC)}°C</Text>
                <Text style={styles.forecastCondition}>{getConditionLabel(forecast.condition)}</Text>
              </View>
            </View>
          ))
        )}
      </View>

      <View style={styles.adviceCard}>
        <Text style={styles.adviceTitle}>Catatan Pendakian Hari Ini</Text>
        <Text style={styles.adviceText}>
          {rainForecasts.length > 0
            ? 'Ada potensi hujan pada beberapa prakiraan. Gunakan pelindung hujan, cek jalur, dan hindari pendakian saat badai.'
            : 'Cuaca relatif aman dipantau. Tetap cek informasi resmi sebelum berangkat dan siapkan perlengkapan dasar.'}
        </Text>
      </View>
      </ScrollView>
    </AppScaffold>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f7f5',
  },
  content: {
    padding: 16,
    paddingBottom: 126,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f7f5',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    color: '#166534',
    fontSize: 14,
    fontWeight: '700',
  },
  emptyTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '900',
  },
  emptyText: {
    marginTop: 8,
    color: '#dcfce7',
    textAlign: 'center',
    lineHeight: 20,
  },
  heroCard: {
    minHeight: 430,
    borderRadius: 28,
    overflow: 'hidden',
    padding: 18,
    backgroundColor: '#0b1220',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    shadowColor: '#000000',
    shadowOpacity: 0.24,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 16 },
    elevation: 12,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15,159,118,0.24)',
    borderWidth: 1,
    borderColor: 'rgba(187,247,208,0.28)',
  },
  brandText: {
    color: '#eef6ff',
    fontSize: 12,
    fontWeight: '800',
  },
  timeText: {
    color: '#eef6ff',
    fontSize: 12,
    fontWeight: '800',
  },
  heroMain: {
    marginTop: 28,
    gap: 14,
  },
  heroCopy: {
    flex: 1,
  },
  dayText: {
    color: '#fde68a',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  conditionTitle: {
    color: '#ffffff',
    fontSize: 36,
    lineHeight: 41,
    fontWeight: '800',
    marginTop: 10,
  },
  conditionSubtitle: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 10,
  },
  temperatureWrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    alignSelf: 'flex-start',
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  temperatureValue: {
    color: '#ffffff',
    fontSize: 58,
    lineHeight: 64,
    fontWeight: '300',
  },
  temperatureUnit: {
    color: '#dbe7e0',
    fontSize: 22,
    fontWeight: '700',
    marginTop: 12,
  },
  cloudScene: {
    height: 126,
    marginTop: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cloudBubble: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.88)',
    shadowColor: '#ffffff',
    shadowOpacity: 0.7,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 0 },
  },
  cloudOne: {
    width: 168,
    height: 64,
    borderRadius: 50,
  },
  cloudTwo: {
    width: 92,
    height: 92,
    borderRadius: 46,
    top: 28,
    left: 70,
  },
  cloudThree: {
    width: 104,
    height: 104,
    borderRadius: 52,
    top: 10,
    right: 72,
  },
  rainLines: {
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
    gap: 16,
  },
  rainLine: {
    width: 2,
    height: 34,
    borderRadius: 2,
    backgroundColor: 'rgba(187,247,208,0.72)',
    transform: [{ rotate: '14deg' }],
  },
  metricRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  metricItem: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    paddingVertical: 13,
    alignItems: 'center',
  },
  metricLabel: {
    color: '#dcfce7',
    fontSize: 12,
    fontWeight: '700',
  },
  metricValue: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 6,
  },
  statusStrip: {
    marginTop: 16,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.08)',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  statusDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
  },
  sourceText: {
    color: '#bbf7d0',
    fontSize: 12,
    fontWeight: '600',
  },
  forecastPanel: {
    marginTop: 16,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
    gap: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionTitle: {
    color: '#0f172a',
    fontSize: 18,
    fontWeight: '900',
  },
  sectionCount: {
    color: '#0f9f76',
    fontSize: 12,
    fontWeight: '800',
  },
  emptyForecast: {
    color: '#64748b',
    fontSize: 13,
    lineHeight: 19,
  },
  forecastRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 18,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
  },
  forecastIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ecfdf5',
  },
  forecastTextWrap: {
    flex: 1,
  },
  forecastTitle: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '900',
  },
  forecastDate: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
    textTransform: 'capitalize',
  },
  forecastRight: {
    alignItems: 'flex-end',
  },
  forecastTemp: {
    color: '#0f766e',
    fontSize: 16,
    fontWeight: '900',
  },
  forecastCondition: {
    color: '#0f9f76',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  adviceCard: {
    marginTop: 16,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  adviceTitle: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '900',
  },
  adviceText: {
    color: '#475569',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
  },
});

export default WeatherScreen;
