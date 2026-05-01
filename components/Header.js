"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Header() {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  /* ---------- fetch user ---------- */
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  /* ---------- fetch notifications ---------- */
  useEffect(() => {
    fetchNotifications();

    const channel = supabase
      .channel("realtime:notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        (payload) => {
          setNotifications((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchNotifications = async () => {
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    setNotifications(data || []);
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  /* ---------- logout ---------- */
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/signin";
  };

  return (
    <div className="h-14 bg-white border-b flex items-center justify-between px-6">

      {/* Left */}
      <div className="font-semibold text-gray-800">
        180° Dashboard
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">

        {/* 🔔 Notifications */}
        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="relative p-2 rounded hover:bg-gray-100"
          >
            🔔

            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 text-xs bg-red-500 text-white rounded-full px-1.5">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown */}
          {open && (
            <div className="absolute right-0 mt-2 w-80 bg-white border rounded-lg shadow-lg z-50">

              <div className="p-3 border-b text-sm font-medium">
                Notifications
              </div>

              <div className="max-h-80 overflow-y-auto">
                {notifications.map((n) => (
                  <a
                    key={n.id}
                    href={n.link || "#"}
                    className="block px-4 py-3 text-sm hover:bg-gray-50 border-b"
                  >
                    {n.message}
                  </a>
                ))}
              </div>

            </div>
          )}
        </div>

        {/* 👤 User */}
        <div className="relative group">
          <div className="flex items-center gap-2 cursor-pointer">

            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm">
              {user?.email?.[0]?.toUpperCase()}
            </div>

            <span className="text-sm text-gray-700">
              {user?.email}
            </span>
          </div>

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow opacity-0 group-hover:opacity-100 transition">

            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
            >
              Logout
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}
