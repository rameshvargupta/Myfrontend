import { useSelector } from "react-redux";
import { useState } from "react";
import { FaEdit } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUser,
  FaMapMarkerAlt,
  FaShieldAlt,
  FaBoxOpen,
} from "react-icons/fa";
import EditProfileModal from "./EditProfileModal";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { setOrders } from "../../redux/orderSlice";
import AddressModal from "./AddressModal";
import { toast } from "sonner";
import { setUser } from "../../redux/userSlice";


const Profile = () => {
  const { user } = useSelector((state) => state.user);
  const orders = useSelector((state) => state.order?.orders) || [];
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editId, setEditId] = useState(null);

  const [addressForm, setAddressForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [activeTab, setActiveTab] = useState("profile");
  const [editOpen, setEditOpen] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [filterType, setFilterType] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 5;

  const confirmedOrders = orders.filter(
    (o) =>
      o.orderStatus === "Delivered" ||
      o.orderStatus === "Confirmed"
  ).length;

  const cancelledOrders = orders.filter(
    (o) =>
      o.orderStatus === "Cancelled" ||
      o.orderStatus === "Failed"
  ).length;


  const filteredOrders =
    filterType === "confirmed"
      ? orders.filter(
        (o) =>
          o.orderStatus === "Delivered" ||
          o.orderStatus === "Confirmed"
      )
      : filterType === "cancelled"
        ? orders.filter(
          (o) =>
            o.orderStatus === "Cancelled" ||
            o.orderStatus === "Failed"
        )
        : orders;

  const indexOfLast = currentPage * ordersPerPage;
  const indexOfFirst = indexOfLast - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const totalOrders = orders.length;

const handleSaveAddress = async () => {
  try {
    const token = localStorage.getItem("token");

    const url = editId
      ? `http://localhost:5000/api/v1/user/address/${editId}`
      : `http://localhost:5000/api/v1/user/address`;

    const method = editId ? "put" : "post";

    const { data } = await axios({
      method,
      url,
      data: addressForm,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (data?.addresses) {
      dispatch(setUser({ user: { ...user, addresses: data.addresses }, token }));
      localStorage.setItem("user", JSON.stringify({ ...user, addresses: data.addresses }));
    }

    toast.success(editId ? "Address Updated ✅" : "Address Added ✅");

    setShowAddressModal(false);
    setEditId(null);

  } catch (error) {
    toast.error("Failed to save address ❌");
    console.error(error);
  }
};


const handleDeleteAddress = async (id) => {
  try {
    const token = localStorage.getItem("token");

    const { data } = await axios.delete(
      `http://localhost:5000/api/v1/user/address/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (data?.addresses) {
      dispatch(setUser({ user: { ...user, addresses: data.addresses }, token }));
      localStorage.setItem("user", JSON.stringify({ ...user, addresses: data.addresses }));
    }

    toast.success("Address Deleted 🗑️");

  } catch (error) {
    toast.error("Delete Failed ❌");
    console.error(error);
  }
};


const dispatch = useDispatch();
if (!user) return null;


  useEffect(() => {
    const getOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(
          "http://localhost:5000/api/v1/orders/my-orders",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );


        dispatch(setOrders(data.orders));
      } catch (error) {
        console.error("Order fetch error:", error.response?.data);
      }
    };

    if (user?._id) {
      getOrders();
    }
  }, [dispatch, user]);



  return (
    <div className="min-h-screen relative bg-[#0f172a] text-white overflow-hidden ">

      {/* Soft Glow Background */}
      <div className="absolute top-[-200px] left-[-200px] w-[500px] h-[500px] bg-purple-600/30 blur-[160px] rounded-full" />
      <div className="absolute bottom-[-200px] right-[-200px] w-[500px] h-[500px] bg-indigo-600/30 blur-[160px] rounded-full" />

      <div className="relative max-w-7xl mx-auto px-6 md:px-12 py-20 grid md:grid-cols-[280px_1fr] gap-10 mt-20">

        {/* ================= SIDEBAR ================= */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-[0_0_40px_rgba(0,0,0,0.5)]"
        >
          <h2 className="text-2xl font-semibold mb-10 tracking-wide">
            My Account
          </h2>

          <SidebarBtn
            icon={<FaUser />}
            label="Profile"
            active={activeTab === "profile"}
            onClick={() => setActiveTab("profile")}
          />

          <SidebarBtn
            icon={<FaBoxOpen />}
            label="Orders"
            active={activeTab === "orders"}
            onClick={() => setActiveTab("orders")}
          />

          <SidebarBtn
            icon={<FaMapMarkerAlt />}
            label="Address"
            active={activeTab === "address"}
            onClick={() => setActiveTab("address")}
          />

          <SidebarBtn
            icon={<FaShieldAlt />}
            label="Security"
            active={activeTab === "security"}
            onClick={() => setActiveTab("security")}
          />
        </motion.div>

        {/* ================= MAIN CONTENT ================= */}
        <div className="space-y-10">

          <AnimatePresence mode="wait">

            {activeTab === "profile" && (
              <>
                <PremiumCard key="profile">

                  {/* Top Right Edit Icon */}
                  <div className="flex justify-end">
                    <button
                      onClick={() => setEditOpen(true)}
                      className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition"
                    >
                      <FaEdit />
                    </button>
                  </div>

                  <div className="flex flex-col md:flex-row gap-10 items-center mt-6">

                    {/* Avatar */}
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 blur-md opacity-70" />
                      <img
                        src={user.profilePic || "/default-user.png"}
                        className="relative w-36 h-36 rounded-full border-4 border-white/20 object-cover"
                      />
                    </div>

                    {/* User Details */}
                    <div className="flex-1 text-center md:text-left space-y-3">

                      <h2 className="text-4xl font-semibold tracking-tight">
                        {user.firstName} {user.lastName}
                      </h2>

                      <p className="text-gray-400">{user.email}</p>
                      <p className="text-gray-400">{user.phoneNo}</p>

                      {/* Status Badge */}
                      <div>
                        <span
                          className={`px-4 py-1 rounded-full text-sm font-medium ${user.status === "blocked"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-green-500/20 text-green-400"
                            }`}
                        >
                          {user.status === "blocked" ? "Blocked" : "Active"}
                        </span>
                      </div>

                      {/* Created Date */}
                      <p className="text-gray-500 text-sm mt-2">
                        Member since{" "}
                        {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </PremiumCard>

                {/* Edit Modal */}
                {editOpen && (
                  <EditProfileModal
                    user={user}
                    onClose={() => setEditOpen(false)}
                  />
                )}
              </>
            )}


            {activeTab === "orders" && (
              <PremiumCard key="orders">
                <h3 className="text-2xl font-semibold mb-8">
                  Order Overview
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  <ModernStat
                    title="Total Orders"
                    value={totalOrders}
                    type="all"
                    active={filterType === "all"}
                    onClick={() => {
                      setFilterType("all");
                      setShowTable(true);
                      setCurrentPage(1);
                    }}
                  />

                  <ModernStat
                    title="Confirmed Orders"
                    value={confirmedOrders}
                    type="confirmed"
                    active={filterType === "confirmed"}
                    onClick={() => {
                      setFilterType("confirmed");
                      setShowTable(true);
                      setCurrentPage(1);
                    }}
                  />

                  <ModernStat
                    title="Cancelled / Failed"
                    value={cancelledOrders}
                    type="cancelled"
                    active={filterType === "cancelled"}
                    onClick={() => {
                      setFilterType("cancelled");
                      setShowTable(true);
                      setCurrentPage(1);
                    }}
                  />
                </div>


                {/* 👇 TABLE SECTION */}
                {showTable && (
                  <div className="mt-10">

                    {/* ================= DESKTOP TABLE ================= */}
                    <div className="hidden md:block overflow-x-auto rounded-2xl border border-white/10">
                      <table className="w-full text-left">
                        <thead className="bg-white/10 text-gray-300 text-sm uppercase">
                          <tr>
                            <th className="p-4">Product</th>
                            <th className="p-4">Category</th>
                            <th className="p-4">Price</th>
                            <th className="p-4">Order Date</th>
                            <th className="p-4">Status</th>
                          </tr>
                        </thead>

                        <tbody>
                          {currentOrders.map((order) =>
                            order.orderItems.map((item, i) => (
                              <tr
                                key={order._id + i}
                                className="border-t border-white/10 hover:bg-white/5 transition"
                              >
                                <td className="p-4 flex items-center gap-4">
                                  <img
                                    src={
                                      item?.image?.trim()
                                        ? item.image
                                        : "https://via.placeholder.com/60"
                                    }
                                    alt={item?.productName}
                                    className="w-16 h-16 object-cover rounded-lg border border-white/10"
                                  />


                                  <div>
                                    <p className="font-medium">{item.productName}</p>
                                    <p className="text-xs text-gray-400">
                                      #{order._id.slice(-6)}
                                    </p>
                                  </div>
                                </td>

                                <td className="p-4 text-gray-300">
                                  {item.categoryName || "N/A"}
                                </td>

                                <td className="p-4 font-semibold text-indigo-400">
                                  ₹{order.totalAmount}
                                </td>

                                <td className="p-4 text-gray-400">
                                  {new Date(order.createdAt).toLocaleDateString()}
                                </td>

                                <td className="p-4">
                                  <span
                                    className={`px-3 py-1 rounded-full text-xs font-medium ${order.orderStatus === "Delivered"
                                      ? "bg-green-500/20 text-green-400"
                                      : order.orderStatus === "Cancelled"
                                        ? "bg-red-500/20 text-red-400"
                                        : "bg-yellow-500/20 text-yellow-400"
                                      }`}
                                  >
                                    {order.orderStatus}
                                  </span>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* ================= MOBILE CARD VIEW ================= */}
                    <div className="md:hidden space-y-6">
                      {currentOrders.map((order) =>
                        order.orderItems.map((item, i) => (
                          <div
                            key={order._id + i}
                            className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4"
                          >
                            {/* Top Section */}
                            <div className="flex gap-4">
                              <img
                                src={item?.image || "https://via.placeholder.com/80"}
                                alt={item?.productName}
                                className="w-20 h-20 rounded-xl object-cover border border-white/10"
                                onError={(e) => {
                                  e.target.src = "https://via.placeholder.com/80";
                                }}
                              />


                              <div className="flex-1">
                                <p className="font-medium">{item.productName}</p>
                                <p className="text-sm text-gray-400">
                                  {item.categoryName}
                                </p>
                                <p className="text-indigo-400 font-semibold mt-1">
                                  ₹{order.totalAmount}
                                </p>
                              </div>
                            </div>

                            {/* Bottom Section */}
                            <div className="flex justify-between items-center text-sm text-gray-400">
                              <span>
                                {new Date(order.createdAt).toLocaleDateString()}
                              </span>

                              <span
                                className={`px-3 py-1 rounded-full text-xs ${order.orderStatus === "Delivered"
                                  ? "bg-green-500/20 text-green-400"
                                  : order.orderStatus === "Cancelled"
                                    ? "bg-red-500/20 text-red-400"
                                    : "bg-yellow-500/20 text-yellow-400"
                                  }`}
                              >
                                {order.orderStatus}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* ================= PAGINATION ================= */}
                    {totalPages > 1 && (
                      <div className="flex justify-center mt-8 gap-2 flex-wrap">
                        {[...Array(totalPages)].map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setCurrentPage(i + 1)}
                            className={`px-4 py-2 rounded-lg border ${currentPage === i + 1
                              ? "bg-indigo-600 border-indigo-600"
                              : "bg-white/5 border-white/10 hover:bg-white/10"
                              }`}
                          >
                            {i + 1}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

              </PremiumCard>
            )}


            {activeTab === "address" && (
              <PremiumCard key="address">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-semibold">
                    Saved Addresses
                  </h3>

                  <button
                    onClick={() => {
                      setEditId(null);
                      setAddressForm({
                        fullName: "",
                        phone: "",
                        address: "",
                        city: "",
                        state: "",
                        pincode: "",
                      });
                      setShowAddressModal(true);
                    }}
                    className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 
    hover:scale-105 transition rounded-xl text-white shadow-lg"
                  >
                    + Add Address
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-8">

                  {user.addresses?.map((addr) => (
                    <div
                      key={addr._id}
                      className="bg-[#1e293b] border border-white/10 rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      {/* Top Section */}
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-white">
                            {addr.fullName}
                          </h3>
                          <p className="text-sm text-gray-400">{addr.phone}</p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditId(addr._id);
                              setAddressForm(addr);
                              setShowAddressModal(true);
                            }}
                            className="px-3 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white transition"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => handleDeleteAddress(addr._id)}
                            className="px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 rounded-lg text-white transition"
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="border-t border-white/10 my-4"></div>

                      {/* Address Details */}
                      <div className="text-gray-300 text-sm leading-relaxed space-y-1">
                        <p>{addr.address}</p>
                        <p>
                          {addr.city}, {addr.state} - {addr.pincode}
                        </p>
                      </div>
                    </div>
                  ))}


                </div>
              </PremiumCard>
            )}

            {activeTab === "security" && (
              <PremiumCard key="security">
                <h3 className="text-2xl font-semibold mb-8">
                  Security Settings
                </h3>

                <div className="space-y-5">
                  <SecurityBtn label="Change Password" />
                  <SecurityBtn label="Enable 2FA" />
                  <SecurityBtn label="Logout From All Devices" danger />
                </div>
              </PremiumCard>
            )}

          </AnimatePresence>
        </div>
      </div>

      {showAddressModal && (
        <AddressModal
          addressForm={addressForm}
          setAddressForm={setAddressForm}
          onClose={() => setShowAddressModal(false)}
          onSave={handleSaveAddress}
          editId={editId}
        />
      )}

    </div>
  );
};

export default Profile;

/* ================= COMPONENTS ================= */

const SidebarBtn = ({ icon, label, active, onClick }) => (
  <motion.button
    whileHover={{ scale: 1.03 }}
    onClick={onClick}
    className={`flex items-center gap-4 w-full px-5 py-3 rounded-xl mb-4 transition ${active
      ? "bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg"
      : "hover:bg-white/10 text-gray-300"
      }`}
  >
    {icon}
    {label}
  </motion.button>
);

const PremiumCard = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.4 }}
    className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-10 shadow-[0_10px_40px_rgba(0,0,0,0.6)]"
  >
    {children}
  </motion.div>
);


const ModernStat = ({ title, value, type, active, onClick }) => {
  let bgStyle = "from-indigo-600/20 to-purple-600/20";

  if (type === "confirmed") {
    bgStyle = "from-green-600/30 to-green-500/20";
  }

  if (type === "cancelled") {
    bgStyle = "from-red-600/30 to-red-500/20";
  }

  return (
    <motion.div
      whileHover={{ y: -8 }}
      onClick={onClick}
      className={`relative p-8 rounded-2xl bg-gradient-to-br ${bgStyle}
      border ${active ? "border-white" : "border-white/10"}
      cursor-pointer transition`}
    >
      <p className="text-gray-300">{title}</p>
      <p className="text-3xl font-semibold mt-4">{value}</p>
    </motion.div>
  );
};


const SecurityBtn = ({ label, danger }) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    className={`w-full px-6 py-4 rounded-xl text-left border border-white/10 transition ${danger
      ? "bg-red-600/20 hover:bg-red-600/40 text-red-300"
      : "bg-white/5 hover:bg-white/10"
      }`}
  >
    {label}
  </motion.button>
);
