import { useEffect, useState } from "react";
import { db } from "../../firebase";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import toast from "react-hot-toast";
import { sendBulkNotification } from "../../services/firestoreNotifications";
import { useAuth } from "../../context/useAuth";

export default function UsersManagement() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [filters, setFilters] = useState({
    success: false,
    failed: false,
    blocked: false,
  });

  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      setUsers(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    const q = query(
      collection(db, "loginAttempts"),
      orderBy("timestamp", "desc")
    );
    const unsubAttempts = onSnapshot(q, (snapshot) => {
      setAttempts(
        snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          timestamp: d.data().timestamp?.toDate?.() || new Date(),
        }))
      );
    });

    setLoading(false);

    return () => {
      unsubUsers();
      unsubAttempts();
    };
  }, []);

  const toggleActive = async (targetUser) => {
    if (targetUser.role === "admin")
      return toast.error("Cannot change admin status");
    const userRef = doc(db, "users", targetUser.id);
    const newStatus = !targetUser.active;
    await updateDoc(userRef, { active: newStatus });
    setUsers((prev) =>
      prev.map((u) =>
        u.id === targetUser.id ? { ...u, active: newStatus } : u
      )
    );
    toast.success(
      `${targetUser.username} ${newStatus ? "enabled" : "disabled"}`
    );
  };

  const changeRole = async (targetUser, newRole) => {
    if (targetUser.id === currentUser.uid)
      return toast.error("Cannot change own role");
    if (newRole === "admin") {
      const q = query(collection(db, "users"), where("role", "==", "admin"));
      const s = await getDocs(q);
      if (!s.empty) return toast.error("Only one Admin allowed");
    }
    await updateDoc(doc(db, "users", targetUser.id), { role: newRole });
    setUsers((p) =>
      p.map((u) => (u.id === targetUser.id ? { ...u, role: newRole } : u))
    );
    toast.success(`Role updated to ${newRole}`);
  };

  const handleSendNotification = async () => {
    if (!message || selectedUsers.length === 0)
      return toast.error("Select users and write a message first.");
    await sendBulkNotification(selectedUsers, "Admin", message, "message");
    toast.success("Notifications sent");
    setMessage("");
    setSelectedUsers([]);
  };

  const filteredAttempts = attempts.filter((a) => {
    const conds = [];
    if (filters.success) conds.push(a.status === "success");
    if (filters.failed) conds.push(a.status === "failed");
    if (filters.blocked) conds.push(a.status === "blocked");
    return conds.length === 0 || conds.some(Boolean);
  });

  if (loading) return <div className="p-6 text-white">Loading...</div>;

  return (
    <div className="p-6 text-center">
      <h2 className="text-2xl font-bold text-yellow-400 mb-4">
        Users Management
      </h2>

      {/* Notifications */}
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Notification message"
          className="px-3 py-2 w-1/2 rounded bg-gray-700 text-white"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button
          onClick={handleSendNotification}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Send Notification
        </button>
      </div>

      {/* Users Table */}
      <table className="min-w-full bg-gray-700 text-white rounded-lg overflow-hidden mb-8">
        <thead>
          <tr className="bg-gray-800">
            <th className="py-3 px-6">Select</th>
            <th className="py-3 px-6">Username</th>
            <th className="py-3 px-6">Role</th>
            <th className="py-3 px-6">Status</th>
            <th className="py-3 px-6">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-b border-gray-600">
              <td className="py-3 px-6 text-center">
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(u.id)}
                  onChange={(e) => {
                    if (e.target.checked) setSelectedUsers((p) => [...p, u.id]);
                    else setSelectedUsers((p) => p.filter((id) => id !== u.id));
                  }}
                />
              </td>
              <td className="py-3 px-6">{u.username}</td>
              <td className="py-3 px-6">
                <select
                  value={u.role}
                  onChange={(e) => changeRole(u, e.target.value)}
                  className="bg-gray-600 text-white px-2 py-1 rounded"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
              <td className="py-3 px-6">{u.active ? "Active" : "Inactive"}</td>
              <td className="py-3 px-6">
                <button
                  onClick={() => toggleActive(u)}
                  disabled={u.role === "admin"}
                  className={`px-3 py-1 rounded ${
                    u.role === "admin"
                      ? "bg-gray-500 cursor-not-allowed"
                      : "bg-yellow-400 hover:bg-yellow-500"
                  }`}
                >
                  {u.active ? "Disable" : "Enable"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Login Attempts Table */}
      <h2 className="text-2xl font-bold text-yellow-400 mb-4">
        Login Attempts
      </h2>
      {/* Filters for Login Attempts */}
      <div className="flex gap-4 mb-4 text-gray-800">
        <label>
          <input
            type="checkbox"
            checked={filters.success}
            onChange={() => setFilters((f) => ({ ...f, success: !f.success }))}
          />{" "}
          Success
        </label>
        <label>
          <input
            type="checkbox"
            checked={filters.failed}
            onChange={() => setFilters((f) => ({ ...f, failed: !f.failed }))}
          />{" "}
          Failed
        </label>
        <label>
          <input
            type="checkbox"
            checked={filters.blocked}
            onChange={() => setFilters((f) => ({ ...f, blocked: !f.blocked }))}
          />{" "}
          Blocked
        </label>
      </div>
      <table className="min-w-full bg-gray-700 text-white rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-gray-800">
            <th className="py-3 px-6">Email</th>
            <th className="py-3 px-6">Status</th>
            <th className="py-3 px-6">Reason</th>
            <th className="py-3 px-6">Time</th>
          </tr>
        </thead>
        <tbody>
          {filteredAttempts.length === 0 ? (
            <tr>
              <td colSpan="4" className="py-8 text-center text-gray-400">
                No login attempts match the filters.
              </td>
            </tr>
          ) : (
            filteredAttempts.map((a) => (
              <tr
                key={a.id}
                className="border-b border-gray-600 hover:bg-gray-600"
              >
                <td className="py-3 px-6">{a.email}</td>
                <td className="py-3 px-6">{a.status}</td>
                <td className="py-3 px-6">{a.reason || "-"}</td>
                <td className="py-3 px-6">{a.timestamp.toLocaleString()}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
