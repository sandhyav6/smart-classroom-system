# 🧠 Smart Classroom System

## 📌 Overview

The **Smart Classroom System** is a full-stack web application for managing classroom operations at VIT (Vellore Institute of Technology). It provides role-based dashboards for **faculty** and **students** with real-time data backed by a **MongoDB** database and a **Node.js/Express** API server.

**Every feature is fully backend-driven — no localStorage, no simulated data, no fake fallbacks.**

---

## 🚀 Features

### 👨‍🏫 Faculty Module
- 🔐 Secure login with backend session authentication
- 📊 Dashboard with class overview, reminders, and quick actions
- 📝 Attendance management (mark, review, bulk actions)
- 📚 Assignment CRUD (create, edit, delete, view submissions)
- 🏆 Marks entry with per-assessment editing
- 📂 Study material upload (file upload via Multer)
- 🗓 Teaching schedule / timetable view
- 💬 Real-time chat interface with students
- 📱 QR code generation + real backend attendance marking

### 🎓 Student Module
- 🔐 Secure login with backend session authentication
- 📊 Dashboard with attendance summary, upcoming deadlines, timetable
- 📅 Detailed attendance records with date-level breakdown
- 📚 Assignment viewing and file submission
- 🏆 Semester-wise marks and grade viewing
- 📂 Study materials browser (by semester/subject/module)
- 🗓 Weekly timetable view
- 💬 Chat interface with faculty
- 📱 QR-based attendance marking via real backend API

### 🔒 Authentication & Security
- 🔑 Password reset via `/api/auth/forgot-password`
- 🍪 HTTP-only session cookies (no localStorage anywhere)
- 🛡 Backend-validated sessions on every protected page
- 🚫 No manual `Session.set()` — cache populated only from server
- ⚠️ Global error handling middleware with JSON error responses
- 🔍 404 handler for undefined API routes

---

## 🛠 Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | HTML5, CSS3, Vanilla JavaScript     |
| Backend    | Node.js, Express.js                 |
| Database   | MongoDB (Mongoose ODM)              |
| Auth       | express-session (cookie-based)      |
| Uploads    | Multer (multipart file handling)    |
| Passwords  | bcryptjs (hashing)                  |
| Icons      | Font Awesome 6                      |

---

## 📂 Project Structure

```
smart-classroom-system/
├── server.js                  # Express server entry point
├── .env                       # Environment variables
├── package.json
├── index.html                 # Landing page
├── forgot_password.html       # Password reset page
│
├── models/                    # Mongoose schemas
│   ├── Student.js
│   ├── Faculty.js
│   ├── Assignment.js
│   ├── Submission.js
│   ├── Attendance.js
│   ├── Marks.js
│   ├── Timetable.js
│   ├── Material.js
│   ├── ChatMessage.js
│   └── Reminder.js
│
├── routes/                    # Express API routes
│   ├── auth.js                # Login, logout, session, forgot-password
│   ├── students.js
│   ├── faculty.js
│   ├── attendance.js
│   ├── marks.js
│   ├── assignments.js
│   ├── submissions.js
│   ├── materials.js           # Upload/download/list files
│   └── misc.js                # Timetable, reminders, chat
│
├── js/                        # Frontend JavaScript
│   ├── data.js                # API client / DataStore (single API layer)
│   ├── utils.js               # Session, Nav, Toast, UIHelpers, DarkMode
│   ├── login.js               # Login form handling
│   ├── dashboard.js           # Dashboard initialization
│   ├── assignments.js         # Assignment manager (student + faculty)
│   └── attendance.js          # Attendance manager (student + faculty)
│
├── css/
│   └── style.css              # Global styles (dark/light mode)
│
├── faculty/                   # Faculty HTML pages
│   ├── faculty_login.html
│   ├── faculty_dashboard.html
│   ├── faculty_attendance.html
│   ├── faculty_attendance_qr.html
│   ├── faculty_assignments.html
│   ├── faculty_marks.html
│   ├── faculty_materials.html
│   ├── faculty_timetable.html
│   └── faculty_chat.html
│
├── student/                   # Student HTML pages
│   ├── student_login.html
│   ├── student_dashboard.html
│   ├── student_attendance.html
│   ├── student_mark_attendance.html
│   ├── student_assignments.html
│   ├── student_marks.html
│   ├── student_materials.html
│   ├── student_timetable.html
│   └── student_chat.html
│
├── assets/                    # Images and logos
│   ├── logo.png
│   ├── faculty_profile.png
│   └── student_profile.png
│
└── uploads/                   # Uploaded study materials (auto-created)
```

---

## ⚙️ Setup & Installation

