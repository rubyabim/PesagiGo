'use client';

import Image from 'next/image';
import EntityCrudPage from '@/components/dashboard/entity-crud-page';
import { ApiService, News } from '@/lib/services/api-service';

export default function NewsPage() {
  return (
    <EntityCrudPage<News>
      title="Berita / Artikel"
      description="Kelola berita terbaru dalam format card modern."
      queryKey={['news']}
      fields={[
              { key: 'title', label: 'Judul', required: true },
              { key: 'description', label: 'Deskripsi', type: 'textarea', required: true },
              { key: 'imageUrl', label: 'URL Gambar' },
              { key: 'mapUrl', label: 'Google Maps (URL embed)', type: 'url' },
              { key: 'publishedAt', label: 'Tanggal Publish', type: 'datetime-local' },
            ]}
      columns={[
        { key: 'title', header: 'Judul' },
        {
          key: 'description',
          header: 'Deskripsi',
          render: (row) => <span className="line-clamp-2">{row.description}</span>,
        },
        {
          key: 'imageUrl',
          header: 'Gambar',
          render: (row) => row.imageUrl ? (
            <Image src={String(row.imageUrl)} alt={String(row.title)} width={64} height={40} unoptimized className="h-10 w-16 rounded object-cover" />
          ) : '-'
        },
        { key: 'publishedAt', header: 'Tanggal' },
      ]}
      getList={ApiService.getNews}
      createItem={ApiService.createNews}
      updateItem={ApiService.updateNews}
      deleteItem={ApiService.deleteNews}
    />
  );
}
