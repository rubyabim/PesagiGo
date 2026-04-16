// Tipe ini menyimpan status kesehatan layanan API.
export type ApiHealth = {
  status: string;
  service: string;
  timestamp: string;
};

export type ApiUser = {
  id: string;
  fullName: string;
  email: string;
  role: string;
};

export type AuthResponse = {
  message: string;
  user: ApiUser;
  accessToken: string;
};

// Tipe gunung dan jalur untuk kebutuhan katalog pendakian.
export type Mountain = {
  id: string;
  name: string;
  location: string;
  elevationM: number;
  description?: string | null;
  trails?: Trail[];
};

export type Trail = {
  id: string;
  name: string;
  difficulty: string;
  distanceKm: number;
  estimatedHours: number;
};

// Tipe sesi cuaca booking dan tiket untuk alur transaksi.
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
  };
};

export type WeatherForecast = {
  id: string;
  mountainId: string;
  forecastDate: string;
  summary: string;
  temperatureC: number;
  windKph: number;
  rainChancePct: number;
  mountain: {
    id: string;
    name: string;
    location: string;
  };
};

export type Booking = {
  id: string;
  userId: string;
  sessionId: string;
  quantity: number;
  totalPrice: number;
  status: string;
  ticketCode?: string | null;
  ticketPdfUrl?: string | null;
  createdAt: string;
  session: Session;
  payment?: {
    id: string;
    method: string;
    amount: number;
    status: string;
    paidAt: string | null;
  } | null;
};

export type BookingPaymentResponse = {
  message: string;
  booking: Booking;
};

export type TicketResponse = {
  ticketCode: string;
  ticketPdfUrl: string;
  bookingId: string;
  mountain: string;
  climbDate: string;
  quantity: number;
};

export function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || 'http://localhost:3001';
}

async function apiRequest<T>(
  path: string,
  options: {
    method?: 'GET' | 'POST';
    token?: string;
    body?: unknown;
  } = {},
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: 'no-store',
  });

  if (!response.ok) {
    let message = `API returned ${response.status}`;
    try {
      const errorData = (await response.json()) as { message?: string | string[] };
      if (Array.isArray(errorData.message)) {
        message = errorData.message.join(', ');
      } else if (errorData.message) {
        message = errorData.message;
      }
    } catch {
      // Ignore parsing errors and use default status-based message.
    }
    throw new Error(message);
  }

  return (await response.json()) as T;
}

export function fetchApiHealth() {
  return apiRequest<ApiHealth>('/api/health');
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

export function fetchSessions(params?: { mountainId?: string; date?: string }) {
  const query = new URLSearchParams();
  if (params?.mountainId) {
    query.set('mountainId', params.mountainId);
  }
  if (params?.date) {
    query.set('date', params.date);
  }
  const suffix = query.size > 0 ? `?${query.toString()}` : '';
  return apiRequest<Session[]>(`/api/sessions${suffix}`);
}

export function fetchWeather(params?: { mountainId?: string; date?: string }) {
  const query = new URLSearchParams();
  if (params?.mountainId) {
    query.set('mountainId', params.mountainId);
  }
  if (params?.date) {
    query.set('date', params.date);
  }
  const suffix = query.size > 0 ? `?${query.toString()}` : '';
  return apiRequest<WeatherForecast[]>(`/api/weather${suffix}`);
}

export function createBooking(
  token: string,
  payload: { sessionId: string; quantity: number },
) {
  return apiRequest<Booking>('/api/bookings', {
    method: 'POST',
    token,
    body: payload,
  });
}

export function payBooking(
  token: string,
  bookingId: string,
  payload: { method: string },
) {
  return apiRequest<BookingPaymentResponse>(`/api/bookings/${bookingId}/pay`, {
    method: 'POST',
    token,
    body: payload,
  });
}

export function fetchMyBookings(token: string) {
  return apiRequest<Booking[]>('/api/bookings/my', {
    token,
  });
}

export function fetchTicket(token: string, bookingId: string) {
  return apiRequest<TicketResponse>(`/api/bookings/${bookingId}/ticket`, {
    token,
  });
}

export function runSeed() {
  return apiRequest<{ message: string }>('/api/seed', {
    method: 'POST',
  });
}
