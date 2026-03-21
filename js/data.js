// ============================================================
// data.js — Centralized Data Store for Smart Classroom System
// All data persisted via localStorage
// ============================================================

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

// ---- Name pools for generating realistic Indian names ----
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

// ---- Faculty data ----
const FACULTY_TITLES = ["Dr.", "Prof.", "Dr.", "Prof.", "Dr."];
const FACULTY_SUBJECTS_MAP = [
    { name: "Dr. Priya Singh", empId: "10001", dept: "CSE", subjects: ["Data Structures", "Algorithms"], email: "priya.singh@vit.ac.in" },
    { name: "Prof. Ramesh Kumar", empId: "10002", dept: "CSE", subjects: ["Database Management", "Web Technologies"], email: "ramesh.kumar@vit.ac.in" },
    { name: "Dr. Anitha Menon", empId: "10003", dept: "CSE", subjects: ["Operating Systems", "Computer Networks"], email: "anitha.menon@vit.ac.in" },
    { name: "Prof. Suresh Iyer", empId: "10004", dept: "CSE", subjects: ["Machine Learning", "Artificial Intelligence"], email: "suresh.iyer@vit.ac.in" },
    { name: "Dr. Kavitha Rao", empId: "10005", dept: "ECE", subjects: ["Digital Logic Design", "Embedded Systems"], email: "kavitha.rao@vit.ac.in" },
    { name: "Prof. Arun Sharma", empId: "10006", dept: "CSE", subjects: ["Compiler Design", "Theory of Computation"], email: "arun.sharma@vit.ac.in" },
    { name: "Dr. Meena Patel", empId: "10007", dept: "CSE", subjects: ["Software Engineering", "Cloud Computing"], email: "meena.patel@vit.ac.in" },
    { name: "Prof. Vijay Reddy", empId: "10008", dept: "MECH", subjects: ["Engineering Graphics", "Engineering Physics"], email: "vijay.reddy@vit.ac.in" },
    { name: "Dr. Lakshmi Nair", empId: "10009", dept: "CSE", subjects: ["Cryptography", "Network Security"], email: "lakshmi.nair@vit.ac.in" },
    { name: "Prof. Kiran Desai", empId: "10010", dept: "CSE", subjects: ["Deep Learning", "Image Processing"], email: "kiran.desai@vit.ac.in" },
    { name: "Dr. Sunita Gupta", empId: "10011", dept: "CSE", subjects: ["Big Data Analytics", "Data Mining"], email: "sunita.gupta@vit.ac.in" },
    { name: "Prof. Mohan Verma", empId: "10012", dept: "ECE", subjects: ["VLSI Design", "Satellite Comm"], email: "mohan.verma@vit.ac.in" },
    { name: "Dr. Rekha Joshi", empId: "10013", dept: "CSE", subjects: ["Blockchain Tech", "Cyber Security"], email: "rekha.joshi@vit.ac.in" },
    { name: "Prof. Ganesh Pillai", empId: "10014", dept: "CSE", subjects: ["NLP", "Robotics"], email: "ganesh.pillai@vit.ac.in" },
    { name: "Dr. Deepa Krishnan", empId: "10015", dept: "CSE", subjects: ["Mobile App Dev", "IoT"], email: "deepa.krishnan@vit.ac.in" },
    { name: "Prof. Harish Mehta", empId: "10016", dept: "CSE", subjects: ["Java Programming", "OOP with C++"], email: "harish.mehta@vit.ac.in" }
];

// ---- Seeded random for consistency ----
class SeededRandom {
    constructor(seed = 42) {
        this.seed = seed;
    }
    next() {
        this.seed = (this.seed * 16807) % 2147483647;
        return (this.seed - 1) / 2147483646;
    }
    nextInt(min, max) {
        return Math.floor(this.next() * (max - min + 1)) + min;
    }
}

// ============================================================
// DataStore — Central data management class
// ============================================================
class DataStore {
    constructor() {
        this.storageKey = 'vit_smart_classroom';
        this.initialized = false;
    }

