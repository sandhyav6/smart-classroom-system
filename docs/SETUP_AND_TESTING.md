
# Smart Classroom System - Complete Integration Guide

## Overview
This is a fully database-driven Smart Classroom Management System using MongoDB, Express, Node.js with Mongoose. All data comes from the database - NO hardcoded data, NO fake cached values, NO placeholder logic.

## Key Changes Made

### 1. Student Login Format (CRITICAL)
- **Format**: `24BCE1144`
- **Breakdown**: 2-digit year (24) + 3-letter dept code (BCE) + 4-digit roll number (0001-0055)
- **Example**: 24BCE0001, 24BCE0055
- **All seed data uses this exact format**

### 2. Faculty Login Format  
- **Format**: 5-digit employee ID
- **Example**: 10001, 10002, ... 10016
- **No changes to existing format**

### 3. Database Collections
All populated by seed.js and accessed via backend APIs:
- **Students** (55 records) - registration number format 24BCE1144
- **Faculty** (16 records) - employee IDs 10001-10016  
- **Timetable** (12 records) - semester × section combinations
- **Assignments** (25 records) - fully categorized by course
- **Attendance** (440+ records) - student × subject combination
- **Marks** (4,400+ records) - all 8 semesters for all students
- **Reminders** (5 records) - faculty-specific
- **ChatMessages** (0 initially, populated by usage)
- **Materials** (0 initially, upload-on-demand)

### 4. API Routes (Complete List)

#### Authentication
- `POST /api/auth/student-login` - Student login
- `POST /api/auth/faculty-login` - Faculty login
- `GET /api/auth/session` - Check session
- `POST /api/auth/logout` - Logout

#### Students
- `GET /api/students` - List all students
- `GET /api/students/:id` - Get student by registration number
- `GET /api/students/section/:section` - Get students by section
- `POST /api/students` - Create student (admin)
- `PUT /api/students/:id` - Update student (admin)
- `DELETE /api/students/:id` - Delete student (admin)

#### Faculty
- `GET /api/faculty` - List all faculty
- `GET /api/faculty/:id` - Get faculty by employee ID

#### Timetable
- `GET /api/timetable/:semester?section=A` - Get student timetable
- `GET /api/timetable/faculty/:facultyId` - Get faculty's assigned classes  
- `GET /api/timetable?facultyId=10001` - Get faculty schedule

#### Attendance
- `GET /api/attendance/:studentId/:semester` - Get student attendance
- `PUT /api/attendance/mark` - Mark attendance (manual)

#### Marks
- `GET /api/marks/:studentId/:semester` - Get student marks
- `PUT /api/marks/:studentId/:semester/:subjectCode` - Update marks (faculty)

#### Assignments
- `GET /api/assignments` - List all assignments
- `GET /api/assignments/:id` - Get assignment details
- `POST /api/assignments` - Create assignment (faculty)
- `PUT /api/assignments/:id` - Update assignment (faculty)
- `DELETE /api/assignments/:id` - Delete assignment (faculty)

#### Submissions  
- `GET /api/submissions/:studentId/:assignmentId` - Get submission status
- `POST /api/submissions` - Submit assignment (student)

#### Materials
- `POST /api/materials/upload` - Upload study material (faculty)
- `GET /api/materials/:semester/:subject?/:module?` - Get materials
- `GET /api/materials/download/:id` - Download file

#### Reminders
- `GET /api/reminders?facultyId=10001` - List faculty reminders
- `GET /api/reminders/:id` - Get reminder
- `POST /api/reminders` - Create reminder
- `PUT /api/reminders/:id` - Update reminder
- `DELETE /api/reminders/:id` - Delete reminder

#### Chat
- `GET /api/chat/:chatKey` - Get messages (polling)
- `POST /api/chat/:chatKey` - Send message
- `GET /api/chat/conversations/:userId` - List chat threads

#### QR Attendance
- `POST /api/qr/generate` - Faculty generates QR session
- `POST /api/qr/scan` - Student scans QR and marks attendance
- `GET /api/qr/config` - Get server config
- `GET /api/qr/image?data=...` - Generate QR code image
- `GET /api/qr/active?facultyId=...` - Check active session

### 5. Files Modified/Created

#### Backend Routes (NEW/MODIFIED)
- `routes/timetable.js` (NEW) - Timetable endpoints
- `routes/reminders.js` (NEW) - Reminder management
- `routes/auth.js` (MODIFIED) - Fixed student ID format validation
- `routes/qr-session.js` (MODIFIED) - Fixed student lookup to use `id` field
- `routes/attendance.js` (OK) - No changes needed
- `routes/marks.js` (OK) - No changes needed
- `routes/assignments.js` (OK) - No changes needed
- All other routes (OK) - Working correctly

