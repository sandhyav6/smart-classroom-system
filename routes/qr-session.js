// ============================================================
// routes/qr-session.js — QR ATTENDANCE SYSTEM
// ============================================================
// PRODUCTION-GRADE IMPLEMENTATION
//
// Faculty generates a 5-minute QR code session
// Students scan to mark attendance in MongoDB
//
// ❌ NO hardcoded data
// ❌ NO fake attendance  
// ✅ EVERYTHING validated and persisted to MongoDB
// ============================================================

const express    = require('express');
const router     = express.Router();
const crypto     = require('crypto');
const QRCode     = require('qrcode');
const Attendance = require('../models/Attendance');
const Student    = require('../models/Student');
const Faculty    = require('../models/Faculty');

// ============================================================
// IN-MEMORY SESSION STORE
// ============================================================

const activeSessions = new Map();
const TOKEN_TTL_MS = 5 * 60 * 1000; // 5 minutes

// Auto-cleanup every minute
setInterval(() => {
    const now = Date.now();
    let cleaned = 0;
    for (const [token, sess] of activeSessions) {
        if (sess.expiresAt <= now) {
            activeSessions.delete(token);
            cleaned++;
        }
    }
    if (cleaned > 0) {
        console.log(`🧹 QR Session Cleanup: Removed ${cleaned} expired sessions`);
    }
}, 60 * 1000);

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function generateToken() {
    return crypto.randomBytes(24).toString('hex');
}

function isExpired(sess) {
    return Date.now() > sess.expiresAt;
}

// ============================================================
// API ENDPOINTS
// ============================================================

// GET /api/qr/config
// Returns server configuration for QR code URLs
router.get('/config', (req, res) => {
    const siteUrl = (process.env.SITE_URL || '').trim();
    const configUrl = siteUrl || `${req.protocol}://${req.get('host')}`;
    
    res.json({
        siteUrl: configUrl,
        version: '1.0.0'
    });
});

// GET /api/qr/image?data=ENCODED_URL
// Generates QR code server-side and returns base64 PNG
router.get('/image', async (req, res) => {
    const { data } = req.query;
    
    if (!data) {
        return res.status(400).json({
            error: 'Missing "data" query parameter'
        });
    }
    
    try {
        const decodedData = decodeURIComponent(data);
        
        console.log(`🖼️  QR Image: Generating QR code...`);
        
        const dataUrl = await QRCode.toDataURL(decodedData, {
            width: 300,
            margin: 2,
            color: {
                dark: '#264508',
                light: '#ffffff'
            },
            errorCorrectionLevel: 'H'
        });
        
        res.json({ dataUrl });
    } catch (err) {
        console.error('❌ QR Image Error:', err.message);
        res.status(500).json({
            error: 'Failed to generate QR code: ' + err.message
        });
    }
});

