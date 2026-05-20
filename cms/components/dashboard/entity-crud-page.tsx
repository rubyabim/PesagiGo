'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import CrudModal from '@/components/ui/crud-modal';
import DataTable from '@/components/ui/data-table';

type Field = {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'textarea' | 'datetime-local' | 'select' | 'url' | 'file';
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
};

type Props<T extends Record<string, unknown>> = {
  title: string;
  description?: string;
  queryKey: string[];
  fields: Field[];
  columns: Array<{ key: keyof T | string; header: string; render?: (row: T) => React.ReactNode }>;
  getList: () => Promise<T[]>;
  createItem: (payload: Record<string, unknown>) => Promise<unknown>;
  updateItem: (id: string, payload: Record<string, unknown>) => Promise<unknown>;
  deleteItem: (id: string) => Promise<unknown>;
};

export default function EntityCrudPage<T extends Record<string, unknown>>({
  title,
  description,
  queryKey,
  fields,
  columns,
  getList,
  createItem,
  updateItem,
  deleteItem,
}: Props<T>) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});

  const { data, isLoading } = useQuery({ queryKey, queryFn: getList });

  const initialForm = useMemo(() => {
    const next: Record<string, unknown> = {};
    for (const field of fields) {
      next[field.key] = field.type === 'number' ? 0 : '';
    }
    return next;
  }, [fields]);

  const createMutation = useMutation({
    mutationFn: createItem,
    onSuccess: () => {
      toast.success(`${title} berhasil ditambahkan`);
      queryClient.invalidateQueries({ queryKey });
      setOpen(false);
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Gagal menambahkan data'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) => updateItem(id, payload),
    onSuccess: () => {
      toast.success(`${title} berhasil diperbarui`);
      queryClient.invalidateQueries({ queryKey });
      setOpen(false);
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Gagal memperbarui data'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteItem,
    onSuccess: () => {
      toast.success(`${title} berhasil dihapus`);
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Gagal menghapus data'),
  });

  const onCreate = () => {
    setEditingId(null);
    setForm(initialForm);
    setOpen(true);
  };

  const onEdit = (item: T) => {
    const next: Record<string, unknown> = {};
    for (const field of fields) {
      next[field.key] = item[field.key] ?? '';
    }
    setForm(next);
    setEditingId(String(item.id ?? ''));
    setOpen(true);
  };

  const onDelete = (item: T) => {
    if (!confirm('Yakin ingin menghapus data ini?')) {
      return;
    }
    deleteMutation.mutate(String(item.id));
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (editingId) {
      updateMutation.mutate({ id: editingId, payload: form });
      return;
    }

    createMutation.mutate(form);
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-2xl font-bold">{title}</h1>
        {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
      </section>

      <DataTable
        title={`Manage ${title}`}
        data={data ?? []}
        columns={columns}
        loading={isLoading}
        onCreate={onCreate}
        onEdit={onEdit}
        onDelete={onDelete}
      />

      <CrudModal
        open={open}
        title={editingId ? `Edit ${title}` : `Tambah ${title}`}
        onClose={() => setOpen(false)}
      >
        <form className="space-y-3" onSubmit={onSubmit}>
          {fields.map((field) => (
            <label className="block" key={field.key}>
              <span className="mb-1 block text-xs text-slate-500">{field.label}</span>
              {field.type === 'file' ? (
                <input
                  type="file"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                  required={field.required}
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        setForm((prev) => ({ ...prev, [field.key]: e.target?.result as string }));
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              ) : field.type === 'textarea' ? (
                <textarea
                  className="min-h-24 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                  required={field.required}
                  value={String(form[field.key] ?? '')}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, [field.key]: event.target.value }))
                  }
                />
              ) : field.type === 'select' ? (
                <select
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                  required={field.required}
                  value={String(form[field.key] ?? '')}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, [field.key]: event.target.value }))
                  }
                >
                  <option value="">Pilih {field.label}</option>
                  {field.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type ?? 'text'}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                  required={field.required}
                  value={String(form[field.key] ?? '')}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      [field.key]: field.type === 'number'
                        ? Number(event.target.value || 0)
                        : event.target.value,
                    }))
                  }
                />
              )}
            </label>
          ))}

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl bg-sky-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-sky-600 active:scale-[0.98]"
          >
            {isSubmitting ? 'Saving...' : editingId ? 'Update' : 'Create'}
          </button>
        </form>
      </CrudModal>
    </div>
  );
}
