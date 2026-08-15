import { useDeviceStore } from '../../stores/deviceStore';
import { Settings as SettingsIcon, Moon, Sun, Monitor, Volume2, VolumeX, Signal } from 'lucide-react';

export function SettingsPage() {
  const { settings, updateSettings } = useDeviceStore();

  return (
    <div className="flex-1 overflow-auto bg-[#0f0f0f] p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-2">Settings</h2>
          <p className="text-gray-400">Customize your Find My Phone experience</p>
        </div>

        <div className="space-y-6">
          {/* Appearance */}
          <section className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Monitor className="w-5 h-5" />
              Appearance
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Theme</label>
                <div className="flex gap-3">
                  {[
                    { value: 'dark', label: 'Dark', icon: Moon },
                    { value: 'light', label: 'Light', icon: Sun },
                    { value: 'system', label: 'System', icon: Monitor },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => updateSettings({ theme: option.value as any })}
                      className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                        settings.theme === option.value
                          ? 'bg-blue-600 text-white'
                          : 'bg-[#0f0f0f] text-gray-400 hover:text-white'
                      }`}
                    >
                      <option.icon className="w-4 h-4" />
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Audio */}
          <section className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Volume2 className="w-5 h-5" />
              Audio Hunt Mode
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-white">Enable Audio Beeps</label>
                  <p className="text-xs text-gray-400 mt-1">
                    Parking sensor-style beeps that get faster as you get closer
                  </p>
                </div>
                <button
                  onClick={() => updateSettings({ audioEnabled: !settings.audioEnabled })}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    settings.audioEnabled ? 'bg-blue-600' : 'bg-gray-600'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      settings.audioEnabled ? 'left-7' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-400">Volume</label>
                  <span className="text-sm text-white">{Math.round(settings.volume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.volume}
                  onChange={(e) => updateSettings({ volume: parseFloat(e.target.value) })}
                  disabled={!settings.audioEnabled}
                  className="w-full h-2 bg-[#0f0f0f] rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                />
              </div>
            </div>
          </section>

          {/* RSSI Thresholds */}
          <section className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Signal className="w-5 h-5" />
              RSSI Thresholds (dBm)
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { key: 'veryClose', label: 'Very Close', color: 'text-green-400' },
                { key: 'close', label: 'Close', color: 'text-blue-400' },
                { key: 'nearby', label: 'Nearby', color: 'text-yellow-400' },
                { key: 'far', label: 'Far', color: 'text-orange-400' },
                { key: 'veryFar', label: 'Very Far', color: 'text-red-400' },
              ].map((threshold) => (
                <div key={threshold.key}>
                  <label className={`block text-sm font-medium ${threshold.color} mb-2`}>
                    {threshold.label} (&gt;=)
                  </label>
                  <input
                    type="number"
                    value={settings.rssiThresholds[threshold.key as keyof typeof settings.rssiThresholds]}
                    onChange={(e) =>
                      updateSettings({
                        rssiThresholds: {
                          ...settings.rssiThresholds,
                          [threshold.key]: parseInt(e.target.value) || -90,
                        },
                      })
                    }
                    className="w-full px-3 py-2 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:border-blue-600"
                  />
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Higher (less negative) values mean closer proximity. Adjust based on your environment.
            </p>
          </section>

          {/* Smoothing */}
          <section className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">RSSI Smoothing</h3>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-400">Smoothing Factor</label>
                <span className="text-sm text-white">{settings.smoothingFactor.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.9"
                step="0.05"
                value={settings.smoothingFactor}
                onChange={(e) => updateSettings({ smoothingFactor: parseFloat(e.target.value) })}
                className="w-full h-2 bg-[#0f0f0f] rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>More Smoothing (Stable)</span>
                <span>Less Smoothing (Responsive)</span>
              </div>
            </div>
          </section>

          {/* General */}
          <section className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">General</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-white">Start Scanning on Launch</label>
                  <p className="text-xs text-gray-400 mt-1">Automatically begin scanning when the app starts</p>
                </div>
                <button
                  onClick={() => updateSettings({ startupScan: !settings.startupScan })}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    settings.startupScan ? 'bg-blue-600' : 'bg-gray-600'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      settings.startupScan ? 'left-7' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-white">Enable Notifications</label>
                  <p className="text-xs text-gray-400 mt-1">Show notifications for device events</p>
                </div>
                <button
                  onClick={() => updateSettings({ notificationsEnabled: !settings.notificationsEnabled })}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    settings.notificationsEnabled ? 'bg-blue-600' : 'bg-gray-600'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      settings.notificationsEnabled ? 'left-7' : 'left-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
