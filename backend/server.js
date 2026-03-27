import express from "express";
import cors from "cors";

const app = express();

// აქ ვრთავ middleware-ებს
app.use(express.json());
app.use(cors());

// აქ ვინახავ task-ებს
let tasks = [];


// 🧪 TEST
app.get("/", (req, res) => {
  res.send("OK");
});


// 📥 GET ყველა task
app.get("/api/tasks", (req, res) => {
  res.json(tasks);
});


// ➕ CREATE
app.post("/api/tasks", (req, res) => {

  // აქ ვქმნი ახალ task-ს
  const task = {
    id: Date.now(),
    ...req.body
  };

  tasks.push(task);

  res.json(task);
});


// ✏️ UPDATE
app.put("/api/tasks/:id", (req, res) => {

  const id = Number(req.params.id);


  
  // აქ ვაახლებ task-ს
  tasks = tasks.map(task => {
    if (task.id === id) {
      return { ...task, ...req.body };
    }
    return task;
  });

  res.json({ message: "Task updated" });
});




// ❌ DELETE
app.delete("/api/tasks/:id", (req, res) => {

  const id = Number(req.params.id);

  // აქ ვშლი task-ს
  tasks = tasks.filter(task => task.id !== id);

  res.json({ message: "Task deleted" });
});


// 📊 SUMMARY
app.get("/api/tasks/summary", (req, res) => {

  const total = tasks.length;

  const pending = tasks.filter(t => t.status === "pending").length;
  const done = tasks.filter(t => t.status === "done").length;
  const high = tasks.filter(t => t.priority === "high").length;

  const totalMinutes = tasks.reduce((sum, t) => {
    return sum + Number(t.estimatedMinutes || 0);
  }, 0);

  res.json({
    total,
    pending,
    done,
    high,
    totalMinutes
  });
});


// 📅 DAILY PLAN
app.get("/api/plan/today", (req, res) => {

  // აქ ვტოვებ მხოლოდ აქტიურ task-ებს
  let activeTasks = tasks.filter(t => t.status !== "done");

  // აქ ვალაგებ priority + deadline
  activeTasks.sort((a, b) => {

    const order = { high: 3, medium: 2, low: 1 };

    if (order[b.priority] !== order[a.priority]) {
      return order[b.priority] - order[a.priority];
    }

    return new Date(a.deadline || 0) - new Date(b.deadline || 0);
  });

  res.json(activeTasks);
});


// 🚀 START
app.listen(3000, () => {
  console.log("SERVER STARTED");
});