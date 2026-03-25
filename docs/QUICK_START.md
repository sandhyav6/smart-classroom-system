# Quick Start Guide - Smart Classroom System

**⏱️ 5-minute setup to get the system running**

---

## Prerequisites (Should Already Have)
```
✓ Node.js 16+ installed
✓ MongoDB 5.0+ running (local or cloud)
✓ Git (optional, but recommended)
```

---

## Step 1: Install Dependencies (30 seconds)
```bash
cd c:\SEM4\Sandyproj
npm install
```

**Expected**: Package.json dependencies installed in node_modules/

---

## Step 2: Seed Database (1 minute)
```bash
node seed.js
```

**Expected Output**:
```
✓ Cleared all collections
✓ Seeded 55 students
✓ Seeded 16 faculty members
✓ Seeded 12 timetables
✓ Seeded 25 assignments
✓ Seeded 440+ attendance records
✓ Seeded 4400+ marks records
✓ Seeded 5 reminders

Database seeding complete!

Test Credentials:
Student: 24BCE0001 / Pass@123
Faculty: 10001 / Teach@123
```

---

## Step 3: Launch Server (15 seconds)
```bash
npm start
```

**Expected Output**:
```
Server running on http://localhost:3000
MongoDB connected to smartclassroom
```

---

## Step 4: Access Application (30 seconds)

### Open Browser
```
http://localhost:3000
```

### Student Login
```
Username: 24BCE0001
Password: Pass@123
```

### Faculty Login
```
Username: 10001
Password: Teach@123
```

---

## Verification (1 minute)

### Quick Test Checklist
After logging in as student 24BCE0001:
- [ ] Dashboard shows student name & photo
- [ ] Timetable shows 4 semesters
- [ ] Attendance section shows records
- [ ] Marks section shows grades
- [ ] Assignments section shows list
- [ ] Materials section loads
- [ ] Chat shows messages
- [ ] No console errors

After logging in as faculty 10001:
- [ ] Dashboard shows all faculty info
- [ ] Timetable shows assigned classes
- [ ] Can generate QR for attendance
- [ ] Can view/enter marks
- [ ] Can create reminders
- [ ] Can upload materials
- [ ] No console errors

---

## If Something Doesn't Work

### Issue: "MongoDB connection failed"
**Solution**: 
```bash
# Check if MongoDB is running
# Windows: Search "MongoDB" in Start Menu or
mongod --version
```

### Issue: "Port 3000 already in use"
**Solution**: 
```bash
# Change port in server.js line 5, or kill the process
# Windows: Run as Admin
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Issue: "Can't seed - duplicate key error"
**Solution**:
```bash
# Clear database first
mongo smartclassroom
# Then drop the database in MongoDB Compass
# Then run: node seed.js
```

### Issue: "Login doesn't work"
**Solution**:
```
Check format:
- Student: 24BCE XXXX (not 21BCE or 20BCE)
- Faculty: 5 digits (10001-10016)
- Passwords are EXACT case-sensitive: Pass@123 or Teach@123
```

### Issue: "Data shows as undefined or blank"
**Solution**:
```
1. Open browser DevTools (F12)
2. Check Console tab for errors
3. Check Network tab to see if APIs return data
4. Verify MongoDB has data: 
   - MongoDB Compass → smartclassroom → collections
