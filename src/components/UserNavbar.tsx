import React from 'react';
import { Box, List, ListItem, ListItemIcon, ListItemText, Divider, Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography, IconButton } from '@mui/material';
import { Person, Group, Event, Home, Logout, Menu } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Logo from './Logo';

const menuItems = [
    { text: 'Anasayfa', icon: <Home />, path: '/homepage' },
    { text: 'Kulüpler', icon: <Group />, path: '/user-clubs' },
    { text: 'Etkinlikler', icon: <Event />, path: '/user-events' },
];
const profileItem = { text: 'Profil', icon: <Person />, path: '/profile' };

interface UserNavbarProps {
    collapsed: boolean;
    setCollapsed: (collapsed: boolean) => void;
}

export default function UserNavbar({ collapsed, setCollapsed }: UserNavbarProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useAuth();
    const [open, setOpen] = React.useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const drawerWidth = collapsed ? 64 : 220;

    return (
        <Box sx={{
            width: drawerWidth,
            minWidth: drawerWidth,
            bgcolor: 'rgba(30, 60, 114, 0.97)',
            position: 'fixed',
            top: 0,
            left: 0,
            bottom: 0,
            height: '100vh',
            minHeight: '100vh',
            maxHeight: '100vh',
            borderRight: 'none',
            pt: 0,
            boxShadow: 2,
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1200,
            transition: 'width 0.2s',
        }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start', px: 2, py: 3, bgcolor: 'rgba(30, 60, 114, 0.97)', cursor: 'pointer', transition: 'padding 0.2s' }} onClick={() => !collapsed && navigate('/homepage')}>
                <IconButton onClick={e => { e.stopPropagation(); setCollapsed(!collapsed); }} sx={{ color: '#fff', mr: collapsed ? 0 : 1 }}>
                    <Menu />
                </IconButton>
                {!collapsed && <>
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
                </>}
            </Box>
            <List>
                {menuItems.map(item => (
                    <ListItem
                        button
                        key={item.text}
                        selected={location.pathname === item.path}
                        onClick={() => navigate(item.path)}
                        sx={{
                            borderRadius: 2,
                            mb: 1,
                            mx: 1,
                            color: location.pathname === item.path ? '#fff' : 'rgba(255,255,255,0.85)',
                            bgcolor: location.pathname === item.path ? 'linear-gradient(90deg, #3a8dde 60%, #5edfff 100%)' : 'transparent',
                            '&:hover': {
                                bgcolor: 'rgba(90,180,255,0.18)',
                                color: '#fff',
                            },
                            transition: 'background 0.2s, color 0.2s',
                            justifyContent: collapsed ? 'center' : 'flex-start',
                            px: collapsed ? 0 : 2
                        }}
                    >
                        <ListItemIcon sx={{ color: location.pathname === item.path ? '#fff' : 'rgba(255,255,255,0.7)', minWidth: 0, justifyContent: 'center' }}>{item.icon}</ListItemIcon>
                        {!collapsed && <ListItemText primary={item.text} />}
                    </ListItem>
                ))}
            </List>
            <List>
                <ListItem
                    button
                    key={profileItem.text}
                    selected={location.pathname === profileItem.path}
                    onClick={() => navigate(profileItem.path)}
                    sx={{
                        borderRadius: 2,
                        mb: 1,
                        mx: 1,
                        color: location.pathname === profileItem.path ? '#fff' : 'rgba(255,255,255,0.85)',
                        bgcolor: location.pathname === profileItem.path ? 'linear-gradient(90deg, #3a8dde 60%, #5edfff 100%)' : 'transparent',
                        '&:hover': {
                            bgcolor: 'rgba(90,180,255,0.18)',
                            color: '#fff',
                        },
                        transition: 'background 0.2s, color 0.2s',
                        justifyContent: collapsed ? 'center' : 'flex-start',
                        px: collapsed ? 0 : 2
                    }}
                >
                    <ListItemIcon sx={{ color: location.pathname === profileItem.path ? '#fff' : 'rgba(255,255,255,0.7)', minWidth: 0, justifyContent: 'center' }}>{profileItem.icon}</ListItemIcon>
                    {!collapsed && <ListItemText primary={profileItem.text} />}
                </ListItem>
            </List>
            <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.15)' }} />
            <Box sx={{ flexGrow: 1 }} />
            <Button
                startIcon={<Logout sx={{ color: '#64748b', transition: 'color 0.2s' }} />}
                fullWidth
                sx={{
                    color: '#64748b',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    borderRadius: 2,
                    mb: 2,
                    mx: 1,
                    bgcolor: 'transparent',
                    fontWeight: 600,
                    fontSize: 16,
                    px: collapsed ? 0 : 2,
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
                {!collapsed && 'Çıkış'}
            </Button>
            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>Çıkış Yap</DialogTitle>
                <DialogContent>Çıkış yapmak istediğinden emin misin?</DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)} color="primary">Hayır</Button>
                    <Button onClick={handleLogout} color="error" variant="contained">Evet</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
} 