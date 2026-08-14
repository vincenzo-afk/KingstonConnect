import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/stores';
import { sendMessage, setColabUrl, getColabUrl } from '@/services/studygpt.service';
import { getStudentQuickFacts } from '@/services/studyContext';
import { useAUResultsStore } from '@/stores/auResultsStore';
import { FORMAT_RULES } from '@/services/formatEngine';
import {
    Send,
    Paperclip,
    Sparkles,
    BookOpen,
    Brain,
    FileText,
    X,
    Loader2,
    Copy,
    Check,
    RefreshCw,
    Maximize2,
    Minimize2,
    Code,
    Calculator,
    Settings,
    Link as LinkIcon,
    ChevronRight
} from 'lucide-react';

interface Message {
    id: string;
    role: 'user' | 'ai';
    content: string;
    timestamp: Date;
    attachments?: string[];
    sources?: string[];
    isLoading?: boolean;
    error?: boolean;
}

interface StudyGPTChatProps {
    className?: string;
}

// Inline formatting helper (bold **..** and italic *..*)
const renderInline = (text: string, strongClass: string): React.ReactNode => {
    const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
    return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i} className={strongClass}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
            return <em key={i} className="text-slate-300">{part.slice(1, -1)}</em>;
        }
        if (part.includes('`')) {
            const codeParts = part.split(/(`[^`]+`)/g);
            return (
                <span key={i}>
                    {codeParts.map((cp, j) =>
                        cp.startsWith('`') && cp.endsWith('`') ? (
                            <code key={j} className="px-1.5 py-0.5 bg-white/10 rounded text-cyan-300 text-sm font-mono border border-white/10">{cp.slice(1, -1)}</code>
                        ) : (
                            <span key={j}>{cp}</span>
                        )
                    )}
                </span>
            );
        }
        return <span key={i}>{part}</span>;
    });
};

// Markdown-like text renderer
const MessageContent: React.FC<{ content: string; isUser?: boolean }> = ({ content, isUser }) => {
    const strongClass = isUser ? 'text-white' : 'text-cyan-300 font-semibold';
    const renderLine = (line: string, index: number) => {
        // Code blocks (inline)
        if (line.includes('`') && !line.startsWith('```')) {
            return <p key={index} className="mb-2">{renderInline(line, strongClass)}</p>;
        }

        // Bold / italic text
        if (line.includes('**') || line.includes('*')) {
            return <p key={index} className="mb-2">{renderInline(line, strongClass)}</p>;
        }

        // Headers
        if (line.startsWith('### ')) {
            return <h4 key={index} className="text-base font-semibold text-white mt-4 mb-2">{line.slice(4)}</h4>;
        }
        if (line.startsWith('## ')) {
            return <h3 key={index} className="text-lg font-semibold text-white mt-4 mb-2">{line.slice(3)}</h3>;
        }
        if (line.startsWith('# ')) {
            return <h2 key={index} className="text-xl font-bold text-white mt-4 mb-3">{line.slice(2)}</h2>;
        }

        // Numbered lists
        if (/^\d+\.\s/.test(line)) {
            return (
                <div key={index} className="flex gap-3 mb-2 ml-1">
                    <span className="text-cyan-400 font-medium">{line.match(/^\d+/)?.[0]}.</span>
                    <span>{line.replace(/^\d+\.\s/, '')}</span>
                </div>
            );
        }

        // Bullet points
        if (line.startsWith('• ') || line.startsWith('- ') || line.startsWith('* ')) {
            return (
                <div key={index} className="flex gap-3 mb-2 ml-1">
                    <span className="text-cyan-400">•</span>
                    <span>{line.slice(2)}</span>
                </div>
            );
        }

        // Empty lines
        if (line.trim() === '') {
            return <div key={index} className="h-3" />;
        }

        // Regular text
        return <p key={index} className="mb-2 leading-relaxed">{line}</p>;
    };

    const lines = content.split('\n');
    const rendered: React.ReactNode[] = [];
    let i = 0;
    while (i < lines.length) {
        const line = lines[i];
        // Detect markdown table blocks
        if (/^\|/.test(line) && i + 1 < lines.length && /^\|[\s:\-|]+\|$/.test(lines[i + 1].trim())) {
            const headerCells = line.split('|').filter(c => c.trim() !== '');
            const rows: string[][] = [];
            let j = i + 2;
            while (j < lines.length && /^\|/.test(lines[j])) {
                rows.push(lines[j].split('|').filter(c => c.trim() !== ''));
                j++;
            }
            rendered.push(
                <div key={`table-${i}`} className="my-3 overflow-x-auto rounded-lg border border-white/10">
                    <table className="w-full text-xs sm:text-sm">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/5">
                                {headerCells.map((cell, ci) => (
                                    <th key={ci} className="px-2.5 py-2 text-left font-semibold text-cyan-300 whitespace-nowrap">{cell.trim()}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, ri) => (
                                <tr key={ri} className="border-b border-white/5 last:border-0">
                                    {row.map((cell, ci) => (
                                        <td key={ci} className="px-2.5 py-2 text-slate-300 whitespace-nowrap">{cell.trim()}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
            i = j;
            continue;
        }
        rendered.push(renderLine(line, i));
        i++;
    }

    return (
        <div className="space-y-0.5">
            {rendered}
        </div>
    );
};

export const StudyGPTChat: React.FC<StudyGPTChatProps> = ({ className }) => {
    const { user } = useAuthStore();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [attachments, setAttachments] = useState<File[]>([]);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [answerFormat, setAnswerFormat] = useState<string | null>(null);
    const [showFormatPicker, setShowFormatPicker] = useState(false);
    const [apiUrl, setApiUrl] = useState(getColabUrl() || '');
    const [sessionId] = useState(() => Date.now().toString());

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
        }
    }, [input]);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const handleSend = useCallback(async () => {
        // Append the selected answer format to the query so the service route
        // picks it up for BOTH the local engine and the online backend.
        const effectiveInput = answerFormat
            ? `${input.trim()} — answer in ${answerFormat} format`
            : input.trim();
        if (!effectiveInput && attachments.length === 0) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: effectiveInput,
            timestamp: new Date(),
            attachments: attachments.map(f => f.name),
        };

        setMessages(prev => [...prev, userMessage]);
        const currentInput = effectiveInput;
        setInput('');
        setAttachments([]);
        setIsLoading(true);

        // Add typing indicator
        const loadingId = 'loading-' + Date.now();
        setMessages(prev => [...prev, {
            id: loadingId,
            role: 'ai',
            content: '',
            timestamp: new Date(),
            isLoading: true,
        }]);

        try {
            // Call the StudyGPT service
            const response = await sendMessage(
                currentInput,
                sessionId,
                user?.id || 'anonymous',
                messages, // Pass history
                attachments.length > 0 ? attachments : undefined
            );

            // Replace loading message with actual response
            setMessages(prev =>
                prev.filter(m => m.id !== loadingId).concat({
                    id: Date.now().toString(),
                    role: 'ai',
                    content: response.content,
                    timestamp: new Date(),
                    sources: response.sources?.map(s => typeof s === 'string' ? s : s) || [],
                })
            );
        } catch (error) {
            // Show error message
            const errorMessage = error instanceof Error ? error.message : 'Sorry, I encountered an error. Please check your connection settings.';
            setMessages(prev =>
                prev.filter(m => m.id !== loadingId).concat({
                    id: Date.now().toString(),
                    role: 'ai',
                    content: errorMessage,
                    timestamp: new Date(),
                    error: true,
                })
            );
        } finally {
            setIsLoading(false);
        }
    }, [input, answerFormat, attachments, sessionId, user?.id, messages]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setAttachments(prev => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    const removeAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const copyToClipboard = async (text: string, id: string) => {
        await navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const regenerateResponse = (messageId: string) => {
        const messageIndex = messages.findIndex(m => m.id === messageId);
        if (messageIndex > 0) {
            const userMessage = messages[messageIndex - 1];
            if (userMessage.role === 'user') {
                setMessages(prev => prev.slice(0, messageIndex));
                setInput(userMessage.content);
            }
        }
    };

    const saveSettings = () => {
        setColabUrl(apiUrl);
        setShowSettings(false);
    };

    // Context-aware quick prompts derived from the student's live profile
    const quickFacts = getStudentQuickFacts(user);
    const auResultsCount = useAUResultsStore((s) => s.semesters.length);
    const suggestedQuestions = [
        { icon: <Brain className="w-5 h-5" />, title: "Explain a concept", desc: "Understand complex topics simply", query: 'Explain deadlock in operating systems with an example' },
        { icon: <BookOpen className="w-5 h-5" />, title: "Study Plan", desc: "Create a schedule for exams", query: 'Create a study plan for my weak subjects' },
        { icon: <Code className="w-5 h-5" />, title: "Code Help", desc: "Debug or write code snippets", query: 'Write code for AVL tree insertion with rotations' },
        { icon: <Calculator className="w-5 h-5" />, title: "Solve Problems", desc: "Step-by-step math solutions", query: 'Solve 0/1 knapsack using dynamic programming' },
    ];
    // Personalized chips: shown when we have recorded results / low attendance data
    const personalizedChips: { label: string; query: string }[] = [];
    if (quickFacts.weakSubjectName) {
        personalizedChips.push({ label: `Help me improve ${quickFacts.weakSubjectName}`, query: `Create a revision plan for ${quickFacts.weakSubjectName}` });
    }
    if (quickFacts.semester) {
        personalizedChips.push({ label: `Study plan for semester ${quickFacts.semester}`, query: `Create a study plan for semester ${quickFacts.semester}` });
    }
    if (quickFacts.attendanceLowSubject) {
        personalizedChips.push({ label: `Fix my attendance in ${quickFacts.attendanceLowSubject}`, query: `How do I fix my attendance in ${quickFacts.attendanceLowSubject}?` });
    }
    if (quickFacts.urgentDeadlineTitle && quickFacts.urgentDeadlineDays !== null) {
        personalizedChips.push({ label: `Help with ${quickFacts.urgentDeadlineTitle} (due in ${quickFacts.urgentDeadlineDays}d)`, query: `How do I prepare for ${quickFacts.urgentDeadlineTitle}?` });
    }
    personalizedChips.push({ label: 'What should I focus on today?', query: 'Based on my dashboard data, what should I focus on today?' });
    personalizedChips.push({ label: 'Tell me what teachers uploaded', query: 'What have my teachers uploaded or announced recently?' });
    if (quickFacts.weakSubjectName) {
        personalizedChips.push({ label: `Quiz me on ${quickFacts.weakSubjectName}`, query: `Give me an interactive quiz on ${quickFacts.weakSubjectName}` });
    }
    if (auResultsCount === 0) {
        personalizedChips.push({ label: 'How does CGPA/grading work?', query: 'Explain Anna University grades and how CGPA is calculated' });
    } else {
        personalizedChips.push({ label: 'Analyze my CGPA', query: 'Analyze my CGPA and suggest how to improve it' });
    }

    return (
        <div className={cn(
            'flex flex-col bg-[#0a0f14] relative overflow-hidden',
            isFullscreen ? 'fixed inset-0 z-50' : 'h-[calc(100vh-6rem)] rounded-2xl border border-white/5',
            className
        )}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#0a0f14]/80 backdrop-blur-md z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-white flex items-center gap-2">
                            StudyGPT
                            <Badge variant="success" className="px-1.5 py-0.5 text-[10px] h-5">Beta</Badge>
                        </h1>
                        <p className="text-xs text-slate-400">AI Study Companion</p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        icon={<Settings className="w-4 h-4" />}
                        onClick={() => setShowSettings(true)}
                        className="text-slate-400 hover:text-white"
                    />
                    <Button
                        variant="ghost"
                        size="sm"
                        icon={isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        className="text-slate-400 hover:text-white"
                    />
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto scrollbar-hide relative">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-fade-in">
                        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 flex items-center justify-center mb-8 border border-white/5">
                            <Sparkles className="w-10 h-10 text-cyan-400" />
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">
                            Hello, {user?.firstName || 'Student'}! 👋
                        </h2>
                        <p className="text-slate-400 max-w-md mb-12 text-lg">
                            I'm here to help you ace your exams. Ask me anything about your subjects, notes, or assignments.
                        </p>

                        {personalizedChips.length > 0 && (
                        <div className="w-full max-w-2xl mb-8">
                            <p className="text-xs font-medium text-cyan-400 uppercase tracking-wider mb-3">Based on your profile</p>
                            <div className="flex flex-wrap gap-2 justify-center">
                                {personalizedChips.map((chip, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setInput(chip.query)}
                                        className="px-3 py-1.5 text-xs bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 text-cyan-300 rounded-full hover:border-cyan-400 hover:bg-cyan-500/20 transition-all"
                                    >
                                        {chip.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl w-full">
                            {suggestedQuestions.map((item, i) => (
                                <button
                                    key={i}
                                    onClick={() => setInput(item.query)}
                                    className="flex items-center gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 hover:border-white/10 transition-all group text-left"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform border border-white/5">
                                        {item.icon}
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-white group-hover:text-cyan-300 transition-colors">{item.title}</h3>
                                        <p className="text-xs text-slate-500">{item.desc}</p>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-600 ml-auto group-hover:text-white group-hover:translate-x-1 transition-all" />
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="max-w-3xl mx-auto p-6 space-y-8">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={cn(
                                    'flex gap-4 group animate-fade-in',
                                    message.role === 'user' ? 'flex-row-reverse' : ''
                                )}
                            >
                                {/* Avatar */}
                                <div className={cn(
                                    "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-1",
                                    message.role === 'ai' ? "bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg" : "bg-slate-700"
                                )}>
                                    {message.role === 'ai' ? (
                                        <Sparkles className="w-4 h-4 text-white" />
                                    ) : (
                                        <span className="text-xs font-bold text-white">
                                            {user?.firstName?.charAt(0) || 'U'}
                                        </span>
                                    )}
                                </div>

                                {/* Message Content */}
                                <div className={cn(
                                    'flex-1 max-w-[85%]',
                                    message.role === 'user' && 'flex flex-col items-end'
                                )}>
                                    <div className={cn(
                                        'rounded-2xl p-4 text-sm leading-relaxed shadow-sm',
                                        message.role === 'ai'
                                            ? 'bg-white/5 border border-white/5 text-slate-200'
                                            : 'bg-cyan-600 text-white'
                                    )}>
                                        {message.isLoading ? (
                                            <div className="flex items-center gap-2">
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <span>Thinking...</span>
                                            </div>
                                        ) : (
                                            <MessageContent content={message.content} isUser={message.role === 'user'} />
                                        )}
                                    </div>

                                    {/* Footer Actions (AI Only) */}
                                    {message.role === 'ai' && !message.isLoading && (
                                        <div className="flex items-center gap-2 mt-2 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => copyToClipboard(message.content, message.id)}
                                                className="p-1.5 text-slate-500 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                                                title="Copy"
                                            >
                                                {copiedId === message.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                            </button>
                                            <button
                                                onClick={() => regenerateResponse(message.id)}
                                                className="p-1.5 text-slate-500 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                                                title="Regenerate"
                                            >
                                                <RefreshCw className="w-3.5 h-3.5" />
                                            </button>
                                            <span className="text-[10px] text-slate-600 ml-auto">
                                                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-[#0a0f14]/95 backdrop-blur-xl border-t border-white/5 z-20">
                <div className="max-w-3xl mx-auto">
                    {/* Attachments Preview */}
                    {attachments.length > 0 && (
                        <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
                            {attachments.map((file, index) => (
                                <div key={index} className="flex items-center gap-2 px-3 py-1.5 bg-white/10 border border-white/10 rounded-lg text-xs text-slate-300">
                                    <FileText className="w-3 h-3" />
                                    <span className="truncate max-w-[100px]">{file.name}</span>
                                    <button onClick={() => removeAttachment(index)} className="hover:text-red-400"><X className="w-3 h-3" /></button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Answer-as format selector: the full ~200-format catalog is
                        normalized into grouped picks; the chosen label is
                        appended to the query so the AI answers in that format */}
                    {showFormatPicker ? (
                        <div className="mb-3 p-3 bg-white/5 border border-white/10 rounded-2xl">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium text-slate-300">Answer as…</span>
                                <button
                                    onClick={() => setShowFormatPicker(false)}
                                    className="text-xs text-cyan-400 hover:text-cyan-300"
                                >
                                    Done
                                </button>
                            </div>
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-1.5 max-h-[220px] overflow-y-auto scrollbar-hide">
                                {['Text & Notes', 'Exams', 'Programming', 'Visual & Diagrams', 'Tables & Business', 'Learning & Modes'].map(group => (
                                    <React.Fragment key={group}>
                                        <div className="col-span-3 sm:col-span-4 md:col-span-6 text-[10px] uppercase tracking-wider text-slate-500 mt-1 mb-0.5">
                                            {group}
                                        </div>
                                        {FORMAT_RULES.filter(r => {
                                            if (group === 'Text &amp; Notes') return ['mcq', 'flashcards', 'cheatSheet', 'revisionNotes', 'mnemonics', 'quiz', 'twoMark', 'sixteenMark', 'glossary', 'faq', 'trueFalse', 'fillBlanks', 'matchFollowing', 'caseStudy', 'rapidFire', 'interview', 'viva', 'labRecord', 'selfAssessment', 'mistakeAnalysis'].includes(r.id);
                                            if (group === 'Exams') return ['twoMark', 'sixteenMark', 'examAnswer', 'rapidFire'].includes(r.id);
                                            if (group === 'Programming') return ['code', 'pseudocode', 'dryRun', 'ascii'].includes(r.id);
                                            if (group === 'Visual &amp; Diagrams') return ['flowchart', 'mindmap', 'sequenceDiagram', 'decisionTree', 'ascii'].includes(r.id);
                                            if (group === 'Tables &amp; Business') return ['comparisonTable', 'differenceTable', 'swot', 'caseStudy', 'formulaSheet'].includes(r.id);
                                            return ['eli5', 'analogy', 'story', 'stepByStep'].includes(r.id);
                                        }).map(r => (
                                            <button
                                                key={`${group}-${r.id}`}
                                                onClick={() => { setAnswerFormat(r.label); setShowFormatPicker(false); }}
                                                className="px-2 py-1.5 text-xs rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:border-cyan-500/50 hover:text-cyan-300 hover:bg-white/10 transition-colors truncate"
                                            >
                                                {r.label}
                                            </button>
                                        ))}
                                    </React.Fragment>
                                ))}
                            </div>
                            {answerFormat && (
                                <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                                    <span>Answering as: <span className="text-cyan-400 font-medium">{answerFormat}</span></span>
                                    <button onClick={() => setAnswerFormat(null)} className="text-slate-500 hover:text-red-400"><X className="w-3 h-3" /></button>
                                </div>
                            )}
                        </div>
                    ) : null}

                    <div className="relative flex items-end gap-2 p-2 bg-white/5 border border-white/10 rounded-2xl focus-within:border-cyan-500/50 focus-within:bg-white/10 transition-all">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            multiple
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                            title="Attach files"
                        >
                            <Paperclip className="w-5 h-5" />
                        </button>

                        <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask StudyGPT..."
                            className="flex-1 bg-transparent text-white placeholder:text-slate-500 resize-none focus:outline-none max-h-[150px] py-2.5 text-sm leading-relaxed scrollbar-hide"
                            rows={1}
                        />

                        <button
                            onClick={() => setShowFormatPicker(v => !v)}
                            title="Answer as… (MCQ, flashcards, 2-mark, flowchart …)"
                            className={cn(
                                'p-2.5 rounded-xl transition-colors',
                                answerFormat ? 'text-cyan-400 bg-cyan-500/10' : 'text-slate-400 hover:text-white hover:bg-white/10'
                            )}
                        >
                            <Sparkles className="w-5 h-5" />
                        </button>
                        <Button
                            variant="primary"
                            glow
                            onClick={handleSend}
                            disabled={isLoading || (!input.trim() && attachments.length === 0)}
                            className="rounded-xl px-4 h-[42px]"
                            icon={isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                        />
                    </div>
                    <p className="text-[10px] text-center text-slate-600 mt-2">
                        StudyGPT can make mistakes. Consider checking important information.
                    </p>
                </div>
            </div>

            {/* Settings Modal */}
            <Modal isOpen={showSettings} onClose={() => setShowSettings(false)} title="AI Settings" size="sm">
                <div className="space-y-4">
                    <Input
                        label="Colab API URL"
                        placeholder="https://xxxx.ngrok-free.app"
                        value={apiUrl}
                        onChange={(e) => setApiUrl(e.target.value)}
                        icon={<LinkIcon className="w-4 h-4" />}
                    />
                    <div className="flex justify-end gap-2">
                        <Button variant="secondary" onClick={() => setShowSettings(false)}>Cancel</Button>
                        <Button glow onClick={saveSettings}>Save</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
