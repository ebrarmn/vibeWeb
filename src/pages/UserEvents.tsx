import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Grid, Chip } from '@mui/material';
import { eventServices, clubServices } from '../services/firestore';
import { Event, Club } from '../types/models';
import { useOutletContext } from 'react-router-dom';

interface LayoutContext {
    collapsed: boolean;
    drawerWidth: number;
}

export default function UserEvents() {
    const [events, setEvents] = useState<Event[]>([]);
    const [clubs, setClubs] = useState<Club[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const { drawerWidth } = useOutletContext<LayoutContext>();

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
                                            <b>Tarih:</b> {new Date(event.startDate).toLocaleDateString()} {event.startDate && (" - " + new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))}
                                        </Typography>
                                        <Typography variant="caption" color="#64748b">
                                            <b>Bitiş:</b> {new Date(event.endDate).toLocaleDateString()} {event.endDate && (" - " + new Date(event.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))}
                                        </Typography>
                                        <Typography variant="caption" color="#64748b">
                                            <b>Konum:</b> {event.location}
                                        </Typography>
                                        <Typography variant="caption" color="#64748b">
                                            <b>Kapasite:</b> {event.capacity}
                                        </Typography>
                                        <Typography variant="caption" color="#64748b">
                                            <b>Katılımcı Sayısı:</b> {event.attendeeIds?.length || 0}
                                        </Typography>
                                    </Box>
                                    {event.attendeeIds?.length >= event.capacity && (
                                        <Chip label="Dolu" color="error" size="small" />
                                    )}
                                </Paper>
                            </Grid>
                        );
                    })}
                </Grid>
            )}
        </Box>
    );
} 