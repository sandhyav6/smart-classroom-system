// ============================================================
// routes/materials.js — File upload + material listing endpoints
// ============================================================
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Material = require('../models/Material');

// ---- Multer config ----
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, uniqueSuffix + ext);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
    fileFilter: (req, file, cb) => {
        const allowed = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx', '.txt', '.zip', '.rar', '.png', '.jpg', '.jpeg'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowed.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('File type not allowed. Allowed: ' + allowed.join(', ')));
        }
    }
});

// ---- Subjects DB (for listing available subjects per semester) ----
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

// POST /api/materials/upload — Upload a file
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const { semester, subject, module: mod, uploadedBy } = req.body;
        if (!semester || !subject) {
            return res.status(400).json({ error: 'Semester and subject are required' });
        }

        const material = new Material({
            semester,
            subject,
            module: mod || 'General',
            fileName: req.file.filename,
            originalName: req.file.originalname,
            filePath: req.file.path,
            fileType: path.extname(req.file.originalname).replace('.', ''),
            fileSize: req.file.size,
            uploadedBy: uploadedBy || 'unknown'
        });

        await material.save();
        res.status(201).json({ success: true, material });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/materials/:sem — Get subjects list OR uploaded files
router.get('/:sem/:sub?/:mod?', async (req, res) => {
    try {
        const sem = decodeURIComponent(req.params.sem);
        const sub = req.params.sub ? decodeURIComponent(req.params.sub) : null;
        const mod = req.params.mod ? decodeURIComponent(req.params.mod) : null;

        if (!sub) {
            // Return list of subjects for this semester
            res.json(SUBJECTS_DB[sem] || []);
            return;
        }

        if (!mod) {
            // Return list of modules (static + ones that have uploads)
            const modules = [];
            for (let m = 1; m <= 7; m++) modules.push(`Module ${m}`);
            res.json(modules);
            return;
        }

        // Return uploaded files for this semester/subject/module from MongoDB
        const files = await Material.find({ semester: sem, subject: sub, module: mod })
            .sort({ uploadDate: -1 });

        res.json(files.map(f => ({
            _id: f._id,
            name: f.originalName,
            type: f.fileType,
            fileName: f.fileName,
            fileSize: f.fileSize,
            uploadedBy: f.uploadedBy,
            uploadDate: f.uploadDate
        })));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/materials/download/:id — Download a file
router.get('/download/:id', async (req, res) => {
    try {
        const material = await Material.findById(req.params.id);
        if (!material) return res.status(404).json({ error: 'File not found' });

        const filePath = material.filePath;
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'File no longer exists on server' });
        }

        res.download(filePath, material.originalName);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
