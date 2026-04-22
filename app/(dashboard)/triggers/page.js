"use client";

import { useEffect, useState } from "react";
import { getTriggers, actOnTrigger } from "@/services/triggers";

export default function TriggersPage() {
  const [triggers, setTriggers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actioned, setActioned] = useState({});
  const [search, setSearch] = useState("");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const data = await getTriggers();
      setTriggers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(trigger, type) {
    setActioned(prev => ({ ...prev, [trigger.id]: true }));

    try {
      await actOnTrigger(trigger, type);
    } catch (e) {
      console.error(e);
      alert("Action failed");
    }
  }

  const filtered = triggers.filter(t =>
    (t.customers?.phone || "").includes(search) ||
    (t.message || "").toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Triggers</h1>

      {/* Search */}
      <input
        placeholder="Search..."
        className="border px-3 py-2 mb-4 w-full"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2">Phone</th>
              <th className="p-2">Type</th>
              <th className="p-2">Message</th>
              <th className="p-2">Recommendation</th>
              <th className="p-2">Action</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((t) => {
              const disabled = actioned[t.id];

              return (
                <tr key={t.id} className="border-t">
                  <td className="p-2">{t.customers?.phone || "-"}</td>
                  <td className="p-2">{t.type}</td>
                  <td className="p-2">{t.message}</td>
                  <td className="p-2">{t.recommendation}</td>

                  <td className="p-2">
                    <button
                      onClick={() => handleAction(t, "send")}
                      disabled={disabled}
                      className="bg-green-600 text-white px-2 py-1 mr-2"
                    >
                      Send
                    </button>

                    <button
                      onClick={() => handleAction(t, "ignore")}
                      disabled={disabled}
                      className="bg-gray-500 text-white px-2 py-1"
                    >
                      Ignore
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
