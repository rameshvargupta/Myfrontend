const BASE_URL = "/api/v1/coupons/admin";

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
    apiRequest(`${BASE_URL}/create`, "POST", data),

  // GET ALL
  getAllCoupons: () =>
    apiRequest(`${BASE_URL}/all`),

  // UPDATE
  updateCoupon: (id, data) =>
    apiRequest(`${BASE_URL}/update/${id}`, "PUT", data),

  // DELETE
  deleteCoupon: (id) =>
    apiRequest(`${BASE_URL}/delete/${id}`, "DELETE"),

  // TOGGLE ACTIVE
  toggleCoupon: (id) =>
    apiRequest(`${BASE_URL}/toggle/${id}`, "PATCH")

};