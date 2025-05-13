"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Events;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const firestore_1 = require("../services/firestore");
const SearchBar_1 = __importDefault(require("../components/SearchBar"));
const date_fns_1 = require("date-fns");
const locale_1 = require("date-fns/locale");
function Events() {
    const theme = (0, material_1.useTheme)();
    const [events, setEvents] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [open, setOpen] = (0, react_1.useState)(false);
    const [selectedEvent, setSelectedEvent] = (0, react_1.useState)(null);
    const [searchTerm, setSearchTerm] = (0, react_1.useState)('');
    const [capacityFilter, setCapacityFilter] = (0, react_1.useState)('all');
    const [dateFilter, setDateFilter] = (0, react_1.useState)('all');
    const [userMap, setUserMap] = (0, react_1.useState)({});
    const [clubs, setClubs] = (0, react_1.useState)([]);
    const [formData, setFormData] = (0, react_1.useState)({
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
            const fetchedEvents = await firestore_1.eventServices.getAll();
            setEvents(fetchedEvents);
        }
        catch (error) {
            console.error('Etkinlikler yüklenirken hata oluştu:', error);
        }
        finally {
            setLoading(false);
        }
    };
    (0, react_1.useEffect)(() => {
        fetchEvents();
        Promise.all([
            firestore_1.userServices.getAll(),
            firestore_1.clubServices.getAll()
        ]).then(([users, fetchedClubs]) => {
            const map = {};
            users.forEach(u => { map[u.id] = { displayName: u.displayName, email: u.email }; });
            setUserMap(map);
            setClubs(fetchedClubs);
        });
    }, []);
    const formatEventDate = (date) => {
        if (!date)
            return '';
        try {
            const parsedDate = typeof date === 'string' ? (0, date_fns_1.parseISO)(date) : date;
            return (0, date_fns_1.format)(parsedDate, 'dd MMMM yyyy HH:mm', { locale: locale_1.tr });
        }
        catch (error) {
            console.error('Tarih formatlanırken hata oluştu:', error);
            return '';
        }
    };
    const filteredEvents = (0, react_1.useMemo)(() => {
        return events.filter(event => {
            const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                event.location.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCapacity = capacityFilter === 'all' ? true :
                capacityFilter === 'small' ? event.capacity < 50 :
                    capacityFilter === 'medium' ? (event.capacity >= 50 && event.capacity < 150) :
                        event.capacity >= 150;
            try {
                const now = new Date();
                const eventStart = event.startDate ? new Date(event.startDate) : null;
                const matchesDate = dateFilter === 'all' ? true :
                    !eventStart ? false :
                        dateFilter === 'upcoming' ? (0, date_fns_1.isAfter)(eventStart, now) :
                            dateFilter === 'past' ? (0, date_fns_1.isBefore)(eventStart, now) :
                                dateFilter === 'today' ? (0, date_fns_1.isSameDay)(eventStart, now) :
                                    true;
                return matchesSearch && matchesCapacity && matchesDate;
            }
            catch (error) {
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
                await firestore_1.eventServices.update(selectedEvent.id, eventData);
            }
            else {
                await firestore_1.eventServices.create({
                    ...eventData,
                    attendeeIds: [],
                    attendeeStatus: {}
                });
            }
            fetchEvents();
            handleClose();
        }
        catch (error) {
            console.error('Etkinlik kaydedilirken hata oluştu:', error);
        }
    };
    const handleDelete = async (id) => {
        try {
            await firestore_1.eventServices.delete(id);
            fetchEvents();
        }
        catch (error) {
            console.error('Etkinlik silinirken hata oluştu:', error);
        }
    };
    if (loading) {
        return ((0, jsx_runtime_1.jsx)(material_1.Box, { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh", children: (0, jsx_runtime_1.jsx)(material_1.CircularProgress, {}) }));
    }
    return ((0, jsx_runtime_1.jsxs)(material_1.Container, { maxWidth: "lg", sx: { mt: 4, mb: 4 }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h4", sx: {
                    mb: 4,
                    fontWeight: 'bold',
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    backgroundClip: 'text',
                    textFillColor: 'transparent',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }, children: "Etkinlikler" }), (0, jsx_runtime_1.jsx)(SearchBar_1.default, { searchTerm: searchTerm, onSearchChange: setSearchTerm, placeholder: "Etkinlik ara...", filters: filters }), (0, jsx_runtime_1.jsx)(material_1.Box, { sx: { display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 3 }, children: filteredEvents.map((event) => ((0, jsx_runtime_1.jsx)(material_1.Card, { sx: {
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'transform 0.3s, box-shadow 0.3s',
                        '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: theme.shadows[4]
                        }
                    }, children: (0, jsx_runtime_1.jsxs)(material_1.CardContent, { children: [(0, jsx_runtime_1.jsxs)(material_1.Box, { sx: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    mb: 2,
                                    gap: 1
                                }, children: [(0, jsx_runtime_1.jsx)(icons_material_1.Event, { color: "primary" }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", component: "div", children: event.title })] }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", color: "text.secondary", sx: { mb: 2 }, children: event.description }), (0, jsx_runtime_1.jsxs)(material_1.Box, { sx: {
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 1,
                                    mb: 2
                                }, children: [(0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { display: 'flex', alignItems: 'center', gap: 1 }, children: [(0, jsx_runtime_1.jsx)(icons_material_1.Business, { fontSize: "small", color: "action" }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", children: clubs.find(c => c.id === event.clubId)?.name || 'Bilinmeyen Kulüp' })] }), (0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { display: 'flex', alignItems: 'center', gap: 1 }, children: [(0, jsx_runtime_1.jsx)(icons_material_1.LocationOn, { fontSize: "small", color: "action" }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", children: event.location })] }), (0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { display: 'flex', alignItems: 'center', gap: 1 }, children: [(0, jsx_runtime_1.jsx)(icons_material_1.CalendarMonth, { fontSize: "small", color: "action" }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", children: formatEventDate(event.startDate) })] })] }), (0, jsx_runtime_1.jsx)(material_1.Box, { sx: {
                                    display: 'flex',
                                    gap: 1,
                                    flexWrap: 'wrap'
                                }, children: (0, jsx_runtime_1.jsx)(material_1.Chip, { icon: (0, jsx_runtime_1.jsx)(icons_material_1.Group, {}), label: `${event.attendeeIds.length}/${event.capacity} Katılımcı`, size: "small", color: "primary", variant: "outlined" }) }), (0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { mt: 2 }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "subtitle2", sx: { fontWeight: 'bold' }, children: "Kat\u0131l\u0131mc\u0131lar:" }), !Array.isArray(event.attendeeIds) || event.attendeeIds.length === 0 ? ((0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", color: "text.secondary", children: "Kat\u0131l\u0131mc\u0131 yok" })) : (event.attendeeIds
                                        .filter(uid => !!uid && userMap[uid])
                                        .map(uid => ((0, jsx_runtime_1.jsx)(material_1.Box, { sx: { display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }, children: (0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "body2", children: [userMap[uid].displayName, userMap[uid].email ? ` (${userMap[uid].email})` : '', event.attendeeStatus && event.attendeeStatus[uid]
                                                    ? ` - ${event.attendeeStatus[uid] === 'registered'
                                                        ? 'Kayıtlı'
                                                        : event.attendeeStatus[uid] === 'attended'
                                                            ? 'Katıldı'
                                                            : 'İptal'}`
                                                    : ''] }) }, uid))))] }), (0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { mt: 2, display: 'flex', gap: 1, justifyContent: 'flex-end' }, children: [(0, jsx_runtime_1.jsx)(material_1.Button, { size: "small", startIcon: (0, jsx_runtime_1.jsx)(icons_material_1.Edit, {}), onClick: () => {
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
                                        }, children: "D\u00FCzenle" }), (0, jsx_runtime_1.jsx)(material_1.Button, { size: "small", color: "error", startIcon: (0, jsx_runtime_1.jsx)(icons_material_1.Delete, {}), onClick: () => handleDelete(event.id), children: "Sil" })] })] }) }, event.id))) }), (0, jsx_runtime_1.jsx)(material_1.Box, { display: "flex", justifyContent: "flex-end", mt: 3, children: (0, jsx_runtime_1.jsx)(material_1.Button, { variant: "contained", startIcon: (0, jsx_runtime_1.jsx)(icons_material_1.Add, {}), onClick: () => setOpen(true), sx: {
                        background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        color: 'white',
                        '&:hover': {
                            background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`
                        }
                    }, children: "Yeni Etkinlik Ekle" }) }), (0, jsx_runtime_1.jsxs)(material_1.Dialog, { open: open, onClose: handleClose, children: [(0, jsx_runtime_1.jsx)(material_1.DialogTitle, { children: selectedEvent ? 'Etkinliği Düzenle' : 'Yeni Etkinlik Ekle' }), (0, jsx_runtime_1.jsxs)(material_1.DialogContent, { children: [(0, jsx_runtime_1.jsxs)(material_1.FormControl, { fullWidth: true, margin: "dense", children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { children: "Kul\u00FCp" }), (0, jsx_runtime_1.jsx)(material_1.Select, { value: formData.clubId, label: "Kul\u00FCp", onChange: (e) => setFormData({ ...formData, clubId: e.target.value }), children: clubs.map((club) => ((0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: club.id, children: club.name }, club.id))) })] }), (0, jsx_runtime_1.jsx)(material_1.TextField, { autoFocus: true, margin: "dense", label: "Etkinlik Ad\u0131", fullWidth: true, value: formData.title, onChange: (e) => setFormData({ ...formData, title: e.target.value }) }), (0, jsx_runtime_1.jsx)(material_1.TextField, { margin: "dense", label: "A\u00E7\u0131klama", fullWidth: true, multiline: true, rows: 4, value: formData.description, onChange: (e) => setFormData({ ...formData, description: e.target.value }) }), (0, jsx_runtime_1.jsx)(material_1.TextField, { margin: "dense", label: "Konum", fullWidth: true, value: formData.location, onChange: (e) => setFormData({ ...formData, location: e.target.value }) }), (0, jsx_runtime_1.jsx)(material_1.TextField, { margin: "dense", label: "Ba\u015Flang\u0131\u00E7 Tarihi", type: "datetime-local", fullWidth: true, value: formData.startDate, onChange: (e) => setFormData({ ...formData, startDate: e.target.value }), InputLabelProps: { shrink: true } }), (0, jsx_runtime_1.jsx)(material_1.TextField, { margin: "dense", label: "Biti\u015F Tarihi", type: "datetime-local", fullWidth: true, value: formData.endDate, onChange: (e) => setFormData({ ...formData, endDate: e.target.value }), InputLabelProps: { shrink: true } }), (0, jsx_runtime_1.jsx)(material_1.TextField, { margin: "dense", label: "Kapasite", type: "number", fullWidth: true, value: formData.capacity, onChange: (e) => setFormData({ ...formData, capacity: e.target.value }) })] }), (0, jsx_runtime_1.jsxs)(material_1.DialogActions, { children: [(0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleClose, children: "\u0130ptal" }), (0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleSubmit, variant: "contained", disabled: !formData.clubId, children: selectedEvent ? 'Güncelle' : 'Ekle' })] })] })] }));
}
