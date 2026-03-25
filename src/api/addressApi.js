const API_URL = import.meta.env.VITE_API_URL;
/* ================= GET ADDRESSES ================= */
export const fetchAddresses = async () => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/api/v1/user/address`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch addresses");
  }

  return res.json();
};

/* ================= ADD / UPDATE ADDRESS ================= */
export const saveAddress = async (addressForm, editId = null) => {
  const token = localStorage.getItem("token");

  const url = editId
    ? `${API_URL}/api/v1/user/address/${editId}`
    : `${API_URL}/api/v1/user/address`;

  const res = await fetch(url, {
    method: editId ? "PUT" : "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(addressForm),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Address save failed");
  }

  return data;
};

/* ================= DELETE ADDRESS ================= */
export const deleteAddress = async (id) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/api/v1/user/address/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.json();
};

export const makeDefaultAddress = async (id) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/default/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Default update failed");
  }

  return data;
};