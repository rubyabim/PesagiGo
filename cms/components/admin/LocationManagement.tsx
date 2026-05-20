'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Plus, Edit, Trash, MapPin } from 'lucide-react';
import MapView from './MapView';
import axios from 'axios';

const locationSchema = z.object({
  name: z.string().min(1, 'Location name is required'),
  latitude: z.number().min(-90).max(90, 'Invalid latitude'),
  longitude: z.number().min(-180).max(180, 'Invalid longitude'),
  address: z.string().min(1, 'Address is required'),
  description: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  type: z.string().default('POI'),
});

type LocationFormData = z.infer<typeof locationSchema>;

interface Location extends LocationFormData {
  id: string;
  createdAt: string;
}

const LocationManagement = () => {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm<LocationFormData>({
    resolver: zodResolver(locationSchema),
  });

  // Fetch locations
  const { data: locations = [], isLoading } = useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      const response = await axios.get('/api/locations');
      return response.data;
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: LocationFormData) => {
      const response = await axios.post('/api/locations', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast.success('Location created successfully');
      setIsOpen(false);
      reset();
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: LocationFormData) => {
      const response = await axios.patch(`/api/locations/${editingId}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast.success('Location updated successfully');
      setIsOpen(false);
      setEditingId(null);
      reset();
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/api/locations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast.success('Location deleted successfully');
    },
  });

  const onSubmit = (data: LocationFormData) => {
    if (editingId) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (location: Location) => {
    setEditingId(location.id);
    Object.keys(location).forEach((key) => {
      if (key !== 'id' && key !== 'createdAt') {
        const fieldKey = key as keyof LocationFormData;
        const fieldValue = location[key as keyof Location];
        if (
          typeof fieldValue === 'string' ||
          typeof fieldValue === 'number' ||
          typeof fieldValue === 'undefined'
        ) {
          setValue(fieldKey, fieldValue);
        }
      }
    });
    setIsOpen(true);
  };

  const handleCloseForm = () => {
    setIsOpen(false);
    setEditingId(null);
    reset();
  };

  return (
    <div className="space-y-6">
      {/* Map View */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Lokasi Peta
        </h3>
        <MapView locations={locations} />
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Manajemen Lokasi</h3>
          {!isOpen && (
            <button
              onClick={() => setIsOpen(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              <Plus className="w-4 h-4" />
              Tambah Lokasi
            </button>
          )}
        </div>

        {isOpen && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nama Lokasi *</label>
                <input
                  {...register('name')}
                  type="text"
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contoh: Puncak Rinjani"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tipe Lokasi</label>
                <input
                  {...register('type')}
                  type="text"
                  defaultValue="POI"
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="POI, RestStop, etc"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Latitude *</label>
                <input
                  {...register('latitude', { valueAsNumber: true })}
                  type="number"
                  step="0.0001"
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="-1.2557"
                />
                {errors.latitude && <p className="text-red-500 text-sm mt-1">{errors.latitude.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Longitude *</label>
                <input
                  {...register('longitude', { valueAsNumber: true })}
                  type="number"
                  step="0.0001"
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="116.7"
                />
                {errors.longitude && <p className="text-red-500 text-sm mt-1">{errors.longitude.message}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Alamat *</label>
                <input
                  {...register('address')}
                  type="text"
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Alamat lengkap"
                />
                {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Deskripsi</label>
                <textarea
                  {...register('description')}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Deskripsi lokasi"
                  rows={3}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">URL Gambar</label>
                <input
                  {...register('imageUrl')}
                  type="text"
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {editingId ? 'Update' : 'Simpan'}
              </button>
              <button
                type="button"
                onClick={handleCloseForm}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
              >
                Batal
              </button>
            </div>
          </form>
        )}

        {/* Locations List */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-2 text-left">Nama</th>
                <th className="px-4 py-2 text-left">Tipe</th>
                <th className="px-4 py-2 text-left">Alamat</th>
                <th className="px-4 py-2 text-left">Koordinat</th>
                <th className="px-4 py-2 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-3 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : locations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-3 text-center text-gray-500">
                    Belum ada lokasi
                  </td>
                </tr>
              ) : (
                locations.map((location: Location) => (
                  <tr key={location.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{location.name}</td>
                    <td className="px-4 py-3">{location.type}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">{location.address}</td>
                    <td className="px-4 py-3 text-xs">
                      {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                    </td>
                    <td className="px-4 py-3 text-center space-x-2">
                      <button
                        onClick={() => handleEdit(location)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="w-4 h-4 inline" />
                      </button>
                      <button
                        onClick={() => deleteMutation.mutate(location.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LocationManagement;
