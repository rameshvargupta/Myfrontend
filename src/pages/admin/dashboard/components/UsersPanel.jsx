import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  Trash2,
  UserX,
  UserCheck,
  Search,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

const UsersPanel = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("asc"); // orders asc/desc

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // ================= FETCH ORDERS & AGGREGATE USERS =================
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        "http://localhost:5000/api/v1/orders/admin/orders",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Fetch failed");

      // Aggregate users from orders
      const userMap = {};
      data.orders.forEach((order) => {
        const u = order.user;
        if (!u) return;

        const userId = u._id;
        if (!userMap[userId]) {
          userMap[userId] = {
            _id: userId,
            name: `${u.firstName || ""} ${u.lastName || ""}`.trim() || "Unnamed User",
            email: u.email || "No Email",
            mobile: order.addresses?.[0]?.phone || "—",
            avatar: u.avatar || "/default-avatar.png",
            totalOrders: 0,
            cancelledOrders: 0,
            role: u.role || "user",
            createdAt: u.createdAt || order.createdAt,
          };
        }
        userMap[userId].totalOrders += 1;
        if (order.orderStatus === "Cancelled") userMap[userId].cancelledOrders += 1;
      });

      const usersArr = Object.values(userMap);
      setUsers(usersArr);
      setFilteredUsers(usersArr);
    } catch (err) {
      console.log(err);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ================= SEARCH & SORT =================
  useEffect(() => {
    let result = [...users];
    if (search) {
      result = result.filter((u) => {
        const name = u?.name?.toLowerCase() || "";
        const email = u?.email?.toLowerCase() || "";
        return name.includes(search.toLowerCase()) || email.includes(search.toLowerCase());
      });
    }

    result.sort((a, b) =>
      sortOrder === "asc"
        ? (a.totalOrders || 0) - (b.totalOrders || 0)
        : (b.totalOrders || 0) - (a.totalOrders || 0)
    );

    setFilteredUsers(result);
  }, [search, users, sortOrder]);

  // ================= BLOCK / UNBLOCK =================
  const handleBlock = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/v1/admin/users/block/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });

      setUsers((prev) =>
        prev.map((u) => (u._id === id ? { ...u, isBlocked: !u.isBlocked } : u))
      );

      toast.success("User status updated");
    } catch {
      toast.error("Failed to update status");
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      await fetch(`http://localhost:5000/api/v1/admin/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("User deleted");
      fetchUsers();
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="p-4 md:p-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold">
          Users Management
          <span className="text-sm text-gray-500 ml-2">({users.length})</span>
        </h2>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by name/email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500"
          />
        </div>
      </div>

      {/* USERS TABLE */}
      {loading ? (
        <p className="text-gray-500">Loading users...</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border shadow-sm bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-3 text-left">User</th>
                <th className="p-3">Mobile</th>
                <th
                  className="p-3 flex items-center justify-center gap-1 cursor-pointer"
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                >
                  Orders
                  {sortOrder === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </th>
                <th className="p-3">Cancelled</th>
                <th className="p-3">Role</th>
                <th className="p-3">Created At</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id} className="border-t hover:bg-gray-50 transition">
                  <td className="p-3 flex items-center gap-3">
                    <img
                      src={user.avatar || "/default-avatar.png"}
                      className="w-10 h-10 rounded-full object-cover"
                      alt="User Profile"
                    />
                    <div>
                      <p className="font-semibold">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </td>

                  <td className="p-3 text-center">{user.mobile}</td>
                  <td className="p-3 text-center font-medium">{user.totalOrders}</td>
                  <td className="p-3 text-center font-medium text-red-600">{user.cancelledOrders}</td>
                  <td className="p-3 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        user.role === "admin" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="p-3 text-center text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>

                  <td className="p-3">
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => navigate(`/admin/users/${user._id}`)}
                        className="text-blue-600 hover:text-blue-800"
                        title="View User"
                      >
                        <Eye size={18} />
                      </button>

                      <button
                        onClick={() => handleBlock(user._id)}
                        className={`${
                          user.isBlocked ? "text-green-600 hover:text-green-800" : "text-yellow-600 hover:text-yellow-800"
                        }`}
                        title={user.isBlocked ? "Unblock User" : "Block User"}
                      >
                        {user.isBlocked ? <UserCheck size={18} /> : <UserX size={18} />}
                      </button>

                      <button
                        onClick={() => handleDelete(user._id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete User"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center p-6 text-gray-500">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UsersPanel;
