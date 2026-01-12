import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { FileText, Download, Grid, List, Upload, Search, Star, BookOpen } from 'lucide-react';

// =============================================================================
// MOCK DATA
// =============================================================================

const mockNotes = [
    { id: '1', title: 'Data Structures Complete Notes', subject: 'Data Structures', code: 'CSE101', author: 'Dr. Smith', date: '2024-01-10', size: '2.5 MB', downloads: 145, status: 'approved', rating: 4.8, type: 'pdf' },
    { id: '2', title: 'Algorithm Analysis Guide', subject: 'Algorithms', code: 'CSE102', author: 'Prof. Johnson', date: '2024-01-08', size: '1.8 MB', downloads: 98, status: 'approved', rating: 4.5, type: 'pdf' },
    { id: '3', title: 'SQL Fundamentals', subject: 'DBMS', code: 'CSE103', author: 'Dr. Williams', date: '2024-01-12', size: '3.2 MB', downloads: 67, status: 'approved', rating: 4.2, type: 'pdf' },
    { id: '4', title: 'OS Process Management', subject: 'Operating Systems', code: 'CSE104', author: 'Dr. Brown', date: '2024-01-05', size: '1.5 MB', downloads: 112, status: 'approved', rating: 4.6, type: 'pdf' },
    { id: '5', title: 'Graph Theory Basics', subject: 'Discrete Math', code: 'MAT201', author: 'Prof. Davis', date: '2024-01-14', size: '0.9 MB', downloads: 45, status: 'pending', rating: 0, type: 'pdf' },
    { id: '6', title: 'Binary Trees Lecture', subject: 'Data Structures', code: 'CSE101', author: 'Dr. Smith', date: '2024-01-11', size: '45 MB', downloads: 89, status: 'approved', rating: 4.7, type: 'video' },
];

// =============================================================================
// NOTES PAGE
// =============================================================================

const NotesPage: React.FC = () => {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [subjectFilter, setSubjectFilter] = useState<string>('all');

    const subjects = [...new Set(mockNotes.map(n => n.subject))];

    const filteredNotes = mockNotes.filter(note => {
        const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            note.subject.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSubject = subjectFilter === 'all' || note.subject === subjectFilter;
        return matchesSearch && matchesSubject;
    });

    const getFileIcon = (type: string) => {
        switch (type) {
            case 'pdf': return 'bg-red-500/20 text-red-400';
            case 'video': return 'bg-purple-500/20 text-purple-400';
            case 'ppt': return 'bg-orange-500/20 text-orange-400';
            default: return 'bg-blue-500/20 text-blue-400';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">Study Materials</h2>
                    <p className="text-slate-400">{mockNotes.length} notes available</p>
                </div>
                <Button variant="primary" className="gap-2">
                    <Upload className="w-4 h-4" />
                    Upload Notes
                </Button>
            </div>

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
                        {subjects.map(subject => (
                            <option key={subject} value={subject}>{subject}</option>
                        ))}
                    </select>

                    {/* View Toggle */}
                    <div className="flex gap-1 p-1 rounded-lg bg-white/5">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}
                        >
                            <Grid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </Card>

            {/* Notes Grid/List */}
            <div className={viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                : 'space-y-3'
            }>
                {filteredNotes.map(note => {
                    const iconClasses = getFileIcon(note.type);

                    if (viewMode === 'grid') {
                        return (
                            <Card key={note.id} className="hover:border-cyan-500/30 transition-colors group">
                                <div className="flex items-start justify-between mb-3">
                                    <div className={`p-3 rounded-xl ${iconClasses}`}>
                                        {note.type === 'video' ? <BookOpen className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                                    </div>
                                    <Badge variant={note.status === 'approved' ? 'success' : 'warning'} size="sm">
                                        {note.status}
                                    </Badge>
                                </div>

                                <h3 className="font-semibold text-white mb-1 group-hover:text-cyan-400 transition-colors">
                                    {note.title}
                                </h3>
                                <p className="text-sm text-slate-400 mb-3">{note.subject} • {note.code}</p>

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
                                    <Button size="sm" variant="outline" className="gap-1">
                                        <Download className="w-3 h-3" />
                                        Download
                                    </Button>
                                </div>
                            </Card>
                        );
                    }

                    return (
                        <Card key={note.id} className="p-4 hover:border-cyan-500/30 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl ${iconClasses} flex-shrink-0`}>
                                    {note.type === 'video' ? <BookOpen className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-white truncate">{note.title}</h3>
                                        <Badge variant={note.status === 'approved' ? 'success' : 'warning'} size="sm">
                                            {note.status}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-slate-400">{note.subject} • {note.author}</p>
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
                                </div>

                                <Button size="sm" variant="outline" className="gap-1 flex-shrink-0">
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
                    <p className="text-slate-400">No notes found matching your search</p>
                </Card>
            )}
        </div>
    );
};

export default NotesPage;
