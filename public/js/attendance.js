// ============================================================
// attendance.js — Attendance system for Smart Classroom
// Student view: records display; Faculty view: mark attendance
// ALL async operations properly awaited
// ============================================================

const AttendanceManager = {
    session: null,

    // ---- Initialize ----
    async init(role) {
        await dataStore.ready();

        this.session = await Session.load();
        if (!this.session) {
            await Session.requireAuth(role);
            return;
        }
        UIHelpers.populateHeader(this.session);

        if (role === 'student') {
            await this._initStudentView();
        } else {
            this._initFacultyView();
        }
    },

    // ============================================================
    // STUDENT VIEW
    // ============================================================
    async _initStudentView() {
        const student = dataStore.getStudentById(this.session.id);
        if (!student) return;

        // Populate semester selector
        const semSelect = document.getElementById('attendance-sem-select');
        if (semSelect) {
            semSelect.innerHTML = '';
            for (let i = 1; i <= 8; i++) {
                const opt = document.createElement('option');
                opt.value = `Semester ${i}`;
                opt.textContent = `Semester ${i}`;
                if (i === student.semester) opt.selected = true;
                semSelect.appendChild(opt);
            }
            semSelect.onchange = () => this.renderStudentAttendance();
        }
        await this.renderStudentAttendance();
    },

    async renderStudentAttendance() {
        const semSelect = document.getElementById('attendance-sem-select');
        const sem = semSelect?.value || 'Semester 1';
        const tbody = document.getElementById('attendance-body');
        if (!tbody) return;

        tbody.innerHTML = '';
        const attendance = await dataStore.getAttendance(this.session.id, sem);
        if (!attendance || Object.keys(attendance).length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No attendance records found.</td></tr>';
            return;
        }

        Object.entries(attendance).forEach(([subName, data]) => {
            const percentage = data.total > 0 ? ((data.attended / data.total) * 100).toFixed(1) : '0.0';
            const status = parseFloat(percentage) >= 75 ? 'Good' : 'Low';
            const statusClass = parseFloat(percentage) >= 75 ? '' : 'status-fail';

            tbody.innerHTML += `
                <tr>
                    <td>${data.code}</td>
                    <td style="font-weight:600;">${subName}</td>
                    <td>${data.attended}</td>
                    <td>${data.total}</td>
                    <td class="${statusClass}" style="font-weight:bold;">${percentage}%</td>
                    <td class="${statusClass}" style="font-weight:600;">${status}</td>
                    <td>
                        <button onclick="AttendanceManager.showDetail('${subName.replace(/'/g, "\\'")}')"
                            style="background:var(--text-color, #264508);color:white;border:none;padding:0.5rem 1rem;border-radius:8px;cursor:pointer;font-weight:600;">
                            View Details
                        </button>
                    </td>
                </tr>
            `;
        });
    },

    async showDetail(subName) {
        const sem = document.getElementById('attendance-sem-select')?.value || 'Semester 1';
        const attendance = await dataStore.getAttendance(this.session.id, sem);
        const subData = attendance?.[subName];
        if (!subData) return;

        document.getElementById('attendance-overview')?.classList.add('hidden');
        document.getElementById('attendance-detail')?.classList.remove('hidden');

        const detailTitle = document.getElementById('detail-subject-name');
        if (detailTitle) detailTitle.textContent = `${subData.code} - ${subName}`;

        const attendedEl = document.getElementById('attended-dates');
        const missedEl = document.getElementById('missed-dates');

        if (attendedEl) {
            attendedEl.innerHTML = subData.attendedDates.map(date => `
                <div style="background:#F5F0BB;padding:0.7rem 1rem;border-radius:8px;border-left:4px solid #264508;">
                    <i class="fas fa-check-circle" style="color:#264508;margin-right:0.5rem;"></i>
                    ${DateUtils.format(date)}
                </div>
            `).join('');
        }

        if (missedEl) {
            missedEl.innerHTML = subData.missedDates.map(date => `
                <div style="background:#F5F0BB;padding:0.7rem 1rem;border-radius:8px;border-left:4px solid #ff0000;">
                    <i class="fas fa-times-circle" style="color:#ff0000;margin-right:0.5rem;"></i>
                    ${DateUtils.format(date)}
                </div>
            `).join('');
        }
    },

    backToOverview() {
        document.getElementById('attendance-detail')?.classList.add('hidden');
        document.getElementById('attendance-overview')?.classList.remove('hidden');
    },

    // ============================================================
    // FACULTY VIEW
    // ============================================================
    _initFacultyView() {
        const dateInput = document.getElementById('attendance-date');
        if (dateInput) dateInput.valueAsDate = new Date();

        // Set up class select
        const classSelect = document.getElementById('class-select');
        if (classSelect) {
            classSelect.onchange = () => this.renderFacultyStudents();
        }
    },

    renderFacultyStudents() {
        const classSelected = document.getElementById('class-select')?.value;
        const tbody = document.getElementById('students-body');
        const tableWrapper = document.getElementById('attendance-table');
        const submitBtn = document.getElementById('submit-btn');
        const searchContainer = document.getElementById('attendance-search-container');

        if (!tbody) return;
        tbody.innerHTML = '';

        if (!classSelected) {
            if (tableWrapper) tableWrapper.style.display = 'none';
            if (submitBtn) submitBtn.style.display = 'none';
            if (searchContainer) searchContainer.style.display = 'none';
            return;
        }

        if (tableWrapper) tableWrapper.style.display = 'block';
        if (submitBtn) submitBtn.style.display = 'block';
        if (searchContainer) searchContainer.style.display = 'block';

        // Get students for this section from dataStore
        const students = dataStore.getStudentsBySection(classSelected);

        // Load saved attendance state from session
        if (!this._attendanceState) this._attendanceState = {};
        if (!this._attendanceState[classSelected]) {
            this._attendanceState[classSelected] = {};
            students.forEach(s => {
                this._attendanceState[classSelected][s.id] = true; // default present
            });
        }

        this._renderStudentRows(students, classSelected);
    },

    _renderStudentRows(students, classSelected, filter = '') {
        const tbody = document.getElementById('students-body');
        if (!tbody) return;
        tbody.innerHTML = '';

        const filtered = filter
            ? students.filter(s =>
                s.name.toLowerCase().includes(filter.toLowerCase()) ||
                s.id.toLowerCase().includes(filter.toLowerCase()))
            : students;

        if (filtered.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No students found</td></tr>';
            return;
        }

        filtered.forEach((student, i) => {
            const isPresent = this._attendanceState[classSelected]?.[student.id] ?? true;
            const statusText = isPresent ? 'Present' : 'Absent';
            const statusClass = isPresent ? '' : 'status-fail';
            const btnColor = isPresent ? '#264508' : '#ff6b6b';

            tbody.innerHTML += `
                <tr>
                    <td>${student.id}</td>
                    <td style="font-weight:600;">${student.name}</td>
                    <td class="${statusClass}" style="font-weight:600;">${statusText}</td>
                    <td>
                        <button onclick="AttendanceManager.toggleStudent('${classSelected}', '${student.id}')"
                            style="background:${btnColor};color:white;border:none;padding:0.5rem 1rem;border-radius:8px;cursor:pointer;font-weight:600;transition:background 0.3s;">
                            <i class="fas fa-exchange-alt"></i> Toggle
                        </button>
                    </td>
                </tr>
            `;
        });

        // Summary
        const presentCount = students.filter(s => this._attendanceState[classSelected]?.[s.id]).length;
        const summaryEl = document.getElementById('attendance-summary');
        if (summaryEl) {
            summaryEl.innerHTML = `
                <span style="color:#264508;font-weight:700;">Present: ${presentCount}</span> |
                <span style="color:#ff6b6b;font-weight:700;">Absent: ${students.length - presentCount}</span> |
                <span>Total: ${students.length}</span>
            `;
        }
    },

    toggleStudent(section, studentId) {
        if (!this._attendanceState) this._attendanceState = {};
        if (!this._attendanceState[section]) this._attendanceState[section] = {};
        this._attendanceState[section][studentId] = !this._attendanceState[section][studentId];
        this.renderFacultyStudents();
    },

    markAllPresent() {
        const classSelected = document.getElementById('class-select')?.value;
        if (!classSelected) return;
        const students = dataStore.getStudentsBySection(classSelected);
        students.forEach(s => {
            if (!this._attendanceState[classSelected]) this._attendanceState[classSelected] = {};
            this._attendanceState[classSelected][s.id] = true;
        });
        this.renderFacultyStudents();
        Toast.info('All marked present');
    },

    markAllAbsent() {
        const classSelected = document.getElementById('class-select')?.value;
        if (!classSelected) return;
        const students = dataStore.getStudentsBySection(classSelected);
        students.forEach(s => {
            if (!this._attendanceState[classSelected]) this._attendanceState[classSelected] = {};
            this._attendanceState[classSelected][s.id] = false;
        });
        this.renderFacultyStudents();
        Toast.info('All marked absent');
    },

    async submitAttendance() {
        const classSelected = document.getElementById('class-select')?.value;
        const date = document.getElementById('attendance-date')?.value;

        if (!classSelected || !date) {
            Toast.warning('Please select a class and date');
            return;
        }

        const students = dataStore.getStudentsBySection(classSelected);
        for (const student of students) {
            const isPresent = this._attendanceState[classSelected]?.[student.id] ?? true;
            const semKey = `Semester ${student.semester}`;
            const attendance = await dataStore.getAttendance(student.id, semKey);
            if (attendance) {
                const firstSubject = Object.keys(attendance)[0];
                if (firstSubject) {
                    await dataStore.updateAttendance(student.id, semKey, firstSubject, date, isPresent);
                }
            }
        }

        Toast.success(`Attendance submitted for ${classSelected} on ${DateUtils.format(date)}!`);
    },

    // Search handler for faculty view
    searchStudents(query) {
        const classSelected = document.getElementById('class-select')?.value;
        if (!classSelected) return;
        const students = dataStore.getStudentsBySection(classSelected);
        this._renderStudentRows(students, classSelected, query);
    }
};
