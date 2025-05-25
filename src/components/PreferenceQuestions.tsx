import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    Stack,
    Chip,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Autocomplete
} from '@mui/material';
import { UserPreferences } from '../types/models';

interface PreferenceQuestionsProps {
    onComplete: (preferences: UserPreferences) => void;
}

const interestOptions = [
    'Teknoloji', 'Sanat', 'Müzik', 'Spor', 'Bilim', 'Edebiyat',
    'Fotoğrafçılık', 'Dans', 'Tiyatro', 'Sinema', 'Yazılım',
    'Tasarım', 'Çevre', 'Sosyal Sorumluluk'
];

const clubTypeOptions = [
    'Akademik', 'Sosyal', 'Spor', 'Sanat', 'Teknoloji',
    'Kültür', 'Çevre', 'Sosyal Sorumluluk'
];

const activityOptions = [
    'Workshop', 'Seminer', 'Turnuva', 'Festival',
    'Sosyal Etkinlik', 'Eğitim', 'Yarışma'
];

export default function PreferenceQuestions({ onComplete }: PreferenceQuestionsProps) {
    const [preferences, setPreferences] = useState<UserPreferences>({
        interests: [],
        hobbies: [],
        skills: [],
        preferredClubTypes: [],
        timeAvailability: '',
        preferredActivities: []
    });

    const handleSubmit = () => {
        onComplete(preferences);
    };

    return (
        <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                <Typography variant="h5" gutterBottom>
                    Tercihlerinizi Belirleyin
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                    Size en uygun kulüpleri önerebilmemiz için lütfen tercihlerinizi belirtin.
                </Typography>

                <Stack spacing={4}>
                    <FormControl fullWidth>
                        <Autocomplete
                            multiple
                            options={interestOptions}
                            value={preferences.interests}
                            onChange={(_, newValue) => {
                                setPreferences({ ...preferences, interests: newValue });
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="İlgi Alanlarınız"
                                    placeholder="İlgi alanlarınızı seçin"
                                />
                            )}
                        />
                    </FormControl>

                    <FormControl fullWidth>
                        <TextField
                            label="Hobileriniz"
                            multiline
                            rows={2}
                            value={preferences.hobbies.join(', ')}
                            onChange={(e) => {
                                const hobbies = e.target.value.split(',').map(h => h.trim());
                                setPreferences({ ...preferences, hobbies });
                            }}
                            placeholder="Hobilerinizi virgülle ayırarak yazın"
                        />
                    </FormControl>

                    <FormControl fullWidth>
                        <TextField
                            label="Yetenekleriniz"
                            multiline
                            rows={2}
                            value={preferences.skills.join(', ')}
                            onChange={(e) => {
                                const skills = e.target.value.split(',').map(s => s.trim());
                                setPreferences({ ...preferences, skills });
                            }}
                            placeholder="Yeteneklerinizi virgülle ayırarak yazın"
                        />
                    </FormControl>

                    <FormControl fullWidth>
                        <Autocomplete
                            multiple
                            options={clubTypeOptions}
                            value={preferences.preferredClubTypes}
                            onChange={(_, newValue) => {
                                setPreferences({ ...preferences, preferredClubTypes: newValue });
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Tercih Ettiğiniz Kulüp Türleri"
                                    placeholder="Kulüp türlerini seçin"
                                />
                            )}
                        />
                    </FormControl>

                    <FormControl fullWidth>
                        <InputLabel>Zaman Uygunluğunuz</InputLabel>
                        <Select
                            value={preferences.timeAvailability}
                            label="Zaman Uygunluğunuz"
                            onChange={(e) => {
                                setPreferences({ ...preferences, timeAvailability: e.target.value });
                            }}
                        >
                            <MenuItem value="weekday_morning">Hafta içi sabah</MenuItem>
                            <MenuItem value="weekday_afternoon">Hafta içi öğleden sonra</MenuItem>
                            <MenuItem value="weekday_evening">Hafta içi akşam</MenuItem>
                            <MenuItem value="weekend">Hafta sonu</MenuItem>
                            <MenuItem value="flexible">Esnek</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl fullWidth>
                        <Autocomplete
                            multiple
                            options={activityOptions}
                            value={preferences.preferredActivities}
                            onChange={(_, newValue) => {
                                setPreferences({ ...preferences, preferredActivities: newValue });
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Tercih Ettiğiniz Aktiviteler"
                                    placeholder="Aktiviteleri seçin"
                                />
                            )}
                        />
                    </FormControl>

                    <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        onClick={handleSubmit}
                        sx={{ mt: 2 }}
                    >
                        Tercihleri Kaydet
                    </Button>
                </Stack>
            </Paper>
        </Box>
    );
} 