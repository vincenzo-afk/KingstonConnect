import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Zap, Send, Loader2, Sparkles, BookOpen, Code, Calculator, Brain } from 'lucide-react';

// =============================================================================
// TYPES
// =============================================================================

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

// =============================================================================
// STUDY GPT PAGE
// =============================================================================

const StudyGPTPage: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const suggestedPrompts = [
        { icon: BookOpen, text: 'Explain binary search trees', color: 'cyan' },
        { icon: Calculator, text: 'Help me with calculus problems', color: 'purple' },
        { icon: Brain, text: 'What is machine learning?', color: 'pink' },
        { icon: Code, text: 'Explain database normalization', color: 'green' },
    ];

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, {
            role: 'user',
            content: userMessage,
            timestamp: new Date()
        }]);
        setIsLoading(true);

        // Simulate AI response
        await new Promise(resolve => setTimeout(resolve, 1500));

        const aiResponse = `This is a simulated response to: "${userMessage}". 

In a production environment, this would connect to an AI service like GPT-4 or Claude to provide intelligent, contextual responses to your academic questions.

Here's what I would help you with:
• Detailed explanations of complex topics
• Step-by-step problem solving
• Code examples and debugging help
• Study tips and learning strategies
• Practice questions and quizzes`;

        setMessages(prev => [...prev, {
            role: 'assistant',
            content: aiResponse,
            timestamp: new Date()
        }]);
        setIsLoading(false);
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col">
            <Card className="flex-1 flex flex-col overflow-hidden p-0">
                {messages.length === 0 ? (
                    // Welcome Screen
                    <div className="flex-1 flex flex-col items-center justify-center p-8">
                        {/* Logo */}
                        <div className="relative mb-6">
                            <div className="w-24 h-24 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-cyan-500/30">
                                <Zap className="w-12 h-12" />
                            </div>
                            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                                <Sparkles className="w-4 h-4 text-white" />
                            </div>
                        </div>

                        <h2 className="text-3xl font-bold text-white mb-2">StudyGPT</h2>
                        <p className="text-slate-400 text-center mb-8 max-w-md">
                            Your AI-powered study assistant. Ask me anything about your courses,
                            get help with assignments, or explore new topics!
                        </p>

                        {/* Suggested Prompts */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
                            {suggestedPrompts.map((prompt, index) => {
                                const Icon = prompt.icon;
                                return (
                                    <button
                                        key={index}
                                        onClick={() => setInput(prompt.text)}
                                        className="flex items-center gap-3 p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-cyan-500/50 transition-all text-left group"
                                    >
                                        <div className={`p-2 rounded-lg bg-${prompt.color}-500/20 group-hover:bg-${prompt.color}-500/30 transition-colors`}>
                                            <Icon className={`w-5 h-5 text-${prompt.color}-400`} />
                                        </div>
                                        <span className="text-slate-300 group-hover:text-white transition-colors">
                                            {prompt.text}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    // Chat Messages
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'
                                    }`}
                            >
                                {message.role === 'assistant' && (
                                    <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                                        <Zap className="w-4 h-4" />
                                    </div>
                                )}
                                <div
                                    className={`max-w-[70%] p-4 rounded-2xl ${message.role === 'user'
                                            ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                                            : 'bg-white/5 text-slate-300 border border-white/10'
                                        }`}
                                >
                                    <p className="whitespace-pre-wrap">{message.content}</p>
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex gap-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                                    <Zap className="w-4 h-4" />
                                </div>
                                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
                                        <span className="text-slate-400">Thinking...</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                )}

                {/* Input Area */}
                <div className="p-4 border-t border-white/10">
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Ask me anything..."
                            className="flex-1 px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                            disabled={isLoading}
                        />
                        <Button
                            onClick={handleSend}
                            disabled={!input.trim() || isLoading}
                            className="px-6 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                        >
                            <Send className="w-5 h-5" />
                        </Button>
                    </div>
                    <p className="text-xs text-slate-500 mt-2 text-center">
                        StudyGPT can make mistakes. Verify important information.
                    </p>
                </div>
            </Card>
        </div>
    );
};

export default StudyGPTPage;
