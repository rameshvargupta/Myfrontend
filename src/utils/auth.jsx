export const getToken = () => localStorage.getItem("token");

export const isAdmin = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  return user?.role === "admin";
};

export const fetchWithRetry = async (url, options = {}, retries = 3) => {
  try {
    const res = await fetch(url, options);

    // 🔥 401 handle (auto logout)
    if (res.status === 401) {
      localStorage.clear();
      window.location.href = "/login";
      return;
    }

    if (!res.ok) throw new Error("Failed");

    return await res.json();
  } catch (err) {
    if (retries > 0) {
      await new Promise((r) => setTimeout(r, 2000));
      return fetchWithRetry(url, options, retries - 1);
    } else {
      throw err;
    }
  }
};