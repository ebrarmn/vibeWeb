import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    AppBar,
    Box,
    CssBaseline,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import {
    Menu as MenuIcon,
    Dashboard as DashboardIcon,
    Group as GroupIcon,
    Event as EventIcon,
    Business as BusinessIcon,
    Brightness4,
    Brightness7,
    Logout as LogoutIcon
} from '@mui/icons-material';
import { useTheme } from '../context/ThemeContext';
import Logo from './Logo';
import { useAuth } from '../contexts/AuthContext';

const drawerWidth = 240;

const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Kulüpler', icon: <BusinessIcon />, path: '/dashboard/clubs' },
    { text: 'Kullanıcılar', icon: <GroupIcon />, path: '/dashboard/users' },
    { text: 'Etkinlikler', icon: <EventIcon />, path: '/dashboard/events' },
    { text: 'Kulüp Başvuruları', icon: <BusinessIcon />, path: '/dashboard/club-requests' },
];

export default function Layout() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { mode, toggleTheme } = useTheme();
    const { logout } = useAuth();
    const [open, setOpen] = useState(false);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const drawer = (
        <div style={{height: '100%', display: 'flex', flexDirection: 'column'}}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', px: 2, py: 2, bgcolor: 'background.paper', cursor: 'pointer' }}
                onClick={() => navigate('/dashboard')}
            >
                <Logo />
                <Typography
                    variant="h6"
                    sx={{
                        ml: 1.5,
                        fontWeight: 'bold',
                        background: 'linear-gradient(90deg, #2196f3, #a259f7)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        color: 'transparent',
                        WebkitTextFillColor: 'transparent',
                        letterSpacing: 2,
                        fontFamily: 'Segoe UI, Roboto, Helvetica, Arial, sans-serif',
                    }}
                >
                    VIBE
                </Typography>
            </Box>
            <List>
                {menuItems.map((item) => (
                    <ListItem
                        key={item.text}
                        onClick={() => navigate(item.path)}
                        sx={{ 
                            cursor: 'pointer',
                            bgcolor: location.pathname === item.path ? 'action.selected' : 'transparent'
                        }}
                    >
                        <ListItemIcon>{item.icon}</ListItemIcon>
                        <ListItemText primary={item.text} />
                    </ListItem>
                ))}
            </List>
            <Box sx={{ flexGrow: 1 }} />
            <Box sx={{ p: 2 }}>
                <Button
                    startIcon={<LogoutIcon sx={{ color: '#64748b', transition: 'color 0.2s' }} />}
                    fullWidth
                    sx={{
                        color: '#64748b',
                        justifyContent: 'flex-start',
                        borderRadius: 2,
                        bgcolor: 'transparent',
                        fontWeight: 600,
                        fontSize: 16,
                        px: 2,
                        py: 1.2,
                        textTransform: 'none',
                        boxShadow: 'none',
                        transition: 'background 0.2s, color 0.2s',
                        '&:hover': {
                            bgcolor: 'rgba(220,38,38,0.08)',
                            color: '#dc2626',
                            '& .MuiSvgIcon-root': { color: '#dc2626' }
                        }
                    }}
                    onClick={() => setOpen(true)}
                >
                    Çıkış
                </Button>
                <Dialog open={open} onClose={() => setOpen(false)}>
                    <DialogTitle>Çıkış Yap</DialogTitle>
                    <DialogContent>Çıkış yapmak istediğinizden emin misiniz?</DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpen(false)} color="primary">Hayır</Button>
                        <Button onClick={handleLogout} color="error" variant="contained">Evet</Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </div>
    );

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar
                position="fixed"
                sx={{
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    ml: { sm: `${drawerWidth}px` },
                    background: 'linear-gradient(45deg, #012130 40%, #4f0aff 90%)',
                    zIndex: (theme) => theme.zIndex.drawer + 1
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { sm: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography 
                        variant="h5" 
                        noWrap 
                        component="div"
                        sx={{
                            fontWeight: 'bold',
                            letterSpacing: '0.07em',
                            textShadow: '4px 4px 8px rgba(0,0,0,0.2)',
                            fontFamily: '"Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
                            flexGrow: 1
                        }}
                    >
                        VIBE-Virtual Interactive Belonging Engagement
                    </Typography>
                    <IconButton color="inherit" onClick={toggleTheme}>
                        {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
                    </IconButton>
                </Toolbar>
            </AppBar>
            <Box
                component="nav"
                sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
            >
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true,
                    }}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                >
                    {drawer}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>
            <Box
                component="main"
                sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
            >
                <Toolbar />
                <Outlet />
            </Box>
        </Box>
    );
} 