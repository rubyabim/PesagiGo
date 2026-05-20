'use client';

import { useQuery } from '@tanstack/react-query';
import DataTable from '@/components/ui/data-table';
import { ApiService } from '@/lib/services/api-service';

export default function WeatherPage() {
  const currentQuery = useQuery({
    queryKey: ['weather-current'],
    queryFn: ApiService.getWeatherCurrent,
  });

  const forecastQuery = useQuery({
    queryKey: ['weather-forecast'],
    queryFn: ApiService.getWeatherForecast,
  });

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-2xl font-bold">Weather</h1>
        <p className="mt-1 text-sm text-slate-500">Data cuaca current & forecast dari backend API.</p>
      </section>

      <section className="grid gap-3 md:grid-cols-4">
        <article className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Condition</p>
          <p className="mt-1 text-lg font-semibold">{currentQuery.data?.condition ?? '-'}</p>
