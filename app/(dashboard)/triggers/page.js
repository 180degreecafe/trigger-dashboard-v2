"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";

export default function TriggersPage() {
  const supabase = createClient();

  const [triggers, setTriggers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState({});

  useEffect(() => {
    fetchTriggers();
  }, []);

  const fetchTriggers = async () => {
    setLoading(true);

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
      .limit(100);

    if (error) {
      console.error(error);
    } else {
      setTriggers(data);
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
            headers: {
              "Content-Type": "application/json",
            },
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

      // إزالة التريجر من الواجهة مباشرة (UX سريع)
      setTriggers((prev) => prev.filter((t) => t.id !== trigger.id));
    } catch (err) {
      console.error(err);
    }

    setProcessing((prev) => ({ ...prev, [trigger.id]: false }));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Triggers
        </h1>
        <p className="text-sm text-gray-500">
          Manage customer triggers and take action
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Stat title="Total" value={triggers.length} />
        <Stat title="Pending" value={triggers.length} />
        <Stat title="Sent Today" value="--" />
        <Stat title="Ignored" value="--" />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">

        {loading ? (
          <div className="p-6 text-center text-gray-500">
            Loading...
          </div>
        ) : triggers.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No triggers found
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 dark:border-gray-800 text-left text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Message</th>
                <th className="px-4 py-3">Recommendation</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>

            <tbody>
              {triggers.map((t) => (
                <tr
                  key={t.id}
                  className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  <td className="px-4 py-3 font-medium">
                    {t.customers?.phone || "-"}
                  </td>

                  <td className="px-4 py-3">
                    <Badge type={t.type} />
                  </td>

                  <td className="px-4 py-3 text-gray-600">
                    {t.message}
                  </td>

                  <td className="px-4 py-3 font-medium text-blue-600">
                    {t.recommendation}
                  </td>

                  <td className="px-4 py-3 text-xs text-gray-400">
                    {new Date(t.created_at).toLocaleString()}
                  </td>

                  <td className="px-4 py-3 text-right space-x-2">
                    <button
                      onClick={() => handleAction(t, "send")}
                      disabled={processing[t.id]}
                      className="px-3 py-1.5 text-xs rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                    >
                      Send
                    </button>

                    <button
                      onClick={() => handleAction(t, "ignore")}
                      disabled={processing[t.id]}
                      className="px-3 py-1.5 text-xs rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                      Ignore
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* ---------- Components ---------- */

function Stat({ title, value }) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
      <div className="text-xs text-gray-500">{title}</div>
      <div className="text-xl font-semibold">{value}</div>
    </div>
  );
}

function Badge({ type }) {
  const colors = {
    new: "bg-blue-100 text-blue-700",
    churned: "bg-red-100 text-red-700",
    inactive: "bg-yellow-100 text-yellow-700",
  };

  return (
    <span
      className={`px-2 py-1 text-xs rounded-full ${
        colors[type] || "bg-gray-100 text-gray-700"
      }`}
    >
      {type}
    </span>
  );
}
