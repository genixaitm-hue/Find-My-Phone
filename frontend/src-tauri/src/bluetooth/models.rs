use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BluetoothDevice {
    pub id: String,
    pub name: String,
    pub address: Option<String>,
    #[serde(rename = "type")]
    pub device_type: String,
    pub manufacturer: Option<String>,
    pub services: Option<Vec<String>>,
    #[serde(rename = "isBLE")]
    pub is_ble: bool,
    #[serde(rename = "lastSeen")]
    pub last_seen: u64,
    pub favorite: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeviceWithRSSI {
    #[serde(flatten)]
    pub device: BluetoothDevice,
    #[serde(rename = "rawRSSI")]
    pub raw_rssi: i16,
    #[serde(rename = "filteredRSSI")]
    pub filtered_rssi: f64,
    pub proximity: String,
    pub trend: String,
    pub confidence: f64,
    #[serde(rename = "rssiHistory")]
    pub rssi_history: Vec<RSSIEntry>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RSSIEntry {
    pub timestamp: u64,
    #[serde(rename = "rawRSSI")]
    pub raw_rssi: i16,
    #[serde(rename = "filteredRSSI")]
    pub filtered_rssi: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScanStatus {
    #[serde(rename = "isScanning")]
    pub is_scanning: bool,
    #[serde(rename = "adapterStatus")]
    pub adapter_status: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HistoryEntry {
    pub id: String,
    #[serde(rename = "deviceId")]
    pub device_id: String,
    #[serde(rename = "deviceName")]
    pub device_name: String,
    pub timestamp: u64,
    #[serde(rename = "rawRSSI")]
    pub raw_rssi: i16,
    #[serde(rename = "filteredRSSI")]
    pub filtered_rssi: f64,
    pub confidence: f64,
    pub proximity: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Settings {
    pub theme: String,
    #[serde(rename = "audioEnabled")]
    pub audio_enabled: bool,
    pub volume: f64,
    #[serde(rename = "rssiThresholds")]
    pub rssi_thresholds: RSSIThresholds,
    #[serde(rename = "smoothingFactor")]
    pub smoothing_factor: f64,
    #[serde(rename = "startupScan")]
    pub startup_scan: bool,
    #[serde(rename = "notificationsEnabled")]
    pub notifications_enabled: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RSSIThresholds {
    #[serde(rename = "veryFar")]
    pub very_far: i16,
    pub far: i16,
    pub nearby: i16,
    pub close: i16,
    #[serde(rename = "veryClose")]
    pub very_close: i16,
}

impl Default for Settings {
    fn default() -> Self {
        Settings {
            theme: "dark".to_string(),
            audio_enabled: true,
            volume: 0.5,
            rssi_thresholds: RSSIThresholds {
                very_far: -90,
                far: -75,
                nearby: -60,
                close: -45,
                very_close: -30,
            },
            smoothing_factor: 0.3,
            startup_scan: true,
            notifications_enabled: true,
        }
    }
}
