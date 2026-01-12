import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { GraduationCap, Search, Plus, Eye, Edit, Mail, Phone } from 'lucide-react';

// =============================================================================
// MOCK DATA
// =============================================================================

const mockTeachers = [
    { id: '1', name: 'Dr. Smith', empId: 'EMP1001', email: 'smith@kec.edu', phone: '+91 9876543210', department: 'CSE', designation: 'Professor', subjects: ['Data Structures', 'Algorithms'], experience: 15, publications: 25 },
    { id: '2', name: 'Prof. Johnson', empId: 'EMP1002', email: 'johnson@kec.edu', phone: '+91 9876543211', department: 'CSE', designation: 'Associate Professor', subjects: ['DBMS', 'Data Mining'], experience: 12, publications: 18 },
    { id: '3', name: 'Dr. Williams', empId: 'EMP1003', email: 'williams@kec.edu', phone: '+91 9876543212', department: 'CSE', designation: 'Assistant Professor', subjects: ['Operating Systems'], experience: 8, publications: 10 },
    { id: '4', name: 'Prof. Davis', empId: 'EMP1004', email: 'davis@kec.edu', phone: '+91 9876543213', department: 'CSE', designation: 'Professor', subjects: ['Discrete Math', 'Graph Theory'], experience: 20, publications: 35 },
    { id: '5', name: 'Dr. Brown', empId: 'EMP1005', email: 'brown@kec.edu', phone: '+91 9876543214', department: 'CSE', designation: 'Associate Professor', subjects: ['Computer Networks', 'Security'], experience: 10, publications: 12 },
];

// =============================================================================
// TEACHERS PAGE
// =============================================================================

const TeachersPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredTeachers = mockTeachers.filter(teacher =>
        teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        teacher.empId.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getDesignationColor = (designation: string) => {
        switch (designation) {
            case 'Professor': return 'bg-purple-500/20 text-purple-400';
            case 'Associate Professor': return 'bg-blue-500/20 text-blue-400';
            case 'Assistant Professor': return 'bg-green-500/20 text-green-400';
            default: return 'bg-slate-500/20 text-slate-400';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">Faculty</h2>
                    <p className="text-slate-400">{mockTeachers.length} teachers in your department</p>
                </div>
                <Button variant="primary" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Teacher
                </Button>
            </div>

            {/* Search */}
            <Card className="p-4">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search by name or employee ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    />
                </div>
            </Card>

            {/* Teachers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTeachers.map(teacher => (
                    <Card key={teacher.id} className="hover:border-cyan-500/30 transition-colors">
                        <div className="flex items-start gap-4 mb-4">
                            <Avatar alt={teacher.name} size="lg" />
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-white">{teacher.name}</h3>
                                <p className="text-sm text-slate-400">{teacher.empId}</p>
                                <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${getDesignationColor(teacher.designation)}`}>
                                    {teacher.designation}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-2 mb-4">
                            <div className="flex items-center gap-2 text-sm text-slate-400">
                                <Mail className="w-4 h-4" />
                                <span className="truncate">{teacher.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-400">
                                <Phone className="w-4 h-4" />
                                <span>{teacher.phone}</span>
                            </div>
                        </div>

                        <div className="mb-4">
                            <p className="text-xs text-slate-500 mb-2">Subjects</p>
                            <div className="flex flex-wrap gap-1">
                                {teacher.subjects.map((subject, index) => (
                                    <Badge key={index} variant="secondary" size="sm">{subject}</Badge>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 p-3 rounded-lg bg-white/5 mb-4">
                            <div className="text-center">
                                <p className="text-lg font-bold text-cyan-400">{teacher.experience}</p>
                                <p className="text-xs text-slate-400">Years Exp</p>
                            </div>
                            <div className="text-center">
                                <p className="text-lg font-bold text-purple-400">{teacher.publications}</p>
                                <p className="text-xs text-slate-400">Publications</p>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="flex-1 gap-1">
                                <Eye className="w-3 h-3" />
                                View
                            </Button>
                            <Button variant="outline" size="sm" className="flex-1 gap-1">
                                <Edit className="w-3 h-3" />
                                Edit
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>

            {filteredTeachers.length === 0 && (
                <Card className="text-center py-12">
                    <GraduationCap className="w-16 h-16 mx-auto text-slate-600 mb-4" />
                    <p className="text-slate-400">No teachers found</p>
                </Card>
            )}
        </div>
    );
};

export default TeachersPage;
