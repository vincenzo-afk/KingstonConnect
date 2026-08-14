import React, { useState, useRef } from 'react';
import { useAuthStore } from '@/stores';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
    FileText,
    Download,
    Grid,
    List,
    Upload,
    Search,
    BookOpen,
    X,
    Trash2,
    Star,
} from 'lucide-react';

// =============================================================================
// NOTES STORE — teacher notes uploaded in-app (no mock data)
// =============================================================================

export interface NoteItem {
    id: string;
    title: string;
    subject: string;
    code: string;
    author: string;
    date: string; // ISO YYYY-MM-DD
    size: string;
    downloads: number;
    status: 'approved' | 'pending';
    rating: number;
    type: string; // pdf | video | ppt | ...
    fileName?: string;
}


// Uploaded files are kept in memory (metadata + blob) so students can
// download what teachers upload during the same session.
const fileBlobs = new Map<string, Blob>();

const createNotesStore = () => {
    // A lightweight persisted store via a module-level state + localStorage.
    // Kept simple (no zustand) so the upload form can stay within this page.
    const KEY = 'kingston-notes';
    const listeners = new Set<() => void>();

    const read = (): NoteItem[] => {
        try {
            return JSON.parse(localStorage.getItem(KEY) || '[]') as NoteItem[];
        } catch {
            return [];
        }
    };

    let state: NoteItem[] = read();

    const write = (next: NoteItem[]) => {
        state = next;
        localStorage.setItem(KEY, JSON.stringify(next));
        listeners.forEach((l) => l());
    };

        return {
        useNotes: () => {
            // Subscribe to changes using a ref-safe pattern: re-render on store writes.
            const [, forceUpdate] = useState(0);
            React.useEffect(() => {
                const listener = () => forceUpdate((t) => t + 1);
                listeners.add(listener);
                return () => {
                    listeners.delete(listener);
                };
            }, []);
            return {
                notes: state,
                addNote: (
                    note: Omit<
                        NoteItem,
                        'id' | 'date' | 'downloads' | 'status' | 'rating'
                    > & { id?: string }
                ) =>
                    write([
                        {
                            ...note,
                            id: note.id ?? `note-${Date.now()}`,
                            date: new Date().toISOString().split('T')[0],
                            downloads: 0,
                            status: 'pending',
                            rating: 0,
                        },
                        ...state,
                    ]),
                removeNote: (id: string) =>
                    write(state.filter((n) => n.id !== id)),
                incrementDownloads: (id: string) =>
                    write(
                        state.map((n) =>
                            n.id === id
                                ? { ...n, downloads: n.downloads + 1 }
                                : n
                        )
                    ),
            };
        },
    };
};

const notesStore = createNotesStore();

// =============================================================================
// NOTES PAGE
// =============================================================================

