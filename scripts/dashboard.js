import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import * as FirebaseAuth from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import * as Firestore from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { firebaseConfig } from "./firebaseConfig.js";

const app = initializeApp(firebaseConfig);
const auth = FirebaseAuth.getAuth(app);
const db = Firestore.getFirestore(app);

const HH = 100;
const labelsCont = document.getElementById('vx-labels-cont');
const nowLine = document.getElementById('vx-line');

// State for editing
let editIndex = null;
let editType = null;

// Populate Time Labels (0:00 to 23:00)
if (labelsCont) {
    labelsCont.innerHTML = '';
    for (let i = 0; i < 24; i++) {
        const div = document.createElement('div');
        div.className = 'vx-time-slot';
        div.innerText = `${i}:00`;
        labelsCont.appendChild(div);
    }
}

function update() {
    const now = new Date();
    const clockEl = document.getElementById('vx-clock');
    if (clockEl) clockEl.innerText = now.toLocaleTimeString();

    const pos = ((now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60) / 60) * HH;
    if (nowLine) {
        const scale = window.innerWidth <= 640 ? 0.6 : 1;
        nowLine.style.top = (pos * scale) + 'px';
    }
}

function setDates() {
    const now = new Date();
    const start = new Date(now);
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); 
    start.setDate(diff);
    start.setHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        const el = document.getElementById(`vx-d${i}`);
        const names = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
        if (el) {
            el.innerHTML = `${names[i]}<br><span>${d.getDate()}</span>`;
            if (new Date().toDateString() === d.toDateString()) {
                el.style.background = "rgba(16, 185, 129, 0.2)";
                el.style.borderRadius = "4px";
            } else {
                el.style.background = "transparent";
            }
        }
        const col = document.getElementById(`col-${i}`);
        if (col) col.style.position = "relative";
    }
    return start;
}

let currentDeadlines = [];
let currentTasks = [];

function renderListings() {
    const dlList = document.getElementById('deadline-list');
    const taskList = document.getElementById('task-list');

    if (dlList) {
        if (currentDeadlines.length === 0) {
            dlList.innerHTML = '<p class="empty-msg">No deadlines found.</p>';
        } else {
            dlList.innerHTML = currentDeadlines.map((dl, index) => {
                const date = dl.deadline.toDate ? dl.deadline.toDate() : new Date(dl.deadline);
                return `
                    <div class="list-item" style="display:flex; justify-content:space-between; align-items:center; padding:12px; border-bottom:1px solid rgba(255,255,255,0.05);">
                        <div style="flex: 1;">
                            <div style="font-weight:bold; color:var(--accent-color, #10b981);">${dl.name}</div>
                            <div style="font-size:0.85rem; color:#94a3b8;">${date.toLocaleString()}</div>
                            ${dl.description ? `<div style="font-size:0.8rem; opacity:0.6; margin-top:4px; font-style: italic;">${dl.description}</div>` : ''}
                        </div>
                        <div style="display: flex; gap: 10px;">
                            <button class="edit-btn" data-type="deadline" data-index="${index}" style="background:none; border:none; color:#94a3b8; cursor:pointer;">✎</button>
                            <button class="del-btn" data-type="deadline" data-index="${index}" style="background:none; border:none; color:#ef4444; cursor:pointer; font-size:1.2rem;">&times;</button>
                        </div>
                    </div>
                `;
            }).join('');
        }
    }

    if (taskList) {
        if (currentTasks.length === 0) {
            taskList.innerHTML = '<p class="empty-msg">No recurring tasks found.</p>';
        } else {
            taskList.innerHTML = currentTasks.map((task, index) => `
                <div class="list-item" style="display:flex; justify-content:space-between; align-items:center; padding:12px; border-bottom:1px solid rgba(255,255,255,0.05);">
                    <div style="flex: 1;">
                        <div style="font-weight:bold; color:#6366f1;">${task.name}</div>
                        <div style="font-size:0.85rem; color:#94a3b8;">${task.time} - ${task.days.join(', ')}</div>
                        ${task.description ? `<div style="font-size:0.8rem; opacity:0.6; margin-top:4px; font-style: italic;">${task.description}</div>` : ''}
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button class="edit-btn" data-type="task" data-index="${index}" style="background:none; border:none; color:#94a3b8; cursor:pointer;">✎</button>
                        <button class="del-btn" data-type="task" data-index="${index}" style="background:none; border:none; color:#ef4444; cursor:pointer; font-size:1.2rem;">&times;</button>
                    </div>
                </div>
            `).join('');
        }
    }

    document.querySelectorAll('.del-btn').forEach(btn => {
        btn.onclick = (e) => handleDelete(e.currentTarget.dataset.type, e.currentTarget.dataset.index);
    });
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.onclick = (e) => openEditModal(e.currentTarget.dataset.type, e.currentTarget.dataset.index);
    });
}

