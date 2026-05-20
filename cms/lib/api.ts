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
  return (
    process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || "http://localhost:3001"
  );
}

export function getAuthBaseUrl() {
  return process.env.NEXT_PUBLIC_AUTH_BASE_URL?.trim() || getApiBaseUrl();
}

async function requestJson<T>(
  baseUrl: string,
  path: string,
  options: {
    method?: "GET" | "POST" | "PATCH" | "DELETE";
    token?: string;
    body?: unknown;
  } = {},
): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const response = await fetch(`${baseUrl}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
  });

  if (!response.ok) {
    let message = `API returned ${response.status}`;
    try {
      const errorData = (await response.json()) as {
        message?: string | string[];
      };
      if (Array.isArray(errorData.message)) {
        message = errorData.message.join(", ");
      } else if (errorData.message) {
        message = errorData.message;
      }
    } catch {}
    throw new Error(message);
  }

  return (await response.json()) as T;
}

async function apiRequest<T>(
  path: string,
  options: {
    method?: "GET" | "POST" | "PATCH" | "DELETE";
    token?: string;
    body?: unknown;
  } = {},
): Promise<T> {
  return requestJson<T>(getApiBaseUrl(), path, options);
}

async function authRequest<T>(
  path: string,
  options: {
    method?: "GET" | "POST" | "PATCH" | "DELETE";
    token?: string;
    body?: unknown;
  } = {},
): Promise<T> {
  return requestJson<T>(getAuthBaseUrl(), path, options);
}

export function fetchApiHealth() {
  return apiRequest<ApiHealth>("/api/health");
}

export function registerUser(payload: {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
}) {
  return authRequest<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: payload,
  });
}

export function loginUser(payload: { email: string; password: string }) {
  return authRequest<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: payload,
  });
}

export function fetchCurrentUser(token: string) {
  return authRequest<ApiUser>("/api/auth/me", {
    token,
  });
}

export function fetchMountains() {
  return apiRequest<Mountain[]>("/api/mountains");
}

export function fetchSessions(params?: { mountainId?: string; date?: string }) {
  const query = new URLSearchParams();
  if (params?.mountainId) {
    query.set("mountainId", params.mountainId);
  }
  if (params?.date) {
    query.set("date", params.date);
  }
  const suffix = query.size > 0 ? `?${query.toString()}` : "";
  return apiRequest<Session[]>(`/api/sessions${suffix}`);
}

export function fetchWeather(params?: { mountainId?: string; date?: string }) {
  const query = new URLSearchParams();
  if (params?.mountainId) {
    query.set("mountainId", params.mountainId);
  }
  if (params?.date) {
    query.set("date", params.date);
  }
  const suffix = query.size > 0 ? `?${query.toString()}` : "";
  return apiRequest<WeatherForecast[]>(`/api/weather${suffix}`);
}

export function createBooking(
  token: string,
  payload: { sessionId: string; quantity: number },
) {
  return apiRequest<Booking>("/api/bookings", {
    method: "POST",
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
    method: "POST",
    token,
    body: payload,
  });
}

export function fetchMyBookings(token: string) {
  return apiRequest<Booking[]>("/api/bookings/my", {
    token,
  });
}

export function fetchTicket(token: string, bookingId: string) {
  return apiRequest<TicketResponse>(`/api/bookings/${bookingId}/ticket`, {
    token,
  });
}

export function runSeed() {
  return apiRequest<{ message: string }>("/api/seed", {
    method: "POST",
  });
}

export type AdminTrail = {
  id: string;
  mountainId: string;
  name: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  distanceKm: number;
  estimatedHours: number;
  description: string;
  mountain: {
    id: string;
    name: string;
    location: string;
  };
  createdAt: string;
  updatedAt: string;
};

export type AdminBooking = {
  id: string;
  userId: string;
  sessionId: string;
  quantity: number;
  totalPrice: number;
  status: 'PENDING_PAYMENT' | 'PAID' | 'CANCELLED';
  ticketCode: string | null;
  ticketStatus: 'ACTIVE' | 'EXPIRED' | 'NOT_AVAILABLE';
  ticketExpiresAt: string;
  createdAt: string;
  user: {
    id: string;
    fullName: string;
    email: string;
  };
  session: {
    id: string;
    date: string;
    mountain: {
      id: string;
      name: string;
    };
  };
  payment: {
    id: string;
    method: string;
    amount: number;
    status: 'PENDING' | 'SUCCESS' | 'FAILED';
    paidAt: string | null;
  } | null;
};

export type AdminPayment = {
  id: string;
  bookingId: string;
  method: string;
  providerRef: string | null;
  amount: number;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  paidAt: string | null;
  createdAt: string;
  booking: {
    id: string;
    status: string;
    user: {
      id: string;
      fullName: string;
      email: string;
    };
  };
};

export type AdminQuota = {
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

export type AdminTicketSalesSummary = {
  soldDaily: number;
  soldMonthly: number;
  soldTotal: number;
  generatedAt: string;
};

export type AdminWeather = {
  id: string;
  mountainId: string;
  forecastDate: string;
  condition: 'SUNNY' | 'CLOUDY' | 'LIGHT_RAIN' | 'HEAVY_RAIN' | 'STORM' | 'FOG';
  temperatureC: number;
  windKph: number | null;
  note: string | null;
  mountain: {
    id: string;
    name: string;
    location: string;
  };
};

export function fetchAdminRoutes(token: string) {
  return apiRequest<AdminTrail[]>('/api/admin/routes', { token });
}

export function createAdminRoute(
  token: string,
  payload: {
    mountainId: string;
    name: string;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    distanceKm: number;
    estimatedHours: number;
    description: string;
  },
) {
  return apiRequest<AdminTrail>('/api/admin/routes', {
    method: 'POST',
    token,
    body: payload,
  });
}

export function updateAdminRoute(
  token: string,
  id: string,
  payload: Partial<{
    mountainId: string;
    name: string;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    distanceKm: number;
    estimatedHours: number;
    description: string;
  }>,
) {
  return apiRequest<AdminTrail>(`/api/admin/routes/${id}`, {
    method: 'PATCH',
    token,
    body: payload,
  });
}

export function deleteAdminRoute(token: string, id: string) {
  return apiRequest<{ message: string }>(`/api/admin/routes/${id}`, {
    method: 'DELETE',
    token,
  });
}

export function fetchAdminBookings(token: string) {
  return apiRequest<AdminBooking[]>('/api/admin/bookings', { token });
}

export function fetchAdminTicketSalesSummary(token: string) {
  return apiRequest<AdminTicketSalesSummary>('/api/admin/analytics/tickets', {
    token,
  });
}

export function fetchAdminTicketHistory(token: string) {
  return apiRequest<AdminBooking[]>('/api/admin/tickets/history', { token });
}

export function updateAdminBooking(
  token: string,
  id: string,
  payload: Partial<{ status: 'PENDING_PAYMENT' | 'PAID' | 'CANCELLED'; quantity: number }>,
) {
  return apiRequest<AdminBooking>(`/api/admin/bookings/${id}`, {
    method: 'PATCH',
    token,
    body: payload,
  });
}

export function deleteAdminBooking(token: string, id: string) {
  return apiRequest<{ message: string }>(`/api/admin/bookings/${id}`, {
    method: 'DELETE',
    token,
  });
}

export function fetchAdminPayments(token: string) {
  return apiRequest<AdminPayment[]>('/api/admin/payments', { token });
}

export function createAdminPayment(
  token: string,
  payload: {
    bookingId: string;
    method: string;
    amount: number;
    status: 'PENDING' | 'SUCCESS' | 'FAILED';
    providerRef?: string;
    paidAt?: string;
  },
) {
  return apiRequest<AdminPayment>('/api/admin/payments', {
    method: 'POST',
    token,
    body: payload,
  });
}

export function updateAdminPayment(
  token: string,
  id: string,
  payload: Partial<{
    method: string;
    amount: number;
    status: 'PENDING' | 'SUCCESS' | 'FAILED';
    providerRef: string;
    paidAt: string;
  }>,
) {
  return apiRequest<AdminPayment>(`/api/admin/payments/${id}`, {
    method: 'PATCH',
    token,
    body: payload,
  });
}

export function deleteAdminPayment(token: string, id: string) {
  return apiRequest<{ message: string }>(`/api/admin/payments/${id}`, {
    method: 'DELETE',
    token,
  });
}

export function fetchAdminQuotas(token: string) {
  return apiRequest<AdminQuota[]>('/api/admin/quotas', { token });
}

export function createAdminQuota(
  token: string,
  payload: {
    mountainId: string;
    date: string;
    quotaTotal: number;
    price: number;
  },
) {
  return apiRequest<AdminQuota>('/api/admin/quotas', {
    method: 'POST',
    token,
    body: payload,
  });
}

export function updateAdminQuota(
  token: string,
  id: string,
  payload: Partial<{
    date: string;
    quotaTotal: number;
    quotaBooked: number;
    price: number;
  }>,
) {
  return apiRequest<AdminQuota>(`/api/admin/quotas/${id}`, {
    method: 'PATCH',
    token,
    body: payload,
  });
}

export function deleteAdminQuota(token: string, id: string) {
  return apiRequest<{ message: string }>(`/api/admin/quotas/${id}`, {
    method: 'DELETE',
    token,
  });
}

export function fetchAdminWeather(token: string) {
  return apiRequest<AdminWeather[]>('/api/admin/weather', { token });
}

export function createAdminWeather(
  token: string,
  payload: {
    mountainId: string;
    forecastDate: string;
    condition: 'SUNNY' | 'CLOUDY' | 'LIGHT_RAIN' | 'HEAVY_RAIN' | 'STORM' | 'FOG';
    temperatureC: number;
    windKph?: number;
    note?: string;
  },
) {
  return apiRequest<AdminWeather>('/api/admin/weather', {
    method: 'POST',
    token,
    body: payload,
  });
}

export function updateAdminWeather(
  token: string,
  id: string,
  payload: Partial<{
    forecastDate: string;
    condition: 'SUNNY' | 'CLOUDY' | 'LIGHT_RAIN' | 'HEAVY_RAIN' | 'STORM' | 'FOG';
    temperatureC: number;
    windKph: number;
    note: string;
  }>,
) {
  return apiRequest<AdminWeather>(`/api/admin/weather/${id}`, {
    method: 'PATCH',
    token,
    body: payload,
  });
}

export function deleteAdminWeather(token: string, id: string) {
  return apiRequest<{ message: string }>(`/api/admin/weather/${id}`, {
    method: 'DELETE',
    token,
  });
}
