"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Layout;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_router_dom_1 = require("react-router-dom");
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const ThemeContext_1 = require("../context/ThemeContext");
const Logo_1 = __importDefault(require("./Logo"));
const drawerWidth = 240;
const menuItems = [
    { text: 'Dashboard', icon: (0, jsx_runtime_1.jsx)(icons_material_1.Dashboard, {}), path: '/dashboard' },
    { text: 'Kulüpler', icon: (0, jsx_runtime_1.jsx)(icons_material_1.Business, {}), path: '/clubs' },
    { text: 'Kullanıcılar', icon: (0, jsx_runtime_1.jsx)(icons_material_1.Group, {}), path: '/users' },
    { text: 'Etkinlikler', icon: (0, jsx_runtime_1.jsx)(icons_material_1.Event, {}), path: '/events' },
    { text: 'Kulüp Başvuruları', icon: (0, jsx_runtime_1.jsx)(icons_material_1.Business, {}), path: '/club-requests' },
];
function Layout() {
    const [mobileOpen, setMobileOpen] = (0, react_1.useState)(false);
    const navigate = (0, react_router_dom_1.useNavigate)();
    const location = (0, react_router_dom_1.useLocation)();
    const { mode, toggleTheme } = (0, ThemeContext_1.useTheme)();
    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };
    const drawer = ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { display: 'flex', alignItems: 'center', justifyContent: 'flex-start', px: 2, py: 2, bgcolor: 'background.paper', cursor: 'pointer' }, onClick: () => navigate('/dashboard'), children: [(0, jsx_runtime_1.jsx)(Logo_1.default, {}), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", sx: {
                            ml: 1.5,
                            fontWeight: 'bold',
                            background: 'linear-gradient(90deg, #2196f3, #a259f7)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            color: 'transparent',
                            WebkitTextFillColor: 'transparent',
                            letterSpacing: 2,
                            fontFamily: 'Segoe UI, Roboto, Helvetica, Arial, sans-serif',
                        }, children: "VIBE" })] }), (0, jsx_runtime_1.jsx)(material_1.List, { children: menuItems.map((item) => ((0, jsx_runtime_1.jsxs)(material_1.ListItem, { onClick: () => navigate(item.path), sx: {
                        cursor: 'pointer',
                        bgcolor: location.pathname === item.path ? 'action.selected' : 'transparent'
                    }, children: [(0, jsx_runtime_1.jsx)(material_1.ListItemIcon, { children: item.icon }), (0, jsx_runtime_1.jsx)(material_1.ListItemText, { primary: item.text })] }, item.text))) })] }));
    return ((0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { display: 'flex' }, children: [(0, jsx_runtime_1.jsx)(material_1.CssBaseline, {}), (0, jsx_runtime_1.jsx)(material_1.AppBar, { position: "fixed", sx: {
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    ml: { sm: `${drawerWidth}px` },
                    background: 'linear-gradient(45deg, #012130 40%, #4f0aff 90%)',
                    zIndex: (theme) => theme.zIndex.drawer + 1
                }, children: (0, jsx_runtime_1.jsxs)(material_1.Toolbar, { children: [(0, jsx_runtime_1.jsx)(material_1.IconButton, { color: "inherit", "aria-label": "open drawer", edge: "start", onClick: handleDrawerToggle, sx: { mr: 2, display: { sm: 'none' } }, children: (0, jsx_runtime_1.jsx)(icons_material_1.Menu, {}) }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h5", noWrap: true, component: "div", sx: {
                                fontWeight: 'bold',
                                letterSpacing: '0.07em',
                                textShadow: '4px 4px 8px rgba(0,0,0,0.2)',
                                fontFamily: '"Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
                                flexGrow: 1
                            }, children: "VIBE-Virtual Interactive Belonging Engagement" }), (0, jsx_runtime_1.jsx)(material_1.IconButton, { color: "inherit", onClick: toggleTheme, children: mode === 'dark' ? (0, jsx_runtime_1.jsx)(icons_material_1.Brightness7, {}) : (0, jsx_runtime_1.jsx)(icons_material_1.Brightness4, {}) })] }) }), (0, jsx_runtime_1.jsxs)(material_1.Box, { component: "nav", sx: { width: { sm: drawerWidth }, flexShrink: { sm: 0 } }, children: [(0, jsx_runtime_1.jsx)(material_1.Drawer, { variant: "temporary", open: mobileOpen, onClose: handleDrawerToggle, ModalProps: {
                            keepMounted: true,
                        }, sx: {
                            display: { xs: 'block', sm: 'none' },
                            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                        }, children: drawer }), (0, jsx_runtime_1.jsx)(material_1.Drawer, { variant: "permanent", sx: {
                            display: { xs: 'none', sm: 'block' },
                            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                        }, open: true, children: drawer })] }), (0, jsx_runtime_1.jsxs)(material_1.Box, { component: "main", sx: { flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }, children: [(0, jsx_runtime_1.jsx)(material_1.Toolbar, {}), (0, jsx_runtime_1.jsx)(react_router_dom_1.Outlet, {})] })] }));
}
