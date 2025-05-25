import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Layout from './components/Layout';
import Clubs from './pages/Clubs';
import Users from './pages/Users';
import Events from './pages/Events';
import ClubRequests from './pages/admin/ClubRequests';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider as CustomThemeProvider } from './context/ThemeContext';
import Register from './pages/Register';
import Homepage from './pages/Homepage';
import Profile from './pages/Profile';
import UserClubs from './pages/UserClubs';
import UserEvents from './pages/UserEvents';
import UserNavbar from './components/UserNavbar';
import MyClub from './pages/MyClub';

function UserLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const drawerWidth = collapsed ? 64 : 220;
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <UserNavbar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div style={{ flex: 1, minHeight: '100vh', background: '#f8fafc' }}>
        <Outlet context={{ collapsed, drawerWidth }} />
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <CustomThemeProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/dashboard" element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="clubs" element={<Clubs />} />
                <Route path="users" element={<Users />} />
                <Route path="events" element={<Events />} />
                <Route path="club-requests" element={<ClubRequests />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Route>
              <Route element={<UserLayout />}>
                <Route path="/homepage" element={<Homepage />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/user-clubs" element={<UserClubs />} />
                <Route path="/user-events" element={<UserEvents />} />
                <Route path="/my-club" element={<MyClub />} />
              </Route>
            </Routes>
          </CustomThemeProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
