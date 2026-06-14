// ===== Nopal Note — Fullstack To Do List =====

const THEME_KEY = "nopal-note.theme";
const API_URL = "/api/todos";

const form = document.getElementById("todoForm");
const input = document.getElementById("todoInput");
const list = document.getElementById("todoList");
const emptyState = document.getElementById("emptyState");
const counter = document.getElementById("counter");
const clearDoneBtn = document.getElementById("clearDone");
const filterBtns = document.querySelectorAll(".filter");
const themeToggle = document.getElementById("themeToggle");

let todos = [];
let currentFilter = "all";

async function loadTodos() {
  const res = await fetch(API_URL);
  todos = await res.json();
  render();
}

async function addTodo(text) {
  await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  await loadTodos();
}

async function toggleTodo(id) {
  const todo = todos.find((t) => t.id === id);
  if (!todo) return;

  await fetch(`${API_URL}/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ done: !todo.done }),
  });

  await loadTodos();
}

async function deleteTodo(id) {
  await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });

  await loadTodos();
}

async function clearDone() {
  await fetch("/api/todos-done", {
    method: "DELETE",
  });

  await loadTodos();
}

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

  emptyState.classList.toggle("is-visible", visible.length === 0);

  const remaining = todos.filter((t) => !t.done).length;
  counter.textContent = `${remaining} tugas tersisa`;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const text = input.value.trim();
  if (!text) return;

  await addTodo(text);

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

applyTheme(localStorage.getItem(THEME_KEY) || "light");
loadTodos();