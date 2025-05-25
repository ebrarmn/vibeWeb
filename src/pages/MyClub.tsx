import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Paper, Snackbar, Alert, TextField, Button } from '@mui/material';
import { useOutletContext } from 'react-router-dom';
import { userServices, clubServices, eventServices, clubInvitationServices } from '../services/firestore';
import { User, Club, Event } from '../types/models';
import { auth } from '../firebase/config';
import ClubRequests from './ClubRequests';

interface LayoutContext {
    collapsed: boolean;
    drawerWidth: number;
}

export default function MyClub() {
    const [user, setUser] = useState<User | null>(null);
    const [club, setClub] = useState<Club | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [snackbar, setSnackbar] = useState<{open: boolean, message: string, severity: 'success'|'error'}>({open: false, message: '', severity: 'success'});
    const { drawerWidth } = useOutletContext<LayoutContext>();
    const [editMode, setEditMode] = useState<boolean>(false);
    const [editName, setEditName] = useState<string>('');
    const [editDescription, setEditDescription] = useState<string>('');
    const [eventTitle, setEventTitle] = useState<string>('');
    const [eventDescription, setEventDescription] = useState<string>('');
    const [eventLocation, setEventLocation] = useState<string>('');
    const [eventStartDate, setEventStartDate] = useState<string>('');
    const [eventEndDate, setEventEndDate] = useState<string>('');
    const [eventCapacity, setEventCapacity] = useState<number>(0);
    const [eventImageUrl, setEventImageUrl] = useState<string>('');
    const [eventLoading, setEventLoading] = useState<boolean>(false);
    const [events, setEvents] = useState<Event[]>([]);
    const [eventsLoading, setEventsLoading] = useState<boolean>(true);
    const [editEventMode, setEditEventMode] = useState<boolean>(false);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [members, setMembers] = useState<User[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [pendingInvites, setPendingInvites] = useState<any[]>([]);
    const [membersLoading, setMembersLoading] = useState<boolean>(true);
    const [usersLoading, setUsersLoading] = useState<boolean>(true);
    const [inviteLoading, setInviteLoading] = useState<string | null>(null);
    const [removeLoading, setRemoveLoading] = useState<string | null>(null);
    const [userFilter, setUserFilter] = useState<string>('');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const users = await userServices.getAll();
                const currentEmail = auth.currentUser?.email;
                const currentUser = users.find(u => u.email === currentEmail);
                setUser(currentUser || null);
                if (currentUser) {
                    const adminClubId = Object.entries(currentUser.clubRoles || {}).find(([_, role]) => role === 'admin')?.[0];
                    if (adminClubId) {
                        const allClubs = await clubServices.getAll();
                        const adminClub = allClubs.find(c => c.id === adminClubId) || null;
                        setClub(adminClub);
                        if (adminClub) {
                            setEditName(adminClub.name);
                            setEditDescription(adminClub.description);
                        }
                    }
                }
            } catch (err) {
                setSnackbar({open: true, message: 'Veri çekme hatası', severity: 'error'});
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleEditSave = async () => {
        if (!club) return;
        try {
            await clubServices.update(club.id, { name: editName, description: editDescription });
            setClub({ ...club, name: editName, description: editDescription });
            setEditMode(false);
            setSnackbar({ open: true, message: 'Kulüp bilgileri güncellendi.', severity: 'success' });
        } catch (err) {
            setSnackbar({ open: true, message: 'Güncelleme sırasında hata oluştu.', severity: 'error' });
        }
    };

    const fetchEvents = async (clubId: string) => {
        setEventsLoading(true);
        try {
            const clubEvents = await eventServices.getByClubId(clubId);
            setEvents(clubEvents);
        } catch (err) {
            setSnackbar({ open: true, message: 'Etkinlikler yüklenemedi.', severity: 'error' });
        } finally {
            setEventsLoading(false);
        }
    };

    useEffect(() => {
        if (club) {
            fetchEvents(club.id);
        }
    }, [club]);

    useEffect(() => {
        const fetchMembersAndUsers = async () => {
            if (!club) return;
            setMembersLoading(true);
            setUsersLoading(true);
            try {
                const users = await userServices.getAll();
                setAllUsers(users);
                // Kulüp üyeleri
                const clubMembers = users.filter(u => club.memberIds.includes(u.id));
                setMembers(clubMembers);
                setMembersLoading(false);
                setUsersLoading(false);
                // Davetler
                const invites = await clubInvitationServices.getAll();
                setPendingInvites(invites.filter(i => i.clubId === club.id && i.status === 'pending'));
            } catch (err) {
                setSnackbar({ open: true, message: 'Üyeler veya kullanıcılar yüklenemedi.', severity: 'error' });
                setMembersLoading(false);
                setUsersLoading(false);
            }
        };
        fetchMembersAndUsers();
    }, [club]);

    const handleRemoveMember = async (userId: string) => {
        if (!club) return;
        setRemoveLoading(userId);
        try {
            await clubServices.removeMember(club.id, userId);
            await userServices.leaveClub(userId, club.id);
            setSnackbar({ open: true, message: 'Üye kulüpten çıkarıldı.', severity: 'success' });
            setMembers(members.filter(m => m.id !== userId));
        } catch (err) {
            setSnackbar({ open: true, message: 'Üye çıkarılamadı.', severity: 'error' });
        } finally {
            setRemoveLoading(null);
        }
    };

    const handleInviteUser = async (user: User) => {
        if (!club || !user) return;
        setInviteLoading(user.id);
        try {
            await clubInvitationServices.create({
                clubId: club.id,
                clubName: club.name,
                receiverId: user.id,
                senderId: user.id, // Burada yönetici id'si olmalı, örnek için user.id
                senderName: user.displayName,
            });
            setSnackbar({ open: true, message: 'Davet gönderildi.', severity: 'success' });
            setPendingInvites([...pendingInvites, { clubId: club.id, receiverId: user.id, status: 'pending' }]);
        } catch (err) {
            setSnackbar({ open: true, message: 'Davet gönderilemedi.', severity: 'error' });
        } finally {
            setInviteLoading(null);
        }
    };

    const handleCreateEvent = async () => {
        if (!club) return;
        if (!eventTitle || !eventDescription || !eventLocation || !eventStartDate || !eventEndDate || eventCapacity <= 0) {
            setSnackbar({ open: true, message: 'Lütfen tüm alanları doldurun ve kapasiteyi pozitif girin.', severity: 'error' });
            return;
        }
        setEventLoading(true);
        try {
            await eventServices.create({
                title: eventTitle,
                description: eventDescription,
                imageUrl: eventImageUrl,
                clubId: club.id,
                startDate: eventStartDate,
                endDate: eventEndDate,
                location: eventLocation,
                capacity: eventCapacity,
                attendeeIds: [],
                attendeeStatus: {}
            });
            setSnackbar({ open: true, message: 'Etkinlik başarıyla oluşturuldu.', severity: 'success' });
            setEventTitle('');
            setEventDescription('');
            setEventLocation('');
            setEventStartDate('');
            setEventEndDate('');
            setEventCapacity(0);
            setEventImageUrl('');
            fetchEvents(club.id);
        } catch (err) {
            setSnackbar({ open: true, message: 'Etkinlik oluşturulurken hata oluştu.', severity: 'error' });
        } finally {
            setEventLoading(false);
        }
    };

    const handleEditEvent = (event: Event) => {
        setEditEventMode(true);
        setSelectedEvent(event);
        setEventTitle(event.title);
        setEventDescription(event.description);
        setEventLocation(event.location);
        setEventStartDate(event.startDate.slice(0, 16));
        setEventEndDate(event.endDate.slice(0, 16));
        setEventCapacity(event.capacity);
        setEventImageUrl(event.imageUrl || '');
    };

    const handleUpdateEvent = async () => {
        if (!club || !selectedEvent) return;
        if (!eventTitle || !eventDescription || !eventLocation || !eventStartDate || !eventEndDate || eventCapacity <= 0) {
            setSnackbar({ open: true, message: 'Lütfen tüm alanları doldurun ve kapasiteyi pozitif girin.', severity: 'error' });
            return;
        }
        setEventLoading(true);
        try {
            await eventServices.update(selectedEvent.id, {
                title: eventTitle,
                description: eventDescription,
                imageUrl: eventImageUrl,
                startDate: eventStartDate,
                endDate: eventEndDate,
                location: eventLocation,
                capacity: eventCapacity
            });
            setSnackbar({ open: true, message: 'Etkinlik başarıyla güncellendi.', severity: 'success' });
            setEditEventMode(false);
            setSelectedEvent(null);
            setEventTitle('');
            setEventDescription('');
            setEventLocation('');
            setEventStartDate('');
            setEventEndDate('');
            setEventCapacity(0);
            setEventImageUrl('');
            fetchEvents(club.id);
        } catch (err) {
            setSnackbar({ open: true, message: 'Etkinlik güncellenirken hata oluştu.', severity: 'error' });
        } finally {
            setEventLoading(false);
        }
    };

    const handleCancelEdit = () => {
        setEditEventMode(false);
        setSelectedEvent(null);
        setEventTitle('');
        setEventDescription('');
        setEventLocation('');
        setEventStartDate('');
        setEventEndDate('');
        setEventCapacity(0);
        setEventImageUrl('');
    };

    function EventList() {
        if (eventsLoading) return <CircularProgress sx={{ my: 2 }} />;
        if (events.length === 0) return <Typography color="#64748b" sx={{ my: 2 }}>Henüz etkinlik yok.</Typography>;
        return (
            <Box>
                {events.map(event => (
                    <Paper key={event.id} sx={{ p: 2, mb: 2, borderRadius: 3 }}>
                        <Typography variant="subtitle1" fontWeight={700} color="#2563eb">{event.title}</Typography>
                        <Typography color="#334155">{event.description}</Typography>
                        <Typography color="#64748b" fontSize={14} mt={1}>{new Date(event.startDate).toLocaleString()} - {new Date(event.endDate).toLocaleString()}</Typography>
                        <Typography color="#64748b" fontSize={14}>Yer: {event.location}</Typography>
                        <Typography color="#64748b" fontSize={14}>Kapasite: {event.capacity}</Typography>
                        <Button variant="outlined" color="primary" size="small" sx={{ mt: 1 }} onClick={() => handleEditEvent(event)}>Düzenle</Button>
                    </Paper>
                ))}
            </Box>
        );
    }

    function MemberList() {
        if (membersLoading) return <CircularProgress sx={{ my: 2 }} />;
        if (members.length === 0) return <Typography color="#64748b" sx={{ my: 2 }}>Henüz üye yok.</Typography>;
        return (
            <Box>
                {members.map(member => {
                    const isAdmin = club && club.memberRoles[member.id] === 'admin';
                    return (
                        <Paper key={member.id} sx={{ p: 2, mb: 2, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box>
                                <Typography fontWeight={600}>{member.displayName}</Typography>
                                <Typography color="#64748b" fontSize={14}>{member.email}</Typography>
                            </Box>
                            {isAdmin ? (
                                <Box><span style={{color:'#2563eb', fontWeight:600, fontSize:14, marginLeft:8}}>Yönetici</span></Box>
                            ) : (
                                <Button variant="outlined" color="error" size="small" onClick={() => handleRemoveMember(member.id)} disabled={removeLoading === member.id}>{removeLoading === member.id ? 'Çıkarılıyor...' : 'Kulüpten Çıkar'}</Button>
                            )}
                        </Paper>
                    );
                })}
            </Box>
        );
    }

    function UserInviteList() {
        if (usersLoading) return <CircularProgress sx={{ my: 2 }} />;
        if (allUsers.length === 0) return <Typography color="#64748b" sx={{ my: 2 }}>Kullanıcı bulunamadı.</Typography>;
        // Filtreli kullanıcılar
        const filteredUsers = allUsers.filter(userItem =>
            userItem.displayName.toLowerCase().includes(userFilter.toLowerCase()) ||
            userItem.email.toLowerCase().includes(userFilter.toLowerCase())
        );
        return (
            <Box>
                <TextField
                    label="Kullanıcı Ara"
                    value={userFilter}
                    onChange={e => setUserFilter(e.target.value)}
                    fullWidth
                    sx={{ mb: 2 }}
                />
                <Box sx={{ maxHeight: 350, overflowY: 'auto' }}>
                    {filteredUsers.length === 0 ? (
                        <Typography color="#64748b">Sonuç bulunamadı.</Typography>
                    ) : (
                        filteredUsers.map(userItem => {
                            const isMember = club && club.memberIds.includes(userItem.id);
                            const isInvited = pendingInvites.some(i => i.receiverId === userItem.id);
                            return (
                                <Paper key={userItem.id} sx={{ p: 2, mb: 2, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Box>
                                        <Typography fontWeight={600}>{userItem.displayName}</Typography>
                                        <Typography color="#64748b" fontSize={14}>{userItem.email}</Typography>
                                    </Box>
                                    <Button variant="outlined" color="primary" size="small" onClick={() => handleInviteUser(userItem)} disabled={isMember || isInvited || inviteLoading === userItem.id}>
                                        {isMember ? 'Üye' : isInvited ? 'Davet Edildi' : inviteLoading === userItem.id ? 'Gönderiliyor...' : 'Davet Et'}
                                    </Button>
                                </Paper>
                            );
                        })
                    )}
                </Box>
            </Box>
        );
    }

    if (loading) {
        return <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh"><CircularProgress /></Box>;
    }
    if (!user) {
        return <Typography>Kullanıcı bulunamadı.</Typography>;
    }
    if (!club) {
        return (
            <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', width: '100%', py: 6, px: { xs: 2, md: 8 }, marginLeft: `${drawerWidth}px` }}>
                <Typography color="error" variant="h5" fontWeight={700}>Yönetici olduğunuz bir kulüp bulunamadı.</Typography>
                <Typography color="#64748b" mt={2}>Bu sayfaya sadece bir kulübün yöneticisiyseniz erişebilirsiniz.</Typography>
                <Box mt={6}>
                    <ClubRequests isAdmin={false} userId={user.id} userName={user.displayName} />
                </Box>
            </Box>
        );
    }

    return (
        <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', width: '100%', py: 6, px: { xs: 2, md: 8 }, marginLeft: `${drawerWidth}px` }}>
            <Typography variant="h4" fontWeight={700} color="#2563eb" mb={3}>Kulübüm Yönetim Paneli</Typography>
            <Paper sx={{ p: 3, borderRadius: 4, mb: 4 }}>
                {editMode ? (
                    <>
                        <TextField
                            label="Kulüp Adı"
                            value={editName}
                            onChange={e => setEditName(e.target.value)}
                            fullWidth
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            label="Açıklama"
                            value={editDescription}
                            onChange={e => setEditDescription(e.target.value)}
                            fullWidth
                            multiline
                            minRows={2}
                            sx={{ mb: 2 }}
                        />
                        <Button variant="contained" color="primary" onClick={handleEditSave} sx={{ mr: 2 }}>Kaydet</Button>
                        <Button variant="outlined" color="secondary" onClick={() => setEditMode(false)}>İptal</Button>
                    </>
                ) : (
                    <>
                        <Typography variant="h6" fontWeight={700} color="#2563eb">{club.name}</Typography>
                        <Typography color="#334155" mb={2}>{club.description}</Typography>
                        <Button variant="outlined" color="primary" onClick={() => setEditMode(true)}>Düzenle</Button>
                    </>
                )}
            </Paper>
            <Paper sx={{ p: 3, borderRadius: 4, mb: 4 }}>
                <Typography variant="h6" fontWeight={700} color="#2563eb" mb={2}>{editEventMode ? 'Etkinlik Düzenle' : 'Etkinlik Oluştur'}</Typography>
                <TextField label="Başlık" value={eventTitle} onChange={e => setEventTitle(e.target.value)} fullWidth sx={{ mb: 2 }} />
                <TextField label="Açıklama" value={eventDescription} onChange={e => setEventDescription(e.target.value)} fullWidth multiline minRows={2} sx={{ mb: 2 }} />
                <TextField label="Yer" value={eventLocation} onChange={e => setEventLocation(e.target.value)} fullWidth sx={{ mb: 2 }} />
                <TextField label="Başlangıç Tarihi" type="datetime-local" value={eventStartDate} onChange={e => setEventStartDate(e.target.value)} fullWidth sx={{ mb: 2 }} InputLabelProps={{ shrink: true }} />
                <TextField label="Bitiş Tarihi" type="datetime-local" value={eventEndDate} onChange={e => setEventEndDate(e.target.value)} fullWidth sx={{ mb: 2 }} InputLabelProps={{ shrink: true }} />
                <TextField label="Kapasite" type="number" value={eventCapacity} onChange={e => setEventCapacity(Number(e.target.value))} fullWidth sx={{ mb: 2 }} />
                <TextField label="Görsel URL (opsiyonel)" value={eventImageUrl} onChange={e => setEventImageUrl(e.target.value)} fullWidth sx={{ mb: 2 }} />
                {editEventMode ? (
                    <>
                        <Button variant="contained" color="primary" onClick={handleUpdateEvent} disabled={eventLoading} sx={{ mr: 2 }}>{eventLoading ? 'Güncelleniyor...' : 'Kaydet'}</Button>
                        <Button variant="outlined" color="secondary" onClick={handleCancelEdit}>İptal</Button>
                    </>
                ) : (
                    <Button variant="contained" color="primary" onClick={handleCreateEvent} disabled={eventLoading}>{eventLoading ? 'Oluşturuluyor...' : 'Etkinlik Oluştur'}</Button>
                )}
            </Paper>
            <Paper sx={{ p: 3, borderRadius: 4, mb: 4 }}>
                <Typography variant="h6" fontWeight={700} color="#2563eb" mb={2}>Etkinlikler</Typography>
                <EventList />
            </Paper>
            <Paper sx={{ p: 3, borderRadius: 4, mb: 4 }}>
                <Typography variant="h6" fontWeight={700} color="#2563eb" mb={2}>Kulüp Üyeleri</Typography>
                <MemberList />
            </Paper>
            <Paper sx={{ p: 3, borderRadius: 4, mb: 4 }}>
                <Typography variant="h6" fontWeight={700} color="#2563eb" mb={2}>Kullanıcıları Davet Et</Typography>
                <UserInviteList />
            </Paper>
            <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
} 