"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ActionsPage() {
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterAction, setFilterAction] = useState("all");

  useEffect(() => {
    fetchActions();
  }, []);

  const fetchActions = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("trigger_actions")
      .select(`
        id,
        trigger_id,
        trigger_type,
        action,
        admin_name,
        acted_at
      `)
      .order("acted_at", { ascending: false })
      .limit(500);

    if (error) console.error(error);
    else setActions(data || []);

    setLoading(false);
  };

  const filtered = actions.filter((a) => {
    const matchSearch =
      a.trigger_id?.toLowerCase().includes(search.toLowerCase());

    const matchType =
      filterType === "all" || a.trigger_type === filterType;

    const matchAction =
      filterAction === "all" || a.action === filterAction;

    return matchSearch && matchType && matchAction;
  });

  const uniqueTypes = [...new Set(actions.map((a) => a.trigger_type))];
  const uniqueActions = [...new Set(actions.map((a) => a.action))];

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Actions</h1>
        <p className="text-sm text-gray-500">
          History of all trigger actions
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Stat title="Total" value={filtered.length} />
        <Stat
          title="Sent"
          value={filtered.filter((a) => a.action === "send").length}
        />
        <Stat
          title="Ignored"
          value={filtered.filter((a) => a.action === "ignore").length}
        />
        <Stat
          title="Today"
          value={
            filtered.filter(
              (a) =>
                new Date(a.acted_at).toDateString() ===
                new Date().toDateString()
            ).length
          }
        />
      </div>

      {/* Search */}
      <input
        placeholder="Search trigger ID..."
        className="input mb-4"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Filters */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <select
          className="input w-auto"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="all">All Types</option>
          {uniqueTypes.map((t) => (
            <option key={t} value={t}>
              {t.replaceAll("_", " ")}
            </option>
          ))}
        </select>

        <select
          className="input w-auto"
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
        >
          <option value="all">All Actions</option>
          {uniqueActions.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </div>

      {/* Content */}
      <div className="card">

        {loading ? (
          <div className="p-6 text-center text-gray-500">
            Loading...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No actions yet
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="table-head">
                  <tr>
                    <th>Trigger</th>
                    <th>Type</th>
                    <th>Action</th>
                    <th>Admin</th>
                    <th>Date</th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((a) => (
                    <tr key={a.id} className="table-row">
                      <td className="font-mono text-xs">
                        {a.trigger_id}
                      </td>

                      <td>
                        <TypeBadge type={a.trigger_type} />
                      </td>

                      <td>
                        <ActionBadge action={a.action} />
                      </td>

                      <td className="text-gray-600">
                        {a.admin_name || "-"}
                      </td>

                      <td className="text-xs text-gray-500">
                        <span
                          title={new Date(a.acted_at).toLocaleString()}
                        >
                          {formatTimeAgo(a.acted_at)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="md:hidden space-y-3 p-3">
              {filtered.map((a) => (
                <div key={a.id} className="card p-4">

                  <div className="flex justify-between mb-2">
                    <TypeBadge type={a.trigger_type} />
                    <ActionBadge action={a.action} />
                  </div>

                  <div className="text-xs text-gray-400 mb-1">
                    {formatTimeAgo(a.acted_at)}
                  </div>

                  <div className="text-xs font-mono mb-2">
                    {a.trigger_id}
                  </div>

                  <div className="text-sm text-gray-600">
                    Admin: {a.admin_name || "-"}
                  </div>

                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ---------- Components ---------- */

function Stat({ title, value }) {
  return (
    <div className="card p-4">
      <div className="text-xs text-gray-500">{title}</div>
      <div className="text-xl font-semibold">{value}</div>
    </div>
  );
}

function TypeBadge({ type }) {
  return (
    <span className="badge badge-default">
      {type.replaceAll("_", " ")}
    </span>
  );
}

function ActionBadge({ action }) {
  const map = {
    send: "bg-green-100 text-green-700",
    ignore: "bg-gray-200 text-gray-700",
  };

  return (
    <span className={`badge ${map[action] || "badge-default"}`}>
      {action}
    </span>
  );
}

/* ---------- Utils ---------- */

function formatTimeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);

  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;

  return `${Math.floor(seconds / 86400)}d ago`;
}
