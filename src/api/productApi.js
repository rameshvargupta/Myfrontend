import { getToken } from "../utils/auth";

const BASE_URL = "http://localhost:5000/api/v1";

export const fetchAdminProducts = async () => {
  const res = await fetch(`${BASE_URL}/admin/products`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.json();
};

export const fetchUserProducts = async () => {
  const res = await fetch(`${BASE_URL}/products`);
  return res.json();
};

export const deleteProductApi = async (id) => {
  const res = await fetch(`${BASE_URL}/admin/product/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.json();
};

export const updateProductApi = async (id, formData) => {
  const res = await fetch(`${BASE_URL}/admin/product/${id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${getToken()}` },
    body: formData,
  });
  return res.json();
};
