import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { DiscoverPage } from './features/devices/DiscoverPage';
import { HuntPage } from './features/hunt/HuntPage';
import { RadarPage } from './features/radar/RadarPage';
import { HistoryPage } from './features/history/HistoryPage';
import { FavoritesPage } from './features/devices/FavoritesPage';
import { SettingsPage } from './features/settings/SettingsPage';
import { AboutPage } from './features/settings/AboutPage';

function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen bg-[#0f0f0f]">
        <Sidebar />
        <main className="flex-1 overflow-hidden">
          <Routes>
            <Route path="/" element={<DiscoverPage />} />
            <Route path="/hunt" element={<HuntPage />} />
            <Route path="/radar" element={<RadarPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/about" element={<AboutPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
