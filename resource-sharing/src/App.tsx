import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AppProvider } from '@/context/AppContext';
import { Navbar } from '@/components/Navbar';
import { HomePage } from '@/pages/HomePage';
import { ItemsPage } from '@/pages/ItemsPage';
import { SkillsPage } from '@/pages/SkillsPage';
import { DetailPage } from '@/pages/DetailPage';
import { PublishPage } from '@/pages/PublishPage';
import { FavoritesPage } from '@/pages/FavoritesPage';
import { ExchangePage } from '@/pages/ExchangePage';
import { ExchangeDetailPage } from '@/pages/ExchangeDetailPage';
import { TestLocation } from '@/pages/TestLocation';
import { TestClick } from '@/pages/TestClick';
import { SimpleTest } from '@/pages/SimpleTest';

function AppContent() {
  const location = useLocation();

  console.log('Route changed to:', location.pathname);

  return (
    <div className="min-h-screen bg-background pt-16" key={location.pathname}>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/items" element={<ItemsPage />} />
        <Route path="/skills" element={<SkillsPage />} />
        <Route path="/exchange" element={<ExchangePage />} />
        <Route path="/exchange/:id" element={<ExchangeDetailPage />} />
        <Route path="/items/:id" element={<DetailPage />} />
        <Route path="/skills/:id" element={<DetailPage />} />
        <Route path="/publish" element={<PublishPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/test-location" element={<TestLocation />} />
        <Route path="/test-click" element={<TestClick />} />
        <Route path="/simple-test" element={<SimpleTest />} />
      </Routes>
    </div>
  );
}

function App() {
  console.log('App rendering');
  return (
    <AppProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
