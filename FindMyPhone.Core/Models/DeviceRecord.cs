namespace FindMyPhone.Core.Models;

public enum DeviceCategory { Phone, Tablet, Laptop, Headphones, Earbuds, Speaker, Watch, Tracker, Unknown }
public enum SignalTrend { GettingCloser, GettingFarther, Stable, Lost }
public enum BluetoothTechnology { BLE, Classic, Dual, Unknown }

public class DeviceRecord
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string? Name { get; set; }
    public DeviceCategory Category { get; set; } = DeviceCategory.Unknown;
    public string? Manufacturer { get; set; }
    public string? Address { get; set; }
    public BluetoothTechnology Technology { get; set; } = BluetoothTechnology.Unknown;
    
    public short CurrentRssi { get; set; }
    public short AverageRssi { get; set; }
    public short MinRssi { get; set; } = -100;
    public short MaxRssi { get; set; } = -30;
    
    public DateTimeOffset FirstSeen { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset LastSeen { get; set; } = DateTimeOffset.UtcNow;
    public TimeSpan TimeSinceLastSignal => DateTimeOffset.UtcNow - LastSeen;
    
    public double Confidence { get; set; }
    public double EstimatedDistanceMeters { get; set; }
    public SignalTrend Trend { get; set; } = SignalTrend.Stable;
    
    public bool IsConnected { get; set; }
    public bool IsAdvertising { get; set; }
    public bool IsFavorite { get; set; }
    public string? CustomName { get; set; }
    
    public List<short> RssiHistory { get; } = new();
    public void AddRssiSample(short rssi)
    {
        RssiHistory.Add(rssi);
        if (RssiHistory.Count > 300) RssiHistory.RemoveAt(0);
        CurrentRssi = rssi;
        LastSeen = DateTimeOffset.UtcNow;
        MinRssi = Math.Min(MinRssi, rssi);
        MaxRssi = Math.Max(MaxRssi, rssi);
    }
}