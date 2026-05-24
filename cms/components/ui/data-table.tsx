'use client';

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Pencil, Plus, Search, Trash2 } from 'lucide-react';

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
  createLabel?: string;
};

export default function DataTable<T extends Record<string, unknown>>({
  title,
  data,
  columns,
  onCreate,
  onEdit,
  onDelete,
  loading,
  createLabel = 'Tambah Data',
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
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-bold text-slate-950">{title}</h2>
          <p className="mt-0.5 text-[12px] text-slate-500">Kelola data dan aksi operasional</p>
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          <label className="relative min-w-0 flex-1 sm:w-64 sm:flex-none">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              className="h-9 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-[12px] outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              placeholder="Cari nama, kode booking..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />
          </label>
          {onCreate ? (
            <button
              type="button"
              onClick={onCreate}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-blue-600 px-3 text-[12px] font-semibold text-white transition hover:bg-blue-700 active:scale-[0.98]"
            >
              <Plus size={14} />
              {createLabel}
            </button>
          ) : null}
        </div>
      </div>

      {loading ? (
        <div className="grid gap-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-10 animate-pulse rounded-md bg-slate-100" />
          ))}
        </div>
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {paged.map((row, idx) => (
              <article key={`card-${idx}`} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="space-y-2">
                  {columns.map((col) => (
                    <div key={`${String(col.key)}-${idx}`} className="flex items-start justify-between gap-3 border-b border-slate-200 pb-2 last:border-b-0 last:pb-0">
                      <span className="min-w-24 text-[11px] font-semibold text-slate-500">{col.header}</span>
                      <span className="text-right text-[12px] text-slate-800">
                        {col.render ? col.render(row) : renderValue(row, col.key)}
                      </span>
                    </div>
                  ))}
                </div>

                {(onEdit || onDelete) ? (
                  <div className="mt-3 flex gap-2">
                    {onEdit ? (
                      <button
                        type="button"
                        onClick={() => onEdit(row)}
                        className="inline-flex flex-1 items-center justify-center gap-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-[12px] font-semibold text-slate-700"
                      >
                        <Pencil size={13} />
                        Edit
                      </button>
                    ) : null}
                    {onDelete ? (
                      <button
                        type="button"
                        onClick={() => onDelete(row)}
                        className="inline-flex flex-1 items-center justify-center gap-1 rounded-md border border-red-200 bg-white px-3 py-2 text-[12px] font-semibold text-red-600"
                      >
                        <Trash2 size={13} />
                        Hapus
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </article>
            ))}
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="min-w-full border-collapse text-left text-[12px]">
              <thead>
                <tr className="border-y border-slate-200 bg-slate-50">
                  {columns.map((col) => (
                    <th key={String(col.key)} className="px-4 py-3 font-bold text-slate-700">
                      {col.header}
                    </th>
                  ))}
                  {(onEdit || onDelete) ? <th className="px-4 py-3 text-right font-bold text-slate-700">Aksi</th> : null}
                </tr>
              </thead>
              <tbody>
                {paged.map((row, idx) => (
                  <tr key={`row-${idx}`} className="border-b border-slate-100 transition hover:bg-slate-50">
                    {columns.map((col) => (
                      <td key={`${String(col.key)}-${idx}`} className="px-4 py-3 text-slate-700">
                        {col.render ? col.render(row) : String(row[col.key as keyof T] ?? '-')}
                      </td>
                    ))}
                    {(onEdit || onDelete) ? (
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          {onEdit ? (
                            <button
                              type="button"
                              onClick={() => onEdit(row)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-700 transition hover:bg-slate-100"
                              aria-label="Edit data"
                              title="Edit"
                            >
                              <Pencil size={14} />
                            </button>
                          ) : null}
                          {onDelete ? (
                            <button
                              type="button"
                              onClick={() => onDelete(row)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-red-500 transition hover:bg-red-50"
                              aria-label="Hapus data"
                              title="Hapus"
                            >
                              <Trash2 size={14} />
                            </button>
                          ) : null}
                        </div>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>

            {paged.length === 0 ? <p className="px-4 py-5 text-[12px] text-slate-500">Data belum tersedia.</p> : null}
          </div>
        </>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-end gap-1 text-[12px]">
        <button
          type="button"
          disabled={safePage <= 1}
          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-600 disabled:opacity-40"
          aria-label="Halaman sebelumnya"
        >
          <ChevronLeft size={14} />
        </button>
        {Array.from({ length: Math.min(pageCount, 5) }).map((_, index) => {
          const pageNumber = index + 1;
          return (
            <button
              key={pageNumber}
              type="button"
              onClick={() => setPage(pageNumber)}
              className={`h-8 min-w-8 rounded-md px-2 font-semibold ${
                safePage === pageNumber ? 'bg-blue-600 text-white' : 'border border-slate-200 text-slate-600'
              }`}
            >
              {pageNumber}
            </button>
          );
        })}
        <button
          type="button"
          disabled={safePage >= pageCount}
          onClick={() => setPage((prev) => Math.min(pageCount, prev + 1))}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-600 disabled:opacity-40"
          aria-label="Halaman berikutnya"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </section>
  );
}
