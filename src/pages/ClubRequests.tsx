import React, { useEffect, useState } from 'react';
import {
    Container,
    Typography,
    Card,
    CardContent,
    CardActions,
    Button,
    Box,
    CircularProgress
} from '@mui/material';
import { pendingClubServices } from '../services/firestore';

export default function ClubRequests() {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);

    const fetchRequests = async () => {
        setLoading(true);
        const data = await pendingClubServices.getAll();
        setRequests(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleApprove = async (req: any) => {
        setProcessing(req.id);
        await pendingClubServices.approve(req);
        await fetchRequests();
        setProcessing(null);
    };

    const handleReject = async (id: string) => {
        setProcessing(id);
        await pendingClubServices.reject(id);
        await fetchRequests();
        setProcessing(null);
    };

    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
                Kulüp Başvuru İstekleri
            </Typography>
            {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
                    <CircularProgress />
                </Box>
            ) : requests.length === 0 ? (
                <Typography>Bekleyen başvuru yok.</Typography>
            ) : (
                requests.map(req => (
                    <Card key={req.id} sx={{ mb: 3 }}>
                        <CardContent>
                            <Typography variant="h6">{req.name}</Typography>
                            <Typography color="text.secondary">Açıklama: {req.description}</Typography>
                            <Typography color="text.secondary">Aktiviteler: {req.activities}</Typography>
                            <Typography color="text.secondary">Hedef Kitle: {req.targetAudience}</Typography>
                            <Typography color="text.secondary">Başvuran Kullanıcı ID: {req.createdBy}</Typography>
                            <Typography color="text.secondary">Tarih: {req.createdAt?.toDate?.().toLocaleString?.() || String(req.createdAt)}</Typography>
                        </CardContent>
                        <CardActions>
                            <Button
                                variant="contained"
                                color="success"
                                disabled={processing === req.id}
                                onClick={() => handleApprove(req)}
                            >
                                Kabul Et
                            </Button>
                            <Button
                                variant="outlined"
                                color="error"
                                disabled={processing === req.id}
                                onClick={() => handleReject(req.id)}
                            >
                                Reddet
                            </Button>
                        </CardActions>
                    </Card>
                ))
            )}
        </Container>
    );
} 