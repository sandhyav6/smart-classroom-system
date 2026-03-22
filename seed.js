// ============================================================
// seed.js — Populate MongoDB with all Smart Classroom data
// Run once: node seed.js
// ============================================================

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Models
const Student = require('./models/Student');
const Faculty = require('./models/Faculty');
const Assignment = require('./models/Assignment');
const Attendance = require('./models/Attendance');
const Marks = require('./models/Marks');
const Reminder = require('./models/Reminder');

// ---- Data constants (same as frontend data.js) ----
const SUBJECTS_DB = {
    "Semester 1": ["CALCULUS FOR ENGINEERS", "ENGINEERING PHYSICS", "ENGINEERING CHEMISTRY", "BASIC ELECTRICAL ENG", "PROBLEM SOLVING & PROG", "ENGLISH FOR ENGINEERS", "ENV. SCIENCE"],
    "Semester 2": ["DIFFERENTIAL EQUATIONS", "DIGITAL LOGIC DESIGN", "DATA STRUCTURES", "ENGINEERING GRAPHICS", "DISCRETE MATHEMATICS", "BASIC ELECTRONICS", "SOFT SKILLS"],
    "Semester 3": ["COMPUTER ARCHITECTURE", "OOP WITH C++", "DATABASE MANAGEMENT", "OPERATING SYSTEMS", "PROBABILITY & STATS", "SYSTEM SOFTWARE", "ETHICS & VALUES"],
    "Semester 4": ["DESIGN & ANALYSIS ALGOS", "THEORY OF COMPUTATION", "JAVA PROGRAMMING", "EMBEDDED SYSTEMS", "COMPUTER NETWORKS", "WEB TECHNOLOGIES", "QUANTITATIVE SKILLS"],
    "Semester 5": ["ARTIFICIAL INTELLIGENCE", "COMPILER DESIGN", "SOFTWARE ENGINEERING", "DATA MINING", "CLOUD COMPUTING", "MOBILE APP DEV", "INTERNET OF THINGS"],
    "Semester 6": ["MACHINE LEARNING", "CRYPTOGRAPHY", "DISTRIBUTED SYSTEMS", "BIG DATA ANALYTICS", "DEEP LEARNING", "IMAGE PROCESSING", "NETWORK SECURITY"],
    "Semester 7": ["NATURAL LANGUAGE PROC", "BLOCKCHAIN TECH", "CYBER SECURITY", "AUGMENTED REALITY", "ROBOTICS", "HUMAN COMP INTERACT", "ENTREPRENEURSHIP"],
    "Semester 8": ["PROJECT WORK PHASE 1", "PROJECT WORK PHASE 2", "INTERNSHIP", "ADVANCED AI", "SATELLITE COMM", "VLSI DESIGN", "COMPREHENSIVE VIVA"]
};

const FIRST_NAMES = [
    "Arjun", "Priya", "Rahul", "Sneha", "Vikram", "Ananya", "Karthik", "Divya",
    "Rohan", "Kavya", "Aditya", "Meera", "Siddharth", "Ishita", "Aryan", "Simran",
    "Nikhil", "Pooja", "Varun", "Tanvi", "Harsh", "Riya", "Akash", "Nisha",
    "Amit", "Shreya", "Deepak", "Lavanya", "Manish", "Swati", "Prashanth", "Anjali",
    "Suresh", "Gayathri", "Rajesh", "Bhavna", "Tarun", "Megha", "Vivek", "Sakshi",
    "Arun", "Neha", "Saurabh", "Kritika", "Yash", "Tanya", "Gaurav", "Diya",
    "Kunal", "Aditi", "Sandeep", "Payal", "Vishal", "Janani", "Mohit", "Krithika"
];

const LAST_NAMES = [
    "Sharma", "Patel", "Kumar", "Reddy", "Singh", "Iyer", "Menon", "Nair",
    "Gupta", "Pillai", "Verma", "Krishnan", "Rao", "Joshi", "Kaur", "Desai",
    "Agarwal", "Chauhan", "Mishra", "Pandey", "Mehta", "Bhat", "Das", "Saxena",
    "Thakur", "Banerjee", "Mukherjee", "Roy", "Gandhi", "Kulkarni"
];

const DEPARTMENTS = ["CSE", "ECE", "EEE", "MECH", "CIVIL", "IT", "CHEM", "BIO"];
const DEPT_CODES = { CSE: "BCE", ECE: "BEC", EEE: "BEE", MECH: "BME", CIVIL: "BCL", IT: "BIT", CHEM: "BCH", BIO: "BBT" };

