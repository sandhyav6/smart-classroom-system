// backend.js - Simulated Database & Logic

// Real Engineering Subjects (8 Sems * 7 Subjects)
const SUBJECTS_DB = {
    "Semester 1": ["CALCULUS FOR ENGINEERS", "ENGINEERING PHYSICS", "ENGINEERING CHEMISTRY", "BASIC ELECTRICAL ENG", "PROBLEM SOLVING & PROG", "ENGLISH FOR ENGINEERS", "ENV. SCIENCE"],
    "Semester 2": ["DIFFERENTIAL EUTATIONS", "DIGITAL LOGIC DESIGN", "DATA STRUCTURES", "ENGINEERING GRAPHICS", "DISCRETE MATHEMATICS", "BASIC ELECTRONICS", "SOFT SKILLS"],
    "Semester 3": ["COMPUTER ARCHITECTURE", "OOP WITH C++", "DATABASE MANAGEMENT", "OPERATING SYSTEMS", "PROBABILITY & STATS", "SYSTEM SOFTWARE", "ETHICS & VALUES"],
    "Semester 4": ["DESIGN & ANALYSIS ALGOS", "THEORY OF COMPUTATION", "JAVA PROGRAMMING", "EMBEDDED SYSTEMS", "COMPUTER NETWORKS", "WEB TECHNOLOGIES", "QUANTITATIVE SKILLS"],
    "Semester 5": ["ARTIFICIAL INTELLIGENCE", "COMPILER DESIGN", "SOFTWARE ENGINEERING", "DATA MINING", "CLOUD COMPUTING", "MOBILE APP DEV", "INTERNET OF THINGS"],
    "Semester 6": ["MACHINE LEARNING", "CRYPTOGRAPHY", "DISTRIBUTED SYSTEMS", "BIG DATA ANALYTICS", "DEEP LEARNING", "IMAGE PROCESSING", "NETWORK SECURITY"],
    "Semester 7": ["NATURAL LANGUAGE PROC", "BLOCKCHAIN TECH", "CYBER SECURITY", "AUGMENTED REALITY", "ROBOTICS", "HUMAN COMP INTERACT", "ENTREPRENEURSHIP"],
    "Semester 8": ["PROJECT WORK PHASE 1", "PROJECT WORK PHASE 2", "INTERNSHIP", "ADVANCED AI", "SATELLITE COMM", "VLSI DESIGN", "COMPREHENSIVE VIVA"]
};

const db = {
    students: {
        "Arjun Sharma": {
            regNo: "21BCE1001",
            cgpa: 9.2,
            messages: [
                { from: "Dr. A. Kumar", course: "CALCULUS FOR ENGINEERS", text: "Please submit your assignment by Friday.", time: "2 hrs ago" },
                { from: "Prof. S. Devi", course: "ENGINEERING PHYSICS", text: "Class cancelled today due to faculty meeting.", time: "1 day ago" }
            ],
            marks: {} // Generated below
        },
        "Vishva": {
            regNo: "21BCE1045",
            cgpa: 8.8,
            messages: [
                { from: "Dr. R. Gupta", course: "CHEMISTRY", text: "Great work on the last lab experiment.", time: "5 hrs ago" }
            ],
            marks: {} // Generated below
        }
    },
    materials: {} // Generated below
};

// Generate Random Marks & Materials
function initData() {
    // 1. Generate Marks
    for (let i = 1; i <= 8; i++) {
        const semKey = `Semester ${i}`;
        const semSubjects = SUBJECTS_DB[semKey];

        // Setup Study Materials Skeleton
        db.materials[semKey] = {};

        for (let name in db.students) {
            db.students[name].marks[semKey] = [];

            semSubjects.forEach(sub => {
                // Marks Generation
                const da1 = Math.floor(Math.random() * 4) + 7;
                const da2 = Math.floor(Math.random() * 4) + 7;
                const da3 = Math.floor(Math.random() * 4) + 7;
                const internal = da1 + da2 + da3;

                const cat1 = Math.floor(Math.random() * 20) + 30;
                const cat2 = Math.floor(Math.random() * 20) + 30;
                const fat = Math.floor(Math.random() * 40) + 50;

                // Simplified Total Logic
                let total = Math.floor(((internal + cat1 + cat2 + fat) / 230) * 100);
                if (total > 100) total = 100;

                let status = "Pass";
                if (Math.random() < 0.05) status = "Fail"; // 5% chance fail
                if (Math.random() < 0.02) status = "Malpractice"; // 2% chance malpractice

                if (status === "Fail") {
                    db.students[name].marks[semKey].push({
                        code: sub.substring(0, 3) + "1001", name: sub,
                        da1: 0, da2: 0, da3: 0, internal: 0, cat1: "Absent", cat2: 20, fat: 30,
                        total: 25, grade: "F", remarks: "Re-appear"
                    });
                } else if (status === "Malpractice") {
                    db.students[name].marks[semKey].push({
                        code: sub.substring(0, 3) + "1001", name: sub,
                        da1: "-", da2: "-", da3: "-", internal: "-", cat1: "-", cat2: "-", fat: "-",
                        total: 0, grade: "N", remarks: "Debarred"
                    });
                } else {
                    db.students[name].marks[semKey].push({
                        code: sub.substring(0, 3) + "1001", name: sub,
                        da1, da2, da3, internal, cat1, cat2, fat,
                        total, grade: Backend.calculateGrade(total), remarks: "Good"
                    });
                }

                // Materials Generation (Once per subject)
                if (!db.materials[semKey][sub]) {
                    db.materials[semKey][sub] = {};
                    for (let m = 1; m <= 7; m++) { // 7 Modules
                        db.materials[semKey][sub][`Module ${m}`] = [
                            { name: "Lecture_Notes.pdf", type: "pdf" },
                            { name: "Reference_Material.docx", type: "docx" },
                            { name: "Unit_Presentation.pptx", type: "pptx" }
                        ];
                    }
                }
            });
        }
    }
}

const Backend = {
    calculateGrade(score) {
        if (score >= 90) return "S";
        if (score >= 80) return "A";
        if (score >= 69) return "B";
        if (score >= 64) return "C";
        if (score >= 59) return "D";
        if (score >= 50) return "E";
        return "F";
    },

    getStudent(name) {
        const key = Object.keys(db.students).find(k => name.toLowerCase().includes(k.toLowerCase().split(' ')[0]));
        return db.students[key || "Arjun Sharma"];
    },

    getMaterials(sem, sub, mod) {
        if (!sem) return Object.keys(db.materials); // Return list of sems
        if (!sub) return Object.keys(db.materials[sem] || {}); // Return list of subjects
        if (!mod) return Object.keys(db.materials[sem][sub] || {}); // Return list of modules
        return db.materials[sem][sub][mod] || []; // Return files
    },

    // Teachers Mock (Simplified)
    getTeachers(sem) {
        return [
            { name: "Dr. Faculty 1", subject: "Subject 1", online: true, photo: "teacher_profile.png" },
            { name: "Prof. Faculty 2", subject: "Subject 2", online: false, photo: "teacher_profile.png" }
        ];
    },
    simulateResponse(name, cb) {
        setTimeout(() => cb("Typing..."), 500);
        setTimeout(() => cb("Hello! I received your message."), 1500);
    }
};

initData();
