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
  level?: 'info' | 'warning' | 'danger';
  createdAt?: string;
};

export type Rule = {
  id: string;
  title: string;
  description: string;
  createdAt?: string;
};

export type News = {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
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
