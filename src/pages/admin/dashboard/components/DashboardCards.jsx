const cards = [
  { key: "orders", label: "Total Orders", value: "1,248", color: "bg-blue-500" },
  { key: "users", label: "Total Users", value: "532", color: "bg-green-500" },
  { key: "transactions", label: "Transactions", value: "3,982", color: "bg-purple-500" },
  { key: "income", label: "Income", value: "₹1.2L", color: "bg-black" },
];

const DashboardCards = ({ setActiveView }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {cards.map((card) => (
        <div
          key={card.key}
          onClick={() => setActiveView(card.key)}
          className={`${card.color} text-white p-5 rounded-xl cursor-pointer hover:scale-[1.03] transition`}
        >
          <p className="text-sm opacity-80">{card.label}</p>
          <h2 className="text-2xl font-bold mt-2">{card.value}</h2>
        </div>
      ))}
    </div>
  );
};

export default DashboardCards;
