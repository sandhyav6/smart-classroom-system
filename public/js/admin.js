// ============================================================
// js/admin.js — Metro Booking Admin Dashboard
// ============================================================

const BASE = 'http://localhost:3000/api';

// ── API helper ───────────────────────────────────────────────
const API = {
    async get(path) {
        let r;
        try { r = await fetch(`${BASE}${path}`); }
        catch { throw new Error('Cannot reach server. Is it running on localhost:3000?'); }
        if (!r.ok) {
            const err = await r.json().catch(() => ({ error: r.statusText }));
            throw new Error(err.error || r.statusText);
        }
        return r.json();
    },
    async post(path, body) {
        let r;
        try { r = await fetch(`${BASE}${path}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        }); }
        catch { throw new Error('Cannot reach server. Is it running on localhost:3000?'); }
        if (!r.ok) {
            const err = await r.json().catch(() => ({ error: r.statusText }));
            throw new Error(err.error || r.statusText);
        }
        return r.json();
    },
    async del(path) {
        let r;
        try { r = await fetch(`${BASE}${path}`, { method: 'DELETE' }); }
        catch { throw new Error('Cannot reach server. Is it running on localhost:3000?'); }
        if (!r.ok) {
            const err = await r.json().catch(() => ({ error: r.statusText }));
            throw new Error(err.error || r.statusText);
        }
        return r.json();
    }
};

// ── Client-side validation helpers ──────────────────────────
const OBJECTID_RE = /^[a-f\d]{24}$/i;
const EMAIL_RE    = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function fieldError(inputId, msg) {
    const input = document.getElementById(inputId);
    if (!input) return;
    input.classList.add('input-error');
    let hint = input.nextElementSibling;
    if (!hint || !hint.classList.contains('field-hint')) {
        hint = document.createElement('span');
        hint.className = 'field-hint';
        input.after(hint);
    }
    hint.textContent = msg;
}

function clearErrors(formId) {
    const form = document.getElementById(formId);
    if (!form) return;
    form.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
    form.querySelectorAll('.field-hint').forEach(el => el.remove());
}

// Clear a field's error as soon as the user starts typing
function watchField(inputId) {
    const el = document.getElementById(inputId);
    if (!el) return;
    el.addEventListener('input', () => {
        el.classList.remove('input-error');
        const hint = el.nextElementSibling;
        if (hint && hint.classList.contains('field-hint')) hint.remove();
    }, { once: false });
}

// ── Toast ────────────────────────────────────────────────────
function toast(msg, type = 'success') {
    const t = document.createElement('div');
    t.className = `toast toast-${type}`;
    const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
    t.innerHTML = `<span>${icon}</span><span class="toast-msg">${msg}</span>`;
    document.getElementById('toast-container').appendChild(t);
    requestAnimationFrame(() => t.classList.add('toast-show'));
    setTimeout(() => { t.classList.remove('toast-show'); setTimeout(() => t.remove(), 400); }, 3500);
}

// ── Loading state ────────────────────────────────────────────
function setLoading(tbodyId, cols) {
    document.getElementById(tbodyId).innerHTML =
        `<tr><td colspan="${cols}" class="empty-row">
            <span class="spinner"></span> Loading…
        </td></tr>`;
}

// ── Table renderer ───────────────────────────────────────────
function renderTable(tbodyId, rows, columns, deleteFn, countId, tsId) {
    const tbody = document.getElementById(tbodyId);
    if (countId) document.getElementById(countId).textContent = `${rows.length} record${rows.length !== 1 ? 's' : ''}`;
    if (tsId)    document.getElementById(tsId).textContent = 'Updated ' + fmtTime(new Date());

    if (!rows.length) {
        tbody.innerHTML = `<tr><td colspan="${columns.length + 1}" class="empty-row">No records found — add one above!</td></tr>`;
        return;
    }
    tbody.innerHTML = rows.map(row => {
        const cells = columns.map(col => `<td>${col(row)}</td>`).join('');
        return `<tr>${cells}
            <td>
              <button class="btn-del" onclick="${deleteFn}('${row._id}')" title="Delete">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                Delete
              </button>
            </td>
          </tr>`;
    }).join('');
}

// ── Refresh button helper ────────────────────────────────────
function setRefreshSpin(btnId, spinning) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    btn.disabled = spinning;
    btn.classList.toggle('refreshing', spinning);
}

// ── Sidebar badges ───────────────────────────────────────────
function setSideCount(id, count) {
    const el = document.getElementById(id);
    if (el) el.textContent = count;
}

// ═══════════════════════════════════════════════════════════
//  USERS
// ═══════════════════════════════════════════════════════════
async function loadUsers() {
    setLoading('tbody-users', 5);
    setRefreshSpin('refresh-users', true);
    try {
        const users = await API.get('/users');
        setSideCount('badge-users', users.length);
        renderTable('tbody-users', users, [
            r => `<code class="id-cell" title="${r._id}">${r._id.slice(-8)}</code>`,
            r => `<strong>${escHtml(r.name)}</strong>`,
            r => `<a class="mail-link" href="mailto:${escHtml(r.email)}">${escHtml(r.email)}</a>`,
            r => fmtDate(r.createdAt)
        ], 'deleteUser', 'count-users', 'ts-users');
    } catch (e) {
        document.getElementById('tbody-users').innerHTML =
            `<tr><td colspan="5" class="empty-row error-row">⚠️ ${e.message}</td></tr>`;
        toast('Failed to load users: ' + e.message, 'error');
    } finally { setRefreshSpin('refresh-users', false); }
}

async function addUser(e) {
    e.preventDefault();
    clearErrors('form-users');
    const btn   = e.target.querySelector('button[type=submit]');
    const name  = document.getElementById('u-name').value.trim();
    const email = document.getElementById('u-email').value.trim();

    // Client-side validation
    let valid = true;
    if (!name)                  { fieldError('u-name',  'Name is required');                    valid = false; }
    else if (name.length < 2)   { fieldError('u-name',  'Name must be at least 2 characters');  valid = false; }
    if (!email)                 { fieldError('u-email', 'Email is required');                   valid = false; }
    else if (!EMAIL_RE.test(email)) { fieldError('u-email', 'Enter a valid email address');     valid = false; }
    if (!valid) return;

    btn.disabled = true; btn.textContent = 'Adding…';
    try {
        await API.post('/users', { name, email });
        toast('User added successfully!');
        e.target.reset();
        await loadUsers();
    } catch (err) { toast(err.message, 'error'); }
    finally { btn.disabled = false; btn.textContent = 'Add User'; }
}

async function deleteUser(id) {
    if (!confirm('Delete this user? This cannot be undone.')) return;
    try {
        await API.del(`/users/${id}`);
        toast('User deleted', 'info');
        await loadUsers();
    } catch (e) { toast(e.message, 'error'); }
}

// ═══════════════════════════════════════════════════════════
//  STATIONS
// ═══════════════════════════════════════════════════════════
async function loadStations() {
    setLoading('tbody-stations', 6);
    setRefreshSpin('refresh-stations', true);
    try {
        const stations = await API.get('/stations');
        setSideCount('badge-stations', stations.length);
        renderTable('tbody-stations', stations, [
            r => `<code class="id-cell" title="${r._id}">${r._id.slice(-8)}</code>`,
            r => `<strong>${escHtml(r.stationName)}</strong>`,
            r => `<span class="badge-line">${escHtml(r.line)}</span>`,
            r => r.location ? `${r.location.lat ?? '—'}, ${r.location.lng ?? '—'}` : '—',
            r => fmtDate(r.createdAt)
        ], 'deleteStation', 'count-stations', 'ts-stations');
    } catch (e) {
        document.getElementById('tbody-stations').innerHTML =
            `<tr><td colspan="6" class="empty-row error-row">⚠️ ${e.message}</td></tr>`;
        toast('Failed to load stations: ' + e.message, 'error');
    } finally { setRefreshSpin('refresh-stations', false); }
}

async function addStation(e) {
    e.preventDefault();
    clearErrors('form-stations');
    const btn         = e.target.querySelector('button[type=submit]');
    const stationName = document.getElementById('s-name').value.trim();
    const line        = document.getElementById('s-line').value.trim();
    const lat         = document.getElementById('s-lat').value;
    const lng         = document.getElementById('s-lng').value;

    // Client-side validation
    let valid = true;
    if (!stationName)               { fieldError('s-name', 'Station name is required');                   valid = false; }
    else if (stationName.length < 2){ fieldError('s-name', 'Must be at least 2 characters');              valid = false; }
    if (!line)                      { fieldError('s-line', 'Metro line is required');                     valid = false; }
    if (lat && (isNaN(lat) || lat < -90  || lat > 90))  { fieldError('s-lat', 'Lat must be -90 to 90');  valid = false; }
    if (lng && (isNaN(lng) || lng < -180 || lng > 180)) { fieldError('s-lng', 'Lng must be -180 to 180'); valid = false; }
    if (!valid) return;

    const body = { stationName, line };
    if (lat && lng) body.location = { lat: parseFloat(lat), lng: parseFloat(lng) };
    btn.disabled = true; btn.textContent = 'Adding…';
    try {
        await API.post('/stations', body);
        toast('Station added!');
        e.target.reset();
        await loadStations();
    } catch (err) { toast(err.message, 'error'); }
    finally { btn.disabled = false; btn.textContent = 'Add Station'; }
}

async function deleteStation(id) {
    if (!confirm('Delete this station?')) return;
    try {
        await API.del(`/stations/${id}`);
        toast('Station deleted', 'info');
        await loadStations();
    } catch (e) { toast(e.message, 'error'); }
}

// ═══════════════════════════════════════════════════════════
//  ROUTES
// ═══════════════════════════════════════════════════════════
async function loadRoutes() {
    setLoading('tbody-routes', 7);
    setRefreshSpin('refresh-routes', true);
    try {
        const routes = await API.get('/routes');
        setSideCount('badge-routes', routes.length);
        renderTable('tbody-routes', routes, [
            r => `<code class="id-cell" title="${r._id}">${r._id.slice(-8)}</code>`,
            r => r.fromStation ? `<strong>${escHtml(r.fromStation.stationName)}</strong>` : '—',
            r => r.toStation   ? `<strong>${escHtml(r.toStation.stationName)}</strong>`   : '—',
            r => `<span class="num-pill">${r.distance} km</span>`,
            r => `<span class="num-pill">${r.time} min</span>`,
            r => fmtDate(r.createdAt)
        ], 'deleteRoute', 'count-routes', 'ts-routes');
    } catch (e) {
        document.getElementById('tbody-routes').innerHTML =
            `<tr><td colspan="7" class="empty-row error-row">⚠️ ${e.message}</td></tr>`;
        toast('Failed to load routes: ' + e.message, 'error');
    } finally { setRefreshSpin('refresh-routes', false); }
}

async function addRoute(e) {
    e.preventDefault();
    clearErrors('form-routes');
    const btn         = e.target.querySelector('button[type=submit]');
    const fromStation = document.getElementById('r-from').value.trim();
    const toStation   = document.getElementById('r-to').value.trim();
    const distVal     = document.getElementById('r-dist').value;
    const timeVal     = document.getElementById('r-time').value;

    // Client-side validation
    let valid = true;
    if (!fromStation)                   { fieldError('r-from', 'From-station ID is required');            valid = false; }
    else if (!OBJECTID_RE.test(fromStation)) { fieldError('r-from', 'Must be a 24-char MongoDB ObjectId'); valid = false; }
    if (!toStation)                     { fieldError('r-to',   'To-station ID is required');              valid = false; }
    else if (!OBJECTID_RE.test(toStation))   { fieldError('r-to',   'Must be a 24-char MongoDB ObjectId'); valid = false; }
    if (fromStation && toStation && fromStation === toStation) { fieldError('r-to', 'Cannot be the same as From-station'); valid = false; }
    if (!distVal)                       { fieldError('r-dist', 'Distance is required');                   valid = false; }
    else if (isNaN(distVal) || distVal < 0) { fieldError('r-dist', 'Must be a positive number');          valid = false; }
    if (!timeVal)                       { fieldError('r-time', 'Travel time is required');                valid = false; }
    else if (isNaN(timeVal) || timeVal < 0) { fieldError('r-time', 'Must be a positive number');         valid = false; }
    if (!valid) return;

    btn.disabled = true; btn.textContent = 'Adding…';
    try {
        await API.post('/routes', { fromStation, toStation, distance: Number(distVal), time: Number(timeVal) });
        toast('Route added!');
        e.target.reset();
        await loadRoutes();
    } catch (err) { toast(err.message, 'error'); }
    finally { btn.disabled = false; btn.textContent = 'Add Route'; }
}

async function deleteRoute(id) {
    if (!confirm('Delete this route?')) return;
    try {
        await API.del(`/routes/${id}`);
        toast('Route deleted', 'info');
        await loadRoutes();
    } catch (e) { toast(e.message, 'error'); }
}

// ═══════════════════════════════════════════════════════════
//  BOOKINGS
// ═══════════════════════════════════════════════════════════
async function loadBookings() {
    setLoading('tbody-bookings', 7);
    setRefreshSpin('refresh-bookings', true);
    try {
        const bookings = await API.get('/bookings');
        setSideCount('badge-bookings', bookings.length);
        renderTable('tbody-bookings', bookings, [
            r => `<code class="id-cell" title="${r._id}">${r._id.slice(-8)}</code>`,
            r => r.user        ? `<strong>${escHtml(r.user.name)}</strong>`         : '—',
            r => r.fromStation ? escHtml(r.fromStation.stationName) : '—',
            r => r.toStation   ? escHtml(r.toStation.stationName)   : '—',
            r => fmtDate(r.date),
            r => `<span class="fare-pill">₹${r.fare}</span>`
        ], 'deleteBooking', 'count-bookings', 'ts-bookings');
    } catch (e) {
        document.getElementById('tbody-bookings').innerHTML =
            `<tr><td colspan="7" class="empty-row error-row">⚠️ ${e.message}</td></tr>`;
        toast('Failed to load bookings: ' + e.message, 'error');
    } finally { setRefreshSpin('refresh-bookings', false); }
}

async function addBooking(e) {
    e.preventDefault();
    clearErrors('form-bookings');
    const btn         = e.target.querySelector('button[type=submit]');
    const user        = document.getElementById('b-user').value.trim();
    const fromStation = document.getElementById('b-from').value.trim();
    const toStation   = document.getElementById('b-to').value.trim();
    const date        = document.getElementById('b-date').value || undefined;
    const fareVal     = document.getElementById('b-fare').value;

    // Client-side validation
    let valid = true;
    if (!user)                         { fieldError('b-user', 'User ID is required');                       valid = false; }
    else if (!OBJECTID_RE.test(user))  { fieldError('b-user', 'Must be a 24-char MongoDB ObjectId');        valid = false; }
    if (!fromStation)                  { fieldError('b-from', 'From-station ID is required');               valid = false; }
    else if (!OBJECTID_RE.test(fromStation)) { fieldError('b-from', 'Must be a 24-char MongoDB ObjectId'); valid = false; }
    if (!toStation)                    { fieldError('b-to',   'To-station ID is required');                 valid = false; }
    else if (!OBJECTID_RE.test(toStation))   { fieldError('b-to',   'Must be a 24-char MongoDB ObjectId'); valid = false; }
    if (fromStation && toStation && fromStation === toStation) { fieldError('b-to', 'Cannot be the same as From-station'); valid = false; }
    if (!fareVal)                      { fieldError('b-fare', 'Fare is required');                          valid = false; }
    else if (isNaN(fareVal) || fareVal < 0) { fieldError('b-fare', 'Fare must be a positive number');       valid = false; }
    if (!valid) return;

    btn.disabled = true; btn.textContent = 'Booking…';
    try {
        await API.post('/bookings', { user, fromStation, toStation, date, fare: Number(fareVal) });
        toast('Booking created!');
        e.target.reset();
        document.getElementById('b-date').value = new Date().toISOString().slice(0, 10);
        await loadBookings();
    } catch (err) { toast(err.message, 'error'); }
    finally { btn.disabled = false; btn.textContent = 'Book Ticket'; }
}

async function deleteBooking(id) {
    if (!confirm('Delete this booking?')) return;
    try {
        await API.del(`/bookings/${id}`);
        toast('Booking deleted', 'info');
        await loadBookings();
    } catch (e) { toast(e.message, 'error'); }
}

// ── Refresh all ──────────────────────────────────────────────
async function refreshAll() {
    await Promise.all([loadUsers(), loadStations(), loadRoutes(), loadBookings()]);
    toast('All data refreshed', 'info');
}

// ── Tab switching ────────────────────────────────────────────
function switchTab(name) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    document.querySelector(`.tab-btn[data-tab="${name}"]`).classList.add('active');
    document.getElementById(`tab-${name}`).classList.add('active');
}

// ── Utility ──────────────────────────────────────────────────
function escHtml(str) {
    return String(str ?? '').replace(/[&<>"']/g,
        c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function fmtDate(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
}
function fmtTime(d) {
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

// ── Bootstrap ────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.tab-btn').forEach(btn =>
        btn.addEventListener('click', () => switchTab(btn.dataset.tab)));

    document.getElementById('form-users').addEventListener('submit', addUser);
    document.getElementById('form-stations').addEventListener('submit', addStation);
    document.getElementById('form-routes').addEventListener('submit', addRoute);
    document.getElementById('form-bookings').addEventListener('submit', addBooking);

    // Refresh buttons
    document.getElementById('refresh-users').addEventListener('click', loadUsers);
    document.getElementById('refresh-stations').addEventListener('click', loadStations);
    document.getElementById('refresh-routes').addEventListener('click', loadRoutes);
    document.getElementById('refresh-bookings').addEventListener('click', loadBookings);
    document.getElementById('refresh-all-btn').addEventListener('click', refreshAll);

    // Default booking date
    const dInput = document.getElementById('b-date');
    if (dInput) dInput.value = new Date().toISOString().slice(0, 10);

    // Watch all ObjectId fields for instant error clearing
    ['r-from','r-to','b-user','b-from','b-to'].forEach(watchField);

    // Initial load
    loadUsers(); loadStations(); loadRoutes(); loadBookings();
});
