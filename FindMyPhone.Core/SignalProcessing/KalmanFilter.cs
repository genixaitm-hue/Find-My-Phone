namespace FindMyPhone.Core.SignalProcessing;

/// <summary>
/// 1D Kalman Filter for smoothing noisy RSSI values.
/// </summary>
public class KalmanFilter
{
    private double _estimate;
    private double _errorEstimate = 1.0;
    private readonly double _q; // Process noise
    private readonly double _r; // Measurement noise

    public KalmanFilter(double q = 0.125, double r = 4.0, double initialValue = -70)
    {
        _q = q;
        _r = r;
        _estimate = initialValue;
    }

    public double Update(double measurement)
    {
        double errorPredict = _errorEstimate + _q;
        double kalmanGain = errorPredict / (errorPredict + _r);
        _estimate = _estimate + kalmanGain * (measurement - _estimate);
        _errorEstimate = (1.0 - kalmanGain) * errorPredict;
        return _estimate;
    }

    public double CurrentEstimate => _estimate;
}