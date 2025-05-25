import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Grid, Chip } from '@mui/material';
import { clubServices, eventServices, userServices } from '../services/firestore';
import { Club, Event } from '../types/models';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface LayoutContext {
    collapsed: boolean;
    drawerWidth: number;
}

export default function UserClubs() {
    const [clubs, setClubs] = useState<Club[]>([]);
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const { drawerWidth } = useOutletContext<LayoutContext>();
    const [joinedClubs, setJoinedClubs] = useState<{ [clubId: string]: boolean }>({});
    const { userData, loading: authLoading } = useAuth();
    const [buttonLoading, setButtonLoading] = useState<{ [clubId: string]: boolean }>({});
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    console.log('userData:', userData);

    useEffect(() => {
        Promise.all([
            clubServices.getAll(),
            eventServices.getAll()
        ]).then(([allClubs, allEvents]) => {
            setClubs(allClubs);
            setEvents(allEvents);
            setLoading(false);
        });
    }, []);

    useEffect(() => {
        if (!userData || clubs.length === 0) return;
        const userClubIds = clubs.filter(club => club.memberIds?.includes(userData.id)).map(club => club.id);
        setJoinedClubs(
            clubs.reduce((acc, club) => {
                acc[club.id] = userClubIds.includes(club.id);
                return acc;
            }, {} as { [clubId: string]: boolean })
        );
    }, [userData, clubs]);

    async function handleJoinLeaveClub(clubId: string) {
        if (!userData) return;
        setButtonLoading(prev => ({ ...prev, [clubId]: true }));
        setErrorMessage(null);
        try {
            if (joinedClubs[clubId]) {
                await Promise.all([
                    clubServices.removeMember(clubId, userData.id),
                    userServices.leaveClub(userData.id, clubId)
                ]);
            } else {
                await Promise.all([
                    clubServices.addMember(clubId, userData.id, 'member'),
                    userServices.joinClub(userData.id, clubId, 'member')
                ]);
            }
            setJoinedClubs(prev => ({
                ...prev,
                [clubId]: !prev[clubId]
            }));
        } catch (err: any) {
            setErrorMessage('Bir hata oluştu: ' + (err?.message || 'Bilinmeyen hata'));
            console.error('Kulüp katıl/ayrıl hatası:', err);
        } finally {
            setButtonLoading(prev => ({ ...prev, [clubId]: false }));
        }
    }

    // Kullanıcı giriş yapmamışsa butonlar tıklanınca uyarı versin
    function handleButtonClick(clubId: string) {
        if (!userData) {
            alert('Kulübe katılmak için giriş yapmalısınız!');
            return;
        }
        handleJoinLeaveClub(clubId);
    }

    if (authLoading) {
        return <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">Yükleniyor...</Box>;
    }
    return (
        <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', width: '100%', py: 6, px: { xs: 2, md: 8 }, marginLeft: `${drawerWidth}px`, paddingLeft: { xs: 2, md: 5 }, transition: 'margin-left 0.2s, padding-left 0.2s' }}>
            <Typography variant="h4" fontWeight={700} color="#2563eb" mb={4}>Tüm Kulüpler</Typography>
            {errorMessage && (
                <Box mb={2}>
                    <Typography color="error" fontWeight={600}>{errorMessage}</Typography>
                </Box>
            )}
            {clubs.length === 0 ? (
                <Typography color="#334155">Hiç kulüp bulunamadı.</Typography>
            ) : (
                <Grid container spacing={3}>
                    {clubs.map(club => {
                        const clubEventCount = events.filter(e => e.clubId === club.id).length;
                        const adminCount = club.memberRoles ? Object.values(club.memberRoles).filter(role => role === 'admin').length : 0;
                        const isJoined: boolean = joinedClubs[club.id] || false;
                        return (
                            <Grid item xs={12} sm={6} md={4} key={club.id}>
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
                                    <Typography variant="h6" fontWeight={700} color="#2563eb" gutterBottom>
                                        {club.name}
                                    </Typography>
                                    <Typography variant="body2" color="#334155" paragraph>
                                        {club.description}
                                    </Typography>
                                    <Box display="flex" flexDirection="column" gap={0.5} mb={1}>
                                        <Typography variant="caption" color="#64748b">
                                            <b>Üye Sayısı:</b> {club.memberIds?.length || 0}
                                        </Typography>
                                        <Typography variant="caption" color="#64748b">
                                            <b>Etkinlik Sayısı:</b> {clubEventCount}
                                        </Typography>
                                        <Typography variant="caption" color="#64748b">
                                            <b>Yönetici Sayısı:</b> {adminCount}
                                        </Typography>
                                        <Typography variant="caption" color="#64748b">
                                            <b>Kuruluş Tarihi:</b> {club.createdAt ? new Date(club.createdAt).toLocaleDateString() : '-'}
                                        </Typography>
                                    </Box>
                                    {adminCount === 0 && (
                                        <Chip label="Yönetici Yok" color="warning" size="small" />
                                    )}
                                    <Box mt={2}>
                                        <button
                                            style={{
                                                padding: '8px 16px',
                                                background: isJoined ? '#ef4444' : '#2563eb',
                                                color: '#fff',
                                                border: 'none',
                                                borderRadius: '8px',
                                                cursor: buttonLoading[club.id] ? 'not-allowed' : 'pointer',
                                                fontWeight: 600,
                                                opacity: buttonLoading[club.id] ? 0.7 : 1
                                            }}
                                            onClick={() => handleButtonClick(club.id)}
                                            disabled={!!buttonLoading[club.id]}
                                        >
                                            {buttonLoading[club.id]
                                                ? 'İşleniyor...'
                                                : isJoined
                                                    ? 'Kulüpten Ayrıl'
                                                    : 'Kulübe Katıl'}
                                        </button>
                                    </Box>
                                </Paper>
                            </Grid>
                        );
                    })}
                </Grid>
            )}
        </Box>
    );
} 