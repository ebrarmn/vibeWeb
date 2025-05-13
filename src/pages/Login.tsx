import React, { useState } from 'react';
import {
    Container,
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Tabs,
    Tab,
    useTheme,
    alpha,
    Alert,
    InputAdornment,
    IconButton,
    Stack
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
    Email as EmailIcon,
    Lock as LockIcon,
    Person as PersonIcon,
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon,
    AdminPanelSettings as AdminIcon,
    Person as UserIcon
} from '@mui/icons-material';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`auth-tabpanel-${index}`}
            aria-labelledby={`auth-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 2 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

export default function Login() {
    const theme = useTheme();
    const navigate = useNavigate();
    const [tabValue, setTabValue] = useState(0);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [loginData, setLoginData] = useState({
        email: '',
        password: ''
    });

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
        setError('');
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Firebase auth login işlemi burada yapılacak
            navigate('/dashboard');
        } catch (err) {
            setError('Giriş yapılırken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'center',
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
                pt: 4
            }}
        >
            <Container maxWidth="xs">
                <Paper
                    elevation={3}
                    sx={{
                        borderRadius: 3,
                        background: `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.paper, 0.95)})`,
                        backdropFilter: 'blur(10px)',
                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                        boxShadow: `0 8px 32px 0 ${alpha(theme.palette.common.black, 0.37)}`
                    }}
                >
                    <Box sx={{ p: 2, textAlign: 'center' }}>
                        <Typography
                            variant="h5"
                            sx={{
                                fontWeight: 700,
                                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                backgroundClip: 'text',
                                textFillColor: 'transparent',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                mb: 1
                            }}
                        >
                            VibeCOM
                        </Typography>
                    </Box>

                    <Tabs
                        value={tabValue}
                        onChange={handleTabChange}
                        centered
                        sx={{
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
                        }}
                    >
                        <Tab 
                            icon={<UserIcon />} 
                            label="Kullanıcı" 
                            iconPosition="start"
                            sx={{ fontSize: '0.875rem' }}
                        />
                        <Tab 
                            icon={<AdminIcon />} 
                            label="Admin" 
                            iconPosition="start"
                            sx={{ fontSize: '0.875rem' }}
                        />
                    </Tabs>

                    {error && (
                        <Alert 
                            severity="error" 
                            sx={{ 
                                mx: 2,
                                mb: 2,
                                borderRadius: 1,
                                '& .MuiAlert-icon': {
                                    color: theme.palette.error.main
                                }
                            }}
                        >
                            {error}
                        </Alert>
                    )}

                    <TabPanel value={tabValue} index={0}>
                        <form onSubmit={handleLogin}>
                            <Stack spacing={2}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    label="E-posta"
                                    type="email"
                                    value={loginData.email}
                                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                                    required
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <EmailIcon color="primary" fontSize="small" />
                                            </InputAdornment>
                                        )
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 1.5,
                                            '&:hover fieldset': {
                                                borderColor: theme.palette.primary.main
                                            }
                                        }
                                    }}
                                />
                                <TextField
                                    fullWidth
                                    size="small"
                                    label="Şifre"
                                    type={showPassword ? 'text' : 'password'}
                                    value={loginData.password}
                                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                                    required
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <LockIcon color="primary" fontSize="small" />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    edge="end"
                                                    size="small"
                                                >
                                                    {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 1.5,
                                            '&:hover fieldset': {
                                                borderColor: theme.palette.primary.main
                                            }
                                        }
                                    }}
                                />
                                <Button
                                    fullWidth
                                    type="submit"
                                    variant="contained"
                                    disabled={loading}
                                    sx={{
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
                                    }}
                                >
                                    {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
                                </Button>
                            </Stack>
                        </form>
                    </TabPanel>

                    <TabPanel value={tabValue} index={1}>
                        <form onSubmit={handleLogin}>
                            <Stack spacing={2}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    label="Admin E-posta"
                                    type="email"
                                    value={loginData.email}
                                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                                    required
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <EmailIcon color="primary" fontSize="small" />
                                            </InputAdornment>
                                        )
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 1.5,
                                            '&:hover fieldset': {
                                                borderColor: theme.palette.primary.main
                                            }
                                        }
                                    }}
                                />
                                <TextField
                                    fullWidth
                                    size="small"
                                    label="Admin Şifre"
                                    type={showPassword ? 'text' : 'password'}
                                    value={loginData.password}
                                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                                    required
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <LockIcon color="primary" fontSize="small" />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    edge="end"
                                                    size="small"
                                                >
                                                    {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 1.5,
                                            '&:hover fieldset': {
                                                borderColor: theme.palette.primary.main
                                            }
                                        }
                                    }}
                                />
                                <Button
                                    fullWidth
                                    type="submit"
                                    variant="contained"
                                    disabled={loading}
                                    sx={{
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
                                    }}
                                >
                                    {loading ? 'Giriş Yapılıyor...' : 'Admin Girişi'}
                                </Button>
                            </Stack>
                        </form>
                    </TabPanel>
                </Paper>
            </Container>
        </Box>
    );
} 