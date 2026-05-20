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
