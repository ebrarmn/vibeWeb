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
    ToggleButton,
    CircularProgress
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
import { userServices, clubServices } from '../services/firestore';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/config';
import PreferenceQuiz, { QuizAnswer } from '../components/PreferenceQuiz';
import { UserPreferences } from '../types/models';
import { aiService } from '../services/aiService';

export default function Register() {
    const theme = useTheme();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showPassword2, setShowPassword2] = useState(false);
    const [gender, setGender] = useState('');
    const [grade, setGrade] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showQuiz, setShowQuiz] = useState(false);
    const [showQuizLoading, setShowQuizLoading] = useState(false);
    const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
    const [recommendation, setRecommendation] = useState<string | null>(null);
    const [quizLoading, setQuizLoading] = useState(false);
    const [quizError, setQuizError] = useState<string | null>(null);
    const [recommendedClubId, setRecommendedClubId] = useState<string | null>(null);
    const [createdUserId, setCreatedUserId] = useState<string | null>(null);

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
        studentNumber: '',
        birthDate: '',
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
        if (!form.displayName || !form.email || !form.password || !form.password2 || !form.studentNumber || !form.birthDate) {
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
            const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
            const uid = userCredential.user.uid;
            setCreatedUserId(uid);
            // 2. Firestore'a kayıt
            const userData: any = {
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
                studentNumber: form.studentNumber,
                birthDate: form.birthDate,
                clubIds: [],
                clubRoles: {},
            };
            if (userPreferences) {
                userData.preferences = userPreferences;
            }
            await userServices.createWithId(uid, userData);
            setShowQuizLoading(true); // Bekleme ekranını göster
            setTimeout(() => {
                setShowQuizLoading(false);
                setShowQuiz(true); // 3 saniye sonra quiz ekranını göster
            }, 4000);
        } catch (err: any) {
            console.error('Gerçek hata:', err);
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

    const handleNotInterested = () => {
        navigate('/homepage');
    };

    const handleQuizComplete = async (answers: QuizAnswer[]) => {
        setQuizLoading(true);
        setQuizError(null);
        setRecommendation(null);
        setRecommendedClubId(null);
        try {
            // 1. Kulüpleri çek
            const clubs = await clubServices.getAll();
            // 2. Prompt hazırla
            const clubList = clubs.map(c => `{"id": "${c.id}", "name": "${c.name}", "desc": "${c.description}"}`).join(',\n');
            const prompt = `
Kullanıcı aşağıdaki sorulara şu cevapları verdi:
${answers.map((a, i) => `${i + 1}. ${a.question} Cevap: ${a.answer}`).join('\n')}

Aşağıda mevcut kulüplerin listesi var. Sadece bu listeden bir kulüp seçebilirsin. Listede olmayan bir kulüp ismi üretme. En uygun olanı seç ve nedenini açıkla. 
Yanıtı, bir danışman gibi, doğrudan kullanıcıya hitap ederek, motive edici ve samimi bir dille yaz. Lafı çok uzun tutma, kısa ve öz olsun. Sanki bilgili bir kişi öneriyormuş gibi konuş. Yanıtı şu formatta ver:
{"clubId": "...", "clubName": "...", "reason": "Bence senin için en uygun kulüp ... Çünkü ..."}
Kulüp listesi:
[${clubList}]
`;
            // 3. OpenAI API'ye gönder
            const completion = await aiService.askGPT(prompt, 400);
            // 4. Yanıtı ayrıştır
            const match = completion.match(/\{[\s\S]*\}/);
            let clubName = '';
            let reason = '';
            let clubId = '';
            if (match) {
                const obj = JSON.parse(match[0]);
                clubName = obj.clubName;
                reason = obj.reason;
                clubId = obj.clubId;
            }
            setRecommendation(clubName ? `${clubName}: ${reason}` : 'Uygun kulüp bulunamadı.');
            setRecommendedClubId(clubId || null);
        } catch (err) {
            setQuizError('Kulüp önerisi alınırken bir hata oluştu.');
        } finally {
            setQuizLoading(false);
        }
    };

    const handleJoinClub = async () => {
        if (!recommendedClubId || !createdUserId) return;
        try {
            // Kullanıcı login değilse login yap
            if (!auth.currentUser) {
                await signInWithEmailAndPassword(auth, form.email, form.password);
            }
            // Kulübe üye ekle (kulüp dokümanı)
            await clubServices.addMember(recommendedClubId, createdUserId, 'member');
            // Kullanıcı dokümanında clubIds ve clubRoles güncelle
            await userServices.joinClub(createdUserId, recommendedClubId, 'member');
            // Anasayfaya yönlendir
            navigate('/homepage');
        } catch (err) {
            setQuizError('Kulübe katılırken bir hata oluştu.');
            console.error('Kulübe katılırken hata:', err);
        }
    };

    if (showQuizLoading) {
        return (
            <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center" sx={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%)' }}>
                <Paper sx={{ p: 5, borderRadius: 6, minWidth: 400, boxShadow: '0 8px 32px 0 rgba(80,120,200,0.10)', textAlign: 'center' }}>
                    <CircularProgress size={48} sx={{ color: '#2563eb', mb: 3 }} />
                    <Typography variant="h5" fontWeight={700} mb={2} color="#2563eb">
                        Kayıt başarıyla oluşturuldu
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                        Sizi test ekranına yönlendiriyoruz...
                    </Typography>
                </Paper>
            </Box>
        );
    }
    if (showQuiz) {
        return (
            <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center" sx={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%)' }}>
                <Paper sx={{ p: 5, borderRadius: 6, minWidth: 400, boxShadow: '0 8px 32px 0 rgba(80,120,200,0.10)' }}>
                    {!recommendation && !quizLoading && !quizError && (
                        <PreferenceQuiz onComplete={handleQuizComplete} />
                    )}
                    {quizLoading && (
                        <Box textAlign="center">
                            <CircularProgress />
                            <Typography mt={2}>Kulüp önerisi hazırlanıyor...</Typography>
                        </Box>
                    )}
                    {recommendation && (
                        <>
                            <Typography variant="h4" fontWeight={700} mb={3} align="center" color="#2563eb">
                                Sizin İçin Önerilen Kulüp
                            </Typography>
                            <Paper sx={{ p: 3, mb: 3, background: '#f1f5f9', borderRadius: 4 }} elevation={0}>
                                <Typography align="center" sx={{ fontSize: 16, fontWeight: 500, mb: 2 }}>{recommendation}</Typography>
                            </Paper>
                            <Box display="flex" gap={2}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                    sx={{ fontWeight: 600, fontSize: 15, borderRadius: 2, py: 1, background: 'linear-gradient(90deg, #2563eb 0%, #60a5fa 100%)', minWidth: 0 }}
                                    onClick={handleJoinClub}
                                    disabled={!recommendedClubId || !createdUserId}
                                >
                                    Kulübe Katıl
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="secondary"
                                    fullWidth
                                    sx={{ fontWeight: 600, fontSize: 15, borderRadius: 2, py: 1, minWidth: 0, borderColor: '#64748b' }}
                                    onClick={handleNotInterested}
                                >
                                    İlgilenmiyorum
                                </Button>
                            </Box>
                        </>
                    )}
                    {quizError && (
                        <Typography color="error" align="center">{quizError}</Typography>
                    )}
                </Paper>
            </Box>
        );
    }

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
                            <TextField
                                name="studentNumber"
                                label="Öğrenci Numarası"
                                placeholder="Öğrenci numaranız"
                                value={form.studentNumber}
                                onChange={handleChange}
                                fullWidth
                                required
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
                            <TextField
                                name="birthDate"
                                label="Doğum Tarihi"
                                placeholder="GG/AA/YYYY"
                                value={form.birthDate}
                                onChange={handleChange}
                                fullWidth
                                required
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