const BASE_URL = "/api";

async function request(endpoint, options = {}) {
  const config = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    credentials: "include", // Essential for HttpOnly cookie authentication
    ...options,
  };

  if (config.body && typeof config.body === "object") {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data?.message || "An unexpected error occurred";
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // URL Shortening & Analytics
  createShortUrl: (body) => request("/create", { method: "POST", body }),
  getUrlAnalytics: (code) => request(`/urls/analytics/${code}`, { method: "GET" }),

  // Authentication
  register: (body) => request("/auth/register", { method: "POST", body }),
  login: (body) => request("/auth/login", { method: "POST", body }),
  logout: () => request("/auth/logout", { method: "POST" }),
  getMe: () => request("/auth/me", { method: "GET" }),

  // User Dashboard
  getUserUrls: () => request("/user/urls", { method: "GET" }),
  getUserStats: () => request("/user/stats", { method: "GET" }),
  deleteUserUrl: (id) => request(`/user/urls/${id}`, { method: "DELETE" }),
};
