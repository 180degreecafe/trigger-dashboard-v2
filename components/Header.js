"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Header() {
  const [user, setUser] = useState(null);
  const [openUser, setOpenUser] = useState(false);
  const [openNotif, setOpenNotif] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.replace("/signin");
  };

  return (
    <div className="border-b bg-white dark:bg-gray-900">

      <div className="max-w-7xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">

        {/* Title */}
        <div className="font-semibold">
          Dashboard
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">

          {/* 🔔 Notifications */}
          <div className="relative">
            <button
              onClick={() => setOpenNotif(!openNotif)}
              className="badge badge-default"
            >
              🔔 {unreadCount > 0 && `(${unreadCount})`}
            </button>

            {openNotif && (
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
                      <a
                        key={n.id}
                        href={n.link || "#"}
                        className="block p-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        {n.message}
                      </a>
                    ))
                  )}
                </div>

              </div>
            )}
          </div>

          {/* 👤 User */}
          <div className="relative">
            <button
              onClick={() => setOpenUser(!openUser)}
              className="badge badge-default"
            >
              {user?.email}
            </button>

            {openUser && (
              <div className="card absolute right-0 mt-2 w-44 z-50">

                <div className="p-3 text-xs text-gray-500 border-b">
                  {user?.email}
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full text-left p-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
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
