import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Grid, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Snackbar, Alert, Chip } from '@mui/material';
import { clubInvitationServices, clubServices, userServices } from '../../services/firestore';
import { ClubInvitation as ClubInvitationBase, User } from '../../types/models';

type ClubInvitation = ClubInvitationBase & { id: string };

export default function ClubRequests() {
    const [requests, setRequests] = useState<ClubInvitation[]>([]);
    const [users, setUsers] = useState<Record<string, User>>({});
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState<ClubInvitation | null>(null);
    const [processing, setProcessing] = useState(false);
    const [snackbar, setSnackbar] = useState<{open: boolean, message: string, severity: 'success'|'error'}>({open: false, message: '', severity: 'success'});

    useEffect(() => {
        const fetchData = async () => {
            try {
                const allInvitations = await clubInvitationServices.getAll();
                setRequests(allInvitations);

                // Kullanıcı bilgilerini çek
                const allUsers = await userServices.getAll();
                const userMap = allUsers.reduce((acc, user) => {
                    acc[user.id] = user;
                    return acc;
                }, {} as Record<string, User>);
                setUsers(userMap);
            } catch (error) {
                console.error('Veri çekme hatası:', error);
                setSnackbar({open: true, message: 'Veriler yüklenirken hata oluştu.', severity: 'error'});
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleApprove = async () => {
        if (!selectedRequest) return;
        setProcessing(true);
        try {
            // 1. Kulübü oluştur
            const clubId = await clubServices.create({
                name: selectedRequest.clubName,
                description: "",
                type: "Sosyal",
                tags: [],
                activities: [],
                requiredSkills: [],
                meetingTime: "",
                memberIds: [selectedRequest.senderId],
                memberRoles: { [selectedRequest.senderId]: 'admin' },
                eventIds: []
            });

            // 2. İsteği güncelle (ID ile)
            await clubInvitationServices.update(selectedRequest.id, {
                status: 'approved'
            });

            // 3. Kullanıcıyı kulübe ekle
            await userServices.joinClub(selectedRequest.senderId, clubId, 'admin');

            // 4. State'i güncelle
            setRequests(prev => prev.map(req =>
                req.id === selectedRequest.id
                    ? { ...req, status: 'approved' }
                    : req
            ));

            setSnackbar({open: true, message: 'Kulüp başarıyla oluşturuldu.', severity: 'success'});
            setSelectedRequest(null);
        } catch (err) {
            setSnackbar({open: true, message: 'İşlem sırasında hata oluştu.', severity: 'error'});
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!selectedRequest) return;
        setProcessing(true);
        try {
            await clubInvitationServices.update(selectedRequest.id, {
                status: 'rejected'
            });

            setRequests(prev => prev.map(req =>
                req.id === selectedRequest.id
                    ? { ...req, status: 'rejected' }
                    : req
            ));

            setSnackbar({open: true, message: 'İstek reddedildi.', severity: 'success'});
            setSelectedRequest(null);
        } catch (err) {
            setSnackbar({open: true, message: 'İşlem sırasında hata oluştu.', severity: 'error'});
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
            <Typography>Yükleniyor...</Typography>
        </Box>;
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" fontWeight={700} color="#2563eb" mb={4}>
                Kulüp Kurma İstekleri
            </Typography>

            <Grid container spacing={3}>
                {requests.length === 0 ? (
                    <Grid item xs={12}>
                        <Typography color="#64748b">Bekleyen kulüp kurma isteği yok.</Typography>
                    </Grid>
                ) : requests.map((request) => (
                    <Grid item xs={12} sm={6} md={4} key={request.clubName + request.createdAt}>
                        <Paper elevation={0} sx={{
                            p: 3,
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
                                {request.clubName}
                            </Typography>
                            <Typography variant="caption" color="#64748b" display="block" gutterBottom>
                                İstek Sahibi: {users[request.senderId]?.displayName || 'Bilinmiyor'}
                            </Typography>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                                <Chip 
                                    label={
                                        request.status === 'pending' ? 'Beklemede' :
                                        request.status === 'approved' ? 'Onaylandı' : 'Reddedildi'
                                    }
                                    color={
                                        request.status === 'pending' ? 'warning' :
                                        request.status === 'approved' ? 'success' : 'error'
                                    }
                                    size="small"
                                />
                                {request.status === 'pending' && (
                                    <Button
                                        variant="outlined"
                                        color="primary"
                                        size="small"
                                        onClick={() => setSelectedRequest(request)}
                                    >
                                        İncele
                                    </Button>
                                )}
                            </Box>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            {/* İnceleme Dialogu */}
            <Dialog open={!!selectedRequest} onClose={() => setSelectedRequest(null)}>
                <DialogTitle>Kulüp Kurma İsteğini İncele</DialogTitle>
                <DialogContent>
                    {selectedRequest && (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle1" gutterBottom>
                                Kulüp Adı: {selectedRequest.clubName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                                İstek Sahibi: {users[selectedRequest.senderId]?.displayName || 'Bilinmiyor'}
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSelectedRequest(null)} color="secondary">
                        İptal
                    </Button>
                    <Button onClick={handleReject} color="error" disabled={processing}>
                        Reddet
                    </Button>
                    <Button onClick={handleApprove} color="primary" variant="contained" disabled={processing}>
                        Onayla
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
} 