import { create } from 'zustand';
import type { 
  DeviceWithRSSI, 
  HuntState, 
  FilterOptions, 
  Settings, 
  HistoryEntry,
  ProximityLevel,
  TrendDirection 
} from '../types';

interface DeviceStore {
  // Scan state
  isScanning: boolean;
  devices: Map<string, DeviceWithRSSI>;
  adapterStatus: 'available' | 'disabled' | 'unavailable';
  scanError: string | null;
  
  // Hunt state
  huntTargetId: string | null;
  isHunting: boolean;
  
  // Filters
  filters: FilterOptions;
  
  // History
  history: HistoryEntry[];
  
  // Settings
  settings: Settings;
  
  // Actions
  setScanning: (scanning: boolean) => void;
  addDevice: (device: Partial<DeviceWithRSSI> & { id: string; name: string }) => void;
  updateDeviceRSSI: (deviceId: string, rawRSSI: number) => void;
  removeDevice: (deviceId: string) => void;
  clearDevices: () => void;
  setAdapterStatus: (status: 'available' | 'disabled' | 'unavailable') => void;
  setScanError: (error: string | null) => void;
  
  setHuntTarget: (deviceId: string | null) => void;
  toggleHunting: () => void;
  
  setFilters: (filters: Partial<FilterOptions>) => void;
  
  addToHistory: (entry: Omit<HistoryEntry, 'id'>) => void;
  clearHistory: () => void;
  
  updateSettings: (settings: Partial<Settings>) => void;
  toggleFavorite: (deviceId: string) => void;
}

const defaultSettings: Settings = {
  theme: 'dark',
  audioEnabled: true,
  volume: 0.5,
  rssiThresholds: {
    veryFar: -90,
    far: -75,
    nearby: -60,
    close: -45,
    veryClose: -30,
  },
  smoothingFactor: 0.3,
  calibrationProfiles: [],
  startupScan: true,
  notificationsEnabled: true,
};

