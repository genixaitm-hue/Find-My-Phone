using Microsoft.UI.Xaml.Data;
using Microsoft.UI.Xaml.Media;
using Windows.UI;
using System;

namespace FindMyPhone.App.Converters;

public class RssiToBrushConverter : IValueConverter
{
    public object Convert(object value, Type targetType, object parameter, string language)
    {
        if (value is not short rssi) return new SolidColorBrush(Colors.Gray);
        return rssi switch
        {
            >= -50 => new SolidColorBrush(Color.FromArgb(255, 16, 185, 129)), // Green
            >= -65 => new SolidColorBrush(Color.FromArgb(255, 234, 179, 8)),  // Yellow
            >= -80 => new SolidColorBrush(Color.FromArgb(255, 249, 115, 22)), // Orange
            _      => new SolidColorBrush(Color.FromArgb(255, 239, 68, 68))   // Red
        };
    }

    public object ConvertBack(object value, Type targetType, object parameter, string language)
        => throw new NotImplementedException();
}