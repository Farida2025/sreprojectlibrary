const API_BASE = location.origin.includes(":5000") ? "" : "http://" + location.hostname + ":5000";


function getToken() {
  return localStorage.getItem("token");
}
function setToken(t) {
  localStorage.setItem("token", t);
}
function setUser(u) {
  localStorage.setItem("user", JSON.stringify(u));
}
function getUser() {
  const raw = localStorage.getItem("user");
  return raw ? JSON.parse(raw) : null;
}
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  location.href = "index.html";
}

async function api(path, { method = "GET", body = null, auth = false } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = "Bearer " + token;
  }
  const res = await fetch(API_BASE + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    let msg = data.message || "Request failed";
    if (data.details) msg += "\n" + data.details;
    throw new Error(msg);
  }
  return data;
}

function renderNav() {
  const user = getUser();
  const nav = document.getElementById("nav");
  const authBox = document.getElementById("authBox");
  if (!nav || !authBox) return;

  const isLoggedIn = !!(user && getToken());
  const isAdmin = isLoggedIn && user.role === "admin";

  nav.innerHTML = `
    <a href="index.html">Home</a>
    <a href="books.html">Books</a>
    ${isLoggedIn ? `<a href="myloans.html">My Loans</a>` : ""}
    ${isAdmin ? `<a href="analytics.html">Analytics</a> <a href="admin.html">Admin</a>` : ""}
  `;

  if (isLoggedIn) {
    authBox.innerHTML = `
      <span>Logged in: <b>${user.name}</b> (${user.role})</span>
      <button onclick="logout()">Logout</button>
    `;
  } else {
    authBox.innerHTML = `
      <a href="register.html" style="color:white;margin-right:12px;">Register</a>
      <a href="login.html" style="color:white;margin-right:12px;">Login</a>
    `;
  }
}

document.addEventListener("DOMContentLoaded", renderNav);
