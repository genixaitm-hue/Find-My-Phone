using Windows.Devices.Bluetooth.Advertisement;
using Windows.Devices.Enumeration;
using FindMyPhone.Core.Models;
using FindMyPhone.Core.SignalProcessing;
using FindMyPhone.Core.Distance;
using Microsoft.Extensions.Logging;

namespace FindMyPhone.Bluetooth;

public class BluetoothScanner : IDisposable
{
    private readonly ILogger<BluetoothScanner> _logger;
    private readonly Dictionary<string, DeviceRecord> _devices = new();
    private readonly Dictionary<string, SignalProcessor> _processors = new();
    private BluetoothLEAdvertisementWatcher? _watcher;
    private CancellationTokenSource? _cts;
    private bool _isRunning;

    public event Action<DeviceRecord>? DeviceUpdated;
    public event Action<string>? DeviceLost;
    public IReadOnlyDictionary<string, DeviceRecord> Devices => _devices;

    public BluetoothScanner(ILogger<BluetoothScanner> logger) => _logger = logger;

    public async Task StartAsync(CancellationToken ct = default)
    {
        if (_isRunning) return;
        _cts = CancellationTokenSource.CreateLinkedTokenSource(ct);
        _isRunning = true;

        try
        {
            _watcher = new BluetoothLEAdvertisementWatcher { ScanningMode = BluetoothLEScanningMode.Active };
            _watcher.Received += OnAdvertisementReceived;
            _watcher.Stopped += OnWatcherStopped;
            _watcher.Start();
            _logger.LogInformation("BLE scanner started.");

            await Task.Run(async () =>
            {
                while (!_cts.Token.IsCancellationRequested)
                {
                    await Task.Delay(2000, _cts.Token);
                    CleanupStaleDevices();
                }
            }, _cts.Token);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to start Bluetooth scanner.");
            _isRunning = false;
        }
    }

    private void OnAdvertisementReceived(BluetoothLEAdvertisementWatcher sender, BluetoothLEAdvertisementReceivedEventArgs args)
    {
        try
        {
            string id = args.BluetoothAddress.ToString("X12");
            short rssi = args.RawSignalStrengthInDBm;

            if (!_devices.TryGetValue(id, out var device))
            {
                device = new DeviceRecord
                {
                    Id = id,
                    Address = id,
                    Name = args.Advertisement.LocalName ?? "Unknown Device",
                    Technology = BluetoothTechnology.BLE,
                    Category = CategorizeDevice(args.Advertisement),
                    Manufacturer = ResolveManufacturer(args.Advertisement)
                };
                _devices[id] = device;
                _processors[id] = new SignalProcessor();
            }

            device.AddRssiSample(rssi);
            device.IsAdvertising = true;

            var proc = _processors[id];
            var (filtered, confidence, trend) = proc.Process(rssi);
            device.AverageRssi = filtered;
            device.Confidence = confidence;
            device.Trend = trend;
            device.EstimatedDistanceMeters = DistanceEstimator.EstimateMeters(filtered);

            DeviceUpdated?.Invoke(device);
        }
        catch (Exception ex)
        {
            _logger.LogDebug(ex, "Error processing advertisement.");
        }
    }

    private void CleanupStaleDevices()
    {
        var stale = _devices.Values.Where(d => d.TimeSinceLastSignal > TimeSpan.FromSeconds(10)).ToList();
        foreach (var d in stale)
        {
            d.IsAdvertising = false;
            d.Trend = SignalTrend.Lost;
            DeviceLost?.Invoke(d.Id);
        }
    }

    private void OnWatcherStopped(BluetoothLEAdvertisementWatcher sender, BluetoothLEAdvertisementWatcherStoppedEventArgs args)
    {
        _logger.LogWarning("BLE watcher stopped. Error: {Error}", args.Error);
        _isRunning = false;
    }

    public async Task StopAsync()
    {
        if (_cts != null) await _cts.CancelAsync();
        _watcher?.Stop();
        _watcher = null;
        _isRunning = false;
        _logger.LogInformation("BLE scanner stopped.");
    }

    public void Dispose()
    {
        _cts?.Cancel();
        _cts?.Dispose();
        _watcher?.Stop();
    }

    private static DeviceCategory CategorizeDevice(BluetoothLEAdvertisement ad)
    {
        string name = (ad.LocalName ?? "").ToLowerInvariant();
        if (name.Contains("iphone") || name.Contains("android") || name.Contains("pixel") || name.Contains("galaxy"))
            return DeviceCategory.Phone;
        if (name.Contains("ipad") || name.Contains("tablet")) return DeviceCategory.Tablet;
        if (name.Contains("watch") || name.Contains("band")) return DeviceCategory.Watch;
        if (name.Contains("airpod") || name.Contains("buds") || name.Contains("ear")) return DeviceCategory.Earbuds;
        if (name.Contains("headphone") || name.Contains("audio")) return DeviceCategory.Headphones;
        if (name.Contains("speaker") || name.Contains("boom")) return DeviceCategory.Speaker;
        if (name.Contains("laptop") || name.Contains("macbook") || name.Contains("thinkpad")) return DeviceCategory.Laptop;
        if (name.Contains("tracker") || name.Contains("tile") || name.Contains("airtag")) return DeviceCategory.Tracker;
        return DeviceCategory.Unknown;
    }

    private static string? ResolveManufacturer(BluetoothLEAdvertisement ad)
    {
        string name = (ad.LocalName ?? "").ToLowerInvariant();
        if (name.Contains("apple") || name.Contains("iphone") || name.Contains("ipad") || name.Contains("airpod")) return "Apple";
        if (name.Contains("samsung") || name.Contains("galaxy")) return "Samsung";
        if (name.Contains("google") || name.Contains("pixel")) return "Google";
        return null;
    }
}