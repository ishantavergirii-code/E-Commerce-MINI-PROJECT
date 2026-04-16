import { apiFetch, getToken, setToken } from "/assets/js/api.js";

async function refreshNavUser() {
  const userIcon = document.getElementById("userIcon");
  const topLinks = document.getElementById("topLinksList");
  if (!userIcon && !topLinks) return;

  const token = getToken();
  if (!token) {
    if (userIcon) {
      userIcon.src = "https://ui-avatars.com/api/?name=Guest&background=1f2937&color=fff";
    }
    return;
  }

  try {
    const { user } = await apiFetch("/api/user/profile", { auth: true });
    if (userIcon) {
      userIcon.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0f172a&color=fff`;
    }
    if (topLinks) {
      topLinks.innerHTML = `
        <li><a href="#" id="navLogout">Logout (${escapeHtml(user.name)})</a></li>
      `;
      document.getElementById("navLogout")?.addEventListener("click", (e) => {
        e.preventDefault();
        logoutUser();
      });
    }
  } catch {
    setToken("");
    if (userIcon) {
      userIcon.src = "https://ui-avatars.com/api/?name=Guest&background=1f2937&color=fff";
    }
  }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>'"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[c]));
}

export async function loginUser(event) {
  event.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  try {
    const res = await apiFetch("/api/auth/login", { method: "POST", body: { email, password } });
    setToken(res.token);
    alert("Login successful");
    window.location.href = "../HOME page/index.html";
  } catch (e) {
    alert(e.message || "Login failed");
  }
}

export async function registerUser(event) {
  event.preventDefault();
  const name = document.getElementById("reg-name").value;
  const email = document.getElementById("reg-email").value;
  const password = document.getElementById("reg-password").value;
  try {
    const res = await apiFetch("/api/auth/register", { method: "POST", body: { name, email, password } });
    setToken(res.token);
    alert("Account created");
    window.location.href = "../HOME page/index.html";
  } catch (e) {
    alert(e.message || "Registration failed");
  }
}

function logoutUser() {
  setToken("");
  alert("Logged out");
  window.location.reload();
}

document.addEventListener("DOMContentLoaded", () => {
  refreshNavUser();
});

// Non-module pages call onclick="loginUser(event)" — attach globals
window.loginUser = (e) => loginUser(e);
window.registerUser = (e) => registerUser(e);
window.logoutUser = logoutUser;
