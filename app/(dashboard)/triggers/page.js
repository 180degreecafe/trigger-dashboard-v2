"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const triggerTypes = [
  "new",
  "churned",
  "inactive",
  "first_order",
  "high_spender",
  "favorite_drink",
  "no_favorite_yet",
  "frequent_buyer",
  "inactive_after_first",
];

export default function TriggersPage() {
  const [triggers, setTriggers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState({});
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState([]);

  useEffect(() => {
    fetchTriggers();
  }, []);

  const fetchTriggers = async () => {
    setLoading(true);

    // ✅ نجيب التريجرز اللي تم التعامل معها
    const { data: actions } = await supabase
      .from("trigger_actions")
      .select("trigger_id");

    const actedIds = new Set(actions?.map((a) => a.trigger_id));

    // ✅ نجيب التريجرز
    const { data, error } = await supabase
      .from("triggers")
      .select(`
        id,
        type,
        message,
        recommendation,
        created_at,
        customers(phone)
      `)
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      console.error(error);
    } else {
      // 🔥 فلترة حقيقية
      const filtered = data.filter((t) => !actedIds.has(t.id));
      setTriggers(filtered);
    }

    setLoading(false);
  };

  const handleAction = async (trigger, action) => {
    setProcessing((prev) => ({ ...prev, [trigger.id]: true }));

    try {
      if (action === "send") {
        await fetch(
          "https://qwaooajgkkqtpbidzumd.supabase.co/functions/v1/send-offer",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ trigger_id: trigger.id }),
          }
        );
      }

      await supabase.from("trigger_actions").insert({
        trigger_id: trigger.id,
        trigger_type: trigger.type,
        action,
        acted_at: new Date().toISOString(),
        admin_name: "admin",
      });

      // 🔥 حذف مباشر + ضمان عدم الرجوع
      setTriggers((prev) => prev.filter((t) => t.id !== trigger.id));
    } catch (err) {
      console.error(err);
    }

    setProcessing((prev) => ({ ...prev, [trigger.id]: false }));
  };

  // 🔍 Search + Filter
  const filteredTriggers = triggers.filter((t) => {
    const matchSearch =
      t.message?.toLowerCase().includes(search.toLowerCase()) ||
      t.customers?.phone?.includes(search);

    const matchFilter =
      filters.length === 0 || filters.includes(t.type);

    return matchSearch && matchFilter;
  });

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Triggers</h1>
        <p className="text-sm text-gray-500">
          Real-time customer triggers
        </p>
      </div>

      {/* Search */}
      <input
        placeholder="Search phone or message..."
        className="input mb-4"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Filters */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {triggerTypes.map((type) => (
          <button
            key={type}
            onClick={() =>
              setFilters((prev) =>
                prev.includes(type)
                  ? prev.filter((t) => t !== type)
                  : [...prev, type]
              )
            }
            className={`badge ${
              filters.includes(type)
                ? "badge-active"
                : "badge-default"
            }`}
          >
            {type.replaceAll("_", " ")}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="card">

        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading...</div>
        ) : filteredTriggers.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No pending triggers 🎉
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="table-head">
                  <tr>
                    <th>Customer</th>
                    <th>Type</th>
                    <th>Message</th>
                    <th>Recommendation</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredTriggers.map((t) => (
                    <tr key={t.id} className="table-row">
                      <td className="font-medium">
                        {t.customers?.phone || "-"}
                      </td>

                      <td>
                        <TypeBadge type={t.type} />
                      </td>

                      <td className="text-gray-600">{t.message}</td>

                      <td className="text-blue-600 font-medium">
                        {t.recommendation}
                      </td>

                      <td className="space-x-2">
                        <button
                          onClick={() => handleAction(t, "send")}
                          disabled={processing[t.id]}
                          className="btn-primary"
                        >
                          Send
                        </button>

                        <button
                          onClick={() => handleAction(t, "ignore")}
                          disabled={processing[t.id]}
                          className="btn-secondary"
                        >
                          Ignore
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="md:hidden space-y-3 p-3">
              {filteredTriggers.map((t) => (
                <div key={t.id} className="card p-4">

                  <div className="flex justify-between items-center mb-2">
                    <div className="font-medium">
                      {t.customers?.phone}
                    </div>
                    <TypeBadge type={t.type} />
                  </div>

                  <div className="text-sm text-gray-600 mb-2">
                    {t.message}
                  </div>

                  <div className="text-sm font-medium text-blue-600 mb-3">
                    {t.recommendation}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAction(t, "send")}
                      disabled={processing[t.id]}
                      className="btn-primary flex-1"
                    >
                      Send
                    </button>

                    <button
                      onClick={() => handleAction(t, "ignore")}
                      disabled={processing[t.id]}
                      className="btn-secondary flex-1"
                    >
                      Ignore
                    </button>
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

/* ---------- UI ---------- */

function TypeBadge({ type }) {
  const map = {
    new: "bg-blue-100 text-blue-700",
    churned: "bg-red-100 text-red-700",
    inactive: "bg-yellow-100 text-yellow-700",
  };

  return (
    <span className={`badge ${map[type] || "badge-default"}`}>
      {type.replaceAll("_", " ")}
    </span>
  );
}
