using FindMyPhone.Core.Models;

namespace FindMyPhone.Core.SignalProcessing;

public class SignalProcessor
{
    private readonly KalmanFilter _kalman;
    private readonly Queue<short> _window = new();
    private const int WindowSize = 5;
    private short _previousFiltered = -70;
    private int _stableCount = 0;

    public SignalProcessor() => _kalman = new KalmanFilter();

    public (short FilteredRssi, double Confidence, SignalTrend Trend) Process(short rawRssi)
    {
        _window.Enqueue(rawRssi);
        if (_window.Count > WindowSize) _window.Dequeue();

        var sorted = _window.OrderBy(x => x).ToArray();
        short median = sorted[sorted.Length / 2];

        double kalmanOut = _kalman.Update(median);
        short filtered = (short)Math.Round(kalmanOut);

        double variance = _window.Average(v => Math.Pow(v - _window.Average(), 2));
        double confidence = Math.Max(0, 1.0 - (variance / 50.0)) * Math.Min(1.0, _window.Count / 3.0);

        short delta = (short)(filtered - _previousFiltered);
        SignalTrend trend = delta switch
        {
            > 2 => SignalTrend.GettingCloser,
            < -2 => SignalTrend.GettingFarther,
            _ => SignalTrend.Stable
        };

        if (Math.Abs(delta) <= 1) _stableCount++;
        else _stableCount = 0;

        if (_stableCount > 10) trend = SignalTrend.Stable;
        _previousFiltered = filtered;

        return (filtered, confidence, trend);
    }
}