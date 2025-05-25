import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Grid, Chip } from '@mui/material';
import { eventServices, clubServices } from '../services/firestore';
import { Event, Club } from '../types/models';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface LayoutContext {
    collapsed: boolean;
    drawerWidth: number;
}

export default function UserEvents() {
    const [events, setEvents] = useState<Event[]>([]);
    const [clubs, setClubs] = useState<Club[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const { drawerWidth } = useOutletContext<LayoutContext>();
    const { userData, loading: authLoading } = useAuth();
    const [buttonLoading, setButtonLoading] = useState<{ [eventId: string]: boolean }>({});
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        Promise.all([
            eventServices.getAll(),
            clubServices.getAll()
        ]).then(([allEvents, allClubs]) => {
            setEvents(allEvents);
            setClubs(allClubs);
            setLoading(false);
        });
    }, []);

    function canJoinEvent(event: Event): boolean {
        if (!userData) return false;
        // Etkinlik geçmiş mi?
        const now = new Date();
        const eventStart = new Date(event.startDate || (event as any).date);
        if (eventStart < now) return false;
        // Kullanıcı kulübe üye mi? (id'leri normalize et)
        const userClubIds = userData.clubIds.map(id => id.trim().toLowerCase());
        const eventClubId = (event.clubId || '').trim().toLowerCase();
        if (!userClubIds.includes(eventClubId)) return false;
        // attendeeIds'i güvenli şekilde al
        const attendeeIds: string[] = Array.isArray(event.attendeeIds) ? event.attendeeIds : [];
        // Etkinlik dolu mu?
        if (attendeeIds.length >= event.capacity) return false;
        // Kullanıcı zaten katıldı mı?
        if (attendeeIds.includes(userData.id)) return false;
        return true;
    }

    async function handleJoinEvent(event: Event) {
        if (!userData) {
            setErrorMessage('Etkinliğe katılmak için giriş yapmalısınız!');
            return;
        }
        setButtonLoading(prev => ({ ...prev, [event.id]: true }));
        setErrorMessage(null);
        try {
            await eventServices.registerAttendee(event.id, userData.id);
            // Katılımcı listesini güncelle
            setEvents(prevEvents => prevEvents.map(ev =>
                ev.id === event.id
                    ? { ...ev, attendeeIds: Array.isArray(ev.attendeeIds) ? [...ev.attendeeIds, userData.id] : [userData.id] }
                    : ev
            ));
        } catch (err: any) {
            setErrorMessage('Katılım sırasında hata oluştu: ' + (err?.message || 'Bilinmeyen hata'));
        } finally {
            setButtonLoading(prev => ({ ...prev, [event.id]: false }));
        }
    }

    async function handleLeaveEvent(event: Event) {
        if (!userData) return;
        setButtonLoading(prev => ({ ...prev, [event.id]: true }));
        setErrorMessage(null);
        try {
            await eventServices.removeAttendee(event.id, userData.id);
            setEvents(prevEvents => prevEvents.map(ev =>
                ev.id === event.id
                    ? { ...ev, attendeeIds: Array.isArray(ev.attendeeIds) ? ev.attendeeIds.filter((id: string) => id !== userData.id) : [] }
                    : ev
            ));
        } catch (err: any) {
            setErrorMessage('Ayrılırken hata oluştu: ' + (err?.message || 'Bilinmeyen hata'));
        } finally {
            setButtonLoading(prev => ({ ...prev, [event.id]: false }));
        }
    }

    if (loading) {
        return <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">Yükleniyor...</Box>;
    }
    return (
        <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', width: '100%', py: 6, px: { xs: 2, md: 8 }, marginLeft: `${drawerWidth}px`, paddingLeft: { xs: 2, md: 5 }, transition: 'margin-left 0.2s, padding-left 0.2s' }}>
            <Typography variant="h4" fontWeight={700} color="#2563eb" mb={4}>Tüm Etkinlikler</Typography>
            {events.length === 0 ? (
                <Typography color="#334155">Hiç etkinlik bulunamadı.</Typography>
            ) : (
                <Grid container spacing={3}>
                    {events.map(event => {
                        const club = clubs.find(c => c.id === event.clubId);
                        // Tarih gösterimini ve kontrolünü normalize et
                        const eventStart = new Date(event.startDate || (event as any).date);
                        const eventEnd = new Date(event.endDate || (event as any).date);
                        // attendeeIds'i güvenli şekilde al
                        const attendeeIds: string[] = Array.isArray(event.attendeeIds) ? event.attendeeIds : [];
                        const isJoinable = canJoinEvent(event);
                        const isJoined = userData && attendeeIds.includes(userData.id);
                        const isPast = eventStart < new Date();
                        const isFull = attendeeIds.length >= event.capacity;
                        const notMember = userData && !userData.clubIds.map(id => id.trim().toLowerCase()).includes((event.clubId || '').trim().toLowerCase());
                        return (
                            <Grid item xs={12} sm={6} md={4} key={event.id}>
                                <Paper elevation={0} sx={{
                                    minWidth: 220,
                                    px: 3,
                                    py: 2.5,
                                    mb: 3,
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
                                        {club ? club.name : 'Kulüp Bilgisi Yok'}
                                    </Typography>
                                    <Typography variant="h6" fontWeight={800} color="#2563eb" gutterBottom>
                                        {event.title}
                                    </Typography>
                                    <Typography variant="body2" color="#334155" paragraph>
                                        {event.description}
                                    </Typography>
                                    <Box display="flex" flexDirection="column" gap={0.5} mb={1}>
                                        <Typography variant="caption" color="#64748b">
                                            <b>Tarih:</b> {isNaN(eventStart.getTime()) ? '-' : eventStart.toLocaleDateString()} {isNaN(eventStart.getTime()) ? '' : (" - " + eventStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))}
                                        </Typography>
                                        <Typography variant="caption" color="#64748b">
                                            <b>Bitiş:</b> {isNaN(eventEnd.getTime()) ? '-' : eventEnd.toLocaleDateString()} {isNaN(eventEnd.getTime()) ? '' : (" - " + eventEnd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))}
                                        </Typography>
                                        <Typography variant="caption" color="#64748b">
                                            <b>Konum:</b> {event.location}
                                        </Typography>
                                        <Typography variant="caption" color="#64748b">
                                            <b>Kapasite:</b> {event.capacity}
                                        </Typography>
                                        <Typography variant="caption" color="#64748b">
                                            <b>Katılımcı Sayısı:</b> {attendeeIds.length || 0}
                                        </Typography>
                                    </Box>
                                    {isFull && (
                                        <Chip label="Dolu" color="error" size="small" />
                                    )}
                                    <Box mt={2}>
                                        {isJoined ? (
                                            <button
                                                style={{
                                                    padding: '8px 16px',
                                                    background: '#ef4444',
                                                    color: '#fff',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    cursor: buttonLoading[event.id] ? 'not-allowed' : 'pointer',
                                                    fontWeight: 600,
                                                    opacity: buttonLoading[event.id] ? 0.7 : 1
                                                }}
                                                onClick={() => handleLeaveEvent(event)}
                                                disabled={buttonLoading[event.id]}
                                            >
                                                {buttonLoading[event.id] ? 'İşleniyor...' : 'Etkinlikten Ayrıl'}
                                            </button>
                                        ) : (
                                            <button
                                                style={{
                                                    padding: '8px 16px',
                                                    background: isJoinable ? '#2563eb' : '#94a3b8',
                                                    color: '#fff',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    cursor: buttonLoading[event.id] || !isJoinable ? 'not-allowed' : 'pointer',
                                                    fontWeight: 600,
                                                    opacity: buttonLoading[event.id] ? 0.7 : 1
                                                }}
                                                onClick={() => handleJoinEvent(event)}
                                                disabled={buttonLoading[event.id] || !isJoinable}
                                            >
                                                {isPast
                                                    ? 'Geçmiş Etkinlik'
                                                    : notMember
                                                        ? 'Kulübe Üye Olmalısınız'
                                                        : isFull
                                                            ? 'Dolu'
                                                            : buttonLoading[event.id]
                                                                ? 'İşleniyor...'
                                                                : 'Etkinliğe Katıl'}
                                            </button>
                                        )}
                                    </Box>
                                </Paper>
                            </Grid>
                        );
                    })}
                </Grid>
            )}
            {errorMessage && (
                <Box mb={2}>
                    <Typography color="error" fontWeight={600}>{errorMessage}</Typography>
                </Box>
            )}
        </Box>
    );
} 