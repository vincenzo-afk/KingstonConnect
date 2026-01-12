/**
 * Services Barrel Export
 * Re-exports all services for convenient importing
 */

// Authentication & User Data
export * from './auportal.service';

// Communication
export {
    subscribeToChatRooms,
    subscribeToMessages,
    sendMessage as sendChatMessage,
    createChatRoom,
    markMessagesAsRead,
    deleteMessage,
    getOrCreateIndividualChat,
    formatMessageTime,
    type ChatRoom,
    type ChatMessage as ChatRoomMessage,
} from './chat.service';
export * from './announcements.service';
export * from './notifications.service';

// Academic
export * from './attendance.service';
export * from './assignments.service';
export * from './notes.service';
export * from './timetable.service';

// AI
export {
    sendMessage as sendStudyGPTMessage,
    setColabUrl,
    getColabUrl,
    type ChatMessage as StudyGPTMessage,
    type StudyGPTResponse,
} from './studygpt.service';

