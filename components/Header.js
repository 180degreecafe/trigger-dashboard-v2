"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function Header({ onMenuClick }) {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const notifRef = useRef(null);
  const userRef = useRef(null);

  /* ---------- user ---------- */
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user || null);
    });
  }, []);

  /* ---------- notifications ---------- */
  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("notifications")
        .select("id, message, created_at, link, is_read")
        .order("created_at", { ascending: false })
        .limit(10);

      setNotifications(data || []);
    };

    fetch();
  }, []);

  /* ---------- close outside ---------- */
  useEffect(() => {
    const handleClick = (e) => {
      if (
        !notifRef.current?.contains(e.target) &&
        !userRef.current?.contains(e.target)
      ) {
        setNotifOpen(false);
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  /* ---------- logout ---------- */
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/signin";
  };

  const unread = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">

      <div className="max-w-7xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">

        {/* LEFT */}
        <div className="flex items-center gap-3">

          {/* Mobile Menu */}
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            ☰
          </button>

          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            Dashboard
          </h1>

        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-4 relative">

          {/* Notifications */}
          <div ref={notifRef} className="relative">

            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative text-lg"
            >
              🔔
              {unread > 0 && (
                <span className="absolute -top-1 -right-2 text-xs bg-red-500 text-white rounded-full px-1.5">
                  {unread}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="card absolute right-0 mt-2 w-80 z-50">

                <div className="p-3 border-b text-sm font-medium">
                  Notifications
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-sm text-gray-500">
                      No notifications
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          if (n.link) router.push(n.link);
                          setNotifOpen(false);
                        }}
                        className="p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <p className="text-sm">{n.message}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(n.created_at).toLocaleString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>

              </div>
            )}
          </div>

          {/* User */}
          <div ref={userRef} className="relative">

            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="text-sm font-medium"
            >
              👤 {user?.email || "User"}
            </button>

            {dropdownOpen && (
              <div className="card absolute right-0 mt-2 w-56 z-50 p-3 space-y-2">

                <div className="text-xs text-gray-500">
                  {user?.email}
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full text-left text-sm text-red-500 hover:underline"
                >
                  Logout
                </button>

              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
