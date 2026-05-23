/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn().mockResolvedValue(null),
    setItem: jest.fn().mockResolvedValue(undefined),
    removeItem: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('@expo/vector-icons', () => ({
  FontAwesome: ({ name }: { name: string }) => {
    const { Text: MockText } = require('react-native');
    return <MockText>{name}</MockText>;
  },
}));

jest.mock('../src/api/client', () => ({
  fetchApiHealth: jest.fn().mockResolvedValue({
    status: 'ok',
    service: 'pesagigo-backend',
    timestamp: '2026-04-28T00:00:00.000Z',
  }),
  fetchMountains: jest.fn().mockResolvedValue([{ id: '1', name: 'Pesagi', location: 'Lampung' }]),
  fetchSessions: jest.fn().mockResolvedValue([
    {
      id: '1',
      mountainId: '1',
      date: '2026-04-29T00:00:00.000Z',
      quotaTotal: 100,
      quotaBooked: 25,
      quotaAvailable: 75,
      price: 150000,
      mountain: { id: '1', name: 'Pesagi', location: 'Lampung' },
    },
  ]),
  fetchWeather: jest.fn().mockResolvedValue([
    {
      id: '1',
      forecastDate: '2026-04-28T00:00:00.000Z',
      condition: 'SUNNY',
      temperatureC: 24,
      windKph: 10,
      note: 'Cerah',
      mountain: { id: '1', name: 'Pesagi', location: 'Lampung' },
    },
  ]),
  fetchAnnouncements: jest.fn().mockResolvedValue([]),
  fetchRules: jest.fn().mockResolvedValue([]),
  fetchNews: jest.fn().mockResolvedValue([]),
}));

test('renders correctly', async () => {
  await ReactTestRenderer.act(async () => {
    ReactTestRenderer.create(<App />);
    await Promise.resolve();
  });
});
