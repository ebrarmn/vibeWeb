"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Clubs;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const firestore_1 = require("../services/firestore");
const SearchBar_1 = __importDefault(require("../components/SearchBar"));
const date_fns_1 = require("date-fns");
const locale_1 = require("date-fns/locale");
function Clubs() {
    const theme = (0, material_1.useTheme)();
    const [clubs, setClubs] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [open, setOpen] = (0, react_1.useState)(false);
    const [selectedClub, setSelectedClub] = (0, react_1.useState)(null);
    const [formData, setFormData] = (0, react_1.useState)({
        name: '',
        description: ''
    });
    const [searchTerm, setSearchTerm] = (0, react_1.useState)('');
    const [memberFilter, setMemberFilter] = (0, react_1.useState)('all');
    const [userMap, setUserMap] = (0, react_1.useState)({});
    const [events, setEvents] = (0, react_1.useState)([]);
    const [eventMenuAnchor, setEventMenuAnchor] = (0, react_1.useState)(null);
    const [memberMenuAnchor, setMemberMenuAnchor] = (0, react_1.useState)(null);
    const [selectedEvent, setSelectedEvent] = (0, react_1.useState)(null);
    const [selectedMember, setSelectedMember] = (0, react_1.useState)(null);
    const [eventSearchTerm, setEventSearchTerm] = (0, react_1.useState)({});
    const [memberSearchTerm, setMemberSearchTerm] = (0, react_1.useState)({});
    const [memberRoleFilter, setMemberRoleFilter] = (0, react_1.useState)('all');
    const fetchClubs = async () => {
        try {
            const fetchedClubs = await firestore_1.clubServices.getAll();
            setClubs(fetchedClubs);
        }
        catch (error) {
            console.error('Kulüpler yüklenirken hata oluştu:', error);
        }
        finally {
            setLoading(false);
        }
    };
    (0, react_1.useEffect)(() => {
        fetchClubs();
        Promise.all([
            firestore_1.userServices.getAll(),
            firestore_1.eventServices.getAll()
        ]).then(([users, fetchedEvents]) => {
            const map = {};
            users.forEach(u => { map[u.id] = { displayName: u.displayName, email: u.email }; });
            setUserMap(map);
            setEvents(fetchedEvents);
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
    const filteredClubs = (0, react_1.useMemo)(() => {
        return clubs.filter(club => {
            const matchesSearch = club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                club.description.toLowerCase().includes(searchTerm.toLowerCase());
            if (memberFilter === 'all')
                return matchesSearch;
            if (memberFilter === 'small')
                return matchesSearch && club.memberIds.length < 10;
            if (memberFilter === 'medium')
                return matchesSearch && club.memberIds.length >= 10 && club.memberIds.length < 30;
            if (memberFilter === 'large')
                return matchesSearch && club.memberIds.length >= 30;
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
                await firestore_1.clubServices.update(selectedClub.id, formData);
            }
            else {
                await firestore_1.clubServices.create({
                    ...formData,
                    memberIds: [],
                    memberRoles: {},
                    eventIds: []
                });
            }
            fetchClubs();
            handleClose();
        }
        catch (error) {
            console.error('Kulüp kaydedilirken hata oluştu:', error);
        }
    };
    const handleDelete = async (id) => {
        try {
            await firestore_1.clubServices.delete(id);
            fetchClubs();
        }
        catch (error) {
            console.error('Kulüp silinirken hata oluştu:', error);
        }
    };
    const handleEventMenuOpen = (event, eventData) => {
        setEventMenuAnchor(event.currentTarget);
        setSelectedEvent(eventData);
    };
    const handleEventMenuClose = () => {
        setEventMenuAnchor(null);
        setSelectedEvent(null);
    };
    const handleMemberMenuOpen = (event, memberId, clubId) => {
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
                await firestore_1.eventServices.delete(selectedEvent.id);
                const updatedEvents = events.filter(e => e.id !== selectedEvent.id);
                setEvents(updatedEvents);
                handleEventMenuClose();
            }
            catch (error) {
                console.error('Etkinlik silinirken hata oluştu:', error);
            }
        }
    };
    const handleRemoveMember = async () => {
        if (selectedMember) {
            try {
                await firestore_1.userServices.leaveClub(selectedMember.id, selectedMember.clubId);
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
            }
            catch (error) {
                console.error('Üye kulüpten çıkarılırken hata oluştu:', error);
            }
        }
    };
    const filteredClubEvents = (clubId, events) => {
        const searchTerm = eventSearchTerm[clubId] || '';
        return events
            .filter(event => event.clubId === clubId)
            .filter(event => event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.location.toLowerCase().includes(searchTerm.toLowerCase()));
    };
    const filteredClubMembers = (club) => {
        const searchTerm = memberSearchTerm[club.id] || '';
        return club.memberIds
            .filter(uid => !!uid && userMap[uid])
            .filter(uid => userMap[uid].displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            userMap[uid].email.toLowerCase().includes(searchTerm.toLowerCase()))
            .filter(uid => {
            if (memberRoleFilter === 'all')
                return true;
            if (memberRoleFilter === 'admin')
                return club.memberRoles && club.memberRoles[uid] === 'admin';
            if (memberRoleFilter === 'member')
                return !club.memberRoles || club.memberRoles[uid] !== 'admin';
            return true;
        });
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
                }, children: "Kul\u00FCpler" }), (0, jsx_runtime_1.jsx)(SearchBar_1.default, { searchTerm: searchTerm, onSearchChange: setSearchTerm, placeholder: "Kul\u00FCp ara...", filters: filters }), (0, jsx_runtime_1.jsx)(material_1.Box, { sx: { display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 3 }, children: filteredClubs.map((club) => {
                    const clubEvents = events.filter(event => event.clubId === club.id);
                    return ((0, jsx_runtime_1.jsx)(material_1.Card, { sx: {
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
                                    }, children: [(0, jsx_runtime_1.jsx)(icons_material_1.Business, { color: "primary" }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", component: "div", children: club.name })] }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", color: "text.secondary", sx: { mb: 2 }, children: club.description }), (0, jsx_runtime_1.jsxs)(material_1.Box, { sx: {
                                        display: 'flex',
                                        gap: 1,
                                        flexWrap: 'wrap',
                                        mb: 2
                                    }, children: [(0, jsx_runtime_1.jsx)(material_1.Chip, { icon: (0, jsx_runtime_1.jsx)(icons_material_1.Group, {}), label: `${club.memberIds.length} Üye`, size: "small", color: "primary", variant: "outlined" }), (0, jsx_runtime_1.jsx)(material_1.Chip, { icon: (0, jsx_runtime_1.jsx)(icons_material_1.Event, {}), label: `${clubEvents.length} Etkinlik`, size: "small", color: "secondary", variant: "outlined" })] }), clubEvents.length > 0 && ((0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { mt: 2 }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "subtitle2", sx: { fontWeight: 'bold', mb: 1 }, children: "Etkinlikler:" }), (0, jsx_runtime_1.jsx)(material_1.TextField, { size: "small", placeholder: "Etkinlik ara...", fullWidth: true, value: eventSearchTerm[club.id] || '', onChange: (e) => setEventSearchTerm({ ...eventSearchTerm, [club.id]: e.target.value }), sx: { mb: 1 }, InputProps: {
                                                startAdornment: ((0, jsx_runtime_1.jsx)(material_1.InputAdornment, { position: "start", children: (0, jsx_runtime_1.jsx)(icons_material_1.Event, { fontSize: "small" }) })),
                                            } }), (0, jsx_runtime_1.jsx)(material_1.List, { dense: true, children: filteredClubEvents(club.id, events).map(event => ((0, jsx_runtime_1.jsx)(material_1.ListItem, { disablePadding: true, secondaryAction: (0, jsx_runtime_1.jsx)(material_1.IconButton, { edge: "end", size: "small", onClick: (e) => handleEventMenuOpen(e, event), children: (0, jsx_runtime_1.jsx)(icons_material_1.MoreVert, { fontSize: "small" }) }), children: (0, jsx_runtime_1.jsx)(material_1.ListItemButton, { children: (0, jsx_runtime_1.jsx)(material_1.ListItemText, { primary: event.title, secondary: (0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { display: 'flex', flexDirection: 'column', gap: 0.5 }, children: [(0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { display: 'flex', alignItems: 'center', gap: 0.5 }, children: [(0, jsx_runtime_1.jsx)(icons_material_1.LocationOn, { fontSize: "small", color: "action" }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "caption", children: event.location })] }), (0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { display: 'flex', alignItems: 'center', gap: 0.5 }, children: [(0, jsx_runtime_1.jsx)(icons_material_1.CalendarMonth, { fontSize: "small", color: "action" }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "caption", children: formatEventDate(event.startDate) })] }), (0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { display: 'flex', alignItems: 'center', gap: 0.5 }, children: [(0, jsx_runtime_1.jsx)(icons_material_1.Group, { fontSize: "small", color: "action" }), (0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "caption", children: [event.attendeeIds.length, "/", event.capacity, " Kat\u0131l\u0131mc\u0131"] })] })] }) }) }) }, event.id))) })] })), (0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { mt: 2 }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "subtitle2", sx: { fontWeight: 'bold', mb: 1 }, children: "\u00DCyeler:" }), !Array.isArray(club.memberIds) || club.memberIds.length === 0 ? ((0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", color: "text.secondary", children: "\u00DCye yok" })) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { display: 'flex', gap: 1, mb: 1 }, children: [(0, jsx_runtime_1.jsx)(material_1.TextField, { size: "small", placeholder: "\u00DCye ara...", fullWidth: true, value: memberSearchTerm[club.id] || '', onChange: (e) => setMemberSearchTerm({ ...memberSearchTerm, [club.id]: e.target.value }), InputProps: {
                                                                startAdornment: ((0, jsx_runtime_1.jsx)(material_1.InputAdornment, { position: "start", children: (0, jsx_runtime_1.jsx)(icons_material_1.Group, { fontSize: "small" }) })),
                                                            } }), (0, jsx_runtime_1.jsx)(material_1.FormControl, { size: "small", sx: { minWidth: 120 }, children: (0, jsx_runtime_1.jsxs)(material_1.Select, { value: memberRoleFilter, onChange: (e) => setMemberRoleFilter(e.target.value), displayEmpty: true, children: [(0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "all", children: "T\u00FCm Roller" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "admin", children: "Ba\u015Fkanlar" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "member", children: "\u00DCyeler" })] }) })] }), (0, jsx_runtime_1.jsx)(material_1.List, { dense: true, children: filteredClubMembers(club).map(uid => ((0, jsx_runtime_1.jsx)(material_1.ListItem, { disablePadding: true, secondaryAction: (0, jsx_runtime_1.jsx)(material_1.IconButton, { edge: "end", size: "small", onClick: (e) => handleMemberMenuOpen(e, uid, club.id), children: (0, jsx_runtime_1.jsx)(icons_material_1.MoreVert, { fontSize: "small" }) }), children: (0, jsx_runtime_1.jsxs)(material_1.ListItemButton, { children: [(0, jsx_runtime_1.jsx)(material_1.ListItemAvatar, { children: (0, jsx_runtime_1.jsx)(material_1.Avatar, { sx: { bgcolor: club.memberRoles && club.memberRoles[uid] === 'admin' ? 'secondary.main' : 'primary.main' }, children: userMap[uid].displayName.charAt(0) }) }), (0, jsx_runtime_1.jsx)(material_1.ListItemText, { primary: userMap[uid].displayName, secondary: (0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { display: 'flex', flexDirection: 'column', gap: 0.5 }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "caption", color: "text.secondary", children: userMap[uid].email }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "caption", sx: {
                                                                                    color: club.memberRoles && club.memberRoles[uid] === 'admin'
                                                                                        ? theme.palette.secondary.main
                                                                                        : theme.palette.primary.main,
                                                                                    fontWeight: 'medium'
                                                                                }, children: club.memberRoles && club.memberRoles[uid] === 'admin' ? 'Başkan' : 'Üye' })] }) })] }) }, uid))) })] }))] }), (0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { mt: 2, display: 'flex', gap: 1, justifyContent: 'flex-end' }, children: [(0, jsx_runtime_1.jsx)(material_1.Button, { size: "small", startIcon: (0, jsx_runtime_1.jsx)(icons_material_1.Edit, {}), onClick: () => {
                                                setSelectedClub(club);
                                                setFormData({
                                                    name: club.name,
                                                    description: club.description
                                                });
                                                setOpen(true);
                                            }, children: "D\u00FCzenle" }), (0, jsx_runtime_1.jsx)(material_1.Button, { size: "small", color: "error", startIcon: (0, jsx_runtime_1.jsx)(icons_material_1.Delete, {}), onClick: () => handleDelete(club.id), children: "Sil" })] })] }) }, club.id));
                }) }), (0, jsx_runtime_1.jsx)(material_1.Box, { display: "flex", justifyContent: "flex-end", mt: 3, children: (0, jsx_runtime_1.jsx)(material_1.Button, { variant: "contained", startIcon: (0, jsx_runtime_1.jsx)(icons_material_1.Add, {}), onClick: () => setOpen(true), sx: {
                        background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        color: 'white',
                        '&:hover': {
                            background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`
                        }
                    }, children: "Yeni Kul\u00FCp Ekle" }) }), (0, jsx_runtime_1.jsxs)(material_1.Dialog, { open: open, onClose: handleClose, children: [(0, jsx_runtime_1.jsx)(material_1.DialogTitle, { children: selectedClub ? 'Kulübü Düzenle' : 'Yeni Kulüp Ekle' }), (0, jsx_runtime_1.jsxs)(material_1.DialogContent, { children: [(0, jsx_runtime_1.jsx)(material_1.TextField, { autoFocus: true, margin: "dense", label: "Kul\u00FCp Ad\u0131", fullWidth: true, value: formData.name, onChange: (e) => setFormData({ ...formData, name: e.target.value }) }), (0, jsx_runtime_1.jsx)(material_1.TextField, { margin: "dense", label: "A\u00E7\u0131klama", fullWidth: true, multiline: true, rows: 4, value: formData.description, onChange: (e) => setFormData({ ...formData, description: e.target.value }) })] }), (0, jsx_runtime_1.jsxs)(material_1.DialogActions, { children: [(0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleClose, children: "\u0130ptal" }), (0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleSubmit, variant: "contained", children: selectedClub ? 'Güncelle' : 'Ekle' })] })] }), (0, jsx_runtime_1.jsx)(material_1.Menu, { anchorEl: eventMenuAnchor, open: Boolean(eventMenuAnchor), onClose: handleEventMenuClose, children: (0, jsx_runtime_1.jsxs)(material_1.MenuItem, { onClick: handleDeleteEvent, children: [(0, jsx_runtime_1.jsx)(material_1.ListItemIcon, { children: (0, jsx_runtime_1.jsx)(icons_material_1.Delete, { fontSize: "small", color: "error" }) }), (0, jsx_runtime_1.jsx)(material_1.ListItemText, { primary: "Etkinli\u011Fi Sil" })] }) }), (0, jsx_runtime_1.jsx)(material_1.Menu, { anchorEl: memberMenuAnchor, open: Boolean(memberMenuAnchor), onClose: handleMemberMenuClose, children: (0, jsx_runtime_1.jsxs)(material_1.MenuItem, { onClick: handleRemoveMember, children: [(0, jsx_runtime_1.jsx)(material_1.ListItemIcon, { children: (0, jsx_runtime_1.jsx)(icons_material_1.Delete, { fontSize: "small", color: "error" }) }), (0, jsx_runtime_1.jsx)(material_1.ListItemText, { primary: "\u00DCyeyi \u00C7\u0131kar" })] }) })] }));
}
