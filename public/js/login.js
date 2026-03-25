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

                // If redirected here from QR scan (or any other page), go back there
                const params = new URLSearchParams(window.location.search);
                const returnUrl = params.get('returnUrl');
                setTimeout(() => {
                    window.location.href = returnUrl ? decodeURIComponent(returnUrl) : 'student_dashboard.html';
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
        const modal = document.getElementById('credentials-modal');
        const credList = document.getElementById('credentials-list');
        const modalTitle = document.getElementById('modal-title');
        
        if (role === 'student') {
            const students = dataStore.getStudents().slice(0, 30);
            modalTitle.textContent = `📚 30 Sample Student Logins`;
            
            credList.innerHTML = students.map(s => `
                <div class="cred-row">
                    <div class="cred-info">
                        <div class="cred-name">${s.name}</div>
                        <div class="cred-id">${s.id}</div>
                    </div>
                    <div class="cred-pass">Pass@123</div>
                </div>
            `).join('');
        } else {
            const faculty = dataStore.getFaculty().slice(0, 30);
            modalTitle.textContent = `👨‍🏫 Faculty Logins (${faculty.length} available)`;
            
            credList.innerHTML = faculty.map(f => `
                <div class="cred-row">
                    <div class="cred-info">
                        <div class="cred-name">${f.name}</div>
                        <div class="cred-id">${f.id}</div>
                    </div>
                    <div class="cred-pass">Teach@123</div>
                </div>
            `).join('');
        }
        
        modal.style.display = 'flex';
    },

    // ---- Close credentials modal ----
    closeCredentials() {
        document.getElementById('credentials-modal').style.display = 'none';
    }
};
