import { useEffect, useState } from "react";
import { useAuth } from "../context/useAuth";
import { fetchAllOrders, updateOrderStatus } from "../services/firestoreOrders";
import toast from "react-hot-toast";
import { addNotification } from "../services/firestoreNotifications";

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  let idCounter = 1;

  useEffect(() => {
    if (!user || user.role !== "admin") return;

    (async () => {
      try {
        const data = await fetchAllOrders();
        const sorted = data.sort(
          (a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis()
        );
        setOrders(sorted);
      } catch (err) {
        toast.error("Failed to fetch orders");
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      toast.success(`Order marked as ${newStatus}`);

      const order = orders.find((o) => o.id === orderId);
      if (order?.userId) {
        await addNotification(
          order.userId,
          user.username,
          `Your order is now ${newStatus}`
        );
      }
    } catch (err) {
      toast.error("Failed to update status");
      console.error(err);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "Unknown";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString();
  };

  const handleExportCSV = () => {
    if (!orders || orders.length === 0) return;

    const headers = ["User", "Status", "Total", "Date"];
    const rows = orders.map((o) => [
      o.username || "Unknown",
      o.status || "pending",
      o.totalPrice || 0,
      formatDate(o.createdAt),
    ]);

    const csvContent = [headers, ...rows].map((r) => r.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `orders_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
  const totalOrders = orders.length;
  const ordersByUser = orders.reduce((acc, o) => {
    acc[o.username || "Unknown"] = (acc[o.username || "Unknown"] || 0) + 1;
    return acc;
  }, {});

  if (!user) return <div className="p-6 text-white">Please login</div>;
  if (user.role !== "admin")
    return <div className="p-6 text-white">Access denied</div>;
  if (loading) return <div className="p-6 text-white">Loading...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-yellow-400 mb-4">Orders</h2>

      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="text-white">
          <p>Total Orders: {totalOrders}</p>
          <p>Total Revenue: ${totalRevenue}</p>
          <p>Orders by User: {JSON.stringify(ordersByUser)}</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Export CSV
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-700 text-white rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-800">
              <th className="py-3 px-6 text-left">ID</th>
              <th className="py-3 px-6 text-left">User</th>
              <th className="py-3 px-6 text-left">Products</th>
              <th className="py-3 px-6 text-left hidden sm:table-cell">
                Total
              </th>
              <th className="py-3 px-6 text-left hidden sm:table-cell">Date</th>
              <th className="py-3 px-6 text-left">Status</th>
              <th className="py-3 px-6 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-8 text-center text-gray-400">
                  No orders yet.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-gray-600 hover:bg-gray-600"
                >
                  <td className="py-3 px-6">{idCounter++}</td>
                  <td className="py-3 px-6">{order.username || "Unknown"}</td>
                  <td className="py-3 px-6">
                    {(order.cartItems || []).map((p) => (
                      <div key={p.id}>
                        {p.name || p.title} x{p.quantity}
                      </div>
                    ))}
                  </td>
                  <td className="py-3 px-6 hidden sm:table-cell">
                    ${order.totalPrice || 0}
                  </td>
                  <td className="py-3 px-6 hidden sm:table-cell">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="py-3 px-6">
                    <select
                      value={order.status || "pending"}
                      onChange={(e) =>
                        handleStatusChange(order.id, e.target.value)
                      }
                      className="bg-gray-800 text-white px-2 py-1 rounded hover:bg-gray-600"
                    >
                      <option value="pending">Pending</option>
                      <option value="shipped">Shipped</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="py-3 px-6">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-yellow-400">
                Order Details
              </h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            <p className="text-white mb-2">
              <strong>User:</strong> {selectedOrder.username || "Unknown"}
            </p>
            <p className="text-white mb-2">
              <strong>Status:</strong> {selectedOrder.status} |{" "}
              <strong>Total:</strong> ${selectedOrder.totalPrice || 0}
            </p>
            <p className="text-white mb-4">
              <strong>Date:</strong> {formatDate(selectedOrder.createdAt)}
            </p>
            <div className="space-y-2">
              {(selectedOrder.cartItems || []).map((p) => (
                <div
                  key={p.id}
                  className="bg-gray-700 p-3 rounded flex items-center gap-3"
                >
                  <img
                    src={p.image}
                    alt={p.title || p.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div>
                    <p>{p.title || p.name}</p>
                    <p>Quantity: {p.quantity}</p>
                    <p>Price: ${p.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
