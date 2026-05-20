'use client';

import { useQuery } from '@tanstack/react-query';
import { QrCode } from 'lucide-react';
import DataTable from '@/components/ui/data-table';
import { ApiService } from '@/lib/services/api-service';

export default function TicketsPage() {
  const ticketsQuery = useQuery({
    queryKey: ['tickets'],
    queryFn: ApiService.getTickets,
  });

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-2xl font-bold">Tickets</h1>
        <p className="mt-1 text-sm text-slate-500">History tiket, download tiket, dan scan QR ticket.</p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <QrCode size={18} />
          <span>Scan QR ticket dapat diintegrasikan dengan kamera device pada endpoint validasi tiket backend.</span>
        </div>
      </section>

      <DataTable
        title="Ticket History"
        data={ticketsQuery.data ?? []}
        loading={ticketsQuery.isLoading}
        columns={[
          { key: 'id', header: 'ID' },
          { key: 'code', header: 'Ticket Code' },
          { key: 'status', header: 'Status' },
          {
            key: 'download',
            header: 'Download',
            render: (row) => (
              <a
                href={ApiService.getTicketDownloadUrl(String(row.id))}
                className="text-sky-600 underline"
                target="_blank"
                rel="noreferrer"
              >
                Download
              </a>
            ),
          },
        ]}
      />
    </div>
  );
}
