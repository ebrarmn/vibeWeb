"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Login;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const material_1 = require("@mui/material");
const react_router_dom_1 = require("react-router-dom");
const icons_material_1 = require("@mui/icons-material");
function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return ((0, jsx_runtime_1.jsx)("div", { role: "tabpanel", hidden: value !== index, id: `auth-tabpanel-${index}`, "aria-labelledby": `auth-tab-${index}`, ...other, children: value === index && ((0, jsx_runtime_1.jsx)(material_1.Box, { sx: { p: 2 }, children: children })) }));
}
function Login() {
    const theme = (0, material_1.useTheme)();
    const navigate = (0, react_router_dom_1.useNavigate)();
    const [tabValue, setTabValue] = (0, react_1.useState)(0);
    const [error, setError] = (0, react_1.useState)('');
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [showPassword, setShowPassword] = (0, react_1.useState)(false);
    const [loginData, setLoginData] = (0, react_1.useState)({
        email: '',
        password: ''
    });
    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
        setError('');
    };
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            // Firebase auth login işlemi burada yapılacak
            navigate('/dashboard');
        }
        catch (err) {
            setError('Giriş yapılırken bir hata oluştu.');
        }
        finally {
            setLoading(false);
        }
    };
    return ((0, jsx_runtime_1.jsx)(material_1.Box, { sx: {
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            background: `linear-gradient(135deg, ${(0, material_1.alpha)(theme.palette.primary.main, 0.1)} 0%, ${(0, material_1.alpha)(theme.palette.secondary.main, 0.1)} 100%)`,
            pt: 4
        }, children: (0, jsx_runtime_1.jsx)(material_1.Container, { maxWidth: "xs", children: (0, jsx_runtime_1.jsxs)(material_1.Paper, { elevation: 3, sx: {
                    borderRadius: 3,
                    background: `linear-gradient(145deg, ${(0, material_1.alpha)(theme.palette.background.paper, 0.9)}, ${(0, material_1.alpha)(theme.palette.background.paper, 0.95)})`,
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${(0, material_1.alpha)(theme.palette.divider, 0.1)}`,
                    boxShadow: `0 8px 32px 0 ${(0, material_1.alpha)(theme.palette.common.black, 0.37)}`
                }, children: [(0, jsx_runtime_1.jsx)(material_1.Box, { sx: { p: 2, textAlign: 'center' }, children: (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h5", sx: {
                                fontWeight: 700,
                                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                backgroundClip: 'text',
                                textFillColor: 'transparent',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                mb: 1
                            }, children: "VibeCOM" }) }), (0, jsx_runtime_1.jsxs)(material_1.Tabs, { value: tabValue, onChange: handleTabChange, centered: true, sx: {
                            '& .MuiTab-root': {
                                minWidth: 0,
                                px: 2,
                                py: 1,
                                '&.Mui-selected': {
                                    color: theme.palette.primary.main
                                }
                            },
                            '& .MuiTabs-indicator': {
                                backgroundColor: theme.palette.primary.main,
                                height: 2
                            }
                        }, children: [(0, jsx_runtime_1.jsx)(material_1.Tab, { icon: (0, jsx_runtime_1.jsx)(icons_material_1.Person, {}), label: "Kullan\u0131c\u0131", iconPosition: "start", sx: { fontSize: '0.875rem' } }), (0, jsx_runtime_1.jsx)(material_1.Tab, { icon: (0, jsx_runtime_1.jsx)(icons_material_1.AdminPanelSettings, {}), label: "Admin", iconPosition: "start", sx: { fontSize: '0.875rem' } })] }), error && ((0, jsx_runtime_1.jsx)(material_1.Alert, { severity: "error", sx: {
                            mx: 2,
                            mb: 2,
                            borderRadius: 1,
                            '& .MuiAlert-icon': {
                                color: theme.palette.error.main
                            }
                        }, children: error })), (0, jsx_runtime_1.jsx)(TabPanel, { value: tabValue, index: 0, children: (0, jsx_runtime_1.jsx)("form", { onSubmit: handleLogin, children: (0, jsx_runtime_1.jsxs)(material_1.Stack, { spacing: 2, children: [(0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, size: "small", label: "E-posta", type: "email", value: loginData.email, onChange: (e) => setLoginData({ ...loginData, email: e.target.value }), required: true, InputProps: {
                                            startAdornment: ((0, jsx_runtime_1.jsx)(material_1.InputAdornment, { position: "start", children: (0, jsx_runtime_1.jsx)(icons_material_1.Email, { color: "primary", fontSize: "small" }) }))
                                        }, sx: {
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 1.5,
                                                '&:hover fieldset': {
                                                    borderColor: theme.palette.primary.main
                                                }
                                            }
                                        } }), (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, size: "small", label: "\u015Eifre", type: showPassword ? 'text' : 'password', value: loginData.password, onChange: (e) => setLoginData({ ...loginData, password: e.target.value }), required: true, InputProps: {
                                            startAdornment: ((0, jsx_runtime_1.jsx)(material_1.InputAdornment, { position: "start", children: (0, jsx_runtime_1.jsx)(icons_material_1.Lock, { color: "primary", fontSize: "small" }) })),
                                            endAdornment: ((0, jsx_runtime_1.jsx)(material_1.InputAdornment, { position: "end", children: (0, jsx_runtime_1.jsx)(material_1.IconButton, { onClick: () => setShowPassword(!showPassword), edge: "end", size: "small", children: showPassword ? (0, jsx_runtime_1.jsx)(icons_material_1.VisibilityOff, { fontSize: "small" }) : (0, jsx_runtime_1.jsx)(icons_material_1.Visibility, { fontSize: "small" }) }) }))
                                        }, sx: {
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 1.5,
                                                '&:hover fieldset': {
                                                    borderColor: theme.palette.primary.main
                                                }
                                            }
                                        } }), (0, jsx_runtime_1.jsx)(material_1.Button, { fullWidth: true, type: "submit", variant: "contained", disabled: loading, sx: {
                                            mt: 1,
                                            py: 1,
                                            borderRadius: 1.5,
                                            textTransform: 'none',
                                            fontSize: '0.875rem',
                                            fontWeight: 600,
                                            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                            '&:hover': {
                                                background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`
                                            }
                                        }, children: loading ? 'Giriş Yapılıyor...' : 'Giriş Yap' })] }) }) }), (0, jsx_runtime_1.jsx)(TabPanel, { value: tabValue, index: 1, children: (0, jsx_runtime_1.jsx)("form", { onSubmit: handleLogin, children: (0, jsx_runtime_1.jsxs)(material_1.Stack, { spacing: 2, children: [(0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, size: "small", label: "Admin E-posta", type: "email", value: loginData.email, onChange: (e) => setLoginData({ ...loginData, email: e.target.value }), required: true, InputProps: {
                                            startAdornment: ((0, jsx_runtime_1.jsx)(material_1.InputAdornment, { position: "start", children: (0, jsx_runtime_1.jsx)(icons_material_1.Email, { color: "primary", fontSize: "small" }) }))
                                        }, sx: {
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 1.5,
                                                '&:hover fieldset': {
                                                    borderColor: theme.palette.primary.main
                                                }
                                            }
                                        } }), (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, size: "small", label: "Admin \u015Eifre", type: showPassword ? 'text' : 'password', value: loginData.password, onChange: (e) => setLoginData({ ...loginData, password: e.target.value }), required: true, InputProps: {
                                            startAdornment: ((0, jsx_runtime_1.jsx)(material_1.InputAdornment, { position: "start", children: (0, jsx_runtime_1.jsx)(icons_material_1.Lock, { color: "primary", fontSize: "small" }) })),
                                            endAdornment: ((0, jsx_runtime_1.jsx)(material_1.InputAdornment, { position: "end", children: (0, jsx_runtime_1.jsx)(material_1.IconButton, { onClick: () => setShowPassword(!showPassword), edge: "end", size: "small", children: showPassword ? (0, jsx_runtime_1.jsx)(icons_material_1.VisibilityOff, { fontSize: "small" }) : (0, jsx_runtime_1.jsx)(icons_material_1.Visibility, { fontSize: "small" }) }) }))
                                        }, sx: {
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 1.5,
                                                '&:hover fieldset': {
                                                    borderColor: theme.palette.primary.main
                                                }
                                            }
                                        } }), (0, jsx_runtime_1.jsx)(material_1.Button, { fullWidth: true, type: "submit", variant: "contained", disabled: loading, sx: {
                                            mt: 1,
                                            py: 1,
                                            borderRadius: 1.5,
                                            textTransform: 'none',
                                            fontSize: '0.875rem',
                                            fontWeight: 600,
                                            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                            '&:hover': {
                                                background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`
                                            }
                                        }, children: loading ? 'Giriş Yapılıyor...' : 'Admin Girişi' })] }) }) })] }) }) }));
}
