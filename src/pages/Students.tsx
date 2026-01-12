import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Users, Search, Eye, Edit, Plus } from 'lucide-react';

// =============================================================================
// MOCK DATA
// =============================================================================

const mockStudents = [
    { id: '1', name: 'John Doe', rollNumber: '21BCE1234', email: 'john@kec.edu', phone: '+91 9876543210', department: 'CSE', section: 'A', semester: 6, cgpa: 8.5, attendance: 85, status: 'active' },
    { id: '2', name: 'Jane Smith', rollNumber: '21BCE1235', email: 'jane@kec.edu', phone: '+91 9876543211', department: 'CSE', section: 'A', semester: 6, cgpa: 8.8, attendance: 92, status: 'active' },
    { id: '3', name: 'Bob Johnson', rollNumber: '21BCE1236', email: 'bob@kec.edu', phone: '+91 9876543212', department: 'CSE', section: 'A', semester: 6, cgpa: 7.2, attendance: 68, status: 'at-risk' },
    { id: '4', name: 'Alice Williams', rollNumber: '21BCE1237', email: 'alice@kec.edu', phone: '+91 9876543213', department: 'CSE', section: 'B', semester: 6, cgpa: 9.1, attendance: 95, status: 'active' },
    { id: '5', name: 'Charlie Brown', rollNumber: '21BCE1238', email: 'charlie@kec.edu', phone: '+91 9876543214', department: 'CSE', section: 'B', semester: 6, cgpa: 6.8, attendance: 62, status: 'at-risk' },
];

// =============================================================================
// STUDENTS PAGE
// =============================================================================

const StudentsPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [sectionFilter, setSectionFilter] = useState<string>('all');

    const filteredStudents = mockStudents.filter(student => {
        const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.rollNumber.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSection = sectionFilter === 'all' || student.section === sectionFilter;
        return matchesSearch && matchesSection;
    });

    const getAttendanceColor = (attendance: number) => {
        if (attendance >= 75) return 'text-green-400';
        if (attendance >= 65) return 'text-yellow-400';
        return 'text-red-400';
    };

    const getCgpaColor = (cgpa: number) => {
        if (cgpa >= 8) return 'text-green-400';
        if (cgpa >= 7) return 'text-blue-400';
        if (cgpa >= 6) return 'text-yellow-400';
        return 'text-red-400';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">Students</h2>
                    <p className="text-slate-400">{mockStudents.length} students in your sections</p>
                </div>
                <Button variant="primary" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Student
                </Button>
            </div>

            {/* Filters */}
            <Card className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search by name or roll number..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                        />
                    </div>
                    <select
                        value={sectionFilter}
                        onChange={(e) => setSectionFilter(e.target.value)}
                        className="px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    >
                        <option value="all">All Sections</option>
                        <option value="A">Section A</option>
                        <option value="B">Section B</option>
                    </select>
                </div>
            </Card>

            {/* Students Table */}
            <Card className="overflow-hidden p-0">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/5">
                                <th className="text-left p-4 text-slate-400 font-medium">Student</th>
                                <th className="text-left p-4 text-slate-400 font-medium">Roll Number</th>
                                <th className="text-left p-4 text-slate-400 font-medium">Section</th>
                                <th className="text-center p-4 text-slate-400 font-medium">CGPA</th>
                                <th className="text-center p-4 text-slate-400 font-medium">Attendance</th>
                                <th className="text-center p-4 text-slate-400 font-medium">Status</th>
                                <th className="text-right p-4 text-slate-400 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.map(student => (
                                <tr key={student.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <Avatar alt={student.name} size="sm" />
                                            <div>
                                                <p className="font-medium text-white">{student.name}</p>
                                                <p className="text-sm text-slate-400">{student.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-slate-300">{student.rollNumber}</td>
                                    <td className="p-4">
                                        <Badge variant="secondary" size="sm">Section {student.section}</Badge>
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className={`font-semibold ${getCgpaColor(student.cgpa)}`}>
                                            {student.cgpa}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className={`font-semibold ${getAttendanceColor(student.attendance)}`}>
                                            {student.attendance}%
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <Badge
                                            variant={student.status === 'active' ? 'success' : 'error'}
                                            size="sm"
                                            className="capitalize"
                                        >
                                            {student.status}
                                        </Badge>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button variant="ghost" size="sm" className="p-2">
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm" className="p-2">
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {filteredStudents.length === 0 && (
                <Card className="text-center py-12">
                    <Users className="w-16 h-16 mx-auto text-slate-600 mb-4" />
                    <p className="text-slate-400">No students found</p>
                </Card>
            )}
        </div>
    );
};

export default StudentsPage;
