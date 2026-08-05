using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using FindMyPhone.Bluetooth;
using FindMyPhone.Core.Models;
using FindMyPhone.Core.Distance;
using FindMyPhone.Infrastructure.Audio;
using Microsoft.Extensions.Logging;

namespace FindMyPhone.App.ViewModels;

public partial class HuntViewModel : ObservableObject, IDisposable
{
    private readonly BluetoothScanner _scanner;
    private readonly ProximityAudioService _audio;
    private readonly ILogger<HuntViewModel> _logger;
    private DeviceRecord? _target;

    [ObservableProperty] private string _targetName = "Select a device";
    [ObservableProperty] private short _currentRssi = -90;
    [ObservableProperty] private double _distance = 15.0;
    [ObservableProperty] private string _proximityLabel = "VERY FAR";
    [ObservableProperty] private double _confidence = 0;
    [ObservableProperty] private SignalTrend _trend = SignalTrend.Stable;
    [ObservableProperty] private bool _isHunting;
    [ObservableProperty] private bool _audioEnabled = true;

    public HuntViewModel(BluetoothScanner scanner, ProximityAudioService audio, ILogger<HuntViewModel> logger)
    {
        _scanner = scanner;
        _audio = audio;
        _logger = logger;
        _scanner.DeviceUpdated += OnTargetUpdated;
    }

    public void SetTarget(DeviceRecord device)
    {
        _target = device;
        TargetName = device.CustomName ?? device.Name ?? "Unknown";
        IsHunting = true;
        _audio.InitializeAsync().ConfigureAwait(false);
    }

    private void OnTargetUpdated(DeviceRecord device)
    {
        if (_target == null || device.Id != _target.Id) return;

        CurrentRssi = device.AverageRssi;
        Distance = device.EstimatedDistanceMeters;
        ProximityLabel = DistanceEstimator.ToProximityLabel(Distance);
        Confidence = device.Confidence;
        Trend = device.Trend;

        if (AudioEnabled && IsHunting)
        {
            _audio.UpdateDistance(Distance);
        }
    }

    [RelayCommand]
    public void ToggleAudio() => AudioEnabled = !AudioEnabled;

    [RelayCommand]
    public void StopHunt()
    {
        IsHunting = false;
        _audio.Stop();
        _target = null;
    }

    public void Dispose()
    {
        _scanner.DeviceUpdated -= OnTargetUpdated;
        _audio.Dispose();
    }
}