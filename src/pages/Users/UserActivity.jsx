import { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";

export default function UserActivity({ userId }) {
  const [logs, setLogs] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!userId) return;

    (async () => {
      // Login history
      const qLogs = query(
        collection(db, "userLogs"),
        where("userId", "==", userId),
        orderBy("timestamp", "desc")
      );
      const logsSnap = await getDocs(qLogs);
      setLogs(logsSnap.docs.map((doc) => doc.data()));

      // Recent orders
      const qOrders = query(
        collection(db, "orders"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      );
      const ordersSnap = await getDocs(qOrders);
      setOrders(ordersSnap.docs.map((doc) => doc.data()));
    })();
  }, [userId]);

  return (
    <div className="p-4 bg-gray-800 text-white rounded-lg">
      <h3 className="font-bold text-yellow-400 mb-2">Login History</h3>
      {logs.length === 0 ? (
        <p>No login history</p>
      ) : (
        logs.map((log, idx) => (
          <p key={idx} className="text-sm">
            {new Date(log.timestamp.toDate()).toLocaleString()} - {log.action}
          </p>
        ))
      )}

      <h3 className="font-bold text-yellow-400 mt-4 mb-2">Recent Orders</h3>
      {orders.length === 0 ? (
        <p>No recent orders</p>
      ) : (
        orders.map((o, idx) => (
          <p key={idx} className="text-sm">
            Order #{o.id} - ${o.total} - {o.status}
          </p>
        ))
      )}
    </div>
  );
}
