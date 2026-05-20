'use client';

import { useQuery } from '@tanstack/react-query';
import EntityCrudPage from '@/components/dashboard/entity-crud-page';
import { ApiService, QuotaItem } from '@/lib/services/api-service';

export default function QuotasPage() {
  const mountainsQuery = useQuery({
    queryKey: ['mountains-for-quota'],
    queryFn: ApiService.getMountains,
  });

  const mountainOptions = (mountainsQuery.data ?? []).map((mountain) => ({
    value: mountain.id,
    label: `${mountain.name} (${mountain.location})`,
  }));

  return (
    <EntityCrudPage<QuotaItem>
      title="Kuota Harian Pendakian"
      description="Admin bisa menambah kuota pendakian per hari untuk setiap gunung."
      queryKey={['admin-quotas']}
      fields={[
        {
          key: 'mountainId',
          label: 'Gunung',
          type: 'select',
          required: true,
          options: mountainOptions,
        },
        { key: 'date', label: 'Tanggal Pendakian', type: 'datetime-local', required: true },
        { key: 'quotaTotal', label: 'Kuota Total', type: 'number', required: true },
        { key: 'price', label: 'Harga Tiket', type: 'number', required: true },
        { key: 'quotaBooked', label: 'Kuota Terpesan', type: 'number' },
      ]}
      columns={[
        {
          key: 'mountain',
          header: 'Gunung',
          render: (row) => row.mountain?.name ?? row.mountainId ?? '-',
        },
        {
