/**
 * Timetable Service
 * Handles all timetable-related database operations
 */

import {
    collection,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    getDocs,
    onSnapshot,
    serverTimestamp,
    writeBatch,
} from 'firebase/firestore';
import { db, COLLECTIONS } from '@/lib/firebase';

// =============================================================================
// TYPES
// =============================================================================

export type SlotType = 'lecture' | 'lab' | 'tutorial' | 'break' | 'lunch' | 'free';
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';

export interface TimetableSlot {
    id: string;
    day: DayOfWeek;
    period: number;
    startTime: string; // HH:MM format
    endTime: string;
    type: SlotType;
    subjectId?: string;
    subjectName?: string;
    subjectCode?: string;
    teacherId?: string;
    teacherName?: string;
    room?: string;
    sectionId: string;
    semester: number;
    academicYear: string;
}

export interface TimetableInput {
    day: DayOfWeek;
    period: number;
    startTime: string;
    endTime: string;
    type: SlotType;
    subjectId?: string;
    subjectName?: string;
    subjectCode?: string;
    teacherId?: string;
    teacherName?: string;
    room?: string;
    sectionId: string;
    semester: number;
    academicYear: string;
}

export interface WeeklyTimetable {
    monday: TimetableSlot[];
    tuesday: TimetableSlot[];
    wednesday: TimetableSlot[];
    thursday: TimetableSlot[];
    friday: TimetableSlot[];
    saturday: TimetableSlot[];
}

// =============================================================================
// TIMETABLE CRUD OPERATIONS
// =============================================================================

/**
 * Get timetable for a section
 */
export async function getSectionTimetable(
    sectionId: string,
    semester?: number
): Promise<TimetableSlot[]> {
    let q = query(
        collection(db, COLLECTIONS.TIMETABLE),
        where('sectionId', '==', sectionId),
        orderBy('day'),
        orderBy('period')
    );

    if (semester) {
        q = query(
            collection(db, COLLECTIONS.TIMETABLE),
            where('sectionId', '==', sectionId),
            where('semester', '==', semester),
            orderBy('day'),
            orderBy('period')
        );
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
    })) as TimetableSlot[];
}

/**
 * Get timetable for a teacher
 */
export async function getTeacherTimetable(teacherId: string): Promise<TimetableSlot[]> {
    const q = query(
        collection(db, COLLECTIONS.TIMETABLE),
        where('teacherId', '==', teacherId),
        orderBy('day'),
        orderBy('period')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
    })) as TimetableSlot[];
}

/**
 * Get weekly timetable organized by day
 */
export async function getWeeklyTimetable(sectionId: string): Promise<WeeklyTimetable> {
    const slots = await getSectionTimetable(sectionId);

    const weekly: WeeklyTimetable = {
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
    };

    slots.forEach(slot => {
        if (weekly[slot.day]) {
            weekly[slot.day].push(slot);
        }
    });

    // Sort each day by period
    Object.keys(weekly).forEach(day => {
        weekly[day as DayOfWeek].sort((a, b) => a.period - b.period);
    });

    return weekly;
}

/**
 * Get today's timetable
 */
export async function getTodayTimetable(sectionId: string): Promise<TimetableSlot[]> {
    const allDays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const todayIndex = new Date().getDay();
    const today = allDays[todayIndex];

    // Sunday is off (index 0)
    if (todayIndex === 0) {
        return [];
    }

    const q = query(
        collection(db, COLLECTIONS.TIMETABLE),
        where('sectionId', '==', sectionId),
        where('day', '==', today),
        orderBy('period')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
    })) as TimetableSlot[];
}

/**
 * Create a timetable slot
 */
export async function createTimetableSlot(data: TimetableInput): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTIONS.TIMETABLE), {
        ...data,
        createdAt: serverTimestamp(),
    });

    return docRef.id;
}

/**
 * Create multiple timetable slots (batch)
 */
export async function createBulkTimetableSlots(slots: TimetableInput[]): Promise<void> {
    const batch = writeBatch(db);

    for (const slot of slots) {
        const docRef = doc(collection(db, COLLECTIONS.TIMETABLE));
        batch.set(docRef, {
            ...slot,
            createdAt: serverTimestamp(),
        });
    }

    await batch.commit();
}

/**
 * Update a timetable slot
 */
export async function updateTimetableSlot(
    slotId: string,
    data: Partial<TimetableInput>
): Promise<void> {
    const docRef = doc(db, COLLECTIONS.TIMETABLE, slotId);
    await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
    });
}

/**
 * Delete a timetable slot
 */
export async function deleteTimetableSlot(slotId: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.TIMETABLE, slotId);
    await deleteDoc(docRef);
}

/**
 * Clear entire timetable for a section
 */
