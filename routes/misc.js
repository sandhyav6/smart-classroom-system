// ============================================================
// routes/misc.js — Timetable, reminders, chat
// (Materials moved to routes/materials.js)
// ============================================================
const express = require('express');
const router = express.Router();
const ChatMessage = require('../models/ChatMessage');
const Reminder = require('../models/Reminder');

// ============================================================
// TIMETABLE — full 8 semesters × sections A / B / C
// Key: "Semester N|SECTION"  e.g. "Semester 3|A"
// schedule[timeSlot][day] = { code, name, faculty, location }
// ============================================================

// Helper: build a schedule row
function cls(code, name, faculty, room) { return { code, name, faculty, location: room }; }

const TIMETABLE = {};

// ── Semester 1 ────────────────────────────────────────────────
const S1 = {
    A: {
        '09:00 - 09:50': { Mon: cls('CSE101','Programming in C','Dr. Meera Nair','AB1-101'), Tue: null, Wed: cls('CSE101','Programming in C','Dr. Meera Nair','AB1-101'), Thu: null, Fri: cls('CSE101','Programming in C','Dr. Meera Nair','AB1-101') },
        '10:00 - 10:50': { Mon: cls('MAT101','Engineering Calculus','Dr. K. Sudhakar','AB2-201'), Tue: cls('MAT101','Engineering Calculus','Dr. K. Sudhakar','AB2-201'), Wed: null, Thu: cls('MAT101','Engineering Calculus','Dr. K. Sudhakar','AB2-201'), Fri: null },
        '11:00 - 11:50': { Mon: cls('PHY101','Engineering Physics','Dr. S. Ramesh','TB-301'), Tue: null, Wed: cls('PHY101','Engineering Physics','Dr. S. Ramesh','TB-301'), Thu: cls('PHY101','Engineering Physics','Dr. S. Ramesh','TB-301'), Fri: null },
        '13:00 - 13:50': { Mon: null, Tue: cls('CSE101L','C Programming Lab','Dr. Meera Nair','Lab-101'), Wed: null, Thu: cls('PHY101L','Physics Lab','Dr. S. Ramesh','Lab-201'), Fri: null },
        '14:00 - 14:50': { Mon: cls('ENG101','Technical English','Prof. A. Lakshmi','MB-101'), Tue: null, Wed: cls('ENG101','Technical English','Prof. A. Lakshmi','MB-101'), Thu: null, Fri: cls('ENG101','Technical English','Prof. A. Lakshmi','MB-101') }
    },
    B: {
        '09:00 - 09:50': { Mon: cls('MAT101','Engineering Calculus','Dr. P. Krishnan','AB2-202'), Tue: cls('MAT101','Engineering Calculus','Dr. P. Krishnan','AB2-202'), Wed: null, Thu: cls('MAT101','Engineering Calculus','Dr. P. Krishnan','AB2-202'), Fri: null },
        '10:00 - 10:50': { Mon: cls('CSE101','Programming in C','Dr. T. Vijay','AB1-102'), Tue: null, Wed: cls('CSE101','Programming in C','Dr. T. Vijay','AB1-102'), Thu: null, Fri: cls('CSE101','Programming in C','Dr. T. Vijay','AB1-102') },
        '11:00 - 11:50': { Mon: cls('ENG101','Technical English','Prof. R. Devi','MB-102'), Tue: null, Wed: cls('ENG101','Technical English','Prof. R. Devi','MB-102'), Thu: null, Fri: cls('ENG101','Technical English','Prof. R. Devi','MB-102') },
        '13:00 - 13:50': { Mon: null, Tue: cls('PHY101L','Physics Lab','Dr. V. Anand','Lab-202'), Wed: null, Thu: cls('CSE101L','C Programming Lab','Dr. T. Vijay','Lab-102'), Fri: null },
        '14:00 - 14:50': { Mon: cls('PHY101','Engineering Physics','Dr. V. Anand','TB-302'), Tue: null, Wed: cls('PHY101','Engineering Physics','Dr. V. Anand','TB-302'), Thu: cls('PHY101','Engineering Physics','Dr. V. Anand','TB-302'), Fri: null }
    },
    C: {
        '09:00 - 09:50': { Mon: cls('PHY101','Engineering Physics','Dr. M. Kumar','TB-303'), Tue: null, Wed: cls('PHY101','Engineering Physics','Dr. M. Kumar','TB-303'), Thu: cls('PHY101','Engineering Physics','Dr. M. Kumar','TB-303'), Fri: null },
        '10:00 - 10:50': { Mon: cls('ENG101','Technical English','Prof. S. Iyer','MB-103'), Tue: null, Wed: cls('ENG101','Technical English','Prof. S. Iyer','MB-103'), Thu: null, Fri: cls('ENG101','Technical English','Prof. S. Iyer','MB-103') },
        '11:00 - 11:50': { Mon: cls('MAT101','Engineering Calculus','Dr. L. Sharma','AB2-203'), Tue: cls('MAT101','Engineering Calculus','Dr. L. Sharma','AB2-203'), Wed: null, Thu: cls('MAT101','Engineering Calculus','Dr. L. Sharma','AB2-203'), Fri: null },
        '13:00 - 13:50': { Mon: null, Tue: cls('PHY101L','Physics Lab','Dr. M. Kumar','Lab-203'), Wed: null, Thu: cls('CSE101L','C Programming Lab','Dr. N. Raj','Lab-103'), Fri: null },
        '14:00 - 14:50': { Mon: cls('CSE101','Programming in C','Dr. N. Raj','AB1-103'), Tue: null, Wed: cls('CSE101','Programming in C','Dr. N. Raj','AB1-103'), Thu: null, Fri: cls('CSE101','Programming in C','Dr. N. Raj','AB1-103') }
    }
};
TIMETABLE['Semester 1|A'] = { section: 'A', schedule: S1.A };
TIMETABLE['Semester 1|B'] = { section: 'B', schedule: S1.B };
TIMETABLE['Semester 1|C'] = { section: 'C', schedule: S1.C };

