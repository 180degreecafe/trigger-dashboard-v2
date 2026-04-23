"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

/* ---------- constants ---------- */

const campaignTypes = ["Discount", "Gift", "Points"];

const targetAudiences = [
  "All customers",
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

const totalJobs = (c) =>
  c?.progress
    ? c.progress.sent + c.progress.failed + c.progress.pending
    : 0;

/* ---------- page ---------- */

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState("");
  const [targetCount, setTargetCount] = useState(0);

  const [form, setForm] = useState({
    id: null,
    name: "",
    description: "",
    type: "",
    audience: [],
    message: "",
    schedule: "",
    sendNow: true,
    saveAsDraft: false,
    channels: [],
  });

  /* ---------- fetch ---------- */

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    const { data } = await supabase.rpc("get_campaigns_with_progress");
    setCampaigns(data || []);
    setLoading(false);
  };

  /* ---------- handlers ---------- */

  const handleAudienceToggle = (aud) => {
    setForm((prev) => ({
      ...prev,
      audience: prev.audience.includes(aud)
        ? prev.audience.filter((a) => a !== aud)
        : [...prev.audience, aud],
    }));
  };

  const handleChannelToggle = (ch) => {
    setForm((prev) => ({
      ...prev,
      channels: prev.channels.includes(ch)
        ? prev.channels.filter((c) => c !== ch)
        : [...prev.channels, ch],
    }));
  };

  /* ---------- target count ---------- */

  const getTargetCount = async (audience) => {
    if (!audience.length) return 0;

    if (audience.includes("new")) {
      const { data } = await supabase.rpc("count_new_customers");
      return data || 0;
    }

    if (audience.includes("All customers")) {
      const { data } = await supabase.rpc("count_latest_triggers_all");
      return data || 0;
    }

    const { data } = await supabase.rpc(
      "count_latest_triggers_by_type",
      { target_types: audience }
    );

    return data || 0;
  };

  useEffect(() => {
    (async () => {
      const count = await getTargetCount(form.audience);
      setTargetCount(count);
    })();
  }, [form.audience]);

  /* ---------- UI ---------- */

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Campaigns</h1>

        <button
          onClick={() => setShowModal(true)}
          className="btn-primary"
        >
          + New Campaign
        </button>
      </div>

      {/* Table */}
      <div className="card overflow-x-auto">
        {loading ? (
          <div className="p-6 text-center">Loading...</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th>Status</th>
                <th>Channel</th>
                <th>Response</th>
                <th>Created</th>
              </tr>
            </thead>

            <tbody>
              {campaigns.map((c) => (
                <tr key={c.id} className="border-b">
                  <td className="px-4 py-3 font-medium">{c.name}</td>

                  <td>
                    <span
                      className={`badge ${
                        c.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>

                  <td>{c.channel}</td>

                  <td>{c.response_rate ?? 0}%</td>

                  <td className="text-xs text-gray-400">
                    {new Date(c.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ================= MODAL ================= */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">

          <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-2xl shadow-xl flex flex-col max-h-[90vh]">

            {/* Header */}
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">
                {form.id ? "Edit Campaign" : "New Campaign"}
              </h2>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6 overflow-y-auto">

              {formError && (
                <div className="text-red-600 text-sm">
                  {formError}
                </div>
              )}

              {/* basics */}
              <div className="space-y-3">
                <input
                  placeholder="Campaign name"
                  className="input"
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                />

                <textarea
                  placeholder="Description"
                  className="input"
                  value={form.description}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      description: e.target.value,
                    })
                  }
                />

                <select
                  className="input"
                  value={form.type}
                  onChange={(e) =>
                    setForm({ ...form, type: e.target.value })
                  }
                >
                  <option value="">Select type</option>
                  {campaignTypes.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* channels */}
              <div>
                <div className="text-sm mb-2">Channels</div>
                <div className="flex gap-2">
                  {["WhatsApp", "Email"].map((ch) => (
                    <button
                      key={ch}
                      onClick={() => handleChannelToggle(ch)}
                      className={`badge ${
                        form.channels.includes(ch)
                          ? "badge-active"
                          : "badge-default"
                      }`}
                    >
                      {ch}
                    </button>
                  ))}
                </div>
              </div>

              {/* audience */}
              <div>
                <div className="text-sm mb-2">Audience</div>

                <div className="flex flex-wrap gap-2">
                  {targetAudiences.map((aud) => (
                    <button
                      key={aud}
                      onClick={() => handleAudienceToggle(aud)}
                      className={`badge ${
                        form.audience.includes(aud)
                          ? getAudienceColor(aud)
                          : "badge-default"
                      }`}
                    >
                      {aud.replaceAll("_", " ")}
                    </button>
                  ))}
                </div>

                <div className="text-xs text-gray-500 mt-2">
                  🎯 {targetCount} customers
                </div>
              </div>

              {/* message */}
              <textarea
                className="input min-h-[120px]"
                placeholder="Message..."
                value={form.message}
                onChange={(e) =>
                  setForm({ ...form, message: e.target.value })
                }
              />

            </div>

            {/* footer */}
            <div className="p-6 border-t flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>

              <button className="btn-primary">
                Save
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- helpers ---------- */

function getAudienceColor(type) {
  const map = {
    new: "bg-blue-100 text-blue-700",
    churned: "bg-red-100 text-red-700",
    inactive: "bg-yellow-100 text-yellow-700",
    high_spender: "bg-purple-100 text-purple-700",
  };

  return map[type] || "bg-gray-200 text-gray-700";
}
