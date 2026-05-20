'use client';

import { useMemo, useState } from 'react';

type Column<T> = {
  key: keyof T | string;
  header: string;
  render?: (row: T) => React.ReactNode;
};

type Props<T extends Record<string, unknown>> = {
  title: string;
  data: T[];
  columns: Column<T>[];
  onCreate?: () => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  loading?: boolean;
};

export default function DataTable<T extends Record<string, unknown>>({
  title,
  data,
  columns,
  onCreate,
  onEdit,
  onDelete,
  loading,
}: Props<T>) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 8;

  const filtered = useMemo(() => {
    const safeData = Array.isArray(data) ? data : [];
    const q = search.trim().toLowerCase();
    if (!q) {
      return safeData;
    }

    return safeData.filter((item) =>
      Object.values(item).some((value) =>
        String(value ?? '').toLowerCase().includes(q),
      ),
    );
  }, [data, search]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage = Math.min(page, pageCount);
  const paged = filtered.slice((safePage - 1) * perPage, safePage * perPage);

  const renderValue = (row: T, key: keyof T | string) => String(row[key as keyof T] ?? '-');

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">{title}</h2>
        <div className="flex w-full flex-wrap gap-2 sm:w-auto">
          <input
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 sm:w-56"
            placeholder="Search..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />
          {onCreate ? (
            <button
              type="button"
              onClick={onCreate}
              className="w-full rounded-xl bg-sky-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-sky-600 active:scale-[0.98] sm:w-auto"
            >
              Add New
            </button>
          ) : null}
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading data...</p>
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {paged.map((row, idx) => (
              <article key={`card-${idx}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/30">
                <div className="space-y-2">
                  {columns.map((col) => (
                    <div key={`${String(col.key)}-${idx}`} className="flex items-start justify-between gap-3 border-b border-slate-200/70 pb-2 last:border-b-0 last:pb-0 dark:border-slate-800/70">
                      <span className="min-w-24 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{col.header}</span>
                      <span className="text-right text-sm text-slate-800 dark:text-slate-100">
                        {col.render ? col.render(row) : renderValue(row, col.key)}
                      </span>
                    </div>
                  ))}
                </div>

                {(onEdit || onDelete) ? (
                  <div className="mt-4 flex gap-2">
                    {onEdit ? (
                      <button
