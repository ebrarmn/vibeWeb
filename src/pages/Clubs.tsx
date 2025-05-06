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
    TextField
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Business as BusinessIcon,
    Group as GroupIcon
} from '@mui/icons-material';
import { clubServices, userServices } from '../services/firestore';
import { Club } from '../types/models';
import SearchBar from '../components/SearchBar';

export default function Clubs() {
    const theme = useTheme();
    const [clubs, setClubs] = useState<Club[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [selectedClub, setSelectedClub] = useState<Club | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [memberFilter, setMemberFilter] = useState('all');
    const [userMap, setUserMap] = useState<{ [id: string]: { displayName: string; email: string } }>({});

    const fetchClubs = async () => {
        try {
            const fetchedClubs = await clubServices.getAll();
            setClubs(fetchedClubs);
        } catch (error) {
            console.error('Kulüpler yüklenirken hata oluştu:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClubs();
        userServices.getAll().then(users => {
            const map: { [id: string]: { displayName: string; email: string } } = {};
            users.forEach(u => { map[u.id] = { displayName: u.displayName, email: u.email }; });
            setUserMap(map);
        });
    }, []);

    const filteredClubs = useMemo(() => {
        return clubs.filter(club => {
            const matchesSearch = club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                club.description.toLowerCase().includes(searchTerm.toLowerCase());
            
            if (memberFilter === 'all') return matchesSearch;
            if (memberFilter === 'small') return matchesSearch && club.memberIds.length < 10;
            if (memberFilter === 'medium') return matchesSearch && club.memberIds.length >= 10 && club.memberIds.length < 30;
            if (memberFilter === 'large') return matchesSearch && club.memberIds.length >= 30;
            
            return matchesSearch;
        });
    }, [clubs, searchTerm, memberFilter]);

    const filters = {
        'Üye Sayısı': {
            value: memberFilter,
            options: [
                { value: 'all', label: 'Tümü' },
                { value: 'small', label: 'Az (<10)' },
                { value: 'medium', label: 'Orta (10-30)' },
                { value: 'large', label: 'Çok (>30)' }
            ],
            onChange: setMemberFilter
        }
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedClub(null);
        setFormData({ name: '', description: '' });
    };

    const handleSubmit = async () => {
        try {
            if (selectedClub) {
                await clubServices.update(selectedClub.id, formData);
            } else {
                await clubServices.create({
                    ...formData,
                    memberIds: [],
                    memberRoles: {},
                    eventIds: []
                });
            }
            fetchClubs();
            handleClose();
        } catch (error) {
            console.error('Kulüp kaydedilirken hata oluştu:', error);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await clubServices.delete(id);
            fetchClubs();
        } catch (error) {
            console.error('Kulüp silinirken hata oluştu:', error);
        }
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
                Kulüpler
            </Typography>

            <SearchBar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                placeholder="Kulüp ara..."
                filters={filters}
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 3 }}>
                {filteredClubs.map((club) => (
                    <Card
                        key={club.id}
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
                                    gap: 1
                                }}
                            >
                                <BusinessIcon color="primary" />
                                <Typography variant="h6" component="div">
                                    {club.name}
                                </Typography>
                            </Box>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mb: 2 }}
                            >
                                {club.description}
                            </Typography>
                            <Box
                                sx={{
                                    display: 'flex',
                                    gap: 1,
                                    flexWrap: 'wrap'
                                }}
                            >
                                <Chip
                                    label={`${club.memberIds.length} Üye`}
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                />
                                <Chip
                                    label={`${club.eventIds.length} Etkinlik`}
                                    size="small"
                                    color="secondary"
                                    variant="outlined"
                                />
                            </Box>
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Üyeler:</Typography>
                                {!Array.isArray(club.memberIds) || club.memberIds.length === 0 ? (
                                    <Typography variant="body2" color="text.secondary">Üye yok</Typography>
                                ) : (
                                    club.memberIds
                                        .filter(uid => !!uid && userMap[uid])
                                        .map(uid => (
                                            <Box key={uid} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                                <Typography variant="body2">
                                                    {userMap[uid].displayName}
                                                    {userMap[uid].email ? ` (${userMap[uid].email})` : ''}
                                                    {club.memberRoles && club.memberRoles[uid]
                                                        ? ` - ${club.memberRoles[uid] === 'admin'
                                                            ? 'Yönetici'
                                                            : 'Üye'}`
                                                        : ''}
                                                </Typography>
                                            </Box>
                                        ))
                                )}
                            </Box>
                            <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                <Button
                                    size="small"
                                    startIcon={<EditIcon />}
                                    onClick={() => {
                                        setSelectedClub(club);
                                        setFormData({
                                            name: club.name,
                                            description: club.description
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
                                    onClick={() => handleDelete(club.id)}
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
                    Yeni Kulüp Ekle
                </Button>
            </Box>

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>{selectedClub ? 'Kulübü Düzenle' : 'Yeni Kulüp Ekle'}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Kulüp Adı"
                        fullWidth
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Açıklama"
                        fullWidth
                        multiline
                        rows={4}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>İptal</Button>
                    <Button onClick={handleSubmit} variant="contained">
                        {selectedClub ? 'Güncelle' : 'Ekle'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
} 