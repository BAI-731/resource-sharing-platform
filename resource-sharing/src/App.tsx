import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AppProvider } from '@/context/AppContext';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/components/ui/Toast';
import { AuthGuard } from '@/components/AuthGuard';
import { Navbar } from '@/components/Navbar';
import { HomePage } from '@/pages/HomePage';
import { ItemsPage } from '@/pages/ItemsPage';
import { SkillsPage } from '@/pages/SkillsPage';
import { DetailPage } from '@/pages/DetailPage';
import { PublishPage } from '@/pages/PublishPage';
import { FavoritesPage } from '@/pages/FavoritesPage';
import { ExchangePage } from '@/pages/ExchangePage';
import { ExchangeDetailPage } from '@/pages/ExchangeDetailPage';
import { AuthPage } from '@/pages/AuthPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { OrdersPage } from '@/pages/OrdersPage';
import { MessagesPage } from '@/pages/MessagesPage';

function AppContent() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background pt-16" key={location.pathname}>
      <Navbar />
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/items" element={<ItemsPage />} />
        <Route path="/skills" element={<SkillsPage />} />
        <Route path="/exchange" element={<ExchangePage />} />
        <Route path="/exchange/:id" element={<ExchangeDetailPage />} />
        <Route path="/items/:id" element={<DetailPage />} />
        <Route path="/skills/:id" element={<DetailPage />} />
        <Route
          path="/publish"
          element={
            <AuthGuard>
              <PublishPage />
            </AuthGuard>
          }
        />
        <Route
          path="/favorites"
          element={
            <AuthGuard>
              <FavoritesPage />
            </AuthGuard>
          }
        />
        <Route
          path="/profile"
          element={
            <AuthGuard>
              <ProfilePage />
            </AuthGuard>
          }
        />
        <Route
          path="/orders"
          element={
            <AuthGuard>
              <OrdersPage />
            </AuthGuard>
          }
        />
        <Route
          path="/messages"
          element={
            <AuthGuard>
              <MessagesPage />
            </AuthGuard>
          }
        />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </AppProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
