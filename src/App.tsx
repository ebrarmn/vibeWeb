import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Layout from './components/Layout';
import Clubs from './pages/Clubs';
import Users from './pages/Users';
import Events from './pages/Events';
import ClubRequests from './pages/ClubRequests';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider as CustomThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <CustomThemeProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Layout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="clubs" element={<Clubs />} />
                <Route path="users" element={<Users />} />
                <Route path="events" element={<Events />} />
                <Route path="club-requests" element={<ClubRequests />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Route>
            </Routes>
          </Router>
        </CustomThemeProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