// POST /api/qr/generate
// Faculty generates a new QR session
router.post('/generate', async (req, res) => {
    const { facultyId, subject, subjectCode, section, semester } = req.body;
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔑 QR GENERATION REQUEST');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   Faculty ID: ${facultyId}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   Section: ${section}`);
    console.log(`   Semester: ${semester}`);
    
    // Validate inputs
    if (!facultyId || !subject || !section || !semester) {
        console.log('   ❌ Missing required fields');
        return res.status(400).json({
            error: 'Required: facultyId, subject, section, semester'
        });
    }
    
    try {
        // Verify faculty exists in MongoDB
        const faculty = await Faculty.findOne({ id: facultyId }).lean();
        if (!faculty) {
            console.log(`   ❌ Faculty ${facultyId} not found in database`);
            return res.status(404).json({
                error: 'Faculty not found. Check your ID.'
            });
        }
        
        console.log(`   ✓ Faculty verified: ${faculty.name}`);
        
        // Revoke previous session for this faculty
        let revoked = 0;
        for (const [token, sess] of activeSessions) {
            if (sess.facultyId === facultyId) {
                activeSessions.delete(token);
                revoked++;
            }
        }
        if (revoked > 0) {
            console.log(`   🔄 Revoked ${revoked} previous session(s)`);
        }
        
        // Generate new session
        const token = generateToken();
        const now = Date.now();
        const expiresAt = now + TOKEN_TTL_MS;
        
        activeSessions.set(token, {
            facultyId,
            subject,
            subjectCode: subjectCode || '',
            section,
            semester,
            expiresAt,
            markedStudents: [],
            createdAt: now
        });
        
        console.log(`   ✅ Session created`);
        console.log(`   Token: ${token.substring(0, 20)}...`);
        console.log(`   Expires: ${new Date(expiresAt).toLocaleTimeString()}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        
        res.json({
            success: true,
            token,
            expiresAt,
            expiresIn: TOKEN_TTL_MS
        });
        
    } catch (err) {
        console.error('   ❌ Error:', err.message);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        res.status(500).json({
            error: 'Server error: ' + err.message
        });
    }
});

// POST /api/qr/scan
// Student scans QR to mark attendance
router.post('/scan', async (req, res) => {
    const { token, studentId } = req.body;
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📱 QR SCAN REQUEST');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   Token: ${token ? token.substring(0, 20) + '...' : 'MISSING'}`);
    console.log(`   Student ID: ${studentId}`);
    
    // Validate inputs
    if (!token || !studentId) {
        console.log('   ❌ Missing required fields');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        return res.status(400).json({
            error: 'Required: token, studentId'
        });
    }
    
    try {
        // STEP 1: Check token exists
        const sess = activeSessions.get(token);
        if (!sess) {
            console.log('   ❌ Token not found or expired');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
            return res.status(404).json({
                error: 'Invalid or expired QR code. Faculty, please generate a new one.'
            });
        }
        
        console.log(`   ✓ Token found (expires in ${Math.round((sess.expiresAt - Date.now()) / 1000)}s)`);
        
        // STEP 2: Check expiry
        if (isExpired(sess)) {
            console.log('   ❌ Token expired');
            activeSessions.delete(token);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
            return res.status(410).json({
                error: 'QR code has expired. Faculty, please generate a new one.'
            });
        }
        
        console.log(`   ✓ Token valid`);
        
        // STEP 3: Fetch student from MongoDB
        const student = await Student.findOne({ id: studentId }).lean();
        if (!student) {
            console.log(`   ❌ Student ${studentId} not found in database`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
            return res.status(404).json({
                error: `Student ${studentId} not found in database`
            });
        }
        
        console.log(`   ✓ Student found: ${student.name}`);
        
        // STEP 4: Check section
        const studentSection = (student.section || '').toUpperCase();
        const sessionSection = (sess.section || '').toUpperCase();
        
        if (studentSection !== sessionSection) {
            console.log(`   ❌ Section mismatch: student=${studentSection}, QR=${sessionSection}`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
            return res.status(403).json({
                error: `This QR is for Section ${sess.section}. You are in Section ${student.section}.`
            });
        }
        
        console.log(`   ✓ Section match: ${studentSection}`);
        
        // STEP 5: Check semester
        const studentSemester = `Semester ${student.semester}`;
        const sessionSemester = sess.semester;
        
        if (studentSemester !== sessionSemester) {
            console.log(`   ❌ Semester mismatch: student=${studentSemester}, QR=${sessionSemester}`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
            return res.status(403).json({
                error: `This QR is for ${sess.semester}. You are in ${studentSemester}.`
            });
        }
        
        console.log(`   ✓ Semester match: ${studentSemester}`);
        
        // STEP 6: Check duplicate marking
        if (sess.markedStudents.includes(studentId)) {
            console.log('   ⚠️  Already marked attendance (duplicate attempt)');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
            return res.status(409).json({
                error: 'You have already marked attendance for this class today.',
                alreadyMarked: true
            });
        }
        
        console.log('   ✓ First-time marking (not duplicate)');
        
        // STEP 7: Get today's date
        const today = new Date().toISOString().split('T')[0];
        console.log(`   📅 Date: ${today}`);
        
        // STEP 8: Find attendance record in MongoDB
        const record = await Attendance.findOne({
            studentId,
            semester: studentSemester,
            subject: sess.subject
        });
        
        if (!record) {
            console.log(`   ❌ Attendance record not found for ${sess.subject}`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
            return res.status(404).json({
                error: `Attendance record not found for "${sess.subject}". Contact admin.`
            });
        }
        
        console.log(`   ✓ Attendance record found`);
        console.log(`     Previously: ${record.attendedDates.length} attended, ${record.missedDates.length} missed`);
        
        // STEP 9: Add to attended dates
        if (!record.attendedDates.includes(today)) {
            record.attendedDates.push(today);
            console.log(`     ➕ Added ${today} to attended dates`);
        }
        
        // STEP 10: Remove from missed dates
        record.missedDates = record.missedDates.filter(d => d !== today);
        
        // STEP 11: Save to MongoDB
        const saved = await record.save();
        console.log(`   ✓ Saved to MongoDB`);
        console.log(`     After: ${saved.attendedDates.length} attended, ${saved.missedDates.length} missed`);
        
        // STEP 12: Record in session
        sess.markedStudents.push(studentId);
        console.log(`   👥 Session total marked: ${sess.markedStudents.length}`);
        
        console.log('   ✅ ATTENDANCE MARKED SUCCESSFULLY');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        
        res.json({
            success: true,
            subject: sess.subject,
            date: today,
            semester: sessionSemester,
            studentName: student.name
        });
        
    } catch (err) {
        console.error('   ❌ Error:', err.message);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        res.status(500).json({
            error: 'Server error: ' + err.message
        });
    }
});

// GET /api/qr/active?facultyId=X
// Get active QR session for a faculty member
router.get('/active', (req, res) => {
    const { facultyId } = req.query;
    
    if (!facultyId) {
        return res.json(null);
    }
    
    // Find active session
    for (const [token, sess] of activeSessions) {
        if (sess.facultyId === facultyId && !isExpired(sess)) {
            const remaining = sess.expiresAt - Date.now();
            return res.json({
                token,
                facultyId: sess.facultyId,
                subject: sess.subject,
                subjectCode: sess.subjectCode,
                section: sess.section,
                semester: sess.semester,
                expiresAt: sess.expiresAt,
                expiresIn: remaining,
                markedStudents: sess.markedStudents,
                markedCount: sess.markedStudents.length
            });
        }
    }
    
    // No active session
    res.json(null);
});

// ============================================================
// END OF FILE
// ============================================================

module.exports = router;
