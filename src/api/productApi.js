import { getToken } from "../utils/auth";
const API_URL = import.meta.env.VITE_API_URL;

export const fetchAdminProducts = async () => {
  const res = await fetch(`${API_URL}/admin/products`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.json();
};

// ✅ UPDATED (query support added)
export const fetchUserProducts = async (query = "") => {
  const res = await fetch(`${API_URL}/products${query}`);
  return res.json();
};

export const deleteProductApi = async (id) => {
  const res = await fetch(`${API_URL}/admin/product/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.json();
};

export const updateProductApi = async (id, formData) => {
  const res = await fetch(`${API_URL}/admin/product/${id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${getToken()}` },
    body: formData,
  });
  return res.json();
};

export const fetchCategories = async () => {
  const res = await fetch(`${API_URL}/categories`);
  return res.json();
};