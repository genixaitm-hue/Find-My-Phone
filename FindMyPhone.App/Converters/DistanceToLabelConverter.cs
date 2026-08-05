using Microsoft.UI.Xaml.Data;
using FindMyPhone.Core.Distance;
using System;

namespace FindMyPhone.App.Converters;

public class DistanceToLabelConverter : IValueConverter
{
    public object Convert(object value, Type targetType, object parameter, string language)
        => value is double d ? DistanceEstimator.ToProximityLabel(d) : "UNKNOWN";

    public object ConvertBack(object value, Type targetType, object parameter, string language)
        => throw new NotImplementedException();
}