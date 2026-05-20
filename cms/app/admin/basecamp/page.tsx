'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { ApiService } from '@/lib/services/api-service';

export default function BasecampPage() {
  const [basecampId, setBasecampId] = useState('1');

  const basecampQuery = useQuery({
    queryKey: ['basecamp', basecampId],
    queryFn: () => ApiService.getBasecampById(basecampId),
    enabled: Boolean(basecampId),
  });

  const mapSrc = basecampQuery.data?.mapUrl
    ? basecampQuery.data.mapUrl
    : basecampQuery.data?.latitude && basecampQuery.data?.longitude
      ? `https://www.google.com/maps?q=${basecampQuery.data.latitude},${basecampQuery.data.longitude}&z=14&output=embed`
      : 'https://www.google.com/maps?q=-5.429,104.070&z=12&output=embed';

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-2xl font-bold">Basecamp</h1>
        <p className="mt-1 text-sm text-slate-500">Tampilkan detail basecamp dan peta lokasi (GET /basecamp/:id).</p>
        <div className="mt-3 flex gap-2">
          <input className="rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900" value={basecampId} onChange={(e) => setBasecampId(e.target.value)} placeholder="Basecamp ID" />
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-900">
        <iframe title="basecamp-map" src={mapSrc} className="h-[420px] w-full rounded-xl border-0" loading="lazy" />
      </section>
    </div>
  );
}
