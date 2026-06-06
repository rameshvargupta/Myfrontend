import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
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
  Users,
  ShoppingBag,
  XCircle,
  Shield,
  User,
  Mail,
  Phone,
  Calendar,
  LayoutGrid,
  Table,
  Filter,
  Eye,
  Ban,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import FooterNavbar from "@/components/user/FooterNavbar";
import Navbar from "@/components/Navbar";

const API_URL = import.meta.env.VITE_API_URL;

const UsersPanel = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [sortField, setSortField] = useState("totalOrders");
  const [sortOrder, setSortOrder] = useState("desc");
  const [openMenu, setOpenMenu] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState("card");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 9;

  const token = localStorage.getItem("token");
  const menuRef = useRef(null);

  // ================= FETCH USERS DIRECTLY =================
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/v1/user/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to fetch users");

      const normalizedUsers = data.users.map((u) => ({
        _id: u._id,
        name: `${u.firstName || ""} ${u.lastName || ""}`.trim() || "Unnamed User",
        email: u.email || "No Email",
        mobile: u.phoneNo || "—",
        avatar: u.profilePic || "/default-avatar.png",
        totalOrders: u.totalOrders || 0,
        cancelledOrders: u.cancelledOrders || 0,
        role: u.role || "user",
        isBlocked: u.isBlocked || false,
        createdAt: u.createdAt,
        address: u.address || "No address",
      }));

      setUsers(normalizedUsers);
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

  // ================= FILTER & SORT =================
  const filteredAndSortedUsers = useMemo(() => {
    let result = [...users];

    // Search filter
    if (search.trim() !== "") {
      result = result.filter((u) => {
        const name = u.name?.toLowerCase() || "";
        const email = u.email?.toLowerCase() || "";
        return name.includes(search.toLowerCase()) || email.includes(search.toLowerCase());
      });
    }

    // Status filter
    if (statusFilter === "active") {
      result = result.filter((u) => !u.isBlocked);
    } else if (statusFilter === "blocked") {
      result = result.filter((u) => u.isBlocked);
    }

    // Role filter
    if (roleFilter === "admin") {
      result = result.filter((u) => u.role === "admin");
    } else if (roleFilter === "user") {
      result = result.filter((u) => u.role === "user");
    }

    // Sort
    result.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === "createdAt") {
        valA = new Date(valA);
        valB = new Date(valB);
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [users, search, sortField, sortOrder, statusFilter, roleFilter]);

  // Pagination
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedUsers = filteredAndSortedUsers.slice(startIndex, startIndex + rowsPerPage);
  const totalPages = Math.ceil(filteredAndSortedUsers.length / rowsPerPage);

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
      const res = await fetch(`${API_URL}/api/v1/admin/users/block/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);
      toast.success(data.message);
      fetchUsers();
      setOpenMenu(null);
    } catch (err) {
      console.log(err);
      toast.error("Block action failed");
    }
  };

  // ================= DELETE USER =================
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(`${API_URL}/api/v1/admin/users/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);
      toast.success("User deleted successfully");
      fetchUsers();
      setOpenMenu(null);
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

  // ================= STATS =================
  const totalUsers = users.length;
  const activeUsers = users.filter(u => !u.isBlocked).length;
  const blockedUsers = users.filter(u => u.isBlocked).length;
  const adminUsers = users.filter(u => u.role === "admin").length;
  const totalOrders = users.reduce((acc, u) => acc + (u.totalOrders || 0), 0);
  const cancelledOrders = users.reduce((acc, u) => acc + (u.cancelledOrders || 0), 0);

  // Sort handler
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // Get status info
  const getStatusInfo = (user) => {
    if (user.isBlocked) {
      return { text: "Blocked", color: "bg-red-100 text-red-600", icon: Ban };
    }
    if (user.role === "admin") {
      return { text: "Admin", color: "bg-purple-100 text-purple-600", icon: Shield };
    }
    return { text: "Active", color: "bg-green-100 text-green-600", icon: CheckCircle };
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-2 lg:p-8 mb-12">

        {/* HEADER */}
        <div className="max-w-7xl mx-auto mb-6">
          <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl">
                  <Users className="text-white" size={24} />
                </div>
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  User Management
                </span>
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage and control all platform users
              </p>
            </div>

            <div className="flex gap-2 items-center">
              <button
                onClick={handleRefresh}
                className="bg-white border-2 border-gray-200 px-4 py-2 rounded-xl text-sm flex items-center gap-2 hover:bg-gray-50 transition-all"
                disabled={refreshing}
              >
                <RefreshCcw size={16} className={refreshing ? "animate-spin" : ""} />
                Refresh
              </button>

              <div className="flex bg-white/80 backdrop-blur-sm p-1 rounded-xl shadow-sm">
                <button
                  onClick={() => setViewMode("card")}
                  className={`p-2 rounded-lg transition-all ${viewMode === "card" ? "bg-indigo-100 text-indigo-600 shadow-sm" : "text-gray-500 hover:bg-gray-100"}`}
                >
                  <LayoutGrid size={18} />
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-2 rounded-lg transition-all ${viewMode === "table" ? "bg-indigo-100 text-indigo-600 shadow-sm" : "text-gray-500 hover:bg-gray-100"}`}
                >
                  <Table size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* STATS CARDS */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 mb-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Users</p>
                  <h2 className="text-2xl font-bold text-gray-800 mt-1">{totalUsers}</h2>
                </div>
                <div className="p-3 bg-indigo-100 rounded-xl group-hover:scale-110 transition-transform">
                  <Users size={22} className="text-indigo-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-5 hover:shadow-md transition-all group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600">Active Users</p>
                  <h2 className="text-2xl font-bold text-green-600 mt-1">{activeUsers}</h2>
                </div>
                <div className="p-3 bg-green-100 rounded-xl group-hover:scale-110 transition-transform">
                  <UserCheck size={22} className="text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-5 hover:shadow-md transition-all group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-600">Blocked Users</p>
                  <h2 className="text-2xl font-bold text-red-600 mt-1">{blockedUsers}</h2>
                </div>
                <div className="p-3 bg-red-100 rounded-xl group-hover:scale-110 transition-transform">
                  <UserX size={22} className="text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-purple-100 p-5 hover:shadow-md transition-all group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600">Admin Users</p>
                  <h2 className="text-2xl font-bold text-purple-600 mt-1">{adminUsers}</h2>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl group-hover:scale-110 transition-transform">
                  <Shield size={22} className="text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-5 hover:shadow-md transition-all group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600">Total Orders</p>
                  <h2 className="text-2xl font-bold text-orange-600 mt-1">{totalOrders}</h2>
                </div>
                <div className="p-3 bg-orange-100 rounded-xl group-hover:scale-110 transition-transform">
                  <ShoppingBag size={22} className="text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* SEARCH + FILTERS */}
          <div className="bg-white rounded-2xl shadow-sm border-0 p-4 mb-2">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  placeholder="Search by name or email..."
                  className="w-full border-2 border-gray-200 rounded-xl pl-11 pr-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="blocked">Blocked</option>
                </select>

                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                >
                  <option value="all">All Roles</option>
                  <option value="user">Users</option>
                  <option value="admin">Admins</option>
                </select>
              </div>
            </div>
          </div>

          {/* CONTENT */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="flex flex-col items-center gap-3">
                <RefreshCcw className="animate-spin text-indigo-600" size={40} />
                <p className="text-gray-500">Loading users...</p>
              </div>
            </div>
          ) : viewMode === "card" ? (
            /* CARD VIEW - MODERN ENHANCED */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedUsers.map((user) => {
                const statusInfo = getStatusInfo(user);
                const StatusIcon = statusInfo.icon;
                const isBlocked = user.isBlocked;
                const joinedDate = new Date(user.createdAt).toLocaleDateString();

                return (
                  <div key={user._id} className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
                    <div className={`h-1 ${isBlocked ? "bg-red-500" : user.role === "admin" ? "bg-gradient-to-r from-purple-500 to-pink-500" : "bg-gradient-to-r from-indigo-500 to-purple-600"}`}></div>

                    <div className="p-5">
                      {/* Header with Avatar */}
                      <div className="flex items-start gap-4 mb-4">
                        <Link to={`/admin/users/${user._id}`} className="flex-shrink-0">
                          <img
                            src={user.avatar}
                            className="w-16 h-16 rounded-2xl object-cover border-2 border-gray-200 shadow-sm group-hover:scale-105 transition-transform"
                            alt={user.name}
                          />
                        </Link>
                        <div className="flex-1 min-w-0">
                          <Link to={`/admin/users/${user._id}`}>
                            <h3 className={`font-bold text-lg truncate hover:text-indigo-600 transition ${isBlocked ? "text-red-600" : "text-gray-800"}`}>
                              {user.name}
                            </h3>
                          </Link>
                          <div className="flex items-center gap-1 mt-1">
                            <Mail size={12} className="text-gray-400" />
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                          </div>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Phone size={12} className="text-gray-400" />
                            <p className="text-xs text-gray-500">{user.mobile}</p>
                          </div>
                        </div>
                        <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full font-semibold ${statusInfo.color}`}>
                          <StatusIcon size={12} />
                          {statusInfo.text}
                        </span>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-3 text-center">
                          <ShoppingBag size={16} className="text-indigo-600 mx-auto mb-1" />
                          <p className="text-xs text-gray-500">Orders</p>
                          <p className="font-bold text-indigo-600 text-lg">{user.totalOrders}</p>
                        </div>
                        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-3 text-center">
                          <XCircle size={16} className="text-red-600 mx-auto mb-1" />
                          <p className="text-xs text-gray-500">Cancelled</p>
                          <p className="font-bold text-red-600 text-lg">{user.cancelledOrders}</p>
                        </div>
                      </div>

                      {/* Footer Info */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-1">
                          <Calendar size={12} className="text-gray-400" />
                          <p className="text-xs text-gray-500">Joined: {joinedDate}</p>
                        </div>

                        <div className="flex gap-2">
                          <Link
                            to={`/admin/users/${user._id}`}
                            className="p-2 rounded-xl transition-all bg-gray-100 text-gray-600 hover:bg-indigo-100 hover:text-indigo-600"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </Link>
                          <button
                            onClick={() => handleBlock(user._id)}
                            className={`p-2 rounded-xl transition-all ${isBlocked ? "bg-green-100 text-green-600 hover:bg-green-200" : "bg-orange-100 text-orange-600 hover:bg-orange-200"}`}
                            title={isBlocked ? "Unblock User" : "Block User"}
                          >
                            {isBlocked ? <UserCheck size={16} /> : <UserX size={16} />}
                          </button>
                          <button
                            onClick={() => handleDelete(user._id)}
                            className="p-2 rounded-xl transition-all bg-red-100 text-red-600 hover:bg-red-200"
                            title="Delete User"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredAndSortedUsers.length === 0 && (
                <div className="col-span-full text-center py-14">
                  <div className="flex flex-col items-center gap-3">
                    <AlertCircle size={48} className="text-gray-300" />
                    <p className="text-gray-400">No users found</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* TABLE VIEW - ENHANCED */
            <div className="bg-white rounded-2xl shadow-lg border-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                    <tr>
                      <th className="p-4 text-left font-semibold text-gray-700">User</th>
                      <th className="p-4 text-left font-semibold text-gray-700">Contact</th>
                      <th onClick={() => handleSort("totalOrders")} className="p-4 text-center font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition">
                        Orders {sortField === "totalOrders" && (sortOrder === "asc" ? "↑" : "↓")}
                      </th>
                      <th onClick={() => handleSort("cancelledOrders")} className="p-4 text-center font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition">
                        Cancelled
                      </th>
                      <th className="p-4 text-center font-semibold text-gray-700">Status</th>
                      <th onClick={() => handleSort("createdAt")} className="p-4 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition">
                        Joined {sortField === "createdAt" && (sortOrder === "asc" ? "↑" : "↓")}
                      </th>
                      <th className="p-4 text-center font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedUsers.map((user) => {
                      const statusInfo = getStatusInfo(user);
                      const isBlocked = user.isBlocked;

                      return (
                        <tr key={user._id} className={`hover:bg-gray-50 transition ${isBlocked ? "bg-red-50/30" : ""}`}>
                          <td className="p-4">
                            <Link to={`/admin/users/${user._id}`} className="flex items-center gap-3 group">
                              <img src={user.avatar} className="w-10 h-10 rounded-xl object-cover border" alt={user.name} />
                              <div>
                                <p className={`font-semibold text-sm group-hover:text-indigo-600 transition ${isBlocked ? "text-red-600" : "text-gray-800"}`}>
                                  {user.name}
                                </p>
                                <p className="text-xs text-gray-500">{user.email}</p>
                              </div>
                            </Link>
                          </td>
                          <td className="p-4">
                            <p className="text-sm text-gray-600">{user.mobile}</p>
                          </td>
                          <td className="p-4 text-center">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 font-semibold text-xs">
                              {user.totalOrders}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-red-50 text-red-600 font-semibold text-xs">
                              {user.cancelledOrders}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full font-semibold ${statusInfo.color}`}>
                              <statusInfo.icon size={12} />
                              {statusInfo.text}
                            </span>
                          </td>
                          <td className="p-4">
                            <p className="text-xs text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</p>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2 justify-center">
                              <Link
                                to={`/admin/users/${user._id}`}
                                className="p-2 rounded-lg transition-all hover:bg-indigo-50 text-indigo-600"
                                title="View Details"
                              >
                                <Eye size={18} />
                              </Link>
                              <button
                                onClick={() => handleBlock(user._id)}
                                className={`p-2 rounded-lg transition-all ${isBlocked ? "hover:bg-green-50 text-green-600" : "hover:bg-orange-50 text-orange-600"}`}
                                title={isBlocked ? "Unblock User" : "Block User"}
                              >
                                {isBlocked ? <UserCheck size={18} /> : <UserX size={18} />}
                              </button>
                              <button
                                onClick={() => handleDelete(user._id)}
                                className="p-2 rounded-lg transition-all hover:bg-red-50 text-red-500"
                                title="Delete User"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {filteredAndSortedUsers.length === 0 && (
                      <tr>
                        <td colSpan="7" className="text-center py-14 text-gray-400">
                          No users found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6 bg-white rounded-2xl shadow-sm border-0 p-4">
              <p className="text-sm text-gray-500">
                Showing {startIndex + 1} to {Math.min(startIndex + rowsPerPage, filteredAndSortedUsers.length)} of {filteredAndSortedUsers.length} users
              </p>
              <div className="flex gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="px-4 py-2 border-2 border-gray-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all"
                >
                  Previous
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="px-4 py-2 border-2 border-gray-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <FooterNavbar />
    </>
  );
};

export default UsersPanel;