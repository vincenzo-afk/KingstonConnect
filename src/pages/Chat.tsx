import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { MessageSquare, Send, Search, Paperclip, Image, Users, Phone, Video } from 'lucide-react';

// =============================================================================
// MOCK DATA
// =============================================================================

const mockChats = [
    { id: '1', name: 'CSE Section A', isGroup: true, participants: 45, avatar: null, lastMessage: 'Assignment deadline extended!', time: '2m ago', unread: 3 },
    { id: '2', name: 'Dr. Smith', isGroup: false, participants: 2, avatar: null, lastMessage: 'Your project looks good', time: '1h ago', unread: 0 },
    { id: '3', name: 'Study Group', isGroup: true, participants: 8, avatar: null, lastMessage: 'Tomorrow at library?', time: '3h ago', unread: 5 },
    { id: '4', name: 'Prof. Johnson', isGroup: false, participants: 2, avatar: null, lastMessage: 'See you in class', time: '1d ago', unread: 0 },
];

const mockMessages = [
    { id: '1', senderId: '123', senderName: 'John Doe', content: 'Hey everyone! When is the assignment due?', time: '10:30 AM', isMe: false },
    { id: '2', senderId: 'me', senderName: 'You', content: 'I think it\'s next Monday', time: '10:32 AM', isMe: true },
    { id: '3', senderId: '456', senderName: 'Jane Smith', content: 'Yes, Dr. Smith mentioned it in the last class', time: '10:35 AM', isMe: false },
    { id: '4', senderId: '123', senderName: 'John Doe', content: 'Great, thanks!', time: '10:36 AM', isMe: false },
    { id: '5', senderId: 'me', senderName: 'You', content: 'No problem! Let me know if you need any help with the code', time: '10:38 AM', isMe: true },
];

// =============================================================================
// CHAT PAGE
// =============================================================================

const ChatPage: React.FC = () => {
    const [selectedChat, setSelectedChat] = useState<typeof mockChats[0] | null>(null);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState(mockMessages);
    const [searchQuery, setSearchQuery] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = () => {
        if (!message.trim()) return;

        const newMessage = {
            id: Date.now().toString(),
            senderId: 'me',
            senderName: 'You',
            content: message,
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            isMe: true,
        };

        setMessages(prev => [...prev, newMessage]);
        setMessage('');
    };

    const filteredChats = mockChats.filter(chat =>
        chat.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="h-[calc(100vh-8rem)] flex gap-4">
            {/* Chat List */}
            <Card className={`w-80 flex-shrink-0 flex flex-col overflow-hidden p-0 ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
                {/* Search */}
                <div className="p-4 border-b border-white/10">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search chats..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                        />
                    </div>
                </div>

                {/* Chat Items */}
                <div className="flex-1 overflow-y-auto">
                    {filteredChats.map(chat => (
                        <button
                            key={chat.id}
                            onClick={() => setSelectedChat(chat)}
                            className={`w-full p-4 flex items-center gap-3 border-b border-white/5 hover:bg-white/5 transition-colors text-left ${selectedChat?.id === chat.id ? 'bg-white/5' : ''
                                }`}
                        >
                            <Avatar alt={chat.name} size="md" />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <p className="font-medium text-white truncate">{chat.name}</p>
                                    <span className="text-xs text-slate-500">{chat.time}</span>
                                </div>
                                <div className="flex items-center justify-between mt-0.5">
                                    <p className="text-sm text-slate-400 truncate">{chat.lastMessage}</p>
                                    {chat.unread > 0 && (
                                        <Badge variant="primary" size="sm">{chat.unread}</Badge>
                                    )}
                                </div>
                                {chat.isGroup && (
                                    <p className="text-xs text-slate-500 mt-1">
                                        <Users className="w-3 h-3 inline mr-1" />
                                        {chat.participants} members
                                    </p>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            </Card>

            {/* Chat Window */}
            <Card className={`flex-1 flex flex-col overflow-hidden p-0 ${!selectedChat ? 'hidden md:flex' : 'flex'}`}>
                {selectedChat ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setSelectedChat(null)}
                                    className="md:hidden p-2 -ml-2 hover:bg-white/5 rounded-lg"
                                >
                                    ←
                                </button>
                                <Avatar alt={selectedChat.name} size="md" />
                                <div>
                                    <p className="font-medium text-white">{selectedChat.name}</p>
                                    <p className="text-sm text-slate-400">
                                        {selectedChat.isGroup ? `${selectedChat.participants} members` : 'Online'}
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
                            {messages.map(msg => (
                                <div
                                    key={msg.id}
                                    className={`flex gap-3 ${msg.isMe ? 'justify-end' : 'justify-start'}`}
                                >
                                    {!msg.isMe && selectedChat.isGroup && (
                                        <Avatar alt={msg.senderName} size="sm" />
                                    )}
                                    <div
                                        className={`max-w-[70%] p-3 rounded-2xl ${msg.isMe
                                                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                                                : 'bg-white/5 text-slate-300'
                                            }`}
                                    >
                                        {!msg.isMe && selectedChat.isGroup && (
                                            <p className="text-xs font-medium text-cyan-400 mb-1">{msg.senderName}</p>
                                        )}
                                        <p>{msg.content}</p>
                                        <p className={`text-xs mt-1 ${msg.isMe ? 'text-white/70' : 'text-slate-500'}`}>
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
                                <Button variant="ghost" size="sm" className="p-2 flex-shrink-0">
                                    <Paperclip className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="p-2 flex-shrink-0">
                                    <Image className="w-4 h-4" />
                                </Button>
                                <input
                                    type="text"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
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
                        <p className="text-sm mt-1">Choose from your conversations on the left</p>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default ChatPage;