### Prerequisites
- **Node.js** (v16+)
- **MongoDB** (running locally or a MongoDB Atlas URI)

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/sandhyav6/smart-classroom-system.git
cd smart-classroom-system
```

### 2️⃣ Install Dependencies
```bash
npm install
```

### 3️⃣ Configure Environment
Create a `.env` file in the project root:
```env
MONGO_URI=mongodb://localhost:27017/smart_classroom
SESSION_SECRET=your_secret_key_here
PORT=3000
```

### 4️⃣ Start MongoDB
```bash
# Windows
net start MongoDB

# macOS/Linux
mongod --dbpath /data/db

# Or use MongoDB Atlas (set MONGO_URI in .env)
```

### 5️⃣ Seed the Database (if first run)
```bash
node seed.js
```

### 6️⃣ Run the Server
```bash
node server.js
```

### 7️⃣ Open in Browser
Navigate to **http://localhost:3000**

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint                    | Description            |
|--------|-----------------------------|------------------------|
| POST   | `/api/auth/student-login`   | Student login          |
| POST   | `/api/auth/faculty-login`   | Faculty login          |
| GET    | `/api/auth/session`         | Get current session    |
| POST   | `/api/auth/logout`          | Logout                 |
| POST   | `/api/auth/forgot-password` | Request password reset |

### Students & Faculty
| Method | Endpoint             | Description               |
|--------|----------------------|---------------------------|
| GET    | `/api/students`      | List all students         |
| GET    | `/api/students/:id`  | Get student by ID         |
| POST   | `/api/students`      | Add new student           |
| PUT    | `/api/students/:id`  | Update student            |
| DELETE | `/api/students/:id`  | Delete student            |
| GET    | `/api/faculty`       | List all faculty          |
| GET    | `/api/faculty/:id`   | Get faculty by ID         |

### Attendance
| Method | Endpoint                           | Description                    |
|--------|------------------------------------|--------------------------------|
| GET    | `/api/attendance/:id/:semester`    | Get attendance for student     |
| PUT    | `/api/attendance/mark`             | Mark attendance (real API)     |

### Marks
| Method | Endpoint                              | Description          |
|--------|---------------------------------------|----------------------|
| GET    | `/api/marks/:id/:semester`            | Get marks by student |
| PUT    | `/api/marks/:id/:semester/:code`      | Update marks         |

### Assignments & Submissions
| Method | Endpoint                                   | Description              |
|--------|--------------------------------------------|--------------------------|
| GET    | `/api/assignments`                         | List all assignments     |
| POST   | `/api/assignments`                         | Create assignment        |
| PUT    | `/api/assignments/:id`                     | Update assignment        |
| DELETE | `/api/assignments/:id`                     | Delete assignment        |
| POST   | `/api/submissions`                         | Submit assignment        |
| GET    | `/api/submissions/:studentId/:assignmentId`| Check submission status  |

### Materials (File Upload)
| Method | Endpoint                              | Description               |
|--------|---------------------------------------|---------------------------|
| POST   | `/api/materials/upload`               | Upload a study material   |
| GET    | `/api/materials/:sem/:sub?/:mod?`     | List subjects/modules/files |
| GET    | `/api/materials/download/:id`         | Download a material file  |

### Miscellaneous
| Method | Endpoint                    | Description            |
|--------|-----------------------------|------------------------|
| GET    | `/api/timetable/:semester`  | Get timetable          |
| GET    | `/api/faculty-timetable`    | Get faculty schedule   |
| GET    | `/api/reminders`            | List reminders         |
| POST   | `/api/reminders`            | Create reminder        |
| DELETE | `/api/reminders/:id`        | Delete reminder        |
| GET    | `/api/chat/:chatKey`        | Get chat messages      |
| POST   | `/api/chat/:chatKey`        | Send chat message      |

---

## 🎯 Architecture Highlights

- **Zero localStorage** — All session and data management is backend-driven
- **No Session.set()** — Session cache populated exclusively from `GET /api/auth/session`
- **No fake data** — All features return real MongoDB data; no placeholder fallbacks
- **Async/Await everywhere** — All frontend API calls properly use `async/await`
- **Single API layer** — All frontend code uses `dataStore` methods; no scattered `fetch()` calls
- **Role-based access** — `Session.requireAuth()` validates roles on every page
- **Error handling** — Global error middleware + 404 handler for undefined API routes
- **Modular routing** — Each feature has its own Express route file
- **Mongoose models** — Structured schemas for all data entities
- **File uploads** — Multer-powered material upload with metadata in MongoDB

---

## 📦 Version

**Version 2.0** — Full-stack implementation with MongoDB backend, Express API, and production-ready frontend.
