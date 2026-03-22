// ============================================================
// data.js — API Client for Smart Classroom System
// ALL data comes from REST API calls to Express/MongoDB backend
// NO localStorage usage — backend is single source of truth
// ============================================================

const API_BASE = '/api';

// Helper for fetch calls
async function api(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const config = {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        ...options
    };
    if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
        config.body = JSON.stringify(config.body);
    }
    // Remove Content-Type for FormData (browser sets boundary)
    if (options.body instanceof FormData) {
        delete config.headers['Content-Type'];
    }
    const res = await fetch(url, config);
    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || 'API error');
    }
    return res.json();
}

// ============================================================
// DataStore — API-backed data management class
// All methods maintain the SAME public interface as the original.
// Async methods return Promises. A ready() promise ensures
// initialization completes before page rendering.
// ============================================================
class DataStore {
    constructor() {
        this.cache = {
            students: [],
            faculty: [],
            assignments: [],
            attendance: {},
            marks: {},
            submissions: {},
            reminders: []
        };
        this.initialized = false;
        this._readyPromise = null;
    }

    // ---- Initialize: Load initial data from API into cache ----
    async init() {
        try {
            const [students, faculty, assignments] = await Promise.all([
                api('/students'),
                api('/faculty'),
                api('/assignments')
            ]);
            this.cache.students = students;
            this.cache.faculty = faculty;
            this.cache.assignments = assignments.map(a => ({
                ...a,
                id: a.assignmentId,
                completed: new Date(a.dueDate) < new Date()
            }));
            this.initialized = true;
            console.log(`✅ DataStore initialized: ${students.length} students, ${faculty.length} faculty, ${assignments.length} assignments`);
        } catch (err) {
            console.error('❌ DataStore init error:', err.message);
            this.initialized = true;
        }
    }

    // ---- Ready promise: resolves when init() completes ----
    ready() {
        if (this.initialized) return Promise.resolve();
        if (!this._readyPromise) {
            this._readyPromise = this.init();
        }
        return this._readyPromise;
    }

    // ============================================================
    // STUDENT CRUD (sync cache + async API)
    // ============================================================
    getStudents() { return this.cache.students; }

    getStudentById(id) {
        return this.cache.students.find(s => s.id === id);
    }

    getStudentByName(name) {
        const found = this.cache.students.find(s =>
            name.toLowerCase().includes(s.firstName?.toLowerCase()) ||
            s.name?.toLowerCase() === name.toLowerCase()
        );
        return found || this.cache.students[0];
    }

    async addStudent(student) {
        const result = await api('/students', { method: 'POST', body: student });
        this.cache.students.push(result.student);
    }

    async updateStudent(id, updates) {
        await api(`/students/${id}`, { method: 'PUT', body: updates });
        const idx = this.cache.students.findIndex(s => s.id === id);
        if (idx !== -1) this.cache.students[idx] = { ...this.cache.students[idx], ...updates };
    }

    async deleteStudent(id) {
        await api(`/students/${id}`, { method: 'DELETE' });
        this.cache.students = this.cache.students.filter(s => s.id !== id);
    }

    searchStudents(query) {
        const q = query.toLowerCase();
        return this.cache.students.filter(s =>
            s.name?.toLowerCase().includes(q) ||
            s.id?.toLowerCase().includes(q) ||
            s.department?.toLowerCase().includes(q)
        );
    }

    getStudentsBySection(section) {
        return this.cache.students.filter(s => {
            if (section === "CSE-2A") return s.section === "A" && s.department === "CSE";
            if (section === "CSE-2B") return s.section === "B" && s.department === "CSE";
            if (section === "CSE-3A") return s.section === "C" && s.department === "CSE";
            return false;
        });
    }

    // ============================================================
    // FACULTY CRUD
    // ============================================================
    getFaculty() { return this.cache.faculty; }

    getFacultyById(id) {
        return this.cache.faculty.find(f => f.id === id);
    }

