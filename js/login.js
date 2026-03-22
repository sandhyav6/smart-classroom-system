// ============================================================
// login.js — Authentication system for Smart Classroom
// Uses backend API endpoints exclusively — NO localStorage
// NO Session.set() — session is managed entirely by backend
// ============================================================

const LoginManager = {
    // ---- Student Login ----
    async handleStudentLogin(event) {
        event.preventDefault();

        const regNo = document.getElementById('registration').value.trim().toUpperCase();
        const password = document.getElementById('password').value;

        if (!regNo || !password) {
            Toast.error('Please fill in all fields');
            return false;
        }

        try {
            const result = await dataStore.authenticateStudent(regNo, password);

            if (result) {
                // Backend already set the session cookie — load from server
                await Session.load();

                Toast.success(`Welcome, ${result.firstName || result.name}!`);
                setTimeout(() => {
                    window.location.href = 'student_dashboard.html';
                }, 800);
            } else {
                Toast.error('Invalid credentials. Please check your registration number and password.');
            }
        } catch (err) {
            Toast.error('Login failed. Is the server running?');
            console.error('Login error:', err);
        }
        return false;
    },

    // ---- Faculty Login ----
    async handleFacultyLogin(event) {
        event.preventDefault();

        const empId = document.getElementById('employeeid').value.trim();
        const password = document.getElementById('password').value;

        if (!empId || !password) {
            Toast.error('Please fill in all fields');
            return false;
        }

        try {
            const result = await dataStore.authenticateFaculty(empId, password);

            if (result) {
                // Backend already set the session cookie — load from server
                await Session.load();

                Toast.success(`Welcome, ${result.name}!`);
                setTimeout(() => {
                    window.location.href = 'faculty_dashboard.html';
                }, 800);
            } else {
                Toast.error('Invalid credentials. Please check your Employee ID and password.');
            }
        } catch (err) {
            Toast.error('Login failed. Is the server running?');
            console.error('Login error:', err);
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