#### Backend Files (MODIFIED)
- `seed.js` (CRITICAL) - Student IDs now 24BCE1144 format, added timetable seeding
- `server.js` (MODIFIED) - Added timetable and reminders routes
- All model files are compatible - no schema changes needed

#### Frontend Files
- `js/data.js` - Already API-first, complete
- `js/utils.js` - Already uses backend session
- `js/login.js` - OK, validates format via backend
- All student HTML pages - Already call correct endpoints
- All faculty HTML pages - Already call correct endpoints

### 6. Data Dependencies Fixed

✅ **NO HARDCODED DATA IN THESE FILES**:
- data.js - Pure API client
- All backend routes - All query DB, no static lists
- All HTML pages - Display bound data only
- All frontend JS - Call APIs, cache invalidated after mutations

✅ **PURE SEEDED DATA ONLY** (seed.js):
- Students with correct format
- Faculty with all metadata
- Timetable with all schedules
- Assignments, attendance, marks complete data

### 7. Login Credentials (After Seeding)

**IMPORTANT**: Run `node seed.js` FIRST to populate database!

Students:
```
ID: 24BCE0001  Password: Pass@123
ID: 24BCE0002  Password: Pass@123
... (all way to 24BCE0055)
```

Faculty:
```
ID: 10001  Password: Teach@123
ID: 10002  Password: Teach@123
... (all way to 10016)
```

---

## Local Setup Walkthrough (Windows)

### Prerequisites Installed
- Node.js 16+ (LTS)
- MongoDB Community Edition 5.0+
- npm (comes with Node.js)
- Git (optional, for cloning)

### Step 1: Install MongoDB (if not installed)

**Download**: https://www.mongodb.com/try/download/community

**Install**:
1. Run the installer (mongodb-windows-x86_64-*.msi)
2. Choose "Complete" installation
3. Install MongoDB Compass (optional but helpful)
4. Check "Install MongoDB as a Service"

**Verify**:
Opens PowerShell and run:
```powershell
mongod --version
```

Should show version like `db version v5.0.0`

### Step 2: Start MongoDB

**Option A - Service (recommended)**:
```powershell
net start MongoDB
```

Output: `The MongoDB service is starting...`

**Option B - Manual**:
```powershell
mongod
```

Keep this terminal open. Output should show:
```
[initandlisten] waiting for connections
[initandlisten] listening on port 27017
```

### Step 3: Clone/Open Project

```powershell
cd C:\SEM4\Sandyproj
```

Or clone:
```powershell
git clone <repo-url>
cd Sandyproj
```

### Step 4: Install Dependencies

```powershell
npm install
```

Wait for all packages to install. Should see:
```
added 120 packages in 45s
```

### Step 5: Verify .env (Optional)

Check if `.env` exists:
```powershell
ls .env
```

If missing, create `.env` with (or defaults will be used):
```
MONGO_URI=mongodb://127.0.0.1:27017/webprojectDB
SESSION_SECRET=vit_secret_key
PORT=3000
NODE_ENV=development
```

### Step 6: Seed Database

**CRITICAL**: This populates all reference data!

```powershell
node seed.js
```

Should see:
```
✅ Connected to MongoDB
🗑️  Cleared existing data
👨‍🎓 Creating 55 students...
   ✅ Inserted 55 students
👨‍🏫 Creating 16 faculty...
   ✅ Inserted 16 faculty
📚 Creating timetable...
   ✅ Inserted 12 timetable records
📝 Creating 25 assignments...
   ✅ Inserted 25 assignments
📋 Creating attendance records...
   ✅ Inserted 440 attendance records
📊 Creating marks records...
   ✅ Inserted 4400 marks records
🔔 Creating reminders...
   ✅ Inserted 5 reminders
═══════════════════════════════════
🎉 Database seeded successfully!
═══════════════════════════════════
   Students:    55
   Faculty:     16
   Timetables:  12
   Assignments: 25
   Attendance:  440 records
   Marks:       4400 records
   Reminders:   5
═══════════════════════════════════

🔑 Login Credentials:
   Student: 24BCE0001 / Pass@123
   Faculty: 10001 / Teach@123

▶  Run "npm start" to launch the server
```

**If seed fails**:
- Ensure MongoDB is running (`net start MongoDB`)
- Check for errors in console
- Try: `mongo` to test connection
- Delete `.env` if custom MONGO_URI is set

