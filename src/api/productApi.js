import { getToken } from "../utils/auth";

const API_URL = import.meta.env.VITE_API_URL;

// COMMON HEADERS
const getHeaders = () => ({
  Authorization: `Bearer ${getToken()}`
});

// ✅ ADMIN PRODUCTS
export const fetchAdminProducts = async () => {
  const res = await fetch(`${API_URL}/api/v1/products/admin/products`, {
    headers: getHeaders(),
  });
  return res.json();
};

// ✅ DELETE
export const deleteProductApi = async (id) => {
  const res = await fetch(`${API_URL}/api/v1/products/admin/product/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  return res.json();
};

// ✅ UPDATE
export const updateProductApi = async (id, formData) => {
  const res = await fetch(`${API_URL}/api/v1/products/admin/product/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: formData,
  });
  return res.json();
};

// ✅ TOGGLE STATUS
export const toggleProductApi = async (id) => {
  const res = await fetch(`${API_URL}/api/v1/products/admin/product/status/${id}`, {
    method: "PUT",
    headers: getHeaders(),
  });
  return res.json();
};

// ✅ USER PRODUCTS
export const fetchUserProducts = async (query = "") => {
  const res = await fetch(`${API_URL}/api/v1/products${query}`);
  return res.json();
};

// ✅ CATEGORIES
export const fetchCategories = async () => {
  const res = await fetch(`${API_URL}/api/v1/categories/categories`);
  return res.json();
};