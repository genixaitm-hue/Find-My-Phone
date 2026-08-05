using FindMyPhone.Core.SignalProcessing;
using FindMyPhone.Core.Models;
using Xunit;

namespace FindMyPhone.Tests;

public class SignalProcessingTests
{
    [Fact]
    public void KalmanFilter_SmoothsNoisyInput()
    {
        var filter = new KalmanFilter(q: 0.1, r: 4.0, initialValue: -70);
        double[] noisy = { -72, -65, -78, -70, -71, -69, -73, -70 };
        double last = -70;
        foreach (var m in noisy)
        {
            last = filter.Update(m);
        }
        Assert.InRange(last, -75, -65);
    }

    [Fact]
    public void SignalProcessor_DetectsTrend()
    {
        var proc = new SignalProcessor();
        for (short r = -80; r <= -50; r += 2)
        {
            var (_, _, trend) = proc.Process(r);
            if (r > -60) Assert.Equal(SignalTrend.GettingCloser, trend);
        }
    }
}