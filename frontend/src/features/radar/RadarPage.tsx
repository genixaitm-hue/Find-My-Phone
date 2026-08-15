import { useEffect, useRef } from 'react';
import { useDeviceStore } from '../../stores/deviceStore';
import { Radar as RadarIcon, AlertTriangle } from 'lucide-react';

export function RadarPage() {
  const { huntTargetId, devices } = useDeviceStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  const targetDevice = huntTargetId ? devices.get(huntTargetId) : null;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const size = Math.min(canvas.offsetWidth, 500);
    canvas.width = size;
    canvas.height = size;
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = (size / 2) - 20;

    let angle = 0;

    const draw = () => {
      // Clear canvas
      ctx.fillStyle = '#0f0f0f';
      ctx.fillRect(0, 0, size, size);

      // Draw concentric circles (proximity rings)
      const rings = [
        { r: radius * 0.25, color: '#22c55e', label: 'Very Close' },
        { r: radius * 0.5, color: '#3b82f6', label: 'Close' },
        { r: radius * 0.75, color: '#eab308', label: 'Nearby' },
        { r: radius, color: '#f97316', label: 'Far' },
      ];

      rings.forEach((ring) => {
        ctx.beginPath();
        ctx.arc(centerX, centerY, ring.r, 0, Math.PI * 2);
        ctx.strokeStyle = ring.color + '40';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Label
        ctx.fillStyle = ring.color + '80';
        ctx.font = '10px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(ring.label, centerX, centerY - ring.r - 5);
      });

      // Draw cross lines
      ctx.beginPath();
      ctx.moveTo(centerX - radius, centerY);
      ctx.lineTo(centerX + radius, centerY);
      ctx.moveTo(centerX, centerY - radius);
      ctx.lineTo(centerX, centerY + radius);
      ctx.strokeStyle = '#2a2a2a';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw rotating radar sweep
      if (targetDevice && targetDevice.rawRSSI > -100) {
        angle += 0.02;
        
        const sweepGradient = ctx.createConicGradient(angle, centerX, centerY);
        sweepGradient.addColorStop(0, 'rgba(59, 130, 246, 0)');
        sweepGradient.addColorStop(0.8, 'rgba(59, 130, 246, 0)');
        sweepGradient.addColorStop(1, 'rgba(59, 130, 246, 0.3)');
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fillStyle = sweepGradient;
        ctx.fill();

        // Draw signal dot based on proximity
        const signalStrength = Math.max(0, Math.min(1, (targetDevice.rawRSSI + 100) / 70));
        const dotRadius = radius * (1 - signalStrength);
        
        // Add some jitter to simulate signal fluctuation
        const jitter = Math.sin(Date.now() / 500) * 5;
        
        ctx.beginPath();
        ctx.arc(centerX + jitter, centerY - dotRadius + jitter, 8, 0, Math.PI * 2);
        ctx.fillStyle = getDotColor(targetDevice.proximity);
        ctx.fill();
        
        // Glow effect
        ctx.shadowColor = getDotColor(targetDevice.proximity);
        ctx.shadowBlur = 20;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Draw center point
      ctx.beginPath();
      ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#3b82f6';
      ctx.fill();

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [targetDevice]);

  const getDotColor = (proximity: string) => {
    switch (proximity) {
      case 'VERY_CLOSE': return '#22c55e';
      case 'CLOSE': return '#3b82f6';
      case 'NEARBY': return '#eab308';
      case 'FAR': return '#f97316';
      case 'VERY_FAR': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-[#0f0f0f] p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-2">Radar View</h2>
          <p className="text-gray-400">
            Visual proximity representation using signal strength
          </p>
        </div>

        {!targetDevice ? (
          <div className="flex items-center justify-center">
            <div className="text-center max-w-md">
              <RadarIcon className="w-24 h-24 text-gray-600 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-white mb-3">No Target Selected</h3>
              <p className="text-gray-400 mb-6">
                Select a device from Discover to start tracking on the radar
              </p>
              <button
                onClick={() => window.location.href = '/'}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Browse Devices
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Radar Canvas */}
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 flex items-center justify-center">
              <canvas 
                ref={canvasRef} 
                className="w-full max-w-[500px] aspect-square"
              />
            </div>

            {/* Info Panel */}
            <div className="space-y-6">
              {/* Target Info */}
              <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">{targetDevice.name}</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">RSSI</span>
                    <span className="text-white font-mono">{targetDevice.rawRSSI} dBm</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Filtered RSSI</span>
                    <span className="text-white font-mono">{Math.round(targetDevice.filteredRSSI)} dBm</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Proximity</span>
                    <span className={`font-medium ${getDotColor(targetDevice.proximity).replace('#', 'text-')}`}>
                      {targetDevice.proximity.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Trend</span>
                    <span className="text-white">{targetDevice.trend}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Confidence</span>
                    <span className="text-white">{Math.round(targetDevice.confidence * 100)}%</span>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6">
                <h4 className="text-sm font-medium text-gray-400 mb-4">Proximity Zones</h4>
                <div className="space-y-3">
                  {[
                    { level: 'VERY_CLOSE', label: 'Very Close', color: '#22c55e' },
                    { level: 'CLOSE', label: 'Close', color: '#3b82f6' },
                    { level: 'NEARBY', label: 'Nearby', color: '#eab308' },
                    { level: 'FAR', label: 'Far', color: '#f97316' },
                    { level: 'VERY_FAR', label: 'Very Far', color: '#ef4444' },
                  ].map((item) => (
                    <div key={item.level} className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm text-gray-300">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Important Notice */}
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-yellow-500 font-medium mb-1">Important Limitation</h4>
                    <p className="text-yellow-500/80 text-sm">
                      A single Bluetooth radio cannot determine direction. This radar shows 
                      proximity only, not the actual direction of your device. Walk around 
                      and follow the signal strength trend to locate your phone.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
