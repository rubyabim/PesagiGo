import { http } from '../core/http';

export type AuthResponse = {
  message?: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    role: string;
  };
  accessToken: string;
};

export type Announcement = {
  id: string;
  title: string;
  content: string;
  level?: 'INFO' | 'WARNING' | 'DANGER';
  imageUrl?: string;
  mapUrl?: string;
  createdAt?: string;
};

export type Rule = {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  createdAt?: string;
};

export type News = {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  mapUrl?: string;
  publishedAt?: string;
};

export type DashboardStats = {
  totalBookings: number;
  totalPayments: number;
  revenue: number;
  analytics?: Array<{ label: string; value: number }>;
};

export type GatewayDashboard = {
  locations: {
    total: number;
    data: Array<Record<string, unknown>>;
  };
  weather: {
    total: number;
    byMountain: Record<string, Array<Record<string, unknown>>>;
  };
  timestamp: string;
};

export type RouteItem = {
  id: string;
  mountainId?: string;
  mountain?: {
    id: string;
    name: string;
    location?: string;
  };
  name: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  distanceKm: number;
  estimatedHours: number;
  description: string;
};

export type BookingItem = {
  id: string;
  userName?: string;
  status: string;
  quantity: number;
  totalPrice: number;
  createdAt?: string;
};

export type PaymentItem = {
  id: string;
  bookingId: string;
  method: string;
  amount: number;
  status: 'pending' | 'success' | 'failed' | 'PENDING' | 'SUCCESS' | 'FAILED';
  createdAt?: string;
};

export type TicketItem = {
  id: string;
  code?: string;
  status?: string;
  createdAt?: string;
};

export type ScanTicketResult = {
  ticketCode: string | null;
  status: string;
  bookingId: string;
  mountain: string;
  climbDate: string;
  holder: string;
  paymentStatus: string | null;
};

export type QuotaItem = {
  id: string;
  mountainId?: string;
  mountain?: {
    id: string;
    name: string;
    location?: string;
  };
  date?: string;
  quotaTotal: number;
  quotaBooked: number;
  price?: number;
  quotaAvailable?: number;
};

export type MountainItem = {
  id: string;
  name: string;
  location: string;
};

export type Basecamp = {
  id: string;
  name?: string;
  latitude?: number;
  longitude?: number;
  mapUrl?: string;
};

export type WeatherCurrent = {
  condition?: string;
  temperatureC?: number;
  humidity?: number;
  windKph?: number;
};

export type WeatherForecast = {
  id?: string;
  date: string;
  condition: string;
  temperatureC?: number;
};

type BackendWeatherForecast = {
  id: string;
  forecastDate: string;
  condition: string;
  temperatureC?: number;
};

async function getData<T>(url: string) {
  const { data } = await http.get<T>(url);
  return data;
}

async function postData<T>(url: string, payload?: unknown) {
  const { data } = await http.post<T>(url, payload);
  return data;
}

async function putData<T>(url: string, payload?: unknown) {
  const { data } = await http.put<T>(url, payload);
  return data;
}

async function patchData<T>(url: string, payload?: unknown) {
  const { data } = await http.patch<T>(url, payload);
  return data;
}

async function deleteData<T>(url: string) {
  const { data } = await http.delete<T>(url);
  return data;
}

