import { Platform } from 'react-native';

export function getApiBaseUrl() {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3001';
  }

  return 'http://localhost:3001';
}
