// ============================================================
// assignments.js — Assignment management for Smart Classroom
// Student: view/submit; Faculty: CRUD + view submissions
// ============================================================

const AssignmentManager = {
    session: null,
    currentAssignment: null,

    // ---- Initialize ----
    init(role) {
        this.session = Session.get();
        if (!this.session) {
            Session.requireAuth(role);
            return;
        }
        UIHelpers.populateHeader(this.session);

        if (role === 'student') {
            this._initStudentView();
        } else {
            this._initFacultyView();
        }
    },

    // ============================================================
    // STUDENT VIEW
    // ============================================================
    _initStudentView() {
        const subjectFilter = document.getElementById('subject-filter');
        if (subjectFilter) {
            // Populate subject options dynamically
            const courses = [...new Set(dataStore.getAssignments().map(a => a.course))].sort();
            subjectFilter.innerHTML = '<option value="">-- Select a Subject --</option><option value="All">Show All Subjects</option>';
            courses.forEach(c => {
                subjectFilter.innerHTML += `<option value="${c}">${c}</option>`;
            });
            subjectFilter.onchange = () => this.renderStudentAssignments();
        }

        // Check for direct assignment link
        const params = new URLSearchParams(window.location.search);
        const assignmentId = params.get('assignmentId');
        if (assignmentId) {
            const assignment = dataStore.getAssignmentById(parseInt(assignmentId));
            if (assignment && subjectFilter) {
                subjectFilter.value = assignment.course;
                this.renderStudentAssignments();
                setTimeout(() => this.showDetail(parseInt(assignmentId)), 100);
            }
        }
    },

    renderStudentAssignments() {
        const selectedSubject = document.getElementById('subject-filter')?.value;
        const displayContainer = document.getElementById('assignments-display');
        const upcomingEl = document.getElementById('upcoming-assignments');
        const pastDueEl = document.getElementById('pastdue-assignments');
        const completedEl = document.getElementById('completed-assignments');

        if (!displayContainer) return;

        if (!selectedSubject) {
            displayContainer.style.display = 'none';
            return;
        }

        displayContainer.style.display = 'block';
        if (upcomingEl) upcomingEl.innerHTML = '';
        if (pastDueEl) pastDueEl.innerHTML = '';
        if (completedEl) completedEl.innerHTML = '';

        const assignments = dataStore.getAssignmentsByCourse(selectedSubject);
        const today = new Date();

        assignments.forEach(a => {
            const dueDate = new Date(a.dueDate);
            const submission = dataStore.getSubmission(this.session.id, a.id);
            const isCompleted = !!submission;
            const isPastDue = dueDate < today && !isCompleted;

            const card = `
                <div class="assignment-card ${isPastDue ? 'past-due' : ''} ${isCompleted ? 'completed' : ''}"
                     onclick="AssignmentManager.showDetail(${a.id})" style="cursor:pointer;">
                    <div class="assignment-title">${a.title}</div>
                    <div class="assignment-meta">
                        <div class="assignment-meta-item">
                            <i class="fas fa-book"></i> ${a.course} (${a.courseCode})
                        </div>
                        <div class="assignment-meta-item assignment-due-date ${isPastDue ? 'overdue' : ''}">
                            <i class="fas fa-calendar-alt"></i>
                            ${isCompleted
                                ? 'Submitted: ' + DateUtils.format(submission.date)
                                : 'Due: ' + DateUtils.format(a.dueDate)}
                        </div>
                    </div>
                    <div class="assignment-description">${a.shortDescription}</div>
                </div>
            `;

            if (isCompleted && completedEl) {
                completedEl.innerHTML += card;
            } else if (isPastDue && pastDueEl) {
                pastDueEl.innerHTML += card;
            } else if (upcomingEl) {
                upcomingEl.innerHTML += card;
            }
        });

        // Empty messages
        if (upcomingEl && !upcomingEl.innerHTML) upcomingEl.innerHTML = '<p style="color:var(--text-color);opacity:0.7;">No upcoming assignments</p>';
        if (pastDueEl && !pastDueEl.innerHTML) pastDueEl.innerHTML = '<p style="color:var(--text-color);opacity:0.7;">No past due assignments</p>';
        if (completedEl && !completedEl.innerHTML) completedEl.innerHTML = '<p style="color:var(--text-color);opacity:0.7;">No completed assignments</p>';
    },

    showDetail(assignmentId) {
        this.currentAssignment = dataStore.getAssignmentById(assignmentId);
        if (!this.currentAssignment) return;

        document.getElementById('assignments-overview')?.classList.add('hidden');
        document.getElementById('assignment-detail')?.classList.remove('hidden');

        const a = this.currentAssignment;
        const titleEl = document.getElementById('detail-assignment-title');
        if (titleEl) titleEl.textContent = a.title;

        const courseEl = document.getElementById('detail-course');
        if (courseEl) courseEl.textContent = a.course;

        const codeEl = document.getElementById('detail-course-code');
        if (codeEl) codeEl.textContent = a.courseCode;

        const dateEl = document.getElementById('detail-due-date');
        if (dateEl) dateEl.textContent = DateUtils.formatLong(a.dueDate);

        const descEl = document.getElementById('detail-description');
        if (descEl) descEl.innerHTML = a.detailedDescription.replace(/\n/g, '<br>');

        // Check submission status
        const submission = dataStore.getSubmission(this.session.id, a.id);
        const submissionDetailsEl = document.getElementById('submission-details-section');
        const submitSectionEl = document.getElementById('submit-section');

        if (submission) {
            if (submissionDetailsEl) submissionDetailsEl.style.display = 'block';
            if (submitSectionEl) submitSectionEl.style.display = 'none';

            const submittedDateEl = document.getElementById('detail-submitted-date');
            if (submittedDateEl) submittedDateEl.textContent = DateUtils.formatLong(submission.date);

            const uploadedFileEl = document.getElementById('detail-uploaded-file');
            if (uploadedFileEl) uploadedFileEl.innerHTML = `<i class="fas fa-file-archive"></i> ${submission.file}`;
        } else {
            if (submissionDetailsEl) submissionDetailsEl.style.display = 'none';
            if (submitSectionEl) submitSectionEl.style.display = 'block';

            const statusEl = document.getElementById('submission-status');
            if (statusEl) statusEl.innerHTML = '';

            const fileInput = document.getElementById('assignment-file-input');
            if (fileInput) fileInput.value = '';
        }
    },

    backToAssignments() {
        document.getElementById('assignment-detail')?.classList.add('hidden');
        document.getElementById('assignments-overview')?.classList.remove('hidden');
        this.currentAssignment = null;
    },

    submitAssignment() {
        const fileInput = document.getElementById('assignment-file-input');
        const statusDiv = document.getElementById('submission-status');

        if (!fileInput?.files || fileInput.files.length === 0) {
            if (statusDiv) statusDiv.innerHTML = '<span style="color:#ff0000;"><i class="fas fa-exclamation-circle"></i> Please select a file to upload</span>';
            return;
        }

        if (!this.currentAssignment) return;

        const fileName = fileInput.files[0].name;
        dataStore.submitAssignment(this.session.id, this.currentAssignment.id, fileName);

        if (statusDiv) {
            statusDiv.innerHTML = `<span style="color:#264508;"><i class="fas fa-check-circle"></i> Assignment submitted successfully! File: ${fileName}</span>`;
        }

        Toast.success('Assignment submitted successfully!');

        // Re-render after a delay
        setTimeout(() => {
            this.showDetail(this.currentAssignment.id);
        }, 1500);
    },

    // ============================================================
    // FACULTY VIEW
    // ============================================================
    _initFacultyView() {
        this._renderFacultyAssignments();
    },

    _renderFacultyAssignments() {
        const container = document.getElementById('faculty-assignments-list');
        if (!container) return;

        const assignments = dataStore.getAssignments();
        const searchInput = document.getElementById('faculty-assignment-search');

        const render = (filter = '') => {
            const filtered = filter
                ? assignments.filter(a =>
                    a.title.toLowerCase().includes(filter.toLowerCase()) ||
                    a.course.toLowerCase().includes(filter.toLowerCase()))
                : assignments;

            container.innerHTML = filtered.length === 0
                ? '<p style="text-align:center;opacity:0.7;">No assignments found</p>'
                : filtered.map(a => {
                    const daysLeft = DateUtils.daysUntil(a.dueDate);
                    const status = daysLeft < 0 ? 'Past Due' : (daysLeft === 0 ? 'Due Today' : `${daysLeft} days left`);
                    const statusColor = daysLeft < 0 ? '#ff6b6b' : (daysLeft <= 2 ? '#feca57' : '#264508');

                    return `
                        <div class="assignment-card" style="cursor:pointer;">
                            <div style="display:flex;justify-content:space-between;align-items:start;">
                                <div style="flex:1;">
                                    <div class="assignment-title">${a.title}</div>
                                    <div class="assignment-meta">
                                        <span><i class="fas fa-book"></i> ${a.course} (${a.courseCode})</span>
                                        <span style="color:${statusColor};font-weight:700;"><i class="fas fa-clock"></i> ${status}</span>
                                    </div>
                                    <div class="assignment-description">${a.shortDescription}</div>
                                </div>
                                <div style="display:flex;gap:0.5rem;margin-left:1rem;">
                                    <button onclick="AssignmentManager.editAssignment(${a.id})"
                                        style="background:#264508;color:white;border:none;padding:0.5rem 0.8rem;border-radius:8px;cursor:pointer;">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button onclick="AssignmentManager.deleteAssignment(${a.id})"
                                        style="background:#ff6b6b;color:white;border:none;padding:0.5rem 0.8rem;border-radius:8px;cursor:pointer;">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('');
        };

        render();

        if (searchInput) {
            searchInput.oninput = SearchUtils.debounce((e) => render(e.target.value), 250);
        }
    },

    // ---- Create Assignment ----
    showCreateForm() {
        const form = document.getElementById('assignment-create-form');
        if (form) form.style.display = 'block';
        // Clear form
        ['new-title', 'new-course', 'new-code', 'new-due', 'new-desc', 'new-detail'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
    },

    hideCreateForm() {
        const form = document.getElementById('assignment-create-form');
        if (form) form.style.display = 'none';
    },

    createAssignment() {
        const title = document.getElementById('new-title')?.value.trim();
        const course = document.getElementById('new-course')?.value.trim();
        const courseCode = document.getElementById('new-code')?.value.trim();
        const dueDate = document.getElementById('new-due')?.value;
        const shortDesc = document.getElementById('new-desc')?.value.trim();
        const detailedDesc = document.getElementById('new-detail')?.value.trim();

        if (!title || !course || !dueDate) {
            Toast.warning('Please fill in title, course, and due date');
            return;
        }

        dataStore.addAssignment({
            title,
            course,
            courseCode: courseCode || 'CSE000',
            dueDate,
            shortDescription: shortDesc || title,
            detailedDescription: detailedDesc || shortDesc || title,
            createdBy: this.session?.id || '10001',
            maxMarks: 100
        });

        Toast.success('Assignment created!');
        this.hideCreateForm();
        this._renderFacultyAssignments();
    },

    // ---- Edit Assignment ----
    editAssignment(id) {
        const assignment = dataStore.getAssignmentById(id);
        if (!assignment) return;

        const newTitle = prompt('Edit title:', assignment.title);
        if (newTitle === null) return;

        const newDueDate = prompt('Edit due date (YYYY-MM-DD):', assignment.dueDate);
        if (newDueDate === null) return;

        dataStore.updateAssignment(id, {
            title: newTitle || assignment.title,
            dueDate: newDueDate || assignment.dueDate
        });

        Toast.success('Assignment updated!');
        this._renderFacultyAssignments();
    },

    // ---- Delete Assignment ----
    deleteAssignment(id) {
        if (confirm('Are you sure you want to delete this assignment?')) {
            dataStore.deleteAssignment(id);
            Toast.info('Assignment deleted');
            this._renderFacultyAssignments();
        }
    }
};
