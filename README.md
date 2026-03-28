# Smart Classroom System

**Live Demo:** https://smart-classroom-system-etvl.onrender.com

---

## Overview

The **Smart Classroom System** is a full-stack web application designed to digitize and automate core classroom operations. It provides an integrated platform for **attendance tracking, assignment management, academic evaluation, communication, and resource sharing**.

The system supports **role-based access for students and faculty**, with a secure session-based authentication system and a modern responsive interface.

---

## Key Features

### Authentication System

* Separate login portals for **Students** and **Faculty**
* Session-based authentication (secure, server-side)
* Role-based access control
* Persistent login sessions

---

### Attendance Management

#### QR-Based Attendance (Core Feature)

* Faculty generates a **time-limited QR code** for each class
* Students scan via their portal to mark attendance
* Backend validation ensures:

  * correct section
  * correct semester
  * no duplicate marking
* Real-time tracking of scanned students

#### Manual Attendance

* Faculty can mark attendance manually
* Bulk marking (present/absent)
* Stored and persisted in MongoDB

---

### Marks & Evaluation System

* Faculty can enter marks for:

  * DA1, DA2, CAT, FAT
* Automatic calculation of:

  * Total marks
  * Grade
  * Pass/Fail status
* Students can view their marks instantly

---

### Assignment Management

* Faculty can:

  * Create assignments
  * Update or delete assignments
* Students can:

  * View assignments
  * Submit work
* Search and filter assignments by subject/course

---

### Study Materials System

* Faculty can upload:

  * Notes
  * PDFs
  * Course resources
* Organized by:

  * Semester → Subject → Module
* Students can:

  * View and download materials

---

### Chat System

* Student–Faculty communication system
* Polling-based near real-time messaging
* Organized conversations per user

---

### Timetable Management

* Faculty timetable with class schedules
* Student timetable based on:

  * semester
  * section
* Integrated with QR attendance system

---

### Reminder System

* Faculty can create reminders
* Helps manage:

  * deadlines
  * academic tasks

---

## System Architecture

```
Frontend (HTML + CSS + JS)
        ↓
Data Layer (API Calls)
        ↓
Backend (Node.js + Express)
        ↓
Database (MongoDB Atlas)
```

### Tech Stack

| Layer       | Technology                    |
| ----------- | ----------------------------- |
| Frontend    | HTML, CSS, Vanilla JavaScript |
| Backend     | Node.js, Express              |
| Database    | MongoDB (Atlas)               |
| Auth        | express-session               |
| Deployment  | Render                        |
| File Upload | Multer                        |

---

## Project Structure

```
smart-classroom-system/
│
├── public/              # Frontend (HTML, CSS, JS)
│   ├── faculty/
│   ├── student/
│   ├── js/
│   ├── css/
│   └── assets/
│
├── routes/              # Express routes
├── models/              # Mongoose schemas
├── uploads/             # Uploaded files (local storage)
│
├── server.js            # Main server
├── seed.js              # Database seeding script
├── package.json
└── README.md
```

---

## Setup Instructions (Local)

### 1. Clone the repository

```bash
git clone https://github.com/sandhyav6/smart-classroom-system.git
cd smart-classroom-system
```

---

### 2. Install dependencies

```bash
npm install
```

---

### 3. Configure environment variables

Create a `.env` file:

```env
MONGO_URI=your_mongodb_connection_string
SESSION_SECRET=your_secret_key
PORT=3000
SITE_URL=http://localhost:3000
```

---

### 4. Seed the database

```bash
node seed.js
```

---

### 5. Start the server

```bash
node server.js
```

---

### 6. Open the application

```text
http://localhost:3000
```

---

## Sample Credentials

### Student

* Registration Number: `21BCE0001`
* Password: `Pass@123`

### Faculty

* Employee ID: `10001`
* Password: `Teach@123`

---

## Deployment

This application is deployed on **Render** and uses **MongoDB Atlas** as the cloud database.

Live URL:
https://smart-classroom-system-etvl.onrender.com

---


## Future Enhancements

* Real-time communication using WebSockets
* Cloud file storage (AWS S3 / Cloudinary)
* Push notifications
* Analytics dashboard (attendance trends, performance graphs)
* Mobile app integration
* AI-based assistant for students

---

## Highlights

* Full-stack system with clean architecture
* Secure session-based authentication
* Real-time-like QR attendance system
* Fully database-driven (MongoDB)
* Deployed and accessible online

---

## Summary

The Smart Classroom System transforms traditional classroom workflows into a **digital, automated, and scalable platform**, improving efficiency for both students and faculty.

---
