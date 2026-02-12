const BASE_URL = "http://localhost:5000/api/v1/user/address";

/* ================= GET ADDRESSES ================= */
export const fetchAddresses = async () => {
  const token = localStorage.getItem("token");

  const res = await fetch(BASE_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.json();
};

/* ================= ADD / UPDATE ADDRESS ================= */
export const saveAddress = async (addressForm, editId = null) => {
  const token = localStorage.getItem("token");

  const url = editId
    ? `${BASE_URL}/${editId}`   // ✅ id URL me bhejo
    : BASE_URL;

  const res = await fetch(url, {
    method: editId ? "PUT" : "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(addressForm), // ❌ addressId mat bhejo
  });

  return res.json();
};


/* ================= DELETE ADDRESS ================= */
export const deleteAddress = async (id) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.json();
};
