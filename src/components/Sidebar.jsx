import { NavLink } from "react-router-dom";
import { useState } from "react";
import useAuth from "../context/useAuth";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const { user, profile } = useAuth();
  const links = [
    { name: "Dashboard", path: "/" },
    ...(user?.role === "admin" ? [{ name: "Users", path: "/users" }] : []),

    ...(user?.role === "admin"
      ? [{ name: "productsManagement", path: "/productsManagement" }]
      : [{ name: "Products", path: "/products" }]),

    ...(user?.role === "admin" ? [{ name: "Orders", path: "/orders" }] : []),

    ...(user ? [{ name: "Profile", path: "/profile" }] : []),
  ];

  return (
    <>
      {isOpen && (
        <div
          id="sidebar-overlay"
          role="presentation"
          className="fixed inset-0 bg-black opacity-50 md:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      <div
        id="sidebar"
        className={`bg-gray-800 text-white w-64 p-5 flex flex-col space-y-4 transition-transform duration-300 fixed top-0 left-0 h-full z-40  ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:relative md:translate-x-0 md:top-auto md:left-auto md:h-auto`}
      >
        <div className="flex items-center gap-3 mb-6 pl-10 sm:pl-0">
          <img
            src={
              profile?.avatarUrl
                ? profile.avatarUrl
                : user?.username
                ? `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    user.username
                  )}&background=111827&color=FBBF24&size=64`
                : undefined
            }
            alt="avatar"
            className="w-10 h-10 rounded-full object-cover"
          />
          <h2 className="text-2xl font-bold">Dashboard</h2>
        </div>
        <nav className="flex flex-col gap-4">
          {links.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                `py-2 px-3 rounded hover:bg-gray-700 transition-colors ${
                  isActive ? "bg-yellow-400 text-gray-900 font-bold" : ""
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}
        </nav>
      </div>

      <button
        aria-controls="sidebar"
        aria-expanded={isOpen}
        className="md:hidden fixed top-4 left-4 bg-yellow-400 text-gray-900 p-2 rounded z-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="sr-only">Toggle menu</span>☰
      </button>
    </>
  );
}
