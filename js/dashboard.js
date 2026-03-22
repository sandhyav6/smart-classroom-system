// ============================================================
// dashboard.js — Shared dashboard rendering logic
// Populates header, timetable, assignments, clock
// ALL async operations properly awaited
// ============================================================

const Dashboard = {
    session: null,

    async init(role) {
        // Wait for dataStore initialization
        await dataStore.ready();

        // Load session from backend
        this.session = await Session.load();
        if (!this.session || this.session.role !== role) {
            await Session.requireAuth(role);
            return;
        }

        UIHelpers.populateHeader(this.session);
        UIHelpers.startClock();

        if (role === 'student') {
            await this._renderStudentDashboard();
        } else {
            await this._renderFacultyDashboard();
        }
    },

    // ---- Student Dashboard ----
    async _renderStudentDashboard() {
        const student = dataStore.getStudentById(this.session.id);
        if (!student) return;

        // Welcome message
        const welcomeEl = document.getElementById('welcome-msg');
        if (welcomeEl) welcomeEl.textContent = `Welcome back, ${student.firstName}!`;

        // Attendance display
        await this._renderStudentAttendanceCard(student);

        // Today's timetable
        await this._renderTodayTimetable(student);

        // Upcoming assignments
        this._renderUpcomingAssignments();
    },

    async _renderStudentAttendanceCard(student) {
        const semKey = `Semester ${student.semester}`;
        const attendance = await dataStore.getAttendance(student.id, semKey);
        if (!attendance) return;

        let totalAttended = 0, totalClasses = 0;
        Object.values(attendance).forEach(sub => {
            totalAttended += sub.attended;
            totalClasses += sub.total;
        });

        const percentage = totalClasses > 0 ? Math.round((totalAttended / totalClasses) * 100) : 0;
        const displayEl = document.getElementById('attendance-display');
        if (displayEl) displayEl.textContent = `${percentage}%`;

        // Toggle functionality
        const card = displayEl?.closest('.card');
        if (card) {
            let timeout = null;
            card.onclick = () => {
                if (timeout) clearTimeout(timeout);
                displayEl.textContent = `${totalAttended}/${totalClasses}`;
                timeout = setTimeout(() => {
                    displayEl.textContent = `${percentage}%`;
                }, 2000);
            };
        }
    },

    async _renderTodayTimetable(student) {
        const semKey = `Semester ${student.semester}`;
        const timetable = await dataStore.getTimetable(semKey);
        const container = document.getElementById('today-timetable');
        if (!container || !timetable) {
            if (container) container.innerHTML = '<p style="opacity:0.7;font-size:0.9rem;color:var(--text-color);">No timetable data available</p>';
            return;
        }

        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const todayCode = days[new Date().getDay()];

        if (todayCode === 'Sun' || todayCode === 'Sat') {
            container.innerHTML = '<p style="opacity:0.7;font-size:0.9rem;color:var(--text-color);">No classes today (Weekend) 🎉</p>';
            return;
        }

        let html = '';
        let hasClasses = false;
        Object.entries(timetable.schedule).forEach(([time, slots]) => {
            const classInfo = slots[todayCode];
            if (classInfo) {
                hasClasses = true;
                html += `
                    <div class="event-item" style="border-left-color:var(--text-color);">
                        <div class="event-date">${time}</div>
                        <h4>${classInfo.name}</h4>
                        <p style="font-size:0.9rem;opacity:0.8;">${classInfo.code} • <i class="fas fa-map-marker-alt"></i> ${classInfo.location}</p>
                    </div>
                `;
            }
        });

        container.innerHTML = hasClasses ? html : '<p style="opacity:0.7;font-size:0.9rem;color:var(--text-color);">No classes scheduled today</p>';
    },

    _renderUpcomingAssignments() {
        const container = document.getElementById('upcoming-assignments');
        if (!container) return;

        const today = new Date();
        const assignments = dataStore.getAssignments()
            .filter(a => new Date(a.dueDate) >= today)
            .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
            .slice(0, 6);

        if (assignments.length === 0) {
            container.innerHTML = '<p style="opacity:0.7;font-size:0.9rem;">No upcoming submissions</p>';
            return;
        }

        container.innerHTML = assignments.map(a => {
            const daysLeft = DateUtils.daysUntil(a.dueDate);
            const urgency = daysLeft <= 2 ? 'color:#ff6b6b;font-weight:700;' : '';
            return `
                <div class="event-item" onclick="Nav.to('student_assignments.html')" style="cursor:pointer;">
                    <div class="event-date" style="${urgency}">${daysLeft <= 0 ? 'Due Today!' : daysLeft + ' days left'}</div>
                    <h4>${a.title}</h4>
                    <p style="font-size:0.9rem;opacity:0.8;">${a.course} • ${DateUtils.format(a.dueDate)}</p>
                </div>
            `;
        }).join('');
    },

    // ---- Faculty Dashboard ----
    async _renderFacultyDashboard() {
        const faculty = dataStore.getFacultyById(this.session.id);
        if (!faculty) return;

        // Welcome message
        const welcomeEl = document.getElementById('welcome-msg');
        if (welcomeEl) {
            const lastName = faculty.name.split(' ').pop();
            welcomeEl.textContent = `Welcome back, ${lastName}!`;
        }

        // Today's classes
        await this._renderFacultyTodayClasses();

        // Reminders
        await this._renderReminders(faculty.id);
    },

    async _renderFacultyTodayClasses() {
        const container = document.getElementById('today-timetable');
        if (!container) return;

        const classes = await dataStore.getFacultyTimetable();
        const classesTodayEl = document.getElementById('classes-today');
        if (classesTodayEl) classesTodayEl.textContent = classes.length;

        if (classes.length > 0) {
            container.innerHTML = classes.map(cls => `
                <div class="event-item" style="border-left-color:var(--text-color);">
                    <div class="event-date">${cls.time}</div>
                    <h4>${cls.subject}</h4>
                    <p style="font-size:0.9rem;opacity:0.8;">${cls.section} • <i class="fas fa-map-marker-alt"></i> ${cls.room}</p>
                </div>
            `).join('');
        } else {
            container.innerHTML = '<p style="opacity:0.7;font-size:0.9rem;color:var(--text-color);">No classes today</p>';
        }
    },

    async _renderReminders(facultyId) {
        const container = document.getElementById('reminders-list');
        if (!container) return;

        const reminders = await dataStore.getReminders(facultyId);
        const sorted = reminders.sort((a, b) => new Date(a.date) - new Date(b.date));

        if (sorted.length === 0) {
            container.innerHTML = '<p style="opacity:0.7;font-size:0.9rem;color:var(--text-color);text-align:center;padding:1rem;">No reminders yet</p>';
            return;
        }

        container.innerHTML = sorted.map(r => {
            const reminderId = r._id || r.id;
            const daysUntil = DateUtils.daysUntil(r.date);
            let statusText, statusColor;

            if (daysUntil < 0) { statusText = 'Overdue'; statusColor = '#ff6b6b'; }
            else if (daysUntil === 0) { statusText = 'Today'; statusColor = '#feca57'; }
            else if (daysUntil === 1) { statusText = 'Tomorrow'; statusColor = '#F540BB'; }
            else { statusText = `${daysUntil} days`; statusColor = 'var(--text-color)'; }

            return `
                <div class="event-item" style="border-left-color:${statusColor};position:relative;">
                    <div style="display:flex;justify-content:space-between;align-items:start;">
                        <div style="flex:1;">
                            <div class="event-date" style="color:${statusColor};font-weight:700;">${statusText}</div>
                            <h4 style="margin:0.3rem 0;">${r.title}</h4>
                            <p style="font-size:0.85rem;opacity:0.8;margin:0.3rem 0;"><i class="fas fa-calendar"></i> ${DateUtils.format(r.date)}</p>
                            ${r.description ? `<p style="font-size:0.85rem;opacity:0.7;margin-top:0.5rem;">${r.description}</p>` : ''}
                        </div>
                        <button onclick="Dashboard.deleteReminder('${reminderId}')" style="background:#ff6b6b;color:white;border:none;padding:0.4rem 0.6rem;border-radius:6px;cursor:pointer;font-size:0.8rem;margin-left:0.5rem;">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    },

    // ---- Reminder CRUD ----
    async addReminder() {
        const title = document.getElementById('reminder-title')?.value.trim();
        const date = document.getElementById('reminder-date')?.value;
        const description = document.getElementById('reminder-desc')?.value.trim();

        if (!title || !date) {
            Toast.warning('Please enter a title and date');
            return;
        }

        await dataStore.addReminder({
            title,
            date,
            description,
            facultyId: this.session?.id || '10001'
        });

        document.getElementById('reminder-title').value = '';
        document.getElementById('reminder-date').value = '';
        document.getElementById('reminder-desc').value = '';

        await this._renderReminders(this.session?.id);
        Toast.success('Reminder added!');
    },

    async deleteReminder(id) {
        await dataStore.deleteReminder(id);
        await this._renderReminders(this.session?.id);
        Toast.info('Reminder deleted');
    }
};
