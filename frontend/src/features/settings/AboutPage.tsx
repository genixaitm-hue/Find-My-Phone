import { Smartphone, Radar, AlertTriangle, Wifi } from 'lucide-react';

export function AboutPage() {
  return (
    <div className="flex-1 overflow-auto bg-[#0f0f0f] p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-2">About</h2>
          <p className="text-gray-400">Learn about Find My Phone and its capabilities</p>
        </div>

        {/* App Info */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-8 mb-6 text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
            <Smartphone className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Find My Phone</h1>
          <p className="text-gray-400 mb-4">Version 1.0.0</p>
          <p className="text-gray-500 max-w-md mx-auto">
            A Windows desktop application that helps you locate nearby Bluetooth devices 
            using real signal strength (RSSI) measurements.
          </p>
        </div>

        {/* How It Works */}
        <section className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Radar className="w-5 h-5" />
            How It Works
          </h3>
          <ol className="space-y-3 text-gray-400">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-sm flex items-center justify-center">1</span>
              <span>Enable Bluetooth on both your PC and phone</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-sm flex items-center justify-center">2</span>
              <span>Click "Start Scanning" to discover nearby Bluetooth devices</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-sm flex items-center justify-center">3</span>
              <span>Select your phone from the list of discovered devices</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-sm flex items-center justify-center">4</span>
              <span>Walk around while watching the RSSI trend to locate your device</span>
            </li>
          </ol>
        </section>

        {/* Important Limitations */}
        <section className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-yellow-500 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Important Limitations
          </h3>
          <div className="space-y-4 text-yellow-500/80 text-sm">
            <div className="flex items-start gap-3">
              <span className="text-yellow-500">•</span>
              <span>
                <strong className="text-yellow-500">Cannot force phone to ring:</strong> This app does NOT 
                install anything on your phone and cannot make it play a sound. It only measures Bluetooth 
                signal strength from your PC.
              </span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-yellow-500">•</span>
              <span>
                <strong className="text-yellow-500">No direction detection:</strong> A single Bluetooth radio 
                cannot determine direction. The radar shows proximity only, not which way to walk.
              </span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-yellow-500">•</span>
              <span>
                <strong className="text-yellow-500">Estimated distance only:</strong> RSSI-based distance 
                estimates are affected by walls, furniture, metal objects, bodies, and interference. 
                The trend (getting closer/farther) is more reliable than exact distances.
              </span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-yellow-500">•</span>
              <span>
                <strong className="text-yellow-500">Phone must have Bluetooth enabled:</strong> Your phone's 
                Bluetooth must be on and discoverable. Silent mode or Do Not Disturb do not affect this app.
              </span>
            </div>
          </div>
        </section>

        {/* Privacy */}
        <section className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Wifi className="w-5 h-5" />
            Privacy & Security
          </h3>
          <div className="space-y-3 text-gray-400 text-sm">
            <p>
              <strong className="text-white">Local-first:</strong> All data stays on your PC. 
              No cloud servers, no accounts, no telemetry.
            </p>
            <p>
              <strong className="text-white">Offline capable:</strong> The app works entirely offline 
              once installed. No internet connection required.
            </p>
            <p>
              <strong className="text-white">Minimal permissions:</strong> Only Bluetooth access is required. 
              No filesystem, camera, or microphone access needed.
            </p>
          </div>
        </section>

        {/* Tips */}
        <section className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Tips for Best Results</h3>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              Keep your phone's screen on or unlock it periodically for better advertising
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              Walk slowly and watch the trend indicator more than absolute RSSI values
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              Use audio hunt mode to keep your eyes free while searching
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              Calibrate thresholds in Settings for your specific environment
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              Mark frequently tracked devices as favorites for quick access
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
