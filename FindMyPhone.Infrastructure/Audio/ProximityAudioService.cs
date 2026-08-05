using Microsoft.Extensions.Logging;
using Windows.Media.Audio;
using Windows.Media.Render;
using Windows.Media;

namespace FindMyPhone.Infrastructure.Audio;

public class ProximityAudioService : IDisposable
{
    private readonly ILogger<ProximityAudioService> _logger;
    private AudioGraph? _graph;
    private AudioDeviceOutputNode? _outputNode;
    private AudioFrameInputNode? _toneNode;
    private bool _isPlaying;
    private double _frequency = 880;
    private int _sampleRate = 48000;
    private double _phase;
    private PeriodicTimer? _timer;
    private CancellationTokenSource? _cts;

    public ProximityAudioService(ILogger<ProximityAudioService> logger) => _logger = logger;

    public async Task InitializeAsync()
    {
        var result = await AudioGraph.CreateAsync(new AudioGraphSettings(AudioRenderCategory.Media));
        if (result.Status != AudioGraphCreationStatus.Success)
        {
            _logger.LogError("AudioGraph creation failed: {Status}", result.Status);
            return;
        }
        _graph = result.Graph;
        var outResult = await _graph.CreateDeviceOutputNodeAsync();
        _outputNode = outResult.DeviceOutputNode;
        
        _toneNode = _graph.CreateFrameInputNode();
        _toneNode.QuantumStarted += GenerateSineWave;
        _toneNode.AddOutgoingConnection(_outputNode);
        _graph.Start();
    }

    public void StartProximityBeeps(double distanceMeters, double volume = 0.5)
    {
        if (_graph == null) return;
        _toneNode!.Volume = volume;
        _isPlaying = true;
        _cts = new CancellationTokenSource();
        
        int intervalMs = (int)Math.Clamp(distanceMeters * 100, 100, 1500);
        _timer = new PeriodicTimer(TimeSpan.FromMilliseconds(intervalMs));
        
        _ = Task.Run(async () =>
        {
            try
            {
                while (await _timer.WaitForNextTickAsync(_cts.Token) && _isPlaying)
                {
                    PlayBeep();
                    await Task.Delay(80, _cts.Token); 
                    StopBeep();
                }
            }
            catch (OperationCanceledException) { }
        }, _cts.Token);
    }

    public void UpdateDistance(double distanceMeters)
    {
        Stop();
        StartProximityBeeps(distanceMeters);
    }

    private void PlayBeep() => _toneNode!.Start();
    private void StopBeep() => _toneNode!.Stop();

    private void GenerateSineWave(AudioFrameInputNode sender, FrameInputNodeQuantumStartedEventArgs args)
    {
        int samples = args.RequiredSamples;
        var frame = new AudioFrame((uint)(samples * 4));
        using var buffer = frame.LockBuffer(AudioBufferAccessMode.Write);
        using var reference = buffer.CreateReference();
        unsafe
        {
            byte* data;
            uint capacity;
            ((IMemoryBufferByteAccess)reference).GetBuffer(out data, out capacity);
            float* floatData = (float*)data;
            for (int i = 0; i < samples; i++)
            {
                floatData[i] = (float)(Math.Sin(_phase) * 0.5);
                _phase += 2 * Math.PI * _frequency / _sampleRate;
            }
        }
        sender.AddFrame(frame);
    }

    public void Stop()
    {
        _isPlaying = false;
        _cts?.Cancel();
        _timer?.Dispose();
        _toneNode?.Stop();
    }

    public void Dispose()
    {
        Stop();
        _graph?.Stop();
        _graph?.Dispose();
    }
}

[System.Runtime.InteropServices.ComImport]
[System.Runtime.InteropServices.Guid("5B0D3235-4DBA-4D44-865E-8F1D0E4FD04D")]
[System.Runtime.InteropServices.InterfaceType(System.Runtime.InteropServices.ComInterfaceType.InterfaceIsIUnknown)]
unsafe interface IMemoryBufferByteAccess
{
    void GetBuffer(out byte* buffer, out uint capacity);
}