// ── Semester 2 ────────────────────────────────────────────────
const S2 = {
    A: {
        '09:00 - 09:50': { Mon: cls('CSE201','Data Structures','Dr. Anjali Menon','AB1-201'), Tue: null, Wed: cls('CSE201','Data Structures','Dr. Anjali Menon','AB1-201'), Thu: null, Fri: cls('CSE201','Data Structures','Dr. Anjali Menon','AB1-201') },
        '10:00 - 10:50': { Mon: cls('MAT201','Linear Algebra & ODE','Dr. Deepak Rao','AB2-202'), Tue: cls('MAT201','Linear Algebra & ODE','Dr. Deepak Rao','AB2-202'), Wed: null, Thu: cls('MAT201','Linear Algebra & ODE','Dr. Deepak Rao','AB2-202'), Fri: null },
        '11:00 - 11:50': { Mon: null, Tue: cls('CSE202','Digital Logic Design','Dr. Suresh Babu','TB-401'), Wed: cls('CSE202','Digital Logic Design','Dr. Suresh Babu','TB-401'), Thu: null, Fri: cls('CSE202','Digital Logic Design','Dr. Suresh Babu','TB-401') },
        '13:00 - 13:50': { Mon: null, Tue: cls('CSE201L','DS Lab','Dr. Anjali Menon','Lab-201'), Wed: null, Thu: cls('CSE202L','Digital Logic Lab','Dr. Suresh Babu','Lab-301'), Fri: null },
        '14:00 - 14:50': { Mon: cls('HUM201','Professional Ethics','Prof. Kavitha Nair','MB-201'), Tue: null, Wed: null, Thu: cls('HUM201','Professional Ethics','Prof. Kavitha Nair','MB-201'), Fri: null }
    },
    B: {
        '09:00 - 09:50': { Mon: cls('MAT201','Linear Algebra & ODE','Dr. R. Pillai','AB2-203'), Tue: cls('MAT201','Linear Algebra & ODE','Dr. R. Pillai','AB2-203'), Wed: null, Thu: cls('MAT201','Linear Algebra & ODE','Dr. R. Pillai','AB2-203'), Fri: null },
        '10:00 - 10:50': { Mon: cls('CSE201','Data Structures','Dr. P. Balaji','AB1-202'), Tue: null, Wed: cls('CSE201','Data Structures','Dr. P. Balaji','AB1-202'), Thu: null, Fri: cls('CSE201','Data Structures','Dr. P. Balaji','AB1-202') },
        '11:00 - 11:50': { Mon: cls('HUM201','Professional Ethics','Prof. S. Chandran','MB-202'), Tue: null, Wed: null, Thu: cls('HUM201','Professional Ethics','Prof. S. Chandran','MB-202'), Fri: null },
        '13:00 - 13:50': { Mon: null, Tue: cls('CSE202L','Digital Logic Lab','Dr. G. Nair','Lab-302'), Wed: null, Thu: cls('CSE201L','DS Lab','Dr. P. Balaji','Lab-202'), Fri: null },
        '14:00 - 14:50': { Mon: null, Tue: cls('CSE202','Digital Logic Design','Dr. G. Nair','TB-402'), Wed: cls('CSE202','Digital Logic Design','Dr. G. Nair','TB-402'), Thu: null, Fri: cls('CSE202','Digital Logic Design','Dr. G. Nair','TB-402') }
    },
    C: {
        '09:00 - 09:50': { Mon: cls('CSE202','Digital Logic Design','Dr. H. Menon','TB-403'), Tue: cls('CSE202','Digital Logic Design','Dr. H. Menon','TB-403'), Wed: cls('CSE202','Digital Logic Design','Dr. H. Menon','TB-403'), Thu: null, Fri: null },
        '10:00 - 10:50': { Mon: cls('CSE201','Data Structures','Dr. S. Priya','AB1-203'), Tue: null, Wed: cls('CSE201','Data Structures','Dr. S. Priya','AB1-203'), Thu: null, Fri: cls('CSE201','Data Structures','Dr. S. Priya','AB1-203') },
        '11:00 - 11:50': { Mon: cls('MAT201','Linear Algebra & ODE','Dr. M. Venkat','AB2-204'), Tue: cls('MAT201','Linear Algebra & ODE','Dr. M. Venkat','AB2-204'), Wed: null, Thu: cls('MAT201','Linear Algebra & ODE','Dr. M. Venkat','AB2-204'), Fri: null },
        '13:00 - 13:50': { Mon: null, Tue: null, Wed: cls('CSE201L','DS Lab','Dr. S. Priya','Lab-203'), Thu: null, Fri: cls('CSE202L','Digital Logic Lab','Dr. H. Menon','Lab-303') },
        '14:00 - 14:50': { Mon: cls('HUM201','Professional Ethics','Prof. T. Raj','MB-203'), Tue: null, Wed: null, Thu: cls('HUM201','Professional Ethics','Prof. T. Raj','MB-203'), Fri: null }
    }
};
TIMETABLE['Semester 2|A'] = { section: 'A', schedule: S2.A };
TIMETABLE['Semester 2|B'] = { section: 'B', schedule: S2.B };
TIMETABLE['Semester 2|C'] = { section: 'C', schedule: S2.C };

