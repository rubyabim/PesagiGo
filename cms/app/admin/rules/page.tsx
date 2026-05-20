'use client';

import EntityCrudPage from '@/components/dashboard/entity-crud-page';
import { ApiService, Rule } from '@/lib/services/api-service';

export default function RulesPage() {
  return (
    <EntityCrudPage<Rule>
      title="Larangan / Rules"
      description="Kelola daftar larangan pendakian dan aturan basecamp."
      queryKey={['rules']}
      fields={[
              { key: 'title', label: 'Judul', required: true },
              { key: 'description', label: 'Deskripsi', type: 'textarea', required: true },
