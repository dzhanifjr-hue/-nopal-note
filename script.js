// ===== Nopal Note — To Do List =====
// Penyimpanan data di localStorage (browser) tanpa library tambahan.

const STORAGE_KEY = "nopal-note.todos";
const THEME_KEY = "nopal-note.theme";

// Ambil elemen DOM
const form = document.getElementById("todoForm");
const input = document.getElementById("todoInput");
const list = document.getElementById("todoList");
const emptyState = document.getElementById("emptyState");
const counter = document.getElementById("counter");
const clearDoneBtn = document.getElementById("clearDone");
const filterBtns = document.querySelectorAll(".filter");
const themeToggle = document.getElementById("themeToggle");

// State aplikasi
let todos = loadTodos();
let currentFilter = "all";

// ===== Penyimpanan =====
function loadTodos() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

// ===== Aksi data =====
function addTodo(text) {
  todos.unshift({
    id: Date.now().toString(),
    text: text.trim(),
    done: false,
  });
  saveTodos();
  render();
}

function toggleTodo(id) {
  const todo = todos.find((t) => t.id === id);
  if (todo) {
    todo.done = !todo.done;
    saveTodos();
    render();
  }
}

function deleteTodo(id) {
  todos = todos.filter((t) => t.id !== id);
  saveTodos();
  render();
}

function clearDone() {
  todos = todos.filter((t) => !t.done);
  saveTodos();
  render();
}

// ===== Render =====
function getFilteredTodos() {
  if (currentFilter === "active") return todos.filter((t) => !t.done);
  if (currentFilter === "done") return todos.filter((t) => t.done);
  return todos;
}

function render() {
  const visible = getFilteredTodos();
  list.innerHTML = "";

  visible.forEach((todo) => {
    const li = document.createElement("li");
    li.className = "todo" + (todo.done ? " is-done" : "");
    li.dataset.id = todo.id;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "todo__check";
    checkbox.checked = todo.done;
    checkbox.addEventListener("change", () => toggleTodo(todo.id));

    const span = document.createElement("span");
    span.className = "todo__text";
    span.textContent = todo.text;
    span.addEventListener("click", () => toggleTodo(todo.id));

    const del = document.createElement("button");
    del.className = "todo__delete";
    del.type = "button";
    del.setAttribute("aria-label", "Hapus tugas");
    del.textContent = "✕";
    del.addEventListener("click", () => deleteTodo(todo.id));

    li.append(checkbox, span, del);
    list.appendChild(li);
  });

  // Empty state
  emptyState.classList.toggle("is-visible", visible.length === 0);

  // Counter (jumlah tugas aktif)
  const remaining = todos.filter((t) => !t.done).length;
  counter.textContent = `${remaining} tugas tersisa`;
}

// ===== Event listeners =====
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  addTodo(text);
  input.value = "";
  input.focus();
});

clearDoneBtn.addEventListener("click", clearDone);

filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterBtns.forEach((b) => b.classList.remove("is-active"));
    btn.classList.add("is-active");
    currentFilter = btn.dataset.filter;
    render();
  });
});

// ===== Tema (light/dark) =====
function applyTheme(theme) {
  if (theme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
    themeToggle.querySelector(".theme-toggle__icon").textContent = "☀️";
  } else {
    document.documentElement.removeAttribute("data-theme");
    themeToggle.querySelector(".theme-toggle__icon").textContent = "🌙";
  }
}

themeToggle.addEventListener("click", () => {
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  const next = isDark ? "light" : "dark";
  localStorage.setItem(THEME_KEY, next);
  applyTheme(next);
});

// ===== Inisialisasi =====
applyTheme(localStorage.getItem(THEME_KEY) || "light");
render();
