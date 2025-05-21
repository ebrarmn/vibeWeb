import { clubServices, userServices, eventServices } from '../services/firestore';
import { User, Club, Event } from '../types/models';

const seedData = async () => {
    try {
        // Kullanıcılar için test verileri
        const users: Omit<User, 'id' | 'createdAt' | 'updatedAt'>[] = [
            {
                displayName: 'Admin User',
                email: 'admin@vibecom.com',
                phone: '',
                birthDate: '',
                gender: '',
                university: '',
                faculty: '',
                department: '',
                grade: '',
                role: 'admin' as const,
                clubIds: [],
                clubRoles: {},
                studentNumber: '100000001',
            },
            {
                displayName: 'Ahmet Yılmaz',
                email: 'user1@vibecom.com',
                phone: '',
                birthDate: '',
                gender: '',
                university: '',
                faculty: '',
                department: '',
                grade: '',
                role: 'user' as const,
                clubIds: [],
                clubRoles: {},
                studentNumber: '100000002',
            },
            {
                displayName: 'Ayşe Demir',
                email: 'user2@vibecom.com',
                phone: '',
                birthDate: '',
                gender: '',
                university: '',
                faculty: '',
                department: '',
                grade: '',
                role: 'user' as const,
                clubIds: [],
                clubRoles: {},
                studentNumber: '100000003',
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
                memberIds: [userIds[0], userIds[1], userIds[2]],
                memberRoles: {
                    [userIds[0]]: 'admin',
                    [userIds[1]]: 'member',
                    [userIds[2]]: 'member'
                },
                eventIds: []
            },
            {
                name: 'Dans Kulübü',
                description: 'Modern dans, halk dansları ve latin dansları çalışmaları yapan kulüp.',
                memberIds: [userIds[1], userIds[2]],
                memberRoles: {
                    [userIds[1]]: 'admin',
                    [userIds[2]]: 'member'
                },
                eventIds: []
            },
            {
                name: 'Tiyatro Kulübü',
                description: 'Sahne sanatları ve tiyatro etkinlikleri düzenleyen kulüp.',
                memberIds: [userIds[0], userIds[1], userIds[2]],
                memberRoles: {
                    [userIds[2]]: 'admin',
                    [userIds[0]]: 'member',
                    [userIds[1]]: 'member'
                },
                eventIds: []
            }
        ];

        // Kulüpleri ekle
        const clubIds = await Promise.all(
            clubs.map(club => clubServices.create(club))
        );

        // Kullanıcıların clubIds ve clubRoles'lerini güncelle
        await userServices.update(userIds[0], { 
            clubIds: [clubIds[0], clubIds[2]],
            clubRoles: {
                [clubIds[0]]: 'admin',
                [clubIds[2]]: 'member'
            }
        });
        await userServices.update(userIds[1], { 
            clubIds: [clubIds[0], clubIds[1], clubIds[2]],
            clubRoles: {
                [clubIds[0]]: 'member',
                [clubIds[1]]: 'admin',
                [clubIds[2]]: 'member'
            }
        });
        await userServices.update(userIds[2], { 
            clubIds: [clubIds[0], clubIds[1], clubIds[2]],
            clubRoles: {
                [clubIds[0]]: 'member',
                [clubIds[1]]: 'member',
                [clubIds[2]]: 'admin'
            }
        });

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
                attendeeIds: [userIds[1], userIds[2]],
                attendeeStatus: {
                    [userIds[1]]: 'registered',
                    [userIds[2]]: 'attended'
                }
            },
            {
                title: 'Dans Gecesi',
                description: 'Salsa ve Bachata workshop',
                clubId: clubIds[1],
                startDate: new Date('2024-05-20T20:00:00').toISOString(),
                endDate: new Date('2024-05-20T23:00:00').toISOString(),
                location: 'Dans Stüdyosu',
                capacity: 50,
                attendeeIds: [userIds[0]],
                attendeeStatus: {
                    [userIds[0]]: 'registered'
                }
            },
            {
                title: 'Tiyatro Gösterisi',
                description: 'Romeo ve Juliet oyunu',
                clubId: clubIds[2],
                startDate: new Date('2024-06-01T18:30:00').toISOString(),
                endDate: new Date('2024-06-01T21:30:00').toISOString(),
                location: 'Şehir Tiyatrosu',
                capacity: 150,
                attendeeIds: [userIds[0], userIds[1], userIds[2]],
                attendeeStatus: {
                    [userIds[0]]: 'registered',
                    [userIds[1]]: 'attended',
                    [userIds[2]]: 'cancelled'
                }
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