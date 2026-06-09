import io, { Socket } from 'socket.io-client';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';
const SOCKET_URL = API_URL.replace(/\/api\/?$/, '');

class RealtimeService {
  private socket: Socket | null = null;

  connect() {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('Connected to realtime server');
      this.socket?.emit('subscribe:weather');
      this.socket?.emit('subscribe:locations');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from realtime server');
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  disconnect() {
    if (this.socket?.connected) {
      this.socket.disconnect();
    }
  }

  onWeatherUpdate(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('weather:realtime', callback);
      this.socket.on('weather:update', callback);
    }

    return () => this.removeWeatherListener(callback);
  }

  onLocationUpdate(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('location:realtime', callback);
      this.socket.on('location:update', callback);
    }

    return () => this.removeLocationListener(callback);
  }

  onAppRefresh(callback: (event: any) => void) {
    if (this.socket) {
      this.socket.on('app:refresh', callback);
    }

    return () => this.removeRefreshListener(callback);
  }

  removeWeatherListener(callback?: (data: any) => void) {
    if (this.socket) {
      this.socket.off('weather:realtime', callback);
      this.socket.off('weather:update', callback);
    }
  }

  removeLocationListener(callback?: (data: any) => void) {
    if (this.socket) {
      this.socket.off('location:realtime', callback);
      this.socket.off('location:update', callback);
    }
  }

  removeRefreshListener(callback?: (event: any) => void) {
    if (this.socket) {
      this.socket.off('app:refresh', callback);
    }
  }
}

export default new RealtimeService();
