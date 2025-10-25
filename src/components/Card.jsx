export default function Card({ title, value, icon }) {
  return (
    <div className="bg-gray-700 p-6 rounded-lg shadow flex items-center gap-4 hover:shadow-lg transition-shadow">
      {icon && <div className="text-yellow-400 text-3xl">{icon}</div>}
      <div>
        <h3 className="text-gray-300">{title}</h3>
        <p className="text-white text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}
