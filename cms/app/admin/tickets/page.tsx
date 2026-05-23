'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { QrCode } from 'lucide-react';
import DataTable from '@/components/ui/data-table';
import { ApiService } from '@/lib/services/api-service';

export default function TicketsPage() {
  const [code, setCode] = useState('');
  const [scanLoading, setScanLoading] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<{
    ticketCode: string | null;
    status: string;
    bookingId: string;
    mountain: string;
    climbDate: string;
    holder: string;
    paymentStatus: string | null;
  } | null>(null);

  const ticketsQuery = useQuery({
    queryKey: ['tickets'],
    queryFn: ApiService.getTickets,
  });

  const verifyTicket = async () => {
    if (!code.trim()) {
      setScanError('Kode tiket wajib diisi.');
      return;
    }
    setScanLoading(true);
    setScanError(null);
    setScanResult(null);
    try {
      const result = await ApiService.scanTicket(code.trim());
      setScanResult(result);
    } catch (error) {
      setScanError(error instanceof Error ? error.message : 'Gagal verifikasi tiket');
    } finally {
      setScanLoading(false);
    }
  };

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
        <div className="mt-4 space-y-3">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">Verifikasi Kode Tiket</label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="Contoh: PSG-DUMMY-2405"
              className="h-10 flex-1 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none ring-sky-300 focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
            <button
              type="button"
              onClick={verifyTicket}
              disabled={scanLoading}
              className="h-10 rounded-xl bg-sky-600 px-4 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {scanLoading ? 'Memverifikasi...' : 'Verifikasi'}
            </button>
          </div>
          {scanError ? <p className="text-sm font-medium text-red-600">{scanError}</p> : null}
          {scanResult ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
              <p>Kode: {scanResult.ticketCode ?? '-'}</p>
              <p>Nama Pendaki: {scanResult.holder}</p>
              <p>Gunung: {scanResult.mountain}</p>
              <p>Tanggal: {new Date(scanResult.climbDate).toLocaleDateString('id-ID')}</p>
              <p>Status Booking: {scanResult.status}</p>
              <p>Status Pembayaran: {scanResult.paymentStatus ?? '-'}</p>
            </div>
          ) : null}
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