    searchFaculty(query) {
        const q = query.toLowerCase();
        return this.cache.faculty.filter(f =>
            f.name?.toLowerCase().includes(q) ||
            f.id?.toLowerCase().includes(q) ||
            f.subjects?.some(s => s.toLowerCase().includes(q))
        );
    }

    // ============================================================
    // AUTHENTICATION (via API)
    // ============================================================
    async authenticateStudent(regNo, password) {
        try {
            const result = await api('/auth/student-login', {
                method: 'POST',
                body: { regNo, password }
            });
            return result.success ? result.user : null;
        } catch {
            return null;
        }
    }

    async authenticateFaculty(empId, password) {
        try {
            const result = await api('/auth/faculty-login', {
                method: 'POST',
                body: { empId, password }
            });
            return result.success ? result.user : null;
        } catch {
            return null;
        }
    }

    // ============================================================
    // ATTENDANCE
    // ============================================================
    async getAttendance(studentId, semester) {
        if (!studentId) return null;

        // Check cache first
        if (semester && this.cache.attendance[studentId]?.[semester]) {
            return this.cache.attendance[studentId][semester];
        }

        try {
            const semKey = semester || 'Semester 1';
            const data = await api(`/attendance/${studentId}/${encodeURIComponent(semKey)}`);

            // Cache it
            if (!this.cache.attendance[studentId]) this.cache.attendance[studentId] = {};
            this.cache.attendance[studentId][semKey] = data;

            if (semester) return data;
            return this.cache.attendance[studentId];
        } catch {
            return semester ? {} : null;
        }
    }

    async updateAttendance(studentId, semester, subjectName, date, present) {
        try {
            await api('/attendance/mark', {
                method: 'PUT',
                body: { studentId, semester, subject: subjectName, date, present }
            });
            // Invalidate cache
            if (this.cache.attendance[studentId]?.[semester]) {
                delete this.cache.attendance[studentId][semester];
            }
        } catch (err) {
            console.error('Attendance update error:', err);
        }
    }

    // ============================================================
    // MARKS
    // ============================================================
    async getMarks(studentId, semester) {
        if (!studentId) return [];

        // Check cache
        if (semester && this.cache.marks[studentId]?.[semester]) {
            return this.cache.marks[studentId][semester];
        }

        try {
            const semKey = semester || 'Semester 1';
            const data = await api(`/marks/${studentId}/${encodeURIComponent(semKey)}`);

            // Cache it
            if (!this.cache.marks[studentId]) this.cache.marks[studentId] = {};
            this.cache.marks[studentId][semKey] = data;

            if (semester) return data;
            return this.cache.marks[studentId];
        } catch {
            return [];
        }
    }

    async updateMarks(studentId, semester, subjectCode, field, value) {
        try {
            await api(`/marks/${studentId}/${encodeURIComponent(semester)}/${subjectCode}`, {
                method: 'PUT',
                body: { field, value }
            });
            // Invalidate cache
            if (this.cache.marks[studentId]?.[semester]) {
                delete this.cache.marks[studentId][semester];
            }
        } catch (err) {
            console.error('Marks update error:', err);
        }
    }

    // ============================================================
    // ASSIGNMENTS
    // ============================================================
    getAssignments() { return this.cache.assignments; }

    getAssignmentById(id) {
        return this.cache.assignments.find(a => a.id === id || a.assignmentId === id);
    }

    getAssignmentsByCourse(course) {
        if (!course || course === "All") return this.cache.assignments;
        return this.cache.assignments.filter(a => a.course === course);
    }

    async addAssignment(assignment) {
        try {
            const result = await api('/assignments', { method: 'POST', body: assignment });
            const newAssignment = { ...result.assignment, id: result.assignment.assignmentId };
            this.cache.assignments.push(newAssignment);
            return newAssignment;
        } catch (err) {
            console.error('Add assignment error:', err);
            return null;
        }
    }

    async updateAssignment(id, updates) {
        try {
            await api(`/assignments/${id}`, { method: 'PUT', body: updates });
            const idx = this.cache.assignments.findIndex(a => a.id === id || a.assignmentId === id);
            if (idx !== -1) this.cache.assignments[idx] = { ...this.cache.assignments[idx], ...updates };
        } catch (err) {
            console.error('Update assignment error:', err);
        }
    }