function openEditModal(type, index) {
    editType = type;
    editIndex = parseInt(index);
    
    if (type === 'deadline') {
        const dl = currentDeadlines[editIndex];
        const date = dl.deadline.toDate ? dl.deadline.toDate() : new Date(dl.deadline);
        const dateStr = date.toISOString().slice(0, 16);
        
        document.getElementById('edit-dl-name').value = dl.name;
        document.getElementById('edit-dl-time').value = dateStr;
        document.getElementById('edit-dl-desc').value = dl.description || '';
        document.getElementById('edit-dl-modal').style.display = 'flex';
    } else {
        const task = currentTasks[editIndex];
        document.getElementById('edit-task-name').value = task.name;
        document.getElementById('edit-task-time').value = task.time;
        document.getElementById('edit-task-desc').value = task.description || '';
        
        const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
        const container = document.getElementById('edit-days-container');
        container.innerHTML = days.map(d => `
            <div style="position:relative;">
                <input type="checkbox" id="edit-day-${d}" value="${d}" class="day-checkbox edit-day-cb" ${task.days.includes(d) ? 'checked' : ''} tabindex="-1">
                <label for="edit-day-${d}" class="day-label" tabindex="0">${d.toUpperCase()}</label>
            </div>
        `).join('');
        
        document.getElementById('edit-task-modal').style.display = 'flex';
    }
}

async function handleSaveEdit() {
    const user = auth.currentUser;
    if (!user) return;

    let updatedArray = editType === 'deadline' ? [...currentDeadlines] : [...currentTasks];
    const field = editType === 'deadline' ? 'localDeadlines' : 'localTasks';

    if (editType === 'deadline') {
        const name = document.getElementById('edit-dl-name').value;
        const time = document.getElementById('edit-dl-time').value;
        const description = document.getElementById('edit-dl-desc').value;
        updatedArray[editIndex] = {
            ...updatedArray[editIndex],
            name,
            deadline: Firestore.Timestamp.fromDate(new Date(time)),
            description
        };
    } else {
        const name = document.getElementById('edit-task-name').value;
        const time = document.getElementById('edit-task-time').value;
        const description = document.getElementById('edit-task-desc').value;
        const days = Array.from(document.querySelectorAll('.edit-day-cb:checked')).map(cb => cb.value);
        updatedArray[editIndex] = {
            ...updatedArray[editIndex],
            name,
            time,
            days,
            description
        };
    }

    try {
        await Firestore.updateDoc(Firestore.doc(db, 'users', user.uid), {
            [field]: updatedArray
        });
        document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
        showStatus("Changes saved!");
    } catch (e) {
        showStatus("Error saving", "#ef4444");
    }
}

async function handleDelete(type, index) {
    const user = auth.currentUser;
    if (!user) return;
    const idx = parseInt(index);
    const field = type === 'deadline' ? 'localDeadlines' : 'localTasks';
    const array = type === 'deadline' ? currentDeadlines : currentTasks;
    const itemToRemove = array[idx];
    
    try {
        await Firestore.updateDoc(Firestore.doc(db, 'users', user.uid), {
            [field]: Firestore.arrayRemove(itemToRemove)
        });
        showStatus("Item deleted", "#ef4444");
    } catch (e) { showStatus("Error deleting", "#ef4444"); }
}

function renderSchedule() {
    const scale = window.innerWidth <= 640 ? 0.6 : 1;
    const effectiveHH = HH * scale;
    document.querySelectorAll('.vx-deadline-item').forEach(el => el.remove());

    const startOfWeek = setDates();
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    currentDeadlines.forEach((item) => {
        if (!item.deadline) return;
        const date = item.deadline.toDate ? item.deadline.toDate() : new Date(item.deadline);
        if (date >= startOfWeek && date < endOfWeek) {
            const day = date.getDay();
            const adjustedDay = day === 0 ? 6 : day - 1; 
            createCalendarEntry(item.name, date.getHours(), date.getMinutes(), adjustedDay, effectiveHH, "var(--accent-color, #10b981)");
        }
    });

    const dayMap = { 'mon': 0, 'tue': 1, 'wed': 2, 'thu': 3, 'fri': 4, 'sat': 5, 'sun': 6 };
    currentTasks.forEach((task) => {
        if (!task.time || !task.days) return;
        const [hours, minutes] = task.time.split(':').map(Number);
        task.days.forEach(dayStr => {
            const dayIdx = dayMap[dayStr.toLowerCase()];
            if (dayIdx !== undefined) {
                createCalendarEntry(task.name, hours, minutes, dayIdx, effectiveHH, "#6366f1");
            }
        });
    });
    renderListings();
}

