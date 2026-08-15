import { useEffect } from 'react';
import { useDeviceStore } from '../../stores/deviceStore';
import { startScan, stopScan } from '../../services/bluetooth';
import { ScanLine, AlertCircle, Smartphone } from 'lucide-react';

export function DiscoverPage() {
  const { 
    isScanning, 
    devices, 
    adapterStatus, 
    scanError,
    setScanning, 
    setAdapterStatus, 
    setScanError,
    filters,
    setFilters,
    toggleFavorite,
    setHuntTarget,
  } = useDeviceStore();

  useEffect(() => {
    // Listen for Tauri events (will be connected when backend is ready)
    // For now, this is a placeholder for event listeners
    return () => {
      // Cleanup listeners
    };
  }, []);

  const handleToggleScan = async () => {
    if (isScanning) {
      await stopScan();
      setScanning(false);
    } else {
      try {
        await startScan();
        setScanning(true);
        setAdapterStatus('available');
        setScanError(null);
      } catch (error) {
        setScanError('Failed to start scanning. Ensure Bluetooth is enabled.');
        setScanning(false);
      }
    }
  };

  const filteredDevices = Array.from(devices.values()).filter((device) => {
    if (filters.showFavorites && !device.favorite) return false;
    if (filters.type !== 'all' && device.type !== filters.type) return false;
    if (filters.search && !device.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  const getSignalQuality = (rssi: number) => {
    if (rssi >= -50) return { label: 'Excellent', color: 'text-green-400' };
    if (rssi >= -60) return { label: 'Good', color: 'text-blue-400' };
    if (rssi >= -70) return { label: 'Fair', color: 'text-yellow-400' };
    if (rssi >= -80) return { label: 'Weak', color: 'text-orange-400' };
    return { label: 'Very Weak', color: 'text-red-400' };
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'phone':
      case 'apple':
      case 'android':
        return <Smartphone className="w-5 h-5" />;
      default:
        return <Smartphone className="w-5 h-5" />;
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-[#0f0f0f]">
      <div className="p-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-2">Discover Devices</h2>
          <p className="text-gray-400">
            Scan for nearby Bluetooth devices and select one to track
          </p>
        </div>

        {/* Adapter Status Warning */}
        {adapterStatus === 'disabled' && (
          <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-500" />
            <div>
              <p className="text-yellow-500 font-medium">Bluetooth Disabled</p>
              <p className="text-yellow-500/70 text-sm">Please enable Bluetooth on your PC to scan for devices.</p>
            </div>
          </div>
        )}

        {scanError && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <div>
              <p className="text-red-500 font-medium">{scanError}</p>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={handleToggleScan}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
              isScanning
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <ScanLine className={`w-5 h-5 ${isScanning ? 'animate-pulse' : ''}`} />
            {isScanning ? 'Stop Scanning' : 'Start Scanning'}
          </button>

          <input
            type="text"
            placeholder="Search devices..."
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
            className="flex-1 max-w-xs px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-600"
          />

          <select
            value={filters.type}
            onChange={(e) => setFilters({ type: e.target.value as any })}
            className="px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:border-blue-600"
          >
            <option value="all">All Types</option>
            <option value="phone">Phones</option>
            <option value="apple">Apple</option>
            <option value="android">Android</option>
            <option value="audio">Audio</option>
            <option value="wearable">Wearables</option>
            <option value="ble">BLE Devices</option>
          </select>

          <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.showFavorites}
              onChange={(e) => setFilters({ showFavorites: e.target.checked })}
              className="w-4 h-4 rounded border-[#2a2a2a] bg-[#1a1a1a] text-blue-600 focus:ring-blue-600"
            />
            Favorites Only
          </label>
        </div>

        {/* Device List */}
        <div className="space-y-3">
          {filteredDevices.length === 0 ? (
            <div className="p-12 text-center border border-[#2a2a2a] rounded-xl">
              <Smartphone className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg mb-2">
                {isScanning ? 'Scanning for devices...' : 'No devices found'}
              </p>
              <p className="text-gray-500 text-sm">
                {isScanning 
                  ? 'Keep your phone\'s Bluetooth enabled and wait for it to appear'
                  : 'Click "Start Scanning" to find nearby devices'}
              </p>
            </div>
          ) : (
            filteredDevices.map((device) => {
              const signalQuality = getSignalQuality(device.rawRSSI);
              return (
                <div
                  key={device.id}
                  className="p-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl hover:border-blue-600/50 transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center text-blue-400">
                        {getDeviceIcon(device.type)}
                      </div>
                      <div>
                        <h3 className="text-white font-medium">{device.name || 'Unknown Device'}</h3>
                        <div className="flex items-center gap-3 text-sm text-gray-400 mt-1">
                          <span className="capitalize">{device.type}</span>
                          {device.manufacturer && (
                            <>
                              <span>•</span>
                              <span>{device.manufacturer}</span>
                            </>
                          )}
                          <span>•</span>
                          <span className={signalQuality.color}>{signalQuality.label}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-white">{device.rawRSSI}</div>
                        <div className="text-xs text-gray-500">RSSI (dBm)</div>
                      </div>

                      <button
                        onClick={() => toggleFavorite(device.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          device.favorite 
                            ? 'text-yellow-500 hover:text-yellow-400' 
                            : 'text-gray-600 hover:text-gray-400'
                        }`}
                      >
                        <svg 
                          className="w-5 h-5" 
                          fill={device.favorite ? 'currentColor' : 'none'} 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      </button>

                      <button
                        onClick={() => {
                          setHuntTarget(device.id);
                          window.location.href = '/hunt';
                        }}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                      >
                        Hunt
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
