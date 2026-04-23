"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const PAGE_SIZE = 20;

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  /* ---------- fetch ---------- */

  const fetchNotifications = async (reset = false) => {
    const from = reset ? 0 : page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .range(from, to);

    if (reset) {
      setNotifications(data || []);
      setPage(1);
    } else {
      setNotifications((prev) => [...prev, ...(data || [])]);
      setPage((p) => p + 1);
    }

    if (!data || data.length < PAGE_SIZE) {
      setHasMore(false);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications(true);

    const channel = supabase
      .channel("notifications-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        (payload) => {
          setNotifications((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  /* ---------- actions ---------- */

  const markAsRead = async (id) => {
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id);

    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, is_read: true } : n
      )
    );
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter((n) => !n.is_read);
    if (!unread.length) return;

    const ids = unread.map((n) => n.id);

    await supabase
      .from("notifications")
      .update({ is_read: true })
      .in("id", ids);

    setNotifications((prev) =>
      prev.map((n) => ({ ...n, is_read: true }))
    );
  };

  /* ---------- filters ---------- */

  const filtered = notifications.filter((n) => {
    if (filter === "unread") return !n.is_read;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  /* ---------- grouping ---------- */

  const grouped = groupByDate(filtered);

  /* ---------- UI ---------- */

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold">
            Notifications
          </h1>
          <p className="text-sm text-gray-500">
            Real-time system events
          </p>
        </div>

        <button onClick={markAllAsRead} className="btn-secondary text-sm">
          Mark all read
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        {["all", "unread"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`badge ${
              filter === f ? "badge-active" : "badge-default"
            }`}
          >
            {f === "all" ? "All" : `Unread (${unreadCount})`}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="card">

        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No notifications 🎉
          </div>
        ) : (
          <div>

            {Object.entries(grouped).map(([group, items]) => (
              <div key={group}>

                {/* Group title */}
                <div className="px-4 py-2 text-xs text-gray-500 bg-gray-50 dark:bg-gray-800">
                  {group}
                </div>

                {/* Items */}
                {items.map((n) => (
                  <div
                    key={n.id}
                    className={`p-4 flex justify-between gap-4 border-t ${
                      !n.is_read ? "bg-yellow-50 dark:bg-yellow-900/20" : ""
                    }`}
                  >
                    <div className="flex-1">

                      <div className="flex items-center gap-2 mb-1">

                        {!n.is_read && (
                          <span className="w-2 h-2 bg-blue-600 rounded-full" />
                        )}

                        <span className={`badge ${getTypeColor(n)}`}>
                          {getType(n)}
                        </span>

                        <p className="text-sm font-medium">
                          {n.message}
                        </p>
                      </div>

                      <p className="text-xs text-gray-500">
                        {formatDate(n.created_at)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">

                      {n.link && (
                        <a
                          href={n.link}
                          onClick={() => markAsRead(n.id)}
                          className="text-blue-600 text-xs hover:underline"
                        >
                          View
                        </a>
                      )}

                      {!n.is_read && (
                        <button
                          onClick={() => markAsRead(n.id)}
                          className="text-xs text-gray-500 hover:text-black"
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))}

            {/* Load more */}
            {hasMore && (
              <div className="p-4 text-center">
                <button
                  onClick={() => fetchNotifications()}
                  className="btn-secondary text-sm"
                >
                  Load more
                </button>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- helpers ---------- */

function formatDate(d) {
  return new Date(d).toLocaleString("en-GB");
}

function getType(n) {
  if (n.type) return n.type;

  if (n.message?.includes("campaign")) return "campaign";
  if (n.message?.includes("trigger")) return "trigger";

  return "system";
}

function getTypeColor(n) {
  const type = getType(n);

  const map = {
    campaign: "bg-blue-100 text-blue-700",
    trigger: "bg-yellow-100 text-yellow-700",
    system: "bg-gray-200 text-gray-700",
  };

  return map[type] || "bg-gray-200 text-gray-700";
}

function groupByDate(list) {
  const groups = {
    Today: [],
    Yesterday: [],
    Older: [],
  };

  const now = new Date();

  list.forEach((n) => {
    const date = new Date(n.created_at);
    const diff = (now - date) / (1000 * 60 * 60 * 24);

    if (diff < 1) groups.Today.push(n);
    else if (diff < 2) groups.Yesterday.push(n);
    else groups.Older.push(n);
  });

  return groups;
}
