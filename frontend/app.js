const BACKEND_URL = "http://localhost:8080/api";

let tasks = JSON.parse(localStorage.getItem("tasks") || "[]");

// ─── Section Navigation ───────────────────────────────
function showSection(name) {
  document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
  document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
  document.getElementById("section-" + name).classList.add("active");
  event.currentTarget.classList.add("active");
  if (name === "tasks") renderTasks();
  if (name === "progress") renderProgress();
}

// ─── Chat ─────────────────────────────────────────────
async function sendMessage() {
  const input = document.getElementById("user-input");
  const text = input.value.trim();
  if (!text) return;
  input.value = "";

  appendMessage("user", text);
  showTyping();

  try {
    const lower = text.toLowerCase();
    let endpoint = "/prioritize";
    if (lower.includes("schedule") || lower.includes("timetable")) {
      endpoint = "/schedule";
    }

    const res = await fetch(BACKEND_URL + endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tasks: text })
    });

    const data = await res.json();
    removeTyping();
    const reply = extractGeminiText(data);
    appendMessage("ai", reply);
  } catch (err) {
    removeTyping();
    appendMessage("ai", "Sorry, I couldn't connect to the backend. Make sure Spring Boot is running on port 8080.");
  }
}

function quickPrompt(text) {
  document.getElementById("user-input").value = text;
  sendMessage();
}

function appendMessage(role, text) {
  const chat = document.getElementById("chat-box");
  const div = document.createElement("div");
  div.className = "msg" + (role === "user" ? " user" : "");
  div.innerHTML = `
    <div class="avatar ${role}">${role === "ai" ? "AI" : "You"}</div>
    <div class="bubble ${role}">${formatText(text)}</div>
  `;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

function formatText(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br>");
}

function showTyping() {
  const chat = document.getElementById("chat-box");
  const div = document.createElement("div");
  div.className = "msg";
  div.id = "typing-indicator";
  div.innerHTML = `
    <div class="avatar ai">AI</div>
    <div class="typing"><span></span><span></span><span></span></div>
  `;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

function removeTyping() {
  const el = document.getElementById("typing-indicator");
  if (el) el.remove();
}

function extractGeminiText(data) {
  try {
    const parsed = typeof data === "string" ? JSON.parse(data) : data;
    return parsed.candidates[0].content.parts[0].text;
  } catch {
    return "I got a response but couldn't read it properly. Please try again.";
  }
}

// ─── Tasks ────────────────────────────────────────────
function addTask() {
  const input = document.getElementById("task-input");
  const text = input.value.trim();
  if (!text) return;
  input.value = "";

  tasks.push({ id: Date.now(), name: text, done: false });
  saveTasks();
  renderTasks();
  renderSidebarTasks();
}

function toggleTask(id) {
  tasks = tasks.map(t => t.id === id ? { ...t, done: !t.done } : t);
  saveTasks();
  renderTasks();
  renderProgress();
  renderSidebarTasks();
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  renderTasks();
  renderProgress();
  renderSidebarTasks();
}

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function renderTasks() {
  const list = document.getElementById("task-list");
  if (!list) return;
  if (tasks.length === 0) {
    list.innerHTML = `<p style="color:#52525b;font-size:13px;">No tasks yet. Add one above!</p>`;
    return;
  }
  list.innerHTML = tasks.map(t => `
    <div class="task-item ${t.done ? "done" : ""}">
      <input type="checkbox" class="task-check" ${t.done ? "checked" : ""} onchange="toggleTask(${t.id})"/>
      <span class="task-name">${t.name}</span>
      <button class="task-delete" onclick="deleteTask(${t.id})">
        <i class="ti ti-trash"></i>
      </button>
    </div>
  `).join("");
}

function renderSidebarTasks() {
  const container = document.getElementById("sidebar-tasks");
  if (!container) return;
  const pending = tasks.filter(t => !t.done).slice(0, 4);
  if (pending.length === 0) {
    container.innerHTML = `<div class="task-chip" style="color:#52525b">No pending tasks</div>`;
    return;
  }
  const colors = ["#E24B4A", "#EF9F27", "#639922", "#7F77DD"];
  container.innerHTML = pending.map((t, i) => `
    <div class="task-chip">
      <div class="task-dot" style="background:${colors[i % colors.length]}"></div>
      ${t.name.length > 22 ? t.name.substring(0, 22) + "..." : t.name}
    </div>
  `).join("");
}

// ─── Progress ─────────────────────────────────────────
function renderProgress() {
  const total = tasks.length;
  const done = tasks.filter(t => t.done).length;
  const pending = total - done;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  document.getElementById("prog-total").textContent = total;
  document.getElementById("prog-done").textContent = done;
  document.getElementById("prog-pending").textContent = pending;
  document.getElementById("prog-bar").style.width = percent + "%";
  document.getElementById("prog-percent").textContent = percent + "% completed";
}

// ─── Init ─────────────────────────────────────────────
renderSidebarTasks();
renderProgress();