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
    alpha,
    IconButton
} from '@mui/material';
import {
    Group as GroupIcon,
    Business as BusinessIcon,
    Event as EventIcon,
    Add as AddIcon,
    TrendingUp as TrendingUpIcon,
    FormatItalic,
    Logout as LogoutIcon
} from '@mui/icons-material';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { clubServices, userServices, eventServices } from '../services/firestore';
import seedData from '../utils/seedData';
import DatabaseManager from '../components/DatabaseManager';

interface StatCardProps {
    title: string;
    count: number;
    icon: React.ReactNode;
    trend?: number;
    color?: string;
}

interface ChartData {
    userGrowth: Array<{
        date: string;
        users: number;
    }>;
    eventDistribution: Array<{
        name: string;
        events: number;
    }>;
    clubActivity: Array<{
        name: string;
        members: number;
        events: number;
    }>;
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
    const [chartData, setChartData] = useState<ChartData>({
        userGrowth: [],
        eventDistribution: [],
        clubActivity: []
    });

    const handleLogout = () => {
        // Firebase auth logout işlemi burada yapılacak
        window.location.href = '/login';
    };

    const fetchStats = async () => {
        try {
            const [users, clubs, events] = await Promise.all([
                userServices.getAll(),
                clubServices.getAll(),
                eventServices.getAll()
            ]);

            // Kullanıcı büyüme verisi
            const userGrowthData = users.map(user => ({
                date: new Date(user.createdAt).toLocaleDateString(),
                users: users.filter(u => new Date(u.createdAt) <= new Date(user.createdAt)).length
            }));

            // Etkinlik dağılımı verisi
            const eventDistributionData: Array<{ name: string; events: number }> = events.reduce((acc, event) => {
                const club = clubs.find(c => c.id === event.clubId);
                if (club) {
                    const existingClub = acc.find(item => item.name === club.name);
                    if (existingClub) {
                        existingClub.events++;
                    } else {
                        acc.push({ name: club.name, events: 1 });
                    }
                }
                return acc;
            }, [] as Array<{ name: string; events: number }>);

            // Kulüp aktivite verisi
            const clubActivityData = clubs.map(club => ({
                name: club.name,
                members: club.memberIds.length,
                events: events.filter(e => e.clubId === club.id).length
            }));

            setStats({
                userCount: users.length,
                clubCount: clubs.length,
                eventCount: events.length
            });

            setChartData({
                userGrowth: userGrowthData,
                eventDistribution: eventDistributionData,
                clubActivity: clubActivityData
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
            <Box sx={{ mb: 6 }}>
                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mb: 3 }}
                >
                    <Typography
                        variant="h3"
                        sx={{
                            fontWeight: 'FormatItalic',
                            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                            backgroundClip: 'text',
                            textFillColor: 'transparent',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}
                    >
                        Yönetici Paneli
                    </Typography>
                </Box>
                <Typography variant="body1" color="textSecondary">
                    Platformunuzun genel durumunu buradan takip edebilirsiniz.
                </Typography>
            </Box>

            <Box sx={{ mb: 6, display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
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

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4 }}>
                    {/* Kullanıcı Büyüme Grafiği */}
                    <Paper 
                        elevation={2} 
                        sx={{ 
                            p: 3, 
                            height: '340px',
                            borderRadius: 2,
                            background: `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.8)}, ${alpha(theme.palette.background.paper, 0.95)})`,
                            backdropFilter: 'blur(10px)',
                            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                        }}
                    >
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 500, mb: 2 }}>
                            Kullanıcı Büyüme Grafiği
                        </Typography>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData.userGrowth} margin={{ top: 20, right: 40, left: 20, bottom: 30 }}>
                                <CartesianGrid 
                                    strokeDasharray="3 3" 
                                    stroke={alpha(theme.palette.divider, 0.1)}
                                    vertical={false}
                                />
                                <XAxis 
                                    dataKey="date" 
                                    tick={{ fontSize: 11 }}
                                    tickLine={false}
                                    axisLine={false}
                                    angle={-45}
                                    textAnchor="end"
                                    height={60}
                                    padding={{ left: 20, right: 20 }}
                                />
                                <YAxis 
                                    tick={{ fontSize: 11 }}
                                    tickLine={false}
                                    axisLine={false}
                                    width={40}
                                    padding={{ top: 20, bottom: 20 }}
                                />
                                <Tooltip 
                                    contentStyle={{
                                        background: alpha(theme.palette.background.default, 0.9),
                                        border: 'none',
                                        borderRadius: 8,
                                        boxShadow: theme.shadows[2],
                                        fontSize: '12px',
                                        padding: '8px 12px'
                                    }}
                                    wrapperStyle={{
                                        color: '#fff',
                                        outline: 'none'
                                    }}
                                    itemStyle={{
                                        color: '#fff'
                                    }}
                                    labelStyle={{
                                        color: '#fff'
                                    }}
                                />
                                <Legend 
                                    verticalAlign="top" 
                                    height={36}
                                    wrapperStyle={{ 
                                        paddingBottom: 10,
                                        fontSize: '12px'
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="users"
                                    stroke={theme.palette.primary.main}
                                    strokeWidth={2}
                                    dot={{ r: 4, fill: theme.palette.primary.main }}
                                    activeDot={{ r: 6, fill: theme.palette.primary.main }}
                                    name="Kullanıcı Sayısı"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </Paper>

                    {/* Etkinlik Dağılımı Grafiği */}
                    <Paper 
                        elevation={2} 
                        sx={{ 
                            p: 3, 
                            height: '340px',
                            borderRadius: 2,
                            background: `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.8)}, ${alpha(theme.palette.background.paper, 0.95)})`,
                            backdropFilter: 'blur(10px)',
                            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                        }}
                    >
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 500, mb: 2 }}>
                            Etkinlik Dağılımı
                        </Typography>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart margin={{ top: 20, right: 40, left: 20, bottom: 30 }}>
                                <Pie
                                    data={chartData.eventDistribution}
                                    dataKey="events"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={70}
                                    paddingAngle={5}
                                    label={({ name, percent }) => {
                                        const percentage = (percent * 100).toFixed(0);
                                        return `${percentage}%`;
                                    }}
                                    labelLine={false}
                                >
                                    {chartData.eventDistribution.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={[theme.palette.primary.main, theme.palette.secondary.main, theme.palette.success.main][index % 3]}
                                            stroke={theme.palette.background.paper}
                                            strokeWidth={2}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{
                                        background: '#1a1a1a',
                                        border: 'none',
                                        borderRadius: 8,
                                        boxShadow: theme.shadows[2],
                                        fontSize: '12px',
                                        padding: '8px 12px'
                                    }}
                                    wrapperStyle={{
                                        color: '#fff',
                                        outline: 'none'
                                    }}
                                    itemStyle={{
                                        color: '#fff'
                                    }}
                                    labelStyle={{
                                        color: '#fff'
                                    }}
                                />
                                <Legend 
                                    verticalAlign="bottom"
                                    height={36}
                                    wrapperStyle={{ 
                                        paddingTop: 20,
                                        fontSize: '12px'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </Paper>
                </Box>

                {/* Kulüp Aktivite Grafiği */}
                <Paper 
                    elevation={2} 
                    sx={{ 
                        p: 3, 
                        height: '340px',
                        borderRadius: 2,
                        background: `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.8)}, ${alpha(theme.palette.background.paper, 0.95)})`,
                        backdropFilter: 'blur(10px)',
                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                    }}
                >
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 500, mb: 2 }}>
                        Kulüp Aktivite Analizi
                    </Typography>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData.clubActivity} margin={{ top: 20, right: 40, left: 20, bottom: 30 }}>
                            <CartesianGrid 
                                strokeDasharray="3 3" 
                                stroke={alpha(theme.palette.divider, 0.1)}
                                vertical={false}
                            />
                            <XAxis 
                                dataKey="name" 
                                tick={{ fontSize: 11 }}
                                tickLine={false}
                                axisLine={false}
                                interval={0}
                                angle={-45}
                                textAnchor="end"
                                height={60}
                                padding={{ left: 20, right: 20 }}
                            />
                            <YAxis 
                                tick={{ fontSize: 11 }}
                                tickLine={false}
                                axisLine={false}
                                width={40}
                                padding={{ top: 20, bottom: 20 }}
                            />
                            <Tooltip 
                                contentStyle={{
                                    background: '#1a1a1a',
                                    border: 'none',
                                    borderRadius: 8,
                                    boxShadow: theme.shadows[2],
                                    fontSize: '12px',
                                    padding: '8px 12px'
                                }}
                                wrapperStyle={{
                                    color: '#fff',
                                    outline: 'none'
                                }}
                                itemStyle={{
                                    color: '#fff'
                                }}
                                labelStyle={{
                                    color: '#fff'
                                }}
                            />
                            <Legend 
                                verticalAlign="top"
                                height={36}
                                wrapperStyle={{ 
                                    paddingBottom: 10,
                                    fontSize: '12px'
                                }}
                            />
                            <Bar
                                dataKey="members"
                                fill={theme.palette.primary.main}
                                name="Üye Sayısı"
                                radius={[4, 4, 0, 0]}
                                maxBarSize={40}
                            />
                            <Bar
                                dataKey="events"
                                fill={theme.palette.secondary.main}
                                name="Etkinlik Sayısı"
                                radius={[4, 4, 0, 0]}
                                maxBarSize={40}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </Paper>

                {/* Veritabanı Yönetimi */}
                <DatabaseManager />
            </Box>
        </Container>
    );
} 