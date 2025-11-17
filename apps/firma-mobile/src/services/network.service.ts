import NetInfo from '@react-native-community/netinfo';

class NetworkService {
  private isOnline = true;
  private listeners: ((isOnline: boolean) => void)[] = [];

  init() {
    // Subscribe to network state updates
    NetInfo.addEventListener((state) => {
      const wasOnline = this.isOnline;
      this.isOnline = state.isConnected ?? false;

      // Notify listeners if status changed
      if (wasOnline !== this.isOnline) {
        console.log('📡 Network status changed:', this.isOnline ? 'ONLINE' : 'OFFLINE');
        this.notifyListeners();
      }
    });
  }

  async checkConnection(): Promise<boolean> {
    const state = await NetInfo.fetch();
    this.isOnline = state.isConnected ?? false;
    return this.isOnline;
  }

  getStatus(): boolean {
    return this.isOnline;
  }

  // Subscribe to network changes
  subscribe(callback: (isOnline: boolean) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((callback) => callback(this.isOnline));
  }
}

export default new NetworkService();