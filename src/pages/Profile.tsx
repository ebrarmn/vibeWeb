import React, { useEffect, useState } from 'react';
import { Box, Typography, Avatar, CircularProgress, Grid, Paper, Divider, Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Snackbar, Alert, MenuItem, Select, InputLabel, FormControl, Tooltip, IconButton } from '@mui/material';
import { userServices, clubServices, eventServices, clubInvitationServices } from '../services/firestore';
import { User, Club, Event, ClubInvitation as ClubInvitationBase } from '../types/models';
import { useOutletContext } from 'react-router-dom';
import { auth, storage } from '../firebase/config';
import { deleteField } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Edit } from '@mui/icons-material';
import { Dialog as MuiDialog } from '@mui/material';

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

type ClubInvitation = ClubInvitationBase & { id: string };

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
    const [leaveDialog, setLeaveDialog] = useState<{open: boolean, club: Club | null}>({open: false, club: null});
    const [leaving, setLeaving] = useState(false);
    const [createClubDialog, setCreateClubDialog] = useState(false);
    const [clubInvitation, setClubInvitation] = useState({ clubName: '' });
    const [userClubInvitations, setUserClubInvitations] = useState<ClubInvitation[]>([]);
    const [creatingClub, setCreatingClub] = useState(false);
    const [pendingInvites, setPendingInvites] = useState<ClubInvitation[]>([]);
    const [inviteLoading, setInviteLoading] = useState<string | null>(null);

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

                    // Kullanıcının kulüp isteklerini çek
                    const invitations = await clubInvitationServices.getBySenderId(currentUser.id);
                    setUserClubInvitations(invitations);
                }
            } catch (error) {
                console.error('Veri çekme hatası:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Kullanıcıya gelen pending davetleri çek
    useEffect(() => {
        const fetchPendingInvites = async () => {
            if (!user) return;
            try {
                const allInvites = await clubInvitationServices.getAll();
                setPendingInvites(allInvites.filter(i => i.receiverId === user.id && i.status === 'pending'));
            } catch (err) {
                // Hata yönetimi
            }
        };
        fetchPendingInvites();
    }, [user]);

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

    // Kulüpten ayrılma işlemi
    const handleLeaveClub = async (club: Club) => {
        if (!user) return;
        setLeaving(true);
        try {
            // 1. Kullanıcıyı kulüpten çıkar
            await userServices.leaveClub(user.id, club.id);
            // 2. Kulübün etkinliklerini bul
            const clubEvents = await eventServices.getByClubId(club.id);
            // 3. Kullanıcı o etkinliklere katıldıysa çıkar
            for (const event of clubEvents) {
                if (event.attendeeIds.includes(user.id)) {
                    await eventServices.removeAttendee(event.id, user.id);
                }
            }
            // 4. State ve arayüzü güncelle
            setClubs(prev => prev.filter(c => c.id !== club.id));
            setUser(prev => prev ? ({
                ...prev,
                clubIds: prev.clubIds.filter(cid => cid !== club.id),
                clubRoles: Object.fromEntries(Object.entries(prev.clubRoles).filter(([k]) => k !== club.id))
            }) : null);
            // Tüm kulüp etkinliklerini kaldır
            setEvents(prev => prev.filter(e => e.clubId !== club.id));
            setSnackbar({open: true, message: 'Kulüpten ve ilgili etkinliklerden ayrıldınız.', severity: 'success'});
        } catch (err) {
            setSnackbar({open: true, message: 'Ayrılırken hata oluştu.', severity: 'error'});
        } finally {
            setLeaving(false);
            setLeaveDialog({open: false, club: null});
        }
    };

    // Kullanıcının katıldığı etkinlikleri ikiye ayır
    const today = new Date();
    const userEvents = events.filter(e => e.attendeeIds.includes(user?.id ?? ''));
    const pastEvents = userEvents.filter(e => new Date(e.endDate) < today);
    const futureEvents = userEvents.filter(e => new Date(e.endDate) >= today);

    const handleCreateClubInvitation = async () => {
        if (!user || !clubInvitation.clubName.trim()) return;
        setCreatingClub(true);
        try {
            await clubInvitationServices.create({
                clubId: '',
                clubName: clubInvitation.clubName.trim(),
                receiverId: '',
                senderId: user.id,
                senderName: user.displayName || '',
            });
            setSnackbar({open: true, message: 'Kulüp kurma isteğiniz başarıyla gönderildi.', severity: 'success'});
            setCreateClubDialog(false);
            setClubInvitation({ clubName: '' });
            // İstekleri yeniden çek
            const invitations = await clubInvitationServices.getBySenderId(user.id);
            setUserClubInvitations(invitations);
        } catch (err) {
            setSnackbar({open: true, message: 'İstek gönderilirken hata oluştu.', severity: 'error'});
        } finally {
            setCreatingClub(false);
        }
    };

    // Daveti onayla
    const handleAcceptInvite = async (invite: ClubInvitation) => {
        setInviteLoading(invite.id);
        try {
            await clubServices.addMember(invite.clubId, user!.id, 'member');
            await userServices.joinClub(user!.id, invite.clubId, 'member');
            await clubInvitationServices.update(invite.id, { status: 'accepted' });
            setPendingInvites(pendingInvites.filter(i => i.id !== invite.id));
            setSnackbar({ open: true, message: 'Davet kabul edildi, kulübe üye oldunuz.', severity: 'success' });
        } catch (err) {
            setSnackbar({ open: true, message: 'Davet kabul edilemedi.', severity: 'error' });
        } finally {
            setInviteLoading(null);
        }
    };

    // Daveti reddet
    const handleRejectInvite = async (invite: ClubInvitation) => {
        setInviteLoading(invite.id);
        try {
            await clubInvitationServices.update(invite.id, { status: 'rejected' });
            setPendingInvites(pendingInvites.filter(i => i.id !== invite.id));
            setSnackbar({ open: true, message: 'Davet reddedildi.', severity: 'success' });
        } catch (err) {
            setSnackbar({ open: true, message: 'Davet reddedilemedi.', severity: 'error' });
        } finally {
            setInviteLoading(null);
        }
    };

    // Davetler UI
    function PendingInvitesList() {
        if (pendingInvites.length === 0) return null;
        return (
            <Paper sx={{ p: 3, borderRadius: 4, mb: 4 }}>
                <Typography variant="h6" fontWeight={700} color="#2563eb" mb={2}>Kulüp Davetleri</Typography>
                {pendingInvites.map(invite => (
                    <Box key={invite.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Box>
                            <Typography fontWeight={600}>{invite.clubName}</Typography>
                            <Typography color="#64748b" fontSize={14}>Kulüp Daveti</Typography>
                        </Box>
                        <Box>
                            <Button variant="contained" color="primary" size="small" sx={{ mr: 1 }} onClick={() => handleAcceptInvite(invite)} disabled={inviteLoading === invite.id}>{inviteLoading === invite.id ? 'İşleniyor...' : 'Onayla'}</Button>
                            <Button variant="outlined" color="error" size="small" onClick={() => handleRejectInvite(invite)} disabled={inviteLoading === invite.id}>Reddet</Button>
                        </Box>
                    </Box>
                ))}
            </Paper>
        );
    }

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
                            position: 'relative'
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
                            {/* Ayrıl butonu */}
                            <Button
                                variant="outlined"
                                color="error"
                                size="small"
                                sx={{ position: 'absolute', top: 12, right: 12, minWidth: 0, px: 1.5, py: 0.5, fontSize: 13, borderRadius: 2, fontWeight: 600 }}
                                onClick={() => setLeaveDialog({open: true, club})}
                                disabled={leaving}
                            >
                                Ayrıl
                            </Button>
                        </Paper>
                    </Grid>
                ))}
            </Grid>
            {/* Ayrıl onay dialogu */}
            <MuiDialog open={leaveDialog.open} onClose={() => setLeaveDialog({open: false, club: null})}>
                <DialogTitle>Kulüpten Ayrıl</DialogTitle>
                <DialogContent>
                    {leaveDialog.club && (
                        <Typography>{leaveDialog.club.name} kulübünden ayrılmak istediğinize emin misiniz? Bu kulübün etkinliklerinden de otomatik olarak ayrılacaksınız.</Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setLeaveDialog({open: false, club: null})} color="primary">İptal</Button>
                    <Button onClick={() => leaveDialog.club && handleLeaveClub(leaveDialog.club)} color="error" variant="contained" disabled={leaving}>Evet, Ayrıl</Button>
                </DialogActions>
            </MuiDialog>

            <Divider sx={{ my: 4 }} />

            {/* Kulüp Etkinlikleri */}
            <Typography variant="h5" fontWeight={700} color="#2563eb" mb={3}>Gelecekte Katılacağım Etkinlikler</Typography>
            <Grid container spacing={3} mb={4}>
                {futureEvents.length === 0 ? (
                    <Grid item xs={12}><Typography color="#64748b">Yaklaşan etkinlik yok.</Typography></Grid>
                ) : futureEvents.map((event) => (
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
            <Typography variant="h5" fontWeight={700} color="#2563eb" mb={3}>Geçmiş Etkinlikler</Typography>
            <Grid container spacing={3} mb={4}>
                {pastEvents.length === 0 ? (
                    <Grid item xs={12}><Typography color="#64748b">Geçmiş etkinlik yok.</Typography></Grid>
                ) : pastEvents.map((event) => (
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
            <PendingInvitesList />
        </Box>
    );
} 