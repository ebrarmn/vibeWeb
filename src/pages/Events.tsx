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
    Select,
    MenuItem,
    FormControl,
    InputLabel
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Event as EventIcon,
    LocationOn as LocationIcon,
    Group as GroupIcon,
    CalendarMonth as CalendarIcon,
    Business as BusinessIcon
} from '@mui/icons-material';
import { eventServices, userServices, clubServices } from '../services/firestore';
import { Event, Club } from '../types/models';
import SearchBar from '../components/SearchBar';
import { format, isAfter, isBefore, isSameDay, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function Events() {
    const theme = useTheme();
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [capacityFilter, setCapacityFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('all');
    const [userMap, setUserMap] = useState<{ [id: string]: { displayName: string; email: string } }>({});
    const [clubs, setClubs] = useState<Club[]>([]);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        location: '',
        startDate: '',
        endDate: '',
        capacity: '',
        clubId: ''
    });

    const fetchEvents = async () => {
        try {
            const fetchedEvents = await eventServices.getAll();
            setEvents(fetchedEvents);
        } catch (error) {
            console.error('Etkinlikler yüklenirken hata oluştu:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
        Promise.all([
            userServices.getAll(),
            clubServices.getAll()
        ]).then(([users, fetchedClubs]) => {
            const map: { [id: string]: { displayName: string; email: string } } = {};
            users.forEach(u => { map[u.id] = { displayName: u.displayName, email: u.email }; });
            setUserMap(map);
            setClubs(fetchedClubs);
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

    const filteredEvents = useMemo(() => {
        return events.filter(event => {
            const matchesSearch = 
                event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                event.location.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesCapacity = 
                capacityFilter === 'all' ? true :
                capacityFilter === 'small' ? event.capacity < 50 :
                capacityFilter === 'medium' ? (event.capacity >= 50 && event.capacity < 150) :
                event.capacity >= 150;

            try {
                const now = new Date();
                const eventStart = event.startDate ? new Date(event.startDate) : null;
                
                const matchesDate = 
                    dateFilter === 'all' ? true :
                    !eventStart ? false :
                    dateFilter === 'upcoming' ? isAfter(eventStart, now) :
                    dateFilter === 'past' ? isBefore(eventStart, now) :
                    dateFilter === 'today' ? isSameDay(eventStart, now) :
                    true;

                return matchesSearch && matchesCapacity && matchesDate;
            } catch (error) {
                console.error('Tarih karşılaştırması yapılırken hata oluştu:', error);
                return false;
            }
        });
    }, [events, searchTerm, capacityFilter, dateFilter]);

    const filters = {
        'Kapasite': {
            value: capacityFilter,
            options: [
                { value: 'all', label: 'Tümü' },
                { value: 'small', label: 'Az (<50)' },
                { value: 'medium', label: 'Orta (50-150)' },
                { value: 'large', label: 'Çok (>150)' }
            ],
            onChange: setCapacityFilter
        },
        'Tarih': {
            value: dateFilter,
            options: [
                { value: 'all', label: 'Tümü' },
                { value: 'upcoming', label: 'Gelecek' },
                { value: 'past', label: 'Geçmiş' },
                { value: 'today', label: 'Bugün' }
            ],
            onChange: setDateFilter
        }
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedEvent(null);
        setFormData({
            title: '',
            description: '',
            location: '',
            startDate: '',
            endDate: '',
            capacity: '',
            clubId: ''
        });
    };

    const handleSubmit = async () => {
        try {
            const eventData = {
                ...formData,
                capacity: parseInt(formData.capacity) || 0,
                startDate: formData.startDate || '',
                endDate: formData.endDate || '',
                clubId: formData.clubId
            };

            if (selectedEvent) {
                await eventServices.update(selectedEvent.id, eventData);
            } else {
                await eventServices.create({
                    ...eventData,
                    attendeeIds: [],
                    attendeeStatus: {}
                });
            }
            fetchEvents();
            handleClose();
        } catch (error) {
            console.error('Etkinlik kaydedilirken hata oluştu:', error);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await eventServices.delete(id);
            fetchEvents();
        } catch (error) {
            console.error('Etkinlik silinirken hata oluştu:', error);
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
                Etkinlikler
            </Typography>

            <SearchBar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                placeholder="Etkinlik ara..."
                filters={filters}
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 3 }}>
                {filteredEvents.map((event) => (
                    <Card
                        key={event.id}
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
                                <EventIcon color="primary" />
                                <Typography variant="h6" component="div">
                                    {event.title}
                                </Typography>
                            </Box>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mb: 2 }}
                            >
                                {event.description}
                            </Typography>
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 1,
                                    mb: 2
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <BusinessIcon fontSize="small" color="action" />
                                    <Typography variant="body2">
                                        {clubs.find(c => c.id === event.clubId)?.name || 'Bilinmeyen Kulüp'}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <LocationIcon fontSize="small" color="action" />
                                    <Typography variant="body2">{event.location}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <CalendarIcon fontSize="small" color="action" />
                                    <Typography variant="body2">
                                        {formatEventDate(event.startDate)}
                                    </Typography>
                                </Box>
                            </Box>
                            <Box
                                sx={{
                                    display: 'flex',
                                    gap: 1,
                                    flexWrap: 'wrap'
                                }}
                            >
                                <Chip
                                    icon={<GroupIcon />}
                                    label={`${Array.isArray(event.attendeeIds) ? event.attendeeIds.length : 0}/${event.capacity} Katılımcı`}
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                />
                            </Box>
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Katılımcılar:</Typography>
                                {Array.isArray(event.attendeeIds) && event.attendeeIds.length > 0 ? (
                                    event.attendeeIds
                                        .filter(uid => !!uid && userMap[uid])
                                        .map(uid => (
                                            <Box key={uid} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                                <Typography variant="body2">
                                                    {userMap[uid].displayName}
                                                    {userMap[uid].email ? ` (${userMap[uid].email})` : ''}
                                                    {event.attendeeStatus && event.attendeeStatus[uid]
                                                        ? ` - ${event.attendeeStatus[uid] === 'registered'
                                                            ? 'Kayıtlı'
                                                            : event.attendeeStatus[uid] === 'attended'
                                                            ? 'Katıldı'
                                                            : 'İptal'}`
                                                        : ''}
                                                </Typography>
                                            </Box>
                                        ))
                                ) : (
                                    <Typography variant="body2" color="text.secondary">Katılımcı yok</Typography>
                                )}
                            </Box>
                            <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                <Button
                                    size="small"
                                    startIcon={<EditIcon />}
                                    onClick={() => {
                                        setSelectedEvent(event);
                                        setFormData({
                                            title: event.title,
                                            description: event.description,
                                            location: event.location,
                                            startDate: event.startDate,
                                            endDate: event.endDate,
                                            capacity: event.capacity.toString(),
                                            clubId: event.clubId
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
                                    onClick={() => handleDelete(event.id)}
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
                    Yeni Etkinlik Ekle
                </Button>
            </Box>

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>{selectedEvent ? 'Etkinliği Düzenle' : 'Yeni Etkinlik Ekle'}</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth margin="dense">
                        <InputLabel>Kulüp</InputLabel>
                        <Select
                            value={formData.clubId}
                            label="Kulüp"
                            onChange={(e) => setFormData({ ...formData, clubId: e.target.value })}
                        >
                            {clubs.map((club) => (
                                <MenuItem key={club.id} value={club.id}>
                                    {club.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Etkinlik Adı"
                        fullWidth
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                    <TextField
                        margin="dense"
                        label="Konum"
                        fullWidth
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Başlangıç Tarihi"
                        type="datetime-local"
                        fullWidth
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                        margin="dense"
                        label="Bitiş Tarihi"
                        type="datetime-local"
                        fullWidth
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                        margin="dense"
                        label="Kapasite"
                        type="number"
                        fullWidth
                        value={formData.capacity}
                        onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>İptal</Button>
                    <Button 
                        onClick={handleSubmit} 
                        variant="contained"
                        disabled={!formData.clubId}
                    >
                        {selectedEvent ? 'Güncelle' : 'Ekle'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
} 