// ── Semester 3 ────────────────────────────────────────────────
const S3_base = {
    '09:00 - 09:50': { subjects: [{A:'COA301',B:'DSA301',C:'COA301'}, 'Computer Architecture', {A:'Dr. Kiran Bhat', B:'Dr. Arjun Nair', C:'Dr. Vikram Rao'}, {A:'AB1-301',B:'AB1-302',C:'AB1-303'}] },
    '10:00 - 10:50': { subjects: [{A:'DSA301',B:'COA301',C:'DSA301'}, 'Design & Analysis of Algorithms', {A:'Dr. Suresh Pandit',B:'Dr. Kiran Bhat',C:'Dr. Meena Singh'}, {A:'AB2-301',B:'AB2-302',C:'AB2-303'}] },
    '11:00 - 11:50': { subjects: [{A:'DB301',B:'DB301',C:'DB301'}, 'Database Systems', {A:'Dr. Priya Pillai',B:'Dr. Rajesh Kumar',C:'Dr. Sunita Rao'}, {A:'TB-501',B:'TB-502',C:'TB-503'}] },
    '13:00 - 13:50': { subjects: [{A:'DSA301L',B:'DSA301L',C:'DSA301L'}, 'Algorithms Lab', {A:'Dr. Suresh Pandit',B:'Dr. Arjun Nair',C:'Dr. Meena Singh'}, {A:'Lab-401',B:'Lab-402',C:'Lab-403'}] },
    '14:00 - 14:50': { subjects: [{A:'PS301',B:'PS301',C:'PS301'}, 'Probability & Statistics', {A:'Dr. Anil Verma',B:'Dr. Rekha Das',C:'Dr. Sunil Bose'}, {A:'AB2-305',B:'AB2-306',C:'AB2-307'}] }
};
// Build S3 programmatically
for (const section of ['A','B','C']) {
    const sched = {};
    for (const [time, row] of Object.entries(S3_base)) {
        const [codes, name, facMap, roomMap] = row.subjects;
        const days = Object.keys(codes)[0] === 'A' ? null : null;
        // Mon/Wed/Fri for lecture, Tue+Thu for alternating
        const dayPattern = (time.includes('13:')) 
            ? { Mon: null, Tue: cls(codes[section], name, facMap[section], roomMap[section]), Wed: null, Thu: cls(codes[section], name, facMap[section], roomMap[section]), Fri: null }
            : { Mon: cls(codes[section], name, facMap[section], roomMap[section]), Tue: null, Wed: cls(codes[section], name, facMap[section], roomMap[section]), Thu: null, Fri: cls(codes[section], name, facMap[section], roomMap[section]) };
        sched[time] = dayPattern;
    }
    TIMETABLE[`Semester 3|${section}`] = { section, schedule: sched };
}

