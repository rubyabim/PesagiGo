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

