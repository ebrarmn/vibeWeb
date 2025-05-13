"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Dashboard;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const recharts_1 = require("recharts");
const firestore_1 = require("../services/firestore");
const seedData_1 = __importDefault(require("../utils/seedData"));
const DatabaseManager_1 = __importDefault(require("../components/DatabaseManager"));
function StatCard({ title, count, icon, trend, color }) {
    const theme = (0, material_1.useTheme)();
    const iconColor = color || theme.palette.primary.main;
    return ((0, jsx_runtime_1.jsxs)(material_1.Paper, { elevation: 2, sx: {
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
        }, children: [(0, jsx_runtime_1.jsx)(material_1.Box, { sx: {
                    position: 'absolute',
                    right: -20,
                    top: -20,
                    opacity: 0.1,
                    transform: 'scale(2)',
                    color: iconColor
                }, children: icon }), (0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { position: 'relative', zIndex: 1 }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", color: "textSecondary", gutterBottom: true, children: title }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h3", component: "div", sx: { mb: 2, color: iconColor }, children: count }), trend && ((0, jsx_runtime_1.jsxs)(material_1.Box, { display: "flex", alignItems: "center", children: [(0, jsx_runtime_1.jsx)(icons_material_1.TrendingUp, { sx: {
                                    color: trend >= 0 ? 'success.main' : 'error.main',
                                    mr: 1,
                                    fontSize: '1rem'
                                } }), (0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "body2", color: trend >= 0 ? 'success.main' : 'error.main', children: [trend, "% bu ay"] })] }))] })] }));
}
function Dashboard() {
    const theme = (0, material_1.useTheme)();
    const [stats, setStats] = (0, react_1.useState)({
        userCount: 0,
        clubCount: 0,
        eventCount: 0
    });
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [seeding, setSeeding] = (0, react_1.useState)(false);
    const [chartData, setChartData] = (0, react_1.useState)({
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
                firestore_1.userServices.getAll(),
                firestore_1.clubServices.getAll(),
                firestore_1.eventServices.getAll()
            ]);
            // Kullanıcı büyüme verisi
            const userGrowthData = users.map(user => ({
                date: new Date(user.createdAt).toLocaleDateString(),
                users: users.filter(u => new Date(u.createdAt) <= new Date(user.createdAt)).length
            }));
            // Etkinlik dağılımı verisi
            const eventDistributionData = events.reduce((acc, event) => {
                const club = clubs.find(c => c.id === event.clubId);
                if (club) {
                    const existingClub = acc.find(item => item.name === club.name);
                    if (existingClub) {
                        existingClub.events++;
                    }
                    else {
                        acc.push({ name: club.name, events: 1 });
                    }
                }
                return acc;
            }, []);
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
        }
        catch (error) {
            console.error('İstatistikler yüklenirken hata oluştu:', error);
        }
        finally {
            setLoading(false);
        }
    };
    (0, react_1.useEffect)(() => {
        fetchStats();
    }, []);
    const handleSeedData = async () => {
        try {
            setSeeding(true);
            await (0, seedData_1.default)();
            await fetchStats();
        }
        catch (error) {
            console.error('Test verileri yüklenirken hata oluştu:', error);
        }
        finally {
            setSeeding(false);
        }
    };
    if (loading) {
        return ((0, jsx_runtime_1.jsx)(material_1.Box, { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh", children: (0, jsx_runtime_1.jsx)(material_1.CircularProgress, {}) }));
    }
    return ((0, jsx_runtime_1.jsxs)(material_1.Container, { maxWidth: "lg", sx: { mt: 4, mb: 4 }, children: [(0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { mb: 6 }, children: [(0, jsx_runtime_1.jsxs)(material_1.Box, { display: "flex", justifyContent: "space-between", alignItems: "center", sx: { mb: 3 }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h3", sx: {
                                    fontWeight: 'FormatItalic',
                                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                    backgroundClip: 'text',
                                    textFillColor: 'transparent',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent'
                                }, children: "Y\u00F6netici Paneli" }), (0, jsx_runtime_1.jsx)(material_1.IconButton, { onClick: handleLogout, sx: {
                                    color: theme.palette.error.main,
                                    '&:hover': {
                                        backgroundColor: (0, material_1.alpha)(theme.palette.error.main, 0.1)
                                    }
                                }, children: (0, jsx_runtime_1.jsx)(icons_material_1.Logout, {}) })] }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body1", color: "textSecondary", children: "Platformunuzun genel durumunu buradan takip edebilirsiniz." })] }), (0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { mb: 6, display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }, children: [(0, jsx_runtime_1.jsx)(material_1.Box, { children: (0, jsx_runtime_1.jsx)(StatCard, { title: "Toplam Kullan\u0131c\u0131", count: stats.userCount, icon: (0, jsx_runtime_1.jsx)(icons_material_1.Group, {}), trend: 15, color: theme.palette.primary.main }) }), (0, jsx_runtime_1.jsx)(material_1.Box, { children: (0, jsx_runtime_1.jsx)(StatCard, { title: "Toplam Kul\u00FCp", count: stats.clubCount, icon: (0, jsx_runtime_1.jsx)(icons_material_1.Business, {}), trend: 8, color: theme.palette.secondary.main }) }), (0, jsx_runtime_1.jsx)(material_1.Box, { children: (0, jsx_runtime_1.jsx)(StatCard, { title: "Toplam Etkinlik", count: stats.eventCount, icon: (0, jsx_runtime_1.jsx)(icons_material_1.Event, {}), trend: 12, color: theme.palette.success.main }) })] }), (0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { display: 'flex', flexDirection: 'column', gap: 4 }, children: [(0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4 }, children: [(0, jsx_runtime_1.jsxs)(material_1.Paper, { elevation: 2, sx: {
                                    p: 3,
                                    height: '340px',
                                    borderRadius: 2,
                                    background: `linear-gradient(145deg, ${(0, material_1.alpha)(theme.palette.background.paper, 0.8)}, ${(0, material_1.alpha)(theme.palette.background.paper, 0.95)})`,
                                    backdropFilter: 'blur(10px)',
                                    border: `1px solid ${(0, material_1.alpha)(theme.palette.divider, 0.1)}`
                                }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", gutterBottom: true, sx: { fontWeight: 500, mb: 2 }, children: "Kullan\u0131c\u0131 B\u00FCy\u00FCme Grafi\u011Fi" }), (0, jsx_runtime_1.jsx)(recharts_1.ResponsiveContainer, { width: "100%", height: "100%", children: (0, jsx_runtime_1.jsxs)(recharts_1.LineChart, { data: chartData.userGrowth, margin: { top: 20, right: 40, left: 20, bottom: 30 }, children: [(0, jsx_runtime_1.jsx)(recharts_1.CartesianGrid, { strokeDasharray: "3 3", stroke: (0, material_1.alpha)(theme.palette.divider, 0.1), vertical: false }), (0, jsx_runtime_1.jsx)(recharts_1.XAxis, { dataKey: "date", tick: { fontSize: 11 }, tickLine: false, axisLine: false, angle: -45, textAnchor: "end", height: 60, padding: { left: 20, right: 20 } }), (0, jsx_runtime_1.jsx)(recharts_1.YAxis, { tick: { fontSize: 11 }, tickLine: false, axisLine: false, width: 40, padding: { top: 20, bottom: 20 } }), (0, jsx_runtime_1.jsx)(recharts_1.Tooltip, { contentStyle: {
                                                        background: (0, material_1.alpha)(theme.palette.background.default, 0.9),
                                                        border: 'none',
                                                        borderRadius: 8,
                                                        boxShadow: theme.shadows[2],
                                                        fontSize: '12px',
                                                        padding: '8px 12px'
                                                    }, wrapperStyle: {
                                                        color: '#fff',
                                                        outline: 'none'
                                                    }, itemStyle: {
                                                        color: '#fff'
                                                    }, labelStyle: {
                                                        color: '#fff'
                                                    } }), (0, jsx_runtime_1.jsx)(recharts_1.Legend, { verticalAlign: "top", height: 36, wrapperStyle: {
                                                        paddingBottom: 10,
                                                        fontSize: '12px'
                                                    } }), (0, jsx_runtime_1.jsx)(recharts_1.Line, { type: "monotone", dataKey: "users", stroke: theme.palette.primary.main, strokeWidth: 2, dot: { r: 4, fill: theme.palette.primary.main }, activeDot: { r: 6, fill: theme.palette.primary.main }, name: "Kullan\u0131c\u0131 Say\u0131s\u0131" })] }) })] }), (0, jsx_runtime_1.jsxs)(material_1.Paper, { elevation: 2, sx: {
                                    p: 3,
                                    height: '340px',
                                    borderRadius: 2,
                                    background: `linear-gradient(145deg, ${(0, material_1.alpha)(theme.palette.background.paper, 0.8)}, ${(0, material_1.alpha)(theme.palette.background.paper, 0.95)})`,
                                    backdropFilter: 'blur(10px)',
                                    border: `1px solid ${(0, material_1.alpha)(theme.palette.divider, 0.1)}`
                                }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", gutterBottom: true, sx: { fontWeight: 500, mb: 2 }, children: "Etkinlik Da\u011F\u0131l\u0131m\u0131" }), (0, jsx_runtime_1.jsx)(recharts_1.ResponsiveContainer, { width: "100%", height: "100%", children: (0, jsx_runtime_1.jsxs)(recharts_1.PieChart, { margin: { top: 20, right: 40, left: 20, bottom: 30 }, children: [(0, jsx_runtime_1.jsx)(recharts_1.Pie, { data: chartData.eventDistribution, dataKey: "events", nameKey: "name", cx: "50%", cy: "50%", innerRadius: 50, outerRadius: 70, paddingAngle: 5, label: ({ name, percent }) => {
                                                        const percentage = (percent * 100).toFixed(0);
                                                        return `${percentage}%`;
                                                    }, labelLine: false, children: chartData.eventDistribution.map((entry, index) => ((0, jsx_runtime_1.jsx)(recharts_1.Cell, { fill: [theme.palette.primary.main, theme.palette.secondary.main, theme.palette.success.main][index % 3], stroke: theme.palette.background.paper, strokeWidth: 2 }, `cell-${index}`))) }), (0, jsx_runtime_1.jsx)(recharts_1.Tooltip, { contentStyle: {
                                                        background: '#1a1a1a',
                                                        border: 'none',
                                                        borderRadius: 8,
                                                        boxShadow: theme.shadows[2],
                                                        fontSize: '12px',
                                                        padding: '8px 12px'
                                                    }, wrapperStyle: {
                                                        color: '#fff',
                                                        outline: 'none'
                                                    }, itemStyle: {
                                                        color: '#fff'
                                                    }, labelStyle: {
                                                        color: '#fff'
                                                    } }), (0, jsx_runtime_1.jsx)(recharts_1.Legend, { verticalAlign: "bottom", height: 36, wrapperStyle: {
                                                        paddingTop: 20,
                                                        fontSize: '12px'
                                                    } })] }) })] })] }), (0, jsx_runtime_1.jsxs)(material_1.Paper, { elevation: 2, sx: {
                            p: 3,
                            height: '340px',
                            borderRadius: 2,
                            background: `linear-gradient(145deg, ${(0, material_1.alpha)(theme.palette.background.paper, 0.8)}, ${(0, material_1.alpha)(theme.palette.background.paper, 0.95)})`,
                            backdropFilter: 'blur(10px)',
                            border: `1px solid ${(0, material_1.alpha)(theme.palette.divider, 0.1)}`
                        }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", gutterBottom: true, sx: { fontWeight: 500, mb: 2 }, children: "Kul\u00FCp Aktivite Analizi" }), (0, jsx_runtime_1.jsx)(recharts_1.ResponsiveContainer, { width: "100%", height: "100%", children: (0, jsx_runtime_1.jsxs)(recharts_1.BarChart, { data: chartData.clubActivity, margin: { top: 20, right: 40, left: 20, bottom: 30 }, children: [(0, jsx_runtime_1.jsx)(recharts_1.CartesianGrid, { strokeDasharray: "3 3", stroke: (0, material_1.alpha)(theme.palette.divider, 0.1), vertical: false }), (0, jsx_runtime_1.jsx)(recharts_1.XAxis, { dataKey: "name", tick: { fontSize: 11 }, tickLine: false, axisLine: false, interval: 0, angle: -45, textAnchor: "end", height: 60, padding: { left: 20, right: 20 } }), (0, jsx_runtime_1.jsx)(recharts_1.YAxis, { tick: { fontSize: 11 }, tickLine: false, axisLine: false, width: 40, padding: { top: 20, bottom: 20 } }), (0, jsx_runtime_1.jsx)(recharts_1.Tooltip, { contentStyle: {
                                                background: '#1a1a1a',
                                                border: 'none',
                                                borderRadius: 8,
                                                boxShadow: theme.shadows[2],
                                                fontSize: '12px',
                                                padding: '8px 12px'
                                            }, wrapperStyle: {
                                                color: '#fff',
                                                outline: 'none'
                                            }, itemStyle: {
                                                color: '#fff'
                                            }, labelStyle: {
                                                color: '#fff'
                                            } }), (0, jsx_runtime_1.jsx)(recharts_1.Legend, { verticalAlign: "top", height: 36, wrapperStyle: {
                                                paddingBottom: 10,
                                                fontSize: '12px'
                                            } }), (0, jsx_runtime_1.jsx)(recharts_1.Bar, { dataKey: "members", fill: theme.palette.primary.main, name: "\u00DCye Say\u0131s\u0131", radius: [4, 4, 0, 0], maxBarSize: 40 }), (0, jsx_runtime_1.jsx)(recharts_1.Bar, { dataKey: "events", fill: theme.palette.secondary.main, name: "Etkinlik Say\u0131s\u0131", radius: [4, 4, 0, 0], maxBarSize: 40 })] }) })] }), (0, jsx_runtime_1.jsx)(DatabaseManager_1.default, {})] })] }));
}