export const useDeviceStore = create<DeviceStore>((set, get) => ({
  // Initial state
  isScanning: false,
  devices: new Map(),
  adapterStatus: 'available',
  scanError: null,
  huntTargetId: null,
  isHunting: false,
  filters: {
    search: '',
    type: 'all',
    showFavorites: false,
  },
  history: [],
  settings: defaultSettings,
  
  // Scan actions
  setScanning: (scanning) => set({ isScanning: scanning }),
  
  addDevice: (deviceData) => {
    const { devices } = get();
    const existing = devices.get(deviceData.id);
    
    const now = Date.now();
    const newDevice: DeviceWithRSSI = {
      id: deviceData.id,
      name: deviceData.name,
      address: deviceData.address,
      type: deviceData.type || 'unknown',
      manufacturer: deviceData.manufacturer,
      services: deviceData.services,
      isBLE: deviceData.isBLE ?? true,
      lastSeen: now,
      favorite: deviceData.favorite ?? false,
      rawRSSI: deviceData.rawRSSI ?? -100,
      filteredRSSI: deviceData.filteredRSSI ?? deviceData.rawRSSI ?? -100,
      proximity: 'UNKNOWN',
      trend: 'UNKNOWN',
      confidence: 0,
      rssiHistory: [],
    };
    
    if (existing) {
      // Merge with existing device
      newDevice.rssiHistory = [...existing.rssiHistory].slice(-50);
      newDevice.favorite = existing.favorite;
      newDevice.filteredRSSI = existing.filteredRSSI;
    }
    
    devices.set(deviceData.id, newDevice);
    set({ devices: new Map(devices) });
  },
  
  updateDeviceRSSI: (deviceId, rawRSSI) => {
    const { devices, settings } = get();
    const device = devices.get(deviceId);
    if (!device) return;
    
    const now = Date.now();
    const smoothingFactor = settings.smoothingFactor;
    
    // Exponential moving average filter
    const filteredRSSI = device.filteredRSSI === 0 
      ? rawRSSI 
      : device.filteredRSSI * (1 - smoothingFactor) + rawRSSI * smoothingFactor;
    
    // Update RSSI history (bounded to last 100 entries)
    const newHistory = [
      ...device.rssiHistory,
      { timestamp: now, rawRSSI, filteredRSSI }
    ].slice(-100);
    
    // Calculate trend based on recent history
    let trend: TrendDirection = 'UNKNOWN';
    if (newHistory.length >= 5) {
      const recent = newHistory.slice(-5);
      const firstHalf = recent.slice(0, 3).reduce((sum, e) => sum + e.filteredRSSI, 0) / 3;
      const secondHalf = recent.slice(2).reduce((sum, e) => sum + e.filteredRSSI, 0) / 3;
      
      if (secondHalf > firstHalf + 2) trend = 'CLOSER';
      else if (secondHalf < firstHalf - 2) trend = 'FARTHER';
      else trend = 'STABLE';
    }
    
    // Calculate proximity
    const { rssiThresholds } = settings;
    let proximity: ProximityLevel = 'UNKNOWN';
    if (filteredRSSI >= rssiThresholds.veryClose) proximity = 'VERY_CLOSE';
    else if (filteredRSSI >= rssiThresholds.close) proximity = 'CLOSE';
    else if (filteredRSSI >= rssiThresholds.nearby) proximity = 'NEARBY';
    else if (filteredRSSI >= rssiThresholds.far) proximity = 'FAR';
    else if (filteredRSSI >= rssiThresholds.veryFar) proximity = 'VERY_FAR';
    
    // Calculate confidence (based on signal stability)
    let confidence = 0;
    if (newHistory.length >= 10) {
      const recent = newHistory.slice(-10).map(e => e.filteredRSSI);
      const variance = recent.reduce((sum, val) => sum + Math.pow(val - filteredRSSI, 2), 0) / 10;
      confidence = Math.max(0, Math.min(1, 1 - Math.sqrt(variance) / 20));
    }
    
    const updatedDevice: DeviceWithRSSI = {
      ...device,
      rawRSSI,
      filteredRSSI,
      proximity,
      trend,
      confidence,
      rssiHistory: newHistory,
      lastSeen: now,
    };
    
    devices.set(deviceId, updatedDevice);
    set({ devices: new Map(devices) });
  },
  
  removeDevice: (deviceId) => {
    const { devices } = get();
    devices.delete(deviceId);
    set({ devices: new Map(devices) });
  },
  
  clearDevices: () => set({ devices: new Map() }),
  
  setAdapterStatus: (status) => set({ adapterStatus: status }),
  setScanError: (error) => set({ scanError: error }),
  
  // Hunt actions
  setHuntTarget: (deviceId) => set({ huntTargetId: deviceId }),
  
  toggleHunting: () => {
    const { huntTargetId, isHunting } = get();
    if (!huntTargetId && !isHunting) return;
    set({ isHunting: !isHunting });
  },
  
  // Filter actions
  setFilters: (newFilters) => {
    const { filters } = get();
    set({ filters: { ...filters, ...newFilters } });
  },
  
  // History actions
  addToHistory: (entry) => {
    const { history } = get();
    const newEntry: HistoryEntry = {
      ...entry,
      id: `${entry.deviceId}-${entry.timestamp}`,
    };
    // Keep last 1000 entries
    set({ history: [newEntry, ...history].slice(0, 1000) });
  },
  
  clearHistory: () => set({ history: [] }),
  
  // Settings actions
  updateSettings: (newSettings) => {
    const { settings } = get();
    set({ settings: { ...settings, ...newSettings } });
  },
  
  toggleFavorite: (deviceId) => {
    const { devices } = get();
    const device = devices.get(deviceId);
    if (device) {
      device.favorite = !device.favorite;
      devices.set(deviceId, device);
      set({ devices: new Map(devices) });
    }
  },
}));
