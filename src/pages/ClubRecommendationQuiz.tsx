import React, { useState } from 'react';
import PreferenceQuiz, { QuizAnswer } from '../components/PreferenceQuiz';
import { Box, Typography, Paper, CircularProgress, List, ListItem, ListItemText, Button } from '@mui/material';
import { aiService } from '../services/aiService';

const ClubRecommendationQuiz: React.FC = () => {
  const [recommendations, setRecommendations] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleQuizComplete = async (answers: QuizAnswer[]) => {
    setLoading(true);
    setError(null);
    setRecommendations(null);

    try {
      // Cevapları OpenAI API'ye uygun prompt ile gönder
      const prompt = `
Kullanıcı aşağıdaki sorulara şu cevapları verdi:
${answers.map((a, i) => `${i + 1}. ${a.question} Cevap: ${a.answer}`).join('\n')}

Bu cevaplara göre, üniversite kulüplerinden en uygun olan 3 tanesini öner ve nedenlerini kısaca açıkla. Yanıtı şu formatta ver:
{
  "clubs": [
    {"name": "Kulüp Adı", "reason": "Kısa açıklama"},
    ...
  ]
}
`;

      // OpenAI API çağrısı
      const completion = await aiService.askGPT(prompt, 600);

      // Yanıtı JSON olarak ayrıştır
      const match = completion.match(/\{[\s\S]*\}/);
      let clubs: { name: string; reason: string }[] = [];
      if (match) {
        const obj = JSON.parse(match[0]);
        clubs = obj.clubs;
      }

      setRecommendations(clubs.map(c => `${c.name}: ${c.reason}`));
    } catch (err) {
      setError('Öneriler alınırken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxWidth={600} mx="auto" mt={6}>
      <Paper sx={{ p: 4, borderRadius: 4 }}>
        {!recommendations && !loading && !error && (
          <PreferenceQuiz onComplete={handleQuizComplete} />
        )}
        {loading && (
          <Box textAlign="center">
            <CircularProgress />
            <Typography mt={2}>Kulüp önerileri hazırlanıyor...</Typography>
          </Box>
        )}
        {recommendations && (
          <>
            <Typography variant="h5" fontWeight={700} mb={2} align="center">
              Sizin İçin Önerilen Kulüpler
            </Typography>
            <List>
              {recommendations.map((rec, idx) => (
                <ListItem key={idx}>
                  <ListItemText primary={rec} />
                </ListItem>
              ))}
            </List>
            <Button variant="outlined" fullWidth sx={{ mt: 2 }} onClick={() => setRecommendations(null)}>
              Tekrar Test Çöz
            </Button>
          </>
        )}
        {error && (
          <Typography color="error" align="center">{error}</Typography>
        )}
      </Paper>
    </Box>
  );
};

export default ClubRecommendationQuiz; 