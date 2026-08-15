// Device types for Bluetooth devices

export type DeviceType = 
  | 'phone'
  | 'apple'
  | 'android'
  | 'audio'
  | 'wearable'
  | 'ble'
  | 'classic'
  | 'unknown';

export type ProximityLevel = 
  | 'VERY_FAR'
  | 'FAR'
  | 'NEARBY'
  | 'CLOSE'
  | 'VERY_CLOSE'
  | 'UNKNOWN';

export type TrendDirection = 
  | 'CLOSER'
  | 'FARTHER'
  | 'STABLE'
  | 'UNKNOWN';

export interface BluetoothDevice {
  id: string;
  name: string;
  address?: string;
  type: DeviceType;
  manufacturer?: string;
  services?: string[];
  isBLE: boolean;
  lastSeen: number;
  favorite: boolean;
}

export interface DeviceWithRSSI extends BluetoothDevice {
  rawRSSI: number;
  filteredRSSI: number;
  proximity: ProximityLevel;
  trend: TrendDirection;
  confidence: number;
  rssiHistory: RSSIEntry[];
}

export interface RSSIEntry {
  timestamp: number;
  rawRSSI: number;
  filteredRSSI: number;
}

export interface HuntState {
  targetDevice: DeviceWithRSSI | null;
  isHunting: boolean;
  audioEnabled: boolean;
  beepInterval: number;
}

export interface ScanState {
  isScanning: boolean;
  devices: Map<string, DeviceWithRSSI>;
  error: string | null;
  adapterStatus: 'available' | 'disabled' | 'unavailable';
}

export interface FilterOptions {
  search: string;
  type: DeviceType | 'all';
  showFavorites: boolean;
}

export interface Settings {
  theme: 'dark' | 'light' | 'system';
  audioEnabled: boolean;
  volume: number;
  rssiThresholds: {
    veryFar: number;
    far: number;
    nearby: number;
    close: number;
    veryClose: number;
  };
  smoothingFactor: number;
  calibrationProfiles: CalibrationProfile[];
  startupScan: boolean;
  notificationsEnabled: boolean;
}

export interface CalibrationProfile {
  id: string;
  name: string;
  environment: string;
  oneMeterRSSI: number;
  pathLossExponent: number;
}

export interface HistoryEntry {
  id: string;
  deviceId: string;
  deviceName: string;
  timestamp: number;
  rawRSSI: number;
  filteredRSSI: number;
  confidence: number;
  proximity: ProximityLevel;
}
