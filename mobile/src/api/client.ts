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
  quotaAvailable: number;
  price: number;
  mountain: {
    id: string;
    name: string;
    location: string;
  };
};

export type WeatherForecast = {
  id: string;
  forecastDate: string;
  summary: string;
  mountain: {
    id: string;
    name: string;
    location: string;
  };
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

export function registerUser(payload: {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
}) {
  return apiRequest<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: payload,
  });
}

export function loginUser(payload: { email: string; password: string }) {
  return apiRequest<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: payload,
  });
}

export function fetchMountains() {
  return apiRequest<Mountain[]>('/api/mountains');
}

export function fetchSessions() {
  return apiRequest<Session[]>('/api/sessions');
}

export function fetchWeather() {
  return apiRequest<WeatherForecast[]>('/api/weather');
}

export function createBooking(token: string, payload: { sessionId: string; quantity: number }) {
  return apiRequest<Booking>('/api/bookings', {
    method: 'POST',
    token,
    body: payload,
  });
}

export function fetchMyBookings(token: string) {
  return apiRequest<Booking[]>('/api/bookings/my', { token });
}

export function payBooking(token: string, bookingId: string, payload: { method: string }) {
  return apiRequest<{ message: string; booking: Booking }>(`/api/bookings/${bookingId}/pay`, {
    method: 'POST',
    token,
    body: payload,
  });
}

export function fetchTicket(token: string, bookingId: string) {
  return apiRequest<TicketResponse>(`/api/bookings/${bookingId}/ticket`, { token });
}
