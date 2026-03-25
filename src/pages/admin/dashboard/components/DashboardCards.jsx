import { useEffect, useState } from "react";
import {
  Package,
  Users,
  CreditCard,
  IndianRupee,
} from "lucide-react";
const API_URL = import.meta.env.VITE_API_URL;


const DashboardCards = ({ setActiveView }) => {
  const [stats, setStats] = useState({
    orders: 0,
    users: 0,
    transactions: 0,
    income: 0,
  });

  const [loading, setLoading] = useState(true);

  /* ===== FETCH DASHBOARD STATS ===== */
  const fetchStats = async () => {
    try {
      const res = await fetch(
        `${API_URL}/api/v1/admin/dashboard-stats`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const cards = [
    {
      key: "orders",
      label: "Total Orders",
      value: stats.orders,
      color: "border-blue-500",
      icon: <Package />,
    },
    {
      key: "users",
      label: "Total Users",
      value: stats.users,
      color: "border-green-500",
      icon: <Users />,
    },
    {
      key: "transactions",
      label: "Transactions",
      value: stats.transactions,
      color: "border-purple-500",
      icon: <CreditCard />,
    },
    {
      key: "income",
      label: "Revenue",
      value: `₹${stats.income}`,
      color: "border-pink-500",
      icon: <IndianRupee />,
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-28 bg-gray-200 animate-pulse rounded-2xl"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {cards.map((card) => (
        <div
          key={card.key}
          onClick={() => setActiveView(card.key)}
          className={`cursor-pointer bg-white border-l-8 ${card.color}
            rounded-2xl p-6 shadow-md hover:shadow-xl hover:scale-[1.03]
            transition-all`}
        >
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">{card.label}</p>
              <h2 className="text-3xl font-bold text-gray-800 mt-1">
                {card.value}
              </h2>
            </div>
            <div className="p-3 rounded-full bg-gray-100 text-gray-700">
              {card.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardCards;