export async function clearSectionTimetable(sectionId: string): Promise<void> {
    const q = query(
        collection(db, COLLECTIONS.TIMETABLE),
        where('sectionId', '==', sectionId)
    );

    const snapshot = await getDocs(q);
    const batch = writeBatch(db);

    snapshot.docs.forEach(docSnap => {
        batch.delete(docSnap.ref);
    });

    await batch.commit();
}

/**
 * Subscribe to timetable updates
 */
export function subscribeToTimetable(
    sectionId: string,
    callback: (slots: TimetableSlot[]) => void
) {
    const q = query(
        collection(db, COLLECTIONS.TIMETABLE),
        where('sectionId', '==', sectionId),
        orderBy('day'),
        orderBy('period')
    );

    return onSnapshot(q, (snapshot) => {
        const slots: TimetableSlot[] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        })) as TimetableSlot[];
        callback(slots);
    });
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get slot type color
 */
export function getSlotTypeColor(type: SlotType): string {
    switch (type) {
        case 'lecture':
            return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
        case 'lab':
            return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
        case 'tutorial':
            return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
        case 'break':
            return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
        case 'lunch':
            return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
        case 'free':
            return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
        default:
            return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
}

/**
 * Get current period based on time
 */
export function getCurrentPeriod(slots: TimetableSlot[]): TimetableSlot | null {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    return slots.find(slot => {
        return currentTime >= slot.startTime && currentTime <= slot.endTime;
    }) || null;
}

/**
 * Get next period
 */
export function getNextPeriod(slots: TimetableSlot[]): TimetableSlot | null {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const sortedSlots = [...slots].sort((a, b) => a.startTime.localeCompare(b.startTime));
    return sortedSlots.find(slot => slot.startTime > currentTime) || null;
}

/**
 * Format time for display
 */
export function formatSlotTime(time: string): string {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
}

/**
 * Get day display name
 */
export function getDayDisplayName(day: DayOfWeek): string {
    return day.charAt(0).toUpperCase() + day.slice(1);
}

/**
 * Get short day name
 */
export function getShortDayName(day: DayOfWeek): string {
    const shortNames: Record<DayOfWeek, string> = {
        monday: 'Mon',
        tuesday: 'Tue',
        wednesday: 'Wed',
        thursday: 'Thu',
        friday: 'Fri',
        saturday: 'Sat',
    };
    return shortNames[day];
}

/**
 * Get default time slots for a day
 */
export function getDefaultTimeSlots(): Array<{ period: number; startTime: string; endTime: string }> {
    return [
        { period: 1, startTime: '09:00', endTime: '09:50' },
        { period: 2, startTime: '09:50', endTime: '10:40' },
        { period: 3, startTime: '10:50', endTime: '11:40' },
        { period: 4, startTime: '11:40', endTime: '12:30' },
        { period: 5, startTime: '13:30', endTime: '14:20' },
        { period: 6, startTime: '14:20', endTime: '15:10' },
        { period: 7, startTime: '15:20', endTime: '16:10' },
        { period: 8, startTime: '16:10', endTime: '17:00' },
    ];
}

/**
 * Generate mock timetable for demo
 */
export function generateMockTimetable(sectionId: string): TimetableSlot[] {
    const days: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    const subjects = [
        { name: 'Database Management Systems', code: 'CS3501', teacher: 'Dr. Smith' },
        { name: 'Operating Systems', code: 'CS3502', teacher: 'Prof. Johnson' },
        { name: 'Computer Networks', code: 'CS3503', teacher: 'Dr. Williams' },
        { name: 'Artificial Intelligence', code: 'CS3504', teacher: 'Dr. Brown' },
        { name: 'Software Engineering', code: 'CS3505', teacher: 'Prof. Davis' },
    ];
    const timeSlots = getDefaultTimeSlots();
    const slots: TimetableSlot[] = [];

    days.forEach(day => {
        timeSlots.forEach((time, index) => {
            // Add lunch break
            if (time.period === 4 || time.period === 5) {
                if (time.period === 4) {
                    slots.push({
                        id: `${day}-lunch`,
                        day,
                        period: 0,
                        startTime: '12:30',
                        endTime: '13:30',
                        type: 'lunch',
                        sectionId,
                        semester: 5,
                        academicYear: '2025-2026',
                    });
                }
            }

            // Random subject or break
            const isBreak = index === 2 || index === 6;
            if (isBreak) {
                return; // Skip as break
            }

            const subject = subjects[Math.floor(Math.random() * subjects.length)];
            const isLab = Math.random() > 0.7;

            slots.push({
                id: `${day}-${time.period}`,
                day,
                period: time.period,
                startTime: time.startTime,
                endTime: time.endTime,
                type: isLab ? 'lab' : 'lecture',
                subjectName: subject.name,
                subjectCode: subject.code,
                teacherName: subject.teacher,
                room: isLab ? `Lab-${Math.floor(Math.random() * 5) + 1}` : `Room ${Math.floor(Math.random() * 300) + 100}`,
                sectionId,
                semester: 5,
                academicYear: '2025-2026',
            });
        });
    });

    return slots;
}
