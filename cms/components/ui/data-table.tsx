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
                        type="button"
                        onClick={() => onEdit(row)}
                        className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold transition hover:bg-slate-100 active:scale-[0.98] dark:border-slate-700 dark:hover:bg-slate-800"
                      >
                        Edit
                      </button>
                    ) : null}
                    {onDelete ? (
                      <button
                        type="button"
                        onClick={() => onDelete(row)}
                        className="flex-1 rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 active:scale-[0.98] dark:border-rose-900/50 dark:hover:bg-rose-950/30"
                      >
                        Delete
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </article>
            ))}
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="min-w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                {columns.map((col) => (
                  <th key={String(col.key)} className="px-3 py-2 font-semibold text-slate-600 dark:text-slate-300">
                    {col.header}
                  </th>
                ))}
                {(onEdit || onDelete) ? <th className="px-3 py-2">Actions</th> : null}
              </tr>
            </thead>
            <tbody>
              {paged.map((row, idx) => (
                <tr key={`row-${idx}`} className="border-b border-slate-100 dark:border-slate-800/70">
                  {columns.map((col) => (
                    <td key={`${String(col.key)}-${idx}`} className="px-3 py-2">
                      {col.render ? col.render(row) : String(row[col.key as keyof T] ?? '-')}
                    </td>
                  ))}
                  {(onEdit || onDelete) ? (
                    <td className="px-3 py-2">
                      <div className="flex gap-2">
                        {onEdit ? (
                          <button
                            type="button"
                            onClick={() => onEdit(row)}
                            className="rounded-lg border border-slate-200 px-2 py-1 text-xs transition hover:bg-slate-100 active:scale-[0.98] dark:border-slate-700 dark:hover:bg-slate-800"
                          >
                            Edit
                          </button>
                        ) : null}
                        {onDelete ? (
                          <button
                            type="button"
                            onClick={() => onDelete(row)}
                            className="rounded-lg border border-rose-200 px-2 py-1 text-xs text-rose-600 transition hover:bg-rose-50 active:scale-[0.98] dark:border-rose-900/50 dark:hover:bg-rose-950/30"
                          >
                            Delete
                          </button>
                        ) : null}
                      </div>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>

            {paged.length === 0 ? <p className="px-3 py-4 text-sm text-slate-500">No data found.</p> : null}
          </div>
        </>
      )}

      <div className="mt-3 flex flex-wrap items-center justify-end gap-2 text-xs">
        <button
          type="button"
          disabled={safePage <= 1}
          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          className="rounded-lg border border-slate-200 px-2 py-1 disabled:opacity-50 dark:border-slate-700"
        >
          Prev
        </button>
        <span>
          Page {safePage} / {pageCount}
        </span>
        <button
          type="button"
          disabled={safePage >= pageCount}
          onClick={() => setPage((prev) => Math.min(pageCount, prev + 1))}
          className="rounded-lg border border-slate-200 px-2 py-1 disabled:opacity-50 dark:border-slate-700"
        >
          Next
        </button>
      </div>
    </section>
  );
}
