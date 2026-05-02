"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { Menu } from "lucide-react";

export default function Header({ onMenuClick }) {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const notifRef = useRef(null);
  const userRef = useRef(null);

  /* ---------- USER ---------- */
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
    };
    getUser();
  }, []);

  /* ---------- NOTIFICATIONS ---------- */
  useEffect(() => {
    const fetchNotifications = async () => {
      const { data } = await supabase
        .from("notifications")
        .select("id, message, created_at, link")
        .eq("is_read", false)
        .order("created_at", { ascending: false })
        .limit(10);

      if (data) {
        setNotifications(data);
        setUnreadCount(data.length);
      }
    };

    fetchNotifications();
  }, []);

  /* ---------- CLICK OUTSIDE ---------- */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        notifRef.current &&
        !notifRef.current.contains(e.target) &&
        userRef.current &&
        !userRef.current.contains(e.target)
      ) {
        setNotifOpen(false);
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ---------- LOGOUT ---------- */
  const handleLogout = async () => {
    await supabase.auth.signOut();

    // تنظيف الكوكيز (مهم)
    document.cookie = "sb-access-token=; Max-Age=0; path=/";
    document.cookie = "sb-refresh-token=; Max-Age=0; path=/";

    window.location.href = "/signin";
  };

  return (
    <div className="h-14 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">

      {/* LEFT */}
      <div className="flex items-center gap-3">

        {/* Mobile Menu */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <Menu size={18} />
        </button>

        <span className="font-semibold text-gray-900 dark:text-white">
          180°
        </span>

      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-4 relative">

        {/* 🔔 Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative text-gray-700 dark:text-gray-200"
          >
            🔔

            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full px-1.5">
                {unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 border rounded shadow-lg p-3 z-50">
              {notifications.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No new notifications
                </p>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => router.push(n.link)}
                    className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                  >
                    <p className="text-sm">{n.message}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* 👤 User */}
        <div ref={userRef} className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="text-sm text-gray-700 dark:text-gray-200"
          >
            👤 {user?.email || "User"}
          </button>

          {dropdownOpen && user && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border rounded shadow-lg p-4 z-50">
              <p className="text-sm mb-2">{user.email}</p>

              <button
                onClick={handleLogout}
                className="w-full bg-red-500 text-white py-1 rounded"
              >
                Logout
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
