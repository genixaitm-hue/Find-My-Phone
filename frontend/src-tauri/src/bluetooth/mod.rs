pub mod models;
pub mod scanner;

use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use crate::bluetooth::models::{BluetoothDevice, DeviceWithRSSI, RSSIEntry, Settings, HistoryEntry};

/// Application state shared across Tauri commands
#[derive(Clone)]
pub struct AppState {
    pub devices: Arc<RwLock<HashMap<String, DeviceWithRSSI>>>,
    pub is_scanning: Arc<RwLock<bool>>,
    pub adapter_status: Arc<RwLock<String>>,
    pub hunt_target: Arc<RwLock<Option<String>>>,
    pub is_hunting: Arc<RwLock<bool>>,
    pub history: Arc<RwLock<Vec<HistoryEntry>>>,
    pub settings: Arc<RwLock<Settings>>,
}

impl AppState {
    pub fn new() -> Self {
        AppState {
            devices: Arc::new(RwLock::new(HashMap::new())),
            is_scanning: Arc::new(RwLock::new(false)),
            adapter_status: Arc::new(RwLock::new("available".to_string())),
            hunt_target: Arc::new(RwLock::new(None)),
            is_hunting: Arc::new(RwLock::new(false)),
            history: Arc::new(RwLock::new(Vec::new())),
            settings: Arc::new(RwLock::new(Settings::default())),
        }
    }
}

impl Default for AppState {
    fn default() -> Self {
        Self::new()
    }
}
