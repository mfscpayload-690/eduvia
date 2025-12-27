import { MockTimetableEntry, MockEvent, MockNote, MockClassroom, MockLostItem, UserProfile } from './types';

export const USER_PROFILE: UserProfile = {
    department: 'Computer Science',
    tags: ['coding', 'hackathon', 'ai', 'robotics'],
};

// Mock Timetable for the next 6 hours (assuming current time is around 14:00)
export const MOCK_TIMETABLE: MockTimetableEntry[] = [
    { subject: 'Data Structures', startTime: '14:30', endTime: '15:30' },
    { subject: 'Web Development', startTime: '15:30', endTime: '16:30' },
    { subject: 'Database Management', startTime: '16:30', endTime: '17:30' },
];

export const MOCK_NOTES: MockNote[] = [
    { id: 'note-1', subject: 'Data Structures', title: 'Trees and Graphs Introduction', nextPart: 'note-2' },
    { id: 'note-2', subject: 'Data Structures', title: 'Advanced Graph Algorithms', nextPart: 'note-3' },
    { id: 'note-3', subject: 'Data Structures', title: 'Complex Trees' },
    { id: 'note-web-1', subject: 'Web Development', title: 'React Basics' },
];

export const MOCK_EVENTS: MockEvent[] = [
    { id: 'evt-1', title: 'Hackathon 2025', tags: ['coding', 'hackathon'], department: 'Computer Science', registeredFriends: 12 },
    { id: 'evt-2', title: 'Robotics Workshop', tags: ['robotics'], department: 'Mechanical', registeredFriends: 3 },
    { id: 'evt-3', title: 'Literature Fest', tags: ['literature'], department: 'English', registeredFriends: 0 },
];

export const MOCK_CLASSROOMS: MockClassroom[] = [
    { room: '304-A', availableFrom: '14:00', availableTo: '15:00' },
    { room: 'Library Discussion Room', availableFrom: '15:00', availableTo: '16:00' },
];

export const MOCK_LOST_FOUND: MockLostItem[] = [
    { id: 'lost-1', category: 'coding', description: 'GitHub Sticker Pack' },
    { id: 'lost-2', category: 'electronics', description: 'Blue Bluetooth Speaker' },
];
