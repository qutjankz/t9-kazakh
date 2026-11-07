import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import AppShell from './components/layout/AppShell';
import AuthPage from './routes/AuthPage';
import DashboardPage from './routes/DashboardPage';
import LevelPlayPage from './routes/LevelPlayPage';
import GamesHubPage from './routes/GamesHubPage';
import DictationGamePage from './routes/DictationGamePage';
import TrueFalseGamePage from './routes/TrueFalseGamePage';
import KeyboardPage from './routes/KeyboardPage';
import ProfilePage from './routes/ProfilePage';
import ActivityPage from './routes/ActivityPage';

const App: React.FC = () => (
  <BrowserRouter>
    <AuthProvider>
      <ToastProvider>
        <Routes>
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/register" element={<AuthPage mode="register" />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/levels/:id" element={<LevelPlayPage />} />
            <Route element={<AppShell />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/games" element={<GamesHubPage />} />
              <Route path="/games/dictation" element={<DictationGamePage />} />
              <Route path="/games/true-false" element={<TrueFalseGamePage />} />
              <Route path="/games/keyboard" element={<KeyboardPage />} />
              <Route path="/activity" element={<ActivityPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
