import { getApiBaseUrl } from '../config/api';

export type ApiHealth = {
  status: string;
  service: string;
  timestamp: string;
};

export type AuthResponse = {
  message: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    role: string;
  };
  accessToken: string;
};

export type Mountain = {
  id: string;
  name: string;
  location: string;
};

export type Session = {
  id: string;
  mountainId: string;
  date: string;
  quotaTotal: number;
  quotaBooked: number;
  quotaAvailable: number;
  price: number;
  mountain: {
    id: string;
    name: string;
    location: string;
    description?: string;
    bestSeason?: string | null;
  };
};

export type WeatherForecast = {
  id: string;
  forecastDate: string;
  condition: 'SUNNY' | 'CLOUDY' | 'LIGHT_RAIN' | 'HEAVY_RAIN' | 'STORM' | 'FOG';
  temperatureC: number;
  windKph?: number | null;
  note?: string | null;
  mountain: {
    id: string;
    name: string;
    location: string;
  };
};
