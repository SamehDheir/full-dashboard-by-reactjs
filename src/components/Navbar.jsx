import { useAuth } from "../context/useAuth";
import { useEffect, useState } from "react";
import {
  subscribeNotifications,
  markNotificationsRead,
} from "../services/firestoreNotifications";
import { useNavigate } from "react-router-dom";
import useCart from "../context/useCart"; // ✅ استيراد الكارت

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart(); // ✅ استخدم الكارت
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeNotifications(user.uid, setNotifications);
    return () => unsubscribe();
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleOpenNotif = async () => {
    setNotifOpen(!notifOpen);
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
    if (unreadIds.length > 0) await markNotificationsRead(unreadIds);
  };

  const renderIcon = (type) => {
    if (type === "order") return "📦";
    if (type === "message") return "💬";
    if (type === "system") return "⚙️";
    return "🔔";
  };

  return (
    <nav className="bg-gray-800 p-4 flex justify-between items-center relative">
      <h1
        className="text-yellow-400 font-bold text-xl cursor-pointer"
        onClick={() => navigate("/")}
      >
        Dashboard
      </h1>

      {user && (
        <div className="flex items-center gap-4 relative">
          {/* 🔔 Notifications */}
          <button
            onClick={handleOpenNotif}
            className="relative text-white px-3 py-1 rounded bg-gray-700 hover:bg-gray-600"
          >
            🔔
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                {unreadCount}
              </span>
            )}
          </button>

          {/* 🛒 Cart Icon */}
          <button
            onClick={() => navigate("/cart")}
            className="relative text-white px-3 py-1 rounded bg-gray-700 hover:bg-gray-600"
          >
            🛒
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-yellow-400 text-gray-900 text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold">
                {cart.length}
              </span>
            )}
          </button>

          {/* Notifications dropdown */}
          {notifOpen && (
            <div className="absolute top-full right-0 mt-2 w-80 bg-gray-800 rounded shadow-lg p-2 z-50 max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">
                  No notifications
                </p>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3 rounded-lg flex flex-col border-l-4 cursor-pointer ${
                      !n.read
                        ? "border-yellow-400 bg-gray-700"
                        : "border-gray-600 bg-gray-800"
                    } hover:bg-gray-700 transition-colors`}
                    onClick={() => {
                      setNotifOpen(false);
                      if (n.link) navigate(n.link);
                    }}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-semibold text-yellow-400">
                        {n.senderName || "System"}
                      </span>
                      <span className="text-xs text-gray-400">
                        {n.createdAt?.toDate
                          ? n.createdAt.toDate().toLocaleString()
                          : new Date(n.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>{renderIcon(n.type)}</span>
                      <p className="text-sm text-white">{n.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          <span className="text-white">Hello, {user.username}</span>
          <button
            onClick={logout}
            className="bg-yellow-400 text-gray-900 px-3 py-1 rounded"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
