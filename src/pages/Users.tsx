import React, { useState, useEffect, useMemo } from 'react';
import {
    Container,
    Typography,
    Box,
    Card,
    CardContent,
    useTheme,
    Chip,
    CircularProgress,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Avatar,
    Checkbox,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Divider,
    FormControl,
    InputLabel,
    MenuItem,
    Select
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Person as PersonIcon,
    Business as BusinessIcon,
    AdminPanelSettings as AdminIcon
} from '@mui/icons-material';
import { userServices, clubServices, eventServices } from '../services/firestore';
import { User, Club, Event } from '../types/models';
import SearchBar from '../components/SearchBar';

export default function Users() {
    const theme = useTheme();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [clubFilter, setClubFilter] = useState('all');
    const [clubMap, setClubMap] = useState<{ [id: string]: string }>({});
    const [manageUser, setManageUser] = useState<User | null>(null);
    const [clubs, setClubs] = useState<Club[]>([]);
    const [formData, setFormData] = useState<{
        displayName: string;
        email: string;
        password: string;
        phone: string;
        birthDate: string;
        gender: string;
        university: string;
        faculty: string;
        department: string;
        grade: string;
        role: 'user' | 'admin';
        clubId: string;
        studentNumber: string;
    }>({
        displayName: '',
        email: '',
        password: '',
        phone: '',
        birthDate: '',
        gender: '',
        university: '',
        faculty: '',
        department: '',
        grade: '',
        role: 'user',
        clubId: '',
        studentNumber: '',
    });
    const [formError, setFormError] = useState<string>('');

    const fetchUsers = async () => {
        try {
            const fetchedUsers = await userServices.getAll();
            setUsers(fetchedUsers);
        } catch (error) {
            console.error('Kullanıcılar yüklenirken hata oluştu:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
        clubServices.getAll().then(clubs => {
            setClubs(clubs);
            const map: { [id: string]: string } = {};
            clubs.forEach(club => { map[club.id] = club.name; });
            setClubMap(map);
        });
    }, []);

    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const matchesSearch = 
                user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.displayName.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesRole = roleFilter === 'all' ? true : user.role === roleFilter;
            
            const matchesClub = 
                clubFilter === 'all' ? true :
                clubFilter === 'with' ? user.clubIds.length > 0 :
                clubFilter === 'without' ? user.clubIds.length === 0 :
                true;

            return matchesSearch && matchesRole && matchesClub;
        });
    }, [users, searchTerm, roleFilter, clubFilter]);

    const filters = {
        'Rol': {
            value: roleFilter,
            options: [
                { value: 'all', label: 'Tümü' },
                { value: 'admin', label: 'Yönetici' },
                { value: 'user', label: 'Kullanıcı' }
            ],
            onChange: setRoleFilter
        },
        'Kulüp Durumu': {
            value: clubFilter,
            options: [
                { value: 'all', label: 'Tümü' },
                { value: 'with', label: 'Kulüp Üyesi' },
                { value: 'without', label: 'Kulüpsüz' }
            ],
            onChange: setClubFilter
        }
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedUser(null);
        setFormData({
            displayName: '',
            email: '',
            password: '',
            phone: '',
            birthDate: '',
            gender: '',
            university: '',
            faculty: '',
            department: '',
            grade: '',
            role: 'user',
            clubId: '',
            studentNumber: '',
        });
    };

    const validateStudentNumber = (num: string): boolean => {
        // Sadece rakam ve 9 hane kontrolü
        return /^\d{9}$/.test(num);
    };

    const handleSubmit = async () => {
        setFormError('');
        if (!formData.displayName || !formData.email || !formData.password || !formData.phone || !formData.birthDate || !formData.gender || !formData.university || !formData.faculty || !formData.department || !formData.grade || !formData.role || !formData.studentNumber) {
            setFormError('Tüm alanları doldurmalısınız.');
            return;
        }
        if (!validateStudentNumber(formData.studentNumber)) {
            setFormError('Öğrenci numarası 9 haneli ve sadece rakamlardan oluşmalıdır.');
            return;
        }
        if (formData.role === 'admin' && !formData.clubId) {
            setFormError('Yönetici için kulüp seçmelisiniz.');
            return;
        }
        try {
            if (selectedUser) {
                await userServices.update(selectedUser.id, {
                    ...formData,
                    role: formData.role,
                });
            } else {
                let newUserId = '';
                if (formData.role === 'admin') {
                    const userObj = {
                        displayName: formData.displayName,
                        email: formData.email,
                        password: formData.password,
                        phone: formData.phone,
                        birthDate: formData.birthDate,
                        gender: formData.gender,
                        university: formData.university,
                        faculty: formData.faculty,
                        department: formData.department,
                        grade: formData.grade,
                        role: 'admin' as const,
                        clubIds: [formData.clubId],
                        clubRoles: { [formData.clubId]: 'admin' as const },
                        studentNumber: formData.studentNumber,
                    };
                    const { password, ...userDataForFirestore } = userObj;
                    newUserId = await userServices.create(userDataForFirestore);
                    await clubServices.addMember(formData.clubId, newUserId, 'admin');
                } else {
                    const userObj = {
                        displayName: formData.displayName,
                        email: formData.email,
                        password: formData.password,
                        phone: formData.phone,
                        birthDate: formData.birthDate,
                        gender: formData.gender,
                        university: formData.university,
                        faculty: formData.faculty,
                        department: formData.department,
                        grade: formData.grade,
                        role: 'user' as const,
                        clubIds: [],
                        clubRoles: {},
                        studentNumber: formData.studentNumber,
                    };
                    const { password, ...userDataForFirestore } = userObj;
                    await userServices.create(userDataForFirestore);
                }
            }
            fetchUsers();
            handleClose();
        } catch (error) {
            setFormError('Kullanıcı kaydedilirken hata oluştu.');
            console.error('Kullanıcı kaydedilirken hata oluştu:', error);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await userServices.delete(id);
            fetchUsers();
        } catch (error) {
            console.error('Kullanıcı silinirken hata oluştu:', error);
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase();
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography
                variant="h4"
                sx={{
                    mb: 4,
                    fontWeight: 'bold',
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    backgroundClip: 'text',
                    textFillColor: 'transparent',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}
            >
                Kullanıcılar
            </Typography>

            <SearchBar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                placeholder="Kullanıcı ara..."
                filters={filters}
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 3 }}>
                {filteredUsers.map((user) => (
                    <Card
                        key={user.id}
                        sx={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            transition: 'transform 0.3s, box-shadow 0.3s',
                            '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: theme.shadows[4]
                            }
                        }}
                        onClick={() => setManageUser(user)}
                    >
                        <CardContent>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    mb: 2,
                                    gap: 2
                                }}
                            >
                                <Avatar
                                    sx={{
                                        bgcolor: theme.palette.primary.main,
                                        width: 48,
                                        height: 48
                                    }}
                                >
                                    {getInitials(user.displayName)}
                                </Avatar>
                                <Box>
                                    <Typography variant="h6" component="div">
                                        {user.displayName}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {user.email}
                                    </Typography>
                                </Box>
                            </Box>
                            <Box
                                sx={{
                                    display: 'flex',
                                    gap: 1,
                                    flexWrap: 'wrap',
                                    mb: 2
                                }}
                            >
                                <Chip
                                    icon={user.role === 'admin' ? <AdminIcon /> : <PersonIcon />}
                                    label={user.role === 'admin' ? 'Yönetici' : 'Kullanıcı'}
                                    size="small"
                                    color={user.role === 'admin' ? 'secondary' : 'primary'}
                                    variant="outlined"
                                />
                                <Chip
                                    icon={<BusinessIcon />}
                                    label={user.clubIds.length === 0 ? 'Kulüp Yok' : user.clubIds.map(id => clubMap[id]).filter(Boolean).join(', ')}
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                />
                            </Box>
                            <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                <Button
                                    size="small"
                                    startIcon={<EditIcon />}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedUser(user);
                                        setFormData({
                                            displayName: user.displayName,
                                            email: user.email,
                                            password: '',
                                            phone: user.phone,
                                            birthDate: user.birthDate,
                                            gender: user.gender,
                                            university: user.university,
                                            faculty: user.faculty,
                                            department: user.department,
                                            grade: user.grade,
                                            role: user.role,
                                            clubId: user.clubIds.length > 0 ? user.clubIds[0] : '',
                                            studentNumber: user.studentNumber,
                                        });
                                        setOpen(true);
                                    }}
                                >
                                    Düzenle
                                </Button>
                                <Button
                                    size="small"
                                    color="error"
                                    startIcon={<DeleteIcon />}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(user.id);
                                    }}
                                >
                                    Sil
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                ))}
            </Box>

            <Box display="flex" justifyContent="flex-end" mt={3}>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpen(true)}
                    sx={{
                        background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        color: 'white',
                        '&:hover': {
                            background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`
                        }
                    }}
                >
                    Yeni Kullanıcı Ekle
                </Button>
            </Box>

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>{selectedUser ? 'Kullanıcıyı Düzenle' : 'Yeni Kullanıcı Ekle'}</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        label="Ad Soyad"
                        fullWidth
                        value={formData.displayName}
                        onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="E-posta"
                        type="email"
                        fullWidth
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Şifre"
                        type="password"
                        fullWidth
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Telefon"
                        fullWidth
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Doğum Tarihi"
                        type="date"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        value={formData.birthDate}
                        onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    />
                    <FormControl fullWidth margin="dense">
                        <InputLabel>Cinsiyet</InputLabel>
                        <Select
                            value={formData.gender}
                            label="Cinsiyet"
                            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        >
                            <MenuItem value="Kadın">Kadın</MenuItem>
                            <MenuItem value="Erkek">Erkek</MenuItem>
                            <MenuItem value="Belirtmek istemiyorum">Belirtmek istemiyorum</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField
                        margin="dense"
                        label="Üniversite"
                        fullWidth
                        value={formData.university}
                        onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Fakülte"
                        fullWidth
                        value={formData.faculty}
                        onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Bölüm"
                        fullWidth
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Sınıf"
                        fullWidth
                        value={formData.grade}
                        onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    />
                    <FormControl fullWidth margin="dense">
                        <InputLabel>Rol</InputLabel>
                        <Select
                            value={formData.role}
                            label="Rol"
                            onChange={(e) => setFormData({ ...formData, role: e.target.value as 'user' | 'admin', clubId: '' })}
                        >
                            <MenuItem value="user">Kullanıcı</MenuItem>
                            <MenuItem value="admin">Yönetici</MenuItem>
                        </Select>
                    </FormControl>
                    {formData.role === 'admin' && (
                        <FormControl fullWidth margin="dense">
                            <InputLabel>Kulüp</InputLabel>
                            <Select
                                value={formData.clubId}
                                label="Kulüp"
                                onChange={(e) => setFormData({ ...formData, clubId: e.target.value })}
                            >
                                {clubs.map(club => (
                                    <MenuItem key={club.id} value={club.id}>{club.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}
                    <TextField
                        margin="dense"
                        label="Öğrenci Numarası"
                        fullWidth
                        value={formData.studentNumber}
                        onChange={(e) => setFormData({ ...formData, studentNumber: e.target.value })}
                        inputProps={{ maxLength: 9 }}
                    />
                    {formError && <Typography color="error" variant="body2">{formError}</Typography>}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>İptal</Button>
                    <Button onClick={handleSubmit} variant="contained">
                        {selectedUser ? 'Güncelle' : 'Ekle'}
                    </Button>
                </DialogActions>
            </Dialog>

            <UserManageModal
                open={!!manageUser}
                user={manageUser}
                onClose={() => setManageUser(null)}
                onUpdated={fetchUsers}
            />
        </Container>
    );
}

function UserManageModal({ open, onClose, user, onUpdated }: {
    open: boolean;
    onClose: () => void;
    user: User | null;
    onUpdated: () => void;
}) {
    const [clubs, setClubs] = useState<Club[]>([]);
    const [events, setEvents] = useState<Event[]>([]);
    const [selectedClubs, setSelectedClubs] = useState<string[]>([]);
    const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        setLoading(true);
        Promise.all([
            clubServices.getAll(),
            eventServices.getAll()
        ]).then(([clubs, events]) => {
            setClubs(clubs);
            setEvents(events);
            setSelectedClubs(user.clubIds || []);
            // Kullanıcının kulüplerine ait etkinliklerden katıldıkları
            const userEventIds = events.filter(e => user.clubIds.includes(e.clubId) && e.attendeeIds.includes(user.id)).map(e => e.id);
            setSelectedEvents(userEventIds);
        }).finally(() => setLoading(false));
    }, [user]);

    if (!user) return null;

    // Kulüp ekle/çıkar işlemi
    const handleClubToggle = async (clubId: string) => {
        if (selectedClubs.includes(clubId)) {
            await userServices.leaveClub(user.id, clubId);
            setSelectedClubs(selectedClubs.filter(id => id !== clubId));
        } else {
            await userServices.joinClub(user.id, clubId, 'member');
            setSelectedClubs([...selectedClubs, clubId]);
        }
        onUpdated();
    };

    // Etkinlik ekle/çıkar işlemi
    const handleEventToggle = async (eventId: string) => {
        if (selectedEvents.includes(eventId)) {
            await eventServices.removeAttendee(eventId, user.id);
            setSelectedEvents(selectedEvents.filter(id => id !== eventId));
        } else {
            await eventServices.registerAttendee(eventId, user.id);
            setSelectedEvents([...selectedEvents, eventId]);
        }
        onUpdated();
    };

    // Kullanıcının kulüplerine ait etkinlikler
    const userClubsEvents = events.filter(e => selectedClubs.includes(e.clubId));

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Kullanıcı Yönetimi: {user.displayName}</DialogTitle>
            <DialogContent>
                <Typography variant="subtitle1" sx={{ mt: 1, mb: 1 }}>Kulüp Atama/Çıkarma</Typography>
                <List dense>
                    {clubs.map(club => (
                        <ListItem key={club.id} button onClick={() => handleClubToggle(club.id)}>
                            <Checkbox
                                edge="start"
                                checked={selectedClubs.includes(club.id)}
                                tabIndex={-1}
                                disableRipple
                            />
                            <ListItemText primary={club.name} secondary={club.description} />
                        </ListItem>
                    ))}
                </List>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" sx={{ mt: 1, mb: 1 }}>Etkinlik Atama/Çıkarma</Typography>
                <List dense>
                    {userClubsEvents.length === 0 && <Typography variant="body2">Kullanıcının kulüplerine ait etkinlik yok.</Typography>}
                    {userClubsEvents.map(event => (
                        <ListItem key={event.id} button onClick={() => handleEventToggle(event.id)}>
                            <Checkbox
                                edge="start"
                                checked={selectedEvents.includes(event.id)}
                                tabIndex={-1}
                                disableRipple
                            />
                            <ListItemText primary={event.title} secondary={event.location} />
                        </ListItem>
                    ))}
                </List>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Kapat</Button>
            </DialogActions>
        </Dialog>
    );
} 