export const isAuthenticated = () => !!localStorage.getItem("token");
export const getUserId = () => localStorage.getItem("userId");
export const getRole = () => localStorage.getItem("role");