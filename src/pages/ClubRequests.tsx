import React, { useEffect, useState } from 'react';
import {
    Container,
    Typography,
    Card,
    CardContent,
    CardActions,
    Button,
    Box,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Chip
} from '@mui/material';
import { pendingClubServices } from '../services/firestore';

interface ClubRequestsProps {
    isAdmin?: boolean;
    userId?: string;
    userName?: string;
}

export default function ClubRequests({ isAdmin = false, userId, userName }: ClubRequestsProps) {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);
    // Yeni kulüp kurma isteği için state'ler
    const [createDialog, setCreateDialog] = useState(false);
    const [clubName, setClubName] = useState('');
    const [creating, setCreating] = useState(false);

    const fetchRequests = async () => {
        setLoading(true);
        let data;
        if (isAdmin) {
            data = await pendingClubServices.getAll();
        } else {
            data = userId ? (await pendingClubServices.getAll()).filter(req => req.createdBy === userId) : [];
        }
        setRequests(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchRequests();
        // eslint-disable-next-line
    }, []);

    // Admin panelinde onay/ret işlemleri için (gerekirse eklenebilir)
    // const handleApprove = async (req: any) => { ... }
    // const handleReject = async (id: string) => { ... }

    // Yeni kulüp kurma isteği gönderme fonksiyonu
    const handleCreateRequest = async () => {
        setCreating(true);
        try {
            await pendingClubServices.create({
                name: clubName.trim(),
                createdBy: userId,
                status: 'pending',
                createdAt: new Date()
            });
            setCreateDialog(false);
            setClubName('');
            fetchRequests();
        } finally {
            setCreating(false);
        }
    };

    return (
        <Container maxWidth="md" sx={{ mt: 4, bgcolor: '#fff', borderRadius: 2, boxShadow: 1, py: 3 }}>
            {!isAdmin && (
                <Box display="flex" justifyContent="flex-end" mb={3}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => setCreateDialog(true)}
                        sx={{ borderRadius: 2, fontWeight: 600, px: 3, py: 1 }}
                    >
                        Yeni Kulüp Kurma İsteği
                    </Button>
                </Box>
            )}
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: '#2563eb' }}>
                Kulüp Başvuru İstekleri
            </Typography>
            {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
                    <CircularProgress />
                </Box>
            ) : requests.length === 0 ? (
                <Typography sx={{ color: '#334155', fontWeight: 500 }}>Bekleyen başvuru yok.</Typography>
            ) : (
                requests.map(req => (
                    <Card key={req.id} sx={{ mb: 3 }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ color: '#2563eb', fontWeight: 700 }}>{req.name}</Typography>
                            <Typography sx={{ color: '#334155' }}>İstek Sahibi: {req.createdBy}</Typography>
                            <Typography sx={{ color: '#334155' }}>Tarih: {req.createdAt && req.createdAt.toDate ? req.createdAt.toDate().toLocaleString() : String(req.createdAt)}</Typography>
                            {!isAdmin && (
                                <Box mt={2}>
                                    <Chip
                                        label={req.status === 'approved' ? 'Onaylandı' : req.status === 'rejected' ? 'Reddedildi' : 'Beklemede'}
                                        color={req.status === 'approved' ? 'success' : req.status === 'rejected' ? 'error' : 'warning'}
                                        size="small"
                                    />
                                </Box>
                            )}
                        </CardContent>
                        {/* Admin panelinde onay/ret butonları eklenebilir */}
                    </Card>
                ))
            )}
            <Dialog open={createDialog} onClose={() => setCreateDialog(false)}>
                <DialogTitle>Yeni Kulüp Kurma İsteği</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="normal"
                        fullWidth
                        label="Kulüp Adı"
                        value={clubName}
                        onChange={e => setClubName(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCreateDialog(false)} color="secondary">İptal</Button>
                    <Button
                        onClick={handleCreateRequest}
                        color="primary"
                        variant="contained"
                        disabled={creating || !clubName.trim()}
                    >
                        Gönder
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
} 