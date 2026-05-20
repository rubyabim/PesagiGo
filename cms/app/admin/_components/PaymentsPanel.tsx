'use client';

import Link from 'next/link';
import { FormEvent } from 'react';
import { AdminBooking, AdminPayment } from '@/lib/api';

const numberFormat = new Intl.NumberFormat('id-ID');

type Props = {
  loading: boolean;
  busy: boolean;
  tokenReady: boolean;
  payments: AdminPayment[];
  bookings: AdminBooking[];
  form: {
    bookingId: string;
    method: string;
    amount: number;
    status: 'PENDING' | 'SUCCESS' | 'FAILED';
    providerRef: string;
    paidAt: string;
  };
  setForm: React.Dispatch<React.SetStateAction<{
    bookingId: string;
    method: string;
    amount: number;
    status: 'PENDING' | 'SUCCESS' | 'FAILED';
    providerRef: string;
    paidAt: string;
  }>>;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onReset: () => void;
};

export default function PaymentsPanel({
  loading,
  busy,
  tokenReady,
  payments,
  bookings,
  form,
  setForm,
  onSubmit,
  onReset,
}: Props) {
  return (
    <section className="admin-panel card">
      <div className="admin-panel-head">
        <h2>Payments</h2>
        <p>Buat payment baru dan kelola data pembayaran.</p>
      </div>

      <form className="admin-form-grid" onSubmit={onSubmit}>
        <label>
          <span>Booking</span>
          <select
            className="field"
            required
            value={form.bookingId}
            onChange={(event) => setForm((prev) => ({ ...prev, bookingId: event.target.value }))}
          >
            <option value="">Pilih Booking</option>
            {bookings.map((item) => (
              <option key={item.id} value={item.id}>
                {item.id.slice(0, 8)} - {item.user.email}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Method</span>
          <input
            className="field"
            required
            value={form.method}
            onChange={(event) => setForm((prev) => ({ ...prev, method: event.target.value }))}
          />
        </label>

        <label>
          <span>Amount</span>
          <input
            className="field"
            min={0}
            required
            type="number"
            value={form.amount}
            onChange={(event) => setForm((prev) => ({ ...prev, amount: Number(event.target.value || 0) }))}
          />
        </label>

        <label>
          <span>Status</span>
          <select
            className="field"
            value={form.status}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                status: event.target.value as 'PENDING' | 'SUCCESS' | 'FAILED',
              }))
            }
          >
            <option value="PENDING">PENDING</option>
            <option value="SUCCESS">SUCCESS</option>
            <option value="FAILED">FAILED</option>
          </select>
        </label>

        <label>
          <span>Provider Ref</span>
          <input
            className="field"
            value={form.providerRef}
            onChange={(event) => setForm((prev) => ({ ...prev, providerRef: event.target.value }))}
          />
        </label>

        <label>
          <span>Paid At</span>
          <input
            className="field"
            type="datetime-local"
            value={form.paidAt}
            onChange={(event) => setForm((prev) => ({ ...prev, paidAt: event.target.value }))}
          />
        </label>

        <div className="admin-form-actions full">
          <button className="btn btn-primary" disabled={busy || !tokenReady} type="submit">
            Simpan Payment
          </button>
          <button className="btn btn-muted" disabled={busy} onClick={onReset} type="button">
            Reset
          </button>
        </div>
      </form>

      {loading ? (
        <div className="admin-skeleton-grid">
          {Array.from({ length: 4 }).map((_, index) => (
            <article className="admin-skeleton-card" key={`payment-s-${index}`}>
              <div className="admin-skeleton admin-skeleton-line" />
              <div className="admin-skeleton admin-skeleton-line short" />
            </article>
          ))}
        </div>
      ) : (
        <div className="admin-list-grid">
          {payments.length === 0 ? <p className="admin-empty">Belum ada payment.</p> : null}
          {payments.map((item) => (
            <article className="admin-list-card" key={item.id}>
              <div>
                <h3>{item.method}</h3>
                <p>
                  {item.booking.user.email} ΓÇó {item.status} ΓÇó Rp{numberFormat.format(item.amount)}
                </p>
              </div>
              <div className="admin-list-actions">
                <Link className="btn btn-muted" href={`/admin/payments/${item.id}/edit`}>
                  Edit
                </Link>
                <Link className="btn btn-danger" href={`/admin/payments/${item.id}/delete`}>
                  Delete
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