    async deleteAssignment(id) {
        try {
            await api(`/assignments/${id}`, { method: 'DELETE' });
            this.cache.assignments = this.cache.assignments.filter(a => a.id !== id && a.assignmentId !== id);
        } catch (err) {
            console.error('Delete assignment error:', err);
        }
    }

    // ============================================================
    // SUBMISSIONS
    // ============================================================
    async getSubmission(studentId, assignmentId) {
        // Check cache
        if (this.cache.submissions[studentId]?.[assignmentId]) {
            return this.cache.submissions[studentId][assignmentId];
        }
        try {
            const data = await api(`/submissions/${studentId}/${assignmentId}`);
            if (data) {
                if (!this.cache.submissions[studentId]) this.cache.submissions[studentId] = {};
                this.cache.submissions[studentId][assignmentId] = data;
            }
            return data;
        } catch {
            return null;
        }
    }

    async submitAssignment(studentId, assignmentId, fileName) {
        try {
            const result = await api('/submissions', {
                method: 'POST',
                body: { studentId, assignmentId, file: fileName }
            });
            if (!this.cache.submissions[studentId]) this.cache.submissions[studentId] = {};
            this.cache.submissions[studentId][assignmentId] = result.submission;
        } catch (err) {
            console.error('Submit assignment error:', err);
        }
    }

    // ============================================================
    // MATERIALS (API-backed)
    // ============================================================
    async getMaterials(sem, sub, mod) {
        try {
            let endpoint = `/materials/${encodeURIComponent(sem)}`;
            if (sub) endpoint += `/${encodeURIComponent(sub)}`;
            if (mod) endpoint += `/${encodeURIComponent(mod)}`;
            return await api(endpoint);
        } catch {
            return [];
        }
    }

    async uploadMaterial(formData) {
        try {
            const res = await fetch(`${API_BASE}/materials/upload`, {
                method: 'POST',
                credentials: 'include',
                body: formData
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({ error: res.statusText }));
                throw new Error(err.error || 'Upload failed');
            }
            return await res.json();
        } catch (err) {
            console.error('Upload error:', err);
            throw err;
        }
    }

    // ============================================================
    // TIMETABLE
    // ============================================================
    async getTimetable(semester) {
        try {
            return await api(`/timetable/${encodeURIComponent(semester)}`);
        } catch {
            return null;
        }
    }

    async getFacultyTimetable() {
        try {
            return await api('/faculty-timetable');
        } catch {
            return [];
        }
    }

    // ============================================================
    // REMINDERS
    // ============================================================
    async getReminders(facultyId) {
        try {
            const query = facultyId ? `?facultyId=${facultyId}` : '';
            const data = await api(`/reminders${query}`);
            this.cache.reminders = data;
            return data;
        } catch {
            return [];
        }
    }

    async addReminder(reminder) {
        try {
            const result = await api('/reminders', { method: 'POST', body: reminder });
            this.cache.reminders.push(result.reminder);
            return result.reminder;
        } catch (err) {
            console.error('Add reminder error:', err);
            return null;
        }
    }

    async deleteReminder(id) {
        try {
            await api(`/reminders/${id}`, { method: 'DELETE' });
            this.cache.reminders = this.cache.reminders.filter(r => r._id !== id && r.id !== id);
        } catch (err) {
            console.error('Delete reminder error:', err);
        }
    }

    // ============================================================
    // CHAT
    // ============================================================
    async getChatMessages(chatKey) {
        try {
            return await api(`/chat/${encodeURIComponent(chatKey)}`);
        } catch {
            return [];
        }
    }

    async addChatMessage(chatKey, message) {
        try {
            await api(`/chat/${encodeURIComponent(chatKey)}`, {
                method: 'POST',
                body: message
            });
        } catch (err) {
            console.error('Chat message error:', err);
        }
    }
}

// ---- Global instance ----
const dataStore = new DataStore();
dataStore.init();
