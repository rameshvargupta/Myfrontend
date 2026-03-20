import React, { useEffect, useRef, useState, useCallback } from "react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import {
  Trash2,
  UserX,
  UserCheck,
  Search,
  ChevronUp,
  ChevronDown,
  MoreVertical,
  RefreshCcw,
} from "lucide-react";
import FooterNavbar from "@/components/user/FooterNavbar";
import Navbar from "@/components/Navbar";

const UsersPanel = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [openMenu, setOpenMenu] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const token = localStorage.getItem("token");
  const menuRef = useRef(null);

  // ================= FETCH USERS DIRECTLY =================
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);

      const res = await fetch("http://localhost:5000/api/v1/user/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const data = await res.json();

      if (!res.ok || !data.success)
        throw new Error(data.message || "Failed to fetch users");

      const normalizedUsers = data.users.map((u) => ({
        _id: u._id,
        name:
          `${u.firstName || ""} ${u.lastName || ""}`.trim() ||
          "Unnamed User",
        email: u.email || "No Email",
        mobile: u.phoneNo || "—",
        avatar: u.profilePic || "/default-avatar.png",
        totalOrders: u.totalOrders || 0,
        cancelledOrders: u.cancelledOrders || 0,
        role: u.role || "user",
        isBlocked: u.isBlocked || false,
        createdAt: u.createdAt,
      }));

      setUsers(normalizedUsers);
      setFilteredUsers(normalizedUsers);
    } catch (err) {
      console.log(err);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      toast.error("Please login again");
      return;
    }

    fetchUsers();
  }, [fetchUsers, token]);

  // ================= SEARCH & SORT =================
  useEffect(() => {
    let result = [...users];

    if (search.trim() !== "") {
      result = result.filter((u) => {
        const name = u.name?.toLowerCase() || "";
        const email = u.email?.toLowerCase() || "";
        return (
          name.includes(search.toLowerCase()) ||
          email.includes(search.toLowerCase())
        );
      });
    }

    result.sort((a, b) =>
      sortOrder === "asc"
        ? (a.totalOrders || 0) - (b.totalOrders || 0)
        : (b.totalOrders || 0) - (a.totalOrders || 0)
    );

    setFilteredUsers(result);
  }, [search, users, sortOrder]);

  // ================= CLICK OUTSIDE CLOSE =================
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ================= BLOCK / UNBLOCK =================
  const handleBlock = async (id) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/v1/admin/users/block/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success)
        throw new Error(data.message);

      toast.success(data.message);

      // Re-sync from DB (100% safe)
      fetchUsers();
    } catch (err) {
      console.log(err);
      toast.error("Block action failed");
    }
  };

  // ================= DELETE USER =================
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?"))
      return;

    try {
      const res = await fetch(
        `http://localhost:5000/api/v1/admin/users/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success)
        throw new Error(data.message);

      toast.success("User deleted successfully");

      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      console.log(err);
      toast.error("Delete failed");
    }
  };

  // ================= MANUAL REFRESH =================
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUsers();
    setRefreshing(false);
  };

  // ================= CALCULATED STATS =================
  const totalUsers = users.length;
  const totalOrders = users.reduce(
    (acc, u) => acc + (u.totalOrders || 0),
    0
  );
  const cancelledOrders = users.reduce(
    (acc, u) => acc + (u.cancelledOrders || 0),
    0
  );

  return (
    <> <Navbar/>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 md:p-10 mb-15">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
          <div>
            <h2 className="text-4xl font-bold text-gray-800 tracking-tight">
              Users Management
            </h2>
            <p className="text-gray-500 mt-1">
              Monitor, manage and control your platform users
            </p>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-3 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
              />
            </div>

            <button
              onClick={handleRefresh}
              className="px-4 py-3 bg-white rounded-2xl shadow-sm border hover:bg-gray-50 transition flex items-center gap-2"
            >
              <RefreshCcw
                size={16}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <StatCard title="Total Users" value={totalUsers} color="indigo" />
          <StatCard title="Total Orders" value={totalOrders} color="green" />
          <StatCard title="Cancelled Orders" value={cancelledOrders} color="red" />
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="py-20 text-center text-gray-500">
              Loading users...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wider">
                  <tr>
                    <th className="px-6 py-4 text-left">User</th>
                    <th className="px-6 py-4 text-center">Mobile</th>
                    <th
                      className="px-6 py-4 text-center cursor-pointer"
                      onClick={() =>
                        setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                      }
                    >
                      <div className="flex items-center justify-center gap-1">
                        Orders
                        {sortOrder === "asc" ? (
                          <ChevronUp size={14} />
                        ) : (
                          <ChevronDown size={14} />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-center">Cancelled</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-center">Joined</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.map((user) => (
                    <tr
                      key={user._id}
                      className={`transition duration-200 ${user.isBlocked
                        ? "bg-red-50"
                        : "hover:bg-gray-50"
                        }`}
                    >
                      <td className="px-6 py-5">
                        <Link
                          to={`/admin/users/${user._id}`}
                          className="flex items-center gap-4 group"
                        >
                          <img
                            src={user.avatar}
                            className="w-12 h-12 rounded-2xl object-cover border shadow-sm"
                            alt="User"
                          />
                          <div>
                            <p
                              className={`font-semibold text-sm group-hover:text-indigo-600 transition ${user.isBlocked
                                ? "text-red-600"
                                : "text-gray-800"
                                }`}
                            >
                              {user.name}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {user.email}
                            </p>
                          </div>
                        </Link>
                      </td>

                      <td className="px-6 py-5 text-center text-gray-600">
                        {user.mobile}
                      </td>

                      <td className="px-6 py-5 text-center">
                        <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 font-semibold text-xs">
                          {user.totalOrders}
                        </span>
                      </td>

                      <td className="px-6 py-5 text-center">
                        <span className="px-3 py-1 rounded-full bg-red-50 text-red-600 font-semibold text-xs">
                          {user.cancelledOrders}
                        </span>
                      </td>

                      <td className="px-6 py-5 text-center">
                        <span
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold ${user.isBlocked
                            ? "bg-red-100 text-red-700"
                            : user.role === "admin"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-blue-100 text-blue-700"
                            }`}
                        >
                          {user.isBlocked ? "Blocked" : user.role}
                        </span>
                      </td>

                      <td className="px-6 py-5 text-center text-gray-500 text-xs">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>

                      <td className="px-6 py-5 relative">
                        <div className="flex justify-end">
                          <button
                            onClick={() =>
                              setOpenMenu(
                                openMenu === user._id ? null : user._id
                              )
                            }
                            className="p-2 rounded-xl hover:bg-gray-100 transition"
                          >
                            <MoreVertical size={18} />
                          </button>

                          {openMenu === user._id && (
                            <div
                              ref={menuRef}
                              className="absolute right-6 top-14 w-40 bg-white border border-gray-100 rounded-2xl shadow-xl z-20 overflow-hidden"
                            >
                              <button
                                onClick={() => {
                                  handleBlock(user._id);
                                  setOpenMenu(null);
                                }}
                                className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition flex items-center gap-2"
                              >
                                {user.isBlocked ? (
                                  <>
                                    <UserCheck
                                      size={16}
                                      className="text-emerald-600"
                                    />
                                    <span className="text-emerald-600">
                                      Unblock User
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <UserX
                                      size={16}
                                      className="text-yellow-600"
                                    />
                                    <span className="text-yellow-600">
                                      Block User
                                    </span>
                                  </>
                                )}
                              </button>

                              <button
                                onClick={() => {
                                  handleDelete(user._id);
                                  setOpenMenu(null);
                                }}
                                className="w-full text-left px-4 py-3 text-sm hover:bg-red-50 transition flex items-center gap-2 text-red-600"
                              >
                                <Trash2 size={16} />
                                Delete User
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan="7" className="text-center py-14 text-gray-400">
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <FooterNavbar/>
    </>
  );
};

// ================= STAT CARD COMPONENT =================
const StatCard = ({ title, value, color }) => {
  const colorMap = {
    indigo: "text-indigo-600",
    green: "text-green-600",
    red: "text-red-600",
  };

  return (
    <div className="bg-white rounded-3xl shadow-md p-6 hover:shadow-xl transition">
      <p className="text-sm text-gray-500">{title}</p>
      <h3 className={`text-3xl font-bold mt-2 ${colorMap[color]}`}>
        {value}
      </h3>
    </div>
  );
};

export default UsersPanel;