// ── Semesters 4-8: repeat pattern with different subjects ─────
const HIGHER_SEM_SUBJECTS = {
    4: [
        ['CSE401', 'Operating Systems',        'Dr. Mahesh Nair'],
        ['CSE402', 'Computer Networks',        'Dr. Priya Shankar'],
        ['CSE403', 'Software Engineering',     'Dr. Ramesh Gupta'],
        ['MAT401', 'Numerical Methods',        'Dr. Neha Tiwari'],
    ],
    5: [
        ['CSE501', 'Compiler Design',          'Dr. Kavita Singh'],
        ['CSE502', 'Artificial Intelligence',  'Dr. Suresh Naidu'],
        ['CSE503', 'Computer Graphics',        'Dr. Anitha Rao'],
        ['CSE504', 'Information Security',     'Dr. Ravi Varma'],
    ],
    6: [
        ['CSE601', 'Machine Learning',         'Dr. Deepa Krishnan'],
        ['CSE602', 'Cloud Computing',          'Dr. Sanjay Desai'],
        ['CSE603', 'Mobile Computing',         'Dr. Anand Verma'],
        ['CSE604', 'Big Data Analytics',       'Dr. Laila Menon'],
    ],
    7: [
        ['CSE701', 'Deep Learning',            'Dr. Arun Nambiar'],
        ['CSE702', 'Distributed Systems',      'Dr. Preethi Rao'],
        ['CSE703', 'IoT Systems',              'Dr. Vivek Sharma'],
        ['CSE704', 'Project Management',       'Prof. Geetha Pillai'],
    ],
    8: [
        ['CSE801', 'Project Work',             'Dr. Faculty Guide'],
        ['CSE802', 'Internship/Seminar',       'Prof. Dept. Staff'],
    ]
};

const TIME_SLOTS  = ['09:00 - 09:50','10:00 - 10:50','11:00 - 11:50','13:00 - 13:50','14:00 - 14:50'];
const ROOMS_SEC   = { A: 'AB1', B: 'AB2', C: 'TB' };
const DAYS_CYCLE  = [
    { Mon: true, Tue: false, Wed: true, Thu: false, Fri: true },
    { Mon: true, Tue: true,  Wed: false, Thu: true,  Fri: false },
    { Mon: false, Tue: true, Wed: true, Thu: false,  Fri: true },
    { Mon: false, Tue: false, Wed: true, Thu: true,   Fri: false },
];

for (const sem of [4,5,6,7,8]) {
    const subjects = HIGHER_SEM_SUBJECTS[sem];
    for (const section of ['A','B','C']) {
        const sched = {};
        subjects.forEach((sub, idx) => {
            const [code, name, fac] = sub;
            const time    = TIME_SLOTS[idx % TIME_SLOTS.length];
            const room    = `${ROOMS_SEC[section]}-${sem}0${idx+1}`;
            const pattern = DAYS_CYCLE[idx % DAYS_CYCLE.length];
            if (!sched[time]) sched[time] = { Mon: null, Tue: null, Wed: null, Thu: null, Fri: null };
            for (const [day, on] of Object.entries(pattern)) {
                if (on) sched[time][day] = cls(code, name, fac, room);
            }
        });
        TIMETABLE[`Semester ${sem}|${section}`] = { section, schedule: sched };
    }
}

// ── Faculty schedule index: subjectName → [{section, semester, time, room}] ─
// Built lazily from TIMETABLE
function buildFacultyIndex() {
    const idx = {}; // key: faculty name, value: [{subject, section, semester, time, room}]
    for (const [key, tt] of Object.entries(TIMETABLE)) {
        const [semester, section] = key.split('|');
        for (const [time, daySlots] of Object.entries(tt.schedule)) {
            const seen = new Set();
            for (const slot of Object.values(daySlots)) {
                if (!slot) continue;
                const k = `${slot.faculty}|${slot.name}|${section}|${semester}`;
                if (seen.has(k)) continue;
                seen.add(k);
                if (!idx[slot.faculty]) idx[slot.faculty] = [];
                idx[slot.faculty].push({ subject: slot.name, code: slot.code, section, semester, time, room: slot.location });
            }
        }
    }
    return idx;
}
const FACULTY_INDEX = buildFacultyIndex();

