import { useEffect, useState } from 'react';
import { useDeviceStore } from '../../stores/deviceStore';
import { Target, TrendingUp, TrendingDown, Minus, Signal, Zap } from 'lucide-react';

export function HuntPage() {
  const { 
    huntTargetId, 
    devices, 
    isHunting,
    settings,
    setHuntTarget,
    toggleHunting,
    addToHistory,
  } = useDeviceStore();

  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isHunting) {
      interval = setInterval(() => {
        setElapsedTime((t) => t + 1);
      }, 1000);
    } else {
      setElapsedTime(0);
    }
    return () => clearInterval(interval);
  }, [isHunting]);

  // Record history periodically while hunting
  useEffect(() => {
    if (!isHunting || !huntTargetId) return;

    const device = devices.get(huntTargetId);
    if (!device) return;

    const interval = setInterval(() => {
      addToHistory({
        deviceId: device.id,
        deviceName: device.name,
        timestamp: Date.now(),
        rawRSSI: device.rawRSSI,
        filteredRSSI: device.filteredRSSI,
        confidence: device.confidence,
        proximity: device.proximity,
      });
    }, 5000); // Record every 5 seconds

    return () => clearInterval(interval);
  }, [isHunting, huntTargetId, devices, addToHistory]);

  if (!huntTargetId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0f0f0f]">
        <div className="text-center max-w-md">
          <Target className="w-24 h-24 text-gray-600 mx-auto mb-6" />
          <h2 className="text-2xl font-semibold text-white mb-3">No Target Selected</h2>
          <p className="text-gray-400 mb-6">
            Go to Discover and select a device to start hunting
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Browse Devices
          </button>
        </div>
      </div>
    );
  }

  const targetDevice = devices.get(huntTargetId);

  if (!targetDevice) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0f0f0f]">
        <div className="text-center">
          <h2 className="text-xl text-white mb-2">Device Lost</h2>
          <p className="text-gray-400 mb-4">The target device is no longer available</p>
          <button
            onClick={() => setHuntTarget(null)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
          >
            Clear Target
          </button>
        </div>
      </div>
    );
  }

  const getProximityColor = (proximity: string) => {
    switch (proximity) {
      case 'VERY_CLOSE': return 'text-green-400';
      case 'CLOSE': return 'text-blue-400';
      case 'NEARBY': return 'text-yellow-400';
      case 'FAR': return 'text-orange-400';
      case 'VERY_FAR': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getTrendIcon = () => {
    switch (targetDevice.trend) {
      case 'CLOSER':
        return <TrendingDown className="w-6 h-6 text-green-400" />;
      case 'FARTHER':
        return <TrendingUp className="w-6 h-6 text-red-400" />;
      case 'STABLE':
        return <Minus className="w-6 h-6 text-yellow-400" />;
      default:
        return <Minus className="w-6 h-6 text-gray-400" />;
    }
  };

  const getTrendText = () => {
    switch (targetDevice.trend) {
      case 'CLOSER': return 'Getting Closer';
      case 'FARTHER': return 'Getting Farther';
      case 'STABLE': return 'Stable';
      default: return 'Unknown';
    }
  };

  const signalStrength = Math.min(100, Math.max(0, ((targetDevice.rawRSSI + 100) / 70) * 100));

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 overflow-auto bg-[#0f0f0f] p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-semibold text-white mb-1">Hunt Mode</h2>
              <p className="text-gray-400">Track your target device using signal strength</p>
            </div>
            <button
              onClick={toggleHunting}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                isHunting
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isHunting ? 'Stop Hunt' : 'Start Hunt'}
            </button>
          </div>
        </div>

        {/* Target Info Card */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
              <Target className="w-8 h-8 text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-white">{targetDevice.name}</h3>
              <p className="text-gray-400 text-sm">
                Last seen: {new Date(targetDevice.lastSeen).toLocaleTimeString()}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-white">{formatTime(elapsedTime)}</div>
              <div className="text-xs text-gray-500">Hunt Duration</div>
            </div>
          </div>

          {/* Main RSSI Display */}
          <div className="grid grid-cols-3 gap-6 mb-6">
            <div className="bg-[#0f0f0f] rounded-lg p-4 text-center">
              <div className="text-4xl font-bold text-white mb-1">{targetDevice.rawRSSI}</div>
              <div className="text-xs text-gray-500">Raw RSSI (dBm)</div>
            </div>
            <div className="bg-[#0f0f0f] rounded-lg p-4 text-center">
              <div className="text-4xl font-bold text-blue-400 mb-1">
                {Math.round(targetDevice.filteredRSSI)}
              </div>
              <div className="text-xs text-gray-500">Filtered RSSI (dBm)</div>
            </div>
            <div className="bg-[#0f0f0f] rounded-lg p-4 text-center">
              <div className={`text-4xl font-bold mb-1 ${getProximityColor(targetDevice.proximity)}`}>
                {targetDevice.proximity.replace('_', ' ')}
              </div>
              <div className="text-xs text-gray-500">Proximity</div>
            </div>
          </div>

          {/* Signal Meter */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Signal Strength</span>
              <span className="text-sm text-gray-400">{Math.round(signalStrength)}%</span>
            </div>
            <div className="h-4 bg-[#0f0f0f] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 transition-all duration-300"
                style={{ width: `${signalStrength}%` }}
              />
            </div>
          </div>

          {/* Trend & Confidence */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-[#0f0f0f] rounded-lg p-4 flex items-center gap-4">
              {getTrendIcon()}
              <div>
                <div className="text-sm text-gray-400">Trend</div>
                <div className="text-lg font-medium text-white">{getTrendText()}</div>
              </div>
            </div>
            <div className="bg-[#0f0f0f] rounded-lg p-4 flex items-center gap-4">
              <Zap className="w-6 h-6 text-yellow-400" />
              <div>
                <div className="text-sm text-gray-400">Confidence</div>
                <div className="text-lg font-medium text-white">
                  {Math.round(targetDevice.confidence * 100)}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Graph Placeholder */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6">
          <h4 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
            <Signal className="w-5 h-5" />
            Live RSSI Graph
          </h4>
          <div className="h-48 bg-[#0f0f0f] rounded-lg flex items-center justify-center">
            {targetDevice.rssiHistory.length > 0 ? (
              <div className="w-full h-full p-4">
                <svg viewBox="0 0 400 150" className="w-full h-full">
                  {(() => {
                    const history = targetDevice.rssiHistory.slice(-50);
                    if (history.length < 2) return null;
                    
                    const minRSSI = -100;
                    const maxRSSI = -30;
                    const points = history.map((entry, i) => {
                      const x = (i / (history.length - 1)) * 400;
                      const y = 150 - ((entry.filteredRSSI - minRSSI) / (maxRSSI - minRSSI)) * 150;
                      return `${x},${y}`;
                    }).join(' ');
                    
                    return (
                      <>
                        <polyline
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="2"
                          points={points}
                        />
                        <circle
                          cx="400"
                          cy={150 - ((history[history.length - 1].filteredRSSI - minRSSI) / (maxRSSI - minRSSI)) * 150}
                          r="4"
                          fill="#3b82f6"
                        />
                      </>
                    );
                  })()}
                </svg>
              </div>
            ) : (
              <p className="text-gray-500">Waiting for signal data...</p>
            )}
          </div>
        </div>

        {/* Warning */}
        <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <p className="text-yellow-500/80 text-sm">
            ⚠️ RSSI readings can be affected by walls, furniture, metal objects, and interference. 
            The trend is more reliable than exact distance estimates.
          </p>
        </div>
      </div>
    </div>
  );
}
