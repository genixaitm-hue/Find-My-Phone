import { useDeviceStore } from '../../stores/deviceStore';
import { History as HistoryIcon, Download, Trash2 } from 'lucide-react';

export function HistoryPage() {
  const { history, clearHistory } = useDeviceStore();

  const handleExportCSV = () => {
    if (history.length === 0) return;

    const headers = ['Timestamp', 'Device', 'Raw RSSI', 'Filtered RSSI', 'Confidence', 'Proximity'];
    const rows = history.map((entry) => [
      new Date(entry.timestamp).toISOString(),
      entry.deviceName,
      entry.rawRSSI.toString(),
      Math.round(entry.filteredRSSI).toString(),
      Math.round(entry.confidence * 100).toString() + '%',
      entry.proximity,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `find-my-phone-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 overflow-auto bg-[#0f0f0f] p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-white mb-2">Hunt History</h2>
            <p className="text-gray-400">View and export your tracking history</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExportCSV}
              disabled={history.length === 0}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <button
              onClick={clearHistory}
              disabled={history.length === 0}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Clear History
            </button>
          </div>
        </div>

        {/* History Table */}
        {history.length === 0 ? (
          <div className="text-center py-16 border border-[#2a2a2a] rounded-xl">
            <HistoryIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No History Yet</h3>
            <p className="text-gray-400">
              Start hunting to record signal data history
            </p>
          </div>
        ) : (
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#0f0f0f]">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Device
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Raw RSSI
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Filtered RSSI
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Confidence
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Proximity
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2a2a2a]">
                  {history.slice(0, 100).map((entry, index) => (
                    <tr key={`${entry.id}-${index}`} className="hover:bg-[#2a2a2a]/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {new Date(entry.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">
                        {entry.deviceName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-mono">
                        {entry.rawRSSI} dBm
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-400 font-mono">
                        {Math.round(entry.filteredRSSI)} dBm
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {Math.round(entry.confidence * 100)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          entry.proximity === 'VERY_CLOSE' ? 'bg-green-500/20 text-green-400' :
                          entry.proximity === 'CLOSE' ? 'bg-blue-500/20 text-blue-400' :
                          entry.proximity === 'NEARBY' ? 'bg-yellow-500/20 text-yellow-400' :
                          entry.proximity === 'FAR' ? 'bg-orange-500/20 text-orange-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {entry.proximity.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {history.length > 100 && (
              <div className="px-6 py-4 bg-[#0f0f0f] border-t border-[#2a2a2a] text-sm text-gray-400">
                Showing first 100 of {history.length} entries. Export CSV to see all data.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
