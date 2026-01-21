export const getToken = () => localStorage.getItem("token");

export const isAdmin = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  return user?.role === "admin";
};
