const menus = [
  { key: "orders", label: "User Orders" },
  { key: "users", label: "All Users" },
  { key: "transactions", label: "Transactions" },
  { key: "income", label: "Income & Analytics" },
];

const AdminSidebar = ({ activeView, setActiveView }) => {
  return (
    <div className="bg-white rounded-xl shadow p-4 space-y-2">
      {menus.map((menu) => (
        <button
          key={menu.key}
          onClick={() => setActiveView(menu.key)}
          className={`w-full text-left px-4 py-2 rounded-lg font-medium transition ${
            activeView === menu.key
              ? "bg-black text-white"
              : "hover:bg-gray-100"
          }`}
        >
          {menu.label}
        </button>
      ))}
    </div>
  );
};

export default AdminSidebar;
