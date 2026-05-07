'use client';
import Link from 'next/link';\
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

   //// Admin dashboard page
export default function AdminOverviewPage() {
    const statsQuery = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: ApiService.dashboardStats,
  });
  // Sample data for the chart (replace with real data from API)