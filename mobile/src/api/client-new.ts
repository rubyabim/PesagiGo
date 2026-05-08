import { getApiBaseUrl } from '../config/api';

export type ApiHealth = {
  status: string;
  service: string;
  timestamp: string;
};