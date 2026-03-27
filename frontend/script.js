// აქ ვინახავ task-ებს
let tasks = [];

// აქ ვიღებ ელემენტებს
const form = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");

const searchInput = document.getElementById("search");
const filterPriority = document.getElementById("filterPriority");
const filterStatus = document.getElementById("filterStatus");


// ➕ ADD TASK
form.addEventListener("submit", async function (e) {
  e.preventDefault();

  // აქ ვაგროვებ მონაცემებს
  const task = {
    title: document.getElementById("title").value,
    description: document.getElementById("description").value,
    category: document.getElementById("category").value,
    priority: document.getElementById("priority").value,
    estimatedMinutes: document.getElementById("estimatedMinutes").value,
    status: document.getElementById("status").value,
    deadline: document.getElementById("deadline").value
  };

  // აქ ვაგზავნი backend-ში
  await fetch("http://localhost:3000/api/tasks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(task)
  });

  await loadTasks();
  form.reset();
});


// 📥 GET TASKS
async function loadTasks() {

  const res = await fetch("http://localhost:3000/api/tasks");
  const data = await res.json();

  tasks = data;

  renderTasks();
  await loadSummary();
  await loadDailyPlan();
}


// ❌ DELETE
async function deleteTask(id) {

  await fetch(`http://localhost:3000/api/tasks/${id}`, {
    method: "DELETE"
  });

  loadTasks();
}


// ✏️ UPDATE (done)
async function markDone(id) {

  await fetch(`http://localhost:3000/api/tasks/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ status: "done" })
  });

  loadTasks();
}


// 📊 SUMMARY
async function loadSummary() {

  const res = await fetch("http://localhost:3000/api/tasks/summary");
  const data = await res.json();

  document.getElementById("totalTasks").innerText = data.total;
  document.getElementById("pendingTasks").innerText = data.pending;
  document.getElementById("doneTasks").innerText = data.done;
  document.getElementById("highTasks").innerText = data.high;
  document.getElementById("totalMinutes").innerText = data.totalMinutes;
}


// 📅 DAILY PLAN
async function loadDailyPlan() {

  const res = await fetch("http://localhost:3000/api/plan/today");
  const data = await res.json();

  const dailyList = document.getElementById("dailyPlan");

  dailyList.innerHTML = "";

  if (data.length === 0) {
    dailyList.innerHTML = "<p>No tasks 😴</p>";
    return;
  }

  data.forEach(task => {

    const li = document.createElement("li");

    li.innerHTML = `
      <strong>${task.title}</strong><br>
      🔥 ${task.priority} | 📅 ${task.deadline || "No date"}
    `;

    dailyList.appendChild(li);
  });
}


// 🎨 RENDER + FILTER
function renderTasks() {

  taskList.innerHTML = "";

  const search = searchInput.value.toLowerCase();
  const priority = filterPriority.value;
  const status = filterStatus.value;

  const filteredTasks = tasks.filter(task => {
    return (
      task.title.toLowerCase().includes(search) &&
      (!priority || task.priority === priority) &&
      (!status || task.status === status)
    );
  });

  if (filteredTasks.length === 0) {
    taskList.innerHTML = "<p>No tasks 😴</p>";
    return;
  }

  filteredTasks.forEach(task => {

    const li = document.createElement("li");

    li.innerHTML = `
      <strong>${task.title}</strong><br>
      ${task.description || ""}<br>
      📂 ${task.category || ""}<br>
      ⏱ ${task.estimatedMinutes || 0} min<br>
      📅 ${task.deadline || ""}<br>
      🔥 ${task.priority} | ${task.status}<br><br>

      <button onclick="deleteTask(${task.id})">❌ Delete</button>
      <button onclick="markDone(${task.id})">✅ Done</button>
    `;

    taskList.appendChild(li);
  });
}


// filters
searchInput.addEventListener("input", renderTasks);
filterPriority.addEventListener("change", renderTasks);
filterStatus.addEventListener("change", renderTasks);


// INIT
loadTasks();