### Step 7: Start Server

```powershell
npm start
```

Should see:
```
✅ MongoDB connected
🚀 Server running at http://localhost:3000
```

### Step 8: Open Browser

Navigate to:
```
http://localhost:3000
```

You should see the VIT Smart Classroom login page.

### Step 9: Login Test

**Student Login**:
1. Click "Student Login"
2. Enter: `24BCE0001`
3. Password: `Pass@123`
4. Click Login
5. Should see student dashboard with timetable, attendance, assignments

**Faculty Login**:
1. Click "Faculty Login"  
2. Enter: `10001`
3. Password: `Teach@123`
4. Click Login
5. Should see faculty dashboard with classes, reminders, attendance marking

---

## Complete Testing Checklist

### Authentication
- [ ] Student login with 24BCE0001 succeeds
- [ ] Student login with wrong password fails
- [ ] Student login with non-existent ID fails
- [ ] Faculty login with 10001 succeeds
- [ ] Faculty login formats enforced (student must be 24BCE####)
- [ ] Logout clears session
- [ ] Protected pages redirect to login if not authenticated

### Student Dashboard
- [ ] Welcome message shows student name
- [ ] CGPA displays correctly
- [ ] Attendance percentage displays and toggles to count
- [ ] Today's timetable shows correctly (or "No classes" if weekend)
- [ ] Upcoming assignments list shows with days left
- [ ] Navigation to other pages works (Attendance, Timetable, etc.)

### Student Attendance
- [ ] Page loads attendance for current semester
- [ ] Subject list matches semester subjects
- [ ] Attendance percentage and dates display
- [ ] Can view missed and attended dates

### Student Timetable
- [ ] Shows schedule for all weekdays (Mon-Fri)
- [ ] Time slots and class names display
- [ ] Faculty names and room numbers show
- [ ] No classes shown for weekends message displays

### Student Marks
- [ ] Page loads semester selector
- [ ] All 8 semesters available
- [ ] Marks display with all assessment components (DA1, DA2, DA3, CAT1, CAT2, FAT)
- [ ] Total and grade calculated correctly
- [ ] Pass/Fail status accurate

### Student Assignments
- [ ] Assignment list shows all assignments
- [ ] Subject filter works
- [ ] Assignments categorized: Upcoming, Past Due, Completed
- [ ] Can click to view assignment details
- [ ] Can upload and submit assignment
- [ ] Submission status reflects in UI

### Student Materials
- [ ] Semester dropdown loads
- [ ] Subject dropdown shows subjects for selected semester
- [ ] Module dropdown loads after subject selection
- [ ] Materials list shows uploaded files
- [ ] Can download files

### Student Chat
- [ ] Faculty list loads from database
- [ ] Can select faculty and open chat
- [ ] Can type and send messages
- [ ] Messages persist and load on page reload
- [ ] Chat history shows all messages

### QR Attendance (Student)
- [ ] Opens QR scanner page
- [ ] Can scan QR code (use test image in faculty page)
- [ ] Attendance marked successfully
- [ ] Cannot mark twice for same class
- [ ] Attendance updates immediately in attendance page

### Faculty Dashboard
- [ ] Faculty name displays
- [ ] Today's classes count shows (0 or more)
- [ ] Today's schedule shows correct classes
- [ ] Reminders list loads
- [ ] Can delete reminders from dashboard

### Faculty Attendance - Manual Marking
- [ ] Class/Subject selector loads available subjects
- [ ] Class section selector shows A, B, C
- [ ] Date picker works
- [ ] Student list shows all students in section
- [ ] Can mark present/absent for each student
- [ ] Save updates database
- [ ] After save, attendance page reflects changes

### Faculty QR Attendance
- [ ] Subject and section selectors load
- [ ] Generate button creates QR code
- [ ] QR code displays and can be scanned
- [ ] Session expires after 5 minutes
- [ ] Active session shows if page refreshed
- [ ] Student can scan and mark attendance

### Faculty Marks Entry
- [ ] Class selector loads subjects
- [ ] Section selector loads A, B, C
- [ ] Student list displays  
- [ ] Can enter marks (DA1, DA2, DA3, CAT1, CAT2, FAT)
- [ ] Total and grade auto-calculate
- [ ] Save button updates database
- [ ] Reloading page shows saved data

### Faculty Assignment Management
- [ ] Can create new assignment with all fields
- [ ] Created assignments appear in list
- [ ] Can edit assignment details
- [ ] Can delete assignments
- [ ] Assignments filterable by course

### Faculty Materials Upload
- [ ] Semester and subject selectors populate from database
- [ ] Can select file to upload
- [ ] Upload succeeds for PDF, DOCX, images, etc.
- [ ] Uploaded materials appear in students' materials page
- [ ] File download works

### Faculty Reminders
- [ ] Can create reminder with title, date, description
- [ ] Reminders appear in dashboard
- [ ] Can delete reminder
- [ ] Reminders sorted by date

### Admin Page (if exists)
- [ ] Can create new students
- [ ] Can create new faculty
- [ ] Tables show all data from database

### Database Consistency
- [ ] MongoDB shows webprojectDB with 8 collections
- [ ] No test/temp data in collections
- [ ] All student IDs in 24BCE#### format
- [ ] All faculty IDs 5 digits (10001-10016)
- [ ] Timetable has entries for each semester-section combo
- [ ] No null or undefined values in critical fields

### Performance
- [ ] Pages load within 2-3 seconds
- [ ] No console errors (F12 DevTools)
- [ ] No 404 errors in Network tab
- [ ] API responses complete successfully

---

## Troubleshooting

### "MongoDB connection error"
**Problem**: Server won't start
**Solution**:
```powershell
# Restart MongoDB service
net stop MongoDB
net start MongoDB
# Or manually:
mongod
```

### "Port 3000 already in use"
**Problem**: Server won't start because port is in use
**Solution**:
```powershell
# Find process on port 3000
netstat -ano | findstr :3000
# Kill process (example: PID 1234)
taskkill /PID 1234
# Or use different port
$env:PORT = 3001; npm start
```

### "Seed fails - duplicate key error"
**Problem**: Seed.js finishes but some records skipped
**Solution**: Database is already seeded. Drop and reseed:
```powershell
# Open MongoDB shell
mongo
# Run:
use webprojectDB
db.dropDatabase()
# Exit (Ctrl+C)
# Then reseed:
node seed.js
```

### "Login page opens but login doesn't work"
**Problem**: Credentials not working
**Solution**:
1. Ensure seed.js ran successfully (check console output)
2. Check database: `mongo > use webprojectDB > db.students.findOne()`
3. Verify ID format is 24BCE0001 (not 21BCE0001)
4. Check browser console for error messages (F12)

### "Assignments/Marks/Attendance not showing"
**Problem**: Page loads but data empty
**Solution**:
1. Check if seed.js data was inserted: `db.assignments.count()` should show 25
2. Check browser NetworK tab (F12) - are API calls succeeding?
3. Check server console for error messages
4. Try refreshing page (Ctrl+R)
5. Check student semester matches data (Semester 1-8)

### "File upload fails"
**Problem**: Materials upload doesn't work
**Solution**:
1. Check uploads/ folder exists (created automatically)
2. Check file type is allowed (PDF, DOCX, images, etc.)
3. File size < 50MB
4. Check server console for multer errors
5. Verify form FormData encoding is correct

---

## Project Structure (Final)

```
c:\SEM4\Sandyproj\
├── server.js                 # Express server (MODIFIED)
├── seed.js                   # Database seeding (CRITICAL FIX - 24BCE1144 format)
├── package.json
├── .env                      # MongoDB URI, etc.
├── .gitignore
├── models/
│   ├── Student.js            # Student model
│   ├── Faculty.js            # Faculty model  
│   ├── Timetable.js          # Timetable model
│   ├── Assignment.js
│   ├── Attendance.js
│   ├── Marks.js
│   ├── Submission.js
│   ├── Reminder.js           # Reminders model
│   ├── ChatMessage.js
│   ├── Material.js
│   └── ... (others)
├── routes/
│   ├── auth.js               # Authentication (FIXED student format validation)
│   ├── students.js
│   ├── faculty.js
│   ├── timetable.js          # NEW - Timetable endpoints
│   ├── reminders.js          # NEW - Reminder endpoints
│   ├── attendance.js
│   ├── marks.js
│   ├── assignments.js
│   ├── submissions.js
│   ├── materials.js
│   ├── chat.js
│   ├── qr-session.js         # FIXED - Student ID lookup
│   └── ... (others)
├── js/
│   ├── data.js               # API client (COMPLETE)
│   ├── utils.js              # Session, UI helpers
│   ├── login.js
│   ├── dashboard.js
│   ├── attendance.js
│   ├── assignments.js
│   └── ... (others)
├── student/
│   ├── student_dashboard.html
│   ├── student_attendance.html
│   ├── student_timetable.html
│   ├── student_assignments.html
│   ├── student_chat.html
│   ├── student_marks.html
│   ├── student_materials.html
│   ├── student_login.html
│   └── student_mark_attendance.html
├── faculty/
│   ├── faculty_dashboard.html
│   ├── faculty_attendance.html
│   ├── faculty_attendance_qr.html
│   ├── faculty_marks.html
│   ├── faculty_assignments.html
│   ├── faculty_materials.html
│   ├── faculty_chat.html
│   ├── faculty_timetable.html
│   └── faculty_login.html
├── admin.html
├── forgot_password.html
├── index.html
│
├── css/
│   └── style.css
├── assets/
│   └── (images/logos)
├── uploads/                  # File uploads directory (auto-created)
└── README.md                 # This file
```

---

## Key Assumptions Made

1. **Student ID Format**: Exactly `24BCE1144` format enforced - no other formats accepted
2. **Faculty ID Format**: Exactly 5 digits (10001-10016) - no other formats
3. **Semester**: Always `Semester 1` through `Semester 8` string format
4. **Section**: Always single char - A, B, or C
5. **Department Codes**: Fixed mapping (CSE=BCE, ECE=BEC, etc.)
6. **Subjects**: Fixed list from SUBJECTS_DB in seed (same across all pages)
7. **Timetable**: Fixed time slots (09:00-09:50, 10:00-10:50, etc.) and days (Mon-Fri)
8. **Assessment Components**: DA(1,2,3), CAT(1,2), FAT, Total, Grade, Status
9. **Attendance**: Dates stored as "YYYY-MM-DD" strings in arrays
10. **Chat**: Key format `{studentId}_{facultyId}`, from/to: "student" or "teacher"
11. **Marks Calculation**: (internal + CAT1 + CAT2 + FAT) / 230 * 100
12. **Grade Mapping**: S>=90, A>=80, B>=69, C>=64, D>=59, E>=50, F<50

---

## API Response Standards

All APIs follow this pattern:

**Success (200/201)**:
```json
{
  "success": true,
  "data": { ... }
}
```

**Error (4xx/5xx)**:
```json
{
  "error": "Descriptive error message"
}
```

**List Endpoints**: Return JSON array directly

---

## Session Management

- Backend sessions via `express-session` with MongoDB store
- Cookies: `secure: false` (localhost), `httpOnly: true`, `maxAge: 24h`
- No localStorage for authentication
- Session verified on every protected page load
- Logout destroys session server-side

---

## File Upload

- Files stored in `uploads/` directory
- Max file size: 50MB
- Allowed types: PDF, DOCX, PPTX, images, archives, text
- Download via `/api/materials/download/:id`
- File metadata stored in MongoDB Material collection

---

## QR Attendance

- Tokens generated by faculty, valid for 5 minutes
- Tokens cleared from memory after expiry
- One student can only mark once per token
- All checks: token validity, section match, semester match
- Attendance marked in DB, visible immediately

---

## Performance Notes

- All student/faculty fixtures loaded via API (not hardcoded)
- Database indexes on frequently searched fields
- Attendance/Marks queries by (studentId, semester)
- Timetable queries by (semester, section)
- No N+1 queries (all using .find() or .findOne())

---

## Security Considerations

- Passwords hashed with bcryptjs (salt rounds: 10)
- Session-based auth, not token-based
- CORS enabled for frontend-backend communication
- File uploads validated by type
- Input validation on all routes
- No SQL injection risk (uses Mongoose models)

---

## Maintenance

To add a new student after initial setup:
```
POST /api/students
{
  "id": "24BCE0056",
  "name": "New Student",
  "email": "new@vit.ac.in",
  "department": "CSE",
  "semester": 2,
  "section": "A",
  "cgpa": 8.5,
  "password": "Pass@123"
}
```

To add new assignment:
```
POST /api/assignments
{
  "title": "New Assignment",
  "course": "Data Structures",
  "courseCode": "CSE201",
  "dueDate": "2026-05-20",
  "shortDescription": "...",
  "createdBy": "10001",
  "maxMarks": 100
}
```

All operations immediately update MongoDB.

---

## Support

For issues:
1. Check troubleshooting section above
2. Verify MongoDB is running
3. Check server console output  
4. Open browser DevTools (F12) for client errors
5. Check API responses in Network tab
6. Verify student ID format is correct (24BCE####)

---

**Last Updated**: March 25, 2026
**Version**: 1.0 - Production Ready
