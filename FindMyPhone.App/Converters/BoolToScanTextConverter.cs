using Microsoft.UI.Xaml.Data;
using System;

namespace FindMyPhone.App.Converters;

public class BoolToScanTextConverter : IValueConverter
{
    public object Convert(object value, Type targetType, object parameter, string language)
        => value is bool b && b ? "⏹ Stop Scan" : "📡 Start Scan";

    public object ConvertBack(object value, Type targetType, object parameter, string language)
        => throw new NotImplementedException();
}