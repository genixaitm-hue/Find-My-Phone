//! Tauri commands for Bluetooth operations

use tauri::{State, AppHandle};
use crate::bluetooth::AppState;
use crate::bluetooth::models::{DeviceWithRSSI, HistoryEntry, Settings};
use std::collections::HashMap;

/// Start Bluetooth scanning
#[tauri::command]
pub async fn start_scan(
    app_handle: AppHandle,
    state: State<'_, AppState>,
) -> Result<(), String> {
    // Check if already scanning
    {
        let is_scanning = state.is_scanning.read().await;
        if *is_scanning {
            return Err("Already scanning".to_string());
        }
    }

    // Initialize scanner and start
    #[cfg(windows)]
    {
        use crate::bluetooth::scanner::BluetoothScanner;
        
        let mut scanner = BluetoothScanner::new();
        scanner.initialize().await?;
        scanner.start_scan(app_handle, state.inner().clone()).await?;
    }
    
    #[cfg(not(windows))]
    {
        return Err("Bluetooth scanning is only supported on Windows".to_string());
    }

    Ok(())
}

/// Stop Bluetooth scanning
#[tauri::command]
pub async fn stop_scan(state: State<'_, AppState>) -> Result<(), String> {
    #[cfg(windows)]
    {
        use crate::bluetooth::scanner::BluetoothScanner;
        
        let scanner = BluetoothScanner::new();
        scanner.stop_scan(state.inner().clone()).await?;
    }
    
    #[cfg(not(windows))]
    {
        return Err("Bluetooth scanning is only supported on Windows".to_string());
    }

    Ok(())
}

/// Get current scan status
#[tauri::command]
pub async fn get_scan_status(state: State<'_, AppState>) -> Result<HashMap<String, serde_json::Value>, String> {
    let is_scanning = *state.is_scanning.read().await;
    let adapter_status = state.adapter_status.read().await.clone();
    
    let mut result = HashMap::new();
    result.insert("isScanning".to_string(), serde_json::json!(is_scanning));
    result.insert("adapterStatus".to_string(), serde_json::json!(adapter_status));
    
    Ok(result)
}

/// Get all discovered devices
#[tauri::command]
pub async fn get_devices(state: State<'_, AppState>) -> Result<Vec<DeviceWithRSSI>, String> {
    let devices = state.devices.read().await;
    Ok(devices.values().cloned().collect())
}

/// Select a device for hunting
#[tauri::command]
pub async fn select_device(device_id: String, state: State<'_, AppState>) -> Result<(), String> {
    let devices = state.devices.read().await;
    if !devices.contains_key(&device_id) {
        return Err("Device not found".to_string());
    }
    drop(devices);
    
    let mut hunt_target = state.hunt_target.write().await;
    *hunt_target = Some(device_id);
    Ok(())
}

/// Start hunt mode
#[tauri::command]
pub async fn start_hunt(state: State<'_, AppState>) -> Result<(), String> {
    let hunt_target = state.hunt_target.read().await;
    if hunt_target.is_none() {
        return Err("No target selected".to_string());
    }
    drop(hunt_target);
    
    let mut is_hunting = state.is_hunting.write().await;
    *is_hunting = true;
    Ok(())
}

/// Stop hunt mode
#[tauri::command]
pub async fn stop_hunt(state: State<'_, AppState>) -> Result<(), String> {
    let mut is_hunting = state.is_hunting.write().await;
    *is_hunting = false;
    Ok(())
}

/// Toggle favorite status for a device
#[tauri::command]
pub async fn toggle_favorite(device_id: String, state: State<'_, AppState>) -> Result<(), String> {
    let mut devices = state.devices.write().await;
    if let Some(device) = devices.get_mut(&device_id) {
        device.device.favorite = !device.device.favorite;
        Ok(())
    } else {
        Err("Device not found".to_string())
    }
}

/// Get hunt history
#[tauri::command]
pub async fn get_history(state: State<'_, AppState>) -> Result<Vec<HistoryEntry>, String> {
    let history = state.history.read().await;
    Ok(history.clone())
}

/// Export history as CSV
#[tauri::command]
pub async fn export_history_csv(state: State<'_, AppState>) -> Result<String, String> {
    let history = state.history.read().await;
    
    if history.is_empty() {
        return Ok(String::new());
    }
    
    let mut csv = String::from("Timestamp,Device,Raw RSSI,Filtered RSSI,Confidence,Proximity\n");
    for entry in history.iter() {
        csv.push_str(&format!(
            "{},{},{},{},{},{}\n",
            entry.timestamp,
            entry.device_name,
            entry.raw_rssi,
            entry.filtered_rssi.round() as i16,
            (entry.confidence * 100.0).round() / 100.0,
            entry.proximity
        ));
    }
    
    Ok(csv)
}

/// Update settings
#[tauri::command]
pub async fn update_settings(settings: Settings, state: State<'_, AppState>) -> Result<(), String> {
    let mut current_settings = state.settings.write().await;
    *current_settings = settings;
    Ok(())
}

/// Get current settings
#[tauri::command]
pub async fn get_settings(state: State<'_, AppState>) -> Result<Settings, String> {
    let settings = state.settings.read().await;
    Ok(settings.clone())
}

/// Calibrate RSSI at a specific distance
#[tauri::command]
pub async fn calibrate_rssi(distance_meters: f64, state: State<'_, AppState>) -> Result<i16, String> {
    // This would measure the current RSSI and store it for the given distance
    // For now, return a placeholder value
    let devices = state.devices.read().await;
    if let Some((_, device)) = devices.iter().next() {
        Ok(device.raw_rssi)
    } else {
        Err("No devices available for calibration".to_string())
    }
}

/// Enable or disable audio
#[tauri::command]
pub async fn set_audio_enabled(enabled: bool, state: State<'_, AppState>) -> Result<(), String> {
    let mut settings = state.settings.write().await;
    settings.audio_enabled = enabled;
    Ok(())
}

/// Set audio volume
#[tauri::command]
pub async fn set_volume(volume: f64, state: State<'_, AppState>) -> Result<(), String> {
    let mut settings = state.settings.write().await;
    settings.volume = volume.clamp(0.0, 1.0);
    Ok(())
}
