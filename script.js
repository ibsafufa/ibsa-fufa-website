const express = require("express");
const session = require("express-session");
const bcrypt = require("bcrypt");
const Database = require("better-sqlite3");
const path = require("path");

const app = express();
const db = new Database("messages.db");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax"
  }
}));

db.exec(
CREATE TABLE IF NOT EXISTS messages (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 name TEXT NOT NULL,
 email TEXT,
 message TEXT NOT NULL,
 created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
);

function auth(req, res, next) {
  if (!req.session.owner) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

app.post("/api/contact", (req, res) => {
  const { name, email, message } = req.body;

  if (!name  !message 
      name.length > 100 || message.length > 5000) {
    return res.status(400).json({ error: "Invalid message" });
  }

  db.prepare(
    "INSERT INTO messages (name,email,message) VALUES (?,?,?)"
  ).run(name, email || "", message);

  res.json({ success: true });
});

app.post("/api/owner/login", async (req, res) => {
  const { username, password } = req.body;

  if (
    username !== process.env.OWNER_USERNAME ||
    !process.env.OWNER_PASSWORD_HASH ||
    !(await bcrypt.compare(password || "", process.env.OWNER_PASSWORD_HASH))
  ) {
    return res.status(401).json({ error: "Invalid login" });
  }

  req.session.owner = true;
  res.json({ success: true });
});

app.get("/api/owner/messages", auth, (req, res) => {
  const messages = db.prepare(
    "SELECT * FROM messages ORDER BY id DESC"
  ).all();

  res.json(messages);
});

app.delete("/api/owner/messages/:id", auth, (req, res) => {
  db.prepare("DELETE FROM messages WHERE id=?").run(req.params.id);
  res.json({ success: true });
});

app.post("/api/owner/logout", auth, (req, res) => {
  req.session.destroy(() => res.json({ success: true }));
});

app.get("/owner", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "owner.html"));
});

app.listen(process.env.PORT || 3000, "0.0.0.0");
const toggle = document.querySelector('.menu-toggle');
const links = document.querySelector('.nav-links');
toggle.addEventListener('click', () => {
  const open = links.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(open));
  toggle.textContent = open ? '×' : '☰';
});
links.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  links.classList.remove('open');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.textContent = '☰';
}));
document.getElementById('year').textContent = new Date().getFullYear();

document.getElementById('contactForm').addEventListener('submit', event => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const subject = encodeURIComponent(`Website enquiry: ${data.get('service')}`);
  const body = encodeURIComponent(
    `Name: ${data.get('name')}\nReply contact: ${data.get('reply')}\nService: ${data.get('service')}\n\nMessage:\n${data.get('message')}`
  );
  // Replace YOUR_EMAIL@example.com with the business email before publishing.
  window.location.href = `mailto:YOUR_EMAIL@example.com?subject=${subject}&body=${body}`;
});
