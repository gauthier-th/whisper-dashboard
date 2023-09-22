import fs from "fs";
import path from "path";
import sqlite3 from "sqlite3";
import bcrypt from "bcrypt";

const dbPath = fs.existsSync("/config") ? "/config/whisper-dashboard.db" : path.join(path.resolve(), "whisper-dashboard.db");
const db = new sqlite3.Database(dbPath);

const saltRounds = 10;

// create users table if it doesn't exist with a default admin user
db.serialize(() => {
  db.each("SELECT * FROM users", (err, rows) => {
    if (!err || rows) return;
    db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, password TEXT, email TEXT, role TEXt, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)", async () => {
      await createUser({ username: "admin", password: "admin", email: "test@mail.com", role: "admin" });
      console.log("Created default user: admin/admin");
    });
    db.run("CREATE TABLE IF NOT EXISTS transcriptions (id INTEGER PRIMARY KEY AUTOINCREMENT, filename TEXT, path TEXT, size INTEGER, mimetype TEXT, duration INTEGER, status TEXT, user_id INTEGER, result TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP)");
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
    if (username) params.push(['username', username]);
    if (password) params.push(['password', await bcrypt.hash(password, saltRounds)]);
    if (email) params.push(['email',email]);
    if (role) params.push(['role', role]);
    if (!params.length) {
      reject(new Error("Nothing to update"));
    }
    const setString = params.map(([name, _]) => `${name} = ?`).join(", ");
    db.run(`UPDATE users SET ${setString} WHERE id = ?`, [...params.map(([_, value]) => value), id], (err) => {
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

export async function createTranscription({ filename, path, size, mimetype, duration, status, user_id, result }) {
  return new Promise((resolve, reject) => {
    db.run("INSERT INTO transcriptions (filename, path, size, mimetype, duration, status, user_id, result) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [filename, path, size, mimetype, duration, status, user_id, result], function (err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID });
      }
    });
  });
}

export async function getTranscriptionById(id) {
  return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM transcriptions WHERE id = ?`, [id], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

export async function getTranscriptions({ filters, filterParams, limit, offset, sort } = {}) {
  return new Promise((resolve, reject) => {
    const params = [];
    const whereFilters = (filters || []).join(" AND ");
    if (filterParams) params.push(...filterParams);
    if (limit) params.push(limit);
    if (offset) params.push(offset);
    db.all(`
      SELECT transcriptions.*, users.username FROM transcriptions
      INNER JOIN users ON transcriptions.user_id = users.id
      ${whereFilters ? `WHERE ${whereFilters}` : ""}
      ${sort ? `ORDER BY ${sort[0]} ${sort[1]}` : ""}
      ${limit ? "LIMIT ?" : ""}
      ${offset ? "OFFSET ?" : ""}
    `, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

export async function updateTranscription({ id, filename, path, size, mimetype, duration, status, user_id, result } = {}) {
  return new Promise(async (resolve, reject) => {
    const params = [];
    if (filename) params.push(["filename", filename]);
    if (path) params.push(["path", path]);
    if (size) params.push(["size", size]);
    if (mimetype) params.push(["mimetype", mimetype]);
    if (duration) params.push(["duration", duration]);
    if (status) params.push(["status", status]);
    if (user_id) params.push(["user_id", user_id]);
    if (result) params.push(["result", result]);
    if (!params.length) {
      reject(new Error("Nothing to update"));
    }
    const setString = params.map(([name, _]) => `${name} = ?`).join(", ");
    db.run(`UPDATE transcriptions SET ${setString} WHERE id = ?`, [...params.map(([_, value]) => value), id], (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

export async function deleteTranscription(id) {
  return new Promise((resolve, reject) => {
    db.run("DELETE FROM transcriptions WHERE id = ?", [id], (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

export default db;