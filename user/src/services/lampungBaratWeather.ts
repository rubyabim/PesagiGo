export type LampungBaratWeather = {
  location: string;
  source: string;
  temperatureC: number;
  feelsLikeC: number;
  humidity: number;
  windKph: number;
  description: string;
  condition: string;
  observedAt: string;
};

type OpenWeatherResponse = {
  weather: Array<{ main: string; description: string }>;
  main: { temp: number; feels_like: number; humidity: number };
  wind: { speed: number };
  dt: number;
  name?: string;
};

const WEATHER_API_KEY = process.env.EXPO_PUBLIC_LAMPUNG_BARAT_WEATHER_KEY || 'bf3ded2cb07acebbd5f851df478bfa9e';

// Koordinat area Gunung Pesagi / jalur Papahan, Lampung Barat.
const LAMPUNG_BARAT_COORDS = {
  lat: -5.0386,
  lon: 104.0752,
};

export async function fetchLampungBaratWeather(): Promise<LampungBaratWeather> {
  const params = new URLSearchParams({
    lat: String(LAMPUNG_BARAT_COORDS.lat),
    lon: String(LAMPUNG_BARAT_COORDS.lon),
    appid: WEATHER_API_KEY,
    units: 'metric',
    lang: 'id',
  });

  const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?${params.toString()}`);

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Gagal mengambil cuaca Lampung Barat: ${response.status} ${body}`);
  }

  const payload = (await response.json()) as OpenWeatherResponse;

  return {
    location: 'Gunung Pesagi via Papahan, Lampung Barat',
    source: payload.name ? `OpenWeather API (${payload.name})` : 'OpenWeather API',
    temperatureC: payload.main.temp,
    feelsLikeC: payload.main.feels_like,
    humidity: payload.main.humidity,
    windKph: Math.round((payload.wind.speed ?? 0) * 3.6),
    description: payload.weather?.[0]?.description ?? 'Tidak ada deskripsi cuaca',
    condition: payload.weather?.[0]?.main ?? 'UNKNOWN',
    observedAt: new Date((payload.dt ?? Date.now() / 1000) * 1000).toISOString(),
  };
}
