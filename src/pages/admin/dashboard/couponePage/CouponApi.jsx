const API_URL = import.meta.env.VITE_API_URL;


// Helper API
const apiRequest = async (url, method = "GET", body = null) => {

  try {

    const token = localStorage.getItem("token");

    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      }
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const res = await fetch(url, options);
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "API Error");
    }

    return data;

  } catch (error) {

    return {
      success: false,
      message: error.message
    };

  }

};

export const CouponApi = {

  // CREATE
  createCoupon: (data) =>
    apiRequest(`${API_URL}/api/v1/coupons/admin/create`, "POST", data),

  // GET ALL
  getAllCoupons: () =>
    apiRequest(`${API_URL}/api/v1/coupons/admin/all`),

  // UPDATE
  updateCoupon: (id, data) =>
    apiRequest(`${API_URL}/api/v1/coupons/admin/update/${id}`, "PUT", data),

  // DELETE
  deleteCoupon: (id) =>
    apiRequest(`${API_URL}/api/v1/coupons/admin/delete/${id}`, "DELETE"),

  // TOGGLE ACTIVE
  toggleCoupon: (id) =>
    apiRequest(`${API_URL}/api/v1/coupons/admin/toggle/${id}`, "PATCH")

};