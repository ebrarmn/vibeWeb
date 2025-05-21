import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';
import { clubServices, eventServices } from '../services/firestore';
import { Club, Event } from '../types/models';
import { useOutletContext } from 'react-router-dom';

interface LayoutContext {
    collapsed: boolean;
    drawerWidth: number;
}

export default function Homepage() {
    const [clubs, setClubs] = useState<Club[]>([]);
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const { drawerWidth } = useOutletContext<LayoutContext>();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const [clubList, eventList] = await Promise.all([
                clubServices.getAll(),
                eventServices.getAll()
            ]);
            setClubs(clubList);
            setEvents(eventList);
            setLoading(false);
        };
        fetchData();
    }, []);

    if (loading) {
        return <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">Yükleniyor...</Box>;
    }

    // ClubId -> ClubName eşlemesi
    const clubMap: Record<string, string> = {};
    clubs.forEach((club) => { clubMap[club.id] = club.name; });

    return (
        <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', width: '100%', py: 6, px: { xs: 2, md: 8 }, marginLeft: `${drawerWidth}px`, paddingLeft: { xs: 2, md: 5 }, transition: 'margin-left 0.2s, padding-left 0.2s' }}>
            <Box mb={4}>
                <Typography variant="h3" fontWeight={900} color="#2563eb" letterSpacing={1.5} mb={1}>
                    VIBE
                </Typography>
                <Typography variant="h6" color="#334155" fontWeight={400}>
                    Virtual Interactive Belonging Engagement
                </Typography>
            </Box>
            {/* Kulüpler */}
            <Typography variant="h4" fontWeight={700} color="#2563eb" mb={3}>Kulüpler</Typography>
            <Grid container spacing={3} mb={5}>
                {clubs.map((club) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={club.id}>
                        <Paper elevation={0} sx={{
                            minWidth: 220,
                            px: 3,
                            py: 2.5,
                            borderRadius: 4,
                            bgcolor: 'rgba(255,255,255,0.75)',
                            boxShadow: '0 4px 24px 0 rgba(80,120,200,0.10)',
                            transition: 'box-shadow 0.2s, background 0.2s',
                            '&:hover': {
                                boxShadow: '0 8px 32px 0 rgba(80,120,200,0.18)',
                                bgcolor: 'rgba(222,242,255,0.85)',
                            },
                        }}>
                            <Typography variant="h6" fontWeight={700} color="#2563eb">{club.name}</Typography>
                            <Typography variant="body2" color="#334155">{club.description}</Typography>
                        </Paper>
                    </Grid>
                ))}
            </Grid>
            {/* Etkinlikler */}
            <Typography variant="h4" fontWeight={700} color="#2563eb" mb={3}>Etkinlikler</Typography>
            <Grid container spacing={3}>
                {events.map((event) => (
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
                            <Typography variant="subtitle2" fontWeight={700} color="#e11d48" gutterBottom noWrap>{clubMap[event.clubId] || ''}</Typography>
                            <Typography variant="h6" fontWeight={800} color="#2563eb" noWrap>{event.title}</Typography>
                            <Typography variant="body2" color="#334155" noWrap>{event.description}</Typography>
                            <Typography variant="caption" color="#64748b">{new Date(event.startDate).toLocaleDateString()} - {event.location}</Typography>
                        </Paper>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
} 