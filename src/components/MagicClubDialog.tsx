import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, CircularProgress, Box, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { aiService } from '../services/aiService';
import PreferenceQuiz, { QuizAnswer } from './PreferenceQuiz';
import { UserPreferences, Club } from '../types/models';
import { useAuth } from '../contexts/AuthContext';
import { clubServices, userServices } from '../services/firestore';

interface MagicClubDialogProps {
  open: boolean;
  onClose: () => void;
  clubs?: Club[]; // Tüm kulüpler props ile alınacak
}

type AIResult = {
  personalityTraits: string[];
  recommendedClubs: string[];
  reasoning: string;
};

function mapQuizAnswersToPreferences(answers: QuizAnswer[]): UserPreferences {
  // Soru sırasına göre eşleştiriyoruz
  return {
    interests: [answers[0]?.answer || ''],
    hobbies: [answers[1]?.answer || ''],
    skills: [answers[2]?.answer || ''],
    preferredClubTypes: [answers[3]?.answer || ''],
    timeAvailability: answers[4]?.answer || '',
    preferredActivities: [] // Testte aktivite sorusu yok, boş bırakıyoruz
  };
}

export default function MagicClubDialog({ open, onClose, clubs = [] }: MagicClubDialogProps) {
  const [step, setStep] = useState<'quiz' | 'loading' | 'result'>('quiz');
  const [aiResult, setAIResult] = useState<AIResult | null>(null);
  const [joining, setJoining] = useState<string>('');
  const [joined, setJoined] = useState<{ [clubName: string]: boolean }>({});
  const { userData, setUserData } = useAuth();

  const handleQuizComplete = async (answers: QuizAnswer[]) => {
    setStep('loading');
    const preferences = mapQuizAnswersToPreferences(answers);
    const clubNames = clubs.map(c => c.name);
    try {
      const result = await aiService.analyzePreferences(preferences, clubNames);
      setAIResult(result);
      setStep('result');
    } catch (e) {
      setAIResult({
        personalityTraits: [],
        recommendedClubs: [],
        reasoning: 'Bir hata oluştu, lütfen tekrar deneyin.'
      });
      setStep('result');
    }
  };

  const handleJoinClub = async (clubName: string) => {
    if (!userData) return;
    setJoining(clubName);
    const club = clubs.find(c => c.name === clubName);
    if (!club) {
      setJoining('');
      alert('Kulüp bulunamadı!');
      return;
    }
    try {
      console.log('userData.id:', userData.id);
      const userInDb = await userServices.getById(userData.id);
      console.log('userInDb:', userInDb);
      if (!userInDb) {
        alert('Kullanıcı Firestore veritabanında bulunamadı!');
        setJoining('');
        return;
      }
      await userServices.joinClub(userData.id, club.id, 'member');
      const updatedUser = await userServices.getById(userData.id);
      if (updatedUser) setUserData(updatedUser);
      setJoined(prev => ({ ...prev, [clubName]: true }));
      alert('Kulübe başarıyla katıldınız!');
    } catch (e) {
      alert('Katılım sırasında hata oluştu: ' + (e as Error).message);
      console.error('Katılım hatası:', e);
    }
    setJoining('');
  };

  const handleClose = () => {
    setStep('quiz');
    setAIResult(null);
    setJoined({});
    onClose();
  };

  useEffect(() => {
    if (step === 'result' && aiResult) {
      console.log('AI önerdiği kulüpler:', aiResult.recommendedClubs);
      console.log('Veritabanındaki kulüpler:', clubs.map(c => c.name));
      if (userData) {
        console.log('Kullanıcının üye olduğu kulüp id\'leri:', userData.clubIds);
      }
    }
  }, [step, aiResult, clubs, userData]);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        Kendinize Göre Yeni Kulüp mü Arıyorsunuz?
        <IconButton onClick={handleClose} size="small"><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {step === 'quiz' && (
          <PreferenceQuiz onComplete={handleQuizComplete} />
        )}
        {step === 'loading' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 6 }}>
            <CircularProgress size={36} />
            <Typography mt={3}>Yapay zeka kulüp önerilerinizi hazırlıyor...</Typography>
          </Box>
        )}
        {step === 'result' && aiResult && (
          <Box>
            <Typography variant="h6" color="primary" mb={2}>Yapay Zeka Kulüp Önerileri</Typography>
            <Typography variant="subtitle1" fontWeight={700} mb={1}>Kişilik Özellikleriniz:</Typography>
            <ul>
              {aiResult.personalityTraits.map((trait, i) => (
                <li key={i}><Typography variant="body2">{trait}</Typography></li>
              ))}
            </ul>
            <Typography variant="subtitle1" fontWeight={700} mt={2} mb={1}>Önerilen Kulüpler:</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
              {(() => {
                const userClubNames = clubs
                  .filter(club => userData && userData.clubIds.includes(club.id))
                  .map(club => club.name.trim().toLowerCase());
                const filteredClubs = aiResult.recommendedClubs
                  .filter(clubName => clubs.some(c => c.name.trim().toLowerCase() === clubName.trim().toLowerCase()))
                  .filter(clubName => !userClubNames.includes(clubName.trim().toLowerCase()));
                if (filteredClubs.length === 0) {
                  return (
                    <Typography color="text.secondary" mt={2}>
                      Tüm kulüplere zaten üyesiniz veya uygun kulüp bulunamadı.
                    </Typography>
                  );
                }
                return filteredClubs.map((club, i) => {
                  const clubObj = clubs.find(c => c.name.trim().toLowerCase() === club.trim().toLowerCase());
                  return (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2, bgcolor: '#f3f6fa', borderRadius: 2, px: 2, py: 1 }}>
                      <Typography variant="body2" sx={{ flex: 1 }}>{clubObj?.name || club}</Typography>
                      <Button
                        size="small"
                        variant={joined[club] ? 'outlined' : 'contained'}
                        color={joined[club] ? 'success' : 'primary'}
                        disabled={joined[club] || joining === club}
                        onClick={() => handleJoinClub(clubObj?.name || club)}
                        sx={{
                          minWidth: 120,
                          borderRadius: 999,
                          fontWeight: 600,
                          fontSize: 16,
                          px: 3,
                          py: 1.2,
                          boxShadow: joined[club]
                            ? '0 2px 8px 0 rgba(34,197,94,0.10)'
                            : '0 4px 16px 0 rgba(37,99,235,0.15)',
                          background: joined[club]
                            ? '#fff'
                            : 'linear-gradient(90deg, #2563eb 60%, #3b82f6 100%)',
                          color: joined[club] ? '#22c55e' : '#fff',
                          border: joined[club] ? '2px solid #22c55e' : 'none',
                          transition: 'all 0.2s cubic-bezier(.4,0,.2,1)',
                          '&:hover': {
                            background: joined[club]
                              ? '#f0fdf4'
                              : 'linear-gradient(90deg, #1d4ed8 60%, #2563eb 100%)',
                            color: joined[club] ? '#16a34a' : '#fff',
                            boxShadow: '0 6px 24px 0 rgba(37,99,235,0.18)',
                            transform: 'translateY(-2px) scale(1.04)'
                          }
                        }}
                      >
                        {joined[club] ? 'Katıldınız' : (joining === club ? 'Ekleniyor...' : 'Kulübe Katıl')}
                      </Button>
                    </Box>
                  );
                });
              })()}
            </Box>
            <Typography variant="body2" color="text.secondary" mt={2}>{aiResult.reasoning}</Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary">Kapat</Button>
      </DialogActions>
    </Dialog>
  );
} 