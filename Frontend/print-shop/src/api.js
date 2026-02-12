export const BASE_URL = (import.meta?.env?.VITE_API_URL || "http://localhost:3000").replace(
  /\/$/,
  ""
);

export const getToken = () => localStorage.getItem("token") || "";

export const setToken = (token) =>
  token ? localStorage.setItem("token", token) : localStorage.removeItem("token");

export const getMe = () => {
  try {
    return JSON.parse(localStorage.getItem("me") || "null");
  } catch {
    return null;
  }
};

export const setMe = (me) =>
  me ? localStorage.setItem("me", JSON.stringify(me)) : localStorage.removeItem("me");

const parseBody = async (res) => {
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json().catch(() => null);
  return res.text().catch(() => "");
};

export const apiDownloadBlob = async (path, { auth = false } = {}) => {
  const headers = {};

  if (auth) {
    const t = getToken();
    if (t) headers.Authorization = `Bearer ${t}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, { headers });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }

  const blob = await res.blob();
  const dispo = res.headers.get("content-disposition") || "";
  const match = dispo.match(/filename="?([^";]+)"?/i);
  const filename = match?.[1] || "download";

  return { blob, filename };
};

export const apiRequest = async (
  path,
  { method = "GET", body, auth = false, isForm = false } = {}
) => {
  const headers = { Accept: "application/json" };
  if (!isForm && body !== undefined) headers["Content-Type"] = "application/json";

  if (auth) {
    const t = getToken();
    if (t) headers.Authorization = `Bearer ${t}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
  });

  const data = await parseBody(res);

  if (!res.ok) {
    const msg =
      typeof data === "string" ? data : data?.error || data?.message || `HTTP ${res.status}`;

    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
};

export const api = {
  register: (payload) => {
    const isForm = typeof FormData !== "undefined" && payload instanceof FormData;
    return apiRequest("/api/auth/register", { method: "POST", body: payload, isForm });
  },

  login: (payload) => apiRequest("/api/auth/login", { method: "POST", body: payload }),

  changePassword: (payload) =>
    apiRequest("/api/auth/password-change", {
      method: "PUT",
      body: payload,
      auth: true,
    }),

  getUserById: (id) => apiRequest(`/api/users/${id}`, { auth: true }),

  updateUser: (id, payload) =>
    apiRequest(`/api/users/${id}`, { method: "PUT", body: payload, auth: true }),

  updateUserProfileImage: (id, file) => {
    const fd = new FormData();
    fd.append("file", file);

    return apiRequest(`/api/users/${id}/profile-image`, {
      method: "POST",
      body: fd,
      auth: true,
      isForm: true,
    });
  },

  deleteUser: (id) => apiRequest(`/api/users/${id}`, { method: "DELETE" }),

  getProducts: () => apiRequest("/api/products"),

  getProductById: (id) => apiRequest(`/api/products/${id}`),

  adminCreateProduct: (payload) =>
    apiRequest("/api/admin/products", { method: "POST", body: payload, auth: true }),

  adminUpdateProduct: (id, payload) =>
    apiRequest(`/api/admin/products/${id}`, {
      method: "PUT",
      body: payload,
      auth: true,
    }),

  adminDeleteProduct: (id) =>
    apiRequest(`/api/admin/products/${id}`, { method: "DELETE", auth: true }),

  adminOrderAnalytics: () => apiRequest("/api/admin/analytics/orders", { auth: true }),

  adminLoginAnalytics: (id) =>
    apiRequest(`/api/admin/analytics/logins/${id}`, { auth: true }),

  uploadFile: (file) => {
    const fd = new FormData();
    fd.append("file", file);

    return apiRequest("/api/file/upload", {
      method: "POST",
      body: fd,
      auth: true,
      isForm: true,
    });
  },

  uploadFilesMultiple: (files) => {
    const fd = new FormData();
    [...files].forEach((f) => fd.append("files", f));

    return apiRequest("/api/file/uploads", {
      method: "POST",
      body: fd,
      auth: true,
      isForm: true,
    });
  },

  downloadFile: (id) => apiDownloadBlob(`/api/file/${id}`, { auth: true }),

  deleteFile: (id) => apiRequest(`/api/file/${id}`, { method: "DELETE", auth: true }),

  createOrder: (payload) =>
    apiRequest("/api/order", { method: "POST", body: payload, auth: true }),

  getOrder: (id) => apiRequest(`/api/order/${id}`),

  adminUpdateOrderStatus: (id, payload) =>
    apiRequest(`/api/admin/order/${id}`, {
      method: "PUT",
      body: payload,
      auth: true,
    }),

  getUserOrders: (userId) => apiRequest(`/api/users/${userId}/orders`, { auth: true }),

  createSystemLog: (payload) =>
    apiRequest("/api/system/logs", { method: "POST", body: payload, auth: true }),

  getAuditLogs: (id) => apiRequest(`/api/admin/logs/${id}`, { auth: true }),

  createRating: (payload) =>
    apiRequest("/api/ratings", { method: "POST", body: payload, auth: true }),

  getRatingAverage: () => apiRequest("/api/ratings/avg"),

  getAllRatings: () => apiRequest("/api/ratings/all", { auth: true }),
};