const FACULTY_DATA = [
    { name: "Dr. Priya Singh", empId: "10001", dept: "CSE", subjects: ["Data Structures", "Algorithms"], email: "priya.singh@vit.ac.in", classes: [{ section: "CSE-2A", subject: "Data Structures" }, { section: "CSE-2B", subject: "Algorithms" }] },
    { name: "Prof. Ramesh Kumar", empId: "10002", dept: "CSE", subjects: ["Database Management", "Web Technologies"], email: "ramesh.kumar@vit.ac.in", classes: [{ section: "CSE-3A", subject: "Database Systems" }] },
    { name: "Dr. Anitha Menon", empId: "10003", dept: "CSE", subjects: ["Operating Systems", "Computer Networks"], email: "anitha.menon@vit.ac.in", classes: [{ section: "CSE-2A", subject: "Operating Systems" }] },
    { name: "Prof. Suresh Iyer", empId: "10004", dept: "CSE", subjects: ["Machine Learning", "Artificial Intelligence"], email: "suresh.iyer@vit.ac.in", classes: [] },
    { name: "Dr. Kavitha Rao", empId: "10005", dept: "ECE", subjects: ["Digital Logic Design", "Embedded Systems"], email: "kavitha.rao@vit.ac.in", classes: [] },
    { name: "Prof. Arun Sharma", empId: "10006", dept: "CSE", subjects: ["Compiler Design", "Theory of Computation"], email: "arun.sharma@vit.ac.in", classes: [] },
    { name: "Dr. Meena Patel", empId: "10007", dept: "CSE", subjects: ["Software Engineering", "Cloud Computing"], email: "meena.patel@vit.ac.in", classes: [] },
    { name: "Prof. Vijay Reddy", empId: "10008", dept: "MECH", subjects: ["Engineering Graphics", "Engineering Physics"], email: "vijay.reddy@vit.ac.in", classes: [] },
    { name: "Dr. Lakshmi Nair", empId: "10009", dept: "CSE", subjects: ["Cryptography", "Network Security"], email: "lakshmi.nair@vit.ac.in", classes: [] },
    { name: "Prof. Kiran Desai", empId: "10010", dept: "CSE", subjects: ["Deep Learning", "Image Processing"], email: "kiran.desai@vit.ac.in", classes: [] },
    { name: "Dr. Sunita Gupta", empId: "10011", dept: "CSE", subjects: ["Big Data Analytics", "Data Mining"], email: "sunita.gupta@vit.ac.in", classes: [] },
    { name: "Prof. Mohan Verma", empId: "10012", dept: "ECE", subjects: ["VLSI Design", "Satellite Comm"], email: "mohan.verma@vit.ac.in", classes: [] },
    { name: "Dr. Rekha Joshi", empId: "10013", dept: "CSE", subjects: ["Blockchain Tech", "Cyber Security"], email: "rekha.joshi@vit.ac.in", classes: [] },
    { name: "Prof. Ganesh Pillai", empId: "10014", dept: "CSE", subjects: ["NLP", "Robotics"], email: "ganesh.pillai@vit.ac.in", classes: [] },
    { name: "Dr. Deepa Krishnan", empId: "10015", dept: "CSE", subjects: ["Mobile App Dev", "IoT"], email: "deepa.krishnan@vit.ac.in", classes: [] },
    { name: "Prof. Harish Mehta", empId: "10016", dept: "CSE", subjects: ["Java Programming", "OOP with C++"], email: "harish.mehta@vit.ac.in", classes: [] }
];

// ---- Seeded RNG ----
class SeededRandom {
    constructor(seed = 42) { this.seed = seed; }
    next() { this.seed = (this.seed * 16807) % 2147483647; return (this.seed - 1) / 2147483646; }
    nextInt(min, max) { return Math.floor(this.next() * (max - min + 1)) + min; }
}

function calcGrade(score) {
    if (score >= 90) return 'S'; if (score >= 80) return 'A'; if (score >= 69) return 'B';
    if (score >= 64) return 'C'; if (score >= 59) return 'D'; if (score >= 50) return 'E'; return 'F';
}

