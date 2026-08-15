use btleplug::api::{Central, Manager as _, Peripheral as _, ScanFilter};
use btleplug::platform::Manager;
use std::time::Duration;
use tokio::time;
use tauri::{Emitter, AppHandle};
use crate::bluetooth::models::{BluetoothDevice, DeviceWithRSSI, RSSIEntry};
use crate::bluetooth::AppState;

pub struct BluetoothScanner {
    manager: Option<Manager>,
    adapter: Option<btleplug::platform::Adapter>,
}

impl BluetoothScanner {
    pub fn new() -> Self {
        BluetoothScanner {
            manager: None,
            adapter: None,
        }
    }

    pub async fn initialize(&mut self) -> Result<(), String> {
        let manager = Manager::new().await
            .map_err(|e| format!("Failed to create Bluetooth manager: {}", e))?;
        
        let adapters = manager.adapters().await;
        if adapters.is_empty() {
            return Err("No Bluetooth adapters found".to_string());
        }

        self.manager = Some(manager);
        self.adapter = Some(adapters[0].clone());
        Ok(())
    }

    pub async fn start_scan(
        &self,
        app_handle: AppHandle,
        state: AppState,
    ) -> Result<(), String> {
        let adapter = self.adapter.clone()
            .ok_or("Bluetooth adapter not initialized")?;

        // Set scanning status
        *state.is_scanning.write().await = true;
        *state.adapter_status.write().await = "available".to_string();

        let scan_filter = ScanFilter {
            services: Vec::new(), // Scan for all services
        };

        adapter.start_scan(scan_filter).await
            .map_err(|e| format!("Failed to start scan: {}", e))?;

        // Listen for advertisements
        let mut notification_stream = adapter.notifications()
            .map_err(|e| format!("Failed to get notification stream: {}", e))?;

        let devices_clone = state.devices.clone();
        let settings_clone = state.settings.clone();

        // Spawn task to handle incoming advertisements
        tokio::spawn(async move {
            while let Some(data) = notification_stream.next().await {
                let device_info = data;
                
                // Create or update device
                let device_id = device_info.peripheral.id().to_string();
                let name = device_info.peripheral.properties()
                    .and_then(|p| p.local_name)
                    .unwrap_or_else(|| "Unknown Device".to_string());
                
                let rssi = device_info.rssi.unwrap_or(-100);
                
                let now = std::time::SystemTime::now()
                    .duration_since(std::time::UNIX_EPOCH)
                    .unwrap()
                    .as_millis() as u64;

                // Get current device or create new one
                let mut devices = devices_clone.write().await;
                let settings = settings_clone.read().await;
                
                let device_entry = devices.entry(device_id.clone()).or_insert_with(|| {
                    DeviceWithRSSI {
                        device: BluetoothDevice {
                            id: device_id.clone(),
                            name: name.clone(),
                            address: Some(device_info.peripheral.id().to_string()),
                            device_type: detect_device_type(&name),
                            manufacturer: None,
                            services: None,
                            is_ble: true,
                            last_seen: now,
                            favorite: false,
                        },
                        raw_rssi: rssi,
                        filtered_rssi: rssi as f64,
                        proximity: "UNKNOWN".to_string(),
                        trend: "UNKNOWN".to_string(),
                        confidence: 0.0,
                        rssi_history: Vec::new(),
                    }
                });

                // Update RSSI with filtering
                let smoothing = settings.smoothing_factor;
                let filtered = if device_entry.filtered_rssi == 0.0 {
                    rssi as f64
                } else {
                    device_entry.filtered_rssi * (1.0 - smoothing) + (rssi as f64) * smoothing
                };

                // Update history
                device_entry.rssi_history.push(RSSIEntry {
                    timestamp: now,
                    raw_rssi: rssi,
                    filtered_rssi: filtered,
                });
                device_entry.rssi_history.truncate(100);

                // Calculate trend
                if device_entry.rssi_history.len() >= 5 {
                    let recent: Vec<f64> = device_entry.rssi_history.iter()
                        .skip(device_entry.rssi_history.len() - 5)
                        .map(|e| e.filtered_rssi)
                        .collect();
                    
                    let first_half: f64 = recent[..3].iter().sum::<f64>() / 3.0;
                    let second_half: f64 = recent[2..].iter().sum::<f64>() / 3.0;
                    
                    device_entry.trend = if second_half > first_half + 2.0 {
                        "CLOSER".to_string()
                    } else if second_half < first_half - 2.0 {
                        "FARTHER".to_string()
                    } else {
                        "STABLE".to_string()
                    };
                }

                // Calculate proximity
                let thresholds = &settings.rssi_thresholds;
                device_entry.proximity = if filtered >= thresholds.very_close as f64 {
                    "VERY_CLOSE".to_string()
                } else if filtered >= thresholds.close as f64 {
                    "CLOSE".to_string()
                } else if filtered >= thresholds.nearby as f64 {
                    "NEARBY".to_string()
                } else if filtered >= thresholds.far as f64 {
                    "FAR".to_string()
                } else if filtered >= thresholds.very_far as f64 {
                    "VERY_FAR".to_string()
                } else {
                    "UNKNOWN".to_string()
                };

                device_entry.raw_rssi = rssi;
                device_entry.filtered_rssi = filtered;
                device_entry.device.last_seen = now;

                // Emit event to frontend
                let _ = app_handle.emit("device-updated", &device_entry);
            }
        });

        Ok(())
    }

    pub async fn stop_scan(&self, state: AppState) -> Result<(), String> {
        if let Some(adapter) = &self.adapter {
            adapter.stop_scan().await
                .map_err(|e| format!("Failed to stop scan: {}", e))?;
        }
        
        *state.is_scanning.write().await = false;
        Ok(())
    }
}

fn detect_device_type(name: &str) -> String {
    let name_lower = name.to_lowercase();
    
    if name_lower.contains("iphone") || name_lower.contains("ipad") || name_lower.contains("apple") {
        "apple".to_string()
    } else if name_lower.contains("android") || name_lower.contains("samsung") || name_lower.contains("pixel") {
        "android".to_string()
    } else if name_lower.contains("phone") {
        "phone".to_string()
    } else if name_lower.contains("airpod") || name_lower.contains("headphone") || name_lower.contains("speaker") {
        "audio".to_string()
    } else if name_lower.contains("watch") || name_lower.contains("band") || name_lower.contains("fitbit") {
        "wearable".to_string()
    } else {
        "ble".to_string()
    }
}
