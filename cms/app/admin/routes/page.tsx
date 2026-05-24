'use client';

import { useQuery } from '@tanstack/react-query';
import EntityCrudPage from '@/components/dashboard/entity-crud-page';
import { ApiService, RouteItem } from '@/lib/services/api-service';

export default function RoutesPage() {
  const mountainsQuery = useQuery({
    queryKey: ['mountains-for-routes'],
    queryFn: ApiService.getMountains,
  });

  const mountainOptions = (mountainsQuery.data ?? []).map((mountain) => ({
    value: mountain.id,
    label: `${mountain.name} (${mountain.location})`,
  }));

  return (
    <EntityCrudPage<RouteItem>
      title="Gunung Pesagi via Papahan"
      description="Kelola informasi jalur pendakian yang tampil di CMS dan aplikasi mobile."
      queryKey={['routes']}
      fields={[
        {
          key: 'mountainId',
          label: 'Gunung',
          type: 'select',
          required: true,
          options: mountainOptions,
        },
        { key: 'name', label: 'Nama Jalur', required: true },
        {
          key: 'difficulty',
          label: 'Tingkat Kesulitan',
          type: 'select',
          required: true,
          options: [
            { value: 'EASY', label: 'Mudah' },
            { value: 'MEDIUM', label: 'Sedang' },
            { value: 'HARD', label: 'Sulit' },
          ],
        },
        { key: 'distanceKm', label: 'Jarak (km)', type: 'number', required: true },
        { key: 'estimatedHours', label: 'Estimasi Jam', type: 'number', required: true },
        { key: 'description', label: 'Deskripsi Jalur', type: 'textarea', required: true },
      ]}
      columns={[
        {
          key: 'mountain',
          header: 'Gunung',
          render: (row) => row.mountain?.name ?? row.mountainId ?? '-',
        },
        { key: 'name', header: 'Jalur' },
        { key: 'difficulty', header: 'Kesulitan' },
        { key: 'distanceKm', header: 'Jarak' },
        { key: 'estimatedHours', header: 'Jam' },
      ]}
      getList={ApiService.getRoutes}
      createItem={ApiService.createRoute}
      updateItem={ApiService.updateRoute}
      deleteItem={ApiService.deleteRoute}
    />
  );
}
