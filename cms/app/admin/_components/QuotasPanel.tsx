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
          />
        </label>

        <label>
          <span>Quota Total</span>
          <input
            className="field"
            min={0}
            required
            type="number"
            value={form.quotaTotal}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, quotaTotal: Number(event.target.value || 0) }))
            }
          />
        </label>

        <label>
          <span>Harga</span>
          <input
            className="field"
            min={0}
            required
            type="number"
            value={form.price}
            onChange={(event) => setForm((prev) => ({ ...prev, price: Number(event.target.value || 0) }))}
          />
        </label>

        <div className="admin-form-actions full">
          <button className="btn btn-primary" disabled={busy || !tokenReady} type="submit">
            Simpan Quota
          </button>
          <button className="btn btn-muted" disabled={busy} onClick={onReset} type="button">
            Reset
          </button>
        </div>
      </form>

      {loading ? (
        <div className="admin-skeleton-grid">
          {Array.from({ length: 4 }).map((_, index) => (
            <article className="admin-skeleton-card" key={`quota-s-${index}`}>
              <div className="admin-skeleton admin-skeleton-line" />
              <div className="admin-skeleton admin-skeleton-line short" />
            </article>
          ))}
        </div>
      ) : (
        <div className="admin-list-grid">
          {quotas.length === 0 ? <p className="admin-empty">Belum ada quota.</p> : null}
          {quotas.map((item) => (
            <article className="admin-list-card" key={item.id}>
              <div>
                <h3>{item.mountain.name}</h3>
                <p>
                  {new Date(item.date).toLocaleString('id-ID')} ΓÇó Sisa {item.quotaAvailable} ΓÇó Rp{numberFormat.format(item.price)}
                </p>
              </div>
              <div className="admin-list-actions">
                <Link className="btn btn-muted" href={`/admin/quotas/${item.id}/edit`}>
                  Edit
                </Link>
                <Link className="btn btn-danger" href={`/admin/quotas/${item.id}/delete`}>
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
