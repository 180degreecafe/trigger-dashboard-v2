"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

/* ---------- Constants ---------- */

const campaignTypes = ["Discount", "Gift", "Points"];

const audiences = [
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
  const [targetCount, setTargetCount] = useState(0);

  const [form, setForm] = useState(defaultForm());

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    setLoading(true);

    const { data } = await supabase.rpc("get_campaigns_with_progress");

    setCampaigns(data || []);
    setLoading(false);
  };

  /* ---------- Create ---------- */

  const handleCreate = async () => {
    if (!form.name || !form.type || !form.message) return;

    const { data } = await supabase
      .from("campaigns")
      .insert({
        ...form,
        status: form.saveAsDraft ? "Draft" : "Active",
        schedule: form.sendNow ? null : form.schedule,
      })
      .select()
      .single();

    return data;
  };

  /* ---------- Send ---------- */

  const handleSend = async (id) => {
    setSending(true);

    await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/prepare-campaign-jobs`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          campaign_id: id,
          audience: form.audience,
        }),
      }
    );

    setSending(false);
    setShowModal(false);
    fetchCampaigns();
  };

  /* ---------- Audience Count ---------- */

  useEffect(() => {
    if (form.audience.length === 0) return;

    const run = async () => {
      const { data } = await supabase.rpc(
        "count_latest_triggers_by_type",
        { target_types: form.audience }
      );

      setTargetCount(data || 0);
    };

    run();
  }, [form.audience]);

  /* ---------- UI ---------- */

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Campaigns</h1>
          <p className="text-sm text-gray-500">
            Manage and track campaigns
          </p>
        </div>

        <button
          onClick={() => {
            setForm(defaultForm());
            setShowModal(true);
          }}
          className="btn-primary"
        >
          + New Campaign
        </button>
      </div>

      {/* List */}
      <div className="card">

        {loading ? (
          <div className="p-6 text-center">Loading...</div>
        ) : campaigns.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No campaigns yet
          </div>
        ) : (
          <div className="divide-y">

            {campaigns.map((c) => (
              <div
                key={c.id}
                className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div>
                  <div className="font-semibold">{c.name}</div>
                  <div className="text-sm text-gray-500">
                    {c.description}
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-wrap">

                  <Badge>{c.status}</Badge>

                  <div className="text-sm">
                    {c.response_rate ?? 0}%
                  </div>

                  {/* Progress */}
                  {c.progress && (
                    <ProgressBar progress={c.progress} />
                  )}

                  <div className="text-xs text-gray-400">
                    {formatDate(c.created_at)}
                  </div>

                </div>
              </div>
            ))}

          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-2xl space-y-4">

            <h2 className="text-lg font-semibold">
              Create Campaign
            </h2>

            <input
              placeholder="Name"
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
              <option value="">Type</option>
              {campaignTypes.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>

            {/* Audience */}
            <div className="flex flex-wrap gap-2">
              {audiences.map((a) => (
                <button
                  key={a}
                  onClick={() =>
                    toggle(a, form, setForm, "audience")
                  }
                  className={`chip ${
                    form.audience.includes(a)
                      ? "chip-active"
                      : ""
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>

            <div className="text-xs text-gray-500">
              🎯 {targetCount} customers
            </div>

            <textarea
              placeholder="Message"
              className="input"
              value={form.message}
              onChange={(e) =>
                setForm({ ...form, message: e.target.value })
              }
            />

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4">

              <button
                onClick={() => setShowModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>

              <button
                onClick={async () => {
                  let created = form.id
                    ? form
                    : await handleCreate();

                  if (form.sendNow && !form.saveAsDraft) {
                    await handleSend(created.id);
                  } else {
                    setShowModal(false);
                    fetchCampaigns();
                  }
                }}
                className="btn-primary"
              >
                {sending
                  ? "Sending..."
                  : form.saveAsDraft
                  ? "Save"
                  : form.sendNow
                  ? "Send"
                  : "Schedule"}
              </button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Components ---------- */

function Badge({ children }) {
  return (
    <span className="badge badge-default">{children}</span>
  );
}

function ProgressBar({ progress }) {
  const total =
    progress.sent + progress.failed + progress.pending;

  if (!total) return null;

  return (
    <div className="w-40">
      <div className="flex text-xs justify-between mb-1">
        <span>✅ {progress.sent}</span>
        <span>❌ {progress.failed}</span>
        <span>⏳ {progress.pending}</span>
      </div>

      <div className="h-2 bg-gray-200 rounded-full overflow-hidden flex">
        <div
          className="bg-green-500"
          style={{ width: `${(progress.sent / total) * 100}%` }}
        />
        <div
          className="bg-red-500"
          style={{ width: `${(progress.failed / total) * 100}%` }}
        />
        <div
          className="bg-yellow-400"
          style={{ width: `${(progress.pending / total) * 100}%` }}
        />
      </div>
    </div>
  );
}

/* ---------- Utils ---------- */

function defaultForm() {
  return {
    id: null,
    name: "",
    description: "",
    type: "",
    audience: [],
    message: "",
    schedule: "",
    sendNow: true,
    saveAsDraft: false,
  };
}

function toggle(value, form, setForm, field) {
  setForm((prev) => ({
    ...prev,
    [field]: prev[field].includes(value)
      ? prev[field].filter((v) => v !== value)
      : [...prev[field], value],
  }));
}

function formatDate(date) {
  return new Date(date).toLocaleDateString("en-GB");
}
