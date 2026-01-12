import {
    collection,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
    getDocs,
    serverTimestamp,
} from 'firebase/firestore';
import { db, COLLECTIONS } from '@/lib/firebase';

export interface ChatRoom {
    id: string;
    name: string;
    type: 'individual' | 'group';
    participants: string[];
    participantNames: Record<string, string>;
    lastMessage?: string;
    lastMessageAt?: Date;
    lastMessageBy?: string;
    createdAt: Date;
    createdBy: string;
    unreadCount?: Record<string, number>;
}

export interface ChatMessage {
    id: string;
    roomId: string;
    senderId: string;
    senderName: string;
    content: string;
    type: 'text' | 'file' | 'image' | 'system';
    fileUrl?: string;
    fileName?: string;
    readBy: string[];
    createdAt: Date;
}

// Get current user's chat rooms
export const subscribeToChatRooms = (
    userId: string,
    callback: (rooms: ChatRoom[]) => void
) => {
    const roomsRef = collection(db, COLLECTIONS.CHATS);
    const q = query(
        roomsRef,
        where('participants', 'array-contains', userId),
        orderBy('lastMessageAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
        const rooms: ChatRoom[] = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.name,
                type: data.type,
                participants: data.participants,
                participantNames: data.participantNames || {},
                lastMessage: data.lastMessage,
                lastMessageAt: data.lastMessageAt?.toDate(),
                lastMessageBy: data.lastMessageBy,
                createdAt: data.createdAt?.toDate(),
                createdBy: data.createdBy,
                unreadCount: data.unreadCount || {},
            };
        });
        callback(rooms);
    }, (error) => {
        console.error('Error subscribing to chat rooms:', error);
    });
};

// Get messages for a specific room
export const subscribeToMessages = (
    roomId: string,
    callback: (messages: ChatMessage[]) => void,
    messageLimit: number = 50
) => {
    const messagesRef = collection(db, COLLECTIONS.CHATS, roomId, 'messages');
    const q = query(
        messagesRef,
        orderBy('createdAt', 'desc'),
        limit(messageLimit)
    );

    return onSnapshot(q, (snapshot) => {
        const messages: ChatMessage[] = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                roomId: roomId,
                senderId: data.senderId,
                senderName: data.senderName,
                content: data.content,
                type: data.type || 'text',
                fileUrl: data.fileUrl,
                fileName: data.fileName,
                readBy: data.readBy || [],
                createdAt: data.createdAt?.toDate() || new Date(),
            };
        }).reverse(); // Reverse to get chronological order
        callback(messages);
    }, (error) => {
        console.error('Error subscribing to messages:', error);
    });
};

// Send a message
export const sendMessage = async (
    roomId: string,
    senderId: string,
    senderName: string,
    content: string,
    type: 'text' | 'file' | 'image' = 'text',
    fileUrl?: string,
    fileName?: string
): Promise<string> => {
    const messagesRef = collection(db, COLLECTIONS.CHATS, roomId, 'messages');

    const messageDoc = await addDoc(messagesRef, {
        senderId,
        senderName,
        content,
        type,
        fileUrl,
        fileName,
        readBy: [senderId],
        createdAt: serverTimestamp(),
    });

    // Update the chat room's last message
    const roomRef = doc(db, COLLECTIONS.CHATS, roomId);
    await updateDoc(roomRef, {
        lastMessage: content.substring(0, 100),
        lastMessageAt: serverTimestamp(),
        lastMessageBy: senderId,
    });

    return messageDoc.id;
};

// Create a new chat room
export const createChatRoom = async (
    name: string,
    type: 'individual' | 'group',
    participants: string[],
    participantNames: Record<string, string>,
    createdBy: string
): Promise<string> => {
    const roomsRef = collection(db, COLLECTIONS.CHATS);

    // For individual chats, check if a room already exists
    if (type === 'individual' && participants.length === 2) {
        const existingQ = query(
            roomsRef,
            where('type', '==', 'individual'),
            where('participants', 'array-contains', participants[0])
        );
        const existingDocs = await getDocs(existingQ);

        for (const doc of existingDocs.docs) {
            const data = doc.data();
            if (data.participants.includes(participants[1])) {
                return doc.id; // Return existing room
            }
        }
    }

    const roomDoc = await addDoc(roomsRef, {
        name,
        type,
        participants,
        participantNames,
        createdBy,
        createdAt: serverTimestamp(),
        lastMessageAt: serverTimestamp(),
        unreadCount: {},
    });

    return roomDoc.id;
};

// Mark messages as read
export const markMessagesAsRead = async (
    roomId: string,
    userId: string,
    messageIds: string[]
) => {
    const batch: Promise<void>[] = [];

    for (const messageId of messageIds) {
        const messageRef = doc(db, COLLECTIONS.CHATS, roomId, 'messages', messageId);
        batch.push(
            updateDoc(messageRef, {
                readBy: [...new Set([userId])] // This should use arrayUnion in production
            })
        );
    }

    await Promise.all(batch);
};

// Delete a message
export const deleteMessage = async (roomId: string, messageId: string) => {
    const messageRef = doc(db, COLLECTIONS.CHATS, roomId, 'messages', messageId);
    await deleteDoc(messageRef);
};

// Get or create individual chat with a user
export const getOrCreateIndividualChat = async (
    currentUserId: string,
    currentUserName: string,
    otherUserId: string,
    otherUserName: string
): Promise<string> => {
    return createChatRoom(
        otherUserName,
        'individual',
        [currentUserId, otherUserId],
        { [currentUserId]: currentUserName, [otherUserId]: otherUserName },
        currentUserId
    );
};

// Format time for display
export const formatMessageTime = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    // Less than a minute
    if (diff < 60000) return 'Just now';

    // Less than an hour
    if (diff < 3600000) {
        const mins = Math.floor(diff / 60000);
        return `${mins}m ago`;
    }

    // Same day
    if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    // Yesterday
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
    }

    // Within a week
    if (diff < 7 * 24 * 3600000) {
        return date.toLocaleDateString([], { weekday: 'short' });
    }

    // Older
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};