const NotesPage: React.FC = () => {
    const { user } = useAuthStore();
    const { notes, addNote, removeNote, incrementDownloads } =
        notesStore.useNotes();
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [subjectFilter, setSubjectFilter] = useState<string>('all');
    const [showUpload, setShowUpload] = useState(false);
    const [title, setTitle] = useState('');
    const [subject, setSubject] = useState('');
    const [code, setCode] = useState('');
    const [noteType, setNoteType] = useState<'pdf' | 'video' | 'ppt' | 'doc'>('pdf');
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isStaff =
        user?.role === 'teacher' ||
        user?.role === 'hod' ||
        user?.role === 'principal';

    const subjects = [...new Set(notes.map((n) => n.subject))];

    const filteredNotes = notes.filter((note) => {
        const matchesSearch =
            note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            note.subject.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSubject =
            subjectFilter === 'all' || note.subject === subjectFilter;
        return matchesSearch && matchesSubject;
    });

    const getFileIcon = (type: string) => {
        switch (type) {
            case 'pdf':
                return 'bg-red-500/20 text-red-400';
            case 'video':
                return 'bg-purple-500/20 text-purple-400';
            case 'ppt':
                return 'bg-orange-500/20 text-orange-400';
            default:
                return 'bg-blue-500/20 text-blue-400';
        }
    };

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const handleUpload = () => {
        if (!title.trim() || !subject.trim() || !uploadFile) return;
        const noteId = `note-${Date.now()}`;
        fileBlobs.set(noteId, uploadFile);
        addNote({
            id: noteId,
            title: title.trim(),
            subject: subject.trim(),
            code: code.trim(),
            author:
                user?.firstName && user?.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user?.role ?? 'Teacher',
            size: formatSize(uploadFile.size),
            type: noteType,
            fileName: uploadFile.name,
        });
        setTitle('');
        setSubject('');
        setCode('');
        setNoteType('pdf');
        setUploadFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setShowUpload(false);
    };

    const handleDownload = (note: NoteItem) => {
        incrementDownloads(note.id);
        const blob = fileBlobs.get(note.id);
        if (blob && note.fileName) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = note.fileName;
            a.click();
            URL.revokeObjectURL(url);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">
                        Study Materials
                    </h2>
                    <p className="text-slate-400">
                        {notes.length} note{notes.length === 1 ? '' : 's'}{' '}
                        available
                    </p>
                </div>
                {isStaff && (
                    <Button
                        variant="primary"
                        className="gap-2"
                        onClick={() => setShowUpload((v) => !v)}
                    >
                        {showUpload ? (
                            <>
                                <X className="w-4 h-4" /> Close
                            </>
                        ) : (
                            <>
                                <Upload className="w-4 h-4" /> Upload Notes
                            </>
                        )}
                    </Button>
                )}
            </div>

            {/* Upload form (staff only) */}
            {isStaff && showUpload && (
                <Card>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Upload className="w-4 h-4 text-cyan-400" /> Upload
                        study material
                    </h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <p className="text-sm font-medium text-slate-300 mb-1.5">
                                    Title
                                </p>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. Data Structures Complete Notes"
                                    className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-300 mb-1.5">
                                    Subject
                                </p>
                                <input
                                    type="text"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="e.g. Data Structures"
                                    className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-300 mb-1.5">
                                    Subject code
                                </p>
                                <input
                                    type="text"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    placeholder="e.g. CSE101"
                                    className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                />
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-slate-300 mb-1.5">
                                    File
                                </p>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf,.ppt,.pptx,.doc,.docx,.mp4,.zip"
                                    onChange={(e) => {
                                        const f = e.target.files?.[0] ?? null;
                                        setUploadFile(f);
                                        if (f && !title.trim()) {
                                            setTitle(
                                                f.name.replace(
                                                    /\.[^.]+$/,
                                                    ''
                                                )
                                            );
                                        }
                                    }}
                                    className="w-full text-sm text-slate-300 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border file:border-white/10 file:bg-white/5 file:text-white file:cursor-pointer"
                                />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-300 mb-1.5">
                                    Type
                                </p>
                                <div className="flex gap-1.5">
                                    {(['pdf', 'video', 'ppt', 'doc'] as const).map((t) => (
                                        <button
                                            key={t}
                                            type="button"
                                            onClick={() => setNoteType(t)}
                                            className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-colors ${
                                                noteType === t
                                                    ? 'bg-cyan-500 text-white'
                                                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                                            }`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <Button
                            variant="primary"
                            onClick={handleUpload}
                            disabled={!title.trim() || !subject.trim() || !uploadFile}
                        >
                            Publish note
                        </Button>
                    </div>
                </Card>
            )}

            {/* Search & Filters */}
            <Card className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search notes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                        />
                    </div>

                    {/* Subject Filter */}
                    <select
                        value={subjectFilter}
                        onChange={(e) => setSubjectFilter(e.target.value)}
                        className="px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    >
                        <option value="all">All Subjects</option>
                        {subjects.map((s) => (
                            <option key={s} value={s}>
                                {s}
                            </option>
                        ))}
                    </select>

                    {/* View Toggle */}
                    <div className="flex gap-1 p-1 rounded-lg bg-white/5">
                        <button
                            type="button"
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-lg transition-colors ${
                                viewMode === 'grid'
                                    ? 'bg-white/10 text-white'
                                    : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            <Grid className="w-4 h-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg transition-colors ${
                                viewMode === 'list'
                                    ? 'bg-white/10 text-white'
                                    : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </Card>

            {/* Notes Grid/List */}
            <div
                className={
                    viewMode === 'grid'
                        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                        : 'space-y-3'
                }
            >
                {filteredNotes.map((note) => {
                    const iconClasses = getFileIcon(note.type);

                    if (viewMode === 'grid') {
                        return (
                            <Card
                                key={note.id}
                                className="hover:border-cyan-500/30 transition-colors group"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className={`p-3 rounded-xl ${iconClasses}`}>
                                        {note.type === 'video' ? (
                                            <BookOpen className="w-6 h-6" />
                                        ) : (
                                            <FileText className="w-6 h-6" />
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Badge
                                            variant={
                                                note.status === 'approved'
                                                    ? 'success'
                                                    : 'warning'
                                            }
                                            size="sm"
                                        >
                                            {note.status}
                                        </Badge>
                                        {isStaff && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeNote(note.id)
                                                }
                                                className="text-slate-500 hover:text-red-400 transition-colors p-1"
                                                aria-label={`Delete ${note.title}`}
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <h3 className="font-semibold text-white mb-1 group-hover:text-cyan-400 transition-colors">
                                    {note.title}
                                </h3>
                                <p className="text-sm text-slate-400 mb-3">
                                    {note.subject}
                                    {note.code ? ` • ${note.code}` : ''}
                                </p>

                                <div className="flex items-center justify-between text-sm text-slate-400 mb-4">
                                    <span>{note.author}</span>
                                    <span>{note.size}</span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 text-sm text-slate-500">
                                        <span className="flex items-center gap-1">
                                            <Download className="w-3 h-3" />
                                            {note.downloads}
                                        </span>
                                        {note.rating > 0 && (
                                            <span className="flex items-center gap-1 text-yellow-400">
                                                <Star className="w-3 h-3 fill-current" />
                                                {note.rating}
                                            </span>
                                        )}
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="gap-1"
                                        onClick={() => handleDownload(note)}
                                    >
                                        <Download className="w-3 h-3" />
                                        Download
                                    </Button>
                                </div>
                            </Card>
                        );
                    }

                    return (
                        <Card
                            key={note.id}
                            className="p-4 hover:border-cyan-500/30 transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <div
                                    className={`p-3 rounded-xl ${iconClasses} flex-shrink-0`}
                                >
                                    {note.type === 'video' ? (
                                        <BookOpen className="w-5 h-5" />
                                    ) : (
                                        <FileText className="w-5 h-5" />
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-white truncate">
                                            {note.title}
                                        </h3>
                                        <Badge
                                            variant={
                                                note.status === 'approved'
                                                    ? 'success'
                                                    : 'warning'
                                            }
                                            size="sm"
                                        >
                                            {note.status}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-slate-400">
                                        {note.subject} • {note.author}
                                    </p>
                                </div>

                                <div className="flex items-center gap-4 text-sm text-slate-400">
                                    <span>{note.size}</span>
                                    <span className="flex items-center gap-1">
                                        <Download className="w-3 h-3" />
                                        {note.downloads}
                                    </span>
                                    {note.rating > 0 && (
                                        <span className="flex items-center gap-1 text-yellow-400">
                                            <Star className="w-3 h-3 fill-current" />
                                            {note.rating}
                                        </span>
                                    )}
                                    {isStaff && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                removeNote(note.id)
                                            }
                                            className="text-slate-500 hover:text-red-400 transition-colors"
                                            aria-label={`Delete ${note.title}`}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>

                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="gap-1 flex-shrink-0"
                                    onClick={() => handleDownload(note)}
                                >
                                    <Download className="w-3 h-3" />
                                    Download
                                </Button>
                            </div>
                        </Card>
                    );
                })}
            </div>

            {filteredNotes.length === 0 && (
                <Card className="text-center py-12">
                    <FileText className="w-16 h-16 mx-auto text-slate-600 mb-4" />
                    <p className="text-white font-medium">
                        {notes.length === 0
                            ? 'No notes yet'
                            : 'No notes found matching your search'}
                    </p>
                    <p className="text-sm text-slate-400 mt-1">
                        {notes.length === 0
                            ? 'Teachers can publish study materials using the Upload Notes button.'
                            : 'Try a different subject or keyword'}
                    </p>
                </Card>
            )}
        </div>
    );
};

export default NotesPage;
