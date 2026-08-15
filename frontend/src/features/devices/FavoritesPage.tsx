import { useDeviceStore } from '../../stores/deviceStore';
import { Star, Smartphone } from 'lucide-react';

export function FavoritesPage() {
  const { devices, toggleFavorite, setHuntTarget } = useDeviceStore();

  const favoriteDevices = Array.from(devices.values()).filter((d) => d.favorite);

  return (
    <div className="flex-1 overflow-auto bg-[#0f0f0f] p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-2">Favorites</h2>
          <p className="text-gray-400">Your saved devices for quick access</p>
        </div>

        {/* Favorites List */}
        {favoriteDevices.length === 0 ? (
          <div className="text-center py-16 border border-[#2a2a2a] rounded-xl">
            <Star className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Favorites Yet</h3>
            <p className="text-gray-400">
              Mark devices as favorites to quickly access them here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {favoriteDevices.map((device) => (
              <div
                key={device.id}
                className="p-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl hover:border-blue-600/50 transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center text-yellow-400">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium">{device.name || 'Unknown Device'}</h3>
                      <div className="flex items-center gap-3 text-sm text-gray-400 mt-1">
                        <span className="capitalize">{device.type}</span>
                        <span>•</span>
                        <span>{device.isBLE ? 'BLE' : 'Classic'}</span>
                        <span>•</span>
                        <span>Last seen: {new Date(device.lastSeen).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-xl font-bold text-white">{device.rawRSSI}</div>
                      <div className="text-xs text-gray-500">RSSI (dBm)</div>
                    </div>

                    <button
                      onClick={() => toggleFavorite(device.id)}
                      className="p-2 rounded-lg text-yellow-500 hover:text-yellow-400 transition-colors"
                      title="Remove from favorites"
                    >
                      <svg 
                        className="w-5 h-5" 
                        fill="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
