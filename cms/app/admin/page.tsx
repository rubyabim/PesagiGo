'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import StatsCard from '@/components/ui/stats-card';
import { ApiService } from '@/lib/services/api-service';
// admin dashboard: ringkasan operasional admin, informasi penting, larangan, berita, statistik booking dan revenue. Fokus pada tampilan yang bersih dan informatif untuk memudahkan admin dalam mengelola platform.
export default function AdminOverviewPage() {
  const statsQuery = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: ApiService.dashboardStats,
  });
// fetch announcements, rules, and news for the dashboard sections
  const announcementsQuery = useQuery({
    queryKey: ['announcements'],
    queryFn: ApiService.getAnnouncements,
  });

  const rulesQuery = useQuery({
    queryKey: ['rules'],
    queryFn: ApiService.getRules,
  });

  const newsQuery = useQuery({
    queryKey: ['news'],
    queryFn: ApiService.getNews,
  });

