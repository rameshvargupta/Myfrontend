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

      setUsers((prev) =>
        prev.map((u) =>
          u._id === id
            ? { ...u, isBlocked: data.isBlocked }
            : u
        )
      );

      toast.success(data.message);
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

      setUsers((prev) => prev.filter((u) => u._id !== id));

      toast.success("User deleted successfully");
    } catch (err) {
      console.log(err);
      toast.error("Delete failed");
    }
  };


  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">
            Users Management
          </h2>
          <p className="text-gray-500 text-sm">
            Manage all registered customers
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow p-5">
          <p className="text-sm text-gray-500">Total Users</p>
          <h3 className="text-2xl font-bold text-indigo-600">
            {users.length}
          </h3>
        </div>

        <div className="bg-white rounded-2xl shadow p-5">
          <p className="text-sm text-gray-500">Total Orders</p>
          <h3 className="text-2xl font-bold text-green-600">
            {users.reduce((acc, u) => acc + u.totalOrders, 0)}
          </h3>
        </div>

        <div className="bg-white rounded-2xl shadow p-5">
          <p className="text-sm text-gray-500">Cancelled Orders</p>
          <h3 className="text-2xl font-bold text-red-600">
            {users.reduce((acc, u) => acc + u.cancelledOrders, 0)}
          </h3>
        </div>
      </div>

      {/* USERS TABLE */}
      {loading ? (
        <div className="text-center py-10 text-gray-500">
          Loading users...
        </div>
      ) : (
       <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">

  {/* TABLE WRAPPER */}
  <div className="overflow-x-auto">
    <table className="min-w-full text-sm">

      {/* ===== HEADER ===== */}
      <thead className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-600 text-xs uppercase tracking-wider sticky top-0 z-10">
        <tr>
          <th className="px-6 py-4 text-left font-semibold">User</th>

          <th className="px-6 py-4 text-center font-semibold">
            Mobile
          </th>

          <th
            className="px-6 py-4 text-center font-semibold cursor-pointer select-none"
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

          <th className="px-6 py-4 text-center font-semibold">
            Cancelled
          </th>

          <th className="px-6 py-4 text-center font-semibold">
            Status
          </th>

          <th className="px-6 py-4 text-center font-semibold">
            Joined
          </th>

          <th className="px-6 py-4 text-right font-semibold">
            Actions
          </th>
        </tr>
      </thead>

      {/* ===== BODY ===== */}
      <tbody className="divide-y divide-gray-100">

        {filteredUsers.map((user) => (
          <tr
            key={user._id}
            className={`transition duration-200 ease-in-out
              ${user.isBlocked
                ? "bg-red-50/60"
                : "hover:bg-gray-50"
              }
            `}
          >

            {/* USER */}
            <td className="px-6 py-5">
              <div className="flex items-center gap-4">
                <img
                  src={user.avatar}
                  className="w-12 h-12 rounded-2xl object-cover border shadow-sm"
                  alt="User"
                />

                <div>
                  <p className={`font-semibold text-sm ${
                    user.isBlocked ? "text-red-600" : "text-gray-800"
                  }`}>
                    {user.name}
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    {user.email}
                  </p>
                </div>
              </div>
            </td>

            {/* MOBILE */}
            <td className="px-6 py-5 text-center text-gray-600">
              {user.mobile}
            </td>

            {/* ORDERS */}
            <td className="px-6 py-5 text-center">
              <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 font-semibold text-xs">
                {user.totalOrders}
              </span>
            </td>

            {/* CANCELLED */}
            <td className="px-6 py-5 text-center">
              <span className="px-3 py-1 rounded-full bg-red-50 text-red-600 font-semibold text-xs">
                {user.cancelledOrders}
              </span>
            </td>

            {/* ROLE / BLOCK */}
            <td className="px-6 py-5 text-center">
              <span
                className={`px-3 py-1.5 rounded-full text-xs font-semibold
                  ${
                    user.isBlocked
                      ? "bg-red-100 text-red-700"
                      : user.role === "admin"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-blue-100 text-blue-700"
                  }
                `}
              >
                {user.isBlocked ? "Blocked" : user.role}
              </span>
            </td>

            {/* JOINED */}
            <td className="px-6 py-5 text-center text-gray-500 text-xs">
              {new Date(user.createdAt).toLocaleDateString()}
            </td>

            {/* ACTIONS */}
            <td className="px-6 py-5">
              <div className="flex justify-end items-center gap-3">

                <button
                  onClick={() =>
                    navigate(`/admin/users/${user._id}`)
                  }
                  className="p-2 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition"
                >
                  <Eye size={16} />
                </button>

                <button
                  onClick={() => handleBlock(user._id)}
                  className={`p-2 rounded-xl transition
                    ${
                      user.isBlocked
                        ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                        : "bg-yellow-50 text-yellow-600 hover:bg-yellow-100"
                    }
                  `}
                >
                  {user.isBlocked ? (
                    <UserCheck size={16} />
                  ) : (
                    <UserX size={16} />
                  )}
                </button>

                <button
                  onClick={() => handleDelete(user._id)}
                  className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition"
                >
                  <Trash2 size={16} />
                </button>

              </div>
            </td>
          </tr>
        ))}

        {filteredUsers.length === 0 && (
          <tr>
            <td
              colSpan="7"
              className="text-center py-12 text-gray-400"
            >
              No users found
            </td>
          </tr>
        )}

      </tbody>
    </table>
  </div>
</div>

      )}
    </div>
  );

};

export default UsersPanel;
