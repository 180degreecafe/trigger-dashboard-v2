"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const triggerTypes = ["new", "churned", "inactive"];

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

    // 🧠 جلب التريجرز اللي تم التعامل معها
    const { data: actions } = await supabase
      .from("trigger_actions")
      .select("trigger_id");

    const actedIds = actions?.map((a) => a.trigger_id) || [];

    // 🎯 جلب التريجرز
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
      // 🔥 فلترة
      const filtered = data.filter((t) => !actedIds.includes(t.id));
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

      // 🔥 إزالة فورية
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
        <h1 className="text-xl md:text-2xl font-semibold">Triggers</h1>
        <p className="text-sm text-gray-500">
          Pending customer triggers
        </p>
      </div>

      {/* Search */}
      <input
        placeholder="Search..."
        className="w-full mb-4 px-4 py-2 border rounded-md"
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
            className={`px-3 py-1 rounded-full text-sm border ${
              filters.includes(type)
                ? "bg-blue-600 text-white"
                : "bg-white"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-900 border rounded-xl overflow-hidden">

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
                <thead className="border-b text-xs text-gray-500 uppercase">
                  <tr>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Message</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredTriggers.map((t) => (
                    <tr key={t.id} className="border-b">
                      <td className="px-4 py-3">{t.customers?.phone}</td>
                      <td className="px-4 py-3">{t.type}</td>
                      <td className="px-4 py-3">{t.message}</td>

                      <td className="px-4 py-3 space-x-2">
                        <button
                          onClick={() => handleAction(t, "send")}
                          className="btn-green"
                        >
                          Send
                        </button>

                        <button
                          onClick={() => handleAction(t, "ignore")}
                          className="btn-gray"
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
                <div key={t.id} className="border p-4 rounded-lg">
                  <div className="font-medium mb-1">
                    {t.customers?.phone}
                  </div>

                  <div className="text-sm text-gray-500 mb-2">
                    {t.type}
                  </div>

                  <div className="text-sm mb-3">{t.message}</div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAction(t, "send")}
                      className="flex-1 bg-green-600 text-white py-2 rounded"
                    >
                      Send
                    </button>

                    <button
                      onClick={() => handleAction(t, "ignore")}
                      className="flex-1 bg-gray-200 py-2 rounded"
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
