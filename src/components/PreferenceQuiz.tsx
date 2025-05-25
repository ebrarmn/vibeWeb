import React, { useState } from 'react';
import { Box, Button, Typography, RadioGroup, FormControlLabel, Radio, Paper, LinearProgress } from '@mui/material';

export type QuizAnswer = {
  question: string;
  answer: string;
};

const quizQuestions: { question: string; options: string[] }[] = [
  {
    question: 'En çok hangi tür etkinliklerden hoşlanırsınız?',
    options: ['Konserler', 'Spor karşılaşmaları', 'Tiyatro/Drama', 'Atölye çalışmaları', 'Sosyal sorumluluk projeleri']
  },
  {
    question: 'Boş zamanlarınızda en çok ne yapmaktan keyif alırsınız?',
    options: ['Müzik dinlemek/çalışmak', 'Spor yapmak', 'Kitap okumak', 'Oyun oynamak', 'Arkadaşlarla vakit geçirmek']
  },
  {
    question: 'Hangi alanda kendinizi daha yetenekli hissediyorsunuz?',
    options: ['Sanat (müzik, resim, tiyatro)', 'Spor', 'Liderlik/Organizasyon', 'Teknoloji/Bilişim', 'İletişim']
  },
  {
    question: 'Bir kulüpte en çok hangi rolü üstlenmek istersiniz?',
    options: ['Üye olarak katılmak', 'Etkinlik düzenlemek', 'Takım liderliği yapmak', 'Sosyal medya/iletişim işleriyle ilgilenmek']
  },
  {
    question: 'Hangi gün ve saatlerde kulüp etkinliklerine katılmak sizin için daha uygun?',
    options: ['Hafta içi gündüz', 'Hafta içi akşam', 'Hafta sonu gündüz', 'Hafta sonu akşam']
  }
];

interface PreferenceQuizProps {
  onComplete: (answers: QuizAnswer[]) => void;
}

const PreferenceQuiz: React.FC<PreferenceQuizProps> = ({ onComplete }) => {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<(string | null)[]>(Array(quizQuestions.length).fill(null));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updated = [...answers];
    updated[current] = e.target.value;
    setAnswers(updated);
  };

  const handleNext = () => {
    if (current < quizQuestions.length - 1) {
      setCurrent(current + 1);
    } else {
      // Test bitti
      const result: QuizAnswer[] = quizQuestions.map((q, i) => ({
        question: q.question,
        answer: answers[i] || ''
      }));
      onComplete(result);
    }
  };

  const progress = ((current + 1) / quizQuestions.length) * 100;

  return (
    <Box maxWidth={500} mx="auto" mt={6}>
      <Paper sx={{ p: 4, borderRadius: 4 }}>
        <Typography variant="h5" fontWeight={700} mb={2} align="center">
          Kulüp Tercih Testi
        </Typography>
        <LinearProgress variant="determinate" value={progress} sx={{ mb: 3 }} />
        <Typography variant="subtitle1" mb={2}>
          {current + 1}. Soru: {quizQuestions[current].question}
        </Typography>
        <RadioGroup value={answers[current] || ''} onChange={handleChange}>
          {quizQuestions[current].options.map((opt, idx) => (
            <FormControlLabel key={idx} value={opt} control={<Radio />} label={opt} />
          ))}
        </RadioGroup>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 3 }}
          onClick={handleNext}
          disabled={!answers[current]}
        >
          {current === quizQuestions.length - 1 ? 'Testi Bitir' : 'Sonraki Soru'}
        </Button>
      </Paper>
    </Box>
  );
};

export default PreferenceQuiz; 