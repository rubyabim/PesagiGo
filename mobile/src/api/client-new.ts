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

export type Announcement = {
  id: string;
  title: string;
  content: string;
  level: 'INFO' | 'WARNING' | 'DANGER';
  imageUrl?: string | null;
  mapUrl?: string | null;
  createdAt: string;
};

export type RuleItem = {
  id: string;
  title: string;
  description: string;
  imageUrl?: string | null;
  createdAt: string;
};

export type NewsItem = {
  id: string;
  title: string;
  description: string;
  imageUrl?: string | null;
  mapUrl?: string | null;
  publishedAt?: string | null;
  createdAt: string;
};

export type Booking = {
  id: string;
  quantity: number;
  status: string;
  totalPrice: number;
  ticketCode?: string | null;
  session: {
    mountain: {
      name: string;
    };
    date: string;
  };
};

export type TicketResponse = {
  ticketCode: string;
  ticketPdfUrl: string;
  bookingId: string;
  mountain: string;
  climbDate: string;
  quantity: number;
};

type ApiRequestOptions = {
  method?: 'GET' | 'POST';
  token?: string;
  body?: unknown;
};

async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    let message = `API returned ${response.status}`;
    try {
      const data = (await response.json()) as { message?: string | string[] };
      if (Array.isArray(data.message)) {
        message = data.message.join(', ');
      } else if (data.message) {
        message = data.message;
      }
    } catch {
      // Keep default message.
    }

    throw new Error(message);
  }

  return (await response.json()) as T;
}

export function fetchApiHealth() {
  return apiRequest<ApiHealth>('/api/health');
}

export function runSeed() {
  return apiRequest<{ message: string }>('/api/seed', { method: 'POST' });
}
