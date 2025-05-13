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
    Paper,
    IconButton,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    List,
    ListItem,
    ListItemButton,
    ListItemAvatar,
    Avatar,
    Divider,
    InputAdornment,
    FormControl,
    Select
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Business as BusinessIcon,
    Group as GroupIcon,
    Event as EventIcon,
    LocationOn as LocationIcon,
    CalendarMonth as CalendarIcon,
    MoreVert as MoreVertIcon
} from '@mui/icons-material';
import { clubServices, userServices, eventServices } from '../services/firestore';
import { Club, Event } from '../types/models';
import SearchBar from '../components/SearchBar';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';

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
    const [events, setEvents] = useState<Event[]>([]);
    const [eventMenuAnchor, setEventMenuAnchor] = useState<null | HTMLElement>(null);
    const [memberMenuAnchor, setMemberMenuAnchor] = useState<null | HTMLElement>(null);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [selectedMember, setSelectedMember] = useState<{ id: string; clubId: string } | null>(null);
    const [eventSearchTerm, setEventSearchTerm] = useState<{ [clubId: string]: string }>({});
    const [memberSearchTerm, setMemberSearchTerm] = useState<{ [clubId: string]: string }>({});
    const [memberRoleFilter, setMemberRoleFilter] = useState('all');

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
        Promise.all([
            userServices.getAll(),
            eventServices.getAll()
        ]).then(([users, fetchedEvents]) => {
            const map: { [id: string]: { displayName: string; email: string } } = {};
            users.forEach(u => { map[u.id] = { displayName: u.displayName, email: u.email }; });
            setUserMap(map);
            setEvents(fetchedEvents);
        });
    }, []);

    const formatEventDate = (date: Date | string | null): string => {
        if (!date) return '';
        try {
            const parsedDate = typeof date === 'string' ? parseISO(date) : date;
            return format(parsedDate, 'dd MMMM yyyy HH:mm', { locale: tr });
        } catch (error) {
            console.error('Tarih formatlanırken hata oluştu:', error);
            return '';
        }
    };

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

    const handleEventMenuOpen = (event: React.MouseEvent<HTMLElement>, eventData: Event) => {
        setEventMenuAnchor(event.currentTarget);
        setSelectedEvent(eventData);
    };

    const handleEventMenuClose = () => {
        setEventMenuAnchor(null);
        setSelectedEvent(null);
    };

    const handleMemberMenuOpen = (event: React.MouseEvent<HTMLElement>, memberId: string, clubId: string) => {
        setMemberMenuAnchor(event.currentTarget);
        setSelectedMember({ id: memberId, clubId });
    };

    const handleMemberMenuClose = () => {
        setMemberMenuAnchor(null);
        setSelectedMember(null);
    };

    const handleDeleteEvent = async () => {
        if (selectedEvent) {
            try {
                await eventServices.delete(selectedEvent.id);
                const updatedEvents = events.filter(e => e.id !== selectedEvent.id);
                setEvents(updatedEvents);
                handleEventMenuClose();
            } catch (error) {
                console.error('Etkinlik silinirken hata oluştu:', error);
            }
        }
    };

    const handleRemoveMember = async () => {
        if (selectedMember) {
            try {
                await userServices.leaveClub(selectedMember.id, selectedMember.clubId);
                const updatedClubs = clubs.map(club => {
                    if (club.id === selectedMember.clubId) {
                        const { [selectedMember.id]: removedRole, ...remainingRoles } = club.memberRoles;
                        return {
                            ...club,
                            memberIds: club.memberIds.filter(id => id !== selectedMember.id),
                            memberRoles: remainingRoles
                        };
                    }
                    return club;
                });
                setClubs(updatedClubs);
                handleMemberMenuClose();
            } catch (error) {
                console.error('Üye kulüpten çıkarılırken hata oluştu:', error);
            }
        }
    };

    const filteredClubEvents = (clubId: string, events: Event[]) => {
        const searchTerm = eventSearchTerm[clubId] || '';
        return events
            .filter(event => event.clubId === clubId)
            .filter(event => 
                event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                event.location.toLowerCase().includes(searchTerm.toLowerCase())
            );
    };

    const filteredClubMembers = (club: Club) => {
        const searchTerm = memberSearchTerm[club.id] || '';
        return club.memberIds
            .filter(uid => !!uid && userMap[uid])
            .filter(uid => 
                userMap[uid].displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                userMap[uid].email.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .filter(uid => {
                if (memberRoleFilter === 'all') return true;
                if (memberRoleFilter === 'admin') return club.memberRoles && club.memberRoles[uid] === 'admin';
                if (memberRoleFilter === 'member') return !club.memberRoles || club.memberRoles[uid] !== 'admin';
                return true;
            });
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
                {filteredClubs.map((club) => {
                    const clubEvents = events.filter(event => event.clubId === club.id);
                    return (
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
                                        flexWrap: 'wrap',
                                        mb: 2
                                    }}
                                >
                                    <Chip
                                        icon={<GroupIcon />}
                                        label={`${club.memberIds.length} Üye`}
                                        size="small"
                                        color="primary"
                                        variant="outlined"
                                    />
                                    <Chip
                                        icon={<EventIcon />}
                                        label={`${clubEvents.length} Etkinlik`}
                                        size="small"
                                        color="secondary"
                                        variant="outlined"
                                    />
                                </Box>

                                {clubEvents.length > 0 && (
                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>Etkinlikler:</Typography>
                                        <TextField
                                            size="small"
                                            placeholder="Etkinlik ara..."
                                            fullWidth
                                            value={eventSearchTerm[club.id] || ''}
                                            onChange={(e) => setEventSearchTerm({ ...eventSearchTerm, [club.id]: e.target.value })}
                                            sx={{ mb: 1 }}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <EventIcon fontSize="small" />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                        <List dense>
                                            {filteredClubEvents(club.id, events).map(event => (
                                                <ListItem
                                                    key={event.id}
                                                    disablePadding
                                                    secondaryAction={
                                                        <IconButton
                                                            edge="end"
                                                            size="small"
                                                            onClick={(e) => handleEventMenuOpen(e, event)}
                                                        >
                                                            <MoreVertIcon fontSize="small" />
                                                        </IconButton>
                                                    }
                                                >
                                                    <ListItemButton>
                                                        <ListItemText
                                                            primary={event.title}
                                                            secondary={
                                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                        <LocationIcon fontSize="small" color="action" />
                                                                        <Typography variant="caption">{event.location}</Typography>
                                                                    </Box>
                                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                        <CalendarIcon fontSize="small" color="action" />
                                                                        <Typography variant="caption">
                                                                            {formatEventDate(event.startDate)}
                                                                        </Typography>
                                                                    </Box>
                                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                        <GroupIcon fontSize="small" color="action" />
                                                                        <Typography variant="caption">
                                                                            {event.attendeeIds.length}/{event.capacity} Katılımcı
                                                                        </Typography>
                                                                    </Box>
                                                                </Box>
                                                            }
                                                        />
                                                    </ListItemButton>
                                                </ListItem>
                                            ))}
                                        </List>
                                    </Box>
                                )}

                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>Üyeler:</Typography>
                                    {!Array.isArray(club.memberIds) || club.memberIds.length === 0 ? (
                                        <Typography variant="body2" color="text.secondary">Üye yok</Typography>
                                    ) : (
                                        <>
                                            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                                                <TextField
                                                    size="small"
                                                    placeholder="Üye ara..."
                                                    fullWidth
                                                    value={memberSearchTerm[club.id] || ''}
                                                    onChange={(e) => setMemberSearchTerm({ ...memberSearchTerm, [club.id]: e.target.value })}
                                                    InputProps={{
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <GroupIcon fontSize="small" />
                                                            </InputAdornment>
                                                        ),
                                                    }}
                                                />
                                                <FormControl size="small" sx={{ minWidth: 120 }}>
                                                    <Select
                                                        value={memberRoleFilter}
                                                        onChange={(e) => setMemberRoleFilter(e.target.value)}
                                                        displayEmpty
                                                    >
                                                        <MenuItem value="all">Tüm Roller</MenuItem>
                                                        <MenuItem value="admin">Başkanlar</MenuItem>
                                                        <MenuItem value="member">Üyeler</MenuItem>
                                                    </Select>
                                                </FormControl>
                                            </Box>
                                            <List dense>
                                                {filteredClubMembers(club).map(uid => (
                                                    <ListItem
                                                        key={uid}
                                                        disablePadding
                                                        secondaryAction={
                                                            <IconButton
                                                                edge="end"
                                                                size="small"
                                                                onClick={(e) => handleMemberMenuOpen(e, uid, club.id)}
                                                            >
                                                                <MoreVertIcon fontSize="small" />
                                                            </IconButton>
                                                        }
                                                    >
                                                        <ListItemButton>
                                                            <ListItemAvatar>
                                                                <Avatar sx={{ bgcolor: club.memberRoles && club.memberRoles[uid] === 'admin' ? 'secondary.main' : 'primary.main' }}>
                                                                    {userMap[uid].displayName.charAt(0)}
                                                                </Avatar>
                                                            </ListItemAvatar>
                                                            <ListItemText
                                                                primary={userMap[uid].displayName}
                                                                secondary={
                                                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                                                        <Typography variant="caption" color="text.secondary">
                                                                            {userMap[uid].email}
                                                                        </Typography>
                                                                        <Typography
                                                                            variant="caption"
                                                                            sx={{
                                                                                color: club.memberRoles && club.memberRoles[uid] === 'admin'
                                                                                    ? theme.palette.secondary.main
                                                                                    : theme.palette.primary.main,
                                                                                fontWeight: 'medium'
                                                                            }}
                                                                        >
                                                                            {club.memberRoles && club.memberRoles[uid] === 'admin' ? 'Başkan' : 'Üye'}
                                                                        </Typography>
                                                                    </Box>
                                                                }
                                                            />
                                                        </ListItemButton>
                                                    </ListItem>
                                                ))}
                                            </List>
                                        </>
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
                    );
                })}
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

            {/* Etkinlik Menüsü */}
            <Menu
                anchorEl={eventMenuAnchor}
                open={Boolean(eventMenuAnchor)}
                onClose={handleEventMenuClose}
            >
                <MenuItem onClick={handleDeleteEvent}>
                    <ListItemIcon>
                        <DeleteIcon fontSize="small" color="error" />
                    </ListItemIcon>
                    <ListItemText primary="Etkinliği Sil" />
                </MenuItem>
            </Menu>

            {/* Üye Menüsü */}
            <Menu
                anchorEl={memberMenuAnchor}
                open={Boolean(memberMenuAnchor)}
                onClose={handleMemberMenuClose}
            >
                <MenuItem onClick={handleRemoveMember}>
                    <ListItemIcon>
                        <DeleteIcon fontSize="small" color="error" />
                    </ListItemIcon>
                    <ListItemText primary="Üyeyi Çıkar" />
                </MenuItem>
            </Menu>
        </Container>
    );
} 