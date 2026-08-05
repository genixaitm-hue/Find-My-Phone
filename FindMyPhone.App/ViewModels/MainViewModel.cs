using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using FindMyPhone.Bluetooth;
using FindMyPhone.Core.Models;
using Microsoft.Extensions.Logging;

namespace FindMyPhone.App.ViewModels;

public partial class MainViewModel : ObservableObject, IDisposable
{
    private readonly BluetoothScanner _scanner;
    private readonly ILogger<MainViewModel> _logger;

    public ObservableCollection<DeviceRecord> Devices { get; } = new();

    [ObservableProperty] private string _statusText = "Initializing...";
    [ObservableProperty] private bool _isScanning;

    public MainViewModel(BluetoothScanner scanner, ILogger<MainViewModel> logger)
    {
        _scanner = scanner;
        _logger = logger;
        _scanner.DeviceUpdated += OnDeviceUpdated;
        _scanner.DeviceLost += OnDeviceLost;
    }

    [RelayCommand]
    public async Task ToggleScanAsync()
    {
        if (IsScanning)
        {
            await _scanner.StopAsync();
            IsScanning = false;
            StatusText = "Scanner stopped.";
        }
        else
        {
            await _scanner.StartAsync();
            IsScanning = true;
            StatusText = "Scanning for nearby devices...";
        }
    }

    private void OnDeviceUpdated(DeviceRecord device)
    {
        Microsoft.UI.Dispatching.DispatcherQueue.GetForCurrentThread().TryEnqueue(() =>
        {
            var existing = Devices.FirstOrDefault(d => d.Id == device.Id);
            if (existing == null) Devices.Add(device);
            else
            {
                existing.CurrentRssi = device.CurrentRssi;
                existing.AverageRssi = device.AverageRssi;
                existing.EstimatedDistanceMeters = device.EstimatedDistanceMeters;
                existing.Trend = device.Trend;
                existing.Confidence = device.Confidence;
                existing.LastSeen = device.LastSeen;
            }
        });
    }

    private void OnDeviceLost(string id)
    {
        Microsoft.UI.Dispatching.DispatcherQueue.GetForCurrentThread().TryEnqueue(() =>
        {
            var device = Devices.FirstOrDefault(d => d.Id == id);
            if (device != null) Devices.Remove(device);
        });
    }

    public void Dispose()
    {
        _scanner.DeviceUpdated -= OnDeviceUpdated;
        _scanner.DeviceLost -= OnDeviceLost;
        _scanner.Dispose();
    }
}