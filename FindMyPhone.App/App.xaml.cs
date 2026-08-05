using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.UI.Xaml;
using FindMyPhone.Bluetooth;
using FindMyPhone.Infrastructure.Audio;
using FindMyPhone.Infrastructure.Storage;
using FindMyPhone.App.ViewModels;

namespace FindMyPhone.App;

public partial class App : Application
{
    public IServiceProvider Services { get; }

    public App()
    {
        var services = new ServiceCollection();
        
        // Logging
        services.AddLogging(b => b.AddDebug().SetMinimumLevel(LogLevel.Information));
        
        // Core Services
        services.AddSingleton<BluetoothScanner>();
        services.AddSingleton<ProximityAudioService>();
        services.AddSingleton<DeviceStorageService>();
        
        // ViewModels
        services.AddTransient<MainViewModel>();
        services.AddTransient<HuntViewModel>();
        
        Services = services.BuildServiceProvider();
        InitializeComponent();
    }

    protected override void OnLaunched(LaunchActivatedEventArgs args)
    {
        var window = new MainWindow(Services.GetRequiredService<MainViewModel>());
        window.Activate();
    }
}