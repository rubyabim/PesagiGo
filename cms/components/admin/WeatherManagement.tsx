'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Plus, Edit, Trash, Cloud, Sync } from 'lucide-react';
import axios from 'axios';

const weatherSchema = z.object({
  mountainId: z.string().min(1, 'Mountain is required'),
  forecastDate: z.string().min(1, 'Date is required'),
  condition: z.enum(['SUNNY', 'CLOUDY', 'LIGHT_RAIN', 'HEAVY_RAIN', 'STORM', 'FOG']),
  temperatureC: z.number().min(-50).max(60, 'Invalid temperature'),
  windKph: z.number().min(0).optional(),
  note: z.string().optional(),
});

type WeatherFormData = z.infer<typeof weatherSchema>;

interface Weather extends WeatherFormData {
  id: string;
  mountain?: { id: string; name: string };
  createdAt: string;
}

interface Mountain {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

const WeatherManagement = () => {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm<WeatherFormData>({
    resolver: zodResolver(weatherSchema),
    defaultValues: {
      forecastDate: new Date().toISOString().split('T')[0],
    },
  });

  // Fetch weather data
  const { data: weatherData = [], isLoading: weatherLoading } = useQuery({
    queryKey: ['weather'],
    queryFn: async () => {
      const response = await axios.get('/api/weather');
      return response.data;
    },
  });

  // Fetch mountains
  const { data: mountains = [] } = useQuery({
    queryKey: ['mountains'],
    queryFn: async () => {
      const response = await axios.get('/api/mountains');
      return response.data;
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: WeatherFormData) => {
      const response = await axios.post('/api/weather', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weather'] });
      toast.success('Prakiraan cuaca ditambahkan');
      setIsOpen(false);
      reset({
        forecastDate: new Date().toISOString().split('T')[0],
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: WeatherFormData) => {
      const response = await axios.patch(`/api/weather/${editingId}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weather'] });
      toast.success('Prakiraan cuaca diperbarui');
      setIsOpen(false);
      setEditingId(null);
      reset({
        forecastDate: new Date().toISOString().split('T')[0],
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/api/weather/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weather'] });
      toast.success('Prakiraan cuaca dihapus');
    },
  });

  // Sync weather mutation
  const syncMutation = useMutation({
    mutationFn: async (mountainId: string) => {
      const response = await axios.post(`/api/weather/sync/${mountainId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weather'] });
      toast.success('Data cuaca disinkronkan');
    },
  });

  const onSubmit = (data: WeatherFormData) => {
    if (editingId) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (weather: Weather) => {
    setEditingId(weather.id);
    Object.keys(weather).forEach((key) => {
      if (key !== 'id' && key !== 'createdAt' && key !== 'mountain') {
        if (key === 'forecastDate') {
          setValue('forecastDate', new Date(String(weather[key as keyof Weather])).toISOString().split('T')[0]);
        } else {
          const formKey = key as keyof WeatherFormData;
          const fieldValue = weather[key as keyof Weather];
          if (
            typeof fieldValue === 'string' ||
            typeof fieldValue === 'number' ||
            typeof fieldValue === 'undefined'
          ) {
            setValue(formKey, fieldValue);
          }
        }
      }
    });
    setIsOpen(true);
  };

  const handleCloseForm = () => {
    setIsOpen(false);
    setEditingId(null);
    reset({
      forecastDate: new Date().toISOString().split('T')[0],
    });
  };

  const getWeatherIcon = (condition: string) => {
    const icons: Record<string, string> = {
      SUNNY: 'ΓÿÇ∩╕Å',
      CLOUDY: 'Γÿü∩╕Å',
      LIGHT_RAIN: '≡ƒîª∩╕Å',
      HEAVY_RAIN: '≡ƒîº∩╕Å',
      STORM: 'Γ¢ê∩╕Å',
      FOG: '≡ƒî½∩╕Å',
    };
    return icons[condition] || '≡ƒîí∩╕Å';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Cloud className="w-5 h-5" />
            Manajemen Prakiraan Cuaca Real-time
          </h3>
          {!isOpen && (
            <button
              onClick={() => setIsOpen(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              <Plus className="w-4 h-4" />
              Tambah Prakiraan
            </button>
          )}
        </div>
      </div>

      {/* Form */}
      {isOpen && (
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Gunung *</label>
                <select
                  {...register('mountainId')}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Pilih Gunung</option>
                  {mountains.map((mountain: Mountain) => (
                    <option key={mountain.id} value={mountain.id}>
                      {mountain.name}
                    </option>
                  ))}
                </select>
                {errors.mountainId && <p className="text-red-500 text-sm mt-1">{errors.mountainId.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tanggal *</label>
                <input
                  {...register('forecastDate')}
                  type="date"
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.forecastDate && <p className="text-red-500 text-sm mt-1">{errors.forecastDate.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Kondisi Cuaca *</label>
                <select
                  {...register('condition')}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Pilih Kondisi</option>
                  <option value="SUNNY">Cerah ΓÿÇ∩╕Å</option>
                  <option value="CLOUDY">Berawan Γÿü∩╕Å</option>
                  <option value="LIGHT_RAIN">Hujan Ringan ≡ƒîª∩╕Å</option>
                  <option value="HEAVY_RAIN">Hujan Lebat ≡ƒîº∩╕Å</option>
                  <option value="STORM">Badai Γ¢ê∩╕Å</option>
                  <option value="FOG">Kabut ≡ƒî½∩╕Å</option>
                </select>
                {errors.condition && <p className="text-red-500 text-sm mt-1">{errors.condition.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Suhu (┬░C) *</label>
                <input
                  {...register('temperatureC', { valueAsNumber: true })}
                  type="number"
                  step="0.1"
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="25.5"
                />
                {errors.temperatureC && <p className="text-red-500 text-sm mt-1">{errors.temperatureC.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Kecepatan Angin (km/h)</label>
                <input
                  {...register('windKph', { valueAsNumber: true })}
                  type="number"
                  step="0.1"
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="10.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Catatan</label>
                <textarea
                  {...register('note')}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Catatan tambahan"
                  rows={2}
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
        </div>
      )}

      {/* Weather Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {weatherLoading ? (
          <div className="col-span-full text-center py-8 text-gray-500">Loading...</div>
        ) : weatherData.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">Belum ada prakiraan cuaca</div>
        ) : (
          weatherData.map((weather: Weather) => (
            <div key={weather.id} className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-semibold">{weather.mountain?.name}</h4>
                  <p className="text-sm text-gray-600">
                    {new Date(weather.forecastDate).toLocaleDateString('id-ID')}
                  </p>
                </div>
                <span className="text-3xl">{getWeatherIcon(weather.condition)}</span>
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-sm">
                  <span className="font-medium">Kondisi:</span> {weather.condition}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Suhu:</span> {weather.temperatureC}┬░C
                </p>
                {weather.windKph && (
                  <p className="text-sm">
                    <span className="font-medium">Angin:</span> {weather.windKph} km/h
                  </p>
                )}
                {weather.note && <p className="text-xs text-gray-600 italic">{weather.note}</p>}
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => handleEdit(weather)}
                  className="text-blue-600 hover:text-blue-800 p-1"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteMutation.mutate(weather.id)}
                  className="text-red-600 hover:text-red-800 p-1"
                >
                  <Trash className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Sync Section */}
      <div className="bg-blue-50 rounded-lg shadow p-6 border border-blue-200">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <Sync className="w-5 h-5" />
          Sinkronisasi Data Cuaca Real-time
        </h4>
        <p className="text-sm text-gray-700 mb-4">
          Sinkronkan data cuaca terbaru dari API weather untuk setiap gunung
        </p>
        <div className="flex flex-wrap gap-2">
          {mountains.map((mountain: Mountain) => (
            <button
              key={mountain.id}
              onClick={() => syncMutation.mutate(mountain.id)}
              disabled={syncMutation.isPending}
              className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50 transition"
            >
              Sync {mountain.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeatherManagement;
