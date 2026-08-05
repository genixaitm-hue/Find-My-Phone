using Microsoft.UI.Xaml;
using FindMyPhone.App.ViewModels;

namespace FindMyPhone.App;

public sealed partial class MainWindow : Window
{
    public MainWindow(MainViewModel viewModel)
    {
        InitializeComponent();
        DataContext = viewModel;
    }
}