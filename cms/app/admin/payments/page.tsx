'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { FormEvent, useState } from 'react';
import { toast } from 'sonner';
import DataTable from '@/components/ui/data-table';
import { ApiService, PaymentItem } from '@/lib/services/api-service';

export default function PaymentsPage() {
  const [paymentId, setPaymentId] = useState('');
  const [bookingId, setBookingId] = useState('');
  const [method, setMethod] = useState('VA-BCA');
  const [amount, setAmount] = useState(0);
  const [history, setHistory] = useState<PaymentItem[]>([]);

  const paymentQuery = useQuery({
    queryKey: ['payment-by-id', paymentId],
    queryFn: () => ApiService.getPaymentById(paymentId),
    enabled: Boolean(paymentId),
  });

  const createMutation = useMutation({
    mutationFn: ApiService.createPayment,
    onSuccess: (data) => {
      toast.success('Payment berhasil dibuat');
      setHistory((prev) => [data, ...prev]);
      setPaymentId(String(data.id));
    },
    onError: (err) => toast.error(err.message),
  });

  const webhookMutation = useMutation({
    mutationFn: ApiService.paymentWebhook,
    onSuccess: () => toast.success('Webhook berhasil dikirim'),
    onError: (err) => toast.error(err.message),
  });

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createMutation.mutate({ bookingId, method, amount });
  };

  const rows = paymentQuery.data ? [paymentQuery.data, ...history] : history;

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-2xl font-bold">Payments</h1>
        <p className="mt-1 text-sm text-slate-500">Integrasi endpoint POST /payments, GET /payments/:id, POST /payments/webhook.</p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <form className="grid gap-3 md:grid-cols-4" onSubmit={onSubmit}>
          <input className="rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900" placeholder="Booking ID" value={bookingId} onChange={(e) => setBookingId(e.target.value)} required />
          <input className="rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900" placeholder="Method" value={method} onChange={(e) => setMethod(e.target.value)} required />
          <input type="number" className="rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900" placeholder="Amount" value={amount} onChange={(e) => setAmount(Number(e.target.value || 0))} required />
          <button className="rounded-xl bg-sky-500 px-3 py-2 text-sm font-semibold text-white hover:bg-sky-600 active:scale-[0.98]" type="submit" disabled={createMutation.isPending}>Create Payment</button>
        </form>

        <div className="mt-3 flex flex-wrap gap-2">
          <input className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm md:w-[260px] dark:border-slate-700 dark:bg-slate-900" placeholder="Cari payment by ID" value={paymentId} onChange={(e) => setPaymentId(e.target.value)} />
          <button type="button" className="rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700" onClick={() => webhookMutation.mutate({ paymentId, event: 'PAYMENT_STATUS_UPDATE' })} disabled={!paymentId || webhookMutation.isPending}>Send Webhook</button>
        </div>
      </section>

      <DataTable
        title="Payment Status"
        data={rows}
        loading={paymentQuery.isLoading}
        columns={[
          { key: 'id', header: 'ID' },
          { key: 'bookingId', header: 'Booking ID' },
          { key: 'method', header: 'Method' },
          { key: 'amount', header: 'Amount' },
          { key: 'status', header: 'Status' },
        ]}
      />
    </div>
  );
}
