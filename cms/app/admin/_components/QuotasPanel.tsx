'use client';

import Link from 'next/link';
import { FormEvent } from 'react';
import { AdminQuota } from '@/lib/api';

const numberFormat = new Intl.NumberFormat('id-ID');

type Props = {
  loading: boolean;
  busy: boolean;
  tokenReady: boolean;
  mountains: Array<{ id: string; name: string; location: string }>;
  quotas: AdminQuota[];
  form: {
    mountainId: string;
    date: string;
    quotaTotal: number;
    price: number;
  };
  setForm: React.Dispatch<React.SetStateAction<{
    mountainId: string;
    date: string;
    quotaTotal: number;
    price: number;
  }>>;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onReset: () => void;
};

export default function QuotasPanel({
  loading,
  busy,
  tokenReady,
  mountains,
  quotas,
  form,
  setForm,
  onSubmit,
  onReset,
}: Props) {
  return (
    <section className="admin-panel card">
      <div className="admin-panel-head">
        <h2>Quotas</h2>
        <p>Tambah quota session baru, edit, dan delete lewat halaman khusus.</p>
      </div>

      <form className="admin-form-grid" onSubmit={onSubmit}>
        <label>
          <span>Gunung</span>
          <select
            className="field"
            required
            value={form.mountainId}
            onChange={(event) => setForm((prev) => ({ ...prev, mountainId: event.target.value }))}
          >
            <option value="">Pilih Gunung</option>
            {mountains.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Tanggal</span>
          <input
            className="field"
            required
            type="datetime-local"
            value={form.date}
            onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))}
