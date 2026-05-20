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
      title="Routes"
      description="CRUD jalur pendakian melalui endpoint admin."
      queryKey={['routes']}
      fields={[
        {
          key: 'mountainId',
          label: 'Gunung',
          type: 'select',
          required: true,
          options: mountainOptions,
        },
        { key: 'name', label: 'Nama Route', required: true },
        {
