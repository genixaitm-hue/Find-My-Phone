using FindMyPhone.Core.Distance;
using Xunit;

namespace FindMyPhone.Tests;

public class DistanceTests
{
    [Theory]
    [InlineData(-45, 0.4)]
    [InlineData(-60, 1.8)]
    [InlineData(-72, 4.5)]
    [InlineData(-85, 12.0)]
    public void EstimateMeters_ReturnsRealisticIndoorValues(short rssi, double expectedApprox)
    {
        double d = DistanceEstimator.EstimateMeters(rssi, txPower: 0, pathLossExponent: 3.0);
        Assert.InRange(d, expectedApprox * 0.5, expectedApprox * 2.0);
    }

    [Fact]
    public void ToProximityLabel_MatchesRanges()
    {
        Assert.Equal("ARM'S REACH", DistanceEstimator.ToProximityLabel(0.3));
        Assert.Equal("VERY CLOSE", DistanceEstimator.ToProximityLabel(1.0));
        Assert.Equal("CLOSE", DistanceEstimator.ToProximityLabel(2.5));
        Assert.Equal("MEDIUM", DistanceEstimator.ToProximityLabel(5.0));
        Assert.Equal("FAR", DistanceEstimator.ToProximityLabel(9.0));
        Assert.Equal("VERY FAR", DistanceEstimator.ToProximityLabel(20.0));
    }
}