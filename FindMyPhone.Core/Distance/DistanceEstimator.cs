namespace FindMyPhone.Core.Distance;

public static class DistanceEstimator
{
    public static double EstimateMeters(short rssi, double txPower = 0.0, double pathLossExponent = 3.0)
    {
        if (rssi >= 0) return 0.1; 
        double exponent = (txPower - rssi) / (10.0 * pathLossExponent);
        double distance = Math.Pow(10, exponent);
        return Math.Clamp(distance, 0.1, 50.0);
    }

    public static string ToProximityLabel(double meters) => meters switch
    {
        <= 0.5 => "ARM'S REACH",
        <= 1.5 => "VERY CLOSE",
        <= 3.0 => "CLOSE",
        <= 6.0 => "MEDIUM",
        <= 12.0 => "FAR",
        _ => "VERY FAR"
    };
}