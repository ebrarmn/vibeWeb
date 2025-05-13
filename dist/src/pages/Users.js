"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Users;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const firestore_1 = require("../services/firestore");
const SearchBar_1 = __importDefault(require("../components/SearchBar"));
function Users() {
    const theme = (0, material_1.useTheme)();
    const [users, setUsers] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [open, setOpen] = (0, react_1.useState)(false);
    const [selectedUser, setSelectedUser] = (0, react_1.useState)(null);
    const [searchTerm, setSearchTerm] = (0, react_1.useState)('');
    const [roleFilter, setRoleFilter] = (0, react_1.useState)('all');
    const [clubFilter, setClubFilter] = (0, react_1.useState)('all');
    const [clubMap, setClubMap] = (0, react_1.useState)({});
    const [manageUser, setManageUser] = (0, react_1.useState)(null);
    const [clubs, setClubs] = (0, react_1.useState)([]);
    const [formData, setFormData] = (0, react_1.useState)({
        firstName: '',
        lastName: '',
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
        clubId: ''
    });
    const [formError, setFormError] = (0, react_1.useState)('');
    const fetchUsers = async () => {
        try {
            const fetchedUsers = await firestore_1.userServices.getAll();
            setUsers(fetchedUsers);
        }
        catch (error) {
            console.error('Kullanıcılar yüklenirken hata oluştu:', error);
        }
        finally {
            setLoading(false);
        }
    };
    (0, react_1.useEffect)(() => {
        fetchUsers();
        firestore_1.clubServices.getAll().then(clubs => {
            setClubs(clubs);
            const map = {};
            clubs.forEach(club => { map[club.id] = club.name; });
            setClubMap(map);
        });
    }, []);
    const filteredUsers = (0, react_1.useMemo)(() => {
        return users.filter(user => {
            const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.displayName.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesRole = roleFilter === 'all' ? true : user.role === roleFilter;
            const matchesClub = clubFilter === 'all' ? true :
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
            firstName: '',
            lastName: '',
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
            clubId: ''
        });
    };
    const handleSubmit = async () => {
        setFormError('');
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.phone || !formData.birthDate || !formData.gender || !formData.university || !formData.faculty || !formData.department || !formData.grade || !formData.role) {
            setFormError('Tüm alanları doldurmalısınız.');
            return;
        }
        if (formData.role === 'admin' && !formData.clubId) {
            setFormError('Yönetici için kulüp seçmelisiniz.');
            return;
        }
        try {
            if (selectedUser) {
                await firestore_1.userServices.update(selectedUser.id, {
                    ...formData,
                    displayName: formData.firstName + ' ' + formData.lastName,
                    role: formData.role,
                });
            }
            else {
                let newUserId = '';
                if (formData.role === 'admin') {
                    const userObj = {
                        firstName: formData.firstName,
                        lastName: formData.lastName,
                        email: formData.email,
                        password: formData.password,
                        phone: formData.phone,
                        birthDate: formData.birthDate,
                        gender: formData.gender,
                        university: formData.university,
                        faculty: formData.faculty,
                        department: formData.department,
                        grade: formData.grade,
                        displayName: formData.firstName + ' ' + formData.lastName,
                        role: 'admin',
                        clubIds: [formData.clubId],
                        clubRoles: { [formData.clubId]: 'admin' }
                    };
                    const { password, ...userDataForFirestore } = userObj;
                    newUserId = await firestore_1.userServices.create(userDataForFirestore);
                    await firestore_1.clubServices.addMember(formData.clubId, newUserId, 'admin');
                }
                else {
                    const userObj = {
                        firstName: formData.firstName,
                        lastName: formData.lastName,
                        email: formData.email,
                        password: formData.password,
                        phone: formData.phone,
                        birthDate: formData.birthDate,
                        gender: formData.gender,
                        university: formData.university,
                        faculty: formData.faculty,
                        department: formData.department,
                        grade: formData.grade,
                        displayName: formData.firstName + ' ' + formData.lastName,
                        role: 'user',
                        clubIds: [],
                        clubRoles: {}
                    };
                    const { password, ...userDataForFirestore } = userObj;
                    await firestore_1.userServices.create(userDataForFirestore);
                }
            }
            fetchUsers();
            handleClose();
        }
        catch (error) {
            setFormError('Kullanıcı kaydedilirken hata oluştu.');
            console.error('Kullanıcı kaydedilirken hata oluştu:', error);
        }
    };
    const handleDelete = async (id) => {
        try {
            await firestore_1.userServices.delete(id);
            fetchUsers();
        }
        catch (error) {
            console.error('Kullanıcı silinirken hata oluştu:', error);
        }
    };
    const getInitials = (name) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase();
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
                }, children: "Kullan\u0131c\u0131lar" }), (0, jsx_runtime_1.jsx)(SearchBar_1.default, { searchTerm: searchTerm, onSearchChange: setSearchTerm, placeholder: "Kullan\u0131c\u0131 ara...", filters: filters }), (0, jsx_runtime_1.jsx)(material_1.Box, { sx: { display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 3 }, children: filteredUsers.map((user) => ((0, jsx_runtime_1.jsx)(material_1.Card, { sx: {
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'transform 0.3s, box-shadow 0.3s',
                        '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: theme.shadows[4]
                        }
                    }, onClick: () => setManageUser(user), children: (0, jsx_runtime_1.jsxs)(material_1.CardContent, { children: [(0, jsx_runtime_1.jsxs)(material_1.Box, { sx: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    mb: 2,
                                    gap: 2
                                }, children: [(0, jsx_runtime_1.jsx)(material_1.Avatar, { sx: {
                                            bgcolor: theme.palette.primary.main,
                                            width: 48,
                                            height: 48
                                        }, children: getInitials(user.displayName) }), (0, jsx_runtime_1.jsxs)(material_1.Box, { children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", component: "div", children: user.displayName }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", color: "text.secondary", children: user.email })] })] }), (0, jsx_runtime_1.jsxs)(material_1.Box, { sx: {
                                    display: 'flex',
                                    gap: 1,
                                    flexWrap: 'wrap',
                                    mb: 2
                                }, children: [(0, jsx_runtime_1.jsx)(material_1.Chip, { icon: user.role === 'admin' ? (0, jsx_runtime_1.jsx)(icons_material_1.AdminPanelSettings, {}) : (0, jsx_runtime_1.jsx)(icons_material_1.Person, {}), label: user.role === 'admin' ? 'Yönetici' : 'Kullanıcı', size: "small", color: user.role === 'admin' ? 'secondary' : 'primary', variant: "outlined" }), (0, jsx_runtime_1.jsx)(material_1.Chip, { icon: (0, jsx_runtime_1.jsx)(icons_material_1.Business, {}), label: user.clubIds.length === 0 ? 'Kulüp Yok' : user.clubIds.map(id => clubMap[id]).filter(Boolean).join(', '), size: "small", color: "primary", variant: "outlined" })] }), (0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { mt: 2, display: 'flex', gap: 1, justifyContent: 'flex-end' }, children: [(0, jsx_runtime_1.jsx)(material_1.Button, { size: "small", startIcon: (0, jsx_runtime_1.jsx)(icons_material_1.Edit, {}), onClick: (e) => {
                                            e.stopPropagation();
                                            setSelectedUser(user);
                                            setFormData({
                                                firstName: user.firstName,
                                                lastName: user.lastName,
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
                                                clubId: user.clubIds.length > 0 ? user.clubIds[0] : ''
                                            });
                                            setOpen(true);
                                        }, children: "D\u00FCzenle" }), (0, jsx_runtime_1.jsx)(material_1.Button, { size: "small", color: "error", startIcon: (0, jsx_runtime_1.jsx)(icons_material_1.Delete, {}), onClick: (e) => {
                                            e.stopPropagation();
                                            handleDelete(user.id);
                                        }, children: "Sil" })] })] }) }, user.id))) }), (0, jsx_runtime_1.jsx)(material_1.Box, { display: "flex", justifyContent: "flex-end", mt: 3, children: (0, jsx_runtime_1.jsx)(material_1.Button, { variant: "contained", startIcon: (0, jsx_runtime_1.jsx)(icons_material_1.Add, {}), onClick: () => setOpen(true), sx: {
                        background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        color: 'white',
                        '&:hover': {
                            background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`
                        }
                    }, children: "Yeni Kullan\u0131c\u0131 Ekle" }) }), (0, jsx_runtime_1.jsxs)(material_1.Dialog, { open: open, onClose: handleClose, children: [(0, jsx_runtime_1.jsx)(material_1.DialogTitle, { children: selectedUser ? 'Kullanıcıyı Düzenle' : 'Yeni Kullanıcı Ekle' }), (0, jsx_runtime_1.jsxs)(material_1.DialogContent, { children: [(0, jsx_runtime_1.jsx)(material_1.TextField, { margin: "dense", label: "Ad", fullWidth: true, value: formData.firstName, onChange: (e) => setFormData({ ...formData, firstName: e.target.value }) }), (0, jsx_runtime_1.jsx)(material_1.TextField, { margin: "dense", label: "Soyad", fullWidth: true, value: formData.lastName, onChange: (e) => setFormData({ ...formData, lastName: e.target.value }) }), (0, jsx_runtime_1.jsx)(material_1.TextField, { margin: "dense", label: "E-posta", type: "email", fullWidth: true, value: formData.email, onChange: (e) => setFormData({ ...formData, email: e.target.value }) }), (0, jsx_runtime_1.jsx)(material_1.TextField, { margin: "dense", label: "\u015Eifre", type: "password", fullWidth: true, value: formData.password, onChange: (e) => setFormData({ ...formData, password: e.target.value }) }), (0, jsx_runtime_1.jsx)(material_1.TextField, { margin: "dense", label: "Telefon", fullWidth: true, value: formData.phone, onChange: (e) => setFormData({ ...formData, phone: e.target.value }) }), (0, jsx_runtime_1.jsx)(material_1.TextField, { margin: "dense", label: "Do\u011Fum Tarihi", type: "date", fullWidth: true, InputLabelProps: { shrink: true }, value: formData.birthDate, onChange: (e) => setFormData({ ...formData, birthDate: e.target.value }) }), (0, jsx_runtime_1.jsxs)(material_1.FormControl, { fullWidth: true, margin: "dense", children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { children: "Cinsiyet" }), (0, jsx_runtime_1.jsxs)(material_1.Select, { value: formData.gender, label: "Cinsiyet", onChange: (e) => setFormData({ ...formData, gender: e.target.value }), children: [(0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "Kad\u0131n", children: "Kad\u0131n" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "Erkek", children: "Erkek" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "Belirtmek istemiyorum", children: "Belirtmek istemiyorum" })] })] }), (0, jsx_runtime_1.jsx)(material_1.TextField, { margin: "dense", label: "\u00DCniversite", fullWidth: true, value: formData.university, onChange: (e) => setFormData({ ...formData, university: e.target.value }) }), (0, jsx_runtime_1.jsx)(material_1.TextField, { margin: "dense", label: "Fak\u00FClte", fullWidth: true, value: formData.faculty, onChange: (e) => setFormData({ ...formData, faculty: e.target.value }) }), (0, jsx_runtime_1.jsx)(material_1.TextField, { margin: "dense", label: "B\u00F6l\u00FCm", fullWidth: true, value: formData.department, onChange: (e) => setFormData({ ...formData, department: e.target.value }) }), (0, jsx_runtime_1.jsx)(material_1.TextField, { margin: "dense", label: "S\u0131n\u0131f", fullWidth: true, value: formData.grade, onChange: (e) => setFormData({ ...formData, grade: e.target.value }) }), (0, jsx_runtime_1.jsxs)(material_1.FormControl, { fullWidth: true, margin: "dense", children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { children: "Rol" }), (0, jsx_runtime_1.jsxs)(material_1.Select, { value: formData.role, label: "Rol", onChange: (e) => setFormData({ ...formData, role: e.target.value, clubId: '' }), children: [(0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "user", children: "Kullan\u0131c\u0131" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "admin", children: "Y\u00F6netici" })] })] }), formData.role === 'admin' && ((0, jsx_runtime_1.jsxs)(material_1.FormControl, { fullWidth: true, margin: "dense", children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { children: "Kul\u00FCp" }), (0, jsx_runtime_1.jsx)(material_1.Select, { value: formData.clubId, label: "Kul\u00FCp", onChange: (e) => setFormData({ ...formData, clubId: e.target.value }), children: clubs.map(club => ((0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: club.id, children: club.name }, club.id))) })] })), formError && (0, jsx_runtime_1.jsx)(material_1.Typography, { color: "error", variant: "body2", children: formError })] }), (0, jsx_runtime_1.jsxs)(material_1.DialogActions, { children: [(0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleClose, children: "\u0130ptal" }), (0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleSubmit, variant: "contained", children: selectedUser ? 'Güncelle' : 'Ekle' })] })] }), (0, jsx_runtime_1.jsx)(UserManageModal, { open: !!manageUser, user: manageUser, onClose: () => setManageUser(null), onUpdated: fetchUsers })] }));
}
function UserManageModal({ open, onClose, user, onUpdated }) {
    const [clubs, setClubs] = (0, react_1.useState)([]);
    const [events, setEvents] = (0, react_1.useState)([]);
    const [selectedClubs, setSelectedClubs] = (0, react_1.useState)([]);
    const [selectedEvents, setSelectedEvents] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    (0, react_1.useEffect)(() => {
        if (!user)
            return;
        setLoading(true);
        Promise.all([
            firestore_1.clubServices.getAll(),
            firestore_1.eventServices.getAll()
        ]).then(([clubs, events]) => {
            setClubs(clubs);
            setEvents(events);
            setSelectedClubs(user.clubIds || []);
            // Kullanıcının kulüplerine ait etkinliklerden katıldıkları
            const userEventIds = events.filter(e => user.clubIds.includes(e.clubId) && e.attendeeIds.includes(user.id)).map(e => e.id);
            setSelectedEvents(userEventIds);
        }).finally(() => setLoading(false));
    }, [user]);
    if (!user)
        return null;
    // Kulüp ekle/çıkar işlemi
    const handleClubToggle = async (clubId) => {
        if (selectedClubs.includes(clubId)) {
            await firestore_1.userServices.leaveClub(user.id, clubId);
            setSelectedClubs(selectedClubs.filter(id => id !== clubId));
        }
        else {
            await firestore_1.userServices.joinClub(user.id, clubId, 'member');
            setSelectedClubs([...selectedClubs, clubId]);
        }
        onUpdated();
    };
    // Etkinlik ekle/çıkar işlemi
    const handleEventToggle = async (eventId) => {
        if (selectedEvents.includes(eventId)) {
            await firestore_1.eventServices.removeAttendee(eventId, user.id);
            setSelectedEvents(selectedEvents.filter(id => id !== eventId));
        }
        else {
            await firestore_1.eventServices.registerAttendee(eventId, user.id);
            setSelectedEvents([...selectedEvents, eventId]);
        }
        onUpdated();
    };
    // Kullanıcının kulüplerine ait etkinlikler
    const userClubsEvents = events.filter(e => selectedClubs.includes(e.clubId));
    return ((0, jsx_runtime_1.jsxs)(material_1.Dialog, { open: open, onClose: onClose, maxWidth: "sm", fullWidth: true, children: [(0, jsx_runtime_1.jsxs)(material_1.DialogTitle, { children: ["Kullan\u0131c\u0131 Y\u00F6netimi: ", user.displayName] }), (0, jsx_runtime_1.jsxs)(material_1.DialogContent, { children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "subtitle1", sx: { mt: 1, mb: 1 }, children: "Kul\u00FCp Atama/\u00C7\u0131karma" }), (0, jsx_runtime_1.jsx)(material_1.List, { dense: true, children: clubs.map(club => ((0, jsx_runtime_1.jsxs)(material_1.ListItem, { button: true, onClick: () => handleClubToggle(club.id), children: [(0, jsx_runtime_1.jsx)(material_1.Checkbox, { edge: "start", checked: selectedClubs.includes(club.id), tabIndex: -1, disableRipple: true }), (0, jsx_runtime_1.jsx)(material_1.ListItemText, { primary: club.name, secondary: club.description })] }, club.id))) }), (0, jsx_runtime_1.jsx)(material_1.Divider, { sx: { my: 2 } }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "subtitle1", sx: { mt: 1, mb: 1 }, children: "Etkinlik Atama/\u00C7\u0131karma" }), (0, jsx_runtime_1.jsxs)(material_1.List, { dense: true, children: [userClubsEvents.length === 0 && (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", children: "Kullan\u0131c\u0131n\u0131n kul\u00FCplerine ait etkinlik yok." }), userClubsEvents.map(event => ((0, jsx_runtime_1.jsxs)(material_1.ListItem, { button: true, onClick: () => handleEventToggle(event.id), children: [(0, jsx_runtime_1.jsx)(material_1.Checkbox, { edge: "start", checked: selectedEvents.includes(event.id), tabIndex: -1, disableRipple: true }), (0, jsx_runtime_1.jsx)(material_1.ListItemText, { primary: event.title, secondary: event.location })] }, event.id)))] })] }), (0, jsx_runtime_1.jsx)(material_1.DialogActions, { children: (0, jsx_runtime_1.jsx)(material_1.Button, { onClick: onClose, children: "Kapat" }) })] }));
}
