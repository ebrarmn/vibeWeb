import { UserPreferences } from '../types/models';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.REACT_APP_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
});

export const aiService = {
    async analyzePreferences(preferences: UserPreferences, clubNames: string[]): Promise<{
        personalityTraits: string[];
        recommendedClubs: string[];
        reasoning: string;
    }> {
        try {
            const prompt = `
                Kullanıcı tercihleri:
                İlgi Alanları: ${preferences.interests.join(', ')}
                Hobiler: ${preferences.hobbies.join(', ')}
                Yetenekler: ${preferences.skills.join(', ')}
                Tercih Edilen Kulüp Türleri: ${preferences.preferredClubTypes.join(', ')}
                Zaman Uygunluğu: ${preferences.timeAvailability}
                Tercih Edilen Aktiviteler: ${preferences.preferredActivities.join(', ')}

                Mevcut kulüpler (sadece bu isimlerden, birebir aynı şekilde öneri yap!):
                ${clubNames.join(', ')}

                Bu tercihlere göre:
                1. Kullanıcının kişilik özelliklerini analiz et
                2. En uygun kulüp türlerini, sadece yukarıdaki kulüp isimlerinden öner
                3. Önerilerin nedenlerini açıkla

                Yanıtı şu formatta ver:
                {
                    "personalityTraits": ["özellik1", "özellik2", ...],
                    "recommendedClubs": ["kulüp1", "kulüp2", ...],
                    "reasoning": "detaylı açıklama"
                }
            `;

            const completion = await openai.chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                model: "gpt-3.5-turbo",
                temperature: 0.7,
                max_tokens: 300
            });

            const response = completion.choices[0].message.content;
            return JSON.parse(response || '{}');
        } catch (error) {
            console.error('AI analizi sırasında hata:', error);
            return {
                personalityTraits: [],
                recommendedClubs: [],
                reasoning: 'Analiz sırasında bir hata oluştu.'
            };
        }
    },

    async generateClubRecommendations(preferences: UserPreferences, clubs: any[]): Promise<{
        recommendations: Array<{
            clubId: string;
            matchScore: number;
            reasoning: string;
        }>;
    }> {
        try {
            const prompt = `
                Kullanıcı tercihleri:
                ${JSON.stringify(preferences, null, 2)}

                Mevcut kulüpler:
                ${JSON.stringify(clubs, null, 2)}

                Her kulüp için:
                1. Kullanıcı tercihleriyle eşleşme puanı hesapla (0-100)
                2. Eşleşme nedenlerini açıkla

                Yanıtı şu formatta ver:
                {
                    "recommendations": [
                        {
                            "clubId": "kulüp_id",
                            "matchScore": 85,
                            "reasoning": "detaylı açıklama"
                        }
                    ]
                }
            `;

            const completion = await openai.chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                model: "gpt-3.5-turbo",
                temperature: 0.7,
                max_tokens: 1000
            });

            const response = completion.choices[0].message.content;
            return JSON.parse(response || '{"recommendations": []}');
        } catch (error) {
            console.error('Kulüp önerileri oluşturulurken hata:', error);
            return { recommendations: [] };
        }
    },

    async askGPT(prompt: string, max_tokens = 500): Promise<string> {
        try {
            const completion = await openai.chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                model: "gpt-3.5-turbo",
                temperature: 0.7,
                max_tokens
            });
            return completion.choices[0].message.content || '';
        } catch (error) {
            console.error('OpenAI API hatası:', error);
            throw error;
        }
    }
}; 