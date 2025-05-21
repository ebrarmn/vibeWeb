import React, { useEffect, useState } from 'react';
import { Box, Typography, Avatar, CircularProgress, Grid, Paper, Divider, Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Snackbar, Alert, MenuItem, Select, InputLabel, FormControl, Tooltip, IconButton } from '@mui/material';
import { userServices, clubServices, eventServices } from '../services/firestore';
import { User, Club, Event } from '../types/models';
import { useOutletContext } from 'react-router-dom';
import { auth, storage } from '../firebase/config';
import { deleteField } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Edit } from '@mui/icons-material';

const GENDER_OPTIONS = [
    { value: 'female', label: 'Kız' },
    { value: 'male', label: 'Erkek' },
    { value: 'other', label: 'Belirtmek istemiyorum' }
];
const GRADE_OPTIONS = [
    { value: 'hazırlık', label: 'Hazırlık' },
    { value: '1', label: '1' },
    { value: '2', label: '2' },
    { value: '3', label: '3' },
    { value: '4', label: '4' },
    { value: '5', label: '5' },
    { value: '6', label: '6' }
];

interface LayoutContext {
    collapsed: boolean;
    drawerWidth: number;
}

// NOT: Eğer collapse state'i globalde tutulursa dinamik yapılabilir. Şimdilik sabit 220px marginLeft ile çözülüyor.

// Alan adlarını Türkçe başlıklarla eşleştir
const FIELD_LABELS: Record<string, string> = {
    displayName: 'Ad Soyad',
    phone: 'Telefon',
    birthDate: 'Doğum Tarihi',
    university: 'Üniversite',
    faculty: 'Fakülte',
    department: 'Bölüm',
    grade: 'Sınıf',
    gender: 'Cinsiyet',
    studentNumber: 'Öğrenci No',
    email: 'E-posta',
    photoURL: 'Profil Fotoğrafı',
    role: 'Rol',
    attendingEvents: 'Katıldığı Etkinlikler',
};
// Gösterilecek ve sıralanacak alanlar
const FIELD_ORDER = [
    'displayName', 'email', 'phone', 'studentNumber', 'birthDate',
    'gender', 'university', 'faculty', 'department', 'grade'
];

// Sol ve sağ sütun alanları
const LEFT_FIELDS = ['displayName', 'email', 'phone', 'gender', 'birthDate'];
const RIGHT_FIELDS = ['studentNumber', 'university', 'faculty', 'department', 'grade'];

export default function Profile() {
    const [user, setUser] = useState<User | null>(null);
    const [clubs, setClubs] = useState<Club[]>([]);
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [editOpen, setEditOpen] = useState(false);
    const [editForm, setEditForm] = useState<any>({});
    const [saving, setSaving] = useState(false);
    const [snackbar, setSnackbar] = useState<{open: boolean, message: string, severity: 'success'|'error'}>({open: false, message: '', severity: 'success'});
    const { drawerWidth } = useOutletContext<LayoutContext>();
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Kullanıcı bilgilerini çek
                const users = await userServices.getAll();
                const currentEmail = auth.currentUser?.email;
                const currentUser = users.find(u => u.email === currentEmail);
                setUser(currentUser || null);

                if (currentUser) {
                    // Kullanıcının kulüplerini çek
                    const allClubs = await clubServices.getAll();
                    const userClubs = allClubs.filter(club => currentUser.clubIds?.includes(club.id));
                    setClubs(userClubs);

                    // Kulüplerin etkinliklerini çek
                    const allEvents = await eventServices.getAll();
                    const clubEvents = allEvents.filter(event => 
                        userClubs.some(club => club.id === event.clubId)
                    );
                    setEvents(clubEvents);
                }
            } catch (error) {
                console.error('Veri çekme hatası:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleEditOpen = () => {
        if (user) {
            setEditForm({ ...user });
            setEditOpen(true);
        }
    };
    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
        const { name, value } = e.target;
        setEditForm((prev: any) => ({ ...prev, [name!]: value }));
    };
    const handleEditSelect = (name: string, value: string) => {
        setEditForm((prev: any) => ({ ...prev, [name]: value }));
    };
    const handleEditSave = async () => {
        if (!user) return;
        setSaving(true);
        // Firestore'a gönderilecek güncelleme objesi
        const updateData: any = {};
        Object.keys(editForm).forEach(key => {
            // clubIds, clubRoles, createdAt, updatedAt gibi alanları atla
            if (["id", "clubIds", "clubRoles", "createdAt", "updatedAt"].includes(key)) return;
            // Eğer alan boşsa Firestore'dan sil
            if (editForm[key] === "") {
                updateData[key] = deleteField();
            } else {
                updateData[key] = editForm[key];
            }
        });
        try {
            await userServices.update(user.id, updateData);
            setUser({ ...user, ...editForm } as User);
            setSnackbar({open: true, message: 'Profil başarıyla güncellendi.', severity: 'success'});
            setEditOpen(false);
        } catch (err) {
            setSnackbar({open: true, message: 'Profil güncellenirken hata oluştu.', severity: 'error'});
        } finally {
            setSaving(false);
        }
    };

    // Profil fotoğrafı yükleme fonksiyonu
    const handleAvatarClick = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async (e: any) => {
            const file = e.target.files[0];
            if (!file || !user) return;
            setUploading(true);
            try {
                const storageRef = ref(storage, `profileImages/${user.id}_${Date.now()}`);
                await uploadBytes(storageRef, file);
                const url = await getDownloadURL(storageRef);
                await userServices.update(user.id, { photoURL: url });
                setUser({ ...user, photoURL: url });
                setSnackbar({open: true, message: 'Profil fotoğrafı güncellendi.', severity: 'success'});
            } catch (err) {
                setSnackbar({open: true, message: 'Fotoğraf yüklenirken hata oluştu.', severity: 'error'});
            } finally {
                setUploading(false);
            }
        };
        input.click();
    };

    if (loading) {
        return <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh"><CircularProgress /></Box>;
    }
    if (!user) {
        return <Typography>Kullanıcı bulunamadı.</Typography>;
    }

    return (
        <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', width: '100%', py: 6, px: { xs: 2, md: 8 }, marginLeft: `${drawerWidth}px`, paddingLeft: { xs: 2, md: 5 }, transition: 'margin-left 0.2s, padding-left 0.2s' }}>
            {/* Kullanıcı Profil Bilgileri */}
            <Box display="flex" alignItems="center" mb={4} flexWrap="wrap">
                <Box sx={{ position: 'relative', mr: 3 }}>
                    <Avatar
                        src={user.photoURL || undefined}
                        sx={{ width: 80, height: 80, bgcolor: '#3a8dde', color: '#fff', fontWeight: 700, cursor: 'pointer', border: uploading ? '2px solid #2563eb' : undefined }}
                        onClick={handleAvatarClick}
                    >
                        {!user.photoURL && (user.displayName?.[0] || '?')}
                    </Avatar>
                    {uploading && (
                        <Box sx={{ position: 'absolute', top: 0, left: 0, width: 80, height: 80, bgcolor: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                            <CircularProgress size={32} />
                        </Box>
                    )}
                </Box>
                <Box>
                    <Typography variant="h4" fontWeight={700} color="#2563eb">{user.displayName}</Typography>
                    <Tooltip title="Profili Düzenle" arrow>
                        <IconButton
                            color="primary"
                            size="small"
                            onClick={handleEditOpen}
                            sx={{
                                mt: 1.5,
                                ml: 0.5,
                                borderRadius: 4,
                                transition: 'transform 0.18s cubic-bezier(.4,2,.6,1), box-shadow 0.18s',
                                boxShadow: 'none',
                                background: '#1452ce',
                                '&:hover': {
                                    background: '#3c47d8',
                                    transform: 'scale(1.1)',
                                    boxShadow: '0 2px 8px 0 rgba(1, 39, 165, 0.63)'
                                }
                            }}
                        >
                            <Edit fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>
            {/* Bilgileri iki sütuna böl */}
            <Grid container spacing={2} mb={4}>
                <Grid item xs={12} md={6}>
                    {LEFT_FIELDS.map(key => (
                        <Typography color="#1e293b" fontWeight={600} mb={1} key={key}>
                            <b>{FIELD_LABELS[key] || key}:</b>{' '}
                            <span style={{ fontWeight: 400, color: '#334155' }}>
                                {key === 'gender'
                                    ? (GENDER_OPTIONS.find(opt => opt.value === user[key])?.label || '')
                                    : String(user[key] ?? '')}
                            </span>
                        </Typography>
                    ))}
                </Grid>
                <Grid item xs={12} md={6}>
                    {RIGHT_FIELDS.map(key => (
                        <Typography color="#1e293b" fontWeight={600} mb={1} key={key}>
                            <b>{FIELD_LABELS[key] || key}:</b>{' '}
                            <span style={{ fontWeight: 400, color: '#334155' }}>{String(user[key] ?? '')}</span>
                        </Typography>
                    ))}
                </Grid>
            </Grid>
            {/* Düzenleme Dialogu */}
            <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
                <DialogTitle>Profili Düzenle</DialogTitle>
                <DialogContent>
                    <Box component="form" sx={{ mt: 1, minWidth: 320 }}>
                        {FIELD_ORDER.map(key => {
                            if (key === 'gender') {
                                return (
                                    <FormControl fullWidth margin="normal" key={key}>
                                        <InputLabel id="gender-label">Cinsiyet</InputLabel>
                                        <Select
                                            labelId="gender-label"
                                            name="gender"
                                            value={editForm.gender ?? ''}
                                            label="Cinsiyet"
                                            onChange={e => handleEditSelect('gender', e.target.value as string)}
                                        >
                                            <MenuItem value="female">Kız</MenuItem>
                                            <MenuItem value="male">Erkek</MenuItem>
                                            <MenuItem value="other">Belirtmek istemiyorum</MenuItem>
                                        </Select>
                                    </FormControl>
                                );
                            }
                            if (key === 'grade') {
                                return (
                                    <FormControl fullWidth margin="normal" key={key}>
                                        <InputLabel id="grade-label">Sınıf</InputLabel>
                                        <Select
                                            labelId="grade-label"
                                            name="grade"
                                            value={editForm.grade ?? ''}
                                            label="Sınıf"
                                            onChange={e => handleEditSelect('grade', e.target.value as string)}
                                        >
                                            <MenuItem value="hazırlık">Hazırlık</MenuItem>
                                            <MenuItem value="1">1</MenuItem>
                                            <MenuItem value="2">2</MenuItem>
                                            <MenuItem value="3">3</MenuItem>
                                            <MenuItem value="4">4</MenuItem>
                                            <MenuItem value="5">5</MenuItem>
                                            <MenuItem value="6">6</MenuItem>
                                        </Select>
                                    </FormControl>
                                );
                            }
                            if (key === 'email') {
                                return (
                                    <TextField
                                        key={key}
                                        margin="normal"
                                        fullWidth
                                        label={FIELD_LABELS[key] || key}
                                        name={key}
                                        value={editForm[key] ?? ''}
                                        InputProps={{ readOnly: true }}
                                    />
                                );
                            }
                            if (key === 'birthDate') {
                                return (
                                    <TextField
                                        key={key}
                                        margin="normal"
                                        fullWidth
                                        label={FIELD_LABELS[key] || key}
                                        name={key}
                                        type="date"
                                        value={editForm[key] ?? ''}
                                        onChange={handleEditChange}
                                        InputLabelProps={{ shrink: true }}
                                    />
                                );
                            }
                            return (
                                <TextField
                                    key={key}
                                    margin="normal"
                                    fullWidth
                                    label={FIELD_LABELS[key] || key}
                                    name={key}
                                    value={editForm[key] ?? ''}
                                    onChange={handleEditChange}
                                />
                            );
                        })}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditOpen(false)} color="secondary">İptal</Button>
                    <Button onClick={handleEditSave} color="primary" variant="contained" disabled={saving}>
                        Kaydet
                    </Button>
                </DialogActions>
            </Dialog>
            <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>

            <Divider sx={{ my: 4 }} />

            {/* Üye Olunan Kulüpler */}
            <Typography variant="h5" fontWeight={700} color="#2563eb" mb={3}>Üye Olduğum Kulüpler</Typography>
            <Grid container spacing={3} mb={4}>
                {clubs.map((club) => (
                    <Grid item xs={12} sm={6} md={4} key={club.id}>
                        <Paper elevation={0} sx={{
                            p: 3,
                            borderRadius: 4,
                            bgcolor: 'rgba(255,255,255,0.75)',
                            boxShadow: '0 4px 24px 0 rgba(80,120,200,0.10)',
                            transition: 'box-shadow 0.2s, background 0.2s',
                            '&:hover': {
                                boxShadow: '0 8px 32px 0 rgba(80,120,200,0.18)',
                                bgcolor: 'rgba(222,242,255,0.85)',
                            },
                        }}>
                            <Typography variant="h6" fontWeight={700} color="#2563eb" gutterBottom>
                                {club.name}
                            </Typography>
                            <Typography variant="body2" color="#334155" paragraph>
                                {club.description}
                            </Typography>
                            <Chip 
                                label={user.clubRoles?.[club.id] === 'admin' ? 'Yönetici' : 'Üye'} 
                                color={user.clubRoles?.[club.id] === 'admin' ? 'primary' : 'default'}
                                size="small"
                            />
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            <Divider sx={{ my: 4 }} />

            {/* Kulüp Etkinlikleri */}
            <Typography variant="h5" fontWeight={700} color="#2563eb" mb={3}>Kulüp Etkinlikleri</Typography>
            <Grid container spacing={3}>
                {events.map((event) => (
                    <Grid item xs={12} sm={6} md={4} key={event.id}>
                        <Paper elevation={0} sx={{
                            p: 3,
                            borderRadius: 4,
                            bgcolor: 'rgba(255,255,255,0.75)',
                            boxShadow: '0 4px 24px 0 rgba(80,120,200,0.10)',
                            transition: 'box-shadow 0.2s, background 0.2s',
                            '&:hover': {
                                boxShadow: '0 8px 32px 0 rgba(80,120,200,0.18)',
                                bgcolor: 'rgba(222,242,255,0.85)',
                            },
                        }}>
                            <Typography variant="subtitle2" fontWeight={700} color="#e11d48" gutterBottom>
                                {clubs.find(c => c.id === event.clubId)?.name}
                            </Typography>
                            <Typography variant="h6" fontWeight={800} color="#2563eb" gutterBottom>
                                {event.title}
                            </Typography>
                            <Typography variant="body2" color="#334155" paragraph>
                                {event.description}
                            </Typography>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="caption" color="#64748b">
                                    {new Date(event.startDate).toLocaleDateString()}
                                </Typography>
                                <Typography variant="caption" color="#64748b">
                                    {event.location}
                                </Typography>
                            </Box>
                        </Paper>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
} 