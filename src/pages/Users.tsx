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
    Avatar
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Person as PersonIcon,
    Business as BusinessIcon,
    AdminPanelSettings as AdminIcon
} from '@mui/icons-material';
import { userServices } from '../services/firestore';
import { User } from '../types/models';
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

    const [formData, setFormData] = useState({
        email: '',
        displayName: '',
        role: 'user' as 'admin' | 'user'
    });

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
            email: '',
            displayName: '',
            role: 'user'
        });
    };

    const handleSubmit = async () => {
        try {
            if (selectedUser) {
                await userServices.update(selectedUser.id, {
                    ...formData,
                    role: formData.role as 'admin' | 'user'
                });
            } else {
                await userServices.create({
                    ...formData,
                    role: formData.role as 'admin' | 'user',
                    clubIds: []
                });
            }
            fetchUsers();
            handleClose();
        } catch (error) {
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
                                    label={`${user.clubIds.length} Kulüp`}
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                />
                            </Box>
                            <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                <Button
                                    size="small"
                                    startIcon={<EditIcon />}
                                    onClick={() => {
                                        setSelectedUser(user);
                                        setFormData({
                                            email: user.email,
                                            displayName: user.displayName,
                                            role: user.role
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
                                    onClick={() => handleDelete(user.id)}
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
                        autoFocus
                        margin="dense"
                        label="E-posta"
                        type="email"
                        fullWidth
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Ad Soyad"
                        fullWidth
                        value={formData.displayName}
                        onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    />
                    <TextField
                        select
                        margin="dense"
                        label="Rol"
                        fullWidth
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'user' })}
                        SelectProps={{
                            native: true
                        }}
                    >
                        <option value="user">Kullanıcı</option>
                        <option value="admin">Yönetici</option>
                    </TextField>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>İptal</Button>
                    <Button onClick={handleSubmit} variant="contained">
                        {selectedUser ? 'Güncelle' : 'Ekle'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
} 