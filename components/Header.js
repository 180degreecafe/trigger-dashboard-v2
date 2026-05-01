"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Header() {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [openUser, setOpenUser] = useState(false);
  const [openNotif, setOpenNotif] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleLogout = async () => {
    await supabase.auth.signOut();

    // 🔥 مهم جداً
    window.location.replace("/signin");
  };

  return (
    <div className="h-14 bg-[var(--card)] border-b border-[var(--border)] flex items-center justify-between px-6">

      <div className="font-semibold text-[var(--text)]">
        180° Dashboard
      </div>

      <div className="flex items-center gap-4">

        {/* 🔔 Notifications */}
        <div className="relative">
          <button
            onClick={() => setOpenNotif(!openNotif)}
            className="relative p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            🔔

            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 text-xs bg-red-500 text-white rounded-full px-1.5">
                {unreadCount}
              </span>
            )}
          </button>

          {openNotif && (
            <div className="absolute right-0 mt-2 w-80 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow z-50">
              <div className="p-3 text-sm text-[var(--text)] border-b">
                Notifications
              </div>
            </div>
          )}
        </div>

        {/* 👤 User */}
        <div className="relative">
          <button
            onClick={() => setOpenUser(!openUser)}
            className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm text-black">
              {user?.email?.[0]?.toUpperCase()}
            </div>

            <span className="text-sm text-[var(--text)]">
              {user?.email}
            </span>
          </button>

          {openUser && (
            <div className="absolute right-0 mt-2 w-44 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow z-50">

              <div className="px-4 py-3 text-sm text-[var(--muted)] border-b">
                {user?.email}
              </div>

              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-[var(--text)] hover:bg-gray-100 dark:hover:bg-gray-800"
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
