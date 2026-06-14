const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const db = new sqlite3.Database("./notes.db");

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      done INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

app.get("/api/todos", (req, res) => {
  db.all("SELECT * FROM todos ORDER BY id DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    const todos = rows.map((row) => ({
      id: row.id,
      text: row.text,
      done: row.done === 1,
      created_at: row.created_at,
    }));

    res.json(todos);
  });
});

app.post("/api/todos", (req, res) => {
  const { text } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({ error: "Catatan tidak boleh kosong" });
  }

  db.run(
    "INSERT INTO todos (text, done) VALUES (?, 0)",
    [text.trim()],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      res.json({
        id: this.lastID,
        text: text.trim(),
        done: false,
      });
    }
  );
});

app.patch("/api/todos/:id", (req, res) => {
  const { id } = req.params;
  const { done } = req.body;

  db.run(
    "UPDATE todos SET done = ? WHERE id = ?",
    [done ? 1 : 0, id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      res.json({ message: "Todo berhasil diupdate" });
    }
  );
});

app.delete("/api/todos/:id", (req, res) => {
  const { id } = req.params;

  db.run("DELETE FROM todos WHERE id = ?", [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });

    res.json({ message: "Todo berhasil dihapus" });
  });
});

app.delete("/api/todos-done", (req, res) => {
  db.run("DELETE FROM todos WHERE done = 1", [], function (err) {
    if (err) return res.status(500).json({ error: err.message });

    res.json({ message: "Todo selesai berhasil dihapus" });
  });
});

app.listen(PORT, () => {
  console.log(`Nopal Note fullstack berjalan di http://localhost:${PORT}`);
});