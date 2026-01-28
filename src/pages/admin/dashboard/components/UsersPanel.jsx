import React from 'react'

const UsersPanel = () => {
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        "http://localhost:5000/api/v1/orders/admin/users",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (data.success) setUsers(data.users);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>UsersPanel</div>
  )
}

export default UsersPanel