// GET /api/timetable/:semester?section=A
router.get('/timetable/:semester', (req, res) => {
    const sem     = decodeURIComponent(req.params.semester);
    const section = (req.query.section || 'A').toUpperCase();
    const key     = `${sem}|${section}`;
    res.json(TIMETABLE[key] || null);
});

// GET /api/faculty-timetable?facultyId=X
// Returns classes enriched with day info from the hardcoded TIMETABLE
router.get('/faculty-timetable', async (req, res) => {
    const { facultyId } = req.query;
    let FacultyModel;
    try { FacultyModel = require('../models/Faculty'); } catch { return res.json([]); }
    try {
        const fac = await FacultyModel.findOne({ id: facultyId }).lean();
        if (!fac) return res.json([]);

        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
        const enriched = [];

        if (fac.classes && fac.classes.length > 0) {
            // For each seeded class, find it in the hardcoded TIMETABLE and record
            // which days it actually appears — return one record per (class × day)
            for (const cls of fac.classes) {
                const key = `${cls.semester}|${cls.section}`;
                const tt = TIMETABLE[key];
                if (!tt || !tt.schedule) continue;

                const daySlots = tt.schedule[cls.time];
                if (!daySlots) continue;

                for (const day of days) {
                    const slot = daySlots[day];
                    if (!slot) continue;
                    // Match by subject name (case-insensitive)
                    if (slot.name.toLowerCase() === cls.subject.toLowerCase()) {
                        enriched.push({
                            subject:  cls.subject,
                            code:     slot.code || '',
                            section:  cls.section,
                            semester: cls.semester,
                            time:     cls.time,
                            day,
                            room:     slot.location || cls.room,
                            name:     slot.name
                        });
                    }
                }
            }

            // If enrichment worked, return enriched list
            if (enriched.length > 0) return res.json(enriched);

            // If no match found in TIMETABLE, fall back to raw classes (no day info)
            return res.json(fac.classes);
        }

        // FALLBACK: name/subject matching via FACULTY_INDEX
        let classes = FACULTY_INDEX[fac.name] || [];
        if (classes.length === 0) {
            const lastName = fac.name.split(' ').pop().toLowerCase();
            for (const [ttName, ttClasses] of Object.entries(FACULTY_INDEX)) {
                if (ttName.toLowerCase().includes(lastName)) classes = [...classes, ...ttClasses];
            }
        }
        if (classes.length === 0 && fac.subjects && fac.subjects.length > 0) {
            for (const [, ttClasses] of Object.entries(FACULTY_INDEX)) {
                for (const ttCls of ttClasses) {
                    const subjectMatch = fac.subjects.some(s =>
                        ttCls.subject.toLowerCase().includes(s.toLowerCase().split(' ')[0])
                    );
                    if (subjectMatch) classes.push({ ...ttCls, faculty: fac.name });
                }
            }
            const seen = new Set();
            classes = classes.filter(c => {
                const k = `${c.subject}|${c.section}|${c.semester}`;
                if (seen.has(k)) return false; seen.add(k); return true;
            });
        }
        res.json(classes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



// ============================================================
// REMINDERS
// ============================================================
// GET /api/reminders?facultyId=xxx
router.get('/reminders', async (req, res) => {
    try {
        const { facultyId } = req.query;
        const query = facultyId ? { facultyId } : {};
        const reminders = await Reminder.find(query).sort({ date: 1 });
        res.json(reminders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/reminders
router.post('/reminders', async (req, res) => {
    try {
        const reminder = new Reminder(req.body);
        await reminder.save();
        res.status(201).json({ success: true, reminder });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/reminders/:id
router.delete('/reminders/:id', async (req, res) => {
    try {
        await Reminder.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ============================================================
// CHAT
// ============================================================
// GET /api/chat/:chatKey
router.get('/chat/:chatKey', async (req, res) => {
    try {
        const messages = await ChatMessage.find({ chatKey: req.params.chatKey }).sort({ timestamp: 1 });
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/chat/:chatKey
router.post('/chat/:chatKey', async (req, res) => {
    try {
        const message = new ChatMessage({
            chatKey: req.params.chatKey,
            from: req.body.from,
            text: req.body.text,
            timestamp: new Date()
        });
        await message.save();
        res.status(201).json({ success: true, message });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
