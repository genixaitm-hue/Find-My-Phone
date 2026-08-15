import { invoke } from '@tauri-apps/api/core';
import type { BluetoothDevice, RSSIEntry } from '../types';

export interface ScanResult {
  devices: BluetoothDevice[];
  adapterStatus: 'available' | 'disabled' | 'unavailable';
}

export interface RSSIUpdate {
  deviceId: string;
  rssi: number;
  timestamp: number;
}

/**
 * Start Bluetooth scanning
 */
export async function startScan(): Promise<void> {
  try {
    await invoke('start_scan');
  } catch (error) {
    console.error('Failed to start scan:', error);
    throw error;
  }
}

/**
 * Stop Bluetooth scanning
 */
export async function stopScan(): Promise<void> {
  try {
    await invoke('stop_scan');
  } catch (error) {
    console.error('Failed to stop scan:', error);
    throw error;
  }
}

/**
 * Get current scan status
 */
export async function getScanStatus(): Promise<{
  isScanning: boolean;
  adapterStatus: 'available' | 'disabled' | 'unavailable';
}> {
  try {
    return await invoke('get_scan_status');
  } catch (error) {
    console.error('Failed to get scan status:', error);
    return { isScanning: false, adapterStatus: 'unavailable' };
  }
}

/**
 * Select a device for hunting
 */
export async function selectDevice(deviceId: string): Promise<void> {
  try {
    await invoke('select_device', { deviceId });
  } catch (error) {
    console.error('Failed to select device:', error);
    throw error;
  }
}

/**
 * Start hunt mode for selected device
 */
export async function startHunt(): Promise<void> {
  try {
    await invoke('start_hunt');
  } catch (error) {
    console.error('Failed to start hunt:', error);
    throw error;
  }
}

/**
 * Stop hunt mode
 */
export async function stopHunt(): Promise<void> {
  try {
    await invoke('stop_hunt');
  } catch (error) {
    console.error('Failed to stop hunt:', error);
    throw error;
  }
}

/**
 * Toggle favorite status for a device
 */
export async function toggleFavorite(deviceId: string): Promise<void> {
  try {
    await invoke('toggle_favorite', { deviceId });
  } catch (error) {
    console.error('Failed to toggle favorite:', error);
    throw error;
  }
}

/**
 * Get hunt history
 */
export async function getHistory(): Promise<RSSIEntry[]> {
  try {
    return await invoke('get_history');
  } catch (error) {
    console.error('Failed to get history:', error);
    return [];
  }
}

/**
 * Export history to CSV
 */
export async function exportHistoryCSV(): Promise<string> {
  try {
    return await invoke('export_history_csv');
  } catch (error) {
    console.error('Failed to export history:', error);
    throw error;
  }
}

/**
 * Update settings
 */
export async function updateSettings(settings: Record<string, unknown>): Promise<void> {
  try {
    await invoke('update_settings', { settings });
  } catch (error) {
    console.error('Failed to update settings:', error);
    throw error;
  }
}

/**
 * Get current settings
 */
export async function getSettings(): Promise<Record<string, unknown>> {
  try {
    return await invoke('get_settings');
  } catch (error) {
    console.error('Failed to get settings:', error);
    return {};
  }
}

/**
 * Calibrate RSSI at a specific distance
 */
export async function calibrateRSSI(distanceMeters: number): Promise<number> {
  try {
    return await invoke('calibrate_rssi', { distanceMeters });
  } catch (error) {
    console.error('Failed to calibrate RSSI:', error);
    throw error;
  }
}

/**
 * Enable audio hunt mode
 */
export async function setAudioEnabled(enabled: boolean): Promise<void> {
  try {
    await invoke('set_audio_enabled', { enabled });
  } catch (error) {
    console.error('Failed to set audio enabled:', error);
    throw error;
  }
}

/**
 * Set audio volume
 */
export async function setVolume(volume: number): Promise<void> {
  try {
    await invoke('set_volume', { volume });
  } catch (error) {
    console.error('Failed to set volume:', error);
    throw error;
  }
}
