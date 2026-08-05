using System.Text.Json;
using FindMyPhone.Core.Models;
using Microsoft.Extensions.Logging;
using Windows.Storage;

namespace FindMyPhone.Infrastructure.Storage;

public class DeviceStorageService
{
    private readonly ILogger<DeviceStorageService> _logger;
    private readonly string _filePath = Path.Combine(ApplicationData.Current.LocalFolder.Path, "favorites.json");

    public DeviceStorageService(ILogger<DeviceStorageService> logger) => _logger = logger;

    public async Task SaveFavoritesAsync(IEnumerable<DeviceRecord> devices)
    {
        try
        {
            var favorites = devices.Where(d => d.IsFavorite).Select(d => new { d.Id, d.CustomName, d.IsFavorite }).ToList();
            var json = JsonSerializer.Serialize(favorites, new JsonSerializerOptions { WriteIndented = true });
            await File.WriteAllTextAsync(_filePath, json);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to save favorites.");
        }
    }

    public async Task<Dictionary<string, (string? Name, bool Favorite)>> LoadFavoritesAsync()
    {
        try
        {
            if (!File.Exists(_filePath)) return new();
            var json = await File.ReadAllTextAsync(_filePath);
            var list = JsonSerializer.Deserialize<List<FavoriteDto>>(json) ?? new();
            return list.ToDictionary(x => x.Id, x => (x.CustomName, x.IsFavorite));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to load favorites.");
            return new();
        }
    }

    private record FavoriteDto(string Id, string? CustomName, bool IsFavorite);
}