// ============================================================
// SEED FUNCTION
// ============================================================
async function seed() {
    console.log('🌱 Starting database seed...\n');

    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/smart_classroom';
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Clear existing data
    await Student.deleteMany({});
    await Faculty.deleteMany({});
    await Assignment.deleteMany({});
    await Attendance.deleteMany({});
    await Marks.deleteMany({});
    await Reminder.deleteMany({});
    console.log('🗑️  Cleared existing data\n');

    const rng = new SeededRandom(2026);
    const studentPwd = await bcrypt.hash('Pass@123', 10);
    const facultyPwd = await bcrypt.hash('Teach@123', 10);

    // ---- 1. STUDENTS (55) ----
    console.log('👨‍🎓 Creating 55 students...');
    const students = [];
    const usedNames = new Set();

    for (let i = 0; i < 55; i++) {
        let firstName, lastName, fullName;
        do {
            firstName = FIRST_NAMES[rng.nextInt(0, FIRST_NAMES.length - 1)];
            lastName = LAST_NAMES[rng.nextInt(0, LAST_NAMES.length - 1)];
            fullName = `${firstName} ${lastName}`;
        } while (usedNames.has(fullName));
        usedNames.add(fullName);

        const dept = i < 35 ? "CSE" : DEPARTMENTS[rng.nextInt(0, DEPARTMENTS.length - 1)];
        const deptCode = DEPT_CODES[dept];
        const year = rng.nextInt(21, 23);
        const rollNum = String(i + 1).padStart(4, '0');
        const regNo = `${year}${deptCode}${rollNum}`;
        const semester = rng.nextInt(1, 6);
        const cgpa = (rng.nextInt(65, 98) / 10).toFixed(1);
        const section = i < 20 ? "A" : (i < 40 ? "B" : "C");

        students.push({
            id: regNo,
            name: fullName,
            firstName,
            lastName,
            email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@vit.ac.in`,
            department: dept,
            semester,
            section,
            cgpa: parseFloat(cgpa),
            password: studentPwd,
            phone: `+91 ${rng.nextInt(70000, 99999)}${rng.nextInt(10000, 99999)}`,
            joinYear: 2000 + year,
            active: true
        });
    }
    await Student.insertMany(students);
    console.log(`   ✅ Inserted ${students.length} students\n`);

    // ---- 2. FACULTY (16) ----
    console.log('👨‍🏫 Creating 16 faculty...');
    const faculty = FACULTY_DATA.map(f => ({
        id: f.empId,
        name: f.name,
        email: f.email,
        department: f.dept,
        subjects: f.subjects,
        password: facultyPwd,
        phone: `+91 98765${f.empId.slice(-5)}`,
        designation: f.name.startsWith("Dr.") ? "Associate Professor" : "Assistant Professor",
        active: true,
        classes: f.classes
    }));
    await Faculty.insertMany(faculty);
    console.log(`   ✅ Inserted ${faculty.length} faculty\n`);

    // ---- 3. ASSIGNMENTS (25) ----
    console.log('📝 Creating 25 assignments...');
    const assignmentTemplates = [
        { title: "Binary Search Tree Implementation", course: "Data Structures", courseCode: "CSE201", desc: "Implement BST with insertion, deletion, and traversal operations in C.", detailed: "Create a complete BST implementation." },
        { title: "Linear Algebra Problem Set", course: "Linear Algebra", courseCode: "MAT201", desc: "Solve problems on eigenvalues and eigenvectors.", detailed: "Complete Chapter 5 problems." },
        { title: "Digital Logic Circuit Design", course: "Digital Logic Design", courseCode: "CSE202", desc: "Design a 4-bit ALU using logic gates.", detailed: "Design a 4-bit ALU for ADD, SUB, AND, OR, NOT, XOR." },
        { title: "Ethics Case Study Analysis", course: "Ethics and Values", courseCode: "HUM201", desc: "Analyze ethical implications of AI in healthcare.", detailed: "Write a 1500-2000 word essay on AI ethics." },
        { title: "Programming Assignment 3", course: "Programming in C", courseCode: "CSE101", desc: "File handling and structure manipulation in C.", detailed: "Create a student record management system in C." },
        { title: "Calculus Integration Problems", course: "Calculus", courseCode: "MAT101", desc: "Solve definite and indefinite integration problems.", detailed: "Complete Chapter 6 problems." },
        { title: "OOP Concepts in Java", course: "Object-Oriented Programming", courseCode: "CSE301", desc: "Implement inheritance and polymorphism in Java.", detailed: "Design Vehicle class hierarchy." },
        { title: "Database Normalization", course: "Database Management Systems", courseCode: "CSE302", desc: "Normalize a database schema to 3NF.", detailed: "Library management schema normalization." },
        { title: "OS Process Scheduling", course: "Operating Systems", courseCode: "CSE303", desc: "Implement CPU scheduling algorithms.", detailed: "Simulate FCFS, SJF, Round Robin." },
        { title: "Network Protocol Analysis", course: "Computer Networks", courseCode: "CSE304", desc: "Analyze TCP/IP packets using Wireshark.", detailed: "Capture and analyze HTTP, HTTPS, DNS traffic." },
        { title: "Machine Learning Model", course: "Machine Learning", courseCode: "CSE501", desc: "Build a classification model.", detailed: "Build classifier for Iris dataset." },
        { title: "Sorting Algorithm Analysis", course: "Data Structures", courseCode: "CSE201", desc: "Implement and compare sorting algorithms.", detailed: "Compare time complexity with measurements." },
        { title: "Graph Algorithms Lab", course: "Data Structures", courseCode: "CSE201", desc: "Implement BFS, DFS, Dijkstra's.", detailed: "Implement for weighted graphs." },
        { title: "SQL Query Optimization", course: "Database Management Systems", courseCode: "CSE302", desc: "Optimize complex SQL queries.", detailed: "Analyze and optimize 10 queries." },
        { title: "Web Application Project", course: "Web Technologies", courseCode: "CSE401", desc: "Build a full-stack web application.", detailed: "Create a todo list web app." },
        { title: "Linked List Operations", course: "Data Structures", courseCode: "CSE201", desc: "Implement singly and doubly linked lists.", detailed: "Full linked list implementation." },
        { title: "Python Data Analysis", course: "Data Mining", courseCode: "CSE502", desc: "Analyze a real-world dataset.", detailed: "Titanic dataset analysis." },
        { title: "Cloud Deployment Lab", course: "Cloud Computing", courseCode: "CSE503", desc: "Deploy an app on AWS/GCP.", detailed: "Deploy and document." },
        { title: "IoT Sensor Project", course: "Internet of Things", courseCode: "CSE504", desc: "Build IoT temperature monitoring.", detailed: "Design temperature monitoring system." },
        { title: "Compiler Design Lab", course: "Compiler Design", courseCode: "CSE505", desc: "Build a lexical analyzer.", detailed: "Tokenize subset of C." },
        { title: "Software Requirements Doc", course: "Software Engineering", courseCode: "CSE506", desc: "Write an SRS document.", detailed: "SRS for online library. IEEE 830 format." },
        { title: "Cybersecurity Case Study", course: "Cyber Security", courseCode: "CSE601", desc: "Analyze a recent breach.", detailed: "2000-word breach report." },
        { title: "Deep Learning CNN Project", course: "Deep Learning", courseCode: "CSE602", desc: "Build a CNN for image classification.", detailed: "CNN for CIFAR-10." },
        { title: "NLP Text Classification", course: "Natural Language Processing", courseCode: "CSE701", desc: "Build a sentiment analysis model.", detailed: "Sentiment classifier for movie reviews." },
        { title: "Blockchain Smart Contract", course: "Blockchain Technology", courseCode: "CSE702", desc: "Write a Solidity smart contract.", detailed: "Voting smart contract." }
    ];

    const baseDates = [
        "2026-04-05", "2026-04-08", "2026-04-10", "2026-04-12", "2026-03-10",
        "2026-03-05", "2026-02-20", "2026-02-18", "2026-02-15", "2026-02-10",
        "2026-04-15", "2026-04-18", "2026-04-20", "2026-04-22", "2026-04-25",
        "2026-03-25", "2026-04-28", "2026-04-30", "2026-05-02", "2026-05-05",
        "2026-05-08", "2026-03-15", "2026-05-10", "2026-05-12", "2026-05-15"
    ];

    const assignments = assignmentTemplates.map((t, i) => ({
        assignmentId: i + 1,
        title: t.title,
        course: t.course,
        courseCode: t.courseCode,
        dueDate: baseDates[i],
        shortDescription: t.desc,
        detailedDescription: t.detailed,
        createdBy: faculty[i % faculty.length].id,
        maxMarks: 100
    }));
    await Assignment.insertMany(assignments);
    console.log(`   ✅ Inserted ${assignments.length} assignments\n`);

    // ---- 4. ATTENDANCE ----
    console.log('📋 Creating attendance records...');
    const months = ["2026-01", "2026-02", "2026-03"];
    const attendanceDocs = [];

    for (const student of students) {
        const semKey = `Semester ${student.semester}`;
        const subjects = SUBJECTS_DB[semKey] || SUBJECTS_DB["Semester 1"];

        for (const subName of subjects) {
            const totalDays = rng.nextInt(35, 45);
            const missedCount = rng.nextInt(2, 8);
            const attendedDates = [];
            const missedDates = [];
            let dayCounter = 3;

            for (let d = 0; d < totalDays; d++) {
                const monthIdx = Math.floor(d / 15);
                const month = months[Math.min(monthIdx, 2)];
                const day = (dayCounter % 28) + 1;
                const dateStr = `${month}-${String(day).padStart(2, '0')}`;
                dayCounter += rng.nextInt(1, 3);

                if (d < missedCount && rng.next() < 0.6) {
                    missedDates.push(dateStr);
                } else {
                    attendedDates.push(dateStr);
                }
            }

            attendanceDocs.push({
                studentId: student.id,
                semester: semKey,
                subject: subName,
                code: subName.substring(0, 3).toUpperCase() + "1001",
                attendedDates,
                missedDates
            });
        }
    }
    await Attendance.insertMany(attendanceDocs);
    console.log(`   ✅ Inserted ${attendanceDocs.length} attendance records\n`);

    // ---- 5. MARKS ----
    console.log('📊 Creating marks records...');
    const marksDocs = [];

    for (const student of students) {
        for (let sem = 1; sem <= 8; sem++) {
            const semKey = `Semester ${sem}`;
            const subjects = SUBJECTS_DB[semKey];

            for (const subName of subjects) {
                const da1 = rng.nextInt(7, 10);
                const da2 = rng.nextInt(7, 10);
                const da3 = rng.nextInt(7, 10);
                const internal = da1 + da2 + da3;
                const cat1 = rng.nextInt(30, 50);
                const cat2 = rng.nextInt(30, 50);
                const fat = rng.nextInt(50, 90);

                let total = Math.floor(((internal + cat1 + cat2 + fat) / 230) * 100);
                if (total > 100) total = 100;

                let status = "Pass";
                let grade = calcGrade(total);
                let remarks = "Good";

                if (rng.next() < 0.04) {
                    status = "Fail"; grade = "F"; remarks = "Re-appear";
                }

                marksDocs.push({
                    studentId: student.id,
                    semester: semKey,
                    code: subName.substring(0, 3).toUpperCase() + "1001",
                    name: subName,
                    da1, da2, da3, internal,
                    cat1, cat2, fat,
                    total, grade, remarks, status
                });
            }
        }
    }
    // Insert in batches to avoid memory issues
    const BATCH_SIZE = 1000;
    for (let i = 0; i < marksDocs.length; i += BATCH_SIZE) {
        await Marks.insertMany(marksDocs.slice(i, i + BATCH_SIZE));
    }
    console.log(`   ✅ Inserted ${marksDocs.length} marks records\n`);

    // ---- 6. REMINDERS ----
    console.log('🔔 Creating reminders...');
    const reminders = [
        { title: 'Submit Final Exam Questions', date: '2026-04-05', description: 'Deadline for all faculty to submit final exam questions.', facultyId: '10001' },
        { title: 'Faculty Meeting', date: '2026-03-25', description: 'Monthly faculty meeting in Conference Hall A at 10:00 AM.', facultyId: '10001' },
        { title: 'Grade Submissions', date: '2026-04-10', description: 'Submit CAT1 grades for all sections.', facultyId: '10001' },
        { title: 'Research Paper Review', date: '2026-04-08', description: 'Complete review of submitted research papers.', facultyId: '10001' },
        { title: 'Curriculum Planning Meeting', date: '2026-04-15', description: 'Curriculum revision meeting for next academic year.', facultyId: '10001' }
    ];
    await Reminder.insertMany(reminders);
    console.log(`   ✅ Inserted ${reminders.length} reminders\n`);

    // ---- Summary ----
    console.log('═══════════════════════════════════════');
    console.log('🎉 Database seeded successfully!');
    console.log('═══════════════════════════════════════');
    console.log(`   Students:    ${students.length}`);
    console.log(`   Faculty:     ${faculty.length}`);
    console.log(`   Assignments: ${assignments.length}`);
    console.log(`   Attendance:  ${attendanceDocs.length} records`);
    console.log(`   Marks:       ${marksDocs.length} records`);
    console.log(`   Reminders:   ${reminders.length}`);
    console.log('═══════════════════════════════════════');
    console.log('\n🔑 Login Credentials:');
    console.log('   Student: 21BCE0001 / Pass@123');
    console.log('   Faculty: 10001 / Teach@123');
    console.log('\n▶  Run "npm start" to launch the server\n');

    await mongoose.disconnect();
    process.exit(0);
}

seed().catch(err => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
});
