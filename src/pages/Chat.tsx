import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import {
    MessageSquare,
    Send,
    Search,
    Users,
    Phone,
    Video,
    Plus,
    UserPlus,
} from 'lucide-react';

// =============================================================================
// CHAT STORE — real local messaging (no mock data)
// =============================================================================

interface ChatMessage {
    id: string;
    senderName: string;
    content: string;
    time: string;
    isMe: boolean;
}

interface ChatThread {
    id: string;
    name: string;
    isGroup: boolean;
    participants: string[];
    messages: ChatMessage[];
    unread: number;
}

let chatSequence = 0;

const ChatPage: React.FC = () => {
    const [threads, setThreads] = useState<ChatThread[]>([]);
    const [selectedChat, setSelectedChat] = useState<ChatThread | null>(null);
    const [message, setMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [newChatName, setNewChatName] = useState('');
    const [newChatGroup, setNewChatGroup] = useState(false);
    const [showNewChat, setShowNewChat] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [selectedChat, threads]);

    const handleSend = () => {
        if (!message.trim() || !selectedChat) return;

        const newMessage: ChatMessage = {
            id: Date.now().toString(),
            senderName: 'You',
            content: message,
            time: new Date().toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
            }),
            isMe: true,
        };

        setThreads((prev) =>
            prev.map((t) =>
                t.id === selectedChat.id
                    ? {
                          ...t,
                          messages: [...t.messages, newMessage],
                          lastMessage: message,
                          lastTime: 'now',
                      }
                    : t
            )
        );
        setSelectedChat((prev) =>
            prev
                ? {
                      ...prev,
                      messages: [...prev.messages, newMessage],
                      unread: 0,
                  }
                : null
        );
        setMessage('');
    };

    const addThread = () => {
        if (!newChatName.trim()) return;
        const thread: ChatThread = {
            id: `thread-${Date.now()}-${++chatSequence}`,
            name: newChatName.trim(),
            isGroup: newChatGroup,
            participants: [newChatName.trim()],
            messages: [],
            unread: 0,
        };
        setThreads((prev) => [thread, ...prev]);
        setSelectedChat(thread);
        setNewChatName('');
        setNewChatGroup(false);
        setShowNewChat(false);
    };

    const filteredChats = threads.filter((chat) =>
        chat.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="h-[calc(100vh-8rem)] flex gap-4">
            {/* Chat List */}
            <Card
                className={`w-80 flex-shrink-0 flex flex-col overflow-hidden p-0 ${
                    selectedChat ? 'hidden md:flex' : 'flex'
                }`}
            >
                {/* Search + New Chat */}
                <div className="p-4 border-b border-white/10">
                    <div className="relative mb-3">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search chats..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                        />
                    </div>
                    <Button
                        variant="primary"
                        size="sm"
                        className="w-full justify-start gap-2"
                        onClick={() => setShowNewChat((v) => !v)}
                    >
                        <Plus className="w-4 h-4" /> Start a new chat
                    </Button>
                    {showNewChat && (
                        <div className="mt-3 p-3 rounded-xl bg-white/5 border border-white/10 space-y-3">
                            <Input
                                placeholder="Chat name (person or group)"
                                value={newChatName}
                                onChange={(e) => setNewChatName(e.target.value)}
                            />
                            <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={newChatGroup}
                                    onChange={(e) => setNewChatGroup(e.target.checked)}
                                    className="accent-cyan-500"
                                />
                                Group chat
                            </label>
                            <Button variant="primary" size="sm" onClick={addThread}>
                                <UserPlus className="w-4 h-4 mr-1" /> Create
                            </Button>
                        </div>
                    )}
                </div>

                {/* Chat Items */}
                <div className="flex-1 overflow-y-auto">
                    {filteredChats.length === 0 && (
                        <div className="flex flex-col items-center text-center py-10 gap-2 px-4 text-slate-400">
                            <MessageSquare className="w-8 h-8 opacity-40" />
                            <p className="text-sm">
                                {threads.length === 0
                                    ? 'No conversations yet. Start a new chat with a classmate, teacher, or group.'
                                    : 'No chats match your search.'}
                            </p>
                        </div>
                    )}
                    {filteredChats.map((chat) => {
                        const last = chat.messages[chat.messages.length - 1];
                        return (
                            <button
                                key={chat.id}
                                type="button"
                                onClick={() => setSelectedChat(chat)}
                                className={`w-full p-4 flex items-center gap-3 border-b border-white/5 hover:bg-white/5 transition-colors text-left ${
                                    selectedChat?.id === chat.id ? 'bg-white/5' : ''
                                }`}
                            >
                                <Avatar alt={chat.name} size="md" />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <p className="font-medium text-white truncate">
                                            {chat.name}
                                        </p>
                                        <span className="text-xs text-slate-500">
                                            {last ? last.time : ''}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between mt-0.5">
                                        <p className="text-sm text-slate-400 truncate">
                                            {last ? last.content : 'No messages yet'}
                                        </p>
                                        {chat.unread > 0 && (
                                            <Badge variant="primary" size="sm">
                                                {chat.unread}
                                            </Badge>
                                        )}
                                    </div>
                                    {chat.isGroup && (
                                        <p className="text-xs text-slate-500 mt-1">
                                            <Users className="w-3 h-3 inline mr-1" />
                                            {chat.participants.length} members
                                        </p>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </Card>

            {/* Chat Window */}
            <Card
                className={`flex-1 flex flex-col overflow-hidden p-0 ${
                    !selectedChat ? 'hidden md:flex' : 'flex'
                }`}
            >
                {selectedChat ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setSelectedChat(null)}
                                    className="md:hidden p-2 -ml-2 hover:bg-white/5 rounded-lg"
                                >
                                    ←
                                </button>
                                <Avatar alt={selectedChat.name} size="md" />
                                <div>
                                    <p className="font-medium text-white">
                                        {selectedChat.name}
                                    </p>
                                    <p className="text-sm text-slate-400">
                                        {selectedChat.isGroup
                                            ? `${selectedChat.participants.length} members`
                                            : 'Online'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" className="p-2">
                                    <Phone className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="p-2">
                                    <Video className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {selectedChat.messages.length === 0 && (
                                <div className="flex flex-col items-center text-center py-10 gap-2 text-slate-400">
                                    <MessageSquare className="w-10 h-10 opacity-30" />
                                    <p className="text-sm">
                                        Say hi to {selectedChat.name} — start the
                                        conversation.
                                    </p>
                                </div>
                            )}
                            {selectedChat.messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex gap-3 ${msg.isMe ? 'justify-end' : 'justify-start'}`}
                                >
                                    {!msg.isMe && selectedChat.isGroup && (
                                        <Avatar alt={msg.senderName} size="sm" />
                                    )}
                                    <div
                                        className={`max-w-[70%] p-3 rounded-2xl ${
                                            msg.isMe
                                                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                                                : 'bg-white/5 text-slate-300'
                                        }`}
                                    >
                                        {!msg.isMe && selectedChat.isGroup && (
                                            <p className="text-xs font-medium text-cyan-400 mb-1">
                                                {msg.senderName}
                                            </p>
                                        )}
                                        <p>{msg.content}</p>
                                        <p
                                            className={`text-xs mt-1 ${msg.isMe ? 'text-white/70' : 'text-slate-500'}`}
                                        >
                                            {msg.time}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-white/10">
                            <div className="flex items-center gap-3">
                                <input
                                    type="text"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyPress={(e) =>
                                        e.key === 'Enter' && handleSend()
                                    }
                                    placeholder="Type a message..."
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                />
                                <Button
                                    onClick={handleSend}
                                    disabled={!message.trim()}
                                    className="px-4 bg-gradient-to-r from-cyan-500 to-blue-500 flex-shrink-0"
                                >
                                    <Send className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </>
                ) : (
                    // Empty State
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                        <MessageSquare className="w-20 h-20 mb-4 opacity-30" />
                        <p className="text-lg font-medium">Select a chat to start messaging</p>
                        <p className="text-sm mt-1">Start a new chat from the panel on the left</p>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default ChatPage;
