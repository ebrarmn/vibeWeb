import { UserPreferences, Club } from '../types/models';
import { aiService } from './aiService';

export interface ClubScore {
    clubId: string;
    score: number;
    matchReasons: string[];
}

export const recommendationService = {
    async getRecommendedClubs(preferences: UserPreferences, clubs: Club[]): Promise<ClubScore[]> {
        try {
            // AI analizi yap
            const clubNames = clubs.map(c => c.name);
            const aiAnalysis = await aiService.analyzePreferences(preferences, clubNames);
            
            // Kulüp önerilerini al
            const recommendations = await aiService.generateClubRecommendations(preferences, clubs);
            
            // Sonuçları birleştir ve sırala
            const scoredClubs = recommendations.recommendations.map(rec => ({
                clubId: rec.clubId,
                score: rec.matchScore,
                matchReasons: [rec.reasoning]
            }));

            // Puanlara göre sırala
            return scoredClubs.sort((a, b) => b.score - a.score);
        } catch (error) {
            console.error('Kulüp önerileri oluşturulurken hata:', error);
            return [];
        }
    }
}; 