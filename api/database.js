import sqlite3 from "sqlite3";
import bcrypt from "bcrypt";

const db = new sqlite3.Database("./whisper-dashboard.db");

const saltRounds = 10;

// create users table if it doesn't exist with a default admin user
db.serialize(() => {
  db.each("SELECT * FROM users", (err, rows) => {
    if (!err || rows) return;
    db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, password TEXT, email TEXT, role TEXt, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)", async () => {
      await createUser({ username: "admin", password: "admin", email: "test@mail.com", role: "admin" });
    });
  });
});

export async function createUser({ username, password, email, role }) {
  password = await bcrypt.hash(password, saltRounds);
  return new Promise((resolve, reject) => {
    db.run("INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)", [username, password, email, role], function (err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID });
      }
    });
  });
}

export async function getUserById(id) {
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM users WHERE id = ?", [id], (err, row) => {
      if (err) {
        reject(err);
      } else {
        delete row.password;
        resolve(row);
      }
    });
  });
}

export async function getUserByUsername(username, { keepPassword } = {}) {
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
      if (err) {
        reject(err);
      } else {
        if (!keepPassword) delete row.password;
        resolve(row);
      }
    });
  });
}

export async function checkUserCredentials(username, password) {
  const user = await getUserByUsername(username, { keepPassword: true });
  if (!user) return null;
  if (!(await bcrypt.compare(password, user.password))) return null;
  delete user.password;
  return user;
}

export async function getUsers({ limit, offset } = {}) {
  return new Promise((resolve, reject) => {
    const params = [];
    if (limit) params.push(limit);
    if (offset) params.push(offset);
    db.all(`SELECT * FROM users ${limit ? "LIMIT ?" : ""} ${offset ? "OFFSET ?" : ""}`, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        for (const row of rows) {
          delete row.password;
        }
        resolve(rows);
      }
    });
  });
}

export async function updateUser({ id, username, password, email, role } = {}) {
  return new Promise(async (resolve, reject) => {
    const params = [];
    if (username) params.push(username);
    if (password) params.push(await bcrypt.hash(password, saltRounds));
    if (email) params.push(email);
    if (role) params.push(role);
    if (!params.length) {
      reject(new Error("Nothing to update"));
    }
    db.run(`UPDATE users SET ${username ? "username = ?" : ""} ${password ? "password = ?" : ""} ${email ? "email = ?" : ""} ${role ? "role = ?" : ""} WHERE id = ?`, [...params, id], (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

export async function deleteUser(id) {
  return new Promise((resolve, reject) => {
    db.run("DELETE FROM users WHERE id = ?", [id], (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

export default db;