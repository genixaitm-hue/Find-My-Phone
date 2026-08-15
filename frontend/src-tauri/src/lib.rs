mod bluetooth;
mod commands;
mod state;

use bluetooth::scanner::BluetoothScanner;
use state::AppState;
use std::sync::Arc;
use tauri::{Manager, State};
use tokio::sync::RwLock;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(AppState::new())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::start_scan,
            commands::stop_scan,
            commands::get_scan_status,
            commands::get_devices,
            commands::select_device,
            commands::start_hunt,
            commands::stop_hunt,
            commands::toggle_favorite,
            commands::get_history,
            commands::export_history_csv,
            commands::update_settings,
            commands::get_settings,
            commands::calibrate_rssi,
            commands::set_audio_enabled,
            commands::set_volume,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