5. Restart server: npm start
```

---

## File Locations

```
c:\SEM4\Sandyproj\
├── server.js              ← Main server entry point
├── seed.js                ← Database seeding script
├── package.json           ← Dependencies
├── models/                ← Mongoose schemas (10 files)
├── routes/                ← API endpoints (15 files)
├── admin.html             ← Admin login page
├── index.html             ← Student/Faculty login
├── faculty/               ← Faculty pages (8 HTML files)
├── student/               ← Student pages (8 HTML files)
├── js/                    ← Frontend JavaScript (7 files)
├── css/                   ← Styling
├── assets/                ← Images and static files
└── uploads/               ← User uploaded materials
```

---

## Key Data

### Student Format
```
ID: 24BCE0001 to 24BCE0055 (55 total)
Password: Pass@123 (all have same)
```

### Faculty Format
```
ID: 10001 to 10016 (16 total)
Password: Teach@123 (all have same)
```

### Timetable
```
4 Semesters × 3 Sections (A, B, C) = 12 records
Shows days: Monday-Friday
Includes: Subject, Faculty, Room, Time
```

### Marks
```
Per student per subject per semester
Formula: (Internal + CAT1 + CAT2 + FAT) / 230 * 100
Grades: S(90+), A(80-89), B(69-79), C(64-68), D(59-63), E(50-58), F(<50)
```

---

## Monitoring & Logs

### Check API Responses
Open browser DevTools → Network tab
All API calls should return 200 status with data

### Check Database
Open MongoDB Compass
- Database: `smartclassroom`
- Collections: Should have 10 collections with thousands of records

### Check Server Logs
Terminal where you ran `npm start` shows:
```
  GET /api/timetable/1?section=A 200 - 45ms
  POST /api/attendance/mark 200 - 120ms
  etc.
```

---

## Common Operations

### View All Students
```bash
mongo smartclassroom
db.students.find().pretty()
```

### View All Faculty
```bash
db.faculties.find().pretty()
```

### Reset Database
```bash
# Drop all collections
db.dropDatabase()
# Then re-seed
exit
node seed.js
```

### Check User Sessions
Sessions stored in (if using MongoDB session store):
```
db.sessions.find().pretty()
```

---

## Performance Tips

1. **First Load**: May take 3-5 seconds to fetch all data
2. **Subsequent: Loads much faster (optimized caching)
3. **Large Lists**: Paginate for 100+ records (already implemented)
4. **QR Scans**: Keep within 5 meters
5. **File Uploads**: Max 50MB per file

---

## Important ⚠️

- **Student ID Format is LOCKED**: All students MUST be 24BCEXXXX
- **Passwords are CASE SENSITIVE**: Pass@123 ≠ pass@123
- **Timetable Semester Format**: "Semester 1", "Semester 2", etc.
- **Section Format**: Single letter A, B, or C only
- **Do NOT modify seed.js if running in production** (will reset data)

---

## What's Working

✅ Student login & dashboard
✅ Faculty login & dashboard
✅ Timetable system
✅ Attendance marking & QR scanning
✅ Marks entry & viewing
✅ Assignment management
✅ Material uploads
✅ Chat system
✅ Faculty reminders
✅ All data from MongoDB

---

## Next Steps

1. **Understand the system**: Read SETUP_AND_TESTING.md (detailed guide)
2. **Test thoroughly**: Use SETUP_AND_TESTING.md testing checklist
3. **Review changes**: Check CHANGES_SUMMARY.md for what was modified
4. **Check files**: Review FILE_INVENTORY.md for complete file list
5. **Read final summary**: See FINAL_DELIVERY_SUMMARY.md for overview

---

## Support Files

All created during integration:

1. **FINAL_DELIVERY_SUMMARY.md** - Executive summary (this is what you just read)
2. **SETUP_AND_TESTING.md** - Complete setup + 40+ test cases + troubleshooting
3. **CHANGES_SUMMARY.md** - Detailed change inventory with before/after code
4. **FILE_INVENTORY.md** - Complete file listing and status
5. **QUICK_START.md** - This file (quick 5-minute startup)

---

## Contact/Questions

For detailed help, check the section in SETUP_AND_TESTING.md:
- Troubleshooting (10+ common issues & solutions)
- Testing Checklist (40+ test cases with expected results)
- API Reference (all endpoints documented)
- Data Model (all collections documented)

---

**Estimated Setup Time: 5 minutes** ⏱️
**System Status: READY FOR USE** ✅
**All Features: WORKING** ✅

Happy teaching! 🎓
