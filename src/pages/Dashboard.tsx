import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    CircularProgress,
    Button,
    Container,
    Grid,
    useTheme,
    alpha
} from '@mui/material';
import {
    Group as GroupIcon,
    Business as BusinessIcon,
    Event as EventIcon,
    Add as AddIcon,
    TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { clubServices, userServices, eventServices } from '../services/firestore';
import seedData from '../utils/seedData';

interface StatCardProps {
    title: string;
    count: number;
    icon: React.ReactNode;
    trend?: number;
    color?: string;
}

function StatCard({ title, count, icon, trend, color }: StatCardProps) {
    const theme = useTheme();
    const iconColor = color || theme.palette.primary.main;

    return (
        <Paper
            elevation={2}
            sx={{
                p: 3,
                height: '100%',
                bgcolor: 'background.paper',
                position: 'relative',
                overflow: 'hidden',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[4]
                }
            }}
        >
            <Box
                sx={{
                    position: 'absolute',
                    right: -20,
                    top: -20,
                    opacity: 0.1,
                    transform: 'scale(2)',
                    color: iconColor
                }}
            >
                {icon}
            </Box>
            <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Typography variant="h6" color="textSecondary" gutterBottom>
                    {title}
                </Typography>
                <Typography variant="h3" component="div" sx={{ mb: 2, color: iconColor }}>
                    {count}
                </Typography>
                {trend && (
                    <Box display="flex" alignItems="center">
                        <TrendingUpIcon
                            sx={{
                                color: trend >= 0 ? 'success.main' : 'error.main',
                                mr: 1,
                                fontSize: '1rem'
                            }}
                        />
                        <Typography
                            variant="body2"
                            color={trend >= 0 ? 'success.main' : 'error.main'}
                        >
                            {trend}% bu ay
                        </Typography>
                    </Box>
                )}
            </Box>
        </Paper>
    );
}

export default function Dashboard() {
    const theme = useTheme();
    const [stats, setStats] = useState({
        userCount: 0,
        clubCount: 0,
        eventCount: 0
    });
    const [loading, setLoading] = useState(true);
    const [seeding, setSeeding] = useState(false);

    const fetchStats = async () => {
        try {
            const [users, clubs, events] = await Promise.all([
                userServices.getAll(),
                clubServices.getAll(),
                eventServices.getAll()
            ]);

            setStats({
                userCount: users.length,
                clubCount: clubs.length,
                eventCount: events.length
            });
        } catch (error) {
            console.error('İstatistikler yüklenirken hata oluştu:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const handleSeedData = async () => {
        try {
            setSeeding(true);
            await seedData();
            await fetchStats();
        } catch (error) {
            console.error('Test verileri yüklenirken hata oluştu:', error);
        } finally {
            setSeeding(false);
        }
    };

    if (loading) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="80vh"
            >
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mb: 3 }}
                >
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 'bold',
                            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                            backgroundClip: 'text',
                            textFillColor: 'transparent',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}
                    >
                        Yönetici Paneli
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleSeedData}
                        disabled={seeding}
                        sx={{
                            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                            color: 'white',
                            '&:hover': {
                                background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`
                            }
                        }}
                    >
                        {seeding ? 'Yükleniyor...' : 'Test Verilerini Yükle'}
                    </Button>
                </Box>
                <Typography variant="body1" color="textSecondary">
                    Platformunuzun genel durumunu buradan takip edebilirsiniz.
                </Typography>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
                <Box>
                    <StatCard
                        title="Toplam Kullanıcı"
                        count={stats.userCount}
                        icon={<GroupIcon />}
                        trend={15}
                        color={theme.palette.primary.main}
                    />
                </Box>
                <Box>
                    <StatCard
                        title="Toplam Kulüp"
                        count={stats.clubCount}
                        icon={<BusinessIcon />}
                        trend={8}
                        color={theme.palette.secondary.main}
                    />
                </Box>
                <Box>
                    <StatCard
                        title="Toplam Etkinlik"
                        count={stats.eventCount}
                        icon={<EventIcon />}
                        trend={12}
                        color={theme.palette.success.main}
                    />
                </Box>
            </Box>
        </Container>
    );
} 