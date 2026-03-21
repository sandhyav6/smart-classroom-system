// ============================================================
// login.js — Authentication system for Smart Classroom
// Validates credentials against dataStore, manages sessions
// ============================================================

const LoginManager = {
    // ---- Student Login ----
    handleStudentLogin(event) {
        event.preventDefault();

        const regNo = document.getElementById('registration').value.trim().toUpperCase();
        const password = document.getElementById('password').value;

        if (!regNo || !password) {
            Toast.error('Please fill in all fields');
            return false;
        }

        const student = dataStore.authenticateStudent(regNo, password);

        if (student) {
            Session.set({
                role: 'student',
                id: student.id,
                name: student.name,
                department: student.department,
                semester: student.semester,
                cgpa: student.cgpa
            });

            Toast.success(`Welcome, ${student.firstName || student.name}!`);
            setTimeout(() => {
                window.location.href = 'student_dashboard.html';
            }, 800);
        } else {
            // Check if student exists but wrong password
            const exists = dataStore.getStudentById(regNo);
            if (exists) {
                Toast.error('Incorrect password. Try: Pass@123');
            } else {
                Toast.error('Student not found. Check registration number.');
            }
        }
        return false;
    },

    // ---- Faculty Login ----
    handleFacultyLogin(event) {
        event.preventDefault();

        const empId = document.getElementById('employeeid').value.trim();
        const password = document.getElementById('password').value;

        if (!empId || !password) {
            Toast.error('Please fill in all fields');
            return false;
        }

        const faculty = dataStore.authenticateFaculty(empId, password);

        if (faculty) {
            Session.set({
                role: 'faculty',
                id: faculty.id,
                name: faculty.name,
                department: faculty.department,
                subjects: faculty.subjects
            });

            Toast.success(`Welcome, ${faculty.name}!`);
            setTimeout(() => {
                window.location.href = 'faculty_dashboard.html';
            }, 800);
        } else {
            const exists = dataStore.getFacultyById(empId);
            if (exists) {
                Toast.error('Incorrect password. Try: Teach@123');
            } else {
                Toast.error('Faculty not found. Check Employee ID.');
            }
        }
        return false;
    },

    // ---- Show available credentials (demo helper) ----
    showCredentials(role) {
        if (role === 'student') {
            const students = dataStore.getStudents().slice(0, 5);
            let msg = 'Sample Student Credentials:\n\n';
            students.forEach(s => {
                msg += `${s.name}: ${s.id} / Pass@123\n`;
            });
            alert(msg);
        } else {
            const faculty = dataStore.getFaculty().slice(0, 5);
            let msg = 'Sample Faculty Credentials:\n\n';
            faculty.forEach(f => {
                msg += `${f.name}: ${f.id} / Teach@123\n`;
            });
            alert(msg);
        }
    }
};
