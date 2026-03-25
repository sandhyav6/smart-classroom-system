// ============================================================
// utils.js — Shared utilities for Smart Classroom System
// Toast notifications, Dark mode, Session management, Helpers
// ALL localStorage usage REMOVED — uses backend session + cookies
// ============================================================

// ---- Toast Notification System ----
const Toast = {
    container: null,

    _ensureContainer() {
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'toast-container';
            document.body.appendChild(this.container);
        }
    },

    show(message, type = 'info', duration = 3000) {
        this._ensureContainer();

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            info: 'fa-info-circle',
            warning: 'fa-exclamation-triangle'
        };

        toast.innerHTML = `
            <i class="fas ${icons[type] || icons.info}"></i>
            <span>${message}</span>
            <button class="toast-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        this.container.appendChild(toast);

        // Trigger slide-in animation
        requestAnimationFrame(() => toast.classList.add('toast-visible'));

        // Auto-remove
        setTimeout(() => {
            toast.classList.remove('toast-visible');
            toast.classList.add('toast-hiding');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },

    success(msg) { this.show(msg, 'success'); },
    error(msg) { this.show(msg, 'error'); },
    info(msg) { this.show(msg, 'info'); },
    warning(msg) { this.show(msg, 'warning', 4000); }
};

// ---- Dark Mode (uses cookie instead of localStorage) ----
const DarkMode = {
    COOKIE_NAME: 'vit_dark_mode',

    _getCookie() {
        const match = document.cookie.match(new RegExp('(^| )' + this.COOKIE_NAME + '=([^;]+)'));
        return match ? match[2] : null;
    },

    _setCookie(value) {
        document.cookie = `${this.COOKIE_NAME}=${value};path=/;max-age=${365 * 24 * 60 * 60}`;
    },

    init() {
        const isDark = this._getCookie() === 'true';
        if (isDark) document.body.classList.add('dark-mode');
        this._updateToggleIcon();
    },

    toggle() {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        this._setCookie(isDark);
        this._updateToggleIcon();
        Toast.info(isDark ? '🌙 Dark mode enabled' : '☀️ Light mode enabled');
    },

    _updateToggleIcon() {
        const btn = document.getElementById('dark-mode-toggle');
        if (btn) {
            const isDark = document.body.classList.contains('dark-mode');
            btn.innerHTML = isDark
                ? '<i class="fas fa-sun"></i>'
                : '<i class="fas fa-moon"></i>';
            btn.title = isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode';
        }
    }
};

// ---- Session Management (backend-driven, NO localStorage) ----
const Session = {
    _cache: null,
    _loading: null,

    // Load session from backend — returns cached if available
    async load() {
        if (this._cache) return this._cache;
        if (this._loading) return this._loading;

        this._loading = (async () => {
            try {
                const res = await fetch('/api/auth/session', { credentials: 'include' });
                const data = await res.json();
                if (data.loggedIn && data.user) {
                    this._cache = data.user;
                    return this._cache;
                }
                this._cache = null;
                return null;
            } catch (err) {
                console.error('Session check failed:', err);
                this._cache = null;
                return null;
            } finally {
                this._loading = null;
            }
        })();

        return this._loading;
    },

    // Synchronous getter — returns cached session (call load() first)
    get() {
        return this._cache;
    },

    clear() {
        this._cache = null;
    },

    isLoggedIn() {
        return this._cache !== null;
    },

    getRole() {
        return this._cache?.role || null;
    },

    async requireAuth(role) {
        const session = await this.load();
        if (!session || (role && session.role !== role)) {
            const path = window.location.pathname;
            // Preserve full URL (including ?token= etc.) so we can return after login
            const returnUrl = encodeURIComponent(window.location.href);
            if (path.includes('faculty')) {
                window.location.href = 'faculty_login.html?returnUrl=' + returnUrl;
            } else if (path.includes('student')) {
                window.location.href = 'student_login.html?returnUrl=' + returnUrl;
            } else {
                window.location.href = 'index.html';
            }
            return null;
        }
        return session;
    },

    async logout() {
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });
        } catch (err) {
            console.error('Logout API error:', err);
        }
        this.clear();
        const path = window.location.pathname;
        if (path.includes('/student/') || path.includes('/faculty/')) {
            window.location.href = '../index.html';
        } else {
            window.location.href = 'index.html';
        }
    }
};

// ---- Navigation Helper ----
const Nav = {
    to(page) {
        window.location.href = page;
    }
};

// ---- Search / Filter Helpers ----
const SearchUtils = {
    filter(arr, query, fields) {
        if (!query || query.trim() === '') return arr;
        const q = query.toLowerCase().trim();
        return arr.filter(item =>
            fields.some(field => {
                const val = item[field];
                if (val === undefined || val === null) return false;
                return String(val).toLowerCase().includes(q);
            })
        );
    },

    debounce(fn, delay = 300) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => fn(...args), delay);
        };
    }
};

// ---- Date Formatting ----
const DateUtils = {
    format(dateStr, options = {}) {
        const defaults = { month: 'short', day: 'numeric', year: 'numeric' };
        return new Date(dateStr).toLocaleDateString('en-US', { ...defaults, ...options });
    },

    formatLong(dateStr) {
        return new Date(dateStr).toLocaleDateString('en-US', {
            weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
        });
    },

    daysUntil(dateStr) {
        const target = new Date(dateStr);
        const today = new Date();
        target.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
    },

    isOverdue(dateStr) {
        return this.daysUntil(dateStr) < 0;
    },

    getCurrentDateTimeStrings() {
        const now = new Date();
        return {
            date: now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
            time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
        };
    }
};

// ---- UI Helpers ----
const UIHelpers = {
    // Populate profile header from session
    populateHeader(session) {
        const nameEl = document.getElementById('profile-name');
        if (nameEl) nameEl.textContent = session?.name || 'User';

        const cgpaEl = document.getElementById('cgpa-display');
        if (cgpaEl && session?.role === 'student') {
            const student = dataStore.getStudentById(session.id);
            if (student) cgpaEl.textContent = student.cgpa;
        }
    },

    // Setup sidebar active state
    setupSidebar(activePage) {
        document.querySelectorAll('.nav-item').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-page') === activePage) {
                link.classList.add('active');
            }
        });
    },

    // Live clock update
    startClock() {
        const update = () => {
            const { date, time } = DateUtils.getCurrentDateTimeStrings();
            const dateEl = document.getElementById('current-date');
            const timeEl = document.getElementById('current-time');
            if (dateEl) dateEl.textContent = date;
            if (timeEl) timeEl.textContent = time;
        };
        update();
        setInterval(update, 1000);
    },

    // Create search input component
    createSearchBar(placeholder, onInput) {
        const wrapper = document.createElement('div');
        wrapper.className = 'search-bar-wrapper';
        wrapper.innerHTML = `
            <i class="fas fa-search search-icon"></i>
            <input type="text" class="search-input" placeholder="${placeholder}" id="live-search">
        `;
        const input = wrapper.querySelector('input');
        input.addEventListener('input', SearchUtils.debounce((e) => onInput(e.target.value), 250));
        return wrapper;
    },

    // Inject dark mode toggle into header
    injectDarkModeToggle() {
        const header = document.querySelector('header');
        if (!header || document.getElementById('dark-mode-toggle')) return;

        const btn = document.createElement('button');
        btn.id = 'dark-mode-toggle';
        btn.className = 'dark-mode-btn';
        btn.onclick = () => DarkMode.toggle();
        btn.innerHTML = '<i class="fas fa-moon"></i>';
        btn.title = 'Toggle Dark Mode';

        // Insert before profile section or at end of header
        const profileSection = header.querySelector('.profile-section');
        if (profileSection) {
            header.insertBefore(btn, profileSection);
        } else {
            header.appendChild(btn);
        }

        DarkMode._updateToggleIcon();
    },

    // Setup logout with session clear
    setupLogout() {
        document.querySelectorAll('a').forEach(link => {
            if (link.textContent.trim().includes('Logout')) {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    Session.logout();
                });
            }
        });
    }
};

// ---- Auto-init on page load ----
document.addEventListener('DOMContentLoaded', () => {
    DarkMode.init();
    UIHelpers.injectDarkModeToggle();
    UIHelpers.setupLogout();
});