export const ApiService = {
  register: (payload: { fullName: string; email: string; password: string }) =>
    postData<AuthResponse>('/auth/register', payload),
  login: (payload: { email: string; password: string }) =>
    postData<AuthResponse>('/auth/login', payload),
  resetPassword: (payload: { email: string; newPassword: string }) =>
    postData<{ message: string }>('/auth/reset-password', payload),

  dashboardStats: () => getData<DashboardStats>('/dashboard/stats'),
  gatewayDashboard: () => getData<GatewayDashboard>('/gateway/dashboard'),

  getAnnouncements: () => getData<Announcement[]>('/announcements'),
  createAnnouncement: (payload: Omit<Announcement, 'id'>) =>
    postData<Announcement>('/announcements', payload),
  updateAnnouncement: (id: string, payload: Partial<Announcement>) =>
    putData<Announcement>(`/announcements/${id}`, payload),
  deleteAnnouncement: (id: string) =>
    deleteData<{ message: string }>(`/announcements/${id}`),

  getRules: () => getData<Rule[]>('/rules'),
  createRule: (payload: Omit<Rule, 'id'>) => postData<Rule>('/rules', payload),
  updateRule: (id: string, payload: Partial<Rule>) => putData<Rule>(`/rules/${id}`, payload),
  deleteRule: (id: string) => deleteData<{ message: string }>(`/rules/${id}`),

  getNews: () => getData<News[]>('/news'),
  createNews: (payload: Omit<News, 'id'>) => postData<News>('/news', payload),
  updateNews: (id: string, payload: Partial<News>) => putData<News>(`/news/${id}`, payload),
  deleteNews: (id: string) => deleteData<{ message: string }>(`/news/${id}`),

  getRoutes: () => getData<RouteItem[]>('/admin/routes'),
  getRouteById: (id: string) => getData<RouteItem>(`/admin/routes/${id}`),
  createRoute: (payload: {
    mountainId: string;
    name: string;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    distanceKm: number;
    estimatedHours: number;
    description: string;
  }) => postData<RouteItem>('/admin/routes', payload),
  updateRoute: (id: string, payload: Partial<{
    mountainId: string;
    name: string;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    distanceKm: number;
    estimatedHours: number;
    description: string;
  }>) => patchData<RouteItem>(`/admin/routes/${id}`, payload),
  deleteRoute: (id: string) => deleteData<{ message: string }>(`/admin/routes/${id}`),

  getBookings: () => getData<BookingItem[]>('/bookings'),
  getBookingById: (id: string) => getData<BookingItem>(`/bookings/${id}`),
  createBooking: (payload: Omit<BookingItem, 'id'>) => postData<BookingItem>('/bookings', payload),
  updateBooking: (id: string, payload: Partial<BookingItem>) => putData<BookingItem>(`/bookings/${id}`, payload),
  deleteBooking: (id: string) => deleteData<{ message: string }>(`/bookings/${id}`),

  createPayment: (payload: { bookingId: string; method: string; amount: number }) =>
    postData<PaymentItem>('/payments', payload),
  getPaymentById: (id: string) => getData<PaymentItem>(`/payments/${id}`),
  paymentWebhook: (payload: unknown) => postData<{ message: string }>('/payments/webhook', payload),

  getTickets: () => getData<TicketItem[]>('/tickets'),
  getTicketById: (id: string) => getData<TicketItem>(`/tickets/${id}`),
  getTicketDownloadUrl: (id: string) => `/tickets/${id}/download`,
  scanTicket: (code: string) => postData<ScanTicketResult>('/tickets/scan', { code }),

  getQuotas: () => getData<QuotaItem[]>('/quotas'),
  getAdminQuotas: () => getData<QuotaItem[]>('/admin/quotas'),
  createQuota: (payload: {
    mountainId: string;
    date: string;
    quotaTotal: number;
    price: number;
  }) => postData<QuotaItem>('/admin/quotas', payload),
  updateQuota: (id: string, payload: Partial<{
    date: string;
    quotaTotal: number;
    quotaBooked: number;
    price: number;
  }>) => putData<QuotaItem>(`/admin/quotas/${id}`, payload),
  deleteQuota: (id: string) => deleteData<{ message: string }>(`/admin/quotas/${id}`),

  getMountains: () => getData<MountainItem[]>('/mountains'),

  getBasecampById: (id: string) => getData<Basecamp>(`/basecamp/${id}`),

  getWeatherCurrent: () => getData<WeatherCurrent>('/weather/current'),
  getWeatherForecast: async () => {
    const rows = await getData<BackendWeatherForecast[]>('/weather');
    return (Array.isArray(rows) ? rows : []).map((item) => ({
      id: item.id,
      date: item.forecastDate,
      condition: item.condition,
      temperatureC: item.temperatureC,
    }));
  },
};
