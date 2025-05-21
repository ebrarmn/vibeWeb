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
import { useNavigate, Link } from 'react-router-dom';
import {
    Email as EmailIcon,
    Lock as LockIcon,
    Person as PersonIcon,
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon,
    AdminPanelSettings as AdminIcon,
    Person as UserIcon
} from '@mui/icons-material';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/config';

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
            if (tabValue === 1) {
                // Admin tabı seçiliyse
                if (
                    loginData.email === 'admin@gmail.com' &&
                    loginData.password === 'admin'
                ) {
                    navigate('/dashboard');
                } else {
                    setError('Admin bilgileri hatalı!');
                }
            } else {
                // Kullanıcı girişi (Firebase auth ile)
                try {
                    await signInWithEmailAndPassword(auth, loginData.email, loginData.password);
                    navigate('/homepage');
                } catch (firebaseError: any) {
                    setError('E-posta veya şifre hatalı!');
                }
            }
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
                alignItems: 'center',
                justifyContent: 'center',
                background: `linear-gradient(135deg, 
                    ${alpha('#ffffff', 0.95)} 0%, 
                    ${alpha('#ffebee', 0.9)} 50%,
                    ${alpha('#ffcdd2', 0.85)} 100%)`,
                position: 'relative',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'url("/pattern.png")',
                    opacity: 0.1,
                    zIndex: 0
                }
            }}
        >
            <Container maxWidth="xs" sx={{ position: 'relative', zIndex: 1 }}>
                <Paper
                    elevation={0}
                    sx={{
                        borderRadius: 4,
                        background: `linear-gradient(145deg, 
                            ${alpha('#ffffff', 0.95)}, 
                            ${alpha('#fff5f5', 0.98)})`,
                        backdropFilter: 'blur(20px)',
                        border: `1px solid ${alpha('#ffcdd2', 0.3)}`,
                        boxShadow: `0 8px 32px 0 ${alpha('#ffcdd2', 0.2)}`,
                        overflow: 'hidden',
                        transition: 'transform 0.3s ease-in-out',
                        '&:hover': {
                            transform: 'translateY(-5px)'
                        }
                    }}
                >
                    <Box 
                        sx={{ 
                            p: 3, 
                            textAlign: 'center',
                            background: `linear-gradient(45deg, 
                                ${alpha(theme.palette.primary.main, 0.1)}, 
                                ${alpha(theme.palette.secondary.main, 0.1)})`,
                            borderBottom: `1px solid ${alpha('#ffcdd2', 0.3)}`
                        }}
                    >
                        <Typography
                            variant="h4"
                            sx={{
                                fontWeight: 800,
                                background: `linear-gradient(45deg, 
                                    ${theme.palette.primary.main}, 
                                    ${theme.palette.secondary.main})`,
                                backgroundClip: 'text',
                                textFillColor: 'transparent',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                mb: 1,
                                letterSpacing: '0.5px'
                            }}
                        >
                            VibeCOM
                        </Typography>
                        <Typography
                            variant="subtitle1"
                            sx={{
                                color: theme.palette.text.secondary,
                                fontWeight: 500
                            }}
                        >
                            Hoş Geldiniz
                        </Typography>
                    </Box>

                    <Tabs
                        value={tabValue}
                        onChange={handleTabChange}
                        centered
                        sx={{
                            '& .MuiTab-root': {
                                minWidth: 0,
                                px: 3,
                                py: 2,
                                fontSize: '0.9rem',
                                fontWeight: 600,
                                '&.Mui-selected': {
                                    color: theme.palette.primary.main
                                }
                            },
                            '& .MuiTabs-indicator': {
                                backgroundColor: theme.palette.primary.main,
                                height: 3,
                                borderRadius: '3px 3px 0 0'
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
                                    size="medium"
                                    label="E-posta"
                                    type="email"
                                    value={loginData.email}
                                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                                    required
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <EmailIcon color="primary" />
                                            </InputAdornment>
                                        )
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            backgroundColor: alpha('#ffffff', 0.8),
                                            '&:hover fieldset': {
                                                borderColor: theme.palette.primary.main
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderWidth: 2
                                            }
                                        },
                                        '& .MuiInputLabel-root': {
                                            fontWeight: 500
                                        }
                                    }}
                                />
                                <TextField
                                    fullWidth
                                    size="medium"
                                    label="Şifre"
                                    type={showPassword ? 'text' : 'password'}
                                    value={loginData.password}
                                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                                    required
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <LockIcon color="primary" />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    edge="end"
                                                    size="small"
                                                >
                                                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            backgroundColor: alpha('#ffffff', 0.8),
                                            '&:hover fieldset': {
                                                borderColor: theme.palette.primary.main
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderWidth: 2
                                            }
                                        },
                                        '& .MuiInputLabel-root': {
                                            fontWeight: 500
                                        }
                                    }}
                                />
                                <Button
                                    fullWidth
                                    type="submit"
                                    variant="contained"
                                    disabled={loading}
                                    sx={{
                                        mt: 2,
                                        py: 1.5,
                                        borderRadius: 2,
                                        textTransform: 'none',
                                        fontSize: '1rem',
                                        fontWeight: 600,
                                        background: `linear-gradient(45deg, 
                                            ${theme.palette.primary.main}, 
                                            ${theme.palette.secondary.main})`,
                                        boxShadow: `0 4px 14px 0 ${alpha(theme.palette.primary.main, 0.4)}`,
                                        '&:hover': {
                                            background: `linear-gradient(45deg, 
                                                ${theme.palette.primary.dark}, 
                                                ${theme.palette.secondary.dark})`,
                                            boxShadow: `0 6px 20px 0 ${alpha(theme.palette.primary.main, 0.6)}`
                                        }
                                    }}
                                >
                                    {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
                                </Button>
                            </Stack>
                        </form>
                        <Typography align="center" sx={{ mt: 2 }}>
                            Hesabın yok mu?{' '}
                            <Link
                                to="/register"
                                style={{
                                    color: '#d32f2f',
                                    fontWeight: 600,
                                    textDecoration: 'none',
                                    marginLeft: 4,
                                    cursor: 'pointer'
                                }}
                            >
                                Kayıt ol
                            </Link>
                        </Typography>
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