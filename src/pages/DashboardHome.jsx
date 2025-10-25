import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocs,
} from "firebase/firestore";
import Card from "../components/Card";
import useAuth from "../context/useAuth";
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export default function DashboardHome() {
  const { user } = useAuth();
  const [todayOrders, setTodayOrders] = useState(0);
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [monthlyOrdersData, setMonthlyOrdersData] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    if (!user) return;

    // جلب عدد المستخدمين للـ Admin
    if (user.role === "admin") {
      const fetchUsersCount = async () => {
        const usersSnap = await getDocs(collection(db, "users"));
        setTotalUsers(usersSnap.docs.length);
      };
      fetchUsersCount();
    }

    // جلب الطلبات بشكل لحظي
    const ordersRef = collection(db, "orders");
    const ordersQuery =
      user.role === "admin"
        ? query(ordersRef, orderBy("createdAt", "desc"))
        : query(
            ordersRef,
            where("userId", "==", user.uid),
            orderBy("createdAt", "desc")
          );

    const unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
      let todayRev = 0;
      let todayCount = 0;
      let monthRev = 0;
      const monthlyDataMap = {};

      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        const createdAt = data.createdAt.toDate();
        // مجموع السعر لكل الطلب
        const total = data.totalPrice || 0;

        // الطلبات اليوم
        if (createdAt >= new Date(new Date().setHours(0, 0, 0, 0))) {
          todayCount++;
          todayRev += total;
        }

        // الإيرادات الشهرية
        const startOfMonth = new Date(
          new Date().getFullYear(),
          new Date().getMonth(),
          1
        );
        if (createdAt >= startOfMonth) {
          monthRev += total;
        }

        // بيانات الشهر للرسم البياني
        const monthKey = `${createdAt.getFullYear()}-${
          createdAt.getMonth() + 1
        }`;
        if (!monthlyDataMap[monthKey]) monthlyDataMap[monthKey] = 0;
        monthlyDataMap[monthKey] += total;
      });

      setTodayOrders(todayCount);
      setTodayRevenue(todayRev);
      setMonthlyRevenue(monthRev);

      const monthlyArray = Object.keys(monthlyDataMap)
        .map((key) => ({ month: key, revenue: monthlyDataMap[key] }))
        .sort((a, b) => new Date(a.month) - new Date(b.month));

      setMonthlyOrdersData(monthlyArray);
    });

    // جلب آخر 5 إشعارات
    const notifRef = collection(db, "notifications");
    const notifQuery =
      user.role === "admin"
        ? query(notifRef, orderBy("createdAt", "desc"))
        : query(
            notifRef,
            where("userId", "==", user.uid),
            orderBy("createdAt", "desc")
          );

    const unsubscribeNotif = onSnapshot(notifQuery, (snapshot) => {
      setNotifications(snapshot.docs.slice(0, 5).map((doc) => doc.data()));
    });

    return () => {
      unsubscribeOrders();
      unsubscribeNotif();
    };
  }, [user]);

  const stats = [
    ...(user.role === "admin"
      ? [{ id: 1, title: "Users", value: totalUsers, icon: "👤" }]
      : []),
    { id: 2, title: "Orders Today", value: todayOrders, icon: "🛒" },
    {
      id: 3,
      title: "Today's Revenue",
      value: `$${todayRevenue.toFixed(2)}`,
      icon: "💵",
    },
    {
      id: 4,
      title: "Monthly Revenue",
      value: `$${monthlyRevenue.toFixed(2)}`,
      icon: "💰",
    },
  ];

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-yellow-400 mb-6">
        Dashboard Overview
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {stats.map((item) => (
          <Card
            key={item.id}
            title={item.title}
            value={item.value}
            icon={item.icon}
          />
        ))}
      </div>

      <div className="bg-gray-700 p-6 rounded shadow mb-6">
        <h3 className="text-yellow-400 font-bold mb-4">
          Monthly Revenue Chart
        </h3>
        {monthlyOrdersData.length === 0 ? (
          <p className="text-white">No data available</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={monthlyOrdersData}>
              <CartesianGrid stroke="#555" strokeDasharray="5 5" />
              <XAxis dataKey="month" stroke="#fff" />
              <YAxis stroke="#fff" />
              <Tooltip
                contentStyle={{ backgroundColor: "#333", border: "none" }}
              />
              <Bar dataKey="revenue" fill="#FFD700" barSize={20} />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#FF4500"
                strokeWidth={2}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="bg-gray-700 p-6 rounded shadow">
        <h3 className="text-yellow-400 font-bold mb-4">Recent Notifications</h3>
        {notifications.length === 0 ? (
          <p className="text-white">No notifications</p>
        ) : (
          <ul className="space-y-2">
            {notifications.map((n, idx) => (
              <li key={idx} className="p-2 bg-gray-800 rounded text-white">
                {n.message}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
