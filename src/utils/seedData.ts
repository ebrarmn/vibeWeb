import { clubServices, userServices, eventServices } from '../services/firestore';
import { User, Club, Event } from '../types/models';

const seedData = async () => {
    try {
        // Kullanıcılar için test verileri
        const users: Omit<User, 'id' | 'createdAt' | 'updatedAt'>[] = [
            {
                email: 'admin@vibecom.com',
                displayName: 'Admin User',
                role: 'admin' as const,
                clubIds: [],
            },
            {
                email: 'user1@vibecom.com',
                displayName: 'Ahmet Yılmaz',
                role: 'user' as const,
                clubIds: [],
            },
            {
                email: 'user2@vibecom.com',
                displayName: 'Ayşe Demir',
                role: 'user' as const,
                clubIds: [],
            }
        ];

        // Kullanıcıları ekle
        const userIds = await Promise.all(
            users.map(user => userServices.create(user))
        );

        // Kulüpler için test verileri
        const clubs: Omit<Club, 'id' | 'createdAt' | 'updatedAt'>[] = [
            {
                name: 'Müzik Kulübü',
                description: 'Üniversitemizin müzik tutkunlarını bir araya getiren kulüp.',
                adminIds: [userIds[0]],
                memberIds: [userIds[1], userIds[2]],
                eventIds: []
            },
            {
                name: 'Dans Kulübü',
                description: 'Modern dans, halk dansları ve latin dansları çalışmaları yapan kulüp.',
                adminIds: [userIds[1]],
                memberIds: [userIds[2]],
                eventIds: []
            },
            {
                name: 'Tiyatro Kulübü',
                description: 'Sahne sanatları ve tiyatro etkinlikleri düzenleyen kulüp.',
                adminIds: [userIds[2]],
                memberIds: [userIds[0], userIds[1]],
                eventIds: []
            }
        ];

        // Kulüpleri ekle
        const clubIds = await Promise.all(
            clubs.map(club => clubServices.create(club))
        );

        // Kullanıcıların clubIds'lerini güncelle
        await userServices.update(userIds[0], { clubIds: [clubIds[0]] });
        await userServices.update(userIds[1], { clubIds: [clubIds[1]] });
        await userServices.update(userIds[2], { clubIds: [clubIds[2]] });

        // Etkinlikler için test verileri
        const events: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>[] = [
            {
                title: 'Yıl Sonu Konseri',
                description: 'Müzik kulübü yıl sonu konseri',
                clubId: clubIds[0],
                startDate: new Date('2024-05-15T19:00:00').toISOString(),
                endDate: new Date('2024-05-15T22:00:00').toISOString(),
                location: 'Üniversite Konferans Salonu',
                capacity: 200,
                attendeeIds: [userIds[1], userIds[2]]
            },
            {
                title: 'Dans Gecesi',
                description: 'Salsa ve Bachata workshop',
                clubId: clubIds[1],
                startDate: new Date('2024-05-20T20:00:00').toISOString(),
                endDate: new Date('2024-05-20T23:00:00').toISOString(),
                location: 'Dans Stüdyosu',
                capacity: 50,
                attendeeIds: [userIds[0]]
            },
            {
                title: 'Tiyatro Gösterisi',
                description: 'Romeo ve Juliet oyunu',
                clubId: clubIds[2],
                startDate: new Date('2024-06-01T18:30:00').toISOString(),
                endDate: new Date('2024-06-01T21:30:00').toISOString(),
                location: 'Şehir Tiyatrosu',
                capacity: 150,
                attendeeIds: [userIds[0], userIds[1], userIds[2]]
            }
        ];

        // Etkinlikleri ekle
        const eventIds = await Promise.all(
            events.map(event => eventServices.create(event))
        );

        // Kulüplerin eventIds'lerini güncelle
        await clubServices.update(clubIds[0], { eventIds: [eventIds[0]] });
        await clubServices.update(clubIds[1], { eventIds: [eventIds[1]] });
        await clubServices.update(clubIds[2], { eventIds: [eventIds[2]] });

        console.log('Test verileri başarıyla yüklendi!');
        console.log('Kullanıcı ID\'leri:', userIds);
        console.log('Kulüp ID\'leri:', clubIds);
        console.log('Etkinlik ID\'leri:', eventIds);

    } catch (error) {
        console.error('Test verileri yüklenirken hata oluştu:', error);
    }
};

export default seedData; 