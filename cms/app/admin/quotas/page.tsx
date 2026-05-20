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
          key: 'date',
          header: 'Tanggal',
          render: (row) => (row.date ? new Date(row.date).toLocaleDateString('id-ID') : '-'),
        },
        { key: 'quotaTotal', header: 'Kuota Total' },
        { key: 'quotaBooked', header: 'Terpesan' },
        {
          key: 'quotaAvailable',
          header: 'Sisa',
          render: (row) => {
            const available = row.quotaAvailable ?? (Number(row.quotaTotal ?? 0) - Number(row.quotaBooked ?? 0));
            return String(available);
          },
        },
        {
          key: 'price',
          header: 'Harga',
          render: (row) => `Rp ${Number(row.price ?? 0).toLocaleString('id-ID')}`,
        },
      ]}
      getList={ApiService.getAdminQuotas}
      createItem={(payload) =>
        ApiService.createQuota({
          mountainId: String(payload.mountainId ?? ''),
          date: String(payload.date ?? ''),
          quotaTotal: Number(payload.quotaTotal ?? 0),
          price: Number(payload.price ?? 0),
        })
      }
      updateItem={(id, payload) =>
        ApiService.updateQuota(id, {
          date: payload.date ? String(payload.date) : undefined,
          quotaTotal: payload.quotaTotal === undefined ? undefined : Number(payload.quotaTotal),
          quotaBooked: payload.quotaBooked === undefined ? undefined : Number(payload.quotaBooked),
          price: payload.price === undefined ? undefined : Number(payload.price),
        })
      }
      deleteItem={ApiService.deleteQuota}
    />
  );
}