    // ---- Initialize or load ----
    init() {
        const existing = localStorage.getItem(this.storageKey);
        if (existing) {
            try {
                this.data = JSON.parse(existing);
                this.initialized = true;
                return;
            } catch (e) {
                console.warn('Corrupted localStorage data, reinitializing...');
            }
        }
        this._generateAllData();
        this._save();
        this.initialized = true;
    }

    // ---- Persist to localStorage ----
    _save() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    }

    // ---- Reset all data ----
    resetAll() {
        localStorage.removeItem(this.storageKey);
        this._generateAllData();
        this._save();
    }

    // ============================================================
    // DATA GENERATION
    // ============================================================
    _generateAllData() {
        const rng = new SeededRandom(2026);
        this.data = {
            students: [],
            faculty: [],
            assignments: [],
            attendance: {},    // { studentId: { 'Semester X': { subjectName: { attended: [...], missed: [...] } } } }
            marks: {},         // { studentId: { 'Semester X': [ { code, name, da1..., grade } ] } }
            submissions: {},   // { studentId: { assignmentId: { file, date } } }
            materials: {},
            timetable: {},
            chatMessages: {},
            reminders: []
        };

        this._generateStudents(rng);
        this._generateFaculty();
        this._generateAssignments();
        this._generateAttendance(rng);
        this._generateMarks(rng);
        this._generateMaterials();
        this._generateTimetable();
        this._generateReminders();
    }

    // ---- Students (55 total) ----
    _generateStudents(rng) {
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

            this.data.students.push({
                id: regNo,
                name: fullName,
                firstName,
                lastName,
                email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@vit.ac.in`,
                department: dept,
                semester,
                section,
                cgpa: parseFloat(cgpa),
                password: "Pass@123",
                phone: `+91 ${rng.nextInt(70000, 99999)}${rng.nextInt(10000, 99999)}`,
                joinYear: 2000 + year,
                active: true
            });
        }
    }

    // ---- Faculty (16 total) ----
    _generateFaculty() {
        this.data.faculty = FACULTY_SUBJECTS_MAP.map(f => ({
            id: f.empId,
            name: f.name,
            email: f.email,
            department: f.dept,
            subjects: f.subjects,
            password: "Teach@123",
            phone: `+91 98765${f.empId.slice(-5)}`,
            designation: f.name.startsWith("Dr.") ? "Associate Professor" : "Assistant Professor",
            active: true,
            classes: []
        }));

        // Assign classes to faculty
        const sections = ["CSE-2A", "CSE-2B", "CSE-3A"];
        const classSubjects = {
            "CSE-2A": "Data Structures",
            "CSE-2B": "Algorithms",
            "CSE-3A": "Database Systems"
        };
        this.data.faculty[0].classes = [{ section: "CSE-2A", subject: "Data Structures" }, { section: "CSE-2B", subject: "Algorithms" }];
        this.data.faculty[1].classes = [{ section: "CSE-3A", subject: "Database Systems" }];
        this.data.faculty[2].classes = [{ section: "CSE-2A", subject: "Operating Systems" }];
    }

    // ---- Assignments (25 total) ----
    _generateAssignments() {
        const assignmentTemplates = [
            { title: "Binary Search Tree Implementation", course: "Data Structures", courseCode: "CSE201", desc: "Implement BST with insertion, deletion, and traversal operations in C.", detailed: "Create a complete binary search tree implementation in C. Include:\n• Node structure with left, right pointers and data\n• Insert, Delete (all cases), Search operations\n• Inorder, Preorder, Postorder traversals\n• Display function\nSubmit a single .c file with test cases." },
            { title: "Linear Algebra Problem Set", course: "Linear Algebra", courseCode: "MAT201", desc: "Solve problems on eigenvalues, eigenvectors, and matrix transformations.", detailed: "Complete Chapter 5 problems:\n1. Eigenvalues and eigenvectors for 3x3 matrices\n2. Diagonalizability check\n3. Matrix transformations\n4. Eigenspace proofs\nShow all work. Box final answers. Submit as PDF." },
            { title: "Digital Logic Circuit Design", course: "Digital Logic Design", courseCode: "CSE202", desc: "Design a 4-bit ALU using logic gates.", detailed: "Design a 4-bit ALU for ADD, SUB, AND, OR, NOT, XOR.\nRequirements:\n1. Complete circuit diagram\n2. Truth tables\n3. Logisim simulation\n4. Mode selection bits\n5. Overflow and zero flags\nSubmit circuit diagram, truth tables, and .circ file." },
            { title: "Ethics Case Study Analysis", course: "Ethics and Values", courseCode: "HUM201", desc: "Analyze ethical implications of AI in healthcare.", detailed: "Write a 1500-2000 word essay on AI ethics in healthcare.\nCover:\n• Patient privacy\n• Algorithm bias\n• Accountability\n• AI vs human judgment\n• Informed consent\nUse 5+ academic sources. APA format." },
            { title: "Programming Assignment 3", course: "Programming in C", courseCode: "CSE101", desc: "File handling and structure manipulation in C.", detailed: "Create a student record management system in C using file handling and structures.\nFeatures: Add, Display, Search, Update, Delete records, Class average, File I/O." },
            { title: "Calculus Integration Problems", course: "Calculus", courseCode: "MAT101", desc: "Solve definite and indefinite integration problems.", detailed: "Complete Chapter 6:\n• Problems 6.1-6.15: Substitution\n• Problems 6.16-6.25: Integration by parts\n• Problems 6.26-6.35: Definite integrals\n• Problems 6.36-6.40: Volume/arc length\nShow complete steps." },
            { title: "OOP Concepts in Java", course: "Object-Oriented Programming", courseCode: "CSE301", desc: "Implement inheritance and polymorphism in Java.", detailed: "Design Vehicle base class with Car, Bike, Truck derived classes.\nImplement method overriding, polymorphism, constructors, and encapsulation.\nSubmit .java files with documentation." },
            { title: "Database Normalization", course: "Database Management Systems", courseCode: "CSE302", desc: "Normalize a database schema to 3NF.", detailed: "Given a library management schema:\n• Identify functional dependencies\n• Convert to 1NF, 2NF, 3NF\n• Draw ER diagrams\n• Write SQL DDL\nSubmit PDF with all steps." },
            { title: "OS Process Scheduling", course: "Operating Systems", courseCode: "CSE303", desc: "Implement CPU scheduling algorithms.", detailed: "Simulate FCFS, SJF, Round Robin, Priority scheduling.\nCalculate average waiting/turnaround time.\nGenerate Gantt charts.\nTest with 5+ processes." },
            { title: "Network Protocol Analysis", course: "Computer Networks", courseCode: "CSE304", desc: "Analyze TCP/IP packets using Wireshark.", detailed: "Capture HTTP, HTTPS, DNS traffic.\nAnalyze TCP three-way handshake.\nDocument protocol behavior.\nSubmit .pcap files and analysis report." },
            { title: "Machine Learning Model", course: "Machine Learning", courseCode: "CSE501", desc: "Build a classification model using scikit-learn.", detailed: "Build a classifier for the Iris dataset.\nTry at least 3 algorithms.\nCompare accuracy, precision, recall.\nSubmit Jupyter notebook." },
            { title: "Sorting Algorithm Analysis", course: "Data Structures", courseCode: "CSE201", desc: "Implement and compare sorting algorithms.", detailed: "Implement Bubble, Selection, Insertion, Merge, Quick sort.\nCompare time complexity with actual measurements.\nPlot graphs. Submit code and analysis." },
            { title: "Graph Algorithms Lab", course: "Data Structures", courseCode: "CSE201", desc: "Implement BFS, DFS, and Dijkstra's algorithm.", detailed: "Implement BFS, DFS, Dijkstra's for weighted graphs.\nHandle both adjacency matrix and list.\nSubmit C/C++ code with test cases." },
            { title: "SQL Query Optimization", course: "Database Management Systems", courseCode: "CSE302", desc: "Optimize complex SQL queries.", detailed: "Given 10 unoptimized queries:\n1. Analyze execution plans\n2. Add appropriate indexes\n3. Rewrite for performance\n4. Document improvements\nSubmit SQL file and report." },
            { title: "Web Application Project", course: "Web Technologies", courseCode: "CSE401", desc: "Build a full-stack web application.", detailed: "Create a todo list web app with HTML, CSS, JavaScript.\nFeatures: CRUD operations, localStorage, responsive design.\nSubmit all source files." },
            { title: "Linked List Operations", course: "Data Structures", courseCode: "CSE201", desc: "Implement singly and doubly linked lists.", detailed: "Implement singly and doubly linked lists with:\n• Insert at beginning/end/position\n• Delete by value/position\n• Search, Reverse, Display\nSubmit .c file." },
            { title: "Python Data Analysis", course: "Data Mining", courseCode: "CSE502", desc: "Analyze a real-world dataset using pandas.", detailed: "Use the Titanic dataset:\n1. Clean data\n2. Exploratory analysis\n3. Visualizations\n4. Statistical insights\nSubmit Jupyter notebook." },
            { title: "Cloud Deployment Lab", course: "Cloud Computing", courseCode: "CSE503", desc: "Deploy an app on AWS/GCP.", detailed: "Deploy a simple web app on any cloud platform.\nDocument:\n1. Architecture diagram\n2. Deployment steps\n3. Screenshots\n4. Cost analysis\nSubmit report." },
            { title: "IoT Sensor Project", course: "Internet of Things", courseCode: "CSE504", desc: "Build an IoT temperature monitoring system.", detailed: "Design a temperature monitoring system using sensors.\nComponents: Sensor, microcontroller, display.\nDocument circuit diagram and code.\nSubmit report and code." },
            { title: "Compiler Design Lab", course: "Compiler Design", courseCode: "CSE505", desc: "Build a lexical analyzer.", detailed: "Build a lexical analyzer for a subset of C.\nTokenize keywords, identifiers, operators, literals.\nSubmit C/Java code and test cases." },
            { title: "Software Requirements Doc", course: "Software Engineering", courseCode: "CSE506", desc: "Write an SRS document for a project.", detailed: "Write a complete SRS document for an online library system.\nInclude functional/non-functional requirements, use cases, UML diagrams.\nFollow IEEE 830 format." },
            { title: "Cybersecurity Case Study", course: "Cyber Security", courseCode: "CSE601", desc: "Analyze a recent cybersecurity breach.", detailed: "Choose a recent data breach.\nAnalyze:\n1. Attack vector\n2. Impact\n3. Response\n4. Prevention measures\nWrite a 2000-word report." },
            { title: "Deep Learning CNN Project", course: "Deep Learning", courseCode: "CSE602", desc: "Build a CNN for image classification.", detailed: "Build a CNN using TensorFlow/Pytorch for CIFAR-10.\nArchitecture: Conv, Pool, Dense layers.\nReport accuracy and loss curves.\nSubmit notebook." },
            { title: "NLP Text Classification", course: "Natural Language Processing", courseCode: "CSE701", desc: "Build a sentiment analysis model.", detailed: "Build a sentiment classifier for movie reviews.\nTry bag-of-words, TF-IDF, and word embeddings.\nCompare results. Submit notebook." },
            { title: "Blockchain Smart Contract", course: "Blockchain Technology", courseCode: "CSE702", desc: "Write a Solidity smart contract.", detailed: "Write a simple voting smart contract in Solidity.\nDeploy on a testnet.\nDocument deployment steps.\nSubmit code and screenshots." }
        ];

        const baseDates = [
            "2026-04-05", "2026-04-08", "2026-04-10", "2026-04-12", "2026-03-10",
            "2026-03-05", "2026-02-20", "2026-02-18", "2026-02-15", "2026-02-10",
            "2026-04-15", "2026-04-18", "2026-04-20", "2026-04-22", "2026-04-25",
            "2026-03-25", "2026-04-28", "2026-04-30", "2026-05-02", "2026-05-05",
            "2026-05-08", "2026-03-15", "2026-05-10", "2026-05-12", "2026-05-15"
        ];

        this.data.assignments = assignmentTemplates.map((t, i) => ({
            id: i + 1,
            title: t.title,
            course: t.course,
            courseCode: t.courseCode,
            dueDate: baseDates[i],
            shortDescription: t.desc,
            detailedDescription: t.detailed,
            createdBy: this.data.faculty[i % this.data.faculty.length]?.id || "10001",
            completed: new Date(baseDates[i]) < new Date("2026-03-21"),
            maxMarks: 100
        }));
    }

    // ---- Attendance ----
    _generateAttendance(rng) {
        const months = ["2026-01", "2026-02", "2026-03"];
        this.data.students.forEach(student => {
            this.data.attendance[student.id] = {};
            const semKey = `Semester ${student.semester}`;
            const subjects = SUBJECTS_DB[semKey] || SUBJECTS_DB["Semester 1"];
            this.data.attendance[student.id][semKey] = {};

            subjects.forEach(subName => {
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

                this.data.attendance[student.id][semKey][subName] = {
                    code: subName.substring(0, 3).toUpperCase() + "1001",
                    attended: attendedDates.length,
                    total: totalDays,
                    attendedDates,
                    missedDates
                };
            });
        });
    }

    // ---- Marks ----
    _generateMarks(rng) {
        this.data.students.forEach(student => {
            this.data.marks[student.id] = {};
            for (let sem = 1; sem <= 8; sem++) {
                const semKey = `Semester ${sem}`;
                const subjects = SUBJECTS_DB[semKey];
                this.data.marks[student.id][semKey] = [];

                subjects.forEach(subName => {
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
                    let grade = this._calcGrade(total);
                    let remarks = "Good";

                    if (rng.next() < 0.04) {
                        status = "Fail";
                        grade = "F";
                        remarks = "Re-appear";
                    }

                    this.data.marks[student.id][semKey].push({
                        code: subName.substring(0, 3).toUpperCase() + "1001",
                        name: subName,
                        da1, da2, da3, internal,
                        cat1, cat2, fat,
                        total, grade, remarks, status
                    });
                });
            }
        });
    }

    _calcGrade(score) {
        if (score >= 90) return "S";
        if (score >= 80) return "A";
        if (score >= 69) return "B";
        if (score >= 64) return "C";
        if (score >= 59) return "D";
        if (score >= 50) return "E";
        return "F";
    }

    // ---- Materials ----
    _generateMaterials() {
        for (let sem = 1; sem <= 8; sem++) {
            const semKey = `Semester ${sem}`;
            this.data.materials[semKey] = {};
            SUBJECTS_DB[semKey].forEach(sub => {
                this.data.materials[semKey][sub] = {};
                for (let m = 1; m <= 7; m++) {
                    this.data.materials[semKey][sub][`Module ${m}`] = [
                        { name: "Lecture_Notes.pdf", type: "pdf" },
                        { name: "Reference_Material.docx", type: "docx" },
                        { name: "Unit_Presentation.pptx", type: "pptx" }
                    ];
                }
            });
        }
    }

    // ---- Timetable ----
    _generateTimetable() {
        this.data.timetable = {
            'Semester 1': {
                schedule: {
                    '09:00 - 09:50': { Mon: { code: 'CSE101', name: 'Programming in C', location: 'AB1-201' }, Tue: null, Wed: { code: 'CSE101', name: 'Programming in C', location: 'AB1-201' }, Thu: null, Fri: { code: 'CSE101', name: 'Programming in C', location: 'AB1-201' } },
                    '10:00 - 10:50': { Mon: { code: 'MAT101', name: 'Calculus', location: 'AB2-105' }, Tue: { code: 'MAT101', name: 'Calculus', location: 'AB2-105' }, Wed: null, Thu: { code: 'MAT101', name: 'Calculus', location: 'AB2-105' }, Fri: null },
                    '11:00 - 11:50': { Mon: { code: 'PHY101', name: 'Physics', location: 'TB-304' }, Tue: null, Wed: { code: 'PHY101', name: 'Physics', location: 'TB-304' }, Thu: { code: 'PHY101', name: 'Physics', location: 'TB-304' }, Fri: null },
                    '13:00 - 13:50': { Mon: null, Tue: { code: 'CSE101L', name: 'C Lab', location: 'Lab-105' }, Wed: null, Thu: { code: 'PHY101L', name: 'Physics Lab', location: 'Lab-201' }, Fri: null },
                    '14:00 - 14:50': { Mon: { code: 'ENG101', name: 'English', location: 'MB-102' }, Tue: null, Wed: { code: 'ENG101', name: 'English', location: 'MB-102' }, Thu: null, Fri: { code: 'ENG101', name: 'English', location: 'MB-102' } },
                    '15:00 - 15:50': { Mon: null, Tue: { code: 'CSE101L', name: 'C Lab', location: 'Lab-105' }, Wed: null, Thu: { code: 'PHY101L', name: 'Physics Lab', location: 'Lab-201' }, Fri: null }
                }
            },
            'Semester 2': {
                schedule: {
                    '09:00 - 09:50': { Mon: { code: 'CSE201', name: 'Data Structures', location: 'AB1-301' }, Tue: null, Wed: { code: 'CSE201', name: 'Data Structures', location: 'AB1-301' }, Thu: null, Fri: { code: 'CSE201', name: 'Data Structures', location: 'AB1-301' } },
                    '10:00 - 10:50': { Mon: { code: 'MAT201', name: 'Linear Algebra', location: 'AB2-201' }, Tue: { code: 'MAT201', name: 'Linear Algebra', location: 'AB2-201' }, Wed: null, Thu: { code: 'MAT201', name: 'Linear Algebra', location: 'AB2-201' }, Fri: null },
                    '11:00 - 11:50': { Mon: null, Tue: { code: 'CSE202', name: 'Digital Logic', location: 'TB-404' }, Wed: { code: 'CSE202', name: 'Digital Logic', location: 'TB-404' }, Thu: null, Fri: { code: 'CSE202', name: 'Digital Logic', location: 'TB-404' } },
                    '14:00 - 14:50': { Mon: { code: 'HUM201', name: 'Ethics', location: 'MB-202' }, Tue: null, Wed: null, Thu: { code: 'HUM201', name: 'Ethics', location: 'MB-202' }, Fri: null }
                }
            }
        };

        // Faculty timetable
        this.data.facultyTimetable = [
            { time: '09:00 - 09:50', subject: 'Data Structures', section: 'CSE-2A', room: 'AB1-201' },
            { time: '11:00 - 11:50', subject: 'Algorithms', section: 'CSE-2B', room: 'AB1-205' },
            { time: '14:00 - 14:50', subject: 'Database Systems', section: 'CSE-3A', room: 'TB-304' }
        ];
    }

    // ---- Reminders (faculty) ----
    _generateReminders() {
        this.data.reminders = [
            { id: 1, title: 'Submit Final Exam Questions', date: '2026-04-05', description: 'Deadline for all faculty to submit final exam questions.', facultyId: '10001' },
            { id: 2, title: 'Faculty Meeting', date: '2026-03-25', description: 'Monthly faculty meeting in Conference Hall A at 10:00 AM.', facultyId: '10001' },
            { id: 3, title: 'Grade Submissions', date: '2026-04-10', description: 'Submit CAT1 grades for all sections.', facultyId: '10001' },
            { id: 4, title: 'Research Paper Review', date: '2026-04-08', description: 'Complete review of submitted research papers.', facultyId: '10001' },
            { id: 5, title: 'Curriculum Planning Meeting', date: '2026-04-15', description: 'Curriculum revision meeting for next academic year.', facultyId: '10001' }
        ];
    }

    // ============================================================
    // STUDENT CRUD
    // ============================================================
    getStudents() { return this.data.students; }

    getStudentById(id) {
        return this.data.students.find(s => s.id === id);
    }

    getStudentByName(name) {
        const key = this.data.students.find(s =>
            name.toLowerCase().includes(s.firstName.toLowerCase()) ||
            s.name.toLowerCase() === name.toLowerCase()
        );
        return key || this.data.students[0];
    }

    addStudent(student) {
        this.data.students.push(student);
        this._save();
    }

    updateStudent(id, updates) {
        const idx = this.data.students.findIndex(s => s.id === id);
        if (idx !== -1) {
            this.data.students[idx] = { ...this.data.students[idx], ...updates };
            this._save();
        }
    }

    deleteStudent(id) {
        this.data.students = this.data.students.filter(s => s.id !== id);
        delete this.data.attendance[id];
        delete this.data.marks[id];
        delete this.data.submissions[id];
        this._save();
    }

    searchStudents(query) {
        const q = query.toLowerCase();
        return this.data.students.filter(s =>
            s.name.toLowerCase().includes(q) ||
            s.id.toLowerCase().includes(q) ||
            s.department.toLowerCase().includes(q)
        );
    }

    // ============================================================
    // FACULTY CRUD
    // ============================================================
    getFaculty() { return this.data.faculty; }

    getFacultyById(id) {
        return this.data.faculty.find(f => f.id === id);
    }

    searchFaculty(query) {
        const q = query.toLowerCase();
        return this.data.faculty.filter(f =>
            f.name.toLowerCase().includes(q) ||
            f.id.toLowerCase().includes(q) ||
            f.subjects.some(s => s.toLowerCase().includes(q))
        );
    }

    // ============================================================
    // AUTHENTICATION
    // ============================================================
    authenticateStudent(regNo, password) {
        return this.data.students.find(s => s.id === regNo && s.password === password);
    }

    authenticateFaculty(empId, password) {
        return this.data.faculty.find(f => f.id === empId && f.password === password);
    }

    // ============================================================
    // ATTENDANCE
    // ============================================================
    getAttendance(studentId, semester) {
        if (!this.data.attendance[studentId]) return null;
        if (semester) return this.data.attendance[studentId][semester];
        return this.data.attendance[studentId];
    }

    updateAttendance(studentId, semester, subjectName, date, present) {
        if (!this.data.attendance[studentId]) return;
        if (!this.data.attendance[studentId][semester]) return;
        const subData = this.data.attendance[studentId][semester][subjectName];
        if (!subData) return;

        if (present) {
            if (!subData.attendedDates.includes(date)) subData.attendedDates.push(date);
            subData.missedDates = subData.missedDates.filter(d => d !== date);
        } else {
            if (!subData.missedDates.includes(date)) subData.missedDates.push(date);
            subData.attendedDates = subData.attendedDates.filter(d => d !== date);
        }
        subData.attended = subData.attendedDates.length;
        subData.total = subData.attendedDates.length + subData.missedDates.length;
        this._save();
    }

    // Get students for a class section (for faculty attendance)
    getStudentsBySection(section) {
        const sectionLetter = section.split('-')[1]?.charAt(section.split('-')[1].length - 1);
        return this.data.students.filter(s => {
            if (section === "CSE-2A") return s.section === "A" && s.department === "CSE";
            if (section === "CSE-2B") return s.section === "B" && s.department === "CSE";
            if (section === "CSE-3A") return s.section === "C" && s.department === "CSE";
            return false;
        });
    }

    // ============================================================
    // MARKS
    // ============================================================
    getMarks(studentId, semester) {
        if (!this.data.marks[studentId]) return [];
        if (semester) return this.data.marks[studentId][semester] || [];
        return this.data.marks[studentId];
    }

    updateMarks(studentId, semester, subjectCode, field, value) {
        const marks = this.data.marks[studentId]?.[semester];
        if (!marks) return;
        const subject = marks.find(m => m.code === subjectCode);
        if (subject) {
            subject[field] = value;
            // Recalculate total and grade
            if (['da1', 'da2', 'da3', 'cat1', 'cat2', 'fat'].includes(field)) {
                subject.internal = (subject.da1 || 0) + (subject.da2 || 0) + (subject.da3 || 0);
                let total = Math.floor(((subject.internal + (subject.cat1 || 0) + (subject.cat2 || 0) + (subject.fat || 0)) / 230) * 100);
                if (total > 100) total = 100;
                subject.total = total;
                subject.grade = this._calcGrade(total);
                subject.remarks = subject.grade === "F" ? "Re-appear" : "Good";
            }
            this._save();
        }
    }

    // ============================================================
    // ASSIGNMENTS
    // ============================================================
    getAssignments() { return this.data.assignments; }

    getAssignmentById(id) {
        return this.data.assignments.find(a => a.id === id);
    }

    getAssignmentsByCourse(course) {
        if (!course || course === "All") return this.data.assignments;
        return this.data.assignments.filter(a => a.course === course);
    }

    addAssignment(assignment) {
        const newId = this.data.assignments.length > 0 ?
            Math.max(...this.data.assignments.map(a => a.id)) + 1 : 1;
        assignment.id = newId;
        this.data.assignments.push(assignment);
        this._save();
        return assignment;
    }

    updateAssignment(id, updates) {
        const idx = this.data.assignments.findIndex(a => a.id === id);
        if (idx !== -1) {
            this.data.assignments[idx] = { ...this.data.assignments[idx], ...updates };
            this._save();
        }
    }

    deleteAssignment(id) {
        this.data.assignments = this.data.assignments.filter(a => a.id !== id);
        this._save();
    }

    // ============================================================
    // SUBMISSIONS
    // ============================================================
    getSubmission(studentId, assignmentId) {
        return this.data.submissions[studentId]?.[assignmentId];
    }

    submitAssignment(studentId, assignmentId, fileName) {
        if (!this.data.submissions[studentId]) {
            this.data.submissions[studentId] = {};
        }
        this.data.submissions[studentId][assignmentId] = {
            file: fileName,
            date: new Date().toISOString().split('T')[0],
            status: 'submitted'
        };
        this._save();
    }

    // ============================================================
    // MATERIALS
    // ============================================================
    getMaterials(sem, sub, mod) {
        if (!sem) return Object.keys(this.data.materials);
        if (!sub) return Object.keys(this.data.materials[sem] || {});
        if (!mod) return Object.keys(this.data.materials[sem]?.[sub] || {});
        return this.data.materials[sem]?.[sub]?.[mod] || [];
    }

    // ============================================================
    // TIMETABLE
    // ============================================================
    getTimetable(semester) {
        return this.data.timetable[semester];
    }

    getFacultyTimetable() {
        return this.data.facultyTimetable || [];
    }

    // ============================================================
    // REMINDERS
    // ============================================================
    getReminders(facultyId) {
        return this.data.reminders.filter(r => !facultyId || r.facultyId === facultyId);
    }

    addReminder(reminder) {
        const newId = this.data.reminders.length > 0 ?
            Math.max(...this.data.reminders.map(r => r.id)) + 1 : 1;
        reminder.id = newId;
        this.data.reminders.push(reminder);
        this._save();
        return reminder;
    }

    deleteReminder(id) {
        this.data.reminders = this.data.reminders.filter(r => r.id !== id);
        this._save();
    }

    // ============================================================
    // CHAT
    // ============================================================
    getChatMessages(userId) {
        return this.data.chatMessages[userId] || [];
    }

    addChatMessage(userId, message) {
        if (!this.data.chatMessages[userId]) {
            this.data.chatMessages[userId] = [];
        }
        this.data.chatMessages[userId].push({
            ...message,
            timestamp: new Date().toISOString()
        });
        this._save();
    }
}

// ---- Global instance ----
const dataStore = new DataStore();
dataStore.init();
