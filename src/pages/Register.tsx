import React, { useState } from 'react';
import {
    Container,
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    InputAdornment,
    IconButton,
    Stack,
    ToggleButtonGroup,
    ToggleButton
} from '@mui/material';
import {
    Email as EmailIcon,
    Lock as LockIcon,
    Person as PersonIcon,
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon,
    Phone as PhoneIcon,
    School as SchoolIcon,
    AccountBalance as FacultyIcon,
    MenuBook as DepartmentIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { alpha, useTheme } from '@mui/material/styles';
import { userServices } from '../services/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/config';

export default function Register() {
    const theme = useTheme();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showPassword2, setShowPassword2] = useState(false);
    const [gender, setGender] = useState('');
    const [grade, setGrade] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [form, setForm] = useState({
        displayName: '',
        email: '',
        password: '',
        password2: '',
        phone: '',
        university: '',
        faculty: '',
        department: '',
        grade: '',
        gender: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleGender = (_: any, newGender: string) => {
        setGender(newGender);
        setForm({ ...form, gender: newGender });
    };

    const handleGrade = (_: any, newGrade: string) => {
        setGrade(newGrade);
        setForm({ ...form, grade: newGrade });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!form.displayName || !form.email || !form.password || !form.password2) {
            setError('Lütfen tüm zorunlu alanları doldurun.');
            return;
        }
        if (form.password !== form.password2) {
            setError('Şifreler eşleşmiyor.');
            return;
        }
        setLoading(true);
        try {
            // 1. Authentication'a kayıt
            await createUserWithEmailAndPassword(auth, form.email, form.password);
            // 2. Firestore'a kayıt
            await userServices.create({
                displayName: form.displayName,
                email: form.email,
                phone: form.phone,
                university: form.university,
                faculty: form.faculty,
                department: form.department,
                grade: form.grade,
                gender: form.gender,
                role: 'user',
                photoURL: '',
                studentNumber: '',
                birthDate: '',
                clubIds: [],
                clubRoles: {}
            });
            navigate('/login');
        } catch (err: any) {
            if (err.code === 'auth/email-already-in-use') {
                setError('Bu e-posta ile zaten bir hesap var.');
            } else if (err.code === 'auth/invalid-email') {
                setError('Geçersiz e-posta adresi.');
            } else if (err.code === 'auth/weak-password') {
                setError('Şifre çok zayıf.');
            } else {
                setError('Kayıt sırasında bir hata oluştu.');
            }
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
            }}
        >
            <Container maxWidth="xs">
                <Paper
                    elevation={0}
                    sx={{
                        borderRadius: 4,
                        background: `linear-gradient(145deg, 
                            ${alpha('#ffffff', 0.95)}, 
                            ${alpha('#fff5f5', 0.98)})`,
                        border: `1px solid ${alpha('#ffcdd2', 0.3)}`,
                        boxShadow: `0 8px 32px 0 ${alpha('#ffcdd2', 0.2)}`,
                        overflow: 'hidden',
                        p: 3
                    }}
                >
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, textAlign: 'center' }}>
                        Yeni Hesap Oluştur
                    </Typography>
                    <form onSubmit={handleSubmit}>
                        <Stack spacing={2}>
                            <TextField
                                name="displayName"
                                label="Ad Soyad"
                                placeholder="Adınız ve soyadınız"
                                value={form.displayName}
                                onChange={handleChange}
                                fullWidth
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <PersonIcon color="error" />
                                        </InputAdornment>
                                    )
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        backgroundColor: alpha('#fff', 0.7)
                                    }
                                }}
                            />
                            <Typography sx={{ fontWeight: 600, mt: 1 }}>Cinsiyet</Typography>
                            <ToggleButtonGroup
                                color="error"
                                value={gender}
                                exclusive
                                onChange={handleGender}
                                fullWidth
                                sx={{ mb: 1 }}
                            >
                                <ToggleButton value="female" sx={{ flex: 1 }}>Kız</ToggleButton>
                                <ToggleButton value="male" sx={{ flex: 1 }}>Erkek</ToggleButton>
                                <ToggleButton value="other" sx={{ flex: 1 }}>Belirtmek istemiyorum</ToggleButton>
                            </ToggleButtonGroup>
                            <TextField
                                name="email"
                                label="E-posta"
                                placeholder="E-posta adresiniz"
                                value={form.email}
                                onChange={handleChange}
                                fullWidth
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <EmailIcon color="error" />
                                        </InputAdornment>
                                    )
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        backgroundColor: alpha('#fff', 0.7)
                                    }
                                }}
                            />
                            <TextField
                                name="password"
                                label="Şifre"
                                placeholder="Şifreniz"
                                type={showPassword ? 'text' : 'password'}
                                value={form.password}
                                onChange={handleChange}
                                fullWidth
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LockIcon color="error" />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                                {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        backgroundColor: alpha('#fff', 0.7)
                                    }
                                }}
                            />
                            <TextField
                                name="password2"
                                label="Şifre Tekrar"
                                placeholder="Şifrenizi tekrar girin"
                                type={showPassword2 ? 'text' : 'password'}
                                value={form.password2}
                                onChange={handleChange}
                                fullWidth
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LockIcon color="error" />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => setShowPassword2(!showPassword2)} edge="end">
                                                {showPassword2 ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        backgroundColor: alpha('#fff', 0.7)
                                    }
                                }}
                            />
                            <TextField
                                name="phone"
                                label="Telefon"
                                placeholder="05XXXXXXXXXX"
                                value={form.phone}
                                onChange={handleChange}
                                fullWidth
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <PhoneIcon color="error" />
                                        </InputAdornment>
                                    )
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        backgroundColor: alpha('#fff', 0.7)
                                    }
                                }}
                            />
                            <TextField
                                name="university"
                                label="Üniversite"
                                placeholder="Üniversite adınız"
                                value={form.university}
                                onChange={handleChange}
                                fullWidth
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SchoolIcon color="error" />
                                        </InputAdornment>
                                    )
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        backgroundColor: alpha('#fff', 0.7)
                                    }
                                }}
                            />
                            <TextField
                                name="faculty"
                                label="Fakülte"
                                placeholder="Fakülte adınız"
                                value={form.faculty}
                                onChange={handleChange}
                                fullWidth
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <FacultyIcon color="error" />
                                        </InputAdornment>
                                    )
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        backgroundColor: alpha('#fff', 0.7)
                                    }
                                }}
                            />
                            <TextField
                                name="department"
                                label="Bölüm"
                                placeholder="Bölüm adınız"
                                value={form.department}
                                onChange={handleChange}
                                fullWidth
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <DepartmentIcon color="error" />
                                        </InputAdornment>
                                    )
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        backgroundColor: alpha('#fff', 0.7)
                                    }
                                }}
                            />
                            <Typography sx={{ fontWeight: 600, mt: 1 }}>Sınıf</Typography>
                            <ToggleButtonGroup
                                color="error"
                                value={grade}
                                exclusive
                                onChange={handleGrade}
                                fullWidth
                                sx={{ mb: 1 }}
                            >
                                <ToggleButton value="hazırlık" sx={{ flex: 1 }}>Hazırlık</ToggleButton>
                                <ToggleButton value="1" sx={{ flex: 1 }}>1</ToggleButton>
                                <ToggleButton value="2" sx={{ flex: 1 }}>2</ToggleButton>
                                <ToggleButton value="3" sx={{ flex: 1 }}>3</ToggleButton>
                                <ToggleButton value="4" sx={{ flex: 1 }}>4</ToggleButton>
                                <ToggleButton value="5" sx={{ flex: 1 }}>5</ToggleButton>
                                <ToggleButton value="6" sx={{ flex: 1 }}>6</ToggleButton>
                            </ToggleButtonGroup>
                            {error && <Typography color="error" sx={{ fontWeight: 500 }}>{error}</Typography>}
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                disabled={loading}
                                sx={{
                                    mt: 2,
                                    py: 1.5,
                                    borderRadius: 2,
                                    fontWeight: 700,
                                    fontSize: '1.1rem',
                                    background: `linear-gradient(45deg, #ff8a80, #ff5252)`
                                }}
                            >
                                {loading ? 'Kayıt Olunuyor...' : 'Kayıt Ol'}
                            </Button>
                            <Typography align="center" sx={{ mt: 2 }}>
                                Zaten hesabın var mı?{' '}
                                <Button variant="text" color="error" onClick={() => navigate('/login')} sx={{ textTransform: 'none', fontWeight: 600 }}>
                                    Giriş yap
                                </Button>
                            </Typography>
                            <Button variant="text" color="error" sx={{ textTransform: 'none', fontWeight: 500 }}>
                                Şifremi Unuttum
                            </Button>
                        </Stack>
                    </form>
                </Paper>
            </Container>
        </Box>
    );
} 