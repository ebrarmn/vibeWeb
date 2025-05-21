import React, { useState } from 'react';
import {
    Box,
    Button,
    Paper,
    Typography,
    CircularProgress,
    Alert,
    Stack,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import { updateClubLeaderIds } from '../firebase/config';

export default function DatabaseManager() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{
        success: boolean;
        message: string;
        updatedCount?: number;
        skippedCount?: number;
    } | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);

    const handleUpdateLeaderIds = async () => {
        setLoading(true);
        setResult(null);
        try {
            const result = await updateClubLeaderIds();
            setResult(result);
        } catch (error) {
            setResult({
                success: false,
                message: 'İşlem sırasında bir hata oluştu.'
            });
        } finally {
            setLoading(false);
            setConfirmOpen(false);
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Paper
                elevation={3}
                sx={{
                    p: 3,
                    borderRadius: 2,
                    background: 'background.paper'
                }}
            >
                <Typography variant="h6" gutterBottom>
                    Veritabanı Yönetimi
                </Typography>

                <Stack spacing={3}>
                    <Box>
                        <Typography variant="subtitle1" gutterBottom>
                            Kulüp Lider ID'leri Güncelleme
                        </Typography>
                        <Typography variant="body2" color="textSecondary" paragraph>
                            Bu işlem, lider ID'si olmayan kulüplere ilk admin ID'sini lider ID olarak atayacaktır.
                        </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => setConfirmOpen(true)}
                            disabled={loading}
                            sx={{ mt: 1 }}
                        >
                            {loading ? 'İşlem Yapılıyor...' : 'Lider ID\'leri Güncelle'}
                        </Button>
                    </Box>

                    {result && (
                        <Alert
                            severity={result.success ? 'success' : 'error'}
                            sx={{ mt: 2 }}
                        >
                            {result.message}
                            {result.success && result.updatedCount !== undefined && (
                                <Typography variant="body2" sx={{ mt: 1 }}>
                                    Güncellenen: {result.updatedCount} kulüp
                                    {result.skippedCount !== undefined && (
                                        <> | Atlanan: {result.skippedCount} kulüp</>
                                    )}
                                </Typography>
                            )}
                        </Alert>
                    )}
                </Stack>
            </Paper>

            <Dialog
                open={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>İşlemi Onayla</DialogTitle>
                <DialogContent>
                    <Typography>
                        Bu işlem, lider ID'si olmayan tüm kulüplere ilk admin ID'sini lider ID olarak atayacaktır.
                        Bu işlem geri alınamaz. Devam etmek istediğinizden emin misiniz?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmOpen(false)}>
                        İptal
                    </Button>
                    <Button
                        onClick={handleUpdateLeaderIds}
                        variant="contained"
                        color="primary"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <CircularProgress size={20} sx={{ mr: 1 }} />
                                İşlem Yapılıyor...
                            </>
                        ) : (
                            'Onayla ve Devam Et'
                        )}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
} 