"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

/* ---------- Constants ---------- */

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

/* ---------- Page ---------- */

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

  /* ---------- Fetch ---------- */

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    const { data } = await supabase.rpc("get_campaigns_with_progress");
    setCampaigns(data || []);
    setLoading(false);
  };

  /* ---------- Actions ---------- */

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

  const handleCreateCampaign = async () => {
    if (!form.name || !form.type || form.channels.length === 0) {
      setFormError("Please fill required fields");
      return;
    }

    const status = form.saveAsDraft ? "Draft" : "Active";

    const { data, error } = await supabase
      .from("campaigns")
      .insert({
        ...form,
        status,
        channel:
          form.channels.length === 1 ? form.channels[0] : "Multiple",
      })
      .select()
      .single();

    if (!error) return data;
  };

  const handleSendCampaign = async (id) => {
    setSending(true);

    await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/prepare-campaign-jobs`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          campaign_id: id,
          audience: form.audience,
        }),
      }
    );

    setSending(false);
  };

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
                <th>Created</th>
              </tr>
            </thead>

            <tbody>
              {campaigns.map((c) => (
                <tr key={c.id} className="border-b">
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td>{c.status}</td>
                  <td>{c.channel}</td>
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
              <p className="text-sm text-gray-500">
                Create and target your campaign
              </p>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6 overflow-y-auto">

              {formError && (
                <div className="bg-red-50 text-red-600 px-4 py-2 rounded-md text-sm">
                  {formError}
                </div>
              )}

              <Section title="Basics">
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
                    setForm({ ...form, description: e.target.value })
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
              </Section>

              <Section title="Channels">
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
              </Section>

              <Section title="Audience">
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
                      {aud}
                    </button>
                  ))}
                </div>
              </Section>

              <Section title="Message">
                <textarea
                  className="input min-h-[120px]"
                  value={form.message}
                  onChange={(e) =>
                    setForm({ ...form, message: e.target.value })
                  }
                />
              </Section>

              <Section title="Schedule">
                <div className="flex gap-4">
                  <label>
                    <input
                      type="radio"
                      checked={form.sendNow}
                      onChange={() =>
                        setForm({ ...form, sendNow: true })
                      }
                    />
                    Send now
                  </label>

                  <label>
                    <input
                      type="radio"
                      checked={!form.sendNow}
                      onChange={() =>
                        setForm({ ...form, sendNow: false })
                      }
                    />
                    Schedule
                  </label>
                </div>

                {!form.sendNow && (
                  <input
                    type="datetime-local"
                    className="input mt-2"
                    value={form.schedule}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        schedule: e.target.value,
                      })
                    }
                  />
                )}
              </Section>

            </div>

            {/* Footer */}
            <div className="p-6 border-t flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>

              <button
                onClick={async () => {
                  let id = form.id;

                  if (!id) {
                    const created = await handleCreateCampaign();
                    if (!created) return;
                    id = created.id;
                  }

                  if (form.sendNow && !form.saveAsDraft) {
                    await handleSendCampaign(id);
                  }

                  setShowModal(false);
                  fetchCampaigns();
                }}
                className="btn-primary"
              >
                {sending ? "Sending..." : "Submit"}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- UI Helpers ---------- */

function Section({ title, children }) {
  return (
    <div>
      <div className="text-sm font-medium mb-2">{title}</div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function getAudienceColor(type) {
  const map = {
    new: "bg-blue-100 text-blue-700",
    churned: "bg-red-100 text-red-700",
    inactive: "bg-yellow-100 text-yellow-700",
    high_spender: "bg-purple-100 text-purple-700",
  };

  return map[type] || "bg-gray-200 text-gray-700";
}
