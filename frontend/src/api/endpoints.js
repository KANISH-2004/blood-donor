import client from "./client";

// --- Auth ---
export const registerUser = (payload) => client.post("/auth/register", payload);
export const loginUser = (payload) => client.post("/auth/login", payload);
export const fetchMe = () => client.get("/auth/me");

// --- Donors ---
export const upsertDonorProfile = (payload) => client.post("/donors/profile", payload);
export const getMyDonorProfile = () => client.get("/donors/profile/me");
export const updateMyDonorProfile = (payload) => client.patch("/donors/profile/me", payload);
export const searchDonors = (params) => client.get("/donors/search", { params });

// --- Blood requests ---
export const createRequest = (payload) => client.post("/requests", payload);
export const listRequests = (params) => client.get("/requests", { params });
export const myRequests = () => client.get("/requests/mine");
export const getRequest = (id) => client.get(`/requests/${id}`);
export const updateRequest = (id, payload) => client.patch(`/requests/${id}`, payload);
export const cancelRequest = (id) => client.delete(`/requests/${id}`);

// --- Matching ---
export const runMatching = (requestId) => client.post(`/matching/requests/${requestId}/run`);
export const getMatches = (requestId) => client.get(`/matching/requests/${requestId}`);
export const acceptMatch = (matchId) => client.post(`/matching/matches/${matchId}/accept`);
export const matchingDisclaimer = () => client.get("/matching/disclaimer");

// --- Notifications ---
export const listNotifications = () => client.get("/notifications");
export const markNotificationRead = (id) => client.patch(`/notifications/${id}/read`);
export const markAllRead = () => client.post("/notifications/read-all");

// --- Admin ---
export const adminStats = () => client.get("/admin/stats");
export const adminListUsers = () => client.get("/admin/users");
export const adminListDonors = () => client.get("/admin/donors");
export const adminListRequests = () => client.get("/admin/requests");
export const adminSuspendUser = (id, reason) => client.post(`/admin/users/${id}/suspend`, null, { params: { reason } });
export const adminReactivateUser = (id) => client.post(`/admin/users/${id}/reactivate`);
export const adminRemoveRequest = (id) => client.post(`/admin/requests/${id}/remove`);
