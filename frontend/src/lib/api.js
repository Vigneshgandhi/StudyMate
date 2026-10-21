const API = "http://localhost:5001";

function getCookie(name) {
  const cookies = document.cookie.split(";");

  for (const cookie of cookies) {
    const [key, value] = cookie.trim().split("=");

    if (key === name) {
      return decodeURIComponent(value);
    }
  }

  return null;
}

export async function initCsrf() {
  await fetch(`${API}/api/csrf-token`, {
    credentials: "include",
  });
}

export async function apiFetch(url, options = {}) {
  let token = getCookie("csrf_token");

  if (!token) {
    await initCsrf();
    token = getCookie("csrf_token");
  }

  return fetch(`${API}${url}`, {
    ...options,
    credentials: "include",
    headers: {
      ...(options.headers || {}),
      "Content-Type": "application/json",
      "X-CSRF-Token": token || "",
    },
  });
}