function createCalendarEntry(name, hours, minutes, columnIdx, effectiveHH, color) {
    const col = document.getElementById(`col-${columnIdx}`);
    if (!col) return;
    const startH = hours + (minutes / 60);
    const div = document.createElement('div');
    div.className = 'vx-deadline-item';
    Object.assign(div.style, {
        position: "absolute",
        left: "4px",
        width: "calc(100% - 8px)",
        backgroundColor: color,
        color: "white",
        padding: "4px",
        borderRadius: "4px",
        fontSize: "11px",
        fontWeight: "bold",
        zIndex: "20",
        boxSizing: "border-box",
        top: (startH * effectiveHH) + 'px',
        height: '35px',
        overflow: "hidden",
        whiteSpace: "nowrap",
        textOverflow: "ellipsis"
    });
    div.innerHTML = `<span>${name}</span>`;
    col.appendChild(div);
}

function showStatus(msg, color = "#10b981") {
    const el = document.getElementById('status-msg');
    if (el) {
        el.innerText = msg;
        el.style.background = color;
        el.style.display = 'block';
        setTimeout(() => { el.style.display = 'none'; }, 3000);
    }
}

document.getElementById('save-dl-edit')?.addEventListener('click', handleSaveEdit);
document.getElementById('save-task-edit')?.addEventListener('click', handleSaveEdit);

document.getElementById('add-dl-btn')?.addEventListener('click', async () => {
    const user = auth.currentUser;
    if (!user) return showStatus("Login Required", "#ef4444");
    const name = document.getElementById('dl-name').value;
    const timeStr = document.getElementById('dl-time').value;
    const description = document.getElementById('dl-desc')?.value || '';
    if (!name || !timeStr) return showStatus("Fields required", "#f59e0b");
    const newEntry = { name, deadline: Firestore.Timestamp.fromDate(new Date(timeStr)), description };
    try {
        await Firestore.updateDoc(Firestore.doc(db, 'users', user.uid), {
            localDeadlines: Firestore.arrayUnion(newEntry)
        });
        showStatus("Deadline Added");
        document.getElementById('dl-name').value = '';
        document.getElementById('dl-time').value = '';
        if(document.getElementById('dl-desc')) document.getElementById('dl-desc').value = '';
    } catch (e) { showStatus("Save Error", "#ef4444"); }
});

document.getElementById('add-task-btn')?.addEventListener('click', async () => {
    const user = auth.currentUser;
    if (!user) return showStatus("Login Required", "#ef4444");
    const name = document.getElementById('task-name').value;
    const time = document.getElementById('task-time').value; 
    const description = document.getElementById('task-desc')?.value || '';
    const selectedDays = Array.from(document.querySelectorAll('.day-checkbox:not(.edit-day-cb):checked')).map(cb => cb.value);
    if (!name || !time || selectedDays.length === 0) return showStatus("Name, Time, and Days required", "#f59e0b");
    const newTask = { name, time, days: selectedDays, description };
    try {
        await Firestore.updateDoc(Firestore.doc(db, 'users', user.uid), {
            localTasks: Firestore.arrayUnion(newTask)
        });
        showStatus("Recurring Task Added", "#6366f1");
        document.getElementById('task-name').value = '';
        document.getElementById('task-time').value = '';
        if(document.getElementById('task-desc')) document.getElementById('task-desc').value = '';
        document.querySelectorAll('.day-checkbox:not(.edit-day-cb)').forEach(cb => cb.checked = false);
    } catch (e) { showStatus("Save Error", "#ef4444"); }
});

FirebaseAuth.onAuthStateChanged(auth, async (user) => {
    if (user) {
        Firestore.onSnapshot(Firestore.doc(db, "users", user.uid), (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                currentDeadlines = data.localDeadlines || [];
                currentTasks = data.localTasks || [];
                renderSchedule();
            }
        });
    } else if (!window.location.href.includes("login.html")) {
        window.location.href = "login.html";
    }
});

setDates();
update();
setInterval(update, 1000);
window.addEventListener('resize